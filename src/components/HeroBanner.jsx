import { useState, useEffect, useRef } from "react"

const API = `${import.meta.env.VITE_API_URL}`

/* =====================================================
   HERO BANNER — Home page ke top pe dikhne wala professional ad slot.
   Full-bleed (edge-to-edge, viewport ki poori width) — jaise modern
   SaaS/landing pages (Rocket, Linear, Stripe) ke hero sections hote hain.
   Admin dashboard (Home Banners) se fully control hota hai:
   image / gif / video, badge, heading, subheading, CTA button,
   multiple banners ho to auto-carousel.
===================================================== */
export default function HeroBanner({ setPage }) {
  const [banners, setBanners] = useState([])
  const [index, setIndex]     = useState(0)
  const [loaded, setLoaded]   = useState(false)
  const [muted, setMuted]     = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const touchX = useRef(null)
  const videoRef = useRef(null)

  // ⭐ React kabhi <video> ka `muted` prop update ke baad DOM mein reflect
  // nahi karta — isliye direct DOM property set karo taake sound toggle
  // reliably kaam kare
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted, index])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    let mounted = true
    fetch(`${API}/api/banners?placement=hero`)
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        setBanners(data.banners || [])
        setLoaded(true)
      })
      .catch(() => mounted && setLoaded(true))
    return () => { mounted = false }
  }, [])

  // Auto-advance carousel every 6s if more than 1 banner
  useEffect(() => {
    if (banners.length < 2) return
    const t = setInterval(() => setIndex(i => (i + 1) % banners.length), 6000)
    return () => clearInterval(t)
  }, [banners.length])

  if (!loaded || banners.length === 0) return null

  const banner = banners[index]
  const useMobileMedia = isMobile && banner.mediaMobile
  const mediaUrl = useMobileMedia
    ? `${API}${banner.mediaMobile}`
    : (banner.media ? `${API}${banner.media}` : null)
  const activeMediaType = useMobileMedia ? banner.mediaTypeMobile : banner.mediaType
  const centered = banner.align === "center"

  const goTo = (i) => setIndex(((i % banners.length) + banners.length) % banners.length)

  const handleTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchX.current == null) return
    const diff = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(diff) > 40) goTo(index + (diff < 0 ? 1 : -1))
    touchX.current = null
  }

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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        // ⭐ FULL-BLEED: parent page ke max-width container se bahar nikal ke
        // poori viewport width le leta hai — professional edge-to-edge hero
        position: "relative",
        left: "50%", right: "50%",
        marginLeft: "-50vw", marginRight: "-50vw",
        width: "100vw",
        height: "clamp(280px, 60vh, 620px)",
        overflow: "hidden",
        marginBottom: 28,
        background: "#0f172a",
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
            alt={banner.title || "banner"}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )
      )}

      {/* ══ OVERLAY ══ */}
      {banner.overlay !== false && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: centered
            ? "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.55) 100%)"
            : "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.10) 100%)",
        }} />
      )}

      {/* ══ CONTENT ══ */}
      {(banner.eyebrow || banner.title || banner.subtitle || banner.buttonText) && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          justifyContent: "center",
          alignItems: centered ? "center" : "flex-start",
          textAlign: centered ? "center" : "left",
          padding: "clamp(20px,5vw,64px)",
          color: "#fff",
        }}>
          <div style={{ maxWidth: centered ? 700 : 620 }}>
            {banner.eyebrow && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: "clamp(11px, 1.4vw, 13px)",
                fontWeight: 700,
                marginBottom: 16,
              }}>
                {banner.eyebrow}
              </div>
            )}

            {banner.title && (
              <h2 style={{
                margin: 0, marginBottom: banner.subtitle ? 12 : 0,
                fontSize: "clamp(24px, 5vw, 48px)",
                fontWeight: 900, lineHeight: 1.15,
                letterSpacing: "-0.02em",
                textShadow: "0 2px 16px rgba(0,0,0,0.35)",
              }}>
                {banner.title}
              </h2>
            )}

            {banner.subtitle && (
              <p style={{
                margin: 0, marginBottom: banner.buttonText ? 24 : 0,
                fontSize: "clamp(13px, 2vw, 18px)",
                fontWeight: 500, opacity: 0.92, lineHeight: 1.5,
                textShadow: "0 1px 8px rgba(0,0,0,0.3)",
              }}>
                {banner.subtitle}
              </p>
            )}

            {banner.buttonText && (
              <button
                onClick={handleCTA}
                style={{
                  background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
                  border: "none", borderRadius: 10,
                  padding: "clamp(10px,1.6vw,15px) clamp(20px,3.4vw,34px)",
                  fontWeight: 800, fontSize: "clamp(13px,1.7vw,16px)",
                  color: "#1e293b", cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(245,158,11,0.45)",
                }}
              >
                {banner.buttonText}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══ SOUND TOGGLE (video banners only) ══ */}
      {activeMediaType === "video" && (
        <button
          onClick={(e) => { e.stopPropagation(); setMuted(m => !m) }}
          aria-label={muted ? "Sound on karo" : "Sound off karo"}
          style={{
            position: "absolute", top: "clamp(12px,2vw,20px)", right: "clamp(12px,2vw,20px)",
            zIndex: 6, width: 36, height: 36, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            color: "#fff", fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      )}

      {/* ══ CAROUSEL DOTS ══ */}
      {banners.length > 1 && (
        <div style={{
          position: "absolute", bottom: "clamp(16px,3vw,28px)", left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 7, zIndex: 5,
        }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: i === index ? 22 : 8, height: 8, borderRadius: 4,
                border: "none", cursor: "pointer",
                background: i === index ? "#fbbf24" : "rgba(255,255,255,0.55)",
                transition: "width 0.25s",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
      </div>
  )
}
