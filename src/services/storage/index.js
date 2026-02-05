/**
 * Storage Services Index
 * Central export for all storage functionality
 */

// IndexedDB
export {
  db,
  facilitiesDB,
  calculationsDB,
  emissionFactorsDB,
  gridFactorsDB,
  settingsDB,
  apiCacheDB,
  offlineQueueDB,
  dbUtils,
} from './indexedDB'

// Service Worker
export {
  isServiceWorkerSupported,
  registerServiceWorker,
  unregisterServiceWorker,
  checkForUpdates,
  skipWaiting,
  getServiceWorkerStatus,
  clearCaches,
  getCacheUsage,
  requestPersistentStorage,
} from './serviceWorker'

// Import defaults
import indexedDBExports from './indexedDB'
import serviceWorkerExports from './serviceWorker'

/**
 * Initialize storage services
 *
 * @param {Object} options - Initialization options
 * @returns {Promise<Object>} Initialization status
 */
export async function initializeStorage(options = {}) {
  const {
    registerSW = true,
    requestPersistence = true,
    onSwUpdate = null,
    onOffline = null,
  } = options

  const status = {
    indexedDB: false,
    serviceWorker: false,
    persistentStorage: false,
  }

  // Test IndexedDB
  try {
    await indexedDBExports.db.open()
    status.indexedDB = true
  } catch (error) {
    console.error('IndexedDB initialization failed:', error)
  }

  // Register Service Worker
  if (registerSW && serviceWorkerExports.isServiceWorkerSupported()) {
    try {
      await serviceWorkerExports.registerServiceWorker({
        onUpdate: onSwUpdate,
        onOffline: onOffline,
      })
      status.serviceWorker = true
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  }

  // Request Persistent Storage
  if (requestPersistence) {
    status.persistentStorage = await serviceWorkerExports.requestPersistentStorage()
  }

  return status
}

/**
 * Get overall storage status
 *
 * @returns {Promise<Object>} Storage status
 */
export async function getStorageStatus() {
  const [swStatus, cacheUsage, dbSize] = await Promise.all([
    serviceWorkerExports.getServiceWorkerStatus(),
    serviceWorkerExports.getCacheUsage(),
    indexedDBExports.dbUtils.getSize(),
  ])

  return {
    serviceWorker: swStatus,
    cacheStorage: cacheUsage,
    indexedDB: dbSize,
  }
}

/**
 * Clear all storage
 *
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllStorage() {
  try {
    // Clear IndexedDB
    await indexedDBExports.dbUtils.clearAll()

    // Clear caches
    await serviceWorkerExports.clearCaches()

    // Clear localStorage
    const keysToKeep = ['carbonscope_api_keys'] // Keep API keys
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      if (key.startsWith('carbonscope_') && !keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })

    return true
  } catch (error) {
    console.error('Failed to clear storage:', error)
    return false
  }
}

export default {
  ...indexedDBExports,
  ...serviceWorkerExports,
  initializeStorage,
  getStorageStatus,
  clearAllStorage,
}
