import React, { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import { getRoleLabel } from "../utils/roleLabels"
import EducaLogo from "../components/EducaLogo"
import { saveFormDraft, getFormDraft, clearFormDraft, hasFormDraft } from "../utils/formDraftManager"
import DraftBanner from "../components/DraftBanner"

export default function JoinRequest({ setPage }) {
  const { isDark } = useTheme()
  const searchParams = new URLSearchParams(window.location.search)
  const refCode = searchParams.get("ref") || ""
  const rawRole = searchParams.get("createAs") || searchParams.get("role") || "seller"

  const [referrer, setReferrer] = useState(null)
  const [refLoading, setRefLoading] = useState(true)
  const [refError, setRefError] = useState("")
  const [lockedRole, setLockedRole] = useState(rawRole.toLowerCase())

  // Form states with draft support
  const DRAFT_KEY = "join_request"
  const draft = getFormDraft(DRAFT_KEY, {})
  const [name, setName] = useState(draft.name || "")
  const [emailName, setEmailName] = useState(draft.emailName || "")
  const [emailDomain, setEmailDomain] = useState("@educa.com")
  const [phone, setPhone] = useState(draft.phone || "")
  const [address, setAddress] = useState(draft.address || "")
  const [idType, setIdType] = useState(draft.idType || "aadhar")
  const [idNumber, setIdNumber] = useState(draft.idNumber || "")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)
  const [hasRestoredDraft, setHasRestoredDraft] = useState(() => hasFormDraft(DRAFT_KEY))

  // Auto-save draft on changes
  useEffect(() => {
    if (name || emailName || phone || address || idNumber) {
      saveFormDraft(DRAFT_KEY, { name, emailName, phone, address, idType, idNumber })
    }
  }, [name, emailName, phone, address, idType, idNumber])

  // Immediate flush on phone call / tab background
  useEffect(() => {
    const flush = () => {
      if (name || emailName || phone || address || idNumber) {
        saveFormDraft(DRAFT_KEY, { name, emailName, phone, address, idType, idNumber })
      }
    }
    window.addEventListener("pagehide", flush)
    window.addEventListener("beforeunload", flush)
    return () => {
      window.removeEventListener("pagehide", flush)
      window.removeEventListener("beforeunload", flush)
    }
  }, [name, emailName, phone, address, idType, idNumber])

  const handleClearDraft = () => {
    clearFormDraft(DRAFT_KEY)
    setName("")
    setEmailName("")
    setPhone("")
    setAddress("")
    setIdNumber("")
    setHasRestoredDraft(false)
  }

  const fullEmail = emailName.trim() ? `${emailName.trim()}${emailDomain || "@educa.com"}` : ""
  const isValidEmail = (val) => Boolean(val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))

  const AADHAR_REGEX = /^[0-9]{12}$/
  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  const isValidIdNumber = () => {
    const v = idNumber.trim().toUpperCase()
    if (!v) return false
    return idType === "aadhar" ? AADHAR_REGEX.test(v) : PAN_REGEX.test(v)
  }

  // Fetch referrer info & domain
  useEffect(() => {
    let active = true

    const loadData = async () => {
      if (!refCode) {
        if (active) {
          setRefError("Referral code missing hai. Kripya kisi distributor ya seller ke invite link se aaiye.")
          setRefLoading(false)
        }
        return
      }

      try {
        setRefLoading(true)
        const [refRes, domainRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/requests/referral-info?ref=${encodeURIComponent(refCode)}`),
          fetch(`${import.meta.env.VITE_API_URL}/settings/email-domain`).catch(() => null)
        ])

        const refData = await refRes.json()
        if (domainRes && domainRes.ok) {
          const domainData = await domainRes.json()
          if (domainData?.domain) setEmailDomain(domainData.domain)
        }

        if (!active) return

        if (!refRes.ok || !refData.valid) {
          setRefError(refData.message || "Invalid ya inactive referral link.")
        } else {
          setReferrer(refData.referrer)
          // Ensure locked role is one of allowed roles
          if (refData.allowedRoles && !refData.allowedRoles.includes(lockedRole)) {
            setLockedRole(refData.allowedRoles[0] || "seller")
          }
        }
      } catch (err) {
        if (active) setRefError("Network error: Referrer verify nahi ho saka.")
      } finally {
        if (active) setRefLoading(false)
      }
    }

    loadData()
    return () => { active = false }
  }, [refCode])

  // Email availability check
  useEffect(() => {
    setEmailExists(false)
    if (!isValidEmail(fullEmail)) return
    const timer = setTimeout(async () => {
      setEmailChecking(true)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/check-email?email=${encodeURIComponent(fullEmail)}`)
        const data = await res.json()
        setEmailExists(Boolean(data.exists))
      } catch {}
      setEmailChecking(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [fullEmail])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { alert("Kripya poora naam likhiye"); return }
    if (!isValidEmail(fullEmail)) { alert("Kripya valid email address likhiye"); return }
    if (!isValidIdNumber()) {
      alert(idType === "aadhar" ? "Aadhar number 12 digit ka hona chahiye" : "PAN number invalid hai (e.g. ABCDE1234F)")
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/requests/public-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref: refCode,
          type: lockedRole,
          name: name.trim(),
          email: fullEmail,
          phone: phone.trim(),
          address: address.trim(),
          idType,
          idNumber: idNumber.trim().toUpperCase()
        })
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.message || "Request submit karne me error aaya")
        return
      }

      clearFormDraft(DRAFT_KEY)
      setHasRestoredDraft(false)
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      alert("Server se connect nahi ho saka. Kripya dobara koshish karein.")
    } finally {
      setSubmitting(false)
    }
  }

  // Design Tokens
  const card = isDark
    ? { bg: "#0f172a", border: "#1e293b", text: "#f8fafc", sub: "#94a3b8" }
    : { bg: "#ffffff", border: "#e2e8f0", text: "#0f172a", sub: "#64748b" }
  const pageBg = isDark ? "#060a14" : "#f8fafc"
  const inputBg = isDark ? "#1e293b" : "#f8fafc"
  const inputBorder = isDark ? "#334155" : "#e2e8f0"
  const inputText = isDark ? "#f8fafc" : "#0f172a"

  const roleBadgeColor = lockedRole === "distributor"
    ? { bg: "bg-sky-500/15", border: "border-sky-500/30", text: "text-sky-600 dark:text-sky-300", icon: "🏢", label: "Distributor" }
    : lockedRole === "seller"
      ? { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-300", icon: "🛒", label: "Seller" }
      : { bg: "bg-violet-500/15", border: "border-violet-500/30", text: "text-violet-600 dark:text-violet-300", icon: "👤", label: "User" }

  const InputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500,
    background: inputBg, border: `1.5px solid ${inputBorder}`, color: inputText,
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
    fontFamily: "inherit"
  }
  const LabelStyle = {
    display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", color: card.sub, marginBottom: 6
  }

  // Loading Screen
  if (refLoading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #3b82f6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: card.sub }}>Invite link verify ho raha hai...</span>
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    )
  }

  // Error Screen
  if (refError) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 440, width: "100%", background: card.bg, border: `1.5px solid ${card.border}`, borderRadius: 20, padding: 28, textAlign: "center" }}>
          <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>⚠️</span>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: card.text, margin: "0 0 8px" }}>Link Invalid ya Expired</h2>
          <p style={{ fontSize: 13, color: card.sub, margin: "0 0 20px", lineHeight: 1.6 }}>{refError}</p>
          <button type="button" onClick={() => setPage("home")}
            style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  // Submitted Success Screen
  if (submitted) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 460, width: "100%", background: card.bg, border: `1.5px solid ${card.border}`, borderRadius: 24, padding: "32px 24px", textAlign: "center", boxShadow: isDark ? "none" : "0 10px 30px #0000000a" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", color: "#15803d", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            ✓
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: card.text, margin: "0 0 8px" }}>Registration Request Submitted!</h2>
          <p style={{ fontSize: 13, color: card.sub, margin: "0 0 20px", lineHeight: 1.6 }}>
            Aapka registration form <b>Admin review</b> ke liye bhej diya gaya hai. Admin dwara approve hone ke baad aapka account active ho jayega.
          </p>

          <div style={{ background: isDark ? "#1e293b" : "#f8fafc", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, borderRadius: 14, padding: 14, textAlign: "left", marginBottom: 24, fontSize: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: card.sub }}>Invited By:</span>
              <span style={{ fontWeight: 700, color: card.text }}>{referrer?.name} ({referrer?.fullName})</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: card.sub }}>Applied Role:</span>
              <span style={{ fontWeight: 700, color: "#2563eb", textTransform: "capitalize" }}>{roleBadgeColor.icon} {roleBadgeColor.label}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: card.sub }}>Name:</span>
              <span style={{ fontWeight: 700, color: card.text }}>{name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: card.sub }}>Email:</span>
              <span style={{ fontWeight: 700, color: card.text }}>{fullEmail}</span>
            </div>
          </div>

          <button type="button" onClick={() => setPage("home")}
            style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Return to Store
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: pageBg, padding: "20px 16px 60px", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "10px 0" }}>
          <EducaLogo size={42} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: isDark ? "#fbbf24" : "#b45309" }}>
              EDUCA-VEDA
            </span>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: isDark ? "#94a3b8" : "#64748b" }}>
              WE GIVE RESULTS NOT PROMISES
            </span>
          </div>
        </div>

        {/* ── REFERRAL VERIFIED BANNER ── */}
        <div style={{ background: card.bg, border: `1.5px solid ${card.border}`, borderRadius: 18, padding: "16px 18px", boxShadow: isDark ? "none" : "0 2px 10px #00000008" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, shrink: 0 }}>
              {(referrer?.name || "U")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: card.sub }}>
                Invited by {referrer?.role?.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: card.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {referrer?.name} <span style={{ fontSize: 12, fontWeight: 500, color: card.sub }}>({referrer?.fullName})</span>
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 99, background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }}>
              VERIFIED LINK
            </span>
          </div>

          {/* Locked Role Notification */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: isDark ? "#1e293b" : "#f1f5f9", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
            <span style={{ fontSize: 15 }}>🔒</span>
            <div style={{ fontSize: 12, color: card.text, flex: 1 }}>
              Joining as: <b style={{ textTransform: "capitalize" }}>{roleBadgeColor.icon} {roleBadgeColor.label}</b>
              <span style={{ display: "block", fontSize: 10, color: card.sub, marginTop: 1 }}>
                Role invite link dwara set hai aur change nahi ho sakta
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleBadgeColor.bg} ${roleBadgeColor.border} ${roleBadgeColor.text}`}>
              LOCKED
            </span>
          </div>
        </div>

        {/* ── REGISTRATION FORM ── */}
        <form onSubmit={handleSubmit}
          style={{ background: card.bg, border: `1.5px solid ${card.border}`, borderRadius: 20, padding: 22, display: "flex", flexDirection: "column", gap: 16, boxShadow: isDark ? "none" : "0 2px 12px #00000008" }}>

          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: card.text, margin: 0, letterSpacing: "-0.01em" }}>
              Enter Your Details
            </h2>
            <p style={{ fontSize: 12, color: card.sub, margin: "3px 0 0" }}>
              Admin approval ke baad aapka account create hoga
            </p>
          </div>

          {hasRestoredDraft && (
            <DraftBanner
              onClear={handleClearDraft}
              message="Restored your application details from previous session."
            />
          )}

          {/* Full Name */}
          <div>
            <label style={LabelStyle}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input style={InputStyle} placeholder="Apna poora naam likho" required
              value={name} onChange={e => setName(e.target.value)} />
          </div>

          {/* Email */}
          <div>
            <label style={LabelStyle}>
              Email <span style={{ color: "#ef4444" }}>*</span>
              {emailDomain && (
                <span style={{ marginLeft: 6, fontSize: 10, background: isDark ? "#172554" : "#dbeafe", color: isDark ? "#93c5fd" : "#2563eb", padding: "1px 6px", borderRadius: 99, fontWeight: 700, textTransform: "none" }}>
                  Domain: {emailDomain}
                </span>
              )}
            </label>
            <div style={{ display: "flex", alignItems: "center", borderRadius: 10, overflow: "hidden", border: `1.5px solid ${emailExists ? "#ef4444" : inputBorder}`, background: inputBg }}>
              <input style={{ flex: 1, padding: "11px 14px", border: "none", outline: "none", background: "transparent", fontSize: 13, color: inputText, fontFamily: "inherit" }}
                placeholder="sirf username likho (e.g. rahul)" required
                value={emailName} onChange={e => setEmailName(e.target.value.replace(/\s|@/g, ""))} />
              <span style={{ padding: "11px 14px", background: isDark ? "#334155" : "#f1f5f9", color: card.sub, fontSize: 13, fontWeight: 700, borderLeft: `1px solid ${isDark ? "#475569" : "#e2e8f0"}` }}>
                {emailDomain || "@educa.com"}
              </span>
            </div>
            {emailName && <div style={{ marginTop: 4, fontSize: 11, color: card.sub }}>📧 Full Email: <b style={{ color: card.text }}>{fullEmail}</b></div>}
            {isValidEmail(fullEmail) && emailChecking && <div style={{ marginTop: 4, fontSize: 11, color: card.sub }}>🔄 Email check ho raha hai...</div>}
            {isValidEmail(fullEmail) && !emailChecking && emailExists && <div style={{ marginTop: 4, fontSize: 11, color: "#ef4444", fontWeight: 700 }}>❌ Ye email already registered hai</div>}
            {isValidEmail(fullEmail) && !emailChecking && !emailExists && <div style={{ marginTop: 4, fontSize: 11, color: "#16a34a", fontWeight: 700 }}>✅ Email available hai</div>}
          </div>

          {/* Phone */}
          <div>
            <label style={LabelStyle}>Phone Number <span style={{ color: "#ef4444" }}>*</span></label>
            <input style={InputStyle} placeholder="10 digit mobile number" type="tel" required
              value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} />
          </div>

          {/* Address */}
          <div>
            <label style={LabelStyle}>Address</label>
            <textarea style={{ ...InputStyle, resize: "vertical", lineHeight: 1.5 }} placeholder="Apna pura address likho"
              rows={2} value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          {/* Identity Proof */}
          <div>
            <label style={LabelStyle}>Identity Proof <span style={{ color: "#ef4444" }}>*</span></label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {["aadhar", "pan"].map(t => (
                <button key={t} type="button" onClick={() => { setIdType(t); setIdNumber("") }}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                    border: `1.5px solid ${idType === t ? (isDark ? "#93c5fd" : "#3b82f6") : inputBorder}`,
                    background: idType === t ? (isDark ? "#172554" : "#eff6ff") : (isDark ? "#1e293b" : "#f8fafc"),
                    color: idType === t ? (isDark ? "#93c5fd" : "#2563eb") : card.sub
                  }}>
                  {t === "aadhar" ? "🪪 Aadhar Card" : "💳 PAN Card"}
                </button>
              ))}
            </div>
            <input style={InputStyle}
              placeholder={idType === "aadhar" ? "12 digit Aadhar number" : "e.g. ABCDE1234F"}
              value={idNumber}
              maxLength={idType === "aadhar" ? 12 : 10}
              onChange={e => {
                const v = idType === "aadhar"
                  ? e.target.value.replace(/\D/g, "").slice(0, 12)
                  : e.target.value.toUpperCase().slice(0, 10)
                setIdNumber(v)
              }} />
            {idNumber && !isValidIdNumber() && (
              <div style={{ marginTop: 4, fontSize: 11, color: "#ef4444", fontWeight: 700 }}>
                {idType === "aadhar" ? "❌ Aadhar 12 digit ka hona chahiye" : "❌ Format sahi nahi hai (e.g. ABCDE1234F)"}
              </div>
            )}
            {idNumber && isValidIdNumber() && (
              <div style={{ marginTop: 4, fontSize: 11, color: "#16a34a", fontWeight: 700 }}>
                ✅ Sahi format hai
              </div>
            )}
          </div>

          {/* Submit button */}
          <button type="submit" disabled={submitting || emailExists || emailChecking || !isValidEmail(fullEmail) || !isValidIdNumber()}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 12, border: "none", fontWeight: 800, fontSize: 14,
              cursor: submitting || emailExists || !isValidEmail(fullEmail) || !isValidIdNumber() ? "not-allowed" : "pointer",
              background: submitting || emailExists || !isValidEmail(fullEmail) || !isValidIdNumber() ? (isDark ? "#334155" : "#cbd5e1") : "linear-gradient(135deg,#3b82f6,#2563eb)",
              color: submitting || emailExists || !isValidEmail(fullEmail) || !isValidIdNumber() ? card.sub : "#fff",
              boxShadow: submitting || emailExists ? "none" : "0 4px 14px #3b82f640",
              transition: "all 0.2s"
            }}>
            {submitting ? "Submitting..." : "Submit Registration Request →"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 11, color: card.sub, margin: 0 }}>
          Already have an account?{" "}
          <button type="button" onClick={() => setPage("login")} style={{ color: "#3b82f6", fontWeight: 700, border: "none", background: "none", cursor: "pointer" }}>
            Sign In
          </button>
        </p>

      </div>
    </div>
  )
}
