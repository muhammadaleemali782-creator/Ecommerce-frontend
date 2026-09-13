import React, { useState } from "react";

export const TOP_10_ENERGY_MEDICINES = [
  {
    rank: 1,
    name: "Pure Himalayan Shilajit Gold Resin",
    tagline: "Supreme ATP Energy & Stamina Booster",
    active: "80%+ Fulvic Acid · 84+ Ionic Trace Minerals",
    benefits: "Directly fuels mitochondrial ATP production, ends physical exhaustion, and accelerates deep cellular recovery.",
    idealFor: "Chronic fatigue, low physical stamina, gym performance & vigor",
    dosage: "Pea-sized resin (300-500mg) dissolved in warm milk or water daily",
    badge: "Most Popular #1",
    accent: "from-amber-500 to-yellow-600",
    icon: "⚡"
  },
  {
    rank: 2,
    name: "Ashwagandha KSM-66 Vitality Rasayana",
    tagline: "Adaptogenic Cortisol Reducer & Muscle Strength",
    active: "High-concentration Withanolides & Alkaloids",
    benefits: "Combats adrenal burnout, normalizes stress hormones, strengthens neuromuscular pathways, and provides calm, sustained energy.",
    idealFor: "Workplace stress, burnout, mental fatigue, muscle weakness",
    dosage: "1-2 capsules or 3g churna twice daily with warm water",
    badge: "Ayush Certified",
    accent: "from-emerald-500 to-teal-600",
    icon: "🌿"
  },
  {
    rank: 3,
    name: "Safed Musli & Kaunch Beej Compound",
    tagline: "Dhatu Poshan & Physical Endurance Rebuilder",
    active: "Natural L-Dopa, Saponins & Glycosides",
    benefits: "Nourishes the deeper 7 Dhatus, promotes lean tissue repair, restores natural vigor, and builds long-lasting athletic stamina.",
    idealFor: "Deep physical weakness, post-illness debility, endurance",
    dosage: "1 teaspoonful with lukewarm milk before bedtime",
    badge: "Strength & Vigor",
    accent: "from-violet-500 to-purple-600",
    icon: "💪"
  },
  {
    rank: 4,
    name: "Gokshura Rasayana",
    tagline: "Natural Athletic Stamina & Kidney Vitalizer",
    active: "Tribulus Terrestris Bioactive Saponins",
    benefits: "Enhances oxygen uptake, promotes natural free energy pathways, and purifies urinary and metabolic channels.",
    idealFor: "Athletes, sports endurance, vitality, and metabolic health",
    dosage: "500mg twice daily with meals",
    badge: "100% Herbal",
    accent: "from-sky-500 to-blue-600",
    icon: "🏃"
  },
  {
    rank: 5,
    name: "Chyawanprash Supreme Rasayana",
    tagline: "Wild Amla & 45+ Himalayan Herbs for Immunity",
    active: "Organic Emblica Officinalis (Amla) & Rasayanas",
    benefits: "The foundational Ayurvedic daily tonic. Fortifies respiratory wellness, builds cellular Ojas, and sustains day-long vitality.",
    idealFor: "Whole-family daily vitality, seasonal immunity, low stamina",
    dosage: "1 tablespoonful twice daily for all ages",
    badge: "Daily Essential",
    accent: "from-amber-600 to-orange-600",
    icon: "🍯"
  },
  {
    rank: 6,
    name: "Swarna Bhasma Rejuvenator",
    tagline: "Deep Cellular Ojas & Rapid Vitalization",
    active: "24K Elemental Purified Gold Bhasma",
    benefits: "The sovereign remedy of classical Ayurveda. Rapid micro-circulatory revitalization, heart strength, and anti-aging cell protection.",
    idealFor: "Severe exhaustion, age-related vitality drop, convalescence",
    dosage: "Under Vaidya consultation or as prescribed on formulation",
    badge: "Sovereign Gold",
    accent: "from-yellow-400 to-amber-500",
    icon: "👑"
  },
  {
    rank: 7,
    name: "Shatavari Rasayana",
    tagline: "Cellular Hydration & Hormonal Balance",
    active: "Shatavarin Saponins & Phyto-nutrients",
    benefits: "Deeply cooling and rejuvenating. Restores fluid balance, combats nervous exhaustion, and supports sustainable energy.",
    idealFor: "Hormonal fatigue, burnout, digestive heat, vitality",
    dosage: "3-5g with milk or warm water daily",
    badge: "Balance & Vigor",
    accent: "from-rose-500 to-pink-600",
    icon: "🌸"
  },
  {
    rank: 8,
    name: "Triphala Rasayana (Agni Restorer)",
    tagline: "Digestive Fire Booster & Toxin Detox",
    active: "Haritaki, Bibhitaki & Amalaki in balanced ratio",
    benefits: "Weak digestion (Mandagni) causes sluggish fatigue. Triphala cleanses digestive Ama and multiplies nutrient absorption for natural energy.",
    idealFor: "Sluggishness, post-meal heaviness, bloating, low metabolism",
    dosage: "1 teaspoonful with warm water at bedtime",
    badge: "Agni Deepana",
    accent: "from-teal-500 to-emerald-600",
    icon: "🌱"
  },
  {
    rank: 9,
    name: "Vasant Kusumakar Ras",
    tagline: "Metabolic Strength & Chronic Fatigue Reverser",
    active: "Precious Mineral-Botanical Rasayana",
    benefits: "Indicated for deep metabolic exhaustion. Regulates cellular glucose metabolism and recharges physical vigor.",
    idealFor: "Chronic long-term weakness, metabolic strain, physical fatigue",
    dosage: "1 tablet with honey or milk as directed by Vaidya",
    badge: "Clinical Grade",
    accent: "from-indigo-500 to-violet-600",
    icon: "✨"
  },
  {
    rank: 10,
    name: "Brahmi & Shankhpushpi Neuro-Vitalizer",
    tagline: "Mental Alertness & Cognitive Stamina",
    active: "Bacosides A & B, Medhya Bioactives",
    benefits: "Physical energy requires mental drive. Eliminates brain fog, sharpens daily focus, and preserves nervous system endurance under work pressure.",
    idealFor: "Mental fatigue, students, executives, prolonged screen work",
    dosage: "1-2 tablets twice daily with water",
    badge: "Sharp Focus",
    accent: "from-cyan-500 to-blue-600",
    icon: "🧠"
  }
];

