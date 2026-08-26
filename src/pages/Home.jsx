import React, { useState, useRef } from "react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";

// ══════════════════════════════════════════════════════════
// 4 SOVEREIGN REALMS (DIFFERENTIATED SUBTAG & CATEGORY, ZERO NUMBERS)
// ══════════════════════════════════════════════════════════
export const REALMS = [
  {
    id: "b1",
    subTag: "100% NATURAL HEALING",
    title: "EDUCA HEALTH",
    subtitle: "ON NATURAL AYURVEDIC HEALING & ZERO SIDE-EFFECTS",
    category: "Shuddh Himalayan Jadi Booti & Rasayana",
    date: "100% HERBAL · AYUSH CERTIFIED",
    rating: "9.9",
    desktopImg: "/natgeo_jadibooti.jpg",
    mobileImg: "/natgeo_jadibooti.jpg",
    accentColor: "#fbbf24",
    bgGradient: "from-amber-950/80 via-[#0d140e]/95 to-[#050505]",
    ambientGlow: "rgba(251,191,36,0.18)",
    pills: ["100% NATURAL", "NO SIDE-EFFECTS", "HERBAL HEALING"],
    desc: "Prakritik jadibootiyon se bina kisi side-effect ke ilaaj. Angrezi dawa ki tarah sharir ke doosre ango ko koi nuksaan nahi pahunchta.",
    intro: "Aapka ilaaj bilkul naturally kiya jata hai. Yahan angrezi dawa ki tarah ek bimari theek karne ke chakkar me doosri cheez kharab nahi hoti.",
    story1: "Himalayan jadibootiyon aur classical Ayurvedic formulas se bani rasayanas sharir ko jad se tandurust karti hain, bina kisi harmful toxicity ya dependency ke.",
    story2: "AYUSH certified formulations jo cellular energy, immunity, aur sharirik urja ko prakritik roop se hamesha ke liye swasth banati hain.",
    cta: "EXPLORE HEALTH STORE",
    pageTarget: "store",
    items: [
      { name: "Pure Rasayana", role: "Cellular Healing", note: "Bina kisi side-effect ke", icon: "🌿" },
      { name: "Jadi Booti", role: "Natural Immunity", note: "Himalayan shuddh jadibooti", icon: "🌱" },
      { name: "Ayush Certified", role: "Complete Wellness", note: "Jad se bimari theek kare", icon: "✨" },
    ]
  },
  {
    id: "b2",
    subTag: "AYURVEDIC NADI VIGYAN",
    title: "EDUCA ROGSETU & WELLNESS CONSULTANT",
    subtitle: "ON NON-INVASIVE PULSE DIAGNOSIS & ZERO RADIATION",
    category: "Bina Cheer-Faad & Bina Laser Sateek Jaanch",
    date: "ZERO SURGERY · ZERO LASER",
    rating: "9.8",
    desktopImg: "/five_elements_desktop.jpg",
    mobileImg: "/five_elements_mobile.jpg",
    accentColor: "#38bdf8",
    bgGradient: "from-sky-950/80 via-[#061824]/95 to-[#050505]",
    ambientGlow: "rgba(56,189,248,0.22)",
    pills: ["ZERO SURGERY", "ZERO TOXIC LASER", "NADI JAANCH"],
    desc: "Bina cheer-faad (surgery) aur bina harmful toxic laser ke aapki sampoorna shareerik jaanch karke sateek bimari ka pata lagate hain.",
    intro: "Bina cheer-faad aur bina toxic laser ke jaanch: Hum bina kisi surgery ya harmful rays ke aapki poori jaanch karke sateek bata dete hain aapko kya hua hai.",
    story1: "Classical Nadi Parikshan aur Ayurvedic diagnostics ke zariye sharir ke Tridosha (Vata, Pitta, Kapha) ka sateek balance check kiya jata hai.",
    story2: "Expert certified Vaidyas aapki jaanch ke baad prakritik aahar, dincharya, aur jadibooti upchaar se bimari ko bina kisi surgery ke door karte hain.",
    cta: "BOOK DIAGNOSIS CONSULTATION",
    pageTarget: "services",
    items: [
      { name: "Nadi Parikshan", role: "Zero Radiation", note: "Bina toxic laser ke jaanch", icon: "🩺" },
      { name: "Tridosha Jaanch", role: "Sateek Analysis", note: "Vata · Pitta · Kapha check", icon: "💧" },
      { name: "Zero Surgery", role: "Safe Healing", note: "Bina cheer-faad ke upchaar", icon: "🛡️" },
    ]
  },
  {
    id: "b3",
    subTag: "CLINICAL DIPLOMA COURSE",
    title: "EDUCA GURUKUL",
    subtitle: "ON AFFORDABLE CLINICAL TRAINING & WELLNESS DIPLOMA",
    category: "Medicine Seekhein & Consultant Banein",
    date: "CERTIFIED COURSE · LOW FEES",
    rating: "9.9",
    desktopImg: "/gurukul_desktop_learn.jpg",
    mobileImg: "/gurukul_retro_book.jpg",
    accentColor: "#818cf8",
    bgGradient: "from-indigo-950/80 via-[#0a1026]/95 to-[#050505]",
    ambientGlow: "rgba(129,140,248,0.22)",
    pills: ["SEEKHEIN MEDICINE", "WELLNESS CONSULTANT", "KAM FEES"],
    desc: "Seekhein Ayurvedic medicine, banein certified Wellness Consultant aur karein logon ki madad. Bahut hi kam daam me certified training.",
    intro: "Seekhein Ayurvedic medicine aur banein certified Wellness Consultant: Bahut hi kam daam me course karein, medicine seekhein aur logon ki bimari door karke madad karein.",
    story1: "Gurukul me Dravyaguna herbology, Panchakarma, aur rog nivaran ki comprehensive training di jati hai jisse aap swasthya salahkar ban sakte hain.",
    story2: "Course complete karne ke baad aap ek certified wellness consultant ban kar apne samaj me logon ko swasth jeevan pradan kar sakte hain aur achhi aamdani bhi kama sakte hain.",
    cta: "ENROLL IN GURUKUL",
    pageTarget: "services",
    items: [
      { name: "Medicine Training", role: "Ayurvedic Herbs", note: "Jadibooti ka pura gyan", icon: "📜" },
      { name: "Wellness Consultant", role: "Help People", note: "Logo ki madad karein", icon: "🤝" },
      { name: "Affordable Course", role: "Certification", note: "Sabse kam daam me seekhein", icon: "🎓" },
    ]
  },
  {
    id: "b4",
    subTag: "INSTANT MICRO-CAPITAL",
    title: "EDUCA FINANCE",
    subtitle: "ON FASTEST LOAN DISBURSAL & HIGH INVESTMENT RETURNS",
    category: "Sabse Tez Loan & High Return Investment",
    date: "FAST APPROVAL · HIGH ROI",
    rating: "9.9",
    desktopImg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    mobileImg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    accentColor: "#fbbf24",
    bgGradient: "from-amber-950/70 via-[#12161f]/95 to-[#050505]",
    ambientGlow: "rgba(251,191,36,0.16)",
    pills: ["SABSE FAST LOAN", "HIGH ROI RETURN", "INVEST & EARN"],
    desc: "Sabse fast aur bina jhanjhat ke loan payein. Humare sath invest karke secure liquidity aur guaranteed high returns ka laabh uthayein.",
    intro: "Hum dete hain sabse fast loan approval. Hamari company me agar aap invest karte hain to aapko milta hai behtareen munafa aur surakshit laabh.",
    story1: "Health emergency, personal needs ya business ke liye turant micro-loan approval milta hai, bina kisi lambe process ya paper jhanjhat ke.",
    story2: "Hamare liquidity investment pools me funds daal kar aap regular high yields aur guaranteed staking returns ka laabh le sakte hain.",
    cta: "APPLY FOR LOAN / INVEST",
    pageTarget: "ppc-wallet",
    items: [
      { name: "Fast Loans", role: "Quick Disbursal", note: "Sabse tez loan suvidha", icon: "⚡" },
      { name: "Invest & Earn", role: "High Profits", note: "Invest karein aur laabh payein", icon: "📈" },
      { name: "100% Secure", role: "Protected Funds", note: "Surakshit capital guarantee", icon: "🔒" },
    ]
  }
];

