import React, { useState, useCallback, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import NotificationBell from "./NotificationBell"
import EducaLogo from "./EducaLogo"

export default function Navbar({ setPage, currentPage = "home", cartCount, pageBadge = {}, isCollapsed = false, onToggleCollapse }) {
  const { loggedIn, logout, user } = useAuth() || {}
  const { toggleTheme, isDark } = useTheme()
  const safeUser = user || {}
  const role = safeUser?.role || "guest"
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}
  const safeCartCount = Number(cartCount) || 0
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(null)

  const go = useCallback((pg, sectionId) => {
    safeSetPage(pg)
    setActiveSection(sectionId || null)
    setSidebarOpen(false)
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 80)
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [safeSetPage])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [sidebarOpen])

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
      color: isDark ? "text-blue-400" : "text-amber-700",
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
        { label: "PPC WALLET", pg: "ppc-wallet" },
        { label: "RAISE REQUEST", pg: "raise-request" },
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
        { label: "PPC WALLET", pg: "ppc-wallet" },
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
        { label: "RAISE REQUEST", pg: "raise-request" },
      ]
    }
  }

  const currentRoleData = loggedIn ? (roleNavItems[role] || roleNavItems.user) : null

  // ── Shared nav link button ──
  const NavLink = ({ link, i }) => {
    const isActive = link.section
      ? (activeSection === link.section && currentPage === link.pg)
      : (!link.section && activeSection === null && currentPage === link.pg)
    return (
      <button
        key={i}
        onClick={() => go(link.pg, link.section)}
        className={`w-full text-left py-2.5 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 text-[11px] uppercase tracking-wider group ${
          isActive
            ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-black font-black shadow-md border border-amber-300 scale-[1.01]"
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
  }

  // ── Shared nav content (used in both desktop sidebar + mobile drawer) ──
  const NavContent = () => (
    <>
      <div className="px-2 pb-2">
        <div className={`px-2 py-1.5 text-[9px] font-black uppercase tracking-widest ${
          isDark ? "text-white/30" : "text-stone-400"
        }`}>
          NAVIGATE
        </div>
        {publicLinks.map((link, i) => <NavLink key={i} link={link} i={i} />)}
      </div>

      {loggedIn && currentRoleData && (
        <div className={`px-2 pt-1 border-t ${
          isDark ? "border-white/[0.06]" : "border-stone-200"
        }`}>
          <div className={`px-2 py-1.5 text-[9px] font-black uppercase tracking-widest ${currentRoleData.color}`}>
            {currentRoleData.label}
          </div>
          {currentRoleData.links.map((link, i) => <NavLink key={i} link={link} i={i} />)}
        </div>
      )}
    </>
  )

  // ── Role avatar color ──
  const avatarClass = role === "admin"
    ? "bg-blue-500/20 text-blue-500 border-blue-500/40"
    : role === "distributor"
      ? "bg-sky-400/20 text-sky-500 border-sky-500/40"
      : role === "seller"
        ? "bg-emerald-400/20 text-emerald-500 border-emerald-500/40"
        : "bg-violet-400/20 text-violet-500 border-violet-500/40"

  const roleTagClass = role === "admin"
    ? "bg-blue-600/15 text-amber-600 border-blue-500/30"
    : role === "distributor"
      ? "bg-sky-500/15 text-sky-600 border-sky-500/30"
      : role === "seller"
        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
        : "bg-violet-500/15 text-violet-600 border-violet-500/30"

  return (
    <>
      {/* ═══════════════════════════════════════════════
          DESKTOP LEFT SIDEBAR (lg and above)
      ═══════════════════════════════════════════════ */}
      <aside className={`hidden lg:flex fixed top-0 left-0 h-screen z-50 flex-col border-r transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[72px]" : "w-[220px]"
      } ${
        isDark
          ? "bg-[#090c0a] text-white border-white/[0.08]"
          : "bg-white text-stone-900 border-stone-200 shadow-md"
      }`}>

        {/* Logo Header + Collapse Toggle Button */}
        <div className={`flex items-center justify-between px-3.5 h-14 shrink-0 border-b relative ${
          isDark ? "border-white/[0.08]" : "border-stone-200"
        }`}>
          <div
            className="flex items-center gap-2.5 cursor-pointer group min-w-0 overflow-hidden"
            onClick={() => go("home")}
            title="EDUCA VEDA"
          >
            <div className="shrink-0">
              <EducaLogo size={28} />
            </div>
            {!isCollapsed && (
              <span className={`text-[11px] font-black uppercase tracking-[0.18em] whitespace-nowrap leading-none transition-all duration-200 ${
                isDark ? "text-white group-hover:text-[#fbbf24]" : "text-stone-900 group-hover:text-amber-700"
              }`}>
                EDUCA VEDA
              </span>
            )}
          </div>

          {/* Sidebar Collapse Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer border shrink-0 ${
              isDark
                ? "bg-white/[0.06] hover:bg-white/[0.14] text-stone-300 border-white/10"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300 shadow-sm"
            } ${isCollapsed ? "mx-auto" : ""}`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? "»" : "«"}
          </button>
        </div>

        {/* Scrollable Links */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-2 no-scrollbar">
          {isCollapsed ? (
            <div className="px-2 space-y-1">
              {publicLinks.map((link, i) => {
                const isActive = link.section
                  ? (activeSection === link.section && currentPage === link.pg)
                  : (!link.section && activeSection === null && currentPage === link.pg)
                return (
                  <button
                    key={i}
                    onClick={() => go(link.pg, link.section)}
                    title={link.label}
                    className={`w-full py-2.5 px-0 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 group relative ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-black shadow-md border border-amber-300"
                        : isDark
                          ? "hover:bg-white/[0.07] text-slate-200"
                          : "hover:bg-stone-100 text-stone-800"
                    }`}
                  >
                    <span className="text-sm font-bold">
                      {link.label === "HOME" ? "🏠" :
                       link.label === "HEALTH" ? "🌿" :
                       link.label === "ROGSETU" ? "🩺" :
                       link.label === "GURUKUL" ? "📚" :
                       link.label === "FINANCE" ? "🏦" :
                       link.label === "SHOP" ? "🛒" : "✦"}
                    </span>
                    {link.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                )
              })}

              {loggedIn && currentRoleData && (
                <div className={`pt-2 border-t mt-2 space-y-1 ${
                  isDark ? "border-white/[0.06]" : "border-stone-200"
                }`}>
                  {currentRoleData.links.map((link, i) => {
                    const isActive = currentPage === link.pg
                    // Extract emoji or first letter for icon
                    const iconMatch = link.label.match(/^(\p{Emoji})/u)
                    const displayIcon = iconMatch ? iconMatch[0] : (
                      link.label.includes("DASHBOARD") ? "📊" :
                      link.label.includes("ORDER") ? "📦" :
                      link.label.includes("TEAM") ? "👥" :
                      link.label.includes("NETWORK") ? "🌐" :
                      link.label.includes("WALLET") ? "💰" :
                      link.label.includes("WITHDRAWAL") ? "💳" :
                      link.label.includes("REQUEST") ? "📝" :
                      link.label.includes("USER") ? "👤" :
                      link.label.includes("PRODUCT") ? "🏷️" :
                      link.label.includes("SETTING") ? "⚙️" :
                      link.label.includes("BANNER") ? "🖼️" :
                      link.label.includes("SERVICE") ? "🛠️" :
                      link.label.includes("NUKE") ? "☢️" : "⭐"
                    )

                    return (
                      <button
                        key={i}
                        onClick={() => go(link.pg, link.section)}
                        title={link.label}
                        className={`w-full py-2.5 px-0 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-black shadow-md border border-amber-300"
                            : isDark
                              ? "hover:bg-white/[0.07] text-slate-200"
                              : "hover:bg-stone-100 text-stone-800"
                        }`}
                      >
                        <span className="text-sm font-bold">{displayIcon}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <NavContent />
          )}
        </div>

        {/* Bottom: theme + bell + user */}
        <div className={`px-2 py-3 border-t shrink-0 space-y-2 ${
          isDark ? "border-white/[0.08]" : "border-stone-200"
        }`}>
          {/* Theme toggle + notification bell */}
          <div className={`flex items-center ${isCollapsed ? "flex-col gap-2" : "justify-between px-1"}`}>
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`rounded-lg border text-xs cursor-pointer flex items-center justify-center transition-colors ${
                isCollapsed ? "w-9 h-9" : "p-1.5 gap-1"
              } ${
                isDark ? "bg-white/[0.06] border-white/10 text-amber-300" : "bg-stone-100 border-stone-300 text-amber-600"
              }`}
            >
              {isCollapsed ? (isDark ? "☀️" : "🌙") : (isDark ? "☀️ Light" : "🌙 Dark")}
            </button>
            {loggedIn && <NotificationBell isMobile={false} />}
          </div>

          {loggedIn ? (
            <>
              {/* User card */}
              <button
                onClick={() => go("my-profile")}
                title={`${safeUser?.fullName || safeUser?.name || "User"} (${role})`}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer border ${
                  isCollapsed ? "justify-center p-1.5" : "gap-2.5 p-2"
                } ${
                  isDark ? "hover:bg-white/[0.07] border-white/[0.06]" : "hover:bg-stone-50 border-stone-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border ${avatarClass}`}>
                  {(safeUser?.fullName || safeUser?.name || "U")[0].toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 text-left">
                    <div className={`text-[10px] font-black truncate max-w-[120px] ${isDark ? "text-white" : "text-stone-900"}`}>
                      {safeUser?.fullName || safeUser?.name || "User"}
                    </div>
                    <div className={`text-[8px] font-mono uppercase ${
                      role === "admin" ? "text-amber-500" :
                      role === "distributor" ? "text-sky-500" :
                      role === "seller" ? "text-emerald-500" : "text-violet-500"
                    }`}>{role}</div>
                  </div>
                )}
              </button>

              {/* Sign out */}
              <button
                onClick={logout}
                title="Sign Out"
                className={`w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black transition-colors cursor-pointer uppercase border border-red-500/20 flex items-center justify-center ${
                  isCollapsed ? "text-xs px-0" : "text-[10px]"
                }`}
              >
                {isCollapsed ? "🚪" : "SIGN OUT"}
              </button>
            </>
          ) : (
            <button
              onClick={() => go("login")}
              title="Sign In"
              className={`w-full rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center ${
                isCollapsed ? "py-2 text-[10px]" : "py-2.5"
              } ${
                isDark ? "bg-white text-black hover:bg-amber-50" : "bg-stone-900 text-white hover:bg-stone-800"
              }`}
            >
              {isCollapsed ? "IN" : "SIGN IN"}
            </button>
          )}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════
          MOBILE TOP HEADER (below lg)
      ═══════════════════════════════════════════════ */}
      <header
        className={`lg:hidden sticky top-0 z-50 select-none border-b transition-colors duration-300 ${
          isDark
            ? "bg-[#0a0c0b] text-white border-white/[0.06]"
            : "bg-white/95 text-stone-900 border-stone-200/90 shadow-sm backdrop-blur-md"
        }`}
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      >
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group shrink-0" onClick={() => go("home")}>
            <EducaLogo size={28} />
            <span className={`text-[12px] font-black uppercase tracking-[0.18em] whitespace-nowrap leading-none ${
              isDark ? "text-white group-hover:text-[#fbbf24]" : "text-stone-900 group-hover:text-amber-700"
            }`}>
              EDUCA VEDA
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs cursor-pointer ${
                isDark ? "bg-white/[0.07] border-white/10 text-amber-300" : "bg-stone-100 border-stone-300 text-amber-600 shadow-sm"
              }`}
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

      {/* ═══════════════════════════════════════════════
          MOBILE SIDEBAR DRAWER
      ═══════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          sidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: "rgba(0,0,0,0.65)" }}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full z-[70] lg:hidden w-[82vw] max-w-[320px] flex flex-col transition-transform duration-300 ease-out border-l ${
          isDark
            ? "bg-[#090c0a] text-white border-white/[0.08]"
            : "bg-white text-stone-900 border-stone-200 shadow-2xl"
        } ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ willChange: "transform" }}
      >
        {/* Drawer Header */}
        <div className={`flex items-center justify-between px-3.5 h-14 border-b shrink-0 ${
          isDark ? "border-white/[0.08]" : "border-stone-200"
        }`}>
          {loggedIn ? (
            <div className="flex items-center gap-2.5 min-w-0 pr-1 cursor-pointer" onClick={() => go("my-profile")}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border shadow-sm ${avatarClass}`}>
                {(safeUser?.fullName || safeUser?.name || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className={`text-xs font-black truncate max-w-[110px] ${isDark ? "text-white" : "text-stone-900"}`}>
                    {safeUser?.fullName || safeUser?.name || "User"}
                  </span>
                  <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${roleTagClass}`}>
                    {role}
                  </span>
                </div>
                <div className={`text-[10px] font-mono font-semibold truncate max-w-[130px] mt-0.5 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                  {safeUser?.name && safeUser.name !== safeUser?.fullName
                    ? `🆔 ${safeUser.name}`
                    : safeUser?.email || "View Profile"}
                </div>
              </div>
            </div>
          ) : (
            <span className={`text-[11px] font-black uppercase tracking-[0.18em] cursor-pointer ${isDark ? "text-[#fbbf24]" : "text-amber-700"}`} onClick={() => go("home")}>
              EDUCA VEDA
            </span>
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

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-2 no-scrollbar">
          <NavContent />
        </div>

        {/* Drawer Footer */}
        <div className={`px-3 py-3 border-t shrink-0 ${isDark ? "border-white/[0.08]" : "border-stone-200"}`}>
          {loggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => go("my-profile")}
                className={`flex-1 py-3 px-3 rounded-xl font-black text-xs transition-colors cursor-pointer uppercase flex items-center justify-center gap-2 border ${
                  isDark
                    ? "bg-blue-600/15 hover:bg-blue-600/25 border-blue-500/30 text-[#fbbf24]"
                    : "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
                }`}
              >
                <span>👤 VIEW PROFILE</span>
                <span>➔</span>
              </button>
              <button
                onClick={logout}
                className="py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black text-xs transition-colors cursor-pointer uppercase border border-red-500/20"
              >
                OUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => go("login")}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
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
