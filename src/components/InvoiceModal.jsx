import { useState, useEffect, useRef } from "react"
import { FESTIVAL_GROUPS, getThemeById } from "../data/festiveThemes.js"

const STATUS_META = {
  pending:       { type:"PROFORMA INVOICE",        badge:"PENDING",   badgeBg:"#fff7ed", badgeColor:"#c2410c", watermark:"PROFORMA"    },
  dist_approved: { type:"ACKNOWLEDGEMENT INVOICE",  badge:"STAGE 1",  badgeBg:"#eff6ff", badgeColor:"#1d4ed8", watermark:"ACKNOWLEDGED" },
  confirmed:     { type:"TAX INVOICE",              badge:"CONFIRMED", badgeBg:"#f0fdf4", badgeColor:"#15803d", watermark:"CONFIRMED"    },
  rejected:      { type:"CANCELLATION NOTICE",      badge:"CANCELLED", badgeBg:"#fef2f2", badgeColor:"#dc2626", watermark:"CANCELLED"   },
}

const fmt     = (n) => Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"
const fmtDT   = (d) => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"
const getInvNo = (id,status) => {
  const s={pending:"PRO",dist_approved:"ACK",confirmed:"INV",rejected:"CAN"}[status]||"ORD"
  return `${s}-${(id||"").slice(-8).toUpperCase()}`
}

