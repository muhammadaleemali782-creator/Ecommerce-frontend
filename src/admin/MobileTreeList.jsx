import { useState } from "react"

const RC = {
  admin:       { bg: "#f5f3ff", border: "#7c3aed", text: "#5b21b6", dot: "#7c3aed", icon: "👑" },
  distributor: { bg: "#ecfdf5", border: "#059669", text: "#064e3b", dot: "#059669", icon: "🏢" },
  seller:      { bg: "#eff6ff", border: "#2563eb", text: "#1e3a8a", dot: "#2563eb", icon: "🛒" },
  user:        { bg: "#f9fafb", border: "#94a3b8", text: "#374151", dot: "#94a3b8", icon: "👤" },
}
const rc = (role) => RC[role] || RC.user

/* Ek node + uske children — collapsible vertical row */
function MobileNode({ node, depth = 0, onSelect }) {
  const [open, setOpen] = useState(depth < 1) // root + level-1 khule rahenge by default
  const children = Array.isArray(node?.children) ? node.children : []
  const hasChildren = children.length > 0
  const c = rc(node?.role)

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 10px",
          marginLeft: depth * 14,
          borderLeft: depth > 0 ? `2px solid ${c.border}33` : "none",
          background: c.bg,
          border: `1.5px solid ${c.border}55`,
          borderRadius: 10,
          marginBottom: 6,
          cursor: "pointer",
          boxSizing: "border-box",
        }}
        onClick={() => {
          if (hasChildren) setOpen(p => !p)
          onSelect?.(node)
        }}
      >
        {hasChildren ? (
          <span style={{ fontSize: 11, color: c.text, width: 14, flexShrink: 0, textAlign: "center" }}>
            {open ? "▼" : "▶"}
          </span>
        ) : (
          <span style={{ width: 14, flexShrink: 0 }} />
        )}
        <span style={{ fontSize: 14, flexShrink: 0 }}>{c.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: c.text, flex: 1, minWidth: 0, overflowWrap: "break-word" }}>
          {node?.name || "Unnamed"}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: c.dot, background: `${c.dot}18`, padding: "2px 8px", borderRadius: 99, flexShrink: 0 }}>
          {node?.role}
        </span>
        {hasChildren && (
          <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0 }}>
            {children.length}
          </span>
        )}
      </div>

      {hasChildren && open && (
        <div style={{ marginLeft: 8 }}>
          {children.map((child, i) => (
            <MobileNode
              key={child.id || child._id || `${depth}-${i}`}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* Top-level export — array of root nodes */
export default function MobileTreeList({ data = [], onSelect }) {
  const safeData = Array.isArray(data) ? data : []
  if (safeData.length === 0) {
    return <p style={{ color: "#94a3b8", fontSize: 13, padding: 16, textAlign: "center" }}>No network hierarchy available</p>
  }
  return (
    <div style={{ width: "100%", boxSizing: "border-box", padding: "4px 2px" }}>
      {safeData.map((root, i) => (
        <MobileNode key={root.id || root._id || `root-${i}`} node={root} depth={0} onSelect={onSelect} />
      ))}
    </div>
  )
}
