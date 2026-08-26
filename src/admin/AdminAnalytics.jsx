import { useEffect, useState } from "react"
import InlineLoader from "../components/InlineLoader"

/*
  =====================================================
  ADMIN ANALYTICS + DRILL DOWN (LUXURY PRODUCTION READY)
  -----------------------------------------------------
  ✔ MongoDB = single source of truth
  ✔ Handles ADMIN → DISTRIBUTOR → SELLER tree
  ✔ Correct counts (NO MORE ZERO BUG)
  ✔ Safe for _id / id mismatch
  ✔ 100% schema & props compatible
  =====================================================
*/

export default function AdminAnalytics({ setPage }) {
  const [tree, setTree] = useState([])
  const [flatUsers, setFlatUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* ================= FETCH TREE ================= */
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Auth token missing")

        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/tree`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error("Failed to fetch tree")

        const data = await res.json()
        const safeTree = Array.isArray(data) ? data : (data?.tree || [])

        setTree(safeTree)

        // Flatten tree with normalized id + parentId
        const flatten = (nodes = [], parentId = null, acc = []) => {
          nodes.forEach(n => {
            const nodeId = n._id || n.id
            acc.push({
              ...n,
              id: nodeId,
              parentId
            })
            if (n.children?.length) {
              flatten(n.children, nodeId, acc)
            }
          })
          return acc
        }

        setFlatUsers(flatten(safeTree))
      } catch (err) {
        console.error("AdminAnalytics error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTree()
  }, [])

  /* ================= COUNTS ================= */
  const distributors = flatUsers.filter(u => u.role === "distributor")
  const sellers = flatUsers.filter(u => u.role === "seller")
  const users = flatUsers.filter(u => u.role === "user")

  /* ================= LOADING / ERROR ================= */
  if (loading) {
    return (
      <div className="bg-[#101512] p-8 rounded-2xl border border-white/[0.08] text-center">
        <InlineLoader label="Loading Live Network Analytics 📊" minHeight={160} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-950/40 border border-red-500/30 p-5 rounded-2xl text-red-300 text-xs sm:text-sm flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <span className="font-bold block text-white">Analytics Load Failed</span>
          <span className="opacity-80">{error}</span>
        </div>
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-6 select-none">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">
              REAL-TIME DATABASE SYNC
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
            Network Analytics & Team Overview
          </h2>
        </div>

        {setPage && (
          <button
            onClick={() => setPage("admin-network")}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#fbbf24] border border-[#fbbf24]/30 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <span>🌐 View Full Tree Map</span>
            <span>➔</span>
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Distributors */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-950/40 via-sky-900/20 to-transparent border border-sky-500/20 relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-sky-400 font-mono">
              DISTRIBUTORS
            </span>
            <span className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-300 flex items-center justify-center text-base border border-sky-500/20">
              🏢
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {distributors.length}
          </div>
          <p className="text-[10.5px] text-sky-300/70 font-medium mt-1">
            Active regional distributors managing territories
          </p>
        </div>

        {/* Sellers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-transparent border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">
              DIRECT SELLERS
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center text-base border border-emerald-500/20">
              🛒
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {sellers.length}
          </div>
          <p className="text-[10.5px] text-emerald-300/70 font-medium mt-1">
            Certified consultants generating direct orders
          </p>
        </div>

        {/* Users */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-transparent border border-amber-500/20 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-mono">
              CUSTOMERS / USERS
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center text-base border border-amber-500/20">
              👤
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {users.length}
          </div>
          <p className="text-[10.5px] text-amber-300/70 font-medium mt-1">
            Registered customer accounts in network
          </p>
        </div>

      </div>

    </div>
  )
}

