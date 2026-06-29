import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"

const CHECKPOINTS = [
  { id: "cp1",  text: "Mujhe pata hai ki yeh action PERMANENT hai — koi undo nahi hoga" },
  { id: "cp2",  text: "Saare NON-ADMIN users delete ho jayenge (distributors, sellers, users)" },
  { id: "cp3",  text: "Saare orders permanently delete ho jayenge — koi record nahi bachega" },
  { id: "cp4",  text: "Saari commissions aur PPC wallet data delete ho jayegi" },
  { id: "cp5",  text: "Saare withdrawal requests delete ho jayenge" },
  { id: "cp6",  text: "Saare user join requests delete ho jayenge" },
  { id: "cp7",  text: "Saare products delete ho jayenge — store khali ho jayega" },
  { id: "cp8",  text: "Database se yeh data RECOVER nahi ho sakta — backup liya hua hai" },
  { id: "cp9",  text: "Mujhe samajh aa gaya ki admin account safe rahega — baaki sab ud jayega" },
  { id: "cp10", text: "Main apni zimmedari pe yeh action le raha/rahi hoon" },
  { id: "cp11", text: "Maine apni team ko inform kar diya hai is action ke baare mein" },
  { id: "cp12", text: "Main confirm karta/karti hoon ki yeh TEST action nahi hai — REAL delete hai" },
]

const TARGETS = [
  { id: "users",       label: "👥 Users (non-admin)",     color: "#dc2626", bg: "#fef2f2" },
  { id: "orders",      label: "🛒 Orders",                color: "#d97706", bg: "#fffbeb" },
  { id: "products",    label: "📦 Products",              color: "#7c3aed", bg: "#f5f3ff" },
  { id: "commissions", label: "💰 Commissions & PPC",    color: "#0891b2", bg: "#ecfeff" },
  { id: "withdrawals", label: "💸 Withdrawal Requests",  color: "#be185d", bg: "#fdf2f8" },
  { id: "requests",    label: "📋 User Join Requests",   color: "#047857", bg: "#ecfdf5" },
]