const FAQS = [
  {
    q: "Which is the best Ayurvedic medicine for energy and stamina?",
    a: "The most potent Ayurvedic medicines for energy and stamina are Pure Himalayan Shilajit Gold Resin, Ashwagandha KSM-66, and Safed Musli. Unlike synthetic caffeine or energy drinks that trigger adrenaline crashes, these classical Ayurvedic rasayanas nurture cellular ATP energy and replenish natural Ojas with zero side-effects."
  },
  {
    q: "What are the top 10 Ayurvedic medicines for energy?",
    a: "The top 10 Ayurvedic medicines for natural energy and stamina are: 1. Pure Himalayan Shilajit, 2. Ashwagandha Rasayana, 3. Safed Musli & Kaunch Beej, 4. Gokshura Rasayana, 5. Chyawanprash Supreme, 6. Swarna Bhasma Rejuvenator, 7. Shatavari Rasayana, 8. Triphala Rasayana, 9. Vasant Kusumakar Ras, and 10. Brahmi & Shankhpushpi. EDUCA VEDA provides authentic, heavy-metal-tested, AYUSH-certified formulations of these remedies."
  },
  {
    q: "How does EDUCA VEDA Rogsetu Pulse Diagnosis detect causes of fatigue?",
    a: "Through ancient Nadi Parikshan (radial pulse diagnosis), certified Vaidyas analyze the exact balance of your Tridosha (Vata, Pitta, Kapha) and organ vitality without invasive surgeries or toxic laser diagnostics. This reveals whether your low energy stems from Mandagni (sluggish digestive fire), Ama (toxin accumulation), or Ojas depletion."
  },
  {
    q: "Are EDUCA VEDA products safe and free from chemicals or steroids?",
    a: "Yes, 100%. All EDUCA VEDA medicines and wellness rasayanas are crafted strictly according to classical Ayurvedic shastras. They are AYUSH certified, GMP compliant, tested for heavy metals, and free from synthetic chemicals, steroids, or preservatives."
  }
];

