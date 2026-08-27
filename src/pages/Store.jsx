import { useState, useMemo, useCallback } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"

// Official WCNA Curriculum Books & Master Course Offerings
const WCNA_STORE_PRODUCTS = [
  {
    id: "wcna-master-course-18m",
    title: "WCNA — Master Certification Course",
    category: "Certification Courses",
    price: 24999,
    mrp: 35000,
    rating: 5.0,
    reviews: 540,
    image: "/books/wcna_master_course.jpg",
    tag: "18-MONTH PROGRAM",
    duration: "18 Months + 6 Mo Internship",
    description: "Comprehensive career-focused training in Wellness Consultancy of Naturopathy & Ayurveda. Includes 1:1 mentorship, online notes, clinical case studies, and offline marathon workshops.",
    subjects: [
      "Anatomy & Physiology",
      "Rogshashtra",
      "Principal of Ayurveda",
      "Principal of Naturopathy",
      "Diet & Nutrition",
      "Yoga Science"
    ],
    benefits: "Full consultancy license readiness, 20+ clinical case studies, wellness center setup guidance."
  },
  {
    id: "book-1-wellness-coaching",
    title: "Book 1: Wellness Coaching Introduction",
    category: "Curriculum Books",
    price: 499,
    mrp: 799,
    rating: 4.9,
    reviews: 218,
    image: "/books/book1_wellness_coaching.jpg",
    tag: "BOOK 01",
    duration: "Foundation Module",
    description: "Core principles of wellness coaching, holistic health paradigms, client psychology, and habit transformation frameworks.",
    subjects: ["Holistic Health Principles", "Client Mindset Shifts", "Goal Setting", "Wellness Dimensions"],
    benefits: "Builds fundamental coaching competence and consultation structure."
  },
  {
    id: "book-2-naturopathy-basics",
    title: "Book 2: Naturopathy Basics",
    category: "Curriculum Books",
    price: 549,
    mrp: 849,
    rating: 4.9,
    reviews: 194,
    image: "/books/book2_naturopathy_basics.jpg",
    tag: "BOOK 02",
    duration: "Nature Cure Theory",
    description: "Detailed study of Panchamahabhuta (5 Elements), nature cure therapies, hydrotherapy, mud packs, and natural body detoxification.",
    subjects: ["5 Elements Therapy", "Hydrotherapy", "Mud Therapy", "Fasting & Detoxification"],
    benefits: "Master natural non-invasive healing modalities and vital force activation."
  },
  {
    id: "book-3-ayurveda-basics",
    title: "Book 3: Ayurveda Basics",
    category: "Curriculum Books",
    price: 599,
    mrp: 899,
    rating: 5.0,
    reviews: 312,
    image: "/books/book3_ayurveda_basics.jpg",
    tag: "BOOK 03",
    duration: "Tridosha Science",
    description: "Foundational Ayurveda: Vata, Pitta, Kapha assessment, Sapta Dhatu, Agni (digestive fire), and individual Prakriti diagnostics.",
    subjects: ["Tridosha Analysis", "Dhatu & Mala Science", "Prakriti Assessment", "Agni & Ama Diagnostics"],
    benefits: "Accurately identify body constitutions and underlying root causes of imbalance."
  },
  {
    id: "book-5-client-assessment",
    title: "Book 5: Client Assessment",
    category: "Curriculum Books",
    price: 649,
    mrp: 949,
    rating: 4.8,
    reviews: 165,
    image: "/books/book5_client_assessment.jpg",
    tag: "BOOK 05",
    duration: "Clinical Diagnostic",
    description: "Comprehensive diagnostic framework for patient intake, medical history evaluation, physical signs analysis, and symptom mapping.",
    subjects: ["Health Intake Forms", "Nadi & Tongue Observation", "Vital Marker Analysis", "Lifestyle Stress Auditing"],
    benefits: "Develop systematic, high-accuracy client evaluation workflows."
  },
  {
    id: "book-6-diet-planning",
    title: "Book 6: Diet Planning",
    category: "Curriculum Books",
    price: 599,
    mrp: 899,
    rating: 4.9,
    reviews: 280,
    image: "/books/book6_diet_planning.jpg",
    tag: "BOOK 06",
    duration: "Nutrition Module",
    description: "Scientific and Ayurvedic meal planning: Ahara Vidhi, seasonal nutrition, macronutrient distribution, and disease-specific dietary charts.",
    subjects: ["Ahara Vidhi", "Sattvic Nutrition", "Therapeutic Diet Charts", "Calorie & Micro-nutrient Balance"],
    benefits: "Formulate personalized diet blueprints for sustainable wellness results."
  },
  {
    id: "book-7-lifestyle-coaching",
    title: "Book 7: Lifestyle & Routine Coaching",
    category: "Curriculum Books",
    price: 499,
    mrp: 799,
    rating: 4.9,
    reviews: 175,
    image: "/books/book7_lifestyle_coaching.jpg",
    tag: "BOOK 07",
    duration: "Circadian Science",
    description: "Mastering Dinacharya (daily routine), Ratricharya (night routine), circadian alignment, sleep hygiene, and stress-reduction practices.",
    subjects: ["Dinacharya Protocol", "Circadian Rhythm Biology", "Sleep Architecture", "Stress & Breathwork"],
    benefits: "Guide clients toward frictionless daily routines that prevent chronic illness."
  },
  {
    id: "book-8-managing-diseases",
    title: "Book 8: Managing Common Lifestyle Diseases",
    category: "Clinical Manuals",
    price: 749,
    mrp: 1099,
    rating: 5.0,
    reviews: 420,
    image: "/books/book8_managing_diseases.jpg",
    tag: "BOOK 08",
    duration: "Reversal Protocols",
    description: "Evidence-backed integrative protocols for reversing Type-2 Diabetes, Hypertension, Thyroid disorders, Obesity, and Gut dysbiosis.",
    subjects: ["Metabolic Syndrome", "Hypertension Protocols", "Thyroid Management", "Gut & Acid Reflux Protocols"],
    benefits: "Practical case-tested reversal guidelines for the most common modern conditions."
  },
  {
    id: "book-9-herbs-supplements",
    title: "Book 9: Herbs & Supplements Guidance",
    category: "Clinical Manuals",
    price: 699,
    mrp: 999,
    rating: 4.9,
    reviews: 230,
    image: "/books/book9_herbs_supplements.jpg",
    tag: "BOOK 09",
    duration: "Botanical Materia",
    description: "Comprehensive handbook of medicinal herbs, classical formulations, safe dosage administration, contraindications, and supplement synergies.",
    subjects: ["Classical Formulations", "Herb Synergy & Anupana", "Dosage & Toxicity Safety", "Modern Supplement Pairings"],
    benefits: "Safely recommend therapeutic herbal solutions with total clinical confidence."
  },
  {
    id: "book-10-client-communication",
    title: "Book 10: Client Communication & Coaching Skills",
    category: "Clinical Manuals",
    price: 599,
    mrp: 899,
    rating: 5.0,
    reviews: 285,
    image: "/books/book10_client_communication.jpg",
    tag: "BOOK 10",
    duration: "Practice Setup",
    description: "Professional consultancy development: counseling psychology, handling client objections, structured follow-ups, and setting up a wellness center.",
    subjects: ["Counseling Psychology", "Objection Handling", "Client Retention System", "Wellness Center Setup"],
    benefits: "Turn clinical knowledge into a thriving, high-impact professional consultancy practice."
  }
]