// ══════════════════════════════════════════════════════════
// EXPORTED PRODUCT CARD FOR STORE.JSX
// ══════════════════════════════════════════════════════════
export function ProductCard({
  product,
  p,
  showPPC,
  onAddToCart,
  onAdd,
  onBuyNow,
  onLoginRedirect,
  setPage,
  cartQty = 0
}) {
  const item = product || p || {};
  const handleAdd = onAddToCart || onAdd;
  const price = item.price || item.finalPrice || 0;
  const name = item.name || item.title || "Ayurvedic Product";
  const image = item.image || item.img || "/natgeo_jadibooti.jpg";
  const category = item.category || "Rasayana";
  const rating = item.rating || 5;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col justify-between">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-gray-900/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
          {category}
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-0.5 text-amber-500 text-xs mb-1">
            {"★".repeat(Math.min(5, Math.floor(rating)))}
            <span className="text-[10px] text-gray-400 ml-1">({rating})</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-gray-700 transition-colors">
            {name}
          </h4>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-base font-black text-gray-900">₹{price}</span>
            {item.mrp && item.mrp > price && (
              <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {handleAdd && (
            <button
              onClick={() => handleAdd(item)}
              className="flex-1 py-2 px-3 bg-gray-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              Add to Cart {cartQty > 0 ? `(${cartQty})` : ""}
            </button>
          )}
          {onBuyNow && (
            <button
              onClick={() => onBuyNow(item)}
              className="py-2 px-3 bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
            >
              Buy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN HOME COMPONENT
// ══════════════════════════════════════════════════════════
export default function Home({ setPage }) {
  const { loggedIn } = useAuth ? useAuth() : { loggedIn: false };
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSplitOpening, setIsSplitOpening] = useState(false);
  const [dossierScrolled, setDossierScrolled] = useState(false);

  const triggerCardOpen = () => {
    setIsSplitOpening(true);
    setTimeout(() => {
      triggerCardOpen();
      setIsSplitOpening(false);
    }, 420);
  };

  const triggerCardClose = () => {
    setIsExpanded(false);
  };
  const [activeModal, setActiveModal] = useState(null);
  const [policyModal, setPolicyModal] = useState(null);
  const [savedRealms, setSavedRealms] = useState({});
  const [toastMsg, setToastMsg] = useState("");
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Touch & Swipe State
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const currentRealm = REALMS[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % REALMS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + REALMS.length) % REALMS.length);
  };

  const toggleSave = (id) => {
    setSavedRealms((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      showToast(updated[id] ? "Saved to Favorites" : "Removed from Favorites");
      return updated;
    });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  const safeSetPage = (target) => {
    if (setPage) setPage(target);
  };

  const handleShare = async () => {
    const shareData = {
      title: "EDUCA VEDA - Vedic Science & Sovereignty",
      text: "Explore Ayurveda, Rogsetu, Gurukul, and Fintech on Educa Veda!",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("Shared successfully!");
      } catch (err) {
        // Cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Website link copied to clipboard!");
      } catch (err) {
        showToast("Link: " + window.location.href);
      }
    }
  };

  const handleDownloadApp = () => {
    showToast("Downloading EDUCA VEDA Mobile App APK...");
    const link = document.createElement("a");
    link.href = "#download-apk";
    link.setAttribute("download", "EducaVeda.apk");
    document.body.appendChild(link);
    setTimeout(() => {
      showToast("App install package ready!");
    }, 1000);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
    touchStartY.current = e.targetTouches ? e.targetTouches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
    const currentY = e.targetTouches ? e.targetTouches[0].clientY : e.clientY;
    const dx = currentX - touchStartX.current;
    const dy = currentY - touchStartY.current;

    if (Math.abs(dx) > Math.abs(dy)) {
      setDragOffset(dx);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -35) {
      handleNext();
    } else if (dragOffset > 35) {
      handlePrev();
    }
    setDragOffset(0);
  };

  const handleMouseDown = (e) => handleTouchStart(e);
  const handleMouseMoveTouch = (e) => {
    if (isDragging) handleTouchMove(e);
  };
  const handleMouseUp = () => handleTouchEnd();

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMouseOffset({ x: x * 10, y: y * 10 });
  };

  // Scroll Hide Handler for Dossier Top Header
  const handleDossierScroll = (e) => {
    const top = e.currentTarget.scrollTop;
    if (top > 30 && !dossierScrolled) {
      setDossierScrolled(true);
    } else if (top <= 30 && dossierScrolled) {
      setDossierScrolled(false);
    }
  };

  return (
    <div
      className="w-full bg-black text-white font-sans selection:bg-[#fbbf24] selection:text-black"
      style={{ overflowX: "hidden", maxWidth: "100vw" }}
    >
      {/* ══════════════════════════════════════════════════════════
          MOBILE VIEW: INFINITE 3D ARC WHEEL CAROUSEL
      ══════════════════════════════════════════════════════════ */}
      <div
        className="flex md:hidden relative w-full h-[calc(100dvh-56px)] overflow-hidden flex-col justify-between select-none"
        style={{ touchAction: "pan-y", contain: "layout style paint", willChange: "transform" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 🌟 ACCURATE DYNAMIC AMBIENT BACKGROUND MATCHING ACTIVE FRONT CARD */}
        {REALMS.map((r, idx) => (
          <div
            key={r.id}
            className={`absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none transition-opacity duration-400 ${
              idx === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${r.mobileImg})`,
              willChange: "opacity",
              contain: "strict",
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${r.bgGradient}`} />
          </div>
        ))}

        {/* Floating Toast Notification Banner */}
        {toastMsg && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[110] bg-[#fbbf24] text-black font-black text-xs px-4 py-2 rounded-full shadow-2xl animate-fade uppercase tracking-wider flex items-center gap-2">
            <span>✦</span>
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="pt-2" />

        {/* ── 3D ARC WHEEL CAROUSEL STAGE ── */}
        <div
          className={"relative z-20 w-full flex-1 flex items-center justify-center px-4 transition-all duration-500 my-auto " + (isExpanded ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100")}
        >
          <div className="relative w-full max-w-[320px] h-[390px] sm:h-[420px] flex items-center justify-center">
            {REALMS.map((realm, idx) => {
              let rawOffset = idx - activeIndex;
              if (rawOffset < -2) rawOffset += REALMS.length;
              if (rawOffset > 2) rawOffset -= REALMS.length;

              const isCenter = rawOffset === 0;
              const isPrev = rawOffset === -1;
              const isNext = rawOffset === 1;
              const isBack = Math.abs(rawOffset) === 2;

              let transformStyle = "";
              let zIndexStyle = 10;
              let opacityStyle = 0;

              if (isCenter) {
                transformStyle = isSplitOpening
                  ? "translateX(0%) translateY(0px) scale(1.08)"
                  : "translateX(0%) translateY(0px) rotate(0deg) scale(1)";
                zIndexStyle = 40;
                opacityStyle = 1;
              } else if (isPrev) {
                transformStyle = "translateX(-65%) translateY(40px) rotate(-14deg) scale(0.82)";
                zIndexStyle = 20;
                opacityStyle = 0.65;
              } else if (isNext) {
                transformStyle = "translateX(65%) translateY(40px) rotate(14deg) scale(0.82)";
                zIndexStyle = 20;
                opacityStyle = 0.65;
              } else if (isBack) {
                transformStyle = "translateX(0%) translateY(70px) scale(0.65)";
                zIndexStyle = 5;
                opacityStyle = 0;
              }

              return (
                <div
                  key={realm.id}
                  onClick={() => {
                    if (isCenter) triggerCardOpen();
                    else setActiveIndex(idx);
                  }}
                  className={`absolute top-0 w-[270px] h-[380px] sm:h-[400px] rounded-3xl shadow-2xl cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${"overflow-hidden bg-white text-black flex flex-col justify-between"}`}
                  style={{
                    transform: transformStyle,
                    zIndex: zIndexStyle,
                    opacity: opacityStyle,
                    transformOrigin: "center bottom",
                    perspective: "1200px",
                    willChange: "transform, opacity",
                  }}
                >
                  {/* Top Artwork Image (Smooth Apple Aperture) */}
                  <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden bg-black group-hover:brightness-105 transition-all">
                    <img
                      src={realm.mobileImg}
                      alt={realm.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Bottom White Card Section */}
                  <div className="p-4 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-[13px] font-black uppercase tracking-tight text-black line-clamp-1 leading-tight flex-1">
                          {realm.title}
                        </h3>
                        <div className="flex items-center text-[11px] font-bold text-black shrink-0">
                          <span className="text-amber-500">★</span>
                          <span className="ml-0.5">{realm.rating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {realm.pills.slice(0, 3).map((pill, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[8.5px] font-bold rounded-full uppercase"
                          >
                            {pill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button: Opens the Expanded Dossier Screen Instantly & Smoothly */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                      }}
                      className="w-full mt-3 py-2.5 bg-black text-[#fbbf24] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#1a1a1a] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer group"
                    >
                      <span>MORE INFO</span>
                      <span className="group-hover:translate-x-1 transition-transform">➔</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 📱 SUBTLE FOOTER: SHARE, DOWNLOAD, TERMS & POLICIES ── */}
        <div className="relative z-20 px-4 pb-4 pt-2 flex flex-col gap-2 bg-gradient-to-t from-black via-black/95 to-transparent">
          
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[11px] font-sans text-slate-400">
            <button
              onClick={handleShare}
              className="hover:text-white transition-colors cursor-pointer font-medium"
            >
              Share App
            </button>
            <span className="opacity-40">•</span>
            <button
              onClick={handleDownloadApp}
              className="hover:text-white transition-colors cursor-pointer font-medium"
            >
              Download App
            </button>
            <span className="opacity-40">•</span>
            <button
              onClick={() => setPolicyModal("terms")}
              className="hover:text-white transition-colors cursor-pointer font-medium"
            >
              Terms
            </button>
            <span className="opacity-40">•</span>
            <button
              onClick={() => setPolicyModal("privacy")}
              className="hover:text-white transition-colors cursor-pointer font-medium"
            >
              Privacy
            </button>
            <span className="opacity-40">•</span>
            <button
              onClick={() => setPolicyModal("disclaimer")}
              className="hover:text-white transition-colors cursor-pointer font-medium"
            >
              Disclaimer
            </button>
            <span className="opacity-40">•</span>
            <button
              onClick={() => setPolicyModal("refund")}
              className="hover:text-white transition-colors cursor-pointer font-medium"
            >
              Refunds
            </button>
          </div>

          <p className="text-[9.5px] text-center text-slate-500 font-sans tracking-wide">
            © 2026 EDUCA VEDA · AYUSH Certified Formulations
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          EXPANDED DOSSIER: 100% CLEAN, ZERO NUMBERS, ACCURATE COLOR & BACKGROUND
      ══════════════════════════════════════════════════════════ */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col justify-between overflow-hidden select-none font-sans animate-apple-sheet">
          
          {/* Dynamic Ambient Background Matching Active Card Color & Atmosphere */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-35"
            style={{ backgroundImage: `url(${currentRealm.mobileImg})`, contain: "strict" }}
          />
          <div
            className={"absolute inset-0 bg-gradient-to-b " + currentRealm.bgGradient + " pointer-events-none"}
          />
          {/* Ambient color tint — simple, no blur (blur-110px kills mobile GPU) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 30%, ${currentRealm.ambientGlow} 0%, transparent 70%)` }}
          />

          {/* 🌟 SCROLL-HIDE CLEAN HEADER (NO 02/04 BADGE) */}
          <header
            className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 pt-5 pb-2 transition-all duration-300 ease-in-out ${
              dossierScrolled
                ? "-translate-y-full opacity-0 pointer-events-none"
                : "translate-y-0 opacity-100"
            }`}
          >
            <button
              onClick={triggerCardClose}
              aria-label="Close Dossier"
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer group"
            >
              <svg className="w-4 h-4 stroke-[2.2] group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={() => {
                const target = currentRealm.pageTarget;
                setIsExpanded(false);
                safeSetPage(target === "ppc-wallet" ? (loggedIn ? "ppc-wallet" : "login") : target);
              }}
              aria-label="Action Launcher"
              className="w-10 h-10 rounded-full bg-white/[0.1] hover:bg-white text-white hover:text-black active:scale-90 flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer group"
            >
              <svg className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </button>
          </header>

          {/* Main Scrollable Stage */}
          <div
            onScroll={handleDossierScroll}
            className="relative z-30 flex-1 overflow-y-auto overflow-x-hidden px-5 pt-16 pb-6 space-y-4 no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* ── 3D CIRCULAR ORBITING CAROUSEL (STAGGER 1) ── */}
            <div
              className="relative w-full h-[300px] flex items-center justify-center pt-2 select-none overflow-hidden"
              style={{ perspective: "1100px" }}
            >
              <div
                className="relative w-full max-w-[280px] h-[280px] flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                {REALMS.map((realm, idx) => {
                  let rawOffset = idx - activeIndex;
                  if (rawOffset < -2) rawOffset += REALMS.length;
                  if (rawOffset > 2) rawOffset -= REALMS.length;

                  const dragAngleOffset = isDragging ? (dragOffset / 280) * 75 : 0;
                  const angleDeg = rawOffset * 75 - dragAngleOffset;
                  const angleRad = (angleDeg * Math.PI) / 180;

                  const translateX = Math.sin(angleRad) * 150;
                  const translateZ = Math.cos(angleRad) * 110 - 110;
                  const rotateY = -angleDeg * 0.85;
                  const scale = Math.max(0.68, 0.72 + 0.28 * Math.cos(angleRad));
                  const opacity = Math.max(0.25, Math.pow(Math.max(0, Math.cos(angleRad)), 1.5));
                  const zIndex = Math.round((Math.cos(angleRad) + 1) * 30);
                  const isFront = rawOffset === 0;

                  return (
                    <div
                      key={realm.id}
                      onClick={() => {
                        if (!isFront) setActiveIndex(idx);
                      }}
                      className="absolute w-[200px] sm:w-[220px] h-[270px] cursor-pointer active:scale-[0.98]"
                      style={{
                        transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                        zIndex,
                        opacity,
                        transformStyle: "preserve-3d",
                        filter: isFront ? "none" : "brightness(0.55)",
                        pointerEvents: Math.abs(rawOffset) > 1 ? "none" : "auto",
                        transition: "transform 0.45s cubic-bezier(0.23,1,0.32,1), opacity 0.45s ease",
                        willChange: "transform, opacity",
                      }}
                    >
                      <div className="relative w-full h-full rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-black">
                        <img
                          src={realm.mobileImg}
                          alt={realm.title}
                          className="w-full h-full object-cover"
                          loading="eager"
                        />

                        {/* Radial & Linear Atmospheric Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/30 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

                        {/* Bottom Realm Typography (Completely Differentiated SubTag & Category) */}
                        <div className="absolute bottom-3.5 left-3.5 right-3.5 pointer-events-none">
                          <span className="text-[8px] font-mono font-black text-[#fbbf24] uppercase tracking-widest block mb-0.5">
                            {realm.subTag}
                          </span>
                          <h3 className="text-[14.5px] font-black text-white uppercase tracking-tight line-clamp-1 drop-shadow-lg">
                            {realm.title}
                          </h3>
                          <p className="text-[8.5px] font-medium text-slate-300 line-clamp-1 mt-0.5 opacity-90">
                            {realm.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date with Bookmark & Favorite Actions (Clean, No Orbit Slider Box) */}
            <div className="flex items-center justify-between px-1 pt-1 pb-2">
              <div>
                <span className="text-[10px] font-black tracking-[0.18em] text-[#fbbf24] uppercase font-mono">
                  {currentRealm.date}
                </span>
                <div className="w-10 h-[1.5px] bg-[#fbbf24]/80 mt-1 rounded-full" />
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => toggleSave(currentRealm.id)}
                  aria-label="Save to favorites"
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] active:scale-90 flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  <svg
                    className={"w-3.5 h-3.5 transition-transform duration-200 " + (savedRealms[currentRealm.id] ? "fill-rose-500 stroke-rose-500 scale-110" : "fill-none stroke-white stroke-[2]")}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <button
                  onClick={() => toggleSave(currentRealm.id)}
                  aria-label="Bookmark item"
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] active:scale-90 flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  <svg
                    className={"w-3.5 h-3.5 transition-transform duration-200 " + (savedRealms[currentRealm.id] ? "fill-[#fbbf24] stroke-[#fbbf24] scale-110" : "fill-none stroke-white stroke-[2]")}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Editorial Content (No Giant Numbers) - STAGGER 2 & 3 */}
            <div className="space-y-3.5 pt-1">
              <h1 className="text-lg sm:text-xl font-serif font-black uppercase tracking-wider text-white leading-snug">
                {currentRealm.subtitle || currentRealm.title}
              </h1>

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {currentRealm.pills.map((pill, pIdx) => (
                  <span
                    key={pIdx}
                    className="px-2.5 py-0.5 bg-white/[0.08] text-slate-200 text-[9px] font-bold font-mono rounded-full uppercase tracking-wider"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              {/* Bento Grid Key Actives */}
              <div className="grid grid-cols-3 gap-2 pt-1.5">
                {currentRealm.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="p-2 rounded-2xl bg-white/[0.06] border border-white/[0.07] flex flex-col items-center text-center"
                  >
                    <span className="text-lg mb-1">{item.icon}</span>
                    <span className="text-[9px] font-bold text-white line-clamp-1 block">{item.name}</span>
                    <span className="text-[8px] font-medium text-slate-400 line-clamp-1 mt-0.5 block">{item.role}</span>
                  </div>
                ))}
              </div>

              {/* Narrative Prose with Golden Drop-Cap */}
              <div className="space-y-2.5 pt-1 text-slate-300 text-[12.5px] sm:text-[13px] leading-relaxed font-sans">
                <p className="first-letter:text-3xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:text-[#fbbf24] first-letter:leading-none text-white/95">
                  {currentRealm.intro}
                </p>
                <p className="text-slate-300/90 leading-relaxed">
                  {currentRealm.story1}
                </p>
                {currentRealm.story2 && (
                  <p className="text-slate-400 text-xs italic leading-relaxed pt-0.5">
                    {currentRealm.story2}
                  </p>
                )}
              </div>

              {/* Simplistic White Button (STAGGER 4) */}
              <div className="pt-3 pb-8">
                <button
                  onClick={() => {
                    const target = currentRealm.pageTarget;
                    setIsExpanded(false);
                    safeSetPage(target === "ppc-wallet" ? (loggedIn ? "ppc-wallet" : "login") : target);
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-[0.98] transition-all duration-200 shadow-xl flex items-center justify-between cursor-pointer group"
                >
                  <span>{currentRealm.cta}</span>
                  <span className="text-sm font-bold group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">
                    ↗
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DESKTOP VIEW: 4 CLASSICAL NATIONAL GEOGRAPHIC BILLBOARDS
      ══════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Billboard 1: Educa Health */}
        <section
          className="relative w-full h-[calc(100vh-56px)] min-h-[480px] max-h-[700px] bg-cover bg-center flex items-center justify-between p-6 sm:p-10 lg:p-14 overflow-hidden"
          style={{ backgroundImage: "url(" + REALMS[0].desktopImg + ")" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between gap-6">
            <div className="max-w-md lg:max-w-lg backdrop-blur-lg p-6 sm:p-7 relative shadow-2xl border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(15,15,15,0.75) 50%, rgba(0,0,0,0.68) 100%)' }}>
              <div className="absolute top-0 left-0 w-20 h-1.5 bg-[#fbbf24]" />
              <div className="space-y-2.5 pt-1.5">
                <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black uppercase tracking-tight text-white leading-none">
                  EDUCA<br /><span className="text-[#fbbf24]">HEALTH</span>
                </h2>
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                  {REALMS[0].category}
                </div>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal pt-1">
                  {REALMS[0].desc}
                </p>
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setActiveModal("jadibooti")}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:text-[#fbbf24] transition-colors group cursor-pointer"
                  >
                    <span>READ MORE</span>
                    <span className="w-3.5 h-3.5 bg-[#fbbf24] text-black flex items-center justify-center text-[9px] group-hover:translate-x-1 transition-transform">■</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="w-52 sm:w-60 lg:w-64 h-72 sm:h-[350px] lg:h-[380px] border-[12px] sm:border-[14px] border-[#fbbf24] shadow-2xl pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Billboard 2: Educa Rogsetu & Wellness */}
        <section
          className="relative w-full h-[calc(100vh-56px)] min-h-[480px] max-h-[700px] bg-cover bg-left lg:bg-center flex items-center justify-end p-6 sm:p-10 lg:p-14 overflow-hidden"
          style={{ backgroundImage: "url(" + REALMS[1].desktopImg + ")" }}
        >
          <div className="relative z-10 max-w-7xl mx-auto w-full flex justify-end">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-[440px] bg-[#0a1520]/90 backdrop-blur-md p-6 sm:p-7 relative shadow-2xl mr-0 lg:mr-4 border border-sky-900/30">
              <div className="absolute top-0 left-0 w-20 h-1.5 bg-gradient-to-r from-orange-400 via-red-500 to-amber-500" />
              <div className="space-y-2.5 pt-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-none">
                  EDUCA ROGSETU & <span className="bg-gradient-to-r from-orange-400 via-red-500 to-amber-500 bg-clip-text text-transparent">WELLNESS CONSULTANT</span>
                </h2>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-slate-400 font-bold">
                  {REALMS[1].category}
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-300 leading-relaxed font-normal pt-1">
                  {REALMS[1].desc}
                </p>
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setActiveModal("five-elements")}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:text-orange-400 transition-colors group cursor-pointer"
                  >
                    <span>READ MORE</span>
                    <span className="w-3.5 h-3.5 bg-orange-500 text-black flex items-center justify-center text-[9px] group-hover:translate-x-1 transition-transform">■</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Billboard 3: Educa Gurukul */}
        <section
          className="relative w-full h-[calc(100vh-56px)] min-h-[480px] max-h-[700px] bg-cover bg-center flex items-center justify-start p-6 sm:p-10 lg:p-14 overflow-hidden"
          style={{ backgroundImage: "url(" + REALMS[2].desktopImg + ")" }}
        >
          <div className="relative z-10 max-w-7xl mx-auto w-full flex justify-start">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-[440px] bg-[#0c0e1e]/90 backdrop-blur-md p-6 sm:p-7 relative shadow-2xl ml-0 lg:ml-4 border border-indigo-900/30">
              <div className="absolute top-0 left-0 w-20 h-1.5 bg-[#fbbf24]" />
              <div className="space-y-2.5 pt-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-none">
                  EDUCA <span className="text-[#38bdf8]">GURUKUL</span>
                </h2>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-slate-400 font-bold">
                  {REALMS[2].category}
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-300 leading-relaxed font-normal pt-1">
                  {REALMS[2].desc}
                </p>
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setActiveModal("gurukul")}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:text-[#38bdf8] transition-colors group cursor-pointer"
                  >
                    <span>READ MORE</span>
                    <span className="w-3.5 h-3.5 bg-[#38bdf8] text-black flex items-center justify-center text-[9px] group-hover:translate-x-1 transition-transform">■</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Billboard 4: Educa Finance */}
        <section
          className="relative w-full h-[calc(100vh-56px)] min-h-[480px] max-h-[700px] bg-cover bg-center flex items-center justify-end p-6 sm:p-10 lg:p-14 overflow-hidden"
          style={{ backgroundImage: "url(" + REALMS[3].desktopImg + ")" }}
        >
          <div className="relative z-10 max-w-7xl mx-auto w-full flex justify-end">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-[440px] bg-[#141210]/90 backdrop-blur-md p-6 sm:p-7 relative shadow-2xl mr-0 lg:mr-4 border border-amber-900/25">
              <div className="absolute top-0 left-0 w-20 h-1.5 bg-[#fbbf24]" />
              <div className="space-y-2.5 pt-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-none">
                  EDUCA <span className="text-[#fbbf24]">FINANCE</span>
                </h2>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-slate-400 font-bold">
                  {REALMS[3].category}
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-300 leading-relaxed font-normal pt-1">
                  {REALMS[3].desc}
                </p>
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setActiveModal("fintech")}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:text-[#fbbf24] transition-colors group cursor-pointer"
                  >
                    <span>READ MORE</span>
                    <span className="w-3.5 h-3.5 bg-[#fbbf24] text-black flex items-center justify-center text-[9px] group-hover:translate-x-1 transition-transform">■</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Global Footer Section */}
        <footer className="bg-[#080808] px-8 py-10 text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-7 border-[2.5px] border-[#fbbf24] flex items-center justify-center bg-transparent rounded-[1px]" />
              <div>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-white">EDUCA VEDA</span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Ayurvedic Sovereignty & Clinical Excellence</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-sans">
              <button onClick={handleShare} className="hover:text-white transition-colors cursor-pointer">Share App</button>
              <span>•</span>
              <button onClick={handleDownloadApp} className="hover:text-white transition-colors cursor-pointer">Download App</button>
              <span>•</span>
              <button onClick={() => setPolicyModal("terms")} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
              <span>•</span>
              <button onClick={() => setPolicyModal("privacy")} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
              <span>•</span>
              <button onClick={() => setPolicyModal("disclaimer")} className="hover:text-white transition-colors cursor-pointer">Disclaimer</button>
              <span>•</span>
              <button onClick={() => setPolicyModal("refund")} className="hover:text-white transition-colors cursor-pointer">Refunds</button>
            </div>

            <div className="text-xs text-slate-500 font-sans">
              © 2026 EDUCA VEDA
            </div>
          </div>
        </footer>
      </div>

      {/* Desktop Modal Overlays for Read More */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-lg w-full bg-[#141414] p-6 rounded-2xl shadow-2xl space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-[#fbbf24] uppercase">
              {currentRealm.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentRealm.intro}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentRealm.story1}
            </p>
            <button
              onClick={() => {
                setActiveModal(null);
                const target = currentRealm.pageTarget;
                safeSetPage(target === "ppc-wallet" ? (loggedIn ? "ppc-wallet" : "login") : target);
              }}
              className="w-full py-2.5 bg-white text-black font-bold text-xs uppercase rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {currentRealm.cta}
            </button>
          </div>
        </div>
      )}

      {/* Policy & Terms Modal Overlay */}
      {policyModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-lg w-full bg-[#121212] p-6 rounded-3xl shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setPolicyModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center text-sm cursor-pointer"
            >
              ✕
            </button>

            {policyModal === "terms" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#fbbf24] font-black text-base uppercase">
                  <span>📜</span>
                  <h4>Terms of Service</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Welcome to EDUCA VEDA. By accessing our platform, products, botanical formulations, and Gurukul educational services, you agree to abide by these terms.
                </p>
              </div>
            )}

            {policyModal === "privacy" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#fbbf24] font-black text-base uppercase">
                  <span>🔒</span>
                  <h4>Privacy Policy</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  EDUCA VEDA safeguards your privacy with 256-bit encryption. We never sell or distribute your personal wellness, telemetry, or transaction records to third parties.
                </p>
              </div>
            )}

            {policyModal === "disclaimer" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#fbbf24] font-black text-base uppercase">
                  <span>⚖️</span>
                  <h4>Ayurvedic & Medical Disclaimer</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The information and formulations provided on EDUCA VEDA are grounded in classical Ayurvedic lineage and modern AYUSH research.
                </p>
              </div>
            )}

            {policyModal === "refund" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#fbbf24] font-black text-base uppercase">
                  <span>📦</span>
                  <h4>Shipping & Refund Policy</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All physical rasayanas and herbal packages are shipped via temperature-controlled express logistics.
                </p>
              </div>
            )}

            <button
              onClick={() => setPolicyModal(null)}
              className="w-full mt-4 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              I UNDERSTAND
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
