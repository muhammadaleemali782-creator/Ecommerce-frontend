import { useState, useMemo } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"

export default function Home({ setPage }) {
  const { products, addToCart } = useStore()
  const { user } = useAuth()

  const [search, setSearch]         = useState("")
  const [category, setCategory]     = useState("all")
  const [searchOpen, setSearchOpen] = useState(false)

  // safety fallback
  const safeProducts = Array.isArray(products) ? products : []

  // ⭐ Saari unique categories nikaalo products se
  const categories = useMemo(() => {
    const cats = safeProducts.map(p => p.category).filter(Boolean)
    return [...new Set(cats)]
  }, [safeProducts])

  // ⭐ Search + category filter apply karo
  const filteredProducts = useMemo(() => {
    return safeProducts.filter(p => {
      const matchesSearch = !search.trim() || p.title?.toLowerCase().includes(search.trim().toLowerCase())
      const matchesCategory = category === "all" || p.category === category
      return matchesSearch && matchesCategory
    })
  }, [safeProducts, search, category])

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
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        {filteredProducts.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-10">
            {safeProducts.length === 0 ? "No products found" : "Koi product nahi mila — search/category change karo"}
          </p>
        )}

        {filteredProducts.map(p => {
          const productId = p.id || p._id
          const imgSrc = getImageSrc(p)

          return (
            <div key={productId} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
              {/* Image */}
              {imgSrc ? (
                <div className="h-28 md:h-36 bg-gray-100 overflow-hidden">
                  <img src={imgSrc} alt={p.title} className="h-full w-full object-cover" onError={(e) => (e.target.style.display = "none")} />
                </div>
              ) : (
                <div className="h-28 md:h-36 bg-gray-50 flex items-center justify-center text-gray-300 text-3xl">📦</div>
              )}

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-bold text-sm md:text-base text-gray-900 leading-snug truncate">{p.title}</h3>
                {p.category && <span className="text-xs text-purple-600 font-semibold mt-0.5">{p.category}</span>}

                <div className="flex items-center justify-between mt-2 mt-auto pt-1">
                  <span className="text-gray-900 font-extrabold text-base">₹{p.price}</span>
                  <button
                    onClick={() => user ? addToCart(p) : setPage?.("login")}
                    className="bg-gray-100 hover:bg-yellow-400 transition text-gray-700 hover:text-gray-900 rounded-lg w-9 h-9 flex items-center justify-center text-lg flex-shrink-0"
                    title="Add to cart"
                  >
                    🛒
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
