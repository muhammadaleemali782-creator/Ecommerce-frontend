import { useState, useMemo, useEffect } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"
import AdSlot from "../components/AdSlot"
import InlineLoader from "../components/InlineLoader"
import { openFinanceService, openEducation } from "../utils/financeLink"

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

/* ═══════════════════════════════════════════════════════════
   EDUCA VEDA — ported exactly from uploaded redesign HTML.
   Botanical Catalog = REAL products (backend se), baaki hero/
   education/fintech content copy-verbatim hai jaisa diya gaya.
═══════════════════════════════════════════════════════════ */

/* ⭐ Reveal-on-scroll — original HTML ke IntersectionObserver ka
   exact React equivalent (.reveal-3d / .active-3d classes) */
function useRevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active-3d")
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll(".reveal-3d").forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function BotanicalCard({ product, onAdd }) {
  const img = getProductImageSrc(product)
  return (
    <div className="w-[15rem] bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between shrink-0 hover:border-indigo-500 transition">
      <div>
        <span className="inline-block px-2 py-0.5 bg-white border border-slate-200 text-indigo-600 text-[9px] font-bold tracking-widest rounded mb-3 uppercase">Ayush Aligned</span>
        <div className="h-28 bg-white rounded-xl mb-3 flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner font-serif font-bold text-xs overflow-hidden">
          {img ? <img src={img} alt={product.title} className="w-full h-full object-cover" onError={e => (e.target.style.display = "none")} /> : "BOX NODE"}
        </div>
        <h4 className="font-extrabold text-base mb-0.5 text-brand-textDark">{product.title}</h4>
        <p className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider mb-4">{product.category || "EDUCA"}</p>
      </div>
      <button onClick={() => onAdd(product)} className="w-full py-2 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-premium-gradient hover:text-white transition font-bold text-xs shadow-sm">Add to Request</button>
    </div>
  )
}

