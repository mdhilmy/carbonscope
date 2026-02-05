/**
 * IndexedDB Service using Dexie.js
 * Provides offline storage for facilities, calculations, and cached data
 */

import Dexie from 'dexie'

/**
 * CarbonScope Database
 */
class CarbonScopeDB extends Dexie {
  constructor() {
    super('CarbonScopeDB')

    // Define schema
    this.version(1).stores({
      // Facilities table
      facilities: '++id, name, type, region, createdAt, updatedAt',

      // Calculations table
      calculations: '++id, facilityId, type, createdAt, [facilityId+type]',

      // Emission factors cache
      emissionFactors: '++id, category, fuelType, region, updatedAt',

      // Grid factors cache
      gridFactors: '++id, region, subregion, updatedAt',

      // Settings
      settings: 'key',

      // API response cache
      apiCache: 'key, expiresAt',

      // Offline queue for sync
      offlineQueue: '++id, type, createdAt, synced',
    })

    // Define tables
    this.facilities = this.table('facilities')
    this.calculations = this.table('calculations')
    this.emissionFactors = this.table('emissionFactors')
    this.gridFactors = this.table('gridFactors')
    this.settings = this.table('settings')
    this.apiCache = this.table('apiCache')
    this.offlineQueue = this.table('offlineQueue')
  }
}

// Create database instance
const db = new CarbonScopeDB()

/**
 * Facility Operations
 */
export const facilitiesDB = {
  /**
   * Get all facilities
   */
  async getAll() {
    return db.facilities.toArray()
  },

  /**
   * Get facility by ID
   */
  async getById(id) {
    return db.facilities.get(id)
  },

  /**
   * Add new facility
   */
  async add(facility) {
    const now = new Date().toISOString()
    return db.facilities.add({
      ...facility,
      createdAt: now,
      updatedAt: now,
    })
  },

  /**
   * Update facility
   */
  async update(id, updates) {
    return db.facilities.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })
  },

  /**
   * Delete facility
   */
  async delete(id) {
    // Also delete associated calculations
    await db.calculations.where('facilityId').equals(id).delete()
    return db.facilities.delete(id)
  },

  /**
   * Search facilities
   */
  async search(query) {
    const lowerQuery = query.toLowerCase()
    return db.facilities
      .filter(f => f.name.toLowerCase().includes(lowerQuery))
      .toArray()
  },
}

/**
 * Calculations Operations
 */
export const calculationsDB = {
  /**
   * Get all calculations
   */
  async getAll() {
    return db.calculations.orderBy('createdAt').reverse().toArray()
  },

  /**
   * Get calculations for facility
   */
  async getByFacility(facilityId) {
    return db.calculations
      .where('facilityId')
      .equals(facilityId)
      .reverse()
      .sortBy('createdAt')
  },

  /**
   * Get calculation by ID
   */
  async getById(id) {
    return db.calculations.get(id)
  },

  /**
   * Save calculation
   */
  async save(calculation) {
    return db.calculations.add({
      ...calculation,
      createdAt: new Date().toISOString(),
    })
  },

  /**
   * Update calculation
   */
  async update(id, updates) {
    return db.calculations.update(id, updates)
  },

  /**
   * Delete calculation
   */
  async delete(id) {
    return db.calculations.delete(id)
  },

  /**
   * Get recent calculations
   */
  async getRecent(limit = 10) {
    return db.calculations
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray()
  },

  /**
   * Clear all calculations
   */
  async clear() {
    return db.calculations.clear()
  },
}

/**
 * Emission Factors Cache
 */
export const emissionFactorsDB = {
  /**
   * Get emission factor
   */
  async get(category, fuelType) {
    return db.emissionFactors
      .where({ category, fuelType })
      .first()
  },

  /**
   * Set emission factor
   */
  async set(category, fuelType, factor) {
    const existing = await this.get(category, fuelType)
    if (existing) {
      return db.emissionFactors.update(existing.id, {
        ...factor,
        updatedAt: new Date().toISOString(),
      })
    }
    return db.emissionFactors.add({
      category,
      fuelType,
      ...factor,
      updatedAt: new Date().toISOString(),
    })
  },

  /**
   * Get all factors for category
   */
  async getByCategory(category) {
    return db.emissionFactors.where('category').equals(category).toArray()
  },

  /**
   * Clear cache
   */
  async clear() {
    return db.emissionFactors.clear()
  },
}

/**
 * Grid Factors Cache
 */
