import React, { useState, useCallback, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import NotificationBell from "./NotificationBell"
import EducaLogo from "./EducaLogo"

export default function Navbar({ setPage, currentPage = "home", cartCount, pageBadge = {} }) {
  const { loggedIn, logout, user } = useAuth() || {}
  const { theme, toggleTheme, isDark } = useTheme()
  const safeUser = user || {}
  const role = safeUser?.role || "guest"
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}
  const safeCartCount = Number(cartCount) || 0
  const [ribbonOpen, setRibbonOpen] = useState(false)   // desktop ribbon toggle
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile sidebar
  const [activeSection, setActiveSection] = useState(null)

  // Close sidebar on route change
  const go = useCallback((pg, sectionId) => {
    safeSetPage(pg)
    setActiveSection(sectionId || null)
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
      color: isDark ? "text-amber-400" : "text-amber-700",
      links: [
        { label: "ADMIN PANEL", pg: "admin" },
        { label: "👑 ROYALTY POOL", pg: "admin-royalty" },
        { label: "📜 PPC STATEMENT", pg: "ppc-statement" },
        { label: "📡 TEAM RADAR", pg: "team-activity" },
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
        { label: "NUKE DATA ⚠", pg: "admin-nuke" },
        { label: "INVOICE SETTINGS", pg: "admin-invoice-settings" },
      ]
    },
    distributor: {
      label: "DISTRIBUTOR",
      color: isDark ? "text-sky-400" : "text-sky-700",
      links: [
        { label: "DASHBOARD", pg: "dashboard" },
        { label: "👑 ROYALTY CLUB", pg: "distributor-royalty" },
        { label: "📜 PPC STATEMENT", pg: "ppc-statement" },
        { label: "📡 TEAM RADAR", pg: "team-activity" },
        { label: "MY ORDERS", pg: "distributor-orders" },
        { label: "MY TEAM", pg: "my-users" },
        { label: "MY NETWORK", pg: "my-network" },
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
      color: isDark ? "text-emerald-400" : "text-emerald-700",
      links: [
        { label: "DASHBOARD", pg: "dashboard" },
        { label: "📜 PPC STATEMENT", pg: "ppc-statement" },
        { label: "📡 TEAM RADAR", pg: "team-activity" },
        { label: "MY ORDERS", pg: "seller-orders" },
        { label: "MY TEAM", pg: "my-users" },
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
      color: isDark ? "text-violet-400" : "text-violet-700",
      links: [
        { label: "MY ORDERS", pg: "orders" },
        { label: "COIN WALLET", pg: "coin-wallet" },
        { label: "RAISE REQUEST", pg: "raise-request" },
      ]
    }
  }

  const currentRoleData = loggedIn ? (roleNavItems[role] || roleNavItems.user) : null

  // ── Desktop Ribbon Nav Button ──
  const RibbonBtn = ({ label, pg, section, badge }) => {
    const isActive = section
      ? (activeSection === section && currentPage === pg)
      : (!section && activeSection === null && currentPage === pg)
    return (
      <button
        onClick={() => go(pg, section)}
        className={`relative px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap border ${
          isActive
            ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-amber-300 font-black shadow-[0_0_14px_rgba(251,191,36,0.6)] scale-105"
            : isDark
              ? "bg-white/[0.04] hover:bg-white/[0.12] text-slate-300 hover:text-white border-transparent hover:border-white/10"
              : "bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-black border-stone-200"
        }`}
      >
        {label}
        {badge && (
          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center leading-none ${
            isActive ? "bg-black text-amber-300" : "bg-emerald-400 text-black"
          }`}>
            {badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <>
      {/* ══════════════ MAIN HEADER ══════════════ */}
      <header
        className={`sticky top-0 z-50 select-none border-b transition-colors duration-300 ${
          isDark
            ? "bg-[#0a0c0b] text-white border-white/[0.06]"
            : "bg-[#ffffff]/95 text-stone-900 border-stone-200/90 shadow-sm backdrop-blur-md"
        }`}
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-5 h-14 flex items-center justify-between relative">

          {/* ── Logo (Left) ── */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group shrink-0 z-20"
            onClick={() => go("home")}
          >
            <EducaLogo size={32} />
            <span className={`text-[12px] sm:text-[13px] font-black uppercase tracking-[0.18em] transition-colors whitespace-nowrap leading-none ${
              isDark ? "text-white group-hover:text-[#fbbf24]" : "text-stone-900 group-hover:text-amber-700"
            }`}>
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
                  : isDark
                    ? "bg-white/[0.08] hover:bg-white/[0.18] text-white border border-white/15 hover:border-[#fbbf24]/50"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 hover:border-amber-500"
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
                <RibbonBtn label="PROFILE" pg={loggedIn ? "my-profile" : "login"} />
                {loggedIn && currentRoleData && currentRoleData.links.slice(0, 2).map((l, i) => (
                  <RibbonBtn key={i} label={l.label} pg={l.pg} />
                ))}
              </div>
            </div>
          </div>

          {/* ── DESKTOP RIGHT: Theme Toggle + Bell + Auth ── */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0 z-20">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-full border transition-all cursor-pointer flex items-center justify-center text-xs ${
                isDark
                  ? "bg-white/[0.08] border-white/15 text-amber-300 hover:bg-white/15"
                  : "bg-stone-100 border-stone-300 text-amber-600 hover:bg-stone-200 shadow-sm"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {loggedIn && <NotificationBell isMobile={false} />}

            {loggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => go(role === "admin" ? "admin" : "dashboard")}
                  className={`px-3 py-1.5 rounded-full border text-[10.5px] font-black uppercase tracking-wider hover:scale-105 transition-all cursor-pointer ${
                    isDark
                      ? "bg-[#1a1a1a] border-[#fbbf24]/40 text-[#fbbf24]"
                      : "bg-amber-50 border-amber-400 text-amber-900 shadow-xs"
                  }`}
                  title={role === "admin" ? "Admin Panel" : "Dashboard"}
                >
                  {role === "admin" ? "ADMIN" : "DASHBOARD"}
                </button>
                <button
                  onClick={logout}
                  className="text-[9.5px] uppercase font-black text-stone-400 hover:text-red-500 px-2 py-1 rounded-lg bg-transparent hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Logout"
                >
                  OUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => go("login")}
                className={`px-3.5 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap border ${
                  isDark
                    ? "bg-amber-500 hover:bg-amber-400 text-black border-amber-500"
                    : "bg-stone-900 hover:bg-stone-800 text-white border-stone-800 shadow-sm"
                }`}
              >
                SIGN IN
              </button>
            )}
          </div>

          {/* ── MOBILE RIGHT: Theme Toggle + Bell + Hamburger ── */}
          <div className="flex lg:hidden items-center gap-2 z-20">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs cursor-pointer ${
                isDark
                  ? "bg-white/[0.07] border-white/10 text-amber-300"
                  : "bg-stone-100 border-stone-300 text-amber-600 shadow-sm"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {loggedIn && <NotificationBell isMobile={true} />}

            <button
              onClick={() => setSidebarOpen(true)}
              className={`w-9 h-9 rounded-xl active:scale-90 flex items-center justify-center transition-all cursor-pointer border ${
                isDark
                  ? "bg-white/[0.07] hover:bg-white/[0.14] text-white border-white/10"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300 shadow-sm"
              }`}
              aria-label="Open Menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* ══════════════ MOBILE SIDEBAR DRAWER ══════════════ */}
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          sidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: "rgba(0,0,0,0.65)" }}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full z-[70] lg:hidden w-[82vw] max-w-[320px] flex flex-col transition-transform duration-300 ease-out border-l ${
          isDark
            ? "bg-[#090c0a] text-white border-white/[0.08]"
            : "bg-[#ffffff] text-stone-900 border-stone-200 shadow-2xl"
        } ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ willChange: "transform" }}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between px-3.5 h-14 border-b shrink-0 ${
          isDark ? "border-white/[0.08]" : "border-stone-200"
        }`}>
          {loggedIn ? (
            <div className="flex items-center gap-2.5 min-w-0 pr-1 cursor-pointer" onClick={() => go("my-profile")}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border shadow-sm ${
                role === "admin" ? "bg-amber-400/20 text-amber-500 border-amber-500/40" :
                role === "distributor" ? "bg-sky-400/20 text-sky-500 border-sky-500/40" :
                role === "seller" ? "bg-emerald-400/20 text-emerald-500 border-emerald-500/40" :
                "bg-violet-400/20 text-violet-500 border-violet-500/40"
              }`}>
                {(safeUser?.fullName || safeUser?.name || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className={`text-xs font-black truncate max-w-[110px] ${
                    isDark ? "text-white" : "text-stone-900"
                  }`}>
                    {safeUser?.fullName || safeUser?.name || "User"}
                  </span>
                  <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                    role === "admin" ? "bg-amber-500/15 text-amber-600 dark:text-[#fbbf24] border-amber-500/30" :
                    role === "distributor" ? "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30" :
                    role === "seller" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30" :
                    "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30"
                  }`}>
                    {role}
                  </span>
                </div>
                <div className={`text-[10px] font-mono font-semibold truncate max-w-[130px] mt-0.5 ${
                  isDark ? "text-stone-400" : "text-stone-500"
                }`}>
                  {safeUser?.name && safeUser.name !== safeUser?.fullName
                    ? `🆔 ${safeUser.name}`
                    : safeUser?.email || "View Profile"}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => go("home")}>
              <div className={`w-[12px] h-[18px] border-[2px] rounded-[1px] ${
                isDark ? "border-[#fbbf24]" : "border-amber-600"
              }`} />
              <span className={`text-[11px] font-black uppercase tracking-[0.18em] ${
                isDark ? "text-[#fbbf24]" : "text-amber-700"
              }`}>
                EDUCA VEDA
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                isDark ? "bg-white/[0.06] border-white/10 text-amber-300" : "bg-stone-100 border-stone-300 text-amber-600"
              }`}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors cursor-pointer ${
                isDark ? "bg-white/[0.06] hover:bg-white/[0.12] text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-800"
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sidebar Scroll Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-2 no-scrollbar">

            {/* Public Links */}
            <div className="px-2 pb-2">
              <div className={`px-2 py-1.5 text-[9px] font-black uppercase tracking-widest ${
                isDark ? "text-white/30" : "text-stone-400"
              }`}>
                NAVIGATE
              </div>
              {publicLinks.map((link, i) => {
                const isActive = link.section
                  ? (activeSection === link.section && currentPage === link.pg)
                  : (!link.section && activeSection === null && currentPage === link.pg)
                return (
                  <button
                    key={i}
                    onClick={() => go(link.pg, link.section)}
                    className={`w-full text-left py-2.5 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 text-[11px] uppercase tracking-wider group ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black shadow-md border border-amber-300 scale-[1.01]"
                        : isDark
                          ? "hover:bg-white/[0.07] text-slate-200 hover:text-white font-bold"
                          : "hover:bg-stone-100 text-stone-800 hover:text-black font-bold"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {link.label}
                      {link.badge && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${
                          isActive ? "bg-black text-amber-300" : "bg-emerald-400 text-black"
                        }`}>
                          {link.badge}
                        </span>
                      )}
                    </span>
                    <span className={`text-sm ${
                      isActive ? "text-black font-black" : isDark ? "text-white/20 group-hover:text-white/50" : "text-stone-300 group-hover:text-stone-600"
                    }`}>›</span>
                  </button>
                )
              })}
            </div>

            {/* Role-Based Links */}
            {loggedIn && currentRoleData && (
              <div className={`px-2 pt-1 border-t ${
                isDark ? "border-white/[0.06]" : "border-stone-200"
              }`}>
                <div className={`px-2 py-1.5 text-[9px] font-black uppercase tracking-widest ${currentRoleData.color}`}>
                  {currentRoleData.label}
                </div>
                {currentRoleData.links.map((link, i) => {
                  const isActive = currentPage === link.pg
                  return (
                    <button
                      key={i}
                      onClick={() => go(link.pg)}
                      className={`w-full text-left py-2.5 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 text-[11px] uppercase tracking-wider group ${
                        isActive
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black shadow-md border border-amber-300 scale-[1.01]"
                          : isDark
                            ? "text-slate-300 hover:text-white hover:bg-white/[0.07] font-bold"
                            : "text-stone-700 hover:text-black hover:bg-stone-100 font-bold"
                      }`}
                    >
                      <span>{link.label}</span>
                      <span className={`text-sm ${
                        isActive ? "text-black font-black" : isDark ? "text-white/20 group-hover:text-white/50" : "text-stone-300 group-hover:text-stone-600"
                      }`}>›</span>
                    </button>
                  )
                })}
              </div>
            )}
        </div>

        {/* Sidebar Footer: View Profile & Logout Actions */}
        <div className={`px-3 py-3 border-t shrink-0 ${
          isDark ? "border-white/[0.08]" : "border-stone-200"
        }`}>
          {loggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => go("my-profile")}
                className={`flex-1 py-3 px-3 rounded-xl font-black text-xs transition-colors cursor-pointer uppercase flex items-center justify-center gap-2 border ${
                  isDark
                    ? "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-[#fbbf24]"
                    : "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-xs"
                }`}
                title="View Profile"
              >
                <span>👤 VIEW PROFILE</span>
                <span>➔</span>
              </button>
              <button
                onClick={logout}
                className="py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black text-xs transition-colors cursor-pointer uppercase border border-red-500/20"
                title="Logout"
              >
                OUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => go("login")}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                isDark ? "bg-white text-black hover:bg-amber-50" : "bg-stone-900 text-white hover:bg-stone-800"
              }`}
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


