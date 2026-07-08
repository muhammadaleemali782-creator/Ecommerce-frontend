import { useState, useMemo } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"

/* ─── Flip Card Component ─── */
function ProductCard({ product, showPPC, onAddToCart, onLoginRedirect }) {
  const [flipped, setFlipped] = useState(false)

  const productId = product.id || product._id
  const ppc = product.ppcReward || 0

  const getImageSrc = (p) => {
    if (!p.image) return null
    if (typeof p.image === "string")
      return p.image.startsWith("http") ? p.image : `${import.meta.env.VITE_API_URL}/uploads/${p.image}`
    if (p.image instanceof File) return URL.createObjectURL(p.image)
    return null
  }

  const imgSrc = getImageSrc(product)

  return (
    <div
      style={{
        perspective: "1000px",
        cursor: "pointer",
      }}
      onClick={() => setFlipped(f => !f)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4,0.2,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ══ FRONT (normal flow — sets the card's height) ══ */}
        <div
          style={{
            position: "relative",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 16,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* PPC Badge */}
          {showPPC && ppc > 0 && (
            <div style={{
              position: "absolute", top: 10, right: 10, zIndex: 10,
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              color: "#fff", fontSize: 11, fontWeight: 800,
              padding: "4px 10px", borderRadius: 20,
              boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              💎 {ppc} PPC
            </div>
          )}

          {/* Tap hint */}
          <div style={{
            position: "absolute", top: 10, left: 10, zIndex: 10,
            background: "rgba(0,0,0,0.35)", color: "#fff",
            fontSize: 10, fontWeight: 600, padding: "3px 8px",
            borderRadius: 20, backdropFilter: "blur(4px)",
          }}>
            tap for info
          </div>

          {/* Image */}
          {imgSrc ? (
            <div style={{ height: 140, background: "#f1f5f9", overflow: "hidden", flexShrink: 0 }}>
              <img src={imgSrc} alt={product.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => (e.target.style.display = "none")} />
            </div>
          ) : (
            <div style={{
              height: 140, background: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 44, flexShrink: 0,
            }}>📦</div>
          )}

          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
            <h2 style={{
              fontWeight: 800, fontSize: 14, color: "#1e293b",
              lineHeight: 1.3, marginBottom: 2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>{product.title}</h2>

            {product.category && (
              <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, marginBottom: 4 }}>
                {product.category}
              </span>
            )}

            <p style={{ fontWeight: 900, fontSize: 18, color: "#0f172a", marginBottom: 6 }}>
              ₹{product.price}
            </p>

            {showPPC && ppc > 0 && (
              <div style={{
                background: "linear-gradient(135deg,#faf5ff,#ede9fe)",
                border: "1px solid #ddd6fe",
                borderRadius: 10, padding: "7px 10px",
                display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
              }}>
                <span style={{ fontSize: 16 }}>💎</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#6d28d9" }}>{ppc} PPC Reward</div>
                  <div style={{ fontSize: 10, color: "#8b5cf6" }}>Is sale par {ppc} PPC milenge</div>
                </div>
              </div>
            )}

            <button
              onClick={e => {
                e.stopPropagation()
                onAddToCart ? onAddToCart(product) : onLoginRedirect?.()
              }}
              style={{
                marginTop: "auto",
                background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
                border: "none", borderRadius: 10,
                padding: "9px 0", fontWeight: 800, fontSize: 13,
                cursor: "pointer", width: "100%",
                boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
                transition: "transform 0.15s",
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>

        {/* ══ BACK (absolute — matches the height set by front) ══ */}
        <div
          style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 16,
            overflow: "hidden",
            background: "linear-gradient(145deg,#1e1b4b,#312e81,#4c1d95)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            padding: "18px 16px",
            color: "#fff",
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(167,139,250,0.15)",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: -20,
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(196,181,253,0.12)",
          }} />

          {/* Back header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, position: "relative" }}>
            {imgSrc ? (
              <img src={imgSrc} alt={product.title}
                style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }}
                onError={e => (e.target.style.display = "none")} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: 8, fontSize: 22,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.1)",
              }}>📦</div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>{product.title}</div>
              {product.category && (
                <div style={{ fontSize: 10, color: "#c4b5fd", fontWeight: 600 }}>{product.category}</div>
              )}
            </div>
          </div>

          {/* Description — fills the rest of the card */}
          <div style={{
            flex: 1, position: "relative",
            background: "rgba(255,255,255,0.07)",
            borderRadius: 10, padding: "12px 14px",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              Product Details
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.7, color: "#e2e8f0",
              overflow: "auto", flex: 1,
            }}>
              {product.description
                ? product.description
                : "Is product ke baare mein koi description available nahi hai. Admin se contact karo zyada jaankari ke liye."}
            </p>
          </div>

          <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            tap to flip back
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Store Page ─── */
export default function Store({ setPage }) {
  const { products = [], addToCart } = useStore()
  const { user } = useAuth()

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

  const role = user?.role || "guest"
  const showPPC = role === "distributor" || role === "seller"

  const categories = useMemo(() => {
    const cats = (products || []).map(p => p.category).filter(Boolean)
    return [...new Set(cats)]
  }, [products])

  const visibleProducts = useMemo(() => {
    return (products || []).filter(p => {
      const matchesSearch = !search.trim() || p.title?.toLowerCase().includes(search.trim().toLowerCase())
      const matchesCategory = category === "all" || p.category === category
      return matchesSearch && matchesCategory
    })
  }, [products, search, category])

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* ══ SEARCH BAR ══ */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <div style={{
          position: "relative", flex: 1, minWidth: 0,
          height: 44, borderRadius: 22,
          border: "1px solid #e2e8f0", background: "#f8fafc",
        }}>
          <span style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16
          }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              width: "100%", height: "100%",
              padding: "10px 14px 10px 40px",
              border: "none", outline: "none",
              fontSize: 14, boxSizing: "border-box",
              background: "transparent", borderRadius: 22,
            }}
          />
        </div>

        {categories.length > 0 && (
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              padding: "10px 16px", borderRadius: 22,
              border: "1px solid #e2e8f0", fontSize: 13,
              background: "#f8fafc", flexShrink: 0,
            }}
          >
            <option value="all">Sabhi Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* ══ CATEGORY PILLS ══ */}
      {categories.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
          {["all", ...categories].map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: "7px 18px", borderRadius: 20,
                border: "1px solid #e2e8f0",
                background: category === c ? "#1e293b" : "#fff",
                color: category === c ? "#fff" : "#475569",
                fontWeight: 700, fontSize: 13,
                whiteSpace: "nowrap", cursor: "pointer",
                flexShrink: 0, transition: "all 0.2s",
              }}
            >
              {c === "all" ? "All" : c}
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
      {visibleProducts.length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 48, fontSize: 16 }}>
          {products.length === 0
            ? "Abhi koi product available nahi hai"
            : "Koi product nahi mila — search ya category change karo"}
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
