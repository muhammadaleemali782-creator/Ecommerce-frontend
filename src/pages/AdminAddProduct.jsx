import { useState, useEffect } from "react"

/* ─── Live Card Preview ─── */
function CardPreview({ productName, price, category, ppcReward, imagePreview, description }) {
  const [flipped, setFlipped] = useState(false)
  const showPPC = Number(ppcReward) > 0

  return (
    <div>
      <div style={{
        fontSize: 11, color: "#7c3aed", fontWeight: 700,
        marginBottom: 8, textTransform: "uppercase", letterSpacing: 1,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        👁️ Live Preview — Tap to flip
      </div>

      <div
        style={{ perspective: "1000px", height: 300, cursor: "pointer", maxWidth: 180, margin: "0 auto" }}
        onClick={() => setFlipped(f => !f)}
      >
        <div style={{
          position: "relative", width: "100%", height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4,0.2,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>
          {/* FRONT */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            borderRadius: 14, overflow: "hidden", background: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column",
          }}>
            {showPPC && (
              <div style={{
                position: "absolute", top: 8, right: 8, zIndex: 10,
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                color: "#fff", fontSize: 10, fontWeight: 800,
                padding: "3px 8px", borderRadius: 20,
              }}>💎 {ppcReward} PPC</div>
            )}
            <div style={{
              position: "absolute", top: 8, left: 8, zIndex: 10,
              background: "rgba(0,0,0,0.35)", color: "#fff",
              fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
            }}>tap for info</div>

            {imagePreview ? (
              <div style={{ height: 120, overflow: "hidden", flexShrink: 0 }}>
                <img src={imagePreview} alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{
                height: 120, background: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, flexShrink: 0,
              }}>📦</div>
            )}

            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h2 style={{
                fontWeight: 800, fontSize: 13, color: "#1e293b",
                lineHeight: 1.3, marginBottom: 2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{productName || "Product Name"}</h2>

              {category && (
                <span style={{ fontSize: 10, color: "#7c3aed", fontWeight: 700, marginBottom: 3 }}>
                  {category}
                </span>
              )}

              <p style={{ fontWeight: 900, fontSize: 16, color: "#0f172a", marginBottom: 5 }}>
                ₹{price || "0"}
              </p>

              {showPPC && (
                <div style={{
                  background: "linear-gradient(135deg,#faf5ff,#ede9fe)",
                  border: "1px solid #ddd6fe", borderRadius: 8, padding: "5px 8px",
                  display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
                }}>
                  <span style={{ fontSize: 13 }}>💎</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#6d28d9" }}>{ppcReward} PPC Reward</div>
                    <div style={{ fontSize: 9, color: "#8b5cf6" }}>Is sale par {ppcReward} PPC milenge</div>
                  </div>
                </div>
              )}

              <div style={{
                marginTop: "auto",
                background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
                borderRadius: 8, padding: "7px 0",
                fontWeight: 800, fontSize: 12, textAlign: "center",
              }}>🛒 Add to Cart</div>
            </div>
          </div>

          {/* BACK */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)", borderRadius: 14, overflow: "hidden",
            background: "linear-gradient(145deg,#1e1b4b,#312e81,#4c1d95)",
            display: "flex", flexDirection: "column",
            padding: "14px 12px", color: "#fff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              {imagePreview ? (
                <img src={imagePreview} alt="preview"
                  style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: 6, fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.1)",
                }}>📦</div>
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: 11, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
                  {productName || "Product Name"}
                </div>
                {category && <div style={{ fontSize: 9, color: "#c4b5fd" }}>{category}</div>}
              </div>
            </div>

            <div style={{
              flex: 1, background: "rgba(255,255,255,0.07)",
              borderRadius: 8, padding: "8px 10px", marginBottom: 8, overflow: "hidden",
            }}>
              <div style={{ fontSize: 9, color: "#a78bfa", fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>
                Product Details
              </div>
              <p style={{ fontSize: 10, lineHeight: 1.5, color: "#e2e8f0", overflow: "hidden", maxHeight: 70 }}>
                {description || "Description yahan dikhegi..."}
              </p>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px",
              display: "flex", justifyContent: "space-between", marginBottom: 8,
            }}>
              <div>
                <div style={{ fontSize: 9, color: "#a78bfa" }}>Price</div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#fde68a" }}>₹{price || "0"}</div>
              </div>
              {showPPC && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: "#a78bfa" }}>PPC</div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: "#86efac" }}>💎 {ppcReward}</div>
                </div>
              )}
            </div>

            <div style={{
              background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
              borderRadius: 8, padding: "7px 0",
              fontWeight: 800, fontSize: 11, textAlign: "center",
            }}>🛒 Add to Cart</div>

            <div style={{ textAlign: "center", marginTop: 6, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
              tap to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main AdminAddProduct ─── */
export default function AdminAddProduct() {
  const [productName, setProductName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [ppcReward, setPpcReward] = useState("1")
  const [assignAllUsers, setAssignAllUsers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [allUsers, setAllUsers] = useState([])
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  // detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true)
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/all-for-product`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error("Failed")
        const data = await res.json()
        setAllUsers(data)
      } catch (err) {
        console.error(err)
      } finally {
        setUsersLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = allUsers.filter(u => {
    const matchRole = filterRole === "all" || u.role === filterRole
    const matchSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchRole && matchSearch
  })

  const toggleUser = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredUsers.map(u => u._id)
    const allSelected = visibleIds.every(id => selectedUserIds.includes(id))
    if (allSelected) {
      setSelectedUserIds(prev => prev.filter(id => !visibleIds.includes(id)))
    } else {
      setSelectedUserIds(prev => [...new Set([...prev, ...visibleIds])])
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage("")
      const token = localStorage.getItem("token")
      if (!token) { setMessage("Please login first"); setLoading(false); return }
      if (!assignAllUsers && selectedUserIds.length === 0) {
        setMessage("Please select at least one user OR check 'Assign to ALL Users'")
        setLoading(false); return
      }
      const formData = new FormData()
      formData.append("title", productName)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("description", description)
      formData.append("ppcReward", ppcReward)
      formData.append("assignAllUsers", assignAllUsers)
      if (!assignAllUsers && selectedUserIds.length > 0) {
        formData.append("userIds", JSON.stringify(selectedUserIds))
      }
      if (image) formData.append("image", image)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/add-product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText.substring(0, 100)}`)
      }
      const data = await res.json()
      if (data) {
        setMessage("Product added successfully!")
        setProductName(""); setPrice(""); setCategory(""); setDescription("")
        setPpcReward("1"); setImage(null); setImagePreview(null)
        setAssignAllUsers(false); setSelectedUserIds([]); setSearchQuery("")
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch (err) {
      setMessage(`Failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const roleBadge = (role) => {
    const colors = {
      distributor: "bg-blue-100 text-blue-700",
      seller: "bg-green-100 text-green-700",
      user: "bg-purple-100 text-purple-700"
    }
    return colors[role] || "bg-gray-100 text-gray-600"
  }

  const previewBox = (
    <div style={{
      background: "#faf5ff",
      border: "2px dashed #c4b5fd",
      borderRadius: 16,
      padding: 16,
      width: isMobile ? "100%" : 200,
      boxSizing: "border-box",
    }}>
      <CardPreview
        productName={productName}
        price={price}
        category={category}
        ppcReward={ppcReward}
        imagePreview={imagePreview}
        description={description}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 20 }}>
        ➕ Add Product
      </h2>

      {message && (
        <div style={{
          marginBottom: 16, padding: "12px 16px", borderRadius: 10,
          background: message.includes("successfully") ? "#f0fdf4" : "#fef2f2",
          color: message.includes("successfully") ? "#166534" : "#991b1b",
          border: `1px solid ${message.includes("successfully") ? "#bbf7d0" : "#fecaca"}`,
          fontWeight: 600,
        }}>
          {message.includes("successfully") ? "✅ " : "❌ "}{message}
        </div>
      )}

      {/* Desktop: side-by-side | Mobile: stacked (form first, preview below) */}
      <div style={{
        display: isMobile ? "flex" : "grid",
        flexDirection: isMobile ? "column" : undefined,
        gridTemplateColumns: isMobile ? undefined : "1fr 216px",
        gap: 24,
        alignItems: "start",
      }}>

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <label style={labelStyle}>Product Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              type="text" value={productName} onChange={e => setProductName(e.target.value)}
              required placeholder="Product ka naam likho"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Price (₹) <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="number" min="0" step="0.01" value={price}
                onChange={e => setPrice(e.target.value)} required placeholder="100"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>PPC Reward <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="number" min="0" step="1" value={ppcReward}
                onChange={e => setPpcReward(e.target.value)} required placeholder="1"
                style={{ ...inputStyle, borderColor: "#a78bfa" }}
              />
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>1 PPC = ₹40</p>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Category <span style={{ color: "#94a3b8", fontSize: 11 }}>(optional)</span></label>
            <input
              type="text" value={category} onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Electronics, Clothing"
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Category filter Store/Home pe dikha dega</p>
          </div>

          <div>
            <label style={labelStyle}>Description <span style={{ color: "#94a3b8", fontSize: 11 }}>(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Product ke baare mein details likho — ingredients, benefits, usage, etc."
              rows={4}
              style={{ ...inputStyle, resize: "vertical", minHeight: 90, fontFamily: "inherit", lineHeight: 1.6 }}
            />
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              Card flip hone pe back side pe dikhegi
            </p>
          </div>

          <div>
            <label style={labelStyle}>Product Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange}
              style={{ fontSize: 13, color: "#475569" }} />
            {imagePreview && (
              <div style={{ marginTop: 8 }}>
                <img src={imagePreview} alt="preview"
                  style={{ height: 80, borderRadius: 8, objectFit: "cover", border: "2px solid #e2e8f0" }} />
                <button type="button" onClick={() => { setImage(null); setImagePreview(null) }}
                  style={{ display: "block", marginTop: 4, fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
                  ✕ Remove image
                </button>
              </div>
            )}
          </div>

          {/* ── ASSIGN ── */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
            <div style={{
              background: "#f8fafc", padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox" checked={assignAllUsers}
                  onChange={e => { setAssignAllUsers(e.target.checked); if (e.target.checked) setSelectedUserIds([]) }}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Assign to ALL Users</span>
              </label>
              <span style={{ fontSize: 12, color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: 6 }}>
                {allUsers.length} users
              </span>
            </div>

            {!assignAllUsers && (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>Specific users select karo:</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text" placeholder="Search name/email..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ ...inputStyle, flex: 1, padding: "8px 12px" }}
                  />
                  <select
                    value={filterRole} onChange={e => setFilterRole(e.target.value)}
                    style={{ ...inputStyle, padding: "8px 10px" }}
                  >
                    <option value="all">All Roles</option>
                    <option value="distributor">Distributor</option>
                    <option value="seller">Seller</option>
                    <option value="user">User</option>
                  </select>
                </div>

                {filteredUsers.length > 0 && (
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    background: "#eff6ff", padding: "8px 12px", borderRadius: 8, fontSize: 13,
                  }}>
                    <span style={{ color: "#1d4ed8", fontWeight: 600 }}>{selectedUserIds.length} selected</span>
                    <button type="button" onClick={toggleSelectAllVisible}
                      style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      {filteredUsers.every(u => selectedUserIds.includes(u._id)) ? "Deselect All" : "Select All Visible"}
                    </button>
                  </div>
                )}

                {usersLoading ? (
                  <div style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 13 }}>Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 13 }}>No users found</div>
                ) : (
                  <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
                    {filteredUsers.map(user => {
                      const isSelected = selectedUserIds.includes(user._id)
                      const isDisabled = user.isBlocked || user.isDeleted
                      return (
                        <label key={user._id}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 12px", cursor: isDisabled ? "not-allowed" : "pointer",
                            background: isSelected ? "#eff6ff" : "#fff",
                            borderBottom: "1px solid #f1f5f9",
                            opacity: isDisabled ? 0.5 : 1,
                          }}>
                          <input
                            type="checkbox" checked={isSelected}
                            onChange={() => toggleUser(user._id)}
                            disabled={isDisabled}
                            style={{ width: 15, height: 15, accentColor: "#2563eb" }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{user.name}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleBadge(user.role)}`}>
                                {user.role}
                              </span>
                              {user.isBlocked && <span style={{ fontSize: 10, background: "#fee2e2", color: "#dc2626", padding: "1px 6px", borderRadius: 10 }}>blocked</span>}
                            </div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{user.email}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}

                {selectedUserIds.length === 0 && (
                  <p style={{ fontSize: 12, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", padding: "8px 12px", borderRadius: 8 }}>
                    ⚠️ Kam se kam ek user select karo, ya "Assign to ALL" enable karo
                  </p>
                )}
              </div>
            )}

            {assignAllUsers && (
              <div style={{ padding: "12px 16px", background: "#f0fdf4", color: "#15803d", fontSize: 13, borderTop: "1px solid #e2e8f0" }}>
                ✅ Product sabhi users ko assign ho jayega
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            style={{
              padding: "14px", borderRadius: 12, border: "none",
              background: loading ? "#94a3b8" : "linear-gradient(90deg,#2563eb,#7c3aed)",
              color: "#fff", fontWeight: 800, fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.3)",
            }}
          >
            {loading ? "Adding Product..." : "✅ Add Product"}
          </button>
        </form>

        {/* ── PREVIEW ── 
            Desktop: right column, sticky
            Mobile: rendered below form (via JSX order) 
        */}
        <div style={isMobile ? {} : { position: "sticky", top: 20 }}>
          {previewBox}
        </div>

      </div>
    </div>
  )
}

const labelStyle = {
  display: "block",
  fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6,
}

const inputStyle = {
  width: "100%", padding: "10px 14px",
  border: "1.5px solid #e2e8f0", borderRadius: 10,
  fontSize: 14, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
}
