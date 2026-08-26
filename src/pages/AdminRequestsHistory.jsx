import { useEffect, useState, useMemo } from "react"
import { getRoleLabel } from "../utils/roleLabels"
import { useTheme } from "../context/ThemeContext"

export default function AdminRequestHistory() {
  const { isDark } = useTheme()
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

  const resetFilters = () => {
    setSearch("")
    setStatusFilter("")
    setTypeFilter("")
    setDateFilter("")
    setDecidedDateFilter("")
  }

  const isAnyFilterActive = Boolean(search || statusFilter || typeFilter || dateFilter || decidedDateFilter)

  // Counts
  const approvedCount = requests.filter(r => r.status === "approved").length
  const rejectedCount = requests.filter(r => r.status === "rejected").length

  return (
    <div className="space-y-5 select-none w-full max-w-full overflow-hidden">
      
      {/* ── HEADER ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors ${
        isDark
          ? "bg-[#121814] border-white/[0.08]"
          : "bg-white border-stone-200/90 shadow-sm"
      } flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ AUDIT & VERIFICATION ARCHIVE
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            Requests Decision History
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>
            Complete historical audit trail of all approved and rejected membership & password reset requests.
          </p>
        </div>

        {/* Status Counter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-bold flex items-center gap-1.5">
            <span>✅</span>
            <span>{approvedCount} Approved</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono font-bold flex items-center gap-1.5">
            <span>❌</span>
            <span>{rejectedCount} Rejected</span>
          </div>
        </div>
      </div>

      {/* ── INTUITIVE, SELF-EXPLANATORY SEARCH & FILTER SUITE ── */}
      <div className={`p-4 sm:p-5 rounded-3xl border space-y-4 transition-colors ${
        isDark
          ? "bg-[#111713] border-white/[0.08]"
          : "bg-white border-stone-200 shadow-sm"
      }`}>

        {/* Row 1: Search Bar + Quick Reset */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by Applicant Name, Email address, or Phone number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-9 pr-8 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none transition-colors border ${
                isDark
                  ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                  : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:bg-white shadow-sm"
              }`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {isAnyFilterActive && (
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-black uppercase transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>↺</span>
              <span>Clear All Filters</span>
            </button>
          )}
        </div>

        {/* Row 2: 4 Unified Clean Dropdown Selectors in 2x2 Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t ${
          isDark ? "border-white/[0.06]" : "border-stone-100"
        }`}>
          
          {/* 1. Decision Status Dropdown */}
          <div>
            <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? "text-stone-300" : "text-stone-700"
            }`}>
              🚦 Decision Status
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs font-bold focus:outline-none border cursor-pointer ${
                isDark
                  ? "bg-black/40 border-white/10 text-white focus:border-[#fbbf24]"
                  : "bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500 focus:bg-white shadow-sm"
              }`}
            >
              <option value="">🔘 All Decisions</option>
              <option value="approved">✅ Approved Only</option>
              <option value="rejected">❌ Rejected Only</option>
            </select>
          </div>

          {/* 2. Role Requested Dropdown */}
          <div>
            <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? "text-stone-300" : "text-stone-700"
            }`}>
              👤 Account Role Requested
            </label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs font-bold focus:outline-none border cursor-pointer ${
                isDark
                  ? "bg-black/40 border-white/10 text-white focus:border-[#fbbf24]"
                  : "bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500 focus:bg-white shadow-sm"
              }`}
            >
              <option value="">👥 All Roles</option>
              <option value="distributor">🏢 Distributor</option>
              <option value="seller">🛒 Direct Seller</option>
              <option value="user">👤 Customer / User</option>
              <option value="password-reset">🔑 Password Reset</option>
            </select>
          </div>

          {/* 3. When Request Was Submitted */}
          <div>
            <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? "text-stone-300" : "text-stone-700"
            }`}>
              📅 When Request Was Submitted
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none border cursor-pointer ${
                isDark
                  ? "bg-black/40 border-white/10 text-white focus:border-[#fbbf24]"
                  : "bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500 focus:bg-white shadow-sm"
              }`}
            />
          </div>

          {/* 4. When Decision Was Taken */}
          <div>
            <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? "text-stone-300" : "text-stone-700"
            }`}>
              ⏱️ When Decision Was Taken
            </label>
            <input
              type="date"
              value={decidedDateFilter}
              onChange={e => setDecidedDateFilter(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none border cursor-pointer ${
                isDark
                  ? "bg-black/40 border-white/10 text-white focus:border-[#fbbf24]"
                  : "bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500 focus:bg-white shadow-sm"
              }`}
            />
          </div>

        </div>

        {/* Active Filter Summary Strip */}
        {isAnyFilterActive && (
          <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 flex-wrap font-semibold ${
            isDark
              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
              : "bg-amber-50 border-amber-200 text-amber-900 shadow-xs"
          }`}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black uppercase text-[11px]">Active Search:</span>
              {search && (
                <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-[11px] ${
                  isDark ? "bg-black/50 text-white border-white/10" : "bg-white text-stone-900 border-amber-200 shadow-xs"
                }`}>
                  Keyword: "{search}"
                </span>
              )}
              {statusFilter && (
                <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-[11px] ${
                  isDark ? "bg-black/50 text-white border-white/10" : "bg-white text-stone-900 border-amber-200 shadow-xs"
                }`}>
                  Status: {statusFilter === "approved" ? "Approved" : "Rejected"}
                </span>
              )}
              {typeFilter && (
                <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-[11px] ${
                  isDark ? "bg-black/50 text-white border-white/10" : "bg-white text-stone-900 border-amber-200 shadow-xs"
                }`}>
                  Role: {typeFilter}
                </span>
              )}
              {dateFilter && (
                <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-[11px] ${
                  isDark ? "bg-black/50 text-white border-white/10" : "bg-white text-stone-900 border-amber-200 shadow-xs"
                }`}>
                  Submitted: {dateFilter}
                </span>
              )}
              {decidedDateFilter && (
                <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-[11px] ${
                  isDark ? "bg-black/50 text-white border-white/10" : "bg-white text-stone-900 border-amber-200 shadow-xs"
                }`}>
                  Decided: {decidedDateFilter}
                </span>
              )}
            </div>
            <div className="font-black text-xs">
              {filteredRequests.length} match{filteredRequests.length === 1 ? "" : "es"} found
            </div>
          </div>
        )}

      </div>

      {/* ── HIGH-DENSITY PRECISE CARDS LIST (ZERO HORIZONTAL SCROLL) ── */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs font-mono animate-pulse">
          Loading historical decision records...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <span className="text-3xl block mb-2">📜</span>
          <h3 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>
            No Matching History Records
          </h3>
          <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
            No request matches your chosen filters. Try clicking "Clear All Filters" above.
          </p>
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
                className={`rounded-2xl border p-4 transition-all duration-150 shadow-sm ${
                  isDark
                    ? "bg-[#111713] hover:bg-[#151c17] border-white/[0.08] hover:border-white/20"
                    : "bg-white hover:bg-stone-50/80 border-stone-200 hover:border-stone-300"
                }`}
              >
                {/* ── TOP BAR: User info + Role tag + Status badge ── */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                  isDark ? "border-white/[0.06]" : "border-stone-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm border shrink-0 ${
                      isApproved
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                    }`}>
                      {nameInitial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-sm ${isDark ? "text-white" : "text-stone-900"}`}>
                          {r.name || "Unnamed Applicant"}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase border ${
                          isDark ? "bg-white/[0.06] text-stone-300 border-white/10" : "bg-stone-100 text-stone-700 border-stone-200"
                        }`}>
                          {getRoleLabel(r.type)}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs font-mono mt-0.5 flex-wrap ${
                        isDark ? "text-stone-400" : "text-stone-500"
                      }`}>
                        <span
                          onClick={() => copyText(r.email, `${r._id}-email`)}
                          className="cursor-pointer hover:underline transition-colors"
                          title="Click to copy email"
                        >
                          ✉️ {r.email || "No email"}
                          {copiedId === `${r._id}-email` && <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">Copied!</span>}
                        </span>
                        {r.phone && (
                          <span
                            onClick={() => copyText(r.phone, `${r._id}-phone`)}
                            className="cursor-pointer hover:underline transition-colors"
                            title="Click to copy phone"
                          >
                            · 📞 {r.phone}
                            {copiedId === `${r._id}-phone` && <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">Copied!</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border whitespace-nowrap ${
                      isApproved
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                    }`}>
                      {isApproved ? "✅ Approved" : "❌ Rejected"}
                    </span>
                  </div>
                </div>

                {/* ── BOTTOM BAR: Structured details grid without horizontal scroll ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3 text-xs">
                  {/* Submission & Decision Timeline */}
                  <div className={`p-2.5 rounded-xl border space-y-1 ${
                    isDark ? "bg-black/40 border-white/[0.04]" : "bg-stone-50 border-stone-200"
                  }`}>
                    <div className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                      isDark ? "text-stone-400" : "text-stone-500"
                    }`}>Timeline</div>
                    <div className="flex items-center justify-between">
                      <span className={isDark ? "text-stone-400" : "text-stone-500"}>Submitted:</span>
                      <span className={`font-mono font-semibold ${isDark ? "text-white" : "text-stone-800"}`}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDark ? "text-stone-400" : "text-stone-500"}>Decided:</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                        {decidedAt ? new Date(decidedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Source & Placement Origin */}
                  <div className={`p-2.5 rounded-xl border space-y-1 ${
                    isDark ? "bg-black/40 border-white/[0.04]" : "bg-stone-50 border-stone-200"
                  }`}>
                    <div className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                      isDark ? "text-stone-400" : "text-stone-500"
                    }`}>Origin & Referral</div>
                    <div className="truncate">
                      <span className={`mr-1.5 ${isDark ? "text-stone-400" : "text-stone-500"}`}>Origin:</span>
                      <span className={`font-bold ${isDark ? "text-white" : "text-stone-900"}`}>
                        {r.requestedBy?.name ? `Raised by ${r.requestedBy.name}` : "Self-Registered Portal"}
                      </span>
                    </div>
                    {r.requestedBy?.role && (
                      <div className={`text-[11px] truncate ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                        <span className="mr-1.5">Role:</span>
                        <span className="capitalize font-semibold">{r.requestedBy.role}</span>
                      </div>
                    )}
                  </div>

                  {/* Decision Notes / Rejection Reason */}
                  <div className={`p-2.5 rounded-xl border space-y-1 sm:col-span-2 md:col-span-1 ${
                    isDark ? "bg-black/40 border-white/[0.04]" : "bg-stone-50 border-stone-200"
                  }`}>
                    <div className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                      isDark ? "text-stone-400" : "text-stone-500"
                    }`}>Decision Audit Note</div>
                    <div className="text-[11px]">
                      {r.rejectReason ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">⚠️ Reason: {r.rejectReason}</span>
                      ) : r.note ? (
                        <span className="font-medium text-stone-800 dark:text-stone-200">📝 {r.note}</span>
                      ) : isApproved ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">✅ Verified and onboarded by Admin</span>
                      ) : (
                        <span className="text-stone-400 italic">No additional remarks</span>
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

