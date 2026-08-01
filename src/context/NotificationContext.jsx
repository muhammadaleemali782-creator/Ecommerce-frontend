import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"

const NotificationContext = createContext(null)
const API = `${import.meta.env.VITE_API_URL}/api/notifications`

/* ─────────────────────────────────────────
   PROVIDER
───────────────────────────────────────── */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [isOpen,        setIsOpenState]  = useState(false)
  const isOpenRef = useRef(false)
  const setIsOpen = useCallback((val) => {
    setIsOpenState(prev => {
      const next = typeof val === "function" ? val(prev) : val
      isOpenRef.current = next
      return next
    })
  }, [])
  const [setPageFn,     setSetPageFn]     = useState(null)   // App se setPage register hoga
  const pollRef = useRef(null)
  const seenIdsRef = useRef(new Set())   // ✅ App wale bridge ke liye — kaunse notif already alert kar chuke
  const firstFetchRef = useRef(true)     // pehli fetch pe purani sab notifs ke liye phone na baje

  /* ── token helper ── */
  const getToken = () => localStorage.getItem("token")
  const isLoggedIn = () => !!getToken()

  /* ── unread count ── */
  const unreadCount = notifications.filter(n => !n.read).length

  /* ── Fetch all notifications from backend ── */
  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn()) return
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) {
        setNotifications(data)

        // 📱 Naya unread notif mila to Android app me sound+vibration ke
        // saath native notification bhi dikhao (sirf app ke andar, jab
        // window.AndroidNotify available ho — normal web browser me kuch nahi hota)
        if (window.AndroidNotify && typeof window.AndroidNotify.notify === "function") {
          const freshUnread = data.filter(n => !n.read && !seenIdsRef.current.has(n._id))
          if (!firstFetchRef.current) {
            freshUnread.forEach(n => {
              try {
                window.AndroidNotify.notify(n.senderName || "EDUCA Store", n.message || "Naya update aaya hai")
              } catch {}
            })
          }
          data.forEach(n => seenIdsRef.current.add(n._id))
        }
        firstFetchRef.current = false
      }
    } catch {
      /* silent fail */
    }
  }, [])

  /* ── Start 5s real-time polling ── */
  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    fetchNotifications() // immediate first fetch
    pollRef.current = setInterval(() => {
      // ✅ Panel open ho to refetch skip karo
      if (!isOpenRef.current) fetchNotifications()
    }, 12000) // every 12s - kam flicker
  }, [fetchNotifications])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  /* ── Auto start/stop on login/logout ── */
  useEffect(() => {
    if (isLoggedIn()) startPolling()

    const onStorage = () => {
      if (isLoggedIn()) startPolling()
      else {
        stopPolling()
        setNotifications([])
      }
    }
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("storage", onStorage)
      stopPolling()
    }
  }, [startPolling, stopPolling])

  /* ── Delete single notification (on click/open) ── */
  const deleteNotif = useCallback(async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id))
    try {
      await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      })
    } catch {}
  }, [])

  /* ── Mark all as read ── */
  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await fetch(`${API}/mark-read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` }
      })
    } catch {}
  }, [])

  /* ── Clear all notifications ── */
  const clearAll = useCallback(async () => {
    setNotifications([])
    try {
      await fetch(`${API}/clear/all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      })
    } catch {}
  }, [])

  /* ── Click notification → redirect + delete ── */
  const handleNotifClick = useCallback(async (notif) => {
    // 1. Delete from backend + UI immediately
    await deleteNotif(notif._id)

    // 2. Close panel
    setIsOpen(false)

    // 3. Redirect to targetPage
    if (notif.targetPage && setPageFn) {
      setPageFn(notif.targetPage)
    }
  }, [deleteNotif, setPageFn])

  /* ── Register setPage from App.jsx ── */
  const registerSetPage = useCallback((fn) => {
    setSetPageFn(() => fn)
  }, [])

  /* ── Page-wise unread counts (for navbar badges) ── */
  const pageBadge = {}
  notifications.filter(n => !n.read && n.targetPage).forEach(n => {
    pageBadge[n.targetPage] = (pageBadge[n.targetPage] || 0) + 1
  })

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      pageBadge,
      isOpen,
      setIsOpen,
      markAllRead,
      clearAll,
      deleteNotif,
      handleNotifClick,
      registerSetPage,
      fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

/* ─────────────────────────────────────────
   HOOK
───────────────────────────────────────── */
export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider")
  return ctx
}
