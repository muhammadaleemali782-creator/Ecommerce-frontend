import { useState, useMemo } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"

export default function Store({ setPage }) {
  // ✅ FIX: addToCart StoreContext se lo — duplicate local function hataya
  const { products = [], addToCart } = useStore()
  const { user } = useAuth()

  const [search, setSearch]         = useState("")
  const [category, setCategory]     = useState("all")
  const [searchOpen, setSearchOpen] = useState(false)

  const role = user?.role || "guest"

  // Sirf distributor aur seller ko PPC dikhao
  const showPPC = role === "distributor" || role === "seller"

  // ⭐ Saari unique categories nikaalo products se
  const categories = useMemo(() => {
    const cats = (products || []).map(p => p.category).filter(Boolean)
    return [...new Set(cats)]
  }, [products])

  // ⭐ Search + category filter apply karo
  const visibleProducts = useMemo(() => {
    return (products || []).filter(p => {
      const matchesSearch = !search.trim() || p.title?.toLowerCase().includes(search.trim().toLowerCase())
      const matchesCategory = category === "all" || p.category === category
      return matchesSearch && matchesCategory
    })
  }, [products, search, category])

  const getImageSrc = (product) => {
    if (!product.image) return null
    if (typeof product.image === "string") {
      return product.image.startsWith("http") ? product.image : `${import.meta.env.VITE_API_URL}/uploads/${product.image}`
    }
    if (product.image instanceof File) return URL.createObjectURL(product.image)
    return null
  }

  return (
    <div>
      {/* ══ SEARCH + CATEGORY DROPDOWN ══ */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            height: 42,
            borderRadius: 21,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              width: "100%", height: "100%",
              padding: "10px 14px 10px 38px", border: "none", outline: "none",
              fontSize: 14, boxSizing: "border-box", background: "transparent",
              borderRadius: 21,
            }}
          />
        </div>

        {categories.length > 0 && (
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ padding: "10px 16px", borderRadius: 21, border: "1px solid #e2e8f0", fontSize: 13, background: "#f8fafc", minWidth: 150, flexShrink: 0 }}
          >
            <option value="all">Sabhi Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* ══ CATEGORY PILL TABS ══ */}
      {categories.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
          <button
            onClick={() => setCategory("all")}
            style={{
              padding: "8px 18px", borderRadius: 20, border: "1px solid #e2e8f0",
              background: category === "all" ? "#1e293b" : "#fff",
              color: category === "all" ? "#fff" : "#475569",
              fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
            }}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: "8px 18px", borderRadius: 20, border: "1px solid #e2e8f0",
                background: category === c ? "#1e293b" : "#fff",
                color: category === c ? "#fff" : "#475569",
                fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* ══ PRODUCT GRID ══ */}
      {(!visibleProducts || visibleProducts.length === 0) ? (
        <div className="text-center text-gray-500 mt-12 text-lg">
          {(!products || products.length === 0) ? "No products available right now" : "Koi product nahi mila — search/category change karo"}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          {visibleProducts.map(product => {
            const productId = product.id || product._id
            const ppc = product.ppcReward || 0
            const imgSrc = getImageSrc(product)

            return (
              <div
                key={productId}
                className="bg-white rounded-xl shadow hover:shadow-lg transition duration-200 overflow-hidden relative flex flex-col"
              >
                {/* ⭐ PPC Badge — sirf distributor/seller ko */}
                {showPPC && ppc > 0 && (
                  <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow flex items-center gap-1">
                    💎 {ppc} PPC
                  </div>
                )}

                {/* Product Image */}
                {imgSrc ? (
                  <div className="h-28 md:h-36 bg-gray-100 overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={product.title}
                      className="h-full w-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                ) : (
                  <div className="h-28 md:h-36 bg-gray-50 flex items-center justify-center text-gray-300 text-3xl">
                    📦
                  </div>
                )}

                <div className="p-3 flex flex-col flex-1">
                  {/* Title */}
                  <h2 className="font-bold text-sm md:text-base text-gray-900 leading-snug truncate">
                    {product.title}
                  </h2>

                  {/* Category */}
                  {product.category && (
                    <span className="text-xs text-purple-600 font-semibold mt-0.5">{product.category}</span>
                  )}

                  {/* Price */}
                  <p className="text-gray-900 font-extrabold text-base mt-1">
                    ₹{product.price}
                  </p>

                  {/* ⭐ PPC Detail line — sirf distributor/seller ko */}
                  {showPPC && ppc > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5">
                      <span className="text-base">💎</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-purple-700 block">
                          {ppc} PPC Reward
                        </span>
                        <p className="text-[11px] text-purple-500 leading-tight">
                          Is sale par {ppc} PPC milenge
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Add to Cart */}
                  <button
                    onClick={() => user ? addToCart(product) : setPage("login")}
                    className="bg-yellow-400 hover:bg-yellow-500 active:scale-95 w-full mt-2 py-2 rounded-lg font-bold transition text-sm mt-auto"
                  >
                    🛒 Add to Cart
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
