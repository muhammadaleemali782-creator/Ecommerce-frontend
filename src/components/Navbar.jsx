import React, { useState, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import NotificationBell from "./NotificationBell"

export default function Navbar({ setPage, cartCount, pageBadge = {} }) {
  const { loggedIn, logout, user } = useAuth() || {}
  const safeUser = user || {}
  const role = safeUser?.role || "guest"
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}
  const safeCartCount = Number(cartCount) || 0
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const go = useCallback((pg, sectionId) => {
    safeSetPage(pg)
    setMobileMenuOpen(false)
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 80)
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [safeSetPage])

  const toggleMobile = useCallback(() => setMobileMenuOpen(prev => !prev), [])

  // ── Role-based Desktop Nav Items ──
  const publicLinks = [
    { label: "HOME", pg: "home" },
    { label: "HEALTH", pg: "home", section: "billboard-ayurved" },
    { label: "ROGSETU", pg: "home", section: "billboard-rogsetu" },
    { label: "GURUKUL", pg: "home", section: "billboard-gurukul" },
    { label: "FINANCE", pg: "home", section: "billboard-banking" },
    { label: "SHOP", pg: "store", badge: safeCartCount > 0 ? safeCartCount : null },
  ]

  const roleLinks = {
    user: [
      { label: "ORDERS", pg: "orders" },
      { label: "MY PROFILE", pg: "my-profile" },
      { label: "WALLET", pg: "coin-wallet" },
    ],
    seller: [
      { label: "ORDERS", pg: "seller-orders" },
      { label: "MY PROFILE", pg: "my-profile" },
      { label: "WALLET", pg: "coin-wallet" },
      { label: "TEAM", pg: "my-users" },
    ],
    distributor: [
      { label: "DASHBOARD", pg: "dashboard" },
      { label: "ORDERS", pg: "distributor-orders" },
      { label: "MY TEAM", pg: "my-users" },
      { label: "WALLET", pg: "coin-wallet" },
      { label: "PPC", pg: "ppc-wallet" },
    ],
    admin: [
      { label: "ADMIN PANEL", pg: "admin", accent: true },
      { label: "PRODUCTS", pg: "admin-products" },
      { label: "USERS", pg: "admin-users" },
      { label: "ORDERS", pg: "admin-orders" },
    ],
  }

  const loggedInLinks = loggedIn ? (roleLinks[role] || roleLinks.user) : []
  const desktopLinks = [...publicLinks, ...loggedInLinks]

  const NavLink = ({ label, pg, section, badge, accent }) => (
    <button
      onClick={() => go(pg, section)}
      className={`relative px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap ${
        accent
          ? "bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 hover:text-amber-200 border border-amber-500/30"
          : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
      }`}
    >
      {label}
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 text-black text-[8px] font-black flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )

  return (
    <header
      className="sticky top-0 z-50 bg-black/96 text-white select-none border-b border-white/[0.07]"
      style={{ willChange: "transform", transform: "translateZ(0)" }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-13 flex items-center justify-between gap-2">

        {/* ── Logo ── */}
        <div
          className="flex items-center gap-2 cursor-pointer group shrink-0 z-20"
          onClick={() => go("home")}
        >
          <div className="w-[14px] h-[22px] border-[2.5px] border-[#fbbf24] group-hover:bg-[#fbbf24]/15 group-hover:shadow-[0_0_10px_rgba(251,191,36,0.4)] transition-all duration-200 rounded-[1px]" />
          <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.18em] text-white group-hover:text-[#fbbf24] transition-colors whitespace-nowrap leading-none">
            EDUCA VEDA
          </span>
        </div>

        {/* ── DESKTOP NAV — always visible, role-based ── */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center overflow-x-auto no-scrollbar px-2">
          {desktopLinks.map((link, i) => (
            <NavLink key={i} {...link} />
          ))}
        </nav>

        {/* ── DESKTOP RIGHT: Notification + Auth ── */}
        <div className="hidden lg:flex items-center gap-2 shrink-0 z-20">
          {loggedIn && <NotificationBell isMobile={false} />}

          {loggedIn ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => go(role === "admin" ? "admin" : "dashboard")}
                className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[#fbbf24]/40 flex items-center justify-center text-xs font-bold text-[#fbbf24] hover:scale-105 transition-transform cursor-pointer"
                title={safeUser?.name || "Dashboard"}
              >
                {safeUser?.name ? safeUser.name[0].toUpperCase() : "👤"}
              </button>
              <button
                onClick={logout}
                className="text-[9px] uppercase font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-[#141414] hover:bg-red-950/50 transition-colors cursor-pointer"
              >
                OUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => go("login")}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white hover:text-black text-white text-[10.5px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap border border-white/20 hover:border-white"
            >
              SIGN IN
            </button>
          )}
        </div>

        {/* ── MOBILE RIGHT: Bell + Hamburger ── */}
        <div className="flex lg:hidden items-center gap-2 z-20">
          {loggedIn && <NotificationBell isMobile={true} />}
          <button
            onClick={toggleMobile}
            className="w-9 h-9 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer border border-white/10"
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-4.5 h-4.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER — CSS translate (no mount/unmount churn) ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ willChange: "max-height, opacity" }}
      >
        <div className="bg-[#090c0a]/98 backdrop-blur-xl px-4 py-4 border-b border-white/[0.08]">

          {/* Public links */}
          <div className="flex flex-col gap-0.5 mb-3">
            {publicLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => go(link.pg, link.section)}
                className="text-left py-2.5 px-3 rounded-xl hover:bg-white/[0.06] text-slate-200 hover:text-white flex items-center justify-between cursor-pointer transition-colors text-[11px] font-bold uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  {link.label}
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-black text-[8px] font-black">
                      {link.badge}
                    </span>
                  )}
                </span>
                <span className="text-xs opacity-30">›</span>
              </button>
            ))}
          </div>

          {/* Role-specific links after login */}
          {loggedIn && loggedInLinks.length > 0 && (
            <div className="flex flex-col gap-0.5 mb-3 pt-2 border-t border-white/[0.06]">
              <div className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-500/70">
                {role === "admin" ? "ADMIN" : role === "distributor" ? "DISTRIBUTOR" : role === "seller" ? "SELLER" : "MY ACCOUNT"}
              </div>
              {loggedInLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => go(link.pg)}
                  className={`text-left py-2.5 px-3 rounded-xl hover:bg-white/[0.06] flex items-center justify-between cursor-pointer transition-colors text-[11px] font-bold uppercase tracking-wider ${
                    link.accent ? "text-amber-400 hover:text-amber-300" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="text-xs opacity-30">›</span>
                </button>
              ))}
            </div>
          )}

          {/* Auth section at bottom */}
          <div className="pt-2.5 border-t border-white/[0.06]">
            {loggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => go(role === "admin" ? "admin" : "dashboard")}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-[9px] font-black flex items-center justify-center">
                    {safeUser?.name ? safeUser.name[0].toUpperCase() : "U"}
                  </span>
                  <span>{safeUser?.name || "DASHBOARD"}</span>
                </button>
                <button
                  onClick={logout}
                  className="py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => go("login")}
                className="w-full py-3 rounded-xl bg-white text-black hover:bg-amber-50 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <span>SIGN IN TO ACCOUNT</span>
                <span>›</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
