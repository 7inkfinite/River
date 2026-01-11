import * as React from "react"
import { X } from "lucide-react"
import { supabase } from "./AuthComponents.tsx"

/**
 * UserDashboard - Dashboard shown after successful login
 * Shows user greeting, analytics, and list of generations
 */
export function UserDashboard({ onClose }: { onClose: () => void }) {
    const [user, setUser] = React.useState<any>(null)
    const [generations, setGenerations] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [selectedGeneration, setSelectedGeneration] = React.useState<any>(null)

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

                // Fetch user's generations
                const { data: generationsData, error } = await supabase
                    .from("generations")
                    .select(
                        `
                        *,
                        video:videos(*)
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
                    Loading...
                </div>
            </div>
        )
    }

    const userName = user?.user_metadata?.full_name || "there"

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999,
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                }}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        boxSizing: "border-box",
                        width: 900,
                        maxWidth: "95vw",
                        maxHeight: "90vh",
                        backgroundColor: "#FAF7ED",
                        borderRadius: 24,
                        border: "1px solid #E0CD9D",
                        padding: 40,
                        display: "flex",
                        flexDirection: "column",
                        gap: 32,
                        position: "relative",
                        overflowY: "auto",
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: 20,
                            right: 20,
                            width: 40,
                            height: 40,
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
                        <X size={20} color="#2F2F2F" />
                    </button>

                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                fontFamily: '"Inter", sans-serif',
                                fontSize: 32,
                                fontWeight: 600,
                                color: "#2F2F2F",
                            }}
                        >
                            Hey {userName}! 👋
                        </div>
                        <div
                            style={{
                                fontFamily: '"Inter", sans-serif',
                                fontSize: 16,
                                color: "#7A7A7A",
                            }}
                        >
                            You've generated {generations.length}{" "}
                            {generations.length === 1 ? "post" : "posts"} so
                            far
                        </div>
                    </div>

                    {/* Generations List */}
                    {generations.length === 0 ? (
                        <div
                            style={{
                                padding: 60,
                                textAlign: "center",
                                color: "#7A7A7A",
                                fontSize: 16,
                                fontFamily: '"Inter", sans-serif',
                            }}
                        >
                            No generations yet. Create your first one!
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                            }}
                        >
                            {generations.map((gen) => (
                                <GenerationListItem
                                    key={gen.id}
                                    generation={gen}
                                    onClick={() => setSelectedGeneration(gen)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Generation Detail Overlay */}
            {selectedGeneration && (
                <GenerationDetailOverlay
                    generation={selectedGeneration}
                    onClose={() => setSelectedGeneration(null)}
                />
            )}
        </>
    )
}

/**
 * GenerationListItem - Single item in the generations list
 */
function GenerationListItem({
    generation,
    onClick,
}: {
    generation: any
    onClick: () => void
}) {
    const [hover, setHover] = React.useState(false)

    const videoTitle = generation.video?.title || "Untitled Video"
    const platforms = generation.inputs?.platforms || []
    const createdAt = new Date(generation.created_at).toLocaleDateString()

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: "100%",
                padding: 20,
                borderRadius: 16,
                border: "1px solid #E0CD9D",
                backgroundColor: hover
                    ? "rgba(124, 138, 17, 0.06)"
                    : "#FFFFFF",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                textAlign: "left",
                transition: "all 200ms ease",
            }}
        >
            {/* Video Title */}
            <div
                style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#2F2F2F",
                }}
            >
                {videoTitle}
            </div>

            {/* Metadata */}
            <div
                style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
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
                                padding: "4px 12px",
                                borderRadius: 12,
                                backgroundColor: "rgba(124, 138, 17, 0.12)",
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#4F4F4F",
                                fontFamily: '"Inter", sans-serif',
                            }}
                        >
                            {platform}
                        </div>
                    ))}
                </div>

                {/* Date */}
                <div
                    style={{
                        fontSize: 13,
                        color: "#7A7A7A",
                        fontFamily: '"Inter", sans-serif',
                    }}
                >
                    {createdAt}
                </div>
            </div>
        </button>
    )
}

/**
 * GenerationDetailOverlay - Detailed view of a generation
 */
function GenerationDetailOverlay({
    generation,
    onClose,
}: {
    generation: any
    onClose: () => void
}) {
    const videoTitle = generation.video?.title || "Untitled Video"
    const videoId = generation.video?.id || generation.video_id
    const instructions = generation.inputs?.instructions || ""
    const platforms = generation.inputs?.platforms || []

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10000,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    boxSizing: "border-box",
                    width: 800,
                    maxWidth: "95vw",
                    maxHeight: "90vh",
                    backgroundColor: "#FAF7ED",
                    borderRadius: 24,
                    border: "1px solid #E0CD9D",
                    padding: 40,
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                    position: "relative",
                    overflowY: "auto",
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        width: 40,
                        height: 40,
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
                    <X size={20} color="#2F2F2F" />
                </button>

                {/* Title */}
                <div
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 28,
                        fontWeight: 600,
                        color: "#2F2F2F",
                        paddingRight: 40,
                    }}
                >
                    {videoTitle}
                </div>

                {/* Video ID */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#4F4F4F",
                            fontFamily: '"Inter", sans-serif',
                        }}
                    >
                        Video ID
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            color: "#7A7A7A",
                            fontFamily: '"Inter", monospace',
                            padding: "10px 14px",
                            backgroundColor: "rgba(124, 138, 17, 0.06)",
                            borderRadius: 8,
                        }}
                    >
                        {videoId}
                    </div>
                </div>

                {/* Platforms */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#4F4F4F",
                            fontFamily: '"Inter", sans-serif',
                        }}
                    >
                        Platforms
                    </div>
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
                                    padding: "6px 16px",
                                    borderRadius: 12,
                                    backgroundColor: "rgba(124, 138, 17, 0.12)",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: "#4F4F4F",
                                    fontFamily: '"Inter", sans-serif',
                                }}
                            >
                                {platform}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                {instructions && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#4F4F4F",
                                fontFamily: '"Inter", sans-serif',
                            }}
                        >
                            Instructions
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                color: "#2F2F2F",
                                fontFamily: '"Inter", sans-serif',
                                padding: "14px 16px",
                                backgroundColor: "rgba(124, 138, 17, 0.06)",
                                borderRadius: 12,
                                lineHeight: 1.6,
                            }}
                        >
                            {instructions}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
