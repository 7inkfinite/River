import * as React from "react"
import { TwitterThreadCard } from "./TwitterThreadCard.tsx"

/**
 * TwitterThreadCardPreview - Preview component for Framer design iteration
 *
 * This component displays the TwitterThreadCard with dummy data so you can
 * preview and tweak the design without running the Pipedream workflow.
 */
export function TwitterThreadCardPreview() {
    const [tweakOpen, setTweakOpen] = React.useState(false)
    const [tweakText, setTweakText] = React.useState("")
    const [copyLabel, setCopyLabel] = React.useState<"copy" | "copied!">(
        "copy"
    )
    const [regenMode, setRegenMode] = React.useState<
        "idle" | "loading" | "success" | "error"
    >("idle")

    const dummyThread = `🚀 Just shipped a major update to River!

Now you can turn any YouTube video into engaging social media content in seconds.

Here's what's new: 👇

1/ Smart content extraction
River analyzes your video and pulls out the most shareable moments automatically.

2/ Multi-platform optimization
Generate content optimized for Twitter threads, LinkedIn posts, and Instagram carousels - all from one video.

3/ Tone customization
Want it professional? Casual? Punchy? You choose the vibe.

4/ One-click editing
Not happy with a section? Click edit and tweak it instantly. River regenerates just that part.

5/ Cache-powered speed
Same video? Instant results. We remember what works.

Try it out and let me know what you think! 🎬✨`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(dummyThread)
            setCopyLabel("copied!")
            setTimeout(() => setCopyLabel("copy"), 1400)
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const handleRegenerate = () => {
        setRegenMode("loading")
        setTimeout(() => {
            setRegenMode("success")
            setTimeout(() => {
                setRegenMode("idle")
                setTweakOpen(false)
                setTweakText("")
            }, 2500)
        }, 2000)
    }

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 840,
                margin: "40px auto",
                padding: 20,
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 840,
                    margin: "0 auto 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                }}
            >
                <div
                    style={{
                        fontFamily:
                            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: 24,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: "#2F2F2F",
                    }}
                >
                    How to Build a SaaS Product in 2024
                </div>
                <div
                    style={{
                        fontFamily:
                            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: 14,
                        lineHeight: 1.4,
                        color: "#7A7A7A",
                    }}
                >
                    YouTube Video • dQw4w9WgXcQ
                </div>
            </div>

            <TwitterThreadCard
                threadText={dummyThread}
                tweakOpen={tweakOpen}
                onToggleTweak={() => setTweakOpen(!tweakOpen)}
                tweakToggleDisabled={regenMode === "loading"}
                tweakText={tweakText}
                onChangeTweakText={setTweakText}
                onRegenerate={handleRegenerate}
                regenMode={regenMode}
                onCopy={handleCopy}
                copyLabel={copyLabel}
                copyDisabled={tweakOpen}
            />
        </div>
    )
}
