import * as React from "react"
import { ChevronLeft, ChevronRight, Copy, Repeat, X, LayoutGrid, ExternalLink, CheckCircle } from "lucide-react"
import { UseRiverGeneration } from "./UseRiverGeneration.tsx"
import { TwitterThreadCard } from "./TwitterThreadCard.tsx"
import { LinkedInPostCard } from "./LinkedInPostCard.tsx"
import { AuthPrompt } from "./AuthComponents.tsx"
import { HorizontalCardCarousel } from "./HorizontalCardCarousel.tsx"
import { useAuthGate } from "./AuthGate.tsx"
import type { RegenMode } from "./TwitterThreadCard.tsx"

type RawRiverResult = any

type NormalizedRiverResult = {
    fromCache: boolean
    videoId: string | null
    youtubeId: string | null
    originalUrl: string | null
    videoTitle: string
    generationId: string | null
    tone: string
    platforms: string[]
    twitterThread?: { tweets: string[]; raw: string }
    linkedInPost?: { post: string; raw: string }
    instagramCarousel?: { slides: string[]; raw: string }
    receivedAt: Date
    raw: RawRiverResult
}

function splitSlidesFromContent(content: string): string[] {
    const text = String(content || "").trim()
    if (!text) return []

    if (text.includes("\n\n---\n\n")) {
        return text
            .split("\n\n---\n\n")
            .map((s) => s.trim())
            .filter(Boolean)
    }

    const parts = text
        .split(/\n\n+/)
        .map((s) => s.trim())
        .filter(Boolean)

    if (parts.length > 12) return [text]
    return parts.length ? parts : [text]
}

function normalizeRiverResult(raw: RawRiverResult): NormalizedRiverResult {
    const video = raw?.video || {}
    const generation = raw?.generation || {}
    const inputs = raw?.inputs || {}
    const outputs = raw?.outputs || {}
    const dbOutputs = Array.isArray(raw?.dbOutputs) ? raw.dbOutputs : []

    const videoId: string | null = video.id ?? null
    const youtubeId: string | null = video.youtube_video_id ?? null
    const originalUrl: string | null = video.original_url ?? null

    let videoTitle = "Untitled video"
    if (video.title) videoTitle = String(video.title)
    else if (youtubeId) videoTitle = `YouTube video (${youtubeId})`
    else if (originalUrl) videoTitle = originalUrl

    const tone: string = inputs.tone ?? ""
    const platforms: string[] = Array.isArray(inputs.platforms)
        ? inputs.platforms
        : []

    let twitterThread: { tweets: string[]; raw: string } | undefined
    const twitterOut = outputs.twitter
    if (twitterOut) {
        twitterThread = {
            tweets: Array.isArray(twitterOut.tweets) ? twitterOut.tweets : [],
            raw: String(twitterOut.raw ?? ""),
        }
    } else {
        const fromDb = dbOutputs.find((row: any) => row.platform === "twitter")
        if (fromDb) {
            const metaTweets = fromDb.metadata?.tweets
            twitterThread = {
                tweets: Array.isArray(metaTweets) ? metaTweets : [],
                raw: String(fromDb.content ?? ""),
            }
        }
    }

    let linkedInPost: { post: string; raw: string } | undefined
    const linkedInOut = outputs.linkedin
    if (linkedInOut) {
        linkedInPost = {
            post: String(linkedInOut.post ?? ""),
            raw: String(linkedInOut.post ?? ""),
        }
    } else {
        const fromDb = dbOutputs.find((row: any) => row.platform === "linkedin")
        if (fromDb) {
            linkedInPost = {
                post: String(fromDb.content ?? ""),
                raw: String(fromDb.content ?? ""),
            }
        }
    }

    let instagramCarousel: { slides: string[]; raw: string } | undefined
    const carouselOut = outputs.carousel
    if (carouselOut) {
        const slides = Array.isArray(carouselOut.slides)
            ? carouselOut.slides
            : []
        const rawText = String(carouselOut.raw ?? "")
        instagramCarousel = {
            slides: slides.length ? slides : splitSlidesFromContent(rawText),
            raw: rawText,
        }
    } else {
        const fromDb = dbOutputs.find((row: any) => row.platform === "carousel")
        if (fromDb) {
            const metaSlides = fromDb.metadata?.slides
            const rawText = String(fromDb.content ?? "")
            instagramCarousel = {
                slides: Array.isArray(metaSlides)
                    ? metaSlides
                    : splitSlidesFromContent(rawText),
                raw: rawText,
            }
        }
    }

    return {
        fromCache: !!raw?.fromCache,
        videoId,
        youtubeId,
        originalUrl,
        videoTitle,
        generationId: generation.id ?? null,
        tone,
        platforms,
        twitterThread,
        linkedInPost,
        instagramCarousel,
        receivedAt: new Date(),
        raw,
    }
}

