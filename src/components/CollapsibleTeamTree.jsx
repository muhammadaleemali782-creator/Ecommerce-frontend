import React, { useState, useMemo } from "react"

function MemberNode({
  member,
  allMembers,
  isDark,
  roleStyles = {},
  expandedMap,
  toggleExpand,
  depth = 0
}) {
  const children = useMemo(() => {
    return allMembers.filter(m => String(m.parentId) === String(member._id))
  }, [allMembers, member._id])

  const isOpen = !!expandedMap[String(member._id)]
  const st = roleStyles[member.role] || {}
  const icon = member.role === "distributor" ? "🏢" : member.role === "seller" ? "🛒" : "👤"

  return (
    <div className="space-y-2">
      <div
        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
          isDark
            ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]"
            : "bg-stone-50 border-stone-200/90 hover:bg-stone-100/80 shadow-sm"
        }`}
        style={{ marginLeft: `${Math.min(depth, 5) * 16}px` }}
      >
        <div className="min-w-0 flex-1 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-sm shrink-0">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate leading-tight flex items-center gap-1.5">
              <span className={isDark ? "text-white" : "text-stone-900"}>{member.name}</span>
              {member.fullName && member.fullName.trim() && member.fullName.toLowerCase() !== member.name.toLowerCase() && (
                <span className="text-[10px] text-stone-400 font-normal">({member.fullName})</span>
              )}
            </div>
            <div className="text-[10px] text-stone-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Level {member.level || depth + 1}</span>
              {member.phone && <span>· 📞 {member.phone}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${st.badge || "bg-stone-500/10 text-stone-400 border-stone-500/20"}`}>
            {member.role === "seller" ? "Direct Seller" : member.role}
          </span>

          {children.length > 0 && (
            <button
              onClick={() => toggleExpand(String(member._id))}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide border flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                isOpen
                  ? "bg-blue-600 text-black border-blue-500 shadow-sm"
                  : isDark
                    ? "bg-white/10 text-stone-200 border-white/15 hover:bg-white/20"
                    : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100 shadow-sm"
              }`}
              title={isOpen ? "Collapse Sub-Team" : `Expand ${children.length} Sub-Members`}
            >
              <span>{isOpen ? "▲" : "▼"}</span>
              <span>{isOpen ? "Hide" : `+${children.length}`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-members recursive container */}
      {isOpen && children.length > 0 && (
        <div className="border-l-2 border-dashed border-blue-500/30 pl-2 space-y-2">
          {children.map(ch => (
            <MemberNode
              key={ch._id}
              member={ch}
              allMembers={allMembers}
              isDark={isDark}
              roleStyles={roleStyles}
              expandedMap={expandedMap}
              toggleExpand={toggleExpand}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CollapsibleTeamTree({
  downline = [],
  rootUserId = "",
  isDark = false,
  roleStyles = {},
  search = "",
  roleFilter = "all"
}) {
  const [expandedMap, setExpandedMap] = useState({})

  const toggleExpand = (id) => {
    setExpandedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Identify direct members (Level 1 / direct downline)
  const directMembers = useMemo(() => {
    return downline.filter(m => {
      if (m.level === 1) return true
      if (rootUserId && String(m.parentId) === String(rootUserId)) return true
      // fallback: if parent is not in downline array, it's a top-level node for this user
      return !downline.some(other => String(other._id) === String(m.parentId))
    })
  }, [downline, rootUserId])

  // Filtered direct members based on role
  const displayDirect = useMemo(() => {
    if (roleFilter === "all") return directMembers
    return directMembers.filter(m => m.role === roleFilter)
  }, [directMembers, roleFilter])

  // Filtered by search across all members if search is active
  const searchResults = useMemo(() => {
    if (!search || !search.trim()) return null
    const q = search.trim().toLowerCase()
    return downline.filter(m => {
      const matchName = m.name?.toLowerCase().includes(q)
      const matchFull = m.fullName?.toLowerCase().includes(q)
      const matchRole = roleFilter === "all" || m.role === roleFilter
      return (matchName || matchFull) && matchRole
    })
  }, [downline, search, roleFilter])

  const expandAll = () => {
    const all = {}
    downline.forEach(m => {
      all[String(m._id)] = true
    })
    setExpandedMap(all)
  }

  const collapseAll = () => {
    setExpandedMap({})
  }

  const hasSubTeams = useMemo(() => {
    return downline.some(m => downline.some(c => String(c.parentId) === String(m._id)))
  }, [downline])

  if (downline.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-stone-400">
        👥 Abhi team mein koi member nahi hai
      </div>
    )
  }

  // If user searched for something specific
  if (searchResults !== null) {
    if (searchResults.length === 0) {
      return (
        <div className="py-8 text-center text-xs text-stone-400">
          🔍 Koi matching member nahi mila: "{search}"
        </div>
      )
    }
    return (
      <div className="space-y-2">
        <div className="text-[11px] text-stone-400 font-mono mb-2">
          Found {searchResults.length} matching members:
        </div>
        {searchResults.map(u => {
          const st = roleStyles[u.role] || {}
          return (
            <div
              key={u._id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-stone-50 border-stone-200/80"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate leading-tight flex items-center gap-1.5">
                  <span className={isDark ? "text-white" : "text-stone-900"}>{u.name}</span>
                  {u.fullName && <span className="text-[10px] text-stone-400 font-normal">({u.fullName})</span>}
                </div>
                <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                  Level {u.level || 1} {u.phone ? `· 📞 ${u.phone}` : ""}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${st.badge || ""}`}>
                {u.role === "seller" ? "Direct Seller" : u.role}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {/* Header controls for expand / collapse */}
      {hasSubTeams && (
        <div className="flex items-center justify-between pb-1">
          <div className="text-[10px] text-stone-400 font-mono">
            Direct Connections ({displayDirect.length}) · Sub-teams collapsed
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={collapseAll}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                isDark ? "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10" : "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
              }`}
            >
              📁 Collapse All
            </button>
            <button
              onClick={expandAll}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                isDark ? "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10" : "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
              }`}
            >
              📂 Expand All
            </button>
          </div>
        </div>
      )}

      {displayDirect.length === 0 ? (
        <div className="py-8 text-center text-xs text-stone-400">
          Is filter mein koi direct member nahi hai
        </div>
      ) : (
        <div className="space-y-2">
          {displayDirect.map(member => (
            <MemberNode
              key={member._id}
              member={member}
              allMembers={downline}
              isDark={isDark}
              roleStyles={roleStyles}
              expandedMap={expandedMap}
              toggleExpand={toggleExpand}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
