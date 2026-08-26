import { useEffect, useState, useMemo } from "react"
import { getRoleLabel } from "../utils/roleLabels"

export default function AdminRequestHistory() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  /* ================= FILTER STATES ================= */
  const [search, setSearch]                       = useState("")
  const [statusFilter, setStatusFilter]           = useState("")
  const [typeFilter, setTypeFilter]               = useState("")
  const [dateFilter, setDateFilter]               = useState("")
  const [decidedDateFilter, setDecidedDateFilter] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/requests/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        setRequests(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Load request history error:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  /* ================= FILTER LOGIC ================= */
  const getDecidedAt = (r) => r.approvedAt || r.rejectedAt || null

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const q = search.toLowerCase().trim()
      const emailMatch = !q || (r.email || "").toLowerCase().includes(q)
      const idMatch    = !q || (r._id || "").toLowerCase().includes(q) || (r.name || "").toLowerCase().includes(q)
      const statusMatch = statusFilter === "" || r.status === statusFilter
      const typeMatch   = typeFilter === "" || r.type === typeFilter
      
      let dateMatch = true
      if (dateFilter) {
        try {
          dateMatch = new Date(r.createdAt).toISOString().slice(0, 10) === dateFilter
        } catch { dateMatch = false }
      }

      let decidedDateMatch = true
      if (decidedDateFilter) {
        const decidedAt = getDecidedAt(r)
        if (decidedAt) {
          try {
            decidedDateMatch = new Date(decidedAt).toISOString().slice(0, 10) === decidedDateFilter
          } catch { decidedDateMatch = false }
        } else {
          decidedDateMatch = false
        }
      }

      return (emailMatch || idMatch) && statusMatch && typeMatch && dateMatch && decidedDateMatch
    })
  }, [requests, search, statusFilter, typeFilter, dateFilter, decidedDateFilter])

  return (
    <div className="space-y-6 select-none">
      
      {/* ── HEADER ── */}
      <div className="bg-[#121814] p-5 sm:p-6 rounded-3xl border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ AUDIT LOGS & ARCHIVE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Requests History & Decision Archive
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Total historical records: <span className="text-white font-bold">{requests.length}</span> · Filtered: <span className="text-purple-300 font-bold">{filteredRequests.length}</span>
          </p>
        </div>
      </div>

      {/* ── SEARCH & FILTER TOOLBAR ── */}
      <div className="bg-[#111713] p-4 rounded-2xl border border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">Search User / Email</label>
          <input
            type="text"
            placeholder="Search email or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-[#fbbf24]"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#fbbf24]"
          >
            <option value="">All Statuses</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
          </select>
        </div>

        {/* Role Type */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">Role Type</label>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#fbbf24]"
          >
            <option value="">All Types</option>
            <option value="distributor">Distributor</option>
            <option value="seller">Seller</option>
            <option value="user">User</option>
            <option value="password-reset">Password Reset</option>
          </select>
        </div>

        {/* Request Date */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">Submission Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#fbbf24]"
          />
        </div>

        {/* Decision Date */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">Decision Date</label>
          <input
            type="date"
            value={decidedDateFilter}
            onChange={e => setDecidedDateFilter(e.target.value)}
            className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#fbbf24]"
          />
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSearch("")
              setStatusFilter("")
              setTypeFilter("")
              setDateFilter("")
              setDecidedDateFilter("")
            }}
            className="w-full py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 text-stone-300 text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* ── TABLE / LIST ── */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs font-mono animate-pulse">
          Loading historical decision log...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-[#111713] p-12 text-center rounded-3xl border border-white/[0.08]">
          <span className="text-3xl block mb-2">📜</span>
          <h3 className="text-sm font-bold text-white uppercase">No History Records Found</h3>
          <p className="text-xs text-stone-400 mt-1">Try resetting the filter inputs above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111713] shadow-lg">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/40 text-[10px] font-black uppercase tracking-wider text-stone-400 font-mono">
                <th className="p-3.5">USER / EMAIL</th>
                <th className="p-3.5">TYPE</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5">SUBMISSION</th>
                <th className="p-3.5">DECISION DATE</th>
                <th className="p-3.5">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredRequests.map(r => {
                const decidedAt = getDecidedAt(r)
                const isApproved = r.status === "approved"
                return (
                  <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-white">{r.name || "—"}</div>
                      <div className="text-[11px] text-stone-400">{r.email || "—"}</div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-stone-300 border border-white/10 text-[10px] font-mono font-bold uppercase">
                        {getRoleLabel(r.type)}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        isApproved
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-red-500/15 text-red-300 border-red-500/30"
                      }`}>
                        {isApproved ? "✅ Approved" : "❌ Rejected"}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-stone-400 font-mono text-[11px]">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-stone-400 font-mono text-[11px]">
                      {decidedAt ? new Date(decidedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>

                    <td className="p-3.5 text-stone-400 text-[11px]">
                      {r.requestedBy?.name ? `Raised by: ${r.requestedBy.name}` : "Self registered"}
                      {r.phone ? ` · 📞 ${r.phone}` : ""}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}