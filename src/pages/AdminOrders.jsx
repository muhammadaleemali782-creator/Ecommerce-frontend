import { useState, useEffect } from "react"
import InvoiceModal from "../components/InvoiceModal"

const StatusBadge = ({ status }) => {
  const map = {
    confirmed:    { label:"Confirmed",        bg:"#f0fdf4", color:"#15803d", dot:"#22c55e" },
    dist_approved:{ label:"Dist. Approved",   bg:"#eff6ff", color:"#1d4ed8", dot:"#3b82f6" },
    pending:      { label:"Pending",          bg:"#fff7ed", color:"#c2410c", dot:"#f97316" },
    rejected:     { label:"Rejected",         bg:"#fef2f2", color:"#dc2626", dot:"#ef4444" },
  }
  const m = map[status] || { label: status, bg:"#f8fafc", color:"#64748b", dot:"#94a3b8" }
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700,
      padding:"3px 9px", borderRadius:99, background:m.bg, color:m.color, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:m.dot }} />{m.label}
    </span>
  )
}

const NotesCell = ({ order }) => {
  const notes = []
  if (order.distributorNote) notes.push({ icon:"🏢", text:order.distributorNote, visible:order.distributorNoteVisible, from:"Dist" })
  if (order.adminNote)       notes.push({ icon:"👑", text:order.adminNote,       visible:order.adminNoteVisible,       from:"Admin" })
  if (!notes.length) return <span style={{ color:"#cbd5e1", fontSize:11 }}>—</span>
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4, maxWidth:220 }}>
      {notes.map((n,i) => (
        <div key={i} style={{ fontSize:10, padding:"3px 8px", borderRadius:6,
          background:n.visible?"#f0fdf4":"#f8fafc", border:`1px solid ${n.visible?"#bbf7d0":"#e2e8f0"}`, color:n.visible?"#15803d":"#64748b" }}>
          {n.icon} <b>{n.from}:</b> "{n.text}"
          {n.visible && <span style={{ color:"#86efac", marginLeft:4, fontSize:9 }}>👁</span>}
        </div>
      ))}
    </div>
  )
}

