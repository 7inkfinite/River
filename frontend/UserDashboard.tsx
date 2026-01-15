import * as React from "react"
import { X, ArrowLeft } from "lucide-react"
import { supabase } from "./AuthComponents.tsx"
import { HorizontalCardCarousel } from "./HorizontalCardCarousel.tsx"
import { TwitterThreadCard } from "./TwitterThreadCard.tsx"
import { LinkedInPostCard } from "./LinkedInPostCard.tsx"
import { InstagramCarouselCard } from "./InstagramCarouselCard.tsx"

/**
 * UserDashboard - Enhanced dashboard showing generation history and outputs
 *
 * Features:
 * - List view: Shows all user generations
 * - Detail view: Shows full outputs in carousel format
 * - Fullscreen modal for authenticated users
 * - Fetches outputs from database
 */

type DashboardView = "list" | "detail"

export function UserDashboard({ onClose }: { onClose: () => void }) {
    const [user, setUser] = React.useState<any>(null)
    const [generations, setGenerations] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [view, setView] = React.useState<DashboardView>("list")
    const [selectedGeneration, setSelectedGeneration] = React.useState<any>(null)
    const [outputs, setOutputs] = React.useState<any[]>([])
    const [loadingOutputs, setLoadingOutputs] = React.useState(false)

    React.useEffect(() => {
        const fetchUserAndGenerations = async () => {
            // Small delay to ensure claim transaction has committed
            await new Promise(resolve => setTimeout(resolve, 300))

            try {
                // Get current user
                const {
                    data: { user: currentUser },
                } = await supabase.auth.getUser()

                if (!currentUser) {
                    console.error("No user found")
                    setLoading(false)
                    return
                }

                setUser(currentUser)

                // Fetch user's generations with outputs
                const { data: generationsData, error } = await supabase
                    .from("generations")
                    .select(
                        `
                        id,
                        created_at,
                        tone,
                        platforms,
                        platforms,
                        video:videos(
                            id,
                            youtube_video_id,
                            original_url
                        ),
                        outputs(
                            id,
                            platform,
                            format,
                            content,
                            metadata
                        )
                    `
                    )
                    .eq("user_id", currentUser.id)
                    .order("created_at", { ascending: false })

                if (error) throw error

                setGenerations(generationsData || [])
            } catch (err) {
                console.error("Error fetching dashboard data:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchUserAndGenerations()
    }, [])

    const handleViewGeneration = async (generation: any) => {
        setSelectedGeneration(generation)
        setOutputs(generation.outputs || [])
        setView("detail")
    }

    const handleBackToList = () => {
        setView("list")
        setSelectedGeneration(null)
        setOutputs([])
    }

    if (loading) {
        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999,
                    backdropFilter: "blur(4px)",
                }}
            >
                <div
                    style={{
                        color: "#FFFFFF",
                        fontSize: 18,
                        fontFamily: '"Inter", sans-serif',
                    }}
                >
                    Loading your dashboard...
                </div>
            </div>
        )
    }

    const userName = user?.user_metadata?.full_name || "there"

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "#FAF7ED",
                zIndex: 9999,
                overflowY: "auto",
            }}
        >
            {view === "list" ? (
                <DashboardListView
                    userName={userName}
                    generations={generations}
                    onViewGeneration={handleViewGeneration}
                    onClose={onClose}
                />
            ) : (
                <DashboardDetailView
                    generation={selectedGeneration}
                    outputs={outputs}
                    onBack={handleBackToList}
                />
            )}
        </div>
    )
}

/**
 * DashboardListView - List of user generations
 */
