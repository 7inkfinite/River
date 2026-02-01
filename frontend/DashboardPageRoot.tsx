import * as React from "react"
import { AuthGateProvider } from "./AuthGate.tsx"
import { UserDashboardShell } from "./UserDashboardShell.tsx"
import { ProtectedRoute } from "./ProtectedRoute.tsx"

/**
 * DashboardPageRoot - Top-level component for the /dashboard page
 *
 * This is a Framer code component that wraps the entire dashboard
 * experience with AuthGateProvider for auth state management.
 */
export function DashboardPageRoot() {
    return (
        <AuthGateProvider>
            <ProtectedRoute>
                <UserDashboardShell />
            </ProtectedRoute>
        </AuthGateProvider>
    )
}
