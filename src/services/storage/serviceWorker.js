/**
 * Service Worker Registration and Management
 * Handles service worker lifecycle and updates
 */

const SW_URL = '/carbonscope/service-worker.js'

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported() {
  return 'serviceWorker' in navigator
}

/**
 * Register service worker
 *
 * @param {Object} options - Registration options
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker(options = {}) {
  const {
    onSuccess = null,
    onUpdate = null,
    onError = null,
    onOffline = null,
  } = options

  if (!isServiceWorkerSupported()) {
    console.log('Service workers are not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_URL, {
      scope: '/carbonscope/',
    })

    // Check for updates periodically
    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000) // Check every hour

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('New content available, please refresh')
              if (onUpdate) {
                onUpdate(registration)
              }
            } else {
              // Content cached for offline use
              console.log('Content cached for offline use')
              if (onSuccess) {
                onSuccess(registration)
              }
            }
          }
        })
      }
    })

    // Handle offline/online events
    window.addEventListener('online', () => {
      console.log('Back online')
    })

    window.addEventListener('offline', () => {
      console.log('Offline mode')
      if (onOffline) {
        onOffline()
      }
    })

    console.log('Service worker registered successfully')
    return registration
  } catch (error) {
    console.error('Service worker registration failed:', error)
    if (onError) {
      onError(error)
    }
    return null
  }
}

/**
 * Unregister service worker
 *
 * @returns {Promise<boolean>}
 */
export async function unregisterServiceWorker() {
  if (!isServiceWorkerSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const success = await registration.unregister()
    console.log('Service worker unregistered:', success)
    return success
  } catch (error) {
    console.error('Service worker unregistration failed:', error)
    return false
  }
}

/**
 * Check for service worker updates
 *
 * @returns {Promise<boolean>}
 */
export async function checkForUpdates() {
  if (!isServiceWorkerSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.update()
    return true
  } catch (error) {
    console.error('Update check failed:', error)
    return false
  }
}

/**
 * Skip waiting and activate new service worker
 *
 * @returns {Promise<void>}
 */
export async function skipWaiting() {
  if (!isServiceWorkerSupported()) {
    return
  }

  const registration = await navigator.serviceWorker.ready
  const waiting = registration.waiting

  if (waiting) {
    waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

/**
 * Get service worker status
 *
 * @returns {Promise<Object>}
 */
export async function getServiceWorkerStatus() {
  if (!isServiceWorkerSupported()) {
    return { supported: false }
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()

    if (!registration) {
      return { supported: true, registered: false }
    }

    return {
      supported: true,
      registered: true,
      active: !!registration.active,
      waiting: !!registration.waiting,
      installing: !!registration.installing,
      scope: registration.scope,
    }
  } catch (error) {
    return { supported: true, error: error.message }
  }
}

/**
 * Clear all service worker caches
 *
 * @returns {Promise<boolean>}
 */
export async function clearCaches() {
  try {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
    console.log('All caches cleared')
    return true
  } catch (error) {
    console.error('Failed to clear caches:', error)
    return false
  }
}

/**
 * Get cache storage usage
 *
 * @returns {Promise<Object>}
 */
export async function getCacheUsage() {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return { supported: false }
  }

  try {
    const estimate = await navigator.storage.estimate()
    return {
      supported: true,
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentUsed: estimate.quota
        ? ((estimate.usage / estimate.quota) * 100).toFixed(2)
        : 0,
    }
  } catch (error) {
    return { supported: true, error: error.message }
  }
}

/**
 * Request persistent storage
 *
 * @returns {Promise<boolean>}
 */
export async function requestPersistentStorage() {
  if (!('storage' in navigator && 'persist' in navigator.storage)) {
    return false
  }

  try {
    const isPersisted = await navigator.storage.persisted()
    if (isPersisted) {
      console.log('Storage is already persistent')
      return true
    }

    const granted = await navigator.storage.persist()
    console.log('Persistent storage:', granted ? 'granted' : 'denied')
    return granted
  } catch (error) {
    console.error('Failed to request persistent storage:', error)
    return false
  }
}

export default {
  isServiceWorkerSupported,
  registerServiceWorker,
  unregisterServiceWorker,
  checkForUpdates,
  skipWaiting,
  getServiceWorkerStatus,
  clearCaches,
  getCacheUsage,
  requestPersistentStorage,
}
