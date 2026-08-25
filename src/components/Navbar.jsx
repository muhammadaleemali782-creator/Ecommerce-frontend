import React, { useState } from "react"
import { useAuth } from "../context/AuthContext"
import NotificationBell from "./NotificationBell"

export default function Navbar({ setPage, cartCount, pageBadge = {}, noBottomMargin = true }) {
  const { loggedIn, logout, user } = useAuth() || {}
  const safeUser = user || {}
  const role = safeUser?.role || "guest"
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}
  const safeCartCount = Number(cartCount) || 0
  const [activeTab, setActiveTab] = useState("home")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const go = (page, sectionId) => {
    setActiveTab(page)
    safeSetPage(page)
    setMobileMenuOpen(false)
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Left Iconic Yellow NatGeo Style Frame Logo - EDUCA VEDA */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => go("home")}
        >
          <div className="w-5 h-7 border-[2.5px] border-[#fbbf24] flex items-center justify-center bg-transparent group-hover:bg-[#fbbf24]/15 group-hover:shadow-[0_0_12px_rgba(251,191,36,0.4)] transition-all duration-300 rounded-[1px]" />
          <div className="flex flex-col justify-center">
            <span className="font-sans text-sm sm:text-base font-black uppercase tracking-[0.22em] leading-none text-white group-hover:text-[#fbbf24] transition-colors">
              EDUCA VEDA
            </span>
          </div>
        </div>

        {/* Center NatGeo Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[#bbb]">
          <button
            onClick={() => go("home")}
            className={"relative py-4 transition-colors hover:text-white cursor-pointer " + (activeTab === "home" ? "text-white font-black" : "")}
          >
            HOME
            {activeTab === "home" && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]" />}
          </button>

          <button
            onClick={() => go("home", "billboard-ayurved")}
            className="py-4 transition-colors hover:text-white cursor-pointer"
          >
            EDUCA HEALTH
          </button>

          <button
            onClick={() => go("home", "billboard-rogsetu")}
            className="py-4 transition-colors hover:text-white cursor-pointer"
          >
            EDUCA ROGSETU & WELLNESS
          </button>

          <button
            onClick={() => go("home", "billboard-gurukul")}
            className="py-4 transition-colors hover:text-white cursor-pointer"
          >
            EDUCA GURUKUL
          </button>

          <button
            onClick={() => go("home", "billboard-banking")}
            className="py-4 transition-colors hover:text-white cursor-pointer"
          >
            EDUCA FINANCE
          </button>

          <button
            onClick={() => go("store")}
            className={"relative py-4 transition-colors hover:text-white cursor-pointer " + (activeTab === "store" ? "text-white font-black" : "")}
          >
            STORE
            {activeTab === "store" && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]" />}
          </button>
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {loggedIn && <NotificationBell isMobile={false} />}

          {/* Sleek Minimalist Luxury SHOP Button */}
          <button
            onClick={() => go("store")}
            className="relative group overflow-hidden px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.16] active:scale-95 border border-white/15 text-white text-[11px] font-bold uppercase tracking-[0.14em] shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
              ✦
            </span>
            <span>SHOP</span>
            {safeCartCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-black text-[9px] font-black">
                {safeCartCount}
              </span>
            )}
          </button>

          {loggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => go(role === "admin" ? "admin" : "dashboard")}
                className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center text-xs font-bold text-[#fbbf24] hover:scale-105 transition-transform cursor-pointer"
                title={safeUser?.name || "Dashboard"}
              >
                {safeUser?.name ? safeUser.name[0].toUpperCase() : "👤"}
              </button>
              <button
                onClick={logout}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-md bg-[#141414] hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => go("login")}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white hover:text-black text-white text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
            >
              SIGN IN
            </button>
          )}
        </div>

        {/* Mobile Right: Hamburger Icon */}
        <div className="flex lg:hidden items-center gap-2">
          {loggedIn && <NotificationBell isMobile={true} />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Drawer (Numbers Completely Removed) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0c0b]/98 backdrop-blur-2xl px-5 py-5 flex flex-col gap-3.5 text-xs font-bold uppercase tracking-wider animate-fadeIn shadow-2xl border-b border-white/10">
          
          {/* Redesigned Explore Shop Button */}
          <button
            onClick={() => go("store")}
            className="relative group overflow-hidden w-full py-3.5 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-[0.98] border border-white/15 text-white text-xs font-bold uppercase tracking-[0.16em] shadow-[0_8px_25px_rgba(0,0,0,0.6)] transition-all duration-200 flex items-center justify-between cursor-pointer"
          >
            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
            
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                🛍️
              </span>
              <span className="font-sans font-bold">EXPLORE SHOP</span>
            </div>

            <div className="flex items-center gap-2">
              {safeCartCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[9.5px] font-black">
                  {safeCartCount} ITEMS
                </span>
              )}
              <svg className="w-4 h-4 stroke-[2.2] text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Clean Menu Items (Zero Numbers) */}
          <div className="flex flex-col gap-1 pt-1">
            <button
              onClick={() => go("home")}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-[#fbbf24] flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>HOME</span>
              <span className="text-sm font-bold opacity-40">➔</span>
            </button>
            <button
              onClick={() => go("home", "billboard-ayurved")}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>EDUCA HEALTH</span>
              <span className="text-sm font-bold opacity-40">➔</span>
            </button>
            <button
              onClick={() => go("home", "billboard-rogsetu")}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>EDUCA ROGSETU & WELLNESS</span>
              <span className="text-sm font-bold opacity-40">➔</span>
            </button>
            <button
              onClick={() => go("home", "billboard-gurukul")}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>EDUCA GURUKUL</span>
              <span className="text-sm font-bold opacity-40">➔</span>
            </button>
            <button
              onClick={() => go("home", "billboard-banking")}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>EDUCA FINANCE</span>
              <span className="text-sm font-bold opacity-40">➔</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/[0.08]">
            {loggedIn ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => go(role === "admin" ? "admin" : "dashboard")}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>👤 {safeUser?.name || "DASHBOARD"}</span>
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
                className="w-full py-3 rounded-xl bg-white text-black hover:bg-slate-200 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <span>SIGN IN TO ACCOUNT</span>
                <span>➔</span>
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  )
}
