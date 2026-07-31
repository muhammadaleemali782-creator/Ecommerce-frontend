import { useEffect, useState } from "react"
import { getRoleLabel } from "../utils/roleLabels"

export default function AdminRequestHistory() {
  const [requests, setRequests] = useState([])

  /* ================= NEW STATES ================= */

  const [search,setSearch]=useState("")
  const [statusFilter,setStatusFilter]=useState("")
  const [typeFilter,setTypeFilter]=useState("")
  const [dateFilter,setDateFilter]=useState("")        // requested date
  const [decidedDateFilter,setDecidedDateFilter]=useState("")  // ⭐ NEW - approve/reject date

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token")

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/requests/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const data = await res.json()
      setRequests(data)
    }

    load()
  }, [])

  /* ================= FILTER LOGIC ================= */

  /* ⭐ Jab decision liya gaya (approve/reject) — jo bhi field mila wahi use karo */
  const getDecidedAt = (r) => r.approvedAt || r.rejectedAt || null

  const filteredRequests=requests.filter(r=>{

    const emailMatch=
      r.email?.toLowerCase().includes(search.toLowerCase())

    const idMatch=
      r._id?.toLowerCase().includes(search.toLowerCase())

    const statusMatch=
      statusFilter==="" || r.status===statusFilter

    const typeMatch=
      typeFilter==="" || r.type===typeFilter

    const dateMatch=
      dateFilter==="" ||
      new Date(r.createdAt)
      .toISOString()
      .slice(0,10)===dateFilter

    const decidedAt = getDecidedAt(r)
    const decidedDateMatch=
      decidedDateFilter==="" ||
      (decidedAt && new Date(decidedAt).toISOString().slice(0,10)===decidedDateFilter)

    return (emailMatch||idMatch)&&statusMatch&&typeMatch&&dateMatch&&decidedDateMatch

  })

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="font-bold text-xl mb-4">Request History</h2>

      {/* ================= SEARCH + FILTER ================= */}

      <div className="flex flex-wrap gap-3 mb-4">

        <input
        type="text"
        placeholder="Search Email / UserId"
        value={search}
        onChange={e=>setSearch(e.target.value)}
        className="border p-2 rounded"
        />

        <select
        value={statusFilter}
        onChange={e=>setStatusFilter(e.target.value)}
        className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
        value={typeFilter}
        onChange={e=>setTypeFilter(e.target.value)}
        className="border p-2 rounded"
        >
          <option value="">All Type</option>
          <option value="distributor">Distributor</option>
          <option value="seller">Seller</option>
          <option value="user">User</option>
          <option value="password-reset">Password Reset</option>
        </select>

        <div className="flex flex-col">
          <label className="text-[11px] text-gray-500 mb-0.5">Request Aane ki Date</label>
          <input
          type="date"
          value={dateFilter}
          onChange={e=>setDateFilter(e.target.value)}
          className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] text-gray-500 mb-0.5">Approve/Reject Hone ki Date</label>
          <input
          type="date"
          value={decidedDateFilter}
          onChange={e=>setDecidedDateFilter(e.target.value)}
          className="border p-2 rounded"
          />
        </div>

        <button
        onClick={()=>{
          setSearch("")
          setStatusFilter("")
          setTypeFilter("")
          setDateFilter("")
          setDecidedDateFilter("")
        }}
        className="bg-gray-700 text-white px-4 py-2 rounded self-end"
        >
          Reset
        </button>

      </div>

      {filteredRequests.length === 0 && <p>No history</p>}

      {filteredRequests.map(r => (
        <div key={r._id} className="border p-3 mb-2">
          <b>{r.name}</b> ({r.email}) → {getRoleLabel(r.type)}

          <div className="text-sm text-gray-500">
            Requested by: {r.requestedBy?.name}
          </div>

          <div className={
            r.status === "approved"
              ? "text-green-600 font-semibold"
              : "text-red-600 font-semibold"
          }>
            Status: {r.status}
          </div>

          {/* ================= DATE DISPLAY ================= */}

          <div className="text-xs text-gray-400 mt-1">
            🕐 Request aayi: {new Date(r.createdAt).toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12: true })}
          </div>

          {getDecidedAt(r) && (
            <div className={`text-xs mt-0.5 ${r.status === "approved" ? "text-green-500" : "text-red-500"}`}>
              {r.status === "approved" ? "✅ Approve hui:" : "❌ Reject hui:"}{" "}
              {new Date(getDecidedAt(r)).toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12: true })}
            </div>
          )}

        </div>
      ))}
    </div>
  )
}