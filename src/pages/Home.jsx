import { useState, useMemo, useEffect } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"
import AdSlot from "../components/AdSlot"
import InlineLoader from "../components/InlineLoader"
import { openFinanceService, openEducation } from "../utils/financeLink"

/* ─── Shared image-src helper (product images ya uploaded File dono handle karta hai) ─── */
export function getProductImageSrc(p) {
  if (!p?.image) return null
  if (typeof p.image === "string")
    return p.image.startsWith("http") ? p.image : `${import.meta.env.VITE_API_URL}/uploads/${p.image}`
  if (p.image instanceof File) return URL.createObjectURL(p.image)
  return null
}

/* ─── Flip Card Component ─── */
export function ProductCard({ product, showPPC, onAddToCart, onLoginRedirect, setPage }) {
  const [flipped, setFlipped] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { suppressCartPopup, setSuppressCartPopup } = useStore()

  const productId = product.id || product._id
  const ppc = product.ppcReward || 0

  const getImageSrc = getProductImageSrc

  const imgSrc = getImageSrc(product)

  return (
    <>
    <div
      style={{
        perspective: "1000px",
        cursor: "pointer",
        height: "100%",
      }}
      onClick={() => setFlipped(f => !f)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4,0.2,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ══ FRONT (normal flow — sets the card's height) ══ */}
        <div
          style={{
            position: "relative",
            height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 16,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* PPC Badge */}
          {showPPC && ppc > 0 && (
            <div style={{
              position: "absolute", top: 10, right: 10, zIndex: 10,
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              color: "#fff", fontSize: 11, fontWeight: 800,
              padding: "4px 10px", borderRadius: 20,
              boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              💎 {ppc} PPC
            </div>
          )}

          {/* Tap hint */}
          <div style={{
            position: "absolute", top: 10, left: 10, zIndex: 10,
            background: "rgba(0,0,0,0.35)", color: "#fff",
            fontSize: 10, fontWeight: 600, padding: "3px 8px",
            borderRadius: 20, backdropFilter: "blur(4px)",
          }}>
            tap for info
          </div>

          {/* Image */}
          {imgSrc ? (
            <div style={{ height: 140, background: "#f1f5f9", overflow: "hidden", flexShrink: 0 }}>
              <img src={imgSrc} alt={product.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => (e.target.style.display = "none")} />
            </div>
          ) : (
            <div style={{
              height: 140, background: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 44, flexShrink: 0,
            }}>📦</div>
          )}

          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
            <h2 style={{
              fontWeight: 800, fontSize: 14, color: "#1e293b",
              lineHeight: 1.3, marginBottom: 2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>{product.title}</h2>

            {product.category && (
              <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, marginBottom: 4 }}>
                {product.category}
              </span>
            )}

            <p style={{ fontWeight: 900, fontSize: 18, color: "#0f172a", marginBottom: 6 }}>
              ₹{product.price}
            </p>

            {showPPC && ppc > 0 && (
              <div style={{
                background: "linear-gradient(135deg,#faf5ff,#ede9fe)",
                border: "1px solid #ddd6fe",
                borderRadius: 10, padding: "7px 10px",
                display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
              }}>
                <span style={{ fontSize: 16 }}>💎</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#6d28d9" }}>{ppc} PPC Reward</div>
                  <div style={{ fontSize: 10, color: "#8b5cf6" }}>Is sale par {ppc} PPC milenge</div>
                </div>
              </div>
            )}

            <button
              onClick={e => {
                e.stopPropagation()
                if (onAddToCart) {
                  onAddToCart(product)
                  if (!suppressCartPopup) setJustAdded(true)
                } else {
                  onLoginRedirect?.()
                }
              }}
              style={{
                marginTop: "auto",
                background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
                border: "none", borderRadius: 10,
                padding: "9px 0", fontWeight: 800, fontSize: 13,
                cursor: "pointer", width: "100%",
                boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
                transition: "transform 0.15s",
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>

        {/* ══ BACK (absolute — matches the height set by front) ══ */}
        <div
          style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 16,
            overflow: "hidden",
            background: "linear-gradient(145deg,#1e1b4b,#312e81,#4c1d95)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            padding: "18px 16px",
            color: "#fff",
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(167,139,250,0.15)",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: -20,
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(196,181,253,0.12)",
          }} />

          {/* Back header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12, position: "relative" }}>
            {imgSrc ? (
              <img src={imgSrc} alt={product.title}
                style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }}
                onError={e => (e.target.style.display = "none")} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: 8, fontSize: 22, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.1)",
              }}>📦</div>
            )}
            <div style={{ minHeight: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{
                fontWeight: 800, fontSize: 13, lineHeight: 1.25,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {product.title}
              </div>
              {product.category && (
                <div style={{ fontSize: 10, color: "#c4b5fd", fontWeight: 600, marginTop: 2 }}>{product.category}</div>
              )}
            </div>
          </div>

          {/* Description — fills the rest of the card */}
          <div style={{
            flex: 1, position: "relative",
            background: "rgba(255,255,255,0.07)",
            borderRadius: 10, padding: "12px 14px",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ fontSize: 10.5, color: "#a78bfa", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6, whiteSpace: "nowrap" }}>
              Details
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.7, color: "#e2e8f0",
              overflow: "auto", flex: 1,
            }}>
              {product.description
                ? product.description
                : "Is product ke baare mein koi description available nahi hai. Admin se contact karo zyada jaankari ke liye."}
            </p>
          </div>

          <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            tap to flip back
          </div>
        </div>
      </div>
    </div>

    {/* ══ ADDED TO CART POPUP ══ */}
    {justAdded && (
      <div
        onClick={() => setJustAdded(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,23,42,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 18, padding: "28px 24px",
            maxWidth: 340, width: "100%", textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>🛒✅</div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1e293b" }}>
            Cart mein add ho gaya!
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "8px 0 20px" }}>
            Kya aap aur shopping karna chahte hain, ya order complete karna chahte hain?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => { setJustAdded(false); setPage?.("cart") }}
              style={{
                background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
                border: "none", borderRadius: 10, padding: "12px 0",
                fontWeight: 800, fontSize: 14, color: "#1e293b", cursor: "pointer",
              }}
            >
              ✅ Order Complete Karo
            </button>
            <button
              onClick={() => { setJustAdded(false); setSuppressCartPopup(true) }}
              style={{
                background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10,
                padding: "12px 0", fontWeight: 700, fontSize: 14, color: "#374151", cursor: "pointer",
              }}
            >
              🛍️ Shopping Jaari Rakhein
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   EDUCA VEDA REDESIGN — Ayurveda + Education + Finance ecosystem
   Real data: recent order (agar logged in), real navigation links.
   Loan Estimator client-side calculator hai (harmless preview tool),
   iska CTA real Finance service link kholta hai.
═══════════════════════════════════════════════════════════ */
export default function Store({ setPage }) {
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}
  const { user, loggedIn } = useAuth()
  const role = user?.role || "guest"

  const [loanAmount, setLoanAmount] = useState(55000)
  const [tenure, setTenure] = useState(11)
  const [recentOrder, setRecentOrder] = useState(null)
  const [orderLoading, setOrderLoading] = useState(false)

  // ⭐ REAL recent order — /api/orders/mine se (sirf seller/user role ke liye backend allow karta hai)
  useEffect(() => {
    if (!loggedIn || !(role === "seller" || role === "user")) return
    setOrderLoading(true)
    const token = localStorage.getItem("token")
    fetch(`${import.meta.env.VITE_API_URL}/api/orders/mine`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setRecentOrder(data[0]) })
      .catch(e => console.error("Recent order fetch error:", e.message))
      .finally(() => setOrderLoading(false))
  }, [loggedIn, role])

  const interestRate = 0.085
  const monthlyRate = interestRate / 12
  const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1)
  const totalRepayable = emi * tenure
  const totalInterest = totalRepayable - loanAmount

  const statusMeta = {
    pending: { label: "Pending", bg: "#fef3c7", color: "#92400e" },
    distributor_approved: { label: "Approved", bg: "#dbeafe", color: "#1e40af" },
    confirmed: { label: "Confirmed", bg: "#d1fae5", color: "#065f46" },
    rejected: { label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#F8FAFC" }}>
      <style>{`
        .ev-h1 { font-family: 'Playfair Display', serif; }
        .ev-slider { accent-color: #0F766E; }
        .ev-hero-btn:hover { background: #0d5c56 !important; transform: translateY(-2px); }
        .ev-cta-btn:hover { background: #0d5c56 !important; }
        .ev-track-btn:hover { background: #e2e8f0 !important; }
      `}</style>

      {/* 1. HERO SECTION */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="ev-hero-grid">
        <div>
          <h1 className="ev-h1" style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, marginBottom: 24, color: "#0f172a" }}>
            Ancient Wisdom.<br />
            <span style={{ color: "#0F766E" }}>Modern Learning.</span><br />
            Smarter Finance.
          </h1>
          <p style={{ fontSize: 17, color: "#475569", marginBottom: 32, lineHeight: 1.7 }}>
            Discover authentic Ayurveda, master clinical traditional medicine, manage peerless digital payments,
            and unlock micro-financing — united inside a single, high-trust digital realm.
          </p>
          <button
            className="ev-hero-btn"
            onClick={() => safeSetPage("store")}
            style={{ padding: "13px 28px", background: "#0F766E", color: "#fff", fontWeight: 700, borderRadius: 999, border: "none", boxShadow: "0 10px 20px rgba(15,118,110,0.2)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, transition: "all 0.2s" }}
          >
            Explore EDUCA VEDA <span>→</span>
          </button>
        </div>

        <div style={{ position: "relative", padding: 32, background: "#fff", borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", minHeight: 360, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#f0fdfa,#eff6ff)", opacity: 0.6 }} />
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ height: 88, width: 88, background: "#D97706", borderRadius: 20, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(217,119,6,0.25)" }}>
              <span style={{ fontSize: 30, color: "#fff" }}>⬡</span>
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 19, margin: "0 0 4px", color: "#0f172a" }}>EDUCA CORE</h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Unified Intelligence</p>
          </div>
        </div>
      </main>

      {/* 2. FOCUS DOMAINS — Ayurveda / Education / Finance real navigation */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 64px" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>Pick Your Domain</span>
        <h2 className="ev-h1" style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 24 }}>Focus Areas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          <button onClick={() => safeSetPage("store")} style={{ textAlign: "left", background: "#fff", border: "1px solid #f1f5f9", borderRadius: 18, padding: 24, cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "#ccfbf1", color: "#0F766E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>
              <i className="fa-solid fa-mortar-pestle"></i>
            </div>
            <h4 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 4px", color: "#0f172a" }}>Ayurveda &amp; Medicine</h4>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Real products — humare store mein abhi available</p>
          </button>
          <button onClick={openEducation} style={{ textAlign: "left", background: "#fff", border: "1px solid #f1f5f9", borderRadius: 18, padding: 24, cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "#dbeafe", color: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <h4 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 4px", color: "#0f172a" }}>Education</h4>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Udaan Achievers platform pe khulega ↗</p>
          </button>
          <button onClick={() => openFinanceService(safeSetPage)} style={{ textAlign: "left", background: "#fff", border: "1px solid #f1f5f9", borderRadius: 18, padding: 24, cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "#fef3c7", color: "#92400e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>
              <i className="fa-solid fa-wallet"></i>
            </div>
            <h4 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 4px", color: "#0f172a" }}>Finance &amp; Wallet</h4>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Abhi Services mein configured link khulega</p>
          </button>
        </div>
      </section>

      {/* 3. CONTROL CENTER — REAL recent order (ya generic CTA agar order nahi hai) */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 64px" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>Unified Member Portal</span>
        <h2 className="ev-h1" style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 24 }}>Personalized Control Center</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 18, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
            {!loggedIn ? (
              <>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Get Started</span>
                <h4 style={{ fontSize: 17, fontWeight: 800, margin: "6px 0 8px", color: "#0f172a" }}>Login karke apna order dekho</h4>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Login karne ke baad yahan aapka latest order status dikhega</p>
                <button onClick={() => safeSetPage("login")} className="ev-cta-btn" style={{ width: "100%", padding: "10px 0", background: "#0F766E", color: "#fff", fontWeight: 700, borderRadius: 12, border: "none", cursor: "pointer" }}>Login Karo</button>
              </>
            ) : orderLoading ? (
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Order load ho raha hai...</p>
            ) : recentOrder ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Recent Order</span>
                  <span style={{
                    padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800,
                    background: (statusMeta[recentOrder.status] || statusMeta.pending).bg,
                    color: (statusMeta[recentOrder.status] || statusMeta.pending).color,
                  }}>{(statusMeta[recentOrder.status] || statusMeta.pending).label}</span>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px", color: "#0f172a" }}>
                  Order #{(recentOrder._id || "").toString().slice(-6).toUpperCase()}
                </h4>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                  {(recentOrder.items || []).length} Item{(recentOrder.items || []).length === 1 ? "" : "s"} • ₹{recentOrder.total || 0}
                </p>
                <button onClick={() => safeSetPage("seller-orders")} className="ev-track-btn" style={{ width: "100%", padding: "10px 0", background: "#f1f5f9", color: "#334155", fontWeight: 700, borderRadius: 12, border: "none", cursor: "pointer" }}>Track Order</button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>No Orders Yet</span>
                <h4 style={{ fontSize: 17, fontWeight: 800, margin: "6px 0 8px", color: "#0f172a" }}>Shopping shuru karo</h4>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Abhi tak koi order nahi hai — Ayurveda store dekho</p>
                <button onClick={() => safeSetPage("store")} className="ev-cta-btn" style={{ width: "100%", padding: "10px 0", background: "#0F766E", color: "#fff", fontWeight: 700, borderRadius: 12, border: "none", cursor: "pointer" }}>Store Kholo</button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE LOAN ESTIMATOR — client-side calculator (koi fake backend data nahi) */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ background: "#fff", padding: 32, borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 10 }}>
            <h3 className="ev-h1" style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Interactive Loan Estimator</h3>
            <span style={{ padding: "5px 12px", background: "#fef3c7", color: "#92400e", fontSize: 13, fontWeight: 800, borderRadius: 10 }}>APR: 8.5% p.a.</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Required Amount</label>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#1e3a8a" }}>₹{loanAmount.toLocaleString()}</span>
            </div>
            <input type="range" min="10000" max="200000" step="5000" value={loanAmount}
              onChange={e => setLoanAmount(Number(e.target.value))}
              className="ev-slider" style={{ width: "100%", height: 6, borderRadius: 8, cursor: "pointer" }} />
          </div>

          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Repayment Tenure</label>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#1e3a8a" }}>{tenure} Months</span>
            </div>
            <input type="range" min="3" max="24" step="1" value={tenure}
              onChange={e => setTenure(Number(e.target.value))}
              className="ev-slider" style={{ width: "100%", height: 6, borderRadius: 8, cursor: "pointer" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Est. EMI</p>
              <p className="ev-h1" style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>₹{Math.round(emi).toLocaleString()}</p>
            </div>
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Total Interest</p>
              <p className="ev-h1" style={{ fontSize: 20, fontWeight: 800, color: "#d97706", margin: 0 }}>₹{Math.round(totalInterest).toLocaleString()}</p>
            </div>
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Total Repayable</p>
              <p className="ev-h1" style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>₹{Math.round(totalRepayable).toLocaleString()}</p>
            </div>
          </div>

          <button
            onClick={() => openFinanceService(safeSetPage)}
            className="ev-cta-btn"
            style={{ width: "100%", padding: "15px 0", background: "#0F766E", color: "#fff", fontWeight: 800, fontSize: 16, borderRadius: 14, border: "none", cursor: "pointer", boxShadow: "0 10px 20px rgba(15,118,110,0.2)" }}
          >
            Proceed with Instant Verification
          </button>
          <p style={{ fontSize: 11.5, color: "#94a3b8", textAlign: "center", marginTop: 10 }}>
            * Yeh sirf ek estimate calculator hai. Verification ke liye aap humare finance partner ke page pe redirect honge.
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .ev-hero-grid { grid-template-columns: 1fr !important; text-align: center; }
        }
      `}</style>
    </div>
  )
}
