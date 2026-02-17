import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { SignUpModal } from "./AuthComponents.tsx"
import { useAuthGate, AuthGateProvider } from "./AuthGate.tsx"

/**
 * SignUpCTA - Dual-purpose call-to-action button
 *
 * Shows different CTAs based on auth state:
 * - Logged out: "Sign Up" button → opens SignUpModal
 * - Logged in: "Dashboard" link → navigates to /dashboard
 *
 * Self-contained: wraps itself with AuthGateProvider for Framer isolation
 * Note: When used inside RiverAppRoot, the modal is centralized there.
 *       When used standalone in Framer, modal renders locally.
 */
function SignUpCTAInner({ backgroundImage }: { backgroundImage?: string }) {
    const { isAuthenticated, showSignUpModal, openSignUpModal, closeSignUpModal, isClaiming, lastClaimCount, userName } = useAuthGate()
    const [isHover, setHover] = React.useState(false)
    const [isPressed, setPressed] = React.useState(false)

    const COLORS = {
        idle: "#2F2F2F",
        hover: "#1A1A1A",
        pressed: "#404040",
    }

    let backgroundColor = COLORS.idle
    if (isPressed) backgroundColor = COLORS.pressed
    else if (isHover) backgroundColor = COLORS.hover

    const buttonStyles: React.CSSProperties = {
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
            isPressed
                ? "0px 2px 2px rgba(48, 28, 10, 0.35)"
                : "0px 1px 6px rgba(48, 28, 10, 0.4), 0px 2px 2px rgba(48, 28, 10, 0.35)",
        color: "#EFE9DA",
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.1,
        fontFamily:
            "General Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        whiteSpace: "nowrap",
        cursor: "pointer",
        userSelect: "none",
        textDecoration: "none",
        transition:
            "background-color 850ms cubic-bezier(0.25,0.1,0.25,1), box-shadow 850ms cubic-bezier(0.25,0.1,0.25,1)",
    }

    const interactionHandlers = {
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => {
            setHover(false)
            setPressed(false)
        },
        onMouseDown: () => setPressed(true),
        onMouseUp: () => setPressed(false),
    }

    // Logged in: show Dashboard link
    if (isAuthenticated) {
        return (
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <a
                    href="/dashboard"
                    style={buttonStyles}
                    {...interactionHandlers}
                >
                    <span>Dashboard</span>
                </a>
            </div>
        )
    }

    // Logged out: show Sign Up button
    return (
        <>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <button
                    onClick={openSignUpModal}
                    style={buttonStyles}
                    {...interactionHandlers}
                >
                    <span>Sign Up</span>
                </button>
            </div>

            {/* Sign Up Modal - rendered locally for Framer standalone use */}
            {showSignUpModal && (
                <SignUpModal
                    onClose={closeSignUpModal}
                    isAuthenticated={isAuthenticated}
                    isClaiming={isClaiming}
                    claimedCount={lastClaimCount}
                    userName={userName ?? undefined}
                    backgroundImage={backgroundImage}
                />
            )}
        </>
    )
}

/**
 * SignUpCTA - Exported component wrapped with AuthGateProvider
 * This makes it self-contained for Framer where components are rendered in isolation
 */
export function SignUpCTA({ backgroundImage }: { backgroundImage?: string }) {
    return (
        <AuthGateProvider>
            <SignUpCTAInner backgroundImage={backgroundImage} />
        </AuthGateProvider>
    )
}

addPropertyControls(SignUpCTA, {
    backgroundImage: {
        type: ControlType.Image,
        title: "Modal BG Image",
    },
})
