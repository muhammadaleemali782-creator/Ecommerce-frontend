import React from "react"
import { useTheme } from "../context/ThemeContext"

export default function EducaLogo({ size = 36, className = "", color, withText = false, textClassName = "" }) {
  const { isDark } = useTheme()
  const primaryColor = color || (isDark ? "#fbbf24" : "#d97706")
  const secondaryColor = isDark ? "#f59e0b" : "#b45309"

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="educaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="educaGradCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>

        {/* ── Laurel Wreath (Left Side) ── */}
        <g fill="url(#educaGoldGrad)">
          {/* Leaves curving upward left */}
          <path d="M12 60 C8 55, 6 48, 8 40 C10 44, 13 47, 16 48 C12 46, 10 40, 11 34 C14 38, 18 41, 21 42 C16 39, 15 32, 17 26 C20 30, 24 33, 27 34 C21 31, 21 24, 25 18 C28 22, 31 25, 34 26 C28 23, 30 15, 35 10 C37 14, 38 18, 39 21 C36 17, 39 10, 45 6 C45 10, 44 14, 43 17" />
          <path d="M14 62 C16 57, 19 53, 23 50 C20 54, 18 58, 17 63 Z" />
          <path d="M18 51 C22 47, 26 44, 31 42 C27 45, 24 49, 22 53 Z" />
          <path d="M25 41 C29 37, 34 35, 39 34 C35 37, 31 40, 29 44 Z" />
          <path d="M33 32 C38 29, 43 27, 48 26 C44 28, 40 31, 37 34 Z" />
        </g>

        {/* ── Laurel Wreath (Right Side) ── */}
        <g fill="url(#educaGoldGrad)">
          {/* Leaves curving upward right (mirror) */}
          <path d="M88 60 C92 55, 94 48, 92 40 C90 44, 87 47, 84 48 C88 46, 90 40, 89 34 C86 38, 82 41, 79 42 C84 39, 85 32, 83 26 C80 30, 76 33, 73 34 C79 31, 79 24, 75 18 C72 22, 69 25, 66 26 C72 23, 70 15, 65 10 C63 14, 62 18, 61 21 C64 17, 61 10, 55 6 C55 10, 56 14, 57 17" />
          <path d="M86 62 C84 57, 81 53, 77 50 C80 54, 82 58, 83 63 Z" />
          <path d="M82 51 C78 47, 74 44, 69 42 C73 45, 76 49, 78 53 Z" />
          <path d="M75 41 C71 37, 66 35, 61 34 C65 37, 69 40, 71 44 Z" />
          <path d="M67 32 C62 29, 57 27, 52 26 C56 28, 60 31, 63 34 Z" />
        </g>

        {/* ── Bottom Stack of Books ── */}
        <g fill="url(#educaGradCap)">
          {/* Book 1 (Top Book) */}
          <path d="M28 58 L72 58 L70 63 L26 63 Z" />
          <rect x="25" y="63" width="50" height="2" rx="1" fill="#fde68a" />
          {/* Book 2 (Bottom Book) */}
          <path d="M24 65 L76 65 L74 70 L22 70 Z" />
          <rect x="21" y="70" width="58" height="2.5" rx="1" fill="#fde68a" />
        </g>

        {/* ── Graduation Cap (Mortarboard & Skullcap) ── */}
        {/* Skullcap / Cap Base */}
        <path
          d="M38 32 C38 42, 62 42, 62 32 L60 48 C60 52, 40 52, 40 48 Z"
          fill="url(#educaGradCap)"
        />

        {/* Mortarboard Diamond Top */}
        <polygon
          points="50,12 82,24 50,36 18,24"
          fill="url(#educaGoldGrad)"
          stroke={secondaryColor}
          strokeWidth="1"
        />

        {/* Cap Button / Center Pin */}
        <circle cx="50" cy="24" r="3" fill="#fff" stroke={secondaryColor} strokeWidth="1" />

        {/* Tassel */}
        <path d="M50 24 Q68 25 72 32" stroke="url(#educaGoldGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="72" cy="33" r="2" fill={secondaryColor} />
        {/* Hanging Tassel Fringe */}
        <path d="M70 34 L74 34 L75 44 L69 44 Z" fill="url(#educaGoldGrad)" />
      </svg>

      {withText && (
        <span className={`text-[12px] font-black uppercase tracking-[0.18em] whitespace-nowrap leading-none ${
          textClassName || (isDark ? "text-white" : "text-stone-900")
        }`}>
          EDUCA VEDA
        </span>
      )}
    </div>
  )
}
