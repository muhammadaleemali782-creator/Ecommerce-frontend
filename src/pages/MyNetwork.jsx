import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { getRoleLabel, getRoleLabelPlural } from "../utils/roleLabels"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const STYLE = `
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:1;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
  @keyframes dtNodeIn {
    from { opacity:0; transform:translateY(12px) scale(0.92); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }
  .mn-btn { transition:all .14s ease; cursor:pointer; border:none; }
  .mn-btn:hover  { opacity:.85; }
  .mn-btn:active { transform:scale(.96); }
  .mn-sheet   { animation:slideUp .32s cubic-bezier(.2,0,.0,1) both; }
  .mn-overlay { animation:fadeIn .18s both; }
  .mn-card { transition:box-shadow .15s ease, transform .15s ease; cursor:pointer; }
  .mn-card:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 8px 24px rgba(0,0,0,0.12) !important; }
  .mn-card:active { opacity:.8; transform:scale(.98); }
  .mn-sheet-handle { width:40px; height:4px; background:#e2e8f0; border-radius:99px; margin:10px auto 0; }
`

function collectAllNodes(node, result = []) {
  if (!node) return result
  result.push({ id: node.id || node._id || "", name: node.name || "Unnamed", role: node.role || "user" })
  if (Array.isArray(node.children)) node.children.forEach(c => collectAllNodes(c, result))
  return result
}
function findNodeById(node, targetId) {
  if (!node) return null
  if (String(node.id || node._id) === String(targetId)) return node
  if (Array.isArray(node.children)) {
    for (const ch of node.children) { const f = findNodeById(ch, targetId); if (f) return f }
  }
  return null
}
function filterTopByRole(node, role) {
  if (!node) return null
  return { ...node, children: (node.children || []).filter(c => c.role === role) }
}

const ROLE_SORT  = { distributor:0, seller:1, user:2, admin:3 }
const ROLE_ORDER = { admin:0, distributor:1, seller:2, user:3 }
const RC = {
  admin:       { bg:"#f0fdf4", border:"#16a34a", text:"#15803d", dot:"#16a34a", label:"Admin"       },
  distributor: { bg:"#f0fdf4", border:"#16a34a", text:"#15803d", dot:"#16a34a", label:"Distributor" },
  seller:      { bg:"#eff6ff", border:"#3b82f6", text:"#1d4ed8", dot:"#3b82f6", label:"Seller"      },
  user:        { bg:"#f8fafc", border:"#94a3b8", text:"#475569", dot:"#94a3b8", label:"User"        },
}
const getRC    = r => RC[r] || RC.user
const sortKids = arr => [...(arr||[])].sort((a,b)=>(ROLE_SORT[a.role]??9)-(ROLE_SORT[b.role]??9))

// Level colors — depth se decide hoga
const DEPTH_COLORS = [
  { bg:"#dcfce7", border:"#16a34a", text:"#14532d", dot:"#16a34a" }, // depth 0 — green
  { bg:"#dbeafe", border:"#2563eb", text:"#1e3a8a", dot:"#2563eb" }, // depth 1 — blue
  { bg:"#ede9fe", border:"#7c3aed", text:"#4c1d95", dot:"#7c3aed" }, // depth 2 — purple
  { bg:"#ffedd5", border:"#ea580c", text:"#7c2d12", dot:"#ea580c" }, // depth 3 — orange
  { bg:"#fce7f3", border:"#db2777", text:"#831843", dot:"#db2777" }, // depth 4 — pink
  { bg:"#ccfbf1", border:"#0d9488", text:"#134e4a", dot:"#0d9488" }, // depth 5+ — teal
]
const getDepthColor = (depth) => DEPTH_COLORS[Math.min(depth || 0, DEPTH_COLORS.length - 1)]

function OvalNode({ node, onSelect, width, height, fontSize = 12, subSize = 10, depth = 0 }) {
  const c  = getRC(node.role)
  const dc = getDepthColor(depth)
  return (
    <div className="mn-card" onClick={() => onSelect(node)}
      style={{
        width, height, borderRadius: 999,
        background: dc.bg, border: `1.8px solid ${dc.border}`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        boxShadow: `0 1px 6px ${dc.dot}25`,
        userSelect: "none", flexShrink: 0, padding: "0 12px",
      }}>
      <div style={{ fontSize, fontWeight: 700, color: dc.text, lineHeight: 1.2,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        maxWidth: width - 16, textAlign: "center" }}>
        {node.name}
      </div>
      <div style={{ fontSize: subSize, color: dc.dot, fontWeight: 600, marginTop: 1 }}>
        ({c.label})
      </div>
    </div>
  )
}

const L = {
  mainW: 175, mainH: 54,
  sideW: 110, sideH: 48,
  gapV:  36, gapS:  10, connH: 18,
  lineClr: "#aab5c2", lineW: 1.5,
  padL: 12, padT: 16, padB: 24,
}

function ImageTree({ roots, onSelect, screenW }) {
  if (!roots || roots.length === 0) return (
    <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Koi data nahi</div>
  )
  const rows = []
  function buildRows(node, parentRowIdx, depth = 0) {
    if (!node) return
    const myIdx = rows.length
    const kids  = sortKids(node.children || [])
    // ✅ FIX: leaf nodes (no children) → sideNodes (shown right, no duplicate)
    //         nodes with children → get their own mainNode row
    const leafKids   = kids.filter(k => !k.children || k.children.length === 0)
    const branchKids = kids.filter(k => k.children && k.children.length > 0)
    rows.push({ mainNode: node, sideNodes: leafKids, parentRowIdx, depth })
    // Only branch kids get their own rows (no duplicate)
    branchKids.forEach(k => buildRows(k, myIdx, depth + 1))
  }
  roots.forEach(r => buildRows(r, -1, 0))
  return <ImageTreeCanvas rows={rows} onSelect={onSelect} screenW={screenW} />
}

