/**
 * Facility Service
 * Centralized localStorage service for facility management.
 * Each facility stores metadata, calculation results, and benchmark data.
 */

const STORAGE_KEY = 'carbonscope_facilities'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(facilities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(facilities))
}

/**
 * Get all facilities
 */
export function getAllFacilities() {
  return readAll()
}

/**
 * Get a single facility by ID
 */
export function getFacility(id) {
  return readAll().find((f) => f.id === id) || null
}

/**
 * Create a new facility (empty — no calculations)
 */
export function createFacility({ name, type, region }) {
  const facilities = readAll()
  const newFacility = {
    id: `facility_${Date.now()}`,
    name,
    type: type || 'other',
    region: region || 'US',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    calculations: null, // stored calculation results
    benchmarks: null, // stored benchmark results
  }
  facilities.push(newFacility)
  writeAll(facilities)
  return newFacility
}

/**
 * Delete a facility
 */
export function deleteFacility(id) {
  const facilities = readAll().filter((f) => f.id !== id)
  writeAll(facilities)
}

/**
 * Update facility metadata (name, type, region)
 */
export function updateFacility(id, updates) {
  const facilities = readAll()
  const idx = facilities.findIndex((f) => f.id === id)
  if (idx === -1) return null
  facilities[idx] = {
    ...facilities[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  writeAll(facilities)
  return facilities[idx]
}

/**
 * Save calculation results to a facility.
 * Overwrites existing calculations AND clears benchmarks (they are stale).
 */
export function saveCalculationToFacility(id, calculationResults) {
  const facilities = readAll()
  const idx = facilities.findIndex((f) => f.id === id)
  if (idx === -1) return null
  facilities[idx].calculations = {
    ...calculationResults,
    savedAt: new Date().toISOString(),
  }
  facilities[idx].benchmarks = null // stale after new calc
  facilities[idx].updatedAt = new Date().toISOString()
  writeAll(facilities)
  return facilities[idx]
}

/**
 * Save benchmark results into a facility
 */
export function saveBenchmarkToFacility(id, benchmarkResults) {
  const facilities = readAll()
  const idx = facilities.findIndex((f) => f.id === id)
  if (idx === -1) return null
  facilities[idx].benchmarks = {
    ...benchmarkResults,
    savedAt: new Date().toISOString(),
  }
  facilities[idx].updatedAt = new Date().toISOString()
  writeAll(facilities)
  return facilities[idx]
}

/**
 * Check if a facility has saved calculations
 */
export function hasCalculations(facility) {
  return !!(facility && facility.calculations)
}

/**
 * Check if a facility has saved benchmarks
 */
export function hasBenchmarks(facility) {
  return !!(facility && facility.benchmarks)
}

export default {
  getAllFacilities,
  getFacility,
  createFacility,
  deleteFacility,
  updateFacility,
  saveCalculationToFacility,
  saveBenchmarkToFacility,
  hasCalculations,
  hasBenchmarks,
}
