import * as React from "react"
import { Repeat, Copy, X } from "lucide-react"

export type RegenMode = "idle" | "loading" | "success" | "error"

export type LinkedInPostCardProps = {
    title: string
    postText: string

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
}

export function LinkedInPostCard({
    title,
    postText,

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
}: LinkedInPostCardProps) {
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
                {/* Title */}
                <div
                    style={{
                        width: "100%",
                        textAlign: "left",
                        fontFamily:
                            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: 16,
                        lineHeight: "1.3em",
                        color: "#7A7A7A",
                        flex: "0 0 auto",
                    }}
                >
                    {title}
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
                            lineHeight: 1.5,
                            color: "#2F2F2F",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {postText}
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
                        placeholder="make it more professional, add a call to action, emphasize key insights"
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

                    {/* CENTER THE CTA */}
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
    const baseBg = "rgba(124, 138, 17, 0.22)"
    const hoverBg = "rgba(124, 138, 17, 0.30)"

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
                boxShadow: "0px 1px 1px 0px rgba(0, 0, 0, 0.25)",
                backgroundColor: hover ? hoverBg : baseBg,
                overflow: "clip",
                borderRadius: 24,
                border: "none",
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.45 : 1,
                transition:
                    "background-color 250ms cubic-bezier(0.25,0.1,0.25,1), opacity 250ms cubic-bezier(0.25,0.1,0.25,1)",
                color: "#2F2F2F",
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
