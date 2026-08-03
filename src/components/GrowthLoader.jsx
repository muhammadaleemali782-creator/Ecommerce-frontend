import { useEffect, useState } from "react"

/*
  🌱 GrowthLoader
  Poori app me kahin bhi loading dikhani ho (server cold-start, login,
  data fetch), yahi ek overlay use hota hai. Har baar alag-alag
  "growth + happiness" themed message ghoomta rehta hai — taaki wait
  bhi motivating lage, ekdam static/boring spinner na ho.

  Usage:
    {isLoading && <GrowthLoader />}
    {isLoading && <GrowthLoader subtitle="Server ko jagaya ja raha hai..." />}
*/

const MESSAGES = [
  "Har kadam ek nayi growth ki taraf 🌱",
  "Khushiyan jodi ja rahi hain, ruko zara 😊",
  "Tumhari mehnat rang la rahi hai ✨",
  "Success ka safar shuru ho raha hai 🚀",
  "Chhoti shuruaat, badi khushi 🌻",
  "Sapne sach karne ki taiyari ho rahi hai 💫",
  "Team EDUCA tumhari growth ke saath hai 🤝",
  "Har din ek naya mauka, ek nayi khushi 🌤️",
  "Patience rakho, achi cheezein time leti hain ⏳",
  "Tumhara network, tumhari taraqqi 📈",
  "Positivity load ho rahi hai... 💛",
  "Bade sapno ki taiyari ho rahi hai 🌟",
]

export default function GrowthLoader({ subtitle }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * MESSAGES.length))
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2400)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 22,
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
        padding: 24,
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
        overflow: "hidden",
      }}
    >
      {/* Soft floating glow orb — subtle depth, purely decorative */}
      <div style={{
        position: "absolute", width: 260, height: 260, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
        top: "18%", left: "50%", transform: "translateX(-50%)",
        animation: "gl-drift 6s ease-in-out infinite", pointerEvents: "none",
      }} />

      {/* Logo/mark with glowing ring */}
      <div style={{ position: "relative", width: 78, height: 78 }}>
        <div style={{
          position: "absolute", inset: -8, borderRadius: 24,
          border: "2px solid rgba(59,130,246,0.35)",
          animation: "gl-ring 2s ease-out infinite",
        }} />
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: 20,
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 30,
            color: "#fff",
            boxShadow: "0 12px 34px rgba(59,130,246,0.5)",
            animation: "gl-pulse 1.8s ease-in-out infinite",
          }}
        >
          E
        </div>
      </div>

      {/* Rotating message */}
      <div style={{ minHeight: 46, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          key={index}
          style={{
            color: "#fff",
            fontSize: 16.5,
            fontWeight: 700,
            maxWidth: 320,
            lineHeight: 1.4,
            animation: "gl-fade 0.45s ease",
          }}
        >
          {MESSAGES[index]}
        </div>
      </div>

      {subtitle && (
        <div style={{ color: "#94a3b8", fontSize: 13, maxWidth: 300, marginTop: -8 }}>
          {subtitle}
        </div>
      )}

      {/* Shimmer progress bar — indeterminate, feels "alive" without a fake percentage */}
      <div style={{ width: 160, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{
          width: "40%", height: "100%", borderRadius: 99,
          background: "linear-gradient(90deg, transparent, #60a5fa, transparent)",
          animation: "gl-shimmer 1.4s ease-in-out infinite",
        }} />
      </div>

      <style>{`
        @keyframes gl-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes gl-ring {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes gl-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gl-shimmer {
          0% { transform: translateX(-160%); }
          100% { transform: translateX(360%); }
        }
        @keyframes gl-drift {
          0%, 100% { transform: translate(-50%, 0px) scale(1); }
          50% { transform: translate(-50%, 14px) scale(1.08); }
        }
      `}</style>
    </div>
  )
}
