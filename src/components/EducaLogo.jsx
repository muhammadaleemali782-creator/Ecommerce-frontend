import React from "react"
import { useTheme } from "../context/ThemeContext"

/**
 * EducaLogo — Official Brand Logo component for EDUCA-VEDA.
 * Displays the authentic round emblem ("WE GIVE RESULTS NOT PROMISES")
 * with subtle glow, theme calibration, and responsive sizing.
 */
export default function EducaLogo({
  size = 36,
  className = "",
  withText = false,
  textClassName = "",
  showTagline = false,
  variant = "image", // "image" (official emblem) | "svg" (fallback vector)
  alt = "EDUCA-VEDA"
}) {
  const { isDark } = useTheme() || {}

  // Official emblem logo image
  const logoElement = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full transition-transform duration-200 hover:scale-105 select-none ${
        isDark ? "shadow-[0_0_20px_rgba(251,191,36,0.12)]" : "shadow-sm"
      }`}
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src="/educa_logo.png"
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-contain rounded-full bg-white p-[1px] ring-1 ring-black/10"
        loading="eager"
      />
    </div>
  )

  if (!withText) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {logoElement}
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {logoElement}
      <div className="flex flex-col min-w-0">
        <span
          className={`text-[12px] font-black uppercase tracking-[0.18em] whitespace-nowrap leading-tight transition-colors ${
            textClassName || (isDark ? "text-white group-hover:text-amber-400" : "text-stone-900 group-hover:text-amber-700")
          }`}
        >
          EDUCA-VEDA
        </span>
        {showTagline && (
          <span className={`text-[8px] font-bold tracking-widest uppercase truncate ${
            isDark ? "text-stone-400" : "text-stone-500"
          }`}>
            RESULTS NOT PROMISES
          </span>
        )}
      </div>
    </div>
  )
}
