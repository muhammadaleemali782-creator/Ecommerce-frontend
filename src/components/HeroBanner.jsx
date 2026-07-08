import { useState, useEffect, useRef } from "react"

const API = `${import.meta.env.VITE_API_URL}`

/* =====================================================
   HERO BANNER — Home page ke top pe dikhne wala professional ad slot.
   Admin dashboard (Home Banners) se fully control hota hai:
   image / gif / video, heading, subheading, CTA button, multiple
   banners ho to auto-carousel.
===================================================== */
export default function HeroBanner({ setPage }) {
  const [banners, setBanners] = useState([])
  const [index, setIndex]     = useState(0)
  const [loaded, setLoaded]   = useState(false)
  const touchX = useRef(null)

  useEffect(() => {
    let mounted = true
    fetch(`${API}/api/banners`)
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
  const mediaUrl = banner.media ? `${API}${banner.media}` : null

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
        position: "relative",
        width: "100%",
        height: "clamp(200px, 34vw, 420px)",
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 20,
        background: "#0f172a",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      }}
    >
      {/* ══ MEDIA ══ */}
      {mediaUrl && (
        banner.mediaType === "video" ? (
          <video
            key={mediaUrl}
            src={mediaUrl}
            autoPlay muted loop playsInline
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
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.65) 100%)",
        }} />
      )}

      {/* ══ CONTENT ══ */}
      {(banner.title || banner.subtitle || banner.buttonText) && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          padding: "clamp(16px,4vw,36px)",
          color: "#fff",
        }}>
          {banner.title && (
            <h2 style={{
              margin: 0, marginBottom: banner.subtitle ? 6 : 0,
              fontSize: "clamp(18px, 4vw, 32px)",
              fontWeight: 900, lineHeight: 1.2,
              textShadow: "0 2px 10px rgba(0,0,0,0.4)",
              maxWidth: 560,
            }}>
              {banner.title}
            </h2>
          )}
          {banner.subtitle && (
            <p style={{
              margin: 0, marginBottom: banner.buttonText ? 14 : 0,
              fontSize: "clamp(12px, 2vw, 16px)",
              fontWeight: 500, opacity: 0.92,
              textShadow: "0 1px 6px rgba(0,0,0,0.35)",
              maxWidth: 480,
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
                padding: "clamp(8px,1.4vw,12px) clamp(16px,3vw,26px)",
                fontWeight: 800, fontSize: "clamp(12px,1.6vw,14px)",
                color: "#1e293b", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(245,158,11,0.4)",
              }}
            >
              {banner.buttonText}
            </button>
          )}
        </div>
      )}

      {/* ══ CAROUSEL DOTS ══ */}
      {banners.length > 1 && (
        <div style={{
          position: "absolute", top: "clamp(12px,2vw,20px)", right: "clamp(12px,2vw,20px)",
          display: "flex", gap: 6, zIndex: 5,
        }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: i === index ? 18 : 7, height: 7, borderRadius: 4,
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
