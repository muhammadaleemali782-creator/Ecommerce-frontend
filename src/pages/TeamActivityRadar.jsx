import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import InlineLoader from "../components/InlineLoader"

const TAMPERMONKEY_SCRIPT = `// ==UserScript==
// @name         EDUCA WhatsApp 100% Hands-Free Auto-Send
// @namespace    https://educa-store.vercel.app/
// @version      1.2
// @description  Automatically clicks Send once on WhatsApp Web without needing to press Enter or click Send button
// @match        https://web.whatsapp.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';
  console.log('[EDUCA Auto-Send] Safe Engine Initialized');

  let lastSentUrl = "";
  let isSendingLock = false;

  function updateBadge(text, color = "#25D366") {
    let badge = document.getElementById('educa-wa-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'educa-wa-badge';
      badge.style.cssText = 'position:fixed;top:12px;right:80px;z-index:999999;padding:6px 14px;border-radius:20px;font-family:sans-serif;font-size:12px;font-weight:700;color:white;background:#111b21;border:2px solid ' + color + ';box-shadow:0 4px 15px rgba(0,0,0,0.5);pointer-events:none;';
      document.body.appendChild(badge);
    }
    badge.style.borderColor = color;
    badge.innerHTML = text;
  }

  function clickElement(el) {
    if (!el) return;
    try {
      const opts = { bubbles: true, cancelable: true, view: window };
      el.dispatchEvent(new MouseEvent('mousedown', opts));
      el.dispatchEvent(new MouseEvent('mouseup', opts));
      el.click();
    } catch (e) {}
  }

  function runAutoSend() {
    const currentUrl = window.location.href;

    if (lastSentUrl && lastSentUrl !== currentUrl) {
      lastSentUrl = "";
      isSendingLock = false;
    }

    if (lastSentUrl === currentUrl || isSendingLock) {
      updateBadge('🔒 Sent & Locked. Waiting for next contact...', '#00a884');
      return;
    }

    const input = document.querySelector('footer div[contenteditable="true"]')
      || document.querySelector('div[contenteditable="true"][data-tab="10"]');

    const hasText = input && input.innerText && input.innerText.trim().length > 0;
    if (!hasText) {
      updateBadge('⏳ EDUCA: Waiting for message text...', '#eab308');
      return;
    }

    let targetPhone = "";
    try {
      const urlParams = new URLSearchParams(window.location.search);
      targetPhone = urlParams.get('phone') || "";
    } catch (e) {}

    updateBadge('⚡ Sending to ' + (targetPhone || 'Contact') + '...', '#3b82f6');

    const sendBtn = document.querySelector('button[aria-label="Send"]')
      || document.querySelector('span[data-icon="send"]')?.closest('button')
      || document.querySelector('span[data-icon="wds-ic-send-solid"]')?.closest('button')
      || document.querySelector('[data-testid="send"]')?.closest('button')
      || document.querySelector('[data-testid="compose-btn-send"]')?.closest('button');

    if (sendBtn && !sendBtn.disabled) {
      const isVoice = sendBtn.querySelector('[data-icon*="ptt"]')
        || sendBtn.querySelector('[data-icon*="mic"]')
        || sendBtn.getAttribute('aria-label')?.toLowerCase().includes('voice')
        || sendBtn.getAttribute('aria-label')?.toLowerCase().includes('record');

      if (!isVoice) {
        isSendingLock = true;
        lastSentUrl = currentUrl;
        clickElement(sendBtn);
        updateBadge('✅ Sent to ' + (targetPhone || 'Contact') + '! Agla bnda aane de...', '#22c55e');
        return;
      }
    }

    if (hasText && !isSendingLock) {
      isSendingLock = true;
      lastSentUrl = currentUrl;
      input.focus();
      const enterOpts = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true };
      input.dispatchEvent(new KeyboardEvent('keydown', enterOpts));
      input.dispatchEvent(new KeyboardEvent('keyup', enterOpts));
      updateBadge('✅ Sent via Enter to ' + (targetPhone || 'Contact') + '!', '#22c55e');
    }
  }

  setInterval(runAutoSend, 600);
})();`

