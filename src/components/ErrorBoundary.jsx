import React from "react"
import EducaLogo from "./EducaLogo"

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Uncaught UI Error:", error, errorInfo)
  }

  handleGoHome = () => {
    try {
      sessionStorage.removeItem("active_page")
      localStorage.removeItem("last_active_page")
    } catch {}
    this.setState({ hasError: false, error: null })
    window.location.href = "/"
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080c09",
          color: "#f1f5f9",
          padding: "20px",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            maxWidth: "460px",
            width: "100%",
            background: "#111713",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "28px 24px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <EducaLogo size={44} />
            </div>

            <div style={{
              display: "inline-block",
              padding: "4px 12px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "999px",
              color: "#f87171",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "14px"
            }}>
              ⚠️ Takneeki Samasya (Minor UI Glitch)
            </div>

            <h2 style={{ fontSize: "19px", fontWeight: 800, margin: "0 0 8px", color: "#ffffff" }}>
              Screen Load Nahi Ho Payi
            </h2>

            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5, margin: "0 0 20px" }}>
              Aapka cart aur account bilkul surakshit hai. Niche diye gaye button par click karke wapas Home page par ja sakte hain.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={this.handleGoHome}
                style={{
                  width: "100%",
                  padding: "12px 18px",
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.3)"
                }}
              >
                🏠 Wapas Home Page Jayein
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  width: "100%",
                  padding: "10px 18px",
                  background: "rgba(255,255,255,0.06)",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                🔄 Refresh Karein
              </button>
            </div>

            {this.state.error?.message && (
              <details style={{ marginTop: "18px", textAlign: "left", fontSize: "11px", color: "#64748b" }}>
                <summary style={{ cursor: "pointer", outline: "none" }}>Error Details</summary>
                <div style={{
                  marginTop: "6px",
                  padding: "8px 10px",
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                  wordBreak: "break-word",
                  color: "#ef4444"
                }}>
                  {this.state.error.message}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
