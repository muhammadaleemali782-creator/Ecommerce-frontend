import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { getRoleLabel } from "../utils/roleLabels"

/* ── Role config ── */
const RC = {
  admin:       { bg:"#f5f3ff", border:"#7c3aed", dot:"#7c3aed", icon:"👑",  label:"Admin" },
  distributor: { bg:"#f0fdf4", border:"#16a34a", dot:"#16a34a", icon:"🏢",  label:"Distributor" },
  seller:      { bg:"#eff6ff", border:"#3b82f6", dot:"#3b82f6", icon:"🛒",  label:"Seller" },
  user:        { bg:"#f8fafc", border:"#94a3b8", dot:"#94a3b8", icon:"👤",  label:"User" },
}
const getRC   = (role) => RC[role] || RC.user
const RSORT   = { distributor:0, seller:1, user:2, admin:3 }

function LevelBadge({ level }) {
  const cfgs = [null,
    { bg:"#fef9c3", color:"#92400e", label:"L1" },
    { bg:"#dcfce7", color:"#166534", label:"L2" },
    { bg:"#dbeafe", color:"#1e40af", label:"L3" },
    { bg:"#fce7f3", color:"#9d174d", label:"L4" },
  ]
  const c = cfgs[level] || { bg:"#f1f5f9", color:"#475569", label:`L${level}` }
  return <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99, background:c.bg, color:c.color, border:`1px solid ${c.color}22` }}>{c.label}</span>
}

function NetworkPicker({ downline, selected, onSelect, callerRole }) {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const tabs = useMemo(() => {
    const roles = [...new Set(downline.map(d => d.role))].sort((a,b)=>(RSORT[a]??9)-(RSORT[b]??9))
    return [
      { key:"all", label:"Sabhi", count: downline.length },
      ...roles.map(r => ({ key:r, label: getRC(r).label+"s", count: downline.filter(d=>d.role===r).length }))
    ]
  }, [downline])

  const shown = useMemo(() => {
    const q = search.toLowerCase()
    return downline
      .filter(d => (filter==="all" || d.role===filter) && (!q || d.name.toLowerCase().includes(q)))
      .sort((a,b)=>(RSORT[a.role]??9)-(RSORT[b.role]??9) || a.level-b.level)
  }, [downline, filter, search])

  if (downline.length === 0)
    return <div style={{ padding:"16px", textAlign:"center", color:"#94a3b8", fontSize:13 }}>Aapke neeche koi member nahi hai</div>

  return (
    <div>
      {/* Search */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0", marginBottom:10 }}>
        <span style={{ color:"#94a3b8" }}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name..."
          style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:13, color:"#334155" }} />
        {search && <button type="button" onClick={()=>setSearch("")} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:12 }}>✕</button>}
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
        {tabs.map(tab => {
          const isA = filter===tab.key
          const dot = tab.key==="all" ? "#64748b" : getRC(tab.key).dot
          return (
            <button key={tab.key} type="button" onClick={()=>setFilter(tab.key)}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:99, fontSize:12, fontWeight:isA?700:500, cursor:"pointer",
                border:`1.5px solid ${isA?dot:"#e2e8f0"}`, background:isA?`${dot}12`:"#fff", color:isA?dot:"#64748b",
                boxShadow:isA?`0 0 0 2px ${dot}22`:"none" }}>
              {tab.key!=="all" && <span style={{ width:7, height:7, borderRadius:"50%", background:isA?dot:"#94a3b8", display:"inline-block" }} />}
              {tab.label}
              <span style={{ fontSize:10, fontWeight:700, padding:"0 5px", borderRadius:99, background:isA?`${dot}20`:"#f1f5f9", color:isA?dot:"#94a3b8" }}>{tab.count}</span>
            </button>
          )
        })}
      </div>

      {/* List */}
      <div style={{ maxHeight:260, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
        {/* Apne liye — distributor ke liye bhi show karo (woh apne liye dist/seller bana sakta hai) */}
        <div onClick={()=>onSelect(null)}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:9, cursor:"pointer",
            border:`1.5px solid ${!selected?"#3b82f6":"#e2e8f0"}`, background:!selected?"#eff6ff":"#fff" }}>
          <span style={{ fontSize:16 }}>🧑‍💼</span>
          <span style={{ fontSize:13, fontWeight:600, color:!selected?"#1d4ed8":"#334155", flex:1 }}>Apne liye (default)</span>
          {!selected && <span style={{ fontSize:10, color:"#3b82f6", fontWeight:700 }}>✓ Selected</span>}
        </div>

        {shown.map(d => {
          const c = getRC(d.role)
          const isSel = selected?._id === d._id
          // No one is disabled — sab ke liye select karna allowed
          // Type dropdown mein hi restriction lagegi
          const isDisabled = false

          return (
            <div key={d._id}
              onClick={() => !isDisabled && onSelect(d)}
              title={isDisabled ? "Distributor ke liye request nahi kar sakte" : ""}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:9,
                cursor: isDisabled ? "not-allowed" : "pointer", transition:"all 0.12s",
                border:`1.5px solid ${isDisabled?"#e2e8f0":isSel?c.border:"#e2e8f0"}`,
                background: isDisabled?"#f8fafc":isSel?c.bg:"#fff",
                opacity: isDisabled ? 0.45 : 1,
                paddingLeft:12+(d.level-1)*14 }}>
              {d.level > 1 && <span style={{ color:"#e2e8f0", fontSize:12 }}>└</span>}
              <span style={{ fontSize:13, filter:isDisabled?"grayscale(1)":"none" }}>{c.icon}</span>
              <span style={{ fontSize:13, fontWeight:600, color:isDisabled?"#94a3b8":isSel?c.border:"#334155", flex:1 }}>{d.name}</span>
              <LevelBadge level={d.level} />
              {isDisabled ? (
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99,
                  background:"#f1f5f9", color:"#94a3b8", border:"1px solid #e2e8f0" }}>🚫 N/A</span>
              ) : (
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99,
                  background:`${c.dot}15`, color:c.dot, border:`1px solid ${c.dot}30` }}>{c.label}</span>
              )}
              {isSel && !isDisabled && <span style={{ fontSize:11, color:c.dot, fontWeight:700 }}>✓</span>}
            </div>
          )
        })}
        {shown.length===0 && <div style={{ textAlign:"center", padding:"16px", color:"#94a3b8", fontSize:12 }}>Koi nahi mila</div>}
      </div>
    </div>
  )
}

