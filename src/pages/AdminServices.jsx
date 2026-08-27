import { useState, useEffect } from "react"
import InlineLoader from "../components/InlineLoader"
import { useTheme } from "../context/ThemeContext"

const API = `${import.meta.env.VITE_API_URL}`

const PAGE_OPTIONS = [
  { value: "home",        label: "🏠 Home" },
  { value: "store",       label: "🛒 Store" },
  { value: "cart",        label: "🛍️ Cart" },
  { value: "orders",      label: "📦 Orders" },
  { value: "my-network",  label: "🌐 My Network" },
  { value: "my-profile",  label: "👤 My Profile" },
  { value: "ppc-wallet",  label: "💰 PPC Wallet" },
  { value: "coin-wallet", label: "🪙 Coin Wallet" },
]

export default function AdminServices({ setPage }) {
  const { isDark } = useTheme()
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [busy, setBusy]         = useState(false)

  const [form, setForm] = useState({
    title: "", description: "", linkType: "external",
    link: "", type: "square", category: "General", order: 0, image: null
  })

  const token = () => localStorage.getItem("token")

  const load = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/services/admin/all`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      setServices(data.services || [])
    } catch (e) {
      console.error("Services load error:", e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const existingCategories = [...new Set(services.map(s => s.category || "General"))]

  const resetForm = () => {
    setForm({ title: "", description: "", linkType: "external", link: "", type: "square", category: "General", order: 0, image: null })
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (s) => {
    setEditing(s)
    setForm({
      title: s.title, description: s.description || "", linkType: s.linkType,
      link: s.link, type: s.type, category: s.category || "General", order: s.order || 0, image: null
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.link.trim()) {
      alert("⚠️ Title and Link are required")
      return
    }
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("description", form.description)
      fd.append("link", form.link)
      fd.append("linkType", form.linkType)
      fd.append("type", form.type)
      fd.append("category", form.category || "General")
      fd.append("order", form.order)
      if (form.image) fd.append("image", form.image)

      const url    = editing ? `${API}/api/services/${editing._id}` : `${API}/api/services`
      const method = editing ? "PUT" : "POST"

      const res  = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}` }, body: fd })
      const data = await res.json()

      if (res.ok) {
        alert(editing ? "✅ Service updated successfully!" : "✅ Service created successfully!")
        resetForm()
        load()
      } else {
        alert("❌ " + (data.message || "Something went wrong"))
      }
    } catch (e) {
      alert("Error: " + e.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (s) => {
    try {
      const fd = new FormData()
      fd.append("isActive", String(!s.isActive))
      await fetch(`${API}/api/services/${s._id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token()}` }, body: fd
      })
      load()
    } catch (e) { alert("Error: " + e.message) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("This service card will be permanently deleted. Continue?")) return
    try {
      const res = await fetch(`${API}/api/services/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token()}` }
      })
      if (res.ok) { alert("🗑️ Service deleted"); load() }
    } catch (e) { alert("Error: " + e.message) }
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
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ APP SHORTCUTS & HUBS
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            Consultation & Link Services Hub
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>
            Configure direct links, consultation portals, and interactive service widgets across the app.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-stone-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 whitespace-nowrap"
        >
          ➕ Add New Service
        </button>
      </div>

      {/* ── CREATE / EDIT FORM ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className={`rounded-3xl border p-5 sm:p-7 shadow-2xl space-y-5 ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDark ? "border-white/[0.06]" : "border-stone-100"
          }`}>
            <h3 className={`font-black text-base uppercase flex items-center gap-2 ${
              isDark ? "text-white" : "text-stone-900"
            }`}>
              <span>{editing ? "✏️" : "➕"}</span> {editing ? "Edit Service Card" : "Create New Service"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-white text-xs font-bold uppercase cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                Service Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Free Doctor Consultation, Refer & Earn..."
                className={`w-full p-3 rounded-xl border font-bold focus:outline-none ${
                  isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                }`}
              />
            </div>

            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                Description (Optional)
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short tagline shown on the service card..."
                rows={2}
                className={`w-full p-3 rounded-xl border focus:outline-none ${
                  isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Link Type
                </label>
                <select
                  value={form.linkType}
                  onChange={e => setForm(f => ({ ...f, linkType: e.target.value }))}
                  className={`w-full p-2.5 font-bold rounded-xl border focus:outline-none ${
                    isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                >
                  <option value="external">🔗 External Web URL (Opens in new tab)</option>
                  <option value="internal">📱 In-App Screen (Native routing)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Card Display Style
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className={`w-full p-2.5 font-bold rounded-xl border focus:outline-none ${
                    isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                >
                  <option value="square">⬛ Square Card</option>
                  <option value="video">▭ Wide Format</option>
                  <option value="banner">📰 Full-Width Banner</option>
                  <option value="round">⚪ Circular Icon</option>
                  <option value="list">📋 Compact List Row</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                Category / Section Group
              </label>
              <input
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Health Consultations, Blogs, Exclusive Offers..."
                list="category-suggestions"
                className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                  isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                }`}
              />
              <datalist id="category-suggestions">
                {existingCategories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                {form.linkType === "internal" ? "Target Internal Screen *" : "Destination URL *"}
              </label>
              {form.linkType === "internal" ? (
                <select
                  value={form.link}
                  onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  className={`w-full p-2.5 font-bold rounded-xl border focus:outline-none ${
                    isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                >
                  <option value="">— Select internal screen —</option>
                  {PAGE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              ) : (
                <input
                  value={form.link}
                  onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="https://consultation.example.com"
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Display Priority Order
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Thumbnail Asset (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))}
                  className={`w-full p-2 text-xs rounded-xl border file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold ${
                    isDark
                      ? "bg-[#121814] text-stone-300 border-white/10 file:bg-white/10 file:text-white"
                      : "bg-white text-stone-700 border-stone-300 file:bg-stone-200 file:text-stone-900"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className={`flex gap-2 pt-4 border-t ${
            isDark ? "border-white/[0.06]" : "border-stone-100"
          }`}>
            <button
              type="button"
              onClick={resetForm}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase cursor-pointer ${
                isDark ? "bg-white/[0.08] hover:bg-white/15 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
            >
              {busy ? "Saving Service..." : editing ? "💾 Update Service" : "✅ Deploy Service"}
            </button>
          </div>
        </form>
      )}

      {/* ── SERVICES LIST GROUPED BY CATEGORY ── */}
      {loading ? (
        <InlineLoader minHeight={140} />
      ) : services.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <span className="text-3xl block mb-2">🧩</span>
          <h3 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>No Services Configured</h3>
          <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>Click "Add New Service" to create shortcuts and links.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {existingCategories.map(cat => (
            <div key={cat} className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-[#fbbf24] px-1 flex items-center gap-2">
                <span>📁</span> Section: {cat}
              </h4>

              <div className="space-y-3">
                {services.filter(s => (s.category || "General") === cat).map(s => (
                  <div
                    key={s._id}
                    className={`rounded-3xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-md ${
                      isDark ? "bg-[#111713] border-white/[0.08] hover:border-white/20" : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
                    } ${
                      s.isActive ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {s.image ? (
                        <img src={`${API}${s.image}`} alt="" className="w-14 h-14 rounded-2xl object-cover border border-stone-200 dark:border-white/10 shrink-0" />
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-xl shrink-0 ${
                          isDark ? "bg-black/40 border-white/10" : "bg-stone-100 border-stone-200"
                        }`}>
                          🧩
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-stone-900"}`}>
                            {s.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase ${
                            isDark ? "bg-white/[0.06] text-stone-400 border-white/10" : "bg-stone-100 text-stone-600 border-stone-200"
                          }`}>
                            {s.type}
                          </span>
                        </div>

                        <div className={`text-xs truncate mt-0.5 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                          {s.description || "—"}
                        </div>

                        <div className="text-[10px] font-mono text-sky-600 dark:text-sky-400 mt-1 truncate">
                          {s.linkType === "internal" ? "📱 In-App Screen:" : "🔗 External Link:"} {s.link}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => toggleActive(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border ${
                          s.isActive
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-stone-500/15 text-stone-600 dark:text-stone-400 border-stone-500/30 hover:bg-stone-500/25"
                        }`}
                      >
                        {s.isActive ? "🟢 Active" : "⚪ Hidden"}
                      </button>

                      <button
                        onClick={() => openEdit(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${
                          isDark ? "bg-white/[0.08] hover:bg-white/15 text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                        }`}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => handleDelete(s._id)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 text-xs font-bold uppercase cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

