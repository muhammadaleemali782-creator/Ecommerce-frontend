import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import InlineLoader from "../components/InlineLoader"

export default function PPCStatement({ setPage }) {
  const { user: authUser } = useAuth()
  const { isDark } = useTheme()

  const [loading, setLoading] = useState(true)
  const [statementData, setStatementData] = useState(null)
  const [error, setError] = useState("")

  // Admin user selection
  const [allUsers, setAllUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [usersLoading, setUsersLoading] = useState(false)

  // Filters
  const [dateFilter, setDateFilter] = useState("all") // "all" | "today" | "7days" | "month" | "custom"
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [walletFilter, setWalletFilter] = useState("all")
  const [search, setSearch] = useState("")

  const token = localStorage.getItem("token")
  const isAdmin = authUser?.role === "admin"

  // Fetch admin user list if admin
  useEffect(() => {
    if (isAdmin) {
      const loadUsers = async () => {
        try {
          setUsersLoading(true)
          const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const data = await res.json()
          const list = Array.isArray(data) ? data : data.users || []
          const eligible = list.filter(u => ["distributor", "seller"].includes(u.role))
          setAllUsers(eligible)
        } catch (e) {
          console.error(e)
        } finally {
          setUsersLoading(false)
        }
      }
      loadUsers()
    }
  }, [isAdmin, token])

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      let url = ""
      if (isAdmin && selectedUserId) {
        url = `${import.meta.env.VITE_API_URL}/api/ppc-settings/ledger/${selectedUserId}`
      } else {
        url = `${import.meta.env.VITE_API_URL}/api/ppc-settings/ledger`
      }

      const params = new URLSearchParams()
      if (walletFilter !== "all") params.append("walletType", walletFilter)

      const now = new Date()
      if (dateFilter === "today") {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        params.append("startDate", d)
      } else if (dateFilter === "7days") {
        const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        params.append("startDate", d)
      } else if (dateFilter === "month") {
        const d = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        params.append("startDate", d)
      } else if (dateFilter === "custom" && startDate) {
        params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
      }

      const queryStr = params.toString() ? `?${params.toString()}` : ""
      const res = await fetch(`${url}${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.message || "Failed to load statement")
      }

      const data = await res.json()
      setStatementData(data)
    } catch (err) {
      console.error(err)
      setError(err.message || "Could not fetch PPC statement")
    } finally {
      setLoading(false)
    }
  }, [isAdmin, selectedUserId, dateFilter, startDate, endDate, walletFilter, token])

  useEffect(() => {
    fetchLedger()
  }, [fetchLedger])

  const ledgerList = statementData?.ledger || []
  const filteredLedger = ledgerList.filter(item => {
    if (!search) return true
    const q = search.toLowerCase()
    const fromName = (item.fromUser?.fullName || item.fromUser?.name || "").toLowerCase()
    const fromId = (item.fromUser?.name || "").toLowerCase()
    const orderId = (item.order?._id || "").toLowerCase()
    return fromName.includes(q) || fromId.includes(q) || orderId.includes(q)
  })

  const totalFilteredPPC = filteredLedger.reduce((s, i) => s + (i.ppcCount || 0), 0)
  const totalFilteredRupees = filteredLedger.reduce((s, i) => s + (i.rupeeValue || 0), 0)

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${
      isDark ? "text-stone-200" : "text-stone-800"
    }`}>
      {/* ── HEADER ── */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📜</span>
            <div>
              <h1 className={`text-xl font-black ${isDark ? "text-white" : "text-stone-900"}`}>
                PPC Statement & Source Tracker
              </h1>
              <p className={`text-xs mt-0.5 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                Dekhein kis date ko, kis user/order se aapko kitna PPC mila
              </p>
            </div>
          </div>
        </div>

        {/* User Badge or Admin Picker */}
        {isAdmin ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Inspect User:</span>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
              }`}
            >
              <option value="">👤 My Own Statement</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.fullName || u.name} ({u.name}) — [{u.role.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 ${
            isDark ? "bg-stone-900 border-white/[0.08]" : "bg-stone-50 border-stone-200"
          }`}>
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-xs">
              {(statementData?.user?.fullName || statementData?.user?.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-bold">{statementData?.user?.fullName || statementData?.user?.name}</div>
              <div className="text-[10px] font-mono text-sky-500">🆔 {statementData?.user?.name}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── SUMMARY STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-stone-400">Total Transactions</p>
          <p className="text-xl font-black mt-1">{filteredLedger.length}</p>
        </div>
        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-blue-500">Total Filtered PPC</p>
          <p className="text-xl font-black mt-1 text-blue-500">+{totalFilteredPPC} <span className="text-xs">PPC</span></p>
        </div>
        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-emerald-500">Equivalent Rupee Value</p>
          <p className="text-xl font-black mt-1 text-emerald-500">₹{totalFilteredRupees.toLocaleString("en-IN")}</p>
        </div>
        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-purple-400">Lifetime PPC Earned</p>
          <p className="text-xl font-black mt-1 text-purple-400">{statementData?.user?.totalPPCEarned || 0} PPC</p>
        </div>
      </div>

      {/* ── FILTERS BAR ── */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Pills */}
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "7days", label: "Last 7 Days" },
            { id: "month", label: "This Month" },
            { id: "custom", label: "Custom" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setDateFilter(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilter === t.id
                  ? "bg-blue-600 text-black shadow-sm"
                  : isDark ? "bg-stone-900 text-stone-300 hover:bg-stone-800" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {t.label}
            </button>
          ))}

          {dateFilter === "custom" && (
            <div className="flex items-center gap-1 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`px-2 py-1 rounded-lg border text-xs ${isDark ? "bg-stone-900 border-white/[0.1]" : "bg-white border-stone-300"}`}
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`px-2 py-1 rounded-lg border text-xs ${isDark ? "bg-stone-900 border-white/[0.1]" : "bg-white border-stone-300"}`}
              />
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder="Search by name, ID, order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full text-xs px-3 py-2 pl-8 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-stone-50 border-stone-300"
            }`}
          />
          <span className="absolute left-2.5 top-2.5 text-xs text-stone-400">🔍</span>
        </div>
      </div>

      {/* ── STATEMENT TABLE / CARDS ── */}
      {loading ? (
        <div className="py-20 text-center">
          <InlineLoader label="Loading PPC statement records..." minHeight={200} />
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-500/10 border border-red-500/30 text-red-500 rounded-3xl">
          {error}
        </div>
      ) : filteredLedger.length === 0 ? (
        <div className={`p-16 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <span className="text-4xl block mb-2">📜</span>
          <h3 className="text-sm font-bold">Koi PPC Transaction Nahi Mila</h3>
          <p className="text-xs text-stone-400 mt-1">Selected filter range me abhi koi PPC credit nahi hua hai.</p>
        </div>
      ) : (
        <div className={`rounded-3xl border overflow-hidden shadow-sm ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b font-mono uppercase text-[10px] ${
                isDark ? "bg-white/[0.02] border-white/[0.08] text-stone-400" : "bg-stone-50 border-stone-200 text-stone-500"
              }`}>
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">From Member</th>
                  <th className="py-3.5 px-4">Source Event</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Share %</th>
                  <th className="py-3.5 px-4">PPC Earned</th>
                  <th className="py-3.5 px-4 text-right">Rupee Value</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-stone-100"}`}>
                {filteredLedger.map((row) => (
                  <tr key={row._id} className="hover:bg-blue-600/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-400">
                      {new Date(row.date).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {row.fromUser ? (
                        <div>
                          <div className="font-bold text-xs">{row.fromUser.fullName || row.fromUser.name}</div>
                          <div className="font-mono text-[10px] text-sky-500">🆔 {row.fromUser.name}</div>
                        </div>
                      ) : (
                        <span className="text-stone-400">Platform / Direct</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                        row.isUserOrder
                          ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                          : row.positionType === "distributor"
                          ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {row.isUserOrder ? "🛒 Direct User Order" : row.positionType === "distributor" ? "🏢 Dist. Override" : "👥 Seller Commission"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-400">
                      {row.order?._id ? `#${row.order._id.slice(-6)}` : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-500">
                      {row.percentageShare}%
                    </td>
                    <td className="py-3 px-4 font-black text-blue-400 text-sm">
                      +{row.ppcCount} PPC
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-500 text-sm">
                      ₹{row.rupeeValue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-white/[0.06]">
            {filteredLedger.map((row) => (
              <div key={row._id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm">
                      {row.fromUser?.fullName || row.fromUser?.name || "Direct Sale"}
                    </div>
                    {row.fromUser?.name && (
                      <div className="font-mono text-xs text-sky-500">🆔 {row.fromUser.name}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-black text-blue-500 text-base">+{row.ppcCount} PPC</span>
                    <div className="font-bold text-xs text-emerald-500">₹{row.rupeeValue.toLocaleString("en-IN")}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                  <span>{new Date(row.date).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="font-mono">{row.order?._id ? `Order #${row.order._id.slice(-6)}` : ""}</span>
                  <span className="font-bold text-blue-400">{row.percentageShare}% Share</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
