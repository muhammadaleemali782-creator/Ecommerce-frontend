import { useEffect, useState, useMemo } from "react"
import { getRoleLabel } from "../utils/roleLabels"
import { useTheme } from "../context/ThemeContext"

export default function AdminUsers() {
  const { isDark } = useTheme()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [tab, setTab] = useState("active") // "active" | "deleted"
  const [refreshKey, setRefreshKey] = useState(0)
  const [editModal, setEditModal] = useState(null) // user object being edited
  const [editForm, setEditForm] = useState({ fullName: "", name: "", phone: "", address: "" })
  const [editSaving, setEditSaving] = useState(false)

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/all-for-product`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      let data = []
      try { data = await res.json() } catch {}

      if (!res.ok) return

      if (Array.isArray(data)) {
        setUsers(data)
      }
    } catch (err) {
      console.error("Load users error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [users])

  /* ================= BLOCK / UNBLOCK USER ================= */
  const toggleBlock = async (id, isBlocked) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) { alert("Login again"); return }

      setActionLoading(id)
      const url = isBlocked
        ? `${import.meta.env.VITE_API_URL}/admin/unblock-user/${id}`
        : `${import.meta.env.VITE_API_URL}/admin/block-user/${id}`

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      let data = {}
      try { data = await res.json() } catch {}

      if (!res.ok) {
        alert(data.message || "Action failed")
        return
      }

      await loadUsers()
    } catch (err) {
      console.error("Toggle block error:", err)
      alert("Something went wrong")
    } finally {
      setActionLoading(null)
    }
  }

  /* ================= SOFT DELETE USER ================= */
  const deleteUser = async (id) => {
    try {
      if (!window.confirm("Soft delete this user? They will be moved to Deleted tab.")) return

      const token = localStorage.getItem("token")
      if (!token) { alert("Login again"); return }

      setActionLoading(id)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/delete-user/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      let data = {}
      try { data = await res.json() } catch {}

      if (!res.ok) {
        alert(data.message || "Delete failed")
        return
      }

      await loadUsers()
    } catch (err) {
      console.error("Delete error:", err)
      alert("Something went wrong")
    } finally {
      setActionLoading(null)
    }
  }

  /* ================= RESTORE USER ================= */
  const restoreUser = async (id) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) { alert("Login again"); return }

      setActionLoading(id)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/restore-user/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      let data = {}
      try { data = await res.json() } catch {}

      if (!res.ok) {
        alert(data.message || "Restore failed")
        return
      }

      await loadUsers()
    } catch (err) {
      console.error("Restore error:", err)
      alert("Something went wrong")
    } finally {
      setActionLoading(null)
    }
  }

  /* ================= PERMANENT DELETE USER ================= */
  const permanentDeleteUser = async (id) => {
    try {
      if (!window.confirm("🚨 DANGER: Permanently delete this user from database? This cannot be undone!")) return

      const token = localStorage.getItem("token")
      if (!token) { alert("Login again"); return }

      setActionLoading(id)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/permanent-delete-user/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      let data = {}
      try { data = await res.json() } catch {}

      if (!res.ok) {
        alert(data.message || "Permanent delete failed")
        return
      }

      alert("User permanently deleted 🗑️")
      await loadUsers()
    } catch (err) {
      console.error("Permanent delete error:", err)
      alert("Permanent delete failed")
    } finally {
      setActionLoading(null)
    }
  }

  /* ================= RESET PASSWORD ================= */
  const resetPassword = async (id) => {
    try {
      if (!window.confirm("Generate temporary password for this user?")) return

      const token = localStorage.getItem("token")
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/reset-password/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const data = await res.json()
      if (!res.ok) {
        alert(data.message || "Password reset failed")
        return
      }

      alert("Temporary password: " + data.tempPassword)
    } catch (err) {
      console.error("Reset password error:", err)
      alert("Something went wrong")
    }
  }

  /* ================= EDIT USER PROFILE ================= */
  const handleOpenEdit = (user) => {
    setEditModal(user)
    setEditForm({
      fullName: user.fullName || "",
      name:     user.name     || "",
      phone:    user.phone    || "",
      address:  user.address  || ""
    })
  }

  const handleSaveEdit = async () => {
    if (!editModal) return
    try {
      setEditSaving(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/admin/update/${editModal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (res.ok) {
        alert("✅ User profile updated successfully!")
        setEditModal(null)
        if (selectedUser && selectedUser._id === editModal._id) {
          setSelectedUser(prev => ({ ...prev, ...editForm }))
        }
        await loadUsers()
      } else {
        alert("❌ " + (data.msg || data.message || "Update failed"))
      }
    } catch (err) {
      alert("Error: " + err.message)
    } finally {
      setEditSaving(false)
    }
  }

  const activeUsers = useMemo(() => users.filter(u => !u.isDeleted), [users])
  const deletedUsers = useMemo(() => users.filter(u => u.isDeleted), [users])

  const targetList = tab === "active" ? activeUsers : deletedUsers

  const filteredUsers = useMemo(() => {
    return targetList.filter(u => {
      const q = search.toLowerCase().trim()
      const matchesSearch = !q || 
        (u.name || "").toLowerCase().includes(q) || 
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q)
      const matchesRole = roleFilter === "all" || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [targetList, search, roleFilter])

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>
      
      {/* ── HEADER ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDark
          ? "bg-[#121814] border-white/[0.08]"
          : "bg-white border-stone-200 shadow-sm"
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ USER ACCOUNTS & DIRECTORY
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            User Accounts & Team Management
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>
            Active Accounts: <span className="text-emerald-500 dark:text-emerald-400 font-bold">{activeUsers.length}</span> · Soft Deleted: <span className="text-red-500 dark:text-red-400 font-bold">{deletedUsers.length}</span>
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
              isDark
                ? "bg-black/40 border-white/10 text-white placeholder:text-stone-500 focus:border-[#fbbf24]"
                : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
            }`}
          />
        </div>
      </div>

      {/* ── CONTROLS & TABS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Active vs Deleted Tabs */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-stone-100 border-stone-200"
        }`}>
          <button
            onClick={() => setTab("active")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              tab === "active"
                ? "bg-emerald-600 text-white shadow-sm font-black"
                : isDark ? "text-stone-400 hover:text-white" : "text-stone-600 hover:text-black"
            }`}
          >
            Active ({activeUsers.length})
          </button>
          <button
            onClick={() => setTab("deleted")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              tab === "deleted"
                ? "bg-red-700 text-white shadow-sm font-black"
                : isDark ? "text-stone-400 hover:text-white" : "text-stone-600 hover:text-black"
            }`}
          >
            Deleted ({deletedUsers.length})
          </button>
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { key: "all", label: "All Roles" },
            { key: "distributor", label: "Distributors" },
            { key: "seller", label: "Sellers" },
            { key: "user", label: "Customers" },
          ].map(r => (
            <button
              key={r.key}
              onClick={() => setRoleFilter(r.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                roleFilter === r.key
                  ? "bg-[#fbbf24] text-black font-black border-[#fbbf24]"
                  : isDark
                  ? "bg-[#111713] text-stone-300 hover:bg-white/10 border-white/[0.08]"
                  : "bg-white text-stone-700 hover:bg-stone-100 border-stone-200 shadow-sm"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="text-center py-12 text-stone-400 text-xs font-mono animate-pulse">
          Loading user records...
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && filteredUsers.length === 0 && (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <span className="text-3xl block mb-2">👥</span>
          <h3 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>
            No Users Found
          </h3>
          <p className={`text-xs mt-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
            Try another search keyword or filter tab.
          </p>
        </div>
      )}

      {/* ── USER CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredUsers.map(user => {
          const isDeleted = user.isDeleted
          const roleLabel = getRoleLabel(user.role)
          const isBusy = actionLoading === user._id

          return (
            <div
              key={user._id + refreshKey}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isDeleted
                  ? isDark ? "bg-[#140e0e] border-red-500/20" : "bg-red-50/50 border-red-200"
                  : isDark
                  ? "bg-[#111713] border-white/[0.08] hover:border-white/20"
                  : "bg-white border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md"
              }`}
            >
              <div>
                {/* User Head */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-base font-black shrink-0 shadow-sm">
                      {(user.fullName || user.name || "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm font-black truncate ${
                        isDark ? "text-white" : "text-stone-900"
                      }`}>
                        {user.fullName || user.name}
                      </h3>
                      <p className={`text-xs truncate ${
                        isDark ? "text-stone-400" : "text-stone-500"
                      }`}>
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase tracking-wider shrink-0 border ${
                    user.role === "distributor"
                      ? "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30"
                      : user.role === "seller"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30"
                  }`}>
                    {roleLabel}
                  </span>
                </div>

                {/* Status Badges */}
                <div className={`flex items-center gap-2 mt-3 pt-2 border-t text-xs ${
                  isDark ? "border-white/[0.06]" : "border-stone-100"
                }`}>
                  {user.isBlocked ? (
                    <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-300 border border-red-500/30 text-[10px] font-bold">
                      🚫 Blocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      ✅ Active
                    </span>
                  )}
                  {user.phone && (
                    <span className={`text-[11px] font-mono ${
                      isDark ? "text-stone-400" : "text-stone-500"
                    }`}>
                      📞 {user.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`pt-3 border-t flex items-center gap-1.5 flex-wrap ${
                isDark ? "border-white/[0.06]" : "border-stone-100"
              }`}>
                {/* View Details */}
                <button
                  onClick={() => setSelectedUser(user)}
                  className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isDark ? "bg-white/[0.06] hover:bg-white/10 text-stone-200" : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                  }`}
                >
                  👁 View
                </button>

                {!isDeleted ? (
                  <>
                    <button
                      disabled={isBusy}
                      onClick={() => toggleBlock(user._id, user.isBlocked)}
                      className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 border ${
                        user.isBlocked
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                      }`}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>

                    <button
                      disabled={isBusy}
                      onClick={() => deleteUser(user._id)}
                      className="py-1.5 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => resetPassword(user._id)}
                      className="py-1.5 px-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      Reset Pass
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      disabled={isBusy}
                      onClick={() => restoreUser(user._id)}
                      className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Restore User
                    </button>

                    <button
                      disabled={isBusy}
                      onClick={() => permanentDeleteUser(user._id)}
                      className="py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Permanent Delete
                    </button>
                  </>
                )}
              </div>

            </div>
          )
        })}
      </div>

      {/* ── USER DETAIL MODAL ── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`border rounded-3xl shadow-2xl w-full max-w-md p-6 relative select-none ${
            isDark ? "bg-[#121814] border-white/[0.12] text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            
            {/* Close */}
            <button
              onClick={() => setSelectedUser(null)}
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer ${
                isDark ? "bg-white/[0.08] hover:bg-white/[0.16] text-stone-300 hover:text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-black"
              }`}
            >
              ✕
            </button>

            {/* Avatar Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-lg">
                {(selectedUser.fullName || selectedUser.name || "?")[0].toUpperCase()}
              </div>
              <div>
                <h2 className={`text-lg font-black leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
                  {selectedUser.fullName || selectedUser.name}
                </h2>
                <p className={`text-xs font-mono ${isDark ? "text-stone-400" : "text-stone-500"}`}>{selectedUser.email}</p>
                <span className="mt-1 inline-block text-[9.5px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/30 uppercase font-bold">
                  {getRoleLabel(selectedUser.role)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className={`space-y-2.5 text-xs p-4 rounded-2xl border ${
              isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-200"
            }`}>
              <div className={`flex justify-between py-1 border-b ${isDark ? "border-white/[0.04]" : "border-stone-200/60"}`}>
                <span className={isDark ? "text-stone-400" : "text-stone-500"}>📞 Phone:</span>
                <span className="font-bold">{selectedUser.phone || "—"}</span>
              </div>
              <div className={`flex justify-between py-1 border-b ${isDark ? "border-white/[0.04]" : "border-stone-200/60"}`}>
                <span className={isDark ? "text-stone-400" : "text-stone-500"}>📍 Address:</span>
                <span className="font-bold text-right max-w-[200px] truncate">{selectedUser.address || "—"}</span>
              </div>
              <div className={`flex justify-between py-1 border-b ${isDark ? "border-white/[0.04]" : "border-stone-200/60"}`}>
                <span className={isDark ? "text-stone-400" : "text-stone-500"}>🆔 System ID:</span>
                <span className="font-mono text-amber-600 dark:text-[#fbbf24] font-bold">{selectedUser.name}</span>
              </div>
              <div className={`flex justify-between py-1 border-b ${isDark ? "border-white/[0.04]" : "border-stone-200/60"}`}>
                <span className={isDark ? "text-stone-400" : "text-stone-500"}>👆 Reports To:</span>
                <span className="font-bold">
                  {users.find(u => String(u._id) === String(selectedUser.parentId))?.name || "—"}
                </span>
              </div>
              <div className={`flex justify-between py-1 border-b ${isDark ? "border-white/[0.04]" : "border-stone-200/60"}`}>
                <span className={isDark ? "text-stone-400" : "text-stone-500"}>📅 Joined Date:</span>
                <span className="font-bold">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isDark ? "text-stone-400" : "text-stone-500"}>🔰 Status:</span>
                {selectedUser.isBlocked ? (
                  <span className="text-red-500 font-bold">🚫 Blocked</span>
                ) : (
                  <span className="text-emerald-500 font-bold">✅ Active</span>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  const u = selectedUser
                  setSelectedUser(null)
                  handleOpenEdit(u)
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  isDark ? "bg-white/[0.08] hover:bg-white/15 text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`border rounded-3xl shadow-2xl w-full max-w-md p-6 relative select-none space-y-4 ${
            isDark ? "bg-[#121814] border-white/[0.12] text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <h3 className="text-base font-black uppercase">Edit User Profile</h3>
              </div>
              <button
                onClick={() => setEditModal(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer ${
                  isDark ? "bg-white/[0.08] hover:bg-white/15 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                ✕
              </button>
            </div>

            <p className={`text-xs ${isDark ? "text-stone-400" : "text-stone-500"}`}>
              Update real full name, system ID handle, phone, and address for <b>{editModal.email}</b>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1 text-stone-400">
                  👤 Real Full Name
                </label>
                <input
                  value={editForm.fullName}
                  onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="e.g. Muhammad Aleem Ali"
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isDark ? "bg-black/40 border-white/10 text-white placeholder:text-stone-600 focus:border-[#fbbf24]" : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1 text-stone-400">
                  🆔 System ID / Username
                </label>
                <input
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. DB001"
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none font-mono ${
                    isDark ? "bg-black/40 border-white/10 text-white placeholder:text-stone-600 focus:border-[#fbbf24]" : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1 text-stone-400">
                  📞 Phone Number
                </label>
                <input
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isDark ? "bg-black/40 border-white/10 text-white placeholder:text-stone-600 focus:border-[#fbbf24]" : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1 text-stone-400">
                  📍 Address
                </label>
                <input
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="e.g. City, State, Pincode"
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isDark ? "bg-black/40 border-white/10 text-white placeholder:text-stone-600 focus:border-[#fbbf24]" : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditModal(null)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer ${
                  isDark ? "bg-white/[0.08] hover:bg-white/15 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                Cancel
              </button>
              <button
                disabled={editSaving}
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
