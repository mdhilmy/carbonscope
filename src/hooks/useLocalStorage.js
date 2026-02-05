/**
 * useLocalStorage Hook
 * Persists state to localStorage with automatic serialization
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for persisting state to localStorage
 *
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value if not in storage
 * @param {Object} options - Hook options
 * @returns {Array} [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const {
    prefix = 'carbonscope_',
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = null,
  } = options

  const storageKey = `${prefix}${key}`

  // Get initial value from storage or use default
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(storageKey)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${storageKey}":`, error)
      if (onError) onError(error)
      return initialValue
    }
  })

  /**
   * Set value in state and localStorage
   */
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function for updates based on previous value
      const valueToStore = value instanceof Function ? value(storedValue) : value

      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, serialize(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${storageKey}":`, error)
      if (onError) onError(error)
    }
  }, [storageKey, storedValue, serialize, onError])

  /**
   * Remove value from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(storageKey)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${storageKey}":`, error)
      if (onError) onError(error)
    }
  }, [storageKey, initialValue, onError])

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === storageKey && event.newValue) {
        try {
          setStoredValue(deserialize(event.newValue))
        } catch {
          // Ignore parse errors
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [storageKey, deserialize])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook for managing settings in localStorage
 */
export function useSettings(defaults = {}) {
  const [settings, setSettings, clearSettings] = useLocalStorage('settings', defaults)

  /**
   * Update a single setting
   */
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }, [setSettings])

  /**
   * Update multiple settings
   */
  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({
      ...prev,
      ...updates,
    }))
  }, [setSettings])

  /**
   * Reset to defaults
   */
  const resetSettings = useCallback(() => {
    setSettings(defaults)
  }, [setSettings, defaults])

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    clearSettings,
  }
}

/**
 * Hook for managing facilities in localStorage
 */
export function useFacilities() {
  const [facilities, setFacilities, clearFacilities] = useLocalStorage('facilities', [])
  const [activeFacilityId, setActiveFacilityId] = useLocalStorage('active_facility', null)

  /**
   * Add a new facility
   */
  const addFacility = useCallback((facility) => {
    const newFacility = {
      id: `facility_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...facility,
    }

    setFacilities(prev => [...prev, newFacility])

    // Set as active if it's the first facility
    if (facilities.length === 0) {
      setActiveFacilityId(newFacility.id)
    }

    return newFacility
  }, [facilities.length, setFacilities, setActiveFacilityId])

  /**
   * Update a facility
   */
  const updateFacility = useCallback((id, updates) => {
    setFacilities(prev => prev.map(f =>
      f.id === id
        ? { ...f, ...updates, updatedAt: new Date().toISOString() }
        : f
    ))
  }, [setFacilities])

  /**
   * Delete a facility
   */
  const deleteFacility = useCallback((id) => {
    setFacilities(prev => prev.filter(f => f.id !== id))

    // Clear active if deleted
    if (activeFacilityId === id) {
      setActiveFacilityId(null)
    }
  }, [activeFacilityId, setFacilities, setActiveFacilityId])

  /**
   * Get active facility
   */
  const activeFacility = facilities.find(f => f.id === activeFacilityId) || null

  /**
   * Set active facility
   */
  const setActiveFacility = useCallback((id) => {
    setActiveFacilityId(id)
  }, [setActiveFacilityId])

  return {
    facilities,
    activeFacility,
    activeFacilityId,
    addFacility,
    updateFacility,
    deleteFacility,
    setActiveFacility,
    clearFacilities,
  }
}

/**
 * Hook for managing calculation history
 */
export function useCalculationHistory() {
  const [history, setHistory, clearHistory] = useLocalStorage('calculation_history', [])

  /**
   * Add calculation to history
   */
  const addToHistory = useCallback((calculation) => {
    const entry = {
      id: `calc_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...calculation,
    }

    setHistory(prev => [entry, ...prev.slice(0, 49)]) // Keep last 50

    return entry
  }, [setHistory])

  /**
   * Remove from history
   */
  const removeFromHistory = useCallback((id) => {
    setHistory(prev => prev.filter(c => c.id !== id))
  }, [setHistory])

  /**
   * Get history for a specific facility
   */
  const getHistoryForFacility = useCallback((facilityId) => {
    return history.filter(c => c.facilityId === facilityId)
  }, [history])

  return {
    history,
    addToHistory,
    removeFromHistory,
    getHistoryForFacility,
    clearHistory,
  }
}

export default useLocalStorage
