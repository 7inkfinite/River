import * as React from "react"
import { LinkedInPostCard } from "./LinkedInPostCard.tsx"

/**
 * LinkedInPostCardPreview - Preview component for Framer design iteration
 *
 * This component displays the LinkedInPostCard with dummy data so you can
 * preview and tweak the design without running the Pipedream workflow.
 */
export function LinkedInPostCardPreview() {
    const [tweakOpen, setTweakOpen] = React.useState(false)
    const [tweakText, setTweakText] = React.useState("")
    const [copyLabel, setCopyLabel] = React.useState<"copy" | "copied!">(
        "copy"
    )
    const [regenMode, setRegenMode] = React.useState<
        "idle" | "loading" | "success" | "error"
    >("idle")

    const dummyPost = `I just launched River - a tool that transforms YouTube videos into platform-optimized social content.

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

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(dummyPost)
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
            <LinkedInPostCard
                title="How to Build a SaaS Product in 2024"
                postText={dummyPost}
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
