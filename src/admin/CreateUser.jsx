import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { saveFormDraft, getFormDraft, clearFormDraft, hasFormDraft } from "../utils/formDraftManager"
import DraftBanner from "../components/DraftBanner"

export default function CreateUser() {
  const { user } = useAuth()
  const { isDark } = useTheme()

  const DRAFT_KEY = "admin_create_user"
  const defaultValues = {
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "seller"
  }

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState(() => getFormDraft(DRAFT_KEY, defaultValues))
  const [hasRestoredDraft, setHasRestoredDraft] = useState(() => hasFormDraft(DRAFT_KEY))
  const [loading, setLoading] = useState(false)

  // Auto-save draft
  useEffect(() => {
    if (form.name || form.email || form.phone || form.address) {
      saveFormDraft(DRAFT_KEY, form)
    }
  }, [form])

  // Flush on phone call / tab suspend
  useEffect(() => {
    const flush = () => {
      if (form.name || form.email || form.phone || form.address) {
        saveFormDraft(DRAFT_KEY, form)
      }
    }
    window.addEventListener("pagehide", flush)
    window.addEventListener("beforeunload", flush)
    return () => {
      window.removeEventListener("pagehide", flush)
      window.removeEventListener("beforeunload", flush)
    }
  }, [form])

  const handleClearDraft = () => {
    clearFormDraft(DRAFT_KEY)
    setForm(defaultValues)
    setHasRestoredDraft(false)
  }

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      return alert("Name, Email and Password are required")
    }

    // 🔒 SAFETY: Role-based creation rules
    if (user?.role === "distributor" && !["distributor", "seller"].includes(form.role)) {
      return alert("Distributor sirf Distributor ya Seller bana sakta hai")
    }
    if (user?.role === "seller" && !["seller", "user"].includes(form.role)) {
      return alert("Seller sirf Seller ya User bana sakta hai")
    }

    try {
      setLoading(true)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Session expired. Please login again.")
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` // 🔐 JWT
        },
        body: JSON.stringify({
          parentId: user?.id,   // 🔥 IMPORTANT (Admin / Distributor)
          fullName: form.name.trim(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || data.error || "Failed to create user"
        )
      }

      alert(`${form.role.toUpperCase()} created successfully ✅`)
      clearFormDraft(DRAFT_KEY)
      setHasRestoredDraft(false)

      // 🔄 Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        role: "seller"
      })

    } catch (err) {
      console.error("Create user error:", err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div className={`p-6 sm:p-7 rounded-3xl border shadow-xl max-w-md transition-colors duration-200 ${
      isDark ? "bg-[#111713] border-white/[0.08] text-white" : "bg-white border-stone-200 text-stone-900"
    }`}>

      {/* ---------- HEADER ---------- */}
      <div className="flex items-center gap-2 mb-1">
        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 text-[9.5px] font-black uppercase font-mono">
          ✦ USER REGISTRATION
        </span>
      </div>
      <h2 className="font-black text-lg sm:text-xl uppercase tracking-tight">
        {user?.role === "distributor"
          ? "Create Distributor / Seller"
          : user?.role === "seller"
          ? "Create Seller / User"
          : "Create New User"}
      </h2>
      <p className={`text-xs font-medium mb-4 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
        Logged in as: <b className={isDark ? "text-white" : "text-stone-900"}>{user?.name}</b> ({user?.role})
      </p>

      {hasRestoredDraft && (
        <DraftBanner
          onClear={handleClearDraft}
          message="Restored user details from your previous session."
        />
      )}

      {/* ---------- NAME ---------- */}
      <div className="mb-2.5">
        <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1 ${
          isDark ? "text-stone-300" : "text-stone-700"
        }`}>
          Full Name
        </label>
        <input
          name="name"
          placeholder="e.g. John Doe"
          className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
            isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
          }`}
          value={form.name}
          onChange={handleChange}
        />
      </div>

      {/* ---------- EMAIL ---------- */}
      <div className="mb-2.5">
        <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1 ${
          isDark ? "text-stone-300" : "text-stone-700"
        }`}>
          Corporate / Personal Email
        </label>
        <input
          name="email"
          type="email"
          placeholder="e.g. john@company.com"
          className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
            isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
          }`}
          value={form.email}
          onChange={handleChange}
        />
      </div>

      {/* ---------- PHONE ---------- */}
      <div className="mb-2.5">
        <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1 ${
          isDark ? "text-stone-300" : "text-stone-700"
        }`}>
          Mobile / Phone Number
        </label>
        <input
          name="phone"
          type="tel"
          placeholder="e.g. 9876543210"
          className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
            isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
          }`}
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      {/* ---------- ADDRESS ---------- */}
      <div className="mb-2.5">
        <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1 ${
          isDark ? "text-stone-300" : "text-stone-700"
        }`}>
          Address / Location
        </label>
        <input
          name="address"
          placeholder="e.g. New Delhi, Delhi - 110001"
          className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
            isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
          }`}
          value={form.address}
          onChange={handleChange}
        />
      </div>

      {/* ---------- PASSWORD ---------- */}
      <div className="mb-3">
        <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1 ${
          isDark ? "text-stone-300" : "text-stone-700"
        }`}>
          Initial Password
        </label>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
            isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
          }`}
          value={form.password}
          onChange={handleChange}
        />
      </div>

      {/* ---------- ROLE ---------- */}
      <div className="mb-5">
        <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1 ${
          isDark ? "text-stone-300" : "text-stone-700"
        }`}>
          Assigned User Role
        </label>
        <select
          name="role"
          className={`w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
            isDark ? "bg-black/40 text-white border-white/10 focus:border-[#fbbf24]" : "bg-stone-50 text-stone-900 border-stone-300 focus:border-blue-500 shadow-sm"
          }`}
          value={form.role}
          onChange={handleChange}
        >
          {/* Admin → sab bana sakta hai */}
          {user?.role === "admin" && (
            <>
              <option value="distributor">🏢 Distributor</option>
              <option value="seller">🛒 Direct Seller</option>
              <option value="user">👤 Customer / User</option>
            </>
          )}
          {/* Distributor → Distributor ya Seller bana sakta hai */}
          {user?.role === "distributor" && (
            <>
              <option value="distributor">🏢 Distributor</option>
              <option value="seller">🛒 Direct Seller</option>
            </>
          )}
          {/* Seller → Seller ya User bana sakta hai */}
          {user?.role === "seller" && (
            <>
              <option value="seller">🛒 Direct Seller</option>
              <option value="user">👤 Customer / User</option>
            </>
          )}
        </select>
      </div>

      {/* ---------- BUTTON ---------- */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-stone-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
      >
        {loading ? "Creating..." : "✓ Create User Account"}
      </button>
    </div>
  )
}