export default function Store({ setPage }) {
  const safeSetPage = typeof setPage === "function" ? setPage : () => {}
  const { user, loggedIn } = useAuth()
  const { products = [], addToCart } = useStore()
  useRevealOnScroll()

  const [loanAmount, setLoanAmount] = useState(55000)
  const [tenure, setTenure] = useState(11)

  const monthlyRate = 0.085 / 12
  const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1)
  const total = emi * tenure
  const interest = total - loanAmount

  const handleAdd = (product) => {
    if (!loggedIn) { safeSetPage("login"); return }
    addToCart(product)
  }

  // ⭐ Marquee ke liye products ko duplicate karo (seamless infinite-loop illusion
  // ke liye) — jaisa original HTML mein bhi "Duplicates for Loop" comment ke
  // saath manually kiya gaya tha, ab yeh real product list ke saath dynamic hai.
  const marqueeProducts = products.length > 0 ? [...products, ...products] : []

  return (
    <div>
      {/* ══════════════ HERO ══════════════ */}
      <main className="max-w-[1400px] mx-auto px-0 md:px-6 py-8 md:py-16 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 reveal-3d delay-100">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-extrabold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span> NEXT-GEN HEALTHTECH &amp; MICROFINANCE
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-[4.2rem] font-bold leading-[1.08] tracking-tight text-brand-primary">
            Unifying <span className="text-gradient font-serif font-normal italic">Ayurvedic</span><br />
            Healing &amp; Smart<br />
            Fintech.
          </h2>
          <p className="text-sm md:text-base text-brand-textMuted font-medium max-w-lg leading-relaxed">
            Bridging ancient classical herbal pharmacopeia with 2-year accredited clinical consultancy education and zero-latency smart contract micro-financing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={() => safeSetPage("store")} className="bg-premium-gradient text-white px-8 py-4 rounded-full font-extrabold flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition text-sm">Explore Core Ecosystem →</button>
            <button onClick={openEducation} className="bg-white border border-slate-200 text-brand-primary px-8 py-4 rounded-full font-bold hover:border-slate-300 transition text-sm shadow-sm">View Consultant Program</button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="border-t border-slate-200 pt-3">
              <p className="text-[10px] text-brand-textMuted font-bold uppercase">Formulations</p>
              <p className="font-serif font-bold text-lg text-brand-primary">800+ Remedies</p>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-[10px] text-brand-textMuted font-bold uppercase">Diploma Track</p>
              <p className="font-serif font-bold text-lg text-indigo-600">2-Year Certified</p>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-[10px] text-brand-textMuted font-bold uppercase">Disbursement</p>
              <p className="font-serif font-bold text-lg text-emerald-600">Zero Latency</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 reveal-3d delay-200 w-full">
          <div className="relative w-full bg-dark-card-gradient rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-slate-800 overflow-hidden text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> NODE STATUS: <span className="text-white font-bold">Synchronized</span>
            </div>

            {/* ⚠️ Aapki di hui image "Gemini_Generated_Image_....png" abhi is
                project mein exist nahi karti — filename same rakha hai, bas
                is file ko /public folder mein daal dena, turant dikhne lagegi. */}
            <div className="relative w-full h-[240px] md:h-[280px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 mb-6 group bg-slate-800">
              <img src="/Gemini_Generated_Image_lcgly9lcgly9lcgl.png" alt="Ayurvedic Medicine & Health" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" onError={e => (e.target.style.display = "none")} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">🌿 Ayurvedic Medicine &amp; Health Hub</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h4 className="font-serif text-white text-xl font-bold tracking-wide">EDUCA CORE ENGINE</h4>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">FRONTEND RENDERED NODE</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs">₹</div>
                <span className="text-xs text-slate-300 font-bold">SMART CONTRACT</span>
              </div>
              <span className="text-xs text-white font-extrabold tracking-wide">Zero-Latency</span>
            </div>
          </div>
        </div>
      </main>

      {/* ══════════════ PILLAR 01: AYURVEDIC MEDICINE (REAL products) ══════════════ */}
      <section className="bg-white py-16 md:py-24 border-y border-slate-200 overflow-hidden -mx-3 sm:-mx-6 px-3 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="reveal-3d text-center md:text-left mb-10">
            <h3 className="text-[10px] md:text-xs tracking-[0.2em] font-bold text-indigo-600 uppercase mb-2">Pillar 01 — Ayurvedic Therapeutics &amp; Medicines</h3>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-primary mb-2 tracking-tight">Standardized Botanical Catalog.</h2>
            <p className="text-sm text-brand-textMuted max-w-2xl mx-auto md:mx-0">Heavy-metal tested, Ayush-aligned classical extracts, drops, syrups, and specialized capsules formulated for professional clinical deployment.</p>
          </div>

          {marqueeProducts.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">Abhi koi formulation catalog mein nahi hai.</p>
          ) : (
            <div className="ad-marquee-container">
              <div className="ad-marquee-track gap-5">
                {marqueeProducts.map((product, i) => (
                  <BotanicalCard key={`${product.id || product._id}-${i}`} product={product} onAdd={handleAdd} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ PILLAR 02: WELLNESS EDUCATION ══════════════ */}
      <section className="max-w-7xl mx-auto px-0 md:px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 reveal-3d">
          <div className="mb-4 md:mb-0">
            <h3 className="text-[10px] md:text-xs tracking-[0.2em] font-bold text-indigo-600 uppercase mb-2">Pillar 02 — Digital Clinical Learning &amp; Certification</h3>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-primary tracking-tight">Become a Certified Health &amp; Wellness Consultant.</h2>
          </div>
          <button onClick={openEducation} className="inline-block text-xs font-bold text-indigo-600 hover:text-brand-primary transition uppercase tracking-widest">Student Portal Node →</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-card-gradient text-white rounded-[2rem] p-7 md:p-8 border border-slate-800 shadow-xl reveal-3d delay-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
            <div>
              <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-black tracking-widest rounded-md mb-6 uppercase">Flagship 2-Year Diploma</span>
              <h3 className="font-serif font-bold text-2xl mb-3 leading-tight">Health &amp; Wellness Consultant Program</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">Comprehensive curriculum spanning traditional Dravyaguna, anatomy, preventive lifestyle coaching, and clinical practice management.</p>
            </div>
            <button onClick={openEducation} className="w-full py-3.5 bg-white text-brand-primary font-bold rounded-xl text-xs uppercase tracking-widest shadow hover:bg-slate-100 transition relative z-10">Enroll &amp; Secure Grant</button>
          </div>

          <div className="bg-white rounded-[2rem] p-7 md:p-8 border border-slate-200 shadow-sm reveal-3d delay-200 flex flex-col justify-between hover:border-indigo-500 transition">
            <div>
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-[9px] font-black tracking-widest rounded-md mb-6 uppercase">Clinical Practicum</span>
              <h3 className="font-serif font-bold text-2xl mb-3 text-brand-textDark leading-tight">Clinical Panchakarma Protocols</h3>
              <p className="text-xs text-brand-textMuted leading-relaxed mb-6">Step-by-step detox therapeutic methodologies, Vamana, Virechana, and pre/post-procedure dietary governance.</p>
            </div>
            <button onClick={openEducation} className="w-full py-3.5 bg-slate-100 border border-slate-200 text-brand-textDark font-bold rounded-xl text-xs uppercase tracking-widest hover:border-indigo-500 transition">View Module Outline</button>
          </div>

          <div className="bg-white rounded-[2rem] p-7 md:p-8 border border-slate-200 shadow-sm reveal-3d delay-300 flex flex-col justify-between hover:border-indigo-500 transition">
            <div>
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-[9px] font-black tracking-widest rounded-md mb-6 uppercase">Career Node</span>
              <h3 className="font-serif font-bold text-2xl mb-3 text-brand-textDark leading-tight">Medical Communication &amp; Ethics</h3>
              <p className="text-xs text-brand-textMuted leading-relaxed mb-6">Patient consultation frameworks, electronic case paper documentation, and digital telemedicine regulatory readiness.</p>
            </div>
            <button onClick={openEducation} className="w-full py-3.5 bg-slate-100 border border-slate-200 text-brand-textDark font-bold rounded-xl text-xs uppercase tracking-widest hover:border-indigo-500 transition">View Module Outline</button>
          </div>
        </div>
      </section>

      {/* ══════════════ PILLAR 04: HEALTH-TECH FINTECH ══════════════ */}
      <section className="max-w-7xl mx-auto px-0 md:px-6 py-16 md:py-24">
        <h3 className="text-[10px] md:text-xs tracking-[0.2em] font-bold text-indigo-600 uppercase mb-2 text-center lg:text-left reveal-3d">Pillar 04 — Health-Tech Fintech &amp; Micro-Lending</h3>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-primary mb-10 text-center lg:text-left reveal-3d tracking-tight">Zero-Latency Financing for Tuition &amp; Clinics.</h2>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 bg-dark-card-gradient rounded-[2.5rem] p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden reveal-3d delay-100">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-600/20 blur-[60px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Smart Micro-Loan Estimator</h3>
                <p className="text-[11px] text-slate-400">Instant credit evaluation for students &amp; practitioners</p>
              </div>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-900/40 border border-indigo-500/30 px-2.5 py-1 rounded backdrop-blur-md">8.5% p.a.</span>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">REQUIRED AMOUNT</label>
                  <span className="font-serif text-xl font-bold text-white">₹{loanAmount.toLocaleString("en-IN")}</span>
                </div>
                <input type="range" min="10000" max="200000" step="1000" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} />
                <div className="flex justify-between text-[9px] text-slate-500 mt-1.5 font-bold"><span>₹10K</span><span>₹1L</span><span>₹2L</span></div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TENURE</label>
                  <span className="font-serif text-xl font-bold text-white">{tenure} Months</span>
                </div>
                <input type="range" min="3" max="24" step="1" value={tenure} onChange={e => setTenure(Number(e.target.value))} />
                <div className="flex justify-between text-[9px] text-slate-500 mt-1.5 font-bold"><span>3 Mo</span><span>12 Mo</span><span>24 Mo</span></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 mb-5 pt-4 border-t border-slate-800 bg-white/5 backdrop-blur-md p-4 rounded-2xl relative z-10 text-center">
              <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">EST. EMI</p><p className="font-serif text-base font-bold text-indigo-400">₹{Math.round(emi).toLocaleString("en-IN")}</p></div>
              <div className="border-l border-r border-slate-800"><p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">INTEREST</p><p className="font-serif text-base font-bold text-violet-400">₹{Math.round(interest).toLocaleString("en-IN")}</p></div>
              <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">TOTAL</p><p className="font-serif text-base font-bold text-white">₹{Math.round(total).toLocaleString("en-IN")}</p></div>
            </div>
            <button onClick={() => openFinanceService(loggedIn, safeSetPage)} className="w-full bg-white text-brand-primary font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-xl hover:bg-slate-200 transition relative z-10">Instant KYC Verification</button>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <button onClick={() => openFinanceService(loggedIn, safeSetPage)} className="w-full text-left bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-4 items-center reveal-3d delay-200 hover:border-indigo-300 transition">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg></div>
              <div><h4 className="font-bold text-sm mb-0.5 text-brand-textDark">Zero-Upfront Consultant Financing</h4><p className="text-xs text-brand-textMuted leading-relaxed">Fund your 2-Year Health Consultant Diploma with automated institutional micro-grants.</p></div>
            </button>
            <button onClick={() => openFinanceService(loggedIn, safeSetPage)} className="w-full text-left bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-4 items-center reveal-3d delay-300 hover:border-indigo-300 transition">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
              <div><h4 className="font-bold text-sm mb-0.5 text-brand-textDark">Ayurvedic Pharmacy Working Capital</h4><p className="text-xs text-brand-textMuted leading-relaxed">Instant inventory credit lines for clinical setups to stock classical formulations seamlessly.</p></div>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
