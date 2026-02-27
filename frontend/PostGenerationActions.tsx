import * as React from "react"
import { CheckCircle } from "lucide-react"
import { UseRiverGeneration } from "./UseRiverGeneration.tsx"

/**
 * PostGenerationActions - Shows after a successful generation on /form page
 *
 * Displays:
 * - "Saved to your dashboard" confirmation (matches Figma node 192:170)
 * - "Start New Generation" reset button
 */
export function PostGenerationActions() {
    const { state, reset } = UseRiverGeneration()
    const [buttonHover, setButtonHover] = React.useState(false)
    const [buttonPressed, setButtonPressed] = React.useState(false)
    const [pillHover, setPillHover] = React.useState(false)

    // Only show when we have results
    if (!state.result) return null

    const buttonBg = buttonPressed
        ? "#1F1F1F"
        : buttonHover
            ? "#4B4B4B"
            : "#2F2F2F"

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                marginTop: 32,
                padding: "24px 20px",
            }}
        >
            {/* Saved to dashboard banner */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 20px",
                    borderRadius: 12,
                    backgroundColor: "#CFDBBC",
                    boxShadow: "0px 0px 4px rgba(36, 42, 25, 0.25)",
                    fontFamily: '"Inter", sans-serif',
                    width: "fit-content",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <CheckCircle size={20} color="#117E8A" />
                    <span
                        style={{
                            color: "#2F2F2F",
                            fontSize: 16,
                            fontWeight: 400,
                        }}
                    >
                        Saved to your
                    </span>
                </div>
                <a
                    href="/dashboard"
                    onMouseEnter={() => setPillHover(true)}
                    onMouseLeave={() => setPillHover(false)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px 12px",
                        borderRadius: 24,
                        backgroundColor: pillHover ? "#4B4B4B" : "#2F2F2F",
                        color: "#FAF8F0",
                        fontSize: 14,
                        fontWeight: 400,
                        textDecoration: "none",
                        transition: "background-color 200ms ease",
                    }}
                >
                    dashboard
                </a>
            </div>

            {/* Reset button */}
            <button
                onClick={reset}
                onMouseEnter={() => setButtonHover(true)}
                onMouseLeave={() => {
                    setButtonHover(false)
                    setButtonPressed(false)
                }}
                onMouseDown={() => setButtonPressed(true)}
                onMouseUp={() => setButtonPressed(false)}
                style={{
                    padding: "12px 24px",
                    backgroundColor: buttonBg,
                    color: "#FAF8F0",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily:
                        "General Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    cursor: "pointer",
                    transition:
                        "background-color 200ms cubic-bezier(0.25,0.1,0.25,1)",
                    boxShadow:
                        "0px 1px 6px rgba(48, 28, 10, 0.4), 0px 2px 2px rgba(48, 28, 10, 0.35)",
                }}
            >
                Start New Generation
            </button>
        </div>
    )
}
