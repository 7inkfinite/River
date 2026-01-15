//Step 11 of the pipedream workflow
export default defineComponent({
  async run({ steps, $ }) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
    }

    const { video } = steps.upsert_video.$return_value || {};
    if (!video?.id) {
      throw new Error("Missing video.id from upsert_video");
    }

    // ---------- INPUTS / FLAGS FROM validate_input ----------
    const v = steps.validate_input.$return_value || {};

    const tone = v.tone || "creator-friendly, punchy";
    const platformsRaw = v.platforms || ["twitter", "linkedin", "carousel"];

    // optional flag to *bypass* cache (for regen / tweaks)
    const forceRegen = !!v.force_regen;

    // optional extra options object (for tweaks, knobs, etc.)
    const extraOptions = v.extra_options || null;

    // keep prompt version explicit so we can bump when we change the system prompt
    const PROMPT_VERSION = "v1";

    // ---------- NORMALIZATION HELPERS ----------
    function stableStringify(obj) {
      if (!obj) return "";
      const keys = Object.keys(obj).sort();
      const sorted = {};
      for (const k of keys) sorted[k] = obj[k];
      return JSON.stringify(sorted);
    }

    const toneNorm = String(tone).trim().toLowerCase();

    // normalize platforms → lowercased + sorted so order doesn't matter
    const platformsNorm = platformsRaw
      .map((p) => String(p).toLowerCase())
      .sort();

    const extraOptionsPart = stableStringify(extraOptions);

    // NEW cache key format (must be mirrored in save_generation)
    const cacheKey = [
      video.id,
      toneNorm,
      platformsNorm.join(","),
      PROMPT_VERSION,
      extraOptionsPart,
    ].join("|");

    // ---------- BYPASS CACHE FOR REGEN ----------
    if (forceRegen) {
      $.export(
        "$summary",
        `Cache bypassed (force_regen=true) for key ${cacheKey}`
      );
      return {
        hit: false,
        cacheKey,
        forceRegen: true,
      };
    }

    // ---------- NORMAL CACHE LOOKUP ----------
    // 1) Look for an existing successful generation with this cache_key
    const genRes = await fetch(
      `${SUPABASE_URL}/rest/v1/generations?cache_key=eq.${encodeURIComponent(
        cacheKey
      )}&status=eq.success&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const genText = await genRes.text();
    if (!genRes.ok) {
      throw new Error(`Select generations failed: ${genRes.status} ${genText}`);
    }

    const generations = genText ? JSON.parse(genText) : [];
    if (!generations.length) {
      $.export("$summary", "Cache miss");
      return { hit: false, cacheKey };
    }

    const generation = generations[0];

    // 2) Fetch outputs for that generation
    const outRes = await fetch(
      `${SUPABASE_URL}/rest/v1/outputs?generation_id=eq.${generation.id}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const outText = await outRes.text();
    if (!outRes.ok) {
      throw new Error(`Select outputs failed: ${outRes.status} ${outText}`);
    }

    const outputs = outText ? JSON.parse(outText) : [];

    // 3) Reconstruct the high-level shape (tweet_thread, linkedin_post, carousel_slides)
    let tweet_thread = [];
    let linkedin_post = "";
    let carousel_slides = [];

    for (const o of outputs) {
      if (o.platform === "twitter") {
        if (o.metadata?.tweets) tweet_thread = o.metadata.tweets;
        else tweet_thread = (o.content || "").split(/\n\n+/);
      } else if (o.platform === "linkedin") {
        linkedin_post = o.content || "";
      } else if (o.platform === "carousel") {
        if (o.metadata?.slides) carousel_slides = o.metadata.slides;
        else carousel_slides = (o.content || "").split(/\n\n+/);
      }
    }

    $.export(
      "$summary",
      `Cache hit for key ${cacheKey}, ${outputs.length} outputs`
    );

    return {
      hit: true,
      cacheKey,
      generation,
      outputs,
      reconstructed: {
        tweet_thread,
        linkedin_post,
        carousel_slides,
      },
    };
  },
});
