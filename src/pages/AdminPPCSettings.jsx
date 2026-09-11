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
    userOrderDirectRate: "",
    userOrderDistributorRate: "",
    minimumWithdrawal: "",
  })

  // ✅ Dynamic Level Hierarchies
  const [distLevels, setDistLevels] = useState([
    { level: 0, name: "Distributor", threshold: 0, reward: "" },
    { level: 1, name: "Senior Distributor", threshold: 100, reward: "🎁 ₹500 bonus credit" },
    { level: 2, name: "Gold Distributor", threshold: 500, reward: "🎁 ₹1500 bonus credit" },
    { level: 3, name: "Platinum Distributor", threshold: 1000, reward: "🎁 ₹3000 + free kit" },
    { level: 4, name: "Diamond Distributor", threshold: 5000, reward: "🎁 ₹10000 + trip" },
  ])

  const [sellerLevels, setSellerLevels] = useState([
    { level: 0, name: "Seller", threshold: 0, reward: "" },
    { level: 1, name: "Silver Seller", threshold: 50, reward: "🎁 ₹250 bonus credit" },
    { level: 2, name: "Gold Seller", threshold: 200, reward: "🎁 ₹750 bonus credit" },
    { level: 3, name: "Platinum Seller", threshold: 500, reward: "🎁 ₹1500 + free kit" },
    { level: 4, name: "Diamond Seller", threshold: 2000, reward: "🎁 ₹5000 + trip" },
  ])
  
  const [salaryPayoutBusy, setSalaryPayoutBusy] = useState(false)
  
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
          basePPCValue:             data.basePPCValue || "",
          directRate:               data.distributionRates?.direct || "",
          parentRate:               data.distributionRates?.parent || "",
          distributorRate:          data.distributionRates?.distributor || "",
          userOrderDirectRate:      data.userOrderDistributionRates?.directSeller ?? 50,
          userOrderDistributorRate: data.userOrderDistributionRates?.distributor  ?? 50,
          minimumWithdrawal:        data.minimumWithdrawal || "",
          salaryPayoutDay:          data.salaryPayoutDay ?? 1,
        })

        // Parse distributor levels
        const distThresholds = data.levelUpThresholds || { level1: 100, level2: 500, level3: 1000, level4: 5000 }
        const distNames = data.levelNames || { level0: "Distributor", level1: "Senior Distributor", level2: "Gold Distributor", level3: "Platinum Distributor", level4: "Diamond Distributor" }
        const distRewards = data.levelRewards || { level1: "🎁 ₹500 bonus credit", level2: "🎁 ₹1500 bonus credit", level3: "🎁 ₹3000 + free kit", level4: "🎁 ₹10000 + trip" }

        const distNums = Array.from(new Set([
          ...Object.keys(distThresholds).map(k => parseInt(k.replace("level", ""))),
          ...Object.keys(distNames).map(k => parseInt(k.replace("level", ""))),
          ...Object.keys(distRewards).map(k => parseInt(k.replace("level", "")))
        ])).filter(n => !isNaN(n)).sort((a, b) => a - b)

        if (!distNums.includes(0)) distNums.unshift(0)
        if (distNums.length === 1) [1, 2, 3, 4].forEach(n => distNums.push(n))

        setDistLevels(distNums.map(n => ({
          level: n,
          name: distNames[`level${n}`] || (n === 0 ? "Distributor" : `Level ${n}`),
          threshold: n === 0 ? 0 : (distThresholds[`level${n}`] ?? ""),
          reward: n === 0 ? "" : (distRewards[`level${n}`] ?? "")
        })))

        // Parse seller levels
        const sThresholds = data.sellerLevelUpThresholds || { level1: 50, level2: 200, level3: 500, level4: 2000 }
        const sNames = data.sellerLevelNames || { level0: "Seller", level1: "Silver Seller", level2: "Gold Seller", level3: "Platinum Seller", level4: "Diamond Seller" }
        const sRewards = data.sellerLevelRewards || { level1: "🎁 ₹250 bonus credit", level2: "🎁 ₹750 bonus credit", level3: "🎁 ₹1500 + free kit", level4: "🎁 ₹5000 + trip" }

        const sNums = Array.from(new Set([
          ...Object.keys(sThresholds).map(k => parseInt(k.replace("level", ""))),
          ...Object.keys(sNames).map(k => parseInt(k.replace("level", ""))),
          ...Object.keys(sRewards).map(k => parseInt(k.replace("level", "")))
        ])).filter(n => !isNaN(n)).sort((a, b) => a - b)

        if (!sNums.includes(0)) sNums.unshift(0)
        if (sNums.length === 1) [1, 2, 3, 4].forEach(n => sNums.push(n))

        setSellerLevels(sNums.map(n => ({
          level: n,
          name: sNames[`level${n}`] || (n === 0 ? "Seller" : `Level ${n}`),
          threshold: n === 0 ? 0 : (sThresholds[`level${n}`] ?? ""),
          reward: n === 0 ? "" : (sRewards[`level${n}`] ?? "")
        })))
      }
      
    } catch (err) {
      console.error("Fetch settings error:", err)
    }
  }

  // ✅ Dynamic Level Helpers
  const addDistLevel = () => {
    setDistLevels(prev => {
      const maxLvl = prev.reduce((m, l) => Math.max(m, l.level), 0)
      const nextLvl = maxLvl + 1
      return [
        ...prev,
        {
          level: nextLvl,
          name: `Level ${nextLvl} Distributor`,
          threshold: "",
          reward: `🎁 ₹${(nextLvl * 2500)} bonus credit`
        }
      ]
    })
  }

  const removeDistLevel = (lvlNum) => {
    if (lvlNum <= 1) return
    setDistLevels(prev => prev.filter(l => l.level !== lvlNum))
  }

  const updateDistLevel = (lvlNum, field, value) => {
    setDistLevels(prev => prev.map(l => l.level === lvlNum ? { ...l, [field]: value } : l))
  }

  const addSellerLevel = () => {
    setSellerLevels(prev => {
      const maxLvl = prev.reduce((m, l) => Math.max(m, l.level), 0)
      const nextLvl = maxLvl + 1
      return [
        ...prev,
        {
          level: nextLvl,
          name: `Level ${nextLvl} Seller`,
          threshold: "",
          reward: `🎁 ₹${(nextLvl * 1000)} bonus credit`
        }
      ]
    })
  }

  const removeSellerLevel = (lvlNum) => {
    if (lvlNum <= 1) return
    setSellerLevels(prev => prev.filter(l => l.level !== lvlNum))
  }

  const updateSellerLevel = (lvlNum, field, value) => {
    setSellerLevels(prev => prev.map(l => l.level === lvlNum ? { ...l, [field]: value } : l))
  }
  
  const handleRunSalaryPayout = async () => {
    if (!window.confirm("Kya aap sabhi eligible qualified users ko is mahine ki lifetime salary abhi distribute karna chahte hain?")) return
    try {
      setSalaryPayoutBusy(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ppc-settings/run-salary-payout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert(`✅ Lifetime Salary Payout Success!\nMonth: ${data.month}\nUsers Credited: ${data.creditedCount}\nTotal Amount: ₹${data.totalAmountCredited?.toLocaleString("en-IN")}`)
        fetchSettings()
      } else {
        alert(`❌ ${data.message || data.error || "Payout run failed"}`)
      }
    } catch (e) {
      alert(`Error: ${e.message}`)
    } finally {
      setSalaryPayoutBusy(false)
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
          salaryPayoutDay: Number(formData.salaryPayoutDay) || 1,
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
          levelUpThresholds: Object.fromEntries(
            distLevels.filter(l => l.level > 0).map(l => [`level${l.level}`, Number(l.threshold) || 0])
          ),
          levelNames: Object.fromEntries(
            distLevels.map(l => [`level${l.level}`, l.name || `Level ${l.level}`])
          ),
          levelRewards: Object.fromEntries(
            distLevels.filter(l => l.level > 0).map(l => [`level${l.level}`, l.reward || ""])
          ),
          sellerLevelUpThresholds: Object.fromEntries(
            sellerLevels.filter(l => l.level > 0).map(l => [`level${l.level}`, Number(l.threshold) || 0])
          ),
          sellerLevelNames: Object.fromEntries(
            sellerLevels.map(l => [`level${l.level}`, l.name || `Level ${l.level}`])
          ),
          sellerLevelRewards: Object.fromEntries(
            sellerLevels.filter(l => l.level > 0).map(l => [`level${l.level}`, l.reward || ""])
          ),
          // Backward compatibility mirroring for user wallet settings
          userWalletLevelUpThresholds: Object.fromEntries(
            sellerLevels.filter(l => l.level > 0).map(l => [`level${l.level}`, Number(l.threshold) || 0])
          ),
          userWalletLevelNames: Object.fromEntries(
            sellerLevels.map(l => [`level${l.level}`, l.name || `Level ${l.level}`])
          ),
          userWalletLevelRewards: Object.fromEntries(
            sellerLevels.filter(l => l.level > 0).map(l => [`level${l.level}`, l.reward || ""])
          ),
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

          {/* Section: Monthly Lifetime Salary Payout */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? "bg-black/40 border-purple-500/20" : "bg-purple-50/50 border-purple-200"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                  isDark ? "text-white" : "text-stone-900"
                }`}>
                  <span className="text-purple-400">📅</span> Lifetime Monthly Salary Payout
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-600"}`}>
                  Jinhone level complete karke claim kiya hai, unko har mahine is date ko automatic lifetime salary wallet me add hogi.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunSalaryPayout}
                disabled={salaryPayoutBusy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  salaryPayoutBusy
                    ? "bg-purple-700/50 text-purple-300 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-500 active:scale-95 text-white shadow-md shadow-purple-600/30"
                }`}
              >
                {salaryPayoutBusy ? "Processing..." : "🚀 Run Salary Payout Now"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-400" : "text-stone-600"
                }`}>
                  Monthly Payout Day (1 se 28) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={formData.salaryPayoutDay}
                    onChange={(e) => setFormData({ ...formData, salaryPayoutDay: e.target.value })}
                    required
                    className={`w-full px-4 py-2.5 font-mono font-bold border rounded-xl focus:outline-none ${
                      isDark ? "bg-[#121814] text-white border-white/10 focus:border-purple-400" : "bg-white text-stone-900 border-stone-300 focus:border-purple-500 shadow-sm"
                    }`}
                    placeholder="1"
                  />
                  <span className={`text-xs font-bold whitespace-nowrap ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                    tareekh ko
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">Aap jo bhi tareekh choose karenge, har mahine usi din salary credit hogi</p>
              </div>

              {settings?.lastSalaryPayoutMonth && (
                <div className={`p-3 rounded-xl border flex flex-col justify-center ${
                  isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-stone-200"
                }`}>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Last Payout Processed Month</span>
                  <span className="text-sm font-mono font-bold text-purple-400 mt-1">
                    ✅ {settings.lastSalaryPayoutMonth}
                  </span>
                </div>
              )}
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

          {/* Section 4: Distributor Level Up Settings (Dynamic) */}
          <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
            isDark ? "bg-[#121814] border-purple-500/30" : "bg-purple-50/40 border-purple-200"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🏆</span> Distributor Level Hierarchy & Rewards
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Distributor wallet ke PPC milestones aur unlockable rewards yahan se customize karein
                </p>
              </div>
              <button
                type="button"
                onClick={addDistLevel}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                <span>➕</span> Add Level
              </button>
            </div>

            <div className="space-y-3">
              {distLevels.map(l => (
                <div
                  key={l.level}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDark ? "bg-black/40 border-white/[0.06]" : "bg-white border-purple-100 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-purple-500/10">
                    <span className="font-bold text-xs text-purple-400 font-mono uppercase tracking-wider">
                      {l.level === 0 ? "Initial Starting Rank (Level 0)" : `Level ${l.level} Milestone`}
                    </span>
                    {l.level > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDistLevel(l.level)}
                        className="text-[11px] font-bold text-red-500 hover:text-red-400 px-2 py-0.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        🗑️ Delete Level
                      </button>
                    )}
                  </div>

                  <div className={`grid grid-cols-1 ${l.level > 0 ? "sm:grid-cols-3" : "sm:grid-cols-1"} gap-3`}>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                        Rank Title
                      </label>
                      <input
                        type="text"
                        value={l.name}
                        onChange={e => updateDistLevel(l.level, "name", e.target.value)}
                        className={`w-full p-2.5 text-xs font-bold border rounded-xl focus:outline-none focus:border-purple-400 ${
                          isDark ? "bg-[#121814] text-white border-white/10" : "bg-stone-50 text-stone-900 border-stone-200"
                        }`}
                        placeholder={l.level === 0 ? "Distributor" : `Level ${l.level} Title`}
                      />
                    </div>

                    {l.level > 0 && (
                      <>
                        <div>
                          <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${
                            isDark ? "text-stone-400" : "text-stone-600"
                          }`}>
                            PPC Required
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={l.threshold}
                            onChange={e => updateDistLevel(l.level, "threshold", e.target.value)}
                            className={`w-full p-2.5 text-xs font-mono font-bold border rounded-xl focus:outline-none focus:border-purple-400 ${
                              isDark ? "bg-[#121814] text-white border-white/10" : "bg-stone-50 text-stone-900 border-stone-200"
                            }`}
                            placeholder="e.g. 100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                            Milestone Reward
                          </label>
                          <input
                            type="text"
                            value={l.reward}
                            onChange={e => updateDistLevel(l.level, "reward", e.target.value)}
                            className={`w-full p-2.5 text-xs font-medium border rounded-xl focus:outline-none focus:border-emerald-400 ${
                              isDark ? "bg-[#121814] text-white border-emerald-500/30" : "bg-stone-50 text-stone-900 border-emerald-200"
                            }`}
                            placeholder="e.g. 🎁 ₹500 bonus credit"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Direct Seller Level Up Settings (Dynamic) */}
          <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
            isDark ? "bg-[#121814] border-emerald-500/30" : "bg-emerald-50/40 border-emerald-200"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🌟</span> Direct Seller Level Hierarchy & Rewards (Unified)
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Direct seller ID ke user wallet + direct seller wallet total PPC milestones aur rewards yahan se customize karein
                </p>
              </div>
              <button
                type="button"
                onClick={addSellerLevel}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                <span>➕</span> Add Level
              </button>
            </div>

            <div className="space-y-3">
              {sellerLevels.map(l => (
                <div
                  key={l.level}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDark ? "bg-black/40 border-white/[0.06]" : "bg-white border-emerald-100 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-emerald-500/10">
                    <span className="font-bold text-xs text-emerald-400 font-mono uppercase tracking-wider">
                      {l.level === 0 ? "Initial Starting Rank (Level 0)" : `Level ${l.level} Milestone`}
                    </span>
                    {l.level > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSellerLevel(l.level)}
                        className="text-[11px] font-bold text-red-500 hover:text-red-400 px-2 py-0.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        🗑️ Delete Level
                      </button>
                    )}
                  </div>

                  <div className={`grid grid-cols-1 ${l.level > 0 ? "sm:grid-cols-3" : "sm:grid-cols-1"} gap-3`}>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                        Rank Title
                      </label>
                      <input
                        type="text"
                        value={l.name}
                        onChange={e => updateSellerLevel(l.level, "name", e.target.value)}
                        className={`w-full p-2.5 text-xs font-bold border rounded-xl focus:outline-none focus:border-emerald-400 ${
                          isDark ? "bg-[#121814] text-white border-white/10" : "bg-stone-50 text-stone-900 border-stone-200"
                        }`}
                        placeholder={l.level === 0 ? "Seller" : `Level ${l.level} Title`}
                      />
                    </div>

                    {l.level > 0 && (
                      <>
                        <div>
                          <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${
                            isDark ? "text-stone-400" : "text-stone-600"
                          }`}>
                            PPC Required
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={l.threshold}
                            onChange={e => updateSellerLevel(l.level, "threshold", e.target.value)}
                            className={`w-full p-2.5 text-xs font-mono font-bold border rounded-xl focus:outline-none focus:border-emerald-400 ${
                              isDark ? "bg-[#121814] text-white border-white/10" : "bg-stone-50 text-stone-900 border-stone-200"
                            }`}
                            placeholder="e.g. 50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                            Milestone Reward
                          </label>
                          <input
                            type="text"
                            value={l.reward}
                            onChange={e => updateSellerLevel(l.level, "reward", e.target.value)}
                            className={`w-full p-2.5 text-xs font-medium border rounded-xl focus:outline-none focus:border-emerald-400 ${
                              isDark ? "bg-[#121814] text-white border-emerald-500/30" : "bg-stone-50 text-stone-900 border-emerald-200"
                            }`}
                            placeholder="e.g. 🎁 ₹250 bonus credit"
                          />
                        </div>
                      </>
                    )}
                  </div>
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