export default function Top10AyurvedicEnergy({ setPage }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#080c09] via-[#0d140e] to-[#080808] text-white border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10.5px] font-mono font-bold uppercase tracking-widest">
            ✦ AYURVEDIC VITALITY & STAMINA DIRECTORY
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight font-serif text-white leading-tight">
            Top 10 Ayurvedic Medicines for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400">Natural Energy & Stamina</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Say goodbye to synthetic energy drinks and caffeine crashes. Classical Himalayan Ayurveda harnesses time-tested rasayanas to replenish deep cellular <strong>Ojas</strong>, balance <strong>Tridosha</strong>, and deliver 100% natural, sustainable vitality with zero side effects.
          </p>
        </div>

        {/* Top 10 Ranked Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {TOP_10_ENERGY_MEDICINES.map((item) => (
            <article
              key={item.rank}
              className="p-5 rounded-3xl bg-[#111713]/90 border border-white/[0.08] hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-[0_0_25px_rgba(251,191,36,0.12)]"
            >
              <div className="space-y-3">
                {/* Rank & Badge */}
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-mono font-black text-xs text-amber-300">
                    #{item.rank}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <div className="text-xl mb-1">{item.icon}</div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs font-medium text-emerald-400 mt-0.5">
                    {item.tagline}
                  </p>
                </div>

                {/* Active & Benefits */}
                <div className="text-xs space-y-2 pt-1 text-slate-300 leading-relaxed font-sans">
                  <p>
                    <strong className="text-slate-200">Key Bioactives:</strong> {item.active}
                  </p>
                  <p className="text-slate-400">
                    <strong className="text-slate-300">Action:</strong> {item.benefits}
                  </p>
                  <p className="text-[11px] text-amber-200/90 font-mono">
                    <strong>Ideal For:</strong> {item.idealFor}
                  </p>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  100% Shuddh Jadi Booti
                </span>
                <button
                  onClick={() => setPage && setPage("store")}
                  className="px-3 py-1.5 rounded-xl bg-white text-black hover:bg-amber-400 font-bold text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer group-hover:scale-105 active:scale-95"
                >
                  Explore in Store ↗
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Ayurvedic Energy FAQ Section */}
        <div className="mt-14 p-6 sm:p-10 rounded-3xl bg-[#0e1410] border border-white/[0.08] space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Frequently Asked Questions
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-serif">
              Ayurvedic Energy & Stamina Insights
            </h3>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-white hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-base text-amber-400 shrink-0 font-mono">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/[0.05] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Local Healthcare & Consultation Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-[#101b13] to-teal-950/80 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-emerald-300 uppercase tracking-wider">
              <span>📍</span>
              <span>AYURVEDIC CLINIC & ROGSETU PULSE DIAGNOSIS HUB</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold uppercase text-white font-serif">
              Want a Personalised Energy & Tridosha Assessment?
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              Consult with certified Vaidyas through Rogsetu Nadi Parikshan. Identify root causes of fatigue without surgeries or radiation.
            </p>
            <div className="text-[11px] font-mono text-amber-300/90 pt-1">
              📍 Central Hub: Varanasi, Uttar Pradesh, India · Helpline: <strong>+91-8303196998</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setPage && setPage("services")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs font-mono uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Book Rogsetu Consultation
            </button>
            <a
              href="tel:+918303196998"
              className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white font-bold text-xs font-mono uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer"
            >
              📞 Call Helpline
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
