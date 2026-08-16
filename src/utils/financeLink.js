/*
  💰 openFinanceService — Wallet/Finance member-only feature hai.
  Agar user LOGIN NAHI hai to seedha Login screen khol do (aage jaane hi
  mat do). Agar login hai to real Services API (/api/services) se pehla
  configured link nikaal ke usi tarah open karta hai jaise Services page
  khud karta hai (internal → app ke andar page change, external → naye
  tab mein khulta hai). Koi fake/hardcoded link nahi.
*/
export async function openFinanceService(loggedIn, setPage) {
  // ⭐ Login-gate: not logged in ho to seedha login screen, aage kuch nahi
  if (!loggedIn) {
    setPage?.("login")
    return
  }

  try {
    const token = localStorage.getItem("token")
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/services`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()
    const services = data.services || []
    if (services.length === 0) {
      // Abhi koi service configured nahi hai — Services page pe le jao
      setPage?.("services")
      return
    }
    const s = services[0]
    if (s.linkType === "internal" && setPage) {
      setPage(s.link)
    } else if (s.link) {
      window.open(s.link, "_blank", "noopener,noreferrer")
    } else {
      setPage?.("services")
    }
  } catch (e) {
    console.error("Finance service link error:", e.message)
    setPage?.("services")
  }
}

/* 🎓 Education — abhi apna platform nahi bana, isliye Udaan Achievers pe bhejo.
   Yeh public/informational hai, login-gate nahi chahiye. */
export const EDUCATION_EXTERNAL_LINK = "https://udaan-achievers-frontend.vercel.app/"
export function openEducation() {
  window.open(EDUCATION_EXTERNAL_LINK, "_blank", "noopener,noreferrer")
}
