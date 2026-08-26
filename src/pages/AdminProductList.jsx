import { useEffect, useState, useMemo } from "react"
import { useTheme } from "../context/ThemeContext"

export default function AdminProductList() {
  const { isDark } = useTheme()
  const [products, setProducts]   = useState([])
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState("")
  const [userSearch, setUserSearch] = useState("")

  /* ⭐ Per-product selected users map: { productId: Set([uid, ...]) } */
  const [selMap, setSelMap] = useState({})

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
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
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

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
              isDark
                ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
            }`}
          />
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
            Try another search keyword or create products first.
          </p>
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
                      src={image}
                      alt={title}
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-black text-amber-600 dark:text-[#fbbf24]">
                          ₹{Number(price).toLocaleString("en-IN")}
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
                  onClick={() => addToUsers(p._id)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  ➕ Add to Users
                </button>

                <button
                  onClick={() => removeFromUsers(p._id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 border ${
                    isDark
                      ? "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-amber-500/30"
                      : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
                  }`}
                >
                  ✕ Remove
                </button>

                <button
                  onClick={() => deleteProduct(p._id)}
                  className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                  title="Permanent Delete"
                >
                  🗑️
                </button>
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}
