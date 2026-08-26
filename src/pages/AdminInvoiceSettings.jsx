import { useState, useEffect, useRef } from "react"
import InvoiceModal from "../components/InvoiceModal"
import InlineLoader from "../components/InlineLoader"

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
  distributorNote:"Approved — order verified", distributorNoteVisible:true,
  adminNote:"Final confirmed", adminNoteVisible:true,
}

/* ── Mini inline invoice preview ── */
function LivePreview({ settings, previewStatus }) {
  const order = { ...DEMO_ORDER, status: previewStatus }
  const meta  = {
    pending:       { type:"PROFORMA INVOICE",        badge:"PENDING",   badgeBg:"#fff7ed", badgeColor:"#c2410c", watermark:"PROFORMA"    },
    dist_approved: { type:"ACKNOWLEDGEMENT INVOICE",  badge:"STAGE 1",  badgeBg:"#eff6ff", badgeColor:"#1d4ed8", watermark:"ACKNOWLEDGED" },
    confirmed:     { type:"TAX INVOICE",              badge:"CONFIRMED", badgeBg:"#f0fdf4", badgeColor:"#15803d", watermark:"CONFIRMED"    },
    rejected:      { type:"CANCELLATION NOTICE",      badge:"CANCELLED", badgeBg:"#fef2f2", badgeColor:"#dc2626", watermark:"CANCELLED"   },
  }[previewStatus]

  const items     = order.items||[]
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

        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-30deg)",
          fontSize:60,fontWeight:900,opacity:0.05,color:headerBg,pointerEvents:"none",whiteSpace:"nowrap",userSelect:"none",zIndex:0}}>
          {meta.watermark}
        </div>

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

        {/* Parties */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:`1px solid ${border}`}}>
          <div style={{padding:"14px 16px",borderRight:`1px solid ${border}`}}>
            <div style={{fontSize:7,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>Bill To</div>
            <div style={{fontWeight:800,fontSize:12,color:"#1e293b"}}>{order.customerName}</div>
            <div style={{fontSize:9,color:"#64748b",marginTop:3}}>📞 {order.phone}</div>
            <div style={{fontSize:8,color:"#64748b",marginTop:2}}>📍 {order.address}</div>

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
          </div>

          <div style={{padding:"14px 16px",borderRight:`1px solid ${border}`}}>
            <div style={{fontSize:7,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>Fulfillment Partner</div>
            <div style={{fontWeight:800,fontSize:12,color:"#1e293b"}}>{order.sellerId?.name}</div>
            <div style={{fontSize:9,color:"#64748b",marginTop:3}}>✉️ {order.sellerId?.email}</div>
          </div>

          <div style={{padding:"14px 16px"}}>
            <div style={{fontSize:7,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>Distributor Hub</div>
            <div style={{fontWeight:800,fontSize:12,color:"#1e293b"}}>{order.distributorId?.name}</div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{padding:"12px 16px"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
            <thead>
              <tr style={{background:"#f8fafc",borderBottom:`1.5px solid ${border}`}}>
                <th style={{padding:"6px 8px",textAlign:"left",color:"#64748b",fontWeight:700}}>Item</th>
                <th style={{padding:"6px 8px",textAlign:"center",color:"#64748b",fontWeight:700}}>Qty</th>
                <th style={{padding:"6px 8px",textAlign:"right",color:"#64748b",fontWeight:700}}>Price</th>
                <th style={{padding:"6px 8px",textAlign:"right",color:"#64748b",fontWeight:700}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${border}`}}>
                  <td style={{padding:"6px 8px",color:"#1e293b",fontWeight:600}}>{it.title}</td>
                  <td style={{padding:"6px 8px",textAlign:"center",color:"#64748b"}}>{it.qty}</td>
                  <td style={{padding:"6px 8px",textAlign:"right",color:"#64748b"}}>₹{fmt(it.price)}</td>
                  <td style={{padding:"6px 8px",textAlign:"right",color:"#1e293b",fontWeight:700}}>₹{fmt(it.price*it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{textAlign:"right",marginTop:8,fontSize:12,fontWeight:900,color:headerBg}}>
            Total: ₹{fmt(order.total)}
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"10px 16px",background:"#f8fafc",borderTop:`1px solid ${border}`,fontSize:9,color:"#64748b",textAlign:"center"}}>
          {settings?.footer || "Thank you for your business!"}
        </div>
      </div>
    </div>
  )
}

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
  const [fullPreview,setFullPreview] = useState(null)
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
    if(!file.type.startsWith("image/")){alert("Please upload a valid image file");return}
    if(file.size>500*1024){alert("Logo file must be under 500KB");return}
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
    if(!newField.label.trim()||!newField.value.trim()){alert("Both Label and Value are required");return}
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
    <div>
      <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-stone-300 mb-1.5">{label}</label>
      <input type={type} value={form[key]||""} placeholder={ph}
        onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
        className="w-full p-2.5 bg-black/40 text-white rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#fbbf24] font-medium"
      />
    </div>
  )

  if(loading)return <InlineLoader minHeight={180} />

  const STATUS_TABS=[
    {k:"pending",       l:"🟠 Proforma",      c:"#c2410c"},
    {k:"dist_approved", l:"🔵 Acknowledged",   c:"#1d4ed8"},
    {k:"confirmed",     l:"🟢 Tax Invoice",    c:"#15803d"},
    {k:"rejected",      l:"🔴 Cancelled",      c:"#dc2626"},
  ]

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">

      {/* ── HEADER ── */}
      <div className="bg-[#121814] p-5 sm:p-6 rounded-3xl border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ INVOICE & TAX ENGINE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Invoice Customization & Header Settings
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Configure company branding, GST, custom fields, and real-time live preview for downloadable invoices.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 whitespace-nowrap disabled:opacity-50"
        >
          {saved ? "✅ Saved Successfully!" : saving ? "Saving..." : "💾 Save Invoice Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">

        {/* ════ LEFT — SETTINGS ════ */}
        <div className="space-y-5">

          {/* Company Info */}
          <div className="bg-[#111713] p-5 sm:p-6 rounded-3xl border border-white/[0.08] space-y-3.5 shadow-md">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#fbbf24] flex items-center gap-2">
              <span>🏢</span> Corporate Entity Information
            </h2>
            <div className="space-y-3">
              {inp("Company Legal Name *","companyName","text","Your Company Pvt. Ltd.")}
              {inp("Brand Tagline","tagline","text","Empowering Education and Commerce")}
              {inp("Registered Address","address","text","123, Business Park, City - 400001")}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inp("Support Phone","phone","text","+91 98765 43210")}
                {inp("Corporate Email","email","email","billing@company.com")}
              </div>
              {inp("GST / Tax ID Number","gst","text","27ABCDE1234F1Z5")}
            </div>
          </div>

          {/* Logo */}
          <div className="bg-[#111713] p-5 sm:p-6 rounded-3xl border border-white/[0.08] space-y-3.5 shadow-md">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#fbbf24] flex items-center gap-2">
              <span>🖼️</span> Brand Logo & Display
            </h2>
            <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
              {[{k:"upload",l:"📁 Upload File"},{k:"url",l:"🔗 Remote URL"}].map(t=>(
                <button
                  key={t.k}
                  onClick={()=>setLogoMode(t.k)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    logoMode===t.k ? "bg-white text-black font-black" : "text-stone-400 hover:text-white"
                  }`}
                >
                  {t.l}
                </button>
              ))}
            </div>

            {logoMode==="upload" ? (
              <div>
                <div
                  onClick={()=>logoRef.current?.click()}
                  className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center cursor-pointer bg-black/30 hover:border-[#fbbf24] transition-all"
                >
                  <div className="text-2xl mb-1">📁</div>
                  <div className="text-xs font-bold text-white">Click to upload company logo</div>
                  <div className="text-[10px] text-stone-500 font-mono mt-1">PNG, JPG, SVG · Max 500KB</div>
                  <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden"/>
                </div>

                {logoPreview && logoPreview.startsWith("data:") && (
                  <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                    <img src={logoPreview} alt="Logo" className="max-h-10 max-w-16 rounded bg-white p-1"/>
                    <div className="flex-1 text-xs font-bold text-emerald-300">✅ Logo loaded</div>
                    <button
                      onClick={()=>{setForm(p=>({...p,logo:"",showLogo:false}));setLogoPreview("")}}
                      className="px-2.5 py-1 rounded-lg bg-red-950/50 text-red-300 border border-red-500/30 text-xs font-bold cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={form.logo.startsWith?.("data:")?"":form.logo||""}
                  onChange={e=>{setForm(p=>({...p,logo:e.target.value}));setLogoPreview(e.target.value)}}
                  placeholder="https://yoursite.com/logo.png"
                  className="w-full p-2.5 bg-black/40 text-white rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#fbbf24] font-medium"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-stone-300 font-bold text-xs cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={!!form.showLogo}
                onChange={e=>setForm(p=>({...p,showLogo:e.target.checked}))}
                className="rounded border-white/20 bg-black/50 text-[#fbbf24]"
              />
              Display logo on invoice headers
            </label>
          </div>

          {/* Theme + Footer */}
          <div className="bg-[#111713] p-5 sm:p-6 rounded-3xl border border-white/[0.08] space-y-3.5 shadow-md">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#fbbf24] flex items-center gap-2">
              <span>🎨</span> Theme Palette & Terms
            </h2>

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-stone-300 mb-1.5">Header Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.themeColor||"#1e293b"}
                  onChange={e=>setForm(p=>({...p,themeColor:e.target.value}))}
                  className="w-10 h-9 p-1 rounded-xl bg-black/40 border border-white/10 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.themeColor||"#1e293b"}
                  onChange={e=>setForm(p=>({...p,themeColor:e.target.value}))}
                  className="flex-1 p-2 bg-black/40 text-white text-xs font-mono rounded-xl border border-white/10"
                />
                <div className="flex gap-1">
                  {["#1e293b","#065f46","#7c3aed","#dc2626","#1e40af","#92400e","#0f766e"].map(c=>(
                    <div
                      key={c}
                      onClick={()=>setForm(p=>({...p,themeColor:c}))}
                      className="w-6 h-6 rounded-lg cursor-pointer border"
                      style={{background:c, borderColor: form.themeColor===c ? "#fff" : "transparent"}}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-stone-300 mb-1.5">Footer Note</label>
              <textarea
                value={form.footer||""}
                onChange={e=>setForm(p=>({...p,footer:e.target.value}))}
                rows={2}
                className="w-full p-2.5 bg-black/40 text-white rounded-xl border border-white/10 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-stone-300 mb-1.5">Terms & Conditions</label>
              <textarea
                value={form.terms||""}
                onChange={e=>setForm(p=>({...p,terms:e.target.value}))}
                rows={2}
                className="w-full p-2.5 bg-black/40 text-white rounded-xl border border-white/10 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Custom Fields */}
          <div className="bg-[#111713] p-5 sm:p-6 rounded-3xl border border-white/[0.08] space-y-3.5 shadow-md">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#fbbf24] flex items-center gap-2">
              <span>➕</span> Custom Header / Footer Fields
            </h2>

            <div className="p-3 bg-black/40 rounded-2xl border border-white/[0.06] space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newField.label}
                  onChange={e=>setNewField(p=>({...p,label:e.target.value}))}
                  placeholder="Label (e.g. PO No.)"
                  className="p-2 bg-[#121814] text-white text-xs rounded-xl border border-white/10"
                />
                <input
                  value={newField.value}
                  onChange={e=>setNewField(p=>({...p,value:e.target.value}))}
                  placeholder="Value (e.g. PO-2026-01)"
                  className="p-2 bg-[#121814] text-white text-xs rounded-xl border border-white/10"
                />
              </div>

              <div className="flex gap-2 items-center">
                <select
                  value={newField.position}
                  onChange={e=>setNewField(p=>({...p,position:e.target.value}))}
                  className="flex-1 p-2 bg-[#121814] text-white text-xs font-bold rounded-xl border border-white/10"
                >
                  <option value="top">🔼 Above Items Table</option>
                  <option value="bottom">🔽 Below Items Table</option>
                </select>
                <button
                  onClick={addCustomField}
                  className="px-4 py-2 rounded-xl bg-white text-black font-black text-xs uppercase cursor-pointer"
                >
                  Add Field
                </button>
              </div>
            </div>

            {form.customFields.map((f)=>{
              const fid=f.id||f.label
              return (
                <div key={fid} className="flex items-center gap-2 p-2.5 bg-black/40 rounded-xl border border-white/[0.06] text-xs">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    f.position==="bottom" ? "bg-purple-500/20 text-purple-300" : "bg-sky-500/20 text-sky-300"
                  }`}>
                    {f.position==="bottom" ? "↓ Bot" : "↑ Top"}
                  </span>
                  <div className="flex-1 truncate">
                    <span className="font-bold text-white">{f.label}:</span>
                    <span className="text-stone-400 ml-1.5">{f.value}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={()=>moveField(fid,"up")} className="p-1 rounded bg-white/10 text-stone-300 text-[10px]">↑</button>
                    <button onClick={()=>moveField(fid,"down")} className="p-1 rounded bg-white/10 text-stone-300 text-[10px]">↓</button>
                    <button onClick={()=>removeCustomField(fid)} className="p-1 rounded bg-red-950 text-red-300 text-[10px]">✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ════ RIGHT — LIVE PREVIEW ════ */}
        <div className="sticky top-20">
          <div className="bg-[#111713] rounded-3xl border border-white/[0.08] overflow-hidden shadow-2xl space-y-0">
            <div className="p-4 bg-black/60 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-white uppercase">👁️ Real-Time Invoice Rendering</div>
                <div className="text-[10px] text-stone-400 font-mono mt-0.5">Live synchronizing with editor inputs</div>
              </div>

              <button
                onClick={()=>setFullPreview({...DEMO_ORDER,status:previewStatus})}
                className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold uppercase cursor-pointer hover:bg-sky-500/30"
              >
                🔍 Full Preview
              </button>
            </div>

            {/* Status tabs */}
            <div className="flex border-b border-white/[0.08] overflow-x-auto no-scrollbar">
              {STATUS_TABS.map(s=>(
                <button
                  key={s.k}
                  onClick={()=>setPreviewStatus(s.k)}
                  className={`flex-1 py-2 px-3 text-[10px] font-mono font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 ${
                    previewStatus===s.k
                      ? "border-[#fbbf24] text-white bg-white/[0.04]"
                      : "border-transparent text-stone-500 hover:text-stone-300"
                  }`}
                >
                  {s.l}
                </button>
              ))}
            </div>

            <div className="p-4 bg-[#0a0d0b]">
              <LivePreview settings={form} previewStatus={previewStatus}/>
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
