import * as React from "react"

/**
 * RiverLoader — Flowing river-inspired loading animation
 *
 * Three sinusoidal wave paths that flow continuously,
 * like watching a river current from above.
 *
 * Uses SVG-native <animateTransform> so the transform applies
 * in SVG coordinate space (before viewport clipping).
 *
 * Sizes:
 *   "small"   — Compact inline (e.g., inside cards)
 *   "default" — Standard content area loader
 *   "page"    — Full viewport centered (page transitions)
 */
export function RiverLoader({
    size = "default",
    message,
}: {
    size?: "small" | "default" | "page"
    message?: string
}) {
    const BLUE = "#4688f7"

    const scaleMap = { small: 0.55, default: 1, page: 1.3 }
    const sc = scaleMap[size]
    const svgW = Math.round(120 * sc)
    const svgH = Math.round(48 * sc)
    const wl = Math.round(40 * sc) // one wavelength

    // Cycling messages for page-level loader
    const pageMessages = React.useMemo(
        () => ["Flowing in…", "Just a moment…", "Almost there…"],
        []
    )
    const [msgIdx, setMsgIdx] = React.useState(0)

    React.useEffect(() => {
        if (size !== "page" || message) return
        const id = setInterval(
            () => setMsgIdx((i: number) => (i + 1) % pageMessages.length),
            3000
        )
        return () => clearInterval(id)
    }, [size, message, pageMessages])

    const displayMsg =
        message ?? (size === "page" ? pageMessages[msgIdx] : undefined)

    // Build a repeating sine-wave SVG path.
    // Extends one wavelength past each side of the viewBox
    // so translating by one wavelength loops seamlessly.
    const wavePath = (yCenter: number, amplitude: number) => {
        const y0 = Math.round(yCenter * sc)
        const amp = Math.round(amplitude * sc)
        const parts: string[] = [`M ${-wl},${y0}`]
        let x = -wl
        while (x < svgW + wl) {
            parts.push(
                `Q ${x + wl * 0.25},${y0 - amp} ${x + wl * 0.5},${y0}`
            )
            parts.push(
                `Q ${x + wl * 0.75},${y0 + amp} ${x + wl},${y0}`
            )
            x += wl
        }
        return parts.join(" ")
    }

    const waves = [
        { y: 14, amp: 6, opacity: 0.3, sw: 1.5, dur: 1.8 },
        { y: 24, amp: 8, opacity: 0.55, sw: 2.2, dur: 2.2 },
        { y: 34, amp: 5, opacity: 0.35, sw: 1.5, dur: 2.0 },
    ]

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: size === "page" ? 28 : 12,
                ...(size === "page"
                    ? {
                          width: "100%",
                          minHeight: "100vh",
                          backgroundColor: "#FAF8F0",
                      }
                    : {}),
            }}
        >
            <svg
                width={svgW}
                height={svgH}
                viewBox={`0 0 ${svgW} ${svgH}`}
                style={{ overflow: "hidden", display: "block" }}
            >
                {waves.map((w, i) => (
                    <path
                        key={i}
                        d={wavePath(w.y, w.amp)}
                        fill="none"
                        stroke={BLUE}
                        strokeWidth={w.sw * sc}
                        strokeLinecap="round"
                        opacity={w.opacity}
                    >
                        <animateTransform
                            attributeName="transform"
                            type="translate"
                            from="0 0"
                            to={`${-wl} 0`}
                            dur={`${w.dur}s`}
                            repeatCount="indefinite"
                        />
                    </path>
                ))}
            </svg>

            {displayMsg && (
                <div
                    key={displayMsg}
                    style={{
                        fontSize: size === "page" ? 16 : 14,
                        fontWeight: 400,
                        color: BLUE,
                        fontFamily:
                            "General Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        animation: "river-msg-in 500ms ease-out both",
                    }}
                >
                    {displayMsg}
                </div>
            )}

            <style>{`
                @keyframes river-msg-in {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 0.6; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
