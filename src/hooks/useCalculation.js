/**
 * useCalculation Hook
 * Manages emission calculation state and operations
 */

import { useState, useCallback, useMemo } from 'react'
import * as scope1Calc from '../services/calculations/scope1Calculations'
import * as flaringCalc from '../services/calculations/flaringCalculations'
import * as fugitiveCalc from '../services/calculations/fugitiveCalculations'
import * as scope2Calc from '../services/calculations/scope2Calculations'
import * as scope3Calc from '../services/calculations/scope3Calculations'
import * as gwpCalc from '../services/calculations/gwpConversions'
import * as intensityCalc from '../services/calculations/intensityMetrics'

/**
 * Initial state for calculation results
 */
const initialResults = {
  scope1: {
    stationaryCombustion: null,
    mobileCombustion: null,
    flaring: null,
    venting: null,
    fugitive: null,
    total: { co2e_tonnes: 0 },
  },
  scope2: {
    locationBased: null,
    marketBased: null,
    steam: null,
    total: { co2e_tonnes: 0 },
  },
  scope3: {
    categories: {},
    total: { co2e_tonnes: 0 },
  },
  totals: {
    scope1_tonnes: 0,
    scope2_tonnes: 0,
    scope3_tonnes: 0,
    total_tonnes: 0,
  },
  intensity: null,
  thresholds: [],
  metadata: {
    calculatedAt: null,
    gwpVersion: 'AR5',
    facilityId: null,
    reportingPeriod: null,
  },
}

/**
 * Custom hook for managing emission calculations
 *
 * @param {Object} options - Hook options
 * @returns {Object} Calculation state and methods
 */
