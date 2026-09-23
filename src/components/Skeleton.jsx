import React from "react"
import { useTheme } from "../context/ThemeContext"

/**
 * Universal Lightweight Skeleton Kit
 * Supports Light & Night mode (dark black theme)
 */

export function Skeleton({ className = "", ...props }) {
  const { isDark } = useTheme() || {}
  return (
    <div
      className={`animate-pulse rounded-xl transition-colors duration-200 ${
        isDark ? "bg-[#18221b] border border-white/[0.05]" : "bg-stone-200/80"
      } ${className}`}
      {...props}
    />
  )
}

/* ── 1. E-Commerce Product Card Skeleton (Store & Home) ── */
export function ProductCardSkeleton({ count = 8 }) {
  const { isDark } = useTheme() || {}
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl sm:rounded-3xl border p-3 sm:p-4 space-y-3 shadow-xs transition-colors ${
            isDark ? "bg-[#0d1310] border-white/[0.08]" : "bg-white border-stone-200"
          }`}
        >
          {/* Product Image Placeholder */}
          <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden">
            <Skeleton className="w-full h-full" />
            <div className={`absolute top-2 left-2 w-14 h-5 rounded-md animate-pulse ${
              isDark ? "bg-[#233127]" : "bg-stone-300"
            }`} />
          </div>

          {/* Rating / Category Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Skeleton className="w-16 h-3 rounded" />
            <Skeleton className="w-10 h-3 rounded" />
          </div>

          {/* Title & Description Lines */}
          <div className="space-y-1.5">
            <Skeleton className="w-4/5 h-4 rounded" />
            <Skeleton className="w-2/3 h-3 rounded" />
          </div>

          {/* Price & Action Button */}
          <div className={`pt-2 flex items-center justify-between gap-2 border-t ${
            isDark ? "border-white/[0.06]" : "border-stone-100"
          }`}>
            <div className="space-y-1">
              <Skeleton className="w-16 h-5 rounded" />
              <Skeleton className="w-10 h-2.5 rounded" />
            </div>
            <Skeleton className="w-20 sm:w-24 h-8 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── 2. Stat / Metric Cards Skeleton (Dashboards & Wallets) ── */
export function StatCardSkeleton({ count = 4, cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" }) {
  const { isDark } = useTheme() || {}
  return (
    <div className={`grid ${cols} gap-3 sm:gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl border p-4 sm:p-5 space-y-3 shadow-xs transition-colors ${
            isDark ? "bg-[#0d1310] border-white/[0.08]" : "bg-white border-stone-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-3 rounded" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
          <Skeleton className="w-32 h-7 rounded-lg" />
          <Skeleton className="w-20 h-2.5 rounded" />
        </div>
      ))}
    </div>
  )
}

/* ── 3. Table / List Row Skeleton (Admin Users, Orders, Withdrawals) ── */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  const { isDark } = useTheme() || {}
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
      isDark ? "bg-[#0d1310] border-white/[0.08]" : "bg-white border-stone-200"
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center gap-4 ${
        isDark ? "bg-black/40 border-white/[0.06]" : "bg-stone-50 border-stone-100"
      }`}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className={`h-4 rounded ${i === 0 ? "w-28" : "flex-1"}`} />
        ))}
      </div>
      {/* Rows */}
      <div className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-stone-100"}`}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-4 rounded ${c === 0 ? "w-32" : c === cols - 1 ? "w-20" : "flex-1"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 4. Generic Card Skeleton (Feed / Orders / Withdrawals) ── */
export function CardSkeleton({ count = 3, className = "" }) {
  const { isDark } = useTheme() || {}
  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-6 space-y-4 shadow-xs transition-colors ${
            isDark ? "bg-[#0d1310] border-white/[0.08]" : "bg-white border-stone-200"
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-20 h-3 rounded" />
              </div>
            </div>
            <Skeleton className="w-24 h-6 rounded-full" />
          </div>

          {/* Body Lines */}
          <div className={`space-y-2 pt-2 border-t ${
            isDark ? "border-white/[0.06]" : "border-stone-100"
          }`}>
            <Skeleton className="w-full h-3 rounded" />
            <Skeleton className="w-3/4 h-3 rounded" />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <Skeleton className="w-24 h-4 rounded" />
            <div className="flex gap-2">
              <Skeleton className="w-20 h-8 rounded-xl" />
              <Skeleton className="w-20 h-8 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── 5. Full-Page Skeleton Fallback (Used during Suspense lazy chunk loading) ── */
export function PageSkeleton() {
  const { isDark } = useTheme() || {}
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 px-2 sm:px-4">
      {/* Hero / Header Card */}
      <div className={`rounded-3xl border p-5 sm:p-6 space-y-3 shadow-xs transition-colors ${
        isDark ? "bg-[#0d1310] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="w-36 h-4 rounded-full" />
            <Skeleton className="w-64 h-7 rounded-lg" />
            <Skeleton className="w-96 max-w-full h-3 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-24 h-9 rounded-xl" />
            <Skeleton className="w-24 h-9 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <StatCardSkeleton count={4} />

      {/* Main Section */}
      <div className={`rounded-3xl border p-5 sm:p-6 space-y-4 shadow-xs transition-colors ${
        isDark ? "bg-[#0d1310] border-white/[0.08]" : "bg-white border-stone-200"
      }`}>
        <div className="flex items-center justify-between">
          <Skeleton className="w-40 h-5 rounded" />
          <Skeleton className="w-28 h-8 rounded-xl" />
        </div>
        <TableSkeleton rows={4} cols={4} />
      </div>
    </div>
  )
}

/* ── 6. Network Tree Skeleton ── */
export function NetworkTreeSkeleton() {
  const { isDark } = useTheme() || {}
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Root Node */}
      <div className={`rounded-2xl border p-4 w-44 space-y-2 shadow-sm text-center flex flex-col items-center ${
        isDark ? "bg-[#0d1310] border-white/[0.1]" : "bg-white border-stone-200"
      }`}>
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-28 h-4 rounded" />
        <Skeleton className="w-16 h-3 rounded-full" />
      </div>

      {/* Connector */}
      <div className={`w-0.5 h-8 ${isDark ? "bg-white/20" : "bg-stone-300"}`} />

      {/* Child Nodes Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-3 space-y-2 shadow-xs flex flex-col items-center ${
              isDark ? "bg-[#0d1310] border-white/[0.08]" : "bg-white border-stone-200"
            }`}
          >
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-20 h-3 rounded" />
            <Skeleton className="w-12 h-2.5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Skeleton
