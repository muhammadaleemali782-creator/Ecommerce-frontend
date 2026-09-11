import { useEffect, useState, useMemo } from "react"
import { useTheme } from "../context/ThemeContext"
import EducaLogo from "../components/EducaLogo"

const resolveImg = (img) => {
  if (!img) return ""
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) return img
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")
  return `${base}/uploads/${img.replace(/^\/+/, "").replace(/^uploads\//, "")}`
}

export default function AdminProductList({ setPage }) {
  const { isDark } = useTheme()
  const [products, setProducts]   = useState([])
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState("")
  const [userSearch, setUserSearch] = useState("")

  /* ⭐ Per-product selected users map: { productId: Set([uid, ...]) } */
  const [selMap, setSelMap] = useState({})

  /* ================= EDIT PRODUCT MODAL STATE ================= */
  const [editingProduct, setEditingProduct] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editPpcReward, setEditPpcReward] = useState("1")
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImageUrl, setEditImageUrl] = useState("")
  const [editImagePreview, setEditImagePreview] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState("")

  const startEdit = (p) => {
    setEditingProduct(p)
    setEditTitle(p.title || p.name || "")
    setEditPrice(p.price !== undefined ? p.price : "")
    setEditCategory(p.category || "")
    setEditDescription(p.description || "")
    setEditPpcReward(p.ppcReward !== undefined ? p.ppcReward : "1")
    setEditImageFile(null)
    setEditImageUrl(p.image || p.img || "")
    setEditImagePreview(resolveImg(p.image || p.img || ""))
    setEditError("")
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setEditImageFile(null)
    setEditImagePreview("")
    setEditError("")
  }

  const handleEditImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setEditImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault()
    if (!editTitle.trim()) {
      setEditError("Product name is required")
      return
    }
    if (editPrice === "" || isNaN(Number(editPrice)) || Number(editPrice) < 0) {
      setEditError("Valid price is required")
      return
    }

    try {
      setEditSaving(true)
      setEditError("")
      const token = localStorage.getItem("token")
      if (!token) {
        setEditError("Please login first")
        setEditSaving(false)
        return
      }

      const formData = new FormData()
      formData.append("title", editTitle.trim())
      formData.append("price", editPrice)
      formData.append("category", editCategory.trim())
      formData.append("description", editDescription.trim())
      formData.append("ppcReward", editPpcReward)

      if (editImageFile) {
        formData.append("image", editImageFile)
      } else if (editImageUrl.trim()) {
        formData.append("imageUrl", editImageUrl.trim())
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/update-product/${editingProduct._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        }
      )

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Failed to update product")
      }

      const updated = data.product || {
        ...editingProduct,
        title: editTitle.trim(),
        price: Number(editPrice),
        category: editCategory.trim(),
        description: editDescription.trim(),
        ppcReward: Number(editPpcReward),
        image: editImageFile ? (data.product?.image || editingProduct.image) : (editImageUrl || editingProduct.image)
      }

      setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...updated } : p))
      setEditingProduct(null)
      alert("Product updated successfully! ✅")
      loadProducts()
    } catch (err) {
      console.error("Save error:", err)
      setEditError(err.message || "Failed to update product")
    } finally {
      setEditSaving(false)
    }
  }

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && editingProduct) {
        cancelEdit()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [editingProduct])

  /* ─── helpers ─── */
  const getSelected    = (pid)      => selMap[pid] || new Set()
  const isChecked      = (pid, uid) => getSelected(pid).has(uid)

  const toggle = (pid, uid) => {
    setSelMap(prev => {
      const cur = new Set(prev[pid] || [])
      cur.has(uid) ? cur.delete(uid) : cur.add(uid)
      return { ...prev, [pid]: cur }
    })
  }

  const selectAll = (pid) => {
    setSelMap(prev => ({
      ...prev,
      [pid]: new Set(users.map(u => u._id))
    }))
  }

  const clearAll = (pid) => {
    setSelMap(prev => ({ ...prev, [pid]: new Set() }))
  }

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/products/all`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Product load error:", err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/all-for-product`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("User load error:", err)
    }
  }

  useEffect(() => {
    loadProducts()
    loadUsers()
  }, [])

  /* ================= DELETE EVERYWHERE ================= */
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this product from everywhere?")) return

    try {
      const token = localStorage.getItem("token")

      await fetch(
        `${import.meta.env.VITE_API_URL}/admin/delete-product/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      alert("Product removed everywhere ✅")
      loadProducts()
    } catch (err) {
      console.error(err)
      alert("Delete failed")
    }
  }

  /* ================= REMOVE FROM USERS ================= */
  const removeFromUsers = async (id) => {
    const selected = [...getSelected(id)]
    if (selected.length === 0) {
      alert("Select users first")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/remove-product-users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ userIds: selected })
        }
      )

      const data = await res.json()
      if (!res.ok) { alert(data.message || "Remove failed"); return }

      alert("Removed from selected users ✅")
      clearAll(id)
      loadProducts()
    } catch (err) {
      console.error(err)
      alert("Remove failed")
    }
  }

  /* ================= ADD TO USERS ================= */
  const addToUsers = async (id) => {
    const selected = [...getSelected(id)]
    if (selected.length === 0) {
      alert("Select users first")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/add-product-users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ userIds: selected })
        }
      )

      const data = await res.json()
      if (!res.ok) { alert(data.message || "Add failed"); return }

      alert(`Product added to ${selected.length} user(s) ✅`)
      clearAll(id)
      loadProducts()
    } catch (err) {
      console.error(err)
      alert("Add to users failed")
    }
  }

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(p => 
      (p.title || p.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    )
  }, [products, search])

  // Filter users inside checkboxes
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users
    const q = userSearch.toLowerCase()
    return users.filter(u => 
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    )
  }, [users, userSearch])

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>
      
      {/* ── HEADER ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDark
          ? "bg-[#121814] border-white/[0.08]"
          : "bg-white border-stone-200 shadow-sm"
      }`}>
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-1">
            <EducaLogo size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600/10 text-amber-600 dark:text-amber-300 border border-blue-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
                ✦ INVENTORY & PERMISSIONS
              </span>
            </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            Product Management & User Assignment
          </h1>
            <p className={`text-xs font-medium mt-0.5 ${
              isDark ? "text-stone-400" : "text-stone-600"
            }`}>
              Total Available Products: <span className={`font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{products.length}</span> · Total Registered Users: <span className={`font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{users.length}</span>
            </p>
          </div>
        </div>

        {/* Search Input & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                isDark
                  ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                  : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-blue-500"
              }`}
            />
          </div>
          {setPage && (
            <button
              onClick={() => setPage("admin-add-product")}
              className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap shadow-sm ${
                isDark
                  ? "bg-amber-400 hover:bg-amber-300 text-stone-950 border-amber-400"
                  : "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-md"
              }`}
            >
              <span>➕ Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="text-center py-12 text-stone-400 text-xs font-mono animate-pulse">
          Loading product inventory...
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && filteredProducts.length === 0 && (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <span className="text-3xl block mb-2">🍃</span>
          <h3 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>
            No Products Found
          </h3>
          <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
            Try another search keyword or add new products to the catalog.
          </p>
          {setPage && (
            <div className="mt-4">
              <button
                onClick={() => setPage("admin-add-product")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                  isDark
                    ? "bg-amber-400 hover:bg-amber-300 text-stone-950"
                    : "bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                }`}
              >
                <span>➕ Add First Product</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCT CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProducts.map(p => {
          const selected = getSelected(p._id)
          const selectedArr = [...selected]
          const title = p.title || p.name || "Untitled Product"
          const price = p.price || 0
          const image = p.image || p.img || "/natgeo_jadibooti.jpg"

          return (
            <div
              key={p._id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isDark
                  ? "bg-[#111713] border-white/[0.08] hover:border-white/15"
                  : "bg-white border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md"
              }`}
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={resolveImg(p.image || p.img) || "/natgeo_jadibooti.jpg"}
                      alt={title}
                      onError={(e) => { e.currentTarget.src = "/natgeo_jadibooti.jpg" }}
                      className={`w-12 h-12 rounded-xl object-cover border shrink-0 ${
                        isDark ? "border-white/10 bg-black/40" : "border-stone-200 bg-stone-100"
                      }`}
                    />
                    <div className="min-w-0">
                      <h3 className={`text-sm font-black line-clamp-1 leading-tight ${
                        isDark ? "text-white" : "text-stone-900"
                      }`}>
                        {title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-xs font-black text-amber-600 dark:text-[#fbbf24]">
                          ₹{Number(price).toLocaleString("en-IN")}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          💎 {p.ppcReward !== undefined ? p.ppcReward : 1} PPC
                        </span>
                        {p.category && (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                            isDark ? "bg-white/[0.06] text-stone-300" : "bg-stone-100 text-stone-700 border border-stone-200"
                          }`}>
                            {p.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedArr.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30 text-[10px] font-bold font-mono shrink-0">
                      {selectedArr.length} selected
                    </span>
                  )}
                </div>

                {/* User Select Controls */}
                <div className={`mt-4 pt-3 border-t ${
                  isDark ? "border-white/[0.06]" : "border-stone-100"
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isDark ? "text-stone-400" : "text-stone-500"
                    }`}>
                      Assign / Revoke Users:
                    </span>
                    <div className="flex items-center gap-2 text-[10.5px]">
                      <button
                        onClick={() => selectAll(p._id)}
                        className="text-sky-500 dark:text-sky-400 hover:underline font-bold cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className={isDark ? "text-white/20" : "text-stone-300"}>•</span>
                      <button
                        onClick={() => clearAll(p._id)}
                        className={`${isDark ? "text-stone-400 hover:text-stone-200" : "text-stone-500 hover:text-stone-700"} font-bold cursor-pointer`}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Users Checkbox Rail */}
                  <div className={`max-h-36 overflow-y-auto rounded-xl border p-2 space-y-1 no-scrollbar ${
                    isDark ? "bg-black/40 border-white/[0.08]" : "bg-stone-50 border-stone-200"
                  }`}>
                    {filteredUsers.map(u => {
                      const checked = isChecked(p._id, u._id)
                      return (
                        <label
                          key={u._id}
                          className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            checked
                              ? isDark ? "bg-white/[0.08] text-white" : "bg-amber-50 text-stone-900 font-bold"
                              : isDark ? "hover:bg-white/[0.03] text-stone-300" : "hover:bg-stone-100 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(p._id, u._id)}
                              className="rounded border-stone-300 dark:border-white/20 text-[#fbbf24] focus:ring-0 cursor-pointer"
                            />
                            <span className="truncate font-medium">{u.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              u.role === "distributor"
                                ? "bg-sky-500/15 text-sky-600 dark:text-sky-300"
                                : u.role === "seller"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                                : "bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300"
                            }`}>
                              {u.role}
                            </span>
                            {u.isBlocked && <span className="text-[10px]" title="Blocked">🚫</span>}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`pt-3 border-t flex items-center gap-2 flex-wrap sm:flex-nowrap ${
                isDark ? "border-white/[0.06]" : "border-stone-100"
              }`}>
                <button
                  onClick={() => startEdit(p)}
                  className="py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                  title="Edit Product Details"
                >
                  <span>✏️ Edit</span>
                </button>

                <button
                  onClick={() => addToUsers(p._id)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  ➕ Add to Users
                </button>

                <button
                  onClick={() => removeFromUsers(p._id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 border ${
                    isDark
                      ? "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-blue-500/30"
                      : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
                  }`}
                >
                  ✕ Remove
                </button>

                <button
                  onClick={() => deleteProduct(p._id)}
                  className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shrink-0"
                  title="Permanent Delete"
                >
                  🗑️
                </button>
              </div>

            </div>
          )
        })}
      </div>

      {/* ================= EDIT PRODUCT MODAL ================= */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={cancelEdit}
        >
          <div
            className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
              isDark
                ? "bg-[#111713] border-white/10 text-white"
                : "bg-white border-stone-200 text-stone-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between shrink-0 ${
              isDark ? "border-white/10 bg-black/20" : "border-stone-100 bg-stone-50/50"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 dark:text-amber-300 flex items-center justify-center text-sm font-black">
                  ✏️
                </span>
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight">
                    Edit Product Details
                  </h2>
                  <p className={`text-[11px] font-mono ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                    ID: {editingProduct._id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={cancelEdit}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? "bg-white/5 border-white/10 text-stone-400 hover:text-white hover:bg-white/10"
                    : "bg-stone-100 border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-200"
                }`}
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body (Scrollable) */}
            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 no-scrollbar">
              {editError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-300 text-xs font-medium">
                  ⚠️ {editError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Image Upload & Preview Box */}
                <div className="sm:col-span-1 flex flex-col items-center">
                  <div className={`w-full aspect-square max-w-[180px] rounded-2xl border overflow-hidden relative group flex items-center justify-center ${
                    isDark ? "bg-black/40 border-white/10" : "bg-stone-100 border-stone-200"
                  }`}>
                    {editImagePreview ? (
                      <img
                        src={editImagePreview}
                        alt="Product preview"
                        onError={(e) => { e.currentTarget.src = "/natgeo_jadibooti.jpg" }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-stone-400 text-xs font-mono">
                        <span className="text-3xl block mb-1">📦</span>
                        No Image
                      </div>
                    )}
                    
                    <label
                      htmlFor="edit-product-image-upload"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer gap-1"
                    >
                      <span>📷 Change Photo</span>
                      <span className="text-[9px] text-stone-300 font-mono">JPG, PNG, WEBP</span>
                    </label>
                    <input
                      id="edit-product-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageFile}
                      className="hidden"
                    />
                  </div>

                  <label
                    htmlFor="edit-product-image-upload"
                    className={`mt-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                      isDark
                        ? "bg-white/5 border-white/10 hover:bg-white/10 text-stone-300"
                        : "bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-700"
                    }`}
                  >
                    📁 Select Photo
                  </label>
                </div>

                {/* Fields */}
                <div className="sm:col-span-2 space-y-3.5">
                  {/* Title */}
                  <div>
                    <label className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 ${
                      isDark ? "text-stone-300" : "text-stone-700"
                    }`}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g. Pure Shilajit Rasayana"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-colors focus:outline-none ${
                        isDark
                          ? "bg-black/40 border-white/10 text-white focus:border-amber-400"
                          : "bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-500"
                      }`}
                    />
                  </div>

                  {/* Price & PPC */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 ${
                        isDark ? "text-stone-300" : "text-stone-700"
                      }`}>
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="e.g. 999"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-black transition-colors focus:outline-none ${
                          isDark
                            ? "bg-black/40 border-white/10 text-amber-400 focus:border-amber-400"
                            : "bg-stone-50 border-stone-200 text-amber-600 focus:border-amber-500"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 ${
                        isDark ? "text-stone-300" : "text-stone-700"
                      }`}>
                        PPC Reward (Points)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editPpcReward}
                        onChange={(e) => setEditPpcReward(e.target.value)}
                        placeholder="e.g. 1"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-black transition-colors focus:outline-none ${
                          isDark
                            ? "bg-black/40 border-white/10 text-emerald-400 focus:border-emerald-400"
                            : "bg-stone-50 border-stone-200 text-emerald-600 focus:border-emerald-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 ${
                      isDark ? "text-stone-300" : "text-stone-700"
                    }`}>
                      Category
                    </label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="e.g. Health, Wellness, Herbal"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors focus:outline-none ${
                        isDark
                          ? "bg-black/40 border-white/10 text-white focus:border-amber-400"
                          : "bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-500"
                      }`}
                    />
                    {/* Quick suggestions */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {["Health", "Wellness", "Ayurvedic", "Herbal", "Personal Care", "Immunity"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEditCategory(cat)}
                          className={`px-2 py-0.5 rounded-lg text-[9.5px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                            editCategory.toLowerCase() === cat.toLowerCase()
                              ? "bg-amber-500 text-stone-950"
                              : isDark
                              ? "bg-white/5 text-stone-400 hover:text-white hover:bg-white/10"
                              : "bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image URL fallback */}
                  <div>
                    <label className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 ${
                      isDark ? "text-stone-400" : "text-stone-500"
                    }`}>
                      Or Image Web URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => {
                        setEditImageUrl(e.target.value)
                        if (!editImageFile) setEditImagePreview(e.target.value)
                      }}
                      placeholder="https://..."
                      className={`w-full px-3.5 py-2 rounded-xl border text-[11px] font-mono transition-colors focus:outline-none ${
                        isDark
                          ? "bg-black/40 border-white/10 text-stone-300 focus:border-amber-400"
                          : "bg-stone-50 border-stone-200 text-stone-700 focus:border-amber-500"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Detailed benefits, ingredients, usage directions..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed transition-colors focus:outline-none ${
                    isDark
                      ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-amber-400"
                      : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
                  }`}
                />
              </div>

              {/* Modal Actions Footer */}
              <div className={`pt-4 border-t flex items-center justify-end gap-3 ${
                isDark ? "border-white/10" : "border-stone-100"
              }`}>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={editSaving}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isDark
                      ? "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                      : "bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-md flex items-center gap-2 ${
                    editSaving
                      ? "bg-amber-400/50 text-stone-950 cursor-wait"
                      : "bg-amber-400 hover:bg-amber-300 text-stone-950"
                  }`}
                >
                  {editSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾 Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

