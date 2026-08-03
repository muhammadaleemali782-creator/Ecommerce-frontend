import { useEffect, useState } from "react"

/*
  🌱 InlineLoader — GrowthLoader ka chhota/compact version.
  Full page block nahi karta, bas jis section ka data aa raha hai
  wahi jagah dikhta hai (orders list, tree, dashboard cards, etc).
  Free-tier backend/DB ki wajah se wait lambi ho sakti hai, isliye
  yahan bhi rotating growth/happiness message ghumta rehta hai
  taaki "atka hua" na lage.
*/

const MESSAGES = [
  "Data la rahe hain, thodi der ruko 🌱",
  "Bas thoda aur, achi cheezein aa rahi hain 😊",
  "Server jaag raha hai, swagat ki taiyari ⏳",
  "Growth ka data load ho raha hai 📈",
  "Almost there, thoda patience ✨",
  "Team EDUCA tumhare liye laa rahi hai 🤝",
]

export default function InlineLoader({ label, minHeight = 140 }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * MESSAGES.length))

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        minHeight,
        padding: 24,
        textAlign: "center",
      }}
    >
      {/* Soft glowing ring around a small mark — matches GrowthLoader style */}
      <div style={{ position: "relative", width: 40, height: 40 }}>
        <div style={{
          position: "absolute", inset: -4, borderRadius: 14,
          border: "2px solid rgba(59,130,246,0.3)",
          animation: "il-ring 1.6s ease-out infinite",
        }} />
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "il-pulse 1.6s ease-in-out infinite",
        }}>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 4.5, height: 4.5, borderRadius: "50%",
                  background: "#fff", display: "inline-block",
                  animation: `il-bounce 1s ${i * 0.15}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div key={index} style={{ color: "#64748b", fontSize: 13, fontWeight: 600, animation: "il-fade 0.4s ease" }}>
        {label || MESSAGES[index]}
      </div>

      {/* Shimmer bar */}
      <div style={{ width: 90, height: 3, borderRadius: 99, background: "#e2e8f0", overflow: "hidden" }}>
        <div style={{
          width: "40%", height: "100%", borderRadius: 99,
          background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
          animation: "il-shimmer 1.3s ease-in-out infinite",
        }} />
      </div>

      <style>{`
        @keyframes il-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes il-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes il-ring {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes il-fade {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes il-shimmer {
          0% { transform: translateX(-140%); }
          100% { transform: translateX(340%); }
        }
      `}</style>
    </div>
  )
}
