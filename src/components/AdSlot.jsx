import { useState, useEffect, useRef } from "react"

const API = `${import.meta.env.VITE_API_URL}`

/* =====================================================
   AD SLOT — Home page ke beech-beech mein optional vertical ad jagah.
   Agar admin ne is slot ke liye koi banner nahi banaya, to yeh component
   kuch bhi render nahi karta (null) — matlab koi jagah reserve nahi hoti,
   normal home page bilkul waisa hi dikhta hai jaise pehle dikhta tha.
   Jaise hi admin "Home Banners" se is slot ke liye media daalta hai,
   yahan turant dikhna shuru ho jata hai.
===================================================== */
export default function AdSlot({ slot, setPage }) {
  const [banner, setBanner]   = useState(null)
  const [loaded, setLoaded]   = useState(false)
  const [muted, setMuted]     = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const videoRef = useRef(null)

  // ⭐ React kabhi <video> ka `muted` prop update ke baad DOM mein reflect
  // nahi karta — isliye direct DOM property set karo taake sound toggle
  // reliably kaam kare
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted, banner])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    let mounted = true
    fetch(`${API}/api/banners?placement=${slot}`)
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        setBanner((data.banners && data.banners[0]) || null)
        setLoaded(true)
      })
      .catch(() => mounted && setLoaded(true))
    return () => { mounted = false }
  }, [slot])

  // ⭐ Kuch nahi mila to bilkul kuch render nahi karo — no gap, no reserved space
  if (!loaded || !banner) return null

  const useMobileMedia = isMobile && banner.mediaMobile
  const mediaUrl = useMobileMedia
    ? `${API}${banner.mediaMobile}`
    : (banner.media ? `${API}${banner.media}` : null)
  const activeMediaType = useMobileMedia ? banner.mediaTypeMobile : banner.mediaType

  const handleCTA = () => {
    if (!banner.buttonLink) return
    if (banner.linkType === "external") {
      window.open(banner.buttonLink, "_blank", "noopener,noreferrer")
    } else {
      setPage?.(banner.buttonLink)
    }
  }

  return (
    <div
      onClick={banner.buttonLink ? handleCTA : undefined}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 420,
        margin: "20px auto",
        aspectRatio: "9 / 14",
        borderRadius: 18,
        overflow: "hidden",
        background: "#0f172a",
        boxShadow: "0 6px 24px rgba(0,0,0,0.14)",
        cursor: banner.buttonLink ? "pointer" : "default",
      }}
    >
      {/* ══ MEDIA ══ */}
      {mediaUrl && (
        activeMediaType === "video" ? (
          <video
            key={mediaUrl}
            ref={videoRef}
            src={mediaUrl}
            autoPlay muted={muted} loop playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <img
            key={mediaUrl}
            src={mediaUrl}
            alt={banner.title || "ad"}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )
      )}

      {/* ══ SPONSORED LABEL ══ */}
      <div style={{
        position: "absolute", top: 10, left: 10,
        background: "rgba(0,0,0,0.45)", color: "#fff",
        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
        padding: "3px 9px", borderRadius: 20,
        textTransform: "uppercase",
      }}>
        Sponsored
      </div>

      {/* ══ SOUND TOGGLE (video only) ══ */}
      {activeMediaType === "video" && (
        <button
          onClick={(e) => { e.stopPropagation(); setMuted(m => !m) }}
          aria-label={muted ? "Sound on karo" : "Sound off karo"}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 30, height: 30, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(0,0,0,0.45)", color: "#fff",
            fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      )}

      {/* ══ OVERLAY ══ */}
      {banner.overlay !== false && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.6) 100%)",
        }} />
      )}

      {/* ══ CONTENT ══ */}
      {(banner.eyebrow || banner.title || banner.subtitle || banner.buttonText) && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          padding: 18, color: "#fff",
        }}>
          {banner.eyebrow && (
            <div style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 16, padding: "4px 10px",
              fontSize: 10.5, fontWeight: 700, marginBottom: 8,
            }}>
              {banner.eyebrow}
            </div>
          )}
          {banner.title && (
            <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.2, marginBottom: banner.subtitle ? 4 : 0, textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>
              {banner.title}
            </div>
          )}
          {banner.subtitle && (
            <div style={{ fontSize: 12.5, opacity: 0.9, marginBottom: banner.buttonText ? 12 : 0, textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}>
              {banner.subtitle}
            </div>
          )}
          {banner.buttonText && (
            <div style={{
              display: "inline-block",
              background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
              borderRadius: 8, padding: "8px 18px",
              fontWeight: 800, fontSize: 12.5, color: "#1e293b",
            }}>
              {banner.buttonText}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
