import React, { useState } from "react"
import EducaLogo from "../components/EducaLogo"
import {
  ShoppingBag,
  CreditCard,
  GraduationCap,
  Stethoscope,
  LogIn,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Search
} from "lucide-react"

export default function Educaveda({ setPage }) {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      q: "Kya Educaveda aur Edu Veda ek hi hain? Kya 'edcuaveda' aapki hi site hai?",
      a: "Educaveda (EDUCA VEDA) hamara registered healthcare ecosystem hai jiska headoffice Jhalwa, Prayagraj me sthit hai. Typing me aksar log 'educaveda' ko galti se 'edcuaveda' (c aur u swap) likh dete hain. Agar Google ne autocorrect karke 'Showing results for eduveda' ya Anya websites dikhaye, to dhyan dein ki authentic aur verified portal yahi hai (https://educaveda.vercel.app)."
    },
    {
      q: "Educaveda portal par kaun-kaun si suvidhayein uplabdh hain?",
      a: "Educaveda par 4 pramukh vibhag uplabdh hain: 1. Educaveda Store (Classical Ayurvedic Dawaiyan jaise Sugar, Period pain, BP, Dant rog, Shilajit), 2. Educaveda Fintech (12% Interest Bachat Khata, Instant micro loans, Royalty wallet), 3. Educaveda Gurukul Institute (Naturopathy & Ayurveda diploma, Rogsetu Nadi Parikshan training), aur 4. Rogsetu Ayurvedic Clinic Prayagraj."
    },
    {
      q: "Educaveda Store se authentic Ayurvedic dawaiyan kaise order karein?",
      a: "Aap upar diye gaye 'Educaveda Store' button par click karke direct authentic classical Himalayan medicines order kar sakte hain. Pure India me fast doorstep delivery uplabdh hai."
    },
    {
      q: "Educaveda Fintech kya hai aur iska official link kya hai?",
      a: "Educaveda Fintech hamara digital finance division hai jahan 12% annual interest savings account, ₹199 instant recharge loans, bike loans evam direct seller royalty wallet pradan kiya jata hai. Iska direct link https://educafintech.vercel.app hai."
    },
    {
      q: "Educaveda Institute & Gurukul me admission kaise lein?",
      a: "Educaveda Institute me AYUSH certified Naturopathy (WCNA) aur Ayurveda pulse diagnosis clinical diploma ke liye https://lccedu.vercel.app par apply karein ya hamare helpline 063066 67653 par call karein."
    },
    {
      q: "Educaveda ka head office aur clinic kahan hai?",
      a: "Educaveda ka registered center Shambhunath Road, Kabir Nagar, Devprayagam Colony, Jhalwa, Mubarkpur Kotwa, Prayagraj, Uttar Pradesh - 211015 me sthit hai."
    }
  ]

  return (
    <div className="min-h-screen text-slate-100 py-6 sm:py-10 px-3 sm:px-6 max-w-5xl mx-auto">
      {/* ── Verified Entity Badge ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/80 via-black to-amber-950/70 border border-emerald-500/30 rounded-2xl p-4 mb-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <EducaLogo size={36} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Verified Brand Entity</span>
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white tracking-wide">Educaveda (EDUCA VEDA) Enterprise Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
          <MapPin size={13} className="text-amber-400" />
          <span>Prayagraj Hub, India</span>
        </div>
      </div>

      {/* ── Hero Heading for Search Engines & Mobile Users ── */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles size={13} />
          <span>Official Educaveda Landing Page</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Educaveda — Official Store, Fintech &amp; Institute
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
          Welcome to the official verified destination of <strong className="text-emerald-400 font-bold">Educaveda</strong>.
          Ayurvedic medicines, high-yield fintech royalty earnings, Ayush clinical training, and Rogsetu Nadi Parikshan.
        </p>

        {/* ── Mobile Google Spellcheck Notice ── */}
        <div className="mt-5 p-3.5 max-w-xl mx-auto rounded-xl bg-blue-950/40 border border-blue-500/30 text-left flex items-start gap-3">
          <Search size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200 leading-relaxed font-sans">
            <strong className="text-white font-semibold">iPhone &amp; Android Search Notice:</strong> Agar aapne galti se <em>edcuaveda</em> ya <em>educaveda</em> search kiya aur Google ne <em>"Showing results for eduveda"</em> ya <em>"edu veda"</em> dikhaya, to dhyan dein ki <strong>Educaveda (educaveda.vercel.app)</strong> ka verified official portal yahi hai.
          </p>
        </div>
      </header>

      {/* ── 4 Main Portals / Services Grid ── */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-6 flex items-center gap-2">
          <span>Educaveda Ecosystem Pillars</span>
          <span className="text-xs font-mono font-normal text-slate-400">(All 4 Divisions)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Educaveda Store */}
          <div className="bg-stone-900/90 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_0_24px_rgba(16,185,129,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShoppingBag size={22} />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  E-Commerce Store
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Educaveda Ayurvedic Store</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Shop classical Himalayan formulations with proven results: Madhumeha (Sugar/Diabetes), Shecurevedic (Period cramps &amp; PCOD), Dant Suraksha (Toothache &amp; Pyorrhea), Liv-Amrit (Fatty Liver), and Pure Himalayan Shilajit Resin.
              </p>
            </div>
            <button
              onClick={() => setPage("store")}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>Explore Educaveda Store</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Educaveda Fintech */}
          <div className="bg-stone-900/90 border border-white/10 rounded-2xl p-5 hover:border-amber-500/40 transition-all duration-300 hover:shadow-[0_0_24px_rgba(245,158,11,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <CreditCard size={22} />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  Finance Division
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Educaveda Fintech &amp; Royalty</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Official finance portal offering India's 12% annual interest savings account, instant ₹199 micro-loans, student fee credit, bike loans without CIBIL, and real-time distributor royalty wallet.
              </p>
            </div>
            <a
              href="https://educafintech.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Visit Educaveda Fintech</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Card 3: Educaveda Institute & Gurukul */}
          <div className="bg-stone-900/90 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <GraduationCap size={22} />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  Education &amp; Training
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Educaveda Institute &amp; Gurukul</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Professional clinical certification courses including Naturopathy &amp; Ayurveda (WCNA) and Wealth Consultancy (WCFM). Includes hands-on Rogsetu Nadi Parikshan pulse diagnosis training.
              </p>
            </div>
            <a
              href="https://lccedu.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Visit Educaveda Institute</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Card 4: Rogsetu Clinic & Member Login */}
          <div className="bg-stone-900/90 border border-white/10 rounded-2xl p-5 hover:border-rose-500/40 transition-all duration-300 hover:shadow-[0_0_24px_rgba(244,63,94,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Stethoscope size={22} />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                  Clinic &amp; Portal
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Rogsetu Clinic &amp; Member Login</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Visit our physical Rogsetu Nadi Parikshan clinic in Jhalwa, Prayagraj, or login to your Educaveda partner dashboard, order tracking, and royalty statement.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPage("services")}
                className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10"
              >
                <span>Rogsetu Clinic</span>
              </button>
              <button
                onClick={() => setPage("login")}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <LogIn size={14} />
                <span>Member Login</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Detailed Brand Story: What is Educaveda? ── */}
      <section className="bg-stone-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 mb-12">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-4">
          Educaveda Kya Hai? (About Educaveda)
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          <p>
            <strong className="text-white font-bold">Educaveda</strong> (registered as EDUCA-VEDA) ek vishal bharatiya healthcare aur financial ecosystem hai jiska sankalp <em>"Results Not Promises"</em> hai. Iske antargat hum pure Himalayan classical Ayurvedic dawaiyon se lekar zero-cibil micro-financing aur certified Ayush education pradan karte hain.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>100% Classical Ayurveda:</strong> Sugar, BP, Period pain, aur Rogsetu Nadi Parikshan ke authentic upchar.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Educaveda Fintech:</strong> 12% Interest savings, ₹199 micro credit aur distributor royalty wallet.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Educaveda Gurukul:</strong> AYUSH Naturopathy evam pulse diagnosis diploma courses.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Direct Seller Support:</strong> Zero investment se judkar swasthya aur royalty aamdani kamayein.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Educaveda FAQs Section ── */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-6 flex items-center gap-2">
          <HelpCircle size={22} className="text-amber-400" />
          <span>Educaveda Frequently Asked Questions (FAQ)</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-stone-900/80 border border-white/10 rounded-xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-stone-100 hover:text-emerald-400 cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={16} className="shrink-0 text-emerald-400" /> : <ChevronDown size={16} className="shrink-0 text-slate-400" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-300 font-sans border-t border-white/5 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Location & Direct Contact Footer ── */}
      <footer className="bg-black/80 border border-white/10 rounded-2xl p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <EducaLogo size={24} />
            <span className="font-black text-white text-sm tracking-wider uppercase">Educaveda (EDUCA VEDA)</span>
          </div>
          <p className="text-xs text-slate-400 font-sans flex items-center justify-center sm:justify-start gap-1.5 mb-1">
            <MapPin size={13} className="text-amber-400 shrink-0" />
            <span>Shambhunath Road, Kabir Nagar, Devprayagam Colony, Jhalwa, Prayagraj - 211015</span>
          </p>
          <p className="text-xs text-slate-400 font-sans flex items-center justify-center sm:justify-start gap-1.5">
            <Phone size={13} className="text-emerald-400 shrink-0" />
            <span>Direct Helpline: 063066 67653 / +91-8303196998</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setPage("store")}
            className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
          >
            Go to Store
          </button>
          <button
            onClick={() => setPage("home")}
            className="py-2 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs cursor-pointer border border-white/10"
          >
            Home Portal
          </button>
        </div>
      </footer>
    </div>
  )
}
