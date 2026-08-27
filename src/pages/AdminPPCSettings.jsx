import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"

export default function AdminPPCSettings() {
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState(null)
  const [message, setMessage] = useState({ type: "", text: "" })
  
  const [formData, setFormData] = useState({
    basePPCValue: "",
    directRate: "",
    parentRate: "",
    distributorRate: "",
    // ⭐ NEW — jab plain "user" khud sale kare (no seller in between)
    userOrderDirectRate: "",
    userOrderDistributorRate: "",
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
          // ⭐ NEW
          userOrderDirectRate:      data.userOrderDistributionRates?.directSeller ?? 50,
          userOrderDistributorRate: data.userOrderDistributionRates?.distributor  ?? 50,
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
          // ⭐ NEW — user's own sale split (no seller in between)
          userOrderDistributionRates: {
            directSeller: formData.userOrderDirectRate,
            distributor:  formData.userOrderDistributorRate
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
    <div className={`space-y-6 select-none max-w-5xl mx-auto transition-colors duration-200 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>
      
      {/* ── HEADER ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDark ? "bg-[#121814] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#fbbf24]/10 text-amber-600 dark:text-[#fbbf24] border border-blue-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ COMMISSION & LEVEL ENGINE
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            PPC Calibration & Reward Settings
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>
            Configure base valuation, commission distribution algorithms, thresholds, and tier milestone rewards.
          </p>
        </div>
      </div>

      {/* ── DISTRIBUTION QUICK CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-4 rounded-2xl border transition-colors ${
          isDark ? "bg-[#111713] border-emerald-500/30" : "bg-white border-emerald-300 shadow-sm"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💚</span>
            <h3 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Direct Seller</h3>
          </div>
          <p className={`text-xs ${isDark ? "text-stone-400" : "text-stone-600"}`}>
            Receives <span className={`font-black ${isDark ? "text-white" : "text-stone-900"}`}>{formData.directRate || 50}%</span> of generated PPC value
          </p>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors ${
          isDark ? "bg-[#111713] border-sky-500/30" : "bg-white border-sky-300 shadow-sm"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💙</span>
            <h3 className="font-bold text-xs text-sky-600 dark:text-sky-400 uppercase tracking-wider">Parent Seller</h3>
          </div>
          <p className={`text-xs ${isDark ? "text-stone-400" : "text-stone-600"}`}>
            Receives <span className={`font-black ${isDark ? "text-white" : "text-stone-900"}`}>{formData.parentRate || 25}%</span> of generated PPC value
          </p>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors ${
          isDark ? "bg-[#111713] border-purple-500/30" : "bg-white border-purple-300 shadow-sm"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💜</span>
            <h3 className="font-bold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider">Distributor</h3>
          </div>
          <p className={`text-xs ${isDark ? "text-stone-400" : "text-stone-600"}`}>
            Receives <span className={`font-black ${isDark ? "text-white" : "text-stone-900"}`}>{formData.distributorRate || 25}%</span> of generated PPC value
          </p>
        </div>
      </div>

      {/* ── SETTINGS FORM ── */}
      <div className={`rounded-3xl border p-5 sm:p-7 shadow-xl ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <h2 className={`text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2 ${
          isDark ? "text-white" : "text-stone-900"
        }`}>
          <span>⚙️</span> Financial & Threshold Parameters
        </h2>

        {message.text && (
          <div className={`p-4 rounded-2xl mb-6 text-xs font-bold border flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30"
          }`}>
            <span>{message.type === "success" ? "✅" : "❌"}</span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Base PPC & Withdrawal */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
          }`}>
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
              isDark ? "text-white" : "text-stone-900"
            }`}>
              <span className="text-blue-500">💰</span> Base PPC Valuation & Payout Constraints
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-400" : "text-stone-600"
                }`}>
                  1 PPC Value (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePPCValue}
                  onChange={(e) => setFormData({ ...formData, basePPCValue: e.target.value })}
                  required
                  className={`w-full px-4 py-2.5 font-mono font-bold border rounded-xl focus:outline-none ${
                    isDark ? "bg-[#121814] text-white border-white/10 focus:border-[#fbbf24]" : "bg-white text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                  placeholder="40"
                />
                <p className="text-[10px] text-stone-400 mt-1">Base rupee exchange value per PPC point</p>
              </div>

              <div>
                <label className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-400" : "text-stone-600"
                }`}>
                  Minimum Withdrawal Limit (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minimumWithdrawal}
                  onChange={(e) => setFormData({ ...formData, minimumWithdrawal: e.target.value })}
                  required
                  className={`w-full px-4 py-2.5 font-mono font-bold border rounded-xl focus:outline-none ${
                    isDark ? "bg-[#121814] text-white border-white/10 focus:border-[#fbbf24]" : "bg-white text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                  placeholder="100"
                />
                <p className="text-[10px] text-stone-400 mt-1">Minimum wallet balance required to request bank payout</p>
              </div>
            </div>
          </div>

          {/* Section 2: Distribution Rates */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
          }`}>
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
              isDark ? "text-white" : "text-stone-900"
            }`}>
              <span className="text-emerald-500">📊</span> Standard Order Distribution Percentages
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                  Direct Seller (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.directRate}
                  onChange={(e) => setFormData({ ...formData, directRate: e.target.value })}
                  required
                  className={`w-full px-3.5 py-2.5 font-bold border rounded-xl focus:outline-none ${
                    isDark ? "bg-[#121814] text-white border-emerald-500/30 focus:border-emerald-400" : "bg-white text-stone-900 border-emerald-300 focus:border-emerald-500 shadow-sm"
                  }`}
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1.5">
                  Parent Seller (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.parentRate}
                  onChange={(e) => setFormData({ ...formData, parentRate: e.target.value })}
                  required
                  className={`w-full px-3.5 py-2.5 font-bold border rounded-xl focus:outline-none ${
                    isDark ? "bg-[#121814] text-white border-sky-500/30 focus:border-sky-400" : "bg-white text-stone-900 border-sky-300 focus:border-sky-500 shadow-sm"
                  }`}
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5">
                  Distributor (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.distributorRate}
                  onChange={(e) => setFormData({ ...formData, distributorRate: e.target.value })}
                  required
                  className={`w-full px-3.5 py-2.5 font-bold border rounded-xl focus:outline-none ${
                    isDark ? "bg-[#121814] text-white border-purple-500/30 focus:border-purple-400" : "bg-white text-stone-900 border-purple-300 focus:border-purple-500 shadow-sm"
                  }`}
                  placeholder="25"
                />
              </div>
            </div>

            <div className="text-[11px] p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-between">
              <span>⚠️ Must sum to exactly 100%</span>
              <span className="font-mono font-bold">
                Current Total: {(Number(formData.directRate || 0) + Number(formData.parentRate || 0) + Number(formData.distributorRate || 0))}%
              </span>
            </div>
          </div>

          {/* Section 3: Direct User Order Distribution */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
          }`}>
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                isDark ? "text-white" : "text-stone-900"
              }`}>
                <span className="text-sky-500">👤</span> User Direct Sale Split (%)
              </h3>
              <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-600"}`}>
                When a plain customer makes a purchase directly without an intermediary seller.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                  Parent Seller / Sponsor (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.userOrderDirectRate}
                  onChange={(e) => setFormData({ ...formData, userOrderDirectRate: e.target.value })}
                  required
                  className={`w-full px-3.5 py-2.5 font-bold border rounded-xl focus:outline-none ${
                    isDark ? "bg-[#121814] text-white border-white/10 focus:border-[#fbbf24]" : "bg-white text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5">
                  Distributor (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.userOrderDistributorRate}
                  onChange={(e) => setFormData({ ...formData, userOrderDistributorRate: e.target.value })}
                  required
                  className={`w-full px-3.5 py-2.5 font-bold border rounded-xl focus:outline-none ${
                    isDark ? "bg-[#121814] text-white border-white/10 focus:border-[#fbbf24]" : "bg-white text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Distributor Level Up Settings */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? "bg-[#121814] border-purple-500/30" : "bg-purple-50/40 border-purple-200"
          }`}>
            <h3 className="text-sm font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <span>🏆</span> Distributor Level Hierarchy & Thresholds
            </h3>

            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map(lvl => (
                <div key={lvl} className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border ${
                  isDark ? "bg-black/40 border-white/[0.04]" : "bg-white border-purple-100 shadow-sm"
                }`}>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                      Level {lvl} Title
                    </label>
                    <input
                      type="text"
                      value={formData[`level${lvl}Name`] || ""}
                      onChange={e => setFormData({ ...formData, [`level${lvl}Name`]: e.target.value })}
                      className={`w-full p-2 text-xs border rounded-lg focus:outline-none focus:border-purple-400 ${
                        isDark ? "bg-[#121814] text-white border-white/10" : "bg-stone-50 text-stone-900 border-stone-200"
                      }`}
                      placeholder={`Level ${lvl} Title`}
                    />
                  </div>
                  {lvl > 0 ? (
                    <div>
                      <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${
                        isDark ? "text-stone-400" : "text-stone-600"
                      }`}>
                        PPC Threshold for Level {lvl}
                      </label>
                      <input
                        type="number"
                        value={formData[`level${lvl}Threshold`] || ""}
                        onChange={e => setFormData({ ...formData, [`level${lvl}Threshold`]: e.target.value })}
                        className={`w-full p-2 text-xs font-mono border rounded-lg focus:outline-none focus:border-purple-400 ${
                          isDark ? "bg-[#121814] text-white border-white/10" : "bg-stone-50 text-stone-900 border-stone-200"
                        }`}
                        placeholder="e.g. 100"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-stone-400 flex items-center pt-4">
                      Initial starting rank (0 threshold)
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Distributor Rewards */}
            <div className="pt-2 border-t border-purple-500/20 space-y-2">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">🎁 Level Milestone Rewards</h4>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="flex items-center gap-3 text-xs">
                  <span className={`font-bold min-w-[70px] ${isDark ? "text-stone-400" : "text-stone-600"}`}>Level {n}:</span>
                  <input
                    type="text"
                    value={formData[`level${n}Reward`] || ""}
                    onChange={e => setFormData(p => ({ ...p, [`level${n}Reward`]: e.target.value }))}
                    placeholder={`e.g. 🎁 ₹${[500, 1500, 3000, 10000][n-1]} bonus credit`}
                    className={`flex-1 p-2 text-xs border rounded-lg focus:outline-none focus:border-emerald-400 ${
                      isDark ? "bg-black/40 text-white border-emerald-500/30" : "bg-white text-stone-900 border-emerald-300"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Seller Level Up Settings */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? "bg-[#121814] border-sky-500/30" : "bg-sky-50/40 border-sky-200"
          }`}>
            <h3 className="text-sm font-black text-sky-700 dark:text-sky-300 uppercase tracking-wider flex items-center gap-2">
              <span>🛍️</span> Seller Direct Wallet Level Hierarchy
            </h3>

            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map(lvl => (
                <div key={lvl} className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border ${
                  isDark ? "bg-black/40 border-white/[0.04]" : "bg-white border-sky-100 shadow-sm"
                }`}>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
                      Seller Level {lvl} Title
                    </label>
                    <input
                      type="text"
                      value={formData[`sellerLevel${lvl}Name`] || ""}
                      onChange={e => setFormData({ ...formData, [`sellerLevel${lvl}Name`]: e.target.value })}
                      className={`w-full p-2 text-xs border rounded-lg focus:outline-none focus:border-sky-400 ${
                        isDark ? "bg-[#121814] text-white border-white/10" : "bg-stone-50 text-stone-900 border-stone-200"
                      }`}
                      placeholder={`Seller Level ${lvl} Title`}
                    />
                  </div>
                  {lvl > 0 ? (
                    <div>
                      <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${
                        isDark ? "text-stone-400" : "text-stone-600"
                      }`}>
                        PPC Threshold for Seller Level {lvl}
                      </label>
                      <input
                        type="number"
                        value={formData[`sellerLevel${lvl}Threshold`] || ""}
                        onChange={e => setFormData({ ...formData, [`sellerLevel${lvl}Threshold`]: e.target.value })}
                        className={`w-full p-2 text-xs font-mono border rounded-lg focus:outline-none focus:border-sky-400 ${
                          isDark ? "bg-[#121814] text-white border-white/10" : "bg-stone-50 text-stone-900 border-stone-200"
                        }`}
                        placeholder="e.g. 50"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-stone-400 flex items-center pt-4">
                      Initial starting rank (0 threshold)
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Seller Rewards */}
            <div className="pt-2 border-t border-sky-500/20 space-y-2">
              <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">🎁 Seller Milestone Rewards</h4>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="flex items-center gap-3 text-xs">
                  <span className={`font-bold min-w-[70px] ${isDark ? "text-stone-400" : "text-stone-600"}`}>Level {n}:</span>
                  <input
                    type="text"
                    value={formData[`sellerLevel${n}Reward`] || ""}
                    onChange={e => setFormData(p => ({ ...p, [`sellerLevel${n}Reward`]: e.target.value }))}
                    placeholder={`e.g. 🎁 ₹${[250, 750, 1500, 5000][n-1]} bonus credit`}
                    className={`flex-1 p-2 text-xs border rounded-lg focus:outline-none focus:border-sky-400 ${
                      isDark ? "bg-black/40 text-white border-sky-500/30" : "bg-white text-stone-900 border-sky-300"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: User Wallet Level Up Settings */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? "bg-[#121814] border-pink-500/30" : "bg-pink-50/40 border-pink-200"
          }`}>
            <h3 className="text-sm font-black text-pink-700 dark:text-pink-300 uppercase tracking-wider flex items-center gap-2">
              <span>👤</span> User Wallet Level Hierarchy & Rewards
            </h3>

            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map(lvl => (
                <div key={lvl} className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border ${
                  isDark ? "bg-black/40 border-white/[0.04]" : "bg-white border-pink-100 shadow-sm"
                }`}>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-1">
                      User Level {lvl} Title
                    </label>
                    <input
                      type="text"
                      value={formData[`userWalletLevel${lvl}Name`] || ""}
                      onChange={e => setFormData({ ...formData, [`userWalletLevel${lvl}Name`]: e.target.value })}
                      className={`w-full p-2 text-xs border rounded-lg focus:outline-none focus:border-pink-400 ${
                        isDark ? "bg-[#121814] text-white border-white/10" : "bg-stone-50 text-stone-900 border-stone-200"
                      }`}
                      placeholder={`User Level ${lvl} Title`}
                    />
                  </div>
                  {lvl > 0 ? (
                    <div>
                      <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${
                        isDark ? "text-stone-400" : "text-stone-600"
                      }`}>
                        PPC Threshold for User Level {lvl}
                      </label>
                      <input
                        type="number"
                        value={formData[`userWalletLevel${lvl}Threshold`] || ""}
                        onChange={e => setFormData({ ...formData, [`userWalletLevel${lvl}Threshold`]: e.target.value })}
                        className={`w-full p-2 text-xs font-mono border rounded-lg focus:outline-none focus:border-pink-400 ${
                          isDark ? "bg-[#121814] text-white border-white/10" : "bg-stone-50 text-stone-900 border-stone-200"
                        }`}
                        placeholder="e.g. 50"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-stone-400 flex items-center pt-4">
                      Initial starting rank (0 threshold)
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* User Rewards */}
            <div className="pt-2 border-t border-pink-500/20 space-y-2">
              <h4 className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">🎁 User Milestone Rewards</h4>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="flex items-center gap-3 text-xs">
                  <span className={`font-bold min-w-[70px] ${isDark ? "text-stone-400" : "text-stone-600"}`}>Level {n}:</span>
                  <input
                    type="text"
                    value={formData[`userWalletLevel${n}Reward`] || ""}
                    onChange={e => setFormData(p => ({ ...p, [`userWalletLevel${n}Reward`]: e.target.value }))}
                    placeholder={`e.g. 🎁 ₹${[250, 750, 1500, 5000][n-1]} bonus credit`}
                    className={`flex-1 p-2 text-xs border rounded-lg focus:outline-none focus:border-pink-400 ${
                      isDark ? "bg-black/40 text-white border-pink-500/30" : "bg-white text-stone-900 border-pink-300"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 ${
              loading
                ? "bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed border border-stone-300 dark:border-white/10"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {loading ? "Saving Configuration..." : "💾 Save & Deploy PPC Configuration"}
          </button>
          
        </form>
      </div>
      
      {/* ── ACTIVE SETTINGS SNAPSHOT ── */}
      {settings && (
        <div className={`rounded-3xl border p-5 sm:p-7 space-y-4 ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <h2 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            <span>⚡</span> Active Deployed Parameters
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className={`p-3.5 rounded-xl border ${
              isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
            }`}>
              <p className={`text-[10px] font-mono uppercase ${isDark ? "text-stone-400" : "text-stone-500"}`}>Base PPC</p>
              <p className="text-lg font-black text-amber-600 dark:text-[#fbbf24] mt-0.5">₹{settings.basePPCValue}</p>
            </div>
            
            <div className={`p-3.5 rounded-xl border ${
              isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
            }`}>
              <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase">Direct Rate</p>
              <p className={`text-lg font-black mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>{settings.distributionRates?.direct}%</p>
            </div>
            
            <div className={`p-3.5 rounded-xl border ${
              isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
            }`}>
              <p className="text-[10px] font-mono text-sky-600 dark:text-sky-400 uppercase">Parent Rate</p>
              <p className={`text-lg font-black mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>{settings.distributionRates?.parent}%</p>
            </div>
            
            <div className={`p-3.5 rounded-xl border ${
              isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
            }`}>
              <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase">Distributor</p>
              <p className={`text-lg font-black mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>{settings.distributionRates?.distributor}%</p>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
            }`}>
              <p className="text-[10px] font-mono text-amber-600 dark:text-blue-400 uppercase">Min Withdraw</p>
              <p className={`text-lg font-black mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>₹{settings.minimumWithdrawal}</p>
            </div>
          </div>
          
          <div className={`text-[10px] font-mono pt-2 border-t ${
            isDark ? "text-stone-500 border-white/[0.04]" : "text-stone-400 border-stone-100"
          }`}>
            Last updated: {new Date(settings.updatedAt).toLocaleString("en-IN")}
          </div>
        </div>
      )}
      
    </div>
  )
}