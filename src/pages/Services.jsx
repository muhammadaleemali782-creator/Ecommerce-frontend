import { useState, useEffect } from "react"

const API = `${import.meta.env.VITE_API_URL}`

function ServiceCard({ s, onClick }) {
  // ⭐ Banner — full width, chhota height
  if (s.type === "banner") {
    return (
      <div onClick={onClick} role="button" tabIndex={0}
        className="bg-white p-4 rounded shadow hover:shadow-lg transition cursor-pointer flex items-center gap-4 col-span-full"
        style={{ minHeight: 90 }}>
        {s.image && <img src={`${API}${s.image}`} alt={s.title} className="w-20 h-20 rounded-md object-cover flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900">{s.title}</h3>
          {s.description && <p className="text-gray-600 text-sm">{s.description}</p>}
        </div>
        <span className="text-purple-600 text-xs font-semibold whitespace-nowrap">
          {s.linkType === "internal" ? "Dekho →" : "Open →"}
        </span>
      </div>
    )
  }

  // ⭐ Round — circular icon-style (jaise Instagram stories)
  if (s.type === "round") {
    return (
      <div onClick={onClick} role="button" tabIndex={0}
        className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition" style={{ width: 96 }}>
        <div className="rounded-full overflow-hidden border-2 border-purple-400 flex items-center justify-center bg-white"
          style={{ width: 72, height: 72 }}>
          {s.image ? <img src={`${API}${s.image}`} alt={s.title} className="w-full h-full object-cover" /> : <span className="text-2xl">🧩</span>}
        </div>
        <span className="text-xs font-semibold text-gray-700 text-center truncate w-full">{s.title}</span>
      </div>
    )
  }

  // ⭐ List Row — compact, ek-line
  if (s.type === "list") {
    return (
      <div onClick={onClick} role="button" tabIndex={0}
        className="bg-white px-4 py-3 rounded shadow hover:shadow-md transition cursor-pointer flex items-center gap-3 col-span-full">
        {s.image ? (
          <img src={`${API}${s.image}`} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
        ) : (
          <span className="text-lg flex-shrink-0">🧩</span>
        )}
        <span className="font-semibold text-gray-900 flex-1 truncate">{s.title}</span>
        <span className="text-purple-600 text-xs font-semibold flex-shrink-0">
          {s.linkType === "internal" ? "→" : "↗"}
        </span>
      </div>
    )
  }

  // ⭐ Default — Square / Wide (video)
  return (
    <div onClick={onClick} role="button" tabIndex={0}
      className={`bg-white p-5 rounded shadow hover:shadow-lg hover:scale-[1.02] transition cursor-pointer flex flex-col
      ${s.type === "video" ? "aspect-video" : "aspect-square"}`}>
      {s.image && (
        <img src={`${API}${s.image}`} alt={s.title} className="w-full rounded-md object-cover mb-3" style={{ maxHeight: "45%" }} />
      )}
      <h3 className="font-bold mb-1 text-gray-900">{s.title}</h3>
      {s.description && <p className="text-gray-600 text-sm flex-1">{s.description}</p>}
      <span className="text-purple-600 text-xs font-semibold mt-2">
        {s.linkType === "internal" ? "App ke andar dekho →" : "Open karo →"}
      </span>
    </div>
  )
}

export default function Services({ setPage }) {
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const res   = await fetch(`${API}/api/services`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        const data = await res.json()
        setServices(data.services || [])
      } catch (e) {
        console.error("Services load error:", e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleClick = (s) => {
    if (s.linkType === "internal" && setPage) {
      setPage(s.link)
    } else {
      window.open(s.link, "_blank", "noopener,noreferrer")
    }
  }

  if (loading) {
    return <p style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Loading services...</p>
  }

  if (services.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow text-center">
        <h2 className="font-bold text-xl">No Services Added</h2>
      </div>
    )
  }

  // ⭐ Category-wise partition — har section apne naam ke saath
  const categories = [...new Set(services.map(s => s.category || "General"))]

  return (
    <div className="space-y-8">
      {categories.map(cat => {
        const items     = services.filter(s => (s.category || "General") === cat)
        const roundOnly = items.every(s => s.type === "round")
        return (
          <div key={cat}>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              📁 {cat}
            </h2>
            <div className={roundOnly ? "flex gap-4 flex-wrap" : "grid md:grid-cols-3 gap-6"}>
              {items.map(s => (
                <ServiceCard key={s._id} s={s} onClick={() => handleClick(s)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
