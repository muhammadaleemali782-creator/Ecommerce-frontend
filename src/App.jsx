import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"

// ── Pages ──
import Home              from "./pages/Home"
import Store             from "./pages/Store"
import Services          from "./pages/Services"
import Cart              from "./pages/Cart"
import Checkout          from "./pages/Checkout"
import Orders            from "./pages/Orders"
import Login             from "./pages/Login"
import Admin             from "./pages/Admin"
import AdminProductList  from "./pages/AdminProductList"
import AdminUsers        from "./pages/AdminUsers"
import PasswordHelp      from "./pages/PasswordHelp"
import AdminPasswordReset from "./pages/AdminPasswordReset"
import AdminAddProduct   from "./pages/AdminAddProduct"
import AdminRequests     from "./pages/AdminRequests"
import AdminEmailSettings from "./pages/AdminEmailSettings"
import RaiseRequest      from "./pages/RaiseRequest"
import AdminRequestsHistory from "./pages/AdminRequestsHistory"
import MyCreatedUsers    from "./pages/MyCreatedUsers"

// ── Dashboards ──
import DistributorDashboard from "./dashboards/DistributorDashboard"
import SellerDashboard      from "./dashboards/SellerDashboard"

// ── Distributor ──
import CreateSeller from "./pages/CreateSeller"

// ── Admin Extra ──
import AdminNetworkView from "./pages/AdminNetworkView"

// ── Coin / Commission / Network ──
import CoinWallet    from "./pages/CoinWallet"
import MyCommission  from "./pages/MyCommission"
import MyNetwork     from "./pages/MyNetwork"

// ── PPC System ──
import PPCWallet                from "./pages/PPCWallet"
import WithdrawalRequest        from "./pages/WithdrawalRequest"
import AdminPPCSettings         from "./pages/AdminPPCSettings"
import AdminWithdrawalManagement from "./pages/AdminWithdrawalManagement"

// ── Profile ──
import MyProfile from "./pages/MyProfile"

// ── Order Pages ──
import AdminOrders       from "./pages/AdminOrders"
import DistributorOrders from "./pages/DistributorOrders"
import SellerOrders      from "./pages/SellerOrders"

// ── ☢️ NEW: Data Purge ──
import AdminNukeData from "./pages/AdminNukeData"
import AdminInvoiceSettings from "./pages/AdminInvoiceSettings"
import AdminServices from "./pages/AdminServices"
import AdminBannerManagement from "./pages/AdminBannerManagement"

// ── Contexts ──
import { StoreProvider, useStore } from "./context/StoreContext"
import { AuthProvider, useAuth }   from "./context/AuthContext"
import { NotificationProvider, useNotifications } from "./context/NotificationContext"

/* ─── Unauthorized helper ─── */
const Unauth = () => (
  <div style={{ background:"#fff", padding:24, borderRadius:12, color:"#dc2626", fontWeight:700 }}>
    🚫 Unauthorized Access — Admin Only
  </div>
)

