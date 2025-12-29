//Step 8 of the pipedream workflow
export default defineComponent({
  async run({ steps, $ }) {
    // Prefer your timedtext pipeline output
    // Adjust this if your step names differ
    const parsed = steps.parse_sub?.$return_value || {}

    // parsed can be:
    // 1) { segments: [{start, duration, text}], languageName, languageCode }
    // 2) { transcript: "full text", ... }
    // 3) "full text"
    // We'll normalize to the transcript_auto-like object:
    // { transcript: [{startMs, endMs, text}], selectedTrackTitle }

    // -------- helpers --------
    const clean = (s) => String(s || "").replace(/\s+/g, " ").trim()

    const mkItem = (startSec, durationSec, text) => {
      const startMs = Math.round((Number(startSec) || 0) * 1000)
      const durMs = Math.round((Number(durationSec) || 0) * 1000)
      return {
        startMs,
        endMs: startMs + durMs,
        text: clean(text),
      }
    }

    // -------- extract language --------
    const languageLabel =
      parsed.languageName ||
      parsed.selectedTrackTitle ||
      parsed.languageCode ||
      "unknown"

    // -------- build transcript array --------
    let transcriptArr = []

    // Case A: parsed already has segments with timing
    if (Array.isArray(parsed.segments) && parsed.segments.length) {
      transcriptArr = parsed.segments
        .map((s) => mkItem(s.start, s.duration, s.text))
        .filter((x) => x.text)
    }

    // Case B: parsed has transcript array already (maybe you built it that way)
    if (!transcriptArr.length && Array.isArray(parsed.transcript) && parsed.transcript.length) {
      // assume it's already in {startMs,endMs,text} format
      transcriptArr = parsed.transcript
        .map((x) => ({
          startMs: Number(x.startMs) || 0,
          endMs: Number(x.endMs) || 0,
          text: clean(x.text),
        }))
        .filter((x) => x.text)
    }

    // Case C: parsed is fullText-only
    const fullText =
      clean(parsed.fullText) ||
      clean(parsed.transcript) ||
      (typeof parsed === "string" ? clean(parsed) : "")

    if (!transcriptArr.length && fullText) {
      // no timing available — pack as one segment
      transcriptArr = [mkItem(0, 0, fullText)]
    }

    const ok = transcriptArr.length > 0

    $.export(
      "$summary",
      ok
        ? `Transcript_final normalized ${transcriptArr.length} item(s) (${languageLabel})`
        : `Transcript_final found no transcript`
    )

    return {
      ok,
      source: "timedtext",
      // keep naming consistent with your old transcript_auto assumptions:
      selectedTrackTitle: languageLabel,
      transcript: transcriptArr,
    }
  },
})
