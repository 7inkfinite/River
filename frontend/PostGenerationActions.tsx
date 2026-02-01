import * as React from "react"
import { UseRiverGeneration } from "./UseRiverGeneration.tsx"

/**
 * PostGenerationActions - Shows after a successful generation on /form page
 *
 * Displays:
 * - "Saved to dashboard" confirmation
 * - "Start New Generation" reset button
 */
export function PostGenerationActions() {
    const { state, reset } = UseRiverGeneration()
    const [buttonHover, setButtonHover] = React.useState(false)
    const [buttonPressed, setButtonPressed] = React.useState(false)

    // Only show when we have results
    if (!state.result) return null

    const buttonBg = buttonPressed
        ? "#1F1F1F"
        : buttonHover
            ? "#252525"
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
            {/* Saved indicator */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#15803D",
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                }}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Saved to dashboard
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
                    color: "#EFE9DA",
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
