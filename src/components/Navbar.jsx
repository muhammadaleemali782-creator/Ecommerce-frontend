import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { openFinanceService, openEducation } from "../utils/financeLink"

export default function Navbar({ setPage, cartCount, pageBadge = {} }) {
  const { loggedIn, logout, user } = useAuth() || {}
  const safeUser = user || {}
  const role = safeUser?.role || "guest"
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}
  const safeCartCount = Number(cartCount) || 0
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  useEffect(() => {
    if (!accountOpen) return
    const onClick = (e) => { if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false) }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [accountOpen])

  const go = (page) => { safeSetPage(page); setMobileMenuOpen(false); setAccountOpen(false) }

  const adminCategories = [
    { cat: "📊 Dashboard", items: [{ label: "Network View", page: "admin-network" }, { label: "Orders", page: "admin-orders" }] },
    { cat: "📦 Products", items: [{ label: "Add Product", page: "admin-add-product" }, { label: "Manage Products", page: "admin-products" }] },
    { cat: "👥 Users & Requests", items: [{ label: "Manage Users", page: "admin-users" }, { label: "User Requests", page: "admin-requests" }, { label: "Requests History", page: "admin-requests-history" }, { label: "Password Reset", page: "admin-password-reset" }] },
    { cat: "💰 Finance Admin", items: [{ label: "PPC Settings", page: "admin-ppc-settings" }, { label: "Withdrawals", page: "admin-withdrawal-management" }, { label: "Invoice Settings", page: "admin-invoice-settings" }] },
    { cat: "⚙️ Settings", items: [{ label: "Email Settings", page: "email-settings" }] },
  ]
  const distSellerBtns = [
    { label: "Request User", page: "raise-request" },
    { label: "My Network", page: "my-network" },
    { label: "PPC Wallet", page: "ppc-wallet" },
    { label: "Withdrawal", page: "withdrawal-request" },
    { label: "Created Users", page: "my-users" },
  ]
  const userBtns = [
    { label: "Request User", page: "raise-request" },
    { label: "My Network", page: "my-network" },
  ]
  let roleBtns = []
  if (role === "distributor" || role === "seller") roleBtns = distSellerBtns
  else if (role === "user") roleBtns = userBtns
  const orderBtn = role === "user" || role === "seller" ? { label: "My Orders", page: "seller-orders" }
    : role === "distributor" ? { label: "Orders", page: "distributor-orders" } : null

  const AccountMenuBody = () => (
    <>
      <button onClick={() => go("my-profile")} className="ev-menu-item">👤 My Profile</button>
      <div className="ev-menu-divider" />
      {role === "admin" ? (
        adminCategories.map(group => (
          <div key={group.cat}>
            <div className="ev-menu-group">{group.cat}</div>
            {group.items.map(b => (
              <button key={b.page} onClick={() => go(b.page)} className="ev-menu-item">
                {b.label}
                {pageBadge[b.page] > 0 && <span className="ev-menu-badge">{pageBadge[b.page]}</span>}
              </button>
            ))}
          </div>
        ))
      ) : (
        roleBtns.map(b => (
          <button key={b.page} onClick={() => go(b.page)} className="ev-menu-item">
            {b.label}
            {pageBadge[b.page] > 0 && <span className="ev-menu-badge">{pageBadge[b.page]}</span>}
          </button>
        ))
      )}
      {orderBtn && <button onClick={() => go(orderBtn.page)} className="ev-menu-item">{orderBtn.label}</button>}
      <div className="ev-menu-divider" />
      <button onClick={() => { logout && logout(); go("home") }} className="ev-menu-item ev-menu-danger">🚪 Logout</button>
    </>
  )

  return (
    <>
      <style>{`
        .ev-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .ev-navbar { position: sticky; top: 0; z-index: 1000; background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
        .ev-logo-box { display:flex; align-items:center; gap:8px; background:none; border:none; cursor:pointer; }
        .ev-logo-icon { background:#1e3a8a; color:#fff; width:36px; height:36px; border-radius:10px; font-weight:800; font-size:18px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ev-logo-text { font-family:'Playfair Display', serif; font-size:22px; font-weight:800; color:#0f172a; letter-spacing:0.5px; }
        .ev-logo-text .accent { color:#d97706; }
        .ev-nav-links { display:flex; align-items:center; gap:24px; }
        .ev-nav-link { font-size:14px; font-weight:600; color:#475569; background:none; border:none; cursor:pointer; transition: color 0.2s; padding:4px 0; }
        .ev-nav-link:hover { color:#1e3a8a; }
        .ev-nav-link.teal:hover { color:#0f766e; }
        .ev-actions { display:flex; align-items:center; gap:12px; }
        .ev-btn-outline { padding:8px 18px; font-size:13px; font-weight:700; color:#1e3a8a; border:1.5px solid #1e3a8a; border-radius:999px; background:none; cursor:pointer; transition:all 0.2s; }
        .ev-btn-outline:hover { background:#eff6ff; }
        .ev-btn-solid { padding:9px 20px; font-size:13px; font-weight:700; color:#fff; background:#1e3a8a; border:none; border-radius:999px; cursor:pointer; box-shadow:0 4px 10px rgba(30,58,138,0.25); transition:all 0.2s; }
        .ev-btn-solid:hover { background:#1e40af; transform:translateY(-1px); }
        .ev-cart-btn { position:relative; background:none; border:none; cursor:pointer; color:#475569; font-size:18px; padding:8px; border-radius:8px; }
        .ev-cart-btn:hover { background:#f1f5f9; color:#1e3a8a; }
        .ev-cart-badge { position:absolute; top:0; right:0; background:#d97706; color:#fff; font-size:9px; font-weight:800; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; }
        .ev-avatar-btn { display:flex; align-items:center; gap:6px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:999px; padding:5px 12px 5px 5px; cursor:pointer; }
        .ev-avatar-circle { width:26px; height:26px; border-radius:50%; background:#1e3a8a; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; }
        .ev-dropdown { position:absolute; top:calc(100% + 10px); right:0; width:250px; background:#fff; border-radius:16px; box-shadow:0 20px 40px rgba(15,23,42,0.15); border:1px solid #f1f5f9; padding:10px; max-height:70vh; overflow-y:auto; z-index:600; animation: evDrop 0.15s ease; }
        @keyframes evDrop { from { opacity:0; transform:translateY(-6px);} to { opacity:1; transform:translateY(0);} }
        .ev-menu-item { display:flex; justify-content:space-between; align-items:center; width:100%; text-align:left; padding:9px 12px; border-radius:9px; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; color:#334155; }
        .ev-menu-item:hover { background:#f1f5f9; }
        .ev-menu-danger { color:#dc2626; }
        .ev-menu-divider { height:1px; background:#f1f5f9; margin:6px 0; }
        .ev-menu-group { font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; padding:8px 4px 2px; }
        .ev-menu-badge { background:#ef4444; color:#fff; font-size:9px; font-weight:800; border-radius:99px; padding:1px 6px; }
        .ev-mobile-toggle { display:none; background:none; border:none; font-size:22px; color:#1e293b; cursor:pointer; }
        @media (max-width: 900px) {
          .ev-nav-links, .ev-actions .ev-btn-outline { display:none; }
          .ev-mobile-toggle { display:block; }
        }
        .ev-mobile-drawer { position:fixed; inset:0; background:#fff; z-index:2000; padding:28px 24px; display:flex; flex-direction:column; gap:20px; }
        .ev-mobile-link { font-family:'Playfair Display',serif; font-size:22px; font-weight:800; color:#0f172a; background:none; border:none; text-align:left; cursor:pointer; }
      `}</style>

      <nav className="ev-navbar ev-root">
        <button className="ev-logo-box" onClick={() => go("home")}>
          <span className="ev-logo-icon">✧</span>
          <span className="ev-logo-text">EDUCA <span className="accent">VEDA</span></span>
        </button>

        <div className="ev-nav-links">
          <button className="ev-nav-link" onClick={() => go("home")}>Overview</button>
          <button className="ev-nav-link teal" onClick={() => go("store")}>Ayurveda</button>
          <button className="ev-nav-link" onClick={openEducation}>Education</button>
          <button className="ev-nav-link teal" onClick={() => openFinanceService(safeSetPage)}>Wallet</button>
          <button className="ev-nav-link" onClick={() => openFinanceService(safeSetPage)}>Finance</button>
        </div>

        <div className="ev-actions">
          {loggedIn && (
            <button className="ev-cart-btn" onClick={() => go("cart")} aria-label="Cart">
              <i className="fa-solid fa-cart-shopping"></i>
              {safeCartCount > 0 && <span className="ev-cart-badge">{safeCartCount > 9 ? "9+" : safeCartCount}</span>}
            </button>
          )}

          {!loggedIn ? (
            <>
              <button className="ev-btn-outline" onClick={() => go("login")}>Sign In</button>
              <button className="ev-btn-solid" onClick={() => go("store")}>Launch App</button>
            </>
          ) : (
            <div ref={accountRef} style={{ position: "relative" }}>
              <button className="ev-avatar-btn" onClick={() => setAccountOpen(o => !o)}>
                <span className="ev-avatar-circle">{(safeUser.name || safeUser.fullName || "U")[0]?.toUpperCase()}</span>
              </button>
              {accountOpen && (
                <div className="ev-dropdown">
                  <AccountMenuBody />
                </div>
              )}
            </div>
          )}

          <button className="ev-mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="ev-mobile-drawer ev-root">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="ev-logo-text">EDUCA <span className="accent">VEDA</span></span>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <button className="ev-mobile-link" onClick={() => go("home")}>Overview</button>
          <button className="ev-mobile-link" onClick={() => go("store")}>Ayurveda</button>
          <button className="ev-mobile-link" onClick={openEducation}>Education</button>
          <button className="ev-mobile-link" onClick={() => openFinanceService(safeSetPage)}>Wallet</button>
          <button className="ev-mobile-link" onClick={() => openFinanceService(safeSetPage)}>Finance</button>
          <div className="ev-menu-divider" />
          {loggedIn ? (
            <>
              <button className="ev-mobile-link" style={{ fontSize: 16 }} onClick={() => go("my-profile")}>My Profile</button>
              {orderBtn && <button className="ev-mobile-link" style={{ fontSize: 16 }} onClick={() => go(orderBtn.page)}>{orderBtn.label}</button>}
              {roleBtns.map(b => (
                <button key={b.page} className="ev-mobile-link" style={{ fontSize: 16 }} onClick={() => go(b.page)}>{b.label}</button>
              ))}
              {role === "admin" && adminCategories.flatMap(g => g.items).map(b => (
                <button key={b.page} className="ev-mobile-link" style={{ fontSize: 16 }} onClick={() => go(b.page)}>{b.label}</button>
              ))}
              <button className="ev-btn-solid" style={{ marginTop: 10 }} onClick={() => { logout && logout(); go("home") }}>Logout</button>
            </>
          ) : (
            <button className="ev-btn-solid" style={{ marginTop: 10 }} onClick={() => go("login")}>Sign In</button>
          )}
        </div>
      )}
    </>
  )
}
