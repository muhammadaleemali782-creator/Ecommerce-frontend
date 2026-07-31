import { useEffect, useState } from "react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"
import { LineChart, AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from "recharts"

export default function DistributorDashboard() {
  const { products = [] } = useStore()
  const { user } = useAuth()
  const [tab, setTab]           = useState("overview")
  const [downline, setDownline] = useState([])
  const [teamOrders, setTeamOrders] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading]   = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [roleFilter, setRoleFilter] = useState("all")
  const [search, setSearch]     = useState("")
  const [perfTab, setPerfTab]   = useState("my")  // "my" | "team"

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (!user) return <div style={{padding:24,color:"#ef4444",fontWeight:600}}>Please login again.</div>

  const tkn = () => localStorage.getItem("token")
  const hdr = () => ({ Authorization:`Bearer ${tkn()}` })

  useEffect(() => {
    const load = async () => {
      try {
        const [dl, ord, tm] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/users/my-downline`,  {headers:hdr()}),
          fetch(`${import.meta.env.VITE_API_URL}/orders/distributor`, {headers:hdr()}),
          fetch(`${import.meta.env.VITE_API_URL}/orders/team`,        {headers:hdr()}),
        ])
        if (dl.ok)  { const j=await dl.json();  setDownline(j.downline||[]) }
        if (ord.ok) { const j=await ord.json(); setAllOrders(Array.isArray(j)?j:[]) }
        if (tm.ok)  { const j=await tm.json();  setTeamOrders(j.orders||[]) }
      } catch(e){ console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  const confirmed  = allOrders.filter(o=>o.status==="confirmed")
  const totalSales = confirmed.reduce((s,o)=>s+(o.total||0),0)
  const dists   = downline.filter(u=>u.role==="distributor")
  const sellers = downline.filter(u=>u.role==="seller")
  const users   = downline.filter(u=>u.role==="user")

  const chartData = (() => {
    const map = {}
    confirmed.forEach(o => {
      const d = new Date(o.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})
      if (!map[d]) map[d] = { sales:0, orders:0, items:0 }
      map[d].sales  += o.total || 0
      map[d].orders += 1
      map[d].items  += (o.items||[]).reduce((s,i)=>s+(i.qty||1),0)
    })
    const entries = Object.entries(map).slice(-7).map(([date,v])=>({date,...v}))
    // Pad to at least 3 points so chart looks good
    if (entries.length === 1) {
      return [
        {date:"", sales:0, orders:0, items:0},
        entries[0],
        {date:" ", sales:0, orders:0, items:0}
      ]
    }
    return entries
  })()

  // Team chart: use real teamOrders from backend
  const teamChartData = (() => {
    const map = {}
    teamOrders.forEach(o => {
      const d = new Date(o.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})
      if (!map[d]) map[d] = { sales:0, orders:0 }
      map[d].sales  += o.total || 0
      map[d].orders += 1
    })
    if (Object.keys(map).length === 0) {
      downline.forEach(u => {
        const d = new Date(u.createdAt || Date.now()).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})
        if (!map[d]) map[d] = { members:0, orders:0, sales:0 }
        map[d].members += 1
      })
      return Object.entries(map).slice(-7).map(([date,v])=>({date,...v,isCount:true}))
    }
    return Object.entries(map).slice(-7).map(([date,v])=>({date,...v}))
  })()

  const filteredDl = downline.filter(u=>{
    const mr = roleFilter==="all" || u.role===roleFilter
    const ms = !search || u.name.toLowerCase().includes(search.toLowerCase())
    return mr&&ms
  })

  const sc = s => s==="confirmed"?"#16a34a":s==="rejected"?"#dc2626":"#d97706"

  const roleColors = {
    distributor:{bg:"#f0fdf4",c:"#16a34a",border:"#16a34a",icon:"🏢"},
    seller:     {bg:"#eff6ff",c:"#2563eb",border:"#2563eb",icon:"🛒"},
    user:       {bg:"#faf5ff",c:"#9333ea",border:"#9333ea",icon:"👤"},
  }

  /* ====================================================
     MOBILE
  ==================================================== */
  if (isMobile) {
    const mobileTabs = [
      {key:"overview",icon:"🏠",label:"Home"},
      {key:"team",    icon:"👥",label:"Team"},
      {key:"orders",  icon:"📋",label:"Orders"},
    ]

    return (
      <div style={{minHeight:"100vh",background:"#f0fdf4",paddingBottom:72,fontFamily:"system-ui,sans-serif"}}>

        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#16a34a,#0d9488)",padding:"20px 16px 28px",borderRadius:"0 0 28px 28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#fff",flexShrink:0}}>
              {user.name?.[0]||"D"}
            </div>
            <div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Distributor Central</div>
              <div style={{color:"#fff",fontWeight:700,fontSize:17}}>{user.name}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {icon:"📋",label:"Orders",  value:allOrders.length},
              {icon:"💰",label:"Sales",   value:`₹${totalSales.toLocaleString("en-IN")}`},
              {icon:"👥",label:"Network", value:downline.length},
              {icon:"📦",label:"Products",value:products.length},
            ].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"10px 12px",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{s.icon}</span>
                <div>
                  <div style={{color:"#fff",fontWeight:700,fontSize:15,lineHeight:1}}>{s.value}</div>
                  <div style={{color:"rgba(255,255,255,0.7)",fontSize:10}}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:"14px 14px",display:"flex",flexDirection:"column",gap:12}}>

          {/* OVERVIEW */}
          {tab==="overview" && (
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[
                  {label:"Distributors",value:dists.length,  bg:"#f0fdf4",c:"#16a34a"},
                  {label:"Sellers",     value:sellers.length, bg:"#eff6ff",c:"#2563eb"},
                  {label:"Users",       value:users.length,   bg:"#faf5ff",c:"#9333ea"},
                ].map(s=>(
                  <div key={s.label} style={{background:s.bg,borderRadius:14,padding:"10px 8px",textAlign:"center",boxShadow:"0 1px 4px #0001"}}>
                    <div style={{fontWeight:700,fontSize:22,color:s.c}}>{s.value}</div>
                    <div style={{fontSize:10,color:s.c,fontWeight:600,opacity:0.8}}>{s.label}</div>
                  </div>
                ))}
              </div>

              {chartData.length>0 && (
                <div style={{background:"#fff",borderRadius:18,padding:14,boxShadow:"0 1px 8px #0001"}}>
                                    {/* My Team toggle - mobile */}
                  <div style={{display:"flex",gap:6,marginTop:12}}>
                    {[["my","📈 My Performance"],["team","👥 My Team"]].map(([k,label])=>(
                      <button key={k} onClick={()=>setPerfTab(k)}
                        style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",cursor:"pointer",
                          fontSize:11,fontWeight:700,
                          background:perfTab===k?"#16a34a":"#f1f5f9",
                          color:perfTab===k?"#fff":"#64748b"}}>{label}</button>
                    ))}
                  </div>
                  {/* My Performance chart - mobile */}
                  {perfTab==="my" && chartData.length > 0 && (
                    <div style={{marginTop:10}}>
                      <div style={{display:"flex",gap:6,marginBottom:8}}>
                        {[
                          {label:"Sales",value:`₹${confirmed.reduce((s,o)=>s+(o.total||0),0).toLocaleString("en-IN")}`,color:"#16a34a"},
                          {label:"Orders",value:confirmed.length,color:"#2563eb"},
                          {label:"Avg",value:`₹${confirmed.length?Math.round(confirmed.reduce((s,o)=>s+(o.total||0),0)/confirmed.length):0}`,color:"#f59e0b"},
                        ].map(s=>(
                          <div key={s.label} style={{flex:1,background:"#f8fafc",borderRadius:8,padding:"5px 6px",textAlign:"center"}}>
                            <div style={{fontSize:12,fontWeight:800,color:s.color}}>{s.value}</div>
                            <div style={{fontSize:9,color:"#94a3b8"}}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={chartData} margin={{top:5,right:5,left:-10,bottom:10}}>
                          <defs>
                            <linearGradient id="distMySalesG" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="distMyOrdG" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                          <XAxis dataKey="date" tick={{fontSize:9}} interval={0} angle={-15} textAnchor="end" height={28}/>
                          <YAxis yAxisId="sales" tick={{fontSize:9}} tickFormatter={v=>`₹${v}`} width={42}/>
                          <YAxis yAxisId="orders" orientation="right" tick={{fontSize:9}} width={18}/>
                          <Tooltip content={({active,payload,label})=>{
                            if(!active||!payload?.length) return null
                            return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:11,boxShadow:"0 4px 12px #0001"}}>
                              <div style={{fontWeight:700,marginBottom:4,color:"#1e293b"}}>{label}</div>
                              {payload.map(p=>(
                                <div key={p.dataKey} style={{color:p.color,fontWeight:600}}>
                                  {p.dataKey==="sales"?`💰 Sales: ₹${p.value?.toLocaleString("en-IN")}`:`📦 Orders: ${p.value}`}
                                </div>
                              ))}
                            </div>
                          }}/>
                          <Legend wrapperStyle={{fontSize:9}}/>
                          <Area yAxisId="sales" type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} fill="url(#distMySalesG)" dot={{fill:"#16a34a",r:3}} activeDot={{r:5}} name="Sales (₹)"/>
                          <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={1.5} fill="url(#distMyOrdG)" dot={{fill:"#2563eb",r:2}} activeDot={{r:4}} name="Orders"/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {/* Team chart - mobile */}
                  {perfTab==="team" && (
                    <div style={{marginTop:10}}>
                      <div style={{display:"flex",gap:6,marginBottom:8}}>
                        {[
                          {label:"Team",value:downline.length,color:"#7c3aed"},
                          {label:"Sellers",value:downline.filter(u=>u.role==="seller").length,color:"#2563eb"},
                          {label:"Users",value:downline.filter(u=>u.role==="user").length,color:"#16a34a"},
                        ].map(s=>(
                          <div key={s.label} style={{flex:1,background:"#f8fafc",borderRadius:8,padding:"5px 6px",textAlign:"center"}}>
                            <div style={{fontSize:12,fontWeight:800,color:s.color}}>{s.value}</div>
                            <div style={{fontSize:9,color:"#94a3b8"}}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      {teamOrders.length === 0 ? (
                        <div style={{textAlign:"center",padding:"20px 0",color:"#94a3b8",fontSize:12}}>
                          📊 Team ne abhi koi order nahi kiya
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={180}>
                          <AreaChart data={teamChartData} margin={{top:5,right:5,left:-10,bottom:10}}>
                            <defs>
                              <linearGradient id="distMobTeamSG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="distMobTeamOG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                            <XAxis dataKey="date" tick={{fontSize:9}} interval={0} angle={-15} textAnchor="end" height={28}/>
                            <YAxis yAxisId="sales" tick={{fontSize:9}} tickFormatter={v=>`₹${v}`} width={42}/>
                            <YAxis yAxisId="orders" orientation="right" tick={{fontSize:9}} width={18}/>
                            <Tooltip content={({active,payload,label})=>{
                              if(!active||!payload?.length) return null
                              return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:11,boxShadow:"0 4px 12px #0001"}}>
                                <div style={{fontWeight:700,marginBottom:4,color:"#1e293b"}}>{label}</div>
                                {payload.map(p=>(
                                  <div key={p.dataKey} style={{color:p.color,fontWeight:600}}>
                                    {p.dataKey==="sales"?`💰 Team Sales: ₹${p.value?.toLocaleString("en-IN")}`:`📦 Orders: ${p.value}`}
                                  </div>
                                ))}
                              </div>
                            }}/>
                            <Legend wrapperStyle={{fontSize:9}}/>
                            <Area yAxisId="sales" type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} fill="url(#distMobTeamSG)" dot={{fill:"#2563eb",r:3}} activeDot={{r:5}} name="Team Sales (₹)"/>
                            <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={1.5} fill="url(#distMobTeamOG)" dot={{fill:"#f59e0b",r:2}} activeDot={{r:4}} name="Orders"/>
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                      {/* Team orders - mobile */}
                      {teamOrders.slice(0,5).map((o,i)=>(
                        <div key={o._id||i} style={{display:"flex",justifyContent:"space-between",
                          alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{o.sellerId?.name||o.customerName||"Unknown"}</div>
                            <div style={{fontSize:10,color:"#94a3b8"}}>{new Date(o.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:12,fontWeight:800,color:"#16a34a"}}>₹{(o.total||0).toLocaleString("en-IN")}</div>
                            <div style={{fontSize:9,fontWeight:600,color:o.status==="confirmed"?"#16a34a":"#f59e0b"}}>{o.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {products.length>0 && (
                <div style={{background:"#fff",borderRadius:18,padding:14,boxShadow:"0 1px 8px #0001"}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:8}}>📦 Assigned Products</div>
                  {products.slice(0,4).map(p=>(
                    <div key={p._id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f8fafc"}}>
                      <span style={{fontSize:13,color:"#334155",fontWeight:500}}>{p.title}</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#16a34a"}}>₹{p.price}</span>
                    </div>
                  ))}
                  {products.length>4 && <div style={{fontSize:11,color:"#94a3b8",textAlign:"center",paddingTop:6}}>+{products.length-4} more</div>}
                </div>
              )}
            </>
          )}

          {/* TEAM */}
          {tab==="team" && (
            <>
              <div style={{background:"#fff",borderRadius:16,padding:12,boxShadow:"0 1px 6px #0001"}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..."
                  style={{width:"100%",border:"1px solid #e2e8f0",borderRadius:12,padding:"8px 12px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
                <div style={{display:"flex",gap:6,overflowX:"auto"}}>
                  {[["all","All"],["distributor","Dist."],["seller","Sellers"],["user","Users"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setRoleFilter(k)}
                      style={{flexShrink:0,padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:roleFilter===k?"#16a34a":"#f1f5f9",color:roleFilter===k?"#fff":"#64748b"}}>
                      {l} ({k==="all"?downline.length:k==="distributor"?dists.length:k==="seller"?sellers.length:users.length})
                    </button>
                  ))}
                </div>
              </div>
              {loading ? <div style={{textAlign:"center",padding:24,color:"#94a3b8"}}>Loading...</div>
              : filteredDl.map(u=>{
                const rc=roleColors[u.role]||roleColors.user
                return (
                  <div key={u._id} style={{background:"#fff",borderRadius:14,padding:"12px 14px",boxShadow:"0 1px 6px #0001",display:"flex",alignItems:"center",gap:10,
                    borderLeft:`3px solid ${rc.border}`,paddingLeft:`${14+(u.level-1)*10}px`}}>
                    <span style={{fontSize:18}}>{rc.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13,color:"#1e293b"}}>{u.name}</div>
                      {u.level>1 && <div style={{fontSize:10,color:"#94a3b8"}}>Level {u.level}</div>}
                    </div>
                    <span style={{fontSize:10,padding:"3px 8px",borderRadius:20,fontWeight:700,background:rc.bg,color:rc.c}}>{u.role}</span>
                  </div>
                )
              })}
              {filteredDl.length===0 && <div style={{textAlign:"center",color:"#94a3b8",padding:24,fontSize:13}}>Koi nahi mila</div>}
            </>
          )}

          {/* ORDERS */}
          {tab==="orders" && (
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[
                  {label:"Pending",  v:allOrders.filter(o=>o.status==="pending").length,   bg:"#fffbeb",c:"#d97706"},
                  {label:"Confirmed",v:confirmed.length, bg:"#f0fdf4",c:"#16a34a"},
                  {label:"Rejected", v:allOrders.filter(o=>o.status==="rejected").length,  bg:"#fef2f2",c:"#dc2626"},
                ].map(s=>(
                  <div key={s.label} style={{background:s.bg,borderRadius:14,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontWeight:700,fontSize:22,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:10,color:s.c,fontWeight:600}}>{s.label}</div>
                  </div>
                ))}
              </div>
              {loading ? <div style={{textAlign:"center",padding:24,color:"#94a3b8"}}>Loading...</div>
              : allOrders.length===0 ? <div style={{background:"#fff",borderRadius:18,padding:32,textAlign:"center",color:"#94a3b8"}}>📭 Koi order nahi</div>
              : allOrders.map(o=>(
                <div key={o._id} style={{background:"#fff",borderRadius:14,padding:14,boxShadow:"0 1px 6px #0001",borderLeft:`4px solid ${sc(o.status)}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>{o.customerName||"—"}</div>
                      <div style={{fontSize:11,color:"#94a3b8"}}>{o.phone} • {o.sellerId?.name||"—"}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,fontSize:16}}>₹{o.total}</div>
                      <div style={{fontSize:10,fontWeight:700,color:sc(o.status),textTransform:"capitalize"}}>{o.status}</div>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:"#94a3b8",marginTop:8}}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #e2e8f0",display:"flex",zIndex:999,boxShadow:"0 -4px 20px #0001"}}>
          {mobileTabs.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{flex:1,padding:"10px 4px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                color:tab===t.key?"#16a34a":"#94a3b8",transition:"color 0.2s"}}>
              <span style={{fontSize:22}}>{t.icon}</span>
              <span style={{fontSize:9,fontWeight:tab===t.key?700:500}}>{t.label}</span>
              {tab===t.key && <div style={{width:4,height:4,borderRadius:"50%",background:"#16a34a"}}/>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ====================================================
     DESKTOP
  ==================================================== */
  const deskTabs = [
    {key:"overview",label:"📊 Overview"},
    {key:"team",    label:"👥 My Network"},
    {key:"orders",  label:"📋 Orders"},
  ]

  return (
    <div style={{display:"flex",gap:24,maxWidth:1100,margin:"0 auto",padding:"32px 24px",fontFamily:"system-ui,sans-serif"}}>

      {/* Sidebar */}
      <div style={{width:260,flexShrink:0,display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:"linear-gradient(135deg,#16a34a,#0d9488)",borderRadius:20,padding:20,color:"#fff",boxShadow:"0 4px 20px #16a34a30"}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700,marginBottom:12}}>
            {user.name?.[0]||"D"}
          </div>
          <div style={{fontWeight:700,fontSize:18}}>{user.name}</div>
          <div style={{opacity:0.75,fontSize:12,marginTop:2}}>Distributor</div>
        </div>

        <div style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 2px 12px #0001"}}>
          {[
            {label:"Total Orders",   value:allOrders.length,   color:"#2563eb"},
            {label:"Total Sales",    value:`₹${totalSales.toLocaleString("en-IN")}`,color:"#16a34a"},
            {label:"Distributors",   value:dists.length,        color:"#16a34a"},
            {label:"Sellers",        value:sellers.length,      color:"#2563eb"},
            {label:"Users",          value:users.length,        color:"#9333ea"},
            {label:"Products",       value:products.length,     color:"#d97706"},
          ].map((s,i)=>(
            <div key={s.label} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<5?"1px solid #f8fafc":"none"}}>
              <span style={{fontSize:13,color:"#64748b",fontWeight:500}}>{s.label}</span>
              <span style={{fontSize:14,fontWeight:700,color:s.color}}>{s.value}</span>
            </div>
          ))}
        </div>

        <div style={{background:"#fff",borderRadius:20,padding:"8px",boxShadow:"0 2px 12px #0001"}}>
          {deskTabs.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{width:"100%",textAlign:"left",padding:"11px 14px",borderRadius:12,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:2,
                background:tab===t.key?"#f0fdf4":"transparent",color:tab===t.key?"#16a34a":"#64748b"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:20}}>

        {tab==="overview" && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {[
                {label:"Distributors",value:dists.length,  bg:"#f0fdf4",c:"#16a34a"},
                {label:"Sellers",     value:sellers.length, bg:"#eff6ff",c:"#2563eb"},
                {label:"Users",       value:users.length,   bg:"#faf5ff",c:"#9333ea"},
              ].map(s=>(
                <div key={s.label} style={{background:s.bg,borderRadius:16,padding:20,textAlign:"center",boxShadow:"0 2px 8px #0001"}}>
                  <div style={{fontWeight:700,fontSize:32,color:s.c}}>{s.value}</div>
                  <div style={{fontSize:13,color:s.c,fontWeight:600,opacity:0.8,marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {chartData.length>0 && (
              <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px #0001"}}>
                {/* Performance Tab Toggle */}
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  {[["my","📈 My Performance"],["team","👥 My Team Performance"]].map(([k,label])=>(
                    <button key={k} onClick={()=>setPerfTab(k)}
                      style={{flex:1,padding:"7px 0",borderRadius:10,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                        background: perfTab===k ? "#16a34a" : "#f1f5f9",
                        color: perfTab===k ? "#fff" : "#64748b",
                        boxShadow: perfTab===k ? "0 2px 8px #16a34a44" : "none"
                      }}>{label}</button>
                  ))}
                </div>
                {perfTab==="my" ? (
                  <>
                    <div style={{display:"flex",gap:8,marginBottom:12}}>
                      {[
                        {label:"Total Sales",value:`₹${confirmed.reduce((s,o)=>s+(o.total||0),0).toLocaleString("en-IN")}`,color:"#16a34a",icon:"💰"},
                        {label:"Orders",value:confirmed.length,color:"#2563eb",icon:"📦"},
                        {label:"Avg/Order",value:`₹${confirmed.length?Math.round(confirmed.reduce((s,o)=>s+(o.total||0),0)/confirmed.length):0}`,color:"#f59e0b",icon:"📊"},
                        {label:"Items Sold",value:confirmed.reduce((s,o)=>s+(o.items||[]).reduce((a,i)=>a+(i.qty||1),0),0),color:"#7c3aed",icon:"🛒"},
                      ].map(s=>(
                        <div key={s.label} style={{flex:1,background:"#f8fafc",borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
                          <div style={{fontSize:11}}>{s.icon}</div>
                          <div style={{fontSize:15,fontWeight:800,color:s.color}}>{s.value}</div>
                          <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={chartData} margin={{top:5,right:10,left:0,bottom:10}}>
                        <defs>
                          <linearGradient id="distMySalesG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="distMyOrderG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                        <XAxis dataKey="date" tick={{fontSize:11}} angle={-15} textAnchor="end" height={35}/>
                        <YAxis yAxisId="sales" tick={{fontSize:11}} tickFormatter={v=>`₹${v}`} width={55}/>
                        <YAxis yAxisId="orders" orientation="right" tick={{fontSize:11}} width={30}/>
                        <Tooltip content={({active,payload,label})=>{
                          if(!active||!payload?.length) return null
                          return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 14px",fontSize:12,boxShadow:"0 4px 16px #0002"}}>
                            <div style={{fontWeight:800,marginBottom:6,color:"#1e293b",borderBottom:"1px solid #f1f5f9",paddingBottom:4}}>{label}</div>
                            {payload.map(p=>(
                              <div key={p.dataKey} style={{color:p.color,fontWeight:600,marginTop:3}}>
                                {p.dataKey==="sales"?`💰 Sales: ₹${p.value?.toLocaleString("en-IN")}`:p.dataKey==="orders"?`📦 Orders: ${p.value}`:`🛒 Items: ${p.value}`}
                              </div>
                            ))}
                          </div>
                        }}/>
                        <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
                        <Area yAxisId="sales" type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2.5} fill="url(#distMySalesG)" dot={{fill:"#16a34a",r:4}} activeDot={{r:6}} name="Sales (₹)"/>
                        <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} fill="url(#distMyOrderG)" dot={{fill:"#2563eb",r:3}} activeDot={{r:5}} name="Orders"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <>
                    <div style={{fontSize:11,color:"#94a3b8",marginBottom:8}}>
                      Aapki team ke {downline.length} members ki combined performance
                    </div>
                    {downline.length === 0 ? (
                      <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8",fontSize:13}}>
                        👥 Abhi team mein koi nahi hai
                      </div>
                    ) : teamChartData.length === 0 ? (
                      <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8",fontSize:13}}>
                        📊 Team ne abhi koi order nahi kiya
                      </div>
                    ) : (
                        <>
                      <div style={{display:"flex",gap:8,marginBottom:12}}>
                          {[
                            {label:"Team Size",value:downline.length,color:"#7c3aed",icon:"👥"},
                            {label:"Sellers",value:downline.filter(u=>u.role==="seller").length,color:"#2563eb",icon:"🛍️"},
                            {label:"Users",value:downline.filter(u=>u.role==="user").length,color:"#16a34a",icon:"👤"},
                            {label:"Distributors",value:downline.filter(u=>u.role==="distributor").length,color:"#f59e0b",icon:"📊"},
                          ].map(s=>(
                            <div key={s.label} style={{flex:1,background:"#f8fafc",borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
                              <div style={{fontSize:11}}>{s.icon}</div>
                              <div style={{fontSize:15,fontWeight:800,color:s.color}}>{s.value}</div>
                              <div style={{fontSize:9,color:"#94a3b8",marginTop:1}}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                          {teamChartData.filter(d=>d.sales>0||d.orders>0).length <= 2 ? (
                            <BarChart data={teamChartData.filter(d=>d.date!==""&&d.date!==" ")} margin={{top:5,right:10,left:0,bottom:10}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                              <XAxis dataKey="date" tick={{fontSize:11}} angle={-15} textAnchor="end" height={35}/>
                              <YAxis tick={{fontSize:11}} tickFormatter={v=>`₹${v}`} width={55}/>
                              <Tooltip content={({active,payload,label})=>{
                                if(!active||!payload?.length) return null
                                return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 14px",fontSize:12,boxShadow:"0 4px 16px #0002"}}>
                                  <div style={{fontWeight:800,marginBottom:6,color:"#1e293b"}}>{label}</div>
                                  {payload.map(p=>(
                                    <div key={p.dataKey} style={{color:p.color,fontWeight:600,marginTop:3}}>
                                      {p.dataKey==="sales"?`💰 Team Sales: ₹${p.value?.toLocaleString("en-IN")}`:`📦 Orders: ${p.value}`}
                                    </div>
                                  ))}
                                </div>
                              }}/>
                              <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
                              <Bar dataKey="sales" fill="#2563eb" name="Team Sales (₹)" radius={[4,4,0,0]}/>
                              <Bar dataKey="orders" fill="#f59e0b" name="Orders" radius={[4,4,0,0]}/>
                            </BarChart>
                          ) : (
                          <AreaChart data={teamChartData} margin={{top:5,right:10,left:0,bottom:10}}>
                            <defs>
                              <linearGradient id="distTeamSalesG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="distTeamOrdG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                            <XAxis dataKey="date" tick={{fontSize:11}} angle={-15} textAnchor="end" height={35}/>
                            <YAxis yAxisId="sales" tick={{fontSize:11}} tickFormatter={v=>teamChartData[0]?.isCount?`${v}`:`₹${v}`} width={55}/>
                            <YAxis yAxisId="orders" orientation="right" tick={{fontSize:11}} width={30}/>
                            <Tooltip content={({active,payload,label})=>{
                              if(!active||!payload?.length) return null
                              const isCount = payload[0]?.payload?.isCount
                              return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 14px",fontSize:12,boxShadow:"0 4px 16px #0002"}}>
                                <div style={{fontWeight:800,marginBottom:6,color:"#1e293b",borderBottom:"1px solid #f1f5f9",paddingBottom:4}}>{label}</div>
                                {payload.map(p=>(
                                  <div key={p.dataKey} style={{color:p.color,fontWeight:600,marginTop:3}}>
                                    {isCount ? `👥 New Joins: ${p.value}` : p.dataKey==="sales" ? `💰 Team Sales: ₹${p.value}` : `📦 Orders: ${p.value}`}
                                  </div>
                                ))}
                              </div>
                            }}/>
                            <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
                            <Area yAxisId="sales" type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fill="url(#distTeamSalesG)" dot={{fill:"#2563eb",r:4}} activeDot={{r:6}} name={teamChartData[0]?.isCount?"New Joins":"Team Sales (₹)"}/>
                            <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} fill="url(#distTeamOrdG)" dot={{fill:"#f59e0b",r:3}} activeDot={{r:5}} name="Orders"/>
                          </AreaChart>
                          )}
                        </ResponsiveContainer>
                        </>
                    )}
                  </>
                )}
                  {/* ✅ Team Orders List */}
                  {perfTab==="team" && teamOrders.length > 0 && (
                    <div style={{marginTop:16}}>
                      <div style={{fontWeight:700,fontSize:14,color:"#1e293b",marginBottom:10,
                        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span>📋 Team Orders <span style={{color:"#7c3aed"}}>({teamOrders.length})</span></span>
                        <span style={{fontSize:11,color:"#94a3b8"}}>Latest first</span>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {teamOrders.slice(0,15).map((o,i)=>(
                          <div key={o._id||i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                            padding:"12px 16px",borderRadius:12,background:"#f8fafc",
                            border:"1px solid #e2e8f0",flexWrap:"wrap",gap:8}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>
                                {o.sellerId?.name || o.customerName || "Unknown"}
                                <span style={{fontSize:10,fontWeight:500,color:"#94a3b8",marginLeft:6,
                                  background:"#f1f5f9",borderRadius:4,padding:"1px 6px"}}>
                                  {o.sellerId?.role || "user"}
                                </span>
                              </div>
                              <div style={{fontSize:11,color:"#64748b",marginTop:3}}>
                                📅 {new Date(o.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
                                &nbsp;·&nbsp;🛒 {(o.items||[]).length} items
                              </div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontSize:15,fontWeight:800,color:"#16a34a"}}>₹{(o.total||0).toLocaleString("en-IN")}</div>
                              <div style={{fontSize:10,marginTop:3,fontWeight:600,display:"inline-block",borderRadius:6,padding:"2px 8px",
                                color: o.status==="confirmed"?"#16a34a":o.status==="pending"?"#f59e0b":"#ef4444",
                                background: o.status==="confirmed"?"#f0fdf4":o.status==="pending"?"#fefce8":"#fef2f2"
                              }}>{o.status}</div>
                            </div>
                          </div>
                        ))}
                        {teamOrders.length > 15 && (
                          <div style={{textAlign:"center",fontSize:12,color:"#94a3b8",padding:"8px 0"}}>
                            + {teamOrders.length - 15} more orders
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {products.length>0 && (
              <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px #0001"}}>
                <div style={{fontWeight:700,fontSize:15,color:"#1e293b",marginBottom:14}}>📦 Assigned Products</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {products.map(p=>(
                    <div key={p._id} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderRadius:12,background:"#f8fafc"}}>
                      <span style={{fontSize:13,fontWeight:500,color:"#334155"}}>{p.title}</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#16a34a"}}>₹{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab==="team" && (
          <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px #0001"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:16,color:"#1e293b"}}>My Network ({downline.length})</div>
              <div style={{display:"flex",gap:6}}>
                {[["all","All"],["distributor","Distributors"],["seller","Sellers"],["user","Users"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setRoleFilter(k)}
                    style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,border:"none",cursor:"pointer",background:roleFilter===k?"#16a34a":"#f1f5f9",color:roleFilter===k?"#fff":"#64748b"}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search by name..."
              style={{width:"100%",border:"1px solid #e2e8f0",borderRadius:12,padding:"9px 14px",fontSize:13,outline:"none",marginBottom:16,boxSizing:"border-box"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {filteredDl.map(u=>{
                const rc=roleColors[u.role]||roleColors.user
                return (
                  <div key={u._id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:14,border:`1px solid ${rc.border}20`,background:rc.bg,
                    paddingLeft:`${14+(u.level-1)*10}px`}}>
                    <span style={{fontSize:18}}>{rc.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
                      <div style={{fontSize:10,color:rc.c,fontWeight:600}}>{u.role} {u.level>1?`· L${u.level}`:""}</div>
                    </div>
                  </div>
                )
              })}
              {filteredDl.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",color:"#94a3b8",padding:24}}>Koi nahi mila</div>}
            </div>
          </div>
        )}

        {tab==="orders" && (
          <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px #0001"}}>
            <div style={{display:"flex",gap:12,marginBottom:20}}>
              {[
                {label:"Pending",  v:allOrders.filter(o=>o.status==="pending").length,   bg:"#fffbeb",c:"#d97706"},
                {label:"Confirmed",v:confirmed.length, bg:"#f0fdf4",c:"#16a34a"},
                {label:"Rejected", v:allOrders.filter(o=>o.status==="rejected").length,  bg:"#fef2f2",c:"#dc2626"},
              ].map(s=>(
                <div key={s.label} style={{flex:1,background:s.bg,borderRadius:14,padding:16,textAlign:"center"}}>
                  <div style={{fontWeight:700,fontSize:28,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:12,color:s.c,fontWeight:600}}>{s.label}</div>
                </div>
              ))}
            </div>
            {loading ? <div style={{textAlign:"center",padding:32,color:"#94a3b8"}}>Loading...</div>
            : allOrders.length===0 ? <div style={{textAlign:"center",padding:32,color:"#94a3b8"}}>📭 Koi order nahi abhi tak</div>
            : (
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f8fafc"}}>
                    {["Customer","Seller","Phone","Total","Status","Date"].map(h=>(
                      <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map(o=>(
                    <tr key={o._id} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <td style={{padding:"12px",fontSize:13,fontWeight:600,color:"#1e293b"}}>{o.customerName||"—"}</td>
                      <td style={{padding:"12px",fontSize:12,color:"#64748b"}}>{o.sellerId?.name||"—"}</td>
                      <td style={{padding:"12px",fontSize:12,color:"#64748b"}}>{o.phone||"—"}</td>
                      <td style={{padding:"12px",fontSize:14,fontWeight:700}}>₹{o.total}</td>
                      <td style={{padding:"12px"}}>
                        <span style={{fontSize:11,padding:"3px 8px",borderRadius:20,fontWeight:700,background:o.status==="confirmed"?"#f0fdf4":o.status==="rejected"?"#fef2f2":"#fffbeb",color:sc(o.status),textTransform:"capitalize"}}>{o.status}</span>
                      </td>
                      <td style={{padding:"12px",fontSize:11,color:"#94a3b8"}}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
