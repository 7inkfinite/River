import * as React from "react"

/**
 * LoadingSkeletonCardPreview - Preview component for Framer design iteration
 *
 * This component displays the loading skeleton cards with gradient animation
 * so you can preview and tweak the animation design without triggering the
 * actual loading state.
 */
export function LoadingSkeletonCardPreview() {
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
            {/* Show multiple skeleton cards like they would appear during loading */}
            <LoadingSkeletonCard />
            <LoadingSkeletonCard />
            <LoadingSkeletonCard />
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Loading Skeleton Card with Gradient Animation                        */
/* ------------------------------------------------------------------ */

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
            {/* Animated gradient overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(124, 138, 17, 0.12) 20%, rgba(124, 138, 17, 0.18) 50%, rgba(124, 138, 17, 0.12) 80%, transparent 100%)",
                    animation: "river-gradient-flow 2.5s ease-in-out infinite",
                    borderRadius: 24,
                }}
            />

            {/* Skeleton content structure */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                }}
            >
                {/* Title skeleton */}
                <div
                    style={{
                        width: "40%",
                        height: 18,
                        backgroundColor: "rgba(124, 138, 17, 0.08)",
                        borderRadius: 12,
                    }}
                />

                {/* Content box skeleton */}
                <div
                    style={{
                        width: "100%",
                        height: 240,
                        backgroundColor: "rgba(124, 138, 17, 0.06)",
                        borderRadius: 24,
                        boxShadow: "inset 0px 0px 5px rgba(0, 0, 0, 0.08)",
                    }}
                />

                {/* Action buttons skeleton */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            backgroundColor: "rgba(124, 138, 17, 0.08)",
                            borderRadius: 24,
                        }}
                    />
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            backgroundColor: "rgba(124, 138, 17, 0.08)",
                            borderRadius: 24,
                        }}
                    />
                </div>
            </div>

            <style>
                {`
                @keyframes river-gradient-flow {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}
            </style>
        </div>
    )
}
