import * as React from "react"
import {
    UseRiverGeneration,
    isYouTubeUrl,
    RiverStatus,
} from "./UseRiverGeneration.tsx"

const toFriendlyError = (err: unknown) => {
    const msg = String(err ?? "").toLowerCase()
    if (
        msg.includes("status 400") ||
        msg.includes("status 401") ||
        msg.includes("status 403") ||
        msg.includes("status 404") ||
        msg.includes("status 429") ||
        msg.includes("status 500") ||
        msg.includes("something broke on the server") ||
        msg.includes("server") ||
        msg.includes("internal error") ||
        msg.includes("unauthorized") ||
        msg.includes("forbidden") ||
        msg.includes("bad request")
    ) {
        return "Oh no! There seems to be a problem. Try again."
    }
    const cleaned = String(err ?? "").trim()
    return cleaned || "Oh no! There seems to be a problem. Try again."
}

export function RiverCTA({ allowResubmit = true }: { allowResubmit?: boolean }) {
    const { state, generate, resetError } = UseRiverGeneration()

    // ✅ Gate global state by action so main CTA only reacts to "generate"
    const isMine = state.lastAction === "generate"
    const status: RiverStatus = isMine ? state.status : "idle"
    const fromCache = isMine ? state.fromCache : false
    const error = isMine ? state.error : null

    // ✅ Detect tweak in progress (global store)
    const isTweakLoading =
        state.lastAction === "tweak" && state.status === "loading"

    // -----------------------------
    // Local-only form validation UI
    // -----------------------------
    const [formError, setFormError] = React.useState<string | null>(null)

    const [shakeTick, setShakeTick] = React.useState(0)
    const triggerFormError = (msg: string) => {
        setFormError(msg)
        setShakeTick((t) => t + 1)
    }

    // Clear local form error when pipeline starts (or succeeds)
    React.useEffect(() => {
        if (status === "loading" || status === "success") {
            setFormError(null)
        }
    }, [status])

    React.useEffect(() => {
        if (!formError) return
        const id = window.setTimeout(() => setFormError(null), 4000)
        return () => window.clearTimeout(id)
    }, [formError])

    // -----------------------------
    // Loading animation phase (ONLY for main generate loading)
    // -----------------------------
    const [loadingPhase, setLoadingPhase] = React.useState<0 | 1>(0)

    React.useEffect(() => {
        // ✅ If tweak is loading, keep this CTA calm/static
        if (isTweakLoading) {
            setLoadingPhase(0)
            return
        }

        if (status !== "loading") {
            setLoadingPhase(0)
            return
        }

        const id = window.setInterval(() => {
            setLoadingPhase((p) => (p === 0 ? 1 : 0))
        }, 1600)

        return () => window.clearInterval(id)
    }, [status, isTweakLoading])

    // Auto-return to idle feel after success/error (pipeline channel only)
    React.useEffect(() => {
        if (status !== "success" && status !== "error") return
        const id = window.setTimeout(() => {
            resetError()
        }, 4000)
        return () => window.clearTimeout(id)
    }, [status, resetError])

    // Check if we have results (for /form page lock behavior)
    // Must be defined before label calculation
    const hasResults = state.result !== null
    const resultsLock = !allowResubmit && hasResults && status !== "loading"

    // -----------------------------
    // Label priority (IMPORTANT)
    // -----------------------------
    const label = (() => {
        // ✅ Results lock message (when form is disabled due to results)
        if (resultsLock) {
            return "Results generated"
        }

        // ✅ Calm message during tweak loading
        if (isTweakLoading) {
            return "Take a deep breath and sit back"
        }

        if (formError) return formError

        if (status === "loading") {
            return loadingPhase === 0 ? "Flowing…" : "Drifting around…"
        }

        if (status === "error") {
            return toFriendlyError(error)
        }

        if (status === "success") {
            return fromCache ? "Easy! There you go!" : "There you go!"
        }

        return "Let it flow"
    })()

    // -----------------------------
    // Colors
    // -----------------------------
    const COLORS = {
        idle: "#3C82F6",
        hover: "#163D7A",
        pressed: "#38A8C9",
        error: "#8A112D",
        formError: "#C2410C",
        success: "#117e8a",
        loading: "#3C82F6",

        // ✅ calm tweak state color
        tweakCalm: "#ADDADE",

        // ✅ muted gray for results lock
        resultsLock: "#9CA3AF",
    }

    const [isHover, setHover] = React.useState(false)
    const [isPressed, setPressed] = React.useState(false)

    const isLoading = status === "loading"
    const isPipelineError = status === "error"
    const isSuccess = status === "success"
    const isFormError = Boolean(formError)

    // ✅ disable if either generate is loading OR tweak is loading OR results lock active
    const isDisabled = isLoading || isTweakLoading || resultsLock

    let backgroundColor = COLORS.idle

    // ✅ Results lock takes precedence when active
    if (resultsLock) backgroundColor = COLORS.resultsLock
    // ✅ Tweak calm overrides everything visual-wise
    else if (isTweakLoading) backgroundColor = COLORS.tweakCalm
    else if (isLoading) backgroundColor = COLORS.loading
    else if (isFormError) backgroundColor = COLORS.formError
    else if (isPipelineError) backgroundColor = COLORS.error
    else if (isSuccess) backgroundColor = COLORS.success
    else {
        if (isPressed) backgroundColor = COLORS.pressed
        else if (isHover) backgroundColor = COLORS.hover
    }

    const handleClick = async () => {
        if (isDisabled) return
        setFormError(null)

        const form = document.querySelector("form")
        if (!form) {
            triggerFormError("Form not found on the page")
            return
        }

        const formData = new FormData(form as HTMLFormElement)

        const youtubeUrl = String(formData.get("youtube_url") ?? "").trim()
        if (!youtubeUrl) {
            triggerFormError("Drop a YouTube link")
            return
        }
        if (!isYouTubeUrl(youtubeUrl)) {
            triggerFormError("That doesn’t look like a valid YouTube link")
            return
        }

        const platforms = formData
            .getAll("platforms")
            .map(String)
            .filter(Boolean)

        if (!platforms.length) {
            triggerFormError("Pick at least one platform")
            return
        }

        const toneBase = String(formData.get("tone_base") ?? "").trim()
        const toneExtra = String(formData.get("tone_extra") ?? "").trim()
        let tone = toneBase
        if (toneExtra) {
            tone = tone
                ? `${tone}. Extra user instructions: ${toneExtra}`
                : toneExtra
        }

        await generate({
            youtube_url: youtubeUrl,
            tone: tone || undefined,
            platforms,
            force_regen: false,
        })
    }

    const shouldShake = Boolean(formError)

    return (
        <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
            <button
                key={shouldShake ? `shake-${shakeTick}` : "stable"}
                onClick={handleClick}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => {
                    setHover(false)
                    setPressed(false)
                }}
                onMouseDown={() => setPressed(true)}
                onMouseUp={() => setPressed(false)}
                disabled={isDisabled}
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
                        !isDisabled && isPressed
                            ? "0px 2px 2px rgba(48, 28, 10, 0.35)"
                            : "0px 1px 6px rgba(48, 28, 10, 0.4), 0px 2px 2px rgba(48, 28, 10, 0.35)",
                    color: "#EFE9DA",
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.1,
                    fontFamily:
                        "General Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    whiteSpace: "nowrap",
                    cursor: isDisabled ? "default" : "pointer",
                    userSelect: "none",
                    opacity: isDisabled ? 0.95 : 1,
                    transition:
                        "background-color 850ms cubic-bezier(0.25,0.1,0.25,1), box-shadow 850ms cubic-bezier(0.25,0.1,0.25,1), transform 380ms ease-in-out",
                    animation: shouldShake
                        ? "river-shake 380ms ease-in-out"
                        : "none",
                }}
            >
                {/* ✅ NO spinner during tweak loading (mini CTA handles motion) */}
                {isLoading && !isTweakLoading && (
                    <span
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: "999px",
                            border: "2px solid #EFE9DA",
                            borderTopColor: "transparent",
                            display: "inline-block",
                            animation: "river-spin 1.2s linear infinite",
                        }}
                    />
                )}

                <span>{label}</span>

                <style>
                    {`
                    @keyframes river-spin {
                        from { transform: rotate(0deg); }
                        to   { transform: rotate(360deg); }
                    }

                    @keyframes river-shake {
                        0%   { transform: translateX(0); }
                        15%  { transform: translateX(-6px); }
                        30%  { transform: translateX(6px); }
                        45%  { transform: translateX(-5px); }
                        60%  { transform: translateX(5px); }
                        75%  { transform: translateX(-3px); }
                        90%  { transform: translateX(3px); }
                        100% { transform: translateX(0); }
                    }
                `}
                </style>
            </button>
        </div>
    )
}
