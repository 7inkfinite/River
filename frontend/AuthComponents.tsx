import * as React from "react"
import { createClient } from "@supabase/supabase-js"
import { X } from "lucide-react"

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
 * SignUpModal - Modal overlay with sign up/sign in form
 * Shows when user clicks Sign Up button
 */
export function SignUpModal({ onClose }: { onClose: () => void }) {
    const [mode, setMode] = React.useState<"signup" | "signin">("signup")
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

    // Lock body scroll when modal is open
    React.useEffect(() => {
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [])

    // Close on background click
    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose()
    }

    // Reset errors when switching modes
    React.useEffect(() => {
        setError(null)
        setSuccess(null)
        setEmailError(null)
        setPasswordError(null)
        setNameError(null)
    }, [mode])

    return (
        <div
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
                overflowY: "auto",
            }}
        >
            {/* Modal Container */}
            <div
                style={{
                    boxSizing: "border-box",
                    width: "100%",
                    maxWidth: 480,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    padding: "48px 32px 40px",
                    backgroundColor: "#FFFFFF",
                    gap: 24,
                    borderRadius: 24,
                    position: "relative",
                    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.2)",
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "none",
                        backgroundColor: "rgba(47, 47, 47, 0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 10,
                        transition: "background-color 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                            "rgba(47, 47, 47, 0.1)"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                            "rgba(47, 47, 47, 0.06)"
                    }}
                >
                    <X size={20} color="#2F2F2F" />
                </button>

                {/* Welcome Text */}
                <div
                    style={{
                        fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                        fontSize: "clamp(24px, 5vw, 28px)",
                        fontWeight: 600,
                        color: "#2F2F2F",
                        textAlign: "center",
                    }}
                >
                    {mode === "signup" ? "Create Account" : "Welcome Back"}
                </div>

                {/* Sign In / Sign Up Toggle - Pill style */}
                <div
                    style={{
                        display: "flex",
                        gap: 4,
                        alignItems: "center",
                        backgroundColor: "rgba(47, 47, 47, 0.06)",
                        borderRadius: 12,
                        padding: 4,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setMode("signin")}
                        style={{
                            background: mode === "signin" ? "#FFFFFF" : "transparent",
                            border: "none",
                            padding: "10px 20px",
                            cursor: "pointer",
                            fontFamily:
                                '"Inter", "Inter Placeholder", sans-serif',
                            fontSize: 14,
                            fontWeight: 500,
                            color: mode === "signin" ? "#2F2F2F" : "#7A7A7A",
                            borderRadius: 8,
                            transition: "all 200ms ease",
                            boxShadow: mode === "signin" ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none",
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("signup")}
                        style={{
                            background: mode === "signup" ? "#FFFFFF" : "transparent",
                            border: "none",
                            padding: "10px 20px",
                            cursor: "pointer",
                            fontFamily:
                                '"Inter", "Inter Placeholder", sans-serif',
                            fontSize: 14,
                            fontWeight: 500,
                            color: mode === "signup" ? "#2F2F2F" : "#7A7A7A",
                            borderRadius: 8,
                            transition: "all 200ms ease",
                            boxShadow: mode === "signup" ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none",
                        }}
                    >
                        Sign Up
                    </button>
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
                            fontFamily:
                                '"Inter", "Inter Placeholder", sans-serif',
                            textAlign: "center",
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
                            fontFamily:
                                '"Inter", "Inter Placeholder", sans-serif',
                            textAlign: "center",
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
                        gap: 16,
                    }}
                >
                    {/* Name Field (Sign Up only) */}
                    {mode === "signup" && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                            }}
                        >
                            <label
                                style={{
                                    fontFamily:
                                        '"Inter", "Inter Placeholder", sans-serif',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: "#4F4F4F",
                                }}
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    if (nameError) validateName(e.target.value)
                                }}
                                onBlur={(e) => validateName(e.target.value)}
                                placeholder="Jane Smith"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "14px 16px",
                                    borderRadius: 12,
                                    border: nameError
                                        ? "1px solid #EF4444"
                                        : "1px solid #E5E7EB",
                                    backgroundColor: "#FFFFFF",
                                    fontSize: 15,
                                    fontFamily:
                                        '"Inter", "Inter Placeholder", sans-serif',
                                    color: "#2F2F2F",
                                    outline: "none",
                                    boxSizing: "border-box",
                                    opacity: loading ? 0.6 : 1,
                                    transition: "border-color 200ms ease",
                                }}
                            />
                            {nameError && (
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#EF4444",
                                        fontFamily:
                                            '"Inter", "Inter Placeholder", sans-serif',
                                    }}
                                >
                                    {nameError}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Email Field */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                        }}
                    >
                        <label
                            style={{
                                fontFamily:
                                    '"Inter", "Inter Placeholder", sans-serif',
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#4F4F4F",
                            }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (emailError) validateEmail(e.target.value)
                            }}
                            onBlur={(e) => validateEmail(e.target.value)}
                            placeholder="jane@example.com"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: 12,
                                border: emailError
                                    ? "1px solid #EF4444"
                                    : "1px solid #E5E7EB",
                                backgroundColor: "#FFFFFF",
                                fontSize: 15,
                                fontFamily:
                                    '"Inter", "Inter Placeholder", sans-serif',
                                color: "#2F2F2F",
                                outline: "none",
                                boxSizing: "border-box",
                                opacity: loading ? 0.6 : 1,
                                transition: "border-color 200ms ease",
                            }}
                        />
                        {emailError && (
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#EF4444",
                                    fontFamily:
                                        '"Inter", "Inter Placeholder", sans-serif',
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
                            gap: 6,
                        }}
                    >
                        <label
                            style={{
                                fontFamily:
                                    '"Inter", "Inter Placeholder", sans-serif',
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#4F4F4F",
                            }}
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (passwordError)
                                    validatePassword(e.target.value)
                            }}
                            onBlur={(e) => validatePassword(e.target.value)}
                            placeholder="Min 6 characters"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: 12,
                                border: passwordError
                                    ? "1px solid #EF4444"
                                    : "1px solid #E5E7EB",
                                backgroundColor: "#FFFFFF",
                                fontSize: 15,
                                fontFamily:
                                    '"Inter", "Inter Placeholder", sans-serif',
                                color: "#2F2F2F",
                                outline: "none",
                                boxSizing: "border-box",
                                opacity: loading ? 0.6 : 1,
                                transition: "border-color 200ms ease",
                            }}
                        />
                        {passwordError && (
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#EF4444",
                                    fontFamily:
                                        '"Inter", "Inter Placeholder", sans-serif',
                                }}
                            >
                                {passwordError}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
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

                    {/* Terms & Conditions (Sign Up only) */}
                    {mode === "signup" && (
                        <div
                            style={{
                                fontSize: 12,
                                color: "#7A7A7A",
                                fontFamily:
                                    '"Inter", "Inter Placeholder", sans-serif',
                                textAlign: "center",
                                lineHeight: 1.5,
                            }}
                        >
                            By signing up, you agree to our{" "}
                            <a
                                href="/terms"
                                target="_blank"
                                style={{
                                    color: "#2F2F2F",
                                    textDecoration: "underline",
                                }}
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                href="/privacy"
                                target="_blank"
                                style={{
                                    color: "#2F2F2F",
                                    textDecoration: "underline",
                                }}
                            >
                                Privacy Policy
                            </a>
                        </div>
                    )}

                    {/* Divider */}
                    <div
                        style={{
                            width: "100%",
                            textAlign: "center",
                            color: "#7A7A7A",
                            fontSize: 14,
                            fontFamily:
                                '"Inter", "Inter Placeholder", sans-serif',
                            margin: "8px 0",
                        }}
                    >
                        or just use your google account
                    </div>

                    {/* Google Sign In Button */}
                    <GoogleSignInButton
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    />
                </form>
            </div>
        </div>
    )
}

