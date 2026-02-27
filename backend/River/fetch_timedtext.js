//Step 6 of the pipedream workflow
//Replaces the old HTTP request step.
//Conditionally fetches subtitle XML only when sub_pick didn't skip.
export default defineComponent({
  async run({ steps, $ }) {
    const subPick = steps.sub_pick?.$return_value || {}

    // If subtitle fetch was skipped (video has cached transcript), pass through
    if (subPick.skipSubtitleFetch) {
      $.export("$summary", "Skipped — using cached transcript")
      return { skipped: true }
    }

    const url = subPick.url
    if (!url) {
      throw new Error("No subtitle URL provided by sub_pick")
    }

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch timedtext: ${res.status} ${res.statusText}`)
    }

    const xml = await res.text()

    $.export("$summary", `Fetched timedtext (${xml.length} chars)`)
    return xml
  },
})
