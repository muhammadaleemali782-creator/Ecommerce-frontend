import React, { useState, useCallback, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import NotificationBell from "./NotificationBell"
import EducaLogo from "./EducaLogo"
import {
  Home,
  Sparkles,
  Stethoscope,
  BookOpen,
  Landmark,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  PanelLeftClose,
  Sun,
  Moon,
  LogIn,
  LogOut,
  LayoutDashboard,
  Crown,
  Receipt,
  Users,
  Network,
  Wallet,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  Image,
  Wrench,
  AlertTriangle,
  Activity
} from "lucide-react"

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

  // ── Lucide Icon mapper for navigation items ──
  const getNavIcon = (link) => {
    const label = (link.label || "").toUpperCase()
    if (link.pg === "home" && !link.section) return <Home size={18} strokeWidth={2} />
    if (link.section === "billboard-ayurved") return <Sparkles size={18} strokeWidth={2} />
    if (link.section === "billboard-rogsetu") return <Stethoscope size={18} strokeWidth={2} />
    if (link.section === "billboard-gurukul") return <BookOpen size={18} strokeWidth={2} />
    if (link.section === "billboard-banking") return <Landmark size={18} strokeWidth={2} />
    if (link.pg === "store") return <ShoppingBag size={18} strokeWidth={2} />

    if (label.includes("DASHBOARD") || label.includes("ADMIN PANEL")) return <LayoutDashboard size={18} strokeWidth={2} />
    if (label.includes("ROYALTY")) return <Crown size={18} strokeWidth={2} />
    if (label.includes("STATEMENT")) return <Receipt size={18} strokeWidth={2} />
    if (label.includes("RADAR")) return <Activity size={18} strokeWidth={2} />
    if (label.includes("ORDER")) return <ShoppingCart size={18} strokeWidth={2} />
    if (label.includes("TEAM") || label.includes("USER")) return <Users size={18} strokeWidth={2} />
    if (label.includes("NETWORK")) return <Network size={18} strokeWidth={2} />
    if (label.includes("WALLET") || label.includes("WITHDRAWAL")) return <Wallet size={18} strokeWidth={2} />
    if (label.includes("PRODUCT")) return <Package size={18} strokeWidth={2} />
    if (label.includes("REQUEST") || label.includes("REQ")) return <FileText size={18} strokeWidth={2} />
    if (label.includes("SETTING") || label.includes("INVOICE") || label.includes("EMAIL")) return <Settings size={18} strokeWidth={2} />
    if (label.includes("BANNER")) return <Image size={18} strokeWidth={2} />
    if (label.includes("SERVICE")) return <Wrench size={18} strokeWidth={2} />
    if (label.includes("NUKE")) return <AlertTriangle size={18} strokeWidth={2} />

    return <ChevronRight size={18} strokeWidth={2} />
  }

  // ── Shared nav link button (Expanded mode) ──
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
            ? isDark
              ? "bg-amber-400/15 text-amber-400 font-black border border-amber-400/35 shadow-[0_0_12px_rgba(251,191,36,0.15)] scale-[1.01]"
              : "bg-amber-500/15 text-amber-900 font-black border border-amber-500/40 shadow-sm scale-[1.01]"
            : isDark
              ? "hover:bg-white/[0.07] text-stone-300 hover:text-white font-bold"
              : "hover:bg-stone-100 text-stone-800 hover:text-black font-bold"
        }`}
      >
        <span className="flex items-center gap-2">
          {link.label}
          {link.badge && (
            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${
              isActive ? "bg-amber-400 text-black" : "bg-emerald-400 text-black"
            }`}>
              {link.badge}
            </span>
          )}
        </span>
        <span className={`text-sm ${
          isActive
            ? isDark ? "text-amber-400 font-black" : "text-amber-800 font-black"
            : isDark ? "text-white/20 group-hover:text-white/50" : "text-stone-300 group-hover:text-stone-600"
        }`}>›</span>
      </button>
    )
  }

  // ── Collapsed nav link button (Icon only, perfectly centered) ──
  const CollapsedNavLink = ({ link, i }) => {
    const isActive = link.section
      ? (activeSection === link.section && currentPage === link.pg)
      : (!link.section && activeSection === null && currentPage === link.pg)
    const cleanLabel = link.label.replace(/^[\p{Emoji}\s]+/u, "").trim()

    return (
      <button
        key={i}
        onClick={() => go(link.pg, link.section)}
        title={cleanLabel || link.label}
        className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 group relative ${
          isActive
            ? isDark
              ? "bg-amber-400/15 text-amber-400 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
              : "bg-amber-500/15 text-amber-800 border border-amber-500/40 shadow-sm"
            : isDark
              ? "text-stone-400 hover:text-white hover:bg-white/[0.08] border border-transparent"
              : "text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-transparent"
        }`}
      >
        {isActive && (
          <span className="absolute -left-2 top-2.5 bottom-2.5 w-1 rounded-r-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
        )}
        {getNavIcon(link)}
        {link.badge && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#090c0a]" />
        )}
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
      {/* ═══════════════════════════════════════════════
          DESKTOP FLOATING TOGGLE (When Sidebar is Collapsed)
      ═══════════════════════════════════════════════ */}
      {isCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Open sidebar"
          aria-label="Open sidebar"
          className={`hidden lg:flex fixed top-3.5 left-4 z-40 w-9 h-9 rounded-xl items-center justify-center cursor-pointer transition-all duration-200 border shadow-lg backdrop-blur-md hover:scale-105 active:scale-95 ${
            isDark
              ? "bg-[#090c0a]/90 hover:bg-[#141815] text-stone-300 hover:text-amber-400 border-white/15 shadow-black/40"
              : "bg-white/95 hover:bg-stone-50 text-stone-700 hover:text-amber-700 border-stone-300/80 shadow-stone-200/50"
          }`}
        >
          <PanelLeft size={18} strokeWidth={2} />
        </button>
      )}

      {/* ═══════════════════════════════════════════════
          DESKTOP LEFT SIDEBAR (lg and above)
      ═══════════════════════════════════════════════ */}
      <aside className={`hidden lg:flex fixed top-0 left-0 h-screen w-[230px] z-50 flex-col border-r transition-transform duration-300 ease-out ${
        isCollapsed ? "-translate-x-full pointer-events-none" : "translate-x-0 pointer-events-auto"
      } ${
        isDark
          ? "bg-[#090c0a] text-white border-white/[0.08]"
          : "bg-white text-stone-900 border-stone-200 shadow-md"
      }`}>

        {/* Logo Header + Collapse Button */}
        <div className={`h-14 shrink-0 border-b flex items-center justify-between px-3.5 ${
          isDark ? "border-white/[0.08]" : "border-stone-200"
        }`}>
          <div
            className="flex items-center gap-2.5 cursor-pointer group min-w-0 overflow-hidden"
            onClick={() => go("home")}
            title="EDUCA-VEDA · We Give Results Not Promises"
          >
            <div className="shrink-0">
              <EducaLogo size={32} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-[11px] font-black uppercase tracking-[0.18em] whitespace-nowrap leading-tight transition-all duration-200 ${
                isDark ? "text-white group-hover:text-[#fbbf24]" : "text-stone-900 group-hover:text-amber-700"
              }`}>
                EDUCA-VEDA
              </span>
              <span className={`text-[7.5px] font-mono font-bold tracking-widest uppercase truncate ${
                isDark ? "text-stone-400" : "text-stone-500"
              }`}>
                RESULTS NOT PROMISES
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer border shrink-0 hover:scale-105 active:scale-95 ${
              isDark
                ? "bg-white/[0.06] hover:bg-white/[0.14] text-stone-300 border-white/10 hover:text-amber-400"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300 shadow-sm hover:text-amber-700"
            }`}
          >
            <PanelLeftClose size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Links */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-2 no-scrollbar">
          <NavContent />
        </div>

        {/* Bottom Actions: Theme + Bell + User */}
        <div className={`p-2 border-t shrink-0 space-y-2 ${
          isDark ? "border-white/[0.08]" : "border-stone-200"
        }`}>
          <div className="flex items-center justify-between px-1">
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`p-1.5 gap-1 rounded-lg border text-xs cursor-pointer flex items-center justify-center transition-colors ${
                isDark ? "bg-white/[0.06] border-white/10 text-amber-300" : "bg-stone-100 border-stone-300 text-amber-600"
              }`}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            {loggedIn && <NotificationBell isMobile={false} />}
          </div>

          {loggedIn ? (
            <>
              <button
                onClick={() => go("my-profile")}
                title={`${safeUser?.fullName || safeUser?.name || "User"} (${role})`}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer border gap-2.5 p-2 ${
                  isDark ? "hover:bg-white/[0.07] border-white/[0.06]" : "hover:bg-stone-50 border-stone-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border ${avatarClass}`}>
                  {(safeUser?.fullName || safeUser?.name || "U")[0].toUpperCase()}
                </div>
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
              </button>

              <button
                onClick={logout}
                title="Sign Out"
                className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black transition-colors cursor-pointer uppercase border border-red-500/20 flex items-center justify-center text-[10px]"
              >
                SIGN OUT
              </button>
            </>
          ) : (
            <button
              onClick={() => go("login")}
              title="Sign In"
              className={`w-full rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center py-2.5 ${
                isDark ? "bg-white text-black hover:bg-amber-50" : "bg-stone-900 text-white hover:bg-stone-800"
              }`}
            >
              SIGN IN
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
            <EducaLogo size={32} />
            <div className="flex flex-col min-w-0">
              <span className={`text-[12px] font-black uppercase tracking-[0.18em] whitespace-nowrap leading-tight ${
                isDark ? "text-white group-hover:text-[#fbbf24]" : "text-stone-900 group-hover:text-amber-700"
              }`}>
                EDUCA-VEDA
              </span>
              <span className={`text-[7.5px] font-mono font-bold tracking-widest uppercase truncate ${
                isDark ? "text-stone-400" : "text-stone-500"
              }`}>
                RESULTS NOT PROMISES
              </span>
            </div>
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
