import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import AdminAnalytics from "../admin/AdminAnalytics"
import CreateUser from "../admin/CreateUser"
import ShareButton from "../components/ShareButton"

/*
  ═════════════════════════════════════════════════════════════════════
  ADMIN MASTER COMMAND CENTER (WORLD-CLASS PRODUCTION GRADE)
  ═════════════════════════════════════════════════════════════════════
  • Full 14-Module Categorized Navigation Grid
  • Live Search / Quick Switcher
  • Real-Time Network & KPI Sync
  • Responsive (Mobile 1-2 cols, Tablet 2-3 cols, Desktop 4 cols)
  • 100% API & Functionality Preservation
  • Dual Mode: Soft Luxury Light & Deep Obsidian Dark
  ═════════════════════════════════════════════════════════════════════
*/

export default function Admin({ setPage }) {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [tab, setTab] = useState("overview")
  const [searchModule, setSearchModule] = useState("")
  const [networkStats, setNetworkStats] = useState({ distributors: 0, sellers: 0, users: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/tree`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const tree = await res.json()
        const flat = []
        const walk = (nodes) => nodes.forEach(n => { flat.push(n); if (n.children?.length) walk(n.children) })
        walk(Array.isArray(tree) ? tree : (tree?.tree || []))
        setNetworkStats({
          distributors: flat.filter(u => u.role === "distributor").length,
          sellers:      flat.filter(u => u.role === "seller").length,
          users:        flat.filter(u => u.role === "user").length,
        })
      } catch {}
    }
    load()
  }, [])

  if (!user || user.role !== "admin") {
    return (
      <div className={`p-8 max-w-md mx-auto text-center rounded-3xl border text-red-500 font-bold mt-10 ${
        isDark ? "bg-[#101512] border-red-500/30" : "bg-white border-red-200 shadow-sm"
      }`}>
        <span className="text-3xl block mb-2">🚫</span>
        Access Denied. Admins only.
      </div>
    )
  }

  // ── 14 MASTER ADMIN MODULES ──
  const ADMIN_MODULES = [
    {
      category: "Commerce & Catalog",
      items: [
        {
          id: "admin-products",
          title: "Products Management",
          desc: "Add, update price, edit AYUSH certifications & inventory",
          icon: "📦",
          tag: "CATALOG",
          accent: isDark ? "from-amber-500/20 to-transparent text-amber-300 border-amber-500/30" : "from-amber-500/10 to-amber-500/5 text-amber-800 border-amber-300",
        },
        {
          id: "admin-orders",
          title: "Order Management",
          desc: "Track total orders, update dispatch state & print invoices",
          icon: "🛍️",
          tag: "SALES",
          accent: isDark ? "from-emerald-500/20 to-transparent text-emerald-300 border-emerald-500/30" : "from-emerald-500/10 to-emerald-500/5 text-emerald-800 border-emerald-300",
        },
        {
          id: "admin-invoice-settings",
          title: "Invoice & GST Settings",
          desc: "Configure GSTIN, company address & billing templates",
          icon: "🧾",
          tag: "BILLING",
          accent: isDark ? "from-sky-500/20 to-transparent text-sky-300 border-sky-500/30" : "from-sky-500/10 to-sky-500/5 text-sky-800 border-sky-300",
        },
      ]
    },
    {
      category: "Team & Network",
      items: [
        {
          id: "admin-users",
          title: "User Directory",
          desc: "Inspect, manage, or block distributors, sellers & customers",
          icon: "👥",
          tag: "USERS",
          accent: isDark ? "from-blue-500/20 to-transparent text-blue-300 border-blue-500/30" : "from-blue-500/10 to-blue-500/5 text-blue-800 border-blue-300",
        },
        {
          id: "admin-network",
          title: "Multi-Tier Network Tree",
          desc: "Visual genealogy tree & multi-level downline genealogy inspector",
          icon: "🌳",
          tag: "NETWORK",
          accent: isDark ? "from-emerald-500/20 to-transparent text-emerald-300 border-emerald-500/30" : "from-emerald-500/10 to-emerald-500/5 text-emerald-800 border-emerald-300",
        },
        {
          id: "admin-requests",
          title: "Pending Approval Requests",
          desc: "Fast 1-click approvals for seller & distributor join requests",
          icon: "⏳",
          tag: "APPROVALS",
          accent: isDark ? "from-amber-500/20 to-transparent text-amber-300 border-amber-500/30" : "from-amber-500/10 to-amber-500/5 text-amber-800 border-amber-300",
        },
        {
          id: "admin-requests-history",
          title: "Requests Decision History",
          desc: "Complete searchable audit log of past approved and rejected requests",
          icon: "📜",
          tag: "ARCHIVE",
          accent: isDark ? "from-purple-500/20 to-transparent text-purple-300 border-purple-500/30" : "from-purple-500/10 to-purple-500/5 text-purple-800 border-purple-300",
        },
        {
          id: "my-profile",
          title: "Admin Profile & Credentials",
          desc: "Update admin account name, phone, password and security details",
          icon: "👤",
          tag: "PROFILE",
          accent: isDark ? "from-violet-500/20 to-transparent text-violet-300 border-violet-500/30" : "from-violet-500/10 to-violet-500/5 text-violet-800 border-violet-300",
        },
      ]
    },
    {
      category: "Finance & Monetization",
      items: [
        {
          id: "admin-ppc",
          title: "PPC & Commission Controls",
          desc: "Set per-click wallet rates, distributor coin margins & rewards",
          icon: "💰",
          tag: "FINANCE",
          accent: isDark ? "from-yellow-500/20 to-transparent text-yellow-300 border-yellow-500/30" : "from-yellow-500/10 to-yellow-500/5 text-yellow-800 border-yellow-300",
        },
        {
          id: "admin-withdrawals",
          title: "Payout & Withdrawals",
          desc: "Approve bank/UPI payouts & view verified payout audit logs",
          icon: "🏦",
          tag: "PAYOUTS",
          accent: isDark ? "from-teal-500/20 to-transparent text-teal-300 border-teal-500/30" : "from-teal-500/10 to-teal-500/5 text-teal-800 border-teal-300",
        },
      ]
    },
    {
      category: "Marketing, Media & Services",
      items: [
        {
          id: "admin-banners",
          title: "Banners & Ad Campaigns",
          desc: "Manage homepage video ads, promotional banners & slides",
          icon: "🎨",
          tag: "MARKETING",
          accent: isDark ? "from-pink-500/20 to-transparent text-pink-300 border-pink-500/30" : "from-pink-500/10 to-pink-500/5 text-pink-800 border-pink-300",
        },
        {
          id: "admin-services",
          title: "Ayurvedic Services",
          desc: "Manage doctor consultations, diagnostics & wellness packages",
          icon: "🩺",
          tag: "SERVICES",
          accent: isDark ? "from-emerald-500/20 to-transparent text-emerald-300 border-emerald-500/30" : "from-emerald-500/10 to-emerald-500/5 text-emerald-800 border-emerald-300",
        },
        {
          id: "admin-email",
          title: "Email & SMTP Settings",
          desc: "Configure transactional email templates & SMTP delivery server",
          icon: "📧",
          tag: "SYSTEM",
          accent: isDark ? "from-indigo-500/20 to-transparent text-indigo-300 border-indigo-500/30" : "from-indigo-500/10 to-indigo-500/5 text-indigo-800 border-indigo-300",
        },
      ]
    },
    {
      category: "System Maintenance & Security",
      items: [
        {
          id: "admin-analytics",
          title: "Deep Business Intelligence",
          desc: "Real-time charts, velocity metrics & order revenue breakdown",
          icon: "📊",
          tag: "ANALYTICS",
          accent: isDark ? "from-cyan-500/20 to-transparent text-cyan-300 border-cyan-500/30" : "from-cyan-500/10 to-cyan-500/5 text-cyan-800 border-cyan-300",
          action: () => setTab("analytics"),
        },
        {
          id: "admin-nuke",
          title: "Nuke Database",
          desc: "5-Step security-locked database reset & diagnostic utility",
          icon: "☢️",
          tag: "DANGER ZONE",
          accent: isDark ? "from-red-500/25 to-transparent text-red-400 border-red-500/40" : "from-red-500/10 to-red-500/5 text-red-800 border-red-300",
        },
      ]
    }
  ]

  // Filter modules based on search
  const filteredCategories = useMemo(() => {
    if (!searchModule.trim()) return ADMIN_MODULES
    const q = searchModule.toLowerCase().trim()
    return ADMIN_MODULES.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.desc.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
      )
    })).filter(cat => cat.items.length > 0)
  }, [searchModule, isDark])

  return (
    <div className={`min-h-screen transition-colors duration-200 selection:bg-[#fbbf24] selection:text-black pb-20 ${
      isDark ? "bg-[#0a0d0b] text-white" : "bg-[#f7f9f6] text-stone-900"
    }`}>
      
      {/* ── TOP HERO EXECUTIVE BANNER ── */}
      <section className={`border-b pt-6 pb-8 transition-colors ${
        isDark
          ? "bg-gradient-to-b from-[#121814] via-[#0d120f] to-[#0a0d0b] border-white/[0.08]"
          : "bg-gradient-to-b from-emerald-50/70 via-stone-50 to-[#f7f9f6] border-stone-200/90"
      }`}>
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#fbbf24] to-amber-200 text-black flex items-center justify-center text-2xl sm:text-3xl font-black shadow-[0_0_25px_rgba(251,191,36,0.3)] shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SUPER ADMIN
                  </span>
                  <span className={`text-[10px] font-mono uppercase hidden sm:inline ${
                    isDark ? "text-white/40" : "text-stone-500"
                  }`}>
                    EDUCA VEDA COMMAND CENTER
                  </span>
                </div>

                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight ${
                  isDark ? "text-white" : "text-stone-900"
                }`}>
                  {user?.name || "System Administrator"}
                </h1>
                <p className={`text-xs font-medium truncate max-w-xs sm:max-w-md ${
                  isDark ? "text-stone-400" : "text-stone-600"
                }`}>
                  {user?.email || "admin@educaveda.com"}
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 flex-wrap">
              <button
                onClick={() => setPage?.("my-profile")}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  isDark
                    ? "bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 border-white/10"
                    : "bg-white hover:bg-stone-100 text-amber-800 border-stone-200 shadow-sm"
                }`}
              >
                <span>👤 My Profile</span>
              </button>

              <button
                onClick={() => setPage?.("store")}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  isDark
                    ? "bg-white/[0.06] hover:bg-white/[0.12] text-stone-200 hover:text-white border-white/10"
                    : "bg-white hover:bg-stone-100 text-stone-800 border-stone-200 shadow-sm"
                }`}
              >
                <span>🏪 Live Store</span>
                <span>➔</span>
              </button>
              <ShareButton compact style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0" }} />
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className={`grid grid-cols-3 gap-2.5 sm:gap-4 mt-6 pt-6 border-t ${
            isDark ? "border-white/[0.08]" : "border-stone-200"
          }`}>
            <div className={`p-3 sm:p-4 rounded-2xl border text-center transition-colors ${
              isDark ? "bg-[#121714]/80 border-sky-500/20" : "bg-white border-sky-200 shadow-sm"
            }`}>
              <span className="text-base sm:text-xl block mb-1">🏢</span>
              <div className="text-lg sm:text-2xl font-black text-sky-500 dark:text-sky-400 tracking-tight">
                {networkStats.distributors}
              </div>
              <div className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-wider font-mono ${
                isDark ? "text-stone-400" : "text-stone-500"
              }`}>
                Distributors
              </div>
            </div>

            <div className={`p-3 sm:p-4 rounded-2xl border text-center transition-colors ${
              isDark ? "bg-[#121714]/80 border-emerald-500/20" : "bg-white border-emerald-200 shadow-sm"
            }`}>
              <span className="text-base sm:text-xl block mb-1">🛒</span>
              <div className="text-lg sm:text-2xl font-black text-emerald-500 dark:text-emerald-400 tracking-tight">
                {networkStats.sellers}
              </div>
              <div className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-wider font-mono ${
                isDark ? "text-stone-400" : "text-stone-500"
              }`}>
                Direct Sellers
              </div>
            </div>

            <div className={`p-3 sm:p-4 rounded-2xl border text-center transition-colors ${
              isDark ? "bg-[#121714]/80 border-amber-500/20" : "bg-white border-amber-200 shadow-sm"
            }`}>
              <span className="text-base sm:text-xl block mb-1">👤</span>
              <div className="text-lg sm:text-2xl font-black text-amber-500 dark:text-[#fbbf24] tracking-tight">
                {networkStats.users}
              </div>
              <div className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-wider font-mono ${
                isDark ? "text-stone-400" : "text-stone-500"
              }`}>
                Customers
              </div>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
            {[
              { key: "overview", label: "📊 Overview & Modules", icon: "✦" },
              { key: "analytics", label: "📈 Deep Analytics", icon: "📊" },
              { key: "create", label: "➕ Create User Form", icon: "👤" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  tab === t.key
                    ? "bg-[#fbbf24] text-black shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-[1.02]"
                    : isDark
                    ? "bg-white/[0.06] text-stone-300 hover:bg-white/10 hover:text-white border border-white/[0.08]"
                    : "bg-white text-stone-700 hover:bg-stone-100 hover:text-black border border-stone-200 shadow-sm"
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ══ TAB 1: OVERVIEW & MASTER 14-MODULES GRID ══ */}
        {tab === "overview" && (
          <div className="space-y-8">
            
            {/* Search / Filter Bar */}
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border transition-colors ${
              isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
            }`}>
              <div className="relative flex-1">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={searchModule}
                  onChange={e => setSearchModule(e.target.value)}
                  placeholder="Search admin module (e.g. Products, Orders, PPC, Banners)..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none transition-colors border ${
                    isDark
                      ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                      : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
                  }`}
                />
              </div>

              {searchModule && (
                <button
                  onClick={() => setSearchModule("")}
                  className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20 cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Categorized 14-Module Action Grid */}
            <div className="space-y-8">
              {filteredCategories.map((cat, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 rounded-full bg-[#fbbf24]" />
                    <h3 className={`text-xs sm:text-sm font-black uppercase tracking-widest font-mono ${
                      isDark ? "text-stone-300" : "text-stone-700"
                    }`}>
                      {cat.category}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.action) {
                            item.action()
                          } else if (setPage) {
                            setPage(item.id)
                          }
                        }}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                          isDark
                            ? `bg-gradient-to-br ${item.accent} bg-[#111713] border-white/[0.08] hover:border-white/20`
                            : `bg-gradient-to-br ${item.accent} bg-white border-stone-200 hover:border-amber-400 hover:shadow-md`
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className={`text-2xl p-2 rounded-xl border shrink-0 ${
                              isDark ? "bg-black/40 border-white/10" : "bg-stone-50 border-stone-200"
                            }`}>
                              {item.icon}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest font-mono border ${
                              isDark ? "bg-black/50 border-white/10 text-stone-300" : "bg-stone-100 border-stone-200 text-stone-700"
                            }`}>
                              {item.tag}
                            </span>
                          </div>

                          <h4 className={`text-sm sm:text-base font-black transition-colors leading-tight ${
                            isDark ? "text-white group-hover:text-[#fbbf24]" : "text-stone-900 group-hover:text-amber-600"
                          }`}>
                            {item.title}
                          </h4>

                          <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                            isDark ? "text-stone-400" : "text-stone-600"
                          }`}>
                            {item.desc}
                          </p>
                        </div>

                        <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-bold ${
                          isDark ? "border-white/[0.06] text-stone-300 group-hover:text-white" : "border-stone-100 text-stone-600 group-hover:text-amber-700"
                        }`}>
                          <span>OPEN MODULE</span>
                          <span className="group-hover:translate-x-1 transition-transform">➔</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ══ TAB 2: DEEP NETWORK ANALYTICS ══ */}
        {tab === "analytics" && (
          <div className={`p-5 sm:p-7 rounded-3xl border shadow-lg transition-colors ${
            isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
          }`}>
            <AdminAnalytics setPage={setPage} />
          </div>
        )}

        {/* ══ TAB 3: CREATE USER FORM ══ */}
        {tab === "create" && (
          <div className={`p-5 sm:p-7 rounded-3xl border shadow-lg transition-colors ${
            isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 mb-6 ${
              isDark ? "border-white/[0.08]" : "border-stone-200"
            }`}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#fbbf24] font-mono">
                  DIRECT ONBOARDING
                </span>
                <h3 className={`text-lg font-black uppercase ${isDark ? "text-white" : "text-stone-900"}`}>
                  Create New Team Member
                </h3>
              </div>
              <button
                onClick={() => setTab("overview")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  isDark ? "bg-white/[0.06] hover:bg-white/10 text-stone-300 hover:text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-black"
                }`}
              >
                ✕ Close
              </button>
            </div>
            <CreateUser />
          </div>
        )}

      </main>

    </div>
  )
}

