import { useState, useMemo } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"
import { ProductCard } from "./Home"

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

      {/* ══ FLIP HINT ══ */}
      <div style={{
        background: "linear-gradient(90deg,#ede9fe,#f0f9ff)",
        border: "1px solid #ddd6fe",
        borderRadius: 10, padding: "8px 14px",
        fontSize: 12, color: "#7c3aed", fontWeight: 600,
        marginBottom: 14, display: "flex", alignItems: "center", gap: 8,
      }}>
        💡 Kisi bhi card pe tap karo — flip ho ke poori details dikhegi!
      </div>

      {/* ══ PRODUCT GRID ══ */}
      {(!visibleProducts || visibleProducts.length === 0) ? (
        <div className="text-center text-gray-500 mt-12 text-lg">
          {(!products || products.length === 0) ? "No products available right now" : "Koi product nahi mila — search/category change karo"}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 14,
        }}>
          {visibleProducts.map(product => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              showPPC={showPPC}
              onAddToCart={user ? addToCart : null}
              onLoginRedirect={() => setPage("login")}
              setPage={setPage}
            />
          ))}
        </div>
      )}
    </div>
  )
}
