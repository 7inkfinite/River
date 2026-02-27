//Strep 13 of the pipedream workflow
import fetch from "node-fetch";

export default defineComponent({
  async run({ steps, $ }) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
      );
    }

    const cache = steps.check_cache?.$return_value || {};
    const call = steps.Call_OpenAI_API?.$return_value || {};
    const { video } = steps.upsert_video.$return_value || {};
    const v = steps.validate_input.$return_value || {};
    const extractedTranscript = steps.extract_transcript?.$return_value || {};

    const tone = (v.tone || "creator-friendly, punchy").toString().trim();
    const platforms =
      Array.isArray(v.platforms) && v.platforms.length
        ? v.platforms.map((p) => String(p).toLowerCase())
        : ["twitter", "linkedin", "carousel"];

    const forceRegen = !!v.force_regen;
    const tweak = (v.tweak_instructions || "").toString().trim();

    if (!video?.id) {
      throw new Error("Missing video.id from upsert_video");
    }

    // ------------------------------------------------------
    // 0) Store transcript on videos table for future reuse
    //    (so sub_pick can skip RapidAPI on tweaks/regens)
    // ------------------------------------------------------
    if (extractedTranscript.fullText && !video.transcript) {
      const txPatch = await fetch(
        `${SUPABASE_URL}/rest/v1/videos?id=eq.${video.id}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: extractedTranscript.fullText,
            transcript_language: extractedTranscript.language || null,
          }),
        }
      );
      if (!txPatch.ok) {
        console.error(
          `Transcript storage failed (non-fatal): ${txPatch.status} ${await txPatch.text()}`
        );
      }
    }

    // ------------------------------------------------------
    // 1) Decide if this is a cache hit we actually want to use
    // ------------------------------------------------------
    const cacheHit = !!(cache.hit && cache.generation && !forceRegen);

    let tweetThread = [];
    let linkedinPost = "";
    let carouselSlides = [];

    if (cacheHit) {
      // Use reconstructed outputs from check_cache
      const r = cache.reconstructed || {};
      tweetThread = r.tweet_thread || [];
      linkedinPost = r.linkedin_post || "";
      carouselSlides = r.carousel_slides || [];
    } else {
      // Use fresh LLM outputs from Call_OpenAI_API
      const outputsObj = call.outputs || {};
      tweetThread = outputsObj.tweet_thread || [];
      linkedinPost = outputsObj.linkedin_post || "";
      carouselSlides = outputsObj.carousel_slides || [];
    }

    // ------------------------------------------------------
    // 2) Normalize outputs into a Framer-friendly structure
    // ------------------------------------------------------
    const normalizedOutputs = {};

    if (tweetThread.length) {
      normalizedOutputs.twitter = {
        platform: "twitter",
        format: "thread",
        tweets: tweetThread,
        raw: tweetThread.join("\n\n"),
      };
    }

    if (linkedinPost) {
      normalizedOutputs.linkedin = {
        platform: "linkedin",
        format: "post",
        post: linkedinPost,
      };
    }

    if (carouselSlides.length) {
      normalizedOutputs.carousel = {
        platform: "carousel",
        format: "slides",
        slides: carouselSlides,
      };
    }

    // ------------------------------------------------------
    // 3) PURE CACHE HIT → update ownership, then return
    // ------------------------------------------------------
    if (cacheHit) {
      // Even on cache hit, ensure the current user/session owns this generation
      // so it appears on their dashboard (Bug 2 + Bug 3 fix)
      if (cache.generation?.id && (v.user_id || v.session_id)) {
        const ownershipUpdate = {};

        if (v.user_id) {
          // Authenticated user: set user_id on the generation
          ownershipUpdate.user_id = v.user_id;
        } else if (v.session_id) {
          // Anonymous user: set anonymous_session_id for later claiming
          ownershipUpdate.anonymous_session_id = v.session_id;
        }

        const patchRes = await fetch(
          `${SUPABASE_URL}/rest/v1/generations?id=eq.${cache.generation.id}`,
          {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify(ownershipUpdate),
          }
        );

        if (!patchRes.ok) {
          const patchText = await patchRes.text();
          console.error(
            `Ownership update failed (non-fatal): ${patchRes.status} ${patchText}`
          );
        }
      }

      $.export("$summary", "Cache hit – updated ownership, skipped content inserts");

      return {
        video: {
          id: video.id,
          youtube_video_id: video.youtube_video_id,
          original_url: video.original_url,
          title: video.title || null,
          thumbnail_url: video.thumbnail_url || null,
        },
        generation: cache.generation,
        inputs: {
          tone,
          platforms,
        },
        outputs: normalizedOutputs,
        fromCache: true,
      };
    }

    // From here on, we have a fresh LLM call (cache miss or force_regen)

    // ------------------------------------------------------
    // 4) Upsert the generation row (respecting unique constraint)
    //    - One row per (video_id, tone, platforms)
    //    - On regen we UPDATE the existing row.
    // ------------------------------------------------------

    const genPayload = {
      video_id: video.id,
      tone,
      platforms,
      status: "success",
      prompt_version: "v1",
      completed_at: new Date().toISOString(),
      cache_key: cache.cacheKey || null,
      extra_options: v.extra_options || null,
      anonymous_session_id: v.session_id || null, // ✅ Track anonymous users
      user_id: v.user_id || null, // ✅ Track authenticated users
    };

    const genRes = await fetch(
      `${SUPABASE_URL}/rest/v1/generations?on_conflict=video_id,tone,platforms`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          // This is the important part: merge instead of 409
          Prefer: "return=representation,resolution=merge-duplicates",
        },
        body: JSON.stringify([genPayload]),
      }
    );

    const genText = await genRes.text();
    if (!genRes.ok) {
      throw new Error(
        `Insert/upsert generation failed: ${genRes.status} ${genText}`
      );
    }

    const [generation] = JSON.parse(genText);

    // ------------------------------------------------------
    // 5) Replace outputs for that generation
    //    (regen overwrites previous outputs)
    // ------------------------------------------------------

    // ✅ NEW: Check if we're targeting a specific platform
    const targetPlatform = v.extra_options?.target_platform;
    const isTargetedRegen = targetPlatform && typeof targetPlatform === "string";

    // ✅ If targeting specific platform, only delete that platform's output
    // Otherwise, delete all outputs (full regeneration)
    const deleteFilter = isTargetedRegen
      ? `generation_id=eq.${generation.id}&platform=eq.${targetPlatform}`
      : `generation_id=eq.${generation.id}`;

    const delRes = await fetch(
      `${SUPABASE_URL}/rest/v1/outputs?${deleteFilter}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (!delRes.ok) {
      const delText = await delRes.text();
      throw new Error(
        `Failed to delete previous outputs: ${delRes.status} ${delText}`
      );
    }

    // Now insert the new outputs
    const outputsPayload = [];

    if (normalizedOutputs.twitter) {
      const t = normalizedOutputs.twitter;
      outputsPayload.push({
        generation_id: generation.id,
        platform: "twitter",
        format: "thread",
        content: t.raw,
        metadata: {
          type: "tweet_thread",
          tweet_count: t.tweets.length,
          tweets: t.tweets,
        },
      });
    }

    if (normalizedOutputs.linkedin) {
      const l = normalizedOutputs.linkedin;
      outputsPayload.push({
        generation_id: generation.id,
        platform: "linkedin",
        format: "post",
        content: l.post,
        metadata: {
          type: "linkedin_post",
          char_count: l.post.length,
        },
      });
    }

    if (normalizedOutputs.carousel) {
      const c = normalizedOutputs.carousel;
      outputsPayload.push({
        generation_id: generation.id,
        platform: "carousel",
        format: "slides",
        content: c.slides.join("\n\n"),
        metadata: {
          type: "carousel_slides",
          slide_count: c.slides.length,
          slides: c.slides,
        },
      });
    }

    let dbOutputs = [];

    if (outputsPayload.length) {
      const outRes = await fetch(`${SUPABASE_URL}/rest/v1/outputs`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(outputsPayload),
      });

      const outText = await outRes.text();
      if (!outRes.ok) {
        throw new Error(`Insert outputs failed: ${outRes.status} ${outText}`);
      }

      dbOutputs = JSON.parse(outText);
    }

    $.export(
      "$summary",
      `Saved generation ${generation.id} with ${dbOutputs.length} outputs`
    );

    // ------------------------------------------------------
    // 6) Fetch ALL current outputs for this generation
    //    (important for targeted regens where other platforms weren't regenerated)
    // ------------------------------------------------------
    const allOutputsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/outputs?generation_id=eq.${generation.id}`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!allOutputsRes.ok) {
      const allOutputsText = await allOutputsRes.text();
      throw new Error(
        `Failed to fetch all outputs: ${allOutputsRes.status} ${allOutputsText}`
      );
    }

    const allOutputs = await allOutputsRes.json();

    // ✅ Reconstruct normalized outputs from ALL database outputs
    const completeNormalizedOutputs = {};

    for (const output of allOutputs) {
      if (output.platform === "twitter") {
        completeNormalizedOutputs.twitter = {
          platform: "twitter",
          format: "thread",
          tweets: output.metadata?.tweets || [],
          raw: output.content || "",
        };
      } else if (output.platform === "linkedin") {
        completeNormalizedOutputs.linkedin = {
          platform: "linkedin",
          format: "post",
          post: output.content || "",
        };
      } else if (output.platform === "carousel") {
        completeNormalizedOutputs.carousel = {
          platform: "carousel",
          format: "slides",
          slides: output.metadata?.slides || [],
        };
      }
    }

    // ------------------------------------------------------
    // 7) Final shape sent back to Framer
    // ------------------------------------------------------
    return {
      video: {
        id: video.id,
        youtube_video_id: video.youtube_video_id,
        original_url: video.original_url,
        title: video.title || null,
        thumbnail_url: video.thumbnail_url || null,
      },
      generation,
      inputs: {
        tone,
        platforms,
        force_regen: forceRegen,
        tweak_instructions: tweak || null,
      },
      outputs: completeNormalizedOutputs, // ✅ Return ALL outputs, not just newly generated
      dbOutputs: allOutputs, // ✅ Return ALL dbOutputs
      fromCache: false,
    };
  },
});