export default function AdminNukeData() {
  const { user } = useAuth()
  const [step, setStep]               = useState(1)   // 1=warning, 2=checkpoints, 3=targets, 4=confirm-text, 5=executing, 6=done
  const [checked, setChecked]         = useState({})
  const [targets, setTargets]         = useState({})
  const [confirmText, setConfirmText] = useState("")
  const [preview, setPreview]         = useState(null)
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState(null)
  const [error, setError]             = useState("")
  const [countdown, setCountdown]     = useState(0)

  // Admin guard
  if (!user || user.role !== "admin") {
    return <div style={{ padding:32, color:"#dc2626", fontWeight:700, fontSize:16 }}>❌ Sirf Admin access kar sakta hai</div>
  }

  const allChecked = CHECKPOINTS.every(cp => checked[cp.id])
  const anyTarget  = Object.values(targets).some(Boolean)
  const selectedTargets = TARGETS.filter(t => targets[t.id]).map(t => t.id)

  // Load preview when entering step 3
  useEffect(() => {
    if (step !== 3) return
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const res   = await fetch(`${import.meta.env.VITE_API_URL}/admin/nuke/preview`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setPreview(data)
      } catch { setPreview(null) }
    }
    load()
  }, [step])

  // Countdown on step 4
  useEffect(() => {
    if (step !== 4) return
    setCountdown(5)
    const iv = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { clearInterval(iv); return 0 }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [step])

  const handleNuke = async () => {
    if (confirmText !== "DELETE EVERYTHING") {
      setError("Exact text likho: DELETE EVERYTHING")
      return
    }
    setStep(5)
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res   = await fetch(`${import.meta.env.VITE_API_URL}/admin/nuke`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ confirmText, targets: selectedTargets })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || "Error"); setStep(4); return }
      setResult(data)
      setStep(6)
    } catch (e) {
      setError("Server error: " + e.message)
      setStep(4)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(1); setChecked({}); setTargets({})
    setConfirmText(""); setResult(null); setError(""); setPreview(null)
  }

  // ── Styles ──
  const S = {
    page:    { maxWidth:680, margin:"0 auto", padding:"24px 16px", fontFamily:"system-ui,sans-serif" },
    card:    { background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(0,0,0,0.08)", marginBottom:16 },
    btn:     (color, disabled) => ({
               display:"inline-flex", alignItems:"center", justifyContent:"center",
               padding:"12px 24px", borderRadius:10, border:"none", cursor:disabled?"not-allowed":"pointer",
               fontSize:14, fontWeight:700, background:disabled?"#e2e8f0":color,
               color:disabled?"#94a3b8":"#fff", width:"100%", opacity:disabled?0.7:1,
             }),
    check:   (done) => ({
               width:22, height:22, borderRadius:6, border:`2px solid ${done?"#16a34a":"#d1d5db"}`,
               background:done?"#16a34a":"#fff", cursor:"pointer",
               display:"flex", alignItems:"center", justifyContent:"center",
               flexShrink:0, transition:"all 0.15s",
             }),
    stepDot: (active, done) => ({
               width:32, height:32, borderRadius:"50%", display:"flex",
               alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700,
               background:done?"#16a34a":active?"#dc2626":"#f1f5f9",
               color:done||active?"#fff":"#94a3b8", flexShrink:0,
             }),
  }

  const steps = ["⚠️ Warning", "✅ Checkpoints", "🎯 Targets", "🔐 Confirm", "🔥 Execute"]

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#7f1d1d,#991b1b)", borderRadius:16, padding:"20px 24px", marginBottom:20, color:"#fff" }}>
        <div style={{ fontSize:28, marginBottom:6 }}>☢️</div>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800 }}>Data Purge Control</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, opacity:0.8 }}>Admin-only · Yeh action database se permanently delete karta hai</p>
      </div>

      {/* Step indicators */}
      {step < 6 && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
          {steps.map((label, i) => {
            const idx = i + 1
            const done   = step > idx
            const active = step === idx
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                <div style={S.stepDot(active, done)}>
                  {done ? "✓" : idx}
                </div>
                <span style={{ fontSize:11, fontWeight:active?700:500, color:active?"#dc2626":done?"#16a34a":"#94a3b8", whiteSpace:"nowrap" }}>
                  {label}
                </span>
                {i < steps.length - 1 && <div style={{ width:16, height:2, background:"#e2e8f0", flexShrink:0 }} />}
              </div>
            )
          })}
        </div>
      )}

      {/* ══ STEP 1: WARNING ══ */}
      {step === 1 && (
        <div style={S.card}>
          <div style={{ background:"#fef2f2", border:"2px solid #fca5a5", borderRadius:12, padding:20, marginBottom:20 }}>
            <div style={{ fontSize:20, marginBottom:8 }}>⛔ KHABARDAR</div>
            <p style={{ margin:0, fontSize:14, color:"#7f1d1d", fontWeight:600, lineHeight:1.6 }}>
              Yeh page database se data <strong>PERMANENTLY DELETE</strong> karta hai.<br/>
              Ek baar delete hone ke baad koi bhi data wapas nahi aayega.<br/>
              Sirf tabhi aage badho agar aap 100% sure ho.
            </p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {[
              "👥 Saare distributors, sellers, users permanently hat jayenge",
              "🛒 Saare orders ka koi record nahi bachega",
              "💰 Saari commissions aur PPC balance zero ho jayegi",
              "📦 Saare products store se hat jayenge",
              "💸 Saare withdrawal requests delete ho jayenge",
              "🔁 Admin account safe rahega — sirf baaki sab udega",
            ].map((txt, i) => (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:13, color:"#374151" }}>
                <span style={{ flexShrink:0 }}>•</span>
                <span>{txt}</span>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button style={{ ...S.btn("#6b7280", false), width:"auto", padding:"10px 20px", flex:1 }}
              onClick={() => window.history.back()}>
              ← Wapas jao
            </button>
            <button style={{ ...S.btn("#dc2626", false), flex:2 }}
              onClick={() => setStep(2)}>
              Samajh gaya — Aage badho ⚠️
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 2: CHECKPOINTS ══ */}
      {step === 2 && (
        <div style={S.card}>
          <h2 style={{ margin:"0 0 6px", fontSize:17, fontWeight:800, color:"#1e293b" }}>✅ Saare 12 Checkpoints Confirm Karo</h2>
          <p style={{ margin:"0 0 16px", fontSize:13, color:"#64748b" }}>
            Har ek checkbox pe click karo — padh ke samjho. Jab saare tick ho jayenge tabhi aage badh sakoge.
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {CHECKPOINTS.map((cp, i) => (
              <div key={cp.id} onClick={() => setChecked(p => ({ ...p, [cp.id]: !p[cp.id] }))}
                style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 14px",
                  borderRadius:10, cursor:"pointer",
                  background:checked[cp.id]?"#f0fdf4":"#f8fafc",
                  border:`1.5px solid ${checked[cp.id]?"#86efac":"#e2e8f0"}` }}>
                <div style={S.check(checked[cp.id])}>
                  {checked[cp.id] && <span style={{ fontSize:13, color:"#fff", fontWeight:900 }}>✓</span>}
                </div>
                <div>
                  <span style={{ fontSize:11, fontWeight:700, color:"#94a3b8" }}>#{i+1}</span>
                  <p style={{ margin:"2px 0 0", fontSize:13, color:"#1e293b", lineHeight:1.5 }}>{cp.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:allChecked?"#f0fdf4":"#f8fafc", borderRadius:10, padding:"12px 14px", marginBottom:16, border:`1px solid ${allChecked?"#86efac":"#e2e8f0"}`, fontSize:13, color:allChecked?"#15803d":"#94a3b8", fontWeight:600 }}>
            {allChecked ? "✅ Saare 12 checkpoints confirm ho gaye — aage badh sakte ho" : `⏳ ${CHECKPOINTS.filter(cp=>!checked[cp.id]).length} checkpoints baaki hain`}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button style={{ ...S.btn("#6b7280", false), flex:1, width:"auto" }} onClick={() => setStep(1)}>← Wapas</button>
            <button style={S.btn("#dc2626", !allChecked)} disabled={!allChecked} onClick={() => setStep(3)}>
              Aage Badho — Targets Select Karo →
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 3: SELECT TARGETS ══ */}
      {step === 3 && (
        <div style={S.card}>
          <h2 style={{ margin:"0 0 6px", fontSize:17, fontWeight:800, color:"#1e293b" }}>🎯 Kya Delete Karna Hai?</h2>
          <p style={{ margin:"0 0 16px", fontSize:13, color:"#64748b" }}>Sirf wahi select karo jo delete karna hai. Preview mein count dikhega.</p>

          {/* Select all */}
          <div onClick={() => {
            const allSelected = TARGETS.every(t => targets[t.id])
            const newState = {}
            TARGETS.forEach(t => { newState[t.id] = !allSelected })
            setTargets(newState)
          }} style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 14px", borderRadius:10, cursor:"pointer", background:"#fff7ed", border:"1.5px solid #fed7aa", marginBottom:12 }}>
            <div style={S.check(TARGETS.every(t=>targets[t.id]))}>
              {TARGETS.every(t=>targets[t.id]) && <span style={{fontSize:13,color:"#fff",fontWeight:900}}>✓</span>}
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:"#92400e" }}>⚠️ SABB KO SELECT KARO (Sabse Khatarnak)</span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {TARGETS.map(t => {
              const cnt = preview?.[t.id]?.count
              return (
                <div key={t.id} onClick={() => setTargets(p => ({ ...p, [t.id]: !p[t.id] }))}
                  style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px",
                    borderRadius:10, cursor:"pointer",
                    background:targets[t.id]?t.bg:"#f8fafc",
                    border:`1.5px solid ${targets[t.id]?t.color+"60":"#e2e8f0"}` }}>
                  <div style={S.check(targets[t.id])}>
                    {targets[t.id] && <span style={{ fontSize:13, color:"#fff", fontWeight:900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:14, flex:1 }}>{t.label}</span>
                  {cnt !== undefined && (
                    <span style={{ fontSize:12, fontWeight:700, padding:"2px 10px", borderRadius:99,
                      background:t.color+"15", color:t.color }}>
                      {cnt} records
                    </span>
                  )}
                  {cnt === undefined && <span style={{ fontSize:11, color:"#94a3b8" }}>Loading...</span>}
                </div>
              )
            })}
          </div>

          {anyTarget && (
            <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:13, color:"#7f1d1d", fontWeight:600 }}>
              ⚠️ {selectedTargets.length} categories select ki hain — yeh sab permanently delete ho jayengi
            </div>
          )}

          <div style={{ display:"flex", gap:12 }}>
            <button style={{ ...S.btn("#6b7280", false), flex:1, width:"auto" }} onClick={() => setStep(2)}>← Wapas</button>
            <button style={S.btn("#dc2626", !anyTarget)} disabled={!anyTarget} onClick={() => setStep(4)}>
              Aage — Final Confirmation →
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 4: TYPE CONFIRM ══ */}
      {step === 4 && (
        <div style={S.card}>
          <h2 style={{ margin:"0 0 6px", fontSize:17, fontWeight:800, color:"#1e293b" }}>🔐 Final Confirmation</h2>
          <p style={{ margin:"0 0 16px", fontSize:13, color:"#64748b" }}>Neeche exactly yeh text type karo (copy-paste kaam nahi karega jaisi feeling hai — dhyan se padho):</p>

          <div style={{ background:"#1e293b", borderRadius:10, padding:"14px 18px", marginBottom:16, textAlign:"center" }}>
            <span style={{ fontSize:18, fontWeight:900, color:"#f87171", letterSpacing:2, fontFamily:"monospace" }}>
              DELETE EVERYTHING
            </span>
          </div>

          <input
            value={confirmText}
            onChange={e => { setConfirmText(e.target.value); setError("") }}
            placeholder="Yahan type karo..."
            style={{ width:"100%", padding:"12px 14px", fontSize:15, fontWeight:600,
              border:`2px solid ${confirmText==="DELETE EVERYTHING"?"#16a34a":error?"#dc2626":"#e2e8f0"}`,
              borderRadius:10, outline:"none", boxSizing:"border-box",
              background:confirmText==="DELETE EVERYTHING"?"#f0fdf4":"#fff",
              fontFamily:"monospace", letterSpacing:1 }}
          />

          {error && <p style={{ color:"#dc2626", fontSize:12, fontWeight:600, margin:"8px 0 0" }}>❌ {error}</p>}
          {confirmText === "DELETE EVERYTHING" && <p style={{ color:"#16a34a", fontSize:12, fontWeight:600, margin:"8px 0 0" }}>✅ Sahi likha hai</p>}

          <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:10, padding:"14px", margin:"16px 0", fontSize:13 }}>
            <p style={{ margin:0, fontWeight:700, color:"#7f1d1d", marginBottom:8 }}>Delete hone wali cheezein:</p>
            {TARGETS.filter(t => targets[t.id]).map(t => (
              <div key={t.id} style={{ fontSize:12, color:"#991b1b", marginBottom:4 }}>
                🔴 {t.label} — {preview?.[t.id]?.count || "?"} records
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button style={{ ...S.btn("#6b7280", false), flex:1, width:"auto" }} onClick={() => setStep(3)}>← Wapas</button>
            <button
              style={S.btn("#7f1d1d", confirmText !== "DELETE EVERYTHING" || countdown > 0)}
              disabled={confirmText !== "DELETE EVERYTHING" || countdown > 0}
              onClick={handleNuke}>
              {countdown > 0 ? `⏳ ${countdown}s ruko...` : "☢️ PERMANENTLY DELETE KARO"}
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 5: EXECUTING ══ */}
      {step === 5 && (
        <div style={{ ...S.card, textAlign:"center", padding:"48px 24px" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🔥</div>
          <h2 style={{ margin:"0 0 8px", fontSize:18, color:"#7f1d1d" }}>Delete ho raha hai...</h2>
          <p style={{ color:"#94a3b8", fontSize:13 }}>Database se sab hata rahe hain — kripya wait karo</p>
          <div style={{ width:48, height:48, border:"4px solid #fca5a5", borderTop:"4px solid #dc2626", borderRadius:"50%", margin:"20px auto", animation:"spin 1s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* ══ STEP 6: DONE ══ */}
      {step === 6 && result && (
        <div style={S.card}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:48, marginBottom:8 }}>✅</div>
            <h2 style={{ margin:0, fontSize:18, color:"#1e293b" }}>Delete Complete</h2>
            <p style={{ color:"#64748b", fontSize:13, margin:"4px 0 0" }}>Neeche dekho kitna data delete hua</p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
            {Object.entries(result.deleted || {}).map(([key, count]) => {
              const target = TARGETS.find(t => t.id === key)
              return (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"10px 14px", borderRadius:10, background:target?.bg||"#f8fafc" }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{target?.label || key}</span>
                  <span style={{ fontSize:14, fontWeight:800, color:target?.color||"#64748b" }}>
                    {count} records deleted
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:13, color:"#15803d", fontWeight:600 }}>
            ✅ Admin account safe hai — aap login rehoge
          </div>

          <button style={S.btn("#1e293b", false)} onClick={reset}>
            ← Home pe Wapas Jao
          </button>
        </div>
      )}
    </div>
  )
}

