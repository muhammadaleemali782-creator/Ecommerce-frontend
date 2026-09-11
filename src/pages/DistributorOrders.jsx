import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import InvoiceModal from "../components/InvoiceModal"
import EducaLogo from "../components/EducaLogo"

export default function DistributorOrders() {
  const [tab,         setTab]         = useState("pending")
  const [orders,      setOrders]      = useState([])
  const [invoice,     setInvoice]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(null)  // { orderId, action: "approve"|"reject" }
  const [note,        setNote]        = useState("")
  const [noteVisible, setNoteVisible] = useState(false)
  const [busy,        setBusy]        = useState(null)
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768)
  const { isDark } = useTheme() || {}

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

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
      const url = tab === "pending"
        ? `${import.meta.env.VITE_API_URL}/orders/pending`
        : `${import.meta.env.VITE_API_URL}/orders/distributor`
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [tab])

  const handleAction = async () => {
    if (!modal) return
    try {
      setBusy(modal.orderId)
      const token = localStorage.getItem("token")
      const isApprove = modal.action === "approve"
      const url = isApprove
        ? `${import.meta.env.VITE_API_URL}/orders/dist-approve/${modal.orderId}`
        : `${import.meta.env.VITE_API_URL}/orders/reject/${modal.orderId}`

      const res  = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ note, noteVisible })
      })
      const data = await res.json()
      if (res.ok) {
        setModal(null)
        setNote("")
        setNoteVisible(false)
        alert(isApprove
          ? "✅ Stage 1 Approve ho gaya! Ab Admin final approve karega — tabhi PPC aur Sales update hongi."
          : "Order reject ho gaya.")
        load()
      } else {
        alert("❌ " + (data.msg || data.message))
      }
    } catch(e) {
      alert("Error: " + e.message)
    } finally {
      setBusy(null)
    }
  }

  /* ── Status Section ── */
  const StatusSection = ({ order }) => {
    const s = order.status
    return (
      <div className="space-y-1">
        {s === "pending" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full border bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            ⏳ Pending — Aapka approval chahiye
          </span>
        )}
        {s === "dist_approved" && (
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full border bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              🏢 Dist. Approved
            </span>
            <div className="text-[10px] text-sky-600 dark:text-sky-400 font-mono mt-1 font-bold">⏳ Admin final approval baaki</div>
            {order.distributorApprovedAt && (
              <div className="text-[9px] text-stone-400 font-mono">🕒 {fmtDate(order.distributorApprovedAt)}</div>
            )}
          </div>
        )}
        {s === "confirmed" && (
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ✅ Confirmed
            </span>
            {order.distributorApproved && (
              <div className="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-bold mt-1">
                🏢 Dist. Approved {order.distributorApprovedAt && `(${fmtDate(order.distributorApprovedAt)})`}
              </div>
            )}
            {order.approvedByAdmin && (
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold mt-0.5">
                👑 Admin Final Approved {order.confirmedAt && `(${fmtDate(order.confirmedAt)})`}
              </div>
            )}
          </div>
        )}
        {s === "rejected" && (
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full border bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              ❌ Rejected
            </span>
            {order.rejectedAt && (
              <div className="text-[9px] text-stone-400 font-mono mt-1">🕒 {fmtDate(order.rejectedAt)}</div>
            )}
          </div>
        )}

        {/* Distributor Note */}
        {order.distributorNote && (
          <div className={`mt-1.5 text-[10px] px-2 py-1 rounded-lg border font-mono ${
            order.distributorNoteVisible
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
              : isDark ? "bg-white/[0.04] border-white/10 text-stone-400" : "bg-stone-100 border-stone-200 text-stone-600"
          }`}>
            📝 <b>Aapka note:</b> "{order.distributorNote}"
            <span className="ml-1 text-[9px] opacity-80">
              {order.distributorNoteVisible ? "— 👁 Public" : "— 🔒 Private"}
            </span>
          </div>
        )}

        {/* Admin Note */}
        {order.adminNote && order.adminNoteVisible && (
          <div className={`mt-1 text-[10px] px-2 py-1 rounded-lg border font-mono ${
            isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-900"
          }`}>
            👑 <b>Admin:</b> "{order.adminNote}"
          </div>
        )}
      </div>
    )
  }

  /* ── Collapsible Products ── */
  const ProductsCollapse = ({ items }) => {
    const [open, setOpen] = useState(false)
    if (!items?.length) return <span className="text-xs text-stone-400">—</span>
    return (
      <div className="mt-1">
        <button
          onClick={() => setOpen(p => !p)}
          className={`px-2 py-1 rounded-lg border text-[10.5px] font-bold font-mono flex items-center gap-1.5 cursor-pointer transition-colors ${
            isDark
              ? "bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 border-white/10"
              : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300"
          }`}
        >
          <span>📦 {items.length} item{items.length > 1 ? "s" : ""}</span>
          <span className="text-[9px]">{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <div className={`mt-2 rounded-xl border p-2.5 space-y-2 text-xs font-mono shadow-md ${
            isDark ? "bg-black/60 border-white/10 text-stone-300" : "bg-stone-50 border-stone-200 text-stone-800"
          }`}>
            {items.map((item, i) => (
              <div key={i} className="pb-1.5 border-b border-white/[0.06] last:border-0 last:pb-0">
                <div className="flex items-center justify-between font-bold">
                  <span>{item.title || item.name || "Product"}</span>
                  <span className="text-emerald-500 font-black">
                    ₹{item.price} × {item.qty || item.quantity || 1}
                  </span>
                </div>
                {(item.ppcReward || 0) > 0 && (
                  <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-400 font-bold border border-violet-500/30">
                    💎 {item.ppcReward} PPC
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ── Mobile Card ── */
  const MobileCard = ({ order }) => {
    const isPending = order.status === "pending"
    return (
      <div className={`p-4 rounded-2xl border mb-3 shadow-md transition-all ${
        isDark ? "bg-[#111713] border-white/[0.08] text-white" : "bg-white border-stone-200 text-stone-900 shadow-sm"
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-3">
          <div>
            <span className="font-mono font-bold text-xs text-amber-500">#{order._id?.slice(-6)}</span>
            <div className="text-[10px] text-stone-400 font-mono mt-0.5">{fmtDate(order.createdAt)}</div>
          </div>
          <button
            onClick={() => setInvoice(order)}
            className={`px-2.5 py-1 rounded-lg border text-[10.5px] font-bold font-mono flex items-center gap-1 cursor-pointer ${
              isDark ? "bg-white/[0.06] hover:bg-white/10 text-stone-300 border-white/10" : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300"
            }`}
          >
            🧾 Invoice
          </button>
        </div>

        <div className="mb-3">
          <StatusSection order={order} />
        </div>

        {order.onBehalfOfId && (
          <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono">
            🎯 <b>{order.placedByName}</b> → <b>{order.onBehalfOfName}</b>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3 p-2.5 rounded-xl bg-black/20 dark:bg-white/[0.02] border border-white/[0.05]">
          <div>
            <span className="text-[10px] text-stone-400 uppercase block">Direct Seller</span>
            <span className="font-bold text-emerald-500">{order.sellerId?.name || "—"}</span>
            {order.sellerId?.fullName && order.sellerId.fullName !== order.sellerId.name && (
              <div className="text-[10px] text-stone-400 truncate">👤 {order.sellerId.fullName}</div>
            )}
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase block">Customer</span>
            <span className="font-bold truncate block">{order.customerName || "—"}</span>
            <div className="text-[10px] text-stone-400">{order.phone || "—"}</div>
          </div>
          <div className="col-span-2 pt-1 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-stone-400">Total:</span>
            <span className="font-black text-sm text-emerald-500">₹{order.total?.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <ProductsCollapse items={order.items} />

        {isPending && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => { setModal({ orderId: order._id, action: "approve" }); setNote(""); setNoteVisible(false) }}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-mono"
            >
              ✅ Approve (Stage 1)
            </button>
            <button
              onClick={() => { setModal({ orderId: order._id, action: "reject" }); setNote(""); setNoteVisible(false) }}
              className="px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-500 border border-red-500/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-mono"
            >
              ❌ Reject
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* ── HEADER BANNER ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all relative overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-[#0c1f17] via-[#102a1f] to-[#0c1612] border-emerald-500/20 shadow-2xl"
          : "bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-lg"
      }`}>
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1 shrink-0 shadow-md">
            <EducaLogo size={36} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[9.5px] font-mono font-black uppercase tracking-widest mb-1">
              ✦ STAGE 1: DISTRIBUTOR DISPATCH & REVIEW
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-mono">
              Orders Dashboard
            </h1>
            <p className="text-xs text-white/80 mt-0.5 font-medium">
              Aapka approval Stage 1 hai — Admin Stage 2 pe final approve karke PPC + Sales distribute karega.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2-STAGE PROCESS NOTICE ── */}
      <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 font-medium ${
        isDark
          ? "bg-sky-500/10 border-sky-500/20 text-sky-300"
          : "bg-sky-50 border-sky-200 text-sky-800 shadow-xs"
      }`}>
        <span className="text-base">💡</span>
        <div>
          <b>2-Stage Order Flow:</b> Pehle aap review karke Stage 1 approve karein → Phir Admin Stage 2 final approve karega → Tab sabhi wallets me PPC & Sales trigger hongi.
        </div>
      </div>

      {/* ── TAB SELECTOR ── */}
      <div className={`p-1 rounded-2xl border flex gap-1 font-mono text-xs max-w-md ${
        isDark ? "bg-black/40 border-white/[0.08]" : "bg-stone-100 border-stone-300"
      }`}>
        {[
          { key: "pending", label: "⏳ Pending Approval" },
          { key: "all",     label: "📋 Sab Orders" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer uppercase tracking-wider text-[11px] ${
              tab === t.key
                ? isDark
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "bg-white text-emerald-900 border border-emerald-300 shadow-xs"
                : isDark
                  ? "text-stone-400 hover:text-white"
                  : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs font-mono animate-pulse">
          Orders load ho rahe hain...
        </div>
      ) : orders.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <span className="text-3xl block mb-2">📭</span>
          <h3 className={`text-sm font-bold uppercase font-mono ${isDark ? "text-white" : "text-stone-900"}`}>
            {tab === "pending" ? "Koi Pending Order Nahi Hai" : "Koi Order Record Nahi Mila"}
          </h3>
          <p className="text-xs mt-1 text-stone-400 font-mono">Jaise hi naya order aayega, yahan review ke liye dikhega.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card List */}
          {isMobile && (
            <div className="space-y-3">
              {orders.map(o => <MobileCard key={o._id} order={o} />)}
            </div>
          )}

          {/* Desktop Table */}
          {!isMobile && (
            <div className={`overflow-x-auto rounded-2xl border shadow-xl ${
              isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
            }`}>
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase tracking-wider font-mono ${
                    isDark ? "border-white/[0.08] bg-black/40 text-stone-400" : "border-stone-200 bg-stone-50 text-stone-600"
                  }`}>
                    <th className="p-3.5">ORDER</th>
                    <th className="p-3.5">SELLER</th>
                    <th className="p-3.5">CUSTOMER</th>
                    <th className="p-3.5">TOTAL</th>
                    <th className="p-3.5">STATUS & APPROVAL</th>
                    <th className="p-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${
                  isDark ? "divide-white/[0.04]" : "divide-stone-100"
                }`}>
                  {orders.map(order => {
                    const isPending = order.status === "pending"
                    return (
                      <tr key={order._id} className={`transition-colors ${
                        isDark ? "hover:bg-white/[0.02]" : "hover:bg-stone-50/70"
                      }`}>
                        {/* Order ID & Date */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-mono text-xs font-bold text-amber-500">#{order._id?.slice(-6)}</div>
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5">{fmtDate(order.createdAt)}</div>
                          {order.onBehalfOfId && (
                            <div className="mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 inline-block">
                              🎯 {order.placedByName} → {order.onBehalfOfName}
                            </div>
                          )}
                          <div>
                            <button
                              onClick={() => setInvoice(order)}
                              className={`mt-1.5 px-2 py-1 rounded-md text-[10px] font-bold font-mono flex items-center gap-1 border cursor-pointer ${
                                isDark ? "bg-white/[0.06] hover:bg-white/10 text-stone-300 border-white/10" : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300"
                              }`}
                            >
                              🧾 Invoice
                            </button>
                          </div>
                        </td>

                        {/* Seller */}
                        <td className="p-3.5">
                          {order.sellerId ? (
                            <div>
                              <div className="font-bold font-mono text-emerald-500">{order.sellerId.name}</div>
                              {order.sellerId.fullName && order.sellerId.fullName !== order.sellerId.name && (
                                <div className="text-[11px] text-stone-400 mt-0.5">👤 {order.sellerId.fullName}</div>
                              )}
                              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase mt-1 border border-emerald-500/20 font-mono">
                                Direct Seller
                              </span>
                            </div>
                          ) : <span className="text-stone-400">—</span>}
                        </td>

                        {/* Customer */}
                        <td className="p-3.5">
                          <div className={`font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{order.customerName || "—"}</div>
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5">{order.phone || ""}</div>
                        </td>

                        {/* Total */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-black text-sm text-emerald-500 font-mono">
                            ₹{order.total?.toLocaleString("en-IN")}
                          </div>
                          <ProductsCollapse items={order.items} />
                        </td>

                        {/* Status & Flow */}
                        <td className="p-3.5">
                          <StatusSection order={order} />
                        </td>

                        {/* Action */}
                        <td className="p-3.5 whitespace-nowrap text-right">
                          {isPending ? (
                            <div className="flex flex-col gap-1.5 items-end">
                              <button
                                disabled={busy === order._id}
                                onClick={() => { setModal({ orderId: order._id, action: "approve" }); setNote(""); setNoteVisible(false) }}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer font-mono"
                              >
                                ✅ Approve (Stage 1)
                              </button>
                              <button
                                disabled={busy === order._id}
                                onClick={() => { setModal({ orderId: order._id, action: "reject" }); setNote(""); setNoteVisible(false) }}
                                className="px-3.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-500 border border-red-500/30 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer font-mono"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          ) : order.status === "confirmed" ? (
                            <span className="text-[11px] font-bold text-emerald-500 font-mono">
                              ✅ Completed
                              {order.confirmedAt && (
                                <div className="text-[9.5px] text-stone-400 font-mono mt-0.5">{fmtDate(order.confirmedAt)}</div>
                              )}
                            </span>
                          ) : order.status === "dist_approved" ? (
                            <span className="text-[11px] font-bold text-sky-500 font-mono">
                              ⏳ Awaiting Admin Final
                              {order.distributorApprovedAt && (
                                <div className="text-[9.5px] text-stone-400 font-mono mt-0.5">{fmtDate(order.distributorApprovedAt)}</div>
                              )}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-red-500 font-mono">
                              ❌ Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── ACTION MODAL ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono">
          <div className={`border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 ${
            isDark ? "bg-[#121814] border-white/[0.12] text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{modal.action === "approve" ? "✅" : "❌"}</span>
              <h3 className={`text-base font-black uppercase ${isDark ? "text-white" : "text-stone-900"}`}>
                {modal.action === "approve" ? "Distributor Approval (Stage 1)" : "Order Rejection"}
              </h3>
            </div>

            {modal.action === "approve" && (
              <div className={`p-3 rounded-xl border text-xs ${
                isDark ? "bg-sky-500/10 border-sky-500/20 text-sky-300" : "bg-sky-50 border-sky-200 text-sky-800"
              }`}>
                📌 Aapka approve Stage 1 hoga — PPC aur Sales tab distribute hongi jab Admin Stage 2 final approve karega.
              </div>
            )}

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 opacity-80">
                📝 Note {modal.action === "reject" ? "(Rejection reason)" : "(Optional)"}
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={modal.action === "approve" ? "Add delivery or handling note..." : "Reason for rejection..."}
                rows={3}
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                  isDark ? "bg-black/40 border-white/10 text-white placeholder:text-stone-600 focus:border-emerald-500" : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-emerald-600"
                }`}
              />
            </div>

            {/* Note Visibility Toggle */}
            <div
              onClick={() => setNoteVisible(p => !p)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                noteVisible
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
                  : isDark ? "bg-black/30 border-white/10 text-stone-400" : "bg-stone-50 border-stone-200 text-stone-600"
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-black ${
                noteVisible ? "bg-emerald-600 text-white border-emerald-500" : "border-stone-400"
              }`}>
                {noteVisible ? "✓" : ""}
              </div>
              <div className="text-xs">
                <span className="font-bold">{noteVisible ? "👁 Seller / User ko dikhega" : "🔒 Sirf Admin aur Aapko dikhega"}</span>
                <div className="text-[10px] opacity-75">{noteVisible ? "Public on order statement" : "Private review note"}</div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => { setModal(null); setNote(""); setNoteVisible(false) }}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  isDark ? "bg-white/[0.04] border-white/10 text-stone-300 hover:bg-white/[0.08]" : "bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
                }`}
              >
                Cancel
              </button>
              <button
                disabled={busy === modal.orderId}
                onClick={handleAction}
                className={`flex-2 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  modal.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {busy === modal.orderId ? "Processing..." : modal.action === "approve" ? "✅ Confirm Approve" : "❌ Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoice && (
        <InvoiceModal order={invoice} onClose={() => setInvoice(null)} viewerRole="distributor" />
      )}
    </div>
  )
}
