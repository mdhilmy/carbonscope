import { createContext, useContext, useReducer, useEffect } from 'react'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants'

const AppContext = createContext(null)

const initialState = {
  settings: { ...DEFAULT_SETTINGS },
  activeFacility: null,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  isLoading: false,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }
    case 'SET_ACTIVE_FACILITY':
      return {
        ...state,
        activeFacility: action.payload,
      }
    case 'SET_OFFLINE':
      return {
        ...state,
        isOffline: action.payload,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    case 'RESET_SETTINGS':
      return {
        ...state,
        settings: { ...DEFAULT_SETTINGS },
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        dispatch({ type: 'SET_SETTINGS', payload: parsed })
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings))
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error)
    }
  }, [state.settings])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_OFFLINE', payload: false })
    const handleOffline = () => dispatch({ type: 'SET_OFFLINE', payload: true })

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const value = {
    ...state,
    dispatch,
    // Convenience methods
    updateSettings: (settings) => dispatch({ type: 'SET_SETTINGS', payload: settings }),
    setActiveFacility: (facility) => dispatch({ type: 'SET_ACTIVE_FACILITY', payload: facility }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    resetSettings: () => dispatch({ type: 'RESET_SETTINGS' }),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext
