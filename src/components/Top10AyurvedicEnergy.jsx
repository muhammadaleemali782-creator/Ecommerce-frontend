import React, { useState } from "react";

export const TOP_HEALTH_SOLUTIONS = [
  {
    rank: "🌟",
    name: "Shecurevedic (Period Pain, Cramp Relief & Gynaec Care)",
    tagline: "Special Care for Girls & Women (Ages 15–25+) · 100% Natural",
    active: "Ashoka chhal, Lodhra, Shatavari, Dashamoola, Gynae-Botanicals",
    benefits: "Verified positive relief from severe menstrual cramps, lower belly pain, and irregular blood flow. Saves families ₹5-10 Lakhs spent on harmful allopathic treatments and hormonal pills.",
    idealFor: "Excruciating period pain, menstrual cramps, PCOD/PCOS, hormonal imbalance",
    dosage: "1-2 teaspoonfuls twice daily with lukewarm water during and prior to cycle",
    badge: "Women's Health #1",
    accent: "from-pink-600 to-rose-600",
    icon: "🌸"
  },
  {
    rank: "🩸",
    name: "Madhumeha Sanjeevani (Sugar & Diabetes Care)",
    tagline: "Jad Se Khatam Karein Sugar Dependency · Beta-Cell Revival",
    active: "Gudmar (Sugar Destroyer), Jamun seed, Karela, Vijaysar, Shilajit",
    benefits: "Targets root pancreatic weakness. Stimulates natural insulin sensitivity without allopathic drug side effects.",
    idealFor: "High fasting/post-prandial blood sugar, diabetic fatigue, frequent urination",
    dosage: "1 teaspoonful twice daily before meals with water",
    badge: "Sugar Specialist",
    accent: "from-emerald-600 to-teal-700",
    icon: "🌿"
  },
  {
    rank: "💓",
    name: "Raktachap Nivaran (High Blood Pressure & Heart Care)",
    tagline: "Cardiovascular Health & Arterial Elasticity",
    active: "Sarpagandha, Arjuna bark, Shankhpushpi, Brahmi",
    benefits: "Gently balances blood pressure, ends nervous hypertension, and strengthens heart muscles without lifelong chemical dependency.",
    idealFor: "High blood pressure, palpitations, cardiovascular stress, headaches",
    dosage: "As directed by Vaidya or 1 tablet twice daily with water",
    badge: "Heart Health",
    accent: "from-red-600 to-rose-700",
    icon: "❤️"
  },
  {
    rank: "🦷",
    name: "Shuddh Dant Suraksha (Daat ki Dawa & Pyorrhea Cure)",
    tagline: "Toothache, Bleeding Gums & Sensitivity Relief",
    active: "Laung (Clove), Babool, Akarkara, Neem, Karpura",
    benefits: "Instant and long-lasting relief from excruciating toothache, pyorrhea, decaying enamel, and bleeding gums.",
    idealFor: "Toothache, gum bleeding, tooth sensitivity to hot/cold, pyorrhea",
    dosage: "Massage gently on gums and teeth twice daily before rinsing",
    badge: "Dental Care",
    accent: "from-amber-600 to-yellow-600",
    icon: "🦷"
  },
  {
    rank: "1",
    name: "Pure Himalayan Shilajit Gold Resin",
    tagline: "Supreme ATP Energy & Stamina Booster",
    active: "80%+ Fulvic Acid · 84+ Ionic Trace Minerals",
    benefits: "Fuels mitochondrial ATP cellular energy, ends chronic physical fatigue, and boosts endurance.",
    idealFor: "Chronic fatigue, gym performance, stamina and male/female vigor",
    dosage: "Pea-sized resin (300-500mg) dissolved in warm milk or water daily",
    badge: "Energy #1",
    accent: "from-amber-500 to-yellow-600",
    icon: "⚡"
  },
  {
    rank: "2",
    name: "Ashwagandha KSM-66 Vitality Rasayana",
    tagline: "Adaptogenic Cortisol Reducer & Muscle Strength",
    active: "Withanolides & Bioactive Root Alkaloids",
    benefits: "Combats adrenal burnout, relieves stress, and gives calm, all-day stamina.",
    idealFor: "Stress, anxiety, muscle weakness, mental exhaustion",
    dosage: "1-2 capsules twice daily with warm milk or water",
    badge: "Adaptogen",
    accent: "from-teal-600 to-emerald-700",
    icon: "🌱"
  }
];