/* ── Main ── */
export default function RaiseUserRequest() {
  const { user } = useAuth()

  const [type, setType]               = useState("seller")
  const [emailName, setEmailName]     = useState("")
  const [emailDomain, setEmailDomain] = useState("")
  const [domainLoading, setDomainLoading] = useState(true)
  const [freeEmail, setFreeEmail]     = useState("")
  const [loading, setLoading]         = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)
  const [generatedId, setGeneratedId] = useState("")
  const [name, setName]               = useState("")
  const [phone, setPhone]             = useState("")
  const [address, setAddress]         = useState("")
  const [products, setProducts]       = useState([])
  const [productIds, setProductIds]   = useState([])
  const [assignAllProducts, setAssignAllProducts] = useState(false)

  // Network picker
  const canUsePicker = user?.role === "distributor" || user?.role === "seller"
  const [showPicker, setShowPicker]   = useState(false)
  const [onBehalfOf, setOnBehalfOf]   = useState(null)
  const [downline, setDownline]       = useState([])
  const [downlineLoading, setDownlineLoading] = useState(false)

  const fullEmail = emailDomain ? `${emailName.trim()}${emailDomain}` : freeEmail.trim()
  const isValidEmail = (val) => val ? /^[^\s@]+@[^\s@]+/.test(val.trim()) : false

  // Load domain
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings/email-domain`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setEmailDomain(data.domain || "")
      } catch {}
      setDomainLoading(false)
    }
    load()
  }, [])

  // Load downline when picker opens
  useEffect(() => {
    if (!showPicker || !canUsePicker || downline.length > 0) return
    const load = async () => {
      try {
        setDownlineLoading(true)
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/my-downline`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setDownline(Array.isArray(data.downline) ? data.downline : [])
      } catch {}
      finally { setDownlineLoading(false) }
    }
    load()
  }, [showPicker, canUsePicker])

  // Auto-set type based on selected member
  useEffect(() => {
    const types = allowedTypes()
    // Agar current type allowed nahi hai to pehla allowed type set karo
    if (!types.includes(type)) setType(types[0] || "seller")
  }, [onBehalfOf, user])

  // ══════════════════════════════════════════════════
  // SAHI RULES — behalf ki role ke hisaab se:
  //
  // Distributor:
  //   apne liye (no selection) → distributor, seller
  //   neeche distributor       → distributor, seller
  //   neeche seller            → seller, user
  //   neeche user              → user
  //
  // Seller:
  //   apne liye / neeche seller → seller, user
  //   neeche user               → user
  //
  // User:
  //   apne liye / kisi ke liye  → user
  //
  // Admin → sab kuch
  // ══════════════════════════════════════════════════
  const allowedTypes = () => {
    const myRole     = user?.role
    const behalfRole = onBehalfOf?.role   // undefined = apne liye

    if (myRole === "admin") return ["distributor", "seller", "user"]

    if (myRole === "distributor") {
      if (!onBehalfOf)                    return ["distributor", "seller"]  // apne liye
      if (behalfRole === "distributor")   return ["distributor", "seller"]  // dist ke liye
      if (behalfRole === "seller")        return ["seller", "user"]          // seller ke liye
      if (behalfRole === "user")          return ["user"]                    // user ke liye
      return ["distributor", "seller"]
    }

    if (myRole === "seller") {
      if (!onBehalfOf)                    return ["seller", "user"]  // apne liye
      if (behalfRole === "seller")        return ["seller", "user"]  // seller ke liye
      if (behalfRole === "user")          return ["user"]            // user ke liye
      return ["seller", "user"]
    }

    if (myRole === "user") {
      return ["user"]  // sirf user — hamesha
    }

    return ["user"]
  }

  // Load products (admin only)
  useEffect(() => {
    if (user?.role !== "admin") return
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/products/all`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (Array.isArray(data)) setProducts(data)
      } catch {}
    }
    load()
  }, [user])

  // Auto ID
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/generate-id?type=${type}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data?.id) setGeneratedId(data.id)
      } catch {}
    }
    load()
  }, [type])

  // Email check
  useEffect(() => {
    setEmailExists(false)
    if (!isValidEmail(fullEmail)) return
    const timer = setTimeout(async () => {
      setEmailChecking(true)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/check-email?email=${encodeURIComponent(fullEmail)}`)
        const data = await res.json()
        setEmailExists(data.exists)
      } catch {}
      setEmailChecking(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [emailName, freeEmail, emailDomain])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { alert("Name missing"); return }
    if (!isValidEmail(fullEmail)) { alert("Valid email likho"); return }
    try {
      const chkRes = await fetch(`${import.meta.env.VITE_API_URL}/check-email?email=${encodeURIComponent(fullEmail)}`)
      const chkData = await chkRes.json()
      if (chkData.exists) { alert("❌ Email already registered!"); setEmailExists(true); return }
    } catch { alert("Email check failed"); return }
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/requests/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type, name, email: fullEmail, phone, address, generatedId,
          requestedForId: onBehalfOf?._id || null,
          productIds: user?.role === "admin" ? productIds : [],
          assignAllProducts: user?.role === "admin" ? assignAllProducts : false
        })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message || "Error"); return }
      alert("Request sent to Admin ✅")
      setEmailName(""); setFreeEmail(""); setEmailExists(false)
      setName(""); setPhone(""); setAddress("")
      setProductIds([]); setAssignAllProducts(false)
      setOnBehalfOf(null); setShowPicker(false)
    } catch { alert("Server error") }
    finally { setLoading(false) }
  }

  const isDisabled = loading || emailExists || emailChecking || !isValidEmail(fullEmail)
  const selectedRC = onBehalfOf ? getRC(onBehalfOf.role) : null

  if (domainLoading) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md space-y-4">
      <h2 className="font-bold text-xl">Request New User</h2>

      {/* ── NETWORK PICKER ── */}
      {canUsePicker && (
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>👥 Kiske liye request hai?</span>
            <button type="button" onClick={()=>setShowPicker(p=>!p)}
              style={{ fontSize:12, padding:"4px 12px", borderRadius:99, border:`1.5px solid ${showPicker?"#ef4444":"#3b82f6"}`,
                background:showPicker?"#fff":"#3b82f6", color:showPicker?"#ef4444":"#fff", cursor:"pointer", fontWeight:600 }}>
              {showPicker ? "✕ Band karo" : "🔽 Select karo"}
            </button>
          </div>

          {/* Selected display */}
          {!showPicker && (
            <div style={{ padding:"8px 12px", borderRadius:9, border:`1.5px solid ${onBehalfOf?selectedRC.border:"#3b82f6"}`,
              background:onBehalfOf?selectedRC.bg:"#eff6ff", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:16 }}>{onBehalfOf?selectedRC.icon:"🧑‍💼"}</span>
              <span style={{ fontSize:13, fontWeight:600, color:onBehalfOf?selectedRC.border:"#1d4ed8" }}>
                {onBehalfOf ? onBehalfOf.name : "Apne liye (default)"}
              </span>
              {onBehalfOf && (
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99,
                  background:`${selectedRC.dot}15`, color:selectedRC.dot, border:`1px solid ${selectedRC.dot}30` }}>
                  {selectedRC.label}
                </span>
              )}
            </div>
          )}

          {/* Picker dropdown */}
          {showPicker && (
            <div style={{ border:"1.5px solid #e2e8f0", borderRadius:12, padding:12, background:"#fff", boxShadow:"0 4px 20px #0001" }}>
              {downlineLoading ? (
                <div style={{ textAlign:"center", padding:"20px", color:"#94a3b8", fontSize:13 }}>⏳ Loading...</div>
              ) : (
                <NetworkPicker
                  downline={downline}
                  selected={onBehalfOf}
                  callerRole={user?.role}
                  onSelect={(d) => { setOnBehalfOf(d); setShowPicker(false) }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TYPE ── */}
      <div>
        {onBehalfOf && (
          <p className="text-xs text-gray-500 mb-1">
            <b>{onBehalfOf.name}</b> ke liye kya banana hai:
          </p>
        )}

        <select className="border p-2 w-full rounded" value={type} onChange={e=>setType(e.target.value)}
          disabled={allowedTypes().length === 0}>
          {allowedTypes().length === 0 ? (
            <option>— Allowed nahi —</option>
          ) : (
            allowedTypes().map(t => (
              <option key={t} value={t}>{getRoleLabel(t)}</option>
            ))
          )}
        </select>
      </div>

      {/* ── NAME ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
        <input className="border p-2 w-full rounded" placeholder="Apna poora naam likho"
          value={name} onChange={e=>setName(e.target.value)} />
        {generatedId && (
          <p className="text-xs text-gray-400 mt-1">
            System ID: <span className="font-mono text-blue-600">{generatedId}</span> (auto-assigned)
          </p>
        )}
      </div>

      {/* ── EMAIL ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Email
          {emailDomain && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-normal">
              Domain: {emailDomain}
            </span>
          )}
        </label>
        {emailDomain ? (
          <div className="flex items-center border rounded overflow-hidden">
            <input className="flex-1 p-2 outline-none text-sm" placeholder="sirf naam likho (e.g. john)"
              value={emailName} onChange={e=>setEmailName(e.target.value.replace(/\s|@/g,""))} />
            <span className="bg-gray-100 text-gray-500 px-3 py-2 text-sm border-l font-medium">{emailDomain}</span>
          </div>
        ) : (
          <input className="border p-2 w-full rounded text-sm" placeholder="Full email (e.g. abc@gmail.com)"
            value={freeEmail} onChange={e=>setFreeEmail(e.target.value)} />
        )}
        {emailDomain && emailName && <p className="text-xs text-gray-500 mt-1">📧 Full: <b>{fullEmail}</b></p>}
        {isValidEmail(fullEmail) && emailChecking && <p className="text-xs text-gray-400 mt-1">🔄 Checking...</p>}
        {isValidEmail(fullEmail) && !emailChecking && emailExists && <p className="text-xs text-red-500 mt-1 font-medium">❌ Already registered</p>}
        {isValidEmail(fullEmail) && !emailChecking && !emailExists && <p className="text-xs text-green-600 mt-1">✅ Available</p>}
      </div>

      {/* ── PHONE ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">Phone Number</label>
        <input className="border p-2 w-full rounded" placeholder="Mobile number likho"
          value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} maxLength={10} />
      </div>

      {/* ── ADDRESS ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">Address</label>
        <textarea className="border p-2 w-full rounded text-sm" placeholder="Poora address likho"
          rows={3} value={address} onChange={e=>setAddress(e.target.value)} />
      </div>

      {/* ── PRODUCTS (admin only) ── */}
      {user?.role === "admin" && products.length > 0 && (
        <div className="border p-3 rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Assign Products</h3>
          <label className="flex gap-2 items-center mb-2">
            <input type="checkbox" checked={assignAllProducts}
              onChange={e=>{ setAssignAllProducts(e.target.checked); setProductIds(e.target.checked ? products.map(p=>p._id) : []) }} />
            Assign ALL Products
          </label>
          {!assignAllProducts && (
            <div className="max-h-40 overflow-auto border p-2 rounded space-y-1">
              {products.map(p => (
                <label key={p._id} className="flex gap-2 items-center text-sm">
                  <input type="checkbox" checked={productIds.includes(p._id)}
                    onChange={()=>setProductIds(prev=>prev.includes(p._id)?prev.filter(id=>id!==p._id):[...prev,p._id])} />
                  {p.title} ₹{p.price}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUBMIT ── */}
      <button type="submit" disabled={isDisabled}
        className={`w-full py-2 rounded text-white font-medium transition ${
          isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}>
        {loading ? "Sending..." : "Send Request"}
      </button>
    </form>
  )
}
