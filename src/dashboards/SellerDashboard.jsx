import { useAuth } from "../context/AuthContext"
import { useEffect, useState } from "react"
import { useStore } from "../context/StoreContext"
import Store from "../pages/Store"
import { LineChart, AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from "recharts"

export default function SellerDashboard() {
  const { user } = useAuth()
  const { products = [] } = useStore()
  const [orders, setOrders]     = useState([])
  const [downline, setDownline] = useState([])
  const [teamOrders, setTeamOrders] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState("overview")
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [roleFilter, setRoleFilter] = useState("all")
  const [perfTab, setPerfTab] = useState("my")  // "my" | "team"

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (!user) return <div className="p-6 text-red-500">Please login again.</div>

  const tkn = () => localStorage.getItem("token")
  const hdr = () => ({ Authorization: `Bearer ${tkn()}` })

  useEffect(() => {
    const load = async () => {
      try {
        const [o, d, t] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/orders/mine`,       { headers: hdr() }),
          fetch(`${import.meta.env.VITE_API_URL}/users/my-downline`, { headers: hdr() }),
          fetch(`${import.meta.env.VITE_API_URL}/orders/team`,       { headers: hdr() }),
        ])
        if (o.ok) setOrders(await o.json())
        if (d.ok) { const j = await d.json(); setDownline(j.downline || []) }
        if (t.ok) { const tj = await t.json(); setTeamOrders(tj.orders || []) }
      } catch(e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  const confirmed  = orders.filter(o => o.status === "confirmed")
  const totalSales = confirmed.reduce((s,o) => s + (o.total||0), 0)
  const pending    = orders.filter(o => o.status === "pending").length
  const rejected   = orders.filter(o => o.status === "rejected").length
  const sellers    = downline.filter(u => u.role === "seller")
  const users      = downline.filter(u => u.role === "user")
  const isUser     = user.role === "user"

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

  const filteredDl = downline.filter(u => roleFilter==="all" || u.role===roleFilter)

  const statusColor = s =>
    s==="confirmed"?"#16a34a": s==="rejected"?"#dc2626":"#d97706"

  /* ============================================================
     MOBILE LAYOUT — bottom tab bar, full-screen cards
  ============================================================ */
  if (isMobile) {
    const mobileTabs = [
      {key:"overview",label:"Home",    icon:"🏠"},
      {key:"orders",  label:"Orders",  icon:"📋"},
      ...(!isUser?[{key:"team",label:"Team",icon:"👥"}]:[]),
      {key:"store",   label:"Store",   icon:"🛍️"},
    ]

    return (
      <div style={{minHeight:"100vh",background:"#f8fafc",paddingBottom:72,fontFamily:"system-ui,sans-serif"}}>

        {/* ── Top Header ── */}
        <div style={{background:"linear-gradient(135deg,#2563eb,#4f46e5)",padding:"20px 16px 24px",borderRadius:"0 0 28px 28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff",flexShrink:0}}>
              {user.name?.[0]||"S"}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>
                {isUser?"User":"Seller"} Dashboard
              </div>
              <div style={{color:"#fff",fontWeight:700,fontSize:16,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {user.name}
              </div>
            </div>
          </div>

          {/* Quick stat pills */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {label:"Total Orders",value:orders.length,         icon:"🛒"},
              {label:"Total Sales", value:`₹${totalSales.toLocaleString("en-IN")}`,icon:"💰"},
              {label:"Pending",     value:pending,               icon:"⏳"},
              {label:"Confirmed",   value:confirmed.length,      icon:"✅"},
            ].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"10px 12px",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:20}}>{s.icon}</span>
                <div>
                  <div style={{color:"#fff",fontWeight:700,fontSize:15,lineHeight:1}}>{s.value}</div>
                  <div style={{color:"rgba(255,255,255,0.7)",fontSize:10,marginTop:2}}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{padding:"16px 14px",display:"flex",flexDirection:"column",gap:12}}>

          {/* OVERVIEW */}
          {tab==="overview" && (
            <>
              {/* Order Status */}
              <div style={{background:"#fff",borderRadius:18,padding:16,boxShadow:"0 1px 8px #0001"}}>
                <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:10}}>Order Summary</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[
                    {label:"Pending",  v:pending,          bg:"#fffbeb",c:"#d97706"},
                    {label:"Confirmed",v:confirmed.length, bg:"#f0fdf4",c:"#16a34a"},
                    {label:"Rejected", v:rejected,         bg:"#fef2f2",c:"#dc2626"},
                  ].map(s=>(
                    <div key={s.label} style={{background:s.bg,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                      <div style={{fontWeight:700,fontSize:20,color:s.c}}>{s.v}</div>
                      <div style={{fontSize:10,color:s.c,opacity:0.8,fontWeight:600}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart */}
              {chartData.length>0 && (
                <div style={{background:"#fff",borderRadius:18,padding:16,boxShadow:"0 1px 8px #0001"}}>
                  {/* Performance Tab Toggle */}
                  <div style={{display:"flex",gap:6,marginBottom:10}}>
                    {[["my","📈 My Performance"],["team","👥 My Team"]].map(([k,label])=>(
                      <button key={k} onClick={()=>setPerfTab(k)}
                        style={{flex:1,padding:"5px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                          background: perfTab===k ? "#2563eb" : "#f1f5f9",
                          color: perfTab===k ? "#fff" : "#64748b"
                        }}>{label}</button>
                    ))}
                  </div>
                  {perfTab==="my" ? (
                    <>
                      {/* Stats strip */}
                      <div style={{display:"flex",gap:6,marginBottom:10}}>
                        {[
                          {label:"Total Sales",value:`₹${confirmed.reduce((s,o)=>s+(o.total||0),0).toLocaleString("en-IN")}`,color:"#2563eb"},
                          {label:"Orders",value:confirmed.length,color:"#16a34a"},
                          {label:"Avg/Order",value:`₹${confirmed.length?Math.round(confirmed.reduce((s,o)=>s+(o.total||0),0)/confirmed.length):0}`,color:"#f59e0b"},
                        ].map(s=>(
                          <div key={s.label} style={{flex:1,background:"#f8fafc",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                            <div style={{fontSize:13,fontWeight:800,color:s.color}}>{s.value}</div>
                            <div style={{fontSize:9,color:"#94a3b8",marginTop:1}}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={chartData} margin={{top:5,right:5,left:-10,bottom:5}}>
                          <defs>
                            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                          <XAxis dataKey="date" tick={{fontSize:9}} interval={0} angle={-15} textAnchor="end" height={30}/>
                          <YAxis yAxisId="sales" tick={{fontSize:9}} tickFormatter={v=>`₹${v}`} width={45}/>
                          <YAxis yAxisId="orders" orientation="right" tick={{fontSize:9}} width={20}/>
                          <Tooltip content={({active,payload,label})=>{
                            if(!active||!payload?.length) return null
                            return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:11,boxShadow:"0 4px 12px #0001"}}>
                              <div style={{fontWeight:700,marginBottom:4,color:"#1e293b"}}>{label}</div>
                              {payload.map(p=>(
                                <div key={p.dataKey} style={{color:p.color,fontWeight:600}}>
                                  {p.dataKey==="sales"?`💰 Sales: ₹${p.value}`:p.dataKey==="orders"?`📦 Orders: ${p.value}`:`📦 Items: ${p.value}`}
                                </div>
                              ))}
                            </div>
                          }}/>
                          <Legend wrapperStyle={{fontSize:10}}/>
                          <Area yAxisId="sales" type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fill="url(#salesGrad)" dot={{fill:"#2563eb",r:3}} name="Sales (₹)"/>
                          <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#16a34a" strokeWidth={2} fill="url(#ordersGrad)" dot={{fill:"#16a34a",r:3}} name="Orders"/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </>
                  ) : (
                    <>
                      <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>
                        Aapki team ke {downline.length} members ki performance
                      </div>
                      {downline.length === 0 ? (
                        <div style={{textAlign:"center",padding:"30px 0",color:"#94a3b8",fontSize:12}}>
                          👥 Abhi team mein koi nahi hai
                        </div>
                      ) : (
                        <>
                          {/* Stats strip */}
                          <div style={{display:"flex",gap:6,marginBottom:10}}>
                            {[
                              {label:"Team Size",value:downline.length,color:"#7c3aed"},
                              {label:"Sellers",value:downline.filter(u=>u.role==="seller").length,color:"#2563eb"},
                              {label:"Users",value:downline.filter(u=>u.role==="user").length,color:"#16a34a"},
                            ].map(s=>(
                              <div key={s.label} style={{flex:1,background:"#f8fafc",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                                <div style={{fontSize:13,fontWeight:800,color:s.color}}>{s.value}</div>
                                <div style={{fontSize:9,color:"#94a3b8",marginTop:1}}>{s.label}</div>
                              </div>
                            ))}
                          </div>
                          {/* Same AreaChart as desktop */}
                          {teamOrders.length === 0 ? (
                            <div style={{textAlign:"center",padding:"24px 0",color:"#94a3b8",fontSize:12}}>
                              📊 Team ne abhi koi order nahi kiya
                            </div>
                          ) : (
                            <ResponsiveContainer width="100%" height={180}>
                              <AreaChart data={teamChartData} margin={{top:5,right:5,left:-10,bottom:10}}>
                                <defs>
                                  <linearGradient id="mobTeamSalesG" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="mobTeamOrdG" x1="0" y1="0" x2="0" y2="1">
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
                                <Area yAxisId="sales" type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} fill="url(#mobTeamSalesG)" dot={{fill:"#16a34a",r:3}} activeDot={{r:5}} name="Team Sales (₹)"/>
                                <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={1.5} fill="url(#mobTeamOrdG)" dot={{fill:"#f59e0b",r:2}} activeDot={{r:4}} name="Orders"/>
                              </AreaChart>
                            </ResponsiveContainer>
                          )}
                          {/* Team orders list mobile */}
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
                        </>
                      )}
                    </>
                  )}
                </div>
        )}

              {/* Recent orders */}
              <div style={{background:"#fff",borderRadius:18,padding:16,boxShadow:"0 1px 8px #0001"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>Recent Orders</div>
                  {orders.length>3 && <button onClick={()=>setTab("orders")} style={{fontSize:11,color:"#2563eb",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>See All</button>}
                </div>
                {orders.length===0 ? <div style={{textAlign:"center",color:"#94a3b8",fontSize:13,padding:"12px 0"}}>Koi order nahi</div>
                : orders.slice(0,3).map(o=>(
                  <div key={o._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f1f5f9"}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:"#1e293b"}}>{o.customerName||"—"}</div>
                      <div style={{fontSize:10,color:"#94a3b8"}}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,fontSize:14}}>₹{o.total}</div>
                      <div style={{fontSize:10,fontWeight:600,color:statusColor(o.status)}}>{o.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ORDERS */}
          {tab==="orders" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {loading ? <div style={{textAlign:"center",padding:32,color:"#94a3b8"}}>Loading...</div>
              : orders.length===0 ? (
                <div style={{background:"#fff",borderRadius:18,padding:32,textAlign:"center",boxShadow:"0 1px 8px #0001"}}>
                  <div style={{fontSize:36,marginBottom:8}}>📭</div>
                  <div style={{color:"#94a3b8",fontSize:13}}>Koi order nahi abhi tak</div>
                </div>
              ) : orders.map(o=>(
                <div key={o._id} style={{background:"#fff",borderRadius:16,padding:14,boxShadow:"0 1px 6px #0001",borderLeft:`4px solid ${statusColor(o.status)}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>{o.customerName||"—"}</div>
                      <div style={{fontSize:11,color:"#94a3b8"}}>{o.phone}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,fontSize:16}}>₹{o.total}</div>
                      <div style={{fontSize:10,fontWeight:700,color:statusColor(o.status),textTransform:"capitalize"}}>{o.status}</div>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:"#94a3b8",marginTop:8,paddingTop:6,borderTop:"1px solid #f8fafc"}}>
                    {new Date(o.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TEAM */}
          {tab==="team" && !isUser && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{background:"#eff6ff",borderRadius:14,padding:"12px",textAlign:"center"}}>
                  <div style={{fontWeight:700,fontSize:22,color:"#2563eb"}}>{sellers.length}</div>
                  <div style={{fontSize:11,color:"#2563eb",fontWeight:600}}>Sellers</div>
                </div>
                <div style={{background:"#faf5ff",borderRadius:14,padding:"12px",textAlign:"center"}}>
                  <div style={{fontWeight:700,fontSize:22,color:"#9333ea"}}>{users.length}</div>
                  <div style={{fontSize:11,color:"#9333ea",fontWeight:600}}>Users</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                {[["all","All"],["seller","Sellers"],["user","Users"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setRoleFilter(k)}
                    style={{flex:1,padding:"6px 4px",borderRadius:20,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",
                      background:roleFilter===k?"#2563eb":"#f1f5f9",color:roleFilter===k?"#fff":"#64748b",transition:"all 0.2s"}}>
                    {l}
                  </button>
                ))}
              </div>
              {filteredDl.map(u=>(
                <div key={u._id} style={{background:"#fff",borderRadius:14,padding:"12px 14px",boxShadow:"0 1px 6px #0001",display:"flex",alignItems:"center",gap:10,
                  borderLeft:`3px solid ${u.role==="seller"?"#2563eb":"#9333ea"}`}}>
                  <div style={{fontSize:18}}>{u.role==="seller"?"🛒":"👤"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13,color:"#1e293b"}}>{u.name}</div>
                  </div>
                  <span style={{fontSize:10,padding:"3px 8px",borderRadius:20,fontWeight:700,
                    background:u.role==="seller"?"#eff6ff":"#faf5ff",color:u.role==="seller"?"#2563eb":"#9333ea"}}>
                    {u.role}
                  </span>
                </div>
              ))}
              {filteredDl.length===0 && <div style={{textAlign:"center",color:"#94a3b8",padding:24,fontSize:13}}>Koi member nahi</div>}
            </div>
          )}

          {/* STORE */}
          {tab==="store" && <div style={{background:"#fff",borderRadius:18,padding:12,boxShadow:"0 1px 8px #0001"}}><Store/></div>}
        </div>

        {/* ── Bottom Tab Bar ── */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #e2e8f0",display:"flex",zIndex:999,boxShadow:"0 -4px 20px #0001"}}>
          {mobileTabs.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{flex:1,padding:"10px 4px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                color:tab===t.key?"#2563eb":"#94a3b8",transition:"color 0.2s"}}>
              <span style={{fontSize:20}}>{t.icon}</span>
              <span style={{fontSize:9,fontWeight:tab===t.key?700:500}}>{t.label}</span>
              {tab===t.key && <div style={{width:4,height:4,borderRadius:"50%",background:"#2563eb"}}/>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ============================================================
     DESKTOP LAYOUT — sidebar + content area
  ============================================================ */
  const desktopTabs = [
    {key:"overview",label:"📊 Overview"},
    {key:"orders",  label:"📋 My Orders"},
    ...(!isUser?[{key:"team",label:"👥 My Team"}]:[]),
    {key:"store",   label:"🛍️ Store"},
  ]

  return (
    <div style={{display:"flex",gap:24,maxWidth:1100,margin:"0 auto",padding:"32px 24px",fontFamily:"system-ui,sans-serif"}}>

      {/* ── Sidebar ── */}
      <div style={{width:260,flexShrink:0,display:"flex",flexDirection:"column",gap:16}}>

        {/* Profile card */}
        <div style={{background:"linear-gradient(135deg,#2563eb,#4f46e5)",borderRadius:20,padding:20,color:"#fff",boxShadow:"0 4px 20px #2563eb30"}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,marginBottom:12}}>
            {user.name?.[0]||"S"}
          </div>
          <div style={{fontWeight:700,fontSize:18}}>{user.name}</div>
          <div style={{opacity:0.75,fontSize:12,marginTop:2,textTransform:"capitalize"}}>{user.role}</div>
        </div>

        {/* Quick stats */}
        <div style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 2px 12px #0001"}}>
          {[
            {label:"Total Orders",value:orders.length,          color:"#2563eb"},
            {label:"Total Sales", value:`₹${totalSales.toLocaleString("en-IN")}`,color:"#16a34a"},
            {label:"Pending",     value:pending,                 color:"#d97706"},
            {label:"Confirmed",   value:confirmed.length,        color:"#16a34a"},
            {label:"Team Size",   value:downline.length,         color:"#9333ea"},
          ].map((s,i)=>(
            <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<4?"1px solid #f8fafc":"none"}}>
              <span style={{fontSize:13,color:"#64748b",fontWeight:500}}>{s.label}</span>
              <span style={{fontSize:15,fontWeight:700,color:s.color}}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div style={{background:"#fff",borderRadius:20,padding:"8px",boxShadow:"0 2px 12px #0001"}}>
          {desktopTabs.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{width:"100%",textAlign:"left",padding:"11px 14px",borderRadius:12,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:2,
                background:tab===t.key?"#eff6ff":"transparent",color:tab===t.key?"#2563eb":"#64748b",transition:"all 0.15s"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:20}}>

        {/* OVERVIEW */}
        {tab==="overview" && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {[
                {label:"Pending",  v:pending,         bg:"#fffbeb",c:"#d97706"},
                {label:"Confirmed",v:confirmed.length,bg:"#f0fdf4",c:"#16a34a"},
                {label:"Rejected", v:rejected,        bg:"#fef2f2",c:"#dc2626"},
              ].map(s=>(
                <div key={s.label} style={{background:s.bg,borderRadius:16,padding:20,textAlign:"center",boxShadow:"0 2px 8px #0001"}}>
                  <div style={{fontWeight:700,fontSize:32,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:13,color:s.c,fontWeight:600,opacity:0.8,marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {(chartData.length>0 || downline.length>0) && (
              <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px #0001"}}>
                {/* Tab Toggle */}
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  {[["my","📈 My Performance"],["team","👥 My Team Performance"]].map(([k,label])=>(
                    <button key={k} onClick={()=>setPerfTab(k)}
                      style={{flex:1,padding:"8px 0",borderRadius:10,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,
                        background: perfTab===k ? "#2563eb" : "#f1f5f9",
                        color: perfTab===k ? "#fff" : "#64748b",
                        boxShadow: perfTab===k ? "0 2px 8px #2563eb44" : "none"
                      }}>{label}</button>
                  ))}
                </div>
                {perfTab==="my" ? (
                  <>
                    <div style={{display:"flex",gap:8,marginBottom:12}}>
                      {[
                        {label:"Total Sales",value:`₹${confirmed.reduce((s,o)=>s+(o.total||0),0).toLocaleString("en-IN")}`,color:"#2563eb",icon:"💰"},
                        {label:"Orders",value:confirmed.length,color:"#16a34a",icon:"📦"},
                        {label:"Avg/Order",value:`₹${confirmed.length?Math.round(confirmed.reduce((s,o)=>s+(o.total||0),0)/confirmed.length):0}`,color:"#f59e0b",icon:"📊"},
                        {label:"Items Sold",value:confirmed.reduce((s,o)=>s+(o.items||[]).reduce((a,i)=>a+(i.qty||1),0),0),color:"#7c3aed",icon:"🛒"},
                      ].map(s=>(
                        <div key={s.label} style={{flex:1,background:"#f8fafc",borderRadius:10,padding:"10px",textAlign:"center"}}>
                          <div style={{fontSize:14}}>{s.icon}</div>
                          <div style={{fontSize:16,fontWeight:800,color:s.color}}>{s.value}</div>
                          <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={chartData} margin={{top:5,right:10,left:0,bottom:10}}>
                        <defs>
                          <linearGradient id="deskSalesG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="deskOrderG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
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
                        <Area yAxisId="sales" type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fill="url(#deskSalesG)" dot={{fill:"#2563eb",r:4}} activeDot={{r:6}} name="Sales (₹)"/>
                        <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#16a34a" strokeWidth={2} fill="url(#deskOrderG)" dot={{fill:"#16a34a",r:3}} activeDot={{r:5}} name="Orders"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <>
                    <div style={{display:"flex",gap:8,marginBottom:12}}>
                      {[
                        {label:"Team Size",value:downline.length,color:"#7c3aed",icon:"👥"},
                        {label:"Sellers",value:downline.filter(u=>u.role==="seller").length,color:"#2563eb",icon:"🛍️"},
                        {label:"Users",value:downline.filter(u=>u.role==="user").length,color:"#16a34a",icon:"👤"},
                      ].map(s=>(
                        <div key={s.label} style={{flex:1,background:"#f8fafc",borderRadius:10,padding:"10px",textAlign:"center"}}>
                          <div style={{fontSize:14}}>{s.icon}</div>
                          <div style={{fontSize:16,fontWeight:800,color:s.color}}>{s.value}</div>
                          <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {downline.length===0 ? (
                      <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8",fontSize:14}}>👥 Abhi team mein koi nahi hai</div>
                    ) : teamChartData.length===0 ? (
                      <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8",fontSize:14}}>📊 Team ne abhi koi order nahi kiya</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={teamChartData} margin={{top:5,right:10,left:0,bottom:10}}>
                          <defs>
                            <linearGradient id="deskTeamSalesG" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="deskTeamOrdG" x1="0" y1="0" x2="0" y2="1">
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
                            const isCount=payload[0]?.payload?.isCount
                            return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 14px",fontSize:12,boxShadow:"0 4px 16px #0002"}}>
                              <div style={{fontWeight:800,marginBottom:6,color:"#1e293b",borderBottom:"1px solid #f1f5f9",paddingBottom:4}}>{label}</div>
                              {payload.map(p=>(
                                <div key={p.dataKey} style={{color:p.color,fontWeight:600,marginTop:3}}>
                                  {isCount?`👥 Joins: ${p.value}`:p.dataKey==="sales"?`💰 Team Sales: ₹${p.value?.toLocaleString("en-IN")}`:`📦 Orders: ${p.value}`}
                                </div>
                              ))}
                            </div>
                          }}/>
                          <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
                          <Area yAxisId="sales" type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2.5} fill="url(#deskTeamSalesG)" dot={{fill:"#16a34a",r:4}} activeDot={{r:6}} name={teamChartData[0]?.isCount?"New Joins":"Team Sales (₹)"}/>
                          <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} fill="url(#deskTeamOrdG)" dot={{fill:"#f59e0b",r:3}} activeDot={{r:5}} name="Orders"/>
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </>
                )}

                  {/* Team Orders List */}
                  {perfTab==="team" && teamOrders.length > 0 && (
                    <div style={{marginTop:16}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:10,
                        display:"flex",justifyContent:"space-between"}}>
                        <span>📋 Team Orders ({teamOrders.length})</span>
                        <span style={{fontSize:11,color:"#94a3b8"}}>Latest first</span>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {teamOrders.slice(0,10).map((o,i)=>(
                          <div key={o._id||i} style={{display:"flex",alignItems:"center",
                            justifyContent:"space-between",padding:"10px 12px",borderRadius:10,
                            background:"#f8fafc",border:"1px solid #e2e8f0",flexWrap:"wrap",gap:6}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>
                                {o.sellerId?.name||o.customerName||"Unknown"}
                                <span style={{fontSize:10,color:"#94a3b8",marginLeft:5,
                                  background:"#f1f5f9",borderRadius:4,padding:"1px 5px"}}>
                                  {o.sellerId?.role||"user"}
                                </span>
                              </div>
                              <div style={{fontSize:10,color:"#64748b",marginTop:2}}>
                                {new Date(o.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}
                                &nbsp;·&nbsp;{(o.items||[]).length} items
                              </div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontSize:13,fontWeight:800,color:"#16a34a"}}>₹{(o.total||0).toLocaleString("en-IN")}</div>
                              <div style={{fontSize:10,fontWeight:600,display:"inline-block",borderRadius:4,padding:"1px 6px",marginTop:2,
                                color:o.status==="confirmed"?"#16a34a":o.status==="pending"?"#f59e0b":"#ef4444",
                                background:o.status==="confirmed"?"#f0fdf4":o.status==="pending"?"#fefce8":"#fef2f2"
                              }}>{o.status}</div>
                            </div>
                          </div>
                        ))}
                        {teamOrders.length > 10 && (
                          <div style={{textAlign:"center",fontSize:11,color:"#94a3b8",padding:"6px"}}>
                            + {teamOrders.length-10} more orders
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px #0001"}}>
              <div style={{fontWeight:700,fontSize:15,color:"#1e293b",marginBottom:12}}>🕐 Recent Orders</div>
              {orders.length===0 ? <div style={{color:"#94a3b8",textAlign:"center",padding:20}}>Koi order nahi</div>
              : orders.slice(0,5).map(o=>(
                <div key={o._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #f8fafc"}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:"#1e293b"}}>{o.customerName}</div>
                    <div style={{fontSize:11,color:"#94a3b8"}}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,fontSize:15}}>₹{o.total}</div>
                    <div style={{fontSize:11,fontWeight:600,color:statusColor(o.status),textTransform:"capitalize"}}>{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ORDERS */}
        {tab==="orders" && (
          <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px #0001"}}>
            <div style={{fontWeight:700,fontSize:16,color:"#1e293b",marginBottom:16}}>All Orders</div>
            {loading ? <div style={{color:"#94a3b8",textAlign:"center",padding:32}}>Loading...</div>
            : orders.length===0 ? <div style={{color:"#94a3b8",textAlign:"center",padding:32,fontSize:14}}>📭 Koi order nahi abhi tak</div>
            : (
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f8fafc"}}>
                    {["Customer","Phone","Total","Status","Date"].map(h=>(
                      <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o=>(
                    <tr key={o._id} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <td style={{padding:"12px",fontSize:13,fontWeight:600,color:"#1e293b"}}>{o.customerName}</td>
                      <td style={{padding:"12px",fontSize:12,color:"#64748b"}}>{o.phone}</td>
                      <td style={{padding:"12px",fontSize:14,fontWeight:700}}>₹{o.total}</td>
                      <td style={{padding:"12px"}}>
                        <span style={{fontSize:11,padding:"3px 8px",borderRadius:20,fontWeight:700,background:o.status==="confirmed"?"#f0fdf4":o.status==="rejected"?"#fef2f2":"#fffbeb",color:statusColor(o.status),textTransform:"capitalize"}}>{o.status}</span>
                      </td>
                      <td style={{padding:"12px",fontSize:11,color:"#94a3b8"}}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TEAM */}
        {tab==="team" && !isUser && (
          <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 2px 12px #0001"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:16,color:"#1e293b"}}>My Team ({downline.length})</div>
              <div style={{display:"flex",gap:6}}>
                {[["all","All"],["seller","Sellers"],["user","Users"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setRoleFilter(k)}
                    style={{padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:"none",cursor:"pointer",background:roleFilter===k?"#2563eb":"#f1f5f9",color:roleFilter===k?"#fff":"#64748b"}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {filteredDl.map(u=>(
                <div key={u._id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:14,border:"1px solid #f1f5f9",background:"#fafafa",
                  borderLeft:`3px solid ${u.role==="seller"?"#2563eb":"#9333ea"}`}}>
                  <div style={{fontSize:20}}>{u.role==="seller"?"🛒":"👤"}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
                    <div style={{fontSize:10,color:u.role==="seller"?"#2563eb":"#9333ea",fontWeight:600,textTransform:"capitalize"}}>{u.role}</div>
                  </div>
                </div>
              ))}
              {filteredDl.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",color:"#94a3b8",padding:24}}>Koi member nahi mila</div>}
            </div>
          </div>
        )}

        {/* STORE */}
        {tab==="store" && <div style={{background:"#fff",borderRadius:20,padding:20,boxShadow:"0 2px 12px #0001"}}><Store/></div>}
      </div>
    </div>
  )
}
