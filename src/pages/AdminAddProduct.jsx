
import { useState, useEffect } from "react"

export default function AdminAddProduct() {
  
  const [productName, setProductName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState(null)
  const [ppcReward, setPpcReward] = useState("1")
  const [assignAllUsers, setAssignAllUsers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // ⭐ User list states
  const [allUsers, setAllUsers] = useState([])
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  // ⭐ Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true)
        const token = localStorage.getItem("token")
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/all-for-product`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error("Failed to fetch users")
        const data = await res.json()
        setAllUsers(data)
      } catch (err) {
        console.error("Fetch users error:", err)
      } finally {
        setUsersLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // ⭐ Filter users by search + role
  const filteredUsers = allUsers.filter(u => {
    const matchRole = filterRole === "all" || u.role === filterRole
    const matchSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchRole && matchSearch
  })

  // ⭐ Toggle user selection
  const toggleUser = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // ⭐ Select All / Deselect All visible users
  const toggleSelectAllVisible = () => {
    const visibleIds = filteredUsers.map(u => u._id)
    const allSelected = visibleIds.every(id => selectedUserIds.includes(id))
    if (allSelected) {
      setSelectedUserIds(prev => prev.filter(id => !visibleIds.includes(id)))
    } else {
      setSelectedUserIds(prev => [...new Set([...prev, ...visibleIds])])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setMessage("")
      
      const token = localStorage.getItem("token")
      if (!token) {
        setMessage("Please login first")
        setLoading(false)
        return
      }

      if (!assignAllUsers && selectedUserIds.length === 0) {
        setMessage("Please select at least one user OR check 'Assign to ALL Users'")
        setLoading(false)
        return
      }
      
      const formData = new FormData()
      formData.append("title", productName)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("ppcReward", ppcReward)
      formData.append("assignAllUsers", assignAllUsers)
      if (!assignAllUsers && selectedUserIds.length > 0) {
        formData.append("userIds", JSON.stringify(selectedUserIds))
      }
      if (image) {
        formData.append("image", image)
      }
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/add-product`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText.substring(0, 100)}`)
      }
      
      const data = await res.json()
      
      if (data) {
        setMessage("Product added successfully!")
        setProductName("")
        setPrice("")
        setCategory("")
        setPpcReward("1")
        setImage(null)
        setAssignAllUsers(false)
        setSelectedUserIds([])
        setSearchQuery("")
        setTimeout(() => window.location.reload(), 2000)
      }
      
    } catch (err) {
      console.error("Add product error:", err)
      setMessage(`Failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const roleBadge = (role) => {
    const colors = {
      distributor: "bg-blue-100 text-blue-700",
      seller: "bg-green-100 text-green-700",
      user: "bg-purple-100 text-purple-700"
    }
    return colors[role] || "bg-gray-100 text-gray-600"
  }
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add Product</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes("successfully")
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-red-100 text-red-800 border border-red-300"
        }`}>
          {message.includes("successfully") ? "✅ " : "❌ "}{message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Product name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (Rs.) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-gray-400 text-xs">(optional, jaise "Electronics", "Clothing")</span>
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="category-suggestions"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Electronics"
          />
          <p className="text-xs text-gray-500 mt-1">Isse Store/Home page pe category-wise filter ho payega</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PPC Reward <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={ppcReward}
            onChange={(e) => setPpcReward(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="1"
          />
          <p className="text-xs text-gray-500 mt-1">How many PPC this product gives (1, 2, 5, etc.)</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Optional - Upload product image</p>
        </div>
        
        {/* ===================== ASSIGN SECTION ===================== */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">

          {/* Assign to ALL toggle */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
            <label className="flex items-center cursor-pointer gap-2">
              <input
                type="checkbox"
                checked={assignAllUsers}
                onChange={(e) => {
                  setAssignAllUsers(e.target.checked)
                  if (e.target.checked) setSelectedUserIds([])
                }}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-gray-800">Assign to ALL Users</span>
            </label>
            <span className="text-xs text-gray-500 bg-white border border-gray-300 px-2 py-1 rounded">
              {allUsers.length} total users
            </span>
          </div>

          {/* ⭐ USER LIST - assignAll unchecked par dikhao */}
          {!assignAllUsers && (
            <div className="p-4 space-y-3">
              
              <p className="text-sm text-gray-600 font-medium">
                Specific users select karo jinhein product assign karna hai:
              </p>

              {/* Search + Filter */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name ya email se search karo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">All Roles</option>
                  <option value="distributor">Distributor</option>
                  <option value="seller">Seller</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Select All bar */}
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded text-sm">
                  <span className="text-blue-700 font-medium">
                    {selectedUserIds.length} user{selectedUserIds.length !== 1 ? "s" : ""} selected
                  </span>
                  <button
                    type="button"
                    onClick={toggleSelectAllVisible}
                    className="text-blue-600 hover:text-blue-800 underline text-xs font-semibold"
                  >
                    {filteredUsers.every(u => selectedUserIds.includes(u._id))
                      ? "Deselect All"
                      : "Select All Visible"}
                  </button>
                </div>
              )}

              {/* User List */}
              {usersLoading ? (
                <div className="text-center py-6 text-gray-500 text-sm">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">No users found</div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
                  {filteredUsers.map(user => {
                    const isSelected = selectedUserIds.includes(user._id)
                    const isDisabled = user.isBlocked || user.isDeleted
                    return (
                      <label
                        key={user._id}
                        className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition ${
                          isSelected ? "bg-blue-50" : ""
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUser(user._id)}
                          disabled={isDisabled}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-800 truncate">
                              {user.name}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleBadge(user.role)}`}>
                              {user.role}
                            </span>
                            {user.isBlocked && (
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">blocked</span>
                            )}
                            {user.isDeleted && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">deleted</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}

              {/* Warning if none selected */}
              {selectedUserIds.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
                  Kam se kam ek user select karo, ya "Assign to ALL Users" enable karo
                </p>
              )}
            </div>
          )}

          {/* assignAll ON message */}
          {assignAllUsers && (
            <div className="px-4 py-3 bg-green-50 text-sm text-green-700 border-t border-gray-200">
              Product sabhi Distributors, Sellers aur Users ko automatically assign ho jayega
            </div>
          )}
        </div>
        
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md font-semibold text-white transition duration-200 ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {loading ? "Adding Product..." : "Add Product"}
        </button>
        
      </form>
    </div>
  )
}
