import { useState, useMemo } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"

// Fallback Curated Formulations (for offline/demo mode, 100% schema compatible with real backend products)
export const DEFAULT_AYURVEDIC_PRODUCTS = [
  {
    id: "himalayan-shilajit-gold",
    title: "Pure Shilajit Rasayana Resin",
    category: "Rasayana & Vitality",
    price: 1499,
    mrp: 1999,
    rating: 4.9,
    reviews: 328,
    image: "/moss_oil.jpg",
    tag: "BESTSELLER",
    dosha: "Tridosha Balance",
    description: "Purified Himalayan resin rich in fulvic acid and 84+ minerals for sustained vitality, strength, and stamina.",
    ingredients: ["Pure Shilajit", "Swarna Bhasma", "Ashwagandha"],
    benefits: "Enhances stamina, immunity, and natural metabolic energy."
  },
  {
    id: "triphala-deep-cleanser",
    title: "Triphala Botanical Facial Cleanser",
    category: "Skin & Hair",
    price: 649,
    mrp: 850,
    rating: 4.8,
    reviews: 214,
    image: "/moss_foam.jpg",
    tag: "AYUSH CERTIFIED",
    dosha: "Pitta & Kapha",
    description: "Gentle purifying foam infused with Amalaki, Haritaki, and Bibhitaki to cleanse deep impurities.",
    ingredients: ["Amalaki", "Haritaki", "Bibhitaki", "Aloe Vera"],
    benefits: "Purifies toxins, restores skin balance, and soothes redness."
  },
  {
    id: "kumkumadi-radiance-serum",
    title: "Kumkumadi Miracle Face Elixir",
    category: "Oils & Serums",
    price: 1899,
    mrp: 2499,
    rating: 5.0,
    reviews: 452,
    image: "/moss_serum.jpg",
    tag: "PREMIUM",
    dosha: "Vata & Pitta",
    description: "Traditional 26-herb Ayurvedic serum infused with Kashmiri Saffron and Sandalwood for natural radiance.",
    ingredients: ["Kashmiri Saffron", "Rakta Chandana", "Manjistha", "Goat Milk"],
    benefits: "Brightens complexion, reduces blemishes, and evens tone."
  },
  {
    id: "bhringraj-kesh-taila",
    title: "Bhringraj Herb Enriched Hair Oil",
    category: "Skin & Hair",
    price: 799,
    mrp: 999,
    rating: 4.9,
    reviews: 189,
    image: "/moss_shampoo.jpg",
    tag: "HAIR CARE",
    dosha: "Pitta Pacifying",
    description: "Slow-cooked Mahabhringraj oil in sesame and virgin coconut base to nourish roots and strengthen hair.",
    ingredients: ["Mahabhringraj", "Amla", "Brahmi", "Sesame Oil"],
    benefits: "Strengthens roots, controls hair fall, and calms scalp."
  },
  {
    id: "ashwagandha-ksheer-extract",
    title: "Organic Ashwagandha Root Churna",
    category: "Rasayana & Vitality",
    price: 899,
    mrp: 1199,
    rating: 4.8,
    reviews: 276,
    image: "/natgeo_jadibooti.jpg",
    tag: "WELLNESS",
    dosha: "Vata Harmonizer",
    description: "Pure Withania Somnifera root extract to regulate daily stress and support deep restorative rest.",
    ingredients: ["Organic Ashwagandha", "Pipali Extract"],
    benefits: "Relieves stress, boosts endurance, and supports rest."
  },
  {
    id: "neem-chandan-purifying-mask",
    title: "Neem & Chandan Purifying Lepam",
    category: "Skin & Hair",
    price: 749,
    mrp: 950,
    rating: 4.7,
    reviews: 165,
    image: "/moss_mask.jpg",
    tag: "DETOX",
    dosha: "Pitta Cooling",
    description: "Medicinal clay blended with fresh organic Neem and Sandalwood to cool and clarify skin.",
    ingredients: ["Fullers Earth", "Neem Leaf", "Chandan", "Haldi"],
    benefits: "Draws out deep impurities, clears pores, and cools skin."
  },
  {
    id: "herbal-vitality-oil",
    title: "Maha Narayana Muscle Relief Oil",
    category: "Oils & Serums",
    price: 1199,
    mrp: 1499,
    rating: 4.9,
    reviews: 310,
    image: "/moss_hands.jpg",
    tag: "JOINT RELIEF",
    dosha: "Vata Soother",
    description: "Traditional therapeutic blend of herbs to relieve muscular tension and support flexible joint mobility.",
    ingredients: ["Dashamoola", "Bala", "Ashwagandha", "Shatavari"],
    benefits: "Relieves stiffness, eases aches, and restores mobility."
  },
  {
    id: "himalayan-amrit-nectar",
    title: "Brahm Rasayana Herbal Nectar",
    category: "Rasayana & Vitality",
    price: 2199,
    mrp: 2799,
    rating: 5.0,
    reviews: 140,
    image: "/hero_moss_bottles.jpg",
    tag: "SIGNATURE",
    dosha: "Tridoshic",
    description: "Ayurvedic rejuvenating blend made with fresh wild amla, cardamom, and pure forest honey.",
    ingredients: ["Wild Amla", "Pipali", "Shankhpushpi", "Forest Honey"],
    benefits: "Promotes longevity, daily vigor, and natural immunity."
  }
]

