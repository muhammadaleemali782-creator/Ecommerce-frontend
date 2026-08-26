import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"

const CHECKPOINTS = [
  { id: "cp1",  text: "I acknowledge that this action is PERMANENT and IRREVERSIBLE." },
  { id: "cp2",  text: "All NON-ADMIN user accounts (Distributors, Direct Sellers, Users) will be permanently purged." },
  { id: "cp3",  text: "All order histories, fulfillment records, and invoicing archives will be erased." },
  { id: "cp4",  text: "All commissions, PPC balance records, and coin ledgers will be wiped." },
  { id: "cp5",  text: "All pending and processed withdrawal payout requests will be deleted." },
  { id: "cp6",  text: "All user onboarding join requests and document uploads will be cleared." },
  { id: "cp7",  text: "All catalog products will be removed from the store inventory." },
  { id: "cp8",  text: "This data cannot be recovered from MongoDB backups after execution." },
  { id: "cp9",  text: "I understand the primary Super Admin account will remain preserved and safe." },
  { id: "cp10", text: "I assume full operational responsibility for initiating this purge." },
  { id: "cp11", text: "All key stakeholders have been notified of this database wipe." },
  { id: "cp12", text: "I confirm this is an intentional PRODUCTION purge, not a simulation." },
]

const TARGETS = [
  { id: "users",       label: "👥 Users (Non-Admin)",     color: "text-red-400", bg: "bg-red-950/40 border-red-500/30" },
  { id: "orders",      label: "🛒 Orders & Invoices",     color: "text-amber-400", bg: "bg-amber-950/40 border-amber-500/30" },
  { id: "products",    label: "📦 Product Catalog",       color: "text-purple-400", bg: "bg-purple-950/40 border-purple-500/30" },
  { id: "commissions", label: "💰 Commissions & Wallets", color: "text-cyan-400", bg: "bg-cyan-950/40 border-cyan-500/30" },
  { id: "withdrawals", label: "💸 Withdrawal Requests",  color: "text-pink-400", bg: "bg-pink-950/40 border-pink-500/30" },
  { id: "requests",    label: "📋 Join Request Queue",   color: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-500/30" },
]

export default function AdminNukeData() {
  const { user } = useAuth()
  const [step, setStep]               = useState(1)
  const [checked, setChecked]         = useState({})
  const [targets, setTargets]         = useState({})
  const [confirmText, setConfirmText] = useState("")
  const [preview, setPreview]         = useState(null)
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState(null)
  const [error, setError]             = useState("")
  const [countdown, setCountdown]     = useState(0)

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-3xl text-red-300 font-bold text-sm">
        ❌ Super Admin access required.
      </div>
    )
  }

  const allChecked = CHECKPOINTS.every(cp => checked[cp.id])
  const anyTarget  = Object.values(targets).some(Boolean)
  const selectedTargets = TARGETS.filter(t => targets[t.id]).map(t => t.id)

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
      setError("Please type exactly: DELETE EVERYTHING")
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

  const steps = ["⚠️ Protocols", "✅ Checkpoints", "🎯 Target Scope", "🔐 Auth Lock", "🔥 Execution"]

  return (
    <div className="space-y-6 select-none max-w-3xl mx-auto">

      {/* ── HEADER ── */}
      <div className="bg-[#121814] p-5 sm:p-6 rounded-3xl border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ☢️ EMERGENCY DATABASE PROTOCOL
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            High-Security Data Purge Engine
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Hard wipe non-admin user collections, transactions, and store catalog with cryptographic verification.
          </p>
        </div>
      </div>

      {/* ── STEP INDICATOR RAIL ── */}
      {step < 6 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {steps.map((label, i) => {
            const idx = i + 1
            const done   = step > idx
            const active = step === idx
            return (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                  done
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : active
                      ? "bg-red-500 text-black border-red-400 font-black shadow-lg"
                      : "bg-[#111713] border-white/10 text-stone-500"
                }`}>
                  {done ? "✓" : idx}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  active ? "text-red-400" : done ? "text-emerald-400" : "text-stone-500"
                }`}>
                  {label}
                </span>
                {i < steps.length - 1 && <div className="w-4 h-0.5 bg-white/10 shrink-0" />}
              </div>
            )
          })}
        </div>
      )}

      {/* ══ STEP 1: WARNING ══ */}
      {step === 1 && (
        <div className="bg-[#111713] p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-2xl space-y-6">
          <div className="p-5 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs space-y-2">
            <div className="font-mono font-black text-sm uppercase text-red-400 flex items-center gap-2">
              <span>⛔ CRITICAL WARNING</span>
            </div>
            <p className="leading-relaxed">
              This terminal executes a <strong>PERMANENT, DESTRUCTIVE DATABASE PURGE</strong>. Once initiated, all targeted collections will be unrecoverably erased.
            </p>
          </div>

          <div className="space-y-2 text-xs text-stone-300">
            {[
              "👥 All Distributors, Direct Sellers, and Customers will be purged.",
              "🛒 All orders, invoices, and shipping details will be erased.",
              "💰 All commission logs, level histories, and wallet balances will reset.",
              "📦 All store inventory and product records will be cleared.",
              "💸 All withdrawal disbursements and payout logs will be wiped.",
              "🛡️ Primary Super Admin credentials and root node will remain safe.",
            ].map((txt, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
                <span className="text-red-400">•</span>
                <span>{txt}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => window.history.back()}
              className="flex-1 py-3 rounded-xl bg-white/[0.08] hover:bg-white/15 text-stone-300 font-bold text-xs uppercase cursor-pointer"
            >
              ← Cancel & Exit
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg active:scale-95"
            >
              I Understand the Risks — Proceed ⚠️
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 2: CHECKPOINTS ══ */}
      {step === 2 && (
        <div className="bg-[#111713] p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-2xl space-y-5">
          <div>
            <h2 className="text-sm font-black text-white uppercase">Acknowledge All 12 Safety Checkpoints</h2>
            <p className="text-xs text-stone-400 mt-0.5">Every verification box must be checked before proceeding.</p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {CHECKPOINTS.map((cp, i) => (
              <div
                key={cp.id}
                onClick={() => setChecked(p => ({ ...p, [cp.id]: !p[cp.id] }))}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  checked[cp.id]
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                    : "bg-black/40 border-white/[0.06] text-stone-400 hover:border-white/20"
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border font-mono text-xs font-black shrink-0 ${
                  checked[cp.id] ? "bg-emerald-500 border-emerald-400 text-black" : "border-white/20 bg-black/40"
                }`}>
                  {checked[cp.id] ? "✓" : ""}
                </div>
                <div className="text-xs">
                  <span className="font-mono font-bold text-[10px] text-stone-500 mr-2">#{i+1}</span>
                  <span>{cp.text}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl bg-white/[0.08] hover:bg-white/15 text-stone-300 font-bold text-xs uppercase cursor-pointer"
            >
              ← Back
            </button>
            <button
              disabled={!allChecked}
              onClick={() => setStep(3)}
              className="flex-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg active:scale-95 disabled:opacity-40"
            >
              Configure Purge Scope →
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 3: SELECT TARGETS ══ */}
      {step === 3 && (
        <div className="bg-[#111713] p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-2xl space-y-5">
          <div>
            <h2 className="text-sm font-black text-white uppercase">Select Target Data Collections</h2>
            <p className="text-xs text-stone-400 mt-0.5">Toggle specific collections or wipe all non-admin data.</p>
          </div>

          {/* Select All Toggle */}
          <div
            onClick={() => {
              const allSelected = TARGETS.every(t => targets[t.id])
              const newState = {}
              TARGETS.forEach(t => { newState[t.id] = !allSelected })
              setTargets(newState)
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 cursor-pointer"
          >
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border font-mono text-xs font-black shrink-0 ${
              TARGETS.every(t=>targets[t.id]) ? "bg-red-500 border-red-400 text-black" : "border-white/20 bg-black/40"
            }`}>
              {TARGETS.every(t=>targets[t.id]) ? "✓" : ""}
            </div>
            <span className="text-xs font-black text-red-300 uppercase">
              ⚡ SELECT ALL COLLECTIONS (Full System Reset)
            </span>
          </div>

          <div className="space-y-2">
            {TARGETS.map(t => {
              const cnt = preview?.[t.id]?.count
              return (
                <div
                  key={t.id}
                  onClick={() => setTargets(p => ({ ...p, [t.id]: !p[t.id] }))}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    targets[t.id] ? `${t.bg}` : "bg-black/40 border-white/[0.06] hover:border-white/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center border font-mono text-xs font-black shrink-0 ${
                    targets[t.id] ? "bg-white border-white text-black" : "border-white/20 bg-black/40"
                  }`}>
                    {targets[t.id] ? "✓" : ""}
                  </div>
                  <span className="text-xs font-bold text-white flex-1">{t.label}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.08] ${t.color}`}>
                    {cnt !== undefined ? `${cnt} records` : "Scanning..."}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl bg-white/[0.08] hover:bg-white/15 text-stone-300 font-bold text-xs uppercase cursor-pointer"
            >
              ← Back
            </button>
            <button
              disabled={!anyTarget}
              onClick={() => setStep(4)}
              className="flex-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg active:scale-95 disabled:opacity-40"
            >
              Proceed to Final Authorization →
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 4: TYPE CONFIRM ══ */}
      {step === 4 && (
        <div className="bg-[#111713] p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-2xl space-y-5">
          <div>
            <h2 className="text-sm font-black text-white uppercase">Cryptographic Execution Passphrase</h2>
            <p className="text-xs text-stone-400 mt-0.5">Type the exact phrase below to unlock the wipe trigger.</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-red-500/30 text-center">
            <span className="font-mono text-base font-black text-red-400 tracking-widest">
              DELETE EVERYTHING
            </span>
          </div>

          <input
            value={confirmText}
            onChange={e => { setConfirmText(e.target.value); setError("") }}
            placeholder="Type passphrase here..."
            className="w-full p-3.5 bg-black/40 text-white rounded-2xl border border-white/10 text-sm font-mono text-center font-bold focus:outline-none focus:border-red-500"
          />

          {error && <p className="text-xs font-bold text-red-400">❌ {error}</p>}

          <div className="flex gap-3 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 rounded-xl bg-white/[0.08] hover:bg-white/15 text-stone-300 font-bold text-xs uppercase cursor-pointer"
            >
              ← Back
            </button>
            <button
              disabled={confirmText !== "DELETE EVERYTHING" || countdown > 0}
              onClick={handleNuke}
              className="flex-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg active:scale-95 disabled:opacity-40"
            >
              {countdown > 0 ? `⏳ Holding Safety Lock (${countdown}s)...` : "🔥 EXECUTE DATA PURGE NOW"}
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 5: EXECUTING ══ */}
      {step === 5 && (
        <div className="bg-[#111713] p-12 rounded-3xl border border-red-500/40 text-center space-y-4 shadow-2xl">
          <div className="text-4xl animate-bounce">🔥</div>
          <h2 className="text-base font-black text-red-400 uppercase">Purging Targeted Collections...</h2>
          <p className="text-xs text-stone-400 font-mono">Executing cascade deletions across MongoDB clusters.</p>
        </div>
      )}

      {/* ══ STEP 6: DONE ══ */}
      {step === 6 && result && (
        <div className="bg-[#111713] p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <div className="text-4xl">✅</div>
            <h2 className="text-base font-black text-white uppercase">Data Purge Completed Successfully</h2>
            <p className="text-xs text-stone-400 font-mono">Audit report of erased database records:</p>
          </div>

          <div className="space-y-2">
            {Object.entries(result.deleted || {}).map(([key, count]) => (
              <div key={key} className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                <span className="font-bold text-stone-300 capitalize">{key}</span>
                <span className="font-mono font-bold text-emerald-400">{count} records purged</span>
              </div>
            ))}
          </div>

          <button
            onClick={reset}
            className="w-full py-3.5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
          >
            ← Return to Dashboard
          </button>
        </div>
      )}

    </div>
  )
}

