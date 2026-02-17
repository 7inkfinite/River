import * as React from "react"
import { AuthGateProvider, useAuthGate } from "./AuthGate.tsx"
import { RiverProvider } from "./UseRiverGeneration.tsx"
import { RiverCTA } from "./RiverCTA.tsx"
import { RiverResultsRoot } from "./RiverResultsRoot.tsx"
import { SignUpModal } from "./AuthComponents.tsx"

function RiverAppContent({ backgroundImage }: { backgroundImage?: string }) {
    const { isAuthenticated, authReady, showSignUpModal, closeSignUpModal, isClaiming, lastClaimCount, userName } = useAuthGate()
    const isFormPage = typeof window !== "undefined" && window.location.pathname === "/form"

    // Auto-redirect authenticated users to dashboard
    // BUT only if modal is not showing (let them see success view first)
    // AND not on /form page (user intentionally navigated there via "New" button)
    React.useEffect(() => {
        if (authReady && isAuthenticated && !showSignUpModal && !isFormPage) {
            window.location.href = '/dashboard'
        }
    }, [authReady, isAuthenticated, showSignUpModal, isFormPage])

    // Show nothing while checking auth (prevents flash)
    // BUT always render modal if it should be shown
    if (!authReady && !showSignUpModal) {
        return null
    }

    // If authenticated and modal is NOT showing, redirect is happening - show nothing
    // Skip on /form page — authenticated users can create new generations
    if (isAuthenticated && !showSignUpModal && !isFormPage) {
        return null
    }

    // Render form for anonymous users, or authenticated users on /form
    return (
        <>
            {(!isAuthenticated || isFormPage) && (
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
                    backgroundImage={backgroundImage}
                />
            )}
        </>
    )
}

export function RiverAppRoot({ backgroundImage }: { backgroundImage?: string }) {
    return (
        <AuthGateProvider>
            <RiverAppContent backgroundImage={backgroundImage} />
        </AuthGateProvider>
    )
}
