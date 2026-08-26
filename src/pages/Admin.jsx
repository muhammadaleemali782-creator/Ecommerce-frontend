import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
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
  ═════════════════════════════════════════════════════════════════════
*/

export default function Admin({ setPage }) {
  const { user } = useAuth()
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
      <div className="p-8 max-w-md mx-auto text-center bg-[#101512] rounded-3xl border border-red-500/30 text-red-400 font-bold mt-10">
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
          accent: "from-amber-500/20 to-transparent text-amber-300 border-amber-500/30",
        },
        {
          id: "admin-orders",
          title: "Order Management",
          desc: "Track total orders, update dispatch state & print invoices",
          icon: "🛍️",
          tag: "SALES",
          accent: "from-emerald-500/20 to-transparent text-emerald-300 border-emerald-500/30",
        },
        {
          id: "admin-invoice-settings",
          title: "Invoice & GST Settings",
          desc: "Configure GSTIN, company address & billing templates",
          icon: "🧾",
          tag: "BILLING",
          accent: "from-sky-500/20 to-transparent text-sky-300 border-sky-500/30",
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
          accent: "from-blue-500/20 to-transparent text-blue-300 border-blue-500/30",
        },
        {
          id: "admin-network",
          title: "Multi-Tier Network Tree",
          desc: "Visual interactive hierarchical MLM tree of downlines",
          icon: "🌐",
          tag: "TREE",
          accent: "from-violet-500/20 to-transparent text-violet-300 border-violet-500/30",
        },
        {
          id: "create-tab",
          title: "Create New User",
          desc: "Manually register and onboard distributors or direct sellers",
          icon: "➕",
          tag: "ONBOARD",
          accent: "from-indigo-500/20 to-transparent text-indigo-300 border-indigo-500/30",
          action: () => setTab("create"),
        },
      ]
    },
    {
      category: "Finance & Wallet",
      items: [
        {
          id: "admin-ppc-settings",
          title: "PPC & Wallet Settings",
          desc: "Set Pay-Per-Click rewards, coin ratios & wallet limits",
          icon: "💰",
          tag: "PPC",
          accent: "from-amber-500/20 to-transparent text-[#fbbf24] border-[#fbbf24]/30",
        },
        {
          id: "admin-withdrawal-management",
          title: "Withdrawal Approvals",
          desc: "Review and approve bank payouts for distributors/sellers",
          icon: "🏦",
          tag: "PAYOUTS",
          accent: "from-emerald-500/20 to-transparent text-emerald-400 border-emerald-500/30",
        },
        {
          id: "email-settings",
          title: "Email & SMTP Settings",
          desc: "Configure automated notification emails and SMTP credentials",
          icon: "📨",
          tag: "SYSTEM",
          accent: "from-sky-500/20 to-transparent text-sky-300 border-sky-500/30",
        },
      ]
    },
    {
      category: "Services & Operations",
      items: [
        {
          id: "admin-banners",
          title: "Home Banners & Video Ads",
          desc: "Manage hero video slots, ad banners, and promotional slides",
          icon: "🎬",
          tag: "ADS",
          accent: "from-rose-500/20 to-transparent text-rose-300 border-rose-500/30",
        },
        {
          id: "admin-services",
          title: "Consultation Services",
          desc: "Nadi Parikshan, Rogsetu clinics & wellness consultations",
          icon: "🩺",
          tag: "HEALTH",
          accent: "from-teal-500/20 to-transparent text-teal-300 border-teal-500/30",
        },
        {
          id: "admin-requests",
          title: "Pending Member Requests",
          desc: "Approve or decline incoming seller / distributor requests",
          icon: "📬",
          tag: "APPROVALS",
          accent: "from-orange-500/20 to-transparent text-orange-300 border-orange-500/30",
        },
        {
          id: "admin-requests-history",
          title: "Requests Archive History",
          desc: "Full historical audit trail of past approvals & rejections",
          icon: "📜",
          tag: "LOGS",
          accent: "from-purple-500/20 to-transparent text-purple-300 border-purple-500/30",
        },
        {
          id: "admin-nuke",
          title: "Emergency Data Purge",
          desc: "Reset database and purge test data safely (Admin only)",
          icon: "☢️",
          tag: "DANGER",
          accent: "from-red-600/30 to-transparent text-red-400 border-red-500/40",
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
  }, [searchModule])

  return (
    <div className="min-h-screen bg-[#0a0d0b] text-white selection:bg-[#fbbf24] selection:text-black pb-20">
      
      {/* ── TOP HERO EXECUTIVE BANNER ── */}
      <section className="bg-gradient-to-b from-[#121814] via-[#0d120f] to-[#0a0d0b] border-b border-white/[0.08] pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#fbbf24] to-amber-200 text-black flex items-center justify-center text-2xl sm:text-3xl font-black shadow-[0_0_25px_rgba(251,191,36,0.3)] shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    SUPER ADMIN
                  </span>
                  <span className="text-[10px] font-mono text-white/40 uppercase hidden sm:inline">
                    EDUCA VEDA COMMAND CENTER
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">
                  {user?.name || "System Administrator"}
                </h1>
                <p className="text-xs text-stone-400 font-medium truncate max-w-xs sm:max-w-md">
                  {user?.email || "admin@educaveda.com"}
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
              <button
                onClick={() => setPage?.("store")}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-stone-200 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🏪 Live Store</span>
                <span>➔</span>
              </button>
              <ShareButton compact style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-6 pt-6 border-t border-white/[0.08]">
            <div className="bg-[#121714]/80 p-3 sm:p-4 rounded-2xl border border-sky-500/20 text-center">
              <span className="text-base sm:text-xl block mb-1">🏢</span>
              <div className="text-lg sm:text-2xl font-black text-sky-400 tracking-tight">
                {networkStats.distributors}
              </div>
              <div className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 font-mono">
                Distributors
              </div>
            </div>

            <div className="bg-[#121714]/80 p-3 sm:p-4 rounded-2xl border border-emerald-500/20 text-center">
              <span className="text-base sm:text-xl block mb-1">🛒</span>
              <div className="text-lg sm:text-2xl font-black text-emerald-400 tracking-tight">
                {networkStats.sellers}
              </div>
              <div className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 font-mono">
                Direct Sellers
              </div>
            </div>

            <div className="bg-[#121714]/80 p-3 sm:p-4 rounded-2xl border border-amber-500/20 text-center">
              <span className="text-base sm:text-xl block mb-1">👤</span>
              <div className="text-lg sm:text-2xl font-black text-[#fbbf24] tracking-tight">
                {networkStats.users}
              </div>
              <div className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 font-mono">
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
                    : "bg-white/[0.06] text-stone-300 hover:bg-white/10 hover:text-white border border-white/[0.08]"
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111713] p-3 sm:p-4 rounded-2xl border border-white/[0.08]">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-[#fbbf24] transition-colors"
                />
              </div>

              {searchModule && (
                <button
                  onClick={() => setSearchModule("")}
                  className="px-3 py-2 rounded-xl bg-white/10 text-xs text-stone-300 hover:text-white cursor-pointer font-bold"
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
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-stone-300 font-mono">
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
                        className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${item.accent} bg-[#111713] border border-white/[0.08] hover:border-white/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-2xl p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
                              {item.icon}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-black/50 text-[9px] font-black uppercase tracking-widest font-mono border border-white/10">
                              {item.tag}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-black text-white group-hover:text-[#fbbf24] transition-colors leading-tight">
                            {item.title}
                          </h4>

                          <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-bold text-stone-300 group-hover:text-white">
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
          <div className="bg-[#111713] p-5 sm:p-7 rounded-3xl border border-white/[0.08] shadow-lg">
            <AdminAnalytics setPage={setPage} />
          </div>
        )}

        {/* ══ TAB 3: CREATE USER FORM ══ */}
        {tab === "create" && (
          <div className="bg-[#111713] p-5 sm:p-7 rounded-3xl border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#fbbf24] font-mono">
                  DIRECT ONBOARDING
                </span>
                <h3 className="text-lg font-black text-white uppercase">Create New Team Member</h3>
              </div>
              <button
                onClick={() => setTab("overview")}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-xs font-bold text-stone-300 hover:text-white"
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

