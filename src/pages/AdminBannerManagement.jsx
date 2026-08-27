import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"

const API = `${import.meta.env.VITE_API_URL}`

const PAGE_OPTIONS = [
  { value: "home",        label: "🏠 Home" },
  { value: "store",       label: "🛒 Store" },
  { value: "services",    label: "🧩 Services" },
  { value: "cart",        label: "🛍️ Cart" },
  { value: "login",       label: "🔑 Login" },
]

export default function AdminBannerManagement({ setPage }) {
  const { isDark } = useTheme()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [busy, setBusy]         = useState(false)
  const [preview, setPreview]   = useState(null)
  const [previewMobile, setPreviewMobile] = useState(null)

  const [form, setForm] = useState({
    title: "", subtitle: "", eyebrow: "", align: "left", buttonText: "", buttonLink: "",
    linkType: "internal", overlay: true, order: 0, media: null, mediaMobile: null,
    placement: "hero", removeMobileMedia: false,
  })

  const token = () => localStorage.getItem("token")

  const load = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/banners/admin/all`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (e) {
      console.error("Banners load error:", e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ title: "", subtitle: "", eyebrow: "", align: "left", buttonText: "", buttonLink: "", linkType: "internal", overlay: true, order: 0, media: null, mediaMobile: null, placement: "hero", removeMobileMedia: false })
    setPreview(null)
    setPreviewMobile(null)
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (b) => {
    setEditing(b)
    setForm({
      title: b.title || "", subtitle: b.subtitle || "",
      eyebrow: b.eyebrow || "", align: b.align || "left",
      buttonText: b.buttonText || "", buttonLink: b.buttonLink || "",
      linkType: b.linkType || "internal", overlay: b.overlay !== false,
      order: b.order || 0, media: null, mediaMobile: null,
      placement: b.placement || "hero", removeMobileMedia: false,
    })
    setPreview(null)
    setPreviewMobile(null)
    setShowForm(true)
  }

  const onFileChange = (e) => {
    const file = e.target.files[0]
    setForm(f => ({ ...f, media: file }))
    if (file) {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith("video/") ? "video" : "image"
      setPreview({ url, type })
    } else {
      setPreview(null)
    }
  }

  const onFileChangeMobile = (e) => {
    const file = e.target.files[0]
    setForm(f => ({ ...f, mediaMobile: file, removeMobileMedia: false }))
    if (file) {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith("video/") ? "video" : "image"
      setPreviewMobile({ url, type })
    } else {
      setPreviewMobile(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editing && !form.media) {
      alert("⚠️ Media file (image/gif/video) select karna zaroori hai")
      return
    }
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("subtitle", form.subtitle)
      fd.append("eyebrow", form.eyebrow)
      fd.append("align", form.align)
      fd.append("buttonText", form.buttonText)
      fd.append("buttonLink", form.buttonLink)
      fd.append("linkType", form.linkType)
      fd.append("overlay", String(form.overlay))
      fd.append("order", form.order)
      fd.append("placement", form.placement)
      if (form.media) fd.append("media", form.media)
      if (form.mediaMobile) fd.append("mediaMobile", form.mediaMobile)
      if (form.removeMobileMedia) fd.append("clearMobile", "true")

      const url    = editing ? `${API}/api/banners/${editing._id}` : `${API}/api/banners`
      const method = editing ? "PUT" : "POST"

      const res  = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}` }, body: fd })
      const data = await res.json()

      if (res.ok && data.success) {
        alert(editing ? "✅ Banner updated successfully!" : "✅ Banner created successfully!")
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

  const toggleActive = async (b) => {
    try {
      const fd = new FormData()
      fd.append("isActive", String(!b.isActive))
      await fetch(`${API}/api/banners/${b._id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token()}` }, body: fd
      })
      load()
    } catch (e) { alert("Error: " + e.message) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("This banner will be permanently deleted. Continue?")) return
    try {
      const res = await fetch(`${API}/api/banners/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      if (res.ok && data.success) { alert("🗑️ Banner deleted"); load() }
      else alert("❌ " + (data.message || "Failed to delete"))
    } catch (e) { alert("Error: " + e.message) }
  }

  const mediaBadge = (type) => ({
    image: { emoji: "🖼️", label: "Image", bg: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
    gif:   { emoji: "🎞️", label: "GIF",   bg: "bg-blue-600/15 text-amber-300 border-blue-500/30" },
    video: { emoji: "🎬", label: "Video", bg: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  }[type] || { emoji: "📄", label: type || "Media", bg: "bg-stone-500/15 text-stone-300 border-stone-500/30" })

  const placementLabel = (p) => ({
    hero:  "🖼️ Hero Banner",
    slot1: "📱 Slot 1",
    slot2: "📱 Slot 2",
    slot3: "📱 Slot 3",
  }[p] || p)

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
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ HERO & PROMOTIONS ENGINE
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            Marketing Banners & Ad Placements
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>
            Manage high-impact hero media, responsive video ads, and in-app promotional banners.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-stone-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 whitespace-nowrap"
        >
          ➕ Add New Banner
        </button>
      </div>

      {/* ── CREATE / EDIT MODAL FORM ── */}
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
              <span>{editing ? "✏️" : "➕"}</span> {editing ? "Edit Banner Placement" : "Create New Promotion Banner"}
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
                Target Ad Placement Location
              </label>
              <select
                value={form.placement}
                onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
                className={`w-full p-3 rounded-xl font-bold border focus:outline-none ${
                  isDark ? "bg-black/40 border-white/10 text-white focus:border-[#fbbf24]" : "bg-stone-50 border-stone-300 text-stone-900 focus:border-blue-500 shadow-sm"
                }`}
              >
                <option value="hero">🖼️ Top Hero Banner (Full width main banner)</option>
                <option value="slot1">📱 Vertical Slot 1 (Under search bar)</option>
                <option value="slot2">📱 Vertical Slot 2 (Under product grid)</option>
                <option value="slot3">📱 Vertical Slot 3 (Extra promotional area)</option>
              </select>
            </div>

            {/* Desktop Media */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
            }`}>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                Desktop / Default Media (Image / GIF / Video) {editing ? "(Choose new to replace)" : "*"}
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={onFileChange}
                className={`w-full p-2 text-xs rounded-xl border file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold ${
                  isDark
                    ? "bg-[#121814] text-stone-300 border-white/10 file:bg-white/10 file:text-white"
                    : "bg-white text-stone-700 border-stone-300 file:bg-stone-200 file:text-stone-900"
                }`}
              />

              {preview && (
                <div className="mt-2 rounded-xl overflow-hidden border border-stone-300 dark:border-white/10 max-h-48">
                  {preview.type === "video" ? (
                    <video src={preview.url} muted autoPlay loop playsInline className="w-full max-h-48 object-cover" />
                  ) : (
                    <img src={preview.url} alt="preview" className="w-full max-h-48 object-cover" />
                  )}
                </div>
              )}

              {!preview && editing?.media && (
                <div className="mt-2 rounded-xl overflow-hidden border border-stone-300 dark:border-white/10 max-h-48">
                  {editing.mediaType === "video" ? (
                    <video src={`${API}${editing.media}`} muted autoPlay loop playsInline className="w-full max-h-48 object-cover" />
                  ) : (
                    <img src={`${API}${editing.media}`} alt="current" className="w-full max-h-48 object-cover" />
                  )}
                </div>
              )}
            </div>

            {/* Mobile Media */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
            }`}>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                Mobile-Specific Media (Optional - Portrait / 9:16)
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={onFileChangeMobile}
                className={`w-full p-2 text-xs rounded-xl border file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold ${
                  isDark
                    ? "bg-[#121814] text-stone-300 border-white/10 file:bg-white/10 file:text-white"
                    : "bg-white text-stone-700 border-stone-300 file:bg-stone-200 file:text-stone-900"
                }`}
              />

              {previewMobile && (
                <div className="mt-2 rounded-xl overflow-hidden border border-stone-300 dark:border-white/10 max-h-40 w-32">
                  {previewMobile.type === "video" ? (
                    <video src={previewMobile.url} muted autoPlay loop playsInline className="w-full max-h-40 object-cover" />
                  ) : (
                    <img src={previewMobile.url} alt="mobile preview" className="w-full max-h-40 object-cover" />
                  )}
                </div>
              )}

              {!previewMobile && !form.removeMobileMedia && editing?.mediaMobile && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="rounded-xl overflow-hidden border border-stone-300 dark:border-white/10 max-h-40 w-32">
                    {editing.mediaTypeMobile === "video" ? (
                      <video src={`${API}${editing.mediaMobile}`} muted autoPlay loop playsInline className="w-full max-h-40 object-cover" />
                    ) : (
                      <img src={`${API}${editing.mediaMobile}`} alt="current mobile" className="w-full max-h-40 object-cover" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, removeMobileMedia: true, mediaMobile: null }))}
                    className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                  >
                    ✕ Remove Mobile Media
                  </button>
                </div>
              )}
            </div>

            {/* Text Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Heading (Optional)
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Festival Mega Sale"
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Badge / Eyebrow Text (Optional)
                </label>
                <input
                  value={form.eyebrow}
                  onChange={e => setForm(f => ({ ...f, eyebrow: e.target.value }))}
                  placeholder="e.g. ⭐ 4.8/5 Rating · 50% OFF"
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                Subheading / Description (Optional)
              </label>
              <input
                value={form.subtitle}
                onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                placeholder="e.g. Claim exclusive discounts and rewards today"
                className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                  isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                }`}
              />
            </div>

            {/* Button & Link */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  CTA Button Label (Optional)
                </label>
                <input
                  value={form.buttonText}
                  onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
                  placeholder="e.g. Shop Now"
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                />
              </div>

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
                  <option value="internal">📱 Internal Route (In-App)</option>
                  <option value="external">🔗 External URL</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Destination Target
                </label>
                {form.linkType === "internal" ? (
                  <select
                    value={form.buttonLink}
                    onChange={e => setForm(f => ({ ...f, buttonLink: e.target.value }))}
                    className={`w-full p-2.5 font-bold rounded-xl border focus:outline-none ${
                      isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                    }`}
                  >
                    <option value="">— Select internal page —</option>
                    {PAGE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                ) : (
                  <input
                    value={form.buttonLink}
                    onChange={e => setForm(f => ({ ...f, buttonLink: e.target.value }))}
                    placeholder="https://example.com/promo"
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Alignment & Order & Overlay */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center pt-2">
              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Text Alignment
                </label>
                <select
                  value={form.align}
                  onChange={e => setForm(f => ({ ...f, align: e.target.value }))}
                  className={`w-full p-2.5 font-bold rounded-xl border focus:outline-none ${
                    isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
                  }`}
                >
                  <option value="left">⬅️ Left Aligned</option>
                  <option value="center">⏺️ Center Aligned</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Display Order
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

              <label className={`flex items-center gap-2 font-bold cursor-pointer pt-4 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                <input
                  type="checkbox"
                  checked={form.overlay}
                  onChange={e => setForm(f => ({ ...f, overlay: e.target.checked }))}
                  className="rounded border-stone-300 dark:border-white/20 bg-stone-100 dark:bg-black/50 text-blue-500"
                />
                Apply Dark Gradient Overlay
              </label>
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
              {busy ? "Saving Banner..." : editing ? "💾 Update Banner" : "✅ Deploy Banner"}
            </button>
          </div>
        </form>
      )}

      {/* ── BANNERS LIST ── */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs font-mono animate-pulse">
          Loading active marketing banners...
        </div>
      ) : banners.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <span className="text-3xl block mb-2">🎬</span>
          <h3 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>No Banners Deployed</h3>
          <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>Click "Add New Banner" above to publish your first promotion.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map(b => {
            const badge = mediaBadge(b.mediaType)
            return (
              <div
                key={b._id}
                className={`rounded-3xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-md ${
                  isDark ? "bg-[#111713] border-white/[0.08] hover:border-white/20" : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
                } ${
                  b.isActive ? "opacity-100" : "opacity-50"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-24 h-16 rounded-2xl overflow-hidden border shrink-0 ${
                    isDark ? "bg-black/40 border-white/10" : "bg-stone-100 border-stone-200"
                  }`}>
                    {b.mediaType === "video" ? (
                      <video src={`${API}${b.media}`} muted className="w-full h-full object-cover" />
                    ) : (
                      <img src={`${API}${b.media}`} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${badge.bg}`}>
                        {badge.emoji} {badge.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase ${
                        isDark ? "bg-white/[0.06] text-stone-300 border-white/10" : "bg-stone-100 text-stone-700 border-stone-200"
                      }`}>
                        {placementLabel(b.placement)}
                      </span>
                      <h3 className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-stone-900"}`}>
                        {b.title || "(No heading title)"}
                      </h3>
                    </div>

                    <div className={`text-xs truncate mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                      {b.subtitle || "—"}
                    </div>

                    <div className="text-[10px] font-mono text-amber-600 dark:text-[#fbbf24] mt-1">
                      Priority Order: {b.order} {b.buttonText && `· CTA: "${b.buttonText}"`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => toggleActive(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border ${
                      b.isActive
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-stone-500/15 text-stone-600 dark:text-stone-400 border-stone-500/30 hover:bg-stone-500/25"
                    }`}
                  >
                    {b.isActive ? "🟢 Active" : "⚪ Hidden"}
                  </button>

                  <button
                    onClick={() => openEdit(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${
                      isDark ? "bg-white/[0.08] hover:bg-white/15 text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                    }`}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => handleDelete(b._id)}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 text-xs font-bold uppercase cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

