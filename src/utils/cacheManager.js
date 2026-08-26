// src/utils/cacheManager.js
// Ultra-lightweight SWR caching for 2GB RAM performance & Offline browsing

const CACHE_PREFIX = "educa_swr_"
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export const swrFetch = async (url, options = {}, ttl = DEFAULT_TTL) => {
  const cacheKey = `${CACHE_PREFIX}${url}`
  const now = Date.now()

  // 1. Check local cache first
  let cached = null
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) cached = JSON.parse(raw)
  } catch (e) {
    // ignore
  }

  // If cache is fresh, return immediately
  if (cached && (now - cached.timestamp < ttl)) {
    return { data: cached.data, isStale: false }
  }

  // 2. Fetch fresh in background / foreground
  try {
    const res = await fetch(url, options)
    if (res.ok) {
      const freshData = await res.json()
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: freshData }))
      } catch (storageErr) {
        // Storage quota exceeded — clean older caches
        clearStaleCaches()
      }
      return { data: freshData, isStale: false }
    }
  } catch (netErr) {
    // Offline or Network error: fallback to cached data even if expired
    if (cached) {
      return { data: cached.data, isStale: true, offline: true }
    }
    throw netErr
  }

  return { data: cached ? cached.data : null, isStale: true }
}

export const clearStaleCaches = () => {
  try {
    const keys = Object.keys(localStorage)
    for (const k of keys) {
      if (k.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(k)
      }
    }
  } catch (e) {}
}
