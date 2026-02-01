import * as React from "react"
import { ArrowLeft, Linkedin, Instagram, Play, LogOut, Home, Plus } from "lucide-react"
import { supabase } from "./AuthComponents.tsx"
import { HorizontalCardCarousel } from "./HorizontalCardCarousel.tsx"
import { TwitterThreadCard } from "./TwitterThreadCard.tsx"
import { LinkedInPostCard } from "./LinkedInPostCard.tsx"
import { InstagramCarouselCard } from "./InstagramCarouselCard.tsx"

// X (Twitter) logo SVG component
function XLogo({ size = 24, color = "#2F2F2F" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                fill={color}
            />
        </svg>
    )
}

/**
 * UserDashboard - Enhanced dashboard showing generation history and outputs
 *
 * Features:
 * - List view: Shows all user generations
 * - Detail view: Shows full outputs in carousel format
 * - Fullscreen modal for authenticated users
 * - Fetches outputs from database
 */

// Helper function to fetch video title from YouTube oEmbed API
async function fetchVideoTitle(youtubeId: string): Promise<string | null> {
    try {
        const response = await fetch(
            `https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${youtubeId}&format=json`
        )
        if (!response.ok) return null
        const data = await response.json()
        return data.title || null
    } catch (error) {
        console.warn("Failed to fetch video title:", error)
        return null
    }
}

// Helper function to get YouTube thumbnail URL
function getYouTubeThumbnail(youtubeId: string): string {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
}

// Platform icon component with active/inactive states (matching Figma design)
function PlatformIcon({ platform, active = true }: { platform: string; active?: boolean }) {
    const platformLower = platform.toLowerCase()
    const inactiveColor = "#CCCCCC"

    if (platformLower.includes("twitter") || platformLower.includes("x")) {
        return <XLogo size={24} color={active ? "#2F2F2F" : inactiveColor} />
    } else if (platformLower.includes("linkedin")) {
        return <Linkedin size={24} color={active ? "#0A66C2" : inactiveColor} />
    } else if (platformLower.includes("instagram") || platformLower.includes("carousel")) {
        return <Instagram size={24} color={active ? "#E4405F" : inactiveColor} />
    }
    return null
}

