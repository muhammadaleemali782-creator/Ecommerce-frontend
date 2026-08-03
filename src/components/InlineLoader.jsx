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
        gap: 10,
        minHeight,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#3b82f6",
              display: "inline-block",
              animation: `il-bounce 1s ${i * 0.15}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <div key={index} style={{ color: "#64748b", fontSize: 13, fontWeight: 600, animation: "il-fade 0.4s ease" }}>
        {label || MESSAGES[index]}
      </div>
      <style>{`
        @keyframes il-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes il-fade {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
