import * as React from "react"
import { UserDashboard } from "./UserDashboard.tsx"

/**
 * DashboardPreview - Preview component for the UserDashboard
 * Shows mock data for design iteration without requiring authentication
 */
export function DashboardPreview() {
    const [showDashboard, setShowDashboard] = React.useState(true)

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
                Dashboard Preview Component
            </div>

            <button
                onClick={() => setShowDashboard(true)}
                style={{
                    padding: "12px 24px",
                    borderRadius: 12,
                    border: "1px solid #E0CD9D",
                    backgroundColor: "#117E8A",
                    color: "#EFE9DA",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                    cursor: "pointer",
                }}
            >
                Show Dashboard
            </button>

            {showDashboard && (
                <UserDashboard onClose={() => setShowDashboard(false)} />
            )}
        </div>
    )
}
