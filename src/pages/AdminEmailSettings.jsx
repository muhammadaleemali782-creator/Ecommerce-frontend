import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"

export default function AdminEmailSettings() {
  const { isDark } = useTheme()
  const [domain, setDomain] = useState("")
  const [input, setInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  /* ── Load current domain ── */
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings/email-domain`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.domain) {
          setDomain(data.domain)
          // Remove leading @ for input field
          setInput(data.domain.replace(/^@/, ""))
        }
      } catch (err) {
        console.error("Load domain error:", err)
      }
    }
    load()
  }, [])

  /* ── Save ── */
  const handleSave = async () => {
    if (!input.trim()) {
      setMsg("❌ Domain cannot be empty")
      return
    }

    try {
      setSaving(true)
      setMsg("")
      const token = localStorage.getItem("token")

      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings/email-domain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ domain: input.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        setMsg("❌ " + (data.message || "Error"))
        return
      }

      setDomain(data.domain)
      setMsg("✅ Corporate email domain configured successfully!")

    } catch {
      setMsg("❌ Server connection error")
    } finally {
      setSaving(false)
    }
  }

  /* ── Clear ── */
  const handleClear = async () => {
    try {
      setSaving(true)
      setMsg("")
      const token = localStorage.getItem("token")

      await fetch(`${import.meta.env.VITE_API_URL}/settings/email-domain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ domain: "" })
      })

      setDomain("")
      setInput("")
      setMsg("✅ Domain cleared — open/free email formats allowed.")
    } catch {
      setMsg("❌ Server connection error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`space-y-6 select-none max-w-3xl mx-auto transition-colors duration-200 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>
      
      {/* ── HEADER ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDark ? "bg-[#121814] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ SYSTEM ONBOARDING RULES
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            Email Domain Configuration
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>
            Enforce unified corporate email suffix during applicant registration and request intake.
          </p>
        </div>
      </div>

      {/* ── CARD CONTENT ── */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        
        {/* Current Domain Badge */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 flex-wrap ${
          isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
        }`}>
          <div>
            <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
              isDark ? "text-stone-400" : "text-stone-500"
            }`}>
              Active Corporate Domain
            </div>
            <div className={`text-base font-black mt-0.5 flex items-center gap-2 ${
              isDark ? "text-white" : "text-stone-900"
            }`}>
              {domain ? (
                <>
                  <span className="text-cyan-600 dark:text-cyan-400 font-mono">@{domain.replace(/^@/, "")}</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold">
                    ENFORCED
                  </span>
                </>
              ) : (
                <span className="text-stone-400 text-sm font-semibold">
                  Not Configured (Any email provider permitted)
                </span>
              )}
            </div>
          </div>

          {domain && (
            <button
              onClick={handleClear}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              Remove Restriction
            </button>
          )}
        </div>

        {/* Input Form */}
        <div className="space-y-3">
          <label className={`block text-xs font-mono font-bold uppercase tracking-wider ${
            isDark ? "text-stone-300" : "text-stone-700"
          }`}>
            Set Enforced Domain Name
          </label>

          <div className={`flex items-center gap-2 border rounded-2xl p-1.5 focus-within:border-amber-500 transition-colors ${
            isDark ? "bg-black/40 border-white/10" : "bg-stone-50 border-stone-300"
          }`}>
            <span className={`font-mono font-bold text-base pl-3 ${isDark ? "text-stone-400" : "text-stone-500"}`}>@</span>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value.replace(/^@/, ""))}
              placeholder="educaved.com"
              className={`w-full bg-transparent p-2 font-mono text-sm focus:outline-none font-bold ${
                isDark ? "text-white placeholder-stone-600" : "text-stone-900 placeholder-stone-400"
              }`}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {saving ? "Saving..." : "Save Domain"}
            </button>
          </div>
        </div>

        {/* Live Preview Pill */}
        {input && (
          <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
            isDark ? "bg-cyan-950/30 border-cyan-500/20 text-cyan-200" : "bg-cyan-50 border-cyan-200 text-cyan-900"
          }`}>
            <div className="font-mono font-bold text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              ⚡ Live Registration Preview
            </div>
            <p>
              Users enter username: <span className="font-mono font-bold">john</span> → System issues account as: <span className="font-mono font-bold">john@{input.replace(/^@/, "")}</span>
            </p>
          </div>
        )}

        {/* Status Message */}
        {msg && (
          <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
            msg.startsWith("✅")
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30"
          }`}>
            {msg}
          </div>
        )}

      </div>

    </div>
  )
}

