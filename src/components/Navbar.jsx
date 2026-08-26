import React, { useState, useCallback, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import NotificationBell from "./NotificationBell"

export default function Navbar({ setPage, cartCount, pageBadge = {} }) {
  const { loggedIn, logout, user } = useAuth() || {}
  const safeUser = user || {}
  const role = safeUser?.role || "guest"
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}
  const safeCartCount = Number(cartCount) || 0
  const [ribbonOpen, setRibbonOpen] = useState(false)   // desktop ribbon toggle
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile LEFT sidebar

  // Close sidebar on route change
  const go = useCallback((pg, sectionId) => {
    safeSetPage(pg)
    setSidebarOpen(false)
    setRibbonOpen(false)
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 80)
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [safeSetPage])

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [sidebarOpen])

  // ── All Role-Based Nav Items ──
  const publicLinks = [
    { label: "HOME", pg: "home" },
    { label: "HEALTH", pg: "home", section: "billboard-ayurved" },
    { label: "ROGSETU", pg: "home", section: "billboard-rogsetu" },
    { label: "GURUKUL", pg: "home", section: "billboard-gurukul" },
    { label: "FINANCE", pg: "home", section: "billboard-banking" },
    { label: "SHOP", pg: "store", badge: safeCartCount > 0 ? safeCartCount : null },
  ]

  const roleNavItems = {
    admin: {
      label: "ADMIN",
      color: "text-amber-400",
      links: [
        { label: "ADMIN PANEL", pg: "admin", accent: true },
        { label: "PRODUCTS", pg: "admin-products" },
        { label: "ALL USERS", pg: "admin-users" },
        { label: "ALL ORDERS", pg: "admin-orders" },
        { label: "REQUESTS", pg: "admin-requests" },
        { label: "REQ HISTORY", pg: "admin-requests-history" },
        { label: "PPC SETTINGS", pg: "admin-ppc-settings" },
        { label: "WITHDRAWALS", pg: "admin-withdrawal-management" },
        { label: "EMAIL SETTINGS", pg: "email-settings" },
        { label: "BANNERS", pg: "admin-banners" },
        { label: "SERVICES", pg: "admin-services" },
        { label: "NETWORK VIEW", pg: "admin-network" },
        { label: "NUKE DATA ⚠", pg: "admin-nuke", danger: true },
        { label: "INVOICE SETTINGS", pg: "admin-invoice-settings" },
      ]
    },
    distributor: {
      label: "DISTRIBUTOR",
      color: "text-sky-400",
      links: [
        { label: "DASHBOARD", pg: "dashboard" },
        { label: "MY ORDERS", pg: "distributor-orders" },
        { label: "MY TEAM", pg: "my-users" },
        { label: "MY NETWORK", pg: "my-network" },
        { label: "MY PROFILE", pg: "my-profile" },
        { label: "COIN WALLET", pg: "coin-wallet" },
        { label: "PPC WALLET", pg: "ppc-wallet" },
        { label: "MY COMMISSION", pg: "my-commission" },
        { label: "RAISE REQUEST", pg: "raise-request" },
        { label: "CREATE SELLER", pg: "create-seller" },
        { label: "WITHDRAWAL", pg: "withdrawal-request" },
      ]
    },
    seller: {
      label: "SELLER",
      color: "text-emerald-400",
      links: [
        { label: "DASHBOARD", pg: "dashboard" },
        { label: "MY ORDERS", pg: "seller-orders" },
        { label: "MY TEAM", pg: "my-users" },
        { label: "MY PROFILE", pg: "my-profile" },
        { label: "COIN WALLET", pg: "coin-wallet" },
        { label: "PPC WALLET", pg: "ppc-wallet" },
        { label: "MY COMMISSION", pg: "my-commission" },
        { label: "MY NETWORK", pg: "my-network" },
        { label: "RAISE REQUEST", pg: "raise-request" },
        { label: "WITHDRAWAL", pg: "withdrawal-request" },
      ]
    },
    user: {
      label: "MY ACCOUNT",
      color: "text-violet-400",
      links: [
        { label: "MY ORDERS", pg: "orders" },
        { label: "MY PROFILE", pg: "my-profile" },
        { label: "COIN WALLET", pg: "coin-wallet" },
        { label: "RAISE REQUEST", pg: "raise-request" },
      ]
    }
  }

  const currentRoleData = loggedIn ? (roleNavItems[role] || roleNavItems.user) : null

  // ── Desktop Ribbon Nav Button ──
  const RibbonBtn = ({ label, pg, section, badge }) => (
    <button
      onClick={() => go(pg, section)}
      className="relative px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.12] text-slate-300 hover:text-white text-[10.5px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap border border-transparent hover:border-white/10"
    >
      {label}
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 text-black text-[8px] font-black flex items-center justify-center leading-none">
          {badge}
        </span>
      )}
    </button>
  )

  return (
    <>
      {/* ══════════════ MAIN HEADER ══════════════ */}
      <header
        className="sticky top-0 z-50 bg-[#0a0c0b] text-white select-none border-b border-white/[0.06]"
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-5 h-14 flex items-center justify-between relative">

          {/* ── Logo (Left) ── */}
          <div
            className="flex items-center gap-2 cursor-pointer group shrink-0 z-20"
            onClick={() => go("home")}
          >
            <div className="w-[14px] h-[22px] border-[2.5px] border-[#fbbf24] group-hover:bg-[#fbbf24]/15 transition-all duration-200 rounded-[1px]" />
            <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.18em] text-white group-hover:text-[#fbbf24] transition-colors whitespace-nowrap leading-none">
              EDUCA VEDA
            </span>
          </div>

          {/* ── DESKTOP: Center Expanding Ribbon ── */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5 z-10">

            {/* Left items (expand left) */}
            <div className={`flex items-center gap-1 transition-all duration-300 overflow-hidden ${ribbonOpen ? "max-w-[400px] opacity-100" : "max-w-0 opacity-0"}`}>
              <div className="flex items-center gap-1 animate-ribbon-left">
                <RibbonBtn label="HOME" pg="home" />
                <RibbonBtn label="HEALTH" pg="home" section="billboard-ayurved" />
                <RibbonBtn label="ROGSETU" pg="home" section="billboard-rogsetu" />
              </div>
            </div>

            {/* Center Toggle < MENU > / < ✕ > */}
            <button
              onClick={() => setRibbonOpen(prev => !prev)}
              className={`group flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-300 cursor-pointer shrink-0 font-mono ${
                ribbonOpen
                  ? "bg-[#fbbf24] text-black shadow-[0_0_18px_rgba(251,191,36,0.45)] font-black scale-105"
                  : "bg-white/[0.08] hover:bg-white/[0.18] text-white border border-white/15 hover:border-[#fbbf24]/50"
              }`}
              aria-label="Toggle Nav"
            >
              <span className="text-[11px] opacity-70">&lt;</span>
              <span className="text-[10px] font-black uppercase tracking-widest px-0.5">
                {ribbonOpen ? "✕" : "MENU"}
              </span>
              <span className="text-[11px] opacity-70">&gt;</span>
            </button>

            {/* Right items (expand right) */}
            <div className={`flex items-center gap-1 transition-all duration-300 overflow-hidden ${ribbonOpen ? "max-w-[500px] opacity-100" : "max-w-0 opacity-0"}`}>
              <div className="flex items-center gap-1 animate-ribbon-right">
                <RibbonBtn label="GURUKUL" pg="home" section="billboard-gurukul" />
                <RibbonBtn label="FINANCE" pg="home" section="billboard-banking" />
                <RibbonBtn label="SHOP" pg="store" badge={safeCartCount > 0 ? safeCartCount : null} />
                {/* Role items in ribbon if logged in */}
                {loggedIn && currentRoleData && currentRoleData.links.slice(0, 3).map((l, i) => (
                  <RibbonBtn key={i} label={l.label} pg={l.pg} />
                ))}
              </div>
            </div>
          </div>

          {/* ── DESKTOP RIGHT: Bell + Auth ── */}
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
                  className="text-[9px] uppercase font-bold text-slate-500 hover:text-red-400 px-2 py-1 rounded-lg bg-transparent hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  OUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => go("login")}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white hover:text-black text-white text-[10.5px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap border border-white/20"
              >
                SIGN IN
              </button>
            )}
          </div>

          {/* ── MOBILE RIGHT: Bell + Hamburger (opens LEFT sidebar) ── */}
          <div className="flex lg:hidden items-center gap-2 z-20">
            {loggedIn && <NotificationBell isMobile={true} />}
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer border border-white/10"
              aria-label="Open Menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* ══════════════ MOBILE LEFT SIDEBAR DRAWER ══════════════ */}
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          sidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: "rgba(0,0,0,0.65)" }}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Left Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full z-[70] lg:hidden w-[82vw] max-w-[320px] bg-[#090c0a] border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ willChange: "transform" }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2" onClick={() => go("home")}>
            <div className="w-[12px] h-[18px] border-[2px] border-[#fbbf24] rounded-[1px]" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#fbbf24]">EDUCA VEDA</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Scroll Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-2">

          {/* Public Links */}
          <div className="px-2 pb-2">
            <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/30">NAVIGATE</div>
            {publicLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => go(link.pg, link.section)}
                className="w-full text-left py-3 px-3 rounded-xl hover:bg-white/[0.07] text-slate-200 hover:text-white flex items-center justify-between cursor-pointer transition-colors text-[11px] font-bold uppercase tracking-wider group"
              >
                <span className="flex items-center gap-2">
                  {link.label}
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-black text-[8px] font-black">
                      {link.badge}
                    </span>
                  )}
                </span>
                <span className="text-white/20 group-hover:text-white/50 text-sm transition-colors">›</span>
              </button>
            ))}
          </div>

          {/* Role-Based Links */}
          {loggedIn && currentRoleData && (
            <div className="px-2 pt-1 border-t border-white/[0.06]">
              <div className={`px-2 py-1.5 text-[9px] font-black uppercase tracking-widest ${currentRoleData.color}`}>
                {currentRoleData.label}
              </div>
              {currentRoleData.links.map((link, i) => (
                <button
                  key={i}
                  onClick={() => go(link.pg)}
                  className={`w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/[0.07] flex items-center justify-between cursor-pointer transition-colors text-[11px] font-bold uppercase tracking-wider group ${
                    link.danger
                      ? "text-red-400 hover:text-red-300 hover:bg-red-950/20"
                      : link.accent
                      ? "text-amber-400 hover:text-amber-300"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="text-white/20 group-hover:text-white/50 text-sm transition-colors">›</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer: Auth */}
        <div className="px-3 py-3 border-t border-white/[0.08] shrink-0">
          {loggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => go(role === "admin" ? "admin" : "dashboard")}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-white font-bold text-[11px] flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                  role === "admin" ? "bg-amber-400/20 text-amber-300" :
                  role === "distributor" ? "bg-sky-400/20 text-sky-300" :
                  role === "seller" ? "bg-emerald-400/20 text-emerald-300" :
                  "bg-violet-400/20 text-violet-300"
                }`}>
                  {safeUser?.name ? safeUser.name[0].toUpperCase() : "U"}
                </span>
                <div className="text-left">
                  <div className="text-[10px] font-black text-white truncate max-w-[140px]">{safeUser?.name || "Dashboard"}</div>
                  <div className="text-[8px] text-white/40 uppercase">{role}</div>
                </div>
              </button>
              <button
                onClick={logout}
                className="py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold text-[10px] transition-colors cursor-pointer uppercase"
              >
                OUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => go("login")}
              className="w-full py-3 rounded-xl bg-white text-black hover:bg-amber-50 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>SIGN IN TO ACCOUNT</span>
              <span>›</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
