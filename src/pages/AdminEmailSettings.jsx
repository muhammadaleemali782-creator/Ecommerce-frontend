import { useState, useEffect } from "react"

export default function AdminEmailSettings() {

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
    <div className="space-y-6 select-none max-w-3xl mx-auto">
      
      {/* ── HEADER ── */}
      <div className="bg-[#121814] p-5 sm:p-6 rounded-3xl border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ SYSTEM ONBOARDING RULES
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Email Domain Configuration
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Enforce unified corporate email suffix during applicant registration and request intake.
          </p>
        </div>
      </div>

      {/* ── CARD CONTENT ── */}
      <div className="bg-[#111713] p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-2xl space-y-6">
        
        {/* Current Domain Badge */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
              Active Corporate Domain
            </div>
            <div className="text-base font-black text-white mt-0.5 flex items-center gap-2">
              {domain ? (
                <>
                  <span className="text-cyan-400 font-mono">@{domain.replace(/^@/, "")}</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold">
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
              className="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              Remove Restriction
            </button>
          )}
        </div>

        {/* Input Form */}
        <div className="space-y-3">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-300">
            Set Enforced Domain Name
          </label>

          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-1.5 focus-within:border-[#fbbf24] transition-colors">
            <span className="text-stone-400 font-mono font-bold text-base pl-3">@</span>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value.replace(/^@/, ""))}
              placeholder="educaved.com"
              className="w-full bg-transparent p-2 text-white font-mono text-sm focus:outline-none placeholder-stone-600 font-bold"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {saving ? "Saving..." : "Save Domain"}
            </button>
          </div>
        </div>

        {/* Live Preview Pill */}
        {input && (
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 space-y-1">
            <div className="font-mono font-bold text-[10px] uppercase tracking-wider text-cyan-400">
              ⚡ Live Registration Preview
            </div>
            <p>
              Users enter username: <span className="font-mono text-white font-bold">john</span> → System issues account as: <span className="font-mono text-white font-bold">john@{input.replace(/^@/, "")}</span>
            </p>
          </div>
        )}

        {/* Status Message */}
        {msg && (
          <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
            msg.startsWith("✅")
              ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
              : "bg-red-950/60 text-red-300 border-red-500/30"
          }`}>
            {msg}
          </div>
        )}

      </div>

    </div>
  )
}

