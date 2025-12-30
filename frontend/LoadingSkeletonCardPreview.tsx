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
            {/* Water ripple animations - multiple ripples with different timings */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 24,
                    pointerEvents: "none",
                }}
            >
                {/* Ripple 1 */}
                <div
                    style={{
                        position: "absolute",
                        top: "30%",
                        left: "25%",
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(124, 138, 17, 0.15) 0%, rgba(124, 138, 17, 0.08) 40%, transparent 70%)",
                        animation: "river-ripple 3s ease-out infinite",
                    }}
                />
                {/* Ripple 2 */}
                <div
                    style={{
                        position: "absolute",
                        top: "60%",
                        left: "65%",
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(124, 138, 17, 0.12) 0%, rgba(124, 138, 17, 0.06) 40%, transparent 70%)",
                        animation: "river-ripple 3s ease-out infinite 0.8s",
                    }}
                />
                {/* Ripple 3 */}
                <div
                    style={{
                        position: "absolute",
                        top: "45%",
                        left: "50%",
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(124, 138, 17, 0.1) 0%, rgba(124, 138, 17, 0.05) 40%, transparent 70%)",
                        animation: "river-ripple 3s ease-out infinite 1.6s",
                    }}
                />
            </div>

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
