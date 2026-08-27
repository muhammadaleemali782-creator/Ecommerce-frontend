import { useState } from "react"
import { useTheme } from "../context/ThemeContext"
import EducaLogo from "../components/EducaLogo"

export default function PasswordHelp({ setPage }) {
  const { isDark } = useTheme()
  const [tab, setTab] = useState("mail_otp") // "mail_otp" | "admin_request"

  // Self-Service Mail Reset States
  const [step, setStep] = useState(1) // 1: enter id -> 2: enter otp & new pass
  const [identifier, setIdentifier] = useState("")
  const [userId, setUserId] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  // Admin Request States
  const [adminEmail, setAdminEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [adminMsg, setAdminMsg] = useState("")

  // 1. Send OTP to EDUCA Mail
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!identifier.trim()) return
    try {
      setLoading(true)
      setError("")
      setMsg("")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/mail-reset/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setUserId(data.userId)
        setStep(2)
        setMsg(data.message || "OTP has been sent to your EDUCA Mail inbox!")
      } else {
        setError(data.message || "User not found")
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  // 2. Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!otp.trim() || !newPassword.trim()) return
    try {
      setLoading(true)
      setError("")
      setMsg("")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/mail-reset/verify-and-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, identifier: identifier.trim(), otp: otp.trim(), newPassword: newPassword.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setMsg("🎉 Password changed successfully! Redirecting to login...")
        setTimeout(() => {
          if (typeof setPage === "function") setPage("login")
        }, 2000)
      } else {
        setError(data.message || "Invalid OTP")
      }
    } catch (err) {
      setError(err.message || "Reset failed")
    } finally {
      setLoading(false)
    }
  }

  // 3. Fallback Admin Request
  const handleAdminRequest = async (e) => {
    e.preventDefault()
    if (!adminEmail.trim()) return
    try {
      setLoading(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/password-help`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim(), whatsapp: whatsapp.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setAdminMsg("✅ Reset request sent to Admin. Admin will contact you on WhatsApp/Phone.")
      } else {
        setAdminMsg(data.message || "Request failed")
      }
    } catch (err) {
      setAdminMsg("Network error, please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 bg-[#0c100e] text-white border-white/[0.1]">
      <div className="flex flex-col items-center text-center gap-2">
        <EducaLogo size={44} />
        <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-400 uppercase">
          EDUCA VEDA · SELF-SERVICE PORTAL
        </span>
        <h2 className="text-xl font-black">Password Reset Assistance</h2>
        <p className="text-xs text-stone-400">Apne EDUCA Mail par OTP mangwayein ya Admin ko request bhejein.</p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
        <button
          type="button"
          onClick={() => { setTab("mail_otp"); setStep(1); setError(""); setMsg(""); }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            tab === "mail_otp"
              ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md font-black"
              : "text-stone-400 hover:text-white"
          }`}
        >
          ⚡ Self-Reset (EDUCA Mail)
        </button>
        <button
          type="button"
          onClick={() => { setTab("admin_request"); setAdminMsg(""); }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            tab === "admin_request"
              ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md font-black"
              : "text-stone-400 hover:text-white"
          }`}
        >
          📩 Admin Request
        </button>
      </div>

      {/* ── TAB 1: SELF-SERVICE RESET VIA EDUCA MAIL ── */}
      {tab === "mail_otp" && (
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}
          {msg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              {msg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono uppercase text-stone-300 font-bold block mb-1">
                  Apna Email Address ya 🆔 System ID Likhein:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user@educaveda.com ya DS001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "📨 Send OTP to EDUCA Mail"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono uppercase text-stone-300 font-bold block">
                    6-Digit OTP (EDUCA Mail Inbox):
                  </label>
                  <a
                    href="https://messages-frontend-brown.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9.5px] text-amber-400 hover:underline font-mono"
                  >
                    Open Webmail ↗
                  </a>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-amber-500/50 text-center font-mono text-base font-bold text-amber-400 placeholder:text-stone-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-stone-300 font-bold block mb-1">
                  Naya Password Set Karein:
                </label>
                <input
                  type="password"
                  required
                  placeholder="Naya secret password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-xs font-bold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !otp.trim() || !newPassword.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:from-emerald-400 hover:to-green-500 disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "🔒 Set New Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── TAB 2: FALLBACK ADMIN REQUEST ── */}
      {tab === "admin_request" && (
        <form onSubmit={handleAdminRequest} className="space-y-3.5">
          {adminMsg && (
            <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold">
              {adminMsg}
            </div>
          )}
          <div>
            <label className="text-[10px] font-mono uppercase text-stone-300 font-bold block mb-1">
              Your Registered Email:
            </label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-stone-300 font-bold block mb-1">
              WhatsApp Number (for receiving temporary password):
            </label>
            <input
              type="text"
              placeholder="9876543210"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !adminEmail.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "📩 Submit Request to Admin"}
          </button>
        </form>
      )}

      {/* Footer Return to Login */}
      <div className="pt-2 text-center border-t border-white/[0.08]">
        <button
          type="button"
          onClick={() => { if (typeof setPage === "function") setPage("login") }}
          className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
        >
          ← Back to Login Portal
        </button>
      </div>
    </div>
  )
}