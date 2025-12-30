import * as React from "react"
import { InstagramCarouselCard } from "./InstagramCarouselCard.tsx"

/**
 * InstagramCarouselCardPreview - Preview component for Framer design iteration
 *
 * This component displays the InstagramCarouselCard with dummy data so you can
 * preview and tweak the design without running the Pipedream workflow.
 */
export function InstagramCarouselCardPreview() {
    const [aspect, setAspect] = React.useState<"1:1" | "4:5">("1:1")
    const [tweakOpen, setTweakOpen] = React.useState(false)
    const [tweakText, setTweakText] = React.useState("")
    const [copied, setCopied] = React.useState<null | "slide" | "all">(null)
    const [regenMode, setRegenMode] = React.useState<
        "idle" | "loading" | "success" | "error"
    >("idle")

    const dummySlides = [
        "🚀 River\n\nTurn YouTube videos into viral social content",
        "The Problem:\n\nYou create amazing video content...\n\nBut adapting it for social media takes forever",
        "The Solution:\n\nRiver analyzes your videos and generates:\n\n• Twitter threads\n• LinkedIn posts\n• Instagram carousels\n\nAll optimized for each platform",
        "Smart Features:\n\n✓ AI-powered extraction\n✓ Tone customization\n✓ Instant editing\n✓ Multi-platform\n✓ Lightning fast",
        "Results:\n\nWhat took hours\nnow takes seconds\n\n⏱️ → ⚡",
        "Try River Today\n\nTransform your content creation workflow\n\n🎬 → 📱",
    ]

    const handleCopySlide = async (index: number) => {
        try {
            await navigator.clipboard.writeText(dummySlides[index])
            setCopied("slide")
            setTimeout(() => setCopied(null), 1100)
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const handleCopyAll = async () => {
        try {
            await navigator.clipboard.writeText(dummySlides.join("\n\n---\n\n"))
            setCopied("all")
            setTimeout(() => setCopied(null), 1100)
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

            <InstagramCarouselCard
                slides={dummySlides}
                aspect={aspect}
                onToggleAspect={() =>
                    setAspect((a) => (a === "1:1" ? "4:5" : "1:1"))
                }
                tweakOpen={tweakOpen}
                onToggleTweak={() => setTweakOpen(!tweakOpen)}
                tweakDisabled={regenMode === "loading"}
                tweakText={tweakText}
                onChangeTweakText={setTweakText}
                onRegenerate={handleRegenerate}
                regenMode={regenMode}
                copied={copied}
                onCopySlide={handleCopySlide}
                onCopyAll={handleCopyAll}
            />
        </div>
    )
}
