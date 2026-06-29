import { useState, useEffect, useRef } from "react"
import InvoiceModal from "../components/InvoiceModal"

/* ── Demo order for preview ── */
const DEMO_ORDER = {
  _id: "demo1234567890ab",
  status: "confirmed",
  createdAt: new Date().toISOString(),
  confirmedAt: new Date().toISOString(),
  distributorApprovedAt: new Date().toISOString(),
  customerName: "Rahul Sharma",
  phone: "9876543210",
  address: "123, MG Road, Mumbai 400001",
  total: 2998,
  items: [
    { title:"Premium Headphone", price:1999, qty:1, description:"Wireless Over-Ear" },
    { title:"Smart Watch",       price:999,  qty:1, description:"Fitness Tracker" },
  ],
  sellerId:      { name:"DB001/DS001", email:"seller@company.com", role:"seller" },
  distributorId: { name:"DB001" },
  onBehalfOfId:   "demo_id",
  onBehalfOfName: "Priya Sharma",
  onBehalfOfRole: "user",
  placedByName:   "DB001",
  placedByRole:   "distributor",
  distributorNote:"Approved — sab theek hai", distributorNoteVisible:true,
  adminNote:"Final confirmed", adminNoteVisible:true,
}

/* ── Mini inline invoice preview (no modal) ── */
function LivePreview({ settings, previewStatus }) {
  const [themeId, setThemeId] = useState(null)

  const statusList = [
    { k:"pending",       label:"Proforma",   color:"#c2410c" },
    { k:"dist_approved", label:"Acknowledged",color:"#1d4ed8" },
    { k:"confirmed",     label:"Tax Invoice", color:"#15803d" },
    { k:"rejected",      label:"Cancelled",   color:"#dc2626" },
  ]
  const order = { ...DEMO_ORDER, status: previewStatus }
  const meta  = {
    pending:       { type:"PROFORMA INVOICE",        badge:"PENDING",   badgeBg:"#fff7ed", badgeColor:"#c2410c", watermark:"PROFORMA"    },
    dist_approved: { type:"ACKNOWLEDGEMENT INVOICE",  badge:"STAGE 1",  badgeBg:"#eff6ff", badgeColor:"#1d4ed8", watermark:"ACKNOWLEDGED" },
    confirmed:     { type:"TAX INVOICE",              badge:"CONFIRMED", badgeBg:"#f0fdf4", badgeColor:"#15803d", watermark:"CONFIRMED"    },
    rejected:      { type:"CANCELLATION NOTICE",      badge:"CANCELLED", badgeBg:"#fef2f2", badgeColor:"#dc2626", watermark:"CANCELLED"   },
  }[previewStatus]

  const items     = order.items||[]
  const total     = order.total
  const headerBg  = settings?.themeColor||"#1e293b"
  const border    = "#e2e8f0"

  const showBehalf   = settings?.showBehalfInfo !== false
  const customTop    = (settings?.customFields||[]).filter(f=>f.position==="top"||!f.position)
  const customBottom = (settings?.customFields||[]).filter(f=>f.position==="bottom")

  const fmt = (n) => Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})
  const invNo = { pending:"PRO", dist_approved:"ACK", confirmed:"INV", rejected:"CAN" }[previewStatus]+"-DEMO1234"

  return (
    <div style={{fontFamily:"'Segoe UI',Arial,sans-serif",fontSize:"0.85em",transform:"scale(0.75)",transformOrigin:"top center",width:"133%",marginLeft:"-16.5%"}}>
      <div style={{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.12)",position:"relative"}}>

        {/* Watermark */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-30deg)",
          fontSize:60,fontWeight:900,opacity:0.05,color:headerBg,pointerEvents:"none",whiteSpace:"nowrap",userSelect:"none",zIndex:0}}>
          {meta.watermark}
        </div>

        {/* Header */}
        <div style={{background:headerBg,padding:"18px 22px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1}}>
            <div>
              {settings?.showLogo&&settings?.logo ? (
                <img src={settings.logo} alt="logo" style={{height:36,marginBottom:6,borderRadius:7,background:"rgba(255,255,255,0.9)",padding:3}}/>
              ) : (
                <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.18)",display:"flex",
                  alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:6}}>🏢</div>
              )}
              <div style={{color:"#fff",fontWeight:900,fontSize:16}}>{settings?.companyName||"Your Company"}</div>
              {settings?.tagline&&<div style={{color:"rgba(255,255,255,0.7)",fontSize:10,marginTop:2}}>{settings.tagline}</div>}
              {settings?.address&&<div style={{color:"rgba(255,255,255,0.55)",fontSize:9,marginTop:4,maxWidth:200}}>{settings.address}</div>}
              <div style={{marginTop:4,display:"flex",gap:10}}>
                {settings?.phone&&<span style={{color:"rgba(255,255,255,0.7)",fontSize:9}}>📞 {settings.phone}</span>}
                {settings?.email&&<span style={{color:"rgba(255,255,255,0.7)",fontSize:9}}>✉️ {settings.email}</span>}
              </div>
              {settings?.gst&&<div style={{color:"rgba(255,255,255,0.55)",fontSize:9,fontFamily:"monospace",marginTop:2}}>GST: {settings.gst}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{background:meta.badgeBg,color:meta.badgeColor,fontWeight:900,fontSize:9,padding:"3px 10px",borderRadius:99,display:"inline-block",marginBottom:8}}>● {meta.badge}</div>
              <div style={{color:"#fff",fontWeight:800,fontSize:13,marginBottom:2}}>{meta.type}</div>
              <div style={{color:"rgba(255,255,255,0.8)",fontWeight:700,fontSize:10,fontFamily:"monospace"}}>#{invNo}</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:9,marginTop:6}}>Date: 08 May 2026</div>
            </div>
          </div>
        </div>

        {/* Stage tracker */}
        <div style={{background:"#f8fafc",borderBottom:`1px solid ${border}`,padding:"10px 22px"}}>
          <div style={{display:"flex",alignItems:"center"}}>
            {[{key:"pending",label:"Order Placed"},{key:"dist_approved",label:"Dist. Approved"},{key:"confirmed",label:"Confirmed"}].map((stage,idx,arr)=>{
              const ord=["pending","dist_approved","confirmed"]
              const cur=previewStatus==="rejected"?-1:ord.indexOf(previewStatus)
              const done=ord.indexOf(stage.key)<cur,isCur=stage.key===previewStatus
              return (
                <div key={stage.key} style={{display:"flex",alignItems:"center",flex:1}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:60}}>
                    <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:9,fontWeight:800,border:"2px solid",
                      background:done?headerBg:isCur?headerBg:"#fff",
                      borderColor:done?headerBg:isCur?headerBg:border,
                      color:(done||isCur)?"#fff":"#94a3b8",
                      boxShadow:isCur?`0 0 0 3px ${headerBg}25`:"none"}}>
                      {done?"✓":"•"}
                    </div>
                    <div style={{fontSize:8,marginTop:2,fontWeight:isCur?700:400,textAlign:"center",color:isCur?headerBg:done?headerBg:"#94a3b8"}}>{stage.label}</div>
                  </div>
                  {idx<arr.length-1&&<div style={{flex:1,height:2,background:done?headerBg:border,margin:"0 4px",marginBottom:12,borderRadius:2}}/>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Custom fields TOP */}
        {customTop.length>0&&(
          <div style={{padding:"10px 22px 0",display:"flex",gap:6,flexWrap:"wrap"}}>
            {customTop.map((f,i)=>(
              <div key={i} style={{background:"#f0f9ff",borderRadius:7,padding:"6px 10px",border:"1px solid #bae6fd40",flex:"1 1 120px",minWidth:100,position:"relative"}}>
                <div style={{fontSize:7,fontWeight:800,color:"#0ea5e9",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>{f.label}</div>
                <div style={{fontSize:11,fontWeight:700,color:"#1e293b"}}>{f.value}</div>
                <div style={{position:"absolute",top:-6,right:4,fontSize:7,background:"#0ea5e9",color:"#fff",padding:"1px 4px",borderRadius:4,fontWeight:700}}>↑TOP</div>
              </div>
            ))}
          </div>
        )}

        {/* Parties */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:`1px solid ${border}`}}>
          <div style={{padding:"14px 16px",borderRight:`1px solid ${border}`}}>
            <div style={{fontSize:7,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>Bill To</div>
            <div style={{fontWeight:800,fontSize:12,color:"#1e293b"}}>{order.customerName}</div>
            <div style={{fontSize:9,color:"#64748b",marginTop:3}}>📞 {order.phone}</div>
            <div style={{fontSize:8,color:"#64748b",marginTop:2}}>📍 {order.address}</div>

            {/* Behalf — toggleable */}
            {showBehalf&&order.onBehalfOfId&&(
              <div style={{marginTop:8,borderTop:`1px dashed ${border}`,paddingTop:8}}>
                <div style={{background:"#eff6ff",borderRadius:6,padding:"5px 7px",marginBottom:4}}>
                  <div style={{fontSize:7,fontWeight:800,color:headerBg,textTransform:"uppercase",marginBottom:2}}>📦 Ordered For</div>
                  <div style={{fontWeight:700,fontSize:10}}>{order.onBehalfOfName}</div>
                  <div style={{fontSize:8,color:"#64748b",textTransform:"capitalize"}}>{order.onBehalfOfRole}</div>
                </div>
                <div style={{background:"#f0fdf4",borderRadius:6,padding:"5px 7px"}}>
                  <div style={{fontSize:7,fontWeight:800,color:headerBg,textTransform:"uppercase",marginBottom:2}}>✍️ Placed By</div>
                  <div style={{fontWeight:700,fontSize:10}}>{order.placedByName}</div>
                  <div style={{fontSize:8,color:"#64748b",textTransform:"capitalize"}}>{order.placedByRole}</div>
                </div>
              </div>
            )}
            {!showBehalf&&(
              <div style={{marginTop:8,padding:"5px 8px",background:"#f8fafc",borderRadius:6,border:"1px dashed #e2e8f0"}}>
                <div style={{fontSize:8,color:"#94a3b8",fontStyle:"italic"}}>⛔ Behalf info hidden</div>
              </div>
            )}
          </div>
          <div style={{padding:"14px 16px",borderRight:`1px solid ${border}`}}>
            <div style={{fontSize:7,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>Seller</div>
            <div style={{fontWeight:700,fontSize:11}}>{order.sellerId?.name}</div>
            <div style={{fontSize:8,color:"#64748b",marginTop:2}}>{order.sellerId?.email}</div>
          </div>
          <div style={{padding:"14px 16px"}}>
            <div style={{fontSize:7,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>Order Details</div>
            {[["Invoice No.",invNo],["Order ID","#DEMO1234"],["Date","08 May 2026"],["Distributor",order.distributorId?.name]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:8,marginBottom:3}}>
                <span style={{color:"#94a3b8"}}>{k}</span>
                <span style={{fontWeight:700,color:"#1e293b",fontFamily:"monospace",fontSize:7}}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div style={{padding:"0 22px 16px"}}>
          <table style={{width:"100%",borderCollapse:"collapse",marginTop:14}}>
            <thead>
              <tr style={{background:headerBg}}>
                {["#","Item Description","Qty","Price","Amount"].map((h,i)=>(
                  <th key={h} style={{padding:"7px 10px",color:"#fff",fontWeight:700,fontSize:8,
                    textAlign:i===0?"center":i>=2?"right":"left"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item,i)=>(
                <tr key={i} style={{background:i%2===0?"#fff":"#f8fafc",borderBottom:`1px solid ${border}`}}>
                  <td style={{padding:"8px 10px",textAlign:"center",fontSize:8,color:"#94a3b8"}}>{i+1}</td>
                  <td style={{padding:"8px 10px"}}>
                    <div style={{fontWeight:700,fontSize:10}}>{item.title}</div>
                    <div style={{fontSize:8,color:"#94a3b8"}}>{item.description}</div>
                  </td>
                  <td style={{padding:"8px 10px",textAlign:"right",fontSize:9}}>{item.qty}</td>
                  <td style={{padding:"8px 10px",textAlign:"right",fontSize:9}}>₹{fmt(item.price)}</td>
                  <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,fontSize:10}}>₹{fmt(item.price*item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <div style={{minWidth:200}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"9px 12px",background:headerBg,borderRadius:"0 0 8px 8px"}}>
                <span style={{color:"#fff",fontWeight:800,fontSize:11}}>Total Amount</span>
                <span style={{color:"#fff",fontWeight:900,fontSize:13}}>₹{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom fields BOTTOM */}
        {customBottom.length>0&&(
          <div style={{padding:"0 22px 14px",display:"flex",gap:6,flexWrap:"wrap"}}>
            {customBottom.map((f,i)=>(
              <div key={i} style={{background:"#faf5ff",borderRadius:7,padding:"6px 10px",border:"1px solid #ddd6fe40",flex:"1 1 120px",minWidth:100,position:"relative"}}>
                <div style={{fontSize:7,fontWeight:800,color:"#7c3aed",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>{f.label}</div>
                <div style={{fontSize:11,fontWeight:700,color:"#1e293b"}}>{f.value}</div>
                <div style={{position:"absolute",top:-6,right:4,fontSize:7,background:"#7c3aed",color:"#fff",padding:"1px 4px",borderRadius:4,fontWeight:700}}>↓BOT</div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{background:"#f8fafc",borderTop:`1px solid ${border}`,padding:"10px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:10,color:"#64748b",fontStyle:"italic"}}>{settings?.footer||"Thank you for your business!"}</div>
          <div style={{fontSize:7,color:"#94a3b8"}}>Generated: Now</div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function AdminInvoiceSettings() {
  const [form, setForm] = useState({
    companyName:"", tagline:"", address:"", phone:"", email:"",
    gst:"", footer:"Thank you for your business!", logo:"",
    themeColor:"#1e293b", showLogo:false, terms:"",
    showBehalfInfo: true,
    customFields: [],
  })
  const [saving,setSaving]   = useState(false)
  const [saved,setSaved]     = useState(false)
  const [loading,setLoading] = useState(true)
  const [logoMode,setLogoMode] = useState("url")
  const [logoPreview,setLogoPreview] = useState("")
  const [previewStatus,setPreviewStatus] = useState("confirmed")
  const [fullPreview,setFullPreview] = useState(null) // full modal preview
  const [newField,setNewField] = useState({label:"",value:"",position:"top"})
  const logoRef = useRef()

  useEffect(()=>{
    const load=async()=>{
      try {
        const token=localStorage.getItem("token")
        const res=await fetch(`${import.meta.env.VITE_API_URL}/api/invoice-settings`,{headers:{Authorization:`Bearer ${token}`}})
        const data=await res.json()
        setForm(p=>({...p,...data}))
        if(data.logo){setLogoPreview(data.logo);setLogoMode(data.logo.startsWith("data:")?"upload":"url")}
      } catch{}
      finally{setLoading(false)}
    }
    load()
  },[])

  const handleLogoUpload=(e)=>{
    const file=e.target.files[0]
    if(!file)return
    if(!file.type.startsWith("image/")){alert("Sirf image file upload karo");return}
    if(file.size>500*1024){alert("Logo 500KB se chhota hona chahiye");return}
    const reader=new FileReader()
    reader.onload=(ev)=>{
      const b64=ev.target.result
      setForm(p=>({...p,logo:b64,showLogo:true}))
      setLogoPreview(b64)
    }
    reader.readAsDataURL(file)
  }

  const handleSave=async()=>{
    try{
      setSaving(true)
      const token=localStorage.getItem("token")
      const res=await fetch(`${import.meta.env.VITE_API_URL}/api/invoice-settings`,{
        method:"POST",
        headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
        body:JSON.stringify(form)
      })
      if(res.ok){setSaved(true);setTimeout(()=>setSaved(false),2500)}
      else{const d=await res.json();alert("Error: "+d.message)}
    }catch(e){alert("Save failed: "+e.message)}
    finally{setSaving(false)}
  }

  const addCustomField=()=>{
    if(!newField.label.trim()||!newField.value.trim()){alert("Label aur Value dono bharein");return}
    setForm(p=>({...p,customFields:[...p.customFields,{...newField,id:Date.now()}]}))
    setNewField({label:"",value:"",position:"top"})
  }

  const removeCustomField=(id)=>setForm(p=>({...p,customFields:p.customFields.filter(f=>(f.id||f.label)!==(id))}))

  const moveField=(id,dir)=>{
    const arr=[...form.customFields]
    const idx=arr.findIndex(f=>(f.id||f.label)===id)
    if(idx===-1)return
    const swap=dir==="up"?idx-1:idx+1
    if(swap<0||swap>=arr.length)return
    ;[arr[idx],arr[swap]]=[arr[swap],arr[idx]]
    setForm(p=>({...p,customFields:arr}))
  }

  const inp=(label,key,type="text",ph="")=>(
    <div style={{marginBottom:10}}>
      <label style={{display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:3}}>{label}</label>
      <input type={type} value={form[key]||""} placeholder={ph}
        onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
        style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
    </div>
  )

  if(loading)return <div style={{padding:40,textAlign:"center",color:"#64748b"}}>Loading...</div>

  const STATUS_TABS=[
    {k:"pending",       l:"🟠 Proforma",      c:"#c2410c"},
    {k:"dist_approved", l:"🔵 Acknowledged",   c:"#1d4ed8"},
    {k:"confirmed",     l:"🟢 Tax Invoice",    c:"#15803d"},
    {k:"rejected",      l:"🔴 Cancelled",      c:"#dc2626"},
  ]

  return (
    <div style={{fontFamily:"system-ui,sans-serif",padding:4}}>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1e293b,#334155)",borderRadius:14,padding:"16px 20px",marginBottom:16,color:"#fff"}}>
        <h1 style={{margin:0,fontWeight:800,fontSize:18}}>🧾 Invoice Settings</h1>
        <p style={{margin:"3px 0 0",fontSize:11,opacity:0.7}}>Settings badlo — right side pe live preview turant update hoga</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"440px 1fr",gap:14,alignItems:"start"}}>

        {/* ════ LEFT — SETTINGS ════ */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Company Info */}
          <div style={{background:"#fff",borderRadius:12,padding:18,border:"1px solid #e2e8f0",boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
            <h2 style={{margin:"0 0 12px",fontSize:13,fontWeight:800,color:"#1e293b"}}>🏢 Company Info</h2>
            {inp("Company Name *","companyName","text","Your Company Pvt. Ltd.")}
            {inp("Tagline","tagline","text","Quality Products, Best Prices")}
            {inp("Address","address","text","123, Business Park, City - 400001")}
            {inp("Phone","phone","text","+91 98765 43210")}
            {inp("Email","email","email","info@yourcompany.com")}
            {inp("GST Number","gst","text","27ABCDE1234F1Z5")}
          </div>

          {/* Logo */}
          <div style={{background:"#fff",borderRadius:12,padding:18,border:"1px solid #e2e8f0",boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
            <h2 style={{margin:"0 0 12px",fontSize:13,fontWeight:800,color:"#1e293b"}}>🖼️ Logo</h2>
            <div style={{display:"flex",gap:3,background:"#f1f5f9",borderRadius:7,padding:3,marginBottom:12}}>
              {[{k:"upload",l:"📁 Upload"},{k:"url",l:"🔗 URL"}].map(t=>(
                <button key={t.k} onClick={()=>setLogoMode(t.k)}
                  style={{flex:1,padding:"6px",borderRadius:5,border:"none",cursor:"pointer",fontWeight:700,fontSize:11,
                    background:logoMode===t.k?"#fff":"transparent",color:logoMode===t.k?"#1e293b":"#64748b"}}>
                  {t.l}
                </button>
              ))}
            </div>
            {logoMode==="upload"?(
              <div>
                <div onClick={()=>logoRef.current?.click()}
                  style={{border:"2px dashed #cbd5e1",borderRadius:10,padding:"16px",textAlign:"center",cursor:"pointer",background:"#f8fafc"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#3b82f6"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#cbd5e1"}>
                  <div style={{fontSize:24,marginBottom:4}}>📁</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>Click karo logo upload ke liye</div>
                  <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>PNG, JPG, SVG — Max 500KB</div>
                  <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{display:"none"}}/>
                </div>
                {logoPreview&&logoPreview.startsWith("data:")&&(
                  <div style={{marginTop:8,padding:8,background:"#f0fdf4",borderRadius:8,border:"1px solid #bbf7d0",display:"flex",alignItems:"center",gap:8}}>
                    <img src={logoPreview} alt="Logo" style={{maxHeight:40,maxWidth:70,borderRadius:5,background:"#fff",padding:2}}/>
                    <div style={{flex:1,fontSize:11,fontWeight:700,color:"#15803d"}}>✅ Logo uploaded</div>
                    <button onClick={()=>{setForm(p=>({...p,logo:"",showLogo:false}));setLogoPreview("")}}
                      style={{padding:"2px 8px",borderRadius:5,border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ):(
              <div>
                <input type="text" value={form.logo.startsWith?.("data:")?"":form.logo||""}
                  onChange={e=>{setForm(p=>({...p,logo:e.target.value}));setLogoPreview(e.target.value)}}
                  placeholder="https://yoursite.com/logo.png"
                  style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                {logoPreview&&!logoPreview.startsWith?.("data:")&&logoPreview.length>5&&(
                  <img src={logoPreview} alt="preview" style={{maxHeight:36,marginTop:6,borderRadius:5}} onError={e=>e.target.style.display="none"}/>
                )}
              </div>
            )}
            <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8}}>
              <input type="checkbox" id="showLogo" checked={!!form.showLogo}
                onChange={e=>setForm(p=>({...p,showLogo:e.target.checked}))} style={{width:15,height:15,cursor:"pointer"}}/>
              <label htmlFor="showLogo" style={{fontSize:12,color:"#374151",cursor:"pointer",fontWeight:600}}>Invoice pe logo dikhao</label>
            </div>
          </div>

          {/* Theme + Footer */}
          <div style={{background:"#fff",borderRadius:12,padding:18,border:"1px solid #e2e8f0",boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
            <h2 style={{margin:"0 0 12px",fontSize:13,fontWeight:800,color:"#1e293b"}}>🎨 Theme & Footer</h2>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:5}}>Header Color</label>
            <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:12}}>
              <input type="color" value={form.themeColor||"#1e293b"}
                onChange={e=>setForm(p=>({...p,themeColor:e.target.value}))}
                style={{width:40,height:34,padding:2,borderRadius:7,border:"1.5px solid #e2e8f0",cursor:"pointer"}}/>
              <input type="text" value={form.themeColor||"#1e293b"}
                onChange={e=>setForm(p=>({...p,themeColor:e.target.value}))}
                style={{flex:1,padding:"7px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:12,fontFamily:"monospace"}}/>
              <div style={{display:"flex",gap:3}}>
                {["#1e293b","#065f46","#7c3aed","#dc2626","#1e40af","#92400e","#0f766e"].map(c=>(
                  <div key={c} onClick={()=>setForm(p=>({...p,themeColor:c}))}
                    style={{width:22,height:22,borderRadius:5,background:c,cursor:"pointer",
                      border:form.themeColor===c?"3px solid #94a3b8":"2px solid transparent"}}/>
                ))}
              </div>
            </div>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:3}}>Footer Text</label>
            <textarea value={form.footer||""} onChange={e=>setForm(p=>({...p,footer:e.target.value}))}
              rows={2} style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:12,resize:"vertical",boxSizing:"border-box",marginBottom:10}}/>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:3}}>Terms & Conditions</label>
            <textarea value={form.terms||""} onChange={e=>setForm(p=>({...p,terms:e.target.value}))}
              rows={2} style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:11,resize:"vertical",boxSizing:"border-box"}}/>
          </div>

          {/* Behalf Toggle */}
          <div style={{background:"#fff",borderRadius:12,padding:18,border:"1px solid #e2e8f0",boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
            <h2 style={{margin:"0 0 4px",fontSize:13,fontWeight:800,color:"#1e293b"}}>👥 Behalf Info</h2>
            <p style={{margin:"0 0 12px",fontSize:11,color:"#64748b"}}>Off karo → invoice mein sirf Customer + Seller dikhega</p>
            <div onClick={()=>setForm(p=>({...p,showBehalfInfo:!p.showBehalfInfo}))}
              style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:10,cursor:"pointer",
                background:form.showBehalfInfo?"#f0fdf4":"#fef2f2",
                border:`2px solid ${form.showBehalfInfo?"#16a34a":"#dc2626"}`,transition:"all 0.2s"}}>
              <div style={{width:46,height:24,borderRadius:12,background:form.showBehalfInfo?"#16a34a":"#e2e8f0",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                <div style={{position:"absolute",top:3,left:form.showBehalfInfo?24:3,width:18,height:18,
                  borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
              </div>
              <div>
                <div style={{fontWeight:800,fontSize:13,color:form.showBehalfInfo?"#15803d":"#dc2626"}}>
                  {form.showBehalfInfo?"✅ Behalf Info ON":"❌ Behalf Info OFF"}
                </div>
                <div style={{fontSize:10,color:"#64748b",marginTop:1}}>
                  {form.showBehalfInfo?"Ordered For + Placed By dikhega":"Sirf Customer + Seller naam dikhega"}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          <div style={{background:"#fff",borderRadius:12,padding:18,border:"1px solid #e2e8f0",boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
            <h2 style={{margin:"0 0 4px",fontSize:13,fontWeight:800,color:"#1e293b"}}>➕ Custom Fields</h2>
            <p style={{margin:"0 0 12px",fontSize:11,color:"#64748b"}}>Extra professional fields — PO Number, Delivery Date, Branch, etc.</p>
            <div style={{background:"#f8fafc",borderRadius:9,padding:12,border:"1px solid #e2e8f0",marginBottom:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
                <div>
                  <label style={{fontSize:10,fontWeight:600,color:"#64748b",display:"block",marginBottom:3}}>Label</label>
                  <input value={newField.label} onChange={e=>setNewField(p=>({...p,label:e.target.value}))}
                    placeholder="e.g. PO Number"
                    style={{width:"100%",padding:"6px 9px",borderRadius:6,border:"1.5px solid #e2e8f0",fontSize:11,boxSizing:"border-box"}}/>
                </div>
                <div>
                  <label style={{fontSize:10,fontWeight:600,color:"#64748b",display:"block",marginBottom:3}}>Value</label>
                  <input value={newField.value} onChange={e=>setNewField(p=>({...p,value:e.target.value}))}
                    placeholder="e.g. PO-2026-001"
                    style={{width:"100%",padding:"6px 9px",borderRadius:6,border:"1.5px solid #e2e8f0",fontSize:11,boxSizing:"border-box"}}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:10,fontWeight:600,color:"#64748b",display:"block",marginBottom:3}}>Position</label>
                  <select value={newField.position} onChange={e=>setNewField(p=>({...p,position:e.target.value}))}
                    style={{width:"100%",padding:"6px 9px",borderRadius:6,border:"1.5px solid #e2e8f0",fontSize:11,cursor:"pointer"}}>
                    <option value="top">🔼 Items Table ke Upar</option>
                    <option value="bottom">🔽 Items Table ke Neeche</option>
                  </select>
                </div>
                <button onClick={addCustomField}
                  style={{padding:"6px 16px",borderRadius:7,border:"none",background:"#1e293b",
                    color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",height:32}}>
                  ➕ Add
                </button>
              </div>
            </div>

            {form.customFields.length===0?(
              <div style={{textAlign:"center",padding:"16px",color:"#94a3b8",fontSize:11}}>Koi field nahi — upar se add karo</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                <div style={{fontSize:10,fontWeight:700,color:"#64748b",marginBottom:2}}>
                  Added Fields ({form.customFields.length}) — Preview mein live dikh raha hai ↓
                </div>
                {form.customFields.map((f,i)=>{
                  const fid=f.id||f.label
                  return (
                    <div key={fid} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",
                      borderRadius:8,background:"#f8fafc",border:"1px solid #e2e8f0"}}>
                      <div style={{fontSize:10,padding:"2px 7px",borderRadius:99,fontWeight:700,
                        background:f.position==="bottom"?"#faf5ff":"#f0f9ff",
                        color:f.position==="bottom"?"#7c3aed":"#0ea5e9",border:`1px solid ${f.position==="bottom"?"#ddd6fe":"#bae6fd"}`}}>
                        {f.position==="bottom"?"↓ Bot":"↑ Top"}
                      </div>
                      <div style={{flex:1}}>
                        <span style={{fontSize:11,fontWeight:700,color:"#374151"}}>{f.label}:</span>
                        <span style={{fontSize:11,color:"#64748b",marginLeft:4}}>{f.value}</span>
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>moveField(fid,"up")}
                          title="Upar le jao"
                          style={{padding:"2px 6px",borderRadius:4,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:10}}>↑</button>
                        <button onClick={()=>moveField(fid,"down")}
                          title="Neeche le jao"
                          style={{padding:"2px 6px",borderRadius:4,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:10}}>↓</button>
                        <button onClick={()=>removeCustomField(fid)}
                          style={{padding:"2px 6px",borderRadius:4,border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",cursor:"pointer",fontSize:10,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={saving}
            style={{width:"100%",padding:"12px",borderRadius:10,border:"none",
              background:saved?"#16a34a":saving?"#94a3b8":"#1e293b",
              color:"#fff",fontWeight:800,fontSize:14,cursor:saving?"not-allowed":"pointer",transition:"background 0.2s"}}>
            {saved?"✅ Settings Saved!":saving?"Saving...":"💾 Save All Settings"}
          </button>
        </div>

        {/* ════ RIGHT — LIVE PREVIEW ════ */}
        <div style={{position:"sticky",top:16}}>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden",boxShadow:"0 2px 16px rgba(0,0,0,0.08)"}}>

            {/* Preview header */}
            <div style={{background:"#1e293b",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{color:"#fff",fontWeight:800,fontSize:13}}>👁 Live Preview</div>
                <div style={{color:"#94a3b8",fontSize:10,marginTop:1}}>Settings change karo — turant update hoga</div>
              </div>
              {/* Full preview button */}
              <button onClick={()=>setFullPreview({...DEMO_ORDER,status:previewStatus})}
                style={{padding:"6px 14px",borderRadius:8,border:"1px solid #3b82f6",background:"#1d4ed820",
                  color:"#60a5fa",fontWeight:700,fontSize:11,cursor:"pointer"}}>
                🔍 Full Screen
              </button>
            </div>

            {/* Status tabs */}
            <div style={{display:"flex",gap:0,borderBottom:"1px solid #e2e8f0"}}>
              {STATUS_TABS.map(s=>(
                <button key={s.k} onClick={()=>setPreviewStatus(s.k)}
                  style={{flex:1,padding:"7px 4px",border:"none",borderBottom:`3px solid ${previewStatus===s.k?s.c:"transparent"}`,
                    background:previewStatus===s.k?`${s.c}10`:"#fff",
                    color:previewStatus===s.k?s.c:"#94a3b8",fontWeight:700,fontSize:9,cursor:"pointer",
                    whiteSpace:"nowrap",transition:"all 0.15s"}}>
                  {s.l}
                </button>
              ))}
            </div>

            {/* Live invoice preview */}
            <div style={{padding:"16px",background:"#f8fafc",overflow:"hidden"}}>
              <LivePreview settings={form} previewStatus={previewStatus}/>
            </div>

            {/* Hint */}
            <div style={{padding:"10px 16px",background:"#f0fdf4",borderTop:"1px solid #bbf7d0",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14}}>💡</span>
              <div style={{fontSize:10,color:"#15803d",fontWeight:600}}>
                Custom fields ka ↑↓ button dabao — preview mein position change dikh jaayega instantly
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full screen preview modal */}
      {fullPreview&&(
        <InvoiceModal
          order={{...fullPreview,status:previewStatus}}
          onClose={()=>setFullPreview(null)}
          viewerRole="admin"
        />
      )}
    </div>
  )
}
