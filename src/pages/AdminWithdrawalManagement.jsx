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
    <div className="max-w-7xl mx-auto space-y-6 px-2 sm:px-4">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">💳 Withdrawal Management</h1>
        <p className="text-sm sm:text-base opacity-90">Approve or reject withdrawal requests</p>
      </div>
      
      {/* Message */}
      {message.text && (
        <div className={`
          p-4 rounded-lg
          ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
        `}>
          {message.text}
        </div>
      )}
      
      {/* View Toggle — Withdrawals vs Reward Payments */}
      <div className="bg-white rounded-lg shadow-md p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => switchView("withdrawal")}
          className={`
            px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition duration-200
            ${view === "withdrawal"
              ? "bg-orange-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
        >
          💳 Withdrawals
        </button>

        <button
          onClick={() => switchView("rewards")}
          className={`
            px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition duration-200
            ${view === "rewards"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
        >
          🏆 Reward Payments
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter("pending")}
          className={`
            px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition duration-200
            ${filter === "pending" 
              ? "bg-yellow-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
        >
          ⏳ Pending
        </button>
        
        <button
          onClick={() => setFilter(view === "rewards" ? "paid" : "approved")}
          className={`
            px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition duration-200
            ${(filter === "approved" || filter === "paid")
              ? "bg-green-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
        >
          {view === "rewards" ? "✅ Paid" : "✅ Approved"}
        </button>
        
        <button
          onClick={() => setFilter("rejected")}
          className={`
            px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition duration-200
            ${filter === "rejected" 
              ? "bg-red-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
        >
          ❌ Rejected
        </button>
        
        <button
          onClick={() => setFilter("")}
          className={`
            px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition duration-200
            ${filter === "" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
        >
          📋 All
        </button>
      </div>

      {/* ============ REWARD REQUESTS LIST ============ */}
      {view === "rewards" && (
        loading ? (
          <InlineLoader label="Reward requests load ho rahe hain 🎁" minHeight={160} />
        ) : rewardRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            <p className="text-lg font-semibold mb-2">No reward requests found</p>
            <p className="text-sm">No {filter || "any"} reward payment requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {rewardRequests.map((rc) => (
              <div
                key={rc._id}
                className="bg-white rounded-lg shadow-md border-l-4 border-purple-500 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {rc.userId?.name || "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">📧 {rc.userId?.email}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Role: <span className="font-semibold uppercase">{rc.userId?.role}</span>
                    </p>
                  </div>

                  <span className={`
                    px-3 py-1 rounded-full text-xs font-semibold inline-block
                    ${rc.status === "pending" && "bg-yellow-100 text-yellow-800"}
                    ${rc.status === "paid" && "bg-green-100 text-green-800"}
                    ${rc.status === "rejected" && "bg-red-100 text-red-800"}
                  `}>
                    {rc.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Wallet</p>
                    <p className="text-sm font-semibold text-gray-900">{getWalletLabel(rc.walletType)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Rank / Level</p>
                    <p className="text-sm font-bold text-gray-900">🏅 {rc.levelName}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Reward</p>
                    <p className="text-sm font-bold text-purple-700">{rc.rewardText}</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <p>PPC at claim: {rc.ppcAtClaim} (required: {rc.ppcRequired})</p>
                  <p>Requested: {new Date(rc.requestedAt).toLocaleString()}</p>
                  {rc.paidAt && <p className="text-green-600">Paid: {new Date(rc.paidAt).toLocaleString()}</p>}
                  {rc.rejectedAt && <p className="text-red-600">Rejected: {new Date(rc.rejectedAt).toLocaleString()}</p>}
                  {rc.adminNote && <p>Note: {rc.adminNote}</p>}
                </div>

                {rc.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal("approve", rc, "reward")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      ✅ Mark Paid
                    </button>
                    <button
                      onClick={() => openModal("reject", rc, "reward")}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ============ WITHDRAWAL REQUESTS LIST ============ */}
      {view === "withdrawal" && (loading ? (
        <InlineLoader label="Withdrawal requests load ho rahe hain 💸" minHeight={160} />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
          <p className="text-lg font-semibold mb-2">No requests found</p>
          <p className="text-sm">No {filter || "any"} withdrawal requests</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div 
              key={req._id} 
              className="bg-white rounded-lg shadow-md border-l-4 border-orange-500 p-4 sm:p-6"
            >
              {/* User Info */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {req.userId?.name || "Unknown User"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    📧 {req.userId?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    📱 {req.userId?.phone || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Role: <span className="font-semibold uppercase">{req.userRole}</span>
                  </p>
                </div>
                
                <span className={`
                  px-3 py-1 rounded-full text-xs font-semibold inline-block
                  ${req.status === "pending" && "bg-yellow-100 text-yellow-800"}
                  ${req.status === "approved" && "bg-green-100 text-green-800"}
                  ${req.status === "rejected" && "bg-red-100 text-red-800"}
                `}>
                  {req.status.toUpperCase()}
                </span>
              </div>
              
              {/* Amount & Wallet Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    {req.amount} <span className="text-sm font-semibold text-purple-600">PPC</span>
                  </p>
                  {req.ppcRateAtRequest > 0 ? (
                    <p className="text-xs text-green-600 mt-1 font-semibold">
                      = ₹{req.rupeeValueAtRequest?.toFixed(2) || (req.amount * req.ppcRateAtRequest * (req.percentageAtRequest / 100)).toFixed(2)}
                    </p>
                  ) : ppcRate > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      ≈ ₹{(req.amount * ppcRate * 0.25).toFixed(2)} estimated
                    </p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Wallet</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {getWalletLabel(req.walletType)}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Balance at Request</p>
                  <p className="text-sm font-bold text-gray-900">
                    {req.balanceAtRequest} <span className="text-xs font-semibold text-purple-600">PPC</span>
                  </p>
                  {req.ppcRateAtRequest > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ ₹{(req.balanceAtRequest * req.ppcRateAtRequest * (req.percentageAtRequest / 100)).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* ⭐ Locked PPC Rate banner */}
              {req.ppcRateAtRequest > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
                  <div className="text-xs text-amber-800">
                    <span className="font-bold">🔒 Locked Rate:</span> 1 PPC = ₹{req.ppcRateAtRequest} @ {req.percentageAtRequest}% share
                  </div>
                  <div className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded">
                    Payout: ₹{req.rupeeValueAtRequest?.toFixed(2)}
                  </div>
                </div>
              )}
              
              {/* Payment Details */}
              {req.paymentMethod && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-blue-800 mb-1">
                    <strong>Payment Method:</strong> {req.paymentMethod}
                  </p>
                  {req.paymentDetails && (
                    <p className="text-xs text-blue-800">
                      <strong>Details:</strong> {req.paymentDetails}
                    </p>
                  )}
                </div>
              )}
              
              {/* Admin Note */}
              {req.adminNote && (
                <div className="bg-gray-100 p-3 rounded-lg mb-4">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Admin Note:</p>
                  <p className="text-sm text-gray-700">{req.adminNote}</p>
                </div>
              )}
              
              {/* Transaction ID */}
              {req.transactionId && (
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-green-800">
                    <strong>Transaction ID:</strong> {req.transactionId}
                  </p>
                </div>
              )}
              
              {/* Dates */}
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <p>Requested: {new Date(req.createdAt).toLocaleString()}</p>
                {req.approvedAt && (
                  <p className="text-green-600">Approved: {new Date(req.approvedAt).toLocaleString()}</p>
                )}
                {req.rejectedAt && (
                  <p className="text-red-600">Rejected: {new Date(req.rejectedAt).toLocaleString()}</p>
                )}
              </div>
              
              {/* Action Buttons */}
              {req.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal("approve", req)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    ✅ Approve
                  </button>
                  
                  <button
                    onClick={() => openModal("reject", req)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
              
            </div>
          ))}
        </div>
      ))}
      
      {/* Modal */}
      {modalData.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {modalData.context === "reward"
                ? (modalData.action === "approve" ? "✅ Mark Reward as Paid" : "❌ Reject Reward Claim")
                : (modalData.action === "approve" ? "✅ Approve Withdrawal" : "❌ Reject Withdrawal")}
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">User: {modalData.request?.userId?.name}</p>
              {modalData.context === "reward" ? (
                <>
                  <p className="text-sm text-gray-600 mb-1">🏅 Rank: {modalData.request?.levelName}</p>
                  <p className="text-lg font-bold text-purple-700">
                    Reward: {modalData.request?.rewardText}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-900">
                    Amount: {modalData.request?.amount} <span className="text-base text-purple-600">PPC</span>
                  </p>
                  {modalData.request?.ppcRateAtRequest > 0 ? (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2">
                      <p className="text-sm font-bold text-amber-800">
                        🔒 Locked Rate: 1 PPC = ₹{modalData.request.ppcRateAtRequest} @ {modalData.request.percentageAtRequest}%
                      </p>
                      <p className="text-base font-bold text-green-700 mt-1">
                        Payout = ₹{modalData.request.rupeeValueAtRequest?.toFixed(2)}
                      </p>
                    </div>
                  ) : ppcRate > 0 && (
                    <p className="text-sm text-green-600">
                      ≈ ₹{((modalData.request?.amount || 0) * ppcRate * 0.25).toFixed(2)} estimated value
                    </p>
                  )}
                </>
              )}
            </div>
            
            {modalData.context === "withdrawal" && modalData.action === "approve" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={modalData.transactionId}
                  onChange={(e) => setModalData({ ...modalData, transactionId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter transaction ID"
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modalData.action === "approve" ? "Note (Optional)" : "Rejection Reason"}
              </label>
              <textarea
                value={modalData.note}
                onChange={(e) => setModalData({ ...modalData, note: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={modalData.action === "approve" ? "Add a note..." : "Why rejecting?"}
              ></textarea>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
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
                className={`
                  flex-1 font-semibold py-2 px-4 rounded-lg transition duration-200
                  ${loading ? "bg-gray-400 cursor-not-allowed text-gray-200" : ""}
                  ${modalData.action === "approve" && !loading ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                  ${modalData.action === "reject" && !loading ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                `}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
            
          </div>
        </div>
      )}
      
    </div>
  )
}
