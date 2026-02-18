import * as React from "react"
import * as ReactDOM from "react-dom"
import { createClient } from "@supabase/supabase-js"

// TODO: Replace with your Supabase credentials before using in Framer
// See secrets.md for actual values
const supabaseUrl = "YOUR_SUPABASE_URL_HERE"
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY_HERE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * NOTE: Claim logic has been moved to Pipedream webhook
 * The global auth state listener in RiverResultsRoot.tsx now calls
 * the Pipedream claim endpoint when user authenticates.
 * This ensures claims work with service role key (bypassing RLS).
 */

/**
 * AuthPrompt - Component that shows after results are generated
 * Prompts users to sign up to save their generations
 */
export function AuthPrompt({ onSignUpClick }: { onSignUpClick: () => void }) {
    const [hover, setHover] = React.useState(false)
    const [pressed, setPressed] = React.useState(false)

    const backgroundColor = pressed ? "#1F1F1F" : hover ? "#252525" : "#2F2F2F"

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
                marginTop: 40,
                padding: "40px 20px",
            }}
        >
            {/* Text */}
            <div
                style={{
                    width: "auto",
                    height: "auto",
                    whiteSpace: "pre",
                    fontWeight: 500,
                    fontStyle: "normal",
                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                    color: "#4f440d",
                    fontSize: 26,
                    letterSpacing: "0em",
                    textAlign: "center",
                    lineHeight: 1.2,
                }}
            >
                Save your posts with us. Come back and work on them later.
            </div>

            {/* CTA Button */}
            <button
                onClick={onSignUpClick}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => {
                    setHover(false)
                    setPressed(false)
                }}
                onMouseDown={() => setPressed(true)}
                onMouseUp={() => setPressed(false)}
                style={{
                    boxSizing: "border-box",
                    width: "min-content",
                    height: 40,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "16px 24px",
                    boxShadow:
                        "0px 1px 6px 0px rgba(48, 28, 10, 0.4), 0px 2px 2px 0px rgba(48, 28, 10, 0.35)",
                    backgroundColor,
                    overflow: "visible",
                    alignContent: "center",
                    flexWrap: "nowrap",
                    gap: 8,
                    borderRadius: 24,
                    border: "none",
                    cursor: "pointer",
                    color: "#EFE9DA",
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.1,
                    fontFamily:
                        "General Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                    transition:
                        "background-color 300ms cubic-bezier(0.25,0.1,0.25,1)",
                }}
            >
                Sign Up
            </button>
        </div>
    )
}

/**
 * SuccessView - Celebration view after successful authentication
 * Shows checkmark animation and auto-redirects to dashboard
 */
