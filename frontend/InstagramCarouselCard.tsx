// code/InstagramCarouselCard.tsx
import * as React from "react"
import { ChevronLeft, ChevronRight, Copy, Repeat, X } from "lucide-react"

export type RegenMode = "idle" | "loading" | "success" | "error"

export function InstagramCarouselCard(props: {
    title: string
    slides: string[]

    aspect: "1:1" | "4:5"
    onToggleAspect: () => void

    tweakOpen: boolean
    onToggleTweak: () => void
    tweakDisabled: boolean

    tweakText: string
    onChangeTweakText: (v: string) => void
    onRegenerate: () => void
    regenMode: RegenMode

    copied: null | "slide" | "all"
    onCopySlide: (index: number) => void
    onCopyAll: () => void
}) {
    const {
        title,
        slides,
        aspect,
        onToggleAspect,
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

    const trackRef = React.useRef<HTMLDivElement | null>(null)
    const [index, setIndex] = React.useState(0)

    const count = slides?.length || 0
    const safeIndex = Math.max(0, Math.min(index, count - 1))
    const isLoading = regenMode === "loading"

    const scrollToIndex = (i: number) => {
        const el = trackRef.current
        if (!el) return
        const next = Math.max(0, Math.min(i, count - 1))
        const child = el.children.item(next) as HTMLElement | null
        if (!child) return
        child.scrollIntoView({ behavior: "smooth", inline: "start" })
        setIndex(next)
    }

    // Update index on scroll
    React.useEffect(() => {
        const el = trackRef.current
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
                setIndex(best)
            })
        }

        el.addEventListener("scroll", handler, { passive: true })
        return () => {
            cancelAnimationFrame(raf)
            el.removeEventListener("scroll", handler)
        }
    }, [count])

    const label =
        regenMode === "loading"
            ? "Holding the thread…"
            : regenMode === "success"
              ? "There you go!"
              : regenMode === "error"
                ? "Try again"
                : "Let it flow"

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
                fontFamily:
                    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flex: 1,
                    }}
                >
                    <div style={{ color: "#7A7A7A", fontSize: 16 }}>{title}</div>
                    <div style={{ color: "#7A7A7A", fontSize: 13 }}>
                        {slides?.[safeIndex]?.length || 0} chars
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <AspectRatioToggle
                        aspect={aspect}
                        onToggle={onToggleAspect}
                    />

                    <div style={{ color: "#7A7A7A", fontSize: 13 }}>
                        {safeIndex + 1} / {count}
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
                    {slides?.map((text, i) => (
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
                                transition:
                                    "opacity 300ms cubic-bezier(0.25,0.1,0.25,1)",
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
                <ArrowButton
                    side="left"
                    disabled={safeIndex === 0}
                    onClick={() => scrollToIndex(safeIndex - 1)}
                />
                <ArrowButton
                    side="right"
                    disabled={safeIndex === count - 1}
                    onClick={() => scrollToIndex(safeIndex + 1)}
                />

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
                    {slides?.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: 7,
                                height: 7,
                                borderRadius: 999,
                                backgroundColor:
                                    i === safeIndex
                                        ? "rgba(47,47,47,0.55)"
                                        : "rgba(47,47,47,0.18)",
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
                    onCopySlide={() => onCopySlide(safeIndex)}
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
                    <div
                        style={{
                            textAlign: "center",
                            color: "#7A7A7A",
                            fontSize: 16,
                        }}
                    >
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
                            fontFamily:
                                "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: 14,
                            lineHeight: "1.3em",
                            color: "#2F2F2F",
                            boxShadow: "inset 0px 0px 5px rgba(0,0,0,0.13)",
                            opacity: isLoading ? 0.75 : 1,
                            transition:
                                "opacity 250ms cubic-bezier(0.25,0.1,0.25,1)",
                        }}
                    />

                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <RiverMiniCTA
                            label={label}
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
/* Shared little UI bits                                                */
/* ------------------------------------------------------------------ */

function AspectRatioToggle({
    aspect,
    onToggle,
}: {
    aspect: "1:1" | "4:5"
    onToggle: () => void
}) {
    const [hover, setHover] = React.useState(false)

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: 4,
                backgroundColor: "rgba(124, 138, 17, 0.12)",
                borderRadius: 999,
                fontFamily:
                    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: 12,
                fontWeight: 500,
            }}
        >
            <button
                onClick={aspect === "4:5" ? onToggle : undefined}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    padding: "6px 10px",
                    border: "none",
                    borderRadius: 999,
                    backgroundColor:
                        aspect === "1:1"
                            ? "#FAF7ED"
                            : hover && aspect === "4:5"
                              ? "rgba(124, 138, 17, 0.08)"
                              : "transparent",
                    color:
                        aspect === "1:1"
                            ? "rgba(47,47,47,0.85)"
                            : "rgba(47,47,47,0.55)",
                    cursor: aspect === "1:1" ? "default" : "pointer",
                    transition:
                        "background-color 220ms cubic-bezier(0.25,0.1,0.25,1), color 220ms cubic-bezier(0.25,0.1,0.25,1)",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    fontWeight: "inherit",
                }}
            >
                1:1
            </button>
            <button
                onClick={aspect === "1:1" ? onToggle : undefined}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    padding: "6px 10px",
                    border: "none",
                    borderRadius: 999,
                    backgroundColor:
                        aspect === "4:5"
                            ? "#FAF7ED"
                            : hover && aspect === "1:1"
                              ? "rgba(124, 138, 17, 0.08)"
                              : "transparent",
                    color:
                        aspect === "4:5"
                            ? "rgba(47,47,47,0.85)"
                            : "rgba(47,47,47,0.55)",
                    cursor: aspect === "4:5" ? "default" : "pointer",
                    transition:
                        "background-color 220ms cubic-bezier(0.25,0.1,0.25,1), color 220ms cubic-bezier(0.25,0.1,0.25,1)",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    fontWeight: "inherit",
                }}
            >
                4:5
            </button>
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
                padding: 8,
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
                }}
            >
                {icon}
            </span>
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

    const labelSlide =
        copied === "slide" ? "Copied this slide" : "Copy this slide"
    const labelAll = copied === "all" ? "Copied all slides" : "Copy all slides"

    return (
        <div
            ref={wrapRef}
            style={{ position: "relative", overflow: "visible" }}
        >
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
                    }}
                >
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
                backgroundColor: hover
                    ? "rgba(124, 138, 17, 0.14)"
                    : "transparent",
                cursor: "pointer",
                color: "rgba(47,47,47,0.72)",
                fontSize: 13,
                textAlign: "left",
                fontFamily:
                    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                transition:
                    "background-color 180ms cubic-bezier(0.25,0.1,0.25,1)",
            }}
        >
            {label}
        </button>
    )
}

function ArrowButton({
    side,
    onClick,
    disabled,
}: {
    side: "left" | "right"
    onClick: () => void
    disabled?: boolean
}) {
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