/**
 * ConfirmButton - Submit button for the sign up/sign in form
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

    const backgroundColor = pressed ? "#1F1F1F" : hover ? "#252525" : "#2F2F2F"

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
                height: 48,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px 24px",
                backgroundColor,
                borderRadius: 12,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                transition:
                    "background-color 300ms cubic-bezier(0.25,0.1,0.25,1)",
                boxShadow:
                    "0px 1px 6px 0px rgba(48, 28, 10, 0.4), 0px 2px 2px 0px rgba(48, 28, 10, 0.35)",
                opacity: loading ? 0.6 : 1,
                gap: 8,
            }}
        >
            {loading && (
                <span
                    style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid #FFFFFF",
                        borderTopColor: "transparent",
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
 * GoogleSignInButton - Google OAuth sign in button
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
        ? "rgba(255, 255, 255, 0.95)"
        : hover
          ? "rgba(255, 255, 255, 1)"
          : "rgba(255, 255, 255, 0.9)"

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
                height: 48,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px 24px",
                backgroundColor,
                borderRadius: 12,
                border: "1px solid rgba(111, 115, 95, 0.25)",
                cursor: disabled ? "not-allowed" : "pointer",
                color: "#2F2F2F",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                transition:
                    "background-color 300ms cubic-bezier(0.25,0.1,0.25,1), border-color 300ms cubic-bezier(0.25,0.1,0.25,1)",
                opacity: disabled ? 0.6 : 1,
                gap: 10,
            }}
        >
            {/* Google Logo */}
            <svg
                width="18"
                height="18"
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