export function RiverResultsRoot({
    disableAuthUI = false,
}: {
    disableAuthUI?: boolean
}) {
    return <RiverResultsInner disableAuthUI={disableAuthUI} />
}

function RiverResultsInner({
    disableAuthUI = false,
}: {
    disableAuthUI?: boolean
}) {
    const { state, regenerate } = UseRiverGeneration()
    const { isAuthenticated, openSignUpModal } = useAuthGate()

    const [result, setResult] = React.useState<NormalizedRiverResult | null>(null)
    const resultsContainerRef = React.useRef<HTMLDivElement | null>(null)

    // Twitter card state
    const [twTweakOpen, setTwTweakOpen] = React.useState(false)
    const [twTweakText, setTwTweakText] = React.useState("")
    const [twCopyLabel, setTwCopyLabel] = React.useState<"copy" | "copied!">("copy")
    const twCopyTimerRef = React.useRef<number | null>(null)
    const twCollapseTimerRef = React.useRef<number | null>(null)

    // LinkedIn card state
    const [liTweakOpen, setLiTweakOpen] = React.useState(false)
    const [liTweakText, setLiTweakText] = React.useState("")
    const [liCopyLabel, setLiCopyLabel] = React.useState<"copy" | "copied!">("copy")
    const liCopyTimerRef = React.useRef<number | null>(null)
    const liCollapseTimerRef = React.useRef<number | null>(null)

    // IG card state
    const [igAspect, setIgAspect] = React.useState<"1:1" | "4:5">("1:1")
    const [igIndex, setIgIndex] = React.useState(0)
    const igTrackRef = React.useRef<HTMLDivElement | null>(null)
    const [igTweakOpen, setIgTweakOpen] = React.useState(false)
    const [igTweakText, setIgTweakText] = React.useState("")
    const [igCopied, setIgCopied] = React.useState<null | "slide" | "all">(null)
    const igCollapseTimerRef = React.useRef<number | null>(null)

    const isTweakLoading = state.lastAction === "tweak" && state.status === "loading"
    const twIsTweakLoading = twTweakOpen && isTweakLoading
    const liIsTweakLoading = liTweakOpen && isTweakLoading
    const igIsTweakLoading = igTweakOpen && isTweakLoading

    const twTweakRegenMode: RegenMode = React.useMemo(() => {
        if (!twTweakOpen) return "idle"
        if (state.lastAction !== "tweak") return "idle"
        if (state.status === "loading") return "loading"
        if (state.status === "success") return "success"
        if (state.status === "error") return "error"
        return "idle"
    }, [twTweakOpen, state.status, state.lastAction])

    const liTweakRegenMode: RegenMode = React.useMemo(() => {
        if (!liTweakOpen) return "idle"
        if (state.lastAction !== "tweak") return "idle"
        if (state.status === "loading") return "loading"
        if (state.status === "success") return "success"
        if (state.status === "error") return "error"
        return "idle"
    }, [liTweakOpen, state.status, state.lastAction])

    const igTweakRegenMode: RegenMode = React.useMemo(() => {
        if (!igTweakOpen) return "idle"
        if (state.lastAction !== "tweak") return "idle"
        if (state.status === "loading") return "loading"
        if (state.status === "success") return "success"
        if (state.status === "error") return "error"
        return "idle"
    }, [igTweakOpen, state.status, state.lastAction])

    React.useEffect(() => {
        if (!state.result) {
            setResult(null)
            return
        }
        const norm = normalizeRiverResult(state.result)
        norm.fromCache = !!state.fromCache
        setResult(norm)
    }, [state.result, state.fromCache])

    // Cleanup timers
    React.useEffect(() => {
        return () => {
            if (twCopyTimerRef.current) window.clearTimeout(twCopyTimerRef.current)
            if (twCollapseTimerRef.current) window.clearTimeout(twCollapseTimerRef.current)
            if (liCopyTimerRef.current) window.clearTimeout(liCopyTimerRef.current)
            if (liCollapseTimerRef.current) window.clearTimeout(liCollapseTimerRef.current)
            if (igCollapseTimerRef.current) window.clearTimeout(igCollapseTimerRef.current)
        }
    }, [])

    // Auto-collapse Twitter tweak panel
    React.useEffect(() => {
        const isTweakSuccess = twTweakOpen && state.lastAction === "tweak" && state.status === "success"
        if (!isTweakSuccess) return

        if (twCollapseTimerRef.current) {
            window.clearTimeout(twCollapseTimerRef.current)
            twCollapseTimerRef.current = null
        }

        twCollapseTimerRef.current = window.setTimeout(() => {
            setTwTweakOpen(false)
            setTwTweakText("")
            twCollapseTimerRef.current = null
        }, 2500)

        return () => {
            if (twCollapseTimerRef.current) {
                window.clearTimeout(twCollapseTimerRef.current)
                twCollapseTimerRef.current = null
            }
        }
    }, [twTweakOpen, state.lastAction, state.status])

    // Auto-collapse LinkedIn tweak panel
    React.useEffect(() => {
        const isTweakSuccess = liTweakOpen && state.lastAction === "tweak" && state.status === "success"
        if (!isTweakSuccess) return

        if (liCollapseTimerRef.current) {
            window.clearTimeout(liCollapseTimerRef.current)
            liCollapseTimerRef.current = null
        }

        liCollapseTimerRef.current = window.setTimeout(() => {
            setLiTweakOpen(false)
            setLiTweakText("")
            liCollapseTimerRef.current = null
        }, 2500)

        return () => {
            if (liCollapseTimerRef.current) {
                window.clearTimeout(liCollapseTimerRef.current)
                liCollapseTimerRef.current = null
            }
        }
    }, [liTweakOpen, state.lastAction, state.status])

    // Auto-collapse IG tweak panel
    React.useEffect(() => {
        const isTweakSuccess = igTweakOpen && state.lastAction === "tweak" && state.status === "success"
        if (!isTweakSuccess) return

        if (igCollapseTimerRef.current) {
            window.clearTimeout(igCollapseTimerRef.current)
            igCollapseTimerRef.current = null
        }

        igCollapseTimerRef.current = window.setTimeout(() => {
            setIgTweakOpen(false)
            setIgTweakText("")
            igCollapseTimerRef.current = null
        }, 2500)

        return () => {
            if (igCollapseTimerRef.current) {
                window.clearTimeout(igCollapseTimerRef.current)
                igCollapseTimerRef.current = null
            }
        }
    }, [igTweakOpen, state.lastAction, state.status])

    // IG index tracking from scroll
    React.useEffect(() => {
        const el = igTrackRef.current
        if (!el) return

        let raf = 0
        const handler = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                const children = Array.from(el.children) as HTMLElement[]
                if (!children.length) return
                const left = el.scrollLeft

                let best = 0
                let bestDist = Infinity
                for (let i = 0; i < children.length; i++) {
                    const dist = Math.abs(children[i].offsetLeft - left)
                    if (dist < bestDist) {
                        bestDist = dist
                        best = i
                    }
                }
                setIgIndex(best)
            })
        }

        el.addEventListener("scroll", handler, { passive: true })
        return () => {
            cancelAnimationFrame(raf)
            el.removeEventListener("scroll", handler)
        }
    }, [])

    // Auto-scroll to results when data arrives
    React.useEffect(() => {
        if (result && resultsContainerRef.current) {
            setTimeout(() => {
                resultsContainerRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                })
            }, 150)
        }
    }, [result])

    const isInitialLoading = state.status === "loading" && state.lastAction === "generate" && !result

    // Show loading skeletons during initial generation
    if (isInitialLoading && state.lastInputs) {
        const platforms = state.lastInputs.platforms || []
        return (
            <div
                ref={resultsContainerRef}
                style={{
                    width: "100%",
                    maxWidth: 880,
                    margin: "24px auto 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                }}
            >
                {platforms.includes("twitter") && <LoadingSkeletonCard />}
                {platforms.includes("linkedin") && <LoadingSkeletonCard />}
                {platforms.includes("carousel") && <LoadingSkeletonCard />}
            </div>
        )
    }

    if (!result) return null

    // Derived values
    const twitterText = result.twitterThread?.raw || result.twitterThread?.tweets?.join("\n\n") || ""
    const hasTwitterOutput = Boolean(twitterText)
    const linkedInText = result.linkedInPost?.post || ""
    const hasLinkedInOutput = Boolean(linkedInText)
    const igSlides = result.instagramCarousel?.slides || []
    const igCount = igSlides.length
    const igSafeIndex = Math.max(0, Math.min(igIndex, igCount - 1))
    const hasIgOutput = igCount > 0

    const scrollToIgIndex = (i: number) => {
        const el = igTrackRef.current
        if (!el) return
        const next = Math.max(0, Math.min(i, igCount - 1))
        const child = el.children.item(next) as HTMLElement | null
        if (!child) return
        child.scrollIntoView({ behavior: "smooth", inline: "start" })
        setIgIndex(next)
    }

    // Handlers
    const handleTwitterCopy = async () => {
        if (!hasTwitterOutput) return
        try {
            await navigator.clipboard.writeText(twitterText)
            setTwCopyLabel("copied!")
            if (twCopyTimerRef.current) window.clearTimeout(twCopyTimerRef.current)
            twCopyTimerRef.current = window.setTimeout(() => setTwCopyLabel("copy"), 1400)
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const handleTwitterToggleTweak = () => {
        if (twIsTweakLoading) return
        setTwTweakOpen((open) => {
            const next = !open
            setTwCopyLabel("copy")
            if (!next && twCollapseTimerRef.current) {
                window.clearTimeout(twCollapseTimerRef.current)
                twCollapseTimerRef.current = null
            }
            return next
        })
    }

    const handleTwitterRegenerate = () => {
        regenerate({
            tweak_instructions: twTweakText,
            force_regen: true,
            extra_options: { target_platform: "twitter" },
        })
    }

    const handleLinkedInCopy = async () => {
        if (!hasLinkedInOutput) return
        try {
            await navigator.clipboard.writeText(linkedInText)
            setLiCopyLabel("copied!")
            if (liCopyTimerRef.current) window.clearTimeout(liCopyTimerRef.current)
            liCopyTimerRef.current = window.setTimeout(() => setLiCopyLabel("copy"), 1400)
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const handleLinkedInToggleTweak = () => {
        if (liIsTweakLoading) return
        setLiTweakOpen((open) => {
            const next = !open
            setLiCopyLabel("copy")
            if (!next && liCollapseTimerRef.current) {
                window.clearTimeout(liCollapseTimerRef.current)
                liCollapseTimerRef.current = null
            }
            return next
        })
    }

    const handleLinkedInRegenerate = () => {
        regenerate({
            tweak_instructions: liTweakText,
            force_regen: true,
            extra_options: { target_platform: "linkedin" },
        })
    }

    const toggleIgTweak = () => {
        if (igIsTweakLoading) return
        setIgTweakOpen((v) => {
            const next = !v
            if (!next && igCollapseTimerRef.current) {
                window.clearTimeout(igCollapseTimerRef.current)
                igCollapseTimerRef.current = null
            }
            return next
        })
    }

    const igCopyAll = async () => {
        try {
            await navigator.clipboard.writeText(igSlides.join("\n\n---\n\n"))
            setIgCopied("all")
            window.setTimeout(() => setIgCopied(null), 1100)
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const igCopyThisSlide = async () => {
        try {
            await navigator.clipboard.writeText(igSlides[igSafeIndex] ?? "")
            setIgCopied("slide")
            window.setTimeout(() => setIgCopied(null), 1100)
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const igRegenerate = () => {
        regenerate({
            tweak_instructions: igTweakText,
            force_regen: true,
            extra_options: { target_platform: "carousel" },
        })
    }

    return (
        <>
            <div
                ref={resultsContainerRef}
                style={{
                    width: "100%",
                    maxWidth: 1400,
                    margin: "24px auto 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                }}
            >
                {/* Video Header */}
                <VideoHeader videoTitle={result.videoTitle} youtubeId={result.youtubeId} />

                {/* Carousel Container */}
                <HorizontalCardCarousel
                    navigationDisabled={twTweakOpen || liTweakOpen || igTweakOpen}
                    cards={[
                        hasTwitterOutput && (
                            <TwitterThreadCard
                                threadText={twitterText}
                                tweakOpen={twTweakOpen}
                                onToggleTweak={handleTwitterToggleTweak}
                                tweakToggleDisabled={twIsTweakLoading}
                                tweakText={twTweakText}
                                onChangeTweakText={setTwTweakText}
                                onRegenerate={handleTwitterRegenerate}
                                regenMode={twTweakRegenMode}
                                onCopy={handleTwitterCopy}
                                copyLabel={twCopyLabel}
                                copyDisabled={!hasTwitterOutput || twTweakOpen}
                            />
                        ),
                        hasLinkedInOutput && (
                            <LinkedInPostCard
                                postText={linkedInText}
                                tweakOpen={liTweakOpen}
                                onToggleTweak={handleLinkedInToggleTweak}
                                tweakToggleDisabled={liIsTweakLoading}
                                tweakText={liTweakText}
                                onChangeTweakText={setLiTweakText}
                                onRegenerate={handleLinkedInRegenerate}
                                regenMode={liTweakRegenMode}
                                onCopy={handleLinkedInCopy}
                                copyLabel={liCopyLabel}
                                copyDisabled={!hasLinkedInOutput || liTweakOpen}
                            />
                        ),
                        hasIgOutput && (
                            <InstagramCarouselCard
                                title="Instagram Carousel"
                                videoTitle={result.videoTitle}
                                slides={igSlides}
                                aspect={igAspect}
                                onToggleAspect={() => setIgAspect((a) => (a === "1:1" ? "4:5" : "1:1"))}
                                trackRef={igTrackRef}
                                index={igSafeIndex}
                                onPrev={() => scrollToIgIndex(igSafeIndex - 1)}
                                onNext={() => scrollToIgIndex(igSafeIndex + 1)}
                                tweakOpen={igTweakOpen}
                                onToggleTweak={toggleIgTweak}
                                tweakDisabled={igIsTweakLoading}
                                tweakText={igTweakText}
                                onChangeTweakText={setIgTweakText}
                                onRegenerate={igRegenerate}
                                regenMode={igTweakRegenMode}
                                copied={igCopied}
                                onCopySlide={igCopyThisSlide}
                                onCopyAll={igCopyAll}
                            />
                        ),
                    ].filter(Boolean)}
                />

                {/* Auth Prompt (for anon users only, when auth UI enabled) */}
                {!disableAuthUI && !isAuthenticated && (
                    <AuthPrompt onSignUpClick={openSignUpModal} />
                )}

                {/* Post-Auth CTA (for authenticated users, when auth UI enabled) */}
                {!disableAuthUI && isAuthenticated && (
                    <PostAuthCTA />
                )}
            </div>
        </>
    )
}

/* ------------------------------------------------------------------ */
/* Instagram carousel card                                              */
/* ------------------------------------------------------------------ */

function InstagramCarouselCard(props: {
    title: string
    videoTitle: string
    slides: string[]
    aspect: "1:1" | "4:5"
    onToggleAspect: () => void
    trackRef: React.RefObject<HTMLDivElement>
    index: number
    onPrev: () => void
    onNext: () => void
    tweakOpen: boolean
    onToggleTweak: () => void
    tweakDisabled: boolean
    tweakText: string
    onChangeTweakText: (v: string) => void
    onRegenerate: () => void
    regenMode: RegenMode
    copied: null | "slide" | "all"
    onCopySlide: () => void
    onCopyAll: () => void
}) {
    const {
        title,
        slides,
        aspect,
        onToggleAspect,
        trackRef,
        index,
        onPrev,
        onNext,
        tweakOpen,
        onToggleTweak,
        tweakDisabled,
        tweakText,
        onChangeTweakText,
        onRegenerate,
        regenMode,
        copied,
        onCopySlide,
        onCopyAll,
    } = props

    const count = slides.length
    const isLoading = regenMode === "loading"

    return (
        <div
            style={{
                width: "100%",
                boxSizing: "border-box",
                borderRadius: 24,
                border: "1px solid #E0CD9D",
                backgroundColor: "#FAF7ED",
                padding: 20,
                position: "relative",
                overflow: "visible",
                fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 14,
                }}
            >
                <div style={{ color: "#7A7A7A", fontSize: 16 }}>{title}</div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <AspectRatioToggle aspect={aspect} onToggle={onToggleAspect} />
                    <div style={{ color: "#7A7A7A", fontSize: 13 }}>
                        {index + 1} / {count}
                    </div>
                </div>
            </div>

            {/* CAROUSEL FRAME */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: aspect === "4:5" ? "4 / 5" : "1 / 1",
                    borderRadius: 24,
                    backgroundColor: "#FAF8F0",
                    boxShadow: "inset 0px 0px 5px rgba(0,0,0,0.13)",
                    overflow: "hidden",
                }}
            >
                {/* TRACK */}
                <div
                    ref={trackRef as any}
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        overflowX: "auto",
                        overflowY: "hidden",
                        scrollSnapType: "x mandatory",
                        WebkitOverflowScrolling: "touch",
                        scrollbarWidth: "none",
                    }}
                >
                    {slides.map((text, i) => (
                        <div
                            key={i}
                            style={{
                                flex: "0 0 100%",
                                height: "100%",
                                scrollSnapAlign: "start",
                                padding: 24,
                                boxSizing: "border-box",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                gap: 16,
                                opacity: tweakOpen ? 0.55 : 1,
                                transition: "opacity 300ms cubic-bezier(0.25,0.1,0.25,1)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                    padding: 16,
                                }}
                            >
                                <div
                                    style={{
                                        color: "#2F2F2F",
                                        fontSize: 22,
                                        lineHeight: 1.3,
                                        whiteSpace: "pre-wrap",
                                        maxWidth: 560,
                                    }}
                                >
                                    {text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ARROWS */}
                <ArrowButton side="left" disabled={index === 0} onClick={onPrev} />
                <ArrowButton side="right" disabled={index === count - 1} onClick={onNext} />

                {/* DOTS */}
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 12,
                        display: "flex",
                        justifyContent: "center",
                        gap: 8,
                        pointerEvents: "none",
                    }}
                >
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: 7,
                                height: 7,
                                borderRadius: 999,
                                backgroundColor:
                                    i === index ? "rgba(47,47,47,0.55)" : "rgba(47,47,47,0.18)",
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                    marginTop: 14,
                    overflow: "visible",
                }}
            >
                <IconOnlyActionButton
                    icon={tweakOpen ? <X size={22} /> : <Repeat size={22} />}
                    label={tweakOpen ? "cancel" : "edit"}
                    onClick={onToggleTweak}
                    disabled={tweakDisabled}
                />
                <CopyMenuButton
                    disabled={false}
                    copied={copied}
                    onCopySlide={onCopySlide}
                    onCopyAll={onCopyAll}
                />
            </div>

            {/* TWEAK CARD */}
            {tweakOpen && (
                <div
                    style={{
                        boxSizing: "border-box",
                        width: "100%",
                        marginTop: 14,
                        padding: 24,
                        borderRadius: 24,
                        border: "1px solid #E0CD9D",
                        backgroundColor: "rgba(250,247,237,0.92)",
                        backdropFilter: "blur(1px)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                        overflow: "visible",
                    }}
                >
                    <div style={{ textAlign: "center", color: "#7A7A7A", fontSize: 16 }}>
                        tell river how to modify your carousel
                    </div>

                    <textarea
                        value={tweakText}
                        onChange={(e) => onChangeTweakText(e.target.value)}
                        placeholder="make it more funny, add a stronger hook, simplify the language…"
                        disabled={isLoading}
                        style={{
                            boxSizing: "border-box",
                            width: "100%",
                            minHeight: 140,
                            backgroundColor: "#FAF8F0",
                            borderRadius: 24,
                            border: "none",
                            outline: "none",
                            padding: "18px 20px",
                            resize: "vertical",
                            fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: 14,
                            lineHeight: "1.3em",
                            color: "#2F2F2F",
                            boxShadow: "inset 0px 0px 5px rgba(0,0,0,0.13)",
                            opacity: isLoading ? 0.75 : 1,
                            transition: "opacity 250ms cubic-bezier(0.25,0.1,0.25,1)",
                        }}
                    />

                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <RiverMiniCTA
                            label={
                                regenMode === "loading"
                                    ? "Holding the thread…"
                                    : regenMode === "success"
                                        ? "There you go!"
                                        : regenMode === "error"
                                            ? "Try again"
                                            : "Let it flow"
                            }
                            onClick={onRegenerate}
                            disabled={isLoading}
                            loading={isLoading}
                        />
                    </div>
                </div>
            )}

            <style>{`div::-webkit-scrollbar{display:none}`}</style>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Shared UI components                                                 */
/* ------------------------------------------------------------------ */

function AspectRatioToggle({ aspect, onToggle }: { aspect: "1:1" | "4:5"; onToggle: () => void }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                padding: 4,
                backgroundColor: "rgba(124, 138, 17, 0.12)",
                borderRadius: 999,
                fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: 12,
                fontWeight: 500,
            }}
        >
            <AspectToggleButton label="1:1" isActive={aspect === "1:1"} onClick={() => aspect !== "1:1" && onToggle()} />
            <AspectToggleButton label="4:5" isActive={aspect === "4:5"} onClick={() => aspect !== "4:5" && onToggle()} />
        </div>
    )
}

function AspectToggleButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
    const [hover, setHover] = React.useState(false)

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: "6px 10px",
                border: "none",
                borderRadius: 999,
                backgroundColor: isActive ? "#FAF7ED" : hover ? "rgba(124, 138, 17, 0.08)" : "transparent",
                color: isActive ? "rgba(47,47,47,0.85)" : "rgba(47,47,47,0.55)",
                cursor: isActive ? "default" : "pointer",
                transition: "background-color 220ms cubic-bezier(0.25,0.1,0.25,1), color 220ms cubic-bezier(0.25,0.1,0.25,1)",
                fontFamily: "inherit",
                fontSize: "inherit",
                fontWeight: "inherit",
            }}
        >
            {label}
        </button>
    )
}

function IconOnlyActionButton({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
    const [hover, setHover] = React.useState(false)
    const bg = hover ? "rgba(124, 138, 17, 0.18)" : "rgba(124, 138, 17, 0.12)"
    const fg = hover ? "rgba(47,47,47,0.72)" : "rgba(47,47,47,0.55)"

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            aria-label={label}
            title={label}
            style={{
                boxSizing: "border-box",
                width: "min-content",
                height: "min-content",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 8,
                backgroundColor: bg,
                borderRadius: 24,
                border: "none",
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.45 : 1,
                transition: "background-color 220ms cubic-bezier(0.25,0.1,0.25,1), opacity 220ms cubic-bezier(0.25,0.1,0.25,1)",
                color: fg,
            }}
        >
            <span style={{ display: "flex", width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>{icon}</span>
        </button>
    )
}

function CopyMenuButton({
    onCopySlide,
    onCopyAll,
    copied,
    disabled,
}: {
    onCopySlide: () => void
    onCopyAll: () => void
    copied: null | "slide" | "all"
    disabled?: boolean
}) {
    const [open, setOpen] = React.useState(false)
    const [hover, setHover] = React.useState(false)
    const wrapRef = React.useRef<HTMLDivElement | null>(null)

    const bg = hover ? "rgba(124, 138, 17, 0.18)" : "rgba(124, 138, 17, 0.12)"
    const fg = hover ? "rgba(47,47,47,0.72)" : "rgba(47,47,47,0.55)"

    React.useEffect(() => {
        if (!open) return
        const onDown = (e: MouseEvent) => {
            const el = wrapRef.current
            if (!el) return
            if (!el.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        window.addEventListener("mousedown", onDown)
        window.addEventListener("keydown", onKey)
        return () => {
            window.removeEventListener("mousedown", onDown)
            window.removeEventListener("keydown", onKey)
        }
    }, [open])

    const copySlide = async () => {
        await onCopySlide()
        setOpen(false)
    }
    const copyAll = async () => {
        await onCopyAll()
        setOpen(false)
    }

    const labelSlide = copied === "slide" ? "Copied this slide" : "Copy this slide"
    const labelAll = copied === "all" ? "Copied all slides" : "Copy all slides"

    return (
        <div ref={wrapRef} style={{ position: "relative", overflow: "visible" }}>
            <button
                onClick={() => setOpen((v) => !v)}
                disabled={disabled}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                aria-label="copy options"
                title="copy options"
                style={{
                    boxSizing: "border-box",
                    width: "min-content",
                    height: "min-content",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 8,
                    backgroundColor: bg,
                    borderRadius: 24,
                    border: "none",
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled ? 0.45 : 1,
                    transition: "background-color 220ms cubic-bezier(0.25,0.1,0.25,1), opacity 220ms cubic-bezier(0.25,0.1,0.25,1)",
                    color: fg,
                }}
            >
                <span style={{ display: "flex", width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
                    <Copy size={22} />
                </span>
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: 46,
                        minWidth: 190,
                        borderRadius: 24,
                        border: "none",
                        backgroundColor: "rgba(138, 107, 17, 0.14)",
                        backdropFilter: "blur(4px)",
                        WebkitBackdropFilter: "blur(4px)",
                        padding: 6,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        zIndex: 50,
                    }}
                >
                    <MenuItem label={labelSlide} onClick={copySlide} />
                    <MenuItem label={labelAll} onClick={copyAll} />
                </div>
            )}
        </div>
    )
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
    const [hover, setHover] = React.useState(false)

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: "100%",
                border: "none",
                borderRadius: 24,
                padding: "10px 12px",
                backgroundColor: hover ? "rgba(124, 138, 17, 0.14)" : "transparent",
                cursor: "pointer",
                color: "rgba(47,47,47,0.72)",
                fontSize: 13,
                textAlign: "left",
                fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                transition: "background-color 180ms cubic-bezier(0.25,0.1,0.25,1)",
            }}
        >
            {label}
        </button>
    )
}

function ArrowButton({ side, onClick, disabled }: { side: "left" | "right"; onClick: () => void; disabled?: boolean }) {
    const [hover, setHover] = React.useState(false)
    const Icon = side === "left" ? ChevronLeft : ChevronRight

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                left: side === "left" ? 12 : undefined,
                right: side === "right" ? 12 : undefined,
                width: 40,
                height: 40,
                borderRadius: 999,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.18 : hover ? 1 : 0.75,
                backgroundColor: "rgba(250, 248, 240, 0.06)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "none",
                color: "rgba(47,47,47,0.62)",
                transition: "opacity 180ms ease",
            }}
            aria-label={side === "left" ? "Previous slide" : "Next slide"}
            title={side === "left" ? "Previous" : "Next"}
        >
            <Icon size={22} />
        </button>
    )
}

