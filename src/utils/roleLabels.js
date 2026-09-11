/**
 * roleLabels.js
 *
 * DB value   → Display label
 * distributor → Distributor
 * seller      → Seller
 * user        → User
 * admin       → Admin
 */

export const ROLE_LABELS = {
  admin:       "Admin",
  distributor: "Distributor",
  seller:      "Direct Seller",
  user:        "User",
}

/** Single role ka label → "Distributor", "Direct Seller", "User", "Admin" */
export const getRoleLabel = (role) =>
  ROLE_LABELS[role] || role || "Unknown"

/** Plural label → "Distributors", "Direct Sellers", "Users", "Admins" */
export const getRoleLabelPlural = (role) => {
  const map = {
    admin:       "Admins",
    distributor: "Distributors",
    seller:      "Direct Sellers",
    user:        "Users",
  }
  return map[role] || role || "Unknown"
}
