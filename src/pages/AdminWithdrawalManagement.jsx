import { useState, useEffect } from "react"
import InlineLoader from "../components/InlineLoader"
import { useTheme } from "../context/ThemeContext"

/* =====================================================
   ADMIN WITHDRAWAL MANAGEMENT (MOBILE RESPONSIVE)
   Approve/Reject withdrawal requests
===================================================== */

export default function AdminWithdrawalManagement() {
  const { isDark } = useTheme()
  const [view, setView] = useState("withdrawal") // "withdrawal" | "rewards"

  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState("pending")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [ppcRate, setPpcRate] = useState(0)

  const [rewardRequests, setRewardRequests] = useState([])
  
  const [modalData, setModalData] = useState({
    show: false,
    action: "",
    context: "withdrawal", // "withdrawal" | "reward"
    request: null,
    transactionId: "",
    note: ""
  })

  const switchView = (v) => {
    setView(v)
    setFilter("pending")
    setMessage({ type: "", text: "" })
  }
  
  useEffect(() => {
    fetchPPCRate()
  }, [])

  useEffect(() => {
    if (view === "withdrawal") fetchRequests()
    else fetchRewardRequests()
  }, [filter, view])

  const fetchRewardRequests = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("token")
      if (!token) return

      const url = filter && filter !== "pending"
        ? `${import.meta.env.VITE_API_URL}/api/rewards/admin/all?status=${filter}`
        : filter === "pending"
          ? `${import.meta.env.VITE_API_URL}/api/rewards/admin/pending`
          : `${import.meta.env.VITE_API_URL}/api/rewards/admin/all`

      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setRewardRequests(data)
      }
    } catch (err) {
      console.error("Fetch reward requests error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayReward = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rewards/admin/pay/${modalData.request._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({})
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: "Reward marked as paid!" })
        closeModal()
        fetchRewardRequests()
      } else {
        setMessage({ type: "error", text: data.message || "Failed to mark as paid" })
      }
    } catch (err) {
      console.error("Pay reward error:", err)
      setMessage({ type: "error", text: "Failed to mark reward as paid" })
    } finally {
      setLoading(false)
    }
  }

  const handleRejectReward = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rewards/admin/reject/${modalData.request._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ note: modalData.note || "Rejected by admin" })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: "Reward claim rejected" })
        closeModal()
        fetchRewardRequests()
      } else {
        setMessage({ type: "error", text: data.message || "Failed to reject" })
      }
    } catch (err) {
      console.error("Reject reward error:", err)
      setMessage({ type: "error", text: "Failed to reject reward claim" })
    } finally {
      setLoading(false)
    }
  }

  const fetchPPCRate = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ppc-settings`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setPpcRate(data.basePPCValue || 0)
      }
    } catch (err) {
      console.error("PPC rate fetch error:", err)
    }
  }
  
  const fetchRequests = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem("token")
      if (!token) return
      
      const url = filter 
        ? `${import.meta.env.VITE_API_URL}/api/withdrawal/admin/all?status=${filter}`
        : `${import.meta.env.VITE_API_URL}/api/withdrawal/admin/all`
      
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
      
    } catch (err) {
      console.error("Fetch requests error:", err)
    } finally {
      setLoading(false)
    }
  }
  
  const openModal = (action, request, context = "withdrawal") => {
    setModalData({
      show: true,
      action,
      context,
      request,
      transactionId: "",
      note: ""
    })
    setMessage({ type: "", text: "" })
  }
  
  const closeModal = () => {
    setModalData({
      show: false,
      action: "",
      context: "withdrawal",
      request: null,
      transactionId: "",
      note: ""
    })
  }
  
  const handleApprove = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem("token")
      if (!token) return
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/withdrawal/admin/approve/${modalData.request._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionId: modalData.transactionId,
          note: modalData.note
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: "success", text: "Withdrawal approved successfully!" })
        closeModal()
        fetchRequests()
      } else {
        setMessage({ type: "error", text: data.message || "Failed to approve" })
      }
      
    } catch (err) {
      console.error("Approve error:", err)
      setMessage({ type: "error", text: "Failed to approve withdrawal" })
    } finally {
      setLoading(false)
    }
  }
  
  const handleReject = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem("token")
      if (!token) return
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/withdrawal/admin/reject/${modalData.request._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: modalData.note || "Rejected by admin"
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: "success", text: "Withdrawal rejected" })
        closeModal()
        fetchRequests()
      } else {
        setMessage({ type: "error", text: data.message || "Failed to reject" })
      }
      
    } catch (err) {
      console.error("Reject error:", err)
      setMessage({ type: "error", text: "Failed to reject withdrawal" })
    } finally {
      setLoading(false)
    }
  }
  
  const getWalletLabel = (type) => {
    if (type === "sellerWallet") return "Direct Seller Wallet"
    if (type === "sellerWalletAsSeller") return "Direct Seller Wallet"
    if (type === "userWalletAsSeller") return "User Wallet"
    if (type === "distSellerWallet") return "Distributor's Direct Seller Wallet"
    if (type === "distributorWallet") return "Distributor Wallet"
    return type
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
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ TREASURY & DISBURSEMENTS
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            Withdrawal Management & Payouts
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>
            Process bank transfers, disburse PPC rupee conversions, and honor milestone reward claims.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className={`flex items-center gap-1.5 p-1 rounded-2xl border ${
          isDark ? "bg-black/40 border-white/10" : "bg-stone-100 border-stone-200"
        }`}>
          <button
            onClick={() => switchView("withdrawal")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              view === "withdrawal"
                ? "bg-[#fbbf24] text-black font-black shadow-sm"
                : isDark ? "text-stone-400 hover:text-white" : "text-stone-600 hover:text-black"
            }`}
          >
            💸 Withdrawals
          </button>
          <button
            onClick={() => switchView("rewards")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              view === "rewards"
                ? "bg-purple-600 text-white font-black shadow-sm"
                : isDark ? "text-stone-400 hover:text-white" : "text-stone-600 hover:text-black"
            }`}
          >
            🎁 Reward Claims
          </button>
        </div>
      </div>

      {/* ── STATUS MESSAGE ── */}
      {message.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
          message.type === "success"
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
            : "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30"
        }`}>
          <span>{message.type === "success" ? "✅" : "❌"}</span>
          {message.text}
        </div>
      )}

      {/* ── FILTER BUTTONS ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {["pending", "approved", "rejected", "paid", "all"].map((status) => {
          if (view === "withdrawal" && status === "paid") return null
          if (view === "rewards" && status === "approved") return null

          const isSelected = filter === status
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? isDark
                    ? "bg-white text-black border-white font-black shadow-sm"
                    : "bg-stone-900 text-white border-stone-900 font-black shadow-sm"
                  : isDark
                    ? "bg-[#111713] text-stone-400 border-white/[0.08] hover:bg-white/10"
                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100 shadow-sm"
              }`}
            >
              {status === "all" ? "All Requests" : status}
            </button>
          )
        })}
      </div>

      {/* ── REWARDS VIEW ── */}
      {view === "rewards" && (

        loading ? (
          <div className="text-center py-16 text-stone-400 text-xs font-mono animate-pulse">
            Loading reward claims...
          </div>
        ) : rewardRequests.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
          }`}>
            <span className="text-3xl block mb-2">🎁</span>
            <h3 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>No Reward Claims Found</h3>
            <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>There are no {filter || "active"} reward claims.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {rewardRequests.map((rc) => (
              <div
                key={rc._id}
                className={`rounded-3xl border p-5 sm:p-6 space-y-4 transition-all shadow-md ${
                  isDark ? "bg-[#111713] border-purple-500/30 hover:border-purple-500/50" : "bg-white border-purple-200 hover:border-purple-300 shadow-sm"
                }`}
              >
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                  isDark ? "border-white/[0.06]" : "border-stone-100"
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-base ${isDark ? "text-white" : "text-stone-900"}`}>{rc.userId?.name || "Unknown User"}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isDark ? "bg-white/[0.06] text-stone-300" : "bg-stone-100 text-stone-700 border border-stone-200"
                      }`}>
                        {rc.userId?.role}
                      </span>
                    </div>
                    <div className={`text-xs mt-0.5 ${isDark ? "text-stone-400" : "text-stone-500"}`}>📧 {rc.userId?.email}</div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border self-start sm:self-auto ${
                    rc.status === "pending"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30"
                      : rc.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30"
                  }`}>
                    {rc.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
                  }`}>
                    <p className={`text-[10px] font-mono uppercase ${isDark ? "text-stone-400" : "text-stone-500"}`}>Wallet Type</p>
                    <p className={`text-xs font-bold mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>{getWalletLabel(rc.walletType)}</p>
                  </div>
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
                  }`}>
                    <p className={`text-[10px] font-mono uppercase ${isDark ? "text-stone-400" : "text-stone-500"}`}>Rank Achieved</p>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-300 mt-0.5">🏅 {rc.levelName}</p>
                  </div>
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
                  }`}>
                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase">Milestone Reward</p>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-300 mt-0.5">{rc.rewardText}</p>
                  </div>
                </div>

                <div className={`text-[11px] font-mono space-y-1 ${isDark ? "text-stone-500" : "text-stone-400"}`}>
                  <p>PPC Score: {rc.ppcAtClaim} (Threshold: {rc.ppcRequired})</p>
                  <p>Claimed On: {new Date(rc.requestedAt).toLocaleString("en-IN")}</p>
                  {rc.paidAt && <p className="text-emerald-600 dark:text-emerald-400 font-bold">Disbursed: {new Date(rc.paidAt).toLocaleString("en-IN")}</p>}
                  {rc.adminNote && <p className={isDark ? "text-stone-300" : "text-stone-700"}>Admin Note: {rc.adminNote}</p>}
                </div>

                {rc.status === "pending" && (
                  <div className={`flex gap-2 pt-2 border-t ${
                    isDark ? "border-white/[0.06]" : "border-stone-100"
                  }`}>
                    <button
                      onClick={() => openModal("approve", rc, "reward")}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      ✅ Mark Reward as Paid
                    </button>
                    <button
                      onClick={() => openModal("reject", rc, "reward")}
                      className="py-2.5 px-5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      ❌ Reject Claim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── WITHDRAWAL REQUESTS VIEW ── */}
      {view === "withdrawal" && (
        loading ? (
          <div className="text-center py-16 text-stone-400 text-xs font-mono animate-pulse">
            Loading withdrawal queue...
          </div>
        ) : requests.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
          }`}>
            <span className="text-3xl block mb-2">💸</span>
            <h3 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>No Withdrawal Requests</h3>
            <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>There are no {filter || "active"} withdrawal requests in this view.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => {
              const rupeeVal = req.ppcRateAtRequest > 0 
                ? (req.rupeeValueAtRequest?.toFixed(2) || (req.amount * req.ppcRateAtRequest * (req.percentageAtRequest / 100)).toFixed(2))
                : (ppcRate > 0 ? (req.amount * ppcRate * 0.25).toFixed(2) : "—")

              return (
                <div
                  key={req._id}
                  className={`rounded-3xl border p-5 sm:p-6 space-y-4 transition-all shadow-md ${
                    isDark ? "bg-[#111713] border-white/[0.08] hover:border-white/20" : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
                  }`}
                >
                  {/* User Profile Header */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                    isDark ? "border-white/[0.06]" : "border-stone-100"
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-base ${isDark ? "text-white" : "text-stone-900"}`}>{req.userId?.name || "Unknown User"}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isDark ? "bg-white/[0.06] text-stone-300" : "bg-stone-100 text-stone-700 border border-stone-200"
                        }`}>
                          {req.userRole}
                        </span>
                      </div>
                      <div className={`text-xs mt-0.5 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                        📧 {req.userId?.email} · 📞 {req.userId?.phone || "N/A"}
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border self-start sm:self-auto ${
                      req.status === "pending"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30"
                        : req.status === "approved"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
                          : "bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30"
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={`p-3 rounded-2xl border ${
                      isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
                    }`}>
                      <p className={`text-[10px] font-mono uppercase ${isDark ? "text-stone-400" : "text-stone-500"}`}>Withdrawal Amount</p>
                      <p className={`text-base font-black mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>
                        {req.amount} <span className="text-xs text-amber-600 dark:text-[#fbbf24]">PPC</span>
                      </p>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ≈ ₹{rupeeVal}
                      </p>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
                    }`}>
                      <p className={`text-[10px] font-mono uppercase ${isDark ? "text-stone-400" : "text-stone-500"}`}>Origin Wallet</p>
                      <p className={`text-xs font-bold mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>{getWalletLabel(req.walletType)}</p>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
                    }`}>
                      <p className={`text-[10px] font-mono uppercase ${isDark ? "text-stone-400" : "text-stone-500"}`}>Balance at Request</p>
                      <p className={`text-xs font-bold mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>
                        {req.balanceAtRequest} <span className="text-[10px] text-amber-600 dark:text-[#fbbf24]">PPC</span>
                      </p>
                    </div>
                  </div>

                  {/* Locked PPC Banner */}
                  {req.ppcRateAtRequest > 0 && (
                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? "bg-amber-950/30 border-amber-500/30 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}>
                      <div>
                        <span className="font-bold">🔒 Locked Exchange Rate:</span> 1 PPC = ₹{req.ppcRateAtRequest} @ {req.percentageAtRequest}% share
                      </div>
                      <div className={`font-black px-2 py-0.5 rounded border ${
                        isDark ? "text-white bg-black/40 border-amber-500/30" : "text-stone-900 bg-white border-amber-300"
                      }`}>
                        Payout: ₹{rupeeVal}
                      </div>
                    </div>
                  )}

                  {/* Payment Details */}
                  {req.paymentMethod && (
                    <div className={`p-3 rounded-xl border text-xs ${
                      isDark ? "bg-black/40 border-sky-500/20 text-sky-200" : "bg-sky-50 border-sky-200 text-sky-900"
                    }`}>
                      <p><strong>Payment Mode:</strong> {req.paymentMethod}</p>
                      {req.paymentDetails && <p className={`mt-0.5 ${isDark ? "text-stone-300" : "text-stone-700"}`}><strong>Account Details:</strong> {req.paymentDetails}</p>}
                    </div>
                  )}

                  {req.adminNote && (
                    <div className={`p-3 rounded-xl border text-xs ${
                      isDark ? "bg-black/40 border-white/[0.06] text-stone-300" : "bg-stone-50 border-stone-200 text-stone-700"
                    }`}>
                      <strong className={isDark ? "text-white" : "text-stone-900"}>Admin Note:</strong> {req.adminNote}
                    </div>
                  )}

                  {req.transactionId && (
                    <div className={`p-3 rounded-xl border text-xs font-mono ${
                      isDark ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}>
                      <strong>Transaction ID / UTR:</strong> {req.transactionId}
                    </div>
                  )}

                  <div className={`text-[10.5px] font-mono space-y-0.5 ${isDark ? "text-stone-500" : "text-stone-400"}`}>
                    <p>Requested: {new Date(req.createdAt).toLocaleString("en-IN")}</p>
                    {req.approvedAt && <p className="text-emerald-600 dark:text-emerald-400">Approved: {new Date(req.approvedAt).toLocaleString("en-IN")}</p>}
                    {req.rejectedAt && <p className="text-red-600 dark:text-red-400">Rejected: {new Date(req.rejectedAt).toLocaleString("en-IN")}</p>}
                  </div>

                  {/* Actions */}
                  {req.status === "pending" && (
                    <div className={`flex gap-2 pt-2 border-t ${
                      isDark ? "border-white/[0.06]" : "border-stone-100"
                    }`}>
                      <button
                        onClick={() => openModal("approve", req)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                      >
                        ✅ Approve & Record Transfer
                      </button>
                      <button
                        onClick={() => openModal("reject", req)}
                        className="py-2.5 px-5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ── MODAL ── */}
      {modalData.show && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 ${
            isDark ? "bg-[#121814] border-white/[0.12] text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <h2 className={`text-base font-black uppercase flex items-center gap-2 ${isDark ? "text-white" : "text-stone-900"}`}>
              {modalData.context === "reward"
                ? (modalData.action === "approve" ? "✅ Disburse Level Reward" : "❌ Reject Reward Claim")
                : (modalData.action === "approve" ? "✅ Confirm Withdrawal Transfer" : "❌ Reject Withdrawal")}
            </h2>

            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              isDark ? "bg-black/40 border-white/[0.06] text-stone-300" : "bg-stone-50 border-stone-200 text-stone-700"
            }`}>
              <p><span className={isDark ? "text-stone-500" : "text-stone-400"}>Recipient:</span> <strong className={isDark ? "text-white" : "text-stone-900"}>{modalData.request?.userId?.name}</strong></p>
              {modalData.context === "reward" ? (
                <>
                  <p><span className={isDark ? "text-stone-500" : "text-stone-400"}>Rank:</span> {modalData.request?.levelName}</p>
                  <p className="text-purple-600 dark:text-purple-300 font-bold">Reward: {modalData.request?.rewardText}</p>
                </>
              ) : (
                <>
                  <p className={`font-bold text-sm ${isDark ? "text-white" : "text-stone-900"}`}>
                    Amount: {modalData.request?.amount} <span className="text-amber-600 dark:text-[#fbbf24]">PPC</span>
                  </p>
                  {modalData.request?.ppcRateAtRequest > 0 && (
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Payout Value: ₹{modalData.request.rupeeValueAtRequest?.toFixed(2)}
                    </p>
                  )}
                </>
              )}
            </div>

            {modalData.context === "withdrawal" && modalData.action === "approve" && (
              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Bank Reference / UTR Number
                </label>
                <input
                  type="text"
                  value={modalData.transactionId}
                  onChange={(e) => setModalData({ ...modalData, transactionId: e.target.value })}
                  className={`w-full p-2.5 text-xs border rounded-xl focus:outline-none ${
                    isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-amber-500"
                  }`}
                  placeholder="e.g. UTR123456789 / IMPS Ref"
                />
              </div>
            )}

            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                {modalData.action === "approve" ? "Administrative Note (Optional)" : "Reason for Rejection"}
              </label>
              <textarea
                value={modalData.note}
                onChange={(e) => setModalData({ ...modalData, note: e.target.value })}
                rows="3"
                className={`w-full p-2.5 text-xs border rounded-xl focus:outline-none ${
                  isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-amber-500"
                }`}
                placeholder={modalData.action === "approve" ? "Add transaction note..." : "State why this request is rejected..."}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={closeModal}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer ${
                  isDark ? "bg-white/[0.08] hover:bg-white/15 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  if (modalData.context === "reward") {
                    modalData.action === "approve" ? handlePayReward() : handleRejectReward()
                  } else {
                    modalData.action === "approve" ? handleApprove() : handleReject()
                  }
                }}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer shadow-sm transition-all ${
                  modalData.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                {loading ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
