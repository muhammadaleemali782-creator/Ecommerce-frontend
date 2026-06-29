import { useState, useEffect } from "react"
import InvoiceModal from "../components/InvoiceModal"

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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check); return () => window.removeEventListener("resize", check)
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const url = tab === "pending"
        ? `${import.meta.env.VITE_API_URL}/orders/pending`
        : `${import.meta.env.VITE_API_URL}/orders/distributor`
      const res  = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch(e) {} finally { setLoading(false) }
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
        headers: { Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
        body: JSON.stringify({ note, noteVisible })
      })
      const data = await res.json()
      if (res.ok) {
        setModal(null); setNote(""); setNoteVisible(false)
        alert(isApprove
          ? "✅ Approve ho gaya! Ab Admin final approve karega — tabhi PPC aur Sales update hongi."
          : "Order reject ho gaya.")
        load()
      } else { alert("❌ " + (data.msg || data.message)) }
    } catch(e) { alert("Error: " + e.message) } finally { setBusy(null) }
  }

  /* ── Status Section ── */
  const StatusSection = ({ order }) => {
    const s = order.status
    return (
      <div>
        {s === "pending" && (
          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:"#fff7ed", color:"#c2410c", border:"1px solid #fed7aa" }}>
            ⏳ Pending — Aapka approval chahiye
          </span>
        )}
        {s === "dist_approved" && (
          <div>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:"#eff6ff", color:"#1d4ed8", border:"1px solid #93c5fd" }}>
              🔵 Aapne Approve Kiya
            </span>
            <div style={{ marginTop:4, fontSize:10, color:"#1d4ed8" }}>⏳ Admin ka final approval baaki</div>
            <div style={{ marginTop:2, fontSize:10, color:"#64748b" }}>⚠️ PPC aur Sales tab milegi jab Admin approve kare</div>
          </div>
        )}
        {s === "confirmed" && (
          <div>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:"#f0fdf4", color:"#15803d", border:"1px solid #86efac" }}>
              ✅ Final Confirmed
            </span>
            {order.approvedByAdmin && (
              <div style={{ marginTop:4, fontSize:10, color:"#7c3aed", fontWeight:600 }}>
                👑 Admin ne apni taraf se approve kiya
              </div>
            )}
            <div style={{ marginTop:2, fontSize:10, color:"#15803d" }}>✅ PPC + Sales distribute ho gayi</div>
          </div>
        )}
        {s === "rejected" && (
          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:"#fef2f2", color:"#dc2626", border:"1px solid #fca5a5" }}>
            ❌ Rejected
          </span>
        )}

        {/* Distributor ka note */}
        {order.distributorNote && (
          <div style={{ marginTop:5, fontSize:10, padding:"3px 8px", borderRadius:5, fontStyle:"italic",
            background: order.distributorNoteVisible ? "#f0fdf4" : "#f8fafc",
            color: order.distributorNoteVisible ? "#15803d" : "#64748b",
            border:`1px solid ${order.distributorNoteVisible ? "#bbf7d0" : "#e2e8f0"}` }}>
            📝 Aapka note: "{order.distributorNote}"
            <span style={{ marginLeft:4, fontSize:9, fontWeight:700 }}>
              {order.distributorNoteVisible ? "— Seller ko dikh raha hai 👁" : "— Private 🔒"}
            </span>
          </div>
        )}

        {/* Admin note (agar visible ho) */}
        {order.adminNote && order.adminNoteVisible && (
          <div style={{ marginTop:4, fontSize:10, padding:"3px 8px", borderRadius:5, fontStyle:"italic",
            background:"#faf5ff", color:"#7c3aed", border:"1px solid #e9d5ff" }}>
            👑 Admin note: "{order.adminNote}"
          </div>
        )}
      </div>
    )
  }

  /* ── Collapsible Products ── */
  const ProductsCollapse = ({ items }) => {
    const [open, setOpen] = useState(false)
    if (!items?.length) return <span style={{ fontSize:11, color:"#cbd5e1" }}>—</span>
    return (
      <div>
        <button onClick={() => setOpen(p => !p)}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:8,
            border:"1px solid #e2e8f0", background: open ? "#f1f5f9" : "#f8fafc",
            cursor:"pointer", fontSize:11, fontWeight:600, color:"#475569" }}>
          📦 {items.length} item{items.length > 1 ? "s" : ""}
          <span style={{ fontSize:9 }}>{open ? "▲" : "▼"}</span>
        </button>
        {open && (
          <div style={{ marginTop:6, background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0", overflow:"hidden" }}>
            {items.map((item, i) => (
              <div key={i} style={{ padding:"7px 10px", borderBottom: i < items.length-1 ? "1px solid #e2e8f0" : "none" }}>
                <div style={{ fontWeight:600, fontSize:12, color:"#1e293b" }}>{item.title || item.name || "Product"}</div>
              {/* ✅ PPC Badge — Distributor ko dikhao */}
              {(item.ppcReward || 0) > 0 && (
                <div style={{ marginTop:2 }}>
                  <span style={{ fontSize:10, background:"#7c3aed", color:"#fff", borderRadius:99, padding:"1px 7px", fontWeight:700 }}>
                    💎 {item.ppcReward} PPC
                  </span>
                </div>
              )}
                {item.description && <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>{item.description}</div>}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                  <span style={{ fontSize:10, color:"#94a3b8" }}>Qty: {item.qty || item.quantity || 1}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:"#16a34a" }}>
                    ₹{item.price} × {item.qty || item.quantity || 1} = ₹{(item.price*(item.qty||item.quantity||1)).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            <div style={{ padding:"6px 10px", background:"#f0fdf4", borderTop:"1px solid #e2e8f0",
              display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, fontWeight:700 }}>Total</span>
              <span style={{ fontSize:12, fontWeight:800, color:"#16a34a" }}>
                ₹{items.reduce((s,i) => s + (i.price*(i.qty||i.quantity||1)), 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  const MobileCard = ({ order }) => {
    const isPending = order.status === "pending"
    return (
      <div style={{ background:"#fff", borderRadius:14, padding:14, marginBottom:10,
        boxShadow:"0 1px 8px rgba(0,0,0,0.07)", border:"1px solid #e2e8f0" }}>

        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontFamily:"monospace", fontSize:11, color:"#94a3b8" }}>#{order._id?.slice(-6)}</span>
          <span style={{ fontSize:10, color:"#94a3b8" }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
        </div>

        <div style={{ marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <StatusSection order={order}/>
          <button onClick={() => setInvoice(order)}
            style={{ padding:"5px 11px", borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc",
              color:"#475569", fontWeight:700, fontSize:11, cursor:"pointer", flexShrink:0, marginLeft:8 }}>
            🧾 Invoice
          </button>
        </div>

        {order.onBehalfOfId && (
          <div style={{ background:"#fff7ed", borderRadius:8, padding:"5px 10px", marginBottom:8, border:"1px solid #fed7aa", fontSize:11 }}>
            🎯 <b>{order.placedByName}</b> → <b>{order.onBehalfOfName}</b>
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, fontSize:12, marginBottom:8 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:9, background:"#f0fdf4", color:"#15803d", borderRadius:3, padding:"1px 5px", fontWeight:700 }}>Seller</span>
              <b>{order.sellerId?.role === "user" ? (order.sellerId?.name ? order.sellerId.name + "'s Seller" : "—") : (order.sellerId?.name || "—")}</b>
            </div>
            {order.userId && (
              <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:3 }}>
                <span style={{ fontSize:9, background:"#eff6ff", color:"#1d4ed8", borderRadius:3, padding:"1px 5px", fontWeight:700 }}>User</span>
                <span style={{ fontSize:11, color:"#1d4ed8", fontWeight:600 }}>{order.userId?.name || "—"}</span>
              </div>
            )}
          </div>
          <div><span style={{ color:"#94a3b8" }}>Customer: </span><b>{order.customerName || "—"}</b></div>
          <div><span style={{ color:"#94a3b8" }}>Amount: </span><b style={{ color:"#16a34a" }}>₹{order.total?.toLocaleString()}</b></div>
          <div><span style={{ color:"#94a3b8" }}>Phone: </span>{order.phone || "—"}</div>
        </div>

        <div style={{ marginBottom:10 }}><ProductsCollapse items={order.items}/></div>

        {isPending && (
          <div style={{ display:"flex", gap:8 }}>
            <button
              onClick={() => { setModal({ orderId:order._id, action:"approve" }); setNote(""); setNoteVisible(false) }}
              style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background:"#16a34a", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              ✅ Approve (Stage 1)
            </button>
            <button
              onClick={() => { setModal({ orderId:order._id, action:"reject" }); setNote(""); setNoteVisible(false) }}
              style={{ flex:1, padding:"10px", borderRadius:10, border:"1px solid #fca5a5", background:"#fef2f2", color:"#dc2626", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              ❌ Reject
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", padding: isMobile ? "12px" : "0" }}>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#065f46,#047857)", borderRadius:14, padding:"20px", marginBottom:12, color:"#fff" }}>
        <h1 style={{ margin:0, fontSize: isMobile ? 18 : 22, fontWeight:800 }}>📦 Orders Dashboard</h1>
        <p style={{ margin:"4px 0 0", fontSize:12, opacity:0.8 }}>
          Aapka approval Stage 1 hai — Admin Stage 2 pe PPC + Sales trigger karega
        </p>
      </div>

      {/* Info banner */}
      <div style={{ background:"#eff6ff", borderRadius:10, padding:"10px 14px", marginBottom:14, border:"1px solid #bfdbfe", fontSize:12, color:"#1d4ed8" }}>
        💡 <b>2-Stage Process:</b> Aap approve karo (Stage 1) → Admin final approve kare (Stage 2) → Tab PPC + Sales milegi
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:14, background:"#f1f5f9", borderRadius:10, padding:4 }}>
        {[{ key:"pending", label:"⏳ Pending Approval" }, { key:"all", label:"📋 Sab Orders" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex:1, padding:"9px 8px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
              background: tab===t.key ? "#fff" : "transparent", color: tab===t.key ? "#1e293b" : "#64748b",
              boxShadow: tab===t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign:"center", padding:40 }}><div style={{ fontSize:32 }}>⏳</div></div>}
      {!loading && orders.length === 0 && (
        <div style={{ textAlign:"center", padding:40, color:"#94a3b8", background:"#fff", borderRadius:12, border:"1px dashed #e2e8f0" }}>
          <div style={{ fontSize:40 }}>📭</div><p>{tab === "pending" ? "Koi pending order nahi" : "Koi order nahi"}</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <>
          {isMobile && <div>{orders.map(o => <MobileCard key={o._id} order={o}/>)}</div>}

          {!isMobile && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", overflow:"auto", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#f8fafc", borderBottom:"2px solid #e2e8f0" }}>
                    {["ORDER","USER","SELLER","DISTRIBUTOR","CUSTOMER","TOTAL","NOTES","STATUS","ACTION"].map(h => (
                      <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748b", whiteSpace:"nowrap", letterSpacing:"0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => {
                    const isPending = order.status === "pending"
                    /* ── Combine all notes ── */
                    const notes = [
                      order.distributorNote && { role:"Dist", text:order.distributorNote, visible:order.distributorNoteVisible, color:"#f59e0b" },
                      order.adminNote        && { role:"Admin", text:order.adminNote,        visible:order.adminNoteVisible,        color:"#7c3aed" },
                    ].filter(Boolean)

                    /* ── Status badge ── */
                    const statusBadge =
                      order.status === "pending"       ? { label:"Pending",   bg:"#fff7ed", color:"#c2410c", border:"#fed7aa" }
                    : order.status === "dist_approved" ? { label:"Dist. Approved", bg:"#eff6ff", color:"#1d4ed8", border:"#93c5fd" }
                    : order.status === "confirmed"     ? { label:"Confirmed",  bg:"#f0fdf4", color:"#15803d", border:"#86efac" }
                    : order.status === "rejected"      ? { label:"Rejected",   bg:"#fef2f2", color:"#dc2626", border:"#fca5a5" }
                    : { label: order.status, bg:"#f8fafc", color:"#64748b", border:"#e2e8f0" }

                    return (
                      <tr key={order._id} style={{ borderBottom:"1px solid #f1f5f9", background: i%2===0?"#fff":"#fafbfc" }}>

                        {/* ORDER ID + Date */}
                        <td style={{ padding:"12px 14px", whiteSpace:"nowrap" }}>
                          <div style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"#3b82f6" }}>
                            #{order._id?.slice(-6)}
                          </div>
                          <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"numeric", year:"numeric" })}
                          </div>
                          {/* Behalf tag */}
                          {order.onBehalfOfId && (
                            <div style={{ marginTop:4, fontSize:9, background:"#fff7ed", color:"#c2410c", border:"1px solid #fed7aa", borderRadius:4, padding:"1px 5px", display:"inline-block", fontWeight:600 }}>
                              🎯 on behalf
                            </div>
                          )}
                        </td>

                        {/* USER */}
                        <td style={{ padding:"12px 14px" }}>
                          {order.userId && order.userId.role === "user" ? (
                            <div>
                              <div style={{ fontWeight:700, fontSize:12, color:"#1d4ed8" }}>
                                {order.userId?.name || "—"}
                              </div>
                              <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>user</div>
                            </div>
                          ) : (
                            <span style={{ color:"#cbd5e1", fontSize:11 }}>—</span>
                          )}
                        </td>

                        {/* SELLER */}
                        <td style={{ padding:"12px 14px" }}>
                          {order.sellerId && order.sellerId.role === "seller" ? (
                            <div>
                              <div style={{ fontWeight:700, fontSize:12, color:"#15803d" }}>
                                {order.sellerId?.name || "—"}
                              </div>
                              <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>seller</div>
                              {/* Behalf chain — sirf yahan dikhao */}
                              {order.onBehalfOfId && (
                                <div style={{ marginTop:4, fontSize:9, background:"#fff7ed", color:"#92400e", border:"1px solid #fde68a", borderRadius:4, padding:"2px 6px", display:"inline-block" }}>
                                  {order.placedByName} → {order.onBehalfOfName}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color:"#cbd5e1", fontSize:11 }}>—</span>
                          )}
                        </td>

                        {/* DISTRIBUTOR */}
                        <td style={{ padding:"12px 14px" }}>
                          {order.distributorId ? (
                            <div>
                              <div style={{ fontWeight:700, fontSize:12, color:"#7c3aed" }}>
                                {order.distributorId?.name || "—"}
                              </div>
                              <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>
                                {order.distributorId?.systemId || "distributor"}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color:"#cbd5e1", fontSize:11 }}>—</span>
                          )}
                        </td>

                        {/* CUSTOMER */}
                        <td style={{ padding:"12px 14px" }}>
                          <div style={{ fontWeight:600, fontSize:12 }}>{order.customerName || "—"}</div>
                          <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{order.phone || ""}</div>
                          {order.address && (
                            <div style={{ fontSize:9, color:"#cbd5e1", marginTop:1, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {order.address}
                            </div>
                          )}
                        </td>

                        {/* TOTAL */}
                        <td style={{ padding:"12px 14px", whiteSpace:"nowrap" }}>
                          <div style={{ fontWeight:800, color:"#16a34a", fontSize:14 }}>
                            ₹{order.total?.toLocaleString()}
                          </div>
                          <div style={{ marginTop:4 }}>
                            <ProductsCollapse items={order.items} />
                          </div>
                        </td>

                        {/* NOTES */}
                        <td style={{ padding:"12px 14px", minWidth:160 }}>
                          {notes.length === 0 ? (
                            <span style={{ color:"#e2e8f0", fontSize:11 }}>—</span>
                          ) : (
                            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                              {notes.map((n, ni) => (
                                <div key={ni} style={{ fontSize:10, padding:"3px 7px", borderRadius:5, background: n.color+"15", border:`1px solid ${n.color}40`, color:"#374151" }}>
                                  <span style={{ fontWeight:700, color: n.color }}>🗒 {n.role}:</span> {n.text}
                                  {!n.visible && <span style={{ marginLeft:4, fontSize:8, color:"#94a3b8" }}>🔒</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* STATUS */}
                        <td style={{ padding:"12px 14px", whiteSpace:"nowrap" }}>
                          <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:99, background:statusBadge.bg, color:statusBadge.color, border:`1px solid ${statusBadge.border}` }}>
                            {order.status === "confirmed" ? "✅" : order.status === "rejected" ? "❌" : order.status === "dist_approved" ? "🔵" : "⏳"} {statusBadge.label}
                          </span>
                          {order.status === "confirmed" && (
                            <div style={{ fontSize:9, color:"#15803d", marginTop:3 }}>✅ PPC + Sales distribute ho gayi</div>
                          )}
                          {order.status === "dist_approved" && (
                            <div style={{ fontSize:9, color:"#1d4ed8", marginTop:3 }}>⏳ Admin approval baaki</div>
                          )}
                        </td>

                        {/* ACTION */}
                        <td style={{ padding:"12px 14px" }}>
                          {/* 🧾 Invoice always visible */}
                          <div style={{ marginBottom:6 }}>
                            <button onClick={() => setInvoice(order)}
                              style={{ padding:"4px 10px", borderRadius:7, border:"1px solid #e2e8f0",
                                background:"#f8fafc", color:"#475569", fontWeight:700, fontSize:10, cursor:"pointer" }}>
                              🧾 Invoice
                            </button>
                          </div>
                          {isPending ? (
                            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                              <button
                                disabled={busy === order._id}
                                onClick={() => { setModal({ orderId:order._id, action:"approve" }); setNote(""); setNoteVisible(false) }}
                                style={{ padding:"7px 14px", borderRadius:8, border:"none", background:"#16a34a", color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                                ✅ Approve
                              </button>
                              <button
                                disabled={busy === order._id}
                                onClick={() => { setModal({ orderId:order._id, action:"reject" }); setNote(""); setNoteVisible(false) }}
                                style={{ padding:"7px 14px", borderRadius:8, border:"1px solid #fca5a5", background:"#fef2f2", color:"#dc2626", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                                ❌ Reject
                              </button>
                            </div>
                          ) : order.status === "confirmed" ? (
                            <span style={{ fontSize:11, color:"#15803d", fontWeight:700 }}>✅ Done<br/><span style={{ fontSize:9, color:"#94a3b8" }}>{new Date(order.updatedAt).toLocaleDateString("en-IN")}</span></span>
                          ) : order.status === "dist_approved" ? (
                            <span style={{ fontSize:11, color:"#1d4ed8", fontWeight:600 }}>⏳ Waiting<br/><span style={{ fontSize:9, color:"#94a3b8" }}>Admin se</span></span>
                          ) : order.status === "rejected" ? (
                            <span style={{ fontSize:11, color:"#dc2626", fontWeight:700 }}>❌ Rejected</span>
                          ) : null}
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
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:"100%", maxWidth:440, boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin:"0 0 4px", fontSize:17, fontWeight:800 }}>
              {modal.action === "approve" ? "✅ Order Approve (Stage 1)" : "❌ Order Reject"}
            </h3>

            {modal.action === "approve" && (
              <div style={{ background:"#eff6ff", borderRadius:8, padding:"8px 12px", marginBottom:12, fontSize:12, color:"#1d4ed8", border:"1px solid #bfdbfe" }}>
                📌 Aapka approve Stage 1 hoga — PPC aur Sales tab milegi jab Admin final approve kare
              </div>
            )}

            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>
              📝 Note {modal.action === "reject" ? "(rejection reason)" : "(optional)"}
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={modal.action === "approve" ? "Approval note... (optional)" : "Rejection reason likhein..."}
              rows={3}
              style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #e2e8f0",
                fontSize:13, outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"system-ui", marginBottom:12 }}
            />

            {/* ⭐ NOTE VISIBILITY TOGGLE */}
            <div onClick={() => setNoteVisible(p => !p)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10,
                border:`1.5px solid ${noteVisible ? "#86efac" : "#e2e8f0"}`,
                background: noteVisible ? "#f0fdf4" : "#f8fafc", cursor:"pointer", marginBottom:14 }}>
              <div style={{ width:40, height:22, borderRadius:11, background: noteVisible ? "#16a34a" : "#e2e8f0",
                position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                <div style={{ position:"absolute", top:3, left: noteVisible ? 21 : 3, width:16, height:16,
                  borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color: noteVisible ? "#15803d" : "#374151" }}>
                  {noteVisible ? "👁 Seller / User ko dikhega" : "🔒 Sirf Admin aur Aapko dikhega"}
                </div>
                <div style={{ fontSize:10, color:"#64748b" }}>
                  {noteVisible ? "Note seller ke orders page pe visible hoga" : "Note private rahega"}
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { setModal(null); setNote(""); setNoteVisible(false) }}
                style={{ flex:1, padding:"11px", borderRadius:10, border:"1.5px solid #e2e8f0",
                  background:"#f8fafc", color:"#64748b", fontWeight:600, cursor:"pointer" }}>
                Cancel
              </button>
              <button
                disabled={busy === modal.orderId}
                onClick={handleAction}
                style={{ flex:2, padding:"11px", borderRadius:10, border:"none",
                  background: modal.action === "approve" ? "#16a34a" : "#dc2626",
                  color:"#fff", fontWeight:700, cursor:"pointer" }}>
                {busy === modal.orderId ? "⏳..." : modal.action === "approve" ? "✅ Confirm Approve" : "❌ Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoice && <InvoiceModal order={invoice} onClose={() => setInvoice(null)} viewerRole="distributor" />}
    </div>
  )
}
