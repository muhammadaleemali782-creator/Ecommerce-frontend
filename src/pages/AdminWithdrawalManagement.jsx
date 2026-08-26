import { useState, useEffect } from "react"
import InlineLoader from "../components/InlineLoader"

/* =====================================================
   ADMIN WITHDRAWAL MANAGEMENT (MOBILE RESPONSIVE)
   Approve/Reject withdrawal requests
===================================================== */

export default function AdminWithdrawalManagement() {
  
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
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      
      {/* ── HEADER ── */}
      <div className="bg-[#121814] p-5 sm:p-6 rounded-3xl border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ TREASURY & DISBURSEMENTS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Withdrawal Management & Payouts
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Process bank transfers, disburse PPC rupee conversions, and honor milestone reward claims.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-2xl">
          <button
            onClick={() => switchView("withdrawal")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              view === "withdrawal"
                ? "bg-[#fbbf24] text-black font-black shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            💸 Withdrawals
          </button>
          <button
            onClick={() => switchView("rewards")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              view === "rewards"
                ? "bg-purple-500 text-white font-black shadow-sm"
                : "text-stone-400 hover:text-white"
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
            ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
            : "bg-red-950/60 text-red-300 border-red-500/30"
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
                  ? "bg-white text-black border-white font-black shadow-sm"
                  : "bg-[#111713] text-stone-400 border-white/[0.08] hover:bg-white/10"
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
          <div className="bg-[#111713] p-12 text-center rounded-3xl border border-white/[0.08]">
            <span className="text-3xl block mb-2">🎁</span>
            <h3 className="text-sm font-bold text-white uppercase">No Reward Claims Found</h3>
            <p className="text-xs text-stone-400 mt-1">There are no {filter || "active"} reward claims.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {rewardRequests.map((rc) => (
              <div
                key={rc._id}
                className="bg-[#111713] rounded-3xl border border-purple-500/30 p-5 sm:p-6 space-y-4 hover:border-purple-500/50 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-base">{rc.userId?.name || "Unknown User"}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-stone-300 text-[10px] font-mono font-bold uppercase">
                        {rc.userId?.role}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">📧 {rc.userId?.email}</div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border self-start sm:self-auto ${
                    rc.status === "pending"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : rc.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/15 text-red-300 border-red-500/30"
                  }`}>
                    {rc.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
                    <p className="text-[10px] font-mono text-stone-400 uppercase">Wallet Type</p>
                    <p className="text-xs font-bold text-white mt-0.5">{getWalletLabel(rc.walletType)}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
                    <p className="text-[10px] font-mono text-stone-400 uppercase">Rank Achieved</p>
                    <p className="text-xs font-bold text-purple-300 mt-0.5">🏅 {rc.levelName}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
                    <p className="text-[10px] font-mono text-emerald-400 uppercase">Milestone Reward</p>
                    <p className="text-xs font-black text-emerald-300 mt-0.5">{rc.rewardText}</p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-stone-500 space-y-1">
                  <p>PPC Score: {rc.ppcAtClaim} (Threshold: {rc.ppcRequired})</p>
                  <p>Claimed On: {new Date(rc.requestedAt).toLocaleString("en-IN")}</p>
                  {rc.paidAt && <p className="text-emerald-400">Disbursed: {new Date(rc.paidAt).toLocaleString("en-IN")}</p>}
                  {rc.adminNote && <p className="text-stone-300">Admin Note: {rc.adminNote}</p>}
                </div>

                {rc.status === "pending" && (
                  <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
                    <button
                      onClick={() => openModal("approve", rc, "reward")}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      ✅ Mark Reward as Paid
                    </button>
                    <button
                      onClick={() => openModal("reject", rc, "reward")}
                      className="py-2.5 px-5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
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
          <div className="bg-[#111713] p-12 text-center rounded-3xl border border-white/[0.08]">
            <span className="text-3xl block mb-2">💸</span>
            <h3 className="text-sm font-bold text-white uppercase">No Withdrawal Requests</h3>
            <p className="text-xs text-stone-400 mt-1">There are no {filter || "active"} withdrawal requests in this view.</p>
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
                  className="bg-[#111713] rounded-3xl border border-white/[0.08] p-5 sm:p-6 space-y-4 hover:border-white/20 transition-all shadow-md"
                >
                  {/* User Profile Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-base">{req.userId?.name || "Unknown User"}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-stone-300 text-[10px] font-mono font-bold uppercase">
                          {req.userRole}
                        </span>
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        📧 {req.userId?.email} · 📞 {req.userId?.phone || "N/A"}
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border self-start sm:self-auto ${
                      req.status === "pending"
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : req.status === "approved"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-red-500/15 text-red-300 border-red-500/30"
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
                      <p className="text-[10px] font-mono text-stone-400 uppercase">Withdrawal Amount</p>
                      <p className="text-base font-black text-white mt-0.5">
                        {req.amount} <span className="text-xs text-[#fbbf24]">PPC</span>
                      </p>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">
                        ≈ ₹{rupeeVal}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
                      <p className="text-[10px] font-mono text-stone-400 uppercase">Origin Wallet</p>
                      <p className="text-xs font-bold text-white mt-0.5">{getWalletLabel(req.walletType)}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
                      <p className="text-[10px] font-mono text-stone-400 uppercase">Balance at Request</p>
                      <p className="text-xs font-bold text-white mt-0.5">
                        {req.balanceAtRequest} <span className="text-[10px] text-[#fbbf24]">PPC</span>
                      </p>
                    </div>
                  </div>

                  {/* Locked PPC Banner */}
                  {req.ppcRateAtRequest > 0 && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold">🔒 Locked Exchange Rate:</span> 1 PPC = ₹{req.ppcRateAtRequest} @ {req.percentageAtRequest}% share
                      </div>
                      <div className="font-black text-white px-2 py-0.5 rounded bg-black/40 border border-amber-500/30">
                        Payout: ₹{rupeeVal}
                      </div>
                    </div>
                  )}

                  {/* Payment Details */}
                  {req.paymentMethod && (
                    <div className="p-3 rounded-xl bg-black/40 border border-sky-500/20 text-xs text-sky-200">
                      <p><strong>Payment Mode:</strong> {req.paymentMethod}</p>
                      {req.paymentDetails && <p className="text-stone-300 mt-0.5"><strong>Account Details:</strong> {req.paymentDetails}</p>}
                    </div>
                  )}

                  {req.adminNote && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-stone-300">
                      <strong className="text-white">Admin Note:</strong> {req.adminNote}
                    </div>
                  )}

                  {req.transactionId && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                      <strong>Transaction ID / UTR:</strong> {req.transactionId}
                    </div>
                  )}

                  <div className="text-[10.5px] font-mono text-stone-500 space-y-0.5">
                    <p>Requested: {new Date(req.createdAt).toLocaleString("en-IN")}</p>
                    {req.approvedAt && <p className="text-emerald-400">Approved: {new Date(req.approvedAt).toLocaleString("en-IN")}</p>}
                    {req.rejectedAt && <p className="text-red-400">Rejected: {new Date(req.rejectedAt).toLocaleString("en-IN")}</p>}
                  </div>

                  {/* Actions */}
                  {req.status === "pending" && (
                    <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={() => openModal("approve", req)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                      >
                        ✅ Approve & Record Transfer
                      </button>
                      <button
                        onClick={() => openModal("reject", req)}
                        className="py-2.5 px-5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
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
          <div className="bg-[#121814] border border-white/[0.12] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-base font-black text-white uppercase flex items-center gap-2">
              {modalData.context === "reward"
                ? (modalData.action === "approve" ? "✅ Disburse Level Reward" : "❌ Reject Reward Claim")
                : (modalData.action === "approve" ? "✅ Confirm Withdrawal Transfer" : "❌ Reject Withdrawal")}
            </h2>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] text-xs text-stone-300 space-y-1">
              <p><span className="text-stone-500">Recipient:</span> <strong className="text-white">{modalData.request?.userId?.name}</strong></p>
              {modalData.context === "reward" ? (
                <>
                  <p><span className="text-stone-500">Rank:</span> {modalData.request?.levelName}</p>
                  <p className="text-purple-300 font-bold">Reward: {modalData.request?.rewardText}</p>
                </>
              ) : (
                <>
                  <p className="text-white font-bold text-sm">
                    Amount: {modalData.request?.amount} <span className="text-[#fbbf24]">PPC</span>
                  </p>
                  {modalData.request?.ppcRateAtRequest > 0 && (
                    <p className="text-emerald-400 font-bold">
                      Payout Value: ₹{modalData.request.rupeeValueAtRequest?.toFixed(2)}
                    </p>
                  )}
                </>
              )}
            </div>

            {modalData.context === "withdrawal" && modalData.action === "approve" && (
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Bank Reference / UTR Number
                </label>
                <input
                  type="text"
                  value={modalData.transactionId}
                  onChange={(e) => setModalData({ ...modalData, transactionId: e.target.value })}
                  className="w-full p-2.5 bg-black/40 text-xs text-white border border-white/10 rounded-xl focus:outline-none focus:border-[#fbbf24]"
                  placeholder="e.g. UTR123456789 / IMPS Ref"
                />
              </div>
            )}

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                {modalData.action === "approve" ? "Administrative Note (Optional)" : "Reason for Rejection"}
              </label>
              <textarea
                value={modalData.note}
                onChange={(e) => setModalData({ ...modalData, note: e.target.value })}
                rows="3"
                className="w-full p-2.5 bg-black/40 text-xs text-white border border-white/10 rounded-xl focus:outline-none focus:border-[#fbbf24]"
                placeholder={modalData.action === "approve" ? "Add transaction note..." : "State why this request is rejected..."}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/15 text-stone-300 font-bold text-xs uppercase cursor-pointer"
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
