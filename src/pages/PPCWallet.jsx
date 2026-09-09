import { useState, useEffect, useCallback } from "react"
import { useTheme } from "../context/ThemeContext"
import EducaLogo from "../components/EducaLogo"

export default function PPCWallet({ setPage }) {
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState(null)
  const [error, setError] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [showRoadmap, setShowRoadmap] = useState({})
  const [lastRefresh, setLastRefresh] = useState(null)

  // Reward claim state — walletType -> { [level]: { claimStatus, claimId } }
  const [claimsMap, setClaimsMap] = useState({})
  const [claimingKey, setClaimingKey] = useState("")
  const [claimMsg, setClaimMsg] = useState({ type: "", text: "" })

  const fetchClaims = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rewards/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      const map = {}
      for (const w of data.wallets || []) {
        map[w.walletType] = {}
        for (const lvl of w.levels || []) {
          map[w.walletType][lvl.level] = { claimStatus: lvl.claimStatus, claimId: lvl.claimId }
        }
      }
      setClaimsMap(map)
    } catch (err) {
      console.error("Fetch claims error:", err)
    }
  }, [])

  useEffect(() => { fetchClaims() }, [fetchClaims])

  const handleClaimReward = async (walletType, level) => {
    const key = `${walletType}_${level}`
    try {
      setClaimingKey(key)
      setClaimMsg({ type: "", text: "" })
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rewards/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ walletType, level })
      })
      const data = await res.json()
      if (res.ok) {
        setClaimMsg({ type: "success", text: "🎉 Reward claim admin ko bhej di gayi hai!" })
        fetchClaims()
      } else {
        setClaimMsg({ type: "error", text: data.message || "Claim fail ho gaya" })
      }
    } catch (err) {
      console.error("Claim reward error:", err)
      setClaimMsg({ type: "error", text: "Claim fail ho gaya" })
    } finally {
      setClaimingKey("")
    }
  }

  const ClaimButton = ({ walletType, level }) => {
    const info = claimsMap[walletType]?.[level]
    const status = info?.claimStatus || "not_claimed"
    const busy = claimingKey === `${walletType}_${level}`

    if (status === "paid") {
      return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1 inline-block ${
          isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
          ✅ Paid
        </span>
      )
    }
    if (status === "pending") {
      return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1 inline-block ${
          isDark ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-800 border-amber-200"
        }`}>
          ⏳ Admin approval pending
        </span>
      )
    }
    return (
      <button
        onClick={() => handleClaimReward(walletType, level)}
        disabled={busy}
        className={`text-[10px] font-bold mt-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
          busy
            ? "bg-stone-700 text-stone-500 border-stone-600 cursor-not-allowed"
            : isDark
              ? "bg-purple-600 hover:bg-purple-500 text-white border-purple-400/40 active:scale-95"
              : "bg-purple-600 hover:bg-purple-700 text-white border-purple-600 active:scale-95"
        }`}
      >
        {busy ? "Sending..." : status === "rejected" ? "🔁 Re-Claim Reward" : "🎁 Claim Reward"}
      </button>
    )
  }

  const fetchWallet = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please login first")
        setLoading(false)
        return
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ppc/wallet/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to fetch wallet")
      const data = await res.json()
      setWalletData(data)
      setLastRefresh(new Date())
      setError("")
    } catch (err) {
      setError(err.message || "Failed to load wallet")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWallet() }, [fetchWallet])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 max-w-xl mx-auto">
        <div className={`p-4 rounded-2xl border text-center ${
          isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <p className="font-bold text-sm">Error: {error}</p>
          <button
            onClick={() => fetchWallet()}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!walletData) {
    return <div className="text-center py-8 text-stone-400 text-xs">No wallet data found</div>
  }

  return (
    <div className={`max-w-6xl mx-auto space-y-5 px-2 sm:px-4 pb-20 transition-colors ${
      isDark ? "text-stone-200" : "text-stone-900"
    }`}>

      {/* ── Top Header ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
        isDark
          ? "bg-gradient-to-br from-[#121c16] via-[#101512] to-[#0c100e] border-emerald-500/25 shadow-xl shadow-emerald-950/20 text-white"
          : "bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-500/30 shadow-lg"
      }`}>
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">💰</span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">My PPC Wallet</h1>
            </div>
            <p className={`text-xs font-medium ${isDark ? "text-stone-400" : "text-emerald-100/90"}`}>
              Role: <span className="font-bold uppercase font-mono">{walletData.role}</span>
            </p>
          </div>
          <button
            onClick={() => fetchWallet(false)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center shrink-0 ${
              isDark
                ? "bg-white/[0.08] hover:bg-white/[0.15] border-white/15 text-white"
                : "bg-white/20 hover:bg-white/30 border-white/30 text-white"
            }`}
          >
            <span>🔄 Refresh</span>
            {lastRefresh && (
              <span className="text-[9px] opacity-75 font-mono">
                {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </button>
        </div>
      </div>

      {claimMsg.text && (
        <div className={`p-3 rounded-2xl text-xs font-bold border ${
          claimMsg.type === "success"
            ? isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-800 border-emerald-200"
            : isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {claimMsg.text}
        </div>
      )}

      {/* ── PPC Rate Info ── */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isDark
          ? "bg-gradient-to-r from-emerald-950/40 via-stone-900 to-teal-950/40 border-emerald-500/20 text-white shadow-lg"
          : "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md border-emerald-500/30"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80 uppercase tracking-wider font-bold">Current PPC Rate</p>
            <p className="text-2xl sm:text-3xl font-black mt-0.5">₹{walletData.currentPPCRate}</p>
            <p className="text-[10px] opacity-75 mt-0.5">per PPC</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80 uppercase tracking-wider font-bold">Your Share</p>
            <p className="text-2xl sm:text-3xl font-black mt-0.5">
              {walletData.role === "seller" ? "50%" : "25%"}
            </p>
            <p className="text-[10px] opacity-75 mt-0.5">of PPC value</p>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total PPC Earned */}
        <div className={`p-5 rounded-3xl border shadow-xl ${
          isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider font-bold mb-1">Total PPC Earned</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-500">
                {walletData.totalPPCEarned || 0} <span className="text-lg font-bold text-emerald-400/80">PPC</span>
              </p>
              <p className="text-xs text-stone-400 mt-1 font-medium">
                Est: ₹{((walletData.totalPPCEarned || 0) * walletData.currentPPCRate * 0.5).toFixed(2)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${
              isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200"
            }`}>
              💰
            </div>
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className={`p-5 rounded-3xl border shadow-xl ${
          isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider font-bold mb-1">Total Withdrawn</p>
              <p className="text-2xl sm:text-3xl font-black text-sky-500">
                {walletData.totalWithdrawn || 0} <span className="text-lg font-bold text-sky-400/80">PPC</span>
              </p>
              <p className="text-xs text-stone-400 mt-1 font-medium">
                Est: ₹{((walletData.totalWithdrawn || 0) * walletData.currentPPCRate * 0.25).toFixed(2)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${
              isDark ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-sky-50 text-sky-600 border-sky-200"
            }`}>
              💳
            </div>
          </div>
        </div>
      </div>

      {/* ── Wallets Section ── */}
      {walletData.wallets && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-stone-400">Your Wallets</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(walletData.wallets).map(([key, wallet]) => (
              <div
                key={key}
                className={`p-5 sm:p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${
                  isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200"
                } ${wallet.withdrawable ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-amber-500"}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-base font-bold">
                      {key === "distributorWallet" && "📊 Distributor Wallet"}
                      {key === "sellerWallet" && "💼 Direct Seller Wallet"}
                      {key === "userWallet" && "👤 User Wallet"}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      wallet.withdrawable
                        ? isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : isDark ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {wallet.withdrawable ? "Withdrawable" : "Locked"}
                    </span>
                  </div>

                  {/* Distributor Wallet — Level Progression */}
                  {key === "distributorWallet" ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <div className="text-[10px] text-stone-400">
                          Withdraw nahi hoga — Level progression ke liye
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          Locked 🔒
                        </span>
                      </div>

                      {/* PPC Balance */}
                      <div className={`p-4 rounded-2xl border ${
                        isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-stone-50 border-stone-100"
                      }`}>
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                          Network PPC Collected
                        </div>
                        <div className="text-2xl sm:text-3xl font-black">
                          {wallet.ppcCount || 0} <span className="text-sm font-semibold text-stone-400">PPC</span>
                        </div>
                      </div>

                      {/* Current Level Badge */}
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-3 text-white">
                        <div className="text-[10px] opacity-75">Current Level</div>
                        <div className="text-base font-black">{wallet.currentLevelName || "Distributor"}</div>
                      </div>

                      {/* Progress to next level */}
                      {wallet.nextLevelName ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-stone-400">
                              Next: <strong className="text-purple-400">{wallet.nextLevelName}</strong>
                            </span>
                            <span className="font-bold text-purple-400">
                              {wallet.ppcCount || 0} / {wallet.nextThreshold} PPC
                            </span>
                          </div>
                          <div className={`h-2.5 rounded-full overflow-hidden ${
                            isDark ? "bg-purple-950/60" : "bg-purple-100"
                          }`}>
                            <div
                              style={{ width: `${wallet.progress || 0}%` }}
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                            />
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {wallet.nextThreshold - (wallet.ppcCount || 0)} PPC aur chahiye level up ke liye
                          </div>
                        </div>
                      ) : (
                        <div className={`p-3 rounded-xl text-xs font-bold border ${
                          isDark ? "bg-amber-500/10 text-amber-300 border-amber-500/20" : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          🏆 Maximum level achieve kar liya!
                        </div>
                      )}

                      {/* All levels + Rewards */}
                      <div className="pt-2">
                        <button
                          onClick={() => setShowRoadmap(p => ({ ...p, [key]: !p[key] }))}
                          className="w-full flex items-center justify-between text-[11px] font-bold text-stone-400 hover:text-stone-200 py-1 cursor-pointer"
                        >
                          <span className="uppercase tracking-wider">Level Roadmap & Rewards</span>
                          <span className="text-purple-400">{showRoadmap[key] ? "▲ Chhupao" : "▼ Dikhao"}</span>
                        </button>
                        {showRoadmap[key] && wallet.thresholds && Object.entries(wallet.thresholds).map(([lvlKey, threshold]) => {
                          const lvlNum   = parseInt(lvlKey.replace("level", ""))
                          const lvlName  = wallet.levelNames?.[lvlKey] || lvlKey
                          const reward   = wallet.levelRewards?.[lvlKey] || ""
                          const done     = (wallet.ppcCount || 0) >= threshold
                          const current  = wallet.currentLevel === lvlNum
                          return (
                            <div
                              key={lvlKey}
                              className={`p-3 rounded-xl border mb-2 flex items-start gap-3 ${
                                current
                                  ? isDark ? "bg-purple-500/15 border-purple-500/30" : "bg-purple-50 border-purple-200"
                                  : done
                                    ? isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
                                    : isDark ? "bg-white/[0.02] border-white/[0.05]" : "bg-stone-50 border-stone-200"
                              }`}
                            >
                              <span className="text-sm shrink-0">{done ? "✅" : current ? "🔵" : "⭕"}</span>
                              <div className="flex-1 min-w-0">
                                <div className={`text-xs font-bold leading-tight ${current ? "text-purple-400" : ""}`}>
                                  {lvlName}
                                </div>
                                {reward && (
                                  <div className="text-[10px] text-stone-400 mt-1">
                                    {done ? "🎁 " : "💡 "}{reward}
                                  </div>
                                )}
                                {done && lvlNum > 0 && (
                                  <ClaimButton walletType="distributorWallet" level={lvlNum} />
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-stone-400 font-bold shrink-0">
                                {threshold} PPC
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Regular Wallet — PPC Balance */}
                      <div className={`p-4 rounded-2xl border ${
                        isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-stone-50 border-stone-100"
                      }`}>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold mb-1">PPC Balance</p>
                        <p className="text-3xl font-black">
                          {wallet.ppcCount || 0} <span className="text-sm font-semibold text-stone-400">PPC</span>
                        </p>
                      </div>

                      <div className={`p-3 rounded-2xl border space-y-2 text-xs ${
                        isDark ? "bg-white/[0.02] border-white/[0.04]" : "bg-stone-50/70 border-stone-100"
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-400">Your Share:</span>
                          <span className="font-bold text-purple-400">{wallet.percentage}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-400">Estimated Value:</span>
                          <span className="font-black text-emerald-500">
                            ₹{wallet.estimatedValue?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>

                      {/* Distributor Direct Seller Wallet Level Roadmap */}
                      {key === "sellerWallet" && walletData.role === "distributor" && walletData.sellerLevelUpThresholds && Object.keys(walletData.sellerLevelUpThresholds).length > 0 && (() => {
                        const thresholds   = walletData.sellerLevelUpThresholds
                        const levelNames   = walletData.sellerLevelNames   || {}
                        const levelRewards = walletData.sellerLevelRewards || {}
                        const ppc          = wallet.ppcCount || 0
                        let currentLevel   = 0
                        const sortedLevels = Object.entries(thresholds)
                          .map(([k,v]) => ({ n: parseInt(k.replace("level","")), v }))
                          .sort((a,b) => a.n - b.n)
                        sortedLevels.forEach(({ n, v }) => { if (ppc >= v) currentLevel = n })
                        const currentLevelName = levelNames[`level${currentLevel}`] || (currentLevel === 0 ? "Seller" : `Level ${currentLevel}`)
                        const nextLvl          = sortedLevels.find(l => l.n > currentLevel)
                        const nextLevelName    = nextLvl ? (levelNames[`level${nextLvl.n}`] || `Level ${nextLvl.n}`) : null
                        const nextThreshold    = nextLvl?.v || null
                        const progress         = nextThreshold ? Math.min(100, Math.round(ppc / nextThreshold * 100)) : 100

                        return (
                          <div className="space-y-3 pt-2">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-3 text-white">
                              <div className="text-[10px] opacity-75">Current Level</div>
                              <div className="text-base font-black">{currentLevelName}</div>
                            </div>
                            {nextLevelName && (
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-stone-400">Next: <strong className="text-sky-400">{nextLevelName}</strong></span>
                                  <span className="font-bold text-sky-400">{ppc} / {nextThreshold} PPC</span>
                                </div>
                                <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-sky-950/60" : "bg-sky-100"}`}>
                                  <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full" />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>

                {wallet.withdrawable && (wallet.ppcCount || 0) > 0 && (
                  <button
                    onClick={() => setPage("withdrawal-request")}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer shadow-lg active:scale-98"
                  >
                    Request Withdrawal ➔
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Direct Seller Unified Reward Roadmap for Seller role */}
          {walletData.role === "seller" && walletData.sellerLevelUpThresholds && Object.keys(walletData.sellerLevelUpThresholds).length > 0 && (() => {
            const thresholds = walletData.sellerLevelUpThresholds
            const levelNames = walletData.sellerLevelNames || {}
            const levelRewards = walletData.sellerLevelRewards || {}
            const ppc = walletData.totalSellerPPC !== undefined
              ? walletData.totalSellerPPC
              : ((walletData.wallets?.userWallet?.ppcCount || 0) + (walletData.wallets?.sellerWallet?.ppcCount || 0))

            let currentLevel = 0
            const sortedLevels = Object.entries(thresholds)
              .map(([k, v]) => ({ n: parseInt(k.replace("level", "")), v }))
              .sort((a, b) => a.n - b.n)
            sortedLevels.forEach(({ n, v }) => { if (ppc >= v) currentLevel = n })
            const currentLevelName = levelNames[`level${currentLevel}`] || (currentLevel === 0 ? "Direct Seller" : `Level ${currentLevel}`)
            const nextLvl = sortedLevels.find(l => l.n > currentLevel)
            const nextLevelName = nextLvl ? (levelNames[`level${nextLvl.n}`] || `Level ${nextLvl.n}`) : null
            const nextThreshold = nextLvl?.v || null
            const progress = nextThreshold ? Math.min(100, Math.round(ppc / nextThreshold * 100)) : 100

            return (
              <div className={`p-6 rounded-3xl border shadow-xl mt-6 space-y-4 ${
                isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold uppercase mb-1">
                      🌟 Unified Seller Progression
                    </div>
                    <h3 className="text-base sm:text-lg font-black">Direct Seller Achievement Rewards</h3>
                    <p className="text-xs text-stone-400">User orders + Team seller orders dono ka PPC ek sath judkar milestones unlock karta hai!</p>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl border text-right shrink-0 ${
                    isDark ? "bg-white/[0.03] border-white/10" : "bg-stone-50 border-stone-200"
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-stone-400">Combined Total</span>
                    <span className="text-xl font-black text-emerald-500">{ppc} PPC</span>
                  </div>
                </div>

                {/* Progress bar */}
                {nextLevelName ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-stone-400">Next Milestone: <strong className="text-purple-400">{nextLevelName}</strong></span>
                      <span className="text-purple-400">{ppc} / {nextThreshold} PPC</span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${isDark ? "bg-purple-950/60" : "bg-purple-100"}`}>
                      <div
                        style={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`p-3 rounded-xl text-xs font-bold border ${
                    isDark ? "bg-amber-500/10 text-amber-300 border-amber-500/20" : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}>
                    👑 Maximum Level Achieved!
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* ── Earnings History ── */}
      {walletData.history && walletData.history.length > 0 && (
        <div className={`rounded-3xl border overflow-hidden shadow-xl ${
          isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <button
            onClick={() => setShowHistory(p => !p)}
            className={`w-full flex items-center justify-between p-5 transition text-left cursor-pointer ${
              isDark ? "hover:bg-white/[0.02]" : "hover:bg-stone-50"
            }`}
          >
            <div>
              <h2 className="text-base font-bold">📋 Earnings History</h2>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Har entry mein — kahan se mila, kaunsa wallet, kya rate tha
              </p>
            </div>
            <span className="text-xs text-stone-400">{showHistory ? "▲" : "▼"}</span>
          </button>

          {showHistory && (
            <div className={`border-t overflow-x-auto ${isDark ? "border-white/[0.06]" : "border-stone-100"}`}>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isDark ? "border-white/[0.06] bg-black/20" : "border-stone-100 bg-stone-50"}`}>
                    {["Date & Time", "PPC Count", "Position / Source", "Rate × % = Value", "Wallet"].map(h => (
                      <th key={h} className="p-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-stone-100"}`}>
                  {walletData.history.filter(i => (i.ppcCount || 0) > 0).map((item, idx) => {
                    const rate  = item.ppcBaseRate || walletData.currentPPCRate || 0
                    const pct   = item.percentageShare || 50
                    const rupee = item.rupeeValue || (item.ppcCount * rate * pct / 100)
                    const walletLabel =
                      item.walletType === "userWallet"           ? "User Wallet"
                    : item.walletType === "sellerWalletAsSeller" ? "Direct Seller Wallet"
                    : item.walletType === "sellerWallet"         ? "Direct Seller Wallet"
                    : item.walletType || "—"

                    return (
                      <tr key={idx} className={isDark ? "hover:bg-white/[0.02]" : "hover:bg-stone-50"}>
                        <td className="p-3 text-stone-400 whitespace-nowrap text-[11px]">
                          <div>{new Date(item.createdAt).toLocaleDateString("en-IN")}</div>
                          <div className="text-[10px] opacity-70">
                            {new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                        <td className="p-3 font-black text-purple-400 text-sm">
                          {item.ppcCount} <span className="text-[10px] text-stone-400 font-normal">PPC</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            isDark ? "bg-white/[0.04] border-white/10 text-stone-300" : "bg-stone-100 border-stone-200 text-stone-700"
                          }`}>
                            {item.positionType || "direct"}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-emerald-500">
                          ₹{rupee.toFixed(2)}
                          <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                            {item.ppcCount} × ₹{rate} × {pct}%
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                            isDark ? "bg-white/[0.03] text-stone-400" : "bg-stone-100 text-stone-600"
                          }`}>
                            {walletLabel}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  )
}