function ImageTreeCanvas({ rows, onSelect, screenW }) {
  const [collapsed, setCollapsed] = useState({})
  const mainW = Math.min(L.mainW, Math.floor(screenW * 0.46))
  const sideW = Math.min(L.sideW, Math.floor(screenW * 0.30))
  const trunkX = L.padL + mainW + 8
  const sideX  = L.padL + mainW + L.connH + 4
  const mainCX = L.padL + mainW / 2
  const canvasW = Math.min(screenW - 16, sideX + sideW + 8)
  function isRowHidden(ri) {
    let cur = rows[ri]
    while (cur && cur.parentRowIdx >= 0) {
      if (collapsed[cur.parentRowIdx]) return true
      cur = rows[cur.parentRowIdx]
    }
    return false
  }
  let curY = L.padT
  const rowMeta = rows.map((row, ri) => {
    const hidden     = isRowHidden(ri)
    const isColld    = !!collapsed[ri]
    const sideCount  = (!hidden && !isColld) ? row.sideNodes.length : 0
    const mainBlockH = L.mainH + L.gapV
    const sideBlockH = sideCount > 0 ? sideCount * L.sideH + (sideCount - 1) * L.gapS : 0
    const rowH       = hidden ? 0 : (isColld ? mainBlockH : Math.max(mainBlockH, sideBlockH))
    const mainY  = curY
    const sideYs = []
    if (!hidden && !isColld) {
      for (let i = 0; i < sideCount; i++) sideYs.push(curY + i * (L.sideH + L.gapS) + L.sideH / 2)
    }
    if (!hidden) curY += rowH
    return { mainY, sideYs, rowH, hidden, isColld }
  })
  const totalH = curY + L.padB
  const nextVisible = ri => { for (let i = ri+1; i<rows.length; i++) { if(!rowMeta[i].hidden)return i } return -1 }
  const hasChildRow = ri => rows.some(r => r.parentRowIdx === ri)
  return (
    <div style={{ position:"relative", width:canvasW, minHeight:totalH, margin:"0 auto" }}>
      <svg style={{ position:"absolute", top:0, left:0, width:canvasW, height:totalH, overflow:"visible", pointerEvents:"none" }}>
        {rows.map((row, ri) => {
          const m = rowMeta[ri]
          if (m.hidden) return null
          const mainBotY = m.mainY + L.mainH
          const mainMidY = m.mainY + L.mainH / 2
          const nxt      = nextVisible(ri)
          const nxtMeta  = nxt >= 0 ? rowMeta[nxt] : null
          return (
            <g key={ri}>
              {nxtMeta && <line x1={mainCX} y1={mainBotY} x2={mainCX} y2={nxtMeta.mainY} stroke={L.lineClr} strokeWidth={L.lineW} strokeLinecap="round" />}
              {!m.isColld && m.sideYs.length > 0 && (() => {
                const topY = m.sideYs[0]; const botY = m.sideYs[m.sideYs.length-1]
                return (<>
                  <line x1={L.padL+mainW} y1={mainMidY} x2={trunkX} y2={mainMidY} stroke={L.lineClr} strokeWidth={L.lineW} strokeLinecap="round" />
                  <line x1={trunkX} y1={Math.min(mainMidY,topY)} x2={trunkX} y2={botY} stroke={L.lineClr} strokeWidth={L.lineW} strokeLinecap="round" />
                  {m.sideYs.map((sy,si) => <line key={si} x1={trunkX} y1={sy} x2={sideX} y2={sy} stroke={L.lineClr} strokeWidth={L.lineW} strokeLinecap="round" />)}
                </>)
              })()}
            </g>
          )
        })}
      </svg>
      {rows.map((row, ri) => {
        const m = rowMeta[ri]
        if (m.hidden) return null
        const isColld = m.isColld
        const hasSide = row.sideNodes.length > 0
        const hChildR = hasChildRow(ri)
        const c       = getRC(row.mainNode.role)
        return (
          <div key={ri}>
            <div style={{ position:"absolute", top:m.mainY, left:L.padL }}>
              <div style={{ position:"relative", display:"inline-block" }}>
                <OvalNode node={row.mainNode} onSelect={onSelect} width={mainW} height={L.mainH} fontSize={11} subSize={9} depth={row.depth || 0} />
                {(hasSide || hChildR) && (
                  <button className="mn-btn"
                    onClick={e => { e.stopPropagation(); setCollapsed(p => ({ ...p, [ri]: !p[ri] })) }}
                    style={{ position:"absolute", bottom:-10, left:"50%", transform:"translateX(-50%)", width:20, height:20, borderRadius:"50%", background:"#fff", border:`1.5px solid ${c.border}`, color:c.dot, fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 5px rgba(0,0,0,0.18)", zIndex:3, padding:0 }}>
                    {isColld ? "+" : "−"}
                  </button>
                )}
              </div>
            </div>
            {!isColld && row.sideNodes.map((sn, si) => (
              <div key={sn.id||sn._id||si} style={{ position:"absolute", top:m.sideYs[si]-L.sideH/2, left:sideX }}>
                <OvalNode node={sn} onSelect={onSelect} width={sideW} height={L.sideH} fontSize={9} subSize={8} depth={(row.depth || 0) + 1} />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function MiniAnalytics({ userId, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const res   = await fetch(`${import.meta.env.VITE_API_URL}/analytics/user/${userId}?range=lifetime`, { headers:{ Authorization:`Bearer ${token}` } })
        setData(await res.json())
      } catch { setData(null) } finally { setLoading(false) }
    }; load()
  }, [userId])
  const tl = data?.timeline?.length ? data.timeline : Array.from({length:7},(_,i)=>({label:`D${i+1}`,total:0}))
  return (
    <div style={{ marginLeft:26, marginBottom:6, marginTop:2, background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0", padding:"12px 14px" }}>
      {loading ? <div style={{ textAlign:"center", padding:16, color:"#94a3b8", fontSize:12 }}>⏳ Loading...</div>
        : !data ? <div style={{ textAlign:"center", padding:16, color:"#94a3b8", fontSize:12 }}>Koi data nahi</div>
        : <>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:6 }}>
            <button onClick={onClose} className="mn-btn" style={{ background:"none", fontSize:12, color:"#94a3b8", fontWeight:700 }}>✕</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:10 }}>
            {[
              {label:"Orders",    val:data.ordersCount??0,                              color:"#1d4ed8",bg:"#eff6ff"},
              {label:"Sales",     val:`₹${Number(data.totalSales??0).toLocaleString()}`,color:"#15803d",bg:"#f0fdf4"},
              {label:"Connected", val:data.subUsersCount??0,                             color:"#7c3aed",bg:"#faf5ff"},
              {label:"Products",  val:data.assignedProducts?.length??0,                  color:"#b45309",bg:"#fffbeb"},
            ].map((s,i) => (
              <div key={i} style={{ background:s.bg, borderRadius:8, padding:"7px 10px" }}>
                <div style={{ fontSize:9, color:"#64748b", fontWeight:600 }}>{s.label}</div>
                <div style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{ height:70 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tl}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{fontSize:7}} /><YAxis tick={{fontSize:7}} width={20}/>
                <Tooltip contentStyle={{fontSize:10,borderRadius:6,padding:"3px 8px"}}/>
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      }
    </div>
  )
}

/* ─── SubTreeNode — FIXED: 📊 button outside clickable row ─── */
function SubTreeNode({ node, depth=0, isLast=false, level=1, hideIfNotUser=false }) {
  const [open, setOpen]         = useState(false)
  const [showMini, setShowMini] = useState(false)
  const kids    = sortKids(node.children || [])
  const hasKids = kids.length > 0
  const c       = getRC(node.role)
  const hidden  = hideIfNotUser && node.role !== "user" && node._hideSelf
  const summary = hasKids && !open ? (() => {
    const cnt = {}; kids.forEach(ch => { cnt[ch.role] = (cnt[ch.role]||0)+1 })
    return Object.entries(cnt).map(([r,n]) => `${n} ${getRC(r).label}${n>1?"s":""}`).join(", ")
  })() : ""
  if (hidden) return <div>{kids.map((k,i) => <SubTreeNode key={k.id||k._id||i} node={k} depth={depth} isLast={i===kids.length-1} level={level} hideIfNotUser={hideIfNotUser} />)}</div>
  return (
    <div style={{ position:"relative" }}>
      {depth > 0 && (<>
        <div style={{ position:"absolute", left:-17, top:0, bottom:isLast?"50%":0, width:2, background:"#e2e8f0" }} />
        <div style={{ position:"absolute", left:-17, top:18, width:14, height:2, background:"#e2e8f0" }} />
      </>)}

      {/* ── Row: expand area + analytics button as separate siblings ── */}
      <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:3 }}>

        {/* Clickable expand area only */}
        <div onClick={() => hasKids && setOpen(p=>!p)}
          style={{ flex:1, display:"flex", alignItems:"center", gap:7, padding:"6px 10px",
            borderRadius:9, background:open&&hasKids?c.bg:"#fff",
            border:`1.5px solid ${open&&hasKids?c.border:"#e8eef4"}`,
            cursor:hasKids?"pointer":"default", userSelect:"none",
            boxShadow:"0 1px 3px rgba(0,0,0,0.04)", minWidth:0 }}>
          <div style={{ width:18, height:18, borderRadius:5, background:hasKids?(open?c.dot:"#e2e8f0"):"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {hasKids && <span style={{ fontSize:8, color:open?"#fff":"#94a3b8", fontWeight:700 }}>{open?"▼":"▶"}</span>}
          </div>
          <span style={{ fontSize:13, flexShrink:0 }}>{c.label==="Distributor"?"🏢":c.label==="Seller"?"🛒":c.label==="Admin"?"👑":"👤"}</span>
          <span style={{ fontSize:13, fontWeight:600, color:"#1e293b", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{node.name}</span>
          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:`${c.dot}15`, color:c.dot, border:`1px solid ${c.dot}30`, flexShrink:0 }}>{c.label}</span>
          {summary && <span style={{ fontSize:10, color:"#94a3b8", whiteSpace:"nowrap", flexShrink:0 }}>({summary})</span>}
        </div>

        {/* Analytics button — completely outside, no event conflict */}
        <button
          onClick={() => setShowMini(p=>!p)}
          style={{ flexShrink:0, width:32, height:32, borderRadius:8, border:"1px solid #e2e8f0",
            background:showMini?"#eff6ff":"#f8fafc", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
          📊
        </button>
      </div>

      {showMini && <MiniAnalytics userId={node.id||node._id} onClose={() => setShowMini(false)} />}
      {open && hasKids && (
        <div style={{ paddingLeft:28, position:"relative" }}>
          {kids.map((k,i) => <SubTreeNode key={k.id||k._id||i} node={k} depth={depth+1} isLast={i===kids.length-1} level={level+1} hideIfNotUser={hideIfNotUser} />)}
        </div>
      )}
    </div>
  )
}

function ConnectedUsers({ subtree }) {
  const [collapsed, setCollapsed]       = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [search, setSearch]             = useState("")
  const raw  = sortKids(subtree?.children || [])
  const dCnt = raw.filter(c => c.role==="distributor").length
  const sCnt = raw.filter(c => c.role==="seller").length
  const allD = useMemo(() => { const l=[]; raw.forEach(c => collectAllNodes(c,l)); return l }, [raw])
  const uCnt = allD.filter(n => n.role==="user").length
  const tot  = useMemo(() => { const l=[]; raw.forEach(c => collectAllNodes(c,l)); return l.length }, [raw])
  const uTree = useMemo(() => {
    const b = n => { if(!n)return null; const uk=(n.children||[]).map(b).filter(Boolean); if(n.role==="user")return{...n,children:uk}; if(uk.length>0)return{...n,_hideSelf:true,children:uk}; return null }
    return raw.map(b).filter(Boolean)
  }, [raw])
  const fil  = activeFilter==="all"?raw:activeFilter==="user"?uTree:raw.filter(c=>c.role===activeFilter)
  const sfil = useMemo(() => {
    if (!search.trim()) return fil
    const q = search.toLowerCase()
    const st = n => { if(!n)return null; const m=(n.name||"").toLowerCase().includes(q); const k=(n.children||[]).map(st).filter(Boolean); if(m||k.length>0)return{...n,children:k}; return null }
    return fil.map(st).filter(Boolean)
  }, [fil, search])
  const tabs = [
    {key:"all",label:"All",count:raw.length,dot:null},
    dCnt>0&&{key:"distributor",label:"Distributors",count:dCnt,dot:RC.distributor.dot},
    sCnt>0&&{key:"seller",label:"Sellers",count:sCnt,dot:RC.seller.dot},
    {key:"user",label:"Users",count:uCnt,dot:RC.user.dot},
  ].filter(Boolean)
  if (raw.length===0) return <div style={{padding:20,textAlign:"center",color:"#94a3b8",fontSize:13,background:"#f8fafc",borderRadius:12,border:"1px dashed #e2e8f0"}}>Aapke neeche koi connected user nahi hai</div>
  return (
    <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8eef4",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid #f1f5f9",background:"#fafbfc"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>👥 Connected Users</span>
          <span style={{fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:99,background:"#e0e7ff",color:"#4338ca"}}>{tot} total</span>
          <span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:99,background:"#f0fdf4",color:"#16a34a"}}>{raw.length} direct</span>
        </div>
        <button className="mn-btn" onClick={()=>setCollapsed(p=>!p)} style={{fontSize:11,padding:"4px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:600}}>
          {collapsed?"▼ Show":"▲ Collapse"}
        </button>
      </div>
      {!collapsed && (
        <div style={{padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12,flexWrap:"wrap"}}>
            {tabs.map(tab => {
              const isA=activeFilter===tab.key, dc=tab.dot||"#64748b"
              return (
                <button key={tab.key} className="mn-btn" onClick={()=>setActiveFilter(tab.key)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:99,border:`1.5px solid ${isA?dc:"#e2e8f0"}`,background:isA?`${dc}12`:"#f8fafc",color:isA?dc:"#64748b",fontWeight:isA?700:500,fontSize:12}}>
                  {tab.dot&&<span style={{width:7,height:7,borderRadius:"50%",background:isA?dc:"#94a3b8",display:"inline-block"}}/>}
                  {tab.label}
                  <span style={{fontSize:10,fontWeight:700,padding:"0px 5px",borderRadius:99,background:isA?`${dc}20`:"#f1f5f9",color:isA?dc:"#94a3b8"}}>{tab.count}</span>
                </button>
              )
            })}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0",marginBottom:10}}>
            <span style={{color:"#94a3b8",fontSize:14}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name..." style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:13,color:"#334155"}}/>
            {search&&<button onClick={()=>setSearch("")} className="mn-btn" style={{background:"none",color:"#94a3b8",fontSize:12,border:"none"}}>✕</button>}
          </div>
          <div style={{maxHeight:320,overflowY:"auto",paddingRight:4}}>
            {sfil.length===0
              ?<div style={{textAlign:"center",padding:16,color:"#94a3b8",fontSize:12}}>{search?`"${search}" nahi mila`:`Is filter mein koi ${activeFilter} nahi`}</div>
              :sfil.map((ch,i)=><SubTreeNode key={ch.id||ch._id||i} node={ch} depth={0} isLast={i===sfil.length-1} level={1} hideIfNotUser={activeFilter==="user"}/>)
            }
          </div>
        </div>
      )}
    </div>
  )
}

function AnalyticsPanel({ selectedUser, treeData, onClose }) {
  const [analytics, setAnalytics] = useState(null)
  const [aLoading, setALoading]   = useState(false)
  const [aError, setAError]       = useState(null)
  const [range, setRange]         = useState("lifetime")
  useEffect(()=>{
    if(!selectedUser) return
    const load = async () => {
      try {
        setALoading(true)
        setAError(null)
        const token = localStorage.getItem("token")
        const uid   = selectedUser.id || selectedUser._id
        const res   = await fetch(`${import.meta.env.VITE_API_URL}/analytics/user/${uid}?range=${range}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setAnalytics(data)
      } catch(e) {
        setAError(e.message)
        setAnalytics(null)
      } finally {
        setALoading(false)
      }
    }
    load()
  },[selectedUser, range])
  const tl=analytics?.timeline?.length?analytics.timeline:Array.from({length:7},(_,i)=>({label:`Day ${i+1}`,total:0}))
  const c=getRC(selectedUser.role)
  const subtree=useMemo(()=>{
    const uid=selectedUser?.id||selectedUser?._id
    for(const root of treeData){const f=(function find(n){if(!n)return null;if(String(n.id||n._id)===String(uid))return n;for(const ch of(n.children||[])){const r=find(ch);if(r)return r}return null})(root);if(f)return f}
    return null
  },[selectedUser,treeData])
  return (
    <div style={{padding:16,borderTop:"2px solid #e0e7ff",background:"#fff"}}>
      <div style={{fontSize:14,fontWeight:700,color:"#475569",marginBottom:12}}>
        Selected: <span style={{color:c.text}}>{selectedUser.name}</span>
        <span style={{marginLeft:8,fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:99,background:c.bg,color:c.dot,border:`1px solid ${c.border}`}}>{c.label}</span>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14,justifyContent:"flex-end"}}>
        <select value={range} onChange={e=>setRange(e.target.value)} style={{fontSize:12,padding:"6px 10px",borderRadius:8,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#334155",cursor:"pointer"}}>
          <option value="today">📅 Aaj</option>
          <option value="week">📅 Hafte mein</option>
          <option value="month">📅 Is Mahine</option>
          <option value="year">📅 Is Saal</option>
          <option value="lifetime">♾️ Lifetime</option>
        </select>
        <button onClick={onClose} className="mn-btn" style={{width:32,height:32,borderRadius:"50%",border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#94a3b8",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
      </div>
      {aLoading && (
        <div style={{textAlign:"center",padding:24,color:"#94a3b8",fontSize:13}}>
          <div style={{fontSize:28,marginBottom:8}}>⏳</div>
          Loading analytics...
        </div>
      )}
      {aError && !aLoading && (
        <div style={{textAlign:"center",padding:24,color:"#ef4444",fontSize:13}}>
          <div style={{fontSize:28,marginBottom:8}}>⚠️</div>
          Data load nahi hua: {aError}
        </div>
      )}
      {analytics && !aLoading && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {[
              {label:"📦 Orders",   val:analytics.ordersCount??0,                               bg:"#eff6ff",color:"#1d4ed8"},
              {label:"💰 Sales",    val:`₹${Number(analytics.totalSales??0).toLocaleString()}`,  bg:"#f0fdf4",color:"#15803d"},
              {label:"👥 Connected",val:analytics.subUsersCount??0,                              bg:"#faf5ff",color:"#7c3aed"},
              {label:"📋 Products", val:analytics.assignedProducts?.length??0,                   bg:"#fffbeb",color:"#b45309"},
            ].map((card,i)=>(
              <div key={i} style={{background:card.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${card.color}22`}}>
                <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4}}>{card.label}</div>
                <div style={{fontSize:22,fontWeight:800,color:card.color}}>{card.val}</div>
              </div>
            ))}
          </div>
          {analytics.topProduct&&(
            <div style={{background:"#fff7ed",borderRadius:10,padding:"10px 14px",border:"1px solid #fed7aa"}}>
              <div style={{fontSize:11,color:"#92400e",fontWeight:700,marginBottom:4}}>🏆 Best Selling Product</div>
              <div style={{fontSize:14,fontWeight:700,color:"#c2410c"}}>{analytics.topProduct.name}</div>
              <div style={{fontSize:12,color:"#78716c",marginTop:2}}>{analytics.topProduct.count} units · ₹{Number(analytics.topProduct.total).toLocaleString()}</div>
            </div>
          )}
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:8}}>📦 Assigned Products</div>
            {analytics.assignedProducts?.length>0
              ?<div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:160,overflowY:"auto"}}>
                {analytics.assignedProducts.map(p=>(
                  <div key={p._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #e8eef4"}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#334155"}}>{p.title}</span>
                    <span style={{fontSize:13,fontWeight:700,color:"#16a34a"}}>₹{p.price}</span>
                  </div>
                ))}
              </div>
              :<p style={{fontSize:12,color:"#94a3b8"}}>Koi product assign nahi</p>
            }
          </div>
          {subtree&&<ConnectedUsers subtree={subtree}/>}
          <div style={{background:"#f8fafc",borderRadius:12,padding:14,border:"1px solid #e8eef4"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:10}}>📈 Sales Graph</div>
            <div style={{height:150}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tl}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="label" tick={{fontSize:9}}/><YAxis tick={{fontSize:9}}/>
                  <Tooltip contentStyle={{fontSize:11,borderRadius:8}}/>
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterBar({ allNodes, selectedId, roleFilter, onSelectNode, onSelectRole, onReset }) {
  const [search, setSearch]     = useState("")
  const [nodeOpen, setNodeOpen] = useState(false)
  const ref = useRef(null)
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setNodeOpen(false)}
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)
  },[])
  const filtered=useMemo(()=>{const q=search.toLowerCase().trim();return allNodes.filter(n=>n.name.toLowerCase().includes(q)||n.role.toLowerCase().includes(q)).sort((a,b)=>(ROLE_ORDER[a.role]??9)-(ROLE_ORDER[b.role]??9))},[search,allNodes])
  const sel=allNodes.find(n=>String(n.id)===String(selectedId))
  const sc=sel?getRC(sel.role):null
  const hasF=selectedId||(roleFilter&&roleFilter!=="all")
  const roleTabs=(()=>{const nr=sel?.role;if(!nr||nr==="admin"||nr==="distributor")return[{key:"all",label:"All"},{key:"distributor",label:getRoleLabelPlural("distributor")},{key:"seller",label:getRoleLabelPlural("seller")}];if(nr==="seller")return[{key:"all",label:"All"},{key:"seller",label:getRoleLabelPlural("seller")},{key:"user",label:getRoleLabelPlural("user")}];return[{key:"all",label:"All"}]})()
  return (
    <div style={{display:"flex",flexDirection:"column",background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",padding:"12px 16px",marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <span style={{fontSize:13,fontWeight:600,color:"#475569",whiteSpace:"nowrap"}}>🔍 Select Node:</span>
        <div style={{position:"relative"}} ref={ref}>
          <button className="mn-btn" style={{display:"inline-flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:999,border:`1.8px solid ${sc?sc.border:"#cbd5e1"}`,background:sc?sc.bg:"#f8fafc",fontSize:13,fontWeight:500,minWidth:190,color:sc?sc.text:"#334155"}} onClick={()=>setNodeOpen(p=>!p)}>
            {sel?<><span style={{width:8,height:8,borderRadius:"50%",background:sc.dot,display:"inline-block",flexShrink:0}}/><span style={{fontWeight:600,flex:1}}>{sel.name}</span><span style={{fontSize:11,opacity:0.6}}>({getRoleLabel(sel.role)})</span></>:<span style={{color:"#94a3b8"}}>— Select a node —</span>}
            <span style={{fontSize:9,marginLeft:"auto",opacity:0.5}}>{nodeOpen?"▲":"▼"}</span>
          </button>
          {nodeOpen&&(
            <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,minWidth:260,maxWidth:320,background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,0.13)",zIndex:100,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderBottom:"1px solid #f1f5f9",background:"#f8fafc"}}>
                <span style={{fontSize:17,color:"#94a3b8"}}>⌕</span>
                <input autoFocus style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:13,color:"#334155"}} placeholder="Search name or role…" value={search} onChange={e=>setSearch(e.target.value)}/>
                {search&&<button style={{border:"none",background:"none",cursor:"pointer",color:"#94a3b8",fontSize:12}} onClick={()=>setSearch("")}>✕</button>}
              </div>
              <div style={{maxHeight:260,overflowY:"auto",padding:"6px 0"}}>
                {filtered.length===0&&<div style={{padding:16,textAlign:"center",color:"#94a3b8",fontSize:13}}>No results</div>}
                {filtered.map(n=>{const nc=getRC(n.role),active=String(n.id)===String(selectedId);return(
                  <div key={n.id} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",cursor:"pointer",borderLeft:`3px solid ${active?nc.border:"transparent"}`,background:active?nc.bg:"transparent"}}
                    onClick={()=>{onSelectNode(n.id);setNodeOpen(false);setSearch("")}}
                    onMouseEnter={e=>{if(!active)e.currentTarget.style.background="#f8fafc"}}
                    onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent"}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:nc.dot,display:"inline-block",flexShrink:0}}/>
                    <span style={{fontWeight:600,fontSize:13,flex:1,color:nc.text}}>{n.name}</span>
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:999,color:nc.dot,background:`${nc.dot}18`}}>{getRoleLabel(n.role)}</span>
                  </div>
                )})}
              </div>
            </div>
          )}
        </div>
        {hasF&&<button className="mn-btn" onClick={onReset} style={{padding:"6px 14px",borderRadius:999,border:"1.5px solid #fca5a5",background:"#fff1f2",color:"#dc2626",fontSize:12,fontWeight:600}}>✕ Reset</button>}
      </div>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:10,paddingTop:10,marginTop:8,borderTop:"1px solid #f1f5f9"}}>
        <span style={{fontSize:13,fontWeight:600,color:"#475569",whiteSpace:"nowrap"}}>👥 Show only:</span>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {roleTabs.map(tab=>{const isA=roleFilter===tab.key;const tc=tab.key==="all"?{bg:"#f1f5f9",border:"#94a3b8",text:"#334155",dot:"#94a3b8"}:getRC(tab.key);return(
            <button key={tab.key} className="mn-btn" onClick={()=>onSelectRole(tab.key)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:999,border:`1.5px solid ${isA?tc.border:"#e2e8f0"}`,background:isA?tc.bg:"#f8fafc",color:isA?tc.text:"#64748b",fontSize:12,fontWeight:isA?700:500,whiteSpace:"nowrap"}}>
              {tab.key!=="all"&&<span style={{width:7,height:7,borderRadius:"50%",background:isA?tc.dot:"#94a3b8",display:"inline-block"}}/>}
              {tab.label}
            </button>
          )})}
        </div>
      </div>
    </div>
  )
}

