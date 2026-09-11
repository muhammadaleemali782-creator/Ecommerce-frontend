import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useStore } from "../context/StoreContext"
import ProductAssignSection from "../components/ProductAssignSection"
import { saveFormDraft, getFormDraft, clearFormDraft, hasFormDraft } from "../utils/formDraftManager"
import DraftBanner from "../components/DraftBanner"

export default function CreateSeller() {

  const { user } = useAuth()
  const { fetchProducts } = useStore()   // 🔥 important

  const DRAFT_KEY = "create_seller"
  const draft = getFormDraft(DRAFT_KEY, {})
  const [name, setName] = useState(draft.name || "")
  const [email, setEmail] = useState(draft.email || "")
  const [phone, setPhone] = useState(draft.phone || "")
  const [address, setAddress] = useState(draft.address || "")
  const [password, setPassword] = useState(draft.password || "")
  const [role, setRole] = useState(draft.role || "seller")
  const [hasRestoredDraft, setHasRestoredDraft] = useState(() => hasFormDraft(DRAFT_KEY))

  // Auto-save draft
  useEffect(() => {
    if (name || email || phone || address) {
      saveFormDraft(DRAFT_KEY, { name, email, phone, address, password, role })
    }
  }, [name, email, phone, address, password, role])

  // Flush on phone call / tab suspend
  useEffect(() => {
    const flush = () => {
      if (name || email || phone || address) {
        saveFormDraft(DRAFT_KEY, { name, email, phone, address, password, role })
      }
    }
    window.addEventListener("pagehide", flush)
    window.addEventListener("beforeunload", flush)
    return () => {
      window.removeEventListener("pagehide", flush)
      window.removeEventListener("beforeunload", flush)
    }
  }, [name, email, phone, address, password, role])

  const handleClearDraft = () => {
    clearFormDraft(DRAFT_KEY)
    setName("")
    setEmail("")
    setPhone("")
    setAddress("")
    setPassword("")
    setRole("seller")
    setHasRestoredDraft(false)
  }

  /* ================= ASSIGNED PRODUCTS ================= */
  const [assignedProducts, setAssignedProducts] = useState([])

  const [loading, setLoading] = useState(false)

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    fetchProducts()   // 🔥 seller create page me products load honge
  }, [])

  /* ================= SAFETY ================= */
  if (!user) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <p className="text-red-500 font-semibold">
          Unauthorized access. Please login again.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill all required fields (Name, Email, Password)")
      return
    }

    try {
      setLoading(true)

      const token = localStorage.getItem("token")
      if (!token) {
        alert("Please login again")
        return
      }

      /* 🔥 ensure product ids array */
      const cleanProducts = assignedProducts.map(id => String(id))

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          fullName: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          email: email.trim(),
          password,
          role,
          assignedProducts: cleanProducts   // 🔥 important fix
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "User creation failed")
        return
      }

      alert("User created successfully!")
      clearFormDraft(DRAFT_KEY)
      setHasRestoredDraft(false)

      /* ================= RESET ================= */
      setName("")
      setEmail("")
      setPhone("")
      setAddress("")
      setPassword("")
      setAssignedProducts([])

    } catch (err) {
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-md">
      <h2 className="text-xl font-bold mb-4">
        {user?.role === "distributor" ? "Create Distributor / Seller" : "Create Seller / User"}
      </h2>

      {hasRestoredDraft && (
        <DraftBanner
          onClear={handleClearDraft}
          message="Restored details from your previous session."
        />
      )}

      <form onSubmit={handleSubmit}>

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Full Name *"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Email *"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Phone Number (optional)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Address / Location (optional)"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-3 rounded"
          placeholder="Password *"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-3"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          {/* Distributor → Distributor ya Seller bana sakta hai */}
          {user?.role === "distributor" && (
            <>
              <option value="distributor">Distributor</option>
              <option value="seller">Seller</option>
            </>
          )}
          {/* Seller → Seller ya User bana sakta hai */}
          {user?.role === "seller" && (
            <>
              <option value="seller">Seller</option>
              <option value="user">User</option>
            </>
          )}
          {/* Admin → sab bana sakta hai */}
          {user?.role === "admin" && (
            <>
              <option value="distributor">Distributor</option>
              <option value="seller">Seller</option>
              <option value="user">User</option>
            </>
          )}
        </select>

        {/* 🔥 PRODUCT ASSIGN SECTION — only for seller/distributor */}
        {(role === "seller" || role === "distributor") && (
          <ProductAssignSection onChange={setAssignedProducts} />
        )}

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white w-full py-2 rounded mt-4 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Creating..." : "Create User"}
        </button>

      </form>
    </div>
  )
}
