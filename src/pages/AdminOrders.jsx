import { useState, useEffect, useMemo } from "react"
import InvoiceModal from "../components/InvoiceModal"
import { useTheme } from "../context/ThemeContext"

const StatusBadge = ({ status }) => {
  const map = {
    confirmed:     { label: "Confirmed",      bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
    dist_approved: { label: "Dist. Approved", bg: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",         dot: "bg-sky-500" },
    pending:       { label: "Pending",        bg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",     dot: "bg-amber-500" },
    rejected:      { label: "Rejected",       bg: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",           dot: "bg-red-500" },
  }
  const m = map[status] || { label: status || "Unknown", bg: "bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30", dot: "bg-stone-500" }
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border whitespace-nowrap ${m.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

const NotesCell = ({ order, isDark }) => {
  const notes = []
  if (order.distributorNote) notes.push({ icon: "🏢", text: order.distributorNote, visible: order.distributorNoteVisible, from: "Dist" })
  if (order.adminNote)       notes.push({ icon: "👑", text: order.adminNote,       visible: order.adminNoteVisible,       from: "Admin" })
  if (!notes.length) return <span className="text-stone-400 text-xs">—</span>
  return (
    <div className="flex flex-col gap-1 max-w-[200px]">
      {notes.map((n, i) => (
        <div key={i} className={`text-[10px] px-2 py-1 rounded-lg border leading-tight ${
          n.visible
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
            : isDark ? "bg-white/[0.04] border-white/10 text-stone-400" : "bg-stone-100 border-stone-200 text-stone-600"
        }`}>
          {n.icon} <b className={isDark ? "text-white" : "text-stone-900"}>{n.from}:</b> "{n.text}"
          {n.visible && <span className="text-emerald-500 ml-1">👁</span>}
        </div>
      ))}
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
        alert("❌ Order Rejected!")
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

  const fmt     = (n) => Number(n || 0).toLocaleString("en-IN")
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"

  const FILTERS = [
    { key: "all",           label: "All Orders",    color: "bg-white/10 text-white border-white/20" },
    { key: "pending",       label: "Pending",        color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { key: "dist_approved", label: "Dist. Approved", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    { key: "confirmed",     label: "Confirmed",      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    { key: "rejected",      label: "Rejected",       color: "bg-red-500/20 text-red-300 border-red-500/30" },
  ]

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase().trim()
    return orders.filter(o => 
      (o._id || "").toLowerCase().includes(q) ||
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.phone || "").toLowerCase().includes(q) ||
      (o.sellerId?.name || "").toLowerCase().includes(q) ||
      (o.distributorId?.name || "").toLowerCase().includes(q)
    )
  }, [orders, search])

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* ── HEADER ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDark ? "bg-[#121814] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ DISPATCH & ORDER WORKFLOW
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            Order Management & Invoicing Hub
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>
            Stage 1: Distributor Review → Stage 2: Admin Final Approval · Invoices Generated Instantaneously
          </p>
        </div>

        <div className="w-full md:w-72">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order ID, customer, phone..."
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
              isDark
                ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
            }`}
          />
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending",       count: counts.pending,       border: "border-amber-500/30", text: "text-amber-500 dark:text-amber-400", icon: "⏳" },
          { label: "Dist Approved", count: counts.dist_approved, border: "border-sky-500/30",   text: "text-sky-500 dark:text-sky-400",   icon: "🏢" },
          { label: "Confirmed",     count: counts.confirmed,     border: "border-emerald-500/30", text: "text-emerald-500 dark:text-emerald-400", icon: "✅" },
          { label: "Rejected",      count: counts.rejected,      border: "border-red-500/30",   text: "text-red-500 dark:text-red-400",   icon: "❌" },
        ].map(c => (
          <div key={c.label} className={`p-4 rounded-2xl border text-center transition-colors ${
            isDark ? "bg-[#111713]" : "bg-white shadow-sm"
          } ${c.border}`}>
            <div className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>{c.count}</div>
            <div className={`text-[10px] font-bold uppercase tracking-wider font-mono mt-1 ${c.text}`}>
              {c.icon} {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
              filter === f.key
                ? "bg-[#fbbf24] text-black border-[#fbbf24] font-black shadow-sm"
                : isDark
                ? "bg-[#111713] text-stone-300 border-white/[0.08] hover:bg-white/10"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100 shadow-sm"
            }`}
          >
            {f.label} ({counts[f.key] ?? 0})
          </button>
        ))}
      </div>

      {/* ── CONTENT (TABLE & MOBILE CARDS) ── */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs font-mono animate-pulse">
          Loading order database...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <span className="text-3xl block mb-2">📦</span>
          <h3 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>No Orders Found</h3>
          <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>There are no orders matching this filter or search query.</p>
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-2xl border shadow-lg ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-wider font-mono ${
                isDark ? "border-white/[0.08] bg-black/40 text-stone-400" : "border-stone-200 bg-stone-50 text-stone-600"
              }`}>
                <th className="p-3.5">ORDER</th>
                <th className="p-3.5">USER</th>
                <th className="p-3.5">SELLER</th>
                <th className="p-3.5">DISTRIBUTOR</th>
                <th className="p-3.5">CUSTOMER</th>
                <th className="p-3.5">TOTAL</th>
                <th className="p-3.5">NOTES</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${
              isDark ? "divide-white/[0.04]" : "divide-stone-100"
            }`}>
              {filteredOrders.map((order) => {
                const isBusy = busy === order._id
                return (
                  <tr key={order._id} className={`transition-colors ${
                    isDark ? "hover:bg-white/[0.02]" : "hover:bg-stone-50/70"
                  }`}>
                    
                    {/* Order ID & Date & Invoice */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-mono text-xs font-bold text-amber-600 dark:text-[#fbbf24]">#{order._id?.slice(-6)}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{fmtDate(order.createdAt)}</div>
                      <button
                        onClick={() => setInvoice(order)}
                        className={`mt-1.5 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                          isDark ? "bg-white/[0.06] hover:bg-white/10 text-stone-300 border-white/10" : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200"
                        }`}
                      >
                        🧾 Invoice
                      </button>
                    </td>

                    {/* User */}
                    <td className="p-3.5">
                      {order.userId?.name ? (
                        <div>
                          <div className="font-bold font-mono text-sky-500 dark:text-sky-400">{order.userId.name}</div>
                          {order.userId.fullName && order.userId.fullName !== order.userId.name && (
                            <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300 mt-0.5">
                              👤 {order.userId.fullName}
                            </div>
                          )}
                          <div className="text-[10px] text-stone-400 mt-0.5">Customer</div>
                        </div>
                      ) : <span className="text-stone-400">—</span>}
                    </td>

                    {/* Seller */}
                    <td className="p-3.5">
                      {order.sellerId?.name ? (
                        <div>
                          <div className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{order.sellerId.name}</div>
                          {order.sellerId.fullName && order.sellerId.fullName !== order.sellerId.name && (
                            <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300 mt-0.5">
                              👤 {order.sellerId.fullName}
                            </div>
                          )}
                          <div className="text-[10px] text-stone-400 mt-0.5">Seller</div>
                          {order.onBehalfOfId && (
                            <div className="mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                              {order.placedByName} {order.placedByFullName && `(${order.placedByFullName})`} → {order.onBehalfOfName} {order.onBehalfOfFullName && `(${order.onBehalfOfFullName})`}
                            </div>
                          )}
                        </div>
                      ) : <span className="text-stone-400">—</span>}
                    </td>

                    {/* Distributor */}
                    <td className="p-3.5">
                      {order.distributorId?.name ? (
                        <div>
                          <div className="font-bold font-mono text-violet-500 dark:text-violet-400">{order.distributorId.name}</div>
                          {order.distributorId.fullName && order.distributorId.fullName !== order.distributorId.name && (
                            <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300 mt-0.5">
                              👤 {order.distributorId.fullName}
                            </div>
                          )}
                          <div className="text-[10px] text-stone-400 mt-0.5">Distributor</div>
                        </div>
                      ) : <span className="text-stone-400">—</span>}
                    </td>

                    {/* Customer */}
                    <td className="p-3.5">
                      <div className={`font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{order.customerName || "—"}</div>
                      {(order.customerFullName || order.userId?.fullName) && (order.customerFullName || order.userId?.fullName) !== order.customerName && (
                        <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300 mt-0.5">
                          👤 {order.customerFullName || order.userId?.fullName}
                        </div>
                      )}
                      <div className="text-[10px] text-stone-400 mt-0.5">{order.phone || ""}</div>
                    </td>

                    {/* Total Amount */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-black text-sm text-amber-600 dark:text-[#fbbf24]">₹{fmt(order.total)}</div>
                      {order.items?.length > 0 && (
                        <div className="text-[10px] text-stone-400">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="p-3.5">
                      <NotesCell order={order} isDark={isDark} />
                    </td>

                    {/* Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                      {order.approvedByAdmin && order.status === "confirmed" && (
                        <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-1">👑 Admin Approved</div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 whitespace-nowrap text-right">
                      {order.status === "confirmed" || order.status === "rejected" ? (
                        <span className="text-[11px] font-bold text-stone-400">
                          Completed<br />
                          <span className="text-[9.5px] font-mono">{fmtDate(order.confirmedAt || order.rejectedAt)}</span>
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1.5 items-end">
                          <button
                            disabled={isBusy}
                            onClick={() => { setModal({ orderId: order._id }); setNote(""); setNoteVisible(false) }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                          >
                            👑 Final Approve
                          </button>
                          <button
                            disabled={isBusy}
                            onClick={() => { setRejectModal({ orderId: order._id }); setRejectNote("") }}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
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
      )}

      {/* ── FINAL APPROVE MODAL ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 ${
            isDark ? "bg-[#121814] border-white/[0.12] text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👑</span>
              <h3 className={`text-base font-black uppercase ${isDark ? "text-white" : "text-stone-900"}`}>Final Order Approval</h3>
            </div>
            <p className={`text-xs ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              Confirming this order will authorize fulfillment and disburse commissions.
            </p>

            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                📝 Admin Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add instructions or delivery note..."
                rows={3}
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                  isDark ? "bg-black/40 border-white/10 text-white placeholder:text-stone-600 focus:border-[#fbbf24]" : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
                }`}
              />
            </div>

            <div
              onClick={() => setNoteVisible(p => !p)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                noteVisible
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : isDark ? "bg-black/30 border-white/10 text-stone-400" : "bg-stone-50 border-stone-200 text-stone-600"
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-black ${
                noteVisible ? "bg-emerald-500 text-white border-emerald-500" : "border-stone-400"
              }`}>
                {noteVisible ? "✓" : ""}
              </div>
              <span className="text-xs font-bold">
                {noteVisible ? "👁 Note Visible to Seller & Customer" : "🔒 Private Note (Admin Only)"}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setModal(null); setNote(""); setNoteVisible(false) }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer ${
                  isDark ? "bg-white/[0.08] hover:bg-white/15 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleFinalApprove}
                disabled={busy === modal.orderId}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {busy === modal.orderId ? "Processing..." : "Confirm & Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FINAL REJECT MODAL ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 ${
            isDark ? "bg-[#121814] border-red-500/30 text-white" : "bg-white border-red-200 text-stone-900"
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">❌</span>
              <h3 className="text-base font-black text-red-500 uppercase">Reject Order</h3>
            </div>
            <p className={`text-xs ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              This will mark the order as rejected and cancel the purchase.
            </p>

            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                📝 Reason for Rejection
              </label>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="State why this order was rejected..."
                rows={3}
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                  isDark ? "bg-black/40 border-white/10 text-white placeholder:text-stone-600 focus:border-red-500" : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-red-500"
                }`}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setRejectModal(null); setRejectNote("") }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer ${
                  isDark ? "bg-white/[0.08] hover:bg-white/15 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleFinalReject}
                disabled={busy === rejectModal.orderId}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {busy === rejectModal.orderId ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE MODAL ── */}
      {invoice && <InvoiceModal order={invoice} onClose={() => setInvoice(null)} viewerRole="admin" />}

    </div>
  )
}