function SuccessView({
    userName,
    claimedCount,
    onClose
}: {
    userName?: string | null
    claimedCount?: number | null
    onClose: () => void
}) {
    const [countdown, setCountdown] = React.useState(3)
    const [isAnimating, setIsAnimating] = React.useState(true)

    // Auto-redirect countdown
    React.useEffect(() => {
        if (countdown <= 0) {
            window.location.href = "/dashboard"
            return
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [countdown])

    // Trigger animation end
    React.useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(false), 600)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            textAlign: "center"
        }}>
            {/* Success Icon with animation */}
            <div style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                backgroundColor: "rgba(34, 197, 94, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
                animation: isAnimating ? "successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "none",
                boxShadow: "0 0 0 8px rgba(34, 197, 94, 0.06)"
            }}>
                <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#15803D"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        animation: isAnimating ? "checkDraw 0.4s ease-out 0.2s both" : "none"
                    }}
                >
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                    fontSize: 26,
                    fontWeight: 600,
                    color: "#2F2F2F",
                    animation: isAnimating ? "fadeSlideUp 0.4s ease-out 0.3s both" : "none"
                }}>
                    Welcome to River{userName ? `, ${userName.split(' ')[0]}` : ''}!
                </div>

                <div style={{
                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                    fontSize: 16,
                    color: "#4F4F4F",
                    lineHeight: 1.5,
                    maxWidth: 300,
                    animation: isAnimating ? "fadeSlideUp 0.4s ease-out 0.4s both" : "none"
                }}>
                    {claimedCount && claimedCount > 0
                        ? `Your ${claimedCount} previous generation${claimedCount > 1 ? 's are' : ' is'} now saved to your account.`
                        : "You're all set! Start creating content."
                    }
                </div>
            </div>

            <button
                onClick={() => {
                    window.location.href = "/dashboard"
                    onClose()
                }}
                style={{
                    width: "100%",
                    padding: "16px 24px",
                    backgroundColor: "#3C82F6",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                    cursor: "pointer",
                    marginTop: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background-color 200ms ease",
                    animation: isAnimating ? "fadeSlideUp 0.4s ease-out 0.5s both" : "none"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2563EB"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3C82F6"}
            >
                <span>Open My Dashboard</span>
                <span style={{
                    opacity: 0.8,
                    fontSize: 14,
                    fontWeight: 500
                }}>
                    ({countdown}s)
                </span>
            </button>

            <style>
                {`
                    @keyframes successPop {
                        0% { transform: scale(0); opacity: 0; }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes checkDraw {
                        0% { stroke-dasharray: 100; stroke-dashoffset: 100; opacity: 0; }
                        100% { stroke-dasharray: 100; stroke-dashoffset: 0; opacity: 1; }
                    }
                    @keyframes fadeSlideUp {
                        0% { transform: translateY(10px); opacity: 0; }
                        100% { transform: translateY(0); opacity: 1; }
                    }
                `}
            </style>
        </div>
    )
}

/**
 * SignUpModal - Modal overlay with sign up/sign in form
 * Shows when user clicks Sign Up button
 *
 * Design: Warm, organic aesthetic with creamy beige background
 * and decorative topographic pattern
 */
