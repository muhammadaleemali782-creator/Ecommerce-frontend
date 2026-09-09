import { useEffect, useState } from "react"
import { useTheme } from "../context/ThemeContext"

export default function MyCreatedUsers() {
  const { isDark } = useTheme()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const myId = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.id } catch { return null }
  })()

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/requests/my`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setList(Array.isArray(data) ? data : [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const roleColor = (role) =>
    role === "distributor" ? (isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-green-100 text-green-700 border-green-200") :
    role === "seller"      ? (isDark ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-blue-100 text-blue-700 border-blue-200") :
    (isDark ? "bg-purple-500/15 text-purple-400 border-purple-500/30" : "bg-purple-100 text-purple-700 border-purple-200")

  if (loading) return <div className="p-8 text-center text-stone-400 font-mono text-xs animate-pulse">Loading team users...</div>

  return (
    <div className={`max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 transition-all ${
      isDark
        ? "bg-[#0c100e] text-white border-white/[0.08]"
        : "bg-white text-gray-900 border-gray-200"
    }`}>
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="font-black text-xl tracking-tight">👥 My Team (Created Users)</h2>
          <p className="text-xs text-stone-400 mt-0.5">Aapke dwara ya aapke behalf par create aur approve kiye gaye team members.</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          {list.length} Members
        </span>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-3xl">👥</p>
          <p className="text-sm font-bold text-stone-400">Abhi koi approved user nahi hai</p>
          <p className="text-xs text-stone-500">Jab admin naye members ko approve karega, wo yaha dikhenge.</p>
        </div>
      ) : (
        list.map(r => {
          const isForMe = r.requestedForId?._id === myId || r.requestedForId === myId
          const isCreatedByMe = !isForMe

          return (
            <div key={r._id} className={`rounded-2xl p-5 border transition-all ${
              isDark
                ? (isForMe ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5")
                : (isForMe ? "border-amber-300 bg-amber-50" : "border-green-300 bg-green-50")
            }`}>

              {/* Header badge */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {isForMe ? (
                  <span className={`text-xs border px-2.5 py-1 rounded-full font-semibold ${
                    isDark ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "bg-amber-100 border-amber-300 text-amber-700"
                  }`}>
                    🎯 Aapke behalf pe {r.requestedBy?.name || "kisi"} ne banaya
                  </span>
                ) : (
                  <span className={`text-xs border px-2.5 py-1 rounded-full font-semibold ${
                    isDark ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-green-100 border-green-300 text-green-700"
                  }`}>
                    ✅ Aapne banaya
                  </span>
                )}

                {/* Jiske liye banaya */}
                {r.requestedForId && !isForMe && (
                  <span className={`text-xs border px-2.5 py-1 rounded-full ${
                    isDark ? "bg-blue-500/15 border-blue-500/30 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}>
                    🎯 Ke liye: <b>{typeof r.requestedForId === "object" ? r.requestedForId.name : "—"}</b>
                  </span>
                )}
              </div>

              {/* User info + Temp Password */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>{r.createdUserName || "—"}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${roleColor(r.type)}`}>
                    {r.type}
                  </span>
                </div>

                <div className={`text-sm space-y-0.5 ${isDark ? "text-stone-300" : "text-gray-600"}`}>
                  <div>📧 <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{r.createdUserEmail || "—"}</span></div>
                  {r.phone && <div>📞 {r.phone}</div>}
                  {r.address && <div>📍 {r.address}</div>}
                </div>

                {/* Temp password box — full width, clearly separated */}
                <div className={`border-2 border-dashed rounded-xl px-4 py-3 text-center w-full ${
                  isDark
                    ? "bg-black/40 border-red-500/30"
                    : "bg-white border-red-200"
                }`}>
                  <p className="text-xs text-red-400 mb-1 font-semibold uppercase tracking-widest">🔑 Temp Password</p>
                  <p className="font-mono font-bold text-2xl text-red-500 tracking-widest select-all">{r.tempPassword || "—"}</p>
                  <p className="text-xs text-stone-400 mt-1">⚠️ Login ke baad change karna hoga</p>
                </div>
              </div>

              {/* Footer — date */}
              <div className="mt-3 text-xs text-stone-500 font-mono">
                🕐 Approved: {new Date(r.approvedAt || r.updatedAt).toLocaleString("en-IN", {
                  day:"2-digit", month:"short", year:"numeric",
                  hour:"2-digit", minute:"2-digit", second:"2-digit",
                  hour12:true
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
