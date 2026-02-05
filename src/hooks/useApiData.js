/**
 * useApiData Hook
 * Manages API data fetching with automatic fallback and key change detection
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { hasApiKey } from '../services/api/apiClient'

/**
 * Custom hook for fetching API data with fallback support
 *
 * @param {Function} fetchFn - Function that fetches data from API
 * @param {Object} options - Hook options
 * @returns {Object} Data, loading state, and utilities
 */
export function useApiData(fetchFn, options = {}) {
  const {
    apiKeyName = null,
    autoFetch = true,
    dependencies = [],
    cacheKey = null,
    fallbackData = null,
    onSuccess = null,
    onError = null,
    refetchInterval = null,
  } = options

  const [data, setData] = useState(fallbackData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('none')
  const [lastFetched, setLastFetched] = useState(null)

  const fetchRef = useRef(fetchFn)
  const intervalRef = useRef(null)

  // Update fetch function ref
  useEffect(() => {
    fetchRef.current = fetchFn
  }, [fetchFn])

  /**
   * Fetch data from API
   */
  const fetch = useCallback(async (forceRefresh = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchRef.current()

      setData(result.data)
      setSource(result.source || 'api')
      setLastFetched(new Date().toISOString())

      if (result.error) {
        setError(result.error)
      }

      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch data'
      setError(errorMessage)
      setSource('error')

      if (fallbackData) {
        setData(fallbackData)
        setSource('fallback')
      }

      if (onError) {
        onError(err)
      }

      return { data: fallbackData, source: 'fallback', error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [fallbackData, onSuccess, onError])

  /**
   * Refetch data
   */
  const refetch = useCallback(() => {
    return fetch(true)
  }, [fetch])

  /**
   * Clear data
   */
  const clear = useCallback(() => {
    setData(fallbackData)
    setSource('none')
    setError(null)
    setLastFetched(null)
  }, [fallbackData])

  // Auto-fetch on mount and dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetch()
    }
  }, [autoFetch, ...dependencies])

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetch()
      }, refetchInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [refetchInterval, fetch])

  // Listen for API key changes
  useEffect(() => {
    if (!apiKeyName) return

    const handleKeyChange = (event) => {
      if (event.detail?.keyName === apiKeyName) {
        // Refetch when API key changes
        fetch()
      }
    }

    window.addEventListener('apiKeyChanged', handleKeyChange)
    return () => {
      window.removeEventListener('apiKeyChanged', handleKeyChange)
    }
  }, [apiKeyName, fetch])

  return {
    data,
    isLoading,
    error,
    source,
    lastFetched,
    isFromApi: source === 'api',
    isFromFallback: source === 'fallback',
    hasApiKey: apiKeyName ? hasApiKey(apiKeyName) : true,
    fetch,
    refetch,
    clear,
  }
}

/**
 * Hook for EPA API data
 */
export function useEpaData(fetchFn, options = {}) {
  return useApiData(fetchFn, {
    ...options,
    apiKeyName: null, // EPA doesn't require key
  })
}

/**
 * Hook for UK Carbon Intensity API data
 */
export function useUkCarbonData(fetchFn, options = {}) {
  return useApiData(fetchFn, {
    ...options,
    apiKeyName: null, // UK Carbon doesn't require key
    refetchInterval: options.refetchInterval || 1800000, // 30 minutes default
  })
}

/**
 * Hook for EIA API data
 */
export function useEiaData(fetchFn, options = {}) {
  return useApiData(fetchFn, {
    ...options,
    apiKeyName: 'eia',
  })
}

/**
 * Hook for Electricity Maps API data
 */
export function useElectricityMapsData(fetchFn, options = {}) {
  return useApiData(fetchFn, {
    ...options,
    apiKeyName: 'electricityMaps',
  })
}

/**
 * Hook for multiple API sources with priority
 */
export function useMultiSourceData(sources, options = {}) {
  const { fallbackData = null } = options

  const [data, setData] = useState(fallbackData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('none')
  const [triedSources, setTriedSources] = useState([])

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setTriedSources([])

    for (const sourceConfig of sources) {
      const { name, fetchFn, requiresKey, keyName } = sourceConfig

      // Skip if requires key and key not configured
      if (requiresKey && keyName && !hasApiKey(keyName)) {
        setTriedSources(prev => [...prev, { name, skipped: true, reason: 'No API key' }])
        continue
      }

      try {
        const result = await fetchFn()

        if (result.source === 'api') {
          setData(result.data)
          setSource(name)
          setTriedSources(prev => [...prev, { name, success: true }])
          setIsLoading(false)
          return result
        }

        setTriedSources(prev => [...prev, { name, fallback: true }])
      } catch (err) {
        setTriedSources(prev => [...prev, { name, error: err.message }])
      }
    }

    // All sources failed, use fallback
    setData(fallbackData)
    setSource('fallback')
    setError('All data sources failed')
    setIsLoading(false)

    return { data: fallbackData, source: 'fallback' }
  }, [sources, fallbackData])

  useEffect(() => {
    fetch()
  }, [])

  return {
    data,
    isLoading,
    error,
    source,
    triedSources,
    refetch: fetch,
  }
}

export default useApiData