export const gridFactorsDB = {
  /**
   * Get grid factor
   */
  async get(region, subregion = null) {
    if (subregion) {
      return db.gridFactors.where({ region, subregion }).first()
    }
    return db.gridFactors.where({ region }).first()
  },

  /**
   * Set grid factor
   */
  async set(region, subregion, factor) {
    const existing = await this.get(region, subregion)
    if (existing) {
      return db.gridFactors.update(existing.id, {
        ...factor,
        updatedAt: new Date().toISOString(),
      })
    }
    return db.gridFactors.add({
      region,
      subregion,
      ...factor,
      updatedAt: new Date().toISOString(),
    })
  },

  /**
   * Get all factors for region
   */
  async getByRegion(region) {
    return db.gridFactors.where('region').equals(region).toArray()
  },

  /**
   * Clear cache
   */
  async clear() {
    return db.gridFactors.clear()
  },
}

/**
 * Settings Operations
 */
export const settingsDB = {
  /**
   * Get setting
   */
  async get(key) {
    const setting = await db.settings.get(key)
    return setting?.value
  },

  /**
   * Set setting
   */
  async set(key, value) {
    return db.settings.put({ key, value })
  },

  /**
   * Get all settings
   */
  async getAll() {
    const settings = await db.settings.toArray()
    return settings.reduce((acc, { key, value }) => {
      acc[key] = value
      return acc
    }, {})
  },

  /**
   * Delete setting
   */
  async delete(key) {
    return db.settings.delete(key)
  },

  /**
   * Clear all settings
   */
  async clear() {
    return db.settings.clear()
  },
}

/**
 * API Cache Operations
 */
export const apiCacheDB = {
  /**
   * Get cached response
   */
  async get(key) {
    const cached = await db.apiCache.get(key)
    if (!cached) return null

    // Check expiration
    if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
      await this.delete(key)
      return null
    }

    return cached.data
  },

  /**
   * Set cached response
   */
  async set(key, data, ttlMs = 3600000) {
    const expiresAt = new Date(Date.now() + ttlMs).toISOString()
    return db.apiCache.put({ key, data, expiresAt })
  },

  /**
   * Delete cached response
   */
  async delete(key) {
    return db.apiCache.delete(key)
  },

  /**
   * Clear expired entries
   */
  async clearExpired() {
    const now = new Date().toISOString()
    return db.apiCache.where('expiresAt').below(now).delete()
  },

  /**
   * Clear all cache
   */
  async clear() {
    return db.apiCache.clear()
  },
}

/**
 * Offline Queue Operations
 */
export const offlineQueueDB = {
  /**
   * Add to queue
   */
  async add(type, data) {
    return db.offlineQueue.add({
      type,
      data,
      createdAt: new Date().toISOString(),
      synced: false,
    })
  },

  /**
   * Get pending items
   */
  async getPending() {
    return db.offlineQueue.where('synced').equals(false).toArray()
  },

  /**
   * Mark as synced
   */
  async markSynced(id) {
    return db.offlineQueue.update(id, { synced: true })
  },

  /**
   * Delete item
   */
  async delete(id) {
    return db.offlineQueue.delete(id)
  },

  /**
   * Clear synced items
   */
  async clearSynced() {
    return db.offlineQueue.where('synced').equals(true).delete()
  },

  /**
   * Clear all
   */
  async clear() {
    return db.offlineQueue.clear()
  },
}

/**
 * Database utilities
 */
export const dbUtils = {
  /**
   * Export all data
   */
  async exportAll() {
    return {
      facilities: await db.facilities.toArray(),
      calculations: await db.calculations.toArray(),
      settings: await settingsDB.getAll(),
      exportedAt: new Date().toISOString(),
    }
  },

  /**
   * Import data
   */
  async importData(data) {
    if (data.facilities) {
      await db.facilities.bulkPut(data.facilities)
    }
    if (data.calculations) {
      await db.calculations.bulkPut(data.calculations)
    }
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await settingsDB.set(key, value)
      }
    }
  },

  /**
   * Clear all data
   */
  async clearAll() {
    await Promise.all([
      db.facilities.clear(),
      db.calculations.clear(),
      db.emissionFactors.clear(),
      db.gridFactors.clear(),
      db.settings.clear(),
      db.apiCache.clear(),
      db.offlineQueue.clear(),
    ])
  },

  /**
   * Get database size (approximate)
   */
  async getSize() {
    const counts = {
      facilities: await db.facilities.count(),
      calculations: await db.calculations.count(),
      emissionFactors: await db.emissionFactors.count(),
      gridFactors: await db.gridFactors.count(),
      settings: await db.settings.count(),
      apiCache: await db.apiCache.count(),
      offlineQueue: await db.offlineQueue.count(),
    }
    return counts
  },
}

export { db }

export default {
  db,
  facilitiesDB,
  calculationsDB,
  emissionFactorsDB,
  gridFactorsDB,
  settingsDB,
  apiCacheDB,
  offlineQueueDB,
  dbUtils,
}
