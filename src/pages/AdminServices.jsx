import { useState, useEffect } from "react"

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
      alert("⚠️ Title aur Link dono daalna zaroori hai")
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
        alert(editing ? "✅ Service update ho gayi!" : "✅ Service add ho gayi!")
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
    if (!window.confirm("Yeh service permanently delete ho jayegi. Confirm?")) return
    try {
      const res = await fetch(`${API}/api/services/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token()}` }
      })
      if (res.ok) { alert("🗑️ Service delete ho gayi"); load() }
    } catch (e) { alert("Error: " + e.message) }
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 4px" }}>
      <button onClick={() => setPage?.("admin")}
        style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 14 }}>
        ← Back to Dashboard
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>🧩 Manage Services</h2>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Link cards add karo jo users ko Services page pe dikhengi — click karne par seedha link pe le jayengi</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          ➕ Naya Service Add Karo
        </button>
      </div>

      {/* ══ FORM ══ */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: "#374151", margin: "0 0 14px" }}>
            {editing ? "✏️ Service Edit Karo" : "➕ Naya Service"}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. New Year Offer, Refer & Earn, Latest Blog..." style={inp} />
            </div>

            <div>
              <label style={lbl}>Description (optional)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short line jo card pe dikhegi..." rows={2} style={{ ...inp, resize: "vertical" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Link Type</label>
                <select value={form.linkType} onChange={e => setForm(f => ({ ...f, linkType: e.target.value }))} style={inp}>
                  <option value="external">🔗 External (naya tab, koi bhi URL)</option>
                  <option value="internal">📱 Internal (app ke andar ka page)</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Card Style</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inp}>
                  <option value="square">⬛ Square</option>
                  <option value="video">▭ Wide</option>
                  <option value="banner">📰 Banner (full width, chhota height)</option>
                  <option value="round">⚪ Round (gol icon-style)</option>
                  <option value="list">📋 List Row (compact, ek line)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={lbl}>Category / Section (partition ke liye)</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Blogs, Offers, Videos, Important Links..." style={inp} list="category-suggestions" />
              <datalist id="category-suggestions">
                {existingCategories.map(c => <option key={c} value={c} />)}
              </datalist>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                Same naam ki category daalne se services us section ke neeche group ho jayengi (e.g. sab "Blogs" wali ek saath dikhengi)
              </p>
            </div>

            <div>
              <label style={lbl}>
                {form.linkType === "internal" ? "App ka Page Select Karo *" : "Link / URL *"}
              </label>
              {form.linkType === "internal" ? (
                <select value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} style={inp}>
                  <option value="">— Page select karo —</option>
                  {PAGE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              ) : (
                <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="https://example.com/blog-post" style={inp} />
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Display Order (chhota number pehle)</label>
                <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Thumbnail Image (optional)</label>
                <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} style={{ ...inp, padding: "6px" }} />
              </div>
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
      ) : services.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 14, padding: 40, textAlign: "center", color: "#94a3b8" }}>
          Koi service add nahi ki hai abhi tak. "➕ Naya Service Add Karo" pe click karo.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 22 }}>
          {existingCategories.map(cat => (
            <div key={cat}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px 4px" }}>
                📁 {cat}
              </h4>
              <div style={{ display: "grid", gap: 10 }}>
                {services.filter(s => (s.category || "General") === cat).map(s => (
                  <div key={s._id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", opacity: s.isActive ? 1 : 0.55 }}>
                    {s.image ? (
                      <img src={`${API}${s.image}`} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 52, height: 52, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🧩</div>
                    )}

                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{s.description || "—"}</div>
                      <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 2 }}>
                        {s.linkType === "internal" ? "📱 internal:" : "🔗 external:"} {s.link}
                        <span style={{ marginLeft: 8, color: "#94a3b8" }}>· style: {s.type}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={() => toggleActive(s)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer",
                          background: s.isActive ? "#dcfce7" : "#fee2e2", color: s.isActive ? "#166534" : "#991b1b" }}>
                        {s.isActive ? "🟢 Active" : "⚪ Hidden"}
                      </button>
                      <button onClick={() => openEdit(s)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#374151", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(s._id)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
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

const lbl = { display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 5 }
const inp = { width: "100%", borderRadius: 8, border: "1px solid #e2e8f0", padding: "9px 11px", fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }
