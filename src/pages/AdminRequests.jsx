import { useEffect, useState } from "react"
import { getRoleLabel } from "../utils/roleLabels"

export default function AdminRequests() {
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
    <div className="space-y-6 select-none">
      
      {/* ── HEADER ── */}
      <div className="bg-[#121814] p-5 sm:p-6 rounded-3xl border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ ONBOARDING QUEUE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Pending Membership & Role Requests
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Pending in queue: <span className="text-amber-400 font-bold">{requests.length}</span> · Automated email validation active
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
        <div className="bg-[#111713] p-12 text-center rounded-3xl border border-white/[0.08]">
          <span className="text-3xl block mb-2">📬</span>
          <h3 className="text-sm font-bold text-white uppercase">No Pending Requests</h3>
          <p className="text-xs text-stone-400 mt-1">All membership requests have been reviewed.</p>
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
              className="bg-[#111713] p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-4 hover:border-white/15 transition-all shadow-sm"
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                      {(r.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white leading-tight">
                        {r.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-mono font-bold uppercase">
                          {roleLabel}
                        </span>
                        {emailExists === true && (
                          <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/30 text-[9px] font-bold">
                            ❌ Email Registered
                          </span>
                        )}
                        {emailExists === false && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                            ✅ Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="mt-3.5 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">📧 Email:</span>
                    <span className="font-bold text-white truncate">{r.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">📞 Phone:</span>
                    <span className="font-bold text-white">{r.phone || "—"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-stone-500 shrink-0">📍 Address:</span>
                    <span className="font-bold text-white line-clamp-1">{r.address || "—"}</span>
                  </div>
                  {r.idNumber && (
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500">🪪 {r.idType === "pan" ? "PAN" : "Aadhar"}:</span>
                      <span className="font-mono text-[#fbbf24] font-bold">{r.idNumber}</span>
                    </div>
                  )}
                </div>

                {/* Origin Tags */}
                <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-stone-400">
                    👤 Raised by: <b className="text-white">{r.requestedBy?.name || "Unknown"}</b> ({r.requestedBy?.role || "user"})
                  </span>
                  {r.requestedForId ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      🎯 Target: <b className="text-white">{r.requestedForId?.name}</b> ({r.requestedForId?.role})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300">
                      🙋 Self Registration
                    </span>
                  )}
                </div>

                {/* Requested Products */}
                {(r.assignAllProducts || r.assignedProducts?.length > 0) && (
                  <div className="mt-2 text-[11px] text-sky-400 font-bold">
                    📦 Requested Inventory: {r.assignAllProducts ? "ALL PRODUCTS" : `${r.assignedProducts.length} selected items`}
                  </div>
                )}

                {/* Product Override Selector */}
                {products.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-mono font-bold uppercase text-stone-400">
                        Admin Product Override (Optional):
                      </span>
                      <label className="flex items-center gap-1.5 text-xs text-amber-300 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            setAssignAllMap(prev => ({
                              ...prev,
                              [r._id]: e.target.checked
                            }))
                          }}
                          className="rounded border-white/20 bg-black/50 text-[#fbbf24]"
                        />
                        Assign All
                      </label>
                    </div>

                    {!assignAllMap[r._id] && (
                      <div className="max-h-28 overflow-y-auto space-y-1 p-1 no-scrollbar text-xs">
                        {products.map(p => (
                          <label key={p._id} className="flex items-center justify-between p-1 rounded hover:bg-white/5 cursor-pointer">
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
                                className="rounded border-white/20 bg-black/50 text-[#fbbf24]"
                              />
                              <span className="text-stone-300">{p.title}</span>
                            </div>
                            <span className="text-[#fbbf24] font-bold">₹{p.price}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
                <button
                  onClick={() => approve(r._id)}
                  disabled={emailExists === true}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    emailExists === true
                      ? "bg-stone-800 text-stone-500 cursor-not-allowed border border-white/5"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:scale-95"
                  }`}
                >
                  Approve & Create Account
                </button>

                <button
                  onClick={() => reject(r._id)}
                  className="py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                >
                  Reject
                </button>
              </div>

              {emailExists === true && (
                <p className="text-[10px] text-red-400 font-bold mt-1">
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

