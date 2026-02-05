/**
 * useOffline Hook
 * Detects online/offline status and manages offline capabilities
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for offline detection and management
 *
 * @returns {Object} Online status and utilities
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [wasOffline, setWasOffline] = useState(false)
  const [offlineAt, setOfflineAt] = useState(null)
  const [onlineAt, setOnlineAt] = useState(null)

  /**
   * Handle online event
   */
  const handleOnline = useCallback(() => {
    setIsOnline(true)
    setOnlineAt(new Date().toISOString())

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('connectionRestored', {
      detail: { timestamp: new Date().toISOString() }
    }))
  }, [])

  /**
   * Handle offline event
   */
  const handleOffline = useCallback(() => {
    setIsOnline(false)
    setWasOffline(true)
    setOfflineAt(new Date().toISOString())

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('connectionLost', {
      detail: { timestamp: new Date().toISOString() }
    }))
  }, [])

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  /**
   * Check actual connectivity (more reliable than navigator.onLine)
   */
  const checkConnectivity = useCallback(async () => {
    try {
      // Try to fetch a small resource
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-store',
      })
      const online = response.ok
      setIsOnline(online)
      return online
    } catch {
      setIsOnline(false)
      return false
    }
  }, [])

  /**
   * Get offline duration in milliseconds
   */
  const getOfflineDuration = useCallback(() => {
    if (!offlineAt || isOnline) return 0
    return Date.now() - new Date(offlineAt).getTime()
  }, [offlineAt, isOnline])

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    offlineAt,
    onlineAt,
    checkConnectivity,
    getOfflineDuration,
  }
}

/**
 * Hook for managing offline data queue
 */
export function useOfflineQueue() {
  const [queue, setQueue] = useState([])
  const { isOnline } = useOffline()

  /**
   * Add item to offline queue
   */
  const addToQueue = useCallback((item) => {
    const queueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...item,
    }

    setQueue(prev => [...prev, queueItem])

    // Persist to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('carbonscope_offline_queue') || '[]')
      stored.push(queueItem)
      localStorage.setItem('carbonscope_offline_queue', JSON.stringify(stored))
    } catch {
      console.warn('Failed to persist offline queue')
    }

    return queueItem.id
  }, [])

  /**
   * Remove item from queue
   */
  const removeFromQueue = useCallback((id) => {
    setQueue(prev => prev.filter(item => item.id !== id))

    try {
      const stored = JSON.parse(localStorage.getItem('carbonscope_offline_queue') || '[]')
      const updated = stored.filter(item => item.id !== id)
      localStorage.setItem('carbonscope_offline_queue', JSON.stringify(updated))
    } catch {
      console.warn('Failed to update offline queue')
    }
  }, [])

  /**
   * Process queue when online
   */
  const processQueue = useCallback(async (processor) => {
    if (!isOnline || queue.length === 0) return

    const results = []

    for (const item of queue) {
      try {
        const result = await processor(item)
        results.push({ id: item.id, success: true, result })
        removeFromQueue(item.id)
      } catch (error) {
        results.push({ id: item.id, success: false, error: error.message })
      }
    }

    return results
  }, [isOnline, queue, removeFromQueue])

  /**
   * Clear entire queue
   */
  const clearQueue = useCallback(() => {
    setQueue([])
    localStorage.removeItem('carbonscope_offline_queue')
  }, [])

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('carbonscope_offline_queue') || '[]')
      setQueue(stored)
    } catch {
      console.warn('Failed to load offline queue')
    }
  }, [])

  return {
    queue,
    queueLength: queue.length,
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
  }
}

/**
 * Hook for offline-first data management
 */
export function useOfflineFirst(key, fetchFn, options = {}) {
  const { ttl = 3600000, fallbackData = null } = options

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [source, setSource] = useState('none')
  const { isOnline } = useOffline()

  /**
   * Get data from cache
   */
  const getFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(`carbonscope_data_${key}`)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)

      // Check if cache is still valid
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(`carbonscope_data_${key}`)
        return null
      }

      return data
    } catch {
      return null
    }
  }, [key, ttl])

  /**
   * Save data to cache
   */
  const saveToCache = useCallback((data) => {
    try {
      localStorage.setItem(`carbonscope_data_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }))
    } catch {
      console.warn('Failed to cache data')
    }
  }, [key])

  /**
   * Fetch and cache data
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true)

    // Try cache first
    const cached = getFromCache()
    if (cached) {
      setData(cached)
      setSource('cache')
    }

    // If online, fetch fresh data
    if (isOnline) {
      try {
        const result = await fetchFn()
        if (result.data) {
          setData(result.data)
          setSource('api')
          saveToCache(result.data)
        }
      } catch {
        // Keep cached data or use fallback
        if (!cached && fallbackData) {
          setData(fallbackData)
          setSource('fallback')
        }
      }
    } else if (!cached) {
      // Offline and no cache
      if (fallbackData) {
        setData(fallbackData)
        setSource('fallback')
      }
    }

    setIsLoading(false)
  }, [isOnline, fetchFn, getFromCache, saveToCache, fallbackData])

  // Fetch on mount and when online status changes
  useEffect(() => {
    fetchData()
  }, [isOnline])

  return {
    data,
    isLoading,
    source,
    isFromCache: source === 'cache',
    isFromApi: source === 'api',
    isFromFallback: source === 'fallback',
    refetch: fetchData,
  }
}

export default useOffline