const DT={nodeW:148,nodeH:84,gapX:36,gapY:70,lineClr:"#cbd5e1",lineW:2}
function calcLayout(node,depth=0,pos={x:0},collapsed={}){
  const nodeId=String(node.id||node._id||"")
  const kids=collapsed[nodeId]?[]:sortKids(node.children||[])
  if(kids.length===0){const x=pos.x;pos.x+=DT.nodeW+DT.gapX;return{node,x,y:depth*(DT.nodeH+DT.gapY),kids:[]}}
  const cl=kids.map(k=>calcLayout(k,depth+1,pos,collapsed))
  const firstCX=cl[0].x+DT.nodeW/2;const lastCX=cl[cl.length-1].x+DT.nodeW/2
  return{node,x:(firstCX+lastCX)/2-DT.nodeW/2,y:depth*(DT.nodeH+DT.gapY),kids:cl}
}
function flattenLayout(layout,result=[]){result.push(layout);layout.kids.forEach(k=>flattenLayout(k,result));return result}
function collectEdges(layout,edges=[]){layout.kids.forEach(k=>{edges.push({from:layout,to:k});collectEdges(k,edges)});return edges}

// ✅ Zoom limits — ZOOM_MAX=6 gives "ultra zoom" (600% over the fitted size)
const ZOOM_MIN = 0.5
const ZOOM_MAX = 6
const ZOOM_STEP = 0.25

