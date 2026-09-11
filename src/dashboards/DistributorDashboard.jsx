import { useEffect, useState } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import InlineLoader from "../components/InlineLoader"
import EducaLogo from "../components/EducaLogo"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts"

export default function DistributorDashboard({ setPage }) {
  const { products = [] } = useStore()
  const { user } = useAuth()
  const { isDark } = useTheme()

  const [tab, setTab]           = useState("overview")
  const [downline, setDownline] = useState([])
  const [teamOrders, setTeamOrders] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading]   = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [roleFilter, setRoleFilter] = useState("all")
  const [search, setSearch]     = useState("")
  const [perfTab, setPerfTab]   = useState("my")  // "my" | "team"

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check, { passive: true })
    return () => window.removeEventListener("resize", check)
  }, [])

  const tkn = () => localStorage.getItem("token")
  const hdr = () => ({ Authorization: `Bearer ${tkn()}` })

  useEffect(() => {
    const load = async () => {
      try {
        const [dl, ord, tm] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/users/my-downline`,  { headers: hdr() }),
          fetch(`${import.meta.env.VITE_API_URL}/orders/distributor`, { headers: hdr() }),
          fetch(`${import.meta.env.VITE_API_URL}/orders/team`,        { headers: hdr() }),
        ])
        if (dl.ok)  { const j = await dl.json();  setDownline(j.downline || []) }
        if (ord.ok) { const j = await ord.json(); setAllOrders(Array.isArray(j) ? j : []) }
        if (tm.ok)  { const j = await tm.json();  setTeamOrders(j.orders || []) }
      } catch(e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (!user) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 font-bold mb-2">Session expired or not logged in</div>
        <button
          onClick={() => setPage && setPage("login")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Go to Login
        </button>
      </div>
    )
  }

  const confirmed  = allOrders.filter(o => o.status === "confirmed")
  const totalSales = confirmed.reduce((s, o) => s + (o.total || 0), 0)
  const dists      = downline.filter(u => u.role === "distributor")
  const sellers    = downline.filter(u => u.role === "seller")
  const users      = downline.filter(u => u.role === "user")

  const chartData = (() => {
    const map = {}
    confirmed.forEach(o => {
      const d = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      if (!map[d]) map[d] = { sales: 0, orders: 0, items: 0 }
      map[d].sales  += o.total || 0
      map[d].orders += 1
      map[d].items  += (o.items || []).reduce((s, i) => s + (i.qty || 1), 0)
    })
    const entries = Object.entries(map).slice(-7).map(([date, v]) => ({ date, ...v }))
    if (entries.length === 1) {
      return [
        { date: "", sales: 0, orders: 0, items: 0 },
        entries[0],
        { date: " ", sales: 0, orders: 0, items: 0 }
      ]
    }
    return entries
  })()

  const teamChartData = (() => {
    const map = {}
    teamOrders.forEach(o => {
      const d = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      if (!map[d]) map[d] = { sales: 0, orders: 0 }
      map[d].sales  += o.total || 0
      map[d].orders += 1
    })
    if (Object.keys(map).length === 0) {
      downline.forEach(u => {
        const d = new Date(u.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
        if (!map[d]) map[d] = { members: 0, orders: 0, sales: 0 }
        map[d].members += 1
      })
      return Object.entries(map).slice(-7).map(([date, v]) => ({ date, ...v, isCount: true }))
    }
    return Object.entries(map).slice(-7).map(([date, v]) => ({ date, ...v }))
  })()

  const filteredDl = downline.filter(u => {
    const mr = roleFilter === "all" || u.role === roleFilter
    const ms = !search || u.name?.toLowerCase().includes(search.toLowerCase())
    return mr && ms
  })

  const getStatusColor = s => {
    if (s === "confirmed") return { bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" }
    if (s === "rejected")  return { bg: "bg-red-500/15 text-red-400 border-red-500/30", dot: "bg-red-400" }
    return { bg: "bg-amber-500/15 text-amber-400 border-amber-500/30", dot: "bg-amber-400" }
  }

  const roleStyles = {
    distributor: {
      badge: isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200",
      accent: "#10b981",
    },
    seller: {
      badge: isDark ? "bg-sky-500/15 text-sky-300 border-sky-500/30" : "bg-sky-50 text-sky-700 border-sky-200",
      accent: "#0ea5e9",
    },
    user: {
      badge: isDark ? "bg-purple-500/15 text-purple-300 border-purple-500/30" : "bg-purple-50 text-purple-700 border-purple-200",
      accent: "#a855f7",
    }
  }

  /* ══════════════════════════════════════════════════════════
     MOBILE LAYOUT (Tailwind + Emil Design Engineering)
  ══════════════════════════════════════════════════════════ */
  if (isMobile) {
    const mobileTabs = [
      { key: "overview", label: "Home",   icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { key: "team",     label: "Team",   icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
      { key: "orders",   label: "Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    ]

    return (
      <div className={`min-h-screen pb-24 transition-colors duration-200 ${
        isDark ? "bg-[#090b0c] text-stone-200" : "bg-stone-50 text-stone-900"
      }`}>

        {/* ── Top Hero Card ── */}
        <div className={`p-4 pt-3 ${
          isDark
            ? "bg-gradient-to-b from-[#101b15] via-[#0d1411] to-transparent"
            : "bg-gradient-to-b from-emerald-50 via-white to-transparent"
        }`}>
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark
              ? "bg-[#111613]/90 border-emerald-500/20 shadow-xl shadow-emerald-950/20"
              : "bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-500/40 shadow-lg shadow-emerald-900/15"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 border ${
                isDark
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-inner"
                  : "bg-white/20 text-white border-white/30"
              }`}>
                <EducaLogo size={34} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                    isDark
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-black/20 text-emerald-100 border-white/20"
                  }`}>
                    Distributor Central
                  </span>
                </div>
                <div className="text-base font-black truncate mt-1 leading-tight">
                  {user.fullName || user.name}
                </div>
                {user.name && (
                  <div className={`text-[11px] font-mono mt-0.5 ${
                    isDark ? "text-stone-400" : "text-emerald-100/90"
                  }`}>
                    🆔 {user.name}
                  </div>
                )}
              </div>
            </div>

            {/* 4 Quick Stat Pills */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Orders",   value: allOrders.length,                             icon: "📋", color: isDark ? "text-sky-400" : "text-white" },
                { label: "Sales",    value: `₹${totalSales.toLocaleString("en-IN")}`,     icon: "💰", color: isDark ? "text-emerald-400" : "text-white" },
                { label: "Network",  value: downline.length,                              icon: "👥", color: isDark ? "text-violet-400" : "text-white" },
                { label: "Products", value: products.length,                              icon: "📦", color: isDark ? "text-amber-400" : "text-white" },
              ].map(s => (
                <div
                  key={s.label}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                    isDark
                      ? "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.07]"
                      : "bg-white/15 border-white/20 hover:bg-white/20"
                  }`}
                >
                  <span className="text-base">{s.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-black truncate leading-tight ${s.color}`}>
                      {s.value}
                    </div>
                    <div className={`text-[10px] font-medium leading-none mt-0.5 ${
                      isDark ? "text-stone-400" : "text-emerald-100/80"
                    }`}>
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="px-4 space-y-4">

          {/* 1. OVERVIEW TAB */}
          {tab === "overview" && (
            <>
              {/* Network breakdown counters */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Distributors", value: dists.length,   c: "emerald" },
                  { label: "Sellers",      value: sellers.length, c: "sky" },
                  { label: "Users",        value: users.length,   c: "purple" },
                ].map(s => (
                  <div
                    key={s.label}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isDark
                        ? "bg-[#111417] border-white/[0.08]"
                        : "bg-white border-stone-200 shadow-sm"
                    }`}
                  >
                    <div className={`text-xl font-black ${
                      s.c === "emerald" ? "text-emerald-500" : s.c === "sky" ? "text-sky-500" : "text-purple-500"
                    }`}>
                      {s.value}
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                      isDark ? "text-stone-400" : "text-stone-500"
                    }`}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Section */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
              }`}>
                {/* Switch button */}
                <div className={`flex rounded-xl p-1 border gap-1 mb-3 ${
                  isDark ? "bg-black/30 border-white/[0.06]" : "bg-stone-100 border-stone-200"
                }`}>
                  <button
                    onClick={() => setPerfTab("my")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      perfTab === "my"
                        ? isDark
                          ? "bg-emerald-500 text-black shadow-sm"
                          : "bg-white text-stone-900 shadow-sm"
                        : isDark ? "text-stone-400 hover:text-stone-200" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    📈 My Performance
                  </button>
                  <button
                    onClick={() => setPerfTab("team")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      perfTab === "team"
                        ? isDark
                          ? "bg-emerald-500 text-black shadow-sm"
                          : "bg-white text-stone-900 shadow-sm"
                        : isDark ? "text-stone-400 hover:text-stone-200" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    👥 My Team
                  </button>
                </div>

                {perfTab === "my" && (
                  <div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "Sales",  val: `₹${confirmed.reduce((s,o)=>s+(o.total||0),0).toLocaleString("en-IN")}`, c: "text-emerald-500" },
                        { label: "Orders", val: confirmed.length, c: "text-sky-500" },
                        { label: "Avg",    val: `₹${confirmed.length ? Math.round(confirmed.reduce((s,o)=>s+(o.total||0),0)/confirmed.length) : 0}`, c: "text-amber-500" },
                      ].map(item => (
                        <div key={item.label} className={`p-2 rounded-xl text-center border ${
                          isDark ? "bg-white/[0.02] border-white/[0.04]" : "bg-stone-50 border-stone-100"
                        }`}>
                          <div className={`text-xs font-black truncate ${item.c}`}>{item.val}</div>
                          <div className="text-[9px] text-stone-400 font-medium">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                        <defs>
                          <linearGradient id="mobDistSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff0d" : "#e2e8f0"} />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: isDark ? "#94a3b8" : "#64748b" }} />
                        <YAxis tick={{ fontSize: 9, fill: isDark ? "#94a3b8" : "#64748b" }} tickFormatter={v => `₹${v}`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#14171a" : "#ffffff",
                            borderColor: isDark ? "#ffffff1f" : "#e2e8f0",
                            borderRadius: 10,
                            fontSize: 11,
                            color: isDark ? "#fff" : "#000",
                          }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fill="url(#mobDistSales)" dot={{ fill: "#10b981", r: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {perfTab === "team" && (
                  <div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "Team",    val: downline.length, c: "text-violet-400" },
                        { label: "Sellers", val: sellers.length,  c: "text-sky-400" },
                        { label: "Users",   val: users.length,    c: "text-emerald-400" },
                      ].map(item => (
                        <div key={item.label} className={`p-2 rounded-xl text-center border ${
                          isDark ? "bg-white/[0.02] border-white/[0.04]" : "bg-stone-50 border-stone-100"
                        }`}>
                          <div className={`text-xs font-black truncate ${item.c}`}>{item.val}</div>
                          <div className="text-[9px] text-stone-400 font-medium">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    {teamOrders.length === 0 ? (
                      <div className="text-center py-6 text-xs text-stone-400">
                        📊 Team ne abhi koi order nahi kiya
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={teamChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                          <defs>
                            <linearGradient id="mobTeamSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff0d" : "#e2e8f0"} />
                          <XAxis dataKey="date" tick={{ fontSize: 9, fill: isDark ? "#94a3b8" : "#64748b" }} />
                          <YAxis tick={{ fontSize: 9, fill: isDark ? "#94a3b8" : "#64748b" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isDark ? "#14171a" : "#ffffff",
                              borderColor: isDark ? "#ffffff1f" : "#e2e8f0",
                              borderRadius: 10,
                              fontSize: 11,
                              color: isDark ? "#fff" : "#000",
                            }}
                          />
                          <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#mobTeamSales)" dot={{ fill: "#3b82f6", r: 3 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </div>

              {/* Assigned Products list */}
              {products.length > 0 && (
                <div className={`p-4 rounded-2xl border ${
                  isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">📦 Assigned Products</span>
                    <span className="text-[10px] text-stone-400">{products.length} Items</span>
                  </div>
                  <div className="space-y-2">
                    {products.slice(0, 6).map(p => (
                      <div
                        key={p._id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          isDark ? "bg-white/[0.02] border-white/[0.05]" : "bg-stone-50 border-stone-200/70"
                        }`}
                      >
                        <span className="text-xs font-bold truncate flex-1">{p.title}</span>
                        <span className="text-xs font-black text-emerald-500 shrink-0">₹{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 2. TEAM TAB */}
          {tab === "team" && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider">
                  👥 My Network ({downline.length})
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  ["all", "All"],
                  ["distributor", "Distributors"],
                  ["seller", "Sellers"],
                  ["user", "Users"]
                ].map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setRoleFilter(k)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wide whitespace-nowrap transition-all border ${
                      roleFilter === k
                        ? "bg-emerald-500 text-black border-emerald-400"
                        : isDark
                          ? "bg-white/[0.04] text-stone-300 border-white/[0.08] hover:bg-white/[0.08]"
                          : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Search */}
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search member..."
                className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white placeholder-stone-500 focus:border-emerald-500"
                    : "bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-emerald-500"
                }`}
              />

              {/* List */}
              {loading ? (
                <InlineLoader minHeight={100} />
              ) : filteredDl.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  Koi member nahi mila
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDl.map(u => {
                    const st = roleStyles[u.role] || roleStyles.user
                    return (
                      <div
                        key={u._id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-stone-50 border-stone-200/80"
                        }`}
                        style={{ paddingLeft: `${12 + (u.level - 1) * 8}px` }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate leading-tight">{u.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                            Level {u.level || 1}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${st.badge}`}>
                          {u.role === "seller" ? "Direct Seller" : u.role}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. ORDERS TAB */}
          {tab === "orders" && (
            <div className={`p-4 rounded-2xl border space-y-4 ${
              isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
            }`}>
              {/* Status breakdown pills */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Pending",   v: allOrders.filter(o => o.status === "pending").length,   c: "text-amber-500" },
                  { label: "Confirmed", v: confirmed.length,                                      c: "text-emerald-500" },
                  { label: "Rejected",  v: allOrders.filter(o => o.status === "rejected").length,  c: "text-red-500" },
                ].map(s => (
                  <div
                    key={s.label}
                    className={`p-2.5 rounded-xl border text-center ${
                      isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-stone-50 border-stone-200/80"
                    }`}
                  >
                    <div className={`text-base font-black ${s.c}`}>{s.v}</div>
                    <div className="text-[10px] text-stone-400 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              {loading ? (
                <InlineLoader minHeight={100} />
              ) : allOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  📭 Abhi tak koi order nahi hai
                </div>
              ) : (
                <div className="space-y-2.5">
                  {allOrders.map(o => {
                    const stColor = getStatusColor(o.status)
                    return (
                      <div
                        key={o._id}
                        className={`p-3 rounded-xl border space-y-2 ${
                          isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-stone-50 border-stone-200/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{o.customerName || "Customer"}</div>
                            <div className="text-[10px] text-stone-400 mt-0.5">
                              {o.phone || "No phone"} • Seller: {o.sellerId?.name || "Direct"}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-black text-emerald-500">₹{o.total}</div>
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border mt-1 ${stColor.bg}`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-[9px] text-stone-400 pt-1 border-t border-white/[0.04] flex justify-between">
                          <span>Order #{String(o._id).slice(-6)}</span>
                          <span>{new Date(o.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── Modern Floating Dock Bottom Nav ── */}
        <div className="fixed bottom-3 inset-x-3 max-w-sm mx-auto z-40">
          <div className={`p-1.5 rounded-2xl border backdrop-blur-xl flex items-center justify-around shadow-2xl transition-all ${
            isDark
              ? "bg-[#111417]/95 border-white/10 shadow-black/80"
              : "bg-white/95 border-stone-200/90 shadow-stone-400/20"
          }`}>
            {mobileTabs.map(t => {
              const isActive = tab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                    isActive
                      ? isDark
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isDark
                        ? "text-stone-400 hover:text-stone-200"
                        : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                  </svg>
                  <span className="text-[10px] font-bold leading-none tracking-wide">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
     DESKTOP LAYOUT (Tailwind + Emil Design Engineering)
  ══════════════════════════════════════════════════════════ */
  const deskTabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "team",     label: "👥 My Network" },
    { key: "orders",   label: "📋 Orders" },
  ]

  return (
    <div className={`flex gap-6 max-w-6xl mx-auto p-4 sm:p-6 transition-colors ${
      isDark ? "text-stone-200" : "text-stone-900"
    }`}>

      {/* Sidebar */}
      <div className="w-64 shrink-0 space-y-4">
        {/* User Card */}
        <div className={`p-5 rounded-3xl border transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#121c16] via-[#101412] to-[#0c100e] border-emerald-500/25 shadow-xl shadow-emerald-950/20"
            : "bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-500/30 shadow-lg"
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center p-1 mb-3 border overflow-hidden ${
            isDark
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              : "bg-white/20 text-white border-white/30"
          }`}>
            <EducaLogo size={48} />
          </div>
          <div className="text-base font-black truncate">{user.fullName || user.name}</div>
          {user.name && (
            <div className={`text-xs font-mono mt-0.5 ${isDark ? "text-stone-400" : "text-emerald-100/90"}`}>
              🆔 {user.name}
            </div>
          )}
          <div className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider mt-2 px-2 py-0.5 rounded-md border ${
            isDark
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-black/20 text-emerald-100 border-white/20"
          }`}>
            Distributor
          </div>
        </div>

        {/* Quick KPI List */}
        <div className={`p-4 rounded-3xl border space-y-2.5 ${
          isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          {[
            { label: "Total Orders",   value: allOrders.length,                         color: "text-sky-500" },
            { label: "Total Sales",    value: `₹${totalSales.toLocaleString("en-IN")}`, color: "text-emerald-500" },
            { label: "Distributors",   value: dists.length,                              color: "text-emerald-500" },
            { label: "Sellers",        value: sellers.length,                            color: "text-sky-500" },
            { label: "Users",          value: users.length,                              color: "text-purple-500" },
            { label: "Products",       value: products.length,                           color: "text-amber-500" },
          ].map((s, i) => (
            <div key={s.label} className="flex justify-between items-center text-xs">
              <span className={isDark ? "text-stone-400" : "text-stone-500"}>{s.label}</span>
              <span className={`font-black ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className={`p-2 rounded-2xl border space-y-1 ${
          isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          {deskTabs.map(t => {
            const isActive = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? isDark
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : isDark
                      ? "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* 1. OVERVIEW */}
        {tab === "overview" && (
          <>
            {/* 3 Large Stat Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Distributors", value: dists.length,   c: "emerald" },
                { label: "Sellers",      value: sellers.length, c: "sky" },
                { label: "Users",        value: users.length,   c: "purple" },
              ].map(s => (
                <div
                  key={s.label}
                  className={`p-5 rounded-3xl border transition-all ${
                    isDark
                      ? "bg-[#111417] border-white/[0.08]"
                      : "bg-white border-stone-200 shadow-sm"
                  }`}
                >
                  <div className={`text-3xl font-black ${
                    s.c === "emerald" ? "text-emerald-500" : s.c === "sky" ? "text-sky-500" : "text-purple-500"
                  }`}>
                    {s.value}
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${
                    isDark ? "text-stone-400" : "text-stone-500"
                  }`}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Chart Card */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold uppercase tracking-wider">Performance Analytics</span>
                <div className={`flex rounded-xl p-1 border gap-1 ${
                  isDark ? "bg-black/30 border-white/[0.06]" : "bg-stone-100 border-stone-200"
                }`}>
                  <button
                    onClick={() => setPerfTab("my")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      perfTab === "my"
                        ? isDark ? "bg-emerald-500 text-black shadow" : "bg-white text-stone-900 shadow"
                        : isDark ? "text-stone-400" : "text-stone-600"
                    }`}
                  >
                    📈 My Performance
                  </button>
                  <button
                    onClick={() => setPerfTab("team")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      perfTab === "team"
                        ? isDark ? "bg-emerald-500 text-black shadow" : "bg-white text-stone-900 shadow"
                        : isDark ? "text-stone-400" : "text-stone-600"
                    }`}
                  >
                    👥 My Team Performance
                  </button>
                </div>
              </div>

              {perfTab === "my" ? (
                <>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Total Sales", val: `₹${confirmed.reduce((s,o)=>s+(o.total||0),0).toLocaleString("en-IN")}`, c: "text-emerald-500" },
                      { label: "Orders",      val: confirmed.length,                                                        c: "text-sky-500" },
                      { label: "Avg/Order",   val: `₹${confirmed.length ? Math.round(confirmed.reduce((s,o)=>s+(o.total||0),0)/confirmed.length) : 0}`, c: "text-amber-500" },
                      { label: "Items Sold",  val: confirmed.reduce((s,o)=>s+(o.items||[]).reduce((a,i)=>a+(i.qty||1),0),0), c: "text-purple-500" },
                    ].map(item => (
                      <div key={item.label} className={`p-3 rounded-2xl border text-center ${
                        isDark ? "bg-white/[0.02] border-white/[0.05]" : "bg-stone-50 border-stone-200/70"
                      }`}>
                        <div className={`text-base font-black ${item.c}`}>{item.val}</div>
                        <div className="text-[10px] text-stone-400 font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="deskSalesG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff0d" : "#e2e8f0"} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                      <YAxis tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} tickFormatter={v => `₹${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#14171a" : "#ffffff",
                          borderColor: isDark ? "#ffffff1f" : "#e2e8f0",
                          borderRadius: 12,
                          fontSize: 12,
                          color: isDark ? "#fff" : "#000",
                        }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fill="url(#deskSalesG)" dot={{ fill: "#10b981", r: 4 }} name="Sales (₹)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Team Size",    val: downline.length, c: "text-purple-500" },
                      { label: "Sellers",      val: sellers.length,  c: "text-sky-500" },
                      { label: "Users",        val: users.length,    c: "text-emerald-500" },
                      { label: "Distributors", val: dists.length,    c: "text-amber-500" },
                    ].map(item => (
                      <div key={item.label} className={`p-3 rounded-2xl border text-center ${
                        isDark ? "bg-white/[0.02] border-white/[0.05]" : "bg-stone-50 border-stone-200/70"
                      }`}>
                        <div className={`text-base font-black ${item.c}`}>{item.val}</div>
                        <div className="text-[10px] text-stone-400 font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {teamOrders.length === 0 ? (
                    <div className="text-center py-12 text-sm text-stone-400">
                      📊 Team ne abhi koi order nahi kiya
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={teamChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="deskTeamSalesG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff0d" : "#e2e8f0"} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                        <YAxis tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#14171a" : "#ffffff",
                            borderColor: isDark ? "#ffffff1f" : "#e2e8f0",
                            borderRadius: 12,
                            fontSize: 12,
                            color: isDark ? "#fff" : "#000",
                          }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2.5} fill="url(#deskTeamSalesG)" dot={{ fill: "#3b82f6", r: 4 }} name="Team Sales (₹)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </div>

            {/* Assigned Products Card */}
            {products.length > 0 && (
              <div className={`p-6 rounded-3xl border ${
                isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold uppercase tracking-wider">📦 Assigned Products</span>
                  <span className="text-xs text-stone-400">{products.length} Products</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.map(p => (
                    <div
                      key={p._id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                        isDark ? "bg-white/[0.02] border-white/[0.05]" : "bg-stone-50 border-stone-200/70"
                      }`}
                    >
                      <span className="text-xs font-bold truncate flex-1">{p.title}</span>
                      <span className="text-xs font-black text-emerald-500 shrink-0">₹{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 2. TEAM / NETWORK */}
        {tab === "team" && (
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-sm font-bold uppercase tracking-wider">
                My Network ({downline.length})
              </span>
              <div className="flex gap-1.5 overflow-x-auto">
                {[
                  ["all", "All"],
                  ["distributor", "Distributors"],
                  ["seller", "Sellers"],
                  ["user", "Users"]
                ].map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setRoleFilter(k)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                      roleFilter === k
                        ? "bg-emerald-500 text-black border-emerald-400"
                        : isDark
                          ? "bg-white/[0.04] text-stone-300 border-white/[0.08]"
                          : "bg-stone-100 text-stone-700 border-stone-200"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search network member..."
              className={`w-full p-3 rounded-2xl text-xs border outline-none transition-all ${
                isDark
                  ? "bg-black/40 border-white/10 text-white placeholder-stone-500 focus:border-emerald-500"
                  : "bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-emerald-500"
              }`}
            />

            {filteredDl.length === 0 ? (
              <div className="py-12 text-center text-sm text-stone-400">
                Koi network member nahi mila
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredDl.map(u => {
                  const st = roleStyles[u.role] || roleStyles.user
                  return (
                    <div
                      key={u._id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2.5 ${
                        isDark ? "bg-white/[0.02] border-white/[0.05]" : "bg-stone-50 border-stone-200/80"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{u.name}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">Level {u.level || 1}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${st.badge}`}>
                        {u.role === "seller" ? "Direct Seller" : u.role}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. ORDERS */}
        {tab === "orders" && (
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
          }`}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Pending",   v: allOrders.filter(o => o.status === "pending").length,   c: "text-amber-500" },
                { label: "Confirmed", v: confirmed.length,                                      c: "text-emerald-500" },
                { label: "Rejected",  v: allOrders.filter(o => o.status === "rejected").length,  c: "text-red-500" },
              ].map(s => (
                <div
                  key={s.label}
                  className={`p-4 rounded-2xl border text-center ${
                    isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-stone-50 border-stone-200/80"
                  }`}
                >
                  <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
                  <div className="text-xs text-stone-400 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {loading ? (
              <InlineLoader minHeight={120} />
            ) : allOrders.length === 0 ? (
              <div className="py-12 text-center text-sm text-stone-400">
                📭 Koi order nahi abhi tak
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? "border-white/[0.08]" : "border-stone-200"}`}>
                      {["Customer", "Seller", "Phone", "Total", "Status", "Date"].map(h => (
                        <th key={h} className="p-3 font-bold uppercase tracking-wider text-[10px] text-stone-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {allOrders.map(o => {
                      const stColor = getStatusColor(o.status)
                      return (
                        <tr key={o._id} className={isDark ? "hover:bg-white/[0.02]" : "hover:bg-stone-50"}>
                          <td className="p-3 font-bold">{o.customerName || "—"}</td>
                          <td className="p-3 text-stone-400">{o.sellerId?.name || "—"}</td>
                          <td className="p-3 text-stone-400 font-mono">{o.phone || "—"}</td>
                          <td className="p-3 font-black text-emerald-500">₹{o.total}</td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${stColor.bg}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="p-3 text-stone-400 text-[11px]">
                            {new Date(o.createdAt).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
