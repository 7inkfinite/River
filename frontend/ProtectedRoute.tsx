import * as React from "react"
import { useAuthGate } from "./AuthGate.tsx"

/**
 * ProtectedRoute - Wrapper component that ensures only authenticated users can access child components.
 * 
 * Behavior:
 * - Checks auth status via AuthGate
 * - Shows loading state while auth is initializing
 * - Redirects to home (/) if user is not authenticated
 * - Renders children if authenticated
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, authReady } = useAuthGate()

    React.useEffect(() => {
        if (authReady && !isAuthenticated) {
            window.location.href = "/"
        }
    }, [authReady, isAuthenticated])

    if (!authReady) {
        return (
            <div
                style={{
                    width: "100%",
                    minHeight: "100vh",
                    backgroundColor: "#FAF7ED",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        color: "#7A7A7A",
                        fontSize: 18,
                        fontFamily: '"Inter", sans-serif',
                    }}
                >
                    Loading...
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Will redirect in useEffect
    }

    return <>{children}</>
}
