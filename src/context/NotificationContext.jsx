import { createContext, useContext, useReducer, useCallback } from 'react'

const NotificationContext = createContext(null)

const initialState = {
  notifications: [],
}

function notificationReducer(state, action) {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now() + Math.random(),
            createdAt: new Date().toISOString(),
            ...action.payload,
          },
        ],
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      }
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
      }
    default:
      return state
  }
}

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id,
        type: 'info',
        duration: 5000,
        ...notification,
      },
    })

    // Auto-remove notification after duration (unless duration is 0)
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
      }, duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }, [])

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  // Convenience methods for different notification types
  const notify = useCallback(
    {
      success: (message, options = {}) =>
        addNotification({ type: 'success', message, ...options }),
      error: (message, options = {}) =>
        addNotification({ type: 'error', message, duration: 8000, ...options }),
      warning: (message, options = {}) =>
        addNotification({ type: 'warning', message, duration: 6000, ...options }),
      info: (message, options = {}) =>
        addNotification({ type: 'info', message, ...options }),
    },
    [addNotification]
  )

  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    notify,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export default NotificationContext