export default function AdminOrders() {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState("all")
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
      const url = filter==="all" ? `${import.meta.env.VITE_API_URL}/orders/admin` : `${import.meta.env.VITE_API_URL}/orders/admin?status=${filter}`
      const res  = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch(e) {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleFinalApprove = async () => {
    if (!modal) return
    try {
      setBusy(modal.orderId)
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/admin-approve/${modal.orderId}`, {
        method:"PUT", headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
        body: JSON.stringify({ note, noteVisible })
      })
      const data = await res.json()
      if (res.ok) { setModal(null); setNote(""); setNoteVisible(false); alert("✅ Final approve!"); load() }
      else { alert("❌ " + (data.msg || data.message)) }
    } catch(e) { alert("Error: " + e.message) } finally { setBusy(null) }
  }

  const handleFinalReject = async () => {
    if (!rejectModal) return
    try {
      setBusy(rejectModal.orderId)
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/reject/${rejectModal.orderId}`, {
        method:"PUT", headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
        body: JSON.stringify({ note: rejectNote })
      })
      const data = await res.json()
      if (res.ok) { setRejectModal(null); setRejectNote(""); alert("❌ Order reject ho gaya!"); load() }
      else { alert("❌ " + (data.msg || data.message)) }
    } catch(e) { alert("Error: " + e.message) } finally { setBusy(null) }
  }

  const counts = {
    all: orders.length,
    pending:       orders.filter(o=>o.status==="pending").length,
    dist_approved: orders.filter(o=>o.status==="dist_approved").length,
    confirmed:     orders.filter(o=>o.status==="confirmed").length,
    rejected:      orders.filter(o=>o.status==="rejected").length,
  }

  const fmt     = (n) => Number(n||0).toLocaleString("en-IN")
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—"

  const FILTERS = [
    { key:"all",           label:"All",            color:"#1e293b" },
    { key:"pending",       label:"Pending",        color:"#c2410c" },
    { key:"dist_approved", label:"Dist. Approved", color:"#1d4ed8" },
    { key:"confirmed",     label:"Confirmed",      color:"#15803d" },
    { key:"rejected",      label:"Rejected",       color:"#dc2626" },
  ]

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", padding:"0 4px" }}>

      <div style={{ background:"linear-gradient(135deg,#1e293b,#334155)", borderRadius:14, padding:"18px 22px", marginBottom:18, color:"#fff" }}>
        <h1 style={{ margin:0, fontWeight:800, fontSize:20 }}>📦 Orders — Admin Panel</h1>
        <p style={{ margin:"4px 0 0", fontSize:12, opacity:0.7 }}>
          Stage 1: Distributor → Stage 2: Admin Final | 🧾 Invoice available on every order
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
        {[
          { label:"Pending",       count:counts.pending,       bg:"#fff7ed", color:"#c2410c" },
          { label:"Dist Approved", count:counts.dist_approved, bg:"#eff6ff", color:"#1d4ed8" },
          { label:"Confirmed",     count:counts.confirmed,     bg:"#f0fdf4", color:"#15803d" },
          { label:"Rejected",      count:counts.rejected,      bg:"#fef2f2", color:"#dc2626" },
        ].map(c => (
          <div key={c.label} style={{ background:c.bg, borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, color:c.color }}>{c.count}</div>
            <div style={{ fontSize:11, color:c.color, opacity:0.8 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{ padding:"5px 14px", borderRadius:99, border:`1.5px solid ${filter===f.key?f.color:"#e2e8f0"}`,
              background:filter===f.key?f.color:"#fff", color:filter===f.key?"#fff":f.color,
              fontWeight:700, fontSize:12, cursor:"pointer" }}>
            {f.label} ({counts[f.key]??""})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:"#94a3b8" }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign:"center", padding:40, color:"#94a3b8" }}>Koi order nahi mila</div>
      ) : (
        <div style={{ overflowX:"auto", borderRadius:12, boxShadow:"0 1px 8px rgba(0,0,0,0.07)", border:"1px solid #e2e8f0" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900, background:"#fff" }}>
            <thead>
              <tr style={{ background:"#f8fafc", borderBottom:"2px solid #e2e8f0" }}>
                {["ORDER","USER","SELLER","DISTRIBUTOR","CUSTOMER","TOTAL","NOTES","STATUS","ACTION"].map(c => (
                  <th key={c} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748b", whiteSpace:"nowrap", letterSpacing:"0.04em" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr key={order._id}
                  style={{ borderBottom:"1px solid #f1f5f9", background:i%2===0?"#fff":"#fafafa" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fafafa"}>

                  <td style={{ padding:"11px 14px", whiteSpace:"nowrap" }}>
                    <div style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"#1e293b" }}>#{order._id?.slice(-6)}</div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>{fmtDate(order.createdAt)}</div>
                    {/* 🧾 INVOICE BUTTON */}
                    <button onClick={() => setInvoice(order)}
                      style={{ marginTop:5, padding:"3px 9px", borderRadius:6, border:"1px solid #e2e8f0",
                        background:"#f8fafc", color:"#475569", fontWeight:700, fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
                      🧾 Invoice
                    </button>
                  </td>

                  <td style={{ padding:"11px 14px" }}>
                    {order.userId?.role==="user" ? (
                      <div><div style={{ fontWeight:600, fontSize:12, color:"#1d4ed8" }}>{order.userId.name}</div><div style={{ fontSize:10, color:"#93c5fd" }}>user</div></div>
                    ) : <span style={{ color:"#cbd5e1", fontSize:11 }}>—</span>}
                  </td>

                  <td style={{ padding:"11px 14px" }}>
                    {order.sellerId?.role==="seller" ? (
                      <div>
                        <div style={{ fontWeight:600, fontSize:12, color:"#1e293b" }}>{order.sellerId.name}</div>
                        <div style={{ fontSize:10, color:"#94a3b8" }}>seller</div>
                        {order.onBehalfOfId && (
                          <div style={{ marginTop:3, fontSize:9, background:"#fff7ed", color:"#92400e", border:"1px solid #fde68a", borderRadius:4, padding:"2px 6px", display:"inline-block" }}>
                            {order.placedByName} → {order.onBehalfOfName}
                          </div>
                        )}
                      </div>
                    ) : <span style={{ color:"#cbd5e1", fontSize:11 }}>—</span>}
                  </td>

                  <td style={{ padding:"11px 14px" }}>
                    {order.distributorId ? (
                      <div><div style={{ fontWeight:600, fontSize:12, color:"#7c3aed" }}>{order.distributorId.name}</div><div style={{ fontSize:10, color:"#c4b5fd" }}>distributor</div></div>
                    ) : <span style={{ color:"#cbd5e1", fontSize:11 }}>—</span>}
                  </td>

                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ fontWeight:600, fontSize:12, color:"#1e293b" }}>{order.customerName||"—"}</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>{order.phone||""}</div>
                    {order.onBehalfOfId && (
                      <div style={{ marginTop:3, fontSize:10, background:"#fff7ed", color:"#c2410c", border:"1px solid #fed7aa", borderRadius:4, padding:"1px 6px", display:"inline-block" }}>
                        {order.distributorId?.name||"DB"} → {order.sellerId?.name}
                      </div>
                    )}
                  </td>

                  <td style={{ padding:"11px 14px", whiteSpace:"nowrap" }}>
                    <div style={{ fontWeight:800, fontSize:13, color:"#16a34a" }}>₹{fmt(order.total)}</div>
                    {order.items?.length>0 && <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>{order.items.length} item{order.items.length>1?"s":""}</div>}
                  </td>

                  <td style={{ padding:"11px 14px" }}><NotesCell order={order} /></td>

                  <td style={{ padding:"11px 14px", whiteSpace:"nowrap" }}>
                    <StatusBadge status={order.status} />
                    {order.status==="confirmed" && <div style={{ fontSize:9, color:"#16a34a", marginTop:3, fontWeight:600 }}>✅ Confirmed</div>}
                    {order.approvedByAdmin && order.status==="confirmed" && <div style={{ fontSize:9, color:"#7c3aed", fontWeight:600 }}>👑 Admin approved</div>}
                  </td>

                  <td style={{ padding:"11px 14px", whiteSpace:"nowrap" }}>
                    {order.status==="confirmed"||order.status==="rejected" ? (
                      <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>✅ Done<br/><span style={{ fontSize:9 }}>{fmtDate(order.confirmedAt||order.rejectedAt)}</span></span>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        <button disabled={busy===order._id}
                          onClick={() => { setModal({ orderId:order._id }); setNote(""); setNoteVisible(false) }}
                          style={{ padding:"6px 12px", borderRadius:8, border:"none",
                            background:busy===order._id?"#e2e8f0":"#7c3aed",
                            color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                          👑 Final Approve
                        </button>
                        <button disabled={busy===order._id}
                          onClick={() => { setRejectModal({ orderId:order._id }); setRejectNote("") }}
                          style={{ padding:"6px 12px", borderRadius:8, border:"none",
                            background:busy===order._id?"#e2e8f0":"#dc2626",
                            color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                          ❌ Final Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Final Approve Modal */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:"100%", maxWidth:420, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin:"0 0 16px", fontWeight:800, fontSize:16, color:"#1e293b" }}>👑 Final Approve — Admin</h3>
            <p style={{ fontSize:12, color:"#64748b", marginBottom:14 }}>Yeh action order ko finally confirm karega.</p>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>📝 Admin Note (optional)</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Note likhein..." rows={3}
              style={{ width:"100%", borderRadius:8, border:"1px solid #e2e8f0", padding:"8px 10px", fontSize:12, resize:"vertical", boxSizing:"border-box", marginBottom:10 }} />
            <div onClick={() => setNoteVisible(p=>!p)}
              style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", marginBottom:16, padding:"8px 12px", borderRadius:8,
                background:noteVisible?"#f0fdf4":"#f8fafc", border:`1px solid ${noteVisible?"#bbf7d0":"#e2e8f0"}` }}>
              <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${noteVisible?"#16a34a":"#d1d5db"}`,
                background:noteVisible?"#16a34a":"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {noteVisible && <span style={{ color:"#fff", fontSize:10, fontWeight:900 }}>✓</span>}
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:noteVisible?"#15803d":"#374151" }}>
                {noteVisible ? "👁 Seller/User ko dikhega" : "🔒 Sirf Admin ko dikhega"}
              </span>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { setModal(null); setNote(""); setNoteVisible(false) }}
                style={{ flex:1, padding:"10px 0", borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc", color:"#374151", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleFinalApprove} disabled={busy===modal.orderId}
                style={{ flex:1, padding:"10px 0", borderRadius:8, border:"none",
                  background:busy===modal.orderId?"#e2e8f0":"#7c3aed", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {busy===modal.orderId?"Processing...":"👑 Final Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Reject Modal */}
      {rejectModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:"100%", maxWidth:420, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin:"0 0 16px", fontWeight:800, fontSize:16, color:"#dc2626" }}>❌ Final Reject — Admin</h3>
            <p style={{ fontSize:12, color:"#64748b", marginBottom:14 }}>Yeh action order ko permanently reject karega. Yeh undo nahi ho sakta.</p>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>📝 Reject Reason (optional)</label>
            <textarea value={rejectNote} onChange={e=>setRejectNote(e.target.value)} placeholder="Reason likhein..." rows={3}
              style={{ width:"100%", borderRadius:8, border:"1px solid #e2e8f0", padding:"8px 10px", fontSize:12, resize:"vertical", boxSizing:"border-box", marginBottom:16 }} />
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { setRejectModal(null); setRejectNote("") }}
                style={{ flex:1, padding:"10px 0", borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc", color:"#374151", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleFinalReject} disabled={busy===rejectModal.orderId}
                style={{ flex:1, padding:"10px 0", borderRadius:8, border:"none",
                  background:busy===rejectModal.orderId?"#e2e8f0":"#dc2626", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {busy===rejectModal.orderId?"Processing...":"❌ Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoice && <InvoiceModal order={invoice} onClose={() => setInvoice(null)} viewerRole="admin" />}
    </div>
  )
}
