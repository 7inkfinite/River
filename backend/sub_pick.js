//Step 5 of the pipedream workflow
export default defineComponent({
  async run({ steps }) {
    const subs = steps.sub_endpoint.$return_value?.subtitles || []

    const preferred =
      subs.find(s => s.languageCode === "en") ||
      subs.find(s => (s.languageCode || "").startsWith("en")) ||
      subs[0]

    if (!preferred?.url) throw new Error("No subtitle track URL found")

    return preferred
  },
})
