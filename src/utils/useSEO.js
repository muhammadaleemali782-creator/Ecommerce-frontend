import { useEffect } from "react"

const PAGE_META = {
  home: {
    title: "EDUCA VEDA (Educa) — Pure Ayurvedic Healing, Diabetes, BP & Shecurevedic | Prayagraj",
    desc: "EDUCA VEDA (Educa) provides root-cause Ayurvedic healing for Sugar (Diabetes), High BP, Shecurevedic period pain, and Daat ki bimari without hospital expenses. Jhalwa, Prayagraj.",
    path: ""
  },
  store: {
    title: "Ayurvedic Medicine & Herb Store — EDUCA VEDA (Educa)",
    desc: "Shop authentic Ayurvedic medicines for Diabetes, High BP, Shecurevedic period care, toothache, and pure Shilajit energy. Fast delivery across India.",
    path: "?page=store"
  },
  services: {
    title: "Rogsetu Pulse Diagnosis & Gurukul Training — EDUCA VEDA | Prayagraj",
    desc: "Experience non-invasive Nadi Parikshan pulse diagnosis and join certified Ayurvedic Gurukul clinical diploma courses. Jhalwa, Prayagraj.",
    path: "?page=services"
  },
  cart: {
    title: "Your Ayurvedic Wellness Cart — EDUCA VEDA (Educa)",
    desc: "Review your selected natural Ayurvedic herbs and medicines. Secure checkout and fast delivery across India.",
    path: "?page=cart"
  },
  checkout: {
    title: "Secure Checkout — EDUCA VEDA (Educa)",
    desc: "Complete your order for genuine Ayurvedic formulations with secure payment and doorstep fulfillment.",
    path: "?page=checkout"
  },
  join: {
    title: "Join EDUCA VEDA (Educa) — Direct Seller & Distributor Partnership | Prayagraj",
    desc: "Become a certified partner, distributor, or direct seller with EDUCA VEDA. Earn high commissions and promote holistic health.",
    path: "?page=join"
  },
  login: {
    title: "Member & Partner Login — EDUCA VEDA (Educa)",
    desc: "Access your EDUCA VEDA account, order history, distributor dashboard, and royalty wallet.",
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

    const canonicalUrl = `https://educa-store.vercel.app/${meta.path}`
    setMeta("og:url", canonicalUrl, true)
    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (linkCanonical) {
      linkCanonical.setAttribute("href", canonicalUrl)
    }
  }, [page])
}
