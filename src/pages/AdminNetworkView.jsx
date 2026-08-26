import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import VisualTree from "../admin/VisualTree"
import { getRoleLabel, getRoleLabelPlural } from "../utils/roleLabels"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import InlineLoader from "../components/InlineLoader"

const RC = {
  admin:       { bg:"bg-purple-950/40", border:"border-purple-500/30", text:"text-purple-300", dot:"#a855f7", icon:"👑", label:"Admin" },
  distributor: { bg:"bg-emerald-950/40", border:"border-emerald-500/30", text:"text-emerald-300", dot:"#10b981", icon:"🏢", label:"Distributor" },
  seller:      { bg:"bg-sky-950/40", border:"border-sky-500/30", text:"text-sky-300", dot:"#38bdf8", icon:"🛒", label:"Seller" },
  user:        { bg:"bg-stone-900/40", border:"border-stone-700/40", text:"text-stone-300", dot:"#94a3b8", icon:"👤", label:"User" },
}
const getRC     = (role) => RC[role] || RC.user
const ROLE_SORT = { distributor:0, seller:1, user:2, admin:3 }
const sortKids  = (arr) => [...(arr||[])].sort((a,b)=>(ROLE_SORT[a.role]??9)-(ROLE_SORT[b.role]??9))

function LevelBadge({ level }) {
  const cfgs = [null,
    { bg:"bg-amber-500/15", color:"text-amber-300", border:"border-amber-500/30", label:"L1 · Commission" },
    { bg:"bg-emerald-500/15", color:"text-emerald-300", border:"border-emerald-500/30", label:"L2 · Commission" },
    { bg:"bg-sky-500/15", color:"text-sky-300", border:"border-sky-500/30", label:"L3 · Commission" },
    { bg:"bg-pink-500/15", color:"text-pink-300", border:"border-pink-500/30", label:"L4 · Coins" },
  ]
  const cfg = cfgs[level] || { bg:"bg-stone-800", color:"text-stone-300", border:"border-white/10", label:`L${level} · Coins` }
  return (
    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

function InlineAnalytics({ userId, userName, userRole }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const c = getRC(userRole)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/user/${userId}?range=lifetime`, { headers:{Authorization:`Bearer ${token}`} })
        setData(await res.json())
      } catch { setData(null) }
      finally { setLoading(false) }
    }
    load()
  }, [userId])

  const timeline = data?.timeline?.length ? data.timeline : Array.from({length:7},(_,i)=>({label:`D${i+1}`,total:0}))

  return (
    <div className={`p-4 rounded-2xl border ${c.bg} ${c.border} mt-2 space-y-3`}>
      {loading ? (
        <InlineLoader label="Loading user performance metrics..." minHeight={60} />
      ) : !data ? (
        <div className="text-xs text-stone-500 text-center py-2 font-mono">No analytics recorded</div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span>{c.icon}</span>
            <span className={`font-bold text-xs ${c.text}`}>{userName}</span>
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 ${c.text}`}>
              {c.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label:"Orders", val:data.ordersCount??0, color:"text-sky-300", bg:"bg-sky-950/40 border-sky-500/20" },
              { label:"Sales Volume", val:`₹${Number(data.totalSales??0).toLocaleString()}`, color:"text-emerald-300", bg:"bg-emerald-950/40 border-emerald-500/20" },
              { label:"Connected", val:data.subUsersCount??0, color:"text-purple-300", bg:"bg-purple-950/40 border-purple-500/20" },
              { label:"Products", val:data.assignedProducts?.length??0, color:"text-amber-300", bg:"bg-amber-950/40 border-amber-500/20" },
            ].map((s,i)=>(
              <div key={i} className={`p-2.5 rounded-xl border text-center ${s.bg}`}>
                <div className="text-[9px] font-mono uppercase text-stone-400 font-bold">{s.label}</div>
                <div className={`text-sm font-black mt-0.5 ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>

          {data.topProduct && (
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs flex items-center justify-between gap-2">
              <span className="font-bold text-amber-300">🏆 Top: {data.topProduct.name}</span>
              <span className="text-[10px] font-mono text-stone-400">
                {data.topProduct.count} units · ₹{Number(data.topProduct.total).toLocaleString()}
              </span>
            </div>
          )}

          {data.assignedProducts?.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase font-bold text-stone-400">Assigned Inventory:</div>
              <div className="flex gap-1.5 flex-wrap">
                {data.assignedProducts.map(p=>(
                  <span key={p._id} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-black/40 text-stone-300 border border-white/10">
                    {p.title} — ₹{p.price}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="h-16 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="label" tick={{fontSize:7, fill:"#78716c"}}/>
                <YAxis tick={{fontSize:7, fill:"#78716c"}} width={24}/>
                <Tooltip contentStyle={{background:"#121814", borderColor:"rgba(255,255,255,0.1)", fontSize:10, borderRadius:8}}/>
                <Line type="monotone" dataKey="total" stroke={c.dot} strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

function SubTreeNode({ node, depth=0, isLast=false, level=1, hideIfNotUser=false }) {
  const [open,       setOpen]       = useState(false)
  const [inlineOpen, setInlineOpen] = useState(false)
  const isHidden  = hideIfNotUser && node.role !== "user" && node._hideSelf
  const children  = sortKids(node.children)
  const hasKids   = children.length > 0
  const c         = getRC(node.role)
  const summary   = hasKids && !open ? (() => {
    const cnt={}; children.forEach(ch=>{cnt[ch.role]=(cnt[ch.role]||0)+1})
    return Object.entries(cnt).map(([r,n])=>`${n} ${getRC(r).label}${n>1?"s":""}`).join(", ")
  })() : ""

  if (isHidden) return (
    <div>{children.map((child,i)=><SubTreeNode key={child.id||child._id||i} node={child} depth={depth} isLast={i===children.length-1} level={level} hideIfNotUser={hideIfNotUser}/>)}</div>
  )

  return (
    <div className="relative">
      {depth>0&&(
        <>
          <div className="absolute left-[-16px] top-0 w-0.5 bg-white/10" style={{bottom: isLast ? "50%" : "0"}} />
          <div className="absolute left-[-16px] top-[18px] w-3.5 h-0.5 bg-white/10" />
        </>
      )}
      <div
        onClick={()=>hasKids&&setOpen(p=>!p)}
        className={`flex items-center gap-2 p-2.5 mb-1.5 rounded-2xl border transition-all cursor-pointer ${
          open && hasKids ? `${c.bg} ${c.border}` : "bg-black/40 border-white/[0.08] hover:border-white/20"
        }`}
      >
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
          hasKids ? (open ? "bg-white/20 text-white" : "bg-white/5 text-stone-400") : "bg-transparent"
        }`}>
          {hasKids && <span className="text-[8px] font-bold">{open ? "▼" : "▶"}</span>}
        </div>
        <span>{c.icon}</span>
        <span className="text-xs font-bold text-white flex-1 truncate">{node.name}</span>
        <LevelBadge level={level}/>
        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 ${c.text}`}>
          {c.label}
        </span>
        {summary && <span className="text-[10px] text-stone-500 font-mono hidden sm:inline truncate">({summary})</span>}
        {node.isBlocked && <span title="Blocked">🚫</span>}
        <button
          onClick={e=>{e.stopPropagation();setInlineOpen(p=>!p)}}
          title="Performance Graph"
          className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            inlineOpen ? "bg-sky-500 text-white border-sky-400" : "bg-white/[0.06] text-stone-400 border-white/10 hover:text-white"
          }`}
        >
          {inlineOpen ? "▲" : "📊"}
        </button>
      </div>

      {inlineOpen && (
        <div className="ml-6 mb-2">
          <InlineAnalytics userId={node.id||node._id} userName={node.name} userRole={node.role}/>
        </div>
      )}

      {open && hasKids && (
        <div className="pl-6 relative">
          {children.map((child,i)=><SubTreeNode key={child.id||child._id||i} node={child} depth={depth+1} isLast={i===children.length-1} level={level+1} hideIfNotUser={hideIfNotUser}/>)}
        </div>
      )}
    </div>
  )
}