/* ══════════════════════════════════════
   NORMAL A4 INVOICE
══════════════════════════════════════ */
function NormalInvoice({ order, settings, theme, invNo, meta }) {
  const items    = order.items||[]
  const subtotal = items.reduce((s,i)=>s+(i.price||0)*(i.qty||i.quantity||1),0)
  const total    = order.total||subtotal
  const tc       = theme||null
  const headerBg = tc ? tc.gradient : (settings?.themeColor||"#1e293b")
  const paperBg  = tc?.paperBg||"#fff"
  const accent   = tc?.accent||(settings?.themeColor||"#1e293b")
  const border   = tc?.border||"#e2e8f0"

  const showBehalf = settings?.showBehalfInfo !== false
  const orderedFor = showBehalf && order.onBehalfOfId
    ? { name:order.onBehalfOfName, role:order.onBehalfOfRole } : null
  const placedBy = showBehalf && order.onBehalfOfId
    ? { name:order.placedByName, role:order.placedByRole } : null

  const customTop    = (settings?.customFields||[]).filter(f=>f.position==="top"||!f.position)
  const customBottom = (settings?.customFields||[]).filter(f=>f.position==="bottom")

  return (
    <div style={{background:paperBg,borderRadius:16,overflow:"hidden",
      boxShadow:"0 4px 24px rgba(0,0,0,0.12)",position:"relative",fontFamily:"'Segoe UI',Arial,sans-serif"}}>

      {/* Watermark */}
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-30deg)",
        fontSize:80,fontWeight:900,opacity:0.04,color:accent,pointerEvents:"none",
        letterSpacing:8,whiteSpace:"nowrap",userSelect:"none",zIndex:0}}>
        {meta.watermark}
      </div>

      {/* Festive top banner */}
      {tc?.topBanner && (
        <div style={{background:accent,padding:"7px 0",textAlign:"center",fontSize:18,letterSpacing:6,color:"#fff"}}>
          {tc.topBanner}
        </div>
      )}

      {/* HEADER */}
      <div style={{background:headerBg,padding:"28px 32px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-50,right:-50,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
        <div style={{position:"absolute",bottom:-70,right:30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
        <div style={{position:"absolute",top:-20,left:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1}}>
          <div>
            {settings?.showLogo&&settings?.logo ? (
              <img src={settings.logo} alt="logo" style={{height:54,marginBottom:10,borderRadius:10,background:"rgba(255,255,255,0.9)",padding:4}}/>
            ) : (
              <div style={{width:54,height:54,borderRadius:14,background:"rgba(255,255,255,0.18)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:10,border:"2px solid rgba(255,255,255,0.3)"}}>
                🏢
              </div>
            )}
            <div style={{color:"#fff",fontWeight:900,fontSize:22,letterSpacing:-0.5}}>
              {settings?.companyName||"Your Company"}
            </div>
            {settings?.tagline&&<div style={{color:"rgba(255,255,255,0.75)",fontSize:12,marginTop:3}}>{settings.tagline}</div>}
            {settings?.address&&<div style={{color:"rgba(255,255,255,0.6)",fontSize:11,marginTop:6,maxWidth:280,lineHeight:1.5}}>{settings.address}</div>}
            <div style={{marginTop:6,display:"flex",gap:14,flexWrap:"wrap"}}>
              {settings?.phone&&<span style={{color:"rgba(255,255,255,0.75)",fontSize:11}}>📞 {settings.phone}</span>}
              {settings?.email&&<span style={{color:"rgba(255,255,255,0.75)",fontSize:11}}>✉️ {settings.email}</span>}
            </div>
            {settings?.gst&&<div style={{marginTop:4,color:"rgba(255,255,255,0.6)",fontSize:11,fontFamily:"monospace"}}>GST: {settings.gst}</div>}
          </div>

          <div style={{textAlign:"right"}}>
            <div style={{background:meta.badgeBg,color:meta.badgeColor,fontWeight:900,fontSize:11,
              padding:"4px 16px",borderRadius:99,display:"inline-block",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
              ● {meta.badge}
            </div>
            <div style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:4}}>{meta.type}</div>
            <div style={{color:"rgba(255,255,255,0.85)",fontWeight:700,fontSize:14,fontFamily:"monospace"}}>#{invNo}</div>
            <div style={{marginTop:10,color:"rgba(255,255,255,0.65)",fontSize:11}}>
              <div>Date: {fmtDate(order.createdAt)}</div>
              {order.status==="confirmed"&&order.confirmedAt&&<div>Confirmed: {fmtDate(order.confirmedAt)}</div>}
              {order.status==="dist_approved"&&order.distributorApprovedAt&&<div>Approved: {fmtDate(order.distributorApprovedAt)}</div>}
              {order.status==="rejected"&&order.rejectedAt&&<div>Rejected: {fmtDate(order.rejectedAt)}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* STAGE TRACKER */}
      <div style={{background:tc?`${paperBg}cc`:"#f8fafc",borderBottom:`1px solid ${border}`,padding:"16px 32px"}}>
        <div style={{display:"flex",alignItems:"center"}}>
          {[
            {key:"pending",label:"Order Placed",icon:"🛒"},
            {key:"dist_approved",label:"Dist. Approved",icon:"✅"},
            {key:"confirmed",label:"Confirmed",icon:"🎉"},
          ].map((stage,idx,arr)=>{
            const order2=["pending","dist_approved","confirmed"]
            const curIdx=order.status==="rejected"?-1:order2.indexOf(order.status)
            const isDone=order2.indexOf(stage.key)<curIdx
            const isCur=stage.key===order.status
            return (
              <div key={stage.key} style={{display:"flex",alignItems:"center",flex:1}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:80}}>
                  <div style={{width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:14,fontWeight:800,border:"2px solid",
                    background:order.status==="rejected"?"#fef2f2":isDone?accent:isCur?accent:"#fff",
                    borderColor:order.status==="rejected"?"#fca5a5":isDone?accent:isCur?accent:border,
                    color:order.status==="rejected"?"#dc2626":(isDone||isCur)?"#fff":"#94a3b8",
                    boxShadow:isCur?`0 0 0 4px ${accent}25`:"none"}}>
                    {order.status==="rejected"?"✕":isDone?"✓":stage.icon}
                  </div>
                  <div style={{fontSize:10,marginTop:4,fontWeight:isCur?800:500,textAlign:"center",
                    color:isCur?accent:isDone?accent:"#94a3b8"}}>
                    {stage.label}
                  </div>
                </div>
                {idx<arr.length-1&&(
                  <div style={{flex:1,height:2.5,background:isDone?accent:border,margin:"0 4px",marginBottom:18,borderRadius:2}}/>
                )}
              </div>
            )
          })}
          {order.status==="rejected"&&(
            <div style={{marginLeft:12,background:"#fef2f2",borderRadius:8,padding:"4px 14px",
              fontSize:11,fontWeight:700,color:"#dc2626",border:"1.5px solid #fca5a5"}}>❌ CANCELLED</div>
          )}
        </div>
      </div>

      {/* CUSTOM FIELDS — TOP */}
      {customTop.length>0&&(
        <div style={{padding:"14px 32px 0",display:"flex",gap:8,flexWrap:"wrap"}}>
          {customTop.map((f,i)=>(
            <div key={i} style={{background:tc?`${accent}12`:"#f0f9ff",borderRadius:8,padding:"8px 14px",
              border:`1px solid ${tc?.accent||"#bae6fd"}40`,flex:"1 1 180px",minWidth:150}}>
              <div style={{fontSize:9,fontWeight:800,color:tc?.accent||"#0ea5e9",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>{f.label}</div>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{f.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* PARTIES */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:`1px solid ${border}`}}>

        {/* BILL TO */}
        <div style={{padding:"20px 24px",borderRight:`1px solid ${border}`}}>
          <div style={{fontSize:9,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:10,textTransform:"uppercase"}}>Bill To</div>
          <div style={{fontWeight:800,fontSize:15,color:"#1e293b"}}>{order.customerName||"—"}</div>
          {order.phone&&<div style={{fontSize:12,color:"#64748b",marginTop:5}}>📞 {order.phone}</div>}
          {order.address&&<div style={{fontSize:11,color:"#64748b",marginTop:4,lineHeight:1.5}}>📍 {order.address}</div>}

          {/* BEHALF INFO — toggleable by admin */}
          {orderedFor&&(
            <div style={{marginTop:10,borderTop:`1px dashed ${border}`,paddingTop:10}}>
              <div style={{background:tc?`${accent}15`:"#eff6ff",borderRadius:8,padding:"8px 10px",
                marginBottom:6,border:`1px solid ${tc?.accent||"#bfdbfe"}50`}}>
                <div style={{fontSize:9,fontWeight:800,color:accent,letterSpacing:"0.06em",marginBottom:3,textTransform:"uppercase"}}>
                  📦 Ordered For
                </div>
                <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{orderedFor.name}</div>
                <div style={{fontSize:10,color:"#64748b",textTransform:"capitalize"}}>{orderedFor.role}</div>
              </div>
              <div style={{background:tc?`${accent}10`:"#f0fdf4",borderRadius:8,padding:"8px 10px",
                border:`1px solid ${tc?.accent||"#86efac"}50`}}>
                <div style={{fontSize:9,fontWeight:800,color:accent,letterSpacing:"0.06em",marginBottom:3,textTransform:"uppercase"}}>
                  ✍️ Placed By
                </div>
                <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{placedBy.name}</div>
                <div style={{fontSize:10,color:"#64748b",textTransform:"capitalize"}}>{placedBy.role}</div>
              </div>
            </div>
          )}
        </div>

        {/* SELLER */}
        <div style={{padding:"20px 24px",borderRight:`1px solid ${border}`}}>
          <div style={{fontSize:9,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>Seller</div>
          <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{order.sellerId?.name||"—"}</div>
          <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{order.sellerId?.email||""}</div>
          {order.userId&&(
            <div style={{marginTop:6,fontSize:11,background:"#eff6ff",borderRadius:6,padding:"4px 8px",color:"#1d4ed8",display:"inline-block"}}>
              via: {order.userId?.name}
            </div>
          )}
        </div>

        {/* ORDER DETAILS */}
        <div style={{padding:"20px 24px"}}>
          <div style={{fontSize:9,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>Order Details</div>
          {[
            ["Invoice No.",invNo],
            ["Order ID","#"+(order._id?.slice(-8)||"—")],
            ["Date",fmtDate(order.createdAt)],
            order.distributorId&&["Distributor",order.distributorId?.name],
          ].filter(Boolean).map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5}}>
              <span style={{color:"#94a3b8"}}>{k}</span>
              <span style={{fontWeight:700,color:"#1e293b",fontFamily:k.includes("No.")||k==="Order ID"?"monospace":"inherit",fontSize:k.includes("No.")?"10px":"11px"}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div style={{padding:"0 32px 24px"}}>
        <table style={{width:"100%",borderCollapse:"collapse",marginTop:24}}>
          <thead>
            <tr style={{background:headerBg}}>
              {["#","Item Description","Qty","Unit Price","Amount"].map((h,i)=>(
                <th key={h} style={{padding:"11px 14px",color:"#fff",fontWeight:700,fontSize:11,
                  textAlign:i===0?"center":i>=2?"right":"left",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length===0?(
              <tr><td colSpan={5} style={{textAlign:"center",padding:28,color:"#94a3b8",fontSize:12}}>No items found</td></tr>
            ):items.map((item,i)=>{
              const qty=item.qty||item.quantity||1
              const price=item.price||0
              const amt=price*qty
              const name=item.title||item.name||item.productName||"Product"
              return (
                <tr key={i} style={{background:i%2===0?"#fff":tc?`${paperBg}cc`:"#f8fafc",borderBottom:`1px solid ${border}`}}>
                  <td style={{padding:"12px 14px",textAlign:"center",fontSize:12,color:"#94a3b8",fontWeight:600}}>{i+1}</td>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{name}</div>
                    {item.description&&<div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{item.description}</div>}
                  </td>
                  <td style={{padding:"12px 14px",textAlign:"right",fontWeight:600,fontSize:13,color:"#475569"}}>{qty}</td>
                  <td style={{padding:"12px 14px",textAlign:"right",fontWeight:600,fontSize:13,color:"#475569"}}>₹{fmt(price)}</td>
                  <td style={{padding:"12px 14px",textAlign:"right",fontWeight:800,fontSize:14,color:"#1e293b"}}>₹{fmt(amt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Total */}
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <div style={{minWidth:280}}>
            {subtotal!==total&&(
              <div style={{display:"flex",justifyContent:"space-between",padding:"9px 14px",fontSize:13,color:"#64748b",borderTop:`1px solid ${border}`}}>
                <span>Subtotal</span><span style={{fontWeight:600}}>₹{fmt(subtotal)}</span>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",padding:"13px 16px",background:headerBg,borderRadius:"0 0 10px 10px",marginTop:subtotal===total?1:0}}>
              <span style={{color:"#fff",fontWeight:800,fontSize:15}}>Total Amount</span>
              <span style={{color:"#fff",fontWeight:900,fontSize:18}}>₹{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM FIELDS — BOTTOM */}
      {customBottom.length>0&&(
        <div style={{padding:"0 32px 20px",display:"flex",gap:8,flexWrap:"wrap"}}>
          {customBottom.map((f,i)=>(
            <div key={i} style={{background:tc?`${accent}12`:"#faf5ff",borderRadius:8,padding:"8px 14px",
              border:`1px solid ${tc?.accent||"#ddd6fe"}40`,flex:"1 1 180px",minWidth:150}}>
              <div style={{fontSize:9,fontWeight:800,color:tc?.accent||"#7c3aed",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>{f.label}</div>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{f.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {((order.distributorNote&&order.distributorNoteVisible)||(order.adminNote&&order.adminNoteVisible))&&(
        <div style={{margin:"0 32px 20px",background:tc?`${accent}08`:"#f8fafc",borderRadius:10,padding:"14px 18px",border:`1px solid ${border}`}}>
          <div style={{fontSize:9,fontWeight:800,color:"#94a3b8",letterSpacing:"0.08em",marginBottom:8,textTransform:"uppercase"}}>Notes</div>
          {order.distributorNote&&order.distributorNoteVisible&&<div style={{fontSize:12,color:"#1d4ed8",marginBottom:4}}>📦 {order.distributorNote}</div>}
          {order.adminNote&&order.adminNoteVisible&&<div style={{fontSize:12,color:"#7c3aed"}}>👑 {order.adminNote}</div>}
        </div>
      )}

      {/* Rejection */}
      {order.status==="rejected"&&(
        <div style={{margin:"0 32px 20px",background:"#fef2f2",borderRadius:10,padding:"14px 18px",border:"1.5px solid #fca5a5"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#dc2626",marginBottom:4}}>❌ CANCELLATION REASON</div>
          <div style={{fontSize:12,color:"#991b1b"}}>{order.distributorRejectedNote||order.adminNote||"Order was cancelled"}</div>
          {order.rejectedAt&&<div style={{fontSize:10,color:"#b91c1c",marginTop:4}}>On: {fmtDT(order.rejectedAt)}</div>}
        </div>
      )}

      {/* Terms */}
      {settings?.terms&&(
        <div style={{margin:"0 32px 20px",fontSize:10,color:"#94a3b8",lineHeight:1.8}}>
          <div style={{fontWeight:700,marginBottom:4,color:"#64748b"}}>Terms & Conditions:</div>
          {settings.terms}
        </div>
      )}

      {/* Footer */}
      <div style={{background:tc?`${accent}12`:"#f8fafc",borderTop:`1px solid ${border}`,padding:"16px 32px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:13,color:tc?accent:"#64748b",fontStyle:"italic",fontWeight:tc?600:400}}>
          {tc?.wish?`${tc.wish} — `:""}{settings?.footer||"Thank you for your business!"}
        </div>
        <div style={{fontSize:9,color:"#94a3b8"}}>Generated: {fmtDT(new Date())}</div>
      </div>

      {/* Festive bottom banner */}
      {tc?.bottomBanner&&(
        <div style={{background:accent,padding:"7px 0",textAlign:"center",fontSize:18,letterSpacing:6,color:"#fff"}}>
          {tc.bottomBanner}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   THERMAL INVOICE
══════════════════════════════════════ */
function ThermalInvoice({ order, settings, invNo, meta, thermalWidth }) {
  const items=order.items||[]
  const total=order.total||items.reduce((s,i)=>s+(i.price||0)*(i.qty||i.quantity||1),0)
  const w=thermalWidth==="58"?200:280
  const showBehalf=settings?.showBehalfInfo!==false
  const divider=<div style={{borderTop:"1px dashed #000",margin:"6px 0"}}/>
  return (
    <div style={{width:w,margin:"0 auto",background:"#fff",padding:"14px 10px",
      fontFamily:"'Courier New',monospace",fontSize:thermalWidth==="58"?10:11,
      color:"#000",boxShadow:"0 2px 12px rgba(0,0,0,0.15)",borderRadius:4}}>
      <div style={{textAlign:"center",marginBottom:8}}>
        {settings?.showLogo&&settings?.logo&&<img src={settings.logo} alt="logo" style={{height:36,marginBottom:4}}/>}
        <div style={{fontWeight:900,fontSize:thermalWidth==="58"?13:15,textTransform:"uppercase"}}>{settings?.companyName||"YOUR COMPANY"}</div>
        {settings?.tagline&&<div style={{fontSize:9}}>{settings.tagline}</div>}
        {settings?.address&&<div style={{fontSize:9}}>{settings.address}</div>}
        {settings?.phone&&<div style={{fontSize:9}}>Ph: {settings.phone}</div>}
        {settings?.gst&&<div style={{fontSize:9}}>GST: {settings.gst}</div>}
      </div>
      {divider}
      <div style={{textAlign:"center",fontWeight:900,fontSize:12,textTransform:"uppercase"}}>{meta.type}</div>
      <div style={{textAlign:"center",fontSize:9}}>#{invNo} | {fmtDate(order.createdAt)}</div>
      {divider}
      <div style={{textAlign:"center",fontWeight:700,fontSize:10,background:"#000",color:"#fff",padding:"2px 0",marginBottom:6}}>STATUS: {meta.badge}</div>
      {(settings?.customFields||[]).filter(f=>f.position==="top"||!f.position).map((f,i)=>(
        <div key={i} style={{fontSize:9,marginBottom:2}}><b>{f.label}:</b> {f.value}</div>
      ))}
      {divider}
      <div style={{fontWeight:700,fontSize:9,textDecoration:"underline"}}>BILL TO:</div>
      <div style={{fontWeight:700}}>{order.customerName||"—"}</div>
      {order.phone&&<div style={{fontSize:9}}>Ph: {order.phone}</div>}
      {order.address&&<div style={{fontSize:9}}>Addr: {order.address}</div>}
      {showBehalf&&order.onBehalfOfId&&<>
        <div style={{fontSize:9}}>FOR: {order.onBehalfOfName} ({order.onBehalfOfRole})</div>
        <div style={{fontSize:9}}>BY : {order.placedByName} ({order.placedByRole})</div>
      </>}
      {divider}
      <div style={{fontSize:9}}>
        <div>Seller: {order.sellerId?.name||"—"}</div>
        {order.distributorId&&<div>Dist : {order.distributorId?.name}</div>}
        <div>Order: #{order._id?.slice(-6)}</div>
      </div>
      {divider}
      <div style={{fontWeight:700,fontSize:9,textDecoration:"underline",marginBottom:4}}>ITEMS:</div>
      {items.map((item,i)=>{
        const qty=item.qty||item.quantity||1,price=item.price||0,amt=price*qty
        const name=item.title||item.name||item.productName||"Product"
        return (
          <div key={i} style={{marginBottom:5,paddingBottom:5,borderBottom:"1px dotted #999"}}>
            <div style={{fontWeight:700,fontSize:9,wordBreak:"break-word"}}>{i+1}. {name}</div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,paddingLeft:10}}>
              <span>Qty:{qty} x Rs.{price}</span>
              <span style={{fontWeight:700}}>Rs.{amt.toFixed(2)}</span>
            </div>
          </div>
        )
      })}
      {divider}
      <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:14}}>
        <span>TOTAL</span><span>Rs.{total.toFixed(2)}</span>
      </div>
      {divider}
      {(settings?.customFields||[]).filter(f=>f.position==="bottom").map((f,i)=>(
        <div key={i} style={{fontSize:9,marginBottom:2}}><b>{f.label}:</b> {f.value}</div>
      ))}
      {order.status==="rejected"&&(
        <div style={{fontSize:9,fontWeight:700,textAlign:"center",marginTop:4}}>
          ** ORDER CANCELLED **
          <div style={{fontWeight:400}}>{order.distributorRejectedNote||order.adminNote||""}</div>
        </div>
      )}
      {divider}
      <div style={{textAlign:"center",fontSize:9}}>{settings?.footer||"Thank you!"}</div>
      {settings?.terms&&<div style={{textAlign:"center",fontSize:8,marginTop:4,color:"#555"}}>{settings.terms}</div>}
      <div style={{textAlign:"center",fontSize:8,marginTop:6,color:"#999"}}>{fmtDT(new Date())}</div>
      <div style={{textAlign:"center",marginTop:8,letterSpacing:2,fontSize:7}}>{"| | || ||| | || ||| || |"}</div>
      <div style={{textAlign:"center",fontSize:7}}>{(order._id||"").toUpperCase()}</div>
    </div>
  )
}

/* ══════════════════════════════════════
   THEME PICKER
══════════════════════════════════════ */
function ThemePicker({ selectedId, onSelect }) {
  const [openGroup, setOpenGroup] = useState(null)
  return (
    <div style={{background:"#1e293b",padding:"10px 14px",borderBottom:"1px solid #334155"}}>
      <div style={{fontSize:10,color:"#64748b",marginBottom:6,fontWeight:600}}>🎨 FESTIVE THEME SELECT KARO:</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <button onClick={()=>onSelect(null)}
          style={{padding:"5px 14px",borderRadius:8,border:`2px solid ${!selectedId?"#60a5fa":"#374151"}`,
            background:!selectedId?"#1d4ed8":"transparent",color:!selectedId?"#fff":"#94a3b8",
            fontWeight:700,fontSize:11,cursor:"pointer"}}>
          ◻️ Normal
        </button>
        {Object.entries(FESTIVAL_GROUPS).map(([key,group])=>{
          const isOpen=openGroup===key
          const isActive=group.themes.some(t=>t.id===selectedId)
          return (
            <div key={key} style={{position:"relative"}}>
              <button onClick={()=>setOpenGroup(isOpen?null:key)}
                style={{padding:"5px 12px",borderRadius:8,
                  border:`2px solid ${isActive?"#fbbf24":isOpen?"#60a5fa":"#374151"}`,
                  background:isActive?"#92400e":isOpen?"#1d4ed820":"transparent",
                  color:isActive?"#fbbf24":isOpen?"#60a5fa":"#94a3b8",
                  fontWeight:700,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>
                {group.label} {isOpen?"▲":"▼"}
              </button>
              {isOpen&&(
                <div style={{position:"absolute",top:"110%",left:0,zIndex:9999,
                  background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,
                  padding:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,width:360,
                  boxShadow:"0 24px 80px rgba(0,0,0,0.7)"}}>
                  <div style={{gridColumn:"1/-1",fontSize:11,fontWeight:800,color:"#60a5fa",marginBottom:4,paddingBottom:6,borderBottom:"1px solid #1e293b"}}>
                    {group.label} — 10 Themes
                  </div>
                  {group.themes.map(theme=>{
                    const isSel=theme.id===selectedId
                    return (
                      <button key={theme.id}
                        onClick={()=>{onSelect(theme.id);setOpenGroup(null)}}
                        style={{padding:"9px 10px",borderRadius:10,
                          border:`2px solid ${isSel?"#fbbf24":"transparent"}`,
                          background:isSel?"#451a0380":`${theme.accent}18`,
                          cursor:"pointer",textAlign:"left"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{width:28,height:28,borderRadius:8,background:theme.gradient,
                            flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.4)"}}/>
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:"#f1f5f9"}}>{theme.name}</div>
                            <div style={{fontSize:9,color:"#94a3b8",marginTop:1}}>{theme.wish}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN MODAL
══════════════════════════════════════ */
export default function InvoiceModal({ order, onClose, viewerRole }) {
  const [settings,setSettings]=useState(null)
  const [loading,setLoading]=useState(true)
  const [printMode,setPrintMode]=useState("normal")
  const [thermalWidth,setThermalWidth]=useState("80")
  const [selectedThemeId,setSelectedThemeId]=useState(null)
  const printRef=useRef()

  useEffect(()=>{
    const load=async()=>{
      try {
        const token=localStorage.getItem("token")
        const res=await fetch(`${import.meta.env.VITE_API_URL}/api/invoice-settings`,{headers:{Authorization:`Bearer ${token}`}})
        const data=await res.json()
        setSettings(data)
      } catch {
        setSettings({companyName:"Your Company",footer:"Thank you!",themeColor:"#1e293b",showBehalfInfo:true,customFields:[]})
      } finally{setLoading(false)}
    }
    load()
  },[])

  const handlePrint=()=>{
    const el=printRef.current
    if(!el)return
    const win=window.open("","_blank","width=900,height=700")
    const css=printMode==="thermal"
      ?`@page{size:${thermalWidth}mm auto;margin:2mm}body{width:${thermalWidth}mm}`
      :`@page{size:A4;margin:10mm}`
    win.document.write(`<html><head><title>Invoice ${invNo}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}
      body{font-family:${printMode==="thermal"?"'Courier New',monospace":"'Segoe UI',Arial,sans-serif"};background:#fff}
      @media print{${css};body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
      </style></head><body>${el.innerHTML}</body></html>`)
    win.document.close();win.focus()
    setTimeout(()=>{win.print();win.close()},400)
  }

  if(!order)return null
  const meta=STATUS_META[order.status]||STATUS_META.pending
  const invNo=getInvNo(order._id,order.status)
  const activeTheme=selectedThemeId?getThemeById(selectedThemeId):null

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:9999,
      display:"flex",alignItems:"flex-start",justifyContent:"center",padding:12,overflowY:"auto"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>

      <div style={{width:"100%",maxWidth:printMode==="thermal"?480:900,
        background:"#0f172a",borderRadius:20,overflow:"hidden",boxShadow:"0 40px 100px rgba(0,0,0,0.7)"}}>

        {/* TOOLBAR */}
        <div style={{background:"#1e293b",padding:"12px 18px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:13}}>{meta.type}</div>
            <div style={{color:"#94a3b8",fontSize:10,fontFamily:"monospace"}}>#{invNo}</div>
          </div>
          <div style={{display:"flex",gap:3,background:"#0f172a",borderRadius:8,padding:3}}>
            {[{k:"normal",l:"📄 A4"},{k:"thermal",l:"🖨️ Thermal"}].map(m=>(
              <button key={m.k} onClick={()=>setPrintMode(m.k)}
                style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                  background:printMode===m.k?"#3b82f6":"transparent",color:printMode===m.k?"#fff":"#94a3b8"}}>
                {m.l}
              </button>
            ))}
          </div>
          {printMode==="thermal"&&(
            <div style={{display:"flex",gap:3,background:"#0f172a",borderRadius:8,padding:3}}>
              {["58","80"].map(w=>(
                <button key={w} onClick={()=>setThermalWidth(w)}
                  style={{padding:"5px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                    background:thermalWidth===w?"#f59e0b":"transparent",color:thermalWidth===w?"#000":"#94a3b8"}}>
                  {w}mm
                </button>
              ))}
            </div>
          )}
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            {!loading&&(
              <button onClick={handlePrint}
                style={{padding:"7px 18px",borderRadius:9,border:"none",background:"#3b82f6",
                  color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                🖨️ Print / Save
              </button>
            )}
            <button onClick={onClose}
              style={{padding:"7px 14px",borderRadius:9,border:"none",background:"#374151",
                color:"#9ca3af",fontWeight:700,fontSize:12,cursor:"pointer"}}>✕</button>
          </div>
        </div>

        {/* THEME PICKER — A4 only */}
        {printMode==="normal"&&<ThemePicker selectedId={selectedThemeId} onSelect={setSelectedThemeId}/>}

        {/* Active theme strip */}
        {activeTheme&&printMode==="normal"&&(
          <div style={{background:activeTheme.accent,padding:"5px 18px",textAlign:"center",fontSize:11,fontWeight:800,color:"#fff",letterSpacing:1}}>
            {activeTheme.wish} &nbsp;—&nbsp; {activeTheme.name} Theme
          </div>
        )}
        {printMode==="thermal"&&(
          <div style={{background:"#f59e0b",padding:"4px 18px",textAlign:"center",fontSize:11,fontWeight:700,color:"#000"}}>
            🖨️ Thermal {thermalWidth}mm Preview
          </div>
        )}

        {/* INVOICE */}
        <div style={{padding:16,background:"#f1f5f9"}}>
          {loading?(
            <div style={{textAlign:"center",padding:60,color:"#64748b"}}>Loading invoice...</div>
          ):(
            <div ref={printRef}>
              {printMode==="normal"?(
                <NormalInvoice order={order} settings={settings} theme={activeTheme} invNo={invNo} meta={meta}/>
              ):(
                <ThermalInvoice order={order} settings={settings} invNo={invNo} meta={meta} thermalWidth={thermalWidth}/>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