export function useCalculation(options = {}) {
  const { gwpVersion = 'AR5', autoSave = false } = options

  const [results, setResults] = useState(initialResults)
  const [isCalculating, setIsCalculating] = useState(false)
  const [errors, setErrors] = useState([])
  const [history, setHistory] = useState([])

  /**
   * Calculate Scope 1 stationary combustion
   */
  const calculateStationary = useCallback((fuelType, quantity, unit) => {
    try {
      const result = scope1Calc.calculateStationaryCombustion(fuelType, quantity, unit, gwpVersion)
      setResults(prev => ({
        ...prev,
        scope1: {
          ...prev.scope1,
          stationaryCombustion: result,
          total: {
            co2e_tonnes: (result?.co2e_tonnes || 0) +
              (prev.scope1.mobileCombustion?.co2e_tonnes || 0) +
              (prev.scope1.flaring?.co2e_tonnes || 0) +
              (prev.scope1.venting?.co2e_tonnes || 0) +
              (prev.scope1.fugitive?.co2e_tonnes || 0),
          },
        },
      }))
      return result
    } catch (error) {
      setErrors(prev => [...prev, { type: 'stationary', message: error.message }])
      return null
    }
  }, [gwpVersion])

  /**
   * Calculate Scope 1 mobile combustion
   */
  const calculateMobile = useCallback((vehicleType, fuelType, quantity, unit) => {
    try {
      const result = scope1Calc.calculateMobileCombustion(vehicleType, fuelType, quantity, unit, gwpVersion)
      setResults(prev => ({
        ...prev,
        scope1: {
          ...prev.scope1,
          mobileCombustion: result,
          total: {
            co2e_tonnes: (prev.scope1.stationaryCombustion?.co2e_tonnes || 0) +
              (result?.co2e_tonnes || 0) +
              (prev.scope1.flaring?.co2e_tonnes || 0) +
              (prev.scope1.venting?.co2e_tonnes || 0) +
              (prev.scope1.fugitive?.co2e_tonnes || 0),
          },
        },
      }))
      return result
    } catch (error) {
      setErrors(prev => [...prev, { type: 'mobile', message: error.message }])
      return null
    }
  }, [gwpVersion])

  /**
   * Calculate flaring emissions
   */
  const calculateFlaring = useCallback((volume, options = {}) => {
    try {
      let result
      if (options.gasComposition) {
        result = flaringCalc.calculateFlaringWithComposition(
          volume,
          options.gasComposition,
          options.combustionEfficiency || 0.98,
          gwpVersion
        )
      } else {
        result = flaringCalc.calculateFlaringDefault(
          volume,
          options.hhv || 1000,
          options.combustionEfficiency || 0.98,
          gwpVersion
        )
      }
      setResults(prev => ({
        ...prev,
        scope1: {
          ...prev.scope1,
          flaring: result,
          total: {
            co2e_tonnes: (prev.scope1.stationaryCombustion?.co2e_tonnes || 0) +
              (prev.scope1.mobileCombustion?.co2e_tonnes || 0) +
              (result?.co2e_tonnes || 0) +
              (prev.scope1.venting?.co2e_tonnes || 0) +
              (prev.scope1.fugitive?.co2e_tonnes || 0),
          },
        },
      }))
      return result
    } catch (error) {
      setErrors(prev => [...prev, { type: 'flaring', message: error.message }])
      return null
    }
  }, [gwpVersion])

  /**
   * Calculate venting emissions
   */
  const calculateVenting = useCallback((ventSources, methaneContent = 0.86) => {
    try {
      const result = fugitiveCalc.calculateVentingEmissions(ventSources, methaneContent, gwpVersion)
      setResults(prev => ({
        ...prev,
        scope1: {
          ...prev.scope1,
          venting: result,
          total: {
            co2e_tonnes: (prev.scope1.stationaryCombustion?.co2e_tonnes || 0) +
              (prev.scope1.mobileCombustion?.co2e_tonnes || 0) +
              (prev.scope1.flaring?.co2e_tonnes || 0) +
              (result?.co2e_tonnes || 0) +
              (prev.scope1.fugitive?.co2e_tonnes || 0),
          },
        },
      }))
      return result
    } catch (error) {
      setErrors(prev => [...prev, { type: 'venting', message: error.message }])
      return null
    }
  }, [gwpVersion])

  /**
   * Calculate fugitive emissions
   */
  const calculateFugitive = useCallback((components, serviceType = 'gasService') => {
    try {
      const result = fugitiveCalc.calculateComponentCountMethod(components, serviceType, gwpVersion)
      setResults(prev => ({
        ...prev,
        scope1: {
          ...prev.scope1,
          fugitive: result,
          total: {
            co2e_tonnes: (prev.scope1.stationaryCombustion?.co2e_tonnes || 0) +
              (prev.scope1.mobileCombustion?.co2e_tonnes || 0) +
              (prev.scope1.flaring?.co2e_tonnes || 0) +
              (prev.scope1.venting?.co2e_tonnes || 0) +
              (result?.co2e_tonnes || 0),
          },
        },
      }))
      return result
    } catch (error) {
      setErrors(prev => [...prev, { type: 'fugitive', message: error.message }])
      return null
    }
  }, [gwpVersion])

  /**
   * Calculate Scope 2 location-based
   */
  const calculateScope2Location = useCallback((electricityKWh, region, subregion = null) => {
    try {
      const result = scope2Calc.calculateLocationBased(electricityKWh, region, subregion)
      setResults(prev => ({
        ...prev,
        scope2: {
          ...prev.scope2,
          locationBased: result,
          total: {
            co2e_tonnes: (result?.co2e_tonnes || 0) +
              (prev.scope2.steam?.co2e_tonnes || 0),
          },
        },
      }))
      return result
    } catch (error) {
      setErrors(prev => [...prev, { type: 'scope2Location', message: error.message }])
      return null
    }
  }, [])

  /**
   * Calculate Scope 2 market-based
   */
  const calculateScope2Market = useCallback((electricityKWh, marketFactor, options = {}) => {
    try {
      const result = scope2Calc.calculateMarketBased(electricityKWh, marketFactor, options)
      setResults(prev => ({
        ...prev,
        scope2: {
          ...prev.scope2,
          marketBased: result,
        },
      }))
      return result
    } catch (error) {
      setErrors(prev => [...prev, { type: 'scope2Market', message: error.message }])
      return null
    }
  }, [])

  /**
   * Calculate Scope 2 dual reporting
   */
  const calculateScope2Dual = useCallback((electricityKWh, region, subregion, marketOptions = {}) => {
    try {
      const result = scope2Calc.calculateDualReporting(electricityKWh, region, subregion, marketOptions)
      setResults(prev => ({
        ...prev,
        scope2: {
          ...prev.scope2,
          locationBased: result.locationBased,
          marketBased: result.marketBased,
          comparison: result.comparison,
          total: {
            co2e_tonnes: (result.locationBased?.co2e_tonnes || 0) +
              (prev.scope2.steam?.co2e_tonnes || 0),
          },
        },
      }))
      return result
    } catch (error) {
      setErrors(prev => [...prev, { type: 'scope2Dual', message: error.message }])
      return null
    }
  }, [])

  /**
   * Calculate Scope 3 Category 11 (Use of Sold Products)
   */
  const calculateScope3Cat11 = useCallback((soldProducts) => {
    try {
      const result = scope3Calc.calculateCategory11(soldProducts, gwpVersion)
      setResults(prev => ({
        ...prev,
        scope3: {
          ...prev.scope3,
          categories: {
            ...prev.scope3.categories,
            11: result,
          },
          total: {
            co2e_tonnes: Object.values({ ...prev.scope3.categories, 11: result })
              .reduce((sum, cat) => sum + (cat?.co2_tonnes || cat?.co2e_tonnes || 0), 0),
          },
        },
      }))
      return result
    } catch (error) {
      setErrors(prev => [...prev, { type: 'scope3Cat11', message: error.message }])
      return null
    }
  }, [gwpVersion])

  /**
   * Calculate all Scope 3 categories
   */
  const calculateAllScope3 = useCallback((inputs) => {
    try {
      const result = scope3Calc.calculateTotalScope3(inputs, gwpVersion)
      setResults(prev => ({
        ...prev,
        scope3: {
          categories: result.categories,
          total: { co2e_tonnes: result.total_co2e_tonnes },
        },
      }))
      return result
    } catch (error) {
      setErrors(prev => [...prev, { type: 'scope3All', message: error.message }])
      return null
    }
  }, [gwpVersion])

  /**
   * Calculate intensity metrics
   */
  const calculateIntensity = useCallback((data) => {
    try {
      const result = intensityCalc.calculateAllIntensities(data)
      const thresholds = intensityCalc.checkRegulatoryThresholds({
        totalCO2e_tonnes: data.totalEmissions_tonnes,
        scope1_tonnes: data.scope1_tonnes,
      })
      setResults(prev => ({
        ...prev,
        intensity: result,
        thresholds,
      }))
      return { intensity: result, thresholds }
    } catch (error) {
      setErrors(prev => [...prev, { type: 'intensity', message: error.message }])
      return null
    }
  }, [])

  /**
   * Update totals
   */
  const updateTotals = useCallback(() => {
    setResults(prev => {
      const scope1_tonnes = prev.scope1.total?.co2e_tonnes || 0
      const scope2_tonnes = prev.scope2.total?.co2e_tonnes || 0
      const scope3_tonnes = prev.scope3.total?.co2e_tonnes || 0
      const total_tonnes = scope1_tonnes + scope2_tonnes + scope3_tonnes

      return {
        ...prev,
        totals: {
          scope1_tonnes,
          scope2_tonnes,
          scope3_tonnes,
          total_tonnes,
        },
        metadata: {
          ...prev.metadata,
          calculatedAt: new Date().toISOString(),
          gwpVersion,
        },
      }
    })
  }, [gwpVersion])

  /**
   * Clear all results
   */
  const clearResults = useCallback(() => {
    setResults(initialResults)
    setErrors([])
  }, [])

  /**
   * Clear specific scope
   */
  const clearScope = useCallback((scope) => {
    setResults(prev => ({
      ...prev,
      [scope]: initialResults[scope],
    }))
  }, [])

  /**
   * Save current results to history
   */
  const saveToHistory = useCallback(() => {
    setHistory(prev => [
      {
        ...results,
        savedAt: new Date().toISOString(),
      },
      ...prev.slice(0, 9), // Keep last 10
    ])
  }, [results])

  /**
   * Computed values
   */
  const summary = useMemo(() => ({
    hasScope1: results.scope1.total?.co2e_tonnes > 0,
    hasScope2: results.scope2.total?.co2e_tonnes > 0,
    hasScope3: results.scope3.total?.co2e_tonnes > 0,
    totalEmissions: results.totals.total_tonnes,
    scope1Percent: results.totals.total_tonnes > 0
      ? (results.totals.scope1_tonnes / results.totals.total_tonnes) * 100
      : 0,
    scope2Percent: results.totals.total_tonnes > 0
      ? (results.totals.scope2_tonnes / results.totals.total_tonnes) * 100
      : 0,
    scope3Percent: results.totals.total_tonnes > 0
      ? (results.totals.scope3_tonnes / results.totals.total_tonnes) * 100
      : 0,
    hasThresholdAlerts: results.thresholds.length > 0,
  }), [results])

  return {
    // State
    results,
    isCalculating,
    errors,
    history,
    summary,

    // Scope 1 calculations
    calculateStationary,
    calculateMobile,
    calculateFlaring,
    calculateVenting,
    calculateFugitive,

    // Scope 2 calculations
    calculateScope2Location,
    calculateScope2Market,
    calculateScope2Dual,

    // Scope 3 calculations
    calculateScope3Cat11,
    calculateAllScope3,

    // Other calculations
    calculateIntensity,

    // Actions
    updateTotals,
    clearResults,
    clearScope,
    saveToHistory,
    setResults,
  }
}

export default useCalculation