// Status bar component - Updated to match Figma design
function StatusBar({
    onNavigateToCreate,
    onLogout,
}: {
    onNavigateToCreate?: () => void
    onLogout: () => void
}) {
    const [homeHover, setHomeHover] = React.useState(false)
    const [newHover, setNewHover] = React.useState(false)
    const [logoutHover, setLogoutHover] = React.useState(false)

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: 64,
                backgroundColor: "#FAF8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
            }}
        >
            {/* Inner container aligned with dashboard content */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 1360,
                    padding: "0 60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                }}
            >
            {/* Home icon on left */}
            <button
                onClick={() => window.location.href = "/"}
                onMouseEnter={() => setHomeHover(true)}
                onMouseLeave={() => setHomeHover(false)}
                style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    borderRadius: 10,
                    backgroundColor: homeHover ? "rgba(70, 136, 247, 0.12)" : "transparent",
                    cursor: "pointer",
                    transform: homeHover ? "scale(1.08)" : "scale(1)",
                    transition: "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
            >
                <Home size={24} color={homeHover ? "#4688F7" : "#2F2F2F"} />
            </button>

            {/* Right side: New button and Logout */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {onNavigateToCreate && (
                    <button
                        onClick={onNavigateToCreate}
                        onMouseEnter={() => setNewHover(true)}
                        onMouseLeave={() => setNewHover(false)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 14,
                            width: 111,
                            padding: "8px 12px",
                            borderRadius: 24,
                            border: "none",
                            backgroundColor: newHover ? "#2563EB" : "#4688F7",
                            cursor: "pointer",
                            transform: newHover ? "scale(1.05) translateY(-1px)" : "scale(1)",
                            boxShadow: newHover
                                ? "0 6px 20px rgba(70, 136, 247, 0.4), 0 2px 8px rgba(70, 136, 247, 0.3)"
                                : "0 2px 8px rgba(70, 136, 247, 0.2)",
                            transition: "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                    >
                        <span
                            style={{
                                color: "#FAF8F0",
                                fontSize: 20,
                                fontWeight: 400,
                                fontFamily: '"Inter", sans-serif',
                            }}
                        >
                            New
                        </span>
                        <Plus size={14} color="#FAF8F0" strokeWidth={2.5} />
                    </button>
                )}
                <button
                    onClick={onLogout}
                    onMouseEnter={() => setLogoutHover(true)}
                    onMouseLeave={() => setLogoutHover(false)}
                    style={{
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        borderRadius: 10,
                        backgroundColor: logoutHover ? "rgba(239, 68, 68, 0.12)" : "transparent",
                        cursor: "pointer",
                        transform: logoutHover ? "scale(1.08)" : "scale(1)",
                        transition: "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                >
                    <LogOut size={24} color={logoutHover ? "#EF4444" : "#2F2F2F"} />
                </button>
            </div>
            </div>
        </div>
    )
}

// Generations progress bar component (matching Figma design)
function GenerationsProgressBar({
    generationsUsed = 0,
    generationsLimit = 30,
}: {
    generationsUsed?: number
    generationsLimit?: number
}) {
    const [upgradeHover, setUpgradeHover] = React.useState(false)
    const generationsLeft = Math.max(0, generationsLimit - generationsUsed)
    const progressPercentage = Math.min(100, (generationsUsed / generationsLimit) * 100)

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                width: 403,
            }}
        >
            {/* Progress bar */}
            <div
                style={{
                    width: "100%",
                    height: 21,
                    borderRadius: 12,
                    backgroundColor: "#F0EBDA",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 12,
                    boxShadow: "inset -2px 2px 2.4px 0px rgba(0,0,0,0.19)",
                }}
            >
                {/* Progress fill */}
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: `${progressPercentage}%`,
                        minWidth: progressPercentage > 0 ? 20 : 0,
                        maxWidth: "100%",
                        borderRadius: 12,
                        backgroundColor: "#4688F7",
                        boxShadow: "inset 0px -4px 3.2px 0px #2776C5, inset 0px 2px 3.4px 0px rgba(254,254,254,0.44)",
                    }}
                />
                {/* Text */}
                <span
                    style={{
                        position: "relative",
                        zIndex: 1,
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 12,
                        fontWeight: 400,
                        color: "#5D6226",
                    }}
                >
                    {generationsLeft} generations left
                </span>
            </div>

            {/* Upgrade CTA */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    width: "100%",
                }}
            >
                <span
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 14,
                        fontWeight: 400,
                        color: "#2F2F2F",
                    }}
                >
                    To keep using the app and unlock more benefits,
                </span>
                <button
                    onClick={() => {
                        // TODO: Open upgrade modal or navigate to upgrade page
                        console.log("Upgrade clicked")
                    }}
                    onMouseEnter={() => setUpgradeHover(true)}
                    onMouseLeave={() => setUpgradeHover(false)}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 24,
                        border: "none",
                        backgroundColor: upgradeHover ? "#1F1F1F" : "#2F2F2F",
                        color: "#FAF8F0",
                        fontSize: 14,
                        fontWeight: 400,
                        fontFamily: '"Inter", sans-serif',
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                    }}
                >
                    Upgrade
                </button>
            </div>
        </div>
    )
}

type DashboardView = "list" | "detail"

// Helper function to group generations by date
function groupGenerationsByDate(generations: any[]): [string, any[]][] {
    const groups: { [date: string]: any[] } = {}

    generations.forEach((gen) => {
        const date = new Date(gen.created_at).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        if (!groups[date]) groups[date] = []
        groups[date].push(gen)
    })

    return Object.entries(groups) // Returns [date, generations[]]
}