function RiverMiniCTA({ label, onClick, disabled, loading = false }: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean }) {
    const [hover, setHover] = React.useState(false)
    const [pressed, setPressed] = React.useState(false)

    const backgroundColor = pressed ? "#0F6B75" : hover ? "#148A97" : "#117E8A"

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => {
                setHover(false)
                setPressed(false)
            }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                boxSizing: "border-box",
                width: "fit-content",
                height: 40,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px 24px",
                gap: "8px",
                borderRadius: "24px",
                border: "none",
                outline: "none",
                backgroundColor,
                boxShadow: !disabled && pressed ? "0px 2px 2px rgba(48, 28, 10, 0.35)" : "0px 1px 6px rgba(48, 28, 10, 0.4), 0px 2px 2px rgba(48, 28, 10, 0.35)",
                color: "#EFE9DA",
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.1,
                fontFamily: "General Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                whiteSpace: "nowrap",
                cursor: disabled ? "default" : "pointer",
                userSelect: "none",
                opacity: disabled ? 0.75 : 1,
                transition: "background-color 400ms cubic-bezier(0.25,0.1,0.25,1), box-shadow 400ms cubic-bezier(0.25,0.1,0.25,1), opacity 250ms cubic-bezier(0.25,0.1,0.25,1)",
            }}
        >
            {loading && (
                <span
                    style={{
                        width: 14,
                        height: 14,
                        borderRadius: "999px",
                        border: "2px solid #EFE9DA",
                        borderTopColor: "transparent",
                        display: "inline-block",
                        animation: "river-mini-spin 1.1s linear infinite",
                    }}
                />
            )}

            <span>{label}</span>

            <style>
                {`
                @keyframes river-mini-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}
            </style>
        </button>
    )
}

function VideoHeader({ videoTitle, youtubeId }: { videoTitle: string; youtubeId: string | null }) {
    return (
        <div
            style={{
                width: "100%",
                maxWidth: 840,
                margin: "0 auto 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 6,
            }}
        >
            <div
                style={{
                    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: 24,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: "#2F2F2F",
                }}
            >
                {videoTitle}
            </div>
            <div
                style={{
                    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.4,
                    color: "#7A7A7A",
                }}
            >
                {youtubeId ? `YouTube Video • ${youtubeId}` : "YouTube Video"}
            </div>
        </div>
    )
}

function LoadingSkeletonCard() {
    return (
        <div
            style={{
                width: "100%",
                maxWidth: 840,
                margin: "0 auto",
                boxSizing: "border-box",
                borderRadius: 24,
                border: "1px solid #E0CD9D",
                backgroundColor: "#FAF7ED",
                padding: 20,
                minHeight: 320,
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div style={{ position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none" }}>
                <div
                    style={{
                        position: "absolute",
                        top: "30%",
                        left: "25%",
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(124, 138, 17, 0.15) 0%, rgba(124, 138, 17, 0.08) 40%, transparent 70%)",
                        animation: "river-ripple 3s ease-out infinite",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "60%",
                        left: "65%",
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(124, 138, 17, 0.12) 0%, rgba(124, 138, 17, 0.06) 40%, transparent 70%)",
                        animation: "river-ripple 3s ease-out infinite 0.8s",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "45%",
                        left: "50%",
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(124, 138, 17, 0.1) 0%, rgba(124, 138, 17, 0.05) 40%, transparent 70%)",
                        animation: "river-ripple 3s ease-out infinite 1.6s",
                    }}
                />
            </div>

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ width: "40%", height: 18, backgroundColor: "rgba(124, 138, 17, 0.08)", borderRadius: 12 }} />
                <div style={{ width: "100%", height: 240, backgroundColor: "rgba(124, 138, 17, 0.06)", borderRadius: 24, boxShadow: "inset 0px 0px 5px rgba(0, 0, 0, 0.08)" }} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                    <div style={{ width: 40, height: 40, backgroundColor: "rgba(124, 138, 17, 0.08)", borderRadius: 24 }} />
                    <div style={{ width: 40, height: 40, backgroundColor: "rgba(124, 138, 17, 0.08)", borderRadius: 24 }} />
                </div>
            </div>

            <style>
                {`
                @keyframes river-ripple {
                    0% {
                        transform: scale(0.5) translate(-50%, -50%);
                        opacity: 0;
                    }
                    20% {
                        opacity: 1;
                    }
                    100% {
                        transform: scale(2.5) translate(-50%, -50%);
                        opacity: 0;
                    }
                }
            `}
            </style>
        </div>
    )
}

/**
 * PostAuthCTA - Shows "Saved to Dashboard" message with link for authenticated users
 * Matches Figma node 192:170
 */
function PostAuthCTA() {
    const [hover, setHover] = React.useState(false)

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 840,
                margin: "0 auto",
                padding: "16px 20px",
                borderRadius: 12,
                backgroundColor: "rgba(17, 126, 138, 0.21)",
                boxShadow: "0px 0px 4px rgba(36, 42, 25, 0.25)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: '"Inter", sans-serif',
            }}
        >
            {/* Check icon + "Saved to your" */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <CheckCircle size={24} color="#117E8A" />
                <span
                    style={{
                        color: "#3A3A3A",
                        fontSize: 20,
                        fontWeight: 400,
                    }}
                >
                    Saved to your
                </span>
            </div>

            {/* "dashboard" pill link */}
            <a
                href="/dashboard"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 10px",
                    borderRadius: 29,
                    backgroundColor: hover ? "#2A2A2A" : "#3A3A3A",
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: 300,
                    textDecoration: "none",
                    transition: "background-color 200ms ease",
                }}
            >
                dashboard
            </a>
        </div>
    )
}