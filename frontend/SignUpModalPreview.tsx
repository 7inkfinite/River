import * as React from "react"
import { SignUpModal } from "./AuthComponents.tsx"

/**
 * SignUpModalPreview - Preview component for the SignUpModal
 * Shows the signup/signin form for design iteration
 */
export function SignUpModalPreview({ backgroundImage }: { backgroundImage?: string }) {
    const [showModal, setShowModal] = React.useState(true)

    return (
        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                backgroundColor: "#FAF8F0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 40,
            }}
        >
            <div
                style={{
                    marginBottom: 20,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 14,
                    color: "#7A7A7A",
                }}
            >
                SignUp Modal Preview Component
            </div>

            <button
                onClick={() => setShowModal(true)}
                style={{
                    padding: "12px 24px",
                    borderRadius: 12,
                    border: "1px solid #E0CD9D",
                    backgroundColor: "#117E8A",
                    color: "#FAF8F0",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                    cursor: "pointer",
                }}
            >
                Show SignUp Modal
            </button>

            {showModal && (
                <SignUpModal
                    onClose={() => setShowModal(false)}
                    isAuthenticated={false}
                    isClaiming={false}
                    claimedCount={0}
                    backgroundImage={backgroundImage}
                />
            )}
        </div>
    )
}
