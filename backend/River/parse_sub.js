//Step 7 of the pipedream workflow
export default defineComponent({
  async run({ steps }) {
    // If subtitle fetch was skipped (video has cached transcript), pass through
    const subPick = steps.sub_pick?.$return_value || {}
    if (subPick.skipSubtitleFetch) {
      return {
        skipSubtitleFetch: true,
        transcript: subPick.cachedTranscript,
        languageName: subPick.cachedLanguage || "en",
      }
    }

    const xml = steps.fetch_timedtext.$return_value

    // Pipedream HTTP step might return object/string depending on config
    const raw = typeof xml === "string" ? xml : (xml?.body ?? JSON.stringify(xml))

    // Extract text="..." from <text ...> nodes (srv1)
    const matches = [...raw.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)]
    const decode = (s) =>
      s
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/<br\s*\/?>/g, " ")

    const transcript = matches.map(m => decode(m[1])).join(" ").replace(/\s+/g, " ").trim()

    if (!transcript) throw new Error("Transcript parsed empty")

    return { transcript }
  },
})
