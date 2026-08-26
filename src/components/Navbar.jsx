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
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md text-white select-none border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between relative">
        
        {/* Left Iconic Yellow NatGeo Style Frame Logo - EDUCA VEDA */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none group z-20 shrink-0"
          onClick={() => go("home")}
        >
          <div className="w-4.5 h-6.5 border-[2px] border-[#fbbf24] flex items-center justify-center bg-transparent group-hover:bg-[#fbbf24]/15 group-hover:shadow-[0_0_12px_rgba(251,191,36,0.4)] transition-all duration-300 rounded-[1px]" />
          <span className="font-sans text-xs sm:text-sm font-black uppercase tracking-[0.2em] leading-none text-white group-hover:text-[#fbbf24] transition-colors whitespace-nowrap">
            EDUCA VEDA
          </span>
        </div>

        {/* ── DESKTOP ONLY: Center Horizontal Expanding Navigation Ribbon (Exact 50% Center) ── */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-10 overflow-visible no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Left Items (Expands to the left of <=>) */}
            {mobileMenuOpen && (
              <div className="animate-ribbon-left flex items-center gap-1 sm:gap-1.5">
                {/* HOME */}
                <button
                  onClick={() => go("home")}
                  className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap border border-transparent hover:border-white/10"
                >
                  HOME
                </button>

                {/* EDUCA GURUKUL */}
                <button
                  onClick={() => go("home", "billboard-gurukul")}
                  className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap border border-transparent hover:border-white/10"
                >
                  EDUCA GURUKUL
                </button>

                {/* EDUCA FINANCE */}
                <button
                  onClick={() => go("home", "billboard-banking")}
                  className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap border border-transparent hover:border-white/10"
                >
                  EDUCA FINANCE
                </button>
              </div>
            )}

            {/* Center Toggle Button (< = >) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`group relative flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-300 cursor-pointer shrink-0 ${
                mobileMenuOpen 
                  ? "bg-[#fbbf24] text-black shadow-[0_0_18px_rgba(251,191,36,0.5)] font-black scale-105" 
                  : "bg-white/[0.08] hover:bg-white/[0.18] text-white border border-white/15 hover:border-[#fbbf24]/50"
              }`}
              aria-label="Toggle Menu"
            >
              <span className="text-[11px] font-mono tracking-tighter opacity-70">&lt;</span>
              {mobileMenuOpen ? (
                <span className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-widest px-0.5">✕</span>
              ) : (
                <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-widest px-0.5">MENU</span>
              )}
              <span className="text-[11px] font-mono tracking-tighter opacity-70">&gt;</span>
            </button>

            {/* Right Items (Expands to the right of <=>) */}
            {mobileMenuOpen && (
              <div className="animate-ribbon-right flex items-center gap-1 sm:gap-1.5">
                {/* EDUCA HEALTH */}
                <button
                  onClick={() => go("home", "billboard-ayurved")}
                  className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap border border-transparent hover:border-white/10"
                >
                  EDUCA HEALTH
                </button>

                {/* EDUCA ROGSETU */}
                <button
                  onClick={() => go("home", "billboard-rogsetu")}
                  className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap border border-transparent hover:border-white/10"
                >
                  EDUCA ROGSETU
                </button>

                {/* SHOP */}
                <button
                  onClick={() => go("store")}
                  className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap border border-transparent hover:border-white/10"
                >
                  SHOP
                  {safeCartCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-400 text-black text-[9px] font-black">
                      {safeCartCount}
                    </span>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ── DESKTOP ONLY: Right Action (SIGN IN / USER PROFILE) ── */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-2.5 z-20 shrink-0">
          {loggedIn && <NotificationBell isMobile={false} />}

          {loggedIn ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => go(role === "admin" ? "admin" : "dashboard")}
                className="w-7 h-7 rounded-full bg-[#181818] flex items-center justify-center text-xs font-bold text-[#fbbf24] hover:scale-105 transition-transform cursor-pointer"
                title={safeUser?.name || "Dashboard"}
              >
                {safeUser?.name ? safeUser.name[0].toUpperCase() : "👤"}
              </button>
              <button
                onClick={logout}
                className="text-[9.5px] uppercase font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-[#141414] hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => go("login")}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white hover:text-black text-white text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              SIGN IN
            </button>
          )}
        </div>

        {/* ── MOBILE ONLY: Right Hamburger Icon Button (No Sign In on top bar) ── */}
        <div className="flex lg:hidden items-center gap-2 z-20">
          {loggedIn && <NotificationBell isMobile={true} />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer border border-white/10"
            aria-label="Toggle Mobile Menu"
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

      {/* ── MOBILE ONLY: Dropdown Drawer (With Sign In & All Links Inside) ── */}
      {mobileMenuOpen && (
        <div className="block lg:hidden bg-[#0a0c0b]/98 backdrop-blur-2xl px-5 py-5 flex flex-col gap-3 text-xs font-bold uppercase tracking-wider shadow-2xl border-b border-white/10 animate-fadeIn">
          <div className="flex flex-col gap-1">
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
            <button
              onClick={() => go("store")}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-emerald-400 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>SHOP</span>
                {safeCartCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-black text-[9px] font-black">
                    {safeCartCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold opacity-40">➔</span>
            </button>
          </div>

          {/* Mobile Sign In / Account section inside drawer */}
          <div className="pt-3 border-t border-white/[0.08]">
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
