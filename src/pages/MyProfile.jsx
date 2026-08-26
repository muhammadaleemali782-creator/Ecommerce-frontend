import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { getRoleLabel } from "../utils/roleLabels"
import InlineLoader from "../components/InlineLoader"

export default function MyProfile() {
  const { user: authUser, updateUser } = useAuth()
  const { isDark } = useTheme()

  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [copied,   setCopied]   = useState(false)
  const [msg,      setMsg]      = useState("")
  const [msgType,  setMsgType]  = useState("") // "success" | "error"

  const [form, setForm] = useState({
    fullName: "",
    phone:    "",
    address:  "",
  })

  const token = localStorage.getItem("token")

  /* ── Load profile ── */
  const load = async () => {
    try {
      setLoading(true)
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data) {
        setProfile(data)
        if (typeof updateUser === "function") updateUser(data)
        setForm({
          fullName: data.fullName || "",
          phone:    data.phone    || "",
          address:  data.address  || "",
        })
      }
    } catch (err) {
      console.error("Load profile error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  /* ── Copy System ID ── */
  const handleCopyId = () => {
    if (!profile?.name) return
    navigator.clipboard.writeText(profile.name)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ── Share profile + app/website link ── */
  const handleShare = async () => {
    const name  = profile.fullName || profile.name || "EDUCA Store"
    const phone = profile.phone || ""
    const siteUrl = "https://educa-store.vercel.app/"

    const text =
      `👋 ${name} ki taraf se!\n` +
      (phone ? `📞 Contact: ${phone}\n\n` : `\n`) +
      `🛍️ EDUCA Store — abhi check karo:\n${siteUrl}`

    if (navigator.share) {
      try {
        await navigator.share({ title: "EDUCA Store", text, url: siteUrl })
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        alert("✅ Link copy ho gaya! Ab kahin bhi paste kar do (WhatsApp, SMS, etc.)")
      } catch {
        alert(text)
      }
    }
  }

  /* ── Save profile ── */
  const handleSave = async () => {
    try {
      setSaving(true)
      setMsg("")
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/users/profile/update`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(data.msg || "Update failed")
        setMsgType("error")
        return
      }
      const updated = data.user || {}
      setProfile(prev => ({ ...prev, ...updated }))
      if (typeof updateUser === "function") updateUser(updated)
      setMsg("✅ Profile successfully updated!")
      setMsgType("success")
      setEditing(false)
    } catch (err) {
      setMsg("❌ Server connection error")
      setMsgType("error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <InlineLoader label="Loading Official Profile Dossier 👤" minHeight={200} />
    </div>
  )

  if (!profile) return (
    <div className={`p-8 max-w-md mx-auto text-center rounded-3xl border mt-10 ${
      isDark ? "bg-[#111713] border-red-500/30 text-red-400" : "bg-white border-red-200 text-red-600 shadow-sm"
    }`}>
      <span className="text-3xl block mb-2">⚠️</span>
      <h3 className="text-sm font-bold">Profile Load Nahi Hua</h3>
      <p className="text-xs mt-1 opacity-70">Kripya dobara login karein ya refresh karein.</p>
    </div>
  )

  const initials = (profile.fullName || profile.name || "U")[0].toUpperCase()

  return (
    <div className="max-w-2xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 space-y-6 select-none">

      {/* ── Executive Identity Card ── */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm transition-all ${
        isDark
          ? "bg-[#111713] border-white/[0.08]"
          : "bg-white border-stone-200 shadow-sm"
      }`}>

        {/* Top Atmosphere Banner */}
        <div className={`p-6 sm:p-8 border-b relative overflow-hidden ${
          isDark
            ? "bg-gradient-to-br from-[#162019] via-[#111713] to-[#0c100d] border-white/[0.06]"
            : "bg-gradient-to-br from-stone-100 via-stone-50 to-white border-stone-200/80"
        }`}>
          {/* Ambient Glow */}
          <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none opacity-40 blur-2xl ${
            profile.role === "admin" ? "bg-amber-500" :
            profile.role === "distributor" ? "bg-sky-500" :
            profile.role === "seller" ? "bg-emerald-500" : "bg-purple-500"
          }`} />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
            {/* Avatar with Glow Ring */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-black shrink-0 border shadow-lg ${
              isDark
                ? "bg-[#1a241e] text-[#fbbf24] border-[#fbbf24]/40 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                : "bg-white text-stone-900 border-amber-400 shadow-md"
            }`}>
              {initials}
            </div>

            {/* Name and Badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-widest border ${
                  profile.role === "admin" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                  profile.role === "distributor" ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30" :
                  profile.role === "seller" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                  "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                }`}>
                  ✦ {getRoleLabel(profile.role)}
                </span>
                <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  isDark ? "bg-black/40 text-stone-400 border-white/10" : "bg-stone-100 text-stone-600 border-stone-200"
                }`}>
                  ID: {profile.name}
                </span>
              </div>

              <h1 className={`text-xl sm:text-2xl font-black tracking-tight truncate ${
                isDark ? "text-white" : "text-stone-900"
              }`}>
                {profile.fullName || profile.name}
              </h1>

              <p className={`text-xs font-mono mt-0.5 truncate ${
                isDark ? "text-stone-400" : "text-stone-600"
              }`}>
                ✉️ {profile.email || "No email"}
              </p>
            </div>
          </div>
        </div>

        {/* ── System ID & Share App Bar ── */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 flex-wrap ${
          isDark ? "bg-black/30 border-white/[0.06]" : "bg-stone-50/90 border-stone-200/70"
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
              isDark ? "text-stone-400" : "text-stone-600"
            }`}>
              SYSTEM USERNAME:
            </span>
            <button
              onClick={handleCopyId}
              className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs border flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? "bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 border-amber-500/30"
                  : "bg-white hover:bg-stone-100 text-amber-900 border-amber-300 shadow-xs"
              }`}
              title="Click to copy System ID"
            >
              <span>{profile.name}</span>
              <span className="text-[10px] opacity-70">{copied ? "✓ Copied" : "📋 Copy"}</span>
            </button>
          </div>

          <button
            onClick={handleShare}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
              isDark
                ? "bg-amber-500 hover:bg-amber-400 text-black font-black"
                : "bg-stone-900 hover:bg-stone-800 text-white"
            }`}
          >
            <span>📤</span>
            <span>Share Store Link</span>
          </button>
        </div>

        {/* ── Details / Edit Section ── */}
        <div className="p-5 sm:p-7 space-y-5">

          {msg && (
            <div className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
              msgType === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
            }`}>
              <span>{msg}</span>
            </div>
          )}

          {!editing ? (
            /* ── VIEW MODE ── */
            <div className="space-y-3">
              <ProfileRow
                isDark={isDark}
                icon="👤"
                label="Full Name"
                value={profile.fullName || profile.name || "—"}
              />
              <ProfileRow
                isDark={isDark}
                icon="📧"
                label="Registered Email"
                value={profile.email || "—"}
                badge="Verified"
              />
              <ProfileRow
                isDark={isDark}
                icon="📞"
                label="Phone Number"
                value={profile.phone || "—"}
              />
              <ProfileRow
                isDark={isDark}
                icon="📍"
                label="Address / Location"
                value={profile.address || "—"}
              />
              <ProfileRow
                isDark={isDark}
                icon="📅"
                label="Joining Date"
                value={
                  profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric"
                      })
                    : "—"
                }
              />

              {/* Reports To — For non-admin members */}
              {["distributor", "seller", "user"].includes(profile.role) && (
                <ProfileRow
                  isDark={isDark}
                  icon="🏢"
                  label="Reports To (Upline)"
                  value={
                    profile.parentId?.name
                      ? `${profile.parentId.name} (${getRoleLabel(profile.parentId.role)})`
                      : "Direct Corporate Registered"
                  }
                />
              )}

              <div className="pt-3">
                <button
                  onClick={() => { setEditing(true); setMsg("") }}
                  className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 ${
                    isDark
                      ? "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300"
                  }`}
                >
                  <span>✏️</span>
                  <span>Edit Profile Details</span>
                </button>
              </div>
            </div>

          ) : (
            /* ── EDIT MODE ── */
            <div className="space-y-4">
              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  👤 Full Name
                </label>
                <input
                  className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none border transition-all ${
                    isDark
                      ? "bg-black/40 border-white/10 text-white focus:border-[#fbbf24]"
                      : "bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500 focus:bg-white shadow-sm"
                  }`}
                  value={form.fullName}
                  onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Apna poora naam darj karein"
                />
              </div>

              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  📧 Registered Email (Locked)
                </label>
                <div className={`p-3 rounded-xl text-xs font-mono font-semibold border flex items-center justify-between ${
                  isDark
                    ? "bg-black/20 border-white/[0.06] text-stone-400"
                    : "bg-stone-100 border-stone-200 text-stone-500"
                }`}>
                  <span>{form.email || profile.email}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 dark:bg-white/10">Security Locked</span>
                </div>
              </div>

              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  📞 Mobile Number
                </label>
                <input
                  className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none border transition-all ${
                    isDark
                      ? "bg-black/40 border-white/10 text-white focus:border-[#fbbf24]"
                      : "bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500 focus:bg-white shadow-sm"
                  }`}
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>

              <div>
                <label className={`block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-stone-300" : "text-stone-700"
                }`}>
                  📍 Address / City / Pin
                </label>
                <textarea
                  className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none border transition-all ${
                    isDark
                      ? "bg-black/40 border-white/10 text-white focus:border-[#fbbf24]"
                      : "bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500 focus:bg-white shadow-sm"
                  }`}
                  rows={3}
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Complete postal address"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {saving ? "Saving Changes..." : "💾 Save Changes"}
                </button>
                <button
                  onClick={() => { setEditing(false); setMsg(""); load() }}
                  className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    isDark
                      ? "bg-white/[0.06] hover:bg-white/[0.12] text-stone-300 border-white/10"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}

/* ── Modern Luxury Profile Row Component ── */
function ProfileRow({ icon, label, value, badge, isDark }) {
  return (
    <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
      isDark
        ? "bg-black/20 border-white/[0.05] hover:bg-black/40"
        : "bg-stone-50/80 border-stone-200/80 hover:bg-stone-100/70 shadow-2xs"
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-base w-7 h-7 rounded-lg flex items-center justify-center bg-white/10 dark:bg-white/5 border border-white/10 shrink-0">
          {icon}
        </span>
        <div className="min-w-0">
          <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
            isDark ? "text-stone-400" : "text-stone-500"
          }`}>
            {label}
          </div>
          <div className={`text-xs sm:text-sm font-bold truncate ${
            isDark ? "text-stone-100" : "text-stone-900"
          }`}>
            {value}
          </div>
        </div>
      </div>

      {badge && (
        <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
          {badge}
        </span>
      )}
    </div>
  )
}