function AppContent() {
  const [page, setPage] = useState("home")
  const { cart = [] }          = useStore() || {}
  const { loggedIn, user, logout } = useAuth() || {}
  const { registerSetPage, pageBadge = {} } = useNotifications()
  const safeUser = user || {}
  const role     = safeUser?.role || "guest"

  /* ✅ Register setPage so notifications can redirect */
  useEffect(() => {
    registerSetPage(setPage)
  }, [registerSetPage])

  /* Auto block / session check */
  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/wallet/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.status === 401 || res.status === 403) {
          alert("Your account is blocked, deleted, or session expired.")
          if (typeof logout === "function") logout()
          setPage("login")
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      } catch (err) {
        console.error("Auth check error:", err)
      }
    }
    checkUser()
  }, [logout])

  const renderPage = () => {
    try {
      switch (page) {

        // ── PUBLIC ──
        case "home":     return <Home setPage={setPage} />
        case "services": return <Services setPage={setPage} />
        case "store":    return <Store setPage={setPage} />
        case "cart":     return <Cart setPage={setPage} />
        case "checkout": return <Checkout setPage={setPage} />
        case "orders":   return loggedIn ? <Orders /> : <Login setPage={setPage} />
        case "password-help": return <PasswordHelp />
        case "login":    return <Login setPage={setPage} />

        // ── COMMON LOGGED-IN ──
        case "my-profile":
          if (!loggedIn) return <Login setPage={setPage} />
          return <MyProfile />

        case "my-users":
          if (!loggedIn) return <Login setPage={setPage} />
          return <MyCreatedUsers />

        case "my-network":
          if (!loggedIn) return <Login setPage={setPage} />
          return <MyNetwork />

        case "coin-wallet":
          if (!loggedIn) return <Login setPage={setPage} />
          return <CoinWallet />

        case "my-commission":
          if (!loggedIn) return <Login setPage={setPage} />
          return <MyCommission />

        case "ppc-wallet":
          if (!loggedIn) return <Login setPage={setPage} />
          return <PPCWallet setPage={setPage} />

        case "withdrawal-request":
          if (!loggedIn) return <Login setPage={setPage} />
          if (!["distributor","seller"].includes(role))
            return <div style={{padding:24,color:"#dc2626",fontWeight:700}}>🚫 Only Distributor and Seller can withdraw</div>
          return <WithdrawalRequest />

        case "raise-request":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role === "admin") return <div style={{padding:24,color:"#dc2626",fontWeight:700}}>🚫 Admin cannot raise requests</div>
          return <RaiseRequest />

        case "create-seller":
          if (!loggedIn) return <Login setPage={setPage} />
          if (!["distributor","seller"].includes(role))
            return <div style={{padding:24,color:"#dc2626",fontWeight:700}}>🚫 Unauthorized</div>
          return <CreateSeller />

        // ── ORDER PAGES ──
        case "seller-orders":
          if (!loggedIn) return <Login setPage={setPage} />
          if (!["seller","user"].includes(role)) return <Home />
          return <SellerOrders />

        case "distributor-orders":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "distributor") return <Home />
          return <DistributorOrders />

        // ── DASHBOARD ──
        case "dashboard":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role === "seller" || role === "user") return <SellerDashboard />
          if (role === "distributor") return <DistributorDashboard />
          if (role === "admin") return <Admin setPage={setPage} />
          return <Home />

        // ── ADMIN PAGES ──
        case "admin":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <Admin setPage={setPage} />

        case "admin-add-product":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminAddProduct />

        case "admin-network":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminNetworkView />

        case "admin-products":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminProductList />

        case "admin-users":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminUsers />

        case "admin-password-reset":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Home />
          return <AdminPasswordReset />

        case "admin-requests":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminRequests />

        case "admin-requests-history":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminRequestsHistory />

        case "email-settings":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminEmailSettings />

        case "admin-ppc-settings":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminPPCSettings />

        case "admin-withdrawal-management":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminWithdrawalManagement />

        case "admin-orders":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Home />
          return <AdminOrders />

        // ── ☢️ DATA PURGE (ADMIN ONLY) ──
        case "admin-nuke":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminNukeData />

        case "admin-invoice-settings":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminInvoiceSettings />

        case "admin-services":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminServices setPage={setPage} />

        case "admin-banners":
          if (!loggedIn) return <Login setPage={setPage} />
          if (role !== "admin") return <Unauth />
          return <AdminBannerManagement setPage={setPage} />

        default:
          console.log("⚠️ Unknown page:", page)
          return <Home />
      }
    } catch (err) {
      console.error("❌ Page render crash:", err)
      return (
        <div style={{ background:"#fff", padding:24, borderRadius:12, color:"#dc2626" }}>
          Page crashed. Check console.
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar setPage={setPage} cartCount={cart?.reduce((sum, item) => sum + (item.qty || 1), 0) || 0} pageBadge={pageBadge} />
      <main className="p-3 sm:p-6 pb-24 sm:pb-6">
        {renderPage()}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </StoreProvider>
    </AuthProvider>
  )
}