const PRESET_TEMPLATES = {
  followup: "Namaste {name} ji! 👋\n\nHumne notice kiya aapne pichle *{daysInactive}* dino se EDUCA VEDA me koi naya order nahi lagaya hai. Kisi bhi product guidance ya support ke liye humse connect karein!\n\n🛍️ Store Link: {storeLink}",
  category: "Namaste {name} ji! 👋\n\nAapke *{category}* related health requirements ke liye hamare paas pure Ayurvedic formulations aur expert solutions available hain.\n\nKoi bhi consultation ya order help chahiye toh batayein!\n🛍️ Store Link: {storeLink}",
  offer: "🎉 Namaste {name} ji!\n\nEDUCA VEDA par naye Ayurvedic formulations aur special health store offers live ho gaye hain! Apne manpasand products dekhne aur order karne ke liye visit karein:\n🛍️ Store Link: {storeLink}",
  group: "Namaste {name} ji ({role})! 🏢\n\nEDUCA VEDA me aapki team activity aur business growth ke liye hamari special schemes live hain. Apne direct sellers aur network ko active karein!\n\n🛍️ Store: {storeLink}",
  custom: "Namaste {name} ji! 👋\n\n"
}

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
  const [broadcastTemplate, setBroadcastTemplate] = useState("followup") // "followup" | "category" | "offer" | "group" | "custom"
  const [broadcastCustomText, setBroadcastCustomText] = useState(PRESET_TEMPLATES.followup)
  const [sentBroadcastIds, setSentBroadcastIds] = useState(new Set())
  const [broadcastIndex, setBroadcastIndex] = useState(0)
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set())
  const [isBulkSending, setIsBulkSending] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, statusText: "", done: false })
  const [apiNotice, setApiNotice] = useState("")
  const [showAutoSendGuide, setShowAutoSendGuide] = useState(false)
  const [autoSendDelay, setAutoSendDelay] = useState(6)
  const stopAutoSendRef = useRef(false)

  // Custom Groups state
  const [customGroups, setCustomGroups] = useState([])
  const [activeCustomGroup, setActiveCustomGroup] = useState("")
  const [showSaveGroupModal, setShowSaveGroupModal] = useState(false)
  const [groupNameInput, setGroupNameInput] = useState("")
  const [savingGroup, setSavingGroup] = useState(false)
  const [copiedStoreLink, setCopiedStoreLink] = useState(false)

  const token = localStorage.getItem("token")

  const loadCustomGroups = useCallback(async () => {
    try {
      const local = localStorage.getItem(`educa_groups_${authUser?._id}`)
      if (local) setCustomGroups(JSON.parse(local))
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/team/custom-groups`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.groups) {
          setCustomGroups(json.groups)
          localStorage.setItem(`educa_groups_${authUser?._id}`, JSON.stringify(json.groups))
        }
      }
    } catch (err) {
      console.warn("Could not load custom groups:", err)
    }
  }, [token, authUser])

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
    loadCustomGroups()
  }, [loadRadar, loadCustomGroups])

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
    const myStoreLink = `${window.location.origin}/?storeRef=${encodeURIComponent(authUser?.name || "")}&page=store`

    let msg = `Namaste ${waModalMember.fullName || waModalMember.name} ji! 👋\n\n`
    if (waTemplate === "followup") {
      msg += `Humne notice kiya aapne pichle ${waModalMember.daysInactive || "kuch"} dino se EDUCA VEDA me order nahi lagaya hai. Koi product guidance ya support chahiye toh batayein!\n\n🛍️ Store Link: ${myStoreLink}`
    } else if (waTemplate === "offer") {
      msg += `🎉 EDUCA VEDA par naye offers aur special products live ho gaye hain! Apne clients ke orders lagane ke liye store visit karein:\n\n🛍️ Store Link: ${myStoreLink}`
    } else {
      msg += `Kaise chal raha hai aapka business? Kisi bhi training, customer query ya order placement me help chahiye toh turant connect karein!\n\n🛍️ Store Link: ${myStoreLink}`
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

  const handleSaveCustomGroup = async (name, memberIds, existingId = null) => {
    if (!name || !name.trim()) return
    setSavingGroup(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/team/custom-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: existingId, name: name.trim(), memberIds })
      })
      const json = await res.json()
      if (json.success && json.group) {
        setCustomGroups(prev => {
          const filtered = prev.filter(g => g._id !== json.group._id)
          const next = [json.group, ...filtered]
          localStorage.setItem(`educa_groups_${authUser?._id}`, JSON.stringify(next))
          return next
        })
        setActiveCustomGroup(json.group._id)
        setShowSaveGroupModal(false)
        setGroupNameInput("")
        alert(`✅ Group "${json.group.name}" (${memberIds.length} members) save ho gaya!`)
      } else {
        const localGroup = { _id: existingId || `local_${Date.now()}`, name: name.trim(), memberIds }
        setCustomGroups(prev => {
          const next = [localGroup, ...prev.filter(g => g._id !== localGroup._id)]
          localStorage.setItem(`educa_groups_${authUser?._id}`, JSON.stringify(next))
          return next
        })
        setActiveCustomGroup(localGroup._id)
        setShowSaveGroupModal(false)
        setGroupNameInput("")
        alert(`✅ Group "${localGroup.name}" (${memberIds.length} members) save ho gaya!`)
      }
    } catch (err) {
      const localGroup = { _id: existingId || `local_${Date.now()}`, name: name.trim(), memberIds }
      setCustomGroups(prev => {
        const next = [localGroup, ...prev.filter(g => g._id !== localGroup._id)]
        localStorage.setItem(`educa_groups_${authUser?._id}`, JSON.stringify(next))
        return next
      })
      setActiveCustomGroup(localGroup._id)
      setShowSaveGroupModal(false)
      setGroupNameInput("")
      alert(`✅ Group "${localGroup.name}" (${memberIds.length} members) save ho gaya!`)
    } finally {
      setSavingGroup(false)
    }
  }

  const handleDeleteCustomGroup = async (groupId) => {
    if (!window.confirm("Kya aap is group ko delete karna chahte hain?")) return
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/team/custom-groups/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {}
    setCustomGroups(prev => {
      const next = prev.filter(g => g._id !== groupId)
      localStorage.setItem(`educa_groups_${authUser?._id}`, JSON.stringify(next))
      return next
    })
    if (activeCustomGroup === groupId) setActiveCustomGroup("")
  }

  const getPersonalizedWaMessage = (member, template, customText) => {
    const name = member.fullName || member.name || "Ji"
    const cat = member.category || "General Health"
    const role = member.role === "distributor" ? "Distributor" : member.role === "seller" ? "Direct Seller" : "Customer"
    const days = member.daysInactive !== null && member.daysInactive !== undefined ? `${member.daysInactive}` : "0"

    const myStoreLink = `${window.location.origin}/?storeRef=${encodeURIComponent(authUser?.name || "")}&page=store`
    const baseText = (customText && customText.trim()) ? customText : (PRESET_TEMPLATES[template] || PRESET_TEMPLATES.followup)

    return baseText
      .replace(/{name}/g, name)
      .replace(/{category}/g, cat)
      .replace(/{role}/g, role)
      .replace(/{daysInactive}/g, days)
      .replace(/{storeLink}/g, myStoreLink)
      .replace(/{phone}/g, member.phone || "")
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

  // Automated Single-Tab Runner (dispatches full queue to Extension v2.0 for 100% in-tab auto sequencing)
  const runSingleTabAutoSequence = async (targetList) => {
    const unsentMembers = targetList.filter(m => selectedMemberIds.has(m._id) && m.phone && !sentBroadcastIds.has(m._id))
    if (unsentMembers.length === 0) {
      alert("Sabhi selected members ko message bheja ja chuka hai.")
      return
    }

    const queue = []
    let invalidCount = 0

    for (const m of unsentMembers) {
      const cleanDigits = (m.phone || "").replace(/\D/g, "")
      let validPhone = ""
      if (cleanDigits.length === 10) {
        validPhone = `91${cleanDigits}`
      } else if (cleanDigits.length === 12 && cleanDigits.startsWith("91")) {
        validPhone = cleanDigits
      }

      if (validPhone) {
        queue.push({
          id: m._id,
          name: m.fullName || m.name,
          phone: validPhone,
          message: getPersonalizedWaMessage(m, broadcastTemplate, broadcastCustomText)
        })
      } else {
        invalidCount++
      }
    }

    if (queue.length === 0) {
      alert("Selected members me se kisi ke paas bhi valid 10-digit mobile number nahi hai.")
      return
    }

    setIsBulkSending(true)
    setBulkProgress({
      current: 1,
      total: queue.length,
      statusText: invalidCount > 0
        ? `🚀 Extension v2.2 active! ${queue.length} valid members ko bhej raha hai (${invalidCount} galat/9-digit numbers auto-skip kiye)...`
        : `🚀 Extension v2.2 active! WhatsApp Web par ${queue.length} members ka auto-broadcast shuru ho gaya...`,
      done: false
    })

    // Post queue to Extension Bridge (store-bridge.js)
    window.postMessage({
      type: "EDUCA_START_BROADCAST",
      queue: queue,
      delay: autoSendDelay || 5
    }, "*")

    // Open WhatsApp Web for the first contact in named tab
    const first = queue[0]
    const firstUrl = `https://web.whatsapp.com/send?phone=${first.phone}&text=${encodeURIComponent(first.message)}`
    window.open(firstUrl, "educa_wa_broadcast")

    // Record follow-up notes in backend
    for (const m of unsentMembers) {
      setSentBroadcastIds(prev => new Set([...prev, m._id]))
      try {
        fetch(`${import.meta.env.VITE_API_URL}/api/team/follow-up-note`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            memberId: m._id,
            note: `Auto Broadcast WhatsApp sent [${broadcastTemplate}]`,
            contactMethod: "whatsapp",
            status: "follow_up_taken"
          })
        })
      } catch {}
    }

    setTimeout(() => {
      setBulkProgress({
        current: queue.length,
        total: queue.length,
        statusText: `✅ Sabhi ${queue.length} members WhatsApp Web auto-sender me queued ho gaye! WhatsApp tab me live progress dekhein.`,
        done: true
      })
      setIsBulkSending(false)
      loadRadar()
    }, 2000)
  }

  if (loading) {
    return <InlineLoader label="Loading Team Pulse & Follow-Up Radar..." minHeight={300} />
  }

  const members = data?.members || []
  const counts = data?.counts || {}

  const presetCategories = ["Diabetic / Sugar", "BP / Hypertension", "Loan", "Investment", "Health / Rogsetu", "General"]
  const existingCategories = Array.from(new Set(members.map(m => m.category).filter(Boolean)))
  const allCategories = Array.from(new Set([...presetCategories, ...existingCategories]))

  const activeGroupObj = customGroups.find(g => g._id === activeCustomGroup)
  const activeGroupMemberSet = activeGroupObj ? new Set(activeGroupObj.memberIds?.map(String) || []) : null

  const filteredMembers = members.filter(m => {
    if (activeGroupMemberSet && !activeGroupMemberSet.has(String(m._id))) return false
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

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => {
              const storeUrl = `${window.location.origin}/?storeRef=${encodeURIComponent(authUser?.name || "")}&page=store`
              navigator.clipboard?.writeText(storeUrl)
              setCopiedStoreLink(true)
              setTimeout(() => setCopiedStoreLink(false), 2200)
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            title="Apna personal referral store link copy karein"
          >
            <span>{copiedStoreLink ? "✓ Link Copied!" : "🔗 Apna Store Link"}</span>
          </button>

          <div className="relative min-w-[220px]">
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

          {/* Custom Group Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 whitespace-nowrap">📁 Group:</span>
            <select
              value={activeCustomGroup}
              onChange={(e) => {
                const gid = e.target.value
                setActiveCustomGroup(gid)
                if (gid) {
                  const grp = customGroups.find(g => g._id === gid)
                  if (grp) {
                    setSelectedMemberIds(new Set(grp.memberIds.map(String)))
                  }
                }
              }}
              className={`text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold ${
                activeCustomGroup
                  ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                  : isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
              }`}
            >
              <option value="">Sabhi Groups ({customGroups.length} saved)</option>
              {customGroups.map(g => (
                <option key={g._id} value={g._id}>
                  📁 {g.name} ({g.memberIds?.length || 0} members)
                </option>
              ))}
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
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-white border-stone-300 text-stone-900"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-white/[0.08]">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  🏷️ Category / Custom Tag Badlein
                </h3>
                <p className="text-xs font-mono text-sky-500 mt-0.5">
                  {categoryModalMember.fullName || categoryModalMember.name} (Role: <span className="uppercase text-amber-400 font-bold">{categoryModalMember.role}</span>)
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
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1.5">
                  Category Name / Tag (Kuch bhi likhein ya neeche click karein):
                </label>
                <input
                  type="text"
                  placeholder="Kuch bhi likhein, e.g. Diabetic, Loan, VIP, BP, Wholesale..."
                  value={editCategoryVal}
                  onChange={(e) => setEditCategoryVal(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? "bg-black/60 border-white/[0.15] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                  }`}
                  autoFocus
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-stone-400 block mb-1.5">
                  ⚡ 1-Click Popular Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "🩸 Diabetic / Sugar", val: "Diabetic / Sugar" },
                    { label: "💓 BP / Hypertension", val: "BP / Hypertension" },
                    { label: "💳 Loan", val: "Loan" },
                    { label: "📈 Investment", val: "Investment" },
                    { label: "🌿 Health / Rogsetu", val: "Health / Rogsetu" },
                    { label: "⭐ VIP Member", val: "VIP Member" },
                    { label: "🔥 Active Seller", val: "Active Seller" },
                    { label: "🏢 Distributor Hub", val: "Distributor Hub" },
                    { label: "🛒 Wholesale Buyer", val: "Wholesale Buyer" },
                    { label: "❌ Clear / Khali", val: "" }
                  ].map((pill) => (
                    <button
                      key={pill.label}
                      type="button"
                      onClick={() => setEditCategoryVal(pill.val)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        editCategoryVal === pill.val
                          ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                          : isDark
                          ? "bg-stone-800/80 border-white/[0.08] text-stone-300 hover:bg-stone-700"
                          : "bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-stone-400 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/[0.05]">
                💡 <b>Benefit:</b> Category set karne ke baad aap Team Radar me Diabetic, Loan, BP, VIP wagera filter karke unhe alag-alag targeted WhatsApp messages bhej sakte hain.
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
                onClick={() => handleUpdateCategory(categoryModalMember._id, editCategoryVal.trim())}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-black text-xs shadow hover:bg-blue-500 disabled:opacity-50"
              >
                {savingCategory ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVE CUSTOM GROUP MODAL ── */}
      {showSaveGroupModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-white border-stone-300 text-stone-900"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-white/[0.08]">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  📁 Naya Custom Group Banayein
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Selected: <strong className="text-emerald-400">{selectedMemberIds.size} Members</strong>
                </p>
              </div>
              <button
                onClick={() => setShowSaveGroupModal(false)}
                className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1.5">
                  Group Ka Naam Likhein:
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP Delhi Team, Sugar Patients, Loan Leads, Top Sellers..."
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? "bg-black/60 border-white/[0.15] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                  }`}
                  autoFocus
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-stone-400 block mb-1.5">
                  ⚡ 1-Click Name Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "⭐ VIP Members",
                    "🩸 Diabetic Care Group",
                    "💓 BP Care Team",
                    "💳 Loan Leads",
                    "📈 Investment Group",
                    "🏢 Top Distributors",
                    "🛒 Direct Sellers Hub",
                    "🔥 High Active Network"
                  ].map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setGroupNameInput(sugg)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        groupNameInput === sugg
                          ? "bg-purple-600 text-white border-purple-500"
                          : isDark
                          ? "bg-stone-800 border-white/[0.08] text-stone-300 hover:bg-stone-700"
                          : "bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-300 leading-relaxed">
                💡 Is group ko save karne ke baad aap 1-click me in sabhi <b>{selectedMemberIds.size} members</b> ko filter karke personalized message bhej sakte hain.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowSaveGroupModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                  isDark ? "border-white/[0.1] text-stone-300 hover:bg-stone-800" : "border-stone-300 text-stone-700 hover:bg-stone-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingGroup || !groupNameInput.trim()}
                onClick={() => handleSaveCustomGroup(groupNameInput, Array.from(selectedMemberIds))}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-black text-xs shadow hover:bg-purple-500 disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingGroup ? "Saving..." : "💾 Save Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WHATSAPP BROADCAST MODAL ── */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`w-full max-w-2xl p-5 sm:p-6 rounded-3xl border shadow-2xl space-y-3.5 max-h-[94vh] flex flex-col ${
            isDark ? "bg-stone-900 border-white/[0.12] text-white" : "bg-white border-stone-300 text-stone-900"
          }`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-2.5 border-white/[0.08]">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  📢 WhatsApp Personalized Broadcast
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Filtered Target: <strong className="text-emerald-500">{filteredMembers.length} Members</strong> (
                  Role: <span className="font-mono text-blue-400">{roleFilter.toUpperCase()}</span>,
                  Category: <span className="font-mono text-amber-400">{categoryFilter}</span>
                  {activeCustomGroup && (
                    <>, Group: <span className="font-mono text-purple-400 font-bold">"{customGroups.find(g => g._id === activeCustomGroup)?.name || 'Custom'}"</span></>
                  )})
                </p>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            {/* In-Modal Group & Category Filter Bar */}
            <div className="p-2.5 rounded-2xl border bg-black/20 dark:bg-black/40 border-white/[0.08] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase text-stone-400 tracking-wider">🎯 Filter Recipients By Group:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(filteredMembers)}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                  >
                    ✓ Select All ({filteredMembers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMemberIds(new Set())}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg font-bold bg-stone-500/20 text-stone-400 border border-stone-500/30 hover:bg-stone-500/30 transition-all"
                  >
                    ✕ Deselect All
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Role Chips */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl border bg-black/20 border-white/[0.06] overflow-x-auto">
                  {[
                    { id: "all", label: "Sabhi Roles" },
                    { id: "user", label: "👤 Customers" },
                    { id: "seller", label: "🛒 Direct Sellers" },
                    { id: "distributor", label: "🏢 Distributors" },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRoleFilter(r.id)
                        setTimeout(() => {
                          const matched = members.filter(m => {
                            if (activeTab !== "all" && m.activityStatus !== activeTab) return false
                            if (r.id !== "all" && m.role !== r.id) return false
                            if (categoryFilter !== "all") {
                              if (categoryFilter === "none") { if (m.category) return false }
                              else if ((m.category || "").toLowerCase() !== categoryFilter.toLowerCase()) return false
                            }
                            return true
                          })
                          setSelectedMemberIds(new Set(matched.filter(m => m.phone).map(m => m._id)))
                        }, 50)
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        roleFilter === r.id
                          ? "bg-blue-600 text-white shadow-sm"
                          : isDark ? "text-stone-400 hover:text-white" : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[11px] font-bold text-stone-400">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      const val = e.target.value
                      setCategoryFilter(val)
                      setTimeout(() => {
                        const matched = members.filter(m => {
                          if (activeTab !== "all" && m.activityStatus !== activeTab) return false
                          if (roleFilter !== "all" && m.role !== roleFilter) return false
                          if (val !== "all") {
                            if (val === "none") { if (m.category) return false }
                            else if ((m.category || "").toLowerCase() !== val.toLowerCase()) return false
                          }
                          return true
                        })
                        setSelectedMemberIds(new Set(matched.filter(m => m.phone).map(m => m._id)))
                      }, 50)
                    }}
                    className={`text-xs px-2.5 py-1 rounded-xl border focus:outline-none font-bold ${
                      isDark ? "bg-stone-800 border-white/[0.12] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                    }`}
                  >
                    <option value="all">Sabhi Categories ({members.length})</option>
                    <option value="none">⚠️ Bina Category ({members.filter(m => !m.category).length})</option>
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

              {/* Custom Groups Filter & Creator Bar */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.08]">
                <span className="text-[11px] font-black text-amber-400 flex items-center gap-1 shrink-0">
                  <span>📁 Mere Groups:</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCustomGroup("")
                    setTimeout(() => {
                      setSelectedMemberIds(new Set(members.filter(m => m.phone).map(m => m._id)))
                    }, 50)
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    !activeCustomGroup
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                      : isDark ? "bg-stone-800/80 text-stone-400 border-white/[0.08] hover:text-white" : "bg-stone-100 text-stone-600 border-stone-300"
                  }`}
                >
                  Sabhi Members
                </button>

                {customGroups.map(grp => (
                  <div key={grp._id} className="inline-flex items-center shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCustomGroup(grp._id)
                        setTimeout(() => {
                          const matched = members.filter(m => grp.memberIds?.map(String).includes(String(m._id)))
                          setSelectedMemberIds(new Set(matched.filter(m => m.phone).map(m => m._id)))
                        }, 50)
                      }}
                      className={`px-2.5 py-1 rounded-l-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                        activeCustomGroup === grp._id
                          ? "bg-purple-600 text-white border-purple-500"
                          : isDark
                          ? "bg-purple-950/40 text-purple-300 border-purple-500/30 hover:bg-purple-900/50"
                          : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                      }`}
                    >
                      <span>📁 {grp.name}</span>
                      <span className="text-[10px] opacity-80 font-mono">({grp.memberIds?.length || 0})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomGroup(grp._id)}
                      className={`px-1.5 py-1 rounded-r-lg text-xs font-bold border-t border-b border-r transition-all ${
                        activeCustomGroup === grp._id
                          ? "bg-purple-700 text-purple-200 border-purple-500 hover:bg-red-600 hover:text-white"
                          : isDark
                          ? "bg-purple-950/60 text-purple-400 border-purple-500/30 hover:bg-red-600 hover:text-white"
                          : "bg-purple-100 text-purple-700 border-purple-200 hover:bg-red-600 hover:text-white"
                      }`}
                      title="Group delete karein"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Save Selected / Update Group */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMemberIds.size === 0) {
                      alert("Pehle neeche checklist se members ko tick karein jinhe group me rakhna hai.")
                      return
                    }
                    if (activeCustomGroup) {
                      const curr = customGroups.find(g => g._id === activeCustomGroup)
                      if (curr && window.confirm(`Group "${curr.name}" ko in selected (${selectedMemberIds.size}) members ke sath update karein?`)) {
                        handleSaveCustomGroup(curr.name, Array.from(selectedMemberIds), curr._id)
                        return
                      }
                    }
                    setShowSaveGroupModal(true)
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1 ml-auto"
                >
                  <span>➕</span>
                  <span>
                    {activeCustomGroup
                      ? `Update Group (${selectedMemberIds.size} Members)`
                      : `Selected (${selectedMemberIds.size}) Ka Naya Group Banayein`}
                  </span>
                </button>
              </div>
            </div>

            {/* Template Selector & Always-Visible Custom Message Editor */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-stone-400 shrink-0">
                    Template:
                  </label>
                  <select
                    value={broadcastTemplate}
                    onChange={(e) => {
                      const t = e.target.value
                      setBroadcastTemplate(t)
                      if (PRESET_TEMPLATES[t]) {
                        setBroadcastCustomText(PRESET_TEMPLATES[t])
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                      isDark ? "bg-stone-800 border-white/[0.1] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                    }`}
                  >
                    <option value="followup">🔥 Re-engagement & Follow-Up</option>
                    <option value="category">🩺 Health & Category Consultation</option>
                    <option value="offer">🎉 New Products & Store Offers</option>
                    <option value="group">🏢 Team & Distributor Growth Scheme</option>
                    <option value="custom">✏️ Custom Blank Message</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const phones = filteredMembers.map(m => m.phone).filter(Boolean).join(", ")
                      navigator.clipboard.writeText(phones)
                      alert("Sabhi phone numbers copy ho gaye! (" + phones.split(",").length + " numbers)")
                    }}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                      isDark ? "border-white/[0.1] bg-stone-800 text-stone-300 hover:bg-stone-700" : "border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <span>📋</span> Copy Numbers
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
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                      isDark ? "border-white/[0.1] bg-stone-800 text-stone-300 hover:bg-stone-700" : "border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <span>📑</span> Copy Message
                  </button>
                </div>
              </div>

              {/* Message Textarea with Placeholder Insertion Chips */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-stone-400">
                  <span className="font-bold">Apna Sandesh Likhein (Type / Edit Message):</span>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-stone-500">Insert:</span>
                    {[
                      { label: "{name}", tag: "{name}" },
                      { label: "{category}", tag: "{category}" },
                      { label: "{role}", tag: "{role}" },
                      { label: "{daysInactive}", tag: "{daysInactive}" },
                      { label: "{storeLink}", tag: "{storeLink}" },
                      { label: "{phone}", tag: "{phone}" },
                    ].map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => setBroadcastCustomText(prev => prev + " " + item.tag)}
                        className="px-1.5 py-0.5 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 font-mono text-[10px] border border-blue-500/20 transition-all"
                        title={`Click to insert ${item.tag}`}
                      >
                        +{item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={broadcastCustomText}
                  onChange={(e) => setBroadcastCustomText(e.target.value)}
                  placeholder="Yahan apna custom message likhein... (Placeholders: {name}, {category}, {role}, {daysInactive}, {storeLink})"
                  className={`w-full px-3 py-2 rounded-xl border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans ${
                    isDark ? "bg-black/60 border-white/[0.15] text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                  }`}
                />
              </div>

              {/* High-Contrast Live Preview Box */}
              {filteredMembers.length > 0 && (
                <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                  isDark ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-100" : "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span>💬 Live Preview</span>
                      <span className="text-white/80 font-sans">
                        (Target: <b>{filteredMembers[0]?.fullName || filteredMembers[0]?.name}</b> · Role: <span className="uppercase text-amber-400">{filteredMembers[0]?.role}</span> · Category: {filteredMembers[0]?.category || "Bina Category"})
                      </span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 border border-emerald-500/30">
                      Personalized
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap font-sans text-xs font-medium leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/[0.06] text-stone-100">
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

            {/* 100% Hands-Free Auto-Send Banner / Guide */}
            <div className={`p-3.5 rounded-2xl border ${
              showAutoSendGuide 
                ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300" 
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            } text-xs space-y-2.5 transition-all`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-black text-emerald-400">
                  <span className="text-base">🤖</span>
                  <span>100% Hands-Free Auto-Send (Bina Enter/Click Dikhaye Sabhi Ko Bhejein)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAutoSendGuide(!showAutoSendGuide)}
                  className="text-[11px] underline font-bold text-emerald-300 hover:text-emerald-200 shrink-0"
                >
                  {showAutoSendGuide ? "▲ Hide Guide" : "▼ Kaise Karein? (1-Min Setup)"}
                </button>
              </div>

              <p className="text-[11px] leading-relaxed opacity-90">
                Aapko Enter ya Send button par click <b>bhi na karna pade</b>, iske liye 1-baar Tampermonkey script install kar lein. Iske baad aap bas <b>"⚡ 1-Tab Auto Send"</b> dabayenge aur WhatsApp Web khud khulega, message khud send karega aur agle member par chala jayega!
              </p>

              {showAutoSendGuide && (
                <div className="space-y-3 pt-2 border-t border-emerald-500/20">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 space-y-1">
                      <div className="font-bold text-emerald-400">1️⃣ Step 1: Install Extension</div>
                      <p className="text-stone-300 text-[10.5px]">
                        Chrome me free <a href="https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-400">Tampermonkey Extension</a> add karein.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 space-y-1">
                      <div className="font-bold text-emerald-400">2️⃣ Step 2: Paste Script</div>
                      <p className="text-stone-300 text-[10.5px]">
                        Niche <b>"Copy Script"</b> dabayein, Tampermonkey me <b>"+"</b> (New Script) dabakar paste karein aur Ctrl+S save karein.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 space-y-1">
                      <div className="font-bold text-emerald-400">3️⃣ Step 3: 1-Click Send!</div>
                      <p className="text-stone-300 text-[10.5px]">
                        Ab yahan <b>"⚡ 1-Tab Auto Send"</b> dabayein — WhatsApp Web khud khulega, khud send hoga bina Enter dabaye!
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(TAMPERMONKEY_SCRIPT)
                        alert("✅ Auto-Send Script Copy Ho Gaya!\n\nTampermonkey extension khol kar '+' dabayein -> sara text hatakar paste karein -> Ctrl+S save karein.")
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs shadow flex items-center gap-1.5 transition-all"
                    >
                      <span>📋</span> Copy 100% Auto-Send Script
                    </button>

                    <a
                      href="https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                    >
                      🔗 Tampermonkey Extension (Chrome Store)
                    </a>
                  </div>
                </div>
              )}
            </div>

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
                        <div className="font-bold truncate flex items-center gap-1.5 flex-wrap">
                          <span>{member.fullName || member.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryModalMember(member)
                              setEditCategoryVal(member.category || "")
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all hover:scale-105 ${
                              member.category
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                                : "bg-stone-800 text-stone-400 border-dashed border-stone-600 hover:text-white"
                            }`}
                            title="Category tag badalna / set karna"
                          >
                            <span>{getCategoryIcon(member.category)} {member.category || "+ Add Tag"}</span>
                            <span className="text-[9px] opacity-70 ml-1">✏️</span>
                          </button>
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono truncate">
                          🆔 {member.name} · 📞 {member.phone || "No phone"} {(() => {
                            const d = (member.phone || "").replace(/\D/g, "")
                            if (d && d.length !== 10 && !(d.length === 12 && d.startsWith("91"))) {
                              return <span className="text-red-400 font-bold ml-1">⚠️ Wrong ({d.length} digits)</span>
                            }
                            return null
                          })()} · Inactive: {member.daysInactive !== null ? `${member.daysInactive}d` : "0d"}
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
                  <div className="flex items-center gap-3">
                    <span>Selected: <strong>{selectedMemberIds.size}</strong> members</span>
                    <label className="flex items-center gap-1 text-[11px] text-stone-400">
                      <span>Speed:</span>
                      <select
                        value={autoSendDelay}
                        onChange={(e) => setAutoSendDelay(Number(e.target.value))}
                        disabled={isBulkSending}
                        className="bg-black/30 border border-white/[0.1] rounded-lg px-2 py-0.5 text-xs text-white"
                      >
                        <option value={3}>3 sec / msg</option>
                        <option value={4}>4 sec / msg (Best)</option>
                        <option value={5}>5 sec / msg (Slow Net)</option>
                        <option value={6}>6 sec / msg</option>
                      </select>
                    </label>
                  </div>
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

                {/* Stop Auto Send Button (When active) */}
                {isBulkSending ? (
                  <button
                    type="button"
                    onClick={() => {
                      stopAutoSendRef.current = true
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 animate-pulse"
                  >
                    <span>🛑 Stop Auto Send</span>
                  </button>
                ) : (
                  /* Single-Tab Sequential Auto Runner */
                  <button
                    type="button"
                    onClick={() => runSingleTabAutoSequence(filteredMembers)}
                    disabled={selectedMemberIds.size === 0}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow flex items-center gap-1.5 disabled:opacity-40"
                    title="WhatsApp Web me auto send chalao (1 hi window me bina 28 tabs khole)"
                  >
                    <span>⚡ 1-Tab Auto Send</span>
                  </button>
                )}

                {/* 1-Click Direct Send Button (Calls Backend API) */}
                <button
                  type="button"
                  onClick={() => handleBulkSendDirect(filteredMembers)}
                  disabled={isBulkSending || selectedMemberIds.size === 0}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-white/[0.12] flex items-center justify-center gap-1.5 disabled:opacity-40"
                  title="Direct server API se bina koi tab khole bhejo (Requires Meta/UltraMsg key)"
                >
                  <span>🚀 Direct Server API</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