export function SignUpModal({
    onClose,
    isAuthenticated,
    claimedCount,
    isClaiming,
    userName,
    backgroundImage,
}: {
    onClose: () => void
    isAuthenticated?: boolean
    claimedCount?: number | null
    isClaiming?: boolean
    userName?: string | null
    backgroundImage?: string
}) {
    const [mode, setMode] = React.useState<"signup" | "signin">("signup")
    const hasInteracted = React.useRef(false)
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [name, setName] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState<string | null>(null)
    // Form validation state
    const [emailError, setEmailError] = React.useState<string | null>(null)
    const [passwordError, setPasswordError] = React.useState<string | null>(
        null
    )
    const [nameError, setNameError] = React.useState<string | null>(null)

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) {
            setEmailError("Email is required")
            return false
        }
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address")
            return false
        }
        setEmailError(null)
        return true
    }

    const validatePassword = (password: string): boolean => {
        if (!password) {
            setPasswordError("Password is required")
            return false
        }
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters")
            return false
        }
        setPasswordError(null)
        return true
    }

    const validateName = (name: string): boolean => {
        if (!name && mode === "signup") {
            setNameError("Name is required")
            return false
        }
        setNameError(null)
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        // Validate fields
        const isEmailValid = validateEmail(email)
        const isPasswordValid = validatePassword(password)
        const isNameValid = validateName(name)

        if (!isEmailValid || !isPasswordValid || !isNameValid) {
            return
        }

        setLoading(true)

        try {
            if (mode === "signup") {
                // Sign up with Supabase
                const { data, error: signUpError } = await supabase.auth.signUp(
                    {
                        email: email.trim(),
                        password,
                        options: {
                            data: {
                                full_name: name.trim(),
                            },
                        },
                    }
                )

                if (signUpError) throw signUpError

                if (data?.user) {
                    // Claim happens automatically via RiverResultsRoot auth listener
                    setSuccess(
                        "Account created! Please check your email to verify your account."
                    )
                    // Don't auto-close - let user close manually
                }
            } else {
                // Sign in with Supabase
                const { data, error: signInError } =
                    await supabase.auth.signInWithPassword({
                        email: email.trim(),
                        password,
                    })

                if (signInError) throw signInError

                if (data?.user) {
                    // Claim happens automatically via RiverResultsRoot auth listener
                    setSuccess("Signed in successfully!")
                    // Don't auto-close - let user close manually
                }
            }
        } catch (err: any) {
            console.error("Auth error:", err)
            setError(err.message || "An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError(null)
        setLoading(true)

        try {
            const { data, error: googleError } =
                await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: window.location.origin,
                    },
                })

            if (googleError) throw googleError
        } catch (err: any) {
            console.error("Google sign in error:", err)
            setError(err.message || "Failed to sign in with Google")
            setLoading(false)
        }
    }

    // Close on escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleEscape)
        return () => window.removeEventListener("keydown", handleEscape)
    }, [onClose])

    // Lock scroll on background page elements when modal is open
    // Preserves scroll position and excludes the modal itself
    const modalRef = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        const locked: { el: HTMLElement; prev: string; scrollTop: number }[] = []
        const modalEl = modalRef.current
        const allElements = document.querySelectorAll("*")
        allElements.forEach((el) => {
            if (!(el instanceof HTMLElement)) return
            // Skip the modal and anything inside it — modal needs to scroll
            if (modalEl && (el === modalEl || modalEl.contains(el))) return
            const style = window.getComputedStyle(el)
            const ov = style.overflowY
            if (ov === "auto" || ov === "scroll") {
                locked.push({ el, prev: el.style.overflowY, scrollTop: el.scrollTop })
                el.style.overflowY = "hidden"
            }
        })
        const bodyPrev = document.body.style.overflow
        const htmlPrev = document.documentElement.style.overflow
        const bodyScrollTop = document.documentElement.scrollTop || document.body.scrollTop
        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"
        return () => {
            locked.forEach(({ el, prev, scrollTop }) => {
                el.style.overflowY = prev
                el.scrollTop = scrollTop
            })
            document.body.style.overflow = bodyPrev
            document.documentElement.style.overflow = htmlPrev
            document.documentElement.scrollTop = bodyScrollTop
            document.body.scrollTop = bodyScrollTop
        }
    }, [])

    // Close on background click — use data attribute for reliable detection
    const handleBackgroundClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).hasAttribute?.("data-modal-overlay")) onClose()
    }

    // Reset errors when switching modes
    React.useEffect(() => {
        setError(null)
        setSuccess(null)
        setEmailError(null)
        setPasswordError(null)
        setNameError(null)
    }, [mode])

    // Design tokens matching Figma
    const colors = {
        background: "#FAF8F0",      // Creamy beige
        toggleBg: "#F5F0DE",        // Warmer beige for toggle container
        title: "#4A240D",           // Warm brown
        labelText: "#6E6E6E",       // Gray for labels
        inactiveTab: "#BAAB6B",     // Muted gold
        activeTab: "#000000",       // Black for active tab text
        buttonBg: "#3A3A3A",        // Dark gray
        inputBorder: "#C7C7C7",     // Light gray border
        white: "#FFFFFF",
        river: "3C82F6",
        }

    return ReactDOM.createPortal(
        <div
            data-modal-overlay=""
            onClick={handleBackgroundClick}
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                padding: "20px",
                animation: "river-backdrop-in 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
        >
            {/* Modal Container */}
            <div
                className="river-modal"
                ref={modalRef}
                style={{
                    boxSizing: "border-box",
                    width: "100%",
                    maxWidth: 520,
                    height: "80vh",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    padding: "48px 40px 40px",
                    backgroundColor: colors.background,
                    gap: 32,
                    borderRadius: 24,
                    position: "relative",
                    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.25)",
                    animation: "river-surface 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
                }}
            >

                <style>{`
                    /* Backdrop: ripple-fade in */
                    @keyframes river-backdrop-in {
                        0% {
                            opacity: 0;
                            backdrop-filter: blur(0px);
                            -webkit-backdrop-filter: blur(0px);
                        }
                        100% {
                            opacity: 1;
                            backdrop-filter: blur(4px);
                            -webkit-backdrop-filter: blur(4px);
                        }
                    }

                    /* Modal: rise from beneath the surface */
                    @keyframes river-surface {
                        0% {
                            opacity: 0;
                            transform: translateY(60px) scale(0.96);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    /* Cascade: content elements ripple in from below */
                    @keyframes river-cascade {
                        0% {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .river-modal {
                        padding: 48px 40px 40px !important;
                    }
                    @media (max-width: 480px) {
                        .river-modal {
                            padding: 32px 20px 28px !important;
                            gap: 24px !important;
                            border-radius: 20px !important;
                            height: 80vh !important;
                        }
                    }
                `}</style>

                {/* Decorative Background Image — clipping wrapper prevents scroll expansion */}
                {backgroundImage && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            overflow: "hidden",
                            pointerEvents: "none",
                            zIndex: 0,
                            borderRadius: "inherit",
                        }}
                    >
                        <img
                            src={backgroundImage}
                            alt=""
                            style={{
                                position: "absolute",
                                bottom: "-30%",
                                right: "-70%",
                                width: "220%",
                                height: "auto",
                                transform: "rotate(37deg)",
                                transformOrigin: "center center",
                                opacity: 0.25,
                            }}
                        />
                    </div>
                )}

                {/* Close Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onClose()
                    }}
                    style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        background: "none",
                        border: "none",
                        padding: 8,
                        cursor: "pointer",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.6,
                        transition: "opacity 150ms ease, transform 150ms ease",
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.opacity = "1"
                        e.currentTarget.style.transform = "scale(1.05)"
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.opacity = "0.6"
                        e.currentTarget.style.transform = "scale(1)"
                    }}
                >
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={colors.title}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ pointerEvents: "none" }}
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </button>

                {/* SUCCESS VIEW - shown when authenticated and done claiming */}
                {isAuthenticated && !isClaiming ? (
                    <SuccessView
                        userName={userName}
                        claimedCount={claimedCount}
                        onClose={onClose}
                    />
                ) : isClaiming ? (
                    <div style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 24,
                        padding: "40px 0",
                        position: "relative",
                        zIndex: 1,
                    }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            border: `3px solid ${colors.toggleBg}`,
                            borderTopColor: colors.title,
                            animation: "spin 1s linear infinite"
                        }} />
                        <div style={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 16,
                            color: colors.labelText,
                            fontWeight: 500
                        }}>
                            Setting up your dashboard...
                        </div>
                        <style>
                            {`
                                @keyframes spin {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                            `}
                        </style>
                    </div>
                ) : (
                    <>
                        {/* Title - "Join River" */}
                        <div
                            style={{
                                fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                fontSize: "clamp(28px, 6vw, 36px)",
                                fontWeight: 400,
                                color: colors.river,
                                textAlign: "center",
                                position: "relative",
                                zIndex: 1,
                                animation: "river-cascade 500ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both",
                            }}
                        >
                            Join River
                        </div>

                        {/* Sign In / Sign Up Toggle - Liquid flow animation */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                alignItems: "center",
                                backgroundColor: colors.toggleBg,
                                borderRadius: 12,
                                padding: 4,
                                position: "relative",
                                zIndex: 1,
                                width: "fit-content",
                                animation: "river-cascade 500ms cubic-bezier(0.16, 1, 0.3, 1) 320ms both",
                            }}
                        >
                            {/* Liquid sliding indicator */}
                            <div
                                className="river-liquid-pill"
                                style={{
                                    position: "absolute",
                                    top: 4,
                                    bottom: 4,
                                    left: 4,
                                    width: "calc(50% - 4px)",
                                    borderRadius: 10,
                                    backgroundColor: colors.background,
                                    boxShadow: "0px 2px 12px 0px rgba(84, 60, 31, 0.22), 0px 0px 1px 0px rgba(84, 60, 31, 0.15)",
                                    transform: mode === "signup"
                                        ? "translateX(100%) scaleX(1) scaleY(1)"
                                        : "translateX(0%) scaleX(1) scaleY(1)",
                                    transition: hasInteracted.current
                                        ? "transform 550ms cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 550ms cubic-bezier(0.34, 1.2, 0.64, 1)"
                                        : "none",
                                    willChange: "transform",
                                    zIndex: 0,
                                }}
                            />
                            <button
                                type="button"
                                onPointerDown={(e) => {
                                    e.preventDefault()
                                    hasInteracted.current = true
                                    setMode("signin")
                                }}
                                style={{
                                    position: "relative",
                                    zIndex: 1,
                                    background: "transparent",
                                    border: "none",
                                    padding: "8px 22px",
                                    cursor: "pointer",
                                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                    fontSize: 14,
                                    fontWeight: mode === "signin" ? 500 : 400,
                                    color: mode === "signin" ? colors.activeTab : colors.inactiveTab,
                                    borderRadius: 10,
                                    transition: "color 350ms cubic-bezier(0.16, 1, 0.36, 1), font-weight 350ms cubic-bezier(0.16, 1, 0.36, 1)",
                                    userSelect: "none",
                                }}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onPointerDown={(e) => {
                                    e.preventDefault()
                                    hasInteracted.current = true
                                    setMode("signup")
                                }}
                                style={{
                                    position: "relative",
                                    zIndex: 1,
                                    background: "transparent",
                                    border: "none",
                                    padding: "8px 22px",
                                    cursor: "pointer",
                                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                    fontSize: 14,
                                    fontWeight: mode === "signup" ? 500 : 400,
                                    color: mode === "signup" ? colors.activeTab : colors.inactiveTab,
                                    borderRadius: 10,
                                    transition: "color 350ms cubic-bezier(0.16, 1, 0.36, 1), font-weight 350ms cubic-bezier(0.16, 1, 0.36, 1)",
                                    userSelect: "none",
                                }}
                            >
                                Sign Up
                            </button>

                            {/* Animation handled via CSS transition on the indicator */}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    backgroundColor: "rgba(220, 38, 38, 0.08)",
                                    borderRadius: 12,
                                    color: "#B91C1C",
                                    fontSize: 14,
                                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                    textAlign: "center",
                                    position: "relative",
                                    zIndex: 1,
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    backgroundColor: "rgba(34, 197, 94, 0.08)",
                                    borderRadius: 12,
                                    color: "#15803D",
                                    fontSize: 14,
                                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                    textAlign: "center",
                                    position: "relative",
                                    zIndex: 1,
                                }}
                            >
                                {success}
                            </div>
                        )}

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                gap: 20,
                                position: "relative",
                                zIndex: 1,
                                animation: "river-cascade 500ms cubic-bezier(0.16, 1, 0.3, 1) 440ms both",
                            }}
                        >
                            {/* Name Field - always rendered, collapses in sign-in mode */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                        overflow: "hidden",
                                        maxHeight: mode === "signup" ? 90 : 0,
                                        opacity: mode === "signup" ? 1 : 0,
                                        marginBottom: mode === "signup" ? 0 : -20,
                                        transition: "max-height 450ms cubic-bezier(0.16, 1, 0.36, 1), opacity 300ms cubic-bezier(0.16, 1, 0.36, 1), margin-bottom 450ms cubic-bezier(0.16, 1, 0.36, 1)",
                                    }}
                                >
                                    <label
                                        style={{
                                            fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                            fontSize: 16,
                                            fontWeight: 400,
                                            color: colors.labelText,
                                        }}
                                    >
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setName(e.target.value)
                                            if (nameError) validateName(e.target.value)
                                        }}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => validateName(e.target.value)}
                                        placeholder=""
                                        disabled={loading}
                                        style={{
                                            width: "100%",
                                            padding: "16px 18px",
                                            borderRadius: 12,
                                            border: nameError
                                                ? "1px solid #EF4444"
                                                : `1px solid ${colors.inputBorder}`,
                                            backgroundColor: colors.white,
                                            fontSize: 16,
                                            fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                            color: colors.activeTab,
                                            outline: "none",
                                            boxSizing: "border-box",
                                            opacity: loading ? 0.6 : 1,
                                            transition: "border-color 200ms ease, box-shadow 200ms ease",
                                        }}
                                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                            if (!nameError) {
                                                e.currentTarget.style.borderColor = colors.title
                                                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(74, 36, 13, 0.1)`
                                            }
                                        }}
                                        onBlurCapture={(e: React.FocusEvent<HTMLInputElement>) => {
                                            if (!nameError) {
                                                e.currentTarget.style.borderColor = colors.inputBorder
                                                e.currentTarget.style.boxShadow = 'none'
                                            }
                                        }}
                                    />
                                    {nameError && (
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#EF4444",
                                                fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                            }}
                                        >
                                            {nameError}
                                        </div>
                                    )}
                                </div>

                            {/* Email Field */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                <label
                                    style={{
                                        fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                        fontSize: 16,
                                        fontWeight: 400,
                                        color: colors.labelText,
                                    }}
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setEmail(e.target.value)
                                        if (emailError) validateEmail(e.target.value)
                                    }}
                                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => validateEmail(e.target.value)}
                                    placeholder=""
                                    disabled={loading}
                                    style={{
                                        width: "100%",
                                        padding: "16px 18px",
                                        borderRadius: 12,
                                        border: emailError
                                            ? "1px solid #EF4444"
                                            : `1px solid ${colors.inputBorder}`,
                                        backgroundColor: colors.white,
                                        fontSize: 16,
                                        fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                        color: colors.activeTab,
                                        outline: "none",
                                        boxSizing: "border-box",
                                        opacity: loading ? 0.6 : 1,
                                        transition: "border-color 200ms ease, box-shadow 200ms ease",
                                    }}
                                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                        if (!emailError) {
                                            e.currentTarget.style.borderColor = colors.title
                                            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(74, 36, 13, 0.1)`
                                        }
                                    }}
                                    onBlurCapture={(e: React.FocusEvent<HTMLInputElement>) => {
                                        if (!emailError) {
                                            e.currentTarget.style.borderColor = colors.inputBorder
                                            e.currentTarget.style.boxShadow = 'none'
                                        }
                                    }}
                                />
                                {emailError && (
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#EF4444",
                                            fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                        }}
                                    >
                                        {emailError}
                                    </div>
                                )}
                            </div>

                            {/* Password Field */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                <label
                                    style={{
                                        fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                        fontSize: 16,
                                        fontWeight: 400,
                                        color: colors.labelText,
                                    }}
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setPassword(e.target.value)
                                        if (passwordError)
                                            validatePassword(e.target.value)
                                    }}
                                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => validatePassword(e.target.value)}
                                    placeholder=""
                                    disabled={loading}
                                    style={{
                                        width: "100%",
                                        padding: "16px 18px",
                                        borderRadius: 12,
                                        border: passwordError
                                            ? "1px solid #EF4444"
                                            : `1px solid ${colors.inputBorder}`,
                                        backgroundColor: colors.white,
                                        fontSize: 16,
                                        fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                        color: colors.activeTab,
                                        outline: "none",
                                        boxSizing: "border-box",
                                        opacity: loading ? 0.6 : 1,
                                        transition: "border-color 200ms ease, box-shadow 200ms ease",
                                    }}
                                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                        if (!passwordError) {
                                            e.currentTarget.style.borderColor = colors.title
                                            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(74, 36, 13, 0.1)`
                                        }
                                    }}
                                    onBlurCapture={(e: React.FocusEvent<HTMLInputElement>) => {
                                        if (!passwordError) {
                                            e.currentTarget.style.borderColor = colors.inputBorder
                                            e.currentTarget.style.boxShadow = 'none'
                                        }
                                    }}
                                />
                                {passwordError && (
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#EF4444",
                                            fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                        }}
                                    >
                                        {passwordError}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button - Pill shaped */}
                            <div style={{ marginTop: 16 }}>
                                <ConfirmButton
                                    loading={loading}
                                    label={
                                        mode === "signup"
                                            ? loading
                                                ? "Creating Account..."
                                                : "Confirm"
                                            : loading
                                                ? "Signing In..."
                                                : "Sign In"
                                    }
                                />
                            </div>

                            {/* Divider */}
                            <div
                                style={{
                                    width: "100%",
                                    textAlign: "center",
                                    color: colors.activeTab,
                                    fontSize: 14,
                                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                    margin: "8px 0",
                                }}
                            >
                                or just use your Google account
                            </div>

                            {/* Google Sign In Button - Pill shaped */}
                            <GoogleSignInButton
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                            />

                            {/* Terms & Conditions - at bottom */}
                            <div
                                style={{
                                    fontSize: 13,
                                    color: colors.activeTab,
                                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                                    textAlign: "center",
                                    lineHeight: 1.5,
                                    marginTop: 16,
                                }}
                            >
                                By signing up, you agree to our{" "}
                                <a
                                    href="/terms"
                                    target="_blank"
                                    style={{
                                        color: colors.activeTab,
                                        textDecoration: "underline",
                                        textUnderlineOffset: "2px",
                                    }}
                                >
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                    href="/privacy"
                                    target="_blank"
                                    style={{
                                        color: colors.activeTab,
                                        textDecoration: "underline",
                                        textUnderlineOffset: "2px",
                                    }}
                                >
                                    Privacy Policy
                                </a>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>,
        document.body
    )
}

/**
 * ConfirmButton - Pill-shaped submit button for the sign up/sign in form
 * Design: Dark gray (#3A3A3A), fully rounded, with shadow
 */
function ConfirmButton({
    loading,
    label,
}: {
    loading: boolean
    label: string
}) {
    const [hover, setHover] = React.useState(false)
    const [pressed, setPressed] = React.useState(false)

    const backgroundColor = pressed ? "#2A2A2A" : hover ? "#303030" : "#3A3A3A"

    return (
        <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => {
                setHover(false)
                setPressed(false)
            }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                boxSizing: "border-box",
                width: "100%",
                height: 56,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "18px 32px",
                backgroundColor,
                borderRadius: 9999, // Pill shape
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: 500,
                fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                transition: "all 200ms cubic-bezier(0.25,0.1,0.25,1)",
                boxShadow: "0px 3px 4px 0px rgba(0, 0, 0, 0.4), 0px 7px 10.7px 0px rgba(0, 0, 0, 0.25)",
                opacity: loading ? 0.7 : 1,
                gap: 10,
                transform: pressed ? "scale(0.98)" : "scale(1)",
            }}
        >
            {loading && (
                <span
                    style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderTopColor: "#FFFFFF",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
            )}
            {label}
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </button>
    )
}

/**
 * GoogleSignInButton - Pill-shaped Google OAuth sign in button
 * Design: White background, fully rounded, no border
 */
function GoogleSignInButton({
    onClick,
    disabled,
}: {
    onClick: () => void
    disabled?: boolean
}) {
    const [hover, setHover] = React.useState(false)
    const [pressed, setPressed] = React.useState(false)

    const backgroundColor = pressed
        ? "#F5F5F5"
        : hover
            ? "#FAFAFA"
            : "#FFFFFF"

    return (
        <button
            type="button"
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
                width: "100%",
                height: 56,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "18px 32px",
                backgroundColor,
                borderRadius: 9999, // Pill shape
                border: "1px solid #a6a6a6",
                cursor: disabled ? "not-allowed" : "pointer",
                color: "#3A3A3A",
                fontSize: 16,
                fontWeight: 500,
                fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                transition: "all 200ms cubic-bezier(0.25,0.1,0.25,1)",
                opacity: disabled ? 0.6 : 1,
                gap: 12,
                transform: pressed ? "scale(0.98)" : "scale(1)",
            }}
        >
            {/* Google Logo */}
            <svg
                width="20"
                height="20"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z"
                    fill="#4285F4"
                />
                <path
                    d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z"
                    fill="#34A853"
                />
                <path
                    d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40665 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54756 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z"
                    fill="#FBBC05"
                />
                <path
                    d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z"
                    fill="#EA4335"
                />
            </svg>
            Sign in with Google
        </button>
    )
}
