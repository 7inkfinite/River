import * as React from "react"
import { Repeat, Copy, X } from "lucide-react"

const PATTERN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" fill="none" overflow="visible"><g><path d="M 240 160 C 284.183 160 320 195.817 320 240 C 320 284.183 284.183 320 240 320 C 195.817 320 160 284.183 160 240 C 160 195.817 195.817 160 240 160 Z" fill="transparent" stroke="rgb(112, 150, 23)"></path><path d="M 239.762 175 C 275.529 175 304.524 203.995 304.524 239.762 C 304.524 275.529 275.529 304.524 239.762 304.524 C 203.995 304.524 175 275.529 175 239.762 C 175 203.995 203.995 175 239.762 175 Z" fill="transparent" stroke-width="2" stroke="rgb(112, 150, 23)"></path><path d="M 240.238 145 C 292.837 145 335.476 187.64 335.476 240.238 C 335.476 292.837 292.837 335.476 240.238 335.476 C 187.64 335.476 145 292.837 145 240.238 C 145 187.64 187.64 145 240.238 145 Z" fill="transparent" stroke-width="2" stroke="rgb(112, 150, 23)"></path><path d="M 239.762 95 C 319.712 95 384.524 159.812 384.524 239.762 C 384.524 319.712 319.712 384.524 239.762 384.524 C 159.812 384.524 95 319.712 95 239.762 C 95 159.812 159.812 95 239.762 95 Z" fill="transparent" stroke-width="3" stroke="rgb(112, 150, 23)"></path><path d="M 239.81 76 C 330.279 76 403.619 149.34 403.619 239.81 C 403.619 330.279 330.279 403.619 239.81 403.619 C 149.34 403.619 76 330.279 76 239.81 C 76 149.34 149.34 76 239.81 76 Z" fill="transparent" stroke="rgb(112, 150, 23)"></path><path d="M 240.238 65 C 337.019 65 415.476 143.457 415.476 240.238 C 415.476 337.019 337.019 415.476 240.238 415.476 C 143.457 415.476 65 337.019 65 240.238 C 65 143.457 143.457 65 240.238 65 Z" fill="transparent" stroke="rgb(112, 150, 23)"></path><path d="M 240.595 42.5 C 350 42.5 438.69 131.19 438.69 240.595 C 438.69 350 350 438.69 240.595 438.69 C 131.19 438.69 42.5 350 42.5 240.595 C 42.5 131.19 131.19 42.5 240.595 42.5 Z" fill="transparent" stroke-width="2" stroke="rgb(112, 150, 23)"></path><path d="M 240 0 C 372.548 0 480 107.452 480 240 C 480 372.548 372.548 480 240 480 C 107.452 480 0 372.548 0 240 C 0 107.452 107.452 0 240 0 Z" fill="transparent" stroke-width="0.5" stroke="rgb(112, 150, 23)"></path></g></svg>`

function svgToDataUrl(svg: string) {
    const encoded = encodeURIComponent(svg)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22")
    return `data:image/svg+xml,${encoded}`
}

export type RegenMode = "idle" | "loading" | "success" | "error"

export type TwitterThreadCardProps = {
    title: string
    threadText: string

    onToggleTweak: () => void
    tweakOpen: boolean
    tweakToggleDisabled?: boolean

    onCopy: () => void
    copyLabel: string
    copyDisabled?: boolean

    tweakText: string
    onChangeTweakText: (v: string) => void
    onRegenerate: () => void
    regenMode: RegenMode

    patternOpacity?: number
    patternSizePx?: number
    patternOffsetX?: number
    patternOffsetY?: number
}

