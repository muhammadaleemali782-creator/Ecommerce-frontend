import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import EducaLogo from "../components/EducaLogo"

/* ── Collapsible Source Card ── */
function CollapsibleCard({ orderBy, src, myRupees, chain, rate, isUserOrd, isDark }) {
  const [open, setOpen] = useState(true)

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      isDark ? "bg-[#14181c] border-white/[0.08] shadow-md" : "bg-white border-stone-200 shadow-sm"
    }`}>

      {/* Header — click to collapse */}
      <div
        onClick={() => setOpen(p => !p)}
        className={`p-3 sm:p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
          isDark ? "bg-[#181d22] hover:bg-[#1d232a]" : "bg-stone-50 hover:bg-stone-100/80"
        } ${open ? (isDark ? "border-b border-white/[0.06]" : "border-b border-stone-200") : ""}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{orderBy.icon}</span>
          <div>
            <div className={`text-xs font-bold ${isDark ? "text-white" : "text-stone-900"}`}>
              {orderBy.label}
            </div>
            <div className="text-[10px] text-stone-400">
              Is order se {src.remainingPPC} PPC mili
            </div>
            {src.role === "user" && (
              <div className={`mt-1 text-[10px] font-semibold rounded-md px-2 py-0.5 inline-block border ${
                isDark
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
                ℹ️ User wallet nahi hota — aapko mili PPC kyunki aap uske <b>Parent Seller</b> hain
              </div>
            )}
            {src.role === "distributor" && (
              <div className={`mt-1 text-[10px] font-semibold rounded-md px-2 py-0.5 inline-block border ${
                isDark
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              }`}>
                ℹ️ Aap is network ke <b>Parent Distributor</b> hain
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-black text-sm text-purple-400">{src.remainingPPC} PPC</div>
            <div className="text-xs text-emerald-500 font-bold">≈ ₹{myRupees.toFixed(2)}</div>
          </div>
          <span className={`text-xs text-stone-400 transition-transform duration-200 inline-block ${
            open ? "rotate-180" : "rotate-0"
          }`}>▼</span>
        </div>
      </div>

      {/* Collapsible body */}
      {open && (
        <div className="p-3 sm:p-4 overflow-x-auto">
          <div className="text-[10px] text-stone-400 font-bold tracking-wider uppercase mb-2">
            PPC Distribution — {src.remainingPPC} PPC × ₹{rate}
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? "border-white/[0.06]" : "border-stone-100"}`}>
                {["System ID", "%", `PPC × ₹${rate} × %`, "Rupees"].map(h => (
                  <th key={h} className="text-[10px] font-bold text-stone-400 p-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chain.map((row, ri) => (
                <tr
                  key={ri}
                  className={row.you ? (isDark ? "bg-purple-500/10" : "bg-purple-50") : "transparent"}
                >
                  <td className={`p-2 font-medium ${
                    row.you ? "font-black text-purple-400" : isDark ? "text-stone-300" : "text-stone-700"
                  }`}>
                    {row.you ? "⭐ " : ""}{row.who}
                  </td>
                  <td className={`p-2 font-bold ${row.you ? "text-purple-400" : "text-stone-400"}`}>
                    {row.pct}%
                  </td>
                  <td className="p-2 text-stone-400 whitespace-nowrap text-[11px]">
                    {src.remainingPPC} × ₹{rate} × {row.pct}%
                  </td>
                  <td className={`p-2 font-bold whitespace-nowrap ${
                    row.you ? "text-emerald-400" : isDark ? "text-stone-300" : "text-stone-700"
                  }`}>
                    ₹{row.rupee.toFixed(2)}
                    {row.you && (
                      <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded border ${
                        isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        ← aapka
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className={`border-t font-black ${isDark ? "border-white/[0.08]" : "border-stone-200"}`}>
                <td colSpan={3} className="p-2 text-xs">Total</td>
                <td className="p-2 text-xs text-emerald-500">
                  ₹{(src.remainingPPC * rate).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function WithdrawalRequest() {
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)
  const [walletData, setWalletData] = useState(null)
  const [requests, setRequests] = useState([])
  const [settings, setSettings] = useState(null)
  const [historyFilter, setHistoryFilter] = useState("all")
  const [showHistory, setShowHistory] = useState(false)

  const [formData, setFormData] = useState({
    walletType: "",
    amount: "",
    paymentMethod: "",
    paymentDetails: ""
  })

  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const [walletRes, reqRes, settingsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/ppc/wallet/me`,          { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/api/withdrawal/my-requests`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/api/ppc-settings`,           { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (walletRes.ok)    setWalletData(await walletRes.json())
      if (reqRes.ok)       setRequests(await reqRes.json())
      if (settingsRes.ok)  setSettings(await settingsRes.json())
    } catch (err) {
      console.error("Fetch error:", err)
    }
  }

  const getWithdrawableWallets = () => {
    if (!walletData?.wallets) return []
    const dbFieldMap = {
      sellerWallet:      walletData.role === "distributor" ? "sellerWallet" : "sellerWalletAsSeller",
      distributorWallet: "distributorWallet",
      userWallet:        "userWalletAsSeller",
    }
    return Object.entries(walletData.wallets)
      .filter(([_, w]) => w.withdrawable && (w.ppcCount || 0) > 0)
      .map(([key, w]) => ({ key, dbField: dbFieldMap[key] || key, ...w, estimatedValue: w.estimatedValue || 0 }))
  }

  const withdrawableWallets = getWithdrawableWallets()
  const currentBalance = withdrawableWallets.reduce((s, w) => s + (w.ppcCount || 0), 0)
  const totalPPCEarned  = walletData?.totalPPCEarned || 0
  const totalWithdrawn  = Math.max(0, totalPPCEarned - currentBalance)
  const currentRate     = walletData?.currentPPCRate || 0

  const walletLabel = (key) => {
    if (key === "sellerWallet" || key === "sellerWalletAsSeller") return "Direct Seller Wallet"
    if (key === "userWallet"   || key === "userWalletAsSeller")   return "User Wallet"
    if (key === "distributorWallet")                               return "Distributor Wallet"
    return key
  }

  const activeSources = (() => {
    if (!walletData?.history) return []
    const sourceMap = {}
    walletData.history.filter(e => (e.remainingPPC || 0) > 0).forEach(entry => {
      const uid = (entry.fromUser?._id || "deleted") + "_" + (entry.positionType || "x")
      if (!sourceMap[uid]) {
        sourceMap[uid] = {
          name:            entry.fromUser?.name || null,
          toUserName:      entry.toUserName || "",
          role:            entry.fromUser?.role || "",
          isUserOrder:     entry.isUserOrder || (entry.fromUser?.role === "user") || false,
          positionType:    entry.positionType,
          percentageShare: entry.percentageShare || 0,
          ppcBaseRate:     entry.ppcBaseRate || 0,
          remainingPPC:    0,
          totalRupees:     0,
          chainInfo:       entry.chainInfo || {},
        }
      }
      if (entry.chainInfo?.directSellerName) {
        sourceMap[uid].chainInfo = entry.chainInfo
      }
      if (entry.isUserOrder || entry.fromUser?.role === "user") {
        sourceMap[uid].isUserOrder = true
      }
      sourceMap[uid].remainingPPC += (entry.remainingPPC || 0)
      sourceMap[uid].totalRupees  += (entry.rupeeValue   || 0)
    })

    return Object.values(sourceMap)
      .filter(s => s.remainingPPC > 0)
      .sort((a, b) => b.remainingPPC - a.remainingPPC)
  })()

  const filteredRequests = requests.filter(r =>
    historyFilter === "all" ? true : r.status === historyFilter
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage({ type: "", text: "" })
      const token = localStorage.getItem("token")
      if (!token) { setMessage({ type: "error", text: "Please login first" }); return }
      const selectedWallet = withdrawableWallets.find(w => w.key === formData.walletType)
      const actualWalletType = selectedWallet?.dbField || formData.walletType
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/withdrawal/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, walletType: actualWalletType })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: "Withdrawal request submitted successfully!" })
        setFormData({ walletType: "", amount: "", paymentMethod: "", paymentDetails: "" })
        fetchData()
      } else {
        setMessage({ type: "error", text: data.message || "Failed to submit request" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to submit request" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`max-w-3xl mx-auto space-y-5 px-2 sm:px-4 pb-20 transition-colors ${
      isDark ? "text-stone-200" : "text-stone-900"
    }`}>

      {/* ── Header Card ── */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isDark
          ? "bg-gradient-to-br from-[#121c16] via-[#101512] to-[#0c100e] border-emerald-500/25 shadow-xl shadow-emerald-950/20 text-white"
          : "bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-500/30 shadow-lg"
      }`}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">💸</span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Withdrawal Request</h1>
        </div>
        <p className={`text-xs font-medium ${isDark ? "text-stone-400" : "text-emerald-100/90"}`}>
          Request to withdraw your PPC earnings into your bank account or UPI
        </p>
      </div>

      {/* ── Rate Info Pill ── */}
      {settings && (
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark
            ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
            : "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          <div>
            <span className="font-bold">Min Withdrawal:</span> ₹{settings.minimumWithdrawal}
          </div>
          <div>
            <span className="font-bold">Current PPC Rate:</span> 1 PPC = ₹{currentRate}
          </div>
        </div>
      )}

      {/* ── SUMMARY CARDS & BREAKDOWN ── */}
      <div className={`rounded-3xl border overflow-hidden shadow-xl ${
        isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>

        {/* Show only WITHDRAWABLE wallets */}
        {walletData?.wallets && (
          <div className={`grid border-b ${isDark ? "border-white/[0.06]" : "border-stone-100"} ${
            withdrawableWallets.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}>
            {withdrawableWallets.map((w, idx) => (
              <div
                key={w.key}
                className={`p-5 text-center ${
                  isDark ? "bg-emerald-500/5" : "bg-emerald-50/60"
                } ${idx < withdrawableWallets.length - 1 ? (isDark ? "border-r border-white/[0.06]" : "border-r border-stone-100") : ""}`}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  {w.key === "sellerWallet" ? "Direct Seller Wallet" :
                   w.key === "userWallet"   ? "User Wallet"   : "Wallet"} ✅
                </p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-500">
                  {w.ppcCount || 0} <span className="text-sm font-semibold">PPC</span>
                </p>
                <p className="text-[11px] text-emerald-500/80 font-medium mt-1">Withdraw kar sakte ho</p>
              </div>
            ))}
          </div>
        )}

        {/* Small summary row */}
        <div className={`grid grid-cols-2 border-b text-center text-xs py-3 ${
          isDark ? "border-white/[0.06] bg-black/20 text-stone-400" : "border-stone-100 bg-stone-50 text-stone-600"
        }`}>
          <div className={isDark ? "border-r border-white/[0.06]" : "border-r border-stone-200"}>
            Total Earned: <span className="font-black text-purple-400">{totalPPCEarned} PPC</span>
          </div>
          <div>
            Withdrawn: <span className="font-black text-rose-400">{totalWithdrawn.toFixed(2)} PPC</span>
          </div>
        </div>

        {/* ── Active PPC Sources Breakdown ── */}
        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
            💎 Meri PPC Kahan Se Aayi — Breakdown
          </p>

          {currentBalance === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🚀</p>
              <p className={`font-black text-base ${isDark ? "text-white" : "text-stone-800"}`}>
                Shabash! Poori PPC withdraw kar li!
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Aur sell karo — nayi PPC aate hi yahan dikh jaayegi ✨
              </p>
            </div>
          ) : activeSources.length === 0 ? (
            <p className="text-center text-stone-400 py-6 text-xs">Koi active PPC source nahi mila</p>
          ) : (
            <>
              <p className="text-xs text-stone-400">
                Aapki <strong className="text-purple-400">{currentBalance} PPC</strong> neeche di gayi sales se aayi hai:
              </p>
              <div className="space-y-3">
                {activeSources.map((src, idx) => {
                  const rate     = src.ppcBaseRate || walletData?.currentPPCRate || 0
                  const pct      = src.percentageShare || 0
                  const myRupees = src.remainingPPC * rate * (pct / 100)
                  const ci       = src.chainInfo || {}
                  const isUserOrd = src.isUserOrder || ci.isUserOrder || src.role === "user"

                  const sellerName = ci.directSellerName || (src.role === "seller" ? src.name : "—") || "—"
                  const parentName = ci.parentSellerName || ""
                  const myName     = src.toUserName || "You"
                  const distName   = ci.distributorName || "—"

                  const orderBy =
                    src.role === "user"   ? { icon: "👤", label: `User — ${src.name || "—"}` }
                  : src.role === "seller" ? { icon: "🛍️", label: `Seller — ${sellerName || src.name || "—"}` }
                  : { icon: "📦", label: src.name || "—" }

                  const chain =
                    isUserOrd && src.positionType === "direct"
                      ? [
                          { who: `${myName} (You)`, pct: 50, rupee: src.remainingPPC*rate*0.50, you: true  },
                          { who: distName,          pct: 50, rupee: src.remainingPPC*rate*0.50, you: false },
                        ]
                    : isUserOrd && src.positionType === "distributor"
                      ? [
                          { who: sellerName,         pct: 50, rupee: src.remainingPPC*rate*0.50, you: false },
                          { who: `${myName} (You)`,   pct: 50, rupee: src.remainingPPC*rate*0.50, you: true  },
                        ]
                    : src.positionType === "direct"
                      ? parentName
                        ? [
                            { who: `${myName} (You)`, pct: 50, rupee: src.remainingPPC*rate*0.50, you: true  },
                            { who: parentName,        pct: 25, rupee: src.remainingPPC*rate*0.25, you: false },
                            { who: distName,          pct: 25, rupee: src.remainingPPC*rate*0.25, you: false },
                          ]
                        : [
                            { who: `${myName} (You)`, pct: 50, rupee: src.remainingPPC*rate*0.50, you: true  },
                            { who: distName,          pct: 50, rupee: src.remainingPPC*rate*0.50, you: false },
                          ]
                    : src.positionType === "parent"
                      ? [
                          { who: sellerName,           pct: 50, rupee: src.remainingPPC*rate*0.50, you: false },
                          { who: `${myName} (You)`,     pct: 25, rupee: src.remainingPPC*rate*0.25, you: true  },
                          { who: distName,             pct: 25, rupee: src.remainingPPC*rate*0.25, you: false },
                        ]
                    : src.positionType === "distributor"
                      ? pct === 25
                        ? [
                            { who: sellerName,         pct: 50, rupee: src.remainingPPC*rate*0.50, you: false },
                            { who: parentName || "—",  pct: 25, rupee: src.remainingPPC*rate*0.25, you: false },
                            { who: `${myName} (You)`,   pct: 25, rupee: src.remainingPPC*rate*0.25, you: true  },
                          ]
                        : [
                            { who: sellerName,         pct: 50, rupee: src.remainingPPC*rate*0.50, you: false },
                            { who: `${myName} (You)`,   pct: 50, rupee: src.remainingPPC*rate*0.50, you: true  },
                          ]
                    : []

                  return (
                    <CollapsibleCard
                      key={idx}
                      orderBy={orderBy}
                      src={src}
                      myRupees={myRupees}
                      chain={chain}
                      rate={rate}
                      isUserOrd={isUserOrd}
                      isDark={isDark}
                    />
                  )
                })}
              </div>

              {/* Total bar */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDark ? "bg-purple-500/10 border-purple-500/25" : "bg-purple-50 border-purple-200"
              }`}>
                <span className="text-xs sm:text-sm font-bold text-purple-400">
                  💰 Total Withdraw Kar Sakte Ho
                </span>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-purple-400">
                    {currentBalance} PPC
                  </span>
                  <div className="text-xs text-emerald-500 font-bold">
                    ≈ ₹{activeSources.reduce((s, src) => {
                      const rate = src.ppcBaseRate || walletData?.currentPPCRate || 0
                      const pct  = src.percentageShare || 0
                      return s + src.remainingPPC * rate * pct / 100
                    }, 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── NEW WITHDRAWAL FORM ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${
        isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <h2 className="text-base sm:text-lg font-bold mb-4">New Withdrawal Request</h2>

        {message.text && (
          <div className={`p-3.5 rounded-xl mb-4 text-xs font-bold border ${
            message.type === "success"
              ? isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-800 border-emerald-200"
              : isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-800 border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        {withdrawableWallets.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            <p className="text-3xl mb-2">💳</p>
            <p>No withdrawable balance available</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-stone-400">Select Wallet *</label>
              <select
                value={formData.walletType}
                onChange={e => setFormData({ ...formData, walletType: e.target.value })}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white focus:border-emerald-500"
                    : "bg-stone-50 border-stone-200 text-stone-900 focus:border-emerald-500"
                }`}
              >
                <option value="">-- Choose Wallet --</option>
                {withdrawableWallets.map(w => (
                  <option key={w.key} value={w.key}>
                    {walletLabel(w.key)} — ₹{(w.estimatedValue || 0).toFixed(2)} ({w.ppcCount} PPC)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-stone-400">Amount (PPC) *</label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Kitne PPC withdraw karna hai"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white focus:border-emerald-500 placeholder-stone-500"
                    : "bg-stone-50 border-stone-200 text-stone-900 focus:border-emerald-500 placeholder-stone-400"
                }`}
              />
              {formData.amount && currentRate > 0 && (() => {
                const selectedW = withdrawableWallets.find(w => w.key === formData.walletType)
                const perPPC = selectedW && selectedW.ppcCount > 0
                  ? (selectedW.estimatedValue / selectedW.ppcCount)
                  : currentRate * 0.5
                return (
                  <p className="text-[11px] text-emerald-400 font-bold mt-1">
                    ≈ ₹{(formData.amount * perPPC).toFixed(2)} estimated
                  </p>
                )
              })()}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-stone-400">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white focus:border-emerald-500"
                    : "bg-stone-50 border-stone-200 text-stone-900 focus:border-emerald-500"
                }`}
              >
                <option value="">-- Select Method --</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="paytm">Paytm</option>
                <option value="phonepe">PhonePe</option>
                <option value="gpay">Google Pay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-stone-400">Payment Details</label>
              <textarea
                value={formData.paymentDetails}
                onChange={e => setFormData({ ...formData, paymentDetails: e.target.value })}
                rows="2"
                placeholder="Bank account details / UPI ID"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white focus:border-emerald-500 placeholder-stone-500"
                    : "bg-stone-50 border-stone-200 text-stone-900 focus:border-emerald-500 placeholder-stone-400"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                loading
                  ? "bg-stone-700 text-stone-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 active:scale-98"
              }`}
            >
              {loading ? "Submitting..." : "Submit Withdrawal Request ➔"}
            </button>
          </form>
        )}
      </div>

      {/* ── WITHDRAWAL HISTORY ── */}
      <div className={`rounded-3xl border overflow-hidden shadow-xl ${
        isDark ? "bg-[#111417] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <button
          onClick={() => setShowHistory(p => !p)}
          className={`w-full flex items-center justify-between p-4 sm:p-5 transition text-left cursor-pointer ${
            isDark ? "hover:bg-white/[0.02]" : "hover:bg-stone-50"
          }`}
        >
          <span className="text-sm sm:text-base font-bold">📋 Withdrawal History</span>
          <span className="text-xs text-stone-400">{showHistory ? "▲" : "▼"}</span>
        </button>

        {showHistory && (
          <div className={`border-t ${isDark ? "border-white/[0.06]" : "border-stone-100"}`}>
            {/* Filter Tabs */}
            <div className={`flex gap-1.5 p-3 border-b overflow-x-auto ${
              isDark ? "border-white/[0.06]" : "border-stone-100"
            }`}>
              {[
                { key: "all",      label: "All" },
                { key: "pending",  label: "⏳ Pending" },
                { key: "approved", label: "✅ Approved" },
                { key: "rejected", label: "❌ Rejected" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setHistoryFilter(tab.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                    historyFilter === tab.key
                      ? "bg-emerald-500 text-black border-emerald-400"
                      : isDark
                        ? "bg-white/[0.04] text-stone-400 border-white/[0.08]"
                        : "bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            {filteredRequests.length === 0 ? (
              <p className="text-center text-stone-400 py-8 text-xs">
                No {historyFilter === "all" ? "" : historyFilter} requests yet
              </p>
            ) : (
              <div className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-stone-100"}`}>
                {filteredRequests.map(req => (
                  <div key={req._id} className="p-4 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-black">
                          {req.amount} <span className="text-xs text-purple-400 font-bold">PPC</span>
                        </p>
                        {req.ppcRateAtRequest > 0 && (
                          <p className="text-xs text-emerald-500 font-medium">
                            🔒 ₹{req.ppcRateAtRequest}/PPC → ₹{req.rupeeValueAtRequest?.toFixed(2)}
                          </p>
                        )}
                        <p className="text-[11px] text-stone-400 capitalize mt-0.5">
                          {req.paymentMethod?.replace("_", " ") || "—"} • {walletLabel(req.walletType?.replace("AsSeller", ""))}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        req.status === "pending"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : req.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}>
                        {req.status?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      {new Date(req.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                    {req.transactionId && (
                      <p className="text-xs text-emerald-400 font-mono mt-1">Txn: {req.transactionId}</p>
                    )}
                    {req.adminNote && (
                      <p className="text-xs text-stone-400 italic mt-1">Note: {req.adminNote}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