export function UserDashboard({
    onNavigateToCreate,
}: {
    onNavigateToCreate?: () => void
}) {
    const [user, setUser] = React.useState<any>(null)
    const [generations, setGenerations] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [view, setView] = React.useState<DashboardView>("list")
    const [selectedGeneration, setSelectedGeneration] = React.useState<any>(null)
    const [outputs, setOutputs] = React.useState<any[]>([])
    const [loadingOutputs, setLoadingOutputs] = React.useState(false)

    React.useEffect(() => {
        const fetchUserAndGenerations = async () => {
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
                    width: "100%",
                    minHeight: "100vh",
                    backgroundColor: "#FAF8F0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        color: "#7A7A7A",
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

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            window.location.href = "/"
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    return (
        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                backgroundColor: "#FAF8F0",
                overflowY: "auto",
                position: "relative",
            }}
        >
            {/* Status Bar */}
            <StatusBar
                onNavigateToCreate={onNavigateToCreate}
                onLogout={handleLogout}
            />

            {view === "list" ? (
                <DashboardListView
                    userName={userName}
                    generations={generations}
                    onViewGeneration={handleViewGeneration}
                    onNavigateToCreate={onNavigateToCreate}
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
 * DashboardListView - List of user generations (Updated Figma design)
 * Features:
 * - Date grouping: Generations grouped by creation date
 * - Infinite scroll: Loads more items as user scrolls
 */
function DashboardListView({
    userName,
    generations,
    onViewGeneration,
    onNavigateToCreate,
}: {
    userName: string
    generations: any[]
    onViewGeneration: (gen: any) => void
    onNavigateToCreate?: () => void
}) {
    // Infinite scroll state
    const [visibleCount, setVisibleCount] = React.useState(12)
    const observerRef = React.useRef<HTMLDivElement>(null)

    // Intersection Observer for infinite scroll
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < generations.length) {
                    setVisibleCount((prev) => Math.min(prev + 12, generations.length))
                }
            },
            { threshold: 0.1 }
        )

        if (observerRef.current) observer.observe(observerRef.current)
        return () => observer.disconnect()
    }, [visibleCount, generations.length])

    // Get visible generations and group by date
    const visibleGenerations = generations.slice(0, visibleCount)
    const groupedGenerations = groupGenerationsByDate(visibleGenerations)

    return (
        <div
            style={{
                maxWidth: 1360,
                margin: "0 auto",
                padding: "120px 60px 40px 60px",
                minHeight: "100vh",
                position: "relative",
            }}
        >
            {/* Header Row - Greeting left, Progress bar right */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 40,
                }}
            >
                {/* Greeting */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    <p
                        style={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 32,
                            fontWeight: 500,
                            color: "#2F2F2F",
                            margin: 0,
                        }}
                    >
                        Hi {userName}!
                    </p>
                    <p
                        style={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 20,
                            fontWeight: 400,
                            color: "#2F2F2F",
                            margin: 0,
                        }}
                    >
                        You can find all your previous generations here.
                    </p>
                </div>

                {/* Generations Progress Bar */}
                <GenerationsProgressBar
                    generationsUsed={generations.length}
                    generationsLimit={30}
                />
            </div>

            {/* Generations Grid - Grouped by Date */}
            {generations.length === 0 ? (
                <div
                    style={{
                        padding: 80,
                        textAlign: "center",
                        fontFamily: '"Inter", sans-serif',
                    }}
                >
                    <p
                        style={{
                            color: "#7A7A7A",
                            fontSize: 18,
                            marginBottom: 24,
                        }}
                    >
                        No generations yet.
                    </p>
                    {onNavigateToCreate && (
                        <button
                            onClick={onNavigateToCreate}
                            style={{
                                padding: "12px 24px",
                                borderRadius: 8,
                                border: "none",
                                backgroundColor: "#4688F7",
                                color: "#FFFFFF",
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: "pointer",
                                fontFamily: '"Inter", sans-serif',
                                transition: "background-color 200ms ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#3570D4"
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#4688F7"
                            }}
                        >
                            Create your first generation
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {groupedGenerations.map(([date, gens]) => (
                        <div key={date}>
                            {/* Date Header - right aligned with divider line */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    marginBottom: 16,
                                }}
                            >
                                <div
                                    style={{
                                        flex: 1,
                                        height: 1,
                                        backgroundColor: "#E2D0A2",
                                    }}
                                />
                                <span
                                    style={{
                                        fontFamily: '"Inter", sans-serif',
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: "#7A7A7A",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {date}
                                </span>
                            </div>

                            {/* Cards Grid for this date */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: 16,
                                }}
                            >
                                {gens.map((gen: any) => (
                                    <GenerationCard
                                        key={gen.id}
                                        generation={gen}
                                        onClick={() => onViewGeneration(gen)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Infinite scroll sentinel */}
                    {visibleCount < generations.length && (
                        <div
                            ref={observerRef}
                            style={{
                                height: 50,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: '"Inter", sans-serif',
                                    fontSize: 14,
                                    color: "#7A7A7A",
                                }}
                            >
                                Loading more...
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/**
 * GenerationCard - Card matching Figma design
 * - Tan thumbnail area with rounded top corners
 * - Bottom section with video title and platform icons
 * - Hover state with shadow
 */
function GenerationCard({
    generation,
    onClick,
}: {
    generation: any
    onClick: () => void
}) {
    const [hover, setHover] = React.useState(false)
    const [fetchedTitle, setFetchedTitle] = React.useState<string | null>(null)

    const youtubeId = generation.video?.youtube_video_id
    const dbTitle = generation.video?.title
    const platforms = generation.inputs?.platforms || generation.platforms || []

    // Fetch title from oEmbed if not in database
    React.useEffect(() => {
        if (!dbTitle && youtubeId) {
            fetchVideoTitle(youtubeId).then((title) => {
                if (title) setFetchedTitle(title)
            })
        }
    }, [dbTitle, youtubeId])

    // Determine final title to display
    const displayTitle = dbTitle || fetchedTitle || (youtubeId ? `Video (${youtubeId})` : "Video Title")

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: "100%",
                padding: 0,
                border: "none",
                backgroundColor: "#FAF8F0",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                textAlign: "left",
                borderRadius: 12,
                overflow: "hidden",
                transition: "box-shadow 200ms ease",
                boxShadow: hover
                    ? "0px 4px 8px 0px #C6C6C6"
                    : "none",
            }}
        >
            {/* Thumbnail area - tan/beige color */}
            <div
                style={{
                    width: "100%",
                    height: 180,
                    backgroundColor: "#E2D0A2",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                }}
            />

            {/* Bottom content area */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 16px 16px 16px",
                    borderLeft: "1px solid #E2D0A2",
                    borderRight: "1px solid #E2D0A2",
                    borderBottom: "1px solid #E2D0A2",
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                }}
            >
                {/* Video Title */}
                <p
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 20,
                        fontWeight: 400,
                        color: "#2F2F2F",
                        margin: 0,
                        width: 260,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {displayTitle}
                </p>

                {/* Platform Icons - Always show all 3, active/inactive based on selection */}
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                    }}
                >
                    <PlatformIcon
                        platform="twitter"
                        active={platforms.some((p: string) =>
                            p.toLowerCase().includes("twitter") || p.toLowerCase().includes("x")
                        )}
                    />
                    <PlatformIcon
                        platform="linkedin"
                        active={platforms.some((p: string) =>
                            p.toLowerCase().includes("linkedin")
                        )}
                    />
                    <PlatformIcon
                        platform="instagram"
                        active={platforms.some((p: string) =>
                            p.toLowerCase().includes("instagram") || p.toLowerCase().includes("carousel")
                        )}
                    />
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
                padding: "80px 20px 40px 20px",
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
                    borderRadius: 8,
                    border: "1px solid #E2D0A2",
                    backgroundColor: "transparent",
                    color: "#2F2F2F",
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: '"Inter", sans-serif',
                    cursor: "pointer",
                    marginBottom: 32,
                    transition: "background-color 200ms ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F5F0E3"
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                }}
            >
                <ArrowLeft size={18} />
                Back to List
            </button>

            {/* Video Header with Thumbnail */}
            <div
                style={{
                    marginBottom: 40,
                }}
            >
                {/* Thumbnail Banner */}
                {youtubeId && (
                    <div
                        style={{
                            width: "100%",
                            maxWidth: 800,
                            margin: "0 auto 24px auto",
                            borderRadius: 16,
                            overflow: "hidden",
                            backgroundColor: "#E2D0A2",
                            position: "relative",
                        }}
                    >
                        <img
                            src={getYouTubeThumbnail(youtubeId)}
                            alt={videoTitle}
                            style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                            }}
                            onError={(e) => {
                                e.currentTarget.style.display = "none"
                            }}
                        />
                        {/* Play icon overlay */}
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                backgroundColor: "rgba(0, 0, 0, 0.7)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
                        </div>
                    </div>
                )}

                {/* Title and Meta */}
                <div style={{ textAlign: "center" }}>
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
                border: "1px solid #E2D0A2",
                backgroundColor: "#FAF8F0",
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
