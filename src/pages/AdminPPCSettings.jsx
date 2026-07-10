import { useState, useEffect } from "react"

export default function AdminPPCSettings() {
  
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState(null)
  const [message, setMessage] = useState({ type: "", text: "" })
  
  const [formData, setFormData] = useState({
    basePPCValue: "",
    directRate: "",
    parentRate: "",
    distributorRate: "",
    minimumWithdrawal: "",
    level1Threshold: "",
    level2Threshold: "",
    level3Threshold: "",
    level4Threshold: "",
    level0Name: "",
    level1Name: "",
    level2Name: "",
    level3Name: "",
    level4Name: "",
    // ✅ Level rewards — admin control
    level1Reward: "",
    level2Reward: "",
    level3Reward: "",
    level4Reward: "",
    // ✅ User Wallet Level Settings (separate from Direct Seller Wallet)
    userWalletLevel1Threshold: "",
    userWalletLevel2Threshold: "",
    userWalletLevel3Threshold: "",
    userWalletLevel4Threshold: "",
    userWalletLevel0Name: "",
    userWalletLevel1Name: "",
    userWalletLevel2Name: "",
    userWalletLevel3Name: "",
    userWalletLevel4Name: "",
    userWalletLevel1Reward: "",
    userWalletLevel2Reward: "",
    userWalletLevel3Reward: "",
    userWalletLevel4Reward: "",
    // ✅ Distributor's OWN Direct Seller Wallet — separate from Seller's Direct Seller Wallet
    distSellerLevel1Threshold: "",
    distSellerLevel2Threshold: "",
    distSellerLevel3Threshold: "",
    distSellerLevel4Threshold: "",
    distSellerLevel0Name: "",
    distSellerLevel1Name: "",
    distSellerLevel2Name: "",
    distSellerLevel3Name: "",
    distSellerLevel4Name: "",
    distSellerLevel1Reward: "",
    distSellerLevel2Reward: "",
    distSellerLevel3Reward: "",
    distSellerLevel4Reward: "",
  })
  
  useEffect(() => {
    fetchSettings()
  }, [])
  
  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ppc-settings`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setFormData({
          basePPCValue:      data.basePPCValue || "",
          directRate:        data.distributionRates?.direct || "",
          parentRate:        data.distributionRates?.parent || "",
          distributorRate:   data.distributionRates?.distributor || "",
          minimumWithdrawal: data.minimumWithdrawal || "",
          level1Threshold:   data.levelUpThresholds?.level1 || 100,
          level2Threshold:   data.levelUpThresholds?.level2 || 500,
          level3Threshold:   data.levelUpThresholds?.level3 || 1000,
          level4Threshold:   data.levelUpThresholds?.level4 || 5000,
          level0Name:        data.levelNames?.level0 || "Distributor",
          level1Name:        data.levelNames?.level1 || "Senior Distributor",
          level2Name:        data.levelNames?.level2 || "Gold Distributor",
          level3Name:        data.levelNames?.level3 || "Platinum Distributor",
          level4Name:        data.levelNames?.level4 || "Diamond Distributor",
          // ✅ Level rewards
          level1Reward:      data.levelRewards?.level1 || "🎁 ₹500 bonus credit",
          level2Reward:      data.levelRewards?.level2 || "🎁 ₹1500 bonus credit",
          level3Reward:      data.levelRewards?.level3 || "🎁 ₹3000 + free kit",
          level4Reward:      data.levelRewards?.level4 || "🎁 ₹10000 + trip",
          // ✅ Seller Level Settings
          sellerLevel1Threshold: data.sellerLevelUpThresholds?.level1 || 50,
          sellerLevel2Threshold: data.sellerLevelUpThresholds?.level2 || 200,
          sellerLevel3Threshold: data.sellerLevelUpThresholds?.level3 || 500,
          sellerLevel4Threshold: data.sellerLevelUpThresholds?.level4 || 2000,
          sellerLevel0Name:   data.sellerLevelNames?.level0 || "Seller",
          sellerLevel1Name:   data.sellerLevelNames?.level1 || "Silver Seller",
          sellerLevel2Name:   data.sellerLevelNames?.level2 || "Gold Seller",
          sellerLevel3Name:   data.sellerLevelNames?.level3 || "Platinum Seller",
          sellerLevel4Name:   data.sellerLevelNames?.level4 || "Diamond Seller",
          sellerLevel1Reward: data.sellerLevelRewards?.level1 || "🎁 ₹250 bonus credit",
          sellerLevel2Reward: data.sellerLevelRewards?.level2 || "🎁 ₹750 bonus credit",
          sellerLevel3Reward: data.sellerLevelRewards?.level3 || "🎁 ₹1500 + free kit",
          sellerLevel4Reward: data.sellerLevelRewards?.level4 || "🎁 ₹5000 + trip",
          // ✅ User Wallet Level Settings (separate from Direct Seller Wallet)
          userWalletLevel1Threshold: data.userWalletLevelUpThresholds?.level1 || 50,
          userWalletLevel2Threshold: data.userWalletLevelUpThresholds?.level2 || 200,
          userWalletLevel3Threshold: data.userWalletLevelUpThresholds?.level3 || 500,
          userWalletLevel4Threshold: data.userWalletLevelUpThresholds?.level4 || 2000,
          userWalletLevel0Name: data.userWalletLevelNames?.level0 || "User",
          userWalletLevel1Name: data.userWalletLevelNames?.level1 || "Silver User",
          userWalletLevel2Name: data.userWalletLevelNames?.level2 || "Gold User",
          userWalletLevel3Name: data.userWalletLevelNames?.level3 || "Platinum User",
          userWalletLevel4Name: data.userWalletLevelNames?.level4 || "Diamond User",
          userWalletLevel1Reward: data.userWalletLevelRewards?.level1 || "🎁 ₹250 bonus credit",
          userWalletLevel2Reward: data.userWalletLevelRewards?.level2 || "🎁 ₹750 bonus credit",
          userWalletLevel3Reward: data.userWalletLevelRewards?.level3 || "🎁 ₹1500 + free kit",
          userWalletLevel4Reward: data.userWalletLevelRewards?.level4 || "🎁 ₹5000 + trip",
          // ✅ Distributor's OWN Direct Seller Wallet — separate from Seller's Direct Seller Wallet
          distSellerLevel1Threshold: data.distSellerLevelUpThresholds?.level1 || 50,
          distSellerLevel2Threshold: data.distSellerLevelUpThresholds?.level2 || 200,
          distSellerLevel3Threshold: data.distSellerLevelUpThresholds?.level3 || 500,
          distSellerLevel4Threshold: data.distSellerLevelUpThresholds?.level4 || 2000,
          distSellerLevel0Name: data.distSellerLevelNames?.level0 || "Seller",
          distSellerLevel1Name: data.distSellerLevelNames?.level1 || "Silver Seller",
          distSellerLevel2Name: data.distSellerLevelNames?.level2 || "Gold Seller",
          distSellerLevel3Name: data.distSellerLevelNames?.level3 || "Platinum Seller",
          distSellerLevel4Name: data.distSellerLevelNames?.level4 || "Diamond Seller",
          distSellerLevel1Reward: data.distSellerLevelRewards?.level1 || "🎁 ₹250 bonus credit",
          distSellerLevel2Reward: data.distSellerLevelRewards?.level2 || "🎁 ₹750 bonus credit",
          distSellerLevel3Reward: data.distSellerLevelRewards?.level3 || "🎁 ₹1500 + free kit",
          distSellerLevel4Reward: data.distSellerLevelRewards?.level4 || "🎁 ₹5000 + trip",
        })
      }
      
    } catch (err) {
      console.error("Fetch settings error:", err)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setMessage({ type: "", text: "" })
      
      const token = localStorage.getItem("token")
      if (!token) {
        setMessage({ type: "error", text: "Unauthorized" })
        setLoading(false)
        return
      }
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ppc-settings/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          basePPCValue: formData.basePPCValue,
          distributionRates: {
            direct:      formData.directRate,
            parent:      formData.parentRate,
            distributor: formData.distributorRate
          },
          minimumWithdrawal: formData.minimumWithdrawal,
          levelUpThresholds: {
            level1: Number(formData.level1Threshold),
            level2: Number(formData.level2Threshold),
            level3: Number(formData.level3Threshold),
            level4: Number(formData.level4Threshold),
          },
          levelNames: {
            level0: formData.level0Name,
            level1: formData.level1Name,
            level2: formData.level2Name,
            level3: formData.level3Name,
            level4: formData.level4Name,
          },
          // ✅ Level rewards — admin control
          levelRewards: {
            level1: formData.level1Reward,
            level2: formData.level2Reward,
            level3: formData.level3Reward,
            level4: formData.level4Reward,
          },
          // ✅ Seller Level Settings
          sellerLevelUpThresholds: {
            level1: Number(formData.sellerLevel1Threshold),
            level2: Number(formData.sellerLevel2Threshold),
            level3: Number(formData.sellerLevel3Threshold),
            level4: Number(formData.sellerLevel4Threshold),
          },
          sellerLevelNames: {
            level0: formData.sellerLevel0Name,
            level1: formData.sellerLevel1Name,
            level2: formData.sellerLevel2Name,
            level3: formData.sellerLevel3Name,
            level4: formData.sellerLevel4Name,
          },
          sellerLevelRewards: {
            level1: formData.sellerLevel1Reward,
            level2: formData.sellerLevel2Reward,
            level3: formData.sellerLevel3Reward,
            level4: formData.sellerLevel4Reward,
          },
          // ✅ User Wallet Level Settings (separate from Direct Seller Wallet)
          userWalletLevelUpThresholds: {
            level1: Number(formData.userWalletLevel1Threshold),
            level2: Number(formData.userWalletLevel2Threshold),
            level3: Number(formData.userWalletLevel3Threshold),
            level4: Number(formData.userWalletLevel4Threshold),
          },
          userWalletLevelNames: {
            level0: formData.userWalletLevel0Name,
            level1: formData.userWalletLevel1Name,
            level2: formData.userWalletLevel2Name,
            level3: formData.userWalletLevel3Name,
            level4: formData.userWalletLevel4Name,
          },
          userWalletLevelRewards: {
            level1: formData.userWalletLevel1Reward,
            level2: formData.userWalletLevel2Reward,
            level3: formData.userWalletLevel3Reward,
            level4: formData.userWalletLevel4Reward,
          },
          // ✅ Distributor's OWN Direct Seller Wallet — separate from Seller's Direct Seller Wallet
          distSellerLevelUpThresholds: {
            level1: Number(formData.distSellerLevel1Threshold),
            level2: Number(formData.distSellerLevel2Threshold),
            level3: Number(formData.distSellerLevel3Threshold),
            level4: Number(formData.distSellerLevel4Threshold),
          },
          distSellerLevelNames: {
            level0: formData.distSellerLevel0Name,
            level1: formData.distSellerLevel1Name,
            level2: formData.distSellerLevel2Name,
            level3: formData.distSellerLevel3Name,
            level4: formData.distSellerLevel4Name,
          },
          distSellerLevelRewards: {
            level1: formData.distSellerLevel1Reward,
            level2: formData.distSellerLevel2Reward,
            level3: formData.distSellerLevel3Reward,
            level4: formData.distSellerLevel4Reward,
          }
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: "success", text: "PPC settings updated successfully!" })
        setSettings(data.settings)
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update" })
      }
      
    } catch (err) {
      console.error("Update error:", err)
      setMessage({ type: "error", text: "Failed to update settings" })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-4">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">⚙️ PPC Settings</h1>
        <p className="text-sm sm:text-base opacity-90">Configure PPC rates and distribution</p>
      </div>
      
      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">💚 Direct Seller</h3>
          <p className="text-sm text-green-800">Gets 50% of PPC value</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💙 Parent Seller</h3>
          <p className="text-sm text-blue-800">Gets 25% of PPC value</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">💜 Distributor</h3>
          <p className="text-sm text-purple-800">Gets 25% of PPC value</p>
        </div>
        
      </div>
      
      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Configure Rates</h2>
        
        {message.text && (
          <div className={`
            p-4 rounded-lg mb-4
            ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
          `}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Base PPC Value */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Base PPC Value</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1 PPC = ₹ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.basePPCValue}
                onChange={(e) => setFormData({ ...formData, basePPCValue: e.target.value })}
                required
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="40"
              />
              <p className="text-xs text-gray-500 mt-1">
                Base value per PPC (example: ₹40)
              </p>
            </div>
          </div>
          
          {/* Distribution Percentages */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Distribution Rates (%)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Direct Seller */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">
                  Direct Seller (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.directRate}
                  onChange={(e) => setFormData({ ...formData, directRate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="50"
                />
              </div>
              
              {/* Parent */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Parent (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.parentRate}
                  onChange={(e) => setFormData({ ...formData, parentRate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25"
                />
              </div>
              
              {/* Distributor */}
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Distributor (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.distributorRate}
                  onChange={(e) => setFormData({ ...formData, distributorRate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="25"
                />
              </div>
              
            </div>
            
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Total should = 100% (Direct + Parent + Distributor)
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Current Total: {(Number(formData.directRate) + Number(formData.parentRate) + Number(formData.distributorRate))}%
              </p>
            </div>
          </div>
          
          {/* Withdrawal Limit */}
          <div className="pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💳 Withdrawal Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Withdrawal (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.minimumWithdrawal}
                onChange={(e) => setFormData({ ...formData, minimumWithdrawal: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="100"
              />
            </div>
          </div>

          {/* ✅ Level Up Thresholds */}
          <div style={{ marginTop:24, padding:"20px", background:"#faf5ff", borderRadius:12, border:"1px solid #e9d5ff" }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:"#7c3aed", marginBottom:4 }}>🏆 Distributor Level Up Settings</h3>
            <p style={{ fontSize:11, color:"#94a3b8", marginBottom:16 }}>
              Distributor wallet mein kitni PPC ho to next level milega — naam bhi set karo
            </p>

            {/* Level names + thresholds */}
            {[0,1,2,3,4].map(lvl => (
              <div key={lvl} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10, alignItems:"center" }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#7c3aed", display:"block", marginBottom:4 }}>
                    Level {lvl} Name
                  </label>
                  <input
                    type="text"
                    value={formData[`level${lvl}Name`] || ""}
                    onChange={e => setFormData({ ...formData, [`level${lvl}Name`]: e.target.value })}
                    style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #ddd6fe", fontSize:12, boxSizing:"border-box" }}
                    placeholder={`Level ${lvl} naam`}
                  />
                </div>
                {lvl > 0 ? (
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", display:"block", marginBottom:4 }}>
                      PPC Required for Level {lvl}
                    </label>
                    <input
                      type="number"
                      value={formData[`level${lvl}Threshold`] || ""}
                      onChange={e => setFormData({ ...formData, [`level${lvl}Threshold`]: e.target.value })}
                      style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #ddd6fe", fontSize:12, boxSizing:"border-box" }}
                      placeholder="e.g. 100"
                    />
                  </div>
                ) : (
                  <div style={{ fontSize:11, color:"#94a3b8", paddingTop:20 }}>← Starting level (koi threshold nahi)</div>
                )}
              </div>
            ))}
          </div>

          {/* ✅ Level Rewards — Admin Control */}
          <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:12, padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <span style={{ fontSize:18 }}>🎁</span>
              <div>
                <h3 style={{ fontSize:14, fontWeight:800, color:"#15803d", margin:0 }}>Level Rewards</h3>
                <p style={{ fontSize:11, color:"#94a3b8", margin:"2px 0 0" }}>
                  Har level achieve karne par distributor ko kya milega — aap control karo
                </p>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[1,2,3,4].map(n => (
                <div key={n} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#15803d", minWidth:60 }}>
                    Level {n}:
                  </span>
                  <input
                    type="text"
                    value={formData[`level${n}Reward`] || ""}
                    onChange={e => setFormData(p => ({ ...p, [`level${n}Reward`]: e.target.value }))}
                    placeholder={`e.g. 🎁 ₹${[500,1500,3000,10000][n-1]} bonus credit`}
                    style={{ flex:1, border:"1px solid #86efac", borderRadius:8, padding:"7px 12px", fontSize:13, outline:"none", background:"#fff" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 🏢 Distributor's OWN Direct Seller Wallet — Level Up Settings */}
          <div style={{ marginTop:24, padding:"20px", background:"#fff7ed", borderRadius:12, border:"1px solid #fed7aa" }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:"#c2410c", marginBottom:4 }}>🏢 Distributor's Direct Seller Wallet — Level Up Settings</h3>
            <p style={{ fontSize:11, color:"#94a3b8", marginBottom:16 }}>
              Yeh <strong>Distributor</strong> ke apne Direct Seller Wallet (jab distributor khud commission kamaye) ke liye alag settings hain — Seller role ke Direct Seller Wallet se bilkul alag
            </p>
            {[0,1,2,3,4].map(lvl => (
              <div key={lvl} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10, alignItems:"center" }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#c2410c", display:"block", marginBottom:4 }}>
                    Distributor's Seller Wallet Level {lvl} Name
                  </label>
                  <input
                    type="text"
                    value={formData[`distSellerLevel${lvl}Name`] || ""}
                    onChange={e => setFormData({ ...formData, [`distSellerLevel${lvl}Name`]: e.target.value })}
                    style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #fed7aa", fontSize:12, boxSizing:"border-box" }}
                    placeholder={`Level ${lvl} naam`}
                  />
                </div>
                {lvl > 0 ? (
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", display:"block", marginBottom:4 }}>
                      PPC Required for Level {lvl}
                    </label>
                    <input
                      type="number"
                      value={formData[`distSellerLevel${lvl}Threshold`] || ""}
                      onChange={e => setFormData({ ...formData, [`distSellerLevel${lvl}Threshold`]: e.target.value })}
                      style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #fed7aa", fontSize:12, boxSizing:"border-box" }}
                      placeholder="e.g. 50"
                    />
                  </div>
                ) : (
                  <div style={{ fontSize:11, color:"#94a3b8", paddingTop:20 }}>Starting level (koi threshold nahi)</div>
                )}
              </div>
            ))}
          </div>

          {/* 🏆 Distributor's Direct Seller Wallet — Level Rewards */}
          <div style={{ background:"#fff7ed", border:"1.5px solid #fed7aa", borderRadius:12, padding:20, marginTop:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <span style={{ fontSize:18 }}>🏆</span>
              <div>
                <h3 style={{ fontSize:14, fontWeight:800, color:"#c2410c", margin:0 }}>Distributor's Direct Seller Wallet — Level Rewards</h3>
                <p style={{ fontSize:11, color:"#94a3b8", margin:"2px 0 0" }}>
                  Distributor ke apne Direct Seller Wallet ki PPC se level milne par reward
                </p>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[1,2,3,4].map(n => (
                <div key={n} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#c2410c", minWidth:70 }}>
                    Level {n}:
                  </span>
                  <input
                    type="text"
                    value={formData[`distSellerLevel${n}Reward`] || ""}
                    onChange={e => setFormData(p => ({ ...p, [`distSellerLevel${n}Reward`]: e.target.value }))}
                    placeholder={`e.g. ₹${[250,750,1500,5000][n-1]} bonus credit`}
                    style={{ flex:1, border:"1px solid #fed7aa", borderRadius:8, padding:"7px 12px", fontSize:13, outline:"none", background:"#fff" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 🛍️ Seller's OWN Direct Seller Wallet — Level Up Settings */}
          <div style={{ marginTop:24, padding:"20px", background:"#eff6ff", borderRadius:12, border:"1px solid #bfdbfe" }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:"#1d4ed8", marginBottom:4 }}>🛍️ Seller's Direct Seller Wallet — Level Up Settings</h3>
            <p style={{ fontSize:11, color:"#94a3b8", marginBottom:16 }}>
              Yeh <strong>Seller</strong> role ke apne Direct Seller Wallet ke liye hai — Distributor wale se alag
            </p>
            {[0,1,2,3,4].map(lvl => (
              <div key={lvl} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10, alignItems:"center" }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#1d4ed8", display:"block", marginBottom:4 }}>
                    Seller Level {lvl} Name
                  </label>
                  <input
                    type="text"
                    value={formData[`sellerLevel${lvl}Name`] || ""}
                    onChange={e => setFormData({ ...formData, [`sellerLevel${lvl}Name`]: e.target.value })}
                    style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #bfdbfe", fontSize:12, boxSizing:"border-box" }}
                    placeholder={`Seller Level ${lvl} naam`}
                  />
                </div>
                {lvl > 0 ? (
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", display:"block", marginBottom:4 }}>
                      PPC Required for Seller Level {lvl}
                    </label>
                    <input
                      type="number"
                      value={formData[`sellerLevel${lvl}Threshold`] || ""}
                      onChange={e => setFormData({ ...formData, [`sellerLevel${lvl}Threshold`]: e.target.value })}
                      style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #bfdbfe", fontSize:12, boxSizing:"border-box" }}
                      placeholder="e.g. 50"
                    />
                  </div>
                ) : (
                  <div style={{ fontSize:11, color:"#94a3b8", paddingTop:20 }}>Starting level (koi threshold nahi)</div>
                )}
              </div>
            ))}
          </div>

          {/* 🏆 Direct Seller Wallet — Level Rewards */}
          <div style={{ background:"#f0f9ff", border:"1.5px solid #7dd3fc", borderRadius:12, padding:20, marginTop:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <span style={{ fontSize:18 }}>🏆</span>
              <div>
                <h3 style={{ fontSize:14, fontWeight:800, color:"#0369a1", margin:0 }}>Seller's Direct Seller Wallet — Level Rewards</h3>
                <p style={{ fontSize:11, color:"#94a3b8", margin:"2px 0 0" }}>
                  Seller apne Direct Seller Wallet ki PPC se level milne par reward — aap control karo
                </p>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[1,2,3,4].map(n => (
                <div key={n} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#0369a1", minWidth:70 }}>
                    Level {n}:
                  </span>
                  <input
                    type="text"
                    value={formData[`sellerLevel${n}Reward`] || ""}
                    onChange={e => setFormData(p => ({ ...p, [`sellerLevel${n}Reward`]: e.target.value }))}
                    placeholder={`e.g. ₹${[250,750,1500,5000][n-1]} bonus credit`}
                    style={{ flex:1, border:"1px solid #7dd3fc", borderRadius:8, padding:"7px 12px", fontSize:13, outline:"none", background:"#fff" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 👤 User Wallet — Level Up Settings */}
          <div style={{ marginTop:24, padding:"20px", background:"#fdf4ff", borderRadius:12, border:"1px solid #e9d5ff" }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:"#a21caf", marginBottom:4 }}>👤 User Wallet — Level Up Settings</h3>
            <p style={{ fontSize:11, color:"#94a3b8", marginBottom:16 }}>
              Sirf <strong>User Wallet</strong> ki PPC se level calculate hoga — naam aur threshold set karo
            </p>
            {[0,1,2,3,4].map(lvl => (
              <div key={lvl} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10, alignItems:"center" }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#a21caf", display:"block", marginBottom:4 }}>
                    User Wallet Level {lvl} Name
                  </label>
                  <input
                    type="text"
                    value={formData[`userWalletLevel${lvl}Name`] || ""}
                    onChange={e => setFormData({ ...formData, [`userWalletLevel${lvl}Name`]: e.target.value })}
                    style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #e9d5ff", fontSize:12, boxSizing:"border-box" }}
                    placeholder={`User Wallet Level ${lvl} naam`}
                  />
                </div>
                {lvl > 0 ? (
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", display:"block", marginBottom:4 }}>
                      PPC Required for User Wallet Level {lvl}
                    </label>
                    <input
                      type="number"
                      value={formData[`userWalletLevel${lvl}Threshold`] || ""}
                      onChange={e => setFormData({ ...formData, [`userWalletLevel${lvl}Threshold`]: e.target.value })}
                      style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #e9d5ff", fontSize:12, boxSizing:"border-box" }}
                      placeholder="e.g. 50"
                    />
                  </div>
                ) : (
                  <div style={{ fontSize:11, color:"#94a3b8", paddingTop:20 }}>Starting level (koi threshold nahi)</div>
                )}
              </div>
            ))}
          </div>

          {/* 🏆 User Wallet — Level Rewards */}
          <div style={{ background:"#fdf4ff", border:"1.5px solid #e9d5ff", borderRadius:12, padding:20, marginTop:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <span style={{ fontSize:18 }}>🏆</span>
              <div>
                <h3 style={{ fontSize:14, fontWeight:800, color:"#a21caf", margin:0 }}>User Wallet — Level Rewards</h3>
                <p style={{ fontSize:11, color:"#94a3b8", margin:"2px 0 0" }}>
                  User Wallet ki PPC se level milne par reward — aap control karo
                </p>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[1,2,3,4].map(n => (
                <div key={n} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#a21caf", minWidth:70 }}>
                    Level {n}:
                  </span>
                  <input
                    type="text"
                    value={formData[`userWalletLevel${n}Reward`] || ""}
                    onChange={e => setFormData(p => ({ ...p, [`userWalletLevel${n}Reward`]: e.target.value }))}
                    placeholder={`e.g. ₹${[250,750,1500,5000][n-1]} bonus credit`}
                    style={{ flex:1, border:"1px solid #e9d5ff", borderRadius:8, padding:"7px 12px", fontSize:13, outline:"none", background:"#fff" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 rounded-lg font-semibold text-white transition duration-200
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}
            `}
          >
            {loading ? "Updating..." : "💾 Save Settings"}
          </button>
          
        </form>
      </div>
      
      {/* Current Settings Display */}
      {settings && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Current Active Settings</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Base PPC Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{settings.basePPCValue}</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Direct Rate</p>
              <p className="text-2xl font-bold text-gray-900">{settings.distributionRates?.direct}%</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Parent Rate</p>
              <p className="text-2xl font-bold text-gray-900">{settings.distributionRates?.parent}%</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Distributor Rate</p>
              <p className="text-2xl font-bold text-gray-900">{settings.distributionRates?.distributor}%</p>
            </div>
            
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Last updated: {new Date(settings.updatedAt).toLocaleString()}
          </div>
        </div>
      )}
      
    </div>
  )
}