export default function Store({ setPage }) {
  const { products = [], addToCart, cart = [] } = useStore() || {}
  const { user } = useAuth() || {}

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [flippedCardId, setFlippedCardId] = useState(null)
  const [addedToast, setAddedToast] = useState(null)

  const role = user?.role || "guest"
  const showPPC = role === "distributor" || role === "seller"

  // Merge backend products with fallback list if backend is empty
  const allProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products
    }
    return DEFAULT_AYURVEDIC_PRODUCTS
  }, [products])

  // Extract unique categories safely
  const categories = useMemo(() => {
    const cats = allProducts.map(p => p.category).filter(Boolean)
    return ["all", ...new Set(cats)]
  }, [allProducts])

  // Filtered and sorted products
  const visibleProducts = useMemo(() => {
    let list = allProducts.filter(p => {
      const q = search.trim().toLowerCase()
      const title = (p.title || p.name || "").toLowerCase()
      const cat = (p.category || "").toLowerCase()
      const desc = (p.description || p.desc || "").toLowerCase()
      
      const matchesSearch = !q || title.includes(q) || cat.includes(q) || desc.includes(q)
      const matchesCategory = category === "all" || p.category === category
      return matchesSearch && matchesCategory
    })

    if (sortBy === "price-low") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5))
    } else {
      list.sort((a, b) => (b.reviews || 100) - (a.reviews || 100))
    }

    return list
  }, [allProducts, search, category, sortBy])

  // Handle Add To Cart with instant micro-toast
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation()
    if (addToCart) addToCart(product)
    setAddedToast(product.title || product.name || "Product")
    setTimeout(() => {
      setAddedToast(null)
    }, 2500)
  }

  // Toggle card flip state
  const toggleFlip = (productId, e) => {
    if (e) e.stopPropagation()
    setFlippedCardId(prev => (prev === productId ? null : productId))
  }

  // Cart total count
  const totalCartCount = useMemo(() => {
    return (cart || []).reduce((sum, item) => sum + (Number(item.qty) || 1), 0)
  }, [cart])

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900 selection:bg-amber-100 selection:text-amber-900 pb-16">
      
      {/* ── Toast Notification for Added Item ── */}
      {addedToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-apple-sheet bg-stone-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 max-w-[90vw]">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
            ✓
          </span>
          <div className="text-xs truncate">
            <span className="font-bold text-white block truncate">{addedToast}</span>
            <span className="text-stone-400 text-[10px]">Cart me add ho gaya</span>
          </div>
          <button
            onClick={() => setPage && setPage("cart")}
            className="ml-2 px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0"
          >
            CART ➔
          </button>
        </div>
      )}

      {/* ── Top Header & Apothecary Title ── */}
      <section className="bg-gradient-to-b from-stone-100/90 via-stone-50 to-[#FAFAF8] pt-6 sm:pt-8 pb-6 border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <span>✦</span>
                  <span>100% AYUSH CERTIFIED</span>
                </span>
                <span className="text-[11px] font-semibold text-stone-500">
                  Pure Ayurvedic Formulations
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight">
                Ayurvedic Formulations & Apothecary
              </h1>
              
              <p className="mt-1 text-xs sm:text-sm text-stone-600 font-medium">
                Natural herbal products crafted for vitality, immunity, and daily wellness.
              </p>
            </div>

            {/* Floating Quick Cart Access */}
            {totalCartCount > 0 && (
              <button
                onClick={() => setPage && setPage("cart")}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-stone-950 hover:bg-stone-900 text-white shadow-md active:scale-95 transition-all cursor-pointer text-xs font-bold shrink-0"
              >
                <span>🛍️ CART ({totalCartCount})</span>
                <span>➔</span>
              </button>
            )}
          </div>

          {/* ── Search & Filter Controls ── */}
          <div className="mt-5 pt-4 border-t border-stone-200/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer shadow-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated (★ 5.0)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* ── Category Filter Rail ── */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => {
              const isSelected = category === cat
              const label = cat === "all" ? "All Products" : cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-stone-950 text-white shadow-sm scale-[1.02]"
                      : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200 hover:text-stone-900"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── Main Catalog Grid (2 Columns Mobile, 3-5 Desktop) ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        
        {/* Count and Reset */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
            Showing <span className="text-stone-950 font-black">{visibleProducts.length}</span> Products
            {category !== "all" && <span> in <span className="text-amber-800 font-bold">{category}</span></span>}
          </div>
          {(category !== "all" || search) && (
            <button
              onClick={() => { setCategory("all"); setSearch("") }}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-900 transition-colors underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {visibleProducts.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-2xl border border-stone-200 max-w-md mx-auto shadow-sm">
            <div className="text-4xl mb-3">🍃</div>
            <h3 className="text-base font-bold text-stone-900">Koi Product Nahi Mila</h3>
            <p className="text-xs text-stone-500 mt-1">
              Doosra keyword ya category choose karke dekhein.
            </p>
            <button
              onClick={() => { setCategory("all"); setSearch("") }}
              className="mt-4 px-4 py-2 bg-stone-950 text-white text-xs font-bold rounded-xl"
            >
              Show All
            </button>
          </div>
        ) : (
          /* Responsive 2-Column Mobile, 3-Col Tablet, 4-5 Col Desktop */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {visibleProducts.map(product => {
              const productId = product.id || product._id || product.title
              const isFlipped = flippedCardId === productId
              const title = product.title || product.name || "Ayurvedic Product"
              const price = product.price || product.finalPrice || 0
              const mrp = product.mrp || Math.round(price * 1.25)
              const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
              const image = product.image || product.img || "/natgeo_jadibooti.jpg"
              const tag = product.tag || product.category || "AYUSH"
              const rating = product.rating || 4.9
              const reviews = product.reviews || 85
              const desc = product.description || product.desc || "Pure botanical formulation for vitality."
              const dosha = product.dosha || "Tridosha Balance"
              const ingredients = product.ingredients || (product.category ? [product.category] : ["Ayurvedic Herbs"])
              const benefits = product.benefits || "Supports holistic vitality & immunity."

              const cartItem = (cart || []).find(c => (c.id || c._id || c.productId) === productId)
              const cartQty = cartItem ? cartItem.qty : 0

              return (
                <div
                  key={productId}
                  className="perspective-1000 w-full min-h-[310px] sm:min-h-[360px] relative select-none"
                >
                  <div
                    className={`preserve-3d relative w-full h-full duration-500 transition-transform cursor-pointer rounded-2xl ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    
                    {/* ════════ FRONT SIDE OF CARD ════════ */}
                    <div
                      onClick={(e) => toggleFlip(productId, e)}
                      className="backface-hidden absolute inset-0 w-full h-full bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded-md bg-stone-950/85 backdrop-blur-md text-[8.5px] sm:text-[9.5px] font-black text-white uppercase tracking-wider shadow-sm">
                            {tag}
                          </span>
                          {discountPct > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-[8px] sm:text-[8.5px] font-black text-white uppercase">
                              {discountPct}% OFF
                            </span>
                          )}
                        </div>

                        {/* Flip Hint Icon */}
                        <button
                          onClick={(e) => toggleFlip(productId, e)}
                          title="Tap to see details"
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center text-xs shadow-sm transition-transform active:scale-90"
                        >
                          ℹ️
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1">
                        <div>
                          {/* Rating */}
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-500 mb-1">
                            <span>★</span>
                            <span className="font-bold text-stone-900">{rating}</span>
                            <span className="text-stone-400 text-[9px] sm:text-[10px]">({reviews})</span>
                          </div>

                          {/* Title */}
                          <h3 className="text-xs sm:text-sm font-bold text-stone-950 line-clamp-2 leading-tight">
                            {title}
                          </h3>
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="mt-2.5 pt-2 border-t border-stone-100">
                          <div className="flex items-baseline gap-1.5 mb-2">
                            <span className="text-sm sm:text-base font-black text-stone-950">
                              ₹{Number(price).toLocaleString("en-IN")}
                            </span>
                            {mrp > price && (
                              <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                                ₹{Number(mrp).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`w-full py-2 px-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer ${
                              cartQty > 0
                                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                : "bg-stone-950 text-white hover:bg-stone-800"
                            }`}
                          >
                            <span>{cartQty > 0 ? `ADDED (${cartQty}) +` : "ADD TO CART"}</span>
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* ════════ BACK SIDE OF CARD (3D FLIP DETAILS) ════════ */}
                    <div
                      onClick={(e) => toggleFlip(productId, e)}
                      className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full bg-stone-900 text-white rounded-2xl p-3 sm:p-4 border border-stone-800 shadow-xl flex flex-col justify-between overflow-y-auto no-scrollbar"
                    >
                      <div>
                        {/* Back Header */}
                        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2 mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                            FORMULATION DOSSIER
                          </span>
                          <span className="text-xs text-stone-400 hover:text-white">
                            ✕ Flip
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1">
                          {title}
                        </h4>

                        {/* Dosha */}
                        <div className="mt-1.5 px-2 py-1 rounded-md bg-stone-800 text-[9px] sm:text-[10px] font-bold text-amber-300">
                          Dosha: {dosha}
                        </div>

                        {/* Description */}
                        <p className="mt-2 text-[10px] sm:text-xs text-stone-300 line-clamp-3 leading-relaxed">
                          {desc}
                        </p>

                        {/* Botanicals */}
                        {ingredients && ingredients.length > 0 && (
                          <div className="mt-2">
                            <div className="text-[9px] font-bold text-stone-400 uppercase">Botanicals:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ingredients.slice(0, 3).map((ing, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-stone-800 text-[8.5px] text-stone-200"
                                >
                                  🌿 {ing}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Back Footer Actions */}
                      <div className="pt-2 mt-2 border-t border-stone-800 flex items-center gap-2">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex-1 py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          ADD TO CART ₹{Number(price).toLocaleString("en-IN")}
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

      </main>

    </div>
  )
}
