////Step 3 of the pipedream workflow
export default defineComponent({
  async run({ steps, $ }) {
    const { videoId, rawUrl, user_id, session_id } = steps.validate_input.$return_value;
    const { title, thumbnailUrl } = steps.fetch_video_info?.$return_value || {};

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
    }

    $.export("debug_input", { videoId, rawUrl, user_id });

    const videoPayload = {
      youtube_video_id: videoId,
      original_url: rawUrl,
      last_used_at: new Date().toISOString(),
    };

    // Include title and thumbnail from fetch_video_info if available
    if (title) videoPayload.title = title;
    if (thumbnailUrl) videoPayload.thumbnail_url = thumbnailUrl;

    // Include user_id and session_id if present
    if (user_id) videoPayload.user_id = user_id;
    if (session_id) videoPayload.anonymous_session_id = session_id;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/videos?on_conflict=youtube_video_id`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation,resolution=merge-duplicates",
        },
        body: JSON.stringify([videoPayload]),
      }
    );

    const text = await res.text();

    if (!res.ok) {
      throw new Error(`Supabase upsert videos failed: ${res.status} ${text}`);
    }

    let video = null;
    if (text) {
      const rows = JSON.parse(text);
      video = rows[0] || null;
    }

    return { video };
  },
});