function DashboardListView({
    userName,
    generations,
    onViewGeneration,
    onClose,
}: {
    userName: string
    generations: any[]
    onViewGeneration: (gen: any) => void
    onClose: () => void
}) {
    return (
        <div
            style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "40px 20px",
                minHeight: "100vh",
            }}
        >
            {/* Header with Close Button */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 40,
                }}
            >
                <div>
                    <div
                        style={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 36,
                            fontWeight: 600,
                            color: "#2F2F2F",
                            marginBottom: 12,
                        }}
                    >
                        Hey {userName}! 👋
                    </div>
                    <div
                        style={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 18,
                            color: "#7A7A7A",
                        }}
                    >
                        You've generated {generations.length}{" "}
                        {generations.length === 1 ? "post" : "posts"} so far
                    </div>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        border: "none",
                        backgroundColor: "rgba(124, 138, 17, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                            "rgba(124, 138, 17, 0.18)"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                            "rgba(124, 138, 17, 0.12)"
                    }}
                >
                    <X size={22} color="#2F2F2F" />
                </button>
            </div>

            {/* Generations Grid */}
            {generations.length === 0 ? (
                <div
                    style={{
                        padding: 80,
                        textAlign: "center",
                        color: "#7A7A7A",
                        fontSize: 18,
                        fontFamily: '"Inter", sans-serif',
                    }}
                >
                    No generations yet. Create your first one!
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: 20,
                    }}
                >
                    {generations.map((gen) => (
                        <GenerationCard
                            key={gen.id}
                            generation={gen}
                            onClick={() => onViewGeneration(gen)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

/**
 * GenerationCard - Card showing generation metadata
 */
function GenerationCard({
    generation,
    onClick,
}: {
    generation: any
    onClick: () => void
}) {
    const [hover, setHover] = React.useState(false)

    const videoTitle = generation.video?.title || "Untitled Video"
    const platforms = generation.inputs?.platforms || generation.platforms || []
    const createdAt = new Date(generation.created_at).toLocaleDateString()
    const outputCount = generation.outputs?.length || 0

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: "100%",
                padding: 24,
                borderRadius: 20,
                border: "1px solid #E0CD9D",
                backgroundColor: hover ? "#FFFFFF" : "#FAF8F0",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                textAlign: "left",
                transition: "all 250ms cubic-bezier(0.25,0.1,0.25,1)",
                boxShadow: hover
                    ? "0px 4px 16px rgba(124, 138, 17, 0.15)"
                    : "none",
                transform: hover ? "translateY(-2px)" : "translateY(0)",
            }}
        >
            {/* Video Title */}
            <div
                style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#2F2F2F",
                    lineHeight: 1.3,
                }}
            >
                {videoTitle}
            </div>

            {/* Metadata */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                {/* Platforms */}
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                    }}
                >
                    {platforms.map((platform: string) => (
                        <div
                            key={platform}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 12,
                                backgroundColor: "rgba(124, 138, 17, 0.12)",
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#4F4F4F",
                                fontFamily: '"Inter", sans-serif',
                            }}
                        >
                            {platform}
                        </div>
                    ))}
                </div>

                {/* Date and Output Count */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 14,
                        color: "#7A7A7A",
                        fontFamily: '"Inter", sans-serif',
                    }}
                >
                    <span>{createdAt}</span>
                    <span>{outputCount} outputs</span>
                </div>
            </div>
        </button>
    )
}

/**
 * DashboardDetailView - Shows generation outputs in carousel
 */
function DashboardDetailView({
    generation,
    outputs,
    onBack,
}: {
    generation: any
    outputs: any[]
    onBack: () => void
}) {
    const videoTitle = generation?.video?.title || "Untitled Video"
    const youtubeId = generation?.video?.youtube_video_id || null
    const createdAt = new Date(generation?.created_at).toLocaleDateString()

    // Parse outputs by platform
    const twitterOutput = outputs.find((o) => o.platform === "twitter")
    const linkedInOutput = outputs.find((o) => o.platform === "linkedin")
    const carouselOutput = outputs.find((o) => o.platform === "carousel")

    // Prepare cards for carousel
    const cards: React.ReactNode[] = []

    if (twitterOutput) {
        const tweets = twitterOutput.metadata?.tweets || []
        const threadText = twitterOutput.content || tweets.join("\n\n") || ""
        cards.push(
            <TwitterThreadCard
                key="twitter"
                threadText={threadText}
                tweakOpen={false}
                onToggleTweak={() => { }}
                tweakToggleDisabled={true}
                tweakText=""
                onChangeTweakText={() => { }}
                onRegenerate={() => { }}
                regenMode="idle"
                onCopy={async () => {
                    try {
                        await navigator.clipboard.writeText(threadText)
                    } catch (e) {
                        console.warn("Clipboard not available", e)
                    }
                }}
                copyLabel="copy"
                copyDisabled={false}
            />
        )
    }

    if (linkedInOutput) {
        const postText = linkedInOutput.content || ""
        cards.push(
            <LinkedInPostCard
                key="linkedin"
                postText={postText}
                tweakOpen={false}
                onToggleTweak={() => { }}
                tweakToggleDisabled={true}
                tweakText=""
                onChangeTweakText={() => { }}
                onRegenerate={() => { }}
                regenMode="idle"
                onCopy={async () => {
                    try {
                        await navigator.clipboard.writeText(postText)
                    } catch (e) {
                        console.warn("Clipboard not available", e)
                    }
                }}
                copyLabel="copy"
                copyDisabled={false}
            />
        )
    }

    if (carouselOutput) {
        const slides = carouselOutput.metadata?.slides || []
        cards.push(
            <InstagramCarouselCardStatic key="instagram" slides={slides} />
        )
    }

    return (
        <div
            style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "40px 20px",
                minHeight: "100vh",
            }}
        >
            {/* Back Button */}
            <button
                onClick={onBack}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "none",
                    backgroundColor: "rgba(124, 138, 17, 0.12)",
                    color: "#2F2F2F",
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: '"Inter", sans-serif',
                    cursor: "pointer",
                    marginBottom: 32,
                    transition: "background-color 200ms ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                        "rgba(124, 138, 17, 0.18)"
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                        "rgba(124, 138, 17, 0.12)"
                }}
            >
                <ArrowLeft size={18} />
                Back to List
            </button>

            {/* Video Header */}
            <div
                style={{
                    textAlign: "center",
                    marginBottom: 40,
                }}
            >
                <div
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 28,
                        fontWeight: 600,
                        color: "#2F2F2F",
                        marginBottom: 8,
                    }}
                >
                    {videoTitle}
                </div>
                <div
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 15,
                        color: "#7A7A7A",
                    }}
                >
                    {youtubeId ? `YouTube Video • ${youtubeId}` : "YouTube Video"} •{" "}
                    {createdAt}
                </div>
            </div>

            {/* Carousel */}
            {cards.length > 0 ? (
                <HorizontalCardCarousel cards={cards} />
            ) : (
                <div
                    style={{
                        padding: 80,
                        textAlign: "center",
                        color: "#7A7A7A",
                        fontSize: 16,
                        fontFamily: '"Inter", sans-serif',
                    }}
                >
                    No outputs available for this generation.
                </div>
            )}
        </div>
    )
}

