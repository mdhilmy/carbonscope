/**
 * Base API Client with Timeout and Fallback Support
 * Handles network errors, timeouts, and provides graceful fallbacks
 */

const DEFAULT_TIMEOUT = 5000 // 5 seconds
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second

/**
 * API Error types for consistent error handling
 */
export const API_ERRORS = {
  NETWORK_ERROR: 'Unable to connect. Using offline data.',
  API_KEY_INVALID: 'API key invalid. Check Settings.',
  API_KEY_MISSING: 'API key not configured. Using fallback data.',
  RATE_LIMITED: 'Too many requests. Try again later.',
  TIMEOUT: 'Request timed out. Using cached data.',
  SERVER_ERROR: 'Server error. Using fallback data.',
  NOT_FOUND: 'Data not found.',
  UNKNOWN: 'An unexpected error occurred.',
}

/**
 * Get error type from HTTP status code
 */
function getErrorType(status) {
  if (status === 401 || status === 403) return 'API_KEY_INVALID'
  if (status === 404) return 'NOT_FOUND'
  if (status === 429) return 'RATE_LIMITED'
  if (status >= 500) return 'SERVER_ERROR'
  return 'UNKNOWN'
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT')
    }
    throw error
  }
}

/**
 * Main fetch function with fallback support
 *
 * @param {string} url - API endpoint URL
 * @param {Object} fallbackData - Data to return if API fails
 * @param {Object} options - Fetch options plus custom options
 * @returns {Promise<Object>} Response with data and source indicator
 */
export async function fetchWithFallback(url, fallbackData, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    retryDelay = RETRY_DELAY,
    requiresAuth = false,
    apiKeyName = null,
    ...fetchOptions
  } = options

  // Check for required API key
  if (requiresAuth && apiKeyName) {
    const apiKey = getApiKey(apiKeyName)
    if (!apiKey) {
      console.warn(`API key not configured for ${apiKeyName}`)
      return {
        data: fallbackData,
        source: 'fallback',
        error: API_ERRORS.API_KEY_MISSING,
        errorType: 'API_KEY_MISSING',
      }
    }
  }

  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions, timeout)

      if (!response.ok) {
        const errorType = getErrorType(response.status)
        throw new Error(errorType)
      }

      const data = await response.json()

      return {
        data,
        source: 'api',
        cached: false,
        timestamp: Date.now(),
      }
    } catch (error) {
      lastError = error

      // Don't retry for auth errors or not found
      if (['API_KEY_INVALID', 'NOT_FOUND'].includes(error.message)) {
        break
      }

      // Wait before retry (except for last attempt)
      if (attempt < retries) {
        await sleep(retryDelay * (attempt + 1))
      }
    }
  }

  // All attempts failed, return fallback
  const errorType = lastError?.message || 'NETWORK_ERROR'
  const errorMessage = API_ERRORS[errorType] || API_ERRORS.UNKNOWN

  console.warn(`API fetch failed for ${url}:`, lastError?.message || 'Unknown error')

  return {
    data: fallbackData,
    source: 'fallback',
    error: errorMessage,
    errorType,
  }
}

/**
 * Get API key from localStorage
 */
export function getApiKey(keyName) {
  try {
    const keys = JSON.parse(localStorage.getItem('carbonscope_api_keys') || '{}')
    return keys[keyName] || null
  } catch {
    return null
  }
}

/**
 * Save API key to localStorage
 */
export function saveApiKey(keyName, value) {
  try {
    const keys = JSON.parse(localStorage.getItem('carbonscope_api_keys') || '{}')
    if (value) {
      keys[keyName] = value
    } else {
      delete keys[keyName]
    }
    localStorage.setItem('carbonscope_api_keys', JSON.stringify(keys))

    // Dispatch event for components to react to key changes
    window.dispatchEvent(new CustomEvent('apiKeyChanged', {
      detail: { keyName, hasKey: !!value }
    }))

    return true
  } catch {
    return false
  }
}

/**
 * Clear API key from localStorage
 */
export function clearApiKey(keyName) {
  return saveApiKey(keyName, null)
}

/**
 * Get all configured API keys (names only, not values)
 */
export function getConfiguredApiKeys() {
  try {
    const keys = JSON.parse(localStorage.getItem('carbonscope_api_keys') || '{}')
    return Object.keys(keys).filter(k => keys[k])
  } catch {
    return []
  }
}

/**
 * Check if a specific API key is configured
 */
export function hasApiKey(keyName) {
  return !!getApiKey(keyName)
}

/**
 * Cache management for API responses
 */
const CACHE_PREFIX = 'carbonscope_cache_'
const DEFAULT_CACHE_TTL = 3600000 // 1 hour

export function getCachedData(key) {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!cached) return null

    const { data, timestamp, ttl = DEFAULT_CACHE_TTL } = JSON.parse(cached)

    // Check if cache is still valid
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`)
      return null
    }

    return { data, timestamp, fromCache: true }
  } catch {
    return null
  }
}

export function setCachedData(key, data, ttl = DEFAULT_CACHE_TTL) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
      ttl,
    }))
    return true
  } catch {
    return false
  }
}

export function clearCache(key = null) {
  try {
    if (key) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`)
    } else {
      // Clear all cache entries
      Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_PREFIX))
        .forEach(k => localStorage.removeItem(k))
    }
    return true
  } catch {
    return false
  }
}

/**
 * Build URL with query parameters
 */
export function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value)
    }
  })
  return url.toString()
}

export default {
  fetchWithFallback,
  getApiKey,
  saveApiKey,
  clearApiKey,
  hasApiKey,
  getConfiguredApiKeys,
  getCachedData,
  setCachedData,
  clearCache,
  buildUrl,
  API_ERRORS,
}
