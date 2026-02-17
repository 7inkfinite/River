import * as React from "react"
import { useAuthGate } from "./AuthGate.tsx"
import { UserDashboard } from "./UserDashboard.tsx"
import { RiverProvider } from "./UseRiverGeneration.tsx"
import { RiverCTA } from "./RiverCTA.tsx"
import { RiverResultsRoot } from "./RiverResultsRoot.tsx"
import { SignUpModal } from "./AuthComponents.tsx"

/**
 * UserDashboardShell - Container for the /dashboard page
 *
 * Features:
 * - Header with Home link
 * - Create New button for navigation
 * - Uses refreshKey from AuthGate to remount UserDashboard after claim
 * - Shows sign-in prompt if not authenticated
 * - Shows loading while auth/claim is in progress
 */
export function UserDashboardShell({ backgroundImage }: { backgroundImage?: string }) {
    const {
        isAuthenticated,
        authReady,
        refreshKey,
        defaultTab,
        showSignUpModal,
        openSignUpModal,
        closeSignUpModal,
        isClaiming,
        lastClaimCount,
        user
    } = useAuthGate()


    // Show loading state while auth is being checked or claim is in progress
    if (!authReady) {
        return (
            <div
                style={{
                    width: "100%",
                    minHeight: "100vh",
                    backgroundColor: "#FAF7ED",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        color: "#7A7A7A",
                        fontSize: 18,
                        fontFamily: '"Inter", sans-serif',
                    }}
                >
                    Loading...
                </div>
            </div>
        )
    }

    // Show sign-in prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div
                style={{
                    width: "100%",
                    minHeight: "100vh",
                    backgroundColor: "#FAF7ED",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 24,
                    padding: 40,
                }}
            >
                <div
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 24,
                        fontWeight: 500,
                        color: "#2F2F2F",
                        textAlign: "center",
                    }}
                >
                    Sign in to access your dashboard
                </div>
                <div
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 16,
                        color: "#7A7A7A",
                        textAlign: "center",
                        maxWidth: 400,
                    }}
                >
                    Create an account or sign in to view your generations and create new content.
                </div>
                <button
                    onClick={openSignUpModal}
                    style={{
                        padding: "12px 24px",
                        borderRadius: 24,
                        border: "none",
                        backgroundColor: "#3C82F6",
                        color: "#EFE9DA",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: '"General Sans", sans-serif',
                        transition: "background-color 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#163D7A"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#3C82F6"
                    }}
                >
                    Sign In / Sign Up
                </button>
                <a
                    href="/"
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 14,
                        color: "#7A7A7A",
                        textDecoration: "underline",
                    }}
                >
                    Back to Home
                </a>

                {/* Sign Up Modal */}
                {showSignUpModal && <SignUpModal
                    onClose={closeSignUpModal}
                    isAuthenticated={isAuthenticated}
                    isClaiming={isClaiming}
                    claimedCount={lastClaimCount}
                    userName={user?.user_metadata?.full_name}
                    backgroundImage={backgroundImage}
                />}
            </div>
        )
    }

    // Authenticated view
    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                backgroundColor: "#FAF7ED",
                overflowY: "auto",
            }}
        >
            {/* Content */}
            <UserDashboard
                key={refreshKey}
            />
        </div>
    )
}