const FAQS = [
  {
    q: "How does Shecurevedic help girls and women with period pain and cramps?",
    a: "Young girls and women (especially between ages 15–25) frequently suffer from severe menstrual cramps, heavy bleeding, and PCOD. Often families spend ₹5–10 Lakhs in hospitals on allopathic treatments and hormonal injections that cause harmful side effects, weight gain, and secondary diseases. Shecurevedic by EDUCA VEDA is a 100% natural Ayurvedic formulation that relaxes uterine muscles, balances hormones, and normalizes blood flow. Patients who have used it report 100% verified positive relief from pain, nausea, and cramps."
  },
  {
    q: "Can EDUCA VEDA cure Diabetes (Sugar) and High BP permanently from the root?",
    a: "Yes. Allopathic medicines only temporarily mask blood sugar and blood pressure, making you dependent on tablets for life. EDUCA VEDA uses authentic Ayurvedic herbs like Gudmar, Jamun, Vijaysar, Shilajit, Arjuna bark, and Sarpagandha to naturally revive pancreatic beta-cells and restore vascular health, resolving Sugar and BP from the root without side effects."
  },
  {
    q: "Do you have an effective medicine for toothache and bleeding gums (Daat ki Dawa)?",
    a: "Yes. EDUCA VEDA Dant Suraksha is formulated with pure Clove (Laung), Babool, Akarkara, and Neem. It provides rapid relief from severe toothache, pyorrhea, sensitivity, and bleeding gums while strengthening teeth from the roots."
  },
  {
    q: "Where is EDUCA VEDA clinic located in Prayagraj?",
    a: "Our clinic and central hub is located at: Vihar Gali No. 3, Utthan Road, Jhalwa, Prayagraj, Uttar Pradesh - 211012. You can consult certified Vaidyas in person or call/WhatsApp our official helpline at +91-8303196998."
  }
];

export default function Top10AyurvedicEnergy({ setPage }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#080c09] via-[#0d140e] to-[#080808] text-white border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10.5px] font-mono font-bold uppercase tracking-widest">
            ✦ AYURVEDIC HEALTHCARE DIRECTORY · JHALWA, PRAYAGRAJ
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight font-serif text-white leading-tight">
            EDUCA VEDA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400">Ayurvedic Specialties & Medicine Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Bina side-effect ke jad se ilaaj. Angrezi dawa par ₹5-10 Lakh khrcha karne aur nayi bimariyan paida karne se bachein. <strong>Sugar (Diabetes)</strong>, <strong>High BP</strong>, ladkiyo ke period dard ke liye <strong>Shecurevedic</strong>, <strong>Daat ki dawa</strong>, aur <strong>Top Energy Rasayanas</strong>.
          </p>
        </div>

        {/* Featured Medicine & Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {TOP_HEALTH_SOLUTIONS.map((item, idx) => (
            <article
              key={idx}
              className="p-5 rounded-3xl bg-[#111713]/90 border border-white/[0.08] hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-[0_0_25px_rgba(251,191,36,0.12)]"
            >
              <div className="space-y-3">
                {/* Rank & Badge */}
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-mono font-black text-xs text-amber-300">
                    {item.rank}
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
                    <strong className="text-slate-200">Key Formulation:</strong> {item.active}
                  </p>
                  <p className="text-slate-400">
                    <strong className="text-slate-300">Ayurvedic Action:</strong> {item.benefits}
                  </p>
                  <p className="text-[11px] text-amber-200/90 font-mono">
                    <strong>Dosage:</strong> {item.dosage}
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

        {/* Ayurvedic Health FAQ Section */}
        <div className="mt-14 p-6 sm:p-10 rounded-3xl bg-[#0e1410] border border-white/[0.08] space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Frequently Asked Questions (FAQ)
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-serif">
              Root-Cause Healing Insights & Doctor Advice
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

        {/* Local Healthcare Clinic Banner with Exact Prayagraj Address */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-[#101b13] to-teal-950/80 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-emerald-300 uppercase tracking-wider">
              <span>📍</span>
              <span>CENTRAL CLINIC & HEALTHCARE HUB · PRAYAGRAJ</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold uppercase text-white font-serif">
              Visit EDUCA VEDA Clinic or Consult Online
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              Nadi Parikshan, Diabetes, High BP, Shecurevedic period care, and herbal consultations with certified Vaidyas.
            </p>
            <div className="text-[11.5px] font-mono text-amber-300/95 pt-1.5 leading-relaxed">
              📍 <strong>Address:</strong> VIHAR GALI NO. 3, UTTHAN ROAD, JHALWA, PRAYAGRAJ, UTTAR PRADESH - 211012<br />
              📞 <strong>Helpline / WhatsApp:</strong> +91-8303196998
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
