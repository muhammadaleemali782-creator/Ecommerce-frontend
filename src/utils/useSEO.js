import { useEffect } from "react"

const PAGE_META = {
  home: {
    title: "EDUCA VEDA — Educa Store, Educa Fintech & Educa Institute | Prayagraj",
    desc: "Official portal of EDUCA VEDA: 1. EDUCA STORE (Ayurvedic health), 2. EDUCA FINTECH (Royalty earning), 3. EDUCA INSTITUTE (Ayurveda clinical diploma), and 4. ROGSETU clinic. Prayagraj.",
    path: ""
  },
  store: {
    title: "EducaStore (Educa Store) — Official Ayurvedic Medicines & Formulations | EDUCA VEDA",
    desc: "Shop authentic Ayurvedic medicines for Diabetes, High BP, Shecurevedic period care, toothache, and pure Shilajit energy on EducaStore. Fast doorstep delivery across India.",
    path: "?page=store"
  },
  services: {
    title: "EDUCA INSTITUTE & GURUKUL — Rogsetu Nadi Parikshan & Ayurveda Diploma | Prayagraj",
    desc: "Experience non-invasive Nadi Parikshan pulse diagnosis and join certified Ayurvedic Gurukul clinical diploma courses at EDUCA INSTITUTE. Jhalwa, Prayagraj.",
    path: "?page=services"
  },
  cart: {
    title: "Your Ayurvedic Wellness Cart — EDUCA STORE | EDUCA VEDA",
    desc: "Review your selected natural Ayurvedic herbs and medicines. Secure checkout and fast delivery across India.",
    path: "?page=cart"
  },
  checkout: {
    title: "Secure Checkout — EDUCA STORE (Educa)",
    desc: "Complete your order for genuine Ayurvedic formulations with secure payment and doorstep fulfillment.",
    path: "?page=checkout"
  },
  join: {
    title: "EDUCA FINTECH — Direct Seller & Distributor Partnership, Royalty Wallet | EDUCA",
    desc: "Join EDUCA FINTECH. Become a certified partner, distributor, or direct seller with EDUCA. Earn royalty wallet income, commissions, and promote holistic health.",
    path: "?page=join"
  },
  login: {
    title: "Member & Partner Login — EDUCA Portal (Educa Veda & Fintech)",
    desc: "Access your EDUCA account, order history, distributor dashboard, and royalty wallet.",
    path: "?page=login"
  }
}

export function useSEO(page) {
  useEffect(() => {
    const meta = PAGE_META[page] || PAGE_META.home
    const fullTitle = meta.title
    document.title = fullTitle

    const setMeta = (name, content, isProp = false) => {
      let el = document.querySelector(isProp ? `meta[property="${name}"]` : `meta[name="${name}"]`)
      if (!el) {
        el = document.createElement("meta")
        if (isProp) el.setAttribute("property", name)
        else el.setAttribute("name", name)
        document.head.appendChild(el)
      }
      el.setAttribute("content", content)
    }

    setMeta("description", meta.desc)
    setMeta("og:title", fullTitle, true)
    setMeta("og:description", meta.desc, true)
    setMeta("twitter:title", fullTitle)
    setMeta("twitter:description", meta.desc)

    const canonicalUrl = meta.path ? `https://educaveda.vercel.app/${meta.path}` : "https://educaveda.vercel.app/"
    setMeta("og:url", canonicalUrl, true)
    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (!linkCanonical) {
      linkCanonical = document.createElement("link")
      linkCanonical.setAttribute("rel", "canonical")
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.setAttribute("href", canonicalUrl)
  }, [page])
}
