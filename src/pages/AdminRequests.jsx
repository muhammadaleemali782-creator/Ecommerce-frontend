import { useEffect, useState } from "react"
import { getRoleLabel } from "../utils/roleLabels"
import { useTheme } from "../context/ThemeContext"

export default function AdminRequests() {
  const { isDark } = useTheme()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)

  /* ⭐ EMAIL EXISTS CHECK MAP */
  const [emailExistsMap, setEmailExistsMap] = useState({})

  /* ⭐ NEW STATES – PRODUCT OVERRIDE */
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState({})
  const [assignAllMap, setAssignAllMap] = useState({})

  /* ================= LOAD REQUESTS ================= */
  const load = async () => {
    const token = localStorage.getItem("token")

    try {
      setLoading(true)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/requests/all`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Load error:", err)
      alert("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  /* ⭐ REQUESTS LOAD HONE KE BAAD — SAARI EMAILS CHECK KARO */
  useEffect(() => {
    if (requests.length === 0) return

    const checkEmails = async () => {
      const map = {}
      await Promise.all(
        requests.map(async (r) => {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/check-email?email=${encodeURIComponent(r.email)}`
            )
            const data = await res.json()
            map[r._id] = data.exists
          } catch {
            map[r._id] = false
          }
        })
      )
      setEmailExistsMap(map)
    }

    checkEmails()
  }, [requests])

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/products/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const data = await res.json()
        if (Array.isArray(data)) setProducts(data)
      } catch (err) {
        console.error("Product load error:", err)
      }
    }

    loadProducts()
  }, [])

  /* ================= APPROVE ================= */
  const approve = async (id) => {
    const token = localStorage.getItem("token")

    try {
      const productIds = selectedProducts[id] || []
      const assignAllProducts = assignAllMap[id] || false

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/requests/approve/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productIds,
            assignAllProducts
          })
        }
      )

      const data = await res.json()

      if (!res.ok || !data.success) {
        alert(data.message || "Approve failed ❌")
        return
      }

      alert("User created ✅ Temp password: " + data.tempPassword)
      setRequests(prev => prev.filter(r => r._id !== id))
    } catch (err) {
      alert("Error approving request")
      console.error(err)
    }
  }

  /* ================= REJECT ================= */
  const reject = async (id) => {
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/requests/reject/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      )

      await res.json()
      alert("Request rejected ❌")
      setRequests(prev => prev.filter(r => r._id !== id))
    } catch (err) {
      alert("Error rejecting request")
      console.error(err)
    }
  }

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>
      
      {/* ── HEADER ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDark ? "bg-[#121814] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600/10 text-amber-600 dark:text-amber-300 border border-blue-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ ONBOARDING QUEUE
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            Pending Membership & Role Requests
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>
            Pending in queue: <span className="text-amber-600 dark:text-blue-400 font-bold">{requests.length}</span> · Automated email validation active
          </p>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="text-center py-12 text-stone-400 text-xs font-mono animate-pulse">
          Fetching pending requests...
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && requests.length === 0 && (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <span className="text-3xl block mb-2">📬</span>
          <h3 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>No Pending Requests</h3>
          <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>All membership requests have been reviewed.</p>
        </div>
      )}

      {/* ── REQUEST CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {requests.map(r => {
          const roleLabel = getRoleLabel(r.type)
          const emailExists = emailExistsMap[r._id]

          return (
            <div
              key={r._id}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all shadow-sm ${
                isDark
                  ? "bg-[#111713] border-white/[0.08] hover:border-white/15"
                  : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-md"
              }`}
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                      {(r.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`text-sm font-black leading-tight ${
                        isDark ? "text-white" : "text-stone-900"
                      }`}>
                        {r.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/30 text-[9px] font-mono font-bold uppercase">
                          {roleLabel}
                        </span>
                        {emailExists === true && (
                          <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-300 border border-red-500/30 text-[9px] font-bold">
                            ❌ Email Registered
                          </span>
                        )}
                        {emailExists === false && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                            ✅ Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className={`mt-3.5 pt-3 border-t space-y-1.5 text-xs ${
                  isDark ? "border-white/[0.06] text-stone-300" : "border-stone-100 text-stone-700"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={isDark ? "text-stone-500" : "text-stone-400"}>📧 Email:</span>
                    <span className={`font-bold truncate ${isDark ? "text-white" : "text-stone-900"}`}>{r.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={isDark ? "text-stone-500" : "text-stone-400"}>📞 Phone:</span>
                    <span className={`font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{r.phone || "—"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={`${isDark ? "text-stone-500" : "text-stone-400"} shrink-0`}>📍 Address:</span>
                    <span className={`font-bold line-clamp-1 ${isDark ? "text-white" : "text-stone-900"}`}>{r.address || "—"}</span>
                  </div>
                  {r.idNumber && (
                    <div className="flex items-center gap-2">
                      <span className={isDark ? "text-stone-500" : "text-stone-400"}>🪪 {r.idType === "pan" ? "PAN" : "Aadhar"}:</span>
                      <span className="font-mono text-amber-600 dark:text-[#fbbf24] font-bold">{r.idNumber}</span>
                    </div>
                  )}
                </div>

                {/* Origin Tags */}
                <div className={`mt-3 pt-2 border-t flex items-center gap-2 flex-wrap text-[10px] ${
                  isDark ? "border-white/[0.06]" : "border-stone-100"
                }`}>
                  <span className={`px-2 py-0.5 rounded-md border ${
                    isDark ? "bg-white/[0.04] border-white/10 text-stone-400" : "bg-stone-100 border-stone-200 text-stone-600"
                  }`}>
                    👤 Raised by: <b className={isDark ? "text-white" : "text-stone-900"}>{r.requestedBy?.name || "Unknown"}</b> ({r.requestedBy?.role || "user"})
                  </span>
                  {r.requestedForId ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-amber-600 dark:text-amber-300">
                      🎯 Target: <b className={isDark ? "text-white" : "text-stone-900"}>{r.requestedForId?.name}</b> ({r.requestedForId?.role})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-300">
                      🙋 Self Registration
                    </span>
                  )}
                </div>

                {/* Requested Products */}
                {(r.assignAllProducts || r.assignedProducts?.length > 0) && (
                  <div className="mt-2 text-[11px] text-sky-600 dark:text-sky-400 font-bold">
                    📦 Requested Inventory: {r.assignAllProducts ? "ALL PRODUCTS" : `${r.assignedProducts.length} selected items`}
                  </div>
                )}

                {/* Product Override Selector */}
                {products.length > 0 && (
                  <div className={`mt-3 p-2.5 rounded-xl border ${
                    isDark ? "bg-black/40 border-white/[0.08]" : "bg-stone-50 border-stone-200"
                  }`}>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className={`font-mono font-bold uppercase ${
                        isDark ? "text-stone-400" : "text-stone-600"
                      }`}>
                        Admin Product Override (Optional):
                      </span>
                      <label className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-300 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            setAssignAllMap(prev => ({
                              ...prev,
                              [r._id]: e.target.checked
                            }))
                          }}
                          className="rounded border-stone-300 dark:border-white/20 text-[#fbbf24] cursor-pointer"
                        />
                        Assign All
                      </label>
                    </div>

                    {!assignAllMap[r._id] && (
                      <div className="max-h-28 overflow-y-auto space-y-1 p-1 no-scrollbar text-xs">
                        {products.map(p => (
                          <label key={p._id} className={`flex items-center justify-between p-1 rounded cursor-pointer ${
                            isDark ? "hover:bg-white/5" : "hover:bg-stone-100"
                          }`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                onChange={() => {
                                  setSelectedProducts(prev => {
                                    const arr = prev[r._id] || []
                                    return {
                                      ...prev,
                                      [r._id]: arr.includes(p._id)
                                        ? arr.filter(x => x !== p._id)
                                        : [...arr, p._id]
                                    }
                                  })
                                }}
                                className="rounded border-stone-300 dark:border-white/20 text-[#fbbf24] cursor-pointer"
                              />
                              <span className={isDark ? "text-stone-300" : "text-stone-700"}>{p.title}</span>
                            </div>
                            <span className="text-amber-600 dark:text-[#fbbf24] font-bold">₹{p.price}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={`pt-3 border-t flex items-center gap-2 ${
                isDark ? "border-white/[0.06]" : "border-stone-100"
              }`}>
                <button
                  onClick={() => approve(r._id)}
                  disabled={emailExists === true}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    emailExists === true
                      ? "bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed border border-stone-300 dark:border-white/5"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:scale-95"
                  }`}
                >
                  Approve & Create Account
                </button>

                <button
                  onClick={() => reject(r._id)}
                  className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                >
                  Reject
                </button>
              </div>

              {emailExists === true && (
                <p className="text-[10px] text-red-500 font-bold mt-1">
                  ⚠️ This email is already registered in the system. Reject this request first to clear it.
                </p>
              )}

            </div>
          )
        })}
      </div>

    </div>
  )
}

