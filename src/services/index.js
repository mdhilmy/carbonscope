/**
 * Services Index
 * Central export for all services
 */

// Calculation Services
export * from './calculations/scope1Calculations'
export * from './calculations/scope2Calculations'
export * from './calculations/scope3Calculations'
export * from './calculations/flaringCalculations'
export * from './calculations/fugitiveCalculations'
export * from './calculations/gwpConversions'
export * from './calculations/intensityMetrics'

// API Services
export * from './api'

// Export Services
export * from './export'

// Storage Services
export * from './storage'

// Import default exports for convenience
import * as calculations from './calculations/scope1Calculations'
import * as scope2 from './calculations/scope2Calculations'
import * as scope3 from './calculations/scope3Calculations'
import * as flaring from './calculations/flaringCalculations'
import * as fugitive from './calculations/fugitiveCalculations'
import * as gwp from './calculations/gwpConversions'
import * as intensity from './calculations/intensityMetrics'
import api from './api'
import exportServices from './export'
import storage from './storage'

export default {
  calculations: {
    ...calculations,
    ...scope2,
    ...scope3,
    ...flaring,
    ...fugitive,
    ...gwp,
    ...intensity,
  },
  api,
  export: exportServices,
  storage,
}
