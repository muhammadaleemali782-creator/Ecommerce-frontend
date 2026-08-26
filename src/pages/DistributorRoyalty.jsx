import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import InlineLoader from "../components/InlineLoader"

export default function DistributorRoyalty({ setPage }) {
  const { user: authUser } = useAuth()
  const { isDark } = useTheme()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState("")

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
    } catch (e) {
      console.error(e)
      setError(e.message || "Failed to load royalty club data")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  if (loading) {
    return <InlineLoader label="Loading Lifetime Royalty Club..." minHeight={300} />
  }

  const current = data?.currentCycle || {}
  const myHistory = data?.myHistory || []

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 ${
      isDark ? "text-stone-200" : "text-stone-800"
    }`}>
      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              👑 Distributor Lifetime Privilege
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              Company-Wide Lifetime Royalty Club
            </h1>
            <p className="text-xs font-semibold text-black/80 max-w-xl">
              Aapko poori company ke total monthly PPC turnover ka <strong>{data.poolPercentage}% Royalty Pool</strong> lifetime har mahine milta hai!
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black text-white shrink-0 border border-white/30">
            👑
          </div>
        </div>

        {/* User Identity */}
        <div className="pt-2 border-t border-black/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black/20 text-white flex items-center justify-center font-bold text-sm">
            {(authUser?.fullName || authUser?.name || "D")[0].toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-black text-white">{authUser?.fullName || authUser?.name}</div>
            <div className="text-[10px] font-mono text-black/70">🆔 {authUser?.name} · Partner Distributor</div>
          </div>
        </div>
      </div>

      {/* ── CURRENT MONTH LIVE POOL ESTIMATE ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-stone-400">Total Company Monthly Turnover</p>
          <p className="text-xl font-black mt-1 text-sky-400">{current.totalCompanyPPC || 0} <span className="text-xs">PPC</span></p>
          <p className="text-xs text-stone-400 mt-1">Total company orders this cycle</p>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDark ? "bg-[#111713] border-amber-500/30" : "bg-amber-50/50 border-amber-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-amber-500 font-bold">Total Company Pool Fund</p>
          <p className="text-xl font-black mt-1 text-amber-500">₹{(current.accumulatedPoolRupees || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs font-mono text-stone-400 mt-1">{Math.round(current.accumulatedPoolPPC || 0)} PPC ({data.poolPercentage}% Pool)</p>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDark ? "bg-[#111713] border-emerald-500/30" : "bg-emerald-50/50 border-emerald-200"
        }`}>
          <p className="text-[10px] font-mono uppercase text-emerald-500 font-bold">Your Projected Monthly Royalty</p>
          <p className="text-2xl font-black mt-1 text-emerald-500">₹{(current.projectedSharePerDistributorRupees || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs font-mono text-stone-400 mt-1">({current.projectedSharePerDistributorPPC || 0} PPC this cycle)</p>
        </div>
      </div>

      {/* ── MY ROYALTY PAYOUT HISTORY ── */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <h2 className={`text-base font-black ${isDark ? "text-white" : "text-stone-900"}`}>
          📜 My Royalty Disbursements History ({myHistory.length})
        </h2>

        {myHistory.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs">
            Abhi tak koi royalty disbursement log nahi hua hai. Current month cycle complete hone par admin approve karke credit karega.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {myHistory.map((p) => (
              <div key={p._id} className="py-3.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <div className="font-bold">{p.periodName}</div>
                  <div className="text-[10px] font-mono text-stone-400">
                    {new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-500 text-sm">₹{p.amountRupees.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] font-mono text-stone-400">+{p.amountPPC} PPC Credited</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
