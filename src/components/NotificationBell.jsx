import { useRef, useEffect, useState } from "react"
import { useNotifications } from "../context/NotificationContext"

/* ── Time ago helper ── */
function timeAgo(isoStr) {
  const diff  = Date.now() - new Date(isoStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return "abhi"
  if (mins  < 60) return `${mins}m pehle`
  if (hours < 24) return `${hours}h pehle`
  return `${days}d pehle`
}

/* ── Type → icon/color map ── */
const TYPE_META = {
  new_order:    { icon: "🛒", color: "#3b82f6" },
  dist_approved:{ icon: "✅", color: "#16a34a" },
  confirmed:    { icon: "🎉", color: "#7c3aed" },
  rejected:     { icon: "❌", color: "#dc2626" },
  general:      { icon: "🔔", color: "#f59e0b" },
}

export default function NotificationBell({ isMobile = false }) {
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    clearAll,
    deleteNotif,
    markAllRead,
    handleNotifClick,
  } = useNotifications()

  const panelRef = useRef(null)
  const [confirmNotif, setConfirmNotif] = useState(null) // jis notif pe confirm popup aana hai

  /* ✅ No document-level listener — ek invisible backdrop div use karenge jo sirf bahar click pe band karega */

  const handleOpen = () => setIsOpen(true)

  /* Bell box style */
  const bellBox = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width:  isMobile ? 36 : 38,
    height: isMobile ? 36 : 38,
    borderRadius: 10,
    border: isOpen
      ? "2px solid #f59e0b"
      : unreadCount > 0
        ? "2px solid #fbbf24"
        : "2px solid #e2e8f0",
    background: isOpen
      ? "#fef3c7"
      : unreadCount > 0
        ? "#fffbeb"
        : "#f8fafc",
    cursor: "pointer",
    boxShadow: unreadCount > 0 ? "0 0 0 3px rgba(251,191,36,0.2)" : "none",
    transition: "all 0.2s",
  }

  return (
    <div style={{ position: "relative", zIndex: isOpen ? 9999 : "auto" }} ref={panelRef}>

      {/* ── Bell Button ── */}
      <button onClick={handleOpen} title="Notifications" style={bellBox}>
        <span style={{ fontSize: isMobile ? 18 : 17 }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -6, right: -6,
            background: "#ef4444", color: "#fff",
            fontSize: 9, fontWeight: 800,
            borderRadius: "50%", minWidth: 17, height: 17,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px", border: "2px solid #fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Backdrop ── sirf yahan click se band hoga, panel ke andar kabhi nahi */}
      {isOpen && (
        <div onClick={() => setIsOpen(false)} style={{
          position: "fixed", top:0, left:0, right:0, bottom:0, zIndex: 9998,
        }} />
      )}

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div onClick={(e) => e.stopPropagation()} style={{
          position: "fixed",
          top: isMobile ? 56 : 68,
          right: isMobile ? 8 : 12,
          width: 350,
          maxHeight: 480,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
          border: "1px solid #fde68a",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", borderBottom: "1px solid #fef3c7",
            background: "linear-gradient(135deg, #fffbeb, #fef9ee)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔔</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: "#92400e" }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  background: "#ef4444", color: "#fff",
                  fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "1px 8px"
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {notifications.length > 0 && (
                <button onClick={(e) => { e.stopPropagation(); clearAll() }} style={{
                  fontSize: 11, color: "#9ca3af", background: "none",
                  border: "none", cursor: "pointer", fontWeight: 600, padding: "3px 6px", borderRadius: 6,
                }}>
                  Clear all
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(false) }} style={{
                fontSize: 15, color: "#9ca3af", background: "none",
                border: "none", cursor: "pointer", padding: "3px 5px", borderRadius: 6,
              }}>✕</button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 36, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#64748b" }}>
                  Koi notification nahi
                </p>
                <p style={{ fontSize: 11, margin: "4px 0 0", color: "#cbd5e1" }}>
                  Nayi activity hone par yahan dikhega
                </p>
              </div>
            ) : (
              notifications.map((notif, idx) => {
                const meta = TYPE_META[notif.type] || TYPE_META.general
                return (
                  <div
                    key={notif._id}
                    onClick={() => setConfirmNotif(notif)}
                    style={{
                      display: "flex", gap: 10,
                      padding: "11px 14px",
                      borderBottom: idx < notifications.length - 1 ? "1px solid #f8fafc" : "none",
                      background: notif.read ? "#fff" : "#fffbeb",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fef3c7"}
                    onMouseLeave={e => e.currentTarget.style.background = notif.read ? "#fff" : "#fffbeb"}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: meta.color + "18",
                      border: `1.5px solid ${meta.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {meta.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, fontWeight: notif.read ? 500 : 700,
                        color: "#1e293b", margin: 0, lineHeight: 1.45,
                      }}>
                        {notif.message}
                      </p>
                      {/* ✅ Sender name */}
                      {notif.senderName && (
                        <p style={{ fontSize: 10, color: "#7c3aed", margin: "2px 0 0", fontWeight: 600 }}>
                          👤 {notif.senderName} ({notif.senderRole})
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
                          {timeAgo(notif.createdAt)}
                        </p>
                        {notif.targetPage && (
                          <span
                            onClick={() => setConfirmNotif(notif)}
                            style={{
                              fontSize: 9, color: "#3b82f6", background: "#eff6ff",
                              borderRadius: 4, padding: "1px 5px", fontWeight: 600,
                              cursor: "pointer"
                            }}>
                            👆 Tap to view →
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side: delete btn + unread dot */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id) }}
                        style={{ background:"none", border:"none", cursor:"pointer",
                          fontSize:14, color:"#94a3b8", lineHeight:1,
                          padding:"2px 4px", borderRadius:4 }}
                        title="Hatao">
                        ✕
                      </button>
                      {!notif.read && (
                        <div style={{ width:8, height:8, borderRadius:"50%",
                          background:"#f59e0b", flexShrink:0 }} />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
      {/* ✅ Redirect Confirmation Popup - wrapper div ke ANDAR */}
      {confirmNotif && (
        <div data-confirm-popup="true" style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:10000,
          display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => setConfirmNotif(null)}>
          <div style={{ background:"#fff", borderRadius:16, padding:"24px 20px",
            width:"min(320px, 88vw)", boxShadow:"0 10px 40px rgba(0,0,0,0.2)",
            textAlign:"center" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:36, marginBottom:8 }}>📬</div>
            <div style={{ fontSize:15, fontWeight:800, color:"#1e293b", marginBottom:6 }}>
              {confirmNotif.message || "Notification"}
            </div>
            {confirmNotif.senderName && (
              <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>
                From: {confirmNotif.senderName}
              </div>
            )}
            {confirmNotif.targetPage && (
              <div style={{ fontSize:12, color:"#64748b", marginBottom:16,
                background:"#f8fafc", borderRadius:8, padding:"6px 10px" }}>
                📍 Page: <b>{confirmNotif.targetPage}</b>
              </div>
            )}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmNotif(null)}
                style={{ flex:1, padding:"11px 0", borderRadius:10,
                  border:"1.5px solid #e2e8f0", background:"#fff",
                  color:"#64748b", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                ❌ Cancel
              </button>
              <button onClick={() => { handleNotifClick(confirmNotif); setConfirmNotif(null) }}
                style={{ flex:1, padding:"11px 0", borderRadius:10, border:"none",
                  background:"#2563eb", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                ✅ Haan, Jao!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
