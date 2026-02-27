// code/UseRiverGeneration.tsx
import * as React from "react"
import { supabase } from "./AuthComponents.tsx"

// TODO: Replace with your Pipedream webhook URL before using in Framer
// See secrets.md for actual URL
const WEBHOOK_URL = "YOUR_MAIN_WEBHOOK_URL_HERE"

// Generate or retrieve anonymous session ID for tracking generations before login
const getOrCreateSessionId = (): string => {
    if (typeof window === "undefined") return ""

    let sessionId = localStorage.getItem("river_session_id")
    if (!sessionId) {
        sessionId = crypto.randomUUID()
        localStorage.setItem("river_session_id", sessionId)
    }
    return sessionId
}

// Get current authenticated user's ID (null if anonymous)
const getUserId = async (): Promise<string | null> => {
    if (typeof window === "undefined") return null

    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
}

// Basic YouTube URL validator (handles youtube.com / youtu.be / shorts)
export const isYouTubeUrl = (url: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+|youtube\.com\/shorts\/[\w-]+)/i.test(
        url.trim()
    )

export type RiverStatus = "idle" | "loading" | "success" | "error"
export type RiverResult = any

// ✅ Optional: constrain platform names you actually support
export type RiverPlatform = "twitter" | "linkedin" | "carousel"

// ✅ NEW: extra options payload (for targeting one platform on tweak/regen)
export type RiverExtraOptions = {
    target_platform?: RiverPlatform
    // future knobs can live here (e.g. slide_count, hook_strength, etc.)
    [key: string]: any
}

export type RiverInputs = {
    youtube_url: string
    tone?: string
    platforms: string[] // keep flexible since your validate_input normalizes anyway
    force_regen?: boolean
    tweak_instructions?: string | null

    // ✅ NEW
    extra_options?: RiverExtraOptions | null
}

type Action = "generate" | "tweak"

type RiverState = {
    status: RiverStatus
    error: string | null
    result: RiverResult | null
    fromCache: boolean
    lastInputs: RiverInputs | null
    lastAction?: Action
    generationId: string | null
}

type RiverAPI = {
    state: RiverState
    generate: (inputs: RiverInputs) => Promise<RiverResult | null>

    // ✅ UPDATED: regenerate now supports extra_options
    regenerate: (opts: {
        tweak_instructions?: string | null
        force_regen?: boolean
        extra_options?: RiverExtraOptions | null
    }) => Promise<RiverResult | null>

    resetError: () => void
    clearResult: () => void
    setError: (message: string, action?: Action) => void
    reset: () => void
    generationId: string | null
}

// ------------------------------------------------------------
// Single shared store via Context (so multiple components sync)
// ------------------------------------------------------------
const RiverContext = React.createContext<RiverAPI | null>(null)

export function RiverProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = React.useState<RiverState>({
        status: "idle",
        error: null,
        result: null,
        fromCache: false,
        lastInputs: null,
        lastAction: undefined,
        generationId: null,
    })

    const resetError = React.useCallback(() => {
        setState((s) => ({
            ...s,
            error: null,
            status: s.status === "error" ? "idle" : s.status,
        }))
    }, [])

    const clearResult = React.useCallback(() => {
        setState((s) => ({
            ...s,
            result: null,
            fromCache: false,
            // keep lastInputs so tweak can still work
        }))
    }, [])

    const setError = React.useCallback((message: string, action?: Action) => {
        setState((s) => ({
            ...s,
            status: "error",
            error: message,
            lastAction: action ?? s.lastAction,
        }))
    }, [])

    const reset = React.useCallback(() => {
        setState({
            status: "idle",
            error: null,
            result: null,
            fromCache: false,
            lastInputs: null,
            lastAction: undefined,
            generationId: null,
        })
    }, [])

    // ✅ Single internal request function that preserves action ownership
    const request = React.useCallback(
        async (inputs: RiverInputs, action: Action) => {
            setState((s) => ({
                ...s,
                status: "loading",
                error: null,
                lastInputs: inputs,
                lastAction: action,
                // IMPORTANT: keep existing result while loading
                // so results don't vanish during regen
            }))

            try {
                // Include session_id for anonymous tracking AND user_id for auth users
                const payload = {
                    ...inputs,
                    session_id: getOrCreateSessionId(),
                    user_id: await getUserId(),
                }

                const res = await fetch(WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain" },
                    body: JSON.stringify(payload),
                })

                const text = await res.text().catch(() => "")

                if (!res.ok) {
                    let friendly = `Something broke on the server (status ${res.status}).`

                    if (
                        text.includes("insufficient_quota") ||
                        text.includes("billing_hard_limit")
                    ) {
                        friendly =
                            "We couldn't generate new content because the OpenAI credits are exhausted. Try again later."
                    }

                    throw new Error(friendly)
                }

                const parsed = text ? JSON.parse(text) : null
                const body = parsed?.body ?? parsed
                const fromCache = !!(parsed?.fromCache ?? body?.fromCache)
                const generationId = body?.generation?.id || null

                setState((s) => ({
                    ...s,
                    status: "success",
                    result: body,
                    fromCache,
                    error: null,
                    lastAction: action, // ✅ keep ownership stable
                    generationId,
                }))

                return body
            } catch (err: any) {
                const message =
                    err?.message ?? "Unknown error while generating content."
                console.error("River request failed:", err)

                setState((s) => ({
                    ...s,
                    status: "error",
                    error: message,
                    lastAction: action, // ✅ keep ownership stable
                }))

                return null
            }
        },
        []
    )

    const generate = React.useCallback(
        async (inputs: RiverInputs) => {
            return request(inputs, "generate")
        },
        [request]
    )

    const regenerate = React.useCallback(
        async ({
            tweak_instructions = null,
            force_regen = true,
            extra_options = null,
        }: {
            tweak_instructions?: string | null
            force_regen?: boolean
            extra_options?: RiverExtraOptions | null
        }) => {
            const base = state.lastInputs
            if (!base) {
                setError(
                    "Nothing to regenerate yet. Run a generation first, then tweak it.",
                    "tweak"
                )
                return null
            }

            const merged: RiverInputs = {
                ...base,

                // tweak-specific overrides
                force_regen,
                tweak_instructions,

                // ✅ Pass through to pipedream (for targeting carousel/twitter/etc.)
                // Include generation_id for more reliable updates
                extra_options: {
                    ...extra_options,
                    generation_id: state.generationId,
                },
            }

            return request(merged, "tweak")
        },
        [state.lastInputs, state.generationId, request, setError]
    )

    const api: RiverAPI = React.useMemo(
        () => ({
            state,
            generate,
            regenerate,
            resetError,
            clearResult,
            setError,
            reset,
            generationId: state.generationId,
        }),
        [state, generate, regenerate, resetError, clearResult, setError, reset]
    )

    return <RiverContext.Provider value={api}>{children}</RiverContext.Provider>
}

// Use inside any component that needs generation state
export function UseRiverGeneration(): RiverAPI {
    const ctx = React.useContext(RiverContext)
    if (!ctx) {
        throw new Error(
            "useRiverGeneration must be used within <RiverProvider>."
        )
    }
    return ctx
}
