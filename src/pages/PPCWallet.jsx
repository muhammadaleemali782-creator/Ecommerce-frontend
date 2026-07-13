

import { useState, useEffect, useCallback } from "react"

export default function PPCWallet({ setPage }) {
  
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState(null)
  const [error, setError] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [showRoadmap, setShowRoadmap] = useState({})
  const [lastRefresh, setLastRefresh] = useState(null)
  
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
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        throw new Error("Failed to load wallet")
      }
      
      const data = await res.json()
      setWalletData(data)
      setLastRefresh(new Date())
      setError("")
      
    } catch (err) {
      console.error("Wallet fetch error:", err)
      if (!silent) setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // First load
  useEffect(() => {
    fetchWallet(false)
  }, [fetchWallet])

  // ✅ Auto-refresh every 10s (silent — no loading spinner)
  useEffect(() => {
    const interval = setInterval(() => fetchWallet(true), 10000)
    return () => clearInterval(interval)
  }, [fetchWallet])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    )
  }
  
  if (!walletData) {
    return <div className="text-center py-8">No wallet data found</div>
  }
  
  return (
    <div className="max-w-7xl mx-auto space-y-6 px-2 sm:px-4">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">💰 My PPC Wallet</h1>
            <p className="text-sm sm:text-base opacity-90">Role: <span className="font-semibold uppercase">{walletData.role}</span></p>
          </div>
          <button
            onClick={() => fetchWallet(false)}
            style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.4)", color:"#fff", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:12, fontWeight:700 }}
          >
            🔄 Refresh
            {lastRefresh && (
              <span style={{ display:"block", fontSize:9, opacity:0.8, marginTop:1 }}>
                {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* PPC Rate Info */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Current PPC Rate</p>
            <p className="text-3xl font-bold">₹{walletData.currentPPCRate}</p>
            <p className="text-xs opacity-75 mt-1">per PPC</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Your Share</p>
            <p className="text-2xl font-bold">
              {walletData.role === "seller" ? "50%" : "25%"}
            </p>
            <p className="text-xs opacity-75 mt-1">of PPC value</p>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Total PPC Earned */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total PPC Earned</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {walletData.totalPPCEarned || 0} <span className="text-xl font-semibold text-green-400">PPC</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Est: ₹{((walletData.totalPPCEarned || 0) * walletData.currentPPCRate * 0.5).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Total Withdrawn */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                {walletData.totalWithdrawn || 0} <span className="text-xl font-semibold text-blue-400">PPC</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Est: ₹{((walletData.totalWithdrawn || 0) * walletData.currentPPCRate * 0.25).toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
      </div>

      {/* ✅ NOTE: User Wallet aur Direct Seller Wallet ab poori tarah alag-alag
          level settings use karte hain (admin PPC Settings se) — isliye combined
          summary hata diya, ab har wallet apna level apne card ke andar dikhayega */}
      
      {/* Wallets Section */}
      {walletData.wallets && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Wallets</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ alignItems:"stretch" }}>
            
            {Object.entries(walletData.wallets).map(([key, wallet]) => (
              <div 
                key={key} 
                className={`
                  bg-white rounded-lg shadow-md border-l-4 p-4 sm:p-6
                  ${wallet.withdrawable ? 'border-green-500' : 'border-orange-500'}
                `}
                style={{ display:"flex", flexDirection:"column" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                      {key === "distributorWallet" && "📊 Distributor Wallet"}
                      {key === "sellerWallet" && "💼 Direct Seller Wallet"}
                      {key === "userWallet" && "👤 User Wallet"}
                    </h3>
                  </div>
                  
                  {wallet.withdrawable ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold ml-2">
                      Withdrawable
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold ml-2">
                      Locked
                    </span>
                  )}
                </div>
                
                {/* Distributor Wallet — Level Progression */}
                {key === "distributorWallet" ? (
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:"#f59e0b", textTransform:"uppercase", letterSpacing:"0.05em" }}>
                          🔒 Distributor Wallet
                        </div>
                        <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>
                          Withdraw nahi hoga — Level progression ke liye
                        </div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, background:"#fff7ed", color:"#c2410c", border:"1px solid #fed7aa", borderRadius:99, padding:"2px 10px" }}>
                        Locked 🔒
                      </span>
                    </div>

                    {/* PPC Balance */}
                    <div style={{ background:"linear-gradient(135deg,#f8fafc,#f1f5f9)", borderRadius:10, padding:"12px 16px", marginBottom:12 }}>
                      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:4 }}>Network PPC Collected</div>
                      <div style={{ fontSize:28, fontWeight:800, color:"#1e293b" }}>
                        {wallet.ppcCount || 0} <span style={{ fontSize:14, fontWeight:500 }}>PPC</span>
                      </div>
                    </div>

                    {/* Current Level Badge */}
                    <div style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius:10, padding:"10px 14px", marginBottom:12, color:"#fff" }}>
                      <div style={{ fontSize:10, opacity:0.8, marginBottom:2 }}>Current Level</div>
                      <div style={{ fontSize:16, fontWeight:800 }}>
                        {wallet.currentLevelName || "Distributor"}
                      </div>
                    </div>

                    {/* Progress to next level */}
                    {wallet.nextLevelName ? (
                      <div style={{ marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ fontSize:11, fontWeight:600, color:"#374151" }}>
                            Next: <span style={{ color:"#7c3aed" }}>{wallet.nextLevelName}</span>
                          </span>
                          <span style={{ fontSize:11, fontWeight:700, color:"#7c3aed" }}>
                            {wallet.ppcCount || 0} / {wallet.nextThreshold} PPC
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div style={{ height:10, background:"#e9d5ff", borderRadius:99, overflow:"hidden" }}>
                          <div style={{
                            height:"100%",
                            width:`${wallet.progress || 0}%`,
                            background:"linear-gradient(90deg,#7c3aed,#a855f7)",
                            borderRadius:99,
                            transition:"width 0.5s ease"
                          }}/>
                        </div>
                        <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>
                          {wallet.nextThreshold - (wallet.ppcCount || 0)} PPC aur chahiye level up ke liye
                        </div>
                      </div>
                    ) : (
                      <div style={{ background:"#fefce8", border:"1px solid #fde047", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#92400e", fontWeight:600 }}>
                        🏆 Maximum level achieve kar liya!
                      </div>
                    )}

                    {/* All levels + Rewards */}
                    <div style={{ marginTop:8 }}>
                      <button
                        onClick={() => setShowRoadmap(p => ({ ...p, [key]: !p[key] }))}
                        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background:"none", border:"none", cursor:"pointer", padding:"6px 0 4px", marginBottom:2 }}
                      >
                        <span style={{ fontSize:10, color:"#94a3b8", fontWeight:700, letterSpacing:0.8 }}>LEVEL ROADMAP & REWARDS</span>
                        <span style={{ fontSize:11, color:"#a78bfa", fontWeight:600 }}>{showRoadmap[key] ? "▲ Chhupao" : "▼ Dikhao"}</span>
                      </button>
                      {showRoadmap[key] && wallet.thresholds && Object.entries(wallet.thresholds).map(([lvlKey, threshold], li) => {
                        const lvlNum   = parseInt(lvlKey.replace("level",""))
                        const lvlName  = wallet.levelNames?.[lvlKey] || lvlKey
                        const reward   = wallet.levelRewards?.[lvlKey] || ""
                        const done     = (wallet.ppcCount || 0) >= threshold
                        const current  = wallet.currentLevel === lvlNum
                        return (
                          <div key={lvlKey} style={{
                            padding:"8px 10px", borderRadius:8, marginBottom:4,
                            background: current ? "#f5f3ff" : done ? "#f0fdf4" : "#f8fafc",
                            border: current ? "1.5px solid #c4b5fd" : done ? "1px solid #86efac" : "1px solid #e2e8f0"
                          }}>
                            <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                              <span style={{ fontSize:15, marginTop:1, flexShrink:0 }}>
                                {done ? "✅" : current ? "🔵" : "⭕"}
                              </span>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:11, fontWeight: current ? 800 : 600, color: current ? "#7c3aed" : "#374151", lineHeight:"1.4" }}>
                                  {lvlName}
                                </div>
                                {reward && (
                                  <div style={{ fontSize:10, color: done ? "#15803d" : "#94a3b8", marginTop:2, fontWeight:600, lineHeight:"1.4" }}>
                                    {done ? "🎁 " : "💡 "}{reward}
                                  </div>
                                )}
                              </div>
                              <span style={{ fontSize:10, color:"#94a3b8", fontWeight:700, whiteSpace:"nowrap", flexShrink:0, marginTop:2 }}>
                                {threshold} PPC
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div style={{ marginTop:10, fontSize:10, background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:8, padding:"8px 12px", color:"#92400e" }}>
                      ℹ️ Jab aapke neeche wale distributor ki network mein sale hoti hai, to yahan PPC add hoti hai.
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Regular Wallet — PPC Balance */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-600 mb-1">PPC Balance</p>
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {wallet.ppcCount || 0} <span className="text-xl">PPC</span>
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-600">Your Share:</p>
                        <p className="text-sm font-bold text-purple-600">{wallet.percentage}%</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600">Estimated Value:</p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{wallet.estimatedValue?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        = {wallet.ppcCount} PPC × ₹{walletData.currentPPCRate} × {wallet.percentage}%
                      </p>
                    </div>

                    {/* ✅ Distributor ke Direct Seller Wallet mein level roadmap */}
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
                        <div style={{ marginBottom:14 }}>
                          {/* Current Level Badge */}
                          <div style={{ background:"linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius:10, padding:"10px 14px", marginBottom:10, color:"#fff" }}>
                            <div style={{ fontSize:10, opacity:0.8, marginBottom:2 }}>Current Level</div>
                            <div style={{ fontSize:16, fontWeight:800 }}>{currentLevelName}</div>
                          </div>
                          {/* Progress */}
                          {nextLevelName ? (
                            <div style={{ marginBottom:10 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                                <span style={{ fontSize:11, fontWeight:600, color:"#374151" }}>
                                  Next: <span style={{ color:"#2563eb" }}>{nextLevelName}</span>
                                </span>
                                <span style={{ fontSize:11, fontWeight:700, color:"#2563eb" }}>{ppc} / {nextThreshold} PPC</span>
                              </div>
                              <div style={{ height:10, background:"#bfdbfe", borderRadius:99, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#2563eb,#7c3aed)", borderRadius:99, transition:"width 0.5s ease" }}/>
                              </div>
                              <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>
                                {nextThreshold - ppc} PPC aur chahiye level up ke liye
                              </div>
                            </div>
                          ) : (
                            <div style={{ background:"#fefce8", border:"1px solid #fde047", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#92400e", fontWeight:600, marginBottom:10 }}>
                              👑 Maximum level achieve kar liya!
                            </div>
                          )}
                          {/* Roadmap collapsible */}
                          <button
                            onClick={() => setShowRoadmap(p => ({ ...p, [`${key}_dist`]: !p[`${key}_dist`] }))}
                            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background:"none", border:"none", cursor:"pointer", padding:"6px 0 4px", marginBottom:2 }}
                          >
                            <span style={{ fontSize:10, color:"#94a3b8", fontWeight:700, letterSpacing:0.8 }}>LEVEL ROADMAP & REWARDS</span>
                            <span style={{ fontSize:11, color:"#60a5fa", fontWeight:600 }}>{showRoadmap[`${key}_dist`] ? "▲ Chhupao" : "▼ Dikhao"}</span>
                          </button>
                          {showRoadmap[`${key}_dist`] && sortedLevels.map(({ n, v }) => {
                            const lvlName = levelNames[`level${n}`]   || `Level ${n}`
                            const reward  = levelRewards[`level${n}`] || ""
                            const done    = ppc >= v
                            const current = currentLevel === n
                            return (
                              <div key={n} style={{
                                padding:"8px 10px", borderRadius:8, marginBottom:4,
                                background: current ? "#eff6ff" : done ? "#f0fdf4" : "#f8fafc",
                                border: current ? "1.5px solid #93c5fd" : done ? "1px solid #86efac" : "1px solid #e2e8f0"
                              }}>
                                <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                                  <span style={{ fontSize:15, marginTop:1, flexShrink:0 }}>{done ? "✅" : current ? "🔹" : "○"}</span>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontSize:11, fontWeight: current ? 800 : 600, color: current ? "#1d4ed8" : "#374151", lineHeight:"1.4" }}>
                                      {lvlName}
                                    </div>
                                    {reward && (
                                      <div style={{ fontSize:10, color: done ? "#15803d" : "#94a3b8", marginTop:2, fontWeight:600, lineHeight:"1.4" }}>
                                        {done ? "🎁 " : "💡 "}{reward}
                                      </div>
                                    )}
                                  </div>
                                  <span style={{ fontSize:10, color:"#94a3b8", fontWeight:700, whiteSpace:"nowrap", flexShrink:0, marginTop:2 }}>{v} PPC</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}

                    {/* ✅ Seller ke User Wallet mein apna alag level roadmap */}
                    {key === "userWallet" && walletData.role === "seller" && walletData.userWalletLevelUpThresholds && Object.keys(walletData.userWalletLevelUpThresholds).length > 0 && (() => {
                      const thresholds   = walletData.userWalletLevelUpThresholds
                      const levelNames   = walletData.userWalletLevelNames   || {}
                      const levelRewards = walletData.userWalletLevelRewards || {}
                      const ppc          = wallet.ppcCount || 0
                      let currentLevel   = 0
                      const sortedLevels = Object.entries(thresholds)
                        .map(([k,v]) => ({ n: parseInt(k.replace("level","")), v }))
                        .sort((a,b) => a.n - b.n)
                      sortedLevels.forEach(({ n, v }) => { if (ppc >= v) currentLevel = n })
                      const currentLevelName = levelNames[`level${currentLevel}`] || (currentLevel === 0 ? "User" : `Level ${currentLevel}`)
                      const nextLvl          = sortedLevels.find(l => l.n > currentLevel)
                      const nextLevelName    = nextLvl ? (levelNames[`level${nextLvl.n}`] || `Level ${nextLvl.n}`) : null
                      const nextThreshold    = nextLvl?.v || null
                      const progress         = nextThreshold ? Math.min(100, Math.round(ppc / nextThreshold * 100)) : 100
                      return (
                        <div style={{ marginBottom:14 }}>
                          <div style={{ background:"linear-gradient(135deg,#0ea5e9,#2563eb)", borderRadius:10, padding:"10px 14px", marginBottom:10, color:"#fff" }}>
                            <div style={{ fontSize:10, opacity:0.8, marginBottom:2 }}>Current Level</div>
                            <div style={{ fontSize:16, fontWeight:800 }}>{currentLevelName}</div>
                          </div>
                          {nextLevelName ? (
                            <div style={{ marginBottom:10 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                                <span style={{ fontSize:11, fontWeight:600, color:"#374151" }}>
                                  Next: <span style={{ color:"#0ea5e9" }}>{nextLevelName}</span>
                                </span>
                                <span style={{ fontSize:11, fontWeight:700, color:"#0ea5e9" }}>{ppc} / {nextThreshold} PPC</span>
                              </div>
                              <div style={{ height:10, background:"#bae6fd", borderRadius:99, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#0ea5e9,#2563eb)", borderRadius:99, transition:"width 0.5s ease" }}/>
                              </div>
                              <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>
                                {nextThreshold - ppc} PPC aur chahiye level up ke liye
                              </div>
                            </div>
                          ) : (
                            <div style={{ background:"#fefce8", border:"1px solid #fde047", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#92400e", fontWeight:600, marginBottom:10 }}>
                              👑 Maximum level achieve kar liya!
                            </div>
                          )}
                          <button
                            onClick={() => setShowRoadmap(p => ({ ...p, [`${key}_user`]: !p[`${key}_user`] }))}
                            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background:"none", border:"none", cursor:"pointer", padding:"6px 0 4px", marginBottom:2 }}
                          >
                            <span style={{ fontSize:10, color:"#94a3b8", fontWeight:700, letterSpacing:0.8 }}>LEVEL ROADMAP & REWARDS</span>
                            <span style={{ fontSize:11, color:"#38bdf8", fontWeight:600 }}>{showRoadmap[`${key}_user`] ? "▲ Chhupao" : "▼ Dikhao"}</span>
                          </button>
                          {showRoadmap[`${key}_user`] && sortedLevels.map(({ n, v }) => {
                            const lvlName = levelNames[`level${n}`]   || `Level ${n}`
                            const reward  = levelRewards[`level${n}`] || ""
                            const done    = ppc >= v
                            const current = currentLevel === n
                            return (
                              <div key={n} style={{
                                padding:"8px 10px", borderRadius:8, marginBottom:4,
                                background: current ? "#eff6ff" : done ? "#f0fdf4" : "#f8fafc",
                                border: current ? "1.5px solid #93c5fd" : done ? "1px solid #86efac" : "1px solid #e2e8f0"
                              }}>
                                <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                                  <span style={{ fontSize:15, marginTop:1, flexShrink:0 }}>{done ? "✅" : current ? "🔹" : "○"}</span>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontSize:11, fontWeight: current ? 800 : 600, color: current ? "#0369a1" : "#374151", lineHeight:"1.4" }}>
                                      {lvlName}
                                    </div>
                                    {reward && (
                                      <div style={{ fontSize:10, color: done ? "#15803d" : "#94a3b8", marginTop:2, fontWeight:600, lineHeight:"1.4" }}>
                                        {done ? "🎁 " : "💡 "}{reward}
                                      </div>
                                    )}
                                  </div>
                                  <span style={{ fontSize:10, color:"#94a3b8", fontWeight:700, whiteSpace:"nowrap", flexShrink:0, marginTop:2 }}>{v} PPC</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}

                    {/* ✅ Seller ke apne Direct Seller Wallet mein alag level roadmap */}
                    {key === "sellerWallet" && walletData.role === "seller" && walletData.sellerLevelUpThresholds && Object.keys(walletData.sellerLevelUpThresholds).length > 0 && (() => {
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
                        <div style={{ marginBottom:14 }}>
                          <div style={{ background:"linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius:10, padding:"10px 14px", marginBottom:10, color:"#fff" }}>
                            <div style={{ fontSize:10, opacity:0.8, marginBottom:2 }}>Current Level</div>
                            <div style={{ fontSize:16, fontWeight:800 }}>{currentLevelName}</div>
                          </div>
                          {nextLevelName ? (
                            <div style={{ marginBottom:10 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                                <span style={{ fontSize:11, fontWeight:600, color:"#374151" }}>
                                  Next: <span style={{ color:"#2563eb" }}>{nextLevelName}</span>
                                </span>
                                <span style={{ fontSize:11, fontWeight:700, color:"#2563eb" }}>{ppc} / {nextThreshold} PPC</span>
                              </div>
                              <div style={{ height:10, background:"#bfdbfe", borderRadius:99, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#2563eb,#7c3aed)", borderRadius:99, transition:"width 0.5s ease" }}/>
                              </div>
                              <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>
                                {nextThreshold - ppc} PPC aur chahiye level up ke liye
                              </div>
                            </div>
                          ) : (
                            <div style={{ background:"#fefce8", border:"1px solid #fde047", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#92400e", fontWeight:600, marginBottom:10 }}>
                              👑 Maximum level achieve kar liya!
                            </div>
                          )}
                          <button
                            onClick={() => setShowRoadmap(p => ({ ...p, [`${key}_seller`]: !p[`${key}_seller`] }))}
                            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background:"none", border:"none", cursor:"pointer", padding:"6px 0 4px", marginBottom:2 }}
                          >
                            <span style={{ fontSize:10, color:"#94a3b8", fontWeight:700, letterSpacing:0.8 }}>LEVEL ROADMAP & REWARDS</span>
                            <span style={{ fontSize:11, color:"#60a5fa", fontWeight:600 }}>{showRoadmap[`${key}_seller`] ? "▲ Chhupao" : "▼ Dikhao"}</span>
                          </button>
                          {showRoadmap[`${key}_seller`] && sortedLevels.map(({ n, v }) => {
                            const lvlName = levelNames[`level${n}`]   || `Level ${n}`
                            const reward  = levelRewards[`level${n}`] || ""
                            const done    = ppc >= v
                            const current = currentLevel === n
                            return (
                              <div key={n} style={{
                                padding:"8px 10px", borderRadius:8, marginBottom:4,
                                background: current ? "#eff6ff" : done ? "#f0fdf4" : "#f8fafc",
                                border: current ? "1.5px solid #93c5fd" : done ? "1px solid #86efac" : "1px solid #e2e8f0"
                              }}>
                                <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                                  <span style={{ fontSize:15, marginTop:1, flexShrink:0 }}>{done ? "✅" : current ? "🔹" : "○"}</span>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontSize:11, fontWeight: current ? 800 : 600, color: current ? "#1d4ed8" : "#374151", lineHeight:"1.4" }}>
                                      {lvlName}
                                    </div>
                                    {reward && (
                                      <div style={{ fontSize:10, color: done ? "#15803d" : "#94a3b8", marginTop:2, fontWeight:600, lineHeight:"1.4" }}>
                                        {done ? "🎁 " : "💡 "}{reward}
                                      </div>
                                    )}
                                  </div>
                                  <span style={{ fontSize:10, color:"#94a3b8", fontWeight:700, whiteSpace:"nowrap", flexShrink:0, marginTop:2 }}>{v} PPC</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}

                    {wallet.withdrawable && wallet.ppcCount > 0 && (
                      <button
                        onClick={() => setPage("withdrawal-request")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                      >
                        Request Withdrawal
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Commission History - Collapsible */}
      {walletData.history && walletData.history.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => setShowHistory(p => !p)}
            className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50 transition text-left"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">📋 Earnings History</h2>
              <p style={{ fontSize:11, color:"#94a3b8", margin:"2px 0 0" }}>
                Har entry mein — kahan se mila, kaunsa wallet, kya rate tha
              </p>
            </div>
            <span className="text-gray-400 text-lg">{showHistory ? "▲" : "▼"}</span>
          </button>

          {showHistory && (
            <div className="border-t border-gray-100 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">PPC Count</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position / Source</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate × % = Value</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {walletData.history.filter(i => (i.ppcCount || 0) > 0).map((item, idx) => {
                    const rate  = item.ppcBaseRate || walletData.currentPPCRate || 0
                    const pct   = item.percentageShare || 50
                    const rupee = item.rupeeValue || (item.ppcCount * rate * pct / 100)
                    const walletLabel =
                      item.walletType === "userWallet"           ? "User Wallet"
                    : item.walletType === "sellerWalletAsSeller" ? "Direct Seller Wallet"
                    : item.walletType === "sellerWallet"         ? "Direct Seller Wallet"
                    : item.walletType || "—"

                    const posColor =
                      item.positionType === "direct"      ? { bg:"#f0fdf4", color:"#15803d", label:"Direct (user sale)" }
                    : item.positionType === "parent"      ? { bg:"#eff6ff", color:"#1d4ed8", label:"Parent Seller"       }
                    : item.positionType === "distributor" ? { bg:"#faf5ff", color:"#7c3aed", label:"Distributor"         }
                    : { bg:"#f8fafc", color:"#64748b", label: item.positionType }

                    return (
                      <tr key={idx} style={{ background: idx%2===0?"#fff":"#fafafa" }}>

                        {/* Date */}
                        <td style={{ padding:"10px 12px", fontSize:11, color:"#64748b", whiteSpace:"nowrap" }}>
                          <div>{new Date(item.createdAt).toLocaleDateString("en-IN")}</div>
                          <div style={{ color:"#94a3b8" }}>{new Date(item.createdAt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}</div>
                        </td>

                        {/* PPC Count */}
                        <td style={{ padding:"10px 12px" }}>
                          <span style={{ fontWeight:800, fontSize:14, color:"#7c3aed" }}>{item.ppcCount}</span>
                          <span style={{ fontSize:11, color:"#94a3b8", marginLeft:3 }}>PPC</span>
                        </td>

                        {/* Position */}
                        <td style={{ padding:"10px 12px" }}>
                          <span style={{ fontSize:11, fontWeight:700, background:posColor.bg, color:posColor.color, borderRadius:6, padding:"2px 8px" }}>
                            {posColor.label}
                          </span>
                          <div style={{ fontSize:10, color:"#94a3b8", marginTop:3 }}>
                            Share: <b>{pct}%</b>
                          </div>
                        </td>

                        {/* Rate × % = Value */}
                        <td style={{ padding:"10px 12px" }}>
                          <div style={{ fontWeight:800, fontSize:13, color:"#16a34a" }}>
                            ₹{rupee.toFixed(2)}
                          </div>
                          <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>
                            {item.ppcCount} PPC × ₹{rate} × {pct}%
                          </div>
                        </td>

                        {/* Wallet type */}
                        <td style={{ padding:"10px 12px" }}>
                          <span style={{ fontSize:10, background:"#f1f5f9", color:"#475569", borderRadius:4, padding:"2px 7px", fontWeight:600 }}>
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