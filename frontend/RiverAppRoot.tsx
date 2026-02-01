import * as React from "react"
import { AuthGateProvider, useAuthGate } from "./AuthGate.tsx"
import { RiverProvider } from "./UseRiverGeneration.tsx"
import { RiverCTA } from "./RiverCTA.tsx"
import { RiverResultsRoot } from "./RiverResultsRoot.tsx"
import { SignUpModal } from "./AuthComponents.tsx"

function RiverAppContent() {
    const { isAuthenticated, authReady, showSignUpModal, closeSignUpModal, isClaiming, lastClaimCount, userName } = useAuthGate()

    // Auto-redirect authenticated users to dashboard
    // BUT only if modal is not showing (let them see success view first)
    React.useEffect(() => {
        if (authReady && isAuthenticated && !showSignUpModal) {
            window.location.href = '/dashboard'
        }
    }, [authReady, isAuthenticated, showSignUpModal])

    // Show nothing while checking auth (prevents flash)
    // BUT always render modal if it should be shown
    if (!authReady && !showSignUpModal) {
        return null
    }

    // If authenticated and modal is NOT showing, redirect is happening - show nothing
    // If modal IS showing, we need to render it so user sees success view
    if (isAuthenticated && !showSignUpModal) {
        return null
    }

    // Render form for anonymous users, OR just modal for authenticated users viewing success
    return (
        <>
            {/* Only show form components for anonymous users */}
            {!isAuthenticated && (
                <RiverProvider>
                    <RiverCTA />
                    <RiverResultsRoot />
                </RiverProvider>
            )}

            {/* Centralized SignUpModal - always render when open */}
            {showSignUpModal && (
                <SignUpModal
                    onClose={closeSignUpModal}
                    isAuthenticated={isAuthenticated}
                    isClaiming={isClaiming}
                    claimedCount={lastClaimCount}
                    userName={userName}
                />
            )}
        </>
    )
}

export function RiverAppRoot() {
    return (
        <AuthGateProvider>
            <RiverAppContent />
        </AuthGateProvider>
    )
}
