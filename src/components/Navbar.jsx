import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { useStore } from "../context/StoreContext"
import NotificationBell from "./NotificationBell"
import ShareButton from "./ShareButton"

/* ─── Small inline icon set (no external deps) ─── */
const Icon = ({ name, size = 18 }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
  switch (name) {
    case "search": return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
    case "cart":   return <svg {...p}><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2.5 3h2l2.6 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" /></svg>
    case "user":   return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" /></svg>
    case "menu":   return <svg {...p}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
    case "close":  return <svg {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
    case "chevron":return <svg {...p}><path d="M9 6l6 6-6 6" /></svg>
    case "home":   return <svg {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
    case "grid":   return <svg {...p}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
    case "network":return <svg {...p}><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="19" r="2.5" /><path d="M12 7.5v4M12 11.5 6.5 17M12 11.5 17.5 17" /></svg>
    case "box":    return <svg {...p}><path d="M21 8l-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
    case "logout": return <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
    default: return null
  }
}

export default function Navbar({ setPage, cartCount, pageBadge = {}, noBottomMargin = false }) {
  const { loggedIn, logout, user } = useAuth() || {}
  const { setSearchTerm } = useStore() || {}
  const safeUser = user || {}
  const role = safeUser?.role || "guest"
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}
  const safeCartCount = Number(cartCount) || 0
  const isBlocked = safeUser?.isBlocked || false
  const isDeleted = safeUser?.isDeleted || false
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [searchVal, setSearchVal] = useState("")
  const accountRef = useRef(null)

  // ✅ Lock body scroll when menu is open, so drawer height stays correct
  useEffect(() => {
    if (menuOpen) {
      const prevOverflow = document.body.style.overflow
      const prevHeight = document.body.style.height
      document.body.style.overflow = "hidden"
      document.body.style.height = "100%"
      return () => {
        document.body.style.overflow = prevOverflow
        document.body.style.height = prevHeight
      }
    }
  }, [menuOpen])

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // ✅ Close account dropdown on outside click
  useEffect(() => {
    if (!accountOpen) return
    const onClick = (e) => { if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false) }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [accountOpen])

  const go = (page) => { safeSetPage(page); setMenuOpen(false); setAccountOpen(false) }

  const runSearch = () => {
    setSearchTerm?.(searchVal)
    go("store")
  }

  if (loggedIn && (isBlocked || isDeleted)) {
    return (
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fef2f2", padding: "12px 16px", marginBottom: 16, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <span style={{ fontWeight: 700, color: "#dc2626" }}>Account Disabled</span>
        <button onClick={() => { logout && logout(); go("login") }} style={{ padding: "6px 14px", borderRadius: 6, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Logout</button>
      </header>
    )
  }

  const publicBtns = [
    { label: "Home", page: "home" },
    { label: "Services", page: "services" },
    { label: "Store", page: "store" },
  ]

  const adminCategories = [
    {
      cat: "📊 Dashboard",
      items: [
        { label: "Network View", page: "admin-network", color: "#a21caf" },
        { label: "Orders", page: "admin-orders", color: "#0f766e" },
      ],
    },
    {
      cat: "📦 Products",
      items: [
        { label: "Add Product", page: "admin-add-product", color: "#ea580c" },
        { label: "Manage Products", page: "admin-products", color: "#dc2626" },
      ],
    },
    {
      cat: "👥 Users & Requests",
      items: [
        { label: "Manage Users", page: "admin-users", color: "#1e293b" },
        { label: "User Requests", page: "admin-requests", color: "#db2777" },
        { label: "Requests History", page: "admin-requests-history", color: "#4b5563" },
        { label: "Password Reset", page: "admin-password-reset", color: "#b91c1c" },
      ],
    },
    {
      cat: "💰 Finance",
      items: [
        { label: "💰 PPC Settings", page: "admin-ppc-settings", color: "#9333ea" },
        { label: "💳 Withdrawals", page: "admin-withdrawal-management", color: "#ea580c" },
        { label: "🧾 Invoice Settings", page: "admin-invoice-settings", color: "#0891b2" },
      ],
    },
    {
      cat: "⚙️ Settings",
      items: [
        { label: "📧 Email Settings", page: "email-settings", color: "#4f46e5" },
        { label: "☢️ Data Purge", page: "admin-nuke", color: "#7f1d1d" },
      ],
    },
  ]
  const adminBtns = adminCategories.flatMap(c => c.items)

  const distSellerBtns = [
    { label: "Request User", page: "raise-request", color: "#ea580c" },
    { label: "My Network", page: "my-network", color: "#7c3aed" },
    { label: "💰 PPC Wallet", page: "ppc-wallet", color: "#9333ea" },
    { label: "💸 Withdrawal", page: "withdrawal-request", color: "#16a34a" },
    { label: "Created Users", page: "my-users", color: "#0d9488" },
  ]

  const userBtns = [
    { label: "Request User", page: "raise-request", color: "#ea580c" },
    { label: "My Network", page: "my-network", color: "#7c3aed" },
  ]

  const bottomNav = loggedIn ? [
    { label: "Home", page: "home", icon: "home" },
    { label: "Store", page: "store", icon: "grid" },
    ...(role === "admin"
      ? [{ label: "Network", page: "admin-network", icon: "network" }, { label: "Orders", page: "admin-orders", icon: "box" }]
      : [{ label: "Network", page: "my-network", icon: "network" }, { label: "Orders", page: role === "user" || role === "seller" ? "seller-orders" : "distributor-orders", icon: "box" }]
    ),
    { label: "Profile", page: "my-profile", icon: "user" },
  ] : [
    { label: "Home", page: "home", icon: "home" },
    { label: "Store", page: "store", icon: "grid" },
    { label: "Login", page: "login", icon: "user" },
  ]

  let roleBtns = []
  if (role === "admin") roleBtns = adminBtns
  else if (role === "distributor" || role === "seller") roleBtns = distSellerBtns
  else if (role === "user") roleBtns = userBtns

  const orderBtn = role === "user" || role === "seller"
    ? { label: "My Orders", page: "seller-orders", color: "#1e40af" }
    : role === "distributor"
    ? { label: "Orders", page: "distributor-orders", color: "#166534" }
    : null

  const itemBtnStyle = (color) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
    padding: "9px 12px", borderRadius: 8, background: color + "12", color,
    border: `1px solid ${color}28`, cursor: "pointer", fontSize: 13,
    fontWeight: 700, textAlign: "left", width: "100%",
  })

  const Badge = ({ n }) => n > 0 ? (
    <span style={{ background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: 99, padding: "1px 6px", flexShrink: 0 }}>{n > 9 ? "9+" : n}</span>
  ) : null

  /* ── Shared role-menu body (used in BOTH the desktop dropdown and mobile drawer) ── */
  const RoleMenuBody = () => (
    <>
      <button onClick={() => go("dashboard")} style={itemBtnStyle("#4f46e5")}><span>📊 Dashboard</span></button>
      <button onClick={() => go("my-profile")} style={itemBtnStyle("#475569")}><span>👤 My Profile</span></button>

      <div style={{ height: 1, background: "#f1f5f9", margin: "6px 0" }} />

      {role === "admin" ? (
        adminCategories.map(group => (
          <div key={group.cat}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, padding: "8px 4px 4px" }}>
              {group.cat}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {group.items.map(b => (
                <button key={b.page} onClick={() => go(b.page)} style={itemBtnStyle(b.color)}>
                  <span>{b.label}</span>
                  <Badge n={pageBadge[b.page] || 0} />
                </button>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {roleBtns.map(b => (
            <button key={b.page} onClick={() => go(b.page)} style={itemBtnStyle(b.color)}>
              <span>{b.label}</span>
              <Badge n={pageBadge[b.page] || 0} />
            </button>
          ))}
        </div>
      )}

      {orderBtn && (
        <button onClick={() => go(orderBtn.page)} style={{ ...itemBtnStyle(orderBtn.color), marginTop: 5 }}>
          <span>{orderBtn.label}</span>
          <Badge n={pageBadge[orderBtn.page] || 0} />
        </button>
      )}

      <div style={{ height: 1, background: "#f1f5f9", margin: "6px 0" }} />

      <button onClick={() => setShowLogoutConfirm(true)} style={{ ...itemBtnStyle("#dc2626"), justifyContent: "flex-start" }}>
        <Icon name="logout" size={15} /> Logout
      </button>
    </>
  )

  return (
    <>
      <style>{`
        @keyframes ezNavIn { from { opacity:0; transform:translateY(-8px);} to { opacity:1; transform:translateY(0);} }
        .ez-navbar { animation: ezNavIn 0.4s ease; }
        .ez-nav-link { position:relative; font-size:14px; font-weight:700; color:#475569; text-decoration:none; background:none; border:none; cursor:pointer; padding:6px 2px; transition:color 0.2s; }
        .ez-nav-link::after { content:''; position:absolute; bottom:0; left:0; width:0; height:2px; background:#1e3a8a; transition:width 0.3s; }
        .ez-nav-link:hover { color:#1e3a8a; }
        .ez-nav-link:hover::after { width:100%; }
        .ez-icon-btn { background:none; border:none; cursor:pointer; color:#475569; padding:8px; border-radius:10px; display:flex; align-items:center; justify-content:center; position:relative; transition:background 0.2s, color 0.2s; }
        .ez-icon-btn:hover { background:#f1f5f9; color:#1e3a8a; }
        .ez-search-input { transition: box-shadow 0.2s, background 0.2s; }
        .ez-search-input:focus { background:#fff !important; box-shadow: 0 0 0 4px rgba(30,58,138,0.10); }
        .ez-auth-btn { transition: transform 0.2s, box-shadow 0.2s; }
        .ez-auth-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(30,58,138,0.28); }
        .ez-badge-pulse { animation: ezPulse 1.8s ease-in-out infinite; }
        @keyframes ezPulse { 0%,100%{ transform:scale(1);} 50%{ transform:scale(1.15);} }
        .ez-dropdown { animation: ezDropIn 0.18s ease; transform-origin: top right; }
        @keyframes ezDropIn { from { opacity:0; transform:scale(0.95) translateY(-6px);} to { opacity:1; transform:scale(1) translateY(0);} }
        .ez-bottom-item { transition: color 0.2s, transform 0.15s; }
        .ez-bottom-item:active { transform: scale(0.92); }
      `}</style>

      {/* ─── DESKTOP NAVBAR ─── */}
      <header className="ez-navbar" style={{
        display: isMobile ? "none" : "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        padding: "14px 20px", borderRadius: 14, boxShadow: "0 2px 14px rgba(15,23,42,0.07)",
        border: "1px solid #f1f5f9",
        marginBottom: noBottomMargin ? 0 : 24, position: "sticky", top: 12, zIndex: 500,
        gap: 20,
      }}>
        <h1 onClick={() => go("home")} style={{
          fontWeight: 900, fontSize: 19, cursor: "pointer", margin: 0, color: "#1e3a8a",
          letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <span style={{ fontSize: 22 }}>🎓</span> EDUCA<span style={{ color: "#0f172a" }}>Store</span>
        </h1>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
            <Icon name="search" size={15} />
          </span>
          <input
            className="ez-search-input"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runSearch()}
            placeholder="Search products..."
            style={{
              width: "100%", padding: "10px 14px 10px 38px", background: "#f1f5f9",
              border: "1px solid transparent", borderRadius: 10, fontSize: 13.5, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: 20, flexShrink: 0 }}>
          {publicBtns.map(b => (
            <button key={b.page} className="ez-nav-link" onClick={() => go(b.page)}>{b.label}</button>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <ShareButton compact style={{ width: 34, height: 34, background: "#f1f5f9", color: "#1e3a8a", fontSize: 15 }} />

          {loggedIn && (
            <>
              <NotificationBell isMobile={false} />
              <button className="ez-icon-btn" onClick={() => go("cart")} aria-label="Cart">
                <Icon name="cart" />
                {safeCartCount > 0 && (
                  <span className="ez-badge-pulse" style={{ position: "absolute", top: 2, right: 2, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: "50%", width: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                    {safeCartCount > 9 ? "9+" : safeCartCount}
                  </span>
                )}
              </button>
            </>
          )}

          {!loggedIn ? (
            <button className="ez-auth-btn" onClick={() => go("login")} style={{
              background: "#1e3a8a", color: "#fff", padding: "9px 20px", borderRadius: 10,
              fontWeight: 700, fontSize: 13.5, border: "none", cursor: "pointer",
              boxShadow: "0 4px 12px rgba(30,58,138,0.2)",
            }}>Login</button>
          ) : (
            <div ref={accountRef} style={{ position: "relative" }}>
              <button
                onClick={() => setAccountOpen(o => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, background: "#f1f5f9",
                  border: "1px solid #e2e8f0", borderRadius: 10, padding: "6px 10px 6px 6px",
                  cursor: "pointer",
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: "50%", background: "#1e3a8a", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>{(safeUser.name || safeUser.fullName || "U")[0]?.toUpperCase()}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {safeUser.name || safeUser.fullName || "Account"}
                </span>
                <Icon name="chevron" size={13} />
              </button>

              {accountOpen && (
                <div className="ez-dropdown" style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240,
                  background: "#fff", borderRadius: 14, boxShadow: "0 16px 40px rgba(15,23,42,0.18)",
                  border: "1px solid #f1f5f9", padding: 10, maxHeight: "75vh", overflowY: "auto",
                  display: "flex", flexDirection: "column", gap: 5, zIndex: 600,
                }}>
                  <RoleMenuBody />
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ─── MOBILE APP BAR ─── */}
      <header className="ez-navbar" style={{
        display: isMobile ? "flex" : "none", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: noBottomMargin ? 0 : 16,
        padding: "12px 16px", position: "sticky", top: 0, zIndex: 500,
      }}>
        <h1 style={{ fontWeight: 900, fontSize: 16, color: "#1e3a8a", cursor: "pointer", margin: 0, display: "flex", alignItems: "center", gap: 6 }} onClick={() => go("home")}>
          <span style={{ fontSize: 18 }}>🎓</span> EDUCA<span style={{ color: "#0f172a" }}>Store</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ShareButton compact style={{ background: "rgba(30,58,138,0.08)", color: "#1e3a8a", width: 32, height: 32, fontSize: 15 }} />
          {loggedIn && (
            <>
              <NotificationBell isMobile={true} />
              <button className="ez-icon-btn" onClick={() => go("cart")} aria-label="Cart">
                <Icon name="cart" size={19} />
                {safeCartCount > 0 && (
                  <span className="ez-badge-pulse" style={{ position: "absolute", top: 2, right: 2, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: "50%", width: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {safeCartCount > 9 ? "9+" : safeCartCount}
                  </span>
                )}
              </button>
            </>
          )}
          <button className="ez-icon-btn" onClick={() => setMenuOpen(p => !p)} aria-label="Menu">
            <Icon name={menuOpen ? "close" : "menu"} size={20} />
          </button>
        </div>
      </header>

      {/* ─── MOBILE SEARCH (below app bar, matches new design) ─── */}
      {isMobile && (
        <div style={{ margin: noBottomMargin ? "10px 16px" : "0 16px 14px", position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
            <Icon name="search" size={14} />
          </span>
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runSearch()}
            placeholder="Search products..."
            style={{
              width: "100%", padding: "10px 14px 10px 38px", background: "#f1f5f9",
              border: "1px solid transparent", borderRadius: 12, fontSize: 13.5, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* ─── MOBILE DRAWER ─── */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 900, display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.45)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(280px, 85vw)", maxWidth: 280, background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "ezDropIn 0.22s ease" }}>

            <div style={{ padding: "16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>Menu</span>
              <button className="ez-icon-btn" onClick={() => setMenuOpen(false)}><Icon name="close" size={18} /></button>
            </div>

            <div style={{ padding: "12px", paddingBottom: "100px", display: "flex", flexDirection: "column", gap: 6, flex: "1 1 auto", minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
              {publicBtns.map(b => (
                <button key={b.page} onClick={() => go(b.page)} style={itemBtnStyle("#1e3a8a")}>
                  <span>{b.label}</span>
                </button>
              ))}

              {loggedIn ? (
                <>
                  <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                  <RoleMenuBody />
                </>
              ) : (
                <button onClick={() => go("login")} style={{ ...itemBtnStyle("#1e293b"), justifyContent: "center", marginTop: 4 }}>Login</button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav style={{
        display: isMobile ? "flex" : "none", position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)",
        borderTop: "1px solid #e2e8f0", zIndex: 400,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {bottomNav.map(item => (
          <button key={item.page} className="ez-bottom-item" onClick={() => go(item.page)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "9px 4px", background: "none", border: "none", cursor: "pointer", gap: 3, color: "#94a3b8" }}>
            <Icon name={item.icon} size={20} />
            <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.2 }}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ✅ Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setShowLogoutConfirm(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "24px", width: "min(320px, 85vw)", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🚪</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>Logout karna hai?</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Aap dobara login kar ke wapas aa sakte ho</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => { setShowLogoutConfirm(false); setMenuOpen(false); logout && logout(); go("home") }}
                style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
