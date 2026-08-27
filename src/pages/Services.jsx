import React, { useState } from "react"
import { useAuth } from "../context/AuthContext"

const IMAGES = {
  ayurvedCare: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1000&q=80",
  panchakarma: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
  diagnostics: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80",
  geneticScreen: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80",
  vedicAcademy: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80",
  botanicalLab: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80",
  swissBanking: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
  fintechMerchant: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1000&q=80",
};

export default function Services({ setPage }) {
  const { loggedIn } = useAuth() || {};
  const [selectedPillar, setSelectedPillar] = useState("all");
  const [bookingModal, setBookingModal] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", date: "", notes: "" });

  const safeSetPage = typeof setPage === "function" ? setPage : () => {};

  const services = [
    {
      id: "srv-1",
      pillar: "ayurved",
      title: "Vedic Pulse Diagnosis & Nadi Parikshan",
      subtitle: "Personalized Tridosha Mapping by Certified Vaidyas",
      desc: "Complete biological constitution analysis, pulse biomarker readings, custom herbal formulation mapping, and lifestyle guidance.",
      price: "₹1,499",
      turnaround: "45-Minute Clinical Session",
      badge: "Vaidya Verified",
      icon: "🌿",
      image: IMAGES.ayurvedCare,
      features: [
        "In-depth Vata/Pitta/Kapha ratio evaluation",
        "Personalized herbal decoction regimen",
        "Custom seasonal diet & circadian protocol",
        "Direct chat with Ayurvedic Doctor for 30 days",
      ],
    },
    {
      id: "srv-2",
      pillar: "ayurved",
      title: "Panchakarma Detox & Cellular Rejuvenation",
      subtitle: "Authentic 7-Stage Himalayan Detoxification Protocol",
      desc: "Traditional therapy eliminating deep-seated toxins (Ama) through Abhyanga, Shirodhara, Swedana, and Rasayana therapy.",
      price: "₹8,999",
      turnaround: "7-Day Immersion Package",
      badge: "Hospital Grade",
      icon: "✨",
      image: IMAGES.panchakarma,
      features: [
        "Full-body herbal oil Abhyanga massage",
        "Therapeutic medicated steam Swedana",
        "Shirodhara nervous system calming",
        "Cellular Rasayana restorative herbs",
      ],
    },
    {
      id: "srv-3",
      pillar: "rogsetu",
      title: "RogSetu 72+ Biomarker Preventive Health Shield",
      subtitle: "Comprehensive Molecular & Metabolic Screening",
      desc: "Comprehensive diagnostic suite covering complete hemogram, lipid subfractions, liver, renal, thyroid, HbA1c, and inflammation indexes.",
      price: "₹2,499",
      turnaround: "Same-Day Doorstep Pickup",
      badge: "NABL Accredited",
      icon: "🩺",
      image: IMAGES.diagnostics,
      features: [
        "Doorstep sterile phlebotomist blood collection",
        "Ultra-sensitive hs-CRP & cardiac risk markers",
        "Digital AI Health Passport with trends",
        "1-on-1 Physician debrief phone consultation",
      ],
    },
    {
      id: "srv-4",
      pillar: "rogsetu",
      title: "Advanced Genomic & Pharmacogenetic Scan",
      subtitle: "Precision DNA Longevity & Drug Interaction Mapping",
      desc: "DNA-based biomarker analysis revealing nutritional absorption deficiencies, metabolic pathways, and herb-drug compatibility.",
      price: "₹12,499",
      turnaround: "7-10 Days Comprehensive Report",
      badge: "Molecular Precision",
      icon: "🧬",
      image: IMAGES.geneticScreen,
      features: [
        "Non-invasive saliva collection kit sent to home",
        "120+ genetic predisposition insights",
        "Customized Ayurvedic herb matching based on DNA",
        "Genetic counselor Consultation included",
      ],
    },
    {
      id: "srv-5",
      pillar: "education",
      title: "Accredited Diploma in Vedic Pharmacology (Dravyaguna)",
      subtitle: "Master the Science of 250+ Himalayan Medicinal Plants",
      desc: "Comprehensive 6-month clinical masterclass covering classical Ayurvedic texts, phytochemistry, extraction methods, and compounding.",
      price: "₹14,999",
      turnaround: "6-Month Flexible Virtual Academy",
      badge: "AYUSH Recognized",
      icon: "🎓",
      image: IMAGES.vedicAcademy,
      features: [
        "120+ hours of video masterclasses & live Q&A",
        "Virtual Herbarium 3D molecular explorer access",
        "Official verified digital diploma certificate",
        "Alumni scholar network & research access",
      ],
    },
    {
      id: "srv-6",
      pillar: "education",
      title: "Clinical Panchakarma Practitioner Certification",
      subtitle: "Hands-on Clinical Detox & Patient Care Training",
      desc: "Professional qualification for healthcare practitioners, wellness therapists, and doctors looking to integrate authentic Panchakarma.",
      price: "₹19,999",
      turnaround: "3-Month Intensive + 5 Days Lab",
      badge: "Practitioner License",
      icon: "📜",
      image: IMAGES.botanicalLab,
      features: [
        "Step-by-step clinical case study analysis",
        "Safety, contraindications, and emergency care",
        "Formulation compounding practical handbook",
        "Certificate of Clinical Competence",
      ],
    },
    {
      id: "srv-7",
      pillar: "banking",
      title: "Sovereign Merchant Gateway & Liquidity Vault",
      subtitle: "Swiss-Grade Automated Enterprise Commission Ledger",
      desc: "Next-generation fintech infrastructure providing sub-second multi-tier commission distribution, PCI-DSS vaults, and PPC staking.",
      price: "₹4,999",
      turnaround: "Instant Account Provisioning",
      badge: "Swiss Encrypted",
      icon: "🏛️",
      image: IMAGES.swissBanking,
      features: [
        "Sub-second (< 1.2s) commission settlements",
        "256-bit AES cryptographic vault security",
        "Automated compounding PPC token staking",
        "Developer API with webhooks and SDKs",
      ],
    },
    {
      id: "srv-8",
      pillar: "banking",
      title: "PPC Sovereign Liquidity Staking Protocol",
      subtitle: "High-Yield Compounding Community Reserve",
      desc: "Institutional staking program enabling members to lock PPC tokens for guaranteed quarterly reward distributions.",
      price: "Flexible Deposit",
      turnaround: "Live On-Chain Staking",
      badge: "Audited Smart Ledger",
      icon: "💎",
      image: IMAGES.fintechMerchant,
      features: [
        "Up to 18.5% annual compounding rewards",
        "Zero gas or network withdrawal penalties",
        "Daily reward distribution into sovereign wallet",
        "Priority VIP allocation in new product drops",
      ],
    },
  ];

  const filteredServices = selectedPillar === "all"
    ? services
    : services.filter(s => s.pillar === selectedPillar);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) {
      alert("Please provide your name and contact number.");
      return;
    }
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingModal(null);
      setBookingForm({ name: "", phone: "", date: "", notes: "" });
    }, 2500);
  };

  return (
    <div className="space-y-12 pb-20 animate-fade">
      {/* ═══════════════════════════════════════════
          HERO BANNER
      ═══════════════════════════════════════════ */}
      <section className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-14 emerald-glass-panel border border-emerald-500/30 text-center shadow-2xl">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-blue-400/50 text-[11px] font-black text-amber-300 uppercase tracking-widest">
            <span>✨</span>
            <span>CONCIERGE ECOSYSTEM SERVICES</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Tailored Excellence Across All <span className="luxury-gold-gradient-text">4 Portals</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From clinical Nadi Parikshan pulse reading to 72-biomarker RogSetu health checks, certified pharmacology masterclasses, and Swiss-grade banking vaults.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PILLAR FILTER TABS
      ═══════════════════════════════════════════ */}
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        {[
          { id: "all", label: "All Offerings", icon: "✨" },
          { id: "ayurved", label: "Ayurved Healthcare", icon: "🌿" },
          { id: "rogsetu", label: "RogSetu Diagnostics", icon: "🩺" },
          { id: "education", label: "Vedic Academy", icon: "🎓" },
          { id: "banking", label: "Sovereign Banking", icon: "🏛️" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedPillar(tab.id)}
            className={"px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 " + (
              selectedPillar === tab.id
                ? "bg-blue-500 text-slate-950 font-black shadow-lg scale-105 border-2 border-amber-300"
                : "emerald-glass-panel text-slate-300 hover:text-white hover:bg-emerald-950/70"
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          SERVICES MATRIX
      ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredServices.map(srv => (
          <div
            key={srv.id}
            className="emerald-glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-emerald-500/20 hover:border-blue-400/50 transition-all duration-300 shadow-xl group overflow-hidden"
          >
            <div>
              {/* Image & Tag */}
              <div className="relative h-56 rounded-2xl overflow-hidden mb-5 bg-[#021810]">
                <img
                  src={srv.image}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#031911] via-transparent to-transparent opacity-80" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black bg-blue-500 text-slate-950 uppercase tracking-wider shadow">
                  {srv.badge}
                </span>
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl text-xs font-black bg-[#021810]/90 text-amber-300 border border-blue-400/40">
                  {srv.price}
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                {srv.title}
              </h3>
              <p className="text-xs font-bold text-emerald-400 mt-1">{srv.subtitle}</p>
              <p className="text-xs text-slate-300 leading-relaxed mt-2.5 font-medium">{srv.desc}</p>

              {/* Checklist */}
              <div className="space-y-2 pt-4 mt-4 border-t border-emerald-900/60">
                {srv.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 mt-6 border-t border-emerald-900/60 flex items-center justify-between gap-4">
              <div className="text-[11px] text-slate-400 font-medium">
                ⏱ {srv.turnaround}
              </div>
              <button
                onClick={() => setBookingModal(srv)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Book Concierge →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          INSTANT BOOKING MODAL
      ═══════════════════════════════════════════ */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setBookingModal(null)} />
          <div className="relative bg-[#031a12] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-500/40 animate-fade">
            {bookingSuccess ? (
              <div className="text-center py-8 space-y-3">
                <span className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
                  ✓
                </span>
                <h4 className="text-xl font-bold text-white">Booking Confirmed!</h4>
                <p className="text-xs text-slate-300">
                  Our sovereign concierge will connect with you via WhatsApp/Phone within 15 minutes.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-emerald-900/60 mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{bookingModal.icon}</span>
                    <div>
                      <div className="font-bold text-sm text-white">{bookingModal.title}</div>
                      <div className="text-[10px] text-blue-400">{bookingModal.price} • {bookingModal.turnaround}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setBookingModal(null)}
                    className="w-8 h-8 rounded-full bg-emerald-950 text-slate-400 flex items-center justify-center font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Aryan Sharma"
                      value={bookingForm.name}
                      onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#02130c] border border-emerald-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                      Phone Number (WhatsApp Active)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={bookingForm.phone}
                      onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#02130c] border border-emerald-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                      Preferred Date & Time
                    </label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#02130c] border border-emerald-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                      Notes or Health Specifics (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Describe any current health symptoms or requirements..."
                      value={bookingForm.notes}
                      onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#02130c] border border-emerald-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95"
                  >
                    Confirm & Schedule Service →
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
