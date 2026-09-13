import { useEffect } from "react"

const PAGE_META = {
  home: {
    title: "EDUCA VEDA — Pure Himalayan Ayurvedic Healing & Wellness Hub",
    desc: "Discover pure Himalayan Ayurvedic healing with EDUCA VEDA. 100% natural, AYUSH-certified herbal formulations with zero side-effects.",
    path: ""
  },
  store: {
    title: "Ayurvedic Medicine & Herb Store — EDUCA VEDA",
    desc: "Shop authentic Ayurvedic medicines, Rasayanas, herbal oils, and wellness formulations directly with doorstep delivery.",
    path: "?page=store"
  },
  services: {
    title: "Rogsetu Pulse Diagnosis & Gurukul Wellness — EDUCA VEDA",
    desc: "Experience non-invasive Nadi Parikshan pulse diagnosis and join certified Ayurvedic Gurukul clinical diploma courses.",
    path: "?page=services"
  },
  cart: {
    title: "Your Ayurvedic Wellness Cart — EDUCA VEDA",
    desc: "Review your selected natural Ayurvedic herbs and medicines. Secure checkout and fast delivery across India.",
    path: "?page=cart"
  },
  checkout: {
    title: "Secure Checkout — EDUCA VEDA",
    desc: "Complete your order for genuine Ayurvedic formulations with secure payment and doorstep fulfillment.",
    path: "?page=checkout"
  },
  join: {
    title: "Join EDUCA VEDA — Direct Seller & Distributor Partnership",
    desc: "Become a certified partner, distributor, or direct seller with EDUCA VEDA. Earn high commissions and promote holistic health.",
    path: "?page=join"
  },
  login: {
    title: "Member & Partner Login — EDUCA VEDA",
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
