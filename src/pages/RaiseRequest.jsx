import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { getRoleLabel } from "../utils/roleLabels"
import { saveFormDraft, getFormDraft, clearFormDraft, hasFormDraft } from "../utils/formDraftManager"
import DraftBanner from "../components/DraftBanner"

/* ── Role config ── */
const RC = {
  admin:       { bg:"#f5f3ff", border:"#7c3aed", dot:"#7c3aed", icon:"👑", label:"Admin",       darkBg:"#2e1065", darkText:"#c4b5fd" },
  distributor: { bg:"#f0fdf4", border:"#16a34a", dot:"#16a34a", icon:"🏢", label:"Distributor", darkBg:"#052e16", darkText:"#86efac" },
  seller:      { bg:"#eff6ff", border:"#3b82f6", dot:"#3b82f6", icon:"🛒", label:"Seller",      darkBg:"#172554", darkText:"#93c5fd" },
  user:        { bg:"#f8fafc", border:"#94a3b8", dot:"#94a3b8", icon:"👤", label:"User",        darkBg:"#1e293b", darkText:"#cbd5e1" },
}
const getRC = (role) => RC[role] || RC.user
const RSORT = { distributor:0, seller:1, user:2, admin:3 }

/* ── What can each role create via referral ── */
const REF_ROLES = {
  admin:       ["distributor", "seller", "user"],
  distributor: ["distributor", "seller"],
  seller:      ["seller", "user"],
  user:        ["user"],
}

function LevelBadge({ level }) {
  const cfgs = [null,
    { bg:"#fef9c3", color:"#92400e", label:"L1" },
    { bg:"#dcfce7", color:"#166534", label:"L2" },
    { bg:"#dbeafe", color:"#1e40af", label:"L3" },
    { bg:"#fce7f3", color:"#9d174d", label:"L4" },
  ]
  const c = cfgs[level] || { bg:"#f1f5f9", color:"#475569", label:`L${level}` }
  return <span style={{ fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:99, background:c.bg, color:c.color, border:`1px solid ${c.color}33` }}>{c.label}</span>
}

