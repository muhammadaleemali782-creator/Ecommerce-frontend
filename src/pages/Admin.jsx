import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import AdminAnalytics from "../admin/AdminAnalytics"
import CreateUser from "../admin/CreateUser"

export default function Admin({ setPage }) {
  const { user } = useAuth()
  const [tab, setTab] = useState("overview")
  const [networkStats, setNetworkStats] = useState({ distributors:0, sellers:0, users:0 })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/tree`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const tree = await res.json()
        const flat = []
        const walk = (nodes) => nodes.forEach(n => { flat.push(n); if (n.children?.length) walk(n.children) })
        walk(Array.isArray(tree) ? tree : (tree?.tree || []))
        setNetworkStats({
          distributors: flat.filter(u => u.role === "distributor").length,
          sellers:      flat.filter(u => u.role === "seller").length,
          users:        flat.filter(u => u.role === "user").length,
        })
      } catch {}
    }
    load()
  }, [])

  if (!user || user.role !== "admin") {
    return <div className="p-6 text-red-600 font-semibold">❌ Access Denied. Admins only.</div>
  }

  const tabs = [
    { key:"overview",  label:"📊 Overview"  },
    { key:"network",   label:"🌐 Network"   },
    { key:"create",    label:"➕ Create User"},
  ]

  return (
    <div className={`${isMobile ? "px-3 py-4" : "max-w-6xl mx-auto px-6 py-8"} space-y-5`}>

      {/* ── HEADER ── */}
      <div className={`bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl text-white shadow-lg ${isMobile ? "p-4" : "p-6"}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user.name?.[0] || "A"}
          </div>
          <div className="min-w-0">
            <h1 className={`font-bold leading-tight ${isMobile ? "text-lg" : "text-2xl"}`}>Admin Dashboard</h1>
            <p className="text-sm opacity-80 truncate">{user.email}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className={`grid grid-cols-3 gap-2 mt-4`}>
          {[
            { label:"Distributors", value: networkStats.distributors, icon:"🏢" },
            { label:"Sellers",      value: networkStats.sellers,      icon:"🛒" },
            { label:"Users",        value: networkStats.users,        icon:"👤" },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
              <div className="text-lg">{s.icon}</div>
              <div className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}>{s.value}</div>
              <div className="text-xs opacity-75">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              tab === t.key ? "bg-white shadow text-gray-800" : "text-gray-500"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── QUICK LINKS ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setPage?.("admin-services")}
          className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 whitespace-nowrap hover:border-violet-300 hover:text-violet-700 transition">
          🧩 Manage Services
        </button>
        <button onClick={() => setPage?.("admin-orders")}
          className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 whitespace-nowrap hover:border-violet-300 hover:text-violet-700 transition">
          📦 Manage Orders
        </button>
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <AdminAnalytics />
        </div>
      )}

      {/* ── NETWORK ── */}
      {tab === "network" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-3">Full network tree dekho — Network View mein jao</p>
          <AdminAnalytics />
        </div>
      )}

      {/* ── CREATE USER ── */}
      {tab === "create" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-4">Create New User</h3>
          <CreateUser />
        </div>
      )}
    </div>
  )
}