function SubUsersList({ subtree, allSubs }) {
  const [collapsed,    setCollapsed]    = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [search,       setSearch]       = useState("")

  const rawChildren = sortKids(subtree?.children||[])
  const distCount   = rawChildren.filter(c=>c.role==="distributor").length
  const sellerCount = rawChildren.filter(c=>c.role==="seller").length
  const total       = allSubs?.length??0

  const totalUserCount = (() => {
    const list=[]; const collect=(n)=>{if(!n)return;if(n.role==="user")list.push(n);(n.children||[]).forEach(collect)}
    rawChildren.forEach(collect); return list.length
  })()

  const usersOnlyTree = (() => {
    const build=(n)=>{if(!n)return null;const kids=(n.children||[]).map(build).filter(Boolean);if(n.role==="user")return{...n,children:kids};if(kids.length>0)return{...n,_hideSelf:true,children:kids};return null}
    return rawChildren.map(build).filter(Boolean)
  })()

  const filtered = activeFilter==="all" ? rawChildren : activeFilter==="user" ? usersOnlyTree : rawChildren.filter(c=>c.role===activeFilter)

  const searchedFiltered = useMemo(()=>{
    if(!search.trim()) return filtered
    const q=search.toLowerCase()
    const st=(n)=>{if(!n)return null;const match=(n.name||"").toLowerCase().includes(q);const kids=(n.children||[]).map(st).filter(Boolean);if(match||kids.length>0)return{...n,children:kids};return null}
    return filtered.map(st).filter(Boolean)
  },[filtered,search])

  const tabs=[
    {key:"all",         label:"All",          count:rawChildren.length, dot:null},
    distCount>0   && {key:"distributor", label:"Distributors",  count:distCount,      dot:RC.distributor.dot},
    sellerCount>0 && {key:"seller",      label:"Sellers",       count:sellerCount,    dot:RC.seller.dot},
                      {key:"user",        label:"Users",         count:totalUserCount, dot:RC.user.dot},
  ].filter(Boolean)

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">👥 Connected Network Nodes</span>
          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {total} Total
          </span>
        </div>
        {rawChildren.length>0&&(
          <button
            onClick={()=>setCollapsed(p=>!p)}
            className="text-xs font-mono font-bold text-stone-400 hover:text-white uppercase cursor-pointer"
          >
            {collapsed ? "▼ Expand" : "▲ Collapse"}
          </button>
        )}
      </div>

      {!collapsed&&rawChildren.length>0&&(
        <>
          <div className="flex gap-2 flex-wrap items-center">
            {tabs.map(tab=>{
              const isActive=activeFilter===tab.key
              return(
                <button
                  key={tab.key}
                  onClick={()=>setActiveFilter(tab.key)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-black border-white font-black"
                      : "bg-[#111713] text-stone-400 border-white/[0.08] hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                  <span className="text-[10px] font-mono font-bold opacity-80">({tab.count})</span>
                </button>
              )
            })}
          </div>

          <div className="relative">
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Filter nodes by name..."
              className="w-full p-2.5 bg-[#121814] text-white text-xs rounded-xl border border-white/10 focus:outline-none focus:border-[#fbbf24] font-medium"
            />
            {search && (
              <button onClick={()=>setSearch("")} className="absolute right-3 top-2.5 text-stone-400 hover:text-white text-xs font-bold">
                ✕
              </button>
            )}
          </div>
        </>
      )}

      {total===0?(
        <div className="text-center py-6 text-stone-500 text-xs font-mono">No direct downstream nodes connected.</div>
      ):collapsed?(
        <div className="text-center py-3 text-stone-500 text-xs font-mono">{total} downstream nodes hidden.</div>
      ):(
        <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
          {searchedFiltered.length>0
            ?searchedFiltered.map((child,i)=><SubTreeNode key={child.id||child._id||i} node={child} depth={0} isLast={i===searchedFiltered.length-1} level={1} hideIfNotUser={activeFilter==="user"}/>)
            :<div className="text-center py-6 text-stone-500 text-xs font-mono">No matching records found.</div>
          }
        </div>
      )}
    </div>
  )
}

