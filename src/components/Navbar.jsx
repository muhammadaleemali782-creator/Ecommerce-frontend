import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import NotificationBell from "./NotificationBell"

export default function Navbar({ setPage, cartCount, pageBadge = {} }) {
  const { loggedIn, logout, user } = useAuth() || {}
  const safeUser = user || {}
  const role = safeUser?.role || "guest"
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}
  const safeCartCount = Number(cartCount) || 0
  const isBlocked = safeUser?.isBlocked || false
  const isDeleted = safeUser?.isDeleted || false
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768)
      setWinSize({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const go = (page) => { safeSetPage(page); setMenuOpen(false) }

  if (loggedIn && (isBlocked || isDeleted)) {
    return (
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fef2f2", padding:"12px 16px", marginBottom:16, borderRadius:8, boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
        <span style={{ fontWeight:700, color:"#dc2626" }}>Account Disabled</span>
        <button onClick={() => { logout && logout(); go("login") }} style={{ padding:"6px 14px", borderRadius:6, background:"#dc2626", color:"#fff", border:"none", cursor:"pointer", fontSize:13, fontWeight:600 }}>Logout</button>
      </header>
    )
  }

  const publicBtns = [
    { label:"home",     page:"home",     color:"#3b82f6" },
    { label:"services", page:"services", color:"#3b82f6" },
    { label:"store",    page:"store",    color:"#3b82f6" },
  ]

  const adminBtns = [
    { label:"Admin Panel",        page:"admin",                      color:"#7c3aed" },
    { label:"Network View",       page:"admin-network",              color:"#a21caf" },
    { label:"Add Product",        page:"admin-add-product",          color:"#ea580c" },
    { label:"Manage Products",    page:"admin-products",             color:"#dc2626" },
    { label:"Manage Users",       page:"admin-users",                color:"#1e293b" },
    { label:"User Requests",      page:"admin-requests",             color:"#db2777" },
    { label:"Requests History",   page:"admin-requests-history",     color:"#4b5563" },
    { label:"Password Reset",     page:"admin-password-reset",       color:"#b91c1c" },
    { label:"💰 PPC Settings",    page:"admin-ppc-settings",         color:"#9333ea" },
    { label:"💳 Withdrawals",     page:"admin-withdrawal-management",color:"#ea580c" },
    { label:"📧 Email Settings",  page:"email-settings",             color:"#4f46e5" },
    { label:"Orders",             page:"admin-orders",               color:"#0f766e" },
    { label:"🧾 Invoice Settings",page:"admin-invoice-settings",    color:"#0891b2" },
    { label:"Created Users",      page:"my-users",                   color:"#0d9488" },
    { label:"☢️ Data Purge",      page:"admin-nuke",                 color:"#7f1d1d" },
  ]

  const distSellerBtns = [
    { label:"Request User",  page:"raise-request",      color:"#ea580c" },
    { label:"My Network",    page:"my-network",         color:"#7c3aed" },
    { label:"💰 PPC Wallet", page:"ppc-wallet",         color:"#9333ea" },
    { label:"💸 Withdrawal", page:"withdrawal-request", color:"#16a34a" },
    { label:"Created Users", page:"my-users",           color:"#0d9488" },
  ]

  const userBtns = [
    { label:"Request User", page:"raise-request", color:"#ea580c" },
    { label:"My Network",   page:"my-network",    color:"#7c3aed" },
  ]

  const bottomNav = loggedIn ? [
    { label:"Home",    page:"home",    icon:"🏠" },
    { label:"Store",   page:"store",   icon:"🛒" },
    ...(role === "admin"
      ? [{ label:"Network", page:"admin-network", icon:"🌐" }, { label:"Orders", page:"admin-orders", icon:"📦" }]
      : [{ label:"Network", page:"my-network",    icon:"🌐" }, { label:"Orders", page: role === "user" || role === "seller" ? "seller-orders" : "distributor-orders", icon:"📦" }]
    ),
    { label:"Profile", page:"my-profile", icon:"👤" },
  ] : [
    { label:"Home",  page:"home",  icon:"🏠" },
    { label:"Store", page:"store", icon:"🛒" },
    { label:"Login", page:"login", icon:"👤" },
  ]

  let roleBtns = []
  if (role === "admin")                               roleBtns = adminBtns
  else if (role === "distributor" || role === "seller") roleBtns = distSellerBtns
  else if (role === "user")                           roleBtns = userBtns

  const orderBtn = role === "user" || role === "seller"
    ? { label:"My Orders", page:"seller-orders",      color:"#1e40af" }
    : role === "distributor"
    ? { label:"Orders",    page:"distributor-orders", color:"#166534" }
    : null

  const btnStyle = (color) => ({
    padding:"4px 12px", borderRadius:6, background:color, color:"#fff",
    border:"none", cursor:"pointer", fontSize:13, fontWeight:600
  })

  /* ── Button with notification badge ── */
  const BtnBadge = ({ label, page: pg, color }) => {
    const badge = pageBadge[pg] || 0
    return (
      <button
        onClick={() => go(pg)}
        style={{ ...btnStyle(color), position:"relative" }}
      >
        {label}
        {badge > 0 && (
          <span style={{
            position:"absolute", top:-6, right:-6,
            background:"#ef4444", color:"#fff",
            fontSize:9, fontWeight:800,
            borderRadius:"50%", minWidth:16, height:16,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"0 2px", border:"2px solid #fff",
            pointerEvents:"none"
          }}>
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
    )
  }

  const drawerBtnStyle = (color) => ({
    padding:"10px 14px", borderRadius:8, background:color+"15", color,
    border:`1px solid ${color}30`, cursor:"pointer", fontSize:13,
    fontWeight:600, textAlign:"left", width:"100%"
  })

  return (
    <>
      {/* ─── DESKTOP NAVBAR ─── */}
      <header style={{ display:isMobile?"none":"flex", justifyContent:"space-between", alignItems:"center", background:"#fff", padding:"16px", borderRadius:8, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", marginBottom:24, flexWrap:"wrap", gap:8 }}>
        <h1 style={{ fontWeight:800, fontSize:18, cursor:"pointer", margin:0, color:"#1e293b" }} onClick={() => go("home")}>My E-Commerce Store</h1>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
          {publicBtns.map(b => (
            <button key={b.page} onClick={() => go(b.page)} style={btnStyle(b.color)}>{b.label}</button>
          ))}

          {loggedIn && (
            <button onClick={() => go("cart")} style={btnStyle("#ca8a04")}>Cart ({safeCartCount})</button>
          )}

          {!loggedIn ? (
            <button onClick={() => go("login")} style={btnStyle("#1e293b")}>Login</button>
          ) : (
            <>
              <button onClick={() => go("dashboard")}  style={btnStyle("#4f46e5")}>Dashboard</button>
              <button onClick={() => go("my-profile")} style={btnStyle("#475569")}>👤 My Profile</button>
              <button onClick={() => setShowLogoutConfirm(true)} style={btnStyle("#dc2626")}>🚪 Logout</button>
              {roleBtns.map(b => (
                <BtnBadge key={b.page} label={b.label} page={b.page} color={b.color} />
              ))}
              {orderBtn && (
                <BtnBadge label={orderBtn.label} page={orderBtn.page} color={orderBtn.color} />
              )}
              <button onClick={() => setShowLogoutConfirm(true)} style={btnStyle("#dc2626")}>Logout</button>
              {/* 🔔 Bell — ekdum right side, last item */}
              <NotificationBell isMobile={false} />
            </>
          )}
        </div>
      </header>

      {/* ─── MOBILE TOP BAR ─── */}
      <header style={{ display:isMobile?"flex":"none", alignItems:"center", justifyContent:"space-between", background:"#fff", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", marginBottom:16, padding:"10px 16px", position:"sticky", top:0, zIndex:100 }}>
        <h1 style={{ fontWeight:800, fontSize:15, color:"#1e293b", cursor:"pointer", margin:0 }} onClick={() => go("home")}>My E-Commerce Store</h1>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {loggedIn && (
            <>
              {/* 🔔 Notification Bell — Mobile */}
              <NotificationBell isMobile={true} />
              <button onClick={() => go("cart")} style={{ fontSize:20, background:"none", border:"none", cursor:"pointer", position:"relative" }}>
              🛒
              {safeCartCount > 0 && (
                <span style={{ position:"absolute", top:-4, right:-6, background:"#ef4444", color:"#fff", fontSize:9, fontWeight:700, borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center" }}>{safeCartCount}</span>
              )}
            </button>
            </>
          )}
          <button onClick={() => setMenuOpen(p => !p)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, padding:4 }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* ─── MOBILE DRAWER ─── */}
      {menuOpen && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:200, display:"flex", flexDirection:"column" }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"min(260px, 85vw)", maxWidth:260, background:"#fff", boxShadow:"-4px 0 24px rgba(0,0,0,0.15)", display:"flex", flexDirection:"column", overflow:"hidden" }}>

            <div style={{ padding:"16px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
              <span style={{ fontWeight:800, fontSize:15, color:"#1e293b" }}>Menu</span>
              <button onClick={() => setMenuOpen(false)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#64748b" }}>✕</button>
            </div>

            <div style={{ padding:"12px", paddingBottom:"100px", display:"flex", flexDirection:"column", gap:6, flex:"1 1 auto", minHeight:0, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
              {publicBtns.map(b => (
                <button key={b.page} onClick={() => go(b.page)} style={drawerBtnStyle(b.color)}>
                  {b.label.charAt(0).toUpperCase() + b.label.slice(1)}
                </button>
              ))}

              {loggedIn && (
                <>
                  <div style={{ height:1, background:"#f1f5f9", margin:"4px 0" }} />
                  <button onClick={() => go("dashboard")}  style={drawerBtnStyle("#4f46e5")}>📊 Dashboard</button>
                  <button onClick={() => go("my-profile")} style={drawerBtnStyle("#475569")}>👤 My Profile</button>
                  <button onClick={() => setShowLogoutConfirm(true)} style={drawerBtnStyle("#dc2626")}>🚪 Logout</button>
                  <div style={{ height:1, background:"#f1f5f9", margin:"4px 0" }} />
                  {roleBtns.map(b => {
                    const badge = pageBadge[b.page] || 0
                    return (
                      <button key={b.page} onClick={() => go(b.page)} style={{ ...drawerBtnStyle(b.color), position:"relative" }}>
                        {b.label}
                        {badge > 0 && (
                          <span style={{ marginLeft:6, background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800, borderRadius:99, padding:"1px 6px" }}>
                            {badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                  {orderBtn && (
                    <button onClick={() => go(orderBtn.page)} style={{ ...drawerBtnStyle(orderBtn.color), position:"relative" }}>
                      {orderBtn.label}
                      {(pageBadge[orderBtn.page] || 0) > 0 && (
                        <span style={{ marginLeft:6, background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800, borderRadius:99, padding:"1px 6px" }}>
                          {pageBadge[orderBtn.page]}
                        </span>
                      )}
                    </button>
                  )}
                </>
              )}

              {!loggedIn && (
                <button onClick={() => go("login")} style={{ ...btnStyle("#1e293b"), width:"100%", padding:"10px 14px", borderRadius:8, textAlign:"left" }}>Login</button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav style={{ display:isMobile?"flex":"none", position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:"1px solid #e2e8f0", zIndex:50 }}>
        {bottomNav.map(item => (
          <button key={item.page} onClick={() => go(item.page)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"8px 4px", background:"none", border:"none", cursor:"pointer", gap:2 }}>
            <span style={{ fontSize:18 }}>{item.icon}</span>
            <span style={{ fontSize:9, color:"#64748b", fontWeight:600 }}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile bottom spacer */}
      <div style={{ display:isMobile?"block":"none", height:60 }} />

      {/* ✅ Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} onClick={() => setShowLogoutConfirm(false)} />
          <div style={{ position:"relative", background:"#fff", borderRadius:16, padding:"24px", width:"min(320px, 85vw)", boxShadow:"0 10px 40px rgba(0,0,0,0.2)", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>🚪</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#1e293b", marginBottom:6 }}>Logout karna hai?</div>
            <div style={{ fontSize:13, color:"#94a3b8", marginBottom:20 }}>Aap dobara login kar ke wapas aa sakte ho</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowLogoutConfirm(false)}
                style={{ flex:1, padding:"12px 0", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#fff", color:"#64748b", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={() => { setShowLogoutConfirm(false); setMenuOpen(false); logout && logout(); go("home") }}
                style={{ flex:1, padding:"12px 0", borderRadius:10, border:"none", background:"#dc2626", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
