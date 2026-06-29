import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import InvoiceModal from "../components/InvoiceModal"

const STAGES = [
  { key: "pending",              label: "Order Placed",         icon: "🛒", desc: "Processing"            },
  { key: "distributor_approved", label: "Approved",             icon: "✅", desc: "Admin ke paas"         },
  { key: "confirmed",            label: "Confirmed",            icon: "🎉", desc: "Order confirm!"        },
]

// Seller ke liye detailed stages
const STAGES_SELLER = [
  { key: "pending",              label: "Order Placed",         icon: "🛒", desc: "Distributor ke paas"   },
  { key: "distributor_approved", label: "Distributor Approved", icon: "✅", desc: "Admin ke paas"         },
  { key: "confirmed",            label: "Confirmed",            icon: "🎉", desc: "Order confirm!"        },
]

const STAGE_INDEX = {
  pending:              0,
  distributor_approved: 1,
  confirmed:            2,
  rejected:             -1,
}

function OrderStageBar({ status, isUser }) {
  const stages = isUser ? STAGES : STAGES_SELLER
  // For user — map internal statuses to simplified display
  const displayStatus = isUser
    ? (["pending","distributor_approved"].includes(status) ? "pending" : status)
    : status

  const currentIdx = STAGE_INDEX[displayStatus] ?? 0

  if (displayStatus === "rejected") {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <span className="text-lg">❌</span>
        <span className="font-medium">Order Reject Ho Gaya</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, idx) => (
        <div key={stage.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              idx < currentIdx   ? "bg-green-500 border-green-500 text-white" :
              idx === currentIdx ? "bg-blue-500 border-blue-500 text-white animate-pulse" :
                                   "bg-white border-gray-300 text-gray-400"
            }`}>
              {idx < currentIdx ? "✓" : stage.icon}
            </div>
            <p className={`text-xs mt-1 text-center w-20 ${
              idx === currentIdx ? "text-blue-600 font-medium" :
              idx < currentIdx   ? "text-green-600" : "text-gray-400"
            }`}>
              {stage.label}
            </p>
          </div>
          {idx < STAGES.length - 1 && (
            <div className={`h-0.5 w-8 mx-1 mb-4 ${idx < currentIdx ? "bg-green-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function SellerOrders() {
  const { user } = useAuth()
  const isUser = user?.role === "user"

  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState(null)

  const load = async () => {
    try {
      const token = localStorage.getItem("token")
      const res   = await fetch(`${import.meta.env.VITE_API_URL}/orders/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN")

  // User ke liye simplified counts
  const counts = isUser ? {
    pending:   orders.filter(o => ["pending","distributor_approved"].includes(o.status)).length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    rejected:  orders.filter(o => o.status === "rejected").length,
  } : {
    pending:              orders.filter(o => o.status === "pending").length,
    distributor_approved: orders.filter(o => o.status === "distributor_approved").length,
    confirmed:            orders.filter(o => o.status === "confirmed").length,
    rejected:             orders.filter(o => o.status === "rejected").length,
  }

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading orders...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📦 My Orders</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">⏳ {isUser ? "Pending" : "Dist. Pending"}</p>
          <p className="text-2xl font-bold text-yellow-700">{counts.pending}</p>
        </div>
        {!isUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">🔵 Admin Pending</p>
            <p className="text-2xl font-bold text-blue-700">{counts.distributor_approved}</p>
          </div>
        )}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">✅ Confirmed</p>
          <p className="text-2xl font-bold text-green-700">{counts.confirmed}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">❌ Rejected</p>
          <p className="text-2xl font-bold text-red-700">{counts.rejected}</p>
        </div>
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400">Koi order nahi mila</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-xl shadow p-5 space-y-4">

              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-xs text-gray-400">#{order._id.slice(-6)}</p>
                  <p className="font-bold text-lg">₹{fmt(order.total)}</p>
                  <p className="text-sm text-gray-500">{order.customerName} · {order.phone}</p>
                  {order.onBehalfOfName && (
                    <div style={{ marginTop:5, padding:"4px 10px", background:"#fffbeb", borderRadius:6, border:"1px solid #fcd34d", fontSize:11, color:"#92400e" }}>
                      📋 <strong>{order.placedByName}</strong> ({order.placedByRole}) ne <strong>{order.onBehalfOfName}</strong> ({order.onBehalfOfRole}) ke liye lagaya
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  <div className="mt-1">Distributor: {order.distributorId?.name || "—"}</div>
                  {/* 🧾 Invoice Button */}
                  <button onClick={() => setInvoice(order)}
                    style={{ marginTop:8, padding:"5px 12px", borderRadius:8, border:"1px solid #e2e8f0",
                      background:"#f8fafc", color:"#475569", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                    🧾 Invoice
                  </button>
                </div>
              </div>

              {/* Stage Tracker */}
              <div className="overflow-x-auto pb-1">
                <OrderStageBar
                  status={isUser ? (order.displayStatus || order.status) : order.status}
                  isUser={isUser}
                />
              </div>

              {/* Rejected info — user ke liye simple message */}
              {(isUser ? (order.displayStatus || order.status) : order.status) === "rejected" && (
                <div className="bg-red-50 rounded p-2 text-xs text-red-600">
                  ❌ {isUser ? "Aapka order reject ho gaya" : `Rejected by: ${order.rejectedBy}`}
                </div>
              )}

              {/* ⭐ DISTRIBUTOR NOTE — sirf tab dikhao jab distributorNoteVisible = true */}
              {order.distributorNote && order.distributorNoteVisible && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 flex items-start gap-2">
                  <span>📦</span>
                  <div>
                    <p className="font-medium text-xs text-blue-500 mb-0.5">Distributor ka Note:</p>
                    <p>{order.distributorNote}</p>
                  </div>
                </div>
              )}

              {/* ⭐ ADMIN NOTE — sirf tab dikhao jab adminNoteVisible = true */}
              {order.adminNote && order.adminNoteVisible && (
                <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700 flex items-start gap-2">
                  <span>👑</span>
                  <div>
                    <p className="font-medium text-xs text-purple-500 mb-0.5">Admin ka Note:</p>
                    <p>{order.adminNote}</p>
                  </div>
                </div>
              )}

              {/* Items — role-based PPC display */}
              {order.items?.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Items:</p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => {
                      const qty = item.qty || item.quantity || 1
                      const ppc = item.ppcReward || 0
                      return (
                        <div key={i} style={{ background:"#f8fafc", borderRadius:8, padding:"8px 10px", border:"1px solid #e2e8f0" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            {/* ✅ Product Name — sab ko dikhao */}
                            <span style={{ fontWeight:600, fontSize:13, color:"#1e293b" }}>
                              {item.title || item.name || "Product"} × {qty}
                            </span>
                            <span style={{ fontWeight:700, fontSize:13, color:"#16a34a" }}>
                              ₹{fmt((item.price || 0) * qty)}
                            </span>
                          </div>
                          {/* ✅ PPC — sirf seller ko dikhao, user se hide */}
                          {!isUser && ppc > 0 && (
                            <div style={{ marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                              <span style={{ fontSize:10, background:"#7c3aed", color:"#fff", borderRadius:99, padding:"1px 7px", fontWeight:700 }}>
                                💎 {ppc} PPC
                              </span>
                              <span style={{ fontSize:10, color:"#7c3aed" }}>is item ki sale par</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      {invoice && <InvoiceModal order={invoice} onClose={() => setInvoice(null)} viewerRole={isUser ? "user" : "seller"} />}
    </div>
  )
}