export default function Store({ setPage }) {
  const { isDark } = useTheme()
  const { products = [], addToCart, cart = [] } = useStore() || {}
  const { user } = useAuth() || {}

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [selectedBookModal, setSelectedBookModal] = useState(null)
  const [addedToast, setAddedToast] = useState(null)

  // Merge database products with curated WCNA items
  const allStoreProducts = useMemo(() => {
    if (products && products.length > 0) {
      // Check if db products already have WCNA items
      const isWcna = products.some(p => (p.title || "").includes("WCNA") || (p.title || "").includes("Book"));
      if (isWcna) return products;
    }
    return WCNA_STORE_PRODUCTS;
  }, [products]);

  const categories = useMemo(() => {
    return [
      { id: "all", label: "All Curriculum & Books", count: allStoreProducts.length },
      { id: "Certification Courses", label: "Master Certification", count: allStoreProducts.filter(p => p.category === "Certification Courses").length },
      { id: "Curriculum Books", label: "Curriculum Books (01 - 07)", count: allStoreProducts.filter(p => p.category === "Curriculum Books").length },
      { id: "Clinical Manuals", label: "Clinical & Coaching (08 - 10)", count: allStoreProducts.filter(p => p.category === "Clinical Manuals").length }
    ]
  }, [allStoreProducts]);

  const filteredProducts = useMemo(() => {
    return allStoreProducts
      .filter(product => {
        const matchesCategory = category === "all" || product.category === category
        const matchesSearch = !search ||
          (product.title && product.title.toLowerCase().includes(search.toLowerCase())) ||
          (product.description && product.description.toLowerCase().includes(search.toLowerCase())) ||
          (product.tag && product.tag.toLowerCase().includes(search.toLowerCase()))
        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price
        if (sortBy === "price-high") return b.price - a.price
        if (sortBy === "reviews") return (b.reviews || 0) - (a.reviews || 0)
        return (b.rating || 5) - (a.rating || 5)
      })
  }, [allStoreProducts, category, search, sortBy]);

  const handleAddToCart = useCallback((product) => {
    if (addToCart) {
      addToCart(product)
    }
    setAddedToast(product.title)
    setTimeout(() => setAddedToast(null), 2400)
  }, [addToCart]);

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} font-sans antialiased`}>
      
      {/* Toast */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <span>✓ Added to Cart:</span>
          <strong>{addedToast}</strong>
        </div>
      )}

      {/* Hero Banner (Poster Style) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span>🌿 EDUCA VEDA INSTITUTE OF CONSULTANCY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              WCNA — Wellness Consultancy of <span className="text-emerald-400">Naturopathy & Ayurveda</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Official 18-Month Career Focused Training Course (Theory + Practical) + 6 Month Internship. Learn, Heal &amp; Inspire a Better Future with comprehensive study manuals and direct faculty mentorship.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold">
                ✓ 10 Comprehensive Books
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold">
                ✓ 20+ Clinical Case Studies
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold">
                ✓ 24x7 Faculty Support
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                const flagship = WCNA_STORE_PRODUCTS.find(p => p.id === "wcna-master-course-18m")
                if (flagship) setSelectedBookModal(flagship)
              }}
              className="px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all text-center"
            >
              🎓 View Master Course ➔
            </button>
            <a
              href="#store-grid"
              className="px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm transition-all text-center"
            >
              📚 Browse Books
            </a>
          </div>
        </div>
      </section>

      {/* Main Store Catalog */}
      <main id="store-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Controls Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  category === cat.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : isDark
                    ? "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search books & subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full px-4 py-2 pl-9 text-xs rounded-full border outline-none transition-all ${
                  isDark
                    ? "bg-slate-900 border-slate-800 text-white focus:border-emerald-500"
                    : "bg-white border-slate-200 text-slate-900 focus:border-emerald-500"
                }`}
              />
              <span className="absolute left-3 top-2.5 text-xs opacity-50">🔍</span>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 text-xs rounded-full border outline-none font-semibold ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-white"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <span className="text-4xl mb-2 block">📚</span>
            <h3 className="text-lg font-bold">No books match your filter</h3>
            <p className="text-sm text-slate-500 mt-1">Try clearing search or choosing another category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const isFlagship = product.category === "Certification Courses"

              return (
                <div
                  key={product.id || product._id}
                  className={`group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 ${
                    isFlagship ? "sm:col-span-2 lg:col-span-2 bg-gradient-to-b from-slate-900 to-slate-950 text-white border border-emerald-500/40 shadow-xl" :
                    isDark
                      ? "bg-slate-900 border border-slate-800 hover:border-slate-700"
                      : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  {/* Book Cover Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-950 cursor-pointer" onClick={() => setSelectedBookModal(product)}>
                    <img
                      src={product.image || "/books/wcna_master_course.jpg"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = "/books/wcna_master_course.jpg" }}
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur text-emerald-300 font-extrabold text-[10px] tracking-wider uppercase border border-emerald-400/30">
                        {product.tag || "OFFICIAL MATERIAL"}
                      </span>
                    </div>
                    {product.mrp && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">
                        SAVE {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Details Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>⭐ {product.rating || "5.0"} ({product.reviews || 120})</span>
                        <span>{product.duration || "Study Manual"}</span>
                      </div>
                      <h3 className={`font-extrabold text-base line-clamp-2 ${isFlagship ? "text-white" : isDark ? "text-white" : "text-slate-900"}`}>
                        {product.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Buy Actions */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-emerald-500">
                            ₹{Number(product.price).toLocaleString()}
                          </span>
                          {product.mrp && (
                            <span className="text-xs line-through text-slate-400">
                              ₹{Number(product.mrp).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBookModal(product)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:opacity-80 transition-all"
                          title="Syllabus Details"
                        >
                          📖 Details
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Book / Course Details Modal */}
      {selectedBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative">
            
            <button
              onClick={() => setSelectedBookModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center hover:opacity-80"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-44 flex-shrink-0 aspect-[4/5] rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={selectedBookModal.image || "/books/wcna_master_course.jpg"}
                  alt={selectedBookModal.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
                  {selectedBookModal.tag || "OFFICIAL MATERIAL"}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedBookModal.title}
                </h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹{Number(selectedBookModal.price).toLocaleString()}
                  </span>
                  {selectedBookModal.mrp && (
                    <span className="text-sm line-through text-slate-400">
                      ₹{Number(selectedBookModal.mrp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedBookModal.description}
                </p>
              </div>
            </div>

            {/* Syllabus / Key Subjects */}
            {selectedBookModal.subjects && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
                  Core Subjects &amp; Learning Modules
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedBookModal.subjects.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold">
                      <span className="text-emerald-500">✓</span>
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Outcomes */}
            {selectedBookModal.benefits && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                <strong>💡 Outcomes:</strong> {selectedBookModal.benefits}
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedBookModal(null)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAddToCart(selectedBookModal)
                  setSelectedBookModal(null)
                }}
                className="px-6 py-2.5 rounded-full text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              >
                Add to Cart ➔
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