/**
 * Static Instagram Carousel Card (no tweak functionality)
 */
function InstagramCarouselCardStatic({ slides }: { slides: string[] }) {
    const [index, setIndex] = React.useState(0)
    const [aspect, setAspect] = React.useState<"1:1" | "4:5">("1:1")
    const trackRef = React.useRef<HTMLDivElement | null>(null)

    const count = slides.length
    const safeIndex = Math.max(0, Math.min(index, count - 1))

    const scrollToIndex = (i: number) => {
        const el = trackRef.current
        if (!el) return
        const next = Math.max(0, Math.min(i, count - 1))
        const child = el.children.item(next) as HTMLElement | null
        if (!child) return
        child.scrollIntoView({ behavior: "smooth", inline: "start" })
        setIndex(next)
    }

    const copySlide = async () => {
        try {
            await navigator.clipboard.writeText(slides[safeIndex] || "")
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    const copyAll = async () => {
        try {
            await navigator.clipboard.writeText(slides.join("\n\n---\n\n"))
        } catch (e) {
            console.warn("Clipboard not available", e)
        }
    }

    return (
        <div
            style={{
                width: "100%",
                boxSizing: "border-box",
                borderRadius: 24,
                border: "1px solid #E0CD9D",
                backgroundColor: "#FAF7ED",
                padding: 20,
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                }}
            >
                <div style={{ color: "#7A7A7A", fontSize: 16 }}>
                    Instagram Carousel
                </div>
                <div style={{ color: "#7A7A7A", fontSize: 13 }}>
                    {index + 1} / {count}
                </div>
            </div>

            {/* Carousel Frame */}
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
                {/* Track */}
                <div
                    ref={trackRef}
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
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <div
                                style={{
                                    color: "#2F2F2F",
                                    fontSize: 22,
                                    lineHeight: 1.3,
                                    whiteSpace: "pre-wrap",
                                    textAlign: "center",
                                    maxWidth: 560,
                                }}
                            >
                                {text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                {index > 0 && (
                    <button
                        onClick={() => scrollToIndex(index - 1)}
                        style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            border: "none",
                            backgroundColor: "rgba(250, 248, 240, 0.8)",
                            cursor: "pointer",
                        }}
                    >
                        ←
                    </button>
                )}
                {index < count - 1 && (
                    <button
                        onClick={() => scrollToIndex(index + 1)}
                        style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            border: "none",
                            backgroundColor: "rgba(250, 248, 240, 0.8)",
                            cursor: "pointer",
                        }}
                    >
                        →
                    </button>
                )}
            </div>

            <style>{`div::-webkit-scrollbar{display:none}`}</style>
        </div>
    )
}
