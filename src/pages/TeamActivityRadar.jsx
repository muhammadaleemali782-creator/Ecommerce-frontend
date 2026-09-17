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
  const [roleFilter, setRoleFilter] = useState("all") // "all" | "user" | "seller" | "distributor"
  const [categoryFilter, setCategoryFilter] = useState("all") // "all" | specific category | "none"
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

  // WhatsApp Dual Selector state
  const [waModalMember, setWaModalMember] = useState(null)
  const [waType, setWaType] = useState("personal") // "personal" | "business"
  const [customWaNumber, setCustomWaNumber] = useState("")
  const [waTemplate, setWaTemplate] = useState("followup")

  // Quick Category Editor state
  const [categoryModalMember, setCategoryModalMember] = useState(null)
  const [editCategoryVal, setEditCategoryVal] = useState("")
  const [savingCategory, setSavingCategory] = useState(false)

  // WhatsApp Broadcast Modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastTemplate, setBroadcastTemplate] = useState("followup") // "followup" | "category" | "offer" | "custom"
  const [broadcastCustomText, setBroadcastCustomText] = useState(
    "Namaste {name} ji! 👋 Humne notice kiya aapne pichle {daysInactive} dino se EDUCA VEDA me order nahi lagaya hai. Kisi bhi product guidance ya support ke liye humse connect karein!\n\n🛍️ Store Link: {storeLink}"
  )
  const [sentBroadcastIds, setSentBroadcastIds] = useState(new Set())
  const [broadcastIndex, setBroadcastIndex] = useState(0)
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set())
  const [isBulkSending, setIsBulkSending] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, statusText: "", done: false })
  const [apiNotice, setApiNotice] = useState("")

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

  // Open WhatsApp Dual Selector Modal
  const sendWhatsApp = (member) => {
    setWaModalMember(member)
    setCustomWaNumber(member.phone || "")
    setWaType("personal")
    setWaTemplate("followup")
  }

  const handleLaunchWhatsApp = async () => {
    if (!waModalMember) return
    const targetNumber = waType === "personal" ? (waModalMember.phone || "") : (customWaNumber || waModalMember.phone || "")
    const cleanPhone = targetNumber.replace(/[^0-9]/g, "")
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone

    let msg = `Namaste ${waModalMember.fullName || waModalMember.name} ji! 👋\n\n`
    if (waTemplate === "followup") {
      msg += `Humne notice kiya aapne pichle ${waModalMember.daysInactive || "kuch"} dino se EDUCA VEDA me order nahi lagaya hai. Koi product guidance ya support chahiye toh batayein!\n\n🛍️ Store Link: https://educa-store.vercel.app/`
    } else if (waTemplate === "offer") {
      msg += `🎉 EDUCA VEDA par naye offers aur special products live ho gaye hain! Apne clients ke orders lagane ke liye store visit karein:\n\n🛍️ Store Link: https://educa-store.vercel.app/`
    } else {
      msg += `Kaise chal raha hai aapka business? Kisi bhi training, customer query ya order placement me help chahiye toh turant connect karein!`
    }

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank")

    // Automatically log a follow-up remark
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/team/follow-up-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          memberId: waModalMember._id,
          note: `WhatsApp message sent via ${waType === "personal" ? "Personal WhatsApp" : "Business WhatsApp"} (${targetNumber})`,
          contactMethod: "whatsapp",
          status: "follow_up_taken"
        })
      })
      loadRadar()
    } catch (err) {}

    setWaModalMember(null)
  }

  const getCategoryIcon = (cat) => {
    if (!cat) return "🏷️"
    const c = cat.toLowerCase()
    if (c.includes("diabet") || c.includes("sugar")) return "🩸"
    if (c.includes("bp") || c.includes("hyper") || c.includes("pressure")) return "💓"
    if (c.includes("loan")) return "💳"
    if (c.includes("invest")) return "📈"
    if (c.includes("health") || c.includes("rog") || c.includes("ayur")) return "🌿"
    return "🏷️"
  }

  const handleUpdateCategory = async (memberId, newCat) => {
    try {
      setSavingCategory(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/team/member-category/${memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ category: newCat })
      })
      const json = await res.json()
      if (res.ok) {
        setData(prev => ({
          ...prev,
          members: (prev?.members || []).map(m => m._id === memberId ? { ...m, category: json.category } : m)
        }))
        setCategoryModalMember(null)
      } else {
        alert(json.message || "Failed to update category")
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingCategory(false)
    }
  }

  const getPersonalizedWaMessage = (member, template, customText) => {
    const name = member.fullName || member.name || "Ji"
    const cat = member.category || "General Health"
    const role = member.role === "distributor" ? "Distributor" : member.role === "seller" ? "Direct Seller" : "Customer"
    const days = member.daysInactive !== null && member.daysInactive !== undefined ? `${member.daysInactive}` : "kuch"

    if (template === "custom") {
      return (customText || "")
        .replace(/{name}/g, name)
        .replace(/{category}/g, cat)
        .replace(/{role}/g, role)
        .replace(/{daysInactive}/g, days)
        .replace(/{storeLink}/g, "https://educa-store.vercel.app/")
    } else if (template === "category") {
      return `Namaste ${name} ji! 👋\n\nHum EDUCA VEDA se connect kar rahe hain. Aapke *${cat}* related health requirements ke liye hamare paas pure Ayurvedic formulations & herbal products available hain.\n\nKoi consultation ya order help chahiye toh batayein!\n🛍️ Store Link: https://educa-store.vercel.app/`
    } else if (template === "offer") {
      return `🎉 Namaste ${name} ji! EDUCA VEDA par naye Ayurvedic products aur special health offers live ho gaye hain.\n\nApne manpasand products dekhne aur order karne ke liye visit karein:\n🛍️ Store Link: https://educa-store.vercel.app/`
    } else {
      // followup
      return `Namaste ${name} ji! 👋\n\nHumne notice kiya aapne pichle *${days}* dino se EDUCA VEDA me koi naya order nahi lagaya hai. Koi product guidance ya order placement me help chahiye toh batayein!\n\n🛍️ Store Link: https://educa-store.vercel.app/`
    }
  }

  const sendBroadcastToMember = async (member) => {
    if (!member.phone) {
      alert(`Member ${member.fullName || member.name} ka phone number nahi mila.`)
      return
    }
    const cleanPhone = member.phone.replace(/[^0-9]/g, "")
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
    const msg = getPersonalizedWaMessage(member, broadcastTemplate, broadcastCustomText)
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
    // Re-use single window tab so it does not open 28 separate tabs
    window.open(url, "educa_wa_broadcast")

    setSentBroadcastIds(prev => new Set([...prev, member._id]))

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/team/follow-up-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          memberId: member._id,
          note: `Broadcast WhatsApp sent [${broadcastTemplate}]`,
          contactMethod: "whatsapp",
          status: "follow_up_taken"
        })
      })
      loadRadar()
    } catch {}
  }

  // Toggle selection of specific member for broadcast
  const toggleSelectMember = (id) => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Toggle select all filtered members
  const toggleSelectAll = (targetList) => {
    const validWithPhone = targetList.filter(m => m.phone)
    if (selectedMemberIds.size >= validWithPhone.length && validWithPhone.length > 0) {
      setSelectedMemberIds(new Set())
    } else {
      setSelectedMemberIds(new Set(validWithPhone.map(m => m._id)))
    }
  }

  // 1-Click Direct API bulk send (no WhatsApp tab ever opens!)
  const handleBulkSendDirect = async (targetList) => {
    const targetMembers = targetList.filter(m => selectedMemberIds.has(m._id) && m.phone)
    if (targetMembers.length === 0) {
      alert("Kripya kam se kam ek member ko select karein jinka phone number ho.")
      return
    }

    try {
      setIsBulkSending(true)
      setApiNotice("")
      setBulkProgress({
        current: 0,
        total: targetMembers.length,
        statusText: "WhatsApp Gateway se connect kiya ja raha hai...",
        done: false
      })

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/team/broadcast-whatsapp-api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipients: targetMembers.map(m => ({
            id: m._id,
            name: m.fullName || m.name,
            phone: m.phone,
            category: m.category || "",
            daysInactive: m.daysInactive || 0
          })),
          messageTemplate: broadcastTemplate,
          customText: broadcastCustomText
        })
      })

      const json = await res.json()

      if (json.isConfigured && json.success) {
        setBulkProgress({
          current: json.sentCount,
          total: targetMembers.length,
          statusText: `🎉 Success! Sabhi ${json.sentCount} members ko WhatsApp par message chala gaya bina koi tab khule!`,
          done: true
        })
        setSentBroadcastIds(new Set(targetMembers.map(m => m._id)))
        loadRadar()
      } else {
        // Gateway not configured
        setApiNotice(json.message || "WhatsApp Gateway API backend me configure nahi hai.")
        setBulkProgress({
          current: 0,
          total: targetMembers.length,
          statusText: "",
          done: false
        })
      }
    } catch (err) {
      setApiNotice("Error: " + err.message)
    } finally {
      setIsBulkSending(false)
    }
  }

  // Automated Single-Tab Runner (runs sequentially in ONE single tab instead of 28 tabs)
  const runSingleTabAutoSequence = async (targetList) => {
    const unsentMembers = targetList.filter(m => selectedMemberIds.has(m._id) && m.phone && !sentBroadcastIds.has(m._id))
    if (unsentMembers.length === 0) {
      alert("Sabhi selected members ko message bheja ja chuka hai.")
      return
    }

    setIsBulkSending(true)
    let processed = 0

    for (const member of unsentMembers) {
      processed++
      setBulkProgress({
        current: processed,
        total: unsentMembers.length,
        statusText: `Bhej raha hai (${processed}/${unsentMembers.length}): ${member.fullName || member.name}...`,
        done: false
      })

      const cleanPhone = member.phone.replace(/[^0-9]/g, "")
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
      const msg = getPersonalizedWaMessage(member, broadcastTemplate, broadcastCustomText)
      const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`

      // Opens in the SAME single window named "educa_wa_broadcast" (NEVER opens 28 tabs!)
      window.open(url, "educa_wa_broadcast")

      setSentBroadcastIds(prev => new Set([...prev, member._id]))

      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/team/follow-up-note`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            memberId: member._id,
            note: `Auto Broadcast WhatsApp sent [${broadcastTemplate}]`,
            contactMethod: "whatsapp",
            status: "follow_up_taken"
          })
        })
      } catch {}

      // Wait 3 seconds before next so WhatsApp Web can load
      if (processed < unsentMembers.length) {
        await new Promise(r => setTimeout(r, 3000))
      }
    }

    setBulkProgress({
      current: unsentMembers.length,
      total: unsentMembers.length,
      statusText: `✅ Sabhi ${unsentMembers.length} selected members ka message ek hi tab me process ho gaya!`,
      done: true
    })
    setIsBulkSending(false)
    loadRadar()
  }

  if (loading) {
    return <InlineLoader label="Loading Team Pulse & Follow-Up Radar..." minHeight={300} />
  }

  const members = data?.members || []
  const counts = data?.counts || {}

  const presetCategories = ["Diabetic / Sugar", "BP / Hypertension", "Loan", "Investment", "Health / Rogsetu", "General"]
  const existingCategories = Array.from(new Set(members.map(m => m.category).filter(Boolean)))
  const allCategories = Array.from(new Set([...presetCategories, ...existingCategories]))

  const filteredMembers = members.filter(m => {
    if (activeTab !== "all" && m.activityStatus !== activeTab) return false
    if (roleFilter !== "all" && m.role !== roleFilter) return false
    if (categoryFilter !== "all") {
      if (categoryFilter === "none") {
        if (m.category) return false
      } else if ((m.category || "").toLowerCase() !== categoryFilter.toLowerCase()) {
        return false
      }
    }
    if (!search) return true
    const q = search.toLowerCase()
    return (m.fullName || "").toLowerCase().includes(q) ||
           (m.name || "").toLowerCase().includes(q) ||
           (m.phone || "").includes(q) ||
           (m.category || "").toLowerCase().includes(q)
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
            className={`w-full text-xs px-3 py-2 pl-8 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
          { id: "follow_up_needed", label: "🟡 Inactive 7+ Days", count: counts.follow_up_needed || 0, color: "text-blue-500", bg: "border-blue-500/40 bg-blue-600/5" },
          { id: "dormant", label: "🔴 Dormant 30+ Days", count: counts.dormant || 0, color: "text-red-500", bg: "border-red-500/40 bg-red-500/5" },
          { id: "new_onboarding", label: "⚪ New (0 Sales)", count: counts.new_onboarding || 0, color: "text-sky-400", bg: "border-sky-500/40 bg-sky-500/5" },
          { id: "active", label: "🟢 Active Recently", count: counts.active || 0, color: "text-emerald-500", bg: "border-emerald-500/40 bg-emerald-500/5" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeTab === tab.id
                ? "border-blue-500 bg-blue-600/15 shadow-md"
                : isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
            }`}
          >
            <p className={`text-[10px] font-mono uppercase font-bold ${tab.color}`}>{tab.label}</p>
            <p className="text-xl font-black mt-1">{tab.count}</p>
          </button>
        ))}
      </div>

      {/* ── ROLE, CATEGORY & BROADCAST TOOLBAR ── */}
      <div className={`p-4 rounded-3xl border shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        {/* Left: Role & Category Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter Chips */}
          <div className="flex items-center gap-1 p-1 rounded-2xl border bg-black/5 dark:bg-black/30 border-white/[0.06] overflow-x-auto">
            {[
              { id: "all", label: "Sabhi Roles" },
              { id: "user", label: "👤 Customers" },
              { id: "seller", label: "🛒 Direct Sellers" },
              { id: "distributor", label: "🏢 Distributors" },
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoleFilter(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  roleFilter === r.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : isDark ? "text-stone-400 hover:text-white" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 whitespace-nowrap">🏷️ Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold ${
                isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
              }`}
            >
              <option value="all">Sabhi Categories ({members.length})</option>
              <option value="none">⚠️ Bina Category Wale ({members.filter(m => !m.category).length})</option>
              {allCategories.map(cat => {
                const count = members.filter(m => (m.category || "").toLowerCase() === cat.toLowerCase()).length
                return (
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat} ({count})
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {/* Right: Broadcast WhatsApp Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              const ids = new Set(filteredMembers.filter(m => m.phone).map(m => m._id))
              setSelectedMemberIds(ids)
              setSentBroadcastIds(new Set())
              setBroadcastIndex(0)
              setBulkProgress({ current: 0, total: 0, statusText: "", done: false })
              setApiNotice("")
              setShowBroadcastModal(true)
            }}
            disabled={filteredMembers.length === 0}
            className="w-full lg:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs shadow-md hover:from-emerald-400 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span className="text-base">📢</span>
            <span>Broadcast WhatsApp ({filteredMembers.length} Members)</span>
          </button>
        </div>
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
                ? { label: `⚠️ Inactive ${member.daysInactive}d`, cls: "bg-blue-600/15 text-amber-600 dark:text-blue-400 border-blue-500/30" }
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
                    ? isDark ? "bg-[#111713] border-blue-500/30" : "bg-white border-amber-200"
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

                  {/* Role & Category Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] pt-1">
                    <span className={`px-2 py-0.5 rounded-lg font-bold font-mono text-[10px] uppercase border ${
                      member.role === "distributor" ? "bg-sky-500/15 text-sky-400 border-sky-500/30" :
                      member.role === "seller" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                      "bg-violet-500/15 text-violet-400 border-violet-500/30"
                    }`}>
                      {member.role === "distributor" ? "🏢 Distributor" : member.role === "seller" ? "🛒 Direct Seller" : "👤 User"}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setCategoryModalMember(member)
                        setEditCategoryVal(member.category || "")
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-all hover:scale-105 ${
                        member.category
                          ? "bg-amber-500/15 text-amber-500 border-amber-500/30 hover:bg-amber-500/25"
                          : "bg-stone-500/15 text-stone-400 border-dashed border-stone-500/30 hover:bg-stone-500/25"
                      }`}
                      title="Category badalne ke liye click karein"
                    >
                      <span>{getCategoryIcon(member.category)}</span>
                      <span>{member.category || "+ Add Category"}</span>
                      <span className="text-[9px] opacity-70">✏️</span>
                    </button>
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
                      <span className="font-bold text-blue-500 mr-1">📝 Last Note:</span>
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
                    className="flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-600/15 text-blue-500 border border-blue-500/30 text-xs font-black hover:bg-blue-600/25 transition-all"
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
              <label className="text-xs font-bold block text-blue-500">Naya Follow-Up Remark Likhein:</label>
              <textarea
                rows={2}
                placeholder="Jaise: Spoke on call, promised to place order by Friday, needs product catalog..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-black font-black text-xs shadow hover:bg-blue-500 disabled:opacity-50"
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

      {/* ── WHATSAPP DUAL-NUMBER & TEMPLATE MODAL ── */}
      {waModalMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-white border-stone-300 text-stone-900"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-white/[0.08]">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  💬 Send WhatsApp Follow-Up
                </h3>
                <p className="text-xs font-mono text-green-500 mt-0.5">{waModalMember.fullName || waModalMember.name} (🆔 {waModalMember.name})</p>
              </div>
              <button
                onClick={() => setWaModalMember(null)}
                className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Choose Number: Personal vs Business */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400">Select WhatsApp Number:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWaType("personal")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    waType === "personal"
                      ? "border-green-500 bg-green-500/15 text-green-600 dark:text-green-300 ring-2 ring-green-500/30 font-bold"
                      : isDark ? "border-white/[0.08] bg-stone-800" : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono tracking-wider opacity-75">🟢 Personal WhatsApp</div>
                  <div className="text-xs font-bold mt-1">{waModalMember.phone || "No phone"}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setWaType("business")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    waType === "business"
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold"
                      : isDark ? "border-white/[0.08] bg-stone-800" : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono tracking-wider opacity-75">💼 Business WhatsApp</div>
                  <div className="text-xs font-bold mt-1">Alternate / Pro</div>
                </button>
              </div>

              {waType === "business" && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Enter Business WhatsApp number (e.g. 9876543210)"
                    value={customWaNumber}
                    onChange={(e) => setCustomWaNumber(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? "bg-black/50 border-white/[0.12]" : "bg-stone-50 border-stone-300"
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Template Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400">Choose Message Template:</label>
              <select
                value={waTemplate}
                onChange={(e) => setWaTemplate(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  isDark ? "bg-stone-800 border-white/[0.1] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                }`}
              >
                <option value="followup">🔥 Re-engagement & Order Guidance Follow-Up</option>
                <option value="offer">🎉 New Product & Offer Announcement</option>
                <option value="general">🤝 General Support & Relationship Check</option>
              </select>
            </div>

            {/* Launch Button */}
            <div className="pt-3 border-t border-white/[0.08]">
              <button
                onClick={handleLaunchWhatsApp}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs shadow-lg hover:from-emerald-400 hover:to-green-500 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>💬 Open WhatsApp & Save Remark</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK CATEGORY EDIT MODAL ── */}
      {categoryModalMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-white border-stone-300 text-stone-900"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-white/[0.08]">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  🏷️ Member Category Badlein
                </h3>
                <p className="text-xs font-mono text-sky-500 mt-0.5">
                  {categoryModalMember.fullName || categoryModalMember.name} (🆔 {categoryModalMember.name})
                </p>
              </div>
              <button
                onClick={() => setCategoryModalMember(null)}
                className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 block">
                Category / Tag Select Karein:
              </label>
              <select
                value={["", "Diabetic / Sugar", "BP / Hypertension", "Loan", "Investment", "Health / Rogsetu", "General"].includes(editCategoryVal) ? editCategoryVal : "custom"}
                onChange={(e) => {
                  if (e.target.value !== "custom") setEditCategoryVal(e.target.value)
                  else setEditCategoryVal("custom")
                }}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? "bg-stone-800 border-white/[0.1] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                }`}
              >
                <option value="">-- Bina Category / None --</option>
                <option value="Diabetic / Sugar">🩸 Diabetic / Sugar</option>
                <option value="BP / Hypertension">💓 BP / Hypertension</option>
                <option value="Loan">💳 Loan</option>
                <option value="Investment">📈 Investment</option>
                <option value="Health / Rogsetu">🌿 Health / Rogsetu</option>
                <option value="General">🏷️ General</option>
                <option value="custom">✏️ Custom Tag Likhein...</option>
              </select>

              {(!["", "Diabetic / Sugar", "BP / Hypertension", "Loan", "Investment", "Health / Rogsetu", "General"].includes(editCategoryVal) || editCategoryVal === "custom") && (
                <input
                  type="text"
                  placeholder="Apni pasand ki category likhein..."
                  value={editCategoryVal === "custom" ? "" : editCategoryVal}
                  onChange={(e) => setEditCategoryVal(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? "bg-black/50 border-white/[0.12]" : "bg-stone-50 border-stone-300"
                  }`}
                />
              )}

              <p className="text-[11px] text-stone-400">
                💡 Category set karne se Team Radar me Diabetic, BP, Loan, Investment wagera ke hisab se members ko aasani se filter kiya ja sakta hai.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setCategoryModalMember(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                  isDark ? "border-white/[0.1] text-stone-300 hover:bg-stone-800" : "border-stone-300 text-stone-700 hover:bg-stone-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingCategory}
                onClick={() => handleUpdateCategory(categoryModalMember._id, editCategoryVal === "custom" ? "" : editCategoryVal)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-black text-xs shadow hover:bg-blue-500 disabled:opacity-50"
              >
                {savingCategory ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WHATSAPP BROADCAST MODAL ── */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`w-full max-w-2xl p-5 sm:p-6 rounded-3xl border shadow-2xl space-y-4 max-h-[92vh] flex flex-col ${
            isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-white border-stone-300 text-stone-900"
          }`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-3 border-white/[0.08]">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  📢 WhatsApp Personalized Broadcast
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Filtered Target: <strong className="text-emerald-500">{filteredMembers.length} Members</strong> (
                  Role: <span className="font-mono text-blue-400">{roleFilter.toUpperCase()}</span>,
                  Category: <span className="font-mono text-amber-400">{categoryFilter}</span>)
                </p>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Template Selector & Live Preview */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-400 block mb-1">
                    Template Select Karein:
                  </label>
                  <select
                    value={broadcastTemplate}
                    onChange={(e) => setBroadcastTemplate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                      isDark ? "bg-stone-800 border-white/[0.1] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                    }`}
                  >
                    <option value="followup">🔥 Re-engagement & Follow-Up (Inactivity)</option>
                    <option value="category">🩺 Health & Category Consultation (Personalized)</option>
                    <option value="offer">🎉 New Products & Special Store Offers</option>
                    <option value="custom">✏️ Custom Message (Placeholders Support)</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const phones = filteredMembers.map(m => m.phone).filter(Boolean).join(", ")
                      navigator.clipboard.writeText(phones)
                      alert("Sabhi phone numbers copy ho gaye! (" + phones.split(",").length + " numbers)")
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      isDark ? "border-white/[0.1] bg-stone-800 text-stone-300 hover:bg-stone-700" : "border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <span>📋</span> Copy All Numbers
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (filteredMembers[0]) {
                        const sampleMsg = getPersonalizedWaMessage(filteredMembers[0], broadcastTemplate, broadcastCustomText)
                        navigator.clipboard.writeText(sampleMsg)
                        alert("Message text copy ho gaya!")
                      }
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      isDark ? "border-white/[0.1] bg-stone-800 text-stone-300 hover:bg-stone-700" : "border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <span>📑</span> Copy Message
                  </button>
                </div>
              </div>

              {broadcastTemplate === "custom" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>Message Text (Placeholders: <code>{"{name}"}</code>, <code>{"{category}"}</code>, <code>{"{daysInactive}"}</code>, <code>{"{role}"}</code>):</span>
                  </div>
                  <textarea
                    rows={3}
                    value={broadcastCustomText}
                    onChange={(e) => setBroadcastCustomText(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? "bg-black/50 border-white/[0.12]" : "bg-stone-50 border-stone-300"
                    }`}
                  />
                </div>
              )}

              {/* Live Preview Box */}
              {filteredMembers.length > 0 && (
                <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                  isDark ? "bg-black/30 border-white/[0.06]" : "bg-emerald-50/50 border-emerald-200 text-stone-800"
                }`}>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-500 uppercase">
                    <span>💬 Live Preview (For: {filteredMembers[0]?.fullName || filteredMembers[0]?.name})</span>
                    <span>Category: {filteredMembers[0]?.category || "None"}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-stone-300 dark:text-stone-300 text-stone-800 text-[11px] font-medium leading-relaxed">
                    {getPersonalizedWaMessage(filteredMembers[0], broadcastTemplate, broadcastCustomText)}
                  </p>
                </div>
              )}
            </div>

            {/* Progress Bar & Status */}
            {bulkProgress.statusText && (
              <div className={`p-3 rounded-2xl border text-xs ${bulkProgress.done ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-blue-500/15 border-blue-500/30 text-blue-400"}`}>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>{bulkProgress.statusText}</span>
                  <span>{bulkProgress.current} / {bulkProgress.total}</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${bulkProgress.total ? Math.min(100, (bulkProgress.current / bulkProgress.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* API Notice / Guidance */}
            {apiNotice && (
              <div className="p-3.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-400">
                  <span>ℹ️</span>
                  <span>Bina WhatsApp Tab Khole Background Bhejne Ki Jaankari:</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  WhatsApp browser ko bina user click ya API ke secretly message bhejna allow nahi karta.
                  Backend me bina koi tab khole direct bhejne ke liye <b>Meta WhatsApp Cloud API (Free 1000 msgs)</b> ya <b>UltraMsg</b> API keys lagti hain.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => runSingleTabAutoSequence(filteredMembers)}
                    disabled={isBulkSending}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black font-black text-xs shadow hover:bg-amber-400"
                  >
                    ⚡ 1-Tab Auto Send Chalu Karein (Single Tab Mode)
                  </button>
                </div>
              </div>
            )}

            {/* Sequence Runner & Member Checklist */}
            <div className="flex-1 overflow-y-auto space-y-2 border-t border-b border-white/[0.08] py-2 max-h-[300px] pr-1">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 px-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-stone-200">
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.size > 0 && selectedMemberIds.size === filteredMembers.filter(m => m.phone).length}
                    onChange={() => toggleSelectAll(filteredMembers)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500"
                  />
                  <span>Sabhi Select / Deselect ({selectedMemberIds.size} / {filteredMembers.length})</span>
                </label>
                <span className="text-emerald-500 font-bold">
                  Sent: {sentBroadcastIds.size} / {filteredMembers.length}
                </span>
              </div>

              {filteredMembers.map((member, idx) => {
                const isSent = sentBroadcastIds.has(member._id)
                const isChecked = selectedMemberIds.has(member._id)
                return (
                  <div
                    key={member._id}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      isSent
                        ? isDark ? "bg-emerald-950/20 border-emerald-500/30" : "bg-emerald-50/70 border-emerald-300"
                        : isChecked
                        ? isDark ? "bg-blue-950/20 border-blue-500/30" : "bg-blue-50/50 border-blue-200"
                        : isDark ? "bg-black/20 border-white/[0.06] opacity-60" : "bg-stone-50 border-stone-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectMember(member._id)}
                        disabled={!member.phone || isBulkSending}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500 shrink-0"
                      />
                      <span className="font-mono text-[11px] text-stone-500 w-5">#{idx + 1}</span>
                      <div className="min-w-0">
                        <div className="font-bold truncate flex items-center gap-1.5">
                          <span>{member.fullName || member.name}</span>
                          {member.category && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 font-normal">
                              {getCategoryIcon(member.category)} {member.category}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono truncate">
                          🆔 {member.name} · 📞 {member.phone || "No phone"} · Inactive: {member.daysInactive !== null ? `${member.daysInactive}d` : "0d"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSent ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-500 font-bold text-[11px] border border-emerald-500/30">
                          Sent ✅
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendBroadcastToMember(member)}
                          disabled={!member.phone || isBulkSending}
                          className="px-3 py-1.5 rounded-xl bg-green-500 text-white font-bold text-xs shadow hover:bg-green-600 disabled:opacity-40 flex items-center gap-1"
                          title="Is member ka chat kholo (same window me)"
                        >
                          <span>💬 Send</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Bottom Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="text-xs text-stone-400 font-mono">
                {sentBroadcastIds.size === filteredMembers.length ? (
                  <span className="text-emerald-500 font-bold">🎉 Sabhi members ko WhatsApp message bhej diya gaya hai!</span>
                ) : (
                  <span>Selected: <strong>{selectedMemberIds.size}</strong> members</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  disabled={isBulkSending}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                    isDark ? "border-white/[0.1] text-stone-300 hover:bg-stone-800" : "border-stone-300 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  Close
                </button>

                {/* Single-Tab Sequential Auto Runner */}
                <button
                  type="button"
                  onClick={() => runSingleTabAutoSequence(filteredMembers)}
                  disabled={isBulkSending || selectedMemberIds.size === 0}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-white/[0.12] flex items-center gap-1.5 disabled:opacity-40"
                  title="Ek hi WhatsApp window me auto sequence chalao (28 tabs nahi khulenge)"
                >
                  <span>⚡ 1-Tab Auto Send</span>
                </button>

                {/* 1-Click Direct Send Button (Calls Backend API) */}
                <button
                  type="button"
                  onClick={() => handleBulkSendDirect(filteredMembers)}
                  disabled={isBulkSending || selectedMemberIds.size === 0}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs shadow-md hover:from-emerald-400 hover:to-green-500 flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  {isBulkSending ? (
                    <span>⏳ Bhej raha hai...</span>
                  ) : (
                    <span>🚀 1-Click Me Sabhi Ko Bhejo ({selectedMemberIds.size})</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
