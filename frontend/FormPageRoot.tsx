import * as React from "react"
import { AuthGateProvider } from "./AuthGate.tsx"
import { StatusBar } from "./StatusBar.tsx"
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
                        height: "100vh",
                        backgroundColor: "#FAF7ED",
                        display: "flex",
                        flexDirection: "column",
                        overflowY: "auto",
                    }}
                >
                    {/* Status Bar */}
                    <StatusBar activePage="form" />

                    {/* Content */}
                    <div style={{ padding: "104px 20px 40px 20px" }}>
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
