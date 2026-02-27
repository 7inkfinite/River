//Step 5 of the pipedream workflow
export default defineComponent({
  async run({ steps, $ }) {
    // Check if the video already has a stored transcript (from a previous run).
    // This avoids re-hitting RapidAPI on tweaks/regens.
    const video = steps.upsert_video?.$return_value?.video
    if (video?.transcript) {
      $.export(
        "$summary",
        `Skipping subtitle fetch — video ${video.youtube_video_id} already has a stored transcript`
      )
      return {
        skipSubtitleFetch: true,
        url: null,
        cachedTranscript: video.transcript,
        cachedLanguage: video.transcript_language || "en",
      }
    }

    const subs = steps.sub_endpoint.$return_value?.subtitles || []

    const preferred =
      subs.find(s => s.languageCode === "en") ||
      subs.find(s => (s.languageCode || "").startsWith("en")) ||
      subs[0]

    if (!preferred?.url) throw new Error("No subtitle track URL found")

    return preferred
  },
})
