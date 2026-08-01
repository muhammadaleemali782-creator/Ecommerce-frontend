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

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2200)
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
        gap: 18,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: 24,
        textAlign: "center",
      }}
    >
      {/* Logo/mark */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "#3b82f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 26,
          color: "#fff",
          boxShadow: "0 10px 30px rgba(59,130,246,0.45)",
          animation: "gl-pulse 1.6s ease-in-out infinite",
        }}
      >
        E
      </div>

      {/* Spinner dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#3b82f6",
              display: "inline-block",
              animation: `gl-bounce 1s ${i * 0.15}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Rotating message */}
      <div
        key={index}
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          maxWidth: 320,
          animation: "gl-fade 0.4s ease",
        }}
      >
        {MESSAGES[index]}
      </div>

      {subtitle && (
        <div style={{ color: "#94a3b8", fontSize: 13, maxWidth: 300 }}>
          {subtitle}
        </div>
      )}

      <style>{`
        @keyframes gl-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes gl-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes gl-fade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
