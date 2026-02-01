import * as React from "react"
import { supabase } from "./AuthComponents.tsx"

type AuthGateContextType = {
    session: any
    user: any
    isAuthenticated: boolean
    authReady: boolean
    refreshKey: number
    lastClaimCount: number | null
    isClaiming: boolean
    defaultTab: "create" | "dashboard"
    showSignUpModal: boolean
    openSignUpModal: () => void
    closeSignUpModal: () => void
    userName: string | null
}

const AuthGateContext = React.createContext<AuthGateContextType | null>(null)

export function useAuthGate(): AuthGateContextType {
    const ctx = React.useContext(AuthGateContext)
    if (!ctx) {
        throw new Error("useAuthGate must be used within an AuthGateProvider")
    }
    return ctx
}

/**
 * AuthGateProvider - Single source of truth for auth state
 *
 * Responsibilities:
 * - Manages auth session via Supabase
 * - Runs claim webhook on sign-in if river_session_id exists
 * - Provides authReady flag (true when auth checked AND claim complete)
 * - Provides refreshKey to trigger dashboard remounts after claim
 * - Manages sign-up modal state
 */
export function AuthGateProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = React.useState<any>(null)
    const [authChecked, setAuthChecked] = React.useState(false)
    const [claimComplete, setClaimComplete] = React.useState(true) // true by default (no claim needed)
    const [lastClaimCount, setLastClaimCount] = React.useState<number | null>(null)
    const [refreshKey, setRefreshKey] = React.useState(0)
    const [defaultTab, setDefaultTab] = React.useState<"create" | "dashboard">("create")
    const [showSignUpModal, setShowSignUpModal] = React.useState(false)

    const claimGenerations = React.useCallback(async (currentSession: any) => {
        const anonymousSessionId = localStorage.getItem("river_session_id")
        if (!anonymousSessionId) return false

        try {
            console.log("Claiming anonymous generations via Pipedream")

            const response = await fetch("https://eork646k8728ed.m.pipedream.net", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentSession.access_token}`
                },
                body: JSON.stringify({
                    anonymous_session_id: anonymousSessionId,
                    user_id: currentSession.user.id
                })
            })

            if (!response.ok) {
                const error = await response.json()
                console.error("Claim failed:", error)
                return false
            }

            const claimResult = await response.json()
            console.log("Claimed successfully:", claimResult.claimed)

            // Update claim count if provided
            if (typeof claimResult.claimed === 'number') {
                setLastClaimCount(claimResult.claimed)
            } else if (claimResult.count) {
                setLastClaimCount(claimResult.count)
            }

            localStorage.removeItem("river_session_id")
            return true
        } catch (error) {
            console.error("Error claiming anonymous generations:", error)
            return false
        }
    }, [])

    // Track if we've already processed a sign-in to prevent duplicate claims
    const hasProcessedSignIn = React.useRef(false)

    // Initialize auth state on mount
    React.useEffect(() => {
        const initAuth = async () => {
            try {
                // Check for OAuth callback hash fragment (e.g., #access_token=...)
                const hashFragment = window.location.hash
                if (hashFragment && hashFragment.includes('access_token')) {
                    console.log('OAuth callback detected, processing...')
                    // Clear the hash from URL for cleaner UX
                    window.history.replaceState(null, '', window.location.pathname + window.location.search)
                }

                const { data: { session: initialSession }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Error getting session:', error)
                    // Still mark as checked so UI can render
                    setAuthChecked(true)
                    return
                }

                setSession(initialSession)

                // If we have a session from OAuth redirect, process sign-in
                if (initialSession?.user && !hasProcessedSignIn.current) {
                    hasProcessedSignIn.current = true
                    const anonymousSessionId = localStorage.getItem("river_session_id")

                    if (anonymousSessionId) {
                        setClaimComplete(false)
                        await claimGenerations(initialSession)
                        setClaimComplete(true)
                        setDefaultTab("dashboard")
                    } else {
                        setDefaultTab("dashboard")
                        setLastClaimCount(null)
                    }
                    setRefreshKey((prev) => prev + 1)
                }
            } catch (err) {
                console.error('Auth initialization error:', err)
            } finally {
                // Always mark auth as checked, even on error
                setAuthChecked(true)
            }
        }
        initAuth()

        // Listen for auth state changes (for email/password sign-in)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state change:', event, !!newSession)

            setSession(newSession)

            // Handle sign-in event (only if not already processed)
            if (event === 'SIGNED_IN' && newSession?.user && !hasProcessedSignIn.current) {
                hasProcessedSignIn.current = true
                const anonymousSessionId = localStorage.getItem("river_session_id")

                if (anonymousSessionId) {
                    // User had anonymous generations - run claim
                    setClaimComplete(false)
                    await claimGenerations(newSession)
                    setClaimComplete(true)
                    setDefaultTab("dashboard")
                } else {
                    // Fresh sign-in without prior anonymous usage
                    setDefaultTab("dashboard")
                    setLastClaimCount(null)
                }

                // Increment refreshKey to force dashboard remount with fresh data
                setRefreshKey((prev) => prev + 1)

                // NOTE: We do NOT close the modal here.
                // The modal tracks auth success and transitions to the success view.
            }

            // Handle sign-out event
            if (event === 'SIGNED_OUT') {
                hasProcessedSignIn.current = false
                setDefaultTab("create")
                setClaimComplete(true)
                setLastClaimCount(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [claimGenerations]) // Removed session from deps to avoid stale closure issues

    const openSignUpModal = React.useCallback(() => setShowSignUpModal(true), [])
    const closeSignUpModal = React.useCallback(() => setShowSignUpModal(false), [])

    const value: AuthGateContextType = {
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        authReady: authChecked && claimComplete,
        refreshKey,
        defaultTab,
        lastClaimCount,
        isClaiming: !claimComplete,
        showSignUpModal,
        openSignUpModal,
        closeSignUpModal,
        userName: session?.user?.user_metadata?.full_name || null,
    }

    return (
        <AuthGateContext.Provider value={value}>
            {children}
        </AuthGateContext.Provider>
    )
}
