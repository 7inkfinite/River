//Step 10 of the pipedream workflow
export default defineComponent({
  async run({ steps, $ }) {
    // From upsert_video
    const { video } = steps.upsert_video.$return_value || {};
    if (!video?.id) {
      throw new Error("Missing video.id from upsert_video");
    }

    // From extract_transcript (your step)
    //const t = steps.extract_transcript.$return_value || {};
    const t = steps.transcript_final.$return_value || {};
    //const transcript = t.fullText || "";
    const transcript = t.transcript || "";
    const transcript_language = t.language || "unknown";

    // Derive duration from last segment if possible
    let duration_seconds = null;
    if (Array.isArray(t.segments) && t.segments.length > 0) {
      const last = t.segments[t.segments.length - 1];
      const end = (last.start || 0) + (last.duration || 0);
      duration_seconds = Math.round(end);
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
    }

    // Only bother updating if we actually have some transcript text
    if (!transcript) {
      $.export("$summary", "No transcript text found, skipping video update");
      return { updated: false };
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/videos?id=eq.${video.id}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          transcript_language,
          duration_seconds,
          last_used_at: new Date().toISOString(),
        }),
      }
    );

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Update videos failed: ${res.status} ${text}`);
    }

    $.export("$summary", `Updated video ${video.youtube_video_id} with transcript`);
    return { updated: true };
  },
});
