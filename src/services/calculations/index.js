/**
 * Calculations Services Index
 * Central export for all calculation functionality
 */

// Scope 1 Calculations
export {
  calculateStationaryCombustion,
  calculateMobileCombustion,
  calculateTotalScope1,
  getFuelTypes,
  getVehicleTypes,
} from './scope1Calculations'

// Flaring Calculations
export {
  calculateFlaringDefault,
  calculateFlaringWithComposition,
  calculateFlaringVolume,
  estimateFlaringEmissions,
  validateGasComposition,
} from './flaringCalculations'

// Fugitive Calculations
export {
  calculateComponentCountMethod,
  calculateAverageMethod,
  calculatePneumaticEmissions,
  calculateVentingEmissions,
  getComponentTypes,
} from './fugitiveCalculations'

// Scope 2 Calculations
export {
  calculateLocationBased,
  calculateMarketBased,
  calculateDualReporting,
  calculatePurchasedSteam,
  calculatePurchasedHeatingCooling,
  getGridFactor,
  getAvailableRegions,
} from './scope2Calculations'

// Scope 3 Calculations
export {
  calculateCategory11,
  calculateCategory3,
  calculateCategory4,
  calculateCategory9,
  calculateCategory10,
  calculateTotalScope3,
  getScope3Categories,
  COMBUSTION_FACTORS,
} from './scope3Calculations'

// GWP Conversions
export {
  convertToCO2e,
  calculateTotalCO2e,
  getGWP,
  compareGWPVersions,
  getGWPVersions,
  getGWPTable,
} from './gwpConversions'

// Intensity Metrics
export {
  calculateCarbonIntensity,
  calculateMethaneIntensity,
  calculateFlaringIntensity,
  calculateRevenueIntensity,
  calculateAllIntensities,
  checkRegulatoryThresholds,
} from './intensityMetrics'

// Import defaults
import scope1 from './scope1Calculations'
import flaring from './flaringCalculations'
import fugitive from './fugitiveCalculations'
import scope2 from './scope2Calculations'
import scope3 from './scope3Calculations'
import gwp from './gwpConversions'
import intensity from './intensityMetrics'

export default {
  scope1,
  flaring,
  fugitive,
  scope2,
  scope3,
  gwp,
  intensity,
}
