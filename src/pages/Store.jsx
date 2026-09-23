import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { ProductCardSkeleton } from "../components/Skeleton"

const SORT_OPTIONS = [
  { id: "rating", label: "Top Rated", icon: "★" },
  { id: "newest", label: "Newest Arrivals", icon: "✨" },
  { id: "price-low", label: "Price: Low to High", icon: "💰" },
  { id: "price-high", label: "Price: High to Low", icon: "💎" },
]

const resolveImg = (img) => {
  if (!img || typeof img !== "string") return "/natgeo_jadibooti.jpg"
  const trimmed = img.trim()
  if (!trimmed) return "/natgeo_jadibooti.jpg"
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) return trimmed
  if (trimmed.startsWith("/") && !trimmed.startsWith("/uploads/")) return trimmed
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")
  const cleanPath = trimmed.replace(/^\/+/, "").replace(/^uploads\//, "")
  return `${base}/uploads/${cleanPath}`
}

const KEYWORD_ALIASES = {
  energy: ["shilajit", "ashwagandha", "musli", "gokshura", "stamina", "vitality", "power", "vigor", "energy"],
  shilajit: ["shilajit", "energy", "stamina", "vitality", "resin"],
  kamzori: ["shilajit", "ashwagandha", "musli", "stamina", "energy", "vitality"],
  thakan: ["shilajit", "ashwagandha", "musli", "stamina", "energy"],
  stamina: ["shilajit", "ashwagandha", "musli", "gokshura", "energy"],
  tulsi: ["tulsi", "pancha tulsi", "vedic", "immunity", "cough", "cold", "flu", "respiratory"],
  "tulsi vedic": ["tulsi", "pancha tulsi", "vedic", "immunity"],
  khansi: ["tulsi", "pancha tulsi", "vedic", "cough", "immunity"],
  zukam: ["tulsi", "pancha tulsi", "vedic", "cold", "immunity"],
  cough: ["tulsi", "pancha tulsi", "vedic", "immunity"],
  cold: ["tulsi", "pancha tulsi", "vedic", "immunity"],
  liver: ["liv", "liver", "detox", "kutki", "amrit", "bhumi amla", "fatty", "jaundice", "sgot", "sgpt"],
  "fatty liver": ["liv", "liver", "detox", "kutki", "amrit", "bhumi amla"],
  peeliya: ["liv", "liver", "detox", "kutki", "amrit"],
  jaundice: ["liv", "liver", "detox", "kutki", "amrit"],
  sugar: ["sugar", "diabetes", "madhumeha", "gudmar", "jamun", "karela", "vijaysar"],
  diabetes: ["sugar", "diabetes", "madhumeha", "gudmar", "jamun", "karela", "vijaysar"],
  madhumeha: ["sugar", "diabetes", "madhumeha", "gudmar", "jamun", "karela"],
  bp: ["bp", "blood pressure", "raktachap", "sarpagandha", "arjuna", "hypertension"],
  "high bp": ["bp", "blood pressure", "raktachap", "sarpagandha", "arjuna", "hypertension"],
  raktachap: ["bp", "blood pressure", "raktachap", "sarpagandha", "arjuna"],
  hypertension: ["bp", "blood pressure", "raktachap", "sarpagandha", "arjuna"],
  daat: ["daat", "dant", "teeth", "tooth", "dental", "pyorrhea", "laung", "clove"],
  dant: ["daat", "dant", "teeth", "tooth", "dental", "pyorrhea", "laung", "clove"],
  dental: ["daat", "dant", "teeth", "tooth", "dental", "pyorrhea", "laung", "clove"],
  teeth: ["daat", "dant", "teeth", "tooth", "dental", "pyorrhea", "laung", "clove"],
  pyorrhea: ["daat", "dant", "teeth", "tooth", "dental", "pyorrhea", "laung"],
  period: ["period", "cramp", "shecurevedic", "menstrual", "pcod", "pcos", "ladki", "gynaec", "cramps"],
  shecurevedic: ["shecurevedic", "period", "cramp", "menstrual", "ashoka", "lodhra", "gynaec"],
  cramp: ["shecurevedic", "period", "cramp", "menstrual", "ashoka"],
  cramps: ["shecurevedic", "period", "cramp", "menstrual", "ashoka"],
  pcod: ["shecurevedic", "period", "cramp", "menstrual", "ashoka"],
  pcos: ["shecurevedic", "period", "cramp", "menstrual", "ashoka"],
  joint: ["joint", "sandhivata", "ghutna", "pain", "dard", "shallaki", "nirgundi", "arthritis"],
  ghutna: ["joint", "sandhivata", "ghutna", "pain", "dard", "shallaki", "nirgundi", "arthritis"],
  gathiya: ["joint", "sandhivata", "ghutna", "pain", "dard", "shallaki", "nirgundi", "arthritis"],
  arthritis: ["joint", "sandhivata", "ghutna", "pain", "dard", "shallaki", "nirgundi"],
  hair: ["hair", "kesh", "baal", "bhringraj", "dandruff", "fall"],
  baal: ["hair", "kesh", "baal", "bhringraj", "dandruff", "fall"],
  dandruff: ["hair", "kesh", "baal", "bhringraj", "dandruff"],
  gas: ["gas", "kabz", "constipation", "triphala", "pachak", "acidity", "pait"],
  kabz: ["gas", "kabz", "constipation", "triphala", "pachak", "acidity", "pait"]
}

