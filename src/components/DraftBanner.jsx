import React from "react"
import { useTheme } from "../context/ThemeContext"

export default function DraftBanner({ onClear, message = "Restored unsaved draft from your previous session." }) {
  const { isDark } = useTheme()

  return (
    <div
      className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs mb-4 transition-all animate-fadeIn ${
        isDark
          ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
          : "bg-amber-50 border-amber-200 text-amber-900"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base shrink-0">📝</span>
        <span className="font-medium truncate">{message}</span>
      </div>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
            isDark
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-stone-300 hover:text-white"
              : "bg-white border-stone-300 hover:bg-stone-50 text-stone-700"
          }`}
        >
          Clear Draft
        </button>
      )}
    </div>
  )
}
