import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import EducaLogo from "../components/EducaLogo"
import { getRoleLabel } from "../utils/roleLabels"
import { saveFormDraft, getFormDraft, clearFormDraft, hasFormDraft } from "../utils/formDraftManager"
import DraftBanner from "../components/DraftBanner"

/* ─── Live Card Preview ─── */
function CardPreview({ productName, price, category, ppcReward, imagePreview, description, isDark }) {
  const [flipped, setFlipped] = useState(false)
  const showPPC = Number(ppcReward) > 0

  return (
    <div className="w-full flex flex-col items-center">
      <div className={`text-[10.5px] font-mono font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
        isDark ? "text-amber-400" : "text-amber-800"
      }`}>
        <span>👁️</span>
        <span>Live 3D Preview (Tap to flip)</span>
      </div>

      <div
        style={{ perspective: "1000px" }}
        className="h-[310px] w-full max-w-[190px] cursor-pointer mx-auto select-none"
        onClick={() => setFlipped(f => !f)}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.55s cubic-bezier(0.4,0.2,0.2,1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          className="relative w-full h-full"
        >
          {/* FRONT */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            className={`absolute inset-0 rounded-2xl overflow-hidden border shadow-xl flex flex-col transition-colors ${
              isDark
                ? "bg-[#141b16] border-white/10 text-white shadow-black/60"
                : "bg-white border-stone-200 text-stone-900 shadow-stone-300/60"
            }`}
          >
            {showPPC && (
              <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-[9.5px] font-black font-mono px-2 py-0.5 rounded-full shadow-md">
                💎 {ppcReward} PPC
              </div>
            )}
            <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-[8.5px] font-mono font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
              tap to flip
            </div>

            {imagePreview ? (
              <div className="h-[125px] overflow-hidden shrink-0 bg-stone-900/40">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`h-[125px] flex items-center justify-center text-3xl shrink-0 ${
                isDark ? "bg-black/30" : "bg-stone-100"
              }`}>
                📦
              </div>
            )}

            <div className="p-3 flex flex-col flex-1 min-w-0">
              <h2 className={`font-black text-xs uppercase tracking-tight truncate mb-0.5 ${
                isDark ? "text-white" : "text-stone-900"
              }`}>
                {productName || "Product Name"}
              </h2>

              {category && (
                <span className="text-[9.5px] font-mono font-bold text-amber-500 truncate mb-1">
                  {category}
                </span>
              )}

              <p className={`font-black text-base tracking-tight mb-2 ${
                isDark ? "text-amber-400" : "text-stone-900"
              }`}>
                ₹{price || "0"}
              </p>

              {showPPC && (
                <div className={`rounded-lg p-1.5 flex items-center gap-1.5 mb-2 border ${
                  isDark
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}>
                  <span className="text-xs">💎</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9.5px] font-bold truncate">{ppcReward} PPC Reward</div>
                    <div className="text-[8px] opacity-75 truncate">Per sale incentive</div>
                  </div>
                </div>
              )}

              <div className="mt-auto bg-amber-400 text-stone-950 font-black text-[11px] uppercase tracking-wider py-1.5 rounded-lg text-center shadow-xs">
                🛒 Add to Cart
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#162019] via-[#111713] to-[#0a0e0b] flex flex-col p-3.5 text-white shadow-xl"
          >
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-8 h-8 rounded-lg object-cover border border-white/20 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm shrink-0">
                  📦
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs truncate leading-tight">
                  {productName || "Product Name"}
                </div>
                {category && <div className="text-[9px] text-amber-400 truncate font-mono">{category}</div>}
              </div>
            </div>

            <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-2.5 mb-2 overflow-hidden">
              <div className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
                Product Details
              </div>
              <p className="text-[10px] leading-relaxed text-stone-300 overflow-hidden line-clamp-3">
                {description || "Description details will appear here..."}
              </p>
            </div>

            <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl p-2 flex justify-between items-center mb-2">
              <div>
                <div className="text-[8.5px] font-mono text-stone-400 uppercase">Price</div>
                <div className="font-black text-sm text-amber-300">₹{price || "0"}</div>
              </div>
              {showPPC && (
                <div className="text-right">
                  <div className="text-[8.5px] font-mono text-stone-400 uppercase">PPC Reward</div>
                  <div className="font-black text-sm text-emerald-400">💎 {ppcReward}</div>
                </div>
              )}
            </div>

            <div className="bg-amber-400 text-stone-950 font-black text-[10.5px] uppercase tracking-wider py-1.5 rounded-lg text-center">
              🛒 Add to Cart
            </div>

            <div className="text-center mt-1.5 text-[8.5px] text-stone-400 font-mono">
              tap to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main AdminAddProduct ─── */
export default function AdminAddProduct({ setPage }) {
  const { isDark } = useTheme()

  const DRAFT_KEY = "admin_add_product"
  const draft = getFormDraft(DRAFT_KEY, {})
  const [productName, setProductName] = useState(draft.productName || "")
  const [price, setPrice] = useState(draft.price || "")
  const [category, setCategory] = useState(draft.category || "")
  const [description, setDescription] = useState(draft.description || "")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(draft.imagePreview || null)
  const [ppcReward, setPpcReward] = useState(draft.ppcReward || "1")
  const [assignAllUsers, setAssignAllUsers] = useState(draft.assignAllUsers || false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [allUsers, setAllUsers] = useState([])
  const [selectedUserIds, setSelectedUserIds] = useState(draft.selectedUserIds || [])
  const [usersLoading, setUsersLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [hasRestoredDraft, setHasRestoredDraft] = useState(() => hasFormDraft(DRAFT_KEY))

  // Auto-save draft on changes
  useEffect(() => {
    if (productName || price || category || description || imagePreview || selectedUserIds.length > 0) {
      saveFormDraft(DRAFT_KEY, {
        productName,
        price,
        category,
        description,
        ppcReward,
        assignAllUsers,
        selectedUserIds,
        imagePreview
      })
    }
  }, [productName, price, category, description, ppcReward, assignAllUsers, selectedUserIds, imagePreview])

  // Flush immediately on phone call / tab close / mobile background
  useEffect(() => {
    const flush = () => {
      if (productName || price || category || description || imagePreview) {
        saveFormDraft(DRAFT_KEY, {
          productName,
          price,
          category,
          description,
          ppcReward,
          assignAllUsers,
          selectedUserIds,
          imagePreview
        })
      }
    }
    window.addEventListener("pagehide", flush)
    window.addEventListener("beforeunload", flush)
    return () => {
      window.removeEventListener("pagehide", flush)
      window.removeEventListener("beforeunload", flush)
    }
  }, [productName, price, category, description, ppcReward, assignAllUsers, selectedUserIds, imagePreview])

  const handleClearDraft = () => {
    clearFormDraft(DRAFT_KEY)
    setProductName("")
    setPrice("")
    setCategory("")
    setDescription("")
    setImage(null)
    setImagePreview(null)
    setPpcReward("1")
    setAssignAllUsers(false)
    setSelectedUserIds([])
    setHasRestoredDraft(false)
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true)
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/all-for-product`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error("Failed to load users")
        const data = await res.json()
        setAllUsers(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Fetch users error:", err)
      } finally {
        setUsersLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = allUsers.filter(u => {
    const matchRole = filterRole === "all" || u.role === filterRole
    const q = searchQuery.toLowerCase().trim()
    const matchSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    return matchRole && matchSearch
  })

  const toggleUser = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredUsers.map(u => u._id)
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedUserIds.includes(id))
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
      formData.append("title", productName.trim())
      formData.append("price", price)
      formData.append("category", category.trim())
      formData.append("description", description.trim())
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
        clearFormDraft(DRAFT_KEY)
        setHasRestoredDraft(false)
        setMessage("✅ Product added successfully to catalog!")
        setProductName(""); setPrice(""); setCategory(""); setDescription("")
        setPpcReward("1"); setImage(null); setImagePreview(null)
        setAssignAllUsers(false); setSelectedUserIds([]); setSearchQuery("")
        if (typeof setPage === "function") {
          setTimeout(() => setPage("admin-products"), 1200)
        } else {
          setTimeout(() => window.location.reload(), 1500)
        }
      }
    } catch (err) {
      setMessage(`Failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const roleBadgeStyle = (role) => {
    if (role === "distributor") {
      return isDark
        ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
        : "bg-sky-50 text-sky-700 border-sky-200"
    }
    if (role === "seller") {
      return isDark
        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200"
    }
    return isDark
      ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
      : "bg-purple-50 text-purple-700 border-purple-200"
  }

  return (
    <div className={`max-w-5xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 space-y-6 select-none transition-colors duration-200 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>
      
      {/* ── HEADER CARD ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDark
          ? "bg-[#111713] border-white/[0.08]"
          : "bg-white border-stone-200 shadow-sm"
      }`}>
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-1">
            <EducaLogo size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-[9.5px] font-black uppercase tracking-widest font-mono">
                ✦ CATALOG CREATION
              </span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
              isDark ? "text-white" : "text-stone-900"
            }`}>
              Add New Product
            </h1>
            <p className={`text-xs font-medium mt-0.5 ${
              isDark ? "text-stone-400" : "text-stone-600"
            }`}>
              Upload images, set pricing, configure PPC incentive & assign products to users.
            </p>
          </div>
        </div>

        {setPage && (
          <button
            type="button"
            onClick={() => setPage("admin-products")}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 self-stretch sm:self-auto ${
              isDark
                ? "bg-white/[0.06] hover:bg-white/[0.12] text-stone-200 hover:text-white border-white/10"
                : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300 shadow-xs"
            }`}
          >
            <span>←</span>
            <span>Back to Products</span>
          </button>
        )}
      </div>

      {/* ── STATUS MESSAGE ── */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2.5 transition-all ${
          message.includes("successfully")
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
        }`}>
          <span>{message.includes("successfully") ? "✅" : "⚠️"}</span>
          <span>{message}</span>
        </div>
      )}

      {/* ── FORM & PREVIEW SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT FORM (8 Columns on desktop) ── */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSubmit}
            className={`p-6 sm:p-7 rounded-3xl border space-y-5 transition-colors ${
              isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
            }`}
          >
            {hasRestoredDraft && (
              <DraftBanner
                onClear={handleClearDraft}
                message="Restored your unsaved product details from previous session."
              />
            )}

            {/* Product Title */}
            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                required
                placeholder="e.g. Pure Shilajit Rasayana Resin"
                className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none border transition-all ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                    : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white shadow-xs"
                }`}
              />
            </div>

            {/* Price & PPC in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  Selling Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                  placeholder="e.g. 1499"
                  className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none border transition-all ${
                    isDark
                      ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                      : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white shadow-xs"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  PPC Reward (Points) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={ppcReward}
                  onChange={e => setPpcReward(e.target.value)}
                  required
                  placeholder="e.g. 1"
                  className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none border transition-all ${
                    isDark
                      ? "bg-black/40 border-amber-500/30 text-amber-300 focus:border-[#fbbf24]"
                      : "bg-amber-50/50 border-amber-300 text-amber-900 focus:border-amber-500 focus:bg-white shadow-xs"
                  }`}
                />
                <p className={`text-[10px] font-mono mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                  💡 1 PPC = ₹40 (Seller reward on each order)
                </p>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                Category <span className="text-[10px] opacity-70 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Rasayana & Vitality, Skin & Hair, Oils & Serums"
                className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none border transition-all ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                    : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white shadow-xs"
                }`}
              />
              <p className={`text-[10px] font-mono mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                Ye category Store page par category filter tabs me dikhegi
              </p>
            </div>

            {/* Description */}
            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                Description & Benefits <span className="text-[10px] opacity-70 font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Product ke ingredients, lab testing, benefits aur dosage likhein..."
                rows={3}
                className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none border transition-all resize-y min-h-[85px] leading-relaxed ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                    : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white shadow-xs"
                }`}
              />
              <p className={`text-[10px] font-mono mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                Card flip hone par piche details me dikhegi
              </p>
            </div>

            {/* Product Image */}
            <div>
              <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}>
                Product Image
              </label>
              <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                isDark ? "bg-black/20 border-white/[0.08]" : "bg-stone-50 border-stone-200"
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`text-xs font-semibold file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:cursor-pointer transition-all ${
                    isDark
                      ? "text-stone-300 file:bg-amber-400 file:text-stone-950 hover:file:bg-amber-300"
                      : "text-stone-700 file:bg-stone-900 file:text-white hover:file:bg-stone-800"
                  }`}
                />
                {imagePreview && (
                  <div className="flex items-center gap-2.5 mt-2 sm:mt-0">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => { setImage(null); setImagePreview(null) }}
                      className="text-[11px] font-bold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── USER ASSIGNMENT SECTION ── */}
            <div className={`rounded-2xl border overflow-hidden transition-colors ${
              isDark ? "border-white/[0.08] bg-black/20" : "border-stone-200 bg-stone-50/50"
            }`}>
              {/* Checkbox Header */}
              <div className={`p-3.5 sm:p-4 border-b flex items-center justify-between gap-3 ${
                isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-100/70 border-stone-200"
              }`}>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignAllUsers}
                    onChange={e => {
                      setAssignAllUsers(e.target.checked)
                      if (e.target.checked) setSelectedUserIds([])
                    }}
                    className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                  />
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    isDark ? "text-white" : "text-stone-900"
                  }`}>
                    Assign to ALL Users
                  </span>
                </label>
                <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  isDark ? "bg-white/[0.06] text-stone-300 border-white/10" : "bg-white text-stone-700 border-stone-300"
                }`}>
                  {allUsers.length} total users
                </span>
              </div>

              {/* Specific User Selector */}
              {!assignAllUsers && (
                <div className="p-3.5 sm:p-4 space-y-3">
                  <p className={`text-[11px] font-bold uppercase tracking-wider font-mono ${
                    isDark ? "text-stone-400" : "text-stone-600"
                  }`}>
                    Ya specific users select karein:
                  </p>

                  <div className="flex gap-2 flex-col sm:flex-row">
                    <input
                      type="text"
                      placeholder="Search username or email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`flex-1 p-2.5 rounded-xl text-xs font-medium focus:outline-none border transition-all ${
                        isDark
                          ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                          : "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-500"
                      }`}
                    />
                    <select
                      value={filterRole}
                      onChange={e => setFilterRole(e.target.value)}
                      className={`p-2.5 rounded-xl text-xs font-bold focus:outline-none border ${
                        isDark
                          ? "bg-[#162019] border-white/10 text-white"
                          : "bg-white border-stone-300 text-stone-900"
                      }`}
                    >
                      <option value="all">All Roles</option>
                      <option value="distributor">Distributor</option>
                      <option value="seller">Seller</option>
                      <option value="user">User</option>
                    </select>
                  </div>

                  {filteredUsers.length > 0 && (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono font-bold ${
                      isDark
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}>
                      <span>{selectedUserIds.length} users selected</span>
                      <button
                        type="button"
                        onClick={toggleSelectAllVisible}
                        className="text-[11px] font-black uppercase tracking-wider underline cursor-pointer"
                      >
                        {filteredUsers.every(u => selectedUserIds.includes(u._id)) ? "Deselect All" : "Select All Visible"}
                      </button>
                    </div>
                  )}

                  {usersLoading ? (
                    <div className="text-center py-6 text-xs text-stone-400 font-mono">Loading users list...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-6 text-xs text-stone-400 font-mono">No users matched search</div>
                  ) : (
                    <div className={`max-h-56 overflow-y-auto rounded-xl border divide-y ${
                      isDark ? "border-white/10 divide-white/[0.06]" : "border-stone-200 divide-stone-100 bg-white"
                    }`}>
                      {filteredUsers.map(u => {
                        const isSelected = selectedUserIds.includes(u._id)
                        const isDisabled = u.isBlocked || u.isDeleted
                        return (
                          <label
                            key={u._id}
                            className={`p-2.5 flex items-center gap-3 transition-colors ${
                              isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                            } ${
                              isSelected
                                ? isDark ? "bg-amber-500/10" : "bg-amber-50/70"
                                : isDark ? "hover:bg-white/[0.03]" : "hover:bg-stone-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleUser(u._id)}
                              disabled={isDisabled}
                              className="w-4 h-4 rounded accent-amber-400 cursor-pointer shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-bold ${isDark ? "text-white" : "text-stone-900"}`}>
                                  {u.name}
                                </span>
                                {u.fullName && u.fullName !== u.name && (
                                  <span className="text-[10px] text-stone-400">
                                    ({u.fullName})
                                  </span>
                                )}
                                <span className={`text-[9.5px] font-mono font-bold px-2 py-0.2 rounded-full border ${roleBadgeStyle(u.role)}`}>
                                  {getRoleLabel(u.role)}
                                </span>
                                {u.isBlocked && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                                    blocked
                                  </span>
                                )}
                              </div>
                              <div className="text-[10.5px] font-mono text-stone-400 truncate mt-0.5">
                                {u.email}
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {selectedUserIds.length === 0 && (
                    <p className={`p-2.5 rounded-xl border text-[11px] font-bold ${
                      isDark
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}>
                      ⚠️ Kripya kam se kam ek user select karein ya upar "Assign to ALL Users" tick karein.
                    </p>
                  )}
                </div>
              )}

              {assignAllUsers && (
                <div className={`p-3.5 text-xs font-bold border-t ${
                  isDark
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}>
                  ✅ Ye product registered sabhi users aur sellers ko automatically assign ho jayega.
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-98 disabled:opacity-50"
              >
                {loading ? "Adding Product to Catalog..." : "✓ Add Product to Catalog"}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT LIVE PREVIEW (4 Columns on desktop, sticky) ── */}
        <div className="lg:col-span-4 lg:sticky lg:top-6">
          <div className={`p-5 rounded-3xl border transition-colors ${
            isDark
              ? "bg-[#111713] border-white/[0.08]"
              : "bg-white border-stone-200 shadow-sm"
          }`}>
            <CardPreview
              productName={productName}
              price={price}
              category={category}
              ppcReward={ppcReward}
              imagePreview={imagePreview}
              description={description}
              isDark={isDark}
            />
          </div>
        </div>

      </div>

    </div>
  )
}
