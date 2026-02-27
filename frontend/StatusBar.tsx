import * as React from "react"
import { Home, Plus, LogOut, LayoutDashboard } from "lucide-react"
import { supabase } from "./AuthComponents.tsx"

/**
 * StatusBar - Shared navigation bar for authenticated pages
 *
 * Left: Home icon → /
 * Right: Context action button + Logout
 *   - dashboard: "New" pill → /form
 *   - form: "Dashboard" pill → /dashboard
 *
 * All buttons use expand-on-hover interaction:
 * compact icon-only pill that expands to reveal label text.
 */
export function StatusBar({
    activePage,
}: {
    activePage: "dashboard" | "form"
}) {
    const [homeHover, setHomeHover] = React.useState(false)
    const [actionHover, setActionHover] = React.useState(false)
    const [logoutHover, setLogoutHover] = React.useState(false)

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            window.location.href = "/"
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    const actionLabel = activePage === "dashboard" ? "New" : "Dashboard"
    const actionHref = activePage === "dashboard" ? "/form" : "/dashboard"
    const ActionIcon = activePage === "dashboard" ? Plus : LayoutDashboard
    const actionExpandedWidth = activePage === "dashboard" ? 85 : 138

    const expandTransition =
        "width 250ms cubic-bezier(0.4, 0, 0.2, 1), background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), gap 250ms cubic-bezier(0.4, 0, 0.2, 1), max-width 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms cubic-bezier(0.4, 0, 0.2, 1), padding 250ms cubic-bezier(0.4, 0, 0.2, 1)"

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: 64,
                backgroundColor: "#FAF8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
            }}
        >
            {/* Inner container aligned with content */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 1360,
                    padding: "0 clamp(20px, 4vw, 60px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                }}
            >
                {/* Home - expands to show "Home" label on hover */}
                <button
                    onClick={() => (window.location.href = "/")}
                    onMouseEnter={() => setHomeHover(true)}
                    onMouseLeave={() => setHomeHover(false)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: homeHover ? 10 : 0,
                        boxSizing: "border-box" as const,
                        width: homeHover ? 100 : 40,
                        height: 40,
                        padding: homeHover ? "0 12px" : 0,
                        borderRadius: 24,
                        border: "none",
                        backgroundColor: homeHover ? "#F5F0DE" : "#FAF8F0",
                        cursor: "pointer",
                        overflow: "hidden",
                        whiteSpace: "nowrap" as const,
                        transition: expandTransition,
                    }}
                >
                    <Home size={18} color="#2D2E0F" strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span
                        style={{
                            color: "#2D2E0F",
                            fontSize: 16,
                            fontWeight: 400,
                            fontFamily: '"Inter", sans-serif',
                            flexShrink: 0,
                            opacity: homeHover ? 1 : 0,
                            maxWidth: homeHover ? 100 : 0,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            transition: expandTransition,
                        }}
                    >
                        Home
                    </span>
                </button>

                {/* Right side: Action button and Logout */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {/* Action (New / Dashboard) - blue, expands on hover */}
                    <button
                        onClick={() => (window.location.href = actionHref)}
                        onMouseEnter={() => setActionHover(true)}
                        onMouseLeave={() => setActionHover(false)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: actionHover ? 10 : 0,
                            boxSizing: "border-box" as const,
                            width: actionHover ? actionExpandedWidth : 40,
                            height: 40,
                            padding: actionHover ? "0 12px" : 0,
                            borderRadius: 24,
                            border: "none",
                            backgroundColor: actionHover
                                ? "#163D7A"
                                : "#4688F7",
                            cursor: "pointer",
                            overflow: "hidden",
                            whiteSpace: "nowrap" as const,
                            boxShadow: "0 2px 8px rgba(70, 136, 247, 0.2)",
                            transition: expandTransition,
                        }}
                    >
                        <ActionIcon
                            size={18}
                            color="#FAF8F0"
                            strokeWidth={2}
                            style={{ flexShrink: 0 }}
                        />
                        <span
                            style={{
                                color: "#FAF8F0",
                                fontSize: 16,
                                fontWeight: 400,
                                fontFamily: '"Inter", sans-serif',
                                flexShrink: 0,
                                opacity: actionHover ? 1 : 0,
                                maxWidth: actionHover ? 100 : 0,
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                transition: expandTransition,
                            }}
                        >
                            {actionLabel}
                        </span>
                    </button>

                    {/* Logout - mirrors Home interaction (warm beige expand) */}
                    <button
                        onClick={handleLogout}
                        onMouseEnter={() => setLogoutHover(true)}
                        onMouseLeave={() => setLogoutHover(false)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: logoutHover ? 10 : 0,
                            boxSizing: "border-box" as const,
                            width: logoutHover ? 100 : 40,
                            height: 40,
                            padding: logoutHover ? "0 12px" : 0,
                            borderRadius: 24,
                            border: "none",
                            backgroundColor: logoutHover
                                ? "#F5F0DE"
                                : "#FAF8F0",
                            cursor: "pointer",
                            overflow: "hidden",
                            whiteSpace: "nowrap" as const,
                            transition: expandTransition,
                        }}
                    >
                        <LogOut
                            size={18}
                            color="#2D2E0F"
                            strokeWidth={2}
                            style={{ flexShrink: 0 }}
                        />
                        <span
                            style={{
                                color: "#2D2E0F",
                                fontSize: 16,
                                fontWeight: 400,
                                fontFamily: '"Inter", sans-serif',
                                flexShrink: 0,
                                opacity: logoutHover ? 1 : 0,
                                maxWidth: logoutHover ? 100 : 0,
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                transition: expandTransition,
                            }}
                        >
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
