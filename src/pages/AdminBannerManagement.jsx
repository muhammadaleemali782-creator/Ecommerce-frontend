import { useState, useEffect } from "react"

const API = `${import.meta.env.VITE_API_URL}`

const PAGE_OPTIONS = [
  { value: "home",        label: "🏠 Home" },
  { value: "store",       label: "🛒 Store" },
  { value: "services",    label: "🧩 Services" },
  { value: "cart",        label: "🛍️ Cart" },
  { value: "login",       label: "🔑 Login" },
]

export default function AdminBannerManagement({ setPage }) {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [busy, setBusy]         = useState(false)
  const [preview, setPreview]   = useState(null) // { url, type }

  const [form, setForm] = useState({
    title: "", subtitle: "", buttonText: "", buttonLink: "",
    linkType: "internal", overlay: true, order: 0, media: null,
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
    setForm({ title: "", subtitle: "", buttonText: "", buttonLink: "", linkType: "internal", overlay: true, order: 0, media: null })
    setPreview(null)
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (b) => {
    setEditing(b)
    setForm({
      title: b.title || "", subtitle: b.subtitle || "",
      buttonText: b.buttonText || "", buttonLink: b.buttonLink || "",
      linkType: b.linkType || "internal", overlay: b.overlay !== false,
      order: b.order || 0, media: null,
    })
    setPreview(null)
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
      fd.append("buttonText", form.buttonText)
      fd.append("buttonLink", form.buttonLink)
      fd.append("linkType", form.linkType)
      fd.append("overlay", String(form.overlay))
      fd.append("order", form.order)
      if (form.media) fd.append("media", form.media)

      const url    = editing ? `${API}/api/banners/${editing._id}` : `${API}/api/banners`
      const method = editing ? "PUT" : "POST"

      const res  = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}` }, body: fd })
      const data = await res.json()

      if (res.ok && data.success) {
        alert(editing ? "✅ Banner update ho gaya!" : "✅ Banner add ho gaya!")
        resetForm()
        load()
      } else {
        alert("❌ " + (data.message || "Kuch galat ho gaya"))
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
    if (!window.confirm("Yeh banner permanently delete ho jayega. Confirm?")) return
    try {
      const res = await fetch(`${API}/api/banners/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      if (res.ok && data.success) { alert("🗑️ Banner delete ho gaya"); load() }
      else alert("❌ " + (data.message || "Delete nahi hua"))
    } catch (e) { alert("Error: " + e.message) }
  }

  const mediaBadge = (type) => ({
    image: { emoji: "🖼️", label: "Image", color: "#0369a1", bg: "#e0f2fe" },
    gif:   { emoji: "🎞️", label: "GIF",   color: "#a16207", bg: "#fef9c3" },
    video: { emoji: "🎬", label: "Video", color: "#7c3aed", bg: "#ede9fe" },
  }[type] || { emoji: "📄", label: type, color: "#475569", bg: "#f1f5f9" })

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 4px" }}>
      <button onClick={() => setPage?.("admin")}
        style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 14 }}>
        ← Back to Dashboard
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>🎬 Home Banners / Ads</h2>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Home page ke top pe dikhne wala hero banner control karo — photo, GIF, ya video, jo bhi chaho
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          ➕ Naya Banner Add Karo
        </button>
      </div>

      {/* ══ FORM ══ */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: "#374151", margin: "0 0 14px" }}>
            {editing ? "✏️ Banner Edit Karo" : "➕ Naya Banner"}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Media (Image / GIF / Video) {editing ? "— badalne ke liye naya select karo" : "*"}</label>
              <input type="file" accept="image/*,video/*" onChange={onFileChange} style={{ ...inp, padding: "6px" }} />
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                Video ke liye size chhota rakho (kam se kam 5-10 sec) taake page fast load ho — max 80MB.
              </p>

              {/* Live preview of newly selected file */}
              {preview && (
                <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0", maxHeight: 200 }}>
                  {preview.type === "video" ? (
                    <video src={preview.url} muted autoPlay loop playsInline style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
                  ) : (
                    <img src={preview.url} alt="preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
                  )}
                </div>
              )}

              {/* Existing media preview when editing and no new file chosen yet */}
              {!preview && editing?.media && (
                <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0", maxHeight: 200 }}>
                  {editing.mediaType === "video" ? (
                    <video src={`${API}${editing.media}`} muted autoPlay loop playsInline style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
                  ) : (
                    <img src={`${API}${editing.media}`} alt="current" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
                  )}
                </div>
              )}
            </div>

            <div>
              <label style={lbl}>Heading (optional)</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Naya Saal, Nayi Deals!" style={inp} />
            </div>

            <div>
              <label style={lbl}>Subheading (optional)</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                placeholder="e.g. 50% tak ki chhoot sirf is hafte" style={inp} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Button Text (optional)</label>
                <input value={form.buttonText} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
                  placeholder="e.g. Abhi Kharido" style={inp} />
              </div>
              <div>
                <label style={lbl}>Link Type</label>
                <select value={form.linkType} onChange={e => setForm(f => ({ ...f, linkType: e.target.value }))} style={inp}>
                  <option value="internal">📱 Internal (app ke andar)</option>
                  <option value="external">🔗 External (URL)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={lbl}>{form.linkType === "internal" ? "App ka Page" : "Button Link / URL"}</label>
              {form.linkType === "internal" ? (
                <select value={form.buttonLink} onChange={e => setForm(f => ({ ...f, buttonLink: e.target.value }))} style={inp}>
                  <option value="">— Page select karo (optional) —</option>
                  {PAGE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              ) : (
                <input value={form.buttonLink} onChange={e => setForm(f => ({ ...f, buttonLink: e.target.value }))}
                  placeholder="https://example.com/offer" style={inp} />
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "end" }}>
              <div>
                <label style={lbl}>Display Order (chhota number pehle)</label>
                <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} style={inp} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#374151", paddingBottom: 9 }}>
                <input type="checkbox" checked={form.overlay} onChange={e => setForm(f => ({ ...f, overlay: e.target.checked }))} />
                Dark overlay (text padhne mein aasani)
              </label>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={resetForm}
              style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={busy}
              style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", background: busy ? "#c4b5fd" : "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 13, cursor: busy ? "default" : "pointer" }}>
              {busy ? "Saving..." : editing ? "💾 Update Karo" : "✅ Add Karo"}
            </button>
          </div>
        </form>
      )}

      {/* ══ LIST ══ */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: 30 }}>Loading...</p>
      ) : banners.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 14, padding: 40, textAlign: "center", color: "#94a3b8" }}>
          Koi banner add nahi kiya abhi tak. "➕ Naya Banner Add Karo" pe click karo.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {banners.map(b => {
            const badge = mediaBadge(b.mediaType)
            return (
              <div key={b._id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", opacity: b.isActive ? 1 : 0.55 }}>
                <div style={{ width: 84, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f1f5f9" }}>
                  {b.mediaType === "video" ? (
                    <video src={`${API}${b.media}`} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <img src={`${API}${b.media}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: badge.bg, color: badge.color }}>
                      {badge.emoji} {badge.label}
                    </span>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{b.title || "(No heading)"}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{b.subtitle || "—"}</div>
                  <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 2 }}>
                    order: {b.order} {b.buttonText && <>· button: "{b.buttonText}"</>}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => toggleActive(b)}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer",
                      background: b.isActive ? "#dcfce7" : "#fee2e2", color: b.isActive ? "#166534" : "#991b1b" }}>
                    {b.isActive ? "🟢 Active" : "⚪ Hidden"}
                  </button>
                  <button onClick={() => openEdit(b)}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#374151", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(b._id)}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
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

const lbl = { display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 5 }
const inp = { width: "100%", borderRadius: 8, border: "1px solid #e2e8f0", padding: "9px 11px", fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }
