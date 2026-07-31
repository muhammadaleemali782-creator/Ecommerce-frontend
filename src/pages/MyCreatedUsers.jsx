import { useEffect, useState } from "react"

export default function MyCreatedUsers() {
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
    role === "distributor" ? "bg-green-100 text-green-700 border-green-200" :
    role === "seller"      ? "bg-blue-100 text-blue-700 border-blue-200"    :
    "bg-purple-100 text-purple-700 border-purple-200"

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="font-bold text-xl text-gray-800">👥 Created Users Info</h2>

      {list.length === 0 ? (
        <p className="text-gray-400">Abhi koi approved user nahi bana hai</p>
      ) : (
        list.map(r => {
          const isForMe = r.requestedForId?._id === myId || r.requestedForId === myId
          const isCreatedByMe = !isForMe

          return (
            <div key={r._id} className={`border-l-4 rounded-lg p-4 shadow-sm ${
              isForMe
                ? "border-amber-400 bg-amber-50"
                : "border-green-400 bg-green-50"
            }`}>

              {/* Header badge */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {isForMe ? (
                  <span className="text-xs bg-amber-100 border border-amber-300 text-amber-700 px-2 py-1 rounded-full font-semibold">
                    🎯 Aapke behalf pe {r.requestedBy?.name || "kisi"} ne banaya
                  </span>
                ) : (
                  <span className="text-xs bg-green-100 border border-green-300 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ✅ Aapne banaya
                  </span>
                )}

                {/* Jiske liye banaya */}
                {r.requestedForId && !isForMe && (
                  <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-full">
                    🎯 Ke liye: <b>{typeof r.requestedForId === "object" ? r.requestedForId.name : "—"}</b>
                  </span>
                )}
              </div>

              {/* User info + Temp Password */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-800 text-base">{r.createdUserName || "—"}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${roleColor(r.type)}`}>
                    {r.type}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-0.5">
                  <div>📧 <span className="font-medium text-gray-800">{r.createdUserEmail || "—"}</span></div>
                  {r.phone && <div>📞 {r.phone}</div>}
                  {r.address && <div>📍 {r.address}</div>}
                </div>

                {/* Temp password box — full width, clearly separated */}
                <div className="bg-white border-2 border-dashed border-red-200 rounded-xl px-4 py-3 text-center w-full">
                  <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-widest">🔑 Temp Password</p>
                  <p className="font-mono font-bold text-2xl text-red-600 tracking-widest select-all">{r.tempPassword || "—"}</p>
                  <p className="text-xs text-gray-400 mt-1">⚠️ Login ke baad change karna hoga</p>
                </div>
              </div>

              {/* Footer — date */}
              <div className="mt-3 text-xs text-gray-400">
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
