import { useState, useEffect } from "react"

/* ── Collapsible Source Card ── */
function CollapsibleCard({ orderBy, src, myRupees, chain, rate, isUserOrd }) {
  const [open, setOpen] = useState(true)

  return (
    <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>

      {/* Header — click to collapse */}
      <div
        onClick={() => setOpen(p => !p)}
        style={{ background:"#f8fafc", borderBottom: open ? "1px solid #e2e8f0" : "none", padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", userSelect:"none" }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>{orderBy.icon}</span>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"#1e293b" }}>{orderBy.label}</div>
            <div style={{ fontSize:10, color:"#94a3b8" }}>Is order se {src.remainingPPC} PPC mili</div>
            {src.role === "user" && (
              <div style={{ marginTop:4, fontSize:10, fontWeight:600, background:"#eff6ff", color:"#1d4ed8", border:"1px solid #bfdbfe", borderRadius:6, padding:"2px 7px", display:"inline-block" }}>
                ℹ️ User ke paas koi wallet nahi hota — aapko mili PPC kyunki aap uske <b>Parent Seller</b> hain
              </div>
            )}
            {src.role === "distributor" && (
              <div style={{ marginTop:4, fontSize:10, fontWeight:600, background:"#faf5ff", color:"#7c3aed", border:"1px solid #e9d5ff", borderRadius:6, padding:"2px 7px", display:"inline-block" }}>
                ℹ️ Aap is network ke <b>Parent Distributor</b> hain
              </div>
            )}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#7c3aed" }}>{src.remainingPPC} PPC</div>
            <div style={{ fontSize:11, color:"#16a34a", fontWeight:600 }}>Aapko ≈ ₹{myRupees.toFixed(2)}</div>
          </div>
          <span style={{ fontSize:12, color:"#94a3b8", transition:"transform 0.2s", display:"inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
        </div>
      </div>

      {/* Collapsible body */}
      {open && (
        <div style={{ padding:"10px 14px" }}>
          <div style={{ fontSize:10, color:"#94a3b8", fontWeight:600, marginBottom:6, letterSpacing:"0.05em" }}>
            PPC DISTRIBUTION — {src.remainingPPC} PPC × ₹{rate}
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                {["System ID", "%", `PPC × ₹${rate} × %`, "Rupees"].map(h => (
                  <th key={h} style={{ fontSize:9, fontWeight:700, color:"#94a3b8", padding:"4px 6px", textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chain.map((row, ri) => (
                <tr key={ri} style={{ background: row.you ? "#faf5ff" : "transparent" }}>
                  <td style={{ padding:"5px 6px", fontSize:12, fontWeight: row.you ? 800 : 500, color: row.you ? "#7c3aed" : "#374151" }}>
                    {row.you ? "⭐ " : ""}{row.who}
                  </td>
                  <td style={{ padding:"5px 6px", fontSize:11, fontWeight:700, color: row.you ? "#7c3aed" : "#64748b" }}>
                    {row.pct}%
                  </td>
                  <td style={{ padding:"5px 6px", fontSize:10, color:"#94a3b8", whiteSpace:"nowrap" }}>
                    {src.remainingPPC} × ₹{rate} × {row.pct}%
                  </td>
                  <td style={{ padding:"5px 6px", fontSize:12, fontWeight: row.you ? 800 : 600, color: row.you ? "#16a34a" : "#64748b", whiteSpace:"nowrap" }}>
                    ₹{row.rupee.toFixed(2)}
                    {row.you && <span style={{ marginLeft:4, fontSize:9, background:"#f0fdf4", color:"#15803d", borderRadius:3, padding:"1px 4px" }}>← aapka</span>}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop:"1.5px solid #e2e8f0" }}>
                <td colSpan={3} style={{ padding:"5px 6px", fontSize:11, fontWeight:800, color:"#1e293b" }}>Total</td>
                <td style={{ padding:"5px 6px", fontSize:12, fontWeight:800, color:"#1e293b" }}>₹{(src.remainingPPC * rate).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function WithdrawalRequest() {
  
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

  const posLabel = (type) => {
    if (type === "direct")      return { text: "Direct Sale",   color: "bg-green-100 text-green-700" }
    if (type === "parent")      return { text: "Parent Seller", color: "bg-blue-100 text-blue-700" }
    if (type === "distributor") return { text: "Distributor",   color: "bg-purple-100 text-purple-700" }
    return { text: type, color: "bg-gray-100 text-gray-600" }
  }

  // Per-SOURCE remaining PPC — group by fromUser + positionType (alag alag rakhna)
  // ✅ FIX: Use backend FIFO remainingPPC directly — no proportional calculation
  const activeSources = (() => {
    if (!walletData?.history) return []

    const sourceMap = {}
    // Backend already returns only entries with remainingPPC > 0 (FIFO deducted)
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
      // ✅ Update chainInfo if backend sent better data (directSellerName filled)
      if (entry.chainInfo?.directSellerName) {
        sourceMap[uid].chainInfo = entry.chainInfo
      }
      if (entry.isUserOrder || entry.fromUser?.role === "user") {
        sourceMap[uid].isUserOrder = true
      }
      // ✅ Sum the actual remainingPPC from FIFO backend calculation
      sourceMap[uid].remainingPPC += (entry.remainingPPC || 0)
      sourceMap[uid].totalRupees  += (entry.rupeeValue   || 0)
    })

    return Object.values(sourceMap)
      .filter(s => s.remainingPPC > 0)
      .sort((a, b) => b.remainingPPC - a.remainingPPC)
  })()

  // Filtered withdrawal history
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
    <div className="max-w-3xl mx-auto space-y-5 px-2 sm:px-4">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-lg p-5 text-white">
        <h1 className="text-2xl font-bold mb-1">💸 Withdrawal Request</h1>
        <p className="text-sm opacity-90">Request to withdraw your PPC earnings</p>
      </div>

      {/* Rate Info */}
      {settings && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
          <strong>Min Withdrawal:</strong> ₹{settings.minimumWithdrawal}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong>Current PPC Rate:</strong> 1 PPC = ₹{currentRate}
        </div>
      )}

      {/* ===================== SUMMARY CARDS ===================== */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        
        {/* Show only WITHDRAWABLE wallets */}
        {walletData?.wallets && (
          <div className={`grid border-b border-gray-100 ${withdrawableWallets.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {withdrawableWallets.map((w, idx) => (
              <div key={w.key} className={`px-4 py-4 text-center bg-green-50 ${idx < withdrawableWallets.length - 1 ? "border-r border-gray-100" : ""}`}>
                <p className="text-xs text-gray-500 mb-0.5">
                  {w.key === "sellerWallet" ? "Direct Seller Wallet" :
                   w.key === "userWallet"   ? "User Wallet"   : "Wallet"} ✅
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {w.ppcCount || 0} <span className="text-sm font-normal">PPC</span>
                </p>
                <p className="text-xs text-green-500 mt-0.5">Withdraw kar sakte ho</p>
              </div>
            ))}
          </div>
        )}

        {/* Small summary row */}
        <div className="grid grid-cols-2 border-b border-gray-100 text-center text-xs text-gray-500 py-2 bg-white">
          <div className="border-r border-gray-100 py-1">Total Earned: <span className="font-bold text-purple-600">{totalPPCEarned} PPC</span></div>
          <div className="py-1">Withdrawn: <span className="font-bold text-red-400">{totalWithdrawn.toFixed(2)} PPC</span></div>
        </div>

        {/* ===================== ACTIVE PPC SOURCES ===================== */}
        <div className="px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            💎 Meri PPC Kahan Se Aayi — Breakdown
          </p>

          {currentBalance === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🚀</p>
              <p className="font-bold text-gray-700 text-lg">Shabash! Poori PPC withdraw kar li!</p>
              <p className="text-sm text-gray-400 mt-1">Aur sell karo — nayi PPC aate hi yahan dikh jaayegi ✨</p>
            </div>
          ) : activeSources.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">Koi active PPC source nahi mila</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-3">
                Aapki <strong className="text-purple-700">{currentBalance} PPC</strong> neeche di gayi sales se aayi hai:
              </p>
              <div className="space-y-3">
                {activeSources.map((src, idx) => {
                  const rate     = src.ppcBaseRate || walletData?.currentPPCRate || 0
                  const pct      = src.percentageShare || 0
                  const myRupees = src.remainingPPC * rate * (pct / 100)
                  const ci       = src.chainInfo || {}
                  const isUserOrd = src.isUserOrder || ci.isUserOrder || src.role === "user"

                  // ✅ FIX: sellerName should ALWAYS be the seller, never the user
                  // ci.directSellerName comes from backend — if user order, this is the seller above the user
                  // If directSellerName is empty or same as user, fallback to src.name only if src is seller role
                  const sellerName = ci.directSellerName || (src.role === "seller" ? src.name : "—") || "—"
                  const parentName = ci.parentSellerName || ""
                  // ✅ "You" = toUser (recipient of this commission)
                  const myName     = src.toUserName || user?.name || "You"
                  const distName   = ci.distributorName || "—"

                  // ✅ FIX: Header label — for user orders show "User — <userName>"
                  // src.name for user order = user's name, for seller order = seller's name
                  const orderBy =
                    src.role === "user"   ? { icon:"👤", label:`User — ${src.name || "—"}` }
                  : src.role === "seller" ? { icon:"🛍️", label:`Seller — ${sellerName || src.name || "—"}` }
                  : { icon:"📦", label: src.name || "—" }

                  const chain =
                    isUserOrd && src.positionType === "direct"
                      ? [
                          { who:`${myName} (You)`, pct:50, rupee:src.remainingPPC*rate*0.50, you:true  },
                          { who: distName,          pct:50, rupee:src.remainingPPC*rate*0.50, you:false },
                        ]
                    : isUserOrd && src.positionType === "distributor"
                      ? [
                          { who: sellerName,         pct:50, rupee:src.remainingPPC*rate*0.50, you:false },
                          { who:`${myName} (You)`,   pct:50, rupee:src.remainingPPC*rate*0.50, you:true  },
                        ]
                    : src.positionType === "direct"
                      ? parentName
                        ? [
                            { who:`${myName} (You)`, pct:50, rupee:src.remainingPPC*rate*0.50, you:true  },
                            { who: parentName,        pct:25, rupee:src.remainingPPC*rate*0.25, you:false },
                            { who: distName,          pct:25, rupee:src.remainingPPC*rate*0.25, you:false },
                          ]
                        : [
                            { who:`${myName} (You)`, pct:50, rupee:src.remainingPPC*rate*0.50, you:true  },
                            { who: distName,          pct:50, rupee:src.remainingPPC*rate*0.50, you:false },
                          ]
                    : src.positionType === "parent"
                      ? [
                          { who: sellerName,           pct:50, rupee:src.remainingPPC*rate*0.50, you:false },
                          { who:`${myName} (You)`,     pct:25, rupee:src.remainingPPC*rate*0.25, you:true  },
                          { who: distName,             pct:25, rupee:src.remainingPPC*rate*0.25, you:false },
                        ]
                    : src.positionType === "distributor"
                      ? pct === 25
                        ? [
                            { who: sellerName,         pct:50, rupee:src.remainingPPC*rate*0.50, you:false },
                            { who: parentName || "—",  pct:25, rupee:src.remainingPPC*rate*0.25, you:false },
                            { who:`${myName} (You)`,   pct:25, rupee:src.remainingPPC*rate*0.25, you:true  },
                          ]
                        : [
                            { who: sellerName,         pct:50, rupee:src.remainingPPC*rate*0.50, you:false },
                            { who:`${myName} (You)`,   pct:50, rupee:src.remainingPPC*rate*0.50, you:true  },
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
                    />
                  )
                })}
              </div>

              {/* Total bar */}
              <div style={{
                marginTop:12, display:"flex", alignItems:"center", justifyContent:"space-between",
                background:"#f5f3ff", border:"1.5px solid #c4b5fd", borderRadius:10, padding:"10px 14px"
              }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#7c3aed" }}>💰 Total Withdraw Kar Sakte Ho</span>
                <div style={{ textAlign:"right" }}>
                  <span style={{ fontSize:16, fontWeight:800, color:"#7c3aed" }}>{currentBalance} PPC</span>
                  <div style={{ fontSize:11, color:"#16a34a", fontWeight:600 }}>
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

      {/* ===================== NEW WITHDRAWAL FORM ===================== */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">New Withdrawal Request</h2>
        
        {message.text && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>{message.text}</div>
        )}
        
        {withdrawableWallets.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            <p className="text-2xl mb-2">💳</p>
            <p>No withdrawable balance available</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Wallet *</label>
              <select value={formData.walletType} onChange={e => setFormData({...formData, walletType: e.target.value})} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">-- Choose Wallet --</option>
                {withdrawableWallets.map(w => (
                  <option key={w.key} value={w.key}>
                    {walletLabel(w.key)} — ₹{(w.estimatedValue || 0).toFixed(2)} ({w.ppcCount} PPC)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PPC) *</label>
              <input type="number" step="1" min="1" required
                value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                placeholder="Kitne PPC withdraw karna hai"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              {formData.amount && currentRate > 0 && (() => {
                const selectedW = withdrawableWallets.find(w => w.key === formData.walletType)
                const perPPC = selectedW && selectedW.ppcCount > 0
                  ? (selectedW.estimatedValue / selectedW.ppcCount)
                  : currentRate * 0.5
                return (
                  <p className="text-xs text-green-600 mt-1">
                    ≈ ₹{(formData.amount * perPPC).toFixed(2)} estimated
                  </p>
                )
              })()}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">-- Select Method --</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="paytm">Paytm</option>
                <option value="phonepe">PhonePe</option>
                <option value="gpay">Google Pay</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Details</label>
              <textarea value={formData.paymentDetails} onChange={e => setFormData({...formData, paymentDetails: e.target.value})}
                rows="2" placeholder="Bank account / UPI ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            
            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>

      {/* ===================== WITHDRAWAL HISTORY with FILTER ===================== */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        
        {/* Toggle */}
        <button onClick={() => setShowHistory(p => !p)}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition text-left">
          <span className="text-base font-bold text-gray-800">📋 Withdrawal History</span>
          <span className="text-gray-400">{showHistory ? "▲" : "▼"}</span>
        </button>

        {showHistory && (
          <div className="border-t border-gray-100">
            
            {/* Filter Tabs */}
            <div className="flex gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto">
              {[
                { key: "all",      label: "All",      color: "bg-gray-700" },
                { key: "pending",  label: "⏳ Pending", color: "bg-yellow-500" },
                { key: "approved", label: "✅ Approved", color: "bg-green-600" },
                { key: "rejected", label: "❌ Rejected", color: "bg-red-600" },
              ].map(tab => (
                <button key={tab.key} onClick={() => setHistoryFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    historyFilter === tab.key
                      ? `${tab.color} text-white shadow`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            {filteredRequests.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No {historyFilter === "all" ? "" : historyFilter} requests yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredRequests.map(req => (
                  <div key={req._id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {req.amount} <span className="text-xs text-purple-600 font-semibold">PPC</span>
                        </p>
                        {req.ppcRateAtRequest > 0 && (
                          <p className="text-xs text-green-600">🔒 ₹{req.ppcRateAtRequest}/PPC → ₹{req.rupeeValueAtRequest?.toFixed(2)}</p>
                        )}
                        <p className="text-xs text-gray-400 capitalize mt-0.5">
                          {req.paymentMethod?.replace("_"," ") || "—"} • {walletLabel(req.walletType?.replace("AsSeller",""))}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                        req.status === "pending"  ? "bg-yellow-100 text-yellow-700" :
                        req.status === "approved" ? "bg-green-100 text-green-700"  :
                        "bg-red-100 text-red-700"
                      }`}>
                        {req.status?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(req.createdAt).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                    </p>
                    {req.transactionId && (
                      <p className="text-xs text-green-700 mt-1">✅ Txn: {req.transactionId}</p>
                    )}
                    {req.adminNote && (
                      <p className="text-xs text-gray-500 mt-1 italic">Note: {req.adminNote}</p>
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
