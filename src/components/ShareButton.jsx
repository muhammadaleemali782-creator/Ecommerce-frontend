import { useAuth } from "../context/AuthContext"

/*
  📤 ShareButton — website aur app dono ka link share karta hai.
  Login ho ya na ho, dono jagah kaam karta hai. Agar user logged in
  hai, uska naam/number bhi message me chala jaata hai.
*/

const WEBSITE_URL = "https://educa-store.vercel.app/"

// ⭐ Jab APK ko kahin (Google Drive / GitHub Release / apni site) host
// kar do, uska public link yahan daal dena — turant app download button
// bhi share message me chala jayega.
const APP_DOWNLOAD_URL = ""

export default function ShareButton({ style, compact }) {
  const { user } = useAuth() || {}

  const handleShare = async () => {
    const name  = user?.fullName || user?.name || ""
    const phone = user?.phone || ""

    let text = name ? `👋 ${name} ki taraf se!\n` : `👋 EDUCA Store!\n`
    if (phone) text += `📞 Contact: ${phone}\n`
    text += `\n🛍️ Website check karo:\n${WEBSITE_URL}`
    if (APP_DOWNLOAD_URL) text += `\n\n📱 App download karo:\n${APP_DOWNLOAD_URL}`

    if (navigator.share) {
      try {
        await navigator.share({ title: "EDUCA Store", text, url: WEBSITE_URL })
      } catch {
        /* user ne cancel kiya — kuch nahi karna */
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        alert("✅ Link copy ho gaya! Ab kahin bhi paste kar do (WhatsApp, SMS, etc.)")
      } catch {
        alert(text)
      }
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleShare}
        title="Share"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", border: "none",
          color: "#fff", fontSize: 16, cursor: "pointer",
          ...style,
        }}
      >
        📤
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "#2563eb", color: "#fff", fontWeight: 700,
        fontSize: 12.5, padding: "8px 16px", borderRadius: 999,
        border: "none", cursor: "pointer", whiteSpace: "nowrap",
        ...style,
      }}
    >
      📤 Share App/Website
    </button>
  )
}
