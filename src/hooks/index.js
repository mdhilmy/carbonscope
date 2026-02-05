/**
 * Custom Hooks Index
 * Central export for all custom hooks
 */

// Calculation hook
export { useCalculation } from './useCalculation'

// Emission factors hook
export { useEmissionFactors } from './useEmissionFactors'

// API data hooks
export {
  useApiData,
  useEpaData,
  useUkCarbonData,
  useEiaData,
  useElectricityMapsData,
  useMultiSourceData,
} from './useApiData'

// Offline hooks
export {
  useOffline,
  useOfflineQueue,
  useOfflineFirst,
} from './useOffline'

// LocalStorage hooks
export {
  useLocalStorage,
  useSettings,
  useFacilities,
  useCalculationHistory,
} from './useLocalStorage'

// Re-export defaults
import useCalculation from './useCalculation'
import useEmissionFactors from './useEmissionFactors'
import useApiData from './useApiData'
import useOffline from './useOffline'
import useLocalStorage from './useLocalStorage'

export default {
  useCalculation,
  useEmissionFactors,
  useApiData,
  useOffline,
  useLocalStorage,
}
