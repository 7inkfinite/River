import * as React from "react"
import { TwitterThreadCard } from "./TwitterThreadCard.tsx"
import { LinkedInPostCard } from "./LinkedInPostCard.tsx"
import { InstagramCarouselCard } from "./InstagramCarouselCard.tsx"

/**
 * ResultsPreview - Complete results preview component for Framer design iteration
 *
 * This component displays the full results layout (title + all three cards) with
 * dummy data so you can preview and tweak the overall design without running
 * the Pipedream workflow.
 */
export function ResultsPreview() {
    // Twitter state
    const [twTweakOpen, setTwTweakOpen] = React.useState(false)
    const [twTweakText, setTwTweakText] = React.useState("")
    const [twCopyLabel, setTwCopyLabel] = React.useState<"copy" | "copied!">(
        "copy"
    )
    const [twRegenMode, setTwRegenMode] = React.useState<
        "idle" | "loading" | "success" | "error"
    >("idle")

    // LinkedIn state
    const [liTweakOpen, setLiTweakOpen] = React.useState(false)
    const [liTweakText, setLiTweakText] = React.useState("")
    const [liCopyLabel, setLiCopyLabel] = React.useState<"copy" | "copied!">(
        "copy"
    )
    const [liRegenMode, setLiRegenMode] = React.useState<
        "idle" | "loading" | "success" | "error"
    >("idle")

    // Instagram state
    const [igAspect, setIgAspect] = React.useState<"1:1" | "4:5">("1:1")
    const [igTweakOpen, setIgTweakOpen] = React.useState(false)
    const [igTweakText, setIgTweakText] = React.useState("")
    const [igCopied, setIgCopied] = React.useState<null | "slide" | "all">(
        null
    )
    const [igRegenMode, setIgRegenMode] = React.useState<
        "idle" | "loading" | "success" | "error"
    >("idle")

    // Dummy content
    const dummyTwitterThread = `🚀 Just shipped a major update to River!

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

    const dummyLinkedInPost = `I just launched River - a tool that transforms YouTube videos into platform-optimized social content.

The Problem:
Creating engaging social media content is time-consuming. You record a great video, but then spend hours extracting key moments and adapting them for different platforms.

The Solution:
River uses AI to analyze your YouTube videos and automatically generate:
• Twitter threads with perfect pacing
• LinkedIn posts that drive engagement
• Instagram carousels with visual flow

What makes it different:
✓ Smart extraction - finds the most shareable moments
✓ Multi-platform optimization - tailored for each platform's best practices
✓ Tone customization - matches your brand voice
✓ Instant editing - tweak and regenerate on the fly

I built this because I was tired of the manual work of repurposing content. Now what took hours takes seconds.

Try it out and let me know what you think! Would love your feedback.

#ContentCreation #SocialMedia #AI #Productivity`

    const dummyInstagramSlides = [
        "🚀 River\n\nTurn YouTube videos into viral social content",
        "The Problem:\n\nYou create amazing video content...\n\nBut adapting it for social media takes forever",
        "The Solution:\n\nRiver analyzes your videos and generates:\n\n• Twitter threads\n• LinkedIn posts\n• Instagram carousels\n\nAll optimized for each platform",
        "Smart Features:\n\n✓ AI-powered extraction\n✓ Tone customization\n✓ Instant editing\n✓ Multi-platform\n✓ Lightning fast",
        "Results:\n\nWhat took hours\nnow takes seconds\n\n⏱️ → ⚡",
        "Try River Today\n\nTransform your content creation workflow\n\n🎬 → 📱",
    ]

    // Twitter handlers
    const handleTwitterCopy = async () => {
        try {
            await navigator.clipboard.writeText(dummyTwitterThread)
            setTwCopyLabel("copied!")
            setTimeout(() => setTwCopyLabel("copy"), 1400)
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const handleTwitterRegenerate = () => {
        setTwRegenMode("loading")
        setTimeout(() => {
            setTwRegenMode("success")
            setTimeout(() => {
                setTwRegenMode("idle")
                setTwTweakOpen(false)
                setTwTweakText("")
            }, 2500)
        }, 2000)
    }

    // LinkedIn handlers
    const handleLinkedInCopy = async () => {
        try {
            await navigator.clipboard.writeText(dummyLinkedInPost)
            setLiCopyLabel("copied!")
            setTimeout(() => setLiCopyLabel("copy"), 1400)
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const handleLinkedInRegenerate = () => {
        setLiRegenMode("loading")
        setTimeout(() => {
            setLiRegenMode("success")
            setTimeout(() => {
                setLiRegenMode("idle")
                setLiTweakOpen(false)
                setLiTweakText("")
            }, 2500)
        }, 2000)
    }

    // Instagram handlers
    const handleIgCopySlide = async (index: number) => {
        try {
            await navigator.clipboard.writeText(dummyInstagramSlides[index])
            setIgCopied("slide")
            setTimeout(() => setIgCopied(null), 1100)
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const handleIgCopyAll = async () => {
        try {
            await navigator.clipboard.writeText(
                dummyInstagramSlides.join("\n\n---\n\n")
            )
            setIgCopied("all")
            setTimeout(() => setIgCopied(null), 1100)
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const handleIgRegenerate = () => {
        setIgRegenMode("loading")
        setTimeout(() => {
            setIgRegenMode("success")
            setTimeout(() => {
                setIgRegenMode("idle")
                setIgTweakOpen(false)
                setIgTweakText("")
            }, 2500)
        }, 2000)
    }

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 880,
                margin: "40px auto",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 18,
            }}
        >
            {/* Video Title Header */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 840,
                    margin: "0 auto 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    textAlign: "center",
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

            {/* Twitter Card */}
            <div style={{ width: "100%", maxWidth: 840, margin: "0 auto" }}>
                <TwitterThreadCard
                    threadText={dummyTwitterThread}
                    tweakOpen={twTweakOpen}
                    onToggleTweak={() => setTwTweakOpen(!twTweakOpen)}
                    tweakToggleDisabled={twRegenMode === "loading"}
                    tweakText={twTweakText}
                    onChangeTweakText={setTwTweakText}
                    onRegenerate={handleTwitterRegenerate}
                    regenMode={twRegenMode}
                    onCopy={handleTwitterCopy}
                    copyLabel={twCopyLabel}
                    copyDisabled={twTweakOpen}
                />
            </div>

            {/* LinkedIn Card */}
            <div style={{ width: "100%", maxWidth: 840, margin: "0 auto" }}>
                <LinkedInPostCard
                    postText={dummyLinkedInPost}
                    tweakOpen={liTweakOpen}
                    onToggleTweak={() => setLiTweakOpen(!liTweakOpen)}
                    tweakToggleDisabled={liRegenMode === "loading"}
                    tweakText={liTweakText}
                    onChangeTweakText={setLiTweakText}
                    onRegenerate={handleLinkedInRegenerate}
                    regenMode={liRegenMode}
                    onCopy={handleLinkedInCopy}
                    copyLabel={liCopyLabel}
                    copyDisabled={liTweakOpen}
                />
            </div>

            {/* Instagram Carousel Card */}
            <InstagramCarouselCard
                slides={dummyInstagramSlides}
                aspect={igAspect}
                onToggleAspect={() =>
                    setIgAspect((a) => (a === "1:1" ? "4:5" : "1:1"))
                }
                tweakOpen={igTweakOpen}
                onToggleTweak={() => setIgTweakOpen(!igTweakOpen)}
                tweakDisabled={igRegenMode === "loading"}
                tweakText={igTweakText}
                onChangeTweakText={setIgTweakText}
                onRegenerate={handleIgRegenerate}
                regenMode={igRegenMode}
                copied={igCopied}
                onCopySlide={handleIgCopySlide}
                onCopyAll={handleIgCopyAll}
            />
        </div>
    )
}