function DesktopTree({ roots, onSelect }) {
  const [collapsed, setCollapsed] = useState({})
  const [lineColor, setLineColor] = useState("#7c3aed")
  const [highlightId, setHighlightId] = useState(null)
  const [zoomMult, setZoomMult] = useState(1)
  const [focusTarget, setFocusTarget] = useState(null) // raw {x,y} center of last-clicked node
  const containerRef = useRef(null)
  const [box, setBox] = useState({w:1000,h:560})
  useEffect(()=>{
    const measure=()=>{if(containerRef.current)setBox({w:containerRef.current.offsetWidth||1000,h:containerRef.current.offsetHeight||560})}
    measure()
    const ro=window.ResizeObserver?new ResizeObserver(measure):null
    if(ro&&containerRef.current)ro.observe(containerRef.current)
    window.addEventListener("resize",measure)
    return()=>{if(ro)ro.disconnect();window.removeEventListener("resize",measure)}
  },[])
  // ✅ Reset zoom & focus whenever the tree being shown changes (filter/select switch)
  useEffect(()=>{ setZoomMult(1); setFocusTarget(null) },[roots])
  const zoomIn    = ()=>setZoomMult(z=>Math.min(ZOOM_MAX, +(z+ZOOM_STEP).toFixed(2)))
  const zoomOut   = ()=>setZoomMult(z=>Math.max(ZOOM_MIN, +(z-ZOOM_STEP).toFixed(2)))
  const zoomFit   = ()=>setZoomMult(1)
  const zoomUltra = ()=>setZoomMult(ZOOM_MAX)
  const pos={x:0};const layouts=roots.map(r=>calcLayout(r,0,pos,collapsed))
  const allNodes=[];layouts.forEach(l=>flattenLayout(l,allNodes))
  const edges=[];layouts.forEach(l=>collectEdges(l,edges))
  if(allNodes.length===0)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#94a3b8",fontSize:14}}>Koi data nahi</div>
  const rawW=Math.max(...allNodes.map(n=>n.x+DT.nodeW))+40
  const rawH=Math.max(...allNodes.map(n=>n.y+DT.nodeH))+60
  const PAD=32
  // ✅ FIX: Scale to fit BOTH width and height — auto-fit tree in container
  const scaleW    = (box.w - PAD) / rawW
  const scaleH    = (box.h - PAD) / rawH
  const baseScale = Math.min(scaleW, scaleH, 1.0)
  // ✅ zoomMult (1 = fit-to-screen) multiplies on top of the auto-fit scale,
  // so "+" / "−" / "Ultra" always feel relative to what's currently visible.
  const scale  = baseScale * zoomMult
  const scaledW = rawW * scale
  const scaledH = rawH * scale
  // ✅ Center only while the tree still fits; once zoomed past the
  // container, drop the centering so overflow:auto can be scrolled/panned
  // to reach every part of the zoomed-in tree instead of clipping it.
  const offsetX = scaledW <= box.w ? (box.w - scaledW) / 2 : 0
  const offsetY = scaledH <= box.h ? (box.h - scaledH) / 2 : 0
  // ✅ FIX (can't scroll to right/bottom after zooming): CSS `transform:scale`
  // does NOT grow an element's layout box, so the scroll container's
  // scrollWidth/scrollHeight previously stayed at the *unscaled* size even
  // when zoomed in — the extra visual area on the right/bottom simply had
  // no scrollable space behind it. The "stage" div below is given the real
  // post-scale size, so the browser computes correct scroll bounds and
  // every part of a zoomed-in tree becomes reachable by scrolling.
  const stageW = Math.max(box.w, scaledW)
  const stageH = Math.max(box.h, scaledH)
  // ✅ Click-to-focus: when a node is clicked, smoothly scroll/pan so that
  // node ends up centered in the visible viewport (re-runs whenever zoom,
  // offsets, or the container size change, so it keeps following the
  // focused node as you zoom in/out afterwards too).
  useEffect(()=>{
    if(!focusTarget || !containerRef.current) return
    const el = containerRef.current
    const targetLeft = focusTarget.x*scale + offsetX - box.w/2
    const targetTop  = focusTarget.y*scale + offsetY - box.h/2
    el.scrollTo({ left: Math.max(0, targetLeft), top: Math.max(0, targetTop), behavior:"smooth" })
  },[focusTarget, scale, offsetX, offsetY, box.w, box.h])
  return(
    <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%"}}>
      {/* ✅ Zoom controls + Color picker toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:4,paddingRight:10,borderRight:"1px solid #e2e8f0"}}>
          <button onClick={zoomOut} disabled={zoomMult<=ZOOM_MIN} title="Zoom Out"
            style={{width:26,height:26,borderRadius:7,border:"1px solid #e2e8f0",background:"#fff",cursor:zoomMult<=ZOOM_MIN?"not-allowed":"pointer",fontSize:15,fontWeight:700,color:"#475569",display:"flex",alignItems:"center",justifyContent:"center",opacity:zoomMult<=ZOOM_MIN?0.4:1,flexShrink:0}}>−</button>
          <span style={{fontSize:11,fontWeight:700,color:"#475569",minWidth:42,textAlign:"center"}}>{Math.round(scale*100)}%</span>
          <button onClick={zoomIn} disabled={zoomMult>=ZOOM_MAX} title="Zoom In"
            style={{width:26,height:26,borderRadius:7,border:"1px solid #e2e8f0",background:"#fff",cursor:zoomMult>=ZOOM_MAX?"not-allowed":"pointer",fontSize:15,fontWeight:700,color:"#475569",display:"flex",alignItems:"center",justifyContent:"center",opacity:zoomMult>=ZOOM_MAX?0.4:1,flexShrink:0}}>+</button>
          <button onClick={zoomFit} title="Fit to screen"
            style={{marginLeft:4,fontSize:10,fontWeight:700,padding:"5px 9px",borderRadius:7,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",cursor:"pointer",whiteSpace:"nowrap"}}>⛶ Fit</button>
          <button onClick={zoomUltra} disabled={zoomMult>=ZOOM_MAX} title="Ultra Zoom"
            style={{fontSize:10,fontWeight:700,padding:"5px 9px",borderRadius:7,border:"1px solid #c4b5fd",background:"#f5f3ff",color:"#7c3aed",cursor:zoomMult>=ZOOM_MAX?"not-allowed":"pointer",whiteSpace:"nowrap",opacity:zoomMult>=ZOOM_MAX?0.5:1}}>🔎 Ultra</button>
        </div>
        <span style={{fontSize:11,color:"#64748b",fontWeight:600}}>🎨 Connection Color:</span>
        {["#7c3aed","#2563eb","#16a34a","#dc2626","#d97706","#0d9488","#db2777","#334155"].map(c=>(
          <button key={c} onClick={()=>setLineColor(c)}
            style={{width:20,height:20,borderRadius:"50%",background:c,border:lineColor===c?"3px solid #1e293b":"2px solid transparent",cursor:"pointer",flexShrink:0}}
          />
        ))}
        <input type="color" value={lineColor} onChange={e=>setLineColor(e.target.value)}
          style={{width:24,height:24,border:"none",borderRadius:4,cursor:"pointer",padding:0,background:"none"}}
          title="Custom color"
        />
        {highlightId && (
          <button onClick={()=>setHighlightId(null)}
            style={{marginLeft:"auto",fontSize:10,color:"#94a3b8",background:"none",border:"1px solid #e2e8f0",borderRadius:5,padding:"2px 7px",cursor:"pointer"}}>
            ✕ Clear highlight
          </button>
        )}
      </div>
      {/* ──────────────────────────────────────────────────────────────
          ✅ FIX: removed hardcoded "height:calc(100vh - 180px)" here.
          That duplicated the height already given by the PARENT
          (MyNetwork's wrapper div), and ignored the toolbar's own
          height above — so the measured box.h didn't match the real
          available space, breaking the scale-to-fit math at every
          breakpoint. flex:1 now lets this div take exactly whatever
          space is left inside the parent's fixed-height container.
          ✅ overflow changed hidden → auto: once zoomMult pushes the
          tree past the container size, the user can scroll/pan to
          reach every node instead of it being clipped off-screen.
         ────────────────────────────────────────────────────────────── */}
      {/* ✅ FIX (nodes cut off at bottom): this was minHeight:340 — a fixed
          floor. Once the zoom toolbar grew to 2 rows, toolbar-height + 340
          could exceed the parent's fixed/overflow:hidden box, so this flex
          column quietly overflowed its own ancestor and got clipped at the
          bottom. minHeight:0 is the standard flexbox fix: it lets this
          child shrink to exactly "whatever's left after the toolbar" no
          matter how tall the toolbar gets, so nothing ever pushes the
          layout past the parent's box — it just scrolls internally instead. */}
      <div style={{flex:1,width:"100%",minHeight:0,position:"relative"}}>
      <div ref={containerRef} style={{width:"100%",height:"100%",position:"relative",overflow:"auto",background:"linear-gradient(135deg,#f8fafc 0%,#f0f4ff 100%)"}}>
      <div style={{position:"relative",width:stageW,height:stageH}}>
      <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.4}}>
        <defs><pattern id="dtgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dtgrid)"/>
      </svg>
      <div style={{position:"absolute",left:offsetX,top:offsetY,width:rawW,height:rawH,transform:`scale(${scale})`,transformOrigin:"top left",transition:"transform 0.35s cubic-bezier(.4,0,.2,1), left 0.35s, top 0.35s"}}>
        <svg style={{position:"absolute",top:0,left:0,width:rawW,height:rawH,pointerEvents:"none",overflow:"visible"}}>
          <defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><circle cx="3" cy="3" r="1.5" fill={DT.lineClr}/></marker></defs>
          {edges.map((edge,i)=>{
            const x1=edge.from.x+DT.nodeW/2
            const y1=edge.from.y+DT.nodeH
            const x2=edge.to.x+DT.nodeW/2
            const y2=edge.to.y
            // ✅ Highlight: direct connections of selected node (level 1 and level 2)
            const fromId=String(edge.from.node.id||edge.from.node._id||"")
            const toId=String(edge.to.node.id||edge.to.node._id||"")
            const isHighlight1 = highlightId && (fromId===highlightId)
            const isHighlight2 = highlightId && (toId===highlightId)
            const color = isHighlight1 ? lineColor
                        : isHighlight2 ? lineColor+"99"
                        : DT.lineClr
            const width = (isHighlight1||isHighlight2) ? 2.5 : 1.5
            // ✅ STRAIGHT lines — M x1 y1 L x2 y2
            return(
              <path key={i}
                d={`M ${x1} ${y1} L ${x2} ${y2}`}
                fill="none"
                stroke={color}
                strokeWidth={width}
                strokeLinecap="round"
              />
            )
          })}
        </svg>
        {allNodes.map((layout,i)=>{
          const nodeId=String(layout.node.id||layout.node._id||i)
          const c=getRC(layout.node.role);const hasKids=(layout.node.children||[]).length>0;const isColld=!!collapsed[nodeId]
          const icon=c.label==="Distributor"?"🏢":c.label==="Seller"?"🛒":c.label==="Admin"?"👑":"👤"
          return(
            <div key={nodeId} style={{position:"absolute",left:layout.x,top:layout.y,width:DT.nodeW,height:DT.nodeH,animation:`dtNodeIn 0.3s cubic-bezier(.4,0,.2,1) ${i*0.02}s both`}}>
              <div className="mn-card"
                onClick={()=>{
                  setHighlightId(p=>p===nodeId?null:nodeId)
                  onSelect(layout.node)
                  // ✅ "Zoom toward the clicked node": bump zoom in (never out)
                  // and center the view on it. The actual pan happens in the
                  // useEffect above, once the new scale/offset are computed.
                  // ✅ Zoom smoothly to an absolute 50% zoom level toward
                  // the clicked node (not relative to whatever zoom you
                  // were already at) — baseScale is the current "100% fit"
                  // scale, so dividing 0.5 by it gives the zoomMult needed
                  // to land exactly on a 50% display value.
                  const targetMult = baseScale > 0 ? 0.5 / baseScale : 1
                  setZoomMult(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, targetMult)))
                  setFocusTarget({ x: layout.x + DT.nodeW/2, y: layout.y + DT.nodeH/2 })
                }}
                style={{width:"100%",height:"100%",
                  background: highlightId===nodeId ? lineColor+"22" : c.bg,
                  border:`2px solid ${highlightId===nodeId ? lineColor : c.border}`,
                  borderRadius:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  boxShadow: highlightId===nodeId ? `0 0 0 3px ${lineColor}40,0 4px 16px ${lineColor}30` : `0 4px 16px ${c.dot}20,0 1px 4px rgba(0,0,0,0.06)`,
                  userSelect:"none",padding:"8px 10px",boxSizing:"border-box",gap:2,cursor:"pointer"}}>
                <div style={{fontSize:24,lineHeight:1,filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.12))"}}>{icon}</div>
                <div style={{fontSize:12,fontWeight:700,color:c.text,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:DT.nodeW-20,textAlign:"center",marginTop:2}}>{layout.node.name}</div>
                <div style={{fontSize:10,color:c.dot,fontWeight:600,background:`${c.dot}12`,borderRadius:99,padding:"1px 8px",marginTop:1}}>{c.label}</div>
              </div>
              {hasKids&&(
                <button onClick={e=>{e.stopPropagation();setCollapsed(p=>({...p,[nodeId]:!p[nodeId]}))}}
                  style={{position:"absolute",bottom:-13,left:"50%",transform:"translateX(-50%)",width:26,height:26,borderRadius:"50%",background:"#fff",border:`2px solid ${c.border}`,color:c.dot,fontSize:12,fontWeight:900,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${c.dot}30,0 1px 3px rgba(0,0,0,0.12)`,zIndex:10,padding:0,cursor:"pointer",transition:"all 0.2s ease"}}>
                  {isColld?"+":" −"}
                </button>
              )}
            </div>
          )
        })}
      </div>
      </div>
      </div>
      </div>
    </div>
  )
}

export default function MyNetwork() {
  const {user}=useAuth()||{}
  const [tree,setTree]=useState([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(null)
  const [viewMode,setViewMode]=useState("graph")
  const [graphRoot,setGraphRoot]=useState(null)
  const [filteredId,setFilteredId]=useState(null)
  const [roleFilter,setRoleFilter]=useState("all")
  const [selectedUser,setSelectedUser]=useState(null)

  // ❌ REMOVED: body scroll-lock. AnalyticsPanel renders inline in normal
  // page flow (not a real fixed/overlay bottom-sheet), so locking the
  // body's scroll made content below the fold (e.g. Sales Graph) totally
  // unreachable on every viewport — mobile, tablet, and desktop alike.
  const [isMobile,setIsMobile]=useState(window.innerWidth<768)
  const [screenW,setScreenW]=useState(window.innerWidth)

  useEffect(()=>{if(document.getElementById("mn-styles"))return;const s=document.createElement("style");s.id="mn-styles";s.textContent=STYLE;document.head.appendChild(s)},[])
  useEffect(()=>{const check=()=>{setIsMobile(window.innerWidth<768);setScreenW(window.innerWidth)};window.addEventListener("resize",check);return()=>window.removeEventListener("resize",check)},[])
  useEffect(()=>{
    const load=async()=>{
      try{setLoading(true);setError(null);const token=localStorage.getItem("token");if(!token){setError("Token missing");return}
        const res=await fetch(`${import.meta.env.VITE_API_URL}/users/tree`,{headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"}})
        if(!res.ok)throw new Error("Failed to load network")
        const data=await res.json()
        setTree(Array.isArray(data)?data:Array.isArray(data?.tree)?data.tree:[])
      }catch(err){setError(err.message)}finally{setLoading(false)}
    };load()
  },[])
  useEffect(()=>{
    if(tree&&tree.length>0){let r=tree[0];if(user?.role!=="admin"){const f=tree.filter(n=>n.role!=="admin");if(f.length>0)r=f[0]}setGraphRoot(r)}
  },[tree,user])

  const allNodes=useMemo(()=>{const l=[];tree.forEach(r=>collectAllNodes(r,l));return l},[tree])
  const displayRoots=useMemo(()=>{
    let roots=tree
    if(filteredId){for(const r of tree){const f=findNodeById(r,filteredId);if(f){roots=[f];break}}}
    if(roleFilter!=="all")roots=roots.map(r=>filterTopByRole(r,roleFilter)).filter(Boolean)
    return roots
  },[filteredId,roleFilter,tree])
  const networkSubtree=useMemo(()=>{
    if(!graphRoot)return null;const uid=graphRoot.id||graphRoot._id
    for(const r of tree){const f=findNodeById(r,uid);if(f)return f}
    return graphRoot
  },[graphRoot,tree])

  const handleReset=()=>{setFilteredId(null);setRoleFilter("all")}
  const handleSelNode=id=>{setFilteredId(id);setRoleFilter("all")}
  const handleClick=useCallback(node=>setSelectedUser(node),[])

  const renderNode=(node,level=0)=>(
    <div key={node.id||node._id} style={{marginLeft:level*16}}>
      <div className="mn-card" onClick={()=>setSelectedUser(node)} style={{padding:"8px 12px",border:"1px solid #e2e8f0",borderRadius:8,margin:"3px 0",background:"#f8fafc",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontWeight:600,fontSize:13,color:"#1e293b",flex:1}}>{node.name||"User"}</span>
        <span style={{fontSize:11,color:getRC(node.role).dot,fontWeight:600}}>{getRoleLabel(node.role)||"-"}</span>
      </div>
      {node.children&&sortKids(node.children).map(ch=>renderNode(ch,level+1))}
    </div>
  )

  const mobileNodes=useMemo(()=>{const list=[];const walk=(n,lv=1)=>{if(!n)return;list.push({...n,level:lv});sortKids(n.children||[]).forEach(c=>walk(c,lv+1))};displayRoots.forEach(r=>walk(r,1));return list},[displayRoots])
  const roleCounts=useMemo(()=>({all:mobileNodes.length,distributor:mobileNodes.filter(n=>n.role==="distributor").length,seller:mobileNodes.filter(n=>n.role==="seller").length,user:mobileNodes.filter(n=>n.role==="user").length}),[mobileNodes])
  const mobileFiltered=useMemo(()=>roleFilter==="all"?mobileNodes:mobileNodes.filter(n=>n.role===roleFilter),[mobileNodes,roleFilter])

  const views=[{key:"network",label:"👥 Network",recommended:true},{key:"graph",label:"🌳 Graph",recommended:false},{key:"tree",label:"📋 List",recommended:false}]

  if(isMobile) return(
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"system-ui,sans-serif",paddingBottom:80}}>
      <div style={{background:"#fff",padding:"14px 14px 10px",borderBottom:"1px solid #e2e8f0",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <span style={{fontSize:20}}>🌐</span>
          <div>
            <h2 style={{margin:0,fontSize:15,fontWeight:800,color:"#1e293b"}}>My Network</h2>
            <p style={{margin:0,fontSize:10,color:"#94a3b8"}}>Role: <strong style={{color:getRC(user?.role).dot}}>{user?.role||"unknown"}</strong>{" · Tap node for analytics"}</p>
          </div>
        </div>
        <div style={{display:"flex",background:"#f1f5f9",borderRadius:12,padding:3,gap:2}}>
          {[{key:"network",label:"Network"},{key:"graph",label:"Graph"},{key:"tree",label:"List"}].map(v=>(
            <button key={v.key} className="mn-btn" onClick={()=>setViewMode(v.key)}
              style={{flex:1,padding:"7px 0",borderRadius:10,fontSize:12,fontWeight:700,background:viewMode===v.key?"#fff":"transparent",color:viewMode===v.key?"#1d4ed8":"#64748b",boxShadow:viewMode===v.key?"0 1px 6px rgba(0,0,0,0.10)":"none",border:"none"}}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"12px"}}>
        {loading&&<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:8}}>⏳</div><p style={{margin:0,fontSize:13}}>Loading your network...</p></div>}
        {error&&<div style={{padding:"12px 14px",background:"#fef2f2",borderRadius:10,color:"#dc2626",fontSize:13,border:"1px solid #fecaca"}}>❌ {error}</div>}
        {viewMode==="graph"&&!loading&&(
          <div style={{background:"#fff",borderRadius:14,boxShadow:"0 1px 8px rgba(0,0,0,0.06)",overflow:"hidden"}}>
            <div style={{padding:"12px 14px",borderBottom:"1px solid #f1f5f9"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:14,color:"#94a3b8"}}>🔍</span>
                <select onChange={e=>{e.target.value?handleSelNode(e.target.value):handleReset()}} value={filteredId||""}
                  style={{flex:1,border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 8px",fontSize:11,color:"#334155",outline:"none",background:"#f8fafc"}}>
                  <option value="">— All nodes —</option>
                  {allNodes.map(n=><option key={n.id} value={n.id}>{n.name} ({getRoleLabel(n.role)})</option>)}
                </select>
                {filteredId&&<button className="mn-btn" onClick={handleReset} style={{padding:"5px 8px",borderRadius:8,border:"1px solid #fca5a5",background:"#fff1f2",color:"#dc2626",fontSize:11,fontWeight:700}}>✕</button>}
              </div>
            </div>
            {/* ─────────────────────────────────────────────────────────
                ✅ FIX: was using maxHeight + overflow:auto with no
                definite height, so DesktopTree's height:"100%" couldn't
                resolve correctly and its internal flex:1 measurement
                was inconsistent across widths. Now gives a definite
                height so the scale-to-fit math matches what's actually
                visible (no scroll needed, the tree shrinks to fit).
               ───────────────────────────────────────────────────────── */}
            <div style={{ padding:"8px 0", height:"calc(100vh - 280px)", minHeight:340, overflow:"hidden" }}>
              <DesktopTree roots={displayRoots} onSelect={handleClick}/>
            </div>
          </div>
        )}
        {viewMode==="network"&&!loading&&(
          <div style={{background:"#fff",borderRadius:14,padding:12,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
            <ConnectedUsers subtree={networkSubtree}/>
          </div>
        )}
        {viewMode==="tree"&&!loading&&(
          <>
            <div style={{display:"flex",background:"#f1f5f9",borderRadius:10,padding:3,gap:2,marginBottom:10}}>
              {[["all","All"],["distributor","Dist"],["seller","Seller"],["user","User"]].map(([k,l])=>(
                <button key={k} className="mn-btn" onClick={()=>setRoleFilter(k)}
                  style={{flex:1,padding:"6px 0",borderRadius:8,fontSize:11,fontWeight:700,border:"none",background:roleFilter===k?"#fff":"transparent",color:roleFilter===k?"#1d4ed8":"#64748b",boxShadow:roleFilter===k?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>
                  {l} ({roleCounts[k]||0})
                </button>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {mobileFiltered.map(n=>{const c=getRC(n.role);return(
                <div key={n.id||n._id} className="mn-card" onClick={()=>setSelectedUser(n)}
                  style={{background:"#fff",borderRadius:12,padding:"10px 12px",boxShadow:"0 1px 4px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:10,borderLeft:`3px solid ${c.border}`}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.name}</div>
                    <div style={{fontSize:11,color:c.dot,fontWeight:600}}>{n.role}{n.level>1?` · L${n.level}`:""}</div>
                  </div>
                  <span style={{fontSize:11,padding:"2px 7px",borderRadius:20,fontWeight:700,background:c.bg,color:c.text,flexShrink:0}}>📊</span>
                </div>
              )})}
              {mobileFiltered.length===0&&<div style={{textAlign:"center",padding:32,color:"#94a3b8",fontSize:13}}>Koi user nahi mila</div>}
            </div>
          </>
        )}
        {tree.length===0&&!loading&&<div style={{textAlign:"center",padding:48,color:"#94a3b8"}}><div style={{fontSize:44,marginBottom:12}}>🕸️</div><p style={{margin:0,fontSize:14}}>Aapke network mein koi user nahi hai abhi</p></div>}
      </div>
      {selectedUser&&(
        <div style={{marginTop:12,background:"#fff",borderRadius:16,boxShadow:"0 2px 16px rgba(0,0,0,0.08)",border:"1px solid #e2e8f0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #f1f5f9",background:"#f8fafc",borderRadius:"16px 16px 0 0"}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>{selectedUser.name}</div>
              <div style={{fontSize:11,color:getRC(selectedUser.role).dot,fontWeight:600,textTransform:"capitalize"}}>{selectedUser.role}</div>
            </div>
            <button className="mn-btn" onClick={()=>setSelectedUser(null)} style={{width:30,height:30,borderRadius:"50%",border:"none",background:"#e2e8f0",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>✕</button>
          </div>
          <AnalyticsPanel selectedUser={selectedUser} treeData={tree} onClose={()=>setSelectedUser(null)}/>
        </div>
      )}
    </div>
  )

  return(
    <div style={{background:"#fff",borderRadius:12,boxShadow:"0 2px 16px rgba(0,0,0,0.07)",overflow:"hidden",fontFamily:"system-ui,sans-serif"}}>
      <div style={{padding:"14px 16px",background:"linear-gradient(135deg,#f8fafc,#f0f4ff)",borderBottom:"1px solid #e8eef4"}}>
        <h2 style={{fontSize:16,fontWeight:800,color:"#1e293b",margin:0}}>🌐 My Network</h2>
        <p style={{fontSize:11,color:"#94a3b8",margin:"2px 0 8px"}}>Role: <strong style={{color:getRC(user?.role).dot}}>{user?.role||"unknown"}</strong>{" · Kisi bhi user pe click karo"}</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {views.map(v=>(
            <button key={v.key} className="mn-btn" onClick={()=>setViewMode(v.key)}
              style={{display:"flex",alignItems:"center",gap:5,padding:"7px 16px",borderRadius:99,fontSize:12,fontWeight:700,whiteSpace:"nowrap",border:viewMode===v.key?"2px solid #3b82f6":"2px solid #e2e8f0",background:viewMode===v.key?"#eff6ff":"#fff",color:viewMode===v.key?"#1d4ed8":"#64748b",boxShadow:viewMode===v.key?"0 0 0 3px #3b82f622":"none"}}>
              {v.label}
              {v.recommended&&viewMode!==v.key&&<span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:99,background:"#dcfce7",color:"#15803d"}}>✓</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:16}}>
        {loading&&<div style={{textAlign:"center",padding:32,color:"#94a3b8",fontSize:13}}><div style={{fontSize:28,marginBottom:8}}>⏳</div>Loading...</div>}
        {error&&<div style={{padding:"12px 16px",background:"#fef2f2",borderRadius:10,color:"#dc2626",fontSize:13,border:"1px solid #fecaca"}}>❌ {error}</div>}
        {viewMode==="network"&&!loading&&(
          <>
            <ConnectedUsers subtree={networkSubtree}/>
            <div style={{marginTop:10,padding:"8px 12px",background:"#f0f9ff",borderRadius:8,border:"1px solid #bae6fd",fontSize:12,color:"#0369a1"}}>💡 📊 icon pe click karo kisi bhi user ki analytics dekhne ke liye</div>
          </>
        )}
        {viewMode==="graph"&&!loading&&(
          <>
            {allNodes.length>0&&<FilterBar allNodes={allNodes} selectedId={filteredId} roleFilter={roleFilter} onSelectNode={handleSelNode} onSelectRole={setRoleFilter} onReset={handleReset}/>}
            <div style={{background:"#f8fafc",borderRadius:12,border:"1px solid #e8eef4",height:"calc(100vh - 180px)",minHeight:400,overflow:"hidden"}}>
              <DesktopTree roots={displayRoots} onSelect={handleClick}/>
            </div>
          </>
        )}
        {viewMode==="tree"&&!loading&&(
          <>
            {allNodes.length>0&&<FilterBar allNodes={allNodes} selectedId={filteredId} roleFilter={roleFilter} onSelectNode={handleSelNode} onSelectRole={setRoleFilter} onReset={handleReset}/>}
            {displayRoots.length>0?<div style={{marginTop:8}}>{displayRoots.map(n=>renderNode(n))}</div>:<div style={{textAlign:"center",padding:24,color:"#94a3b8",fontSize:13}}>No data</div>}
          </>
        )}
        {tree.length===0&&!loading&&<div style={{textAlign:"center",padding:32,color:"#94a3b8",fontSize:13}}><div style={{fontSize:32,marginBottom:8}}>🕸️</div>Aapke network mein koi user nahi hai abhi</div>}
      </div>
      {selectedUser&&(
        <div style={{marginTop:16,background:"#fff",borderRadius:16,boxShadow:"0 2px 16px rgba(0,0,0,0.08)",border:"1px solid #e2e8f0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid #f1f5f9",background:"#f8fafc",borderRadius:"16px 16px 0 0"}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:"#1e293b"}}>{selectedUser.name}</div>
              <div style={{fontSize:12,color:getRC(selectedUser.role).dot,fontWeight:600,textTransform:"capitalize"}}>{selectedUser.role}</div>
            </div>
            <button className="mn-btn" onClick={()=>setSelectedUser(null)} style={{width:32,height:32,borderRadius:"50%",border:"none",background:"#e2e8f0",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>✕</button>
          </div>
          <AnalyticsPanel selectedUser={selectedUser} treeData={tree} onClose={()=>setSelectedUser(null)}/>
        </div>
      )}
    </div>
  )
}
