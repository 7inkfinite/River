export default defineComponent({
  async run({ steps, $ }) {
    // Read the HTTP Trigger payload
    const evt = steps.trigger.event || {};
    const headers = evt.headers || {};

    // --- Simple header API key gate (optional) ---
    const API_KEY = process.env.PUBLIC_INGEST_KEY; // set in Workflow → Env Vars
    const incomingKey = headers["x-api-key"] || headers["X-Api-Key"];
    if (API_KEY && incomingKey !== API_KEY) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    // --- Normalize body (string / JSON / form-encoded) ---
    let body = evt.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    // --- Accept youtube_url from body or query string ---
    const url = String(
      body.youtube_url ||
        body.url ||
        (evt.query && (evt.query.youtube_url || evt.query.url)) ||
        ""
    ).trim();

    if (!url) {
      const err = new Error(
        "Missing YouTube URL. Send `youtube_url` in JSON body or query."
      );
      err.status = 400;
      throw err;
    }

    // --- Extract video id from common YouTube URL formats ---
    const idMatch = url.match(
      /(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/
    );
    if (!idMatch) {
      throw new Error("Could not parse a YouTube video ID from the URL.");
    }

    // --- Optional inputs ---
    const tone = (body.tone || "creator-friendly, punchy").toString().trim();

    // Normalize platforms to an array of strings
    let rawPlatforms = body.platforms ?? [];
    if (typeof rawPlatforms === "string") {
      // e.g. "twitter" or "twitter,linkedin"
      if (rawPlatforms.includes(",")) rawPlatforms = rawPlatforms.split(",");
      else rawPlatforms = [rawPlatforms];
    }

    const allowed = ["twitter", "linkedin", "carousel"];

    let platforms = Array.isArray(rawPlatforms)
      ? rawPlatforms
          .map((p) => String(p).toLowerCase().trim())
          .filter((p) => allowed.includes(p))
      : [];

    // Fallback so at least one platform is always present
    if (platforms.length === 0) {
      platforms.push("twitter"); // default
    }

    // --- NEW: regen + tweak wiring ---
    const force_regen = Boolean(body.force_regen);
    const tweak_instructions = (body.tweak_instructions || "")
      .toString()
      .trim();

    // ✅ NEW: extra_options passthrough (and optional target_platform routing)
    const extra_options =
      body.extra_options && typeof body.extra_options === "object"
        ? body.extra_options
        : null;

    const target_platform = extra_options?.target_platform
      ? String(extra_options.target_platform).toLowerCase().trim()
      : null;

    // ✅ If tweak specifies a target, ONLY generate that platform
    if (target_platform && allowed.includes(target_platform)) {
      platforms = [target_platform];
    }

    // Expose to later steps as steps.validate_input.*
    const result = {
      videoId: idMatch[1],
      tone,
      platforms,
      rawUrl: url,
      force_regen,
      tweak_instructions,
      extra_options, // ✅ NEW: needed for cache key + later steps
      source: {
        hasBody: !!evt.body,
        hasQuery: !!evt.query,
        contentType: headers["content-type"] || headers["Content-Type"],
      },
    };

    $.export(
      "$summary",
      `Validated input for video ${result.videoId} – platforms=${JSON.stringify(
        platforms
      )}, force_regen=${force_regen ? "true" : "false"}${
        target_platform ? `, target_platform=${target_platform}` : ""
      }`
    );

    return result;
  },
});
