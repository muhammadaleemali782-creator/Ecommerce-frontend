import React from "react"
import { useTheme } from "../context/ThemeContext"

export const getProofUrl = (url) => {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url
  const base = import.meta.env.VITE_API_URL || ""
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`
}

export const isDriveUrl = (url) => {
  return /drive\.google\.com|docs\.google\.com/.test(url || "")
}

export const getDriveEmbedUrl = (url) => {
  if (!url) return ""
  // Replace /view with /preview for embedding
  return url.replace(/\/view(\?.*)?$/, "/preview")
}

export const getDriveDownloadUrl = (url) => {
  if (!url) return ""
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/)
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`
  }
  return url
}

export default function PaymentProofModal({ show, onClose, url, request }) {
  const { isDark } = useTheme()

  if (!show || !url) return null

  const fullUrl = getProofUrl(url)
  const isDrive = isDriveUrl(url)
  const driveEmbed = isDrive ? getDriveEmbedUrl(url) : null
  const driveDownload = isDrive ? getDriveDownloadUrl(url) : null

  const handleDownload = async () => {
    if (isDrive) {
      window.open(driveDownload, "_blank")
      return
    }
    try {
      const res = await fetch(fullUrl)
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = `payment-slip-${request?.utrNumber || Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(fullUrl, "_blank")
    }
  }

  const utr = request?.utrNumber || request?.transactionId
  const amountPPC = request?.amount
  const rupeeVal = request?.rupeeValueAtRequest > 0 
    ? request.rupeeValueAtRequest.toFixed(2)
    : (request?.amount && request?.ppcRateAtRequest ? (request.amount * request.ppcRateAtRequest * (request.percentageAtRequest / 100)).toFixed(2) : null)

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? "bg-[#121814] border-white/10 text-white" : "bg-white border-stone-200 text-stone-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${
          isDark ? "border-white/10 bg-black/20" : "border-stone-100 bg-stone-50"
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🧾</span>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                Payment Proof / Slip
              </h3>
              <p className={`text-[11px] font-mono ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                Official transaction disbursement record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${
              isDark ? "hover:bg-white/10 text-stone-400 hover:text-white" : "hover:bg-stone-200 text-stone-600 hover:text-black"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Transaction Meta Bar */}
        {(utr || rupeeVal || amountPPC) && (
          <div className={`px-4 sm:px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs border-b ${
            isDark ? "border-white/[0.06] bg-black/30" : "border-stone-100 bg-stone-50/50"
          }`}>
            <div className="flex items-center gap-3 flex-wrap">
              {rupeeVal && (
                <span className="font-black text-emerald-500 text-sm">
                  ₹{rupeeVal}
                </span>
              )}
              {amountPPC && (
                <span className={`font-mono text-[11px] ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                  ({amountPPC} PPC)
                </span>
              )}
              {utr && (
                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  UTR: {utr}
                </span>
              )}
            </div>
            {request?.approvedAt && (
              <span className={`text-[10px] font-mono ${isDark ? "text-stone-500" : "text-stone-400"}`}>
                {new Date(request.approvedAt).toLocaleDateString("en-IN")}
              </span>
            )}
          </div>
        )}

        {/* Body — Image or Google Drive View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center justify-center min-h-[260px] max-h-[60vh]">
          {isDrive ? (
            <div className="w-full space-y-4 text-center">
              <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 ${
                isDark ? "bg-black/40 border-white/10" : "bg-blue-50/50 border-blue-200"
              }`}>
                <span className="text-4xl">📁</span>
                <div>
                  <h4 className="font-bold text-sm">Google Drive Attached Receipt</h4>
                  <p className={`text-xs mt-1 max-w-md mx-auto truncate font-mono ${
                    isDark ? "text-stone-400" : "text-stone-600"
                  }`}>
                    {url}
                  </p>
                </div>

                {driveEmbed && (
                  <div className="w-full h-72 sm:h-96 rounded-xl overflow-hidden border border-white/10 bg-black/50 mt-2">
                    <iframe 
                      src={driveEmbed} 
                      className="w-full h-full border-0" 
                      title="Google Drive Preview"
                      allow="autoplay"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <img
                src={fullUrl}
                alt="Payment Slip Proof"
                className="max-h-[55vh] max-w-full object-contain rounded-2xl border border-white/10 shadow-lg"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "block"
                }}
              />
              <div className="hidden text-center p-6 space-y-2">
                <span className="text-3xl block">⚠️</span>
                <p className="text-xs text-stone-400">Image load nahi ho payi. Neeche diye button se link open karein:</p>
                <a 
                  href={fullUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-block text-xs font-bold text-sky-400 underline"
                >
                  {fullUrl}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 sm:p-5 flex items-center justify-between gap-3 border-t ${
          isDark ? "border-white/10 bg-black/20" : "border-stone-100 bg-stone-50"
        }`}>
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isDark 
                ? "bg-white/5 hover:bg-white/10 text-stone-300 border-white/10" 
                : "bg-white hover:bg-stone-100 text-stone-700 border-stone-300 shadow-sm"
            }`}
          >
            <span>↗️</span>
            <span>{isDrive ? "Open in Drive" : "Open Full Image"}</span>
          </a>

          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>⬇️</span>
            <span>Download Slip</span>
          </button>
        </div>
      </div>
    </div>
  )
}
