import { useEffect } from "react"
import { useStore } from "../context/StoreContext"

export default function Cart({ setPage }) {
  const {
    cart = [],
    incQty,
    decQty,
    removeFromCart,
    setSuppressCartPopup
  } = useStore()

  // ⭐ User yahan Cart/Order page pe wapas aa gaya — ab agli baar
  // "Add to Cart" karne pe popup dobara dikhna chahiye
  useEffect(() => {
    setSuppressCartPopup(false)
  }, [])

  /* ✅ FIX: Consistent ID resolver */
  const getItemId = (item) => item.id || item._id

  /* Total */
  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  )

  /* Empty Cart */
  if (cart.length === 0) {
    return (
      <div style={{ background:"#fff", borderRadius:16, padding:40, textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
        <p style={{ color:"#94a3b8", fontSize:15, fontWeight:600 }}>Cart is empty</p>
        <p style={{ color:"#cbd5e1", fontSize:13, marginTop:4 }}>Store se koi product add karo</p>
      </div>
    )
  }

  return (
    <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", maxWidth:640, margin:"0 auto" }}>
      <h2 style={{ fontSize:18, fontWeight:800, color:"#1e293b", marginBottom:16 }}>
        🛒 Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})
      </h2>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {cart.map(item => {
          /* ✅ FIX: Title ke liye multiple fallbacks */
          const displayName = item.title || item.productName || item.name || "Product"
          const itemId   = getItemId(item)
          const qty      = item.qty || 1
          const price    = item.price || 0
          const subtotal = price * qty

          return (
            <div
              key={itemId}
              style={{
                display:"flex", alignItems:"center", gap:12,
                borderBottom:"1px solid #f1f5f9", paddingBottom:12
              }}
            >
              {/* Image placeholder */}
              <div style={{ width:48, height:48, borderRadius:10, background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, border:"1px solid #e2e8f0" }}>
                {item.image
                  ? <img src={item.image.startsWith("http") ? item.image : `${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                      alt={displayName} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:10 }}
                      onError={e => { e.target.style.display="none" }} />
                  : "📦"
                }
              </div>

              {/* Name & price */}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:700, fontSize:14, color:"#1e293b", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {displayName}
                </p>
                <p style={{ fontSize:12, color:"#94a3b8", margin:"2px 0 0" }}>
                  ₹{price.toLocaleString()} per unit
                </p>
              </div>

              {/* ✅ FIX: Qty control — clearly visible */}
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"#f8fafc", borderRadius:8, padding:"4px 8px", border:"1px solid #e2e8f0" }}>
                <button
                  onClick={() => decQty(itemId)}
                  style={{ width:26, height:26, borderRadius:6, border:"none", background:"#e2e8f0", color:"#374151", cursor:"pointer", fontWeight:800, fontSize:16 }}
                >
                  −
                </button>
                <span style={{ minWidth:28, textAlign:"center", fontWeight:800, fontSize:15, color:"#1e293b" }}>
                  {qty}
                </span>
                <button
                  onClick={() => incQty(itemId)}
                  style={{ width:26, height:26, borderRadius:6, border:"none", background:"#3b82f6", color:"#fff", cursor:"pointer", fontWeight:800, fontSize:16 }}
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <span style={{ fontWeight:800, fontSize:14, color:"#16a34a", minWidth:72, textAlign:"right" }}>
                ₹{subtotal.toLocaleString()}
              </span>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(itemId)}
                style={{ width:28, height:28, borderRadius:"50%", border:"none", background:"#fee2e2", color:"#dc2626", cursor:"pointer", fontSize:13, fontWeight:800, flexShrink:0 }}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20, paddingTop:16, borderTop:"2px solid #f1f5f9" }}>
        <div>
          <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>Total Amount</p>
          <b style={{ fontSize:20, color:"#1e293b" }}>₹{total.toLocaleString()}</b>
        </div>
        <button
          onClick={() => setPage && setPage("checkout")}
          style={{ background:"#16a34a", color:"#fff", border:"none", borderRadius:10, padding:"12px 28px", fontWeight:700, fontSize:15, cursor:"pointer" }}
        >
          Checkout →
        </button>
      </div>
    </div>
  )
}
