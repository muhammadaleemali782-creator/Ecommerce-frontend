import { useEffect, useState, useMemo } from "react"
import { getRoleLabel } from "../utils/roleLabels"

export default function AdminRequestHistory() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [copiedId, setCopiedId] = useState(null)

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
      const phoneMatch = !q || (r.phone || "").toLowerCase().includes(q)
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

      return (emailMatch || idMatch || phoneMatch) && statusMatch && typeMatch && dateMatch && decidedDateMatch
    })
  }, [requests, search, statusFilter, typeFilter, dateFilter, decidedDateFilter])

  const copyText = (text, id) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  // Quick stats
  const approvedCount = requests.filter(r => r.status === "approved").length
  const rejectedCount = requests.filter(r => r.status === "rejected").length

  return (
    <div className="space-y-5 select-none w-full max-w-full overflow-hidden">
      
      {/* ── HEADER ── */}
      <div className="bg-[#121814] p-4 sm:p-6 rounded-3xl border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ AUDIT LOGS & DECISION ARCHIVE
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
            Requests History & Verification Log
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Total records: <span className="text-white font-bold">{requests.length}</span> · Showing: <span className="text-purple-300 font-bold">{filteredRequests.length}</span>
          </p>
        </div>

        {/* Status Counts Pill Summary */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <span>✅</span>
            <span>{approvedCount} Approved</span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <span>❌</span>
            <span>{rejectedCount} Rejected</span>
          </div>
        </div>
      </div>

      {/* ── QUICK FILTER CHIPS ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { label: "All History", status: "", type: "" },
          { label: "✅ Approved", status: "approved", type: "" },
          { label: "❌ Rejected", status: "rejected", type: "" },
          { label: "Distributors", status: "", type: "distributor" },
          { label: "Sellers", status: "", type: "seller" },
          { label: "Users", status: "", type: "user" },
          { label: "Password Resets", status: "", type: "password-reset" },
        ].map((chip, idx) => {
          const isActive = (chip.status ? statusFilter === chip.status : !statusFilter) &&
                           (chip.type ? typeFilter === chip.type : !typeFilter)
          return (
            <button
              key={idx}
              onClick={() => {
                setStatusFilter(chip.status)
                setTypeFilter(chip.type)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                isActive
                  ? "bg-[#fbbf24] text-black border-[#fbbf24] font-black shadow-md"
                  : "bg-[#111713] text-stone-300 border-white/[0.08] hover:border-white/20 hover:text-white"
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {/* ── SEARCH & DATE FILTER TOOLBAR ── */}
      <div className="bg-[#111713] p-4 rounded-2xl border border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">Search Keyword (Name / Email / Phone)</label>
          <input
            type="text"
            placeholder="Search applicant name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-[#fbbf24]"
          />
        </div>

        {/* Submission Date */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">📅 Submitted On</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#fbbf24]"
          />
        </div>

        {/* Decision Date */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">⏱️ Decided On</label>
          <input
            type="date"
            value={decidedDateFilter}
            onChange={e => setDecidedDateFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#fbbf24]"
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
            className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/15 text-stone-300 text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* ── HIGH-DENSITY PRECISE CARDS LIST (ZERO HORIZONTAL SCROLL) ── */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs font-mono animate-pulse">
          Loading historical decision log...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-[#111713] p-12 text-center rounded-3xl border border-white/[0.08]">
          <span className="text-3xl block mb-2">📜</span>
          <h3 className="text-sm font-bold text-white uppercase">No History Records Found</h3>
          <p className="text-xs text-stone-400 mt-1">Try resetting or adjusting the filter inputs above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(r => {
            const decidedAt = getDecidedAt(r)
            const isApproved = r.status === "approved"
            const nameInitial = r.name ? r.name[0].toUpperCase() : "U"

            return (
              <div
                key={r._id}
                className="bg-[#111713] hover:bg-[#151c17] rounded-2xl border border-white/[0.08] hover:border-white/20 p-4 transition-all duration-150 shadow-md"
              >
                {/* ── TOP BAR: User info + Role tag + Status badge ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm border shrink-0 ${
                      isApproved ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-red-500/15 text-red-300 border-red-500/30"
                    }`}>
                      {nameInitial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{r.name || "Unnamed Applicant"}</span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] text-stone-300 border border-white/10 text-[9.5px] font-mono font-bold uppercase">
                          {getRoleLabel(r.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mt-0.5 flex-wrap">
                        <span
                          onClick={() => copyText(r.email, `${r._id}-email`)}
                          className="cursor-pointer hover:text-white transition-colors"
                          title="Click to copy email"
                        >
                          ✉️ {r.email || "No email"}
                          {copiedId === `${r._id}-email` && <span className="text-emerald-400 font-bold ml-1">Copied!</span>}
                        </span>
                        {r.phone && (
                          <span
                            onClick={() => copyText(r.phone, `${r._id}-phone`)}
                            className="cursor-pointer hover:text-white transition-colors"
                            title="Click to copy phone"
                          >
                            · 📞 {r.phone}
                            {copiedId === `${r._id}-phone` && <span className="text-emerald-400 font-bold ml-1">Copied!</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border whitespace-nowrap ${
                      isApproved
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/15 text-red-300 border-red-500/30"
                    }`}>
                      {isApproved ? "✅ Approved" : "❌ Rejected"}
                    </span>
                  </div>
                </div>

                {/* ── BOTTOM BAR: Structured details grid without horizontal scroll ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3 text-xs">
                  {/* Submission & Decision Timeline */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">Timeline</div>
                    <div className="text-stone-300 flex items-center justify-between">
                      <span className="text-stone-500">Submitted:</span>
                      <span className="font-mono text-white">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </div>
                    <div className="text-stone-300 flex items-center justify-between">
                      <span className="text-stone-500">Decided:</span>
                      <span className="font-mono text-purple-300">
                        {decidedAt ? new Date(decidedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Source & Placement Origin */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">Origin & Referral</div>
                    <div className="text-stone-300 truncate">
                      <span className="text-stone-500 mr-1.5">Origin:</span>
                      <span className="font-bold text-white">
                        {r.requestedBy?.name ? `Raised by ${r.requestedBy.name}` : "Self-Registered Portal"}
                      </span>
                    </div>
                    {r.requestedBy?.role && (
                      <div className="text-stone-400 text-[11px] truncate">
                        <span className="text-stone-500 mr-1.5">Role:</span>
                        <span className="capitalize">{r.requestedBy.role}</span>
                      </div>
                    )}
                  </div>

                  {/* Decision Notes / Rejection Reason */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04] space-y-1 sm:col-span-2 md:col-span-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">Decision Audit Note</div>
                    <div className="text-stone-300 text-[11px]">
                      {r.rejectReason ? (
                        <span className="text-red-300 font-medium">⚠️ Reason: {r.rejectReason}</span>
                      ) : r.note ? (
                        <span className="text-stone-300 font-medium">📝 {r.note}</span>
                      ) : isApproved ? (
                        <span className="text-emerald-400 font-medium">✅ Verified and onboarded by Admin</span>
                      ) : (
                        <span className="text-stone-500 italic">No additional remarks</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
