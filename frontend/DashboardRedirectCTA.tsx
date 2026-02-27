import * as React from "react"
import { ArrowRight } from "lucide-react"

export function DashboardRedirectCTA() {
    return (
        <div
            style={{
                width: "100%",
                maxWidth: 480,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
                padding: "60px 20px",
                textAlign: "center"
            }}
        >
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 12
            }}>
                <div style={{
                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#2F2F2F",
                }}>
                    Welcome Back!
                </div>
                <div style={{
                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                    fontSize: 16,
                    color: "#7A7A7A",
                }}>
                    You're signed in. Go to your dashboard to manage your content.
                </div>
            </div>

            <button
                onClick={() => window.location.href = "/dashboard"}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 32px",
                    backgroundColor: "#4688F7",
                    color: "#FAF8F0",
                    border: "none",
                    borderRadius: 32,
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(60, 130, 246, 0.25)",
                    transition: "transform 150ms ease, box-shadow 150ms ease"
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(60, 130, 246, 0.3)"
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(60, 130, 246, 0.25)"
                }}
            >
                Go to Dashboard
                <ArrowRight size={20} />
            </button>
        </div>
    )
}