export default function AdminNetworkView() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [treeData,       setTreeData]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [selectedUser,   setSelectedUser]   = useState(null)
  const [analytics,      setAnalytics]      = useState(null)
  const [aLoading,       setALoading]       = useState(false)
  const [range,          setRange]          = useState("lifetime")
  const [showLines,      setShowLines]      = useState(true)
  const [allUsers,       setAllUsers]       = useState([])
  const [changingParent, setChangingParent] = useState(false)
  const [newParentId,    setNewParentId]    = useState("")
  const [cpLoading,      setCpLoading]      = useState(false)
  const [cpMsg,          setCpMsg]          = useState("")

  if (!user||user.role!=="admin") return (
    <div className="p-6 bg-red-500/15 border border-red-500/30 rounded-3xl text-red-600 dark:text-red-300 font-bold text-sm">
      ❌ Restricted: Super Admin access required.
    </div>
  )

  useEffect(()=>{loadTree()},[])

  const loadTree = async () => {
    try {
      setLoading(true);setError(null)
      const token=localStorage.getItem("token")
      if(!token) throw new Error("Auth token missing")
      const res=await fetch(`${import.meta.env.VITE_API_URL}/users/tree`,{headers:{Authorization:`Bearer ${token}`}})
      if(!res.ok) throw new Error("Failed to load network tree")
      const data=await res.json()
      let arr=Array.isArray(data)?data:Array.isArray(data?.tree)?data.tree:[]
      const sanitize=(nodes)=>Array.isArray(nodes)?nodes.map(n=>({...n,id:n.id||n._id,name:n.name||"Unnamed",role:n.role||"user",children:sanitize(n.children||[])})):[]
      const sanitized=sanitize(arr)
      let finalTree=sanitized
      if(sanitized.length>1){
        const adminRoot=sanitized.find(n=>n.role==="admin");const nonAdmin=sanitized.filter(n=>n.role!=="admin")
        if(adminRoot){adminRoot.children=[...(adminRoot.children||[]),...nonAdmin];finalTree=[adminRoot]}
        else finalTree=[{id:"admin",name:"Admin",role:"admin",children:sanitized}]
      }
      setTreeData(finalTree)
    } catch(err){setError(err.message);setTreeData([])}
    finally{setLoading(false)}
  }

  useEffect(()=>{
    const load=async()=>{
      try{const token=localStorage.getItem("token");const res=await fetch(`${import.meta.env.VITE_API_URL}/users/all-for-product`,{headers:{Authorization:`Bearer ${token}`}});const d=await res.json();setAllUsers(Array.isArray(d)?d:[])}catch{}
    };load()
  },[])

  useEffect(()=>{
    if(!selectedUser) return
    setChangingParent(false);setCpMsg("")
    const load=async()=>{
      try{setALoading(true);const token=localStorage.getItem("token");const uid=selectedUser.id||selectedUser._id;const res=await fetch(`${import.meta.env.VITE_API_URL}/analytics/user/${uid}?range=${range}`,{headers:{Authorization:`Bearer ${token}`}});setAnalytics(await res.json())}
      catch{setAnalytics(null)}finally{setALoading(false)}
    };load()
  },[selectedUser,range])

  const handleChangeParent=async()=>{
    try{
      setCpLoading(true);setCpMsg("")
      const token=localStorage.getItem("token");const uid=selectedUser.id||selectedUser._id
      const res=await fetch(`${import.meta.env.VITE_API_URL}/admin/change-parent/${uid}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({newParentId:newParentId||null})})
      const data=await res.json()
      if(!res.ok){setCpMsg("❌ "+(data.message||"Failed"));return}
      setCpMsg(`✅ Parent changed to: ${data.newParent?.name||"Root (Admin)"}`);setChangingParent(false);loadTree()
    }catch(err){setCpMsg("❌ Error: "+err.message)}finally{setCpLoading(false)}
  }

  const finalTimeline=analytics?.timeline?.length?analytics.timeline:Array.from({length:7},(_,i)=>({label:`Day ${i+1}`,total:0}))

  if(loading) return (
    <div className={`p-12 rounded-3xl border text-center ${
      isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
    }`}>
      <InlineLoader label="Loading enterprise network topology..." minHeight={220} />
    </div>
  )

  if(error) return (
    <div className="bg-red-500/15 p-6 rounded-3xl border border-red-500/30 text-red-600 dark:text-red-300 font-bold text-xs">
      {error}
    </div>
  )

  return (
    <div className={`space-y-6 select-none max-w-6xl mx-auto transition-colors duration-200 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>
      
      {/* ── HEADER ── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDark ? "bg-[#121814] border-white/[0.08]" : "bg-white border-stone-200 shadow-sm"
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 text-[9.5px] font-black uppercase tracking-widest font-mono">
              ✦ GENEALOGY TOPOLOGY TREE
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            Network Hierarchy & Downstream Tree
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>
            Click any network node to inspect sales performance, assign new parent links, or view level depths.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={()=>setShowLines(p=>!p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer border ${
              showLines
                ? isDark ? "bg-white/10 text-white border-white/20" : "bg-stone-900 text-white border-stone-900"
                : isDark ? "bg-black/40 text-stone-500 border-white/10" : "bg-stone-100 text-stone-600 border-stone-300"
            }`}
          >
            Topology Lines: {showLines ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* ── VISUAL TREE CANVAS ── */}
      <div className={`rounded-3xl border overflow-x-auto p-4 sm:p-6 shadow-2xl min-h-[300px] ${
        isDark ? "bg-[#111713] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        {treeData.length===0?(
          <div className={`text-center py-16 text-xs font-mono ${isDark ? "text-stone-500" : "text-stone-400"}`}>No nodes registered in network.</div>
        ):(
          <VisualTree
            data={treeData}
            showLines={showLines}
            onSelect={(node)=>{setSelectedUser(node);setAnalytics(null);setNewParentId("");setCpMsg("")}}
          />
        )}
      </div>

      {/* ── SELECTED NODE DETAILS INSPECTOR ── */}
      {selectedUser && (
        <div className={`rounded-3xl border p-5 sm:p-7 shadow-2xl space-y-6 ${
          isDark ? "bg-[#111713] border-indigo-500/30" : "bg-white border-indigo-200 shadow-lg"
        }`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
            isDark ? "border-white/[0.06]" : "border-stone-100"
          }`}>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-stone-900"}`}>{selectedUser.name}</h2>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getRC(selectedUser.role).bg} ${getRC(selectedUser.role).text} ${getRC(selectedUser.role).border}`}>
                  {getRC(selectedUser.role).icon} {getRC(selectedUser.role).label}
                </span>
              </div>
              {cpMsg && <p className="text-xs font-bold text-emerald-600 dark:text-emerald-300 mt-1">{cpMsg}</p>}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={range}
                onChange={e=>setRange(e.target.value)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs border focus:outline-none ${
                  isDark ? "bg-black/40 border-white/10 text-white" : "bg-stone-50 border-stone-300 text-stone-900 shadow-sm"
                }`}
              >
                <option value="today">📅 Today</option>
                <option value="week">📅 This Week</option>
                <option value="month">📅 This Month</option>
                <option value="year">📅 This Year</option>
                <option value="lifetime">♾️ Lifetime</option>
              </select>

              <button
                onClick={()=>{setChangingParent(p=>!p);setCpMsg("")}}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase cursor-pointer"
              >
                {changingParent ? "✕ Cancel" : "🔗 Change Parent"}
              </button>

              <button
                onClick={()=>{setSelectedUser(null);setAnalytics(null);setCpMsg("")}}
                className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer ${
                  isDark ? "bg-white/[0.08] hover:bg-white/15 text-stone-400 hover:text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-950"
                }`}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Change Parent Dialog */}
          {changingParent && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-3 ${
              isDark ? "bg-indigo-950/40 border-indigo-500/30" : "bg-indigo-50 border-indigo-200"
            }`}>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">Target Parent Node:</span>
              <select
                value={newParentId}
                onChange={e=>setNewParentId(e.target.value)}
                className={`w-full sm:flex-1 p-2 text-xs font-bold rounded-xl border focus:outline-none ${
                  isDark ? "bg-[#121814] text-white border-white/10" : "bg-white text-stone-900 border-stone-300"
                }`}
              >
                <option value="">— Root Node (Direct Admin) —</option>
                {allUsers.filter(u=>String(u._id)!==String(selectedUser.id||selectedUser._id)).map(u=>(
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <button
                onClick={handleChangeParent}
                disabled={cpLoading}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
              >
                {cpLoading ? "Linking..." : "✓ Confirm Reassignment"}
              </button>
            </div>
          )}

          {aLoading ? (
            <div className="text-center py-12 text-stone-400 text-xs font-mono animate-pulse">
              Fetching metrics & downstream topology...
            </div>
          ) : analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Orders Fulfilled", val:analytics.ordersCount??0, color:"text-sky-600 dark:text-sky-300", bg: isDark ? "bg-sky-950/30 border-sky-500/20" : "bg-sky-50 border-sky-200" },
                  { label:"Gross Sales", val:`₹${Number(analytics.totalSales??0).toLocaleString()}`, color:"text-emerald-600 dark:text-emerald-300", bg: isDark ? "bg-emerald-950/30 border-emerald-500/20" : "bg-emerald-50 border-emerald-200" },
                  { label:"Downstream Users", val:analytics.subUsersCount??0, color:"text-purple-600 dark:text-purple-300", bg: isDark ? "bg-purple-950/30 border-purple-500/20" : "bg-purple-50 border-purple-200" },
                  { label:"Inventory Count", val:analytics.assignedProducts?.length??0, color:"text-amber-600 dark:text-amber-300", bg: isDark ? "bg-amber-950/30 border-amber-500/20" : "bg-amber-50 border-amber-200" },
                ].map((card,i)=>(
                  <div key={i} className={`p-4 rounded-2xl border ${card.bg}`}>
                    <div className={`text-[10px] font-mono uppercase font-bold ${isDark ? "text-stone-400" : "text-stone-500"}`}>{card.label}</div>
                    <div className={`text-xl font-black mt-1 ${card.color}`}>{card.val}</div>
                  </div>
                ))}
              </div>

              {/* Sub Users Tree */}
              <SubUsersList
                subtree={(() => {
                  const uid=selectedUser?.id||selectedUser?._id
                  for(const root of treeData){const found=(function find(n){if(!n)return null;if(String(n.id||n._id)===String(uid))return n;for(const ch of(n.children||[])){const r=find(ch);if(r)return r}return null})(root);if(found)return found}
                  return null
                })()}
                allSubs={analytics.allSubUsers||[]}
              />

              {/* Sales Graph */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                isDark ? "bg-black/40 border-white/[0.08]" : "bg-stone-50 border-stone-200"
              }`}>
                <div className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  isDark ? "text-white" : "text-stone-900"
                }`}>
                  📈 Lifetime Sales Trajectory
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={finalTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}/>
                      <XAxis dataKey="label" tick={{fontSize:9, fill:"#78716c"}}/>
                      <YAxis tick={{fontSize:9, fill:"#78716c"}}/>
                      <Tooltip contentStyle={{background: isDark ? "#121814" : "#ffffff", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", fontSize:11, borderRadius:8, color: isDark ? "#ffffff" : "#000000"}}/>
                      <Line type="monotone" dataKey="total" stroke="#38bdf8" strokeWidth={2.5} dot={false}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
