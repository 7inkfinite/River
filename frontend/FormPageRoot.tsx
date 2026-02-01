import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { AuthGateProvider } from "./AuthGate.tsx"
import { ProtectedRoute } from "./ProtectedRoute.tsx"
import { RiverProvider } from "./UseRiverGeneration.tsx"
import { RiverCTA } from "./RiverCTA.tsx"
import { RiverResultsRoot } from "./RiverResultsRoot.tsx"
import { PostGenerationActions } from "./PostGenerationActions.tsx"

/**
 * FormPageRoot - Dedicated form page for authenticated users
 * Route: /form
 */
export function FormPageRoot() {
    return (
        <AuthGateProvider>
            <ProtectedRoute>
                <div
                    style={{
                        width: "100%",
                        minHeight: "100vh",
                        backgroundColor: "#FAF7ED",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            height: 64,
                            borderBottom: "1px solid #E0CD9D",
                            display: "flex",
                            alignItems: "center",
                            padding: "0 24px",
                            backgroundColor: "#FAF7ED",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                        }}
                    >
                        <a
                            href="/dashboard"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                color: "#2F2F2F",
                                textDecoration: "none",
                                fontFamily: '"Inter", sans-serif',
                                fontSize: 14,
                                fontWeight: 500,
                                padding: "8px 12px",
                                borderRadius: 12,
                                transition: "background-color 200ms ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(124, 138, 17, 0.1)"
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent"
                            }}
                        >
                            <ArrowLeft size={18} />
                            <span>Back to Dashboard</span>
                        </a>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "40px 20px" }}>
                        <RiverProvider>
                            <RiverCTA allowResubmit={false} />
                            <RiverResultsRoot disableAuthUI={true} />
                            <PostGenerationActions />
                        </RiverProvider>
                    </div>
                </div>
            </ProtectedRoute>
        </AuthGateProvider>
    )
}
