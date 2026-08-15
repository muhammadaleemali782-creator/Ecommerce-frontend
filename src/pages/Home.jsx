import { useState, useMemo, useEffect } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"
import AdSlot from "../components/AdSlot"
import InlineLoader from "../components/InlineLoader"

/* ─── Shared image-src helper (product images ya uploaded File dono handle karta hai) ─── */
export function getProductImageSrc(p) {
  if (!p?.image) return null
  if (typeof p.image === "string")
    return p.image.startsWith("http") ? p.image : `${import.meta.env.VITE_API_URL}/uploads/${p.image}`
  if (p.image instanceof File) return URL.createObjectURL(p.image)
  return null
}

/* ─── Flip Card Component ─── */
export function ProductCard({ product, showPPC, onAddToCart, onLoginRedirect, setPage }) {
  const [flipped, setFlipped] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { suppressCartPopup, setSuppressCartPopup } = useStore()

  const productId = product.id || product._id
  const ppc = product.ppcReward || 0

  const getImageSrc = getProductImageSrc

  const imgSrc = getImageSrc(product)

  return (
    <>
    <div
      style={{
        perspective: "1000px",
        cursor: "pointer",
        height: "100%",
      }}
      onClick={() => setFlipped(f => !f)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4,0.2,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ══ FRONT (normal flow — sets the card's height) ══ */}
        <div
          style={{
            position: "relative",
            height: "100%",
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
                if (onAddToCart) {
                  onAddToCart(product)
                  if (!suppressCartPopup) setJustAdded(true)
                } else {
                  onLoginRedirect?.()
                }
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
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12, position: "relative" }}>
            {imgSrc ? (
              <img src={imgSrc} alt={product.title}
                style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }}
                onError={e => (e.target.style.display = "none")} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: 8, fontSize: 22, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.1)",
              }}>📦</div>
            )}
            <div style={{ minHeight: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{
                fontWeight: 800, fontSize: 13, lineHeight: 1.25,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {product.title}
              </div>
              {product.category && (
                <div style={{ fontSize: 10, color: "#c4b5fd", fontWeight: 600, marginTop: 2 }}>{product.category}</div>
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
            <div style={{ fontSize: 10.5, color: "#a78bfa", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6, whiteSpace: "nowrap" }}>
              Details
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

    {/* ══ ADDED TO CART POPUP ══ */}
    {justAdded && (
      <div
        onClick={() => setJustAdded(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,23,42,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 18, padding: "28px 24px",
            maxWidth: 340, width: "100%", textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>🛒✅</div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1e293b" }}>
            Cart mein add ho gaya!
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "8px 0 20px" }}>
            Kya aap aur shopping karna chahte hain, ya order complete karna chahte hain?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => { setJustAdded(false); setPage?.("cart") }}
              style={{
                background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
                border: "none", borderRadius: 10, padding: "12px 0",
                fontWeight: 800, fontSize: 14, color: "#1e293b", cursor: "pointer",
              }}
            >
              ✅ Order Complete Karo
            </button>
            <button
              onClick={() => { setJustAdded(false); setSuppressCartPopup(true) }}
              style={{
                background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10,
                padding: "12px 0", fontWeight: 700, fontSize: 14, color: "#374151", cursor: "pointer",
              }}
            >
              🛍️ Shopping Jaari Rakhein
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

/* ─── Category tile (derived from real product categories) ─── */
function CategoryTile({ name, count, image, onClick, delay }) {
  return (
    <div
      onClick={onClick}
      className="ez-cat-tile"
      style={{
        position: "relative", height: 150, borderRadius: 18, overflow: "hidden",
        cursor: "pointer", animationDelay: `${delay}ms`,
      }}
    >
      {image ? (
        <img src={image} alt={name} className="ez-cat-tile-img"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => (e.target.style.display = "none")} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#1e293b,#334155)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>📦</div>
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.35) 45%, transparent 100%)",
        display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "14px 16px", color: "#fff",
      }}>
        <span style={{ fontSize: 11, opacity: 0.85, fontWeight: 600, marginBottom: 3 }}>{count} Product{count === 1 ? "" : "s"}</span>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{name}</h4>
      </div>
    </div>
  )
}

/* ─── Trending product card (image-forward, hover overlay quick-actions) ─── */
function TrendingCard({ product, showPPC, onAddToCart, onLoginRedirect, onView, delay }) {
  const imgSrc = getProductImageSrc(product)
  const ppc = product.ppcReward || 0
  return (
    <div className="ez-trend-card" style={{ flex: "0 0 168px", scrollSnapAlign: "start", animationDelay: `${delay}ms` }}>
      <div style={{
        borderRadius: 16, overflow: "hidden", background: "#fff",
        border: "1px solid #f1f5f9", boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}>
        <div className="ez-trend-imgwrap" style={{ position: "relative", aspectRatio: "3/4", background: "#f8fafc" }}>
          {imgSrc ? (
            <img src={imgSrc} alt={product.title} className="ez-trend-img"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => (e.target.style.display = "none")} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>📦</div>
          )}
          {showPPC && ppc > 0 && (
            <div style={{
              position: "absolute", top: 8, right: 8,
              background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff",
              fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 20,
            }}>💎 {ppc}</div>
          )}
          <div className="ez-trend-overlay" style={{
            position: "absolute", inset: 0, background: "rgba(30,58,138,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <button
              onClick={e => { e.stopPropagation(); onAddToCart ? onAddToCart(product) : onLoginRedirect() }}
              className="ez-trend-overlay-btn" aria-label="Add to cart"
              style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", fontSize: 15 }}
            >🛒</button>
            <button
              onClick={e => { e.stopPropagation(); onView(product) }}
              className="ez-trend-overlay-btn" aria-label="View details"
              style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", fontSize: 15 }}
            >👁️</button>
          </div>
        </div>
        <div style={{ padding: "10px 12px 12px" }}>
          {product.category && <div style={{ fontSize: 10.5, color: "#7c3aed", fontWeight: 700, marginBottom: 3 }}>{product.category}</div>}
          <h3 style={{
            margin: 0, fontSize: 13.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, marginBottom: 6,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{product.title}</h3>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#1e3a8a" }}>₹{product.price}</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Home Page ─── */
export default function Store({ setPage }) {
  const {
    products = [], productsLoading, addToCart,
    searchTerm, setSearchTerm, categoryFilter, setCategoryFilter,
  } = useStore()
  const { user } = useAuth()

  const search = searchTerm
  const setSearch = setSearchTerm
  const category = categoryFilter
  const setCategory = setCategoryFilter

  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 30); return () => clearTimeout(t) }, [])

  const role = user?.role || "guest"
  const showPPC = role === "distributor" || role === "seller"

  const categories = useMemo(() => {
    const cats = (products || []).map(p => p.category).filter(Boolean)
    return [...new Set(cats)]
  }, [products])

  // ⭐ Category tiles — real counts + representative image per category
  const categoryTiles = useMemo(() => {
    const map = {}
    for (const p of products || []) {
      if (!p.category) continue
      if (!map[p.category]) map[p.category] = { name: p.category, count: 0, image: null }
      map[p.category].count++
      if (!map[p.category].image) {
        const img = getProductImageSrc(p)
        if (img) map[p.category].image = img
      }
    }
    return Object.values(map).slice(0, 8)
  }, [products])

  // ⭐ Trending — sabse recent products (fake ratings/reviews nahi dikhaye, kyunki wo data backend mein hai hi nahi)
  const trendingProducts = useMemo(() => {
    return [...(products || [])]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 10)
  }, [products])

  const visibleProducts = useMemo(() => {
    return (products || []).filter(p => {
      const matchesSearch = !search.trim() || p.title?.toLowerCase().includes(search.trim().toLowerCase())
      const matchesCategory = category === "all" || p.category === category
      return matchesSearch && matchesCategory
    })
  }, [products, search, category])

  const goToCategory = (cat) => { setCategory(cat); setPage("store") }
  const scrollTrending = (dir) => {
    const el = document.getElementById("ez-trending-row")
    if (el) el.scrollBy({ left: dir * 360, behavior: "smooth" })
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <style>{`
        @keyframes ezFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .ez-fade { opacity:0; }
        .ez-mounted .ez-fade { animation: ezFadeUp 0.6s ease forwards; }
        .ez-cat-tile { animation: ezFadeUp 0.5s ease forwards; opacity:0; transition: box-shadow 0.3s, transform 0.3s; }
        .ez-cat-tile:hover { transform: translateY(-4px); box-shadow: 0 16px 30px rgba(15,23,42,0.18); }
        .ez-cat-tile-img { transition: transform 0.6s ease; }
        .ez-cat-tile:hover .ez-cat-tile-img { transform: scale(1.08); }
        .ez-trend-card { animation: ezFadeUp 0.5s ease forwards; opacity:0; transition: transform 0.3s; }
        .ez-trend-card:hover { transform: translateY(-6px); }
        .ez-trend-img { transition: transform 0.5s ease; }
        .ez-trend-card:hover .ez-trend-img { transform: scale(1.07); }
        .ez-trend-overlay { opacity:0; transition: opacity 0.25s; }
        .ez-trend-card:hover .ez-trend-overlay { opacity:1; }
        .ez-trend-overlay-btn { transition: transform 0.2s; }
        .ez-trend-overlay-btn:hover { transform: scale(1.12); background:#1e3a8a !important; color:#fff; }
        .ez-scrollrow { scrollbar-width: none; -ms-overflow-style: none; scroll-snap-type: x proximity; }
        .ez-scrollrow::-webkit-scrollbar { display:none; }
        .ez-arrow { transition: background 0.2s, color 0.2s; }
        .ez-arrow:hover { background:#1e3a8a; color:#fff; }
      `}</style>

      <div className={mounted ? "ez-mounted" : ""}>

        {/* ══ CATEGORY TILES (real data) ══ */}
        {categoryTiles.length > 0 && (
          <div style={{ marginBottom: 36 }} className="ez-fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
              <div>
                <span style={{ color: "#1e3a8a", fontWeight: 800, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Pick Your Domain</span>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: -0.5 }}>Browse Categories</h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
              {categoryTiles.map((c, i) => (
                <CategoryTile key={c.name} name={c.name} count={c.count} image={c.image}
                  onClick={() => goToCategory(c.name)} delay={i * 60} />
              ))}
            </div>
          </div>
        )}

        {/* ══ TRENDING (real products, horizontal scroll) ══ */}
        {trendingProducts.length > 0 && (
          <div style={{ marginBottom: 36 }} className="ez-fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
              <div>
                <span style={{ color: "#1e3a8a", fontWeight: 800, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Fresh In</span>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: -0.5 }}>Trending Products</h2>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => scrollTrending(-1)} className="ez-arrow" aria-label="Scroll left"
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14 }}>‹</button>
                <button onClick={() => scrollTrending(1)} className="ez-arrow" aria-label="Scroll right"
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14 }}>›</button>
              </div>
            </div>
            <div id="ez-trending-row" className="ez-scrollrow" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6 }}>
              {trendingProducts.map((product, i) => (
                <TrendingCard
                  key={product.id || product._id}
                  product={product}
                  showPPC={showPPC}
                  onAddToCart={user ? addToCart : null}
                  onLoginRedirect={() => setPage("login")}
                  onView={() => setPage("store")}
                  delay={i * 60}
                />
              ))}
            </div>
          </div>
        )}

        {/* ══ SEARCH BAR ══ */}
        <div className="ez-fade" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
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
          <div className="ez-fade" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
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
        <div className="ez-fade" style={{
          background: "linear-gradient(90deg,#ede9fe,#f0f9ff)",
          border: "1px solid #ddd6fe",
          borderRadius: 10, padding: "8px 14px",
          fontSize: 12, color: "#7c3aed", fontWeight: 600,
          marginBottom: 14, display: "flex", alignItems: "center", gap: 8,
        }}>
          💡 Kisi bhi card pe tap karo — flip ho ke poori details dikhegi!
        </div>

        {/* ══ AD SLOT 1 (optional — khali ho to kuch nahi dikhega) ══ */}
        <AdSlot slot="slot1" setPage={setPage} />

        {/* ══ PRODUCT GRID ══ */}
        {productsLoading ? (
          <InlineLoader label="Products load ho rahe hain 🛍️" minHeight={200} />
        ) : visibleProducts.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 48, fontSize: 16 }}>
            {products.length === 0
              ? "Abhi koi product available nahi hai"
              : "Koi product nahi mila — search ya category change karo"}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            alignItems: "stretch",
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

        {/* ══ AD SLOT 2 (optional — khali ho to kuch nahi dikhega) ══ */}
        <AdSlot slot="slot2" setPage={setPage} />
      </div>
    </div>
  )
}