function NetworkPicker({ downline, selected, onSelect }) {
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
    return <div style={{ padding:"20px", textAlign:"center", color:"#94a3b8", fontSize:13 }}>Aapke neeche koi member nahi hai</div>

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0", marginBottom:10 }}>
        <span style={{ color:"#94a3b8", fontSize:14 }}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Naam se search karo..."
          style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:13, color:"#334155" }} />
        {search && <button type="button" onClick={()=>setSearch("")} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:13 }}>✕</button>}
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
        {tabs.map(tab => {
          const isA = filter===tab.key
          const dot = tab.key==="all" ? "#64748b" : getRC(tab.key).dot
          return (
            <button key={tab.key} type="button" onClick={()=>setFilter(tab.key)}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:isA?700:500, cursor:"pointer",
                border:`1.5px solid ${isA?dot:"#e2e8f0"}`, background:isA?`${dot}15`:"#fff", color:isA?dot:"#64748b" }}>
              {tab.key!=="all" && <span style={{ width:6, height:6, borderRadius:"50%", background:isA?dot:"#94a3b8", display:"inline-block" }} />}
              {tab.label}
              <span style={{ fontSize:10, fontWeight:700, padding:"0 5px", borderRadius:99, background:isA?`${dot}20`:"#f1f5f9", color:isA?dot:"#94a3b8" }}>{tab.count}</span>
            </button>
          )
        })}
      </div>
      <div style={{ maxHeight:240, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
        <div onClick={()=>onSelect(null)}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:10, cursor:"pointer",
            border:`1.5px solid ${!selected?"#3b82f6":"#e2e8f0"}`, background:!selected?"#eff6ff":"#fff" }}>
          <span style={{ fontSize:16 }}>🧑‍💼</span>
          <span style={{ fontSize:13, fontWeight:600, color:!selected?"#1d4ed8":"#334155", flex:1 }}>Apne liye (default)</span>
          {!selected && <span style={{ fontSize:10, color:"#3b82f6", fontWeight:700 }}>✓ Selected</span>}
        </div>
        {shown.map(d => {
          const c = getRC(d.role)
          const isSel = selected?._id === d._id
          return (
            <div key={d._id} onClick={()=>onSelect(d)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:10, cursor:"pointer", transition:"all 0.12s",
                border:`1.5px solid ${isSel?c.border:"#e2e8f0"}`, background:isSel?c.bg:"#fff",
                paddingLeft:12+(d.level-1)*14 }}>
              {d.level > 1 && <span style={{ color:"#e2e8f0", fontSize:12 }}>└</span>}
              <span style={{ fontSize:14 }}>{c.icon}</span>
              <span style={{ fontSize:13, fontWeight:600, color:isSel?c.border:"#334155", flex:1 }}>{d.name}</span>
              <LevelBadge level={d.level} />
              <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:`${c.dot}15`, color:c.dot, border:`1px solid ${c.dot}30` }}>{c.label}</span>
              {isSel && <span style={{ fontSize:11, color:c.dot, fontWeight:700 }}>✓</span>}
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
  const { isDark } = useTheme()

  const DRAFT_KEY = "raise_request"
  const draft = getFormDraft(DRAFT_KEY, {})
  const [type, setType]               = useState(draft.type || "seller")
  const [emailName, setEmailName]     = useState(draft.emailName || "")
  const [emailDomain, setEmailDomain] = useState("@educa.com")
  const [domainLoading, setDomainLoading] = useState(false)
  const [freeEmail, setFreeEmail]     = useState(draft.freeEmail || "")
  const [loading, setLoading]         = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)
  const [generatedId, setGeneratedId] = useState("")
  const [name, setName]               = useState(draft.name || "")
  const [phone, setPhone]             = useState(draft.phone || "")
  const [address, setAddress]         = useState(draft.address || "")
  const [idType, setIdType]           = useState(draft.idType || "aadhar")
  const [idNumber, setIdNumber]       = useState(draft.idNumber || "")
  const [products, setProducts]       = useState([])
  const [productIds, setProductIds]   = useState(draft.productIds || [])
  const [assignAllProducts, setAssignAllProducts] = useState(draft.assignAllProducts || false)
  const [hasRestoredDraft, setHasRestoredDraft] = useState(() => hasFormDraft(DRAFT_KEY))

  // Auto-save draft on changes
  useEffect(() => {
    if (name || emailName || freeEmail || phone || address || idNumber) {
      saveFormDraft(DRAFT_KEY, {
        type, name, emailName, freeEmail, phone, address, idType, idNumber, productIds, assignAllProducts
      })
    }
  }, [type, name, emailName, freeEmail, phone, address, idType, idNumber, productIds, assignAllProducts])

  // Flush immediately on phone call / tab background
  useEffect(() => {
    const flush = () => {
      if (name || emailName || freeEmail || phone || address || idNumber) {
        saveFormDraft(DRAFT_KEY, {
          type, name, emailName, freeEmail, phone, address, idType, idNumber, productIds, assignAllProducts
        })
      }
    }
    window.addEventListener("pagehide", flush)
    window.addEventListener("beforeunload", flush)
    return () => {
      window.removeEventListener("pagehide", flush)
      window.removeEventListener("beforeunload", flush)
    }
  }, [type, name, emailName, freeEmail, phone, address, idType, idNumber, productIds, assignAllProducts])

  const handleClearDraft = () => {
    clearFormDraft(DRAFT_KEY)
    setName("")
    setEmailName("")
    setFreeEmail("")
    setPhone("")
    setAddress("")
    setIdNumber("")
    setProductIds([])
    setAssignAllProducts(false)
    setHasRestoredDraft(false)
  }

  // Network picker
  const canUsePicker = user?.role === "distributor" || user?.role === "seller"
  const [showPicker, setShowPicker]   = useState(false)
  const [onBehalfOf, setOnBehalfOf]   = useState(null)
  const [downline, setDownline]       = useState([])
  const [downlineLoading, setDownlineLoading] = useState(false)

  // Referral role selector
  const refRoles = REF_ROLES[user?.role] || ["user"]
  const [refRole, setRefRole] = useState(refRoles[0])

  const fullEmail = emailDomain ? `${emailName.trim()}${emailDomain}` : freeEmail.trim()
  const isValidEmail = (val) => val ? /^[^\s@]+@[^\s@]+/.test(val.trim()) : false

  const AADHAR_REGEX = /^[0-9]{12}$/
  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  const isValidIdNumber = () => {
    const v = idNumber.trim().toUpperCase()
    if (!v) return false
    return idType === "aadhar" ? AADHAR_REGEX.test(v) : PAN_REGEX.test(v)
  }

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

  useEffect(() => {
    const types = allowedTypes()
    if (!types.includes(type)) setType(types[0] || "seller")
  }, [onBehalfOf, user])

  const allowedTypes = () => {
    const myRole     = user?.role
    const behalfRole = onBehalfOf?.role
    if (myRole === "admin") return ["distributor", "seller", "user"]
    if (myRole === "distributor") {
      if (!onBehalfOf)                  return ["distributor", "seller"]
      if (behalfRole === "distributor") return ["distributor", "seller"]
      if (behalfRole === "seller")      return ["seller", "user"]
      if (behalfRole === "user")        return ["user"]
      return ["distributor", "seller"]
    }
    if (myRole === "seller") {
      if (!onBehalfOf)                  return ["seller", "user"]
      if (behalfRole === "seller")      return ["seller", "user"]
      if (behalfRole === "user")        return ["user"]
      return ["seller", "user"]
    }
    return ["user"]
  }

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
    if (!isValidIdNumber()) {
      alert(idType === "aadhar" ? "Aadhar number 12 digit ka hona chahiye" : "PAN number sahi format mein nahi hai (e.g. ABCDE1234F)")
      return
    }
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
          idType, idNumber: idNumber.trim().toUpperCase(),
          requestedForId: onBehalfOf?._id || null,
          productIds: user?.role === "admin" ? productIds : [],
          assignAllProducts: user?.role === "admin" ? assignAllProducts : false
        })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message || "Error"); return }
      clearFormDraft(DRAFT_KEY)
      setHasRestoredDraft(false)
      alert("Request sent to Admin ✅")
      setEmailName(""); setFreeEmail(""); setEmailExists(false)
      setName(""); setPhone(""); setAddress("")
      setIdType("aadhar"); setIdNumber("")
      setProductIds([]); setAssignAllProducts(false)
      setOnBehalfOf(null); setShowPicker(false)
    } catch { alert("Server error") }
    finally { setLoading(false) }
  }

  const isDisabled = loading || emailExists || emailChecking || !isValidEmail(fullEmail) || !isValidIdNumber()
  const selectedRC = onBehalfOf ? getRC(onBehalfOf.role) : null

  if (domainLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:200, color:"#94a3b8", fontSize:14, gap:8 }}>
      <span style={{ display:"inline-block", width:20, height:20, borderRadius:"50%", border:"2px solid #e2e8f0", borderTopColor:"#3b82f6", animation:"spin 0.8s linear infinite" }} />
      Loading...
    </div>
  )

  // ── Referral link ──
  const refLink = `${window.location.origin}?ref=${user?.name || ""}&createAs=${refRole}`
  const refRC = getRC(refRole)

  const copyLink = () => {
    navigator.clipboard.writeText(refLink)
      .then(() => alert("✅ Link copy ho gaya!"))
      .catch(() => alert("Manually copy karo:\n" + refLink))
  }
  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: "EDUCA VEDA — Join karo", text: `Is link se ${refRC.label} ban sakte ho`, url: refLink })
    } else {
      copyLink()
    }
  }

  // ── Theme tokens ──
  const card  = isDark ? { bg:"#0f172a", border:"#1e293b", text:"#f1f5f9", sub:"#94a3b8" }
                       : { bg:"#ffffff", border:"#e2e8f0", text:"#0f172a", sub:"#64748b" }
  const page  = isDark ? "#060a14" : "#f1f5f9"
  const input = isDark ? { bg:"#1e293b", border:"#334155", text:"#f1f5f9", placeholder:"#475569" }
                       : { bg:"#f8fafc", border:"#e2e8f0", text:"#0f172a", placeholder:"#94a3b8" }

  const InputStyle = {
    width:"100%", padding:"10px 14px", borderRadius:10, fontSize:13, fontWeight:500,
    background:input.bg, border:`1.5px solid ${input.border}`, color:input.text,
    outline:"none", boxSizing:"border-box", transition:"border-color 0.15s",
    fontFamily:"inherit"
  }
  const LabelStyle = {
    display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.06em",
    textTransform:"uppercase", color:card.sub, marginBottom:6
  }

  return (
    <div style={{ minHeight:"100vh", background:page, padding:"24px 16px 60px", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ maxWidth:520, margin:"0 auto", display:"flex", flexDirection:"column", gap:16 }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom:4 }}>
          <h1 style={{ fontSize:22, fontWeight:800, color:card.text, margin:0, letterSpacing:"-0.02em" }}>
            Naya User Banao
          </h1>
          <p style={{ fontSize:13, color:card.sub, margin:"4px 0 0", lineHeight:1.5 }}>
            Admin ko request bhejo — approved hone ke baad account ban jayega
          </p>
        </div>

        {/* ══════════════════════════════════════
            REFERRAL LINK CARD
        ══════════════════════════════════════ */}
        <div style={{ background:card.bg, border:`1.5px solid ${card.border}`, borderRadius:16, padding:"18px 20px", boxShadow: isDark?"none":"0 1px 4px #0000000a" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <span style={{ fontSize:18 }}>🔗</span>
            <span style={{ fontSize:14, fontWeight:800, color:card.text, letterSpacing:"-0.01em" }}>Referral Link Share Karo</span>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:card.sub, marginBottom:8 }}>
              Kiska link share karna hai?
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {refRoles.map(r => {
                const rc = getRC(r)
                const isActive = refRole === r
                return (
                  <button key={r} type="button" onClick={() => setRefRole(r)}
                    style={{
                      display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:99,
                      fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
                      border:`1.5px solid ${isActive ? rc.border : (isDark?"#334155":"#e2e8f0")}`,
                      background: isActive ? (isDark ? rc.darkBg : `${rc.dot}12`) : (isDark?"#1e293b":"#f8fafc"),
                      color: isActive ? (isDark ? rc.darkText : rc.dot) : card.sub,
                      boxShadow: isActive ? `0 0 0 3px ${rc.dot}20` : "none"
                    }}>
                    <span>{rc.icon}</span>
                    {rc.label}
                    {isActive && <span style={{ fontSize:10 }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Info text */}
          <div style={{ fontSize:12, color:card.sub, marginBottom:12, lineHeight:1.6, padding:"10px 12px", borderRadius:10, background: isDark?"#1e293b":"#f8fafc", border:`1px solid ${isDark?"#334155":"#e2e8f0"}` }}>
            Aap <span style={{ fontWeight:700, color: isDark ? refRC.darkText : refRC.dot }}>{getRC(user?.role).icon} {getRC(user?.role).label}</span> ke roop mein share kar rahe ho
            {" → "} is link se <span style={{ fontWeight:700, color: isDark ? refRC.darkText : refRC.dot }}>{refRC.icon} {refRC.label}</span> ban sakta hai
          </div>

          {/* Link display */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background: isDark?"#0f172a":"#f1f5f9", border:`1px solid ${isDark?"#334155":"#e2e8f0"}`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
            <span style={{ flex:1, fontSize:11, color:card.sub, fontFamily:"'SF Mono',monospace", wordBreak:"break-all", lineHeight:1.5 }}>{refLink}</span>
          </div>

          {/* Buttons */}
          <div style={{ display:"flex", gap:8 }}>
            <button type="button" onClick={copyLink}
              style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", background: isDark ? refRC.darkText : refRC.dot, color: isDark ? "#000" : "#fff", fontWeight:700, fontSize:12, cursor:"pointer", transition:"opacity 0.15s", letterSpacing:"0.03em" }}>
              📋 Copy Link
            </button>
            <button type="button" onClick={shareLink}
              style={{ flex:1, padding:"10px 0", borderRadius:10, border:`1.5px solid ${isDark ? refRC.darkText : refRC.dot}`, background:"transparent", color: isDark ? refRC.darkText : refRC.dot, fontWeight:700, fontSize:12, cursor:"pointer", letterSpacing:"0.03em" }}>
              📤 Share
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════
            REQUEST FORM CARD
        ══════════════════════════════════════ */}
        <form onSubmit={handleSubmit}
          style={{ background:card.bg, border:`1.5px solid ${card.border}`, borderRadius:16, padding:"20px", boxShadow: isDark?"none":"0 1px 4px #0000000a", display:"flex", flexDirection:"column", gap:18 }}>

          <div>
            <h2 style={{ fontSize:16, fontWeight:800, color:card.text, margin:0, letterSpacing:"-0.01em" }}>Request Form</h2>
            <p style={{ fontSize:12, color:card.sub, margin:"3px 0 0" }}>Admin approve karega tab account create hoga</p>
          </div>

          {hasRestoredDraft && (
            <DraftBanner
              onClear={handleClearDraft}
              message="Restored your request form details from previous session."
            />
          )}

          {/* ── NETWORK PICKER ── */}
          {canUsePicker && (
            <div>
              <label style={LabelStyle}>👥 Kiske liye request hai?</label>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flex:1,
                  padding:"10px 14px", borderRadius:10, border:`1.5px solid ${onBehalfOf ? selectedRC.border : (isDark?"#334155":"#3b82f6")}`,
                  background: onBehalfOf ? (isDark ? onBehalfOf && getRC(onBehalfOf.role).darkBg : selectedRC.bg) : (isDark?"#172554":"#eff6ff"),
                  cursor:"pointer" }} onClick={() => !showPicker && setShowPicker(true)}>
                  <span style={{ fontSize:16 }}>{onBehalfOf ? selectedRC.icon : "🧑‍💼"}</span>
                  <span style={{ fontSize:13, fontWeight:600, color: onBehalfOf ? (isDark ? selectedRC.darkText : selectedRC.border) : (isDark?"#93c5fd":"#1d4ed8"), flex:1 }}>
                    {onBehalfOf ? onBehalfOf.name : "Apne liye (default)"}
                  </span>
                  {onBehalfOf && (
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99,
                      background:`${selectedRC.dot}20`, color:selectedRC.dot, border:`1px solid ${selectedRC.dot}30` }}>
                      {selectedRC.label}
                    </span>
                  )}
                </div>
                <button type="button" onClick={()=>setShowPicker(p=>!p)}
                  style={{ marginLeft:8, padding:"10px 14px", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer",
                    border:`1.5px solid ${showPicker?(isDark?"#f87171":"#ef4444"):(isDark?"#334155":"#e2e8f0")}`,
                    background: showPicker?(isDark?"#450a0a":"#fef2f2"):(isDark?"#1e293b":"#f8fafc"),
                    color:showPicker?(isDark?"#f87171":"#ef4444"):(isDark?"#94a3b8":"#64748b") }}>
                  {showPicker ? "✕" : "🔽"}
                </button>
              </div>
              {showPicker && (
                <div style={{ border:`1.5px solid ${isDark?"#334155":"#e2e8f0"}`, borderRadius:12, padding:14, background: isDark?"#1e293b":"#fff", boxShadow:"0 4px 20px #0002" }}>
                  {downlineLoading ? (
                    <div style={{ textAlign:"center", padding:"20px", color:"#94a3b8", fontSize:13 }}>⏳ Loading...</div>
                  ) : (
                    <NetworkPicker downline={downline} selected={onBehalfOf} callerRole={user?.role}
                      onSelect={(d) => { setOnBehalfOf(d); setShowPicker(false) }} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TYPE ── */}
          <div>
            <label style={LabelStyle}>
              {onBehalfOf ? `${onBehalfOf.name} ke liye kya banana hai` : "Kya banana hai"}
            </label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {allowedTypes().map(t => {
                const rc = getRC(t)
                const isA = type === t
                return (
                  <button key={t} type="button" onClick={() => setType(t)}
                    style={{ flex:1, minWidth:90, padding:"10px 8px", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
                      border:`1.5px solid ${isA ? rc.border : (isDark?"#334155":"#e2e8f0")}`,
                      background: isA ? (isDark ? rc.darkBg : `${rc.dot}10`) : (isDark?"#1e293b":"#f8fafc"),
                      color: isA ? (isDark ? rc.darkText : rc.dot) : card.sub,
                      display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <span>{rc.icon}</span> {rc.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── NAME ── */}
          <div>
            <label style={LabelStyle}>Full Name</label>
            <input style={InputStyle} placeholder="Poora naam likho"
              value={name} onChange={e=>setName(e.target.value)} />
            {generatedId && (
              <div style={{ marginTop:6, fontSize:11, color:card.sub }}>
                System ID: <span style={{ fontFamily:"monospace", color:isDark?"#93c5fd":"#3b82f6", fontWeight:700 }}>{generatedId}</span>
                <span style={{ marginLeft:4, color:card.sub }}>(auto-assigned)</span>
              </div>
            )}
          </div>

          {/* ── EMAIL ── */}
          <div>
            <label style={LabelStyle}>
              Email
              {emailDomain && (
                <span style={{ marginLeft:8, fontSize:10, background:isDark?"#172554":"#dbeafe", color:isDark?"#93c5fd":"#2563eb", padding:"1px 8px", borderRadius:99, fontWeight:700, textTransform:"none", letterSpacing:0 }}>
                  Domain: {emailDomain}
                </span>
              )}
            </label>
            <div style={{ display:"flex", alignItems:"center", borderRadius:10, overflow:"hidden", border:`1.5px solid ${emailExists?(isDark?"#f87171":"#ef4444"):input.border}`, background:input.bg }}>
              <input style={{ flex:1, padding:"10px 14px", border:"none", outline:"none", background:"transparent", fontSize:13, color:input.text, fontFamily:"inherit" }}
                placeholder="sirf naam (e.g. john)"
                value={emailName} onChange={e=>setEmailName(e.target.value.replace(/\s|@/g,""))} />
              <span style={{ padding:"10px 14px", background:isDark?"#334155":"#f1f5f9", color:card.sub, fontSize:12, fontWeight:700, borderLeft:`1px solid ${isDark?"#475569":"#e2e8f0"}` }}>
                {emailDomain || "@educa.com"}
              </span>
            </div>
            {emailDomain && emailName && (
              <div style={{ marginTop:5, fontSize:11, color:card.sub }}>📧 <b style={{color:card.text}}>{fullEmail}</b></div>
            )}
            {isValidEmail(fullEmail) && emailChecking && (
              <div style={{ marginTop:5, fontSize:11, color:card.sub }}>🔄 Checking...</div>
            )}
            {isValidEmail(fullEmail) && !emailChecking && emailExists && (
              <div style={{ marginTop:5, fontSize:11, color:isDark?"#f87171":"#dc2626", fontWeight:600 }}>❌ Already registered</div>
            )}
            {isValidEmail(fullEmail) && !emailChecking && !emailExists && (
              <div style={{ marginTop:5, fontSize:11, color:isDark?"#4ade80":"#16a34a", fontWeight:600 }}>✅ Available</div>
            )}
          </div>

          {/* ── PHONE ── */}
          <div>
            <label style={LabelStyle}>Phone Number</label>
            <input style={InputStyle} placeholder="10 digit mobile number"
              value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} maxLength={10} />
          </div>

          {/* ── ADDRESS ── */}
          <div>
            <label style={LabelStyle}>Address</label>
            <textarea style={{...InputStyle, resize:"vertical", lineHeight:1.6}} placeholder="Poora address likho"
              rows={3} value={address} onChange={e=>setAddress(e.target.value)} />
          </div>

          {/* ── AADHAR / PAN ── */}
          <div>
            <label style={LabelStyle}>Identity Proof <span style={{ color:"#ef4444" }}>*</span></label>
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              {["aadhar","pan"].map(t => (
                <button key={t} type="button" onClick={()=>{ setIdType(t); setIdNumber("") }}
                  style={{ flex:1, padding:"9px 0", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
                    border:`1.5px solid ${idType===t?(isDark?"#93c5fd":"#3b82f6"):(isDark?"#334155":"#e2e8f0")}`,
                    background: idType===t?(isDark?"#172554":"#eff6ff"):(isDark?"#1e293b":"#f8fafc"),
                    color: idType===t?(isDark?"#93c5fd":"#2563eb"):card.sub }}>
                  {t === "aadhar" ? "🪪 Aadhar" : "💳 PAN"}
                </button>
              ))}
            </div>
            <input style={InputStyle}
              placeholder={idType === "aadhar" ? "12 digit Aadhar number" : "e.g. ABCDE1234F"}
              value={idNumber}
              maxLength={idType === "aadhar" ? 12 : 10}
              onChange={e => {
                const v = idType === "aadhar"
                  ? e.target.value.replace(/\D/g,"").slice(0,12)
                  : e.target.value.toUpperCase().slice(0,10)
                setIdNumber(v)
              }} />
            {idNumber && !isValidIdNumber() && (
              <div style={{ marginTop:5, fontSize:11, color:isDark?"#f87171":"#dc2626", fontWeight:600 }}>
                {idType === "aadhar" ? "❌ 12 digit hona chahiye" : "❌ Format sahi nahi (e.g. ABCDE1234F)"}
              </div>
            )}
            {idNumber && isValidIdNumber() && (
              <div style={{ marginTop:5, fontSize:11, color:isDark?"#4ade80":"#16a34a", fontWeight:600 }}>✅ Sahi format</div>
            )}
            <div style={{ marginTop:6, fontSize:11, color:card.sub, lineHeight:1.5 }}>
              Aadhar ya PAN — koi ek zaroori hai, unique hona chahiye
            </div>
          </div>

          {/* ── PRODUCTS (admin only) ── */}
          {user?.role === "admin" && products.length > 0 && (
            <div style={{ border:`1.5px solid ${isDark?"#334155":"#e2e8f0"}`, borderRadius:12, padding:14, background: isDark?"#1e293b":"#f8fafc" }}>
              <div style={{ fontSize:13, fontWeight:700, color:card.text, marginBottom:10 }}>📦 Assign Products</div>
              <label style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10, cursor:"pointer", fontSize:13, color:card.sub }}>
                <input type="checkbox" checked={assignAllProducts}
                  onChange={e=>{ setAssignAllProducts(e.target.checked); setProductIds(e.target.checked ? products.map(p=>p._id) : []) }} />
                Sab products assign karo
              </label>
              {!assignAllProducts && (
                <div style={{ maxHeight:160, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                  {products.map(p => (
                    <label key={p._id} style={{ display:"flex", gap:8, alignItems:"center", cursor:"pointer", fontSize:12, color:card.text }}>
                      <input type="checkbox" checked={productIds.includes(p._id)}
                        onChange={()=>setProductIds(prev=>prev.includes(p._id)?prev.filter(id=>id!==p._id):[...prev,p._id])} />
                      {p.title} — <span style={{ color:isDark?"#4ade80":"#16a34a", fontWeight:700 }}>₹{p.price}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SUBMIT ── */}
          <button type="submit" disabled={isDisabled}
            style={{ width:"100%", padding:"13px 0", borderRadius:12, border:"none", fontWeight:800, fontSize:14, letterSpacing:"0.02em",
              cursor: isDisabled ? "not-allowed" : "pointer", transition:"all 0.2s",
              background: isDisabled ? (isDark?"#1e293b":"#e2e8f0") : "linear-gradient(135deg,#3b82f6,#2563eb)",
              color: isDisabled ? card.sub : "#fff",
              boxShadow: isDisabled ? "none" : "0 4px 14px #3b82f640" }}>
            {loading ? "⏳ Sending..." : "Send Request →"}
          </button>
        </form>
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )
}
