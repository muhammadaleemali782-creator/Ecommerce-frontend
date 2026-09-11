/**
 * formDraftManager.js
 * Universal utility & hook for auto-saving form state to localStorage.
 * Ensures user inputs are never lost when tabs close, phone calls interrupt,
 * or the browser is backgrounded/reloaded.
 */

import { useState, useEffect, useRef, useCallback } from "react"

const PREFIX = "educa_draft_"

/**
 * Save draft data to localStorage
 */
export function saveFormDraft(key, data) {
  if (!key) return
  try {
    const serialized = JSON.stringify({
      data,
      timestamp: Date.now()
    })
    localStorage.setItem(PREFIX + key, serialized)
  } catch (err) {
    console.warn("Could not save form draft for", key, err)
  }
}

/**
 * Retrieve saved draft from localStorage
 */
export function getFormDraft(key, fallback = null) {
  if (!key) return fallback
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed?.data !== undefined ? parsed.data : fallback
  } catch (err) {
    console.warn("Could not read form draft for", key, err)
    return fallback
  }
}

/**
 * Clear saved draft
 */
export function clearFormDraft(key) {
  if (!key) return
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (err) {
    console.warn("Could not clear form draft for", key, err)
  }
}

/**
 * Check if a draft exists
 */
export function hasFormDraft(key) {
  if (!key) return false
  try {
    return localStorage.getItem(PREFIX + key) !== null
  } catch {
    return false
  }
}

/**
 * useFormDraft
 * Custom hook that automatically:
 * 1. Loads saved draft on mount
 * 2. Auto-saves changes to localStorage (debounced)
 * 3. Immediately flushes to localStorage on mobile 'pagehide' / 'visibilitychange'
 * 4. Cleans up when form is submitted successfully via clearDraft()
 */
export function useFormDraft(key, initialValues) {
  const [values, setValues] = useState(() => {
    const saved = getFormDraft(key)
    if (saved !== null && typeof saved === "object" && typeof initialValues === "object") {
      return { ...initialValues, ...saved }
    }
    return saved !== null ? saved : initialValues
  })

  const [isRestored, setIsRestored] = useState(() => hasFormDraft(key))
  const valuesRef = useRef(values)
  valuesRef.current = values

  // Immediate flush on mobile app background / phone call / page hide
  useEffect(() => {
    const flush = () => {
      if (valuesRef.current !== undefined) {
        saveFormDraft(key, valuesRef.current)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flush()
      }
    }

    window.addEventListener("pagehide", flush)
    window.addEventListener("beforeunload", flush)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("pagehide", flush)
      window.removeEventListener("beforeunload", flush)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [key])

  // Debounced auto-save as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      saveFormDraft(key, values)
    }, 300)

    return () => clearTimeout(timer)
  }, [key, values])

  const updateField = useCallback((field, value) => {
    setValues(prev => {
      if (typeof prev === "object" && prev !== null) {
        return { ...prev, [field]: value }
      }
      return value
    })
  }, [])

  const clearDraft = useCallback(() => {
    clearFormDraft(key)
    setIsRestored(false)
    setValues(initialValues)
  }, [key, initialValues])

  return [values, setValues, updateField, clearDraft, isRestored]
}