export function TwitterThreadCard({
    title,
    threadText,

    onToggleTweak,
    tweakOpen,
    tweakToggleDisabled = false,

    onCopy,
    copyLabel,
    copyDisabled,

    tweakText,
    onChangeTweakText,
    onRegenerate,
    regenMode,

    patternOpacity = 0.22,
    patternSizePx = 520,
    patternOffsetX = -200,
    patternOffsetY = 200,
}: TwitterThreadCardProps) {
    const patternUrl = React.useMemo(() => svgToDataUrl(PATTERN_SVG), [])

    const ctaLabel =
        regenMode === "loading"
            ? "Flowing…"
            : regenMode === "success"
              ? "There you go!"
              : regenMode === "error"
                ? "Try again"
                : "Let it flow"

    const isLoading = regenMode === "loading"

    return (
        <div
            style={{
                boxSizing: "border-box",
                width: "100%",
                maxHeight: 590,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-end",
                padding: "40px 20px 20px 20px",
                backgroundColor: "#FAF7ED",
                overflow: "clip",
                gap: 24,
                borderRadius: 24,
                border: "1px solid #E0CD9D",
                position: "relative",
            }}
        >
            {/* PATTERN LAYER */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 0,
                    opacity: patternOpacity,
                    backgroundImage: `url("${patternUrl}")`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${patternSizePx}px ${patternSizePx}px`,
                    backgroundPosition: `${patternOffsetX}px ${patternOffsetY}px`,
                }}
            />

            {/* STACK containing title + output */}
            <div
                style={{
                    width: "100%",
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    padding: 0,
                    gap: 10,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* Title and Character Count */}
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        flex: "0 0 auto",
                    }}
                >
                    <div
                        style={{
                            textAlign: "left",
                            fontFamily:
                                "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: 16,
                            lineHeight: "1.3em",
                            color: "#7A7A7A",
                        }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            fontFamily:
                                "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: 13,
                            color: "#7A7A7A",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {threadText?.length || 0} chars
                    </div>
                </div>

                {/* OUTPUT CONTENT BOX */}
                <div
                    style={{
                        boxSizing: "border-box",
                        width: "100%",
                        flex: 1,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        padding: 16,
                        backgroundColor: "#FAF8F0",
                        overflowY: "auto",
                        overflowX: "hidden",
                        zIndex: 1,
                        gap: 10,
                        borderRadius: 24,
                        boxShadow: "inset 0px 0px 5px 0px rgba(0, 0, 0, 0.13)",
                        opacity: tweakOpen ? 0.5 : 1,
                        transition:
                            "opacity 300ms cubic-bezier(0.25,0.1,0.25,1)",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            fontFamily:
                                "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: 16,
                            lineHeight: 1.4,
                            color: "#2F2F2F",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {threadText}
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS (bottom-right) */}
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                    position: "relative",
                    zIndex: 1,
                    flex: "0 0 auto",
                }}
            >
                <IconOnlyActionButton
                    icon={tweakOpen ? <X size={24} /> : <Repeat size={24} />}
                    label={tweakOpen ? "cancel" : "edit"}
                    onClick={onToggleTweak}
                    disabled={tweakToggleDisabled}
                />

                <IconOnlyActionButton
                    icon={<Copy size={24} />}
                    label={copyLabel}
                    onClick={onCopy}
                    disabled={copyDisabled}
                />
            </div>

            {/* TWEAK CARD */}
            {tweakOpen && (
                <div
                    style={{
                        boxSizing: "border-box",
                        width: "100%",
                        height: "min-content",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        padding: 24,
                        overflow: "hidden",
                        gap: 20,
                        borderRadius: 24,
                        border: "1px solid #E0CD9D",
                        position: "relative",
                        zIndex: 1,
                        backdropFilter: "blur(1px)",
                        flex: "0 0 auto",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            textAlign: "center",
                            fontFamily:
                                "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: 16,
                            lineHeight: "1.3em",
                            color: "#7A7A7A",
                        }}
                    >
                        tell river how to modify your post
                    </div>

                    <textarea
                        value={tweakText}
                        onChange={(e) => onChangeTweakText(e.target.value)}
                        placeholder="make it more funny, tone down the seriousness"
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
                            fontFamily:
                                "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: 14,
                            lineHeight: "1.3em",
                            color: "#2F2F2F",
                            boxShadow:
                                "inset 0px 0px 5px 0px rgba(0, 0, 0, 0.13)",
                            opacity: isLoading ? 0.75 : 1,
                            cursor: isLoading ? "default" : "text",
                            transition:
                                "opacity 250ms cubic-bezier(0.25,0.1,0.25,1)",
                        }}
                    />

                    {/* ✅ CENTER THE CTA */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            width: "100%",
                        }}
                    >
                        <RiverMiniCTA
                            label={ctaLabel}
                            onClick={onRegenerate}
                            disabled={isLoading}
                            loading={isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function IconOnlyActionButton({
    icon,
    label,
    onClick,
    disabled,
}: {
    icon: React.ReactNode
    label: string
    onClick?: () => void
    disabled?: boolean
}) {
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
                padding: "8px",
                backgroundColor: bg,
                borderRadius: 24,
                border: "none",
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.45 : 1,
                transition:
                    "background-color 220ms cubic-bezier(0.25,0.1,0.25,1), opacity 220ms cubic-bezier(0.25,0.1,0.25,1)",
                color: fg,
            }}
        >
            <span
                style={{
                    display: "flex",
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {icon}
            </span>
        </button>
    )
}

function RiverMiniCTA({
    label,
    onClick,
    disabled,
    loading = false,
}: {
    label: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
}) {
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
                boxShadow:
                    !disabled && pressed
                        ? "0px 2px 2px rgba(48, 28, 10, 0.35)"
                        : "0px 1px 6px rgba(48, 28, 10, 0.4), 0px 2px 2px rgba(48, 28, 10, 0.35)",
                color: "#EFE9DA",
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.1,
                fontFamily:
                    "General Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                whiteSpace: "nowrap",
                cursor: disabled ? "default" : "pointer",
                userSelect: "none",
                opacity: disabled ? 0.75 : 1,
                transition:
                    "background-color 400ms cubic-bezier(0.25,0.1,0.25,1), box-shadow 400ms cubic-bezier(0.25,0.1,0.25,1), opacity 250ms cubic-bezier(0.25,0.1,0.25,1)",
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
