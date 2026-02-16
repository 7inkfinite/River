export default defineComponent({
    async run({ steps, $ }) {
      const { videoId } = steps.validate_input.$return_value;
      
      // RapidAPI credentials from environment
      const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
      const RAPIDAPI_HOST = "yt-api.p.rapidapi.com";
      
      if (!RAPIDAPI_KEY) {
        throw new Error("Missing RAPIDAPI_KEY environment variable");
      }
      
      // Call YT-API video info endpoint
      const response = await fetch(
        `https://${RAPIDAPI_HOST}/video/info?id=${videoId}`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST,
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`YT-API video/info failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      // Extract title and thumbnail
      const title = data.title || null;
      
      // Get highest quality thumbnail available
      // Prefer maxresdefault > sddefault > hqdefault > mqdefault > default
      let thumbnailUrl = null;
      if (data.thumbnail && Array.isArray(data.thumbnail) && data.thumbnail.length > 0) {
        // Sort by width descending to get highest quality
        const sorted = data.thumbnail.sort((a, b) => (b.width || 0) - (a.width || 0));
        thumbnailUrl = sorted[0].url;
      }
      
      // Fallback to deterministic YouTube thumbnail URL if API doesn't return one
      if (!thumbnailUrl) {
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
      
      $.export("$summary", `Fetched video info: "${title}"`);
      
      return {
        videoId,
        title,
        thumbnailUrl,
        // Include full metadata for potential future use
        metadata: {
          channelTitle: data.channelTitle || null,
          publishedAt: data.publishedAt || null,
          viewCount: data.viewCount || null,
        }
      };
    },
  });