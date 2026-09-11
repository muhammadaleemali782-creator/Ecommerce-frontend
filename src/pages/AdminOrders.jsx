import { useState, useEffect, useMemo } from "react"
import InvoiceModal from "../components/InvoiceModal"
import { useTheme } from "../context/ThemeContext"
import EducaLogo from "../components/EducaLogo"

/* ── Primary Status Badge ── */
const StatusBadge = ({ status }) => {
  const map = {
    confirmed:     { label: "Confirmed",      bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500 shadow-[0_0_8px_#10b981]" },
    dist_approved: { label: "Dist. Approved", bg: "bg-sky-500/15 text-sky-400 border-sky-500/30",         dot: "bg-sky-500 shadow-[0_0_8px_#38bdf8]" },
    pending:       { label: "Pending",        bg: "bg-amber-500/15 text-amber-400 border-amber-500/30",     dot: "bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse" },
    rejected:      { label: "Rejected",       bg: "bg-red-500/15 text-red-400 border-red-500/30",           dot: "bg-red-500" },
  }
  const m = map[status] || { label: status || "Unknown", bg: "bg-stone-500/15 text-stone-300 border-stone-500/30", dot: "bg-stone-400" }
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-black px-2.5 py-1 rounded-full border whitespace-nowrap ${m.bg}`}>
      <span className={`w-2 h-2 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

/* ── Notes Cell ── */
const NotesCell = ({ order, isDark }) => {
  const notes = []
  if (order.distributorNote) notes.push({ icon: "🏢", text: order.distributorNote, visible: order.distributorNoteVisible, from: "Dist" })
  if (order.adminNote)       notes.push({ icon: "👑", text: order.adminNote,       visible: order.adminNoteVisible,       from: "Admin" })
  if (!notes.length) return <span className="text-stone-500 text-xs">—</span>
  return (
    <div className="flex flex-col gap-1 max-w-[160px]">
      {notes.map((n, i) => (
        <div key={i} className={`text-[10px] font-mono px-2 py-1 rounded-lg border leading-tight ${
          n.visible
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : isDark ? "bg-white/[0.04] border-white/10 text-stone-400" : "bg-stone-100 border-stone-200 text-stone-700"
        }`}>
          <span className="font-bold text-white">{n.icon} {n.from}:</span> "{n.text}"
          {n.visible && <span className="text-emerald-400 ml-1" title="Visible to seller">👁</span>}
        </div>
      ))}
    </div>
  )
}

/* ── Desktop & Mobile Approval Stepper ── */
const ApprovalTimeline = ({ order, fmtDate }) => {
  const isConfirmed = order.status === "confirmed"
  const isDistApproved = order.distributorApproved && !order.adminBypassedDistributor

  return (
    <div className="space-y-2 font-mono">
      {/* Stage 1: Distributor Review */}
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0 text-sm">
          {isDistApproved ? "🏢" : isConfirmed ? "⚡" : "⏳"}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold leading-tight">
            {isDistApproved ? (
              <span className="text-sky-400">Dist. Approved</span>
            ) : isConfirmed ? (
              <span className="text-amber-300">Direct Route (Admin)</span>
            ) : order.status === "rejected" ? (
              <span className="text-stone-500">Order Cancelled</span>
            ) : (
              <span className="text-stone-400">Dist. Pending</span>
            )}
          </div>
          <div className="text-[9.5px] text-stone-400 mt-0.5 whitespace-nowrap">
            {isDistApproved && order.distributorApprovedAt ? (
              <span>{fmtDate(order.distributorApprovedAt)}</span>
            ) : isConfirmed && !isDistApproved ? (
              <span>Direct Seller · No Dist</span>
            ) : order.status === "pending" ? (
              <span className="text-amber-400/80">Waiting Distributor Action</span>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>

      {/* Stage 2: Admin Confirmation */}
      <div className="flex items-start gap-2 pt-1 border-t border-white/[0.06]">
        <div className="mt-0.5 shrink-0 text-sm">
          {isConfirmed ? "👑" : order.status === "rejected" ? "❌" : "⏳"}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold leading-tight">
            {isConfirmed ? (
              <span className="text-emerald-400">Admin Final Approved</span>
            ) : order.status === "rejected" ? (
              <span className="text-red-400">Admin Rejected</span>
            ) : (
              <span className="text-stone-400">Admin Pending</span>
            )}
          </div>
          <div className="text-[9.5px] text-stone-400 mt-0.5 whitespace-nowrap">
            {isConfirmed && order.confirmedAt ? (
              <span>{fmtDate(order.confirmedAt)}</span>
            ) : order.status === "rejected" && order.rejectedAt ? (
              <span>{fmtDate(order.rejectedAt)}</span>
            ) : (
              <span className="text-amber-400/80">Waiting Admin Final Confirm</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const { isDark } = useTheme()
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState("all")
  const [search,      setSearch]      = useState("")
  const [busy,        setBusy]        = useState(null)
  const [modal,       setModal]       = useState(null)
  const [note,        setNote]        = useState("")
  const [noteVisible, setNoteVisible] = useState(false)
  const [invoice,     setInvoice]     = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectNote,  setRejectNote]  = useState("")
  const [copiedId,    setCopiedId]    = useState(null)

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN")

  const fmtDate = (d) => {
    if (!d) return "—"
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    })
  }

  const load = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const url = filter === "all"
        ? `${import.meta.env.VITE_API_URL}/orders/admin`
        : `${import.meta.env.VITE_API_URL}/orders/admin?status=${filter}`
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Load orders error:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleFinalApprove = async () => {
    if (!modal) return
    try {
      setBusy(modal.orderId)
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/admin-approve/${modal.orderId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ note, noteVisible })
      })
      const data = await res.json()
      if (res.ok) {
        setModal(null)
        setNote("")
        setNoteVisible(false)
        alert("✅ Order Finally Approved!")
        load()
      } else {
        alert("❌ " + (data.msg || data.message))
      }
    } catch (e) {
      alert("Error: " + e.message)
    } finally {
      setBusy(null)
    }
  }

  const handleFinalReject = async () => {
    if (!rejectModal) return
    try {
      setBusy(rejectModal.orderId)
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/reject/${rejectModal.orderId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ note: rejectNote })
      })
      const data = await res.json()
      if (res.ok) {
        setRejectModal(null)
        setRejectNote("")
        alert("Order Rejected.")
        load()
      } else {
        alert("❌ " + (data.msg || data.message))
      }
    } catch (e) {
      alert("Error: " + e.message)
    } finally {
      setBusy(null)
    }
  }

  const counts = {
    all: orders.length,
    pending:       orders.filter(o => o.status === "pending").length,
    dist_approved: orders.filter(o => o.status === "dist_approved").length,
    confirmed:     orders.filter(o => o.status === "confirmed").length,
    rejected:      orders.filter(o => o.status === "rejected").length,
  }

  const STATS_ITEMS = [
    { key: "pending",       label: "Pending Review",  count: counts.pending,       icon: "⏳", accent: "from-amber-500/20 to-amber-600/5", text: "text-amber-400", border: "border-amber-500/30" },
    { key: "dist_approved", label: "Dist. Approved",  count: counts.dist_approved, icon: "🏢", accent: "from-sky-500/20 to-sky-600/5",     text: "text-sky-400",   border: "border-sky-500/30" },
    { key: "confirmed",     label: "Confirmed Orders",count: counts.confirmed,     icon: "✅", accent: "from-emerald-500/20 to-emerald-600/5", text: "text-emerald-400", border: "border-emerald-500/30" },
    { key: "rejected",      label: "Rejected",        count: counts.rejected,      icon: "❌", accent: "from-red-500/20 to-red-600/5",     text: "text-red-400",   border: "border-red-500/30" },
  ]

  const FILTERS = [
    { key: "all",           label: "All Orders",     count: counts.all },
    { key: "pending",       label: "Pending",        count: counts.pending },
    { key: "dist_approved", label: "Dist. Approved", count: counts.dist_approved },
    { key: "confirmed",     label: "Confirmed",      count: counts.confirmed },
    { key: "rejected",      label: "Rejected",       count: counts.rejected },
  ]

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase().trim()
    return orders.filter(o => 
      (o._id || "").toLowerCase().includes(q) ||
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.phone || "").toLowerCase().includes(q) ||
      (o.userId?.name || "").toLowerCase().includes(q) ||
      (o.userId?.fullName || "").toLowerCase().includes(q) ||
      (o.userId?.email || "").toLowerCase().includes(q) ||
      (o.sellerId?.name || "").toLowerCase().includes(q) ||
      (o.sellerId?.fullName || "").toLowerCase().includes(q) ||
      (o.distributorId?.name || "").toLowerCase().includes(q) ||
      (o.distributorId?.fullName || "").toLowerCase().includes(q)
    )
  }, [orders, search])

  return (
    <div className={`space-y-4 sm:space-y-5 select-none transition-colors duration-200 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* ── HEADER HERO ── */}
      <div className={`p-4 sm:p-6 rounded-3xl border transition-all relative overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-[#0c1610] via-[#111c15] to-[#0c120e] border-emerald-500/20 shadow-2xl"
          : "bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1.5 shrink-0 shadow-lg">
              <EducaLogo size={32} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-mono font-black uppercase tracking-widest mb-1">
                ✦ ORDER MANAGEMENT HUB
              </div>
              <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white font-mono">
                Order Control Center
              </h1>
              <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 font-medium">
                Stage 1: Distributor Review → Stage 2: Admin Final Approval · Real-time Status
              </p>
            </div>
          </div>

          <div className="w-full md:w-80">
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-stone-400 text-xs">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search order ID, seller, customer..."
                className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-xs font-mono focus:outline-none transition-all shadow-inner ${
                  isDark
                    ? "bg-black/50 border-white/15 text-white placeholder:text-stone-500 focus:border-amber-400"
                    : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-emerald-600"
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT METRIC TILES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {STATS_ITEMS.map(c => {
          const isActive = filter === c.key
          return (
            <div
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.01] active:scale-[0.99] ${
                isActive
                  ? isDark
                    ? `bg-gradient-to-br ${c.accent} ${c.border} shadow-[0_0_15px_rgba(251,191,36,0.15)]`
                    : "bg-amber-50 border-amber-400 shadow-md"
                  : isDark
                    ? "bg-[#111713] border-white/[0.08] hover:border-white/20"
                    : "bg-white border-stone-200 hover:border-stone-300 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl">{c.icon}</span>
                <span className={`text-xl sm:text-3xl font-black font-mono ${c.text}`}>
                  {c.count}
                </span>
              </div>
              <div className="mt-1.5 sm:mt-2 flex items-center justify-between text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-stone-400 group-hover:text-stone-200">
                <span className="truncate">{c.label}</span>
                <span className="text-[9px] opacity-60 ml-1 shrink-0">➔</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── FILTER TABS BAR ── */}
      <div className={`p-1 rounded-2xl border flex items-center gap-1 overflow-x-auto no-scrollbar touch-pan-x ${
        isDark ? "bg-black/40 border-white/[0.08]" : "bg-stone-100 border-stone-300"
      }`}>
        {FILTERS.map(f => {
          const isActive = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-[#fbbf24] text-black shadow-md font-black"
                  : isDark
                    ? "text-stone-400 hover:text-white hover:bg-white/[0.04]"
                    : "text-stone-600 hover:text-stone-900 hover:bg-white"
              }`}
            >
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                isActive ? "bg-black/20 text-black" : "bg-white/10 text-stone-400"
              }`}>
                {f.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── CONTENT (LOADING / EMPTY / ORDERS) ── */}
      {loading ? (
        <div className="text-center py-20 text-stone-400 text-xs font-mono animate-pulse">
          ⚡ Loading Orders Database...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={`p-10 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <span className="text-4xl block mb-2">📦</span>
          <h3 className="text-sm font-bold uppercase font-mono text-white">No Orders Found</h3>
          <p className="text-xs mt-1 text-stone-400 font-mono">No order records match this filter or search query.</p>
        </div>
      ) : (
        <>
          {/* ─────────────────────────────────────────────────────────── */}
          {/* 1. MOBILE & TABLET CARD VIEW (< lg)                         */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div className="block lg:hidden space-y-3">
            {filteredOrders.map(order => {
              const isBusy = busy === order._id
              const isConfirmed = order.status === "confirmed"
              const hasDirectSeller = Boolean(order.sellerId?.name)
              const hasDistributor = Boolean(order.distributorId?.name)

              // Names & IDs
              const distName = order.distributorId?.fullName || order.distributorId?.name
              const distId   = order.distributorId?.name
              const sellerName = order.sellerId?.fullName || order.sellerId?.name
              const sellerId   = order.sellerId?.name

              return (
                <div
                  key={order._id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isDark ? "bg-[#111713] border-white/[0.09]" : "bg-white border-stone-200 shadow-sm"
                  }`}
                >
                  {/* Top Bar: Order ID, Created Date, Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          onClick={() => handleCopyId(order._id)}
                          className="font-mono font-black text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                        >
                          #{order._id?.slice(-6)}
                        </span>
                        {copiedId === order._id && (
                          <span className="text-[9px] text-emerald-400 font-mono">Copied!</span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5 font-medium">
                        📅 {fmtDate(order.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Customer & Total Row */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
                  }`}>
                    <div className="min-w-0">
                      <div className="font-black text-xs text-white truncate">
                        {order.customerName || "—"}
                      </div>
                      {order.phone && (
                        <a
                          href={`tel:${order.phone}`}
                          className="text-[10.5px] font-mono text-emerald-400 hover:underline block mt-0.5"
                        >
                          📞 {order.phone}
                        </a>
                      )}
                      {order.userId && (
                        <div className="text-[9.5px] font-mono text-sky-400 mt-1">
                          👤 User: <b>{order.userId.fullName || order.userId.name}</b>
                          {order.userId.name && order.userId.fullName && order.userId.name !== order.userId.fullName && (
                            <span className="text-stone-400 ml-1">({order.userId.name})</span>
                          )}
                          {order.userId.email && (
                            <div className="text-[9px] text-stone-400 truncate">
                              ✉️ {order.userId.email}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-base text-emerald-400">
                        ₹{fmt(order.total)}
                      </div>
                      {order.items?.length > 0 && (
                        <div className="text-[10px] font-mono text-stone-400">
                          📦 {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sales Channel (Distributor & Seller) with User Name + ID */}
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                    {/* Distributor Card */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                      isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-stone-50 border-stone-200"
                    }`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider">🏢 Distributor</span>
                          {hasDistributor && distId && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">
                              {distId}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-white text-xs mt-1 truncate">
                          {hasDistributor ? distName : "— Direct"}
                        </div>
                      </div>
                      {hasDistributor && distId && distName !== distId && (
                        <div className="text-[9.5px] text-stone-400 mt-1">
                          ID: <span className="text-violet-300 font-semibold">{distId}</span>
                        </div>
                      )}
                    </div>

                    {/* Seller Card */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                      isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-stone-50 border-stone-200"
                    }`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">🏷️ Seller</span>
                          {hasDirectSeller && sellerId && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              {sellerId}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-white text-xs mt-1 truncate">
                          {hasDirectSeller ? sellerName : "Direct Seller"}
                        </div>
                      </div>
                      {hasDirectSeller && sellerId && sellerName !== sellerId && (
                        <div className="text-[9.5px] text-stone-400 mt-1">
                          ID: <span className="text-emerald-300 font-semibold">{sellerId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approval Timeline Stepper */}
                  <div className={`p-3 rounded-xl border ${
                    isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-stone-50 border-stone-200"
                  }`}>
                    <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-stone-400 mb-2">
                      Approval Timeline
                    </div>
                    <ApprovalTimeline order={order} fmtDate={fmtDate} />
                  </div>

                  {/* Notes (if any) */}
                  {(order.distributorNote || order.adminNote) && (
                    <div className="pt-1">
                      <NotesCell order={order} isDark={isDark} />
                    </div>
                  )}

                  {/* Mobile Action Footer */}
                  <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setInvoice(order)}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isDark
                          ? "bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 border-white/10"
                          : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300"
                      }`}
                    >
                      <span>🧾</span>
                      <span>Invoice</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                          ✓ Completed
                        </span>
                      ) : order.status === "rejected" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono font-bold">
                          ✕ Rejected
                        </span>
                      ) : (
                        <>
                          <button
                            disabled={isBusy}
                            onClick={() => { setRejectModal({ orderId: order._id }); setRejectNote("") }}
                            className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            disabled={isBusy}
                            onClick={() => { setModal({ orderId: order._id }); setNote(""); setNoteVisible(false) }}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                          >
                            👑 Final Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* 2. DESKTOP TABLE VIEW (>= lg)                               */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div className={`hidden lg:block rounded-3xl border overflow-hidden shadow-2xl transition-all ${
            isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
          }`}>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse table-auto min-w-[1020px]">
                <thead>
                  <tr className={`border-b text-[10.5px] font-black uppercase tracking-wider font-mono ${
                    isDark ? "border-white/[0.08] bg-black/50 text-stone-400" : "border-stone-200 bg-stone-50 text-stone-600"
                  }`}>
                    <th className="py-3.5 px-4 w-[140px]">ORDER & TIME</th>
                    <th className="py-3.5 px-4 w-[170px]">CUSTOMER & USER</th>
                    <th className="py-3.5 px-4 w-[190px]">DISTRIBUTOR & SELLER</th>
                    <th className="py-3.5 px-4 w-[90px]">TOTAL</th>
                    <th className="py-3.5 px-4 w-[130px]">NOTES</th>
                    <th className="py-3.5 px-4 w-[240px]">APPROVAL FLOW</th>
                    <th className="py-3.5 px-4 w-[140px] text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${
                  isDark ? "divide-white/[0.05]" : "divide-stone-100"
                }`}>
                  {filteredOrders.map((order) => {
                    const isBusy = busy === order._id
                    const isConfirmed = order.status === "confirmed"
                    const hasDirectSeller = Boolean(order.sellerId?.name)
                    const hasDistributor = Boolean(order.distributorId?.name)

                    const distName = order.distributorId?.fullName || order.distributorId?.name
                    const distId   = order.distributorId?.name
                    const sellerName = order.sellerId?.fullName || order.sellerId?.name
                    const sellerId   = order.sellerId?.name

                    return (
                      <tr
                        key={order._id}
                        className={`transition-colors duration-150 ${
                          isDark ? "hover:bg-white/[0.02]" : "hover:bg-stone-50/80"
                        }`}
                      >
                        {/* 1. ORDER & TIME & INVOICE */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              onClick={() => handleCopyId(order._id)}
                              className="font-mono font-black text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                              title="Click to copy full ID"
                            >
                              #{order._id?.slice(-6)}
                            </span>
                            {copiedId === order._id && (
                              <span className="text-[9px] text-emerald-400 font-mono">Copied!</span>
                            )}
                          </div>

                          <div className="text-[10px] text-stone-300 font-mono mt-1 font-semibold">
                            📅 {fmtDate(order.createdAt)}
                          </div>

                          <div className="mt-2">
                            <StatusBadge status={order.status} />
                          </div>

                          <button
                            onClick={() => setInvoice(order)}
                            className={`mt-2 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                              isDark
                                ? "bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 border-white/10"
                                : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300"
                            }`}
                          >
                            <span>🧾</span>
                            <span>Invoice</span>
                          </button>
                        </td>

                        {/* 2. CUSTOMER & USER */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-black text-xs text-white">
                            {order.customerName || "—"}
                          </div>

                          {order.phone && (
                            <div className="text-[10.5px] font-mono text-stone-400 mt-0.5">
                              📞 {order.phone}
                            </div>
                          )}

                          {order.userId && (
                            <div className="text-[10px] font-mono text-sky-400 mt-1">
                              👤 User: <b>{order.userId.fullName || order.userId.name}</b>
                              {order.userId.name && order.userId.fullName && order.userId.name !== order.userId.fullName && (
                                <span className="text-stone-400 ml-1">({order.userId.name})</span>
                              )}
                              {order.userId.email && (
                                <div className="text-[9px] text-stone-400 font-normal">
                                  ✉️ {order.userId.email}
                                </div>
                              )}
                            </div>
                          )}

                          {order.onBehalfOfId && (
                            <div className="mt-1.5 inline-block text-[9px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/25 font-bold">
                              🎯 {order.placedByName} → {order.onBehalfOfName}
                            </div>
                          )}
                        </td>

                        {/* 3. SALES CHANNEL (DISTRIBUTOR & DIRECT SELLER) */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-2 font-mono">
                            {/* Distributor */}
                            {hasDistributor ? (
                              <div className="text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">
                                    Dist
                                  </span>
                                  <span className="font-bold text-white">
                                    {distName}
                                  </span>
                                </div>
                                {distId && (
                                  <div className="text-[10px] text-violet-300/90 pl-1 mt-0.5">
                                    ID: {distId}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-[10px] text-stone-500">Distributor: — Direct</div>
                            )}

                            {/* Direct Seller */}
                            {hasDirectSeller ? (
                              <div className="text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Seller
                                  </span>
                                  <span className="font-bold text-white">
                                    {sellerName}
                                  </span>
                                </div>
                                {sellerId && (
                                  <div className="text-[10px] text-emerald-300/90 pl-1 mt-0.5">
                                    ID: {sellerId}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-[10px] text-stone-500">Seller: Direct Seller</div>
                            )}
                          </div>
                        </td>

                        {/* 4. TOTAL AMOUNT */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <div className="font-mono font-black text-sm text-emerald-400">
                            ₹{fmt(order.total)}
                          </div>
                          {order.items?.length > 0 && (
                            <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                              📦 {order.items.length} item{order.items.length > 1 ? "s" : ""}
                            </div>
                          )}
                        </td>

                        {/* 5. NOTES */}
                        <td className="py-4 px-4 align-top">
                          <NotesCell order={order} isDark={isDark} />
                        </td>

                        {/* 6. APPROVAL WORKFLOW & TIMELINE */}
                        <td className="py-4 px-4 align-top">
                          <ApprovalTimeline order={order} fmtDate={fmtDate} />
                        </td>

                        {/* 7. ACTIONS */}
                        <td className="py-4 px-4 align-top whitespace-nowrap text-right">
                          {isConfirmed ? (
                            <div className="font-mono text-right">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                                ✓ Completed
                              </span>
                            </div>
                          ) : order.status === "rejected" ? (
                            <div className="font-mono text-right">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-bold">
                                ✕ Rejected
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1.5 items-end font-mono">
                              <button
                                disabled={isBusy}
                                onClick={() => { setModal({ orderId: order._id }); setNote(""); setNoteVisible(false) }}
                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
                              >
                                👑 Final Approve
                              </button>
                              <button
                                disabled={isBusy}
                                onClick={() => { setRejectModal({ orderId: order._id }); setRejectNote("") }}
                                className="px-3 py-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── FINAL APPROVE MODAL ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono">
          <div className={`border rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 ${
            isDark ? "bg-[#121814] border-white/[0.12] text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👑</span>
              <h3 className="text-base font-black uppercase tracking-tight text-white">Final Order Approval</h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Confirming this order will authorize fulfillment and disburse PPC + Direct Seller commission instantly.
            </p>

            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1.5 text-stone-300">
                📝 Admin Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add instructions or delivery note..."
                rows={3}
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none transition-colors ${
                  isDark ? "bg-black/50 border-white/15 text-white placeholder:text-stone-600 focus:border-amber-400" : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-emerald-600"
                }`}
              />
            </div>

            <div
              onClick={() => setNoteVisible(p => !p)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                noteVisible
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-black/30 border-white/10 text-stone-400"
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-black shrink-0 ${
                noteVisible ? "bg-emerald-500 text-white border-emerald-400" : "border-stone-500"
              }`}>
                {noteVisible ? "✓" : ""}
              </div>
              <div className="text-xs">
                <span className="font-bold text-white">Make note visible to Buyer & Seller</span>
                <span className="block text-[10px] text-stone-400">If unchecked, note remains admin-private.</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={busy === modal.orderId}
                onClick={handleFinalApprove}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {busy === modal.orderId ? "Processing..." : "✅ Confirm & Disburse"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono">
          <div className={`border rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 ${
            isDark ? "bg-[#121814] border-red-500/30 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">❌</span>
              <h3 className="text-base font-black uppercase tracking-tight text-red-400">Reject Order</h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Are you sure you want to reject this order? Please write the rejection reason below.
            </p>

            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1.5 text-stone-300">
                Reason for Rejection
              </label>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="Write why this order was rejected..."
                rows={3}
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                  isDark ? "bg-black/50 border-white/15 text-white placeholder:text-stone-600 focus:border-red-500" : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-red-600"
                }`}
              />
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={busy === rejectModal.orderId}
                onClick={handleFinalReject}
                className="flex-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {busy === rejectModal.orderId ? "Rejecting..." : "❌ Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE MODAL ── */}
      {invoice && (
        <InvoiceModal order={invoice} onClose={() => setInvoice(null)} />
      )}
    </div>
  )
}
