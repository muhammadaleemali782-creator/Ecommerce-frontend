import { useState, useEffect, useCallback } from "react"
import { useTheme } from "../context/ThemeContext"
import InlineLoader from "../components/InlineLoader"

export default function AdminRoyaltyManagement({ setPage }) {
  const { isDark } = useTheme()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [history, setHistory] = useState([])

  // Form edit state
  const [editing, setEditing] = useState(false)
  const [poolPct, setPoolPct] = useState(1)
  const [cyclePeriod, setCyclePeriod] = useState("monthly")
  const [savingSettings, setSavingSettings] = useState(false)

  // Disburse modal
  const [showDisburseModal, setShowDisburseModal] = useState(false)
  const [disbursing, setDisbursing] = useState(false)
  const [actionMsg, setActionMsg] = useState({ type: "", text: "" })

  const token = localStorage.getItem("token")

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/royalty/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to load royalty status")
      const json = await res.json()
      setData(json)
      setPoolPct(json.poolPercentage || 1)
      setCyclePeriod(json.cyclePeriod || "monthly")

      // load history
      const histRes = await fetch(`${import.meta.env.VITE_API_URL}/api/royalty/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (histRes.ok) {
        const histJson = await histRes.json()
        setHistory(histJson.history || [])
      }
    } catch (e) {
      console.error(e)
      setError(e.message || "Failed to load royalty pool data")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/royalty/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ poolPercentage: Number(poolPct), cyclePeriod })
      })
      if (res.ok) {
        setActionMsg({ type: "success", text: "✅ Royalty pool settings updated successfully!" })
        setEditing(false)
        loadStatus()
      } else {
        const err = await res.json()
        setActionMsg({ type: "error", text: err.message || "Failed to update settings" })
      }
    } catch (e) {
      setActionMsg({ type: "error", text: e.message })
    } finally {
      setSavingSettings(false)
    }
  }

  const handleDisburse = async () => {
    try {
      setDisbursing(true)
      setActionMsg({ type: "", text: "" })
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/royalty/disburse`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })
      const resJson = await res.json()
      if (res.ok) {
        setActionMsg({ type: "success", text: resJson.message })
        setShowDisburseModal(false)
        loadStatus()
      } else {
        setActionMsg({ type: "error", text: resJson.message || "Payout failed" })
      }
    } catch (e) {
      setActionMsg({ type: "error", text: e.message })
    } finally {
      setDisbursing(false)
    }
  }

  if (loading) {
    return <InlineLoader label="Loading Company Royalty Pool Manager..." minHeight={300} />
  }

  const current = data?.currentCycle || {}

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${
      isDark ? "text-stone-200" : "text-stone-800"
    }`}>
      {/* ── TOP HEADER ── */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">👑</span>
          <div>
            <h1 className={`text-xl font-black ${isDark ? "text-white" : "text-stone-900"}`}>
              Lifetime Distributor Royalty Pool Manager
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
              Poori company me aane wale PPC turnover se Distributors ko lifetime monthly royalty distribute karein
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing(!editing)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              editing ? "bg-blue-600 text-black border-blue-500" : isDark ? "bg-stone-900 border-white/[0.12] hover:bg-stone-800" : "bg-stone-100 border-stone-300 hover:bg-stone-200"
            }`}
          >
            ⚙️ {editing ? "Cancel Edit" : "Configure Settings"}
          </button>
          <button
            onClick={() => setShowDisburseModal(true)}
            disabled={current.accumulatedPoolPPC <= 0}
            className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-blue-500 text-black shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💸 Disburse Monthly Pool
          </button>
        </div>
      </div>

      {actionMsg.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold border ${
          actionMsg.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-red-500/10 border-red-500/30 text-red-500"
        }`}>
          {actionMsg.text}
        </div>
      )}

      {/* ── SETTINGS EDIT DRAWER ── */}
      {editing && (
        <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isDark ? "bg-stone-900 border-blue-500/30" : "bg-amber-50/50 border-amber-300"
        }`}>
          <h3 className="text-sm font-black text-blue-500 uppercase tracking-wider">⚙️ Royalty Pool Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1">Royalty Percentage (% of total company PPC):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={poolPct}
                  onChange={(e) => setPoolPct(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-bold ${
                    isDark ? "bg-black/50 border-white/[0.12]" : "bg-white border-stone-300"
                  }`}
                />
                <span className="font-bold text-blue-500">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Distribution Cycle Period:</label>
              <select
                value={cyclePeriod}
                onChange={(e) => setCyclePeriod(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm font-bold ${
                  isDark ? "bg-black/50 border-white/[0.12]" : "bg-white border-stone-300"
                }`}
              >
                <option value="monthly">Monthly (1st of every month)</option>
                <option value="15-days">Bi-Weekly (Every 15 Days)</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-black font-black text-xs shadow hover:bg-blue-500"
          >
            {savingSettings ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}

      {/* ── LIVE CYCLE METRICS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-stone-400">Total Company Monthly PPC</p>
          <p className="text-2xl font-black mt-1 text-sky-400">{current.totalCompanyPPC || 0} <span className="text-xs">PPC</span></p>
          <p className="text-xs text-stone-400 mt-1">Poori company ka turnover</p>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDark ? "bg-[#111713] border-blue-500/30 shadow-lg shadow-amber-500/5" : "bg-amber-50/50 border-amber-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-blue-500 font-bold">Active Royalty Pool ({data.poolPercentage}%)</p>
          <p className="text-2xl font-black mt-1 text-blue-500">{Math.round(current.accumulatedPoolPPC || 0)} <span className="text-xs">PPC</span></p>
          <p className="text-xs font-bold text-emerald-500 mt-1">≈ ₹{(current.accumulatedPoolRupees || 0).toLocaleString("en-IN")}</p>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-stone-400">Eligible Distributors</p>
          <p className="text-2xl font-black mt-1 text-purple-400">{current.eligibleDistributorsCount || 0}</p>
          <p className="text-xs text-stone-400 mt-1">Active distributor partners</p>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-emerald-500 font-bold">Projected Share / Dist.</p>
          <p className="text-2xl font-black mt-1 text-emerald-400">₹{(current.projectedSharePerDistributorRupees || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs font-mono text-stone-400 mt-1">({current.projectedSharePerDistributorPPC || 0} PPC)</p>
        </div>
      </div>

      {/* ── ELIGIBLE DISTRIBUTORS LIST ── */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-base font-black ${isDark ? "text-white" : "text-stone-900"}`}>
            🏢 Qualified Distributors Pool Recipients ({data.distributors?.length || 0})
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(data.distributors || []).map((dist) => (
            <div
              key={dist._id}
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDark ? "bg-stone-900/60 border-white/[0.06]" : "bg-stone-50 border-stone-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-sm">
                  {(dist.fullName || dist.name)[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold">{dist.fullName || dist.name}</div>
                  <div className="text-[10px] font-mono text-sky-500">🆔 {dist.name}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">📞 {dist.phone || "N/A"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-emerald-500">
                  ₹{(current.projectedSharePerDistributorRupees || 0).toLocaleString("en-IN")}
                </div>
                <div className="text-[9px] font-mono text-stone-400">Share</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAST DISTRIBUTION HISTORY ── */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <h2 className={`text-base font-black ${isDark ? "text-white" : "text-stone-900"}`}>
          📜 Historical Royalty Disbursements ({history.length})
        </h2>

        {history.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center">Abhi tak koi historical royalty disbursement record nahi hai.</p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {history.map((h) => (
              <div key={h._id} className="py-3 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <div className="font-bold">{h.periodName}</div>
                  <div className="text-[10px] font-mono text-stone-400">
                    {new Date(h.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · {h.eligibleDistributorsCount} Distributors
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-500 text-sm">₹{h.totalPoolAmountRupees.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] font-mono text-stone-400">(₹{h.payoutPerDistributorRupees} each)</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DISBURSE CONFIRMATION MODAL ── */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDark ? "bg-stone-900 border-blue-500/40 text-white" : "bg-white border-stone-300 text-stone-900"
          }`}>
            <div className="text-center space-y-2">
              <span className="text-4xl">👑</span>
              <h3 className="text-base font-black">Confirm Monthly Royalty Disbursement</h3>
              <p className="text-xs text-stone-400">
                Aap <strong>{current.eligibleDistributorsCount} Qualified Distributors</strong> ko <strong>₹{(current.accumulatedPoolRupees || 0).toLocaleString("en-IN")}</strong> ({Math.round(current.accumulatedPoolPPC || 0)} PPC) distribute karne ja rahe hain.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-xs space-y-1">
              <div className="flex justify-between font-bold">
                <span>Per Distributor Payout:</span>
                <span className="text-emerald-500">₹{(current.projectedSharePerDistributorRupees || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="text-[10px] text-stone-400">Yeh amount har distributor ke Seller Wallet me instant credit ho jayega.</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDisburseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-700 text-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDisburse}
                disabled={disbursing}
                className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-blue-500 text-black shadow"
              >
                {disbursing ? "Processing Payout..." : "Confirm & Disburse"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
