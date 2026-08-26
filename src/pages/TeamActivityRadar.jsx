import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import InlineLoader from "../components/InlineLoader"

export default function TeamActivityRadar({ setPage }) {
  const { user: authUser } = useAuth()
  const { isDark } = useTheme()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState("")

  // Filter & Search
  const [activeTab, setActiveTab] = useState("all") // "all" | "follow_up_needed" | "dormant" | "new_onboarding" | "active"
  const [search, setSearch] = useState("")

  // Notes Modal state
  const [selectedMember, setSelectedMember] = useState(null)
  const [memberNotes, setMemberNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [newNoteText, setNewNoteText] = useState("")
  const [contactMethod, setContactMethod] = useState("call")
  const [noteStatus, setNoteStatus] = useState("follow_up_taken")
  const [savingNote, setSavingNote] = useState(false)
  const [noteMsg, setNoteMsg] = useState("")

  const token = localStorage.getItem("token")

  const loadRadar = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/team/activity-radar`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to load team activity radar")
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
      setError(e.message || "Failed to load activity radar")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadRadar()
  }, [loadRadar])

  const openNotesModal = async (member) => {
    setSelectedMember(member)
    setNewNoteText("")
    setNoteMsg("")
    try {
      setNotesLoading(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/team/member-notes/${member._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const json = await res.json()
        setMemberNotes(json.notes || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setNotesLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!newNoteText.trim() || !selectedMember) return
    try {
      setSavingNote(true)
      setNoteMsg("")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/team/follow-up-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          memberId: selectedMember._id,
          note: newNoteText.trim(),
          contactMethod,
          status: noteStatus
        })
      })
      const json = await res.json()
      if (res.ok) {
        setMemberNotes(prev => [json.note, ...prev])
        setNewNoteText("")
        setNoteMsg("✅ Note successfully saved!")
        loadRadar() // refresh last note in list
      } else {
        setNoteMsg(json.message || "Failed to save note")
      }
    } catch (e) {
      setNoteMsg(e.message)
    } finally {
      setSavingNote(false)
    }
  }

  // Quick WhatsApp Trigger
  const sendWhatsApp = (member) => {
    if (!member.phone) {
      alert("Is member ka phone number registered nahi hai.")
      return
    }
    const cleanPhone = member.phone.replace(/[^0-9]/g, "")
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone

    let msg = `Namaste ${member.fullName || member.name} ji! 👋
`
    if (member.activityStatus === "follow_up_needed" || member.activityStatus === "dormant") {
      msg += `Humne notice kiya aapne pichle ${member.daysInactive || "kuch"} dino se EDUCA VEDA me order nahi lagaya hai. Koi product guidance ya order help chahiye toh batayein!

🛍️ Store Link: https://educa-store.vercel.app/`
    } else {
      msg += `EDUCA VEDA me aapka swagat hai! Kaise chal raha hai aapka business? Kisi help ki zarurat ho toh batayein.`
    }

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank")
  }

  if (loading) {
    return <InlineLoader label="Loading Team Pulse & Follow-Up Radar..." minHeight={300} />
  }

  const members = data?.members || []
  const counts = data?.counts || {}

  const filteredMembers = members.filter(m => {
    if (activeTab !== "all" && m.activityStatus !== activeTab) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (m.fullName || "").toLowerCase().includes(q) ||
           (m.name || "").toLowerCase().includes(q) ||
           (m.phone || "").includes(q)
  })

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${
      isDark ? "text-stone-200" : "text-stone-800"
    }`}>
      {/* ── TOP HEADER ── */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">📡</span>
          <div>
            <h1 className={`text-xl font-black ${isDark ? "text-white" : "text-stone-900"}`}>
              Team Pulse & Inactivity Follow-Up Radar
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
              Apni team me dekhein kisne 1 week ya 1 month se sale nahi ki, unhe call/WhatsApp karein aur follow-up notes save karein
            </p>
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search member name, ID, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full text-xs px-3 py-2 pl-8 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
            }`}
          />
          <span className="absolute left-2.5 top-2.5 text-xs text-stone-400">🔍</span>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { id: "all", label: "All Team", count: data?.totalTeamCount || 0, color: "text-stone-400", bg: "hover:border-stone-500" },
          { id: "follow_up_needed", label: "🟡 Inactive 7+ Days", count: counts.follow_up_needed || 0, color: "text-amber-500", bg: "border-amber-500/40 bg-amber-500/5" },
          { id: "dormant", label: "🔴 Dormant 30+ Days", count: counts.dormant || 0, color: "text-red-500", bg: "border-red-500/40 bg-red-500/5" },
          { id: "new_onboarding", label: "⚪ New (0 Sales)", count: counts.new_onboarding || 0, color: "text-sky-400", bg: "border-sky-500/40 bg-sky-500/5" },
          { id: "active", label: "🟢 Active Recently", count: counts.active || 0, color: "text-emerald-500", bg: "border-emerald-500/40 bg-emerald-500/5" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeTab === tab.id
                ? "border-amber-500 bg-amber-500/15 shadow-md"
                : isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
            }`}
          >
            <p className={`text-[10px] font-mono uppercase font-bold ${tab.color}`}>{tab.label}</p>
            <p className="text-xl font-black mt-1">{tab.count}</p>
          </button>
        ))}
      </div>

      {/* ── TEAM CARDS LIST ── */}
      {filteredMembers.length === 0 ? (
        <div className={`p-16 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
        }`}>
          <span className="text-4xl block mb-2">👥</span>
          <h3 className="text-sm font-bold">Koi member is filter me nahi mila</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const statusBadge =
              member.activityStatus === "follow_up_needed"
                ? { label: `⚠️ Inactive ${member.daysInactive}d`, cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" }
                : member.activityStatus === "dormant"
                ? { label: `🚨 Dormant ${member.daysInactive}d`, cls: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" }
                : member.activityStatus === "new_onboarding"
                ? { label: "✨ New Member", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30" }
                : { label: `✅ Active (${member.daysInactive === 0 ? "Today" : `${member.daysInactive}d ago`})`, cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" }

            return (
              <div
                key={member._id}
                className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 transition-all hover:scale-[1.01] ${
                  member.activityStatus === "dormant"
                    ? isDark ? "bg-[#111713] border-red-500/30" : "bg-white border-red-200"
                    : member.activityStatus === "follow_up_needed"
                    ? isDark ? "bg-[#111713] border-amber-500/30" : "bg-white border-amber-200"
                    : isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                        member.role === "distributor" ? "bg-sky-500/20 text-sky-400 border-sky-500/40" :
                        member.role === "seller" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                        "bg-violet-500/20 text-violet-400 border-violet-500/40"
                      }`}>
                        {(member.fullName || member.name)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-sm leading-tight">{member.fullName || member.name}</div>
                        <div className="font-mono text-xs text-sky-500 font-bold mt-0.5">🆔 {member.name}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${statusBadge.cls}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Contact Info & Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className={`p-2.5 rounded-xl border ${isDark ? "bg-black/30 border-white/[0.06]" : "bg-stone-50 border-stone-200"}`}>
                      <span className="text-[10px] text-stone-400 font-mono block">📞 Phone</span>
                      <span className="font-bold">{member.phone || "—"}</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${isDark ? "bg-black/30 border-white/[0.06]" : "bg-stone-50 border-stone-200"}`}>
                      <span className="text-[10px] text-stone-400 font-mono block">💰 Sales Total</span>
                      <span className="font-bold text-emerald-500">₹{member.sales.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Last Note snippet */}
                  {member.lastNote ? (
                    <div className={`p-2.5 rounded-xl border text-[11px] ${
                      isDark ? "bg-stone-900 border-white/[0.08] text-stone-300" : "bg-amber-50/60 border-amber-200 text-stone-700"
                    }`}>
                      <span className="font-bold text-amber-500 mr-1">📝 Last Note:</span>
                      "{member.lastNote.note}"
                      <span className="block text-[9px] text-stone-400 font-mono mt-1">
                        by {member.lastNote.createdByFullName || member.lastNote.createdByName} · {new Date(member.lastNote.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-stone-400 italic px-1">Koi follow-up note abhi tak nahi likha gaya.</div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-xs font-black hover:bg-emerald-500/25 transition-all"
                  >
                    <span>📞</span> Call
                  </a>
                  <button
                    onClick={() => sendWhatsApp(member)}
                    className="flex items-center justify-center gap-1 py-2 rounded-xl bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30 text-xs font-black hover:bg-green-500/25 transition-all"
                  >
                    <span>💬</span> WhatsApp
                  </button>
                  <button
                    onClick={() => openNotesModal(member)}
                    className="flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-black hover:bg-amber-500/25 transition-all"
                  >
                    <span>📝</span> Notes ({member.notesCount || 0})
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── FOLLOW-UP NOTES MODAL ── */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl space-y-4 max-h-[90vh] flex flex-col ${
            isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-white border-stone-300 text-stone-900"
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-white/[0.08]">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  📝 Follow-Up Notes: {selectedMember.fullName || selectedMember.name}
                </h3>
                <p className="text-xs font-mono text-sky-500 mt-0.5">🆔 {selectedMember.name} · 📞 {selectedMember.phone}</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Add New Note Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold block text-amber-500">Naya Follow-Up Remark Likhein:</label>
              <textarea
                rows={2}
                placeholder="Jaise: Spoke on call, promised to place order by Friday, needs product catalog..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark ? "bg-black/50 border-white/[0.12]" : "bg-stone-50 border-stone-300"
                }`}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className={`px-2 py-1 rounded-lg border text-xs ${isDark ? "bg-stone-800 border-white/[0.1]" : "bg-white border-stone-300"}`}
                  >
                    <option value="call">📞 Phone Call</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="in-person">🤝 In-Person</option>
                    <option value="note">📌 General Note</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote || !newNoteText.trim()}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-black font-black text-xs shadow hover:bg-amber-400 disabled:opacity-50"
                >
                  {savingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
              {noteMsg && <p className="text-xs text-emerald-500 font-bold">{noteMsg}</p>}
            </div>

            {/* Past Notes List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pt-2 border-t border-white/[0.08] max-h-[300px] pr-1">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">Past Follow-Up History:</h4>
              {notesLoading ? (
                <div className="py-6 text-center text-xs text-stone-400">Loading notes...</div>
              ) : memberNotes.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">Abhi tak koi follow-up note nahi hai. Pehla note add karein!</div>
              ) : (
                memberNotes.map((note) => (
                  <div
                    key={note._id}
                    className={`p-3 rounded-2xl border text-xs space-y-1 ${
                      isDark ? "bg-black/30 border-white/[0.06]" : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    <p className="font-semibold text-stone-200 dark:text-stone-200 text-stone-800">"{note.note}"</p>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 font-mono">
                      <span>By <strong>{note.createdByFullName || note.createdByName}</strong> ({note.createdByRole})</span>
                      <span>{new Date(note.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