export default function Store({ setPage }) {
  const { isDark } = useTheme()
  const { products = [], productsLoading, addToCart, cart = [] } = useStore() || {}
  const { user, login, setAuthSession } = useAuth() || {}

  const [consultant, setConsultant] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState("login") // "login" | "register"
  const [pendingProduct, setPendingProduct] = useState(null)

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // Registration form state (instant customer under consultant)
  const [regFullName, setRegFullName] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regAddress, setRegAddress] = useState("")
  const [regAadhar, setRegAadhar] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regError, setRegError] = useState("")
  const [regLoading, setRegLoading] = useState(false)
  const [registeredSuccessUser, setRegisteredSuccessUser] = useState(null)

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const refCode = params.get("storeRef") || (params.get("page") === "store" ? params.get("ref") : null) || localStorage.getItem("educa_store_consultant")
      if (refCode) {
        localStorage.setItem("educa_store_consultant", refCode)
        fetch(`${import.meta.env.VITE_API_URL}/requests/referral-info?ref=${encodeURIComponent(refCode)}`)
          .then(res => res.json())
          .then(data => {
            if (data?.valid && data?.referrer) {
              setConsultant(data.referrer)
            } else {
              setConsultant({ name: refCode, fullName: refCode })
            }
          })
          .catch(() => {
            setConsultant({ name: refCode, fullName: refCode })
          })
      }
    } catch {}
  }, [])

  const [search, setSearch] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("search") || ""
    } catch {
      return ""
    }
  })
  const [category, setCategory] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("category") || "all"
    } catch {
      return "all"
    }
  })
  const [sortBy, setSortBy] = useState("rating")
  const [flippedCardId, setFlippedCardId] = useState(null)
  const [addedToast, setAddedToast] = useState(null)

  // Custom polished dropdowns state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const categoryDropdownRef = useRef(null)

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef(null)

  // Real backend products only — zero hardcoded demo products
  const allProducts = useMemo(() => {
    return Array.isArray(products) ? products : []
  }, [products])

  // Extract unique categories safely
  const categories = useMemo(() => {
    const set = new Set()
    allProducts.forEach(p => {
      const c = (p.category || "").trim()
      if (c) set.add(c)
    })
    return ["all", ...Array.from(set)]
  }, [allProducts])

  // Compute product count per category for UX badge indicators
  const categoryCounts = useMemo(() => {
    const map = { all: allProducts.length }
    allProducts.forEach(p => {
      const c = (p.category || "").trim()
      if (c) {
        map[c] = (map[c] || 0) + 1
      }
    })
    return map
  }, [allProducts])

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false)
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setCategoryDropdownOpen(false)
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Filtered and sorted products
  const visibleProducts = useMemo(() => {
    let list = allProducts.filter(p => {
      const q = search.trim().toLowerCase()
      const title = (p.title || p.name || "").toLowerCase()
      const cat = (p.category || "").trim().toLowerCase()
      const desc = (p.description || p.desc || "").toLowerCase()
      
      let matchesSearch = !q || title.includes(q) || cat.includes(q) || desc.includes(q)
      
      // Keyword alias expansion for health searches (energy, tulsi, liver, sugar, bp, dental, etc.)
      if (!matchesSearch && q) {
        const words = q.split(/\s+/)
        for (const [key, aliases] of Object.entries(KEYWORD_ALIASES)) {
          if (words.some(w => key.includes(w) || w.includes(key))) {
            if (aliases.some(alias => title.includes(alias) || desc.includes(alias) || cat.includes(alias))) {
              matchesSearch = true
              break
            }
          }
        }
      }

      const matchesCategory = category === "all" || cat === category.toLowerCase()
      return matchesSearch && matchesCategory
    })

    if (sortBy === "price-low") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5))
    } else if (sortBy === "newest") {
      list.reverse()
    }

    return list
  }, [allProducts, search, category, sortBy])

  // Handle Add To Cart with login/register interceptor
  const handleAddToCart = useCallback((product, e) => {
    if (e) e.stopPropagation()
    if (!user) {
      setPendingProduct(product)
      setAuthModalTab("login")
      setShowAuthModal(true)
      return
    }
    if (addToCart) addToCart(product)
    setAddedToast(product.title || product.name || "Product")
    setTimeout(() => {
      setAddedToast(null)
    }, 2200)
  }, [user, addToCart])

  const handleModalLogin = async (e) => {
    if (e) e.preventDefault()
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError("ID/Email aur Password dono zaroori hain")
      return
    }
    setLoginLoading(true)
    setLoginError("")
    try {
      const res = await login(loginIdentifier.trim(), loginPassword.trim())
      if (res?.success) {
        setShowAuthModal(false)
        if (pendingProduct && addToCart) {
          addToCart(pendingProduct)
          setAddedToast(pendingProduct.title || pendingProduct.name || "Product")
        }
        setPendingProduct(null)
      } else {
        setLoginError(res?.message || "Invalid credentials. Kripya sahi ID/password dalein.")
      }
    } catch (err) {
      setLoginError(err.message || "Login failed")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleInstantRegister = async (e) => {
    if (e) e.preventDefault()
    if (!regFullName.trim()) { setRegError("Kripya apna pura naam likhein"); return }
    const cleanDigits = regPhone.replace(/\D/g, "")
    if (cleanDigits.length !== 10) { setRegError("Kripya sahi 10-digit mobile number likhein"); return }
    if (!regAddress.trim()) { setRegError("Kripya delivery address likhein"); return }
    const cleanAadharDigits = regAadhar.replace(/\D/g, "")
    if (cleanAadharDigits.length !== 12) { setRegError("Kripya 12-digit Aadhar card number likhein"); return }
    if (!regPassword.trim() || regPassword.trim().length < 4) { setRegError("Password kam se kam 4 aksharo ka hona chahiye"); return }

    setRegLoading(true)
    setRegError("")
    try {
      const sponsorCode = consultant?.name || localStorage.getItem("educa_store_consultant") || ""
      const res = await fetch(`${import.meta.env.VITE_API_URL}/store/instant-register-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref: sponsorCode,
          fullName: regFullName.trim(),
          phone: cleanDigits,
          address: regAddress.trim(),
          idNumber: cleanAadharDigits,
          password: regPassword.trim()
        })
      })
      const data = await res.json()
      if (res.ok && data?.success && data?.user && data?.token) {
        if (setAuthSession) setAuthSession(data.user, data.token)
        setRegisteredSuccessUser(data.user)
        if (pendingProduct && addToCart) {
          addToCart(pendingProduct)
          setAddedToast(pendingProduct.title || pendingProduct.name || "Product")
        }
        setTimeout(() => {
          setShowAuthModal(false)
          setRegisteredSuccessUser(null)
          setPendingProduct(null)
        }, 2500)
      } else {
        setRegError(data?.message || "Registration failed")
      }
    } catch (err) {
      setRegError(err.message || "Network error. Kripya dobara try karein.")
    } finally {
      setRegLoading(false)
    }
  }

  // Toggle card flip state smoothly
  const toggleFlip = useCallback((productId, e) => {
    if (e) e.stopPropagation()
    setFlippedCardId(prev => (prev === productId ? null : productId))
  }, [])

  // Cart total count
  const totalCartCount = useMemo(() => {
    return (cart || []).reduce((sum, item) => sum + (Number(item.qty) || 1), 0)
  }, [cart])

  return (
    <div className={`min-h-screen transition-colors duration-200 pb-16 select-none ${
      isDark ? "bg-[#0d120e] text-white" : "bg-[#fcfbf9] text-stone-900"
    }`}>
      
      {/* ── Toast Notification for Added Item ── */}
      {addedToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/15 flex items-center gap-3 max-w-[90vw]">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
            ✓
          </span>
          <div className="text-xs truncate">
            <span className="font-bold text-white block truncate">{addedToast}</span>
            <span className="text-stone-400 text-[10px]">Added to Cart</span>
          </div>
          <button
            onClick={() => setPage && setPage("cart")}
            className="ml-2 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0"
          >
            CART ➔
          </button>
        </div>
      )}

      {/* ── Top Header & Apothecary Title ── */}
      <section className={`pt-6 sm:pt-8 pb-6 border-b transition-colors ${
        isDark
          ? "bg-[#111713] border-white/[0.08]"
          : "bg-white border-stone-200 shadow-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600/10 text-amber-700 dark:text-amber-300 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <span>✦</span>
                  <span>100% AYUSH CERTIFIED</span>
                </span>
                <span className={`text-[11px] font-semibold ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                  Pure Ayurvedic Formulations
                </span>
              </div>
              
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight uppercase ${
                isDark ? "text-white" : "text-stone-900"
              }`}>
                Ayurvedic Formulations & Apothecary
              </h1>
              
              <p className={`mt-1 text-xs sm:text-sm font-medium ${
                isDark ? "text-stone-400" : "text-stone-600"
              }`}>
                Natural herbal products crafted for vitality, immunity, and daily wellness.
              </p>

              {/* Consultant Trust Banner */}
              {consultant && (
                <div className={`mt-3 inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-semibold ${
                  isDark
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                    : "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm"
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>
                    🛍️ Aap Shopping Kar Rahe Hain Apne Consultant Ke Sath:{" "}
                    <strong className="underline underline-offset-2 font-black">
                      {consultant.fullName || consultant.name}
                    </strong>{" "}
                    <span className="text-[11px] opacity-80">(ID: {consultant.name})</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    ✓ Verified
                  </span>
                </div>
              )}
            </div>

            {/* Floating Quick Cart Access */}
            {totalCartCount > 0 && (
              <button
                onClick={() => setPage && setPage("cart")}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-stone-950 shadow-md active:scale-95 transition-all cursor-pointer text-xs font-black shrink-0 uppercase tracking-wider"
              >
                <span>🛍️ CART ({totalCartCount})</span>
                <span>➔</span>
              </button>
            )}
          </div>

          {/* ── Search & Filter Controls ── */}
          <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 ${
            isDark ? "border-white/[0.06]" : "border-stone-100"
          }`}>
            
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search herbal products, ingredients, doshas..."
                className={`w-full pl-10 pr-8 py-2.5 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none border transition-all ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                    : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white shadow-sm"
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-200 dark:bg-white/10 text-stone-600 dark:text-stone-300 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* ── Custom Luxury Category Dropdown ── */}
            <div className="relative shrink-0" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setCategoryDropdownOpen(prev => !prev)
                  setSortDropdownOpen(false)
                }}
                className={`w-full sm:w-auto min-w-[210px] px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer select-none ${
                  categoryDropdownOpen
                    ? isDark
                      ? "bg-[#18221a] border-amber-400 text-white shadow-lg shadow-black/60 ring-2 ring-amber-400/20"
                      : "bg-white border-blue-600 text-stone-900 shadow-md ring-2 ring-blue-500/20"
                    : isDark
                      ? "bg-[#111713] hover:bg-[#161f18] border-white/12 hover:border-white/25 text-stone-200 shadow-xs"
                      : "bg-white hover:bg-stone-50 border-stone-300 hover:border-stone-400 text-stone-800 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-sm shrink-0">
                    {category === "all" ? "📂" : "🏷️"}
                  </span>
                  <span className="truncate">
                    {category === "all" ? "All Categories" : category}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isDark ? "bg-white/10 text-stone-300" : "bg-stone-100 text-stone-600"
                  }`}>
                    {categoryCounts[category] || 0}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      categoryDropdownOpen ? "rotate-180 text-amber-400" : "text-stone-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Custom Category Dropdown Popover */}
              {categoryDropdownOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border shadow-2xl p-2 z-50 backdrop-blur-xl transition-all duration-150 ${
                    isDark
                      ? "bg-[#111713]/95 border-white/15 shadow-black/90 text-white ring-1 ring-white/5"
                      : "bg-white/98 border-stone-200 shadow-stone-900/20 text-stone-900 ring-1 ring-black/5"
                  }`}
                >
                  <div className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-between border-b mb-1.5 ${
                    isDark ? "text-stone-400 border-white/10" : "text-stone-500 border-stone-200"
                  }`}>
                    <span>Filter By Category</span>
                    <span className="font-semibold">{categories.length - 1} Categories</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                    {/* All Categories Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setCategory("all")
                        setCategoryDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        category === "all"
                          ? isDark
                            ? "bg-amber-400/15 border border-amber-400/40 text-amber-300 font-black"
                            : "bg-blue-600 text-white font-black shadow-sm"
                          : isDark
                            ? "text-stone-300 hover:bg-white/10 hover:text-white"
                            : "text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">📂</span>
                        <span>All Categories</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          category === "all"
                            ? isDark
                              ? "bg-amber-400/20 text-amber-300"
                              : "bg-white/20 text-white"
                            : isDark
                              ? "bg-white/5 text-stone-400"
                              : "bg-stone-100 text-stone-500"
                        }`}>
                          {allProducts.length}
                        </span>
                        {category === "all" && <span className="text-xs font-black">✓</span>}
                      </div>
                    </button>

                    {/* Dynamic Categories */}
                    {categories.filter(c => c !== "all").map(c => {
                      const isSelected = category.toLowerCase() === c.toLowerCase()
                      const count = categoryCounts[c] || 0
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCategory(c)
                            setCategoryDropdownOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isSelected
                              ? isDark
                                ? "bg-amber-400/15 border border-amber-400/40 text-amber-300 font-black"
                                : "bg-blue-600 text-white font-black shadow-sm"
                              : isDark
                                ? "text-stone-300 hover:bg-white/10 hover:text-white"
                                : "text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-sm">🏷️</span>
                            <span className="truncate">{c}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isSelected
                                ? isDark
                                  ? "bg-amber-400/20 text-amber-300"
                                  : "bg-white/20 text-white"
                                : isDark
                                  ? "bg-white/5 text-stone-400"
                                  : "bg-stone-100 text-stone-500"
                            }`}>
                              {count}
                            </span>
                            {isSelected && <span className="text-xs font-black">✓</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Category Filter Rail ── */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => {
              const isSelected = category.toLowerCase() === cat.toLowerCase()
              const label = cat === "all" ? "All Products" : cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-stone-950 font-black shadow-sm"
                      : isDark
                        ? "bg-white/[0.06] text-stone-300 hover:bg-white/10 border border-white/10"
                        : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 shadow-xs"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── Main Catalog Grid (2 Columns Mobile, 3 Tablet, 4 Desktop) ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        
        {/* Count, Sort and Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
            isDark ? "text-stone-400" : "text-stone-500"
          }`}>
            Showing <span className={`font-black ${isDark ? "text-white" : "text-stone-950"}`}>{visibleProducts.length}</span> Products
            {category !== "all" && <span> in <span className="text-amber-600 dark:text-blue-400 font-bold">{category}</span></span>}
          </div>

          <div className="flex items-center gap-3">
            {/* Custom Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setSortDropdownOpen(prev => !prev)
                  setCategoryDropdownOpen(false)
                }}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer select-none ${
                  sortDropdownOpen
                    ? isDark
                      ? "bg-[#18221a] border-amber-400 text-white ring-2 ring-amber-400/20"
                      : "bg-white border-blue-600 text-stone-900 ring-2 ring-blue-500/20"
                    : isDark
                      ? "bg-[#111713] hover:bg-[#161f18] border-white/10 text-stone-300"
                      : "bg-white hover:bg-stone-50 border-stone-300 text-stone-700 shadow-xs"
                }`}
              >
                <span className={`text-[10px] ${isDark ? "text-stone-400" : "text-stone-400"}`}>
                  Sort:
                </span>
                <span>
                  {SORT_OPTIONS.find(o => o.id === sortBy)?.icon}{" "}
                  {SORT_OPTIONS.find(o => o.id === sortBy)?.label}
                </span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${
                    sortDropdownOpen ? "rotate-180 text-amber-400" : "text-stone-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {sortDropdownOpen && (
                <div
                  className={`absolute right-0 top-full mt-1.5 w-56 rounded-2xl border shadow-2xl p-1.5 z-50 backdrop-blur-xl transition-all duration-150 ${
                    isDark
                      ? "bg-[#111713]/95 border-white/15 shadow-black/90 text-white ring-1 ring-white/5"
                      : "bg-white/98 border-stone-200 shadow-stone-900/20 text-stone-900 ring-1 ring-black/5"
                  }`}
                >
                  <div className="space-y-1">
                    {SORT_OPTIONS.map(opt => {
                      const isSelected = sortBy === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.id)
                            setSortDropdownOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isSelected
                              ? isDark
                                ? "bg-amber-400/15 border border-amber-400/40 text-amber-300 font-black"
                                : "bg-blue-600 text-white font-black"
                              : isDark
                                ? "text-stone-300 hover:bg-white/10 hover:text-white"
                                : "text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && <span className="text-xs font-black">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {(category !== "all" || search) && (
              <button
                onClick={() => { setCategory("all"); setSearch("") }}
                className="text-[11px] font-bold text-amber-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton, Empty State, or Product Grid */}
        {productsLoading ? (
          <ProductCardSkeleton count={8} />
        ) : visibleProducts.length === 0 ? (
          <div className={`text-center py-20 px-4 rounded-3xl border max-w-md mx-auto shadow-sm ${
            isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
          }`}>
            <div className="text-4xl mb-3">🍃</div>
            <h3 className={`text-base font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>Koi Product Nahi Mila</h3>
            <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
              Doosra keyword ya category choose karke dekhein.
            </p>
            <button
              onClick={() => { setCategory("all"); setSearch("") }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-stone-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm"
            >
              Show All Products
            </button>
          </div>
        ) : (
          /* Responsive 2-Column Mobile, 3-Col Tablet, 4-Col Desktop */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {visibleProducts.map(product => {
              const productId = product.id || product._id || product.title
              const isFlipped = flippedCardId === productId
              const title = product.title || product.name || "Ayurvedic Product"
              const price = Number(product.price || product.finalPrice || 0)
              const mrp = Number(product.mrp) > price ? Number(product.mrp) : 0
              const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
              const discountBadge = product.discountBadge || (discountPct > 0 ? `${discountPct}% OFF` : null)
              const image = resolveImg(product.image || product.img)
              const tag = product.tag || product.category || "AYUSH"
              const rating = product.rating !== undefined && product.rating !== null && product.rating !== "" ? product.rating : 4.9
              const reviews = product.reviews !== undefined && product.reviews !== null && product.reviews !== "" ? product.reviews : 85
              const desc = (product.description || product.desc || "").trim()
              const dosha = (product.dosha || "").trim()
              const ingredients = Array.isArray(product.ingredients) && product.ingredients.length > 0 ? product.ingredients : null

              const cartItem = (cart || []).find(c => (c.id || c._id || c.productId) === productId)
              const cartQty = cartItem ? cartItem.qty : 0

              return (
                <div
                  key={productId}
                  className="perspective-1000 w-full min-h-[310px] sm:min-h-[360px] relative select-none"
                  style={{ contain: "content" }}
                >
                  <div
                    className={`preserve-3d relative w-full h-full rounded-2xl ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                    style={{ minHeight: "inherit" }}
                  >
                    
                    {/* ════════ FRONT SIDE OF CARD ════════ */}
                    <div
                      className={`backface-hidden absolute inset-0 w-full h-full rounded-2xl border transition-colors flex flex-col justify-between ${
                        isDark
                          ? "bg-[#111713] border-white/[0.08] hover:border-white/20 shadow-md"
                          : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
                      }`}
                    >
                      {/* Image Container */}
                      <div
                        onClick={(e) => toggleFlip(productId, e)}
                        className={`relative aspect-square w-full rounded-t-2xl overflow-hidden cursor-pointer group ${
                          isDark ? "bg-[#0d120e]" : "bg-stone-100"
                        }`}
                      >
                        <img
                          src={image}
                          alt={title}
                          onError={(e) => {
                            if (!e.currentTarget.src.endsWith("/natgeo_jadibooti.jpg")) {
                              e.currentTarget.src = "/natgeo_jadibooti.jpg"
                            }
                          }}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
                          <span className="px-2 py-0.5 rounded-md bg-stone-950/90 text-[8.5px] sm:text-[9.5px] font-black text-white uppercase tracking-wider shadow-sm">
                            {tag}
                          </span>
                          {discountBadge && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-[8px] sm:text-[8.5px] font-black text-white uppercase">
                              {discountBadge}
                            </span>
                          )}
                        </div>

                        {/* Flip Hint Button */}
                        <button
                          onClick={(e) => toggleFlip(productId, e)}
                          title="Tap to see herbal ingredients & dosha details"
                          className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/95 hover:bg-white text-stone-900 text-[9.5px] sm:text-[10.5px] font-black shadow-md flex items-center gap-1 cursor-pointer transition-transform active:scale-90"
                        >
                          <span>ℹ️</span>
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1">
                        <div>
                          {/* Rating & Tap to Flip Prompt */}
                          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs mb-1">
                            <div className="flex items-center gap-1 text-blue-500 font-bold">
                              <span>★</span>
                              <span className={isDark ? "text-white" : "text-stone-900"}>{rating}</span>
                              <span className="text-stone-400 text-[9px] sm:text-[10px]">({reviews})</span>
                            </div>
                            <span
                              onClick={(e) => toggleFlip(productId, e)}
                              className="text-[9px] font-mono font-bold text-amber-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              Details ➔
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className={`text-xs sm:text-sm font-bold line-clamp-2 leading-tight ${
                            isDark ? "text-white" : "text-stone-950"
                          }`}>
                            {title}
                          </h3>
                        </div>

                        {/* Price & Add to Cart */}
                        <div className={`mt-2.5 pt-2 border-t ${
                          isDark ? "border-white/[0.06]" : "border-stone-100"
                        }`}>
                          <div className="flex items-baseline gap-1.5 mb-2">
                            <span className={`text-sm sm:text-base font-black ${
                              isDark ? "text-white" : "text-stone-950"
                            }`}>
                              ₹{Number(price).toLocaleString("en-IN")}
                            </span>
                            {mrp > price && (
                              <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                                ₹{Number(mrp).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`w-full py-2 px-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer ${
                              cartQty > 0
                                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                : isDark
                                  ? "bg-blue-600 hover:bg-blue-500 text-stone-950"
                                  : "bg-stone-950 hover:bg-stone-800 text-white"
                            }`}
                          >
                            <span>{cartQty > 0 ? `ADDED (${cartQty}) +` : "ADD TO CART"}</span>
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* ════════ BACK SIDE OF CARD (FAST ULTRA-SMOOTH FLIP DETAILS) ════════ */}
                    <div
                      onClick={(e) => toggleFlip(productId, e)}
                      className={`backface-hidden rotate-y-180 absolute inset-0 w-full h-full rounded-2xl p-3 sm:p-4 border shadow-xl flex flex-col justify-between cursor-pointer ${
                        isDark ? "bg-[#141b16] border-blue-500/30 text-white" : "bg-stone-900 border-stone-800 text-white"
                      }`}
                    >
                      <div>
                        {/* Back Header with Prominent Return Button */}
                        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2 mb-2">
                          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-blue-400">
                            PRODUCT DETAILS
                          </span>
                          <button
                            onClick={(e) => toggleFlip(productId, e)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            <span>↩</span>
                            <span>Photo</span>
                          </button>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1">
                          {title}
                        </h4>

                        {/* Category - with explicit label */}
                        {product.category && (
                          <div className="mt-2 text-[10px] sm:text-[11px] text-stone-300">
                            <span className="font-bold text-amber-400 font-mono">Category: </span>
                            <span className="text-stone-200">{product.category}</span>
                          </div>
                        )}

                        {/* Dosha Tag - only if provided */}
                        {dosha && (
                          <div className="mt-1.5 px-2 py-1 rounded-md bg-stone-800 text-[9px] sm:text-[10px] font-bold text-amber-300">
                            Dosha: {dosha}
                          </div>
                        )}

                        {/* Description - with explicit label */}
                        {desc && (
                          <div className="mt-2 text-[10px] sm:text-[11px] text-stone-300 leading-relaxed">
                            <span className="font-bold text-amber-400 font-mono">Description: </span>
                            <span className="text-stone-300 line-clamp-4">{desc}</span>
                          </div>
                        )}

                        {/* Ingredients List - only if real ingredients exist */}
                        {ingredients && ingredients.length > 0 && (
                          <div className="mt-2">
                            <div className="text-[9px] font-bold text-stone-400 uppercase">Ingredients:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ingredients.slice(0, 4).map((ing, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-stone-800 text-[8.5px] text-stone-200"
                                >
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Back Footer Actions with explicit Return & Add To Cart */}
                      <div className="pt-2 mt-2 border-t border-stone-800 flex items-center gap-2">
                        <button
                          onClick={(e) => toggleFlip(productId, e)}
                          className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-black uppercase tracking-wider cursor-pointer whitespace-nowrap"
                        >
                          ↩ Photo
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex-1 py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-stone-950 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer truncate shadow-md"
                        >
                          ADD ₹{Number(price).toLocaleString("en-IN")}
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

      </main>

      {/* ── CUSTOMER AUTH & INSTANT REGISTRATION MODAL ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className={`relative w-full max-w-lg my-auto rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all ${
            isDark
              ? "bg-[#141b16] border-white/15 text-white"
              : "bg-white border-stone-200 text-stone-900"
          }`}>
            
            {/* Close Button */}
            <button
              onClick={() => {
                setShowAuthModal(false)
                setPendingProduct(null)
                setLoginError("")
                setRegError("")
                setRegisteredSuccessUser(null)
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-500/15 hover:bg-stone-500/25 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="text-center pb-3 border-b border-stone-500/15">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-1.5">
                🌿 EDUCA VEDA APOTHECARY
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {registeredSuccessUser ? "🎉 Swagat Hai!" : "Product Cart Me Jodne Ke Liye ID Zaroori Hai"}
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                {registeredSuccessUser
                  ? "Aapka customer account successfully create ho gaya hai."
                  : "Apni ID se login karein ya 1 minute me nayi Customer ID banayein."}
              </p>
            </div>

            {/* Pending Product Preview */}
            {pendingProduct && !registeredSuccessUser && (
              <div className={`mt-3.5 p-3 rounded-2xl border flex items-center gap-3 ${
                isDark ? "bg-black/30 border-white/10" : "bg-stone-50 border-stone-200"
              }`}>
                {pendingProduct.image && (
                  <img
                    src={pendingProduct.image}
                    alt={pendingProduct.title}
                    className="w-12 h-12 rounded-xl object-cover bg-stone-800 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-amber-500 uppercase">Aap Yeh Product Le Rahe Hain</span>
                  <h4 className="text-xs font-black truncate">{pendingProduct.title || pendingProduct.name}</h4>
                  <span className="text-xs font-black text-emerald-500">₹{Number(pendingProduct.price || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            {/* Consultant Trust Indicator */}
            {consultant && !registeredSuccessUser && (
              <div className={`mt-2.5 px-3 py-2 rounded-xl border text-[11px] flex items-center gap-2 ${
                isDark ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}>
                <span className="text-sm">🛍️</span>
                <span className="truncate">
                  Consultant: <strong>{consultant.fullName || consultant.name}</strong> ({consultant.name})
                </span>
                <span className="ml-auto px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase">
                  Verified
                </span>
              </div>
            )}

            {/* Success View */}
            {registeredSuccessUser ? (
              <div className="mt-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-black">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-400">Customer ID Created!</h3>
                  <p className="text-xs text-stone-300 mt-0.5">Welcome, {registeredSuccessUser.fullName}!</p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-400">User ID:</span>
                    <strong className="text-amber-400">{registeredSuccessUser.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Educa Mail:</span>
                    <strong className="text-sky-300 truncate max-w-[200px]">{registeredSuccessUser.email}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Account Type:</span>
                    <strong className="text-emerald-400 uppercase">Customer (User)</strong>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400">
                  ✅ Product aapke cart me add ho gaya hai. Cart khul raha hai...
                </p>
              </div>
            ) : (
              <>
                {/* Tab Switcher */}
                <div className="mt-4 grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-stone-500/15 border border-stone-500/10">
                  <button
                    type="button"
                    onClick={() => { setAuthModalTab("login"); setLoginError(""); setRegError("") }}
                    className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      authModalTab === "login"
                        ? "bg-blue-600 text-stone-950 shadow-md"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    🔑 ID Se Login Karein
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthModalTab("register"); setLoginError(""); setRegError("") }}
                    className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      authModalTab === "register"
                        ? "bg-blue-600 text-stone-950 shadow-md"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    ✨ Nayi ID Banayein (Free)
                  </button>
                </div>

                {/* TAB 1: LOGIN */}
                {authModalTab === "login" && (
                  <form onSubmit={handleModalLogin} className="mt-4 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        User ID, Mobile Number Ya Email
                      </label>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. US001 ya 9876543210 ya user@educa.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border focus:outline-none focus:border-amber-400 ${
                          isDark ? "bg-black/40 border-white/15 text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                        }`}
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Apna password dalein"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border focus:outline-none focus:border-amber-400 ${
                          isDark ? "bg-black/40 border-white/15 text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                        }`}
                      />
                    </div>

                    {loginError && (
                      <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
                        ⚠️ {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loginLoading ? "Login Ho Raha Hai..." : "Login Karein Aur Cart Me Jodein ➔"}
                    </button>

                    <p className="text-center text-[11px] text-stone-400 pt-1">
                      Naye customer hain?{" "}
                      <button
                        type="button"
                        onClick={() => setAuthModalTab("register")}
                        className="text-amber-400 font-bold underline cursor-pointer"
                      >
                        Yahan 1 Minute Me ID Banayein
                      </button>
                    </p>
                  </form>
                )}

                {/* TAB 2: INSTANT REGISTRATION */}
                {authModalTab === "register" && (
                  <form onSubmit={handleInstantRegister} className="mt-4 space-y-3">
                    <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[10.5px] text-sky-300">
                      ℹ️ Yeh Customer ID banegi aur EDUCA Mailbox bhi turant active ho jayega.
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                        Pura Naam (Full Name) *
                      </label>
                      <input
                        type="text"
                        value={regFullName}
                        onChange={e => setRegFullName(e.target.value)}
                        placeholder="Apna pura naam likhein"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:border-amber-400 ${
                          isDark ? "bg-black/40 border-white/15 text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                          10-Digit Mobile Number *
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="e.g. 9876543210"
                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:border-amber-400 ${
                            isDark ? "bg-black/40 border-white/15 text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                          12-Digit Aadhar Card *
                        </label>
                        <input
                          type="text"
                          maxLength={12}
                          value={regAadhar}
                          onChange={e => setRegAadhar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                          placeholder="e.g. 123456789012"
                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:border-amber-400 ${
                            isDark ? "bg-black/40 border-white/15 text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                        Delivery Address (Pura Pata) *
                      </label>
                      <textarea
                        rows={2}
                        value={regAddress}
                        onChange={e => setRegAddress(e.target.value)}
                        placeholder="House no, Gali/Mohalla, City, Pin Code"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:border-amber-400 resize-none ${
                          isDark ? "bg-black/40 border-white/15 text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                        Apna Password Banayein *
                      </label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Apna naya password dalein"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:border-amber-400 ${
                          isDark ? "bg-black/40 border-white/15 text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                        }`}
                      />
                    </div>

                    {regError && (
                      <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
                        ⚠️ {regError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {regLoading ? "ID Ban Rahi Hai..." : "Customer ID Banayein Aur Cart Me Jodein ➔"}
                    </button>

                    <p className="text-center text-[11px] text-stone-400 pt-1">
                      Pehle se account hai?{" "}
                      <button
                        type="button"
                        onClick={() => setAuthModalTab("login")}
                        className="text-amber-400 font-bold underline cursor-pointer"
                      >
                        Yahan Login Karein
                      </button>
                    </p>
                  </form>
                )}
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
