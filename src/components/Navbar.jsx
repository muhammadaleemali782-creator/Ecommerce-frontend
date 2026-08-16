import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useStore } from "../context/StoreContext"
import { openFinanceService, openEducation } from "../utils/financeLink"

export default function Navbar({ setPage }) {
  const { loggedIn, user } = useAuth() || {}
  const { cart = [], removeFromCart, searchTerm, setSearchTerm } = useStore() || {}
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}

  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchVal, setSearchVal] = useState(searchTerm || "")

  const cartCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0)

  const closeAll = () => { setSearchOpen(false); setCartOpen(false); setMobileOpen(false) }
  const toggleSearch = () => { closeAll(); setSearchOpen(true) }
  const toggleCart = () => { closeAll(); setCartOpen(true) }
  const toggleMobile = () => { if (mobileOpen) closeAll(); else { closeAll(); setMobileOpen(true) } }

  const go = (page) => { safeSetPage(page); closeAll() }
  const runSearch = () => { setSearchTerm?.(searchVal); go("store") }

  // ✅ ESC closes active modal/drawer/menu; body scroll locked while one is open
  useEffect(() => {
    const anyOpen = searchOpen || cartOpen || mobileOpen
    if (!anyOpen) return
    const onKey = (e) => { if (e.key === "Escape") closeAll() }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [searchOpen, cartOpen, mobileOpen])

  const navLinks = [
    { label: "Ecosystem", action: () => go("home") },
    { label: "Botanical Science", action: () => go("store") },
    { label: "2-Yr Consultant Diploma", action: openEducation },
    { label: "Fintech Vault", action: () => openFinanceService(loggedIn, safeSetPage) },
  ]

  return (
    <>
      {/* ══ SHARED OVERLAY (z-100) ══ */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${(searchOpen || cartOpen || mobileOpen) ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeAll}
      />

      {/* ══ SEARCH MODAL (z-200) ══ */}
      <div
        className={`fixed top-20 left-1/2 w-[90%] md:w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl z-[200] p-6 border border-slate-100 flex-col transition-all duration-300 ${searchOpen ? "opacity-100 pointer-events-auto -translate-x-1/2 translate-y-0 flex" : "opacity-0 pointer-events-none -translate-x-1/2 -translate-y-5 hidden"}`}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-serif font-bold text-xl text-brand-primary">Global Ecosystem Search</h3>
          <button onClick={closeAll} aria-label="Close search" className="text-slate-400 hover:text-indigo-600 transition w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">✕</button>
        </div>
        <input
          type="text"
          autoFocus={searchOpen}
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && runSearch()}
          placeholder="Search Ayurveda lines, 2-Year Consultant Course..."
          className="w-full text-sm bg-slate-50 py-3.5 px-5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition mb-3"
        />
      </div>

      {/* ══ CART / FORMULATION REQUEST DRAWER (z-200) — REAL cart data ══ */}
      <div className={`fixed top-0 right-0 h-full w-[90%] md:w-full max-w-sm bg-white shadow-2xl z-[200] flex flex-col border-l border-slate-100 transition-transform duration-500 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-serif font-bold text-xl text-brand-primary">Formulation Requests</h3>
          <button onClick={closeAll} aria-label="Close cart" className="text-slate-400 hover:text-indigo-600 transition w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cart.length === 0 ? (
            <p className="text-sm text-slate-400 text-center mt-10">Abhi koi formulation request nahi hai.</p>
          ) : (
            cart.map(item => (
              <div key={item.id || item._id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-sm text-brand-textDark">{item.title || item.productName}</h4>
                  <button onClick={() => removeFromCart?.(item.id || item._id)} aria-label="Remove" className="text-slate-300 hover:text-red-500 transition text-xs flex-shrink-0">✕</button>
                </div>
                <p className="text-[11px] text-indigo-600 mt-0.5">Quantity: {item.qty || 1} Unit{item.qty > 1 ? "s" : ""} • ₹{item.price}</p>
              </div>
            ))
          )}
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => go(loggedIn ? "checkout" : "login")}
            disabled={cart.length === 0}
            className="w-full bg-premium-gradient text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Request
          </button>
        </div>
      </div>

      {/* ══ NAVBAR (z-50) ══ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 md:px-12 py-4 flex justify-between items-center transition-all rounded-b-2xl">
        <button onClick={() => go("home")} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-premium-gradient rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="text-left">
            <h1 className="font-serif text-lg md:text-xl font-bold text-brand-primary tracking-tight leading-none">EDUCA VEDA</h1>
            <p className="text-[8px] tracking-[0.2em] text-indigo-600 font-extrabold uppercase mt-1">HEALTHTECH &amp; FINTECH NEXUS</p>
          </div>
        </button>

        <div className="hidden lg:flex items-center space-x-8 text-sm font-bold text-slate-700">
          {navLinks.map(l => (
            <button key={l.label} onClick={l.action} className="hover:text-indigo-600 transition-colors">{l.label}</button>
          ))}
        </div>

        <div className="hidden lg:flex items-center space-x-5">
          <button onClick={toggleSearch} aria-label="Search" className="text-slate-600 hover:text-indigo-600 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
          <button onClick={toggleCart} aria-label="Formulation requests" className="text-slate-600 hover:text-indigo-600 transition-colors p-1 relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{cartCount > 9 ? "9+" : cartCount}</span>}
          </button>
          <button onClick={() => go(loggedIn ? "dashboard" : "login")} className="bg-brand-primary text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition shadow-md flex items-center gap-1.5">
            {loggedIn ? "My Portal" : "Portal Access"} ↗
          </button>
        </div>

        <button onClick={toggleMobile} aria-label="Menu" className="lg:hidden text-brand-primary p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>

        {/* ══ MOBILE MENU (z-200, above overlay) ══ */}
        <div className={`absolute top-[70px] left-4 right-4 bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 lg:hidden z-[200] transition-all duration-300 origin-top ${mobileOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
          <div className="space-y-3 mb-5">
            {navLinks.map((l, i) => (
              <button key={l.label} onClick={l.action} className={`block w-full text-left text-xs font-bold text-slate-800 py-2 ${i < navLinks.length - 1 ? "border-b border-slate-100" : ""}`}>{l.label}</button>
            ))}
          </div>
          <button onClick={() => go(loggedIn ? "dashboard" : "login")} className="w-full bg-premium-gradient text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg">
            {loggedIn ? "My Portal" : "Portal Access"} ↗
          </button>
        </div>
      </nav>
    </>
  )
}
