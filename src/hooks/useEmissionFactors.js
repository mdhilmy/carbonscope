/**
 * useEmissionFactors Hook
 * Provides access to emission factors with caching and API fallback
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import epaFactors from '../data/emissionFactors/epaFactors.json'
import globalGridFactors from '../data/gridFactors/globalGridFactors.json'
import gwpValues from '../data/gwpValues.json'

/**
 * Custom hook for accessing emission factors
 *
 * @param {Object} options - Hook options
 * @returns {Object} Emission factors and utilities
 */
export function useEmissionFactors(options = {}) {
  const { gwpVersion = 'AR5' } = options

  const [customFactors, setCustomFactors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Get stationary combustion factor for a fuel type
   */
  const getStationaryFactor = useCallback((fuelType) => {
    // Check custom factors first
    if (customFactors.stationary?.[fuelType]) {
      return customFactors.stationary[fuelType]
    }
    return epaFactors.stationaryCombustion?.[fuelType] || null
  }, [customFactors])

  /**
   * Get mobile combustion factor
   */
  const getMobileFactor = useCallback((vehicleType, fuelType) => {
    if (customFactors.mobile?.[vehicleType]?.[fuelType]) {
      return customFactors.mobile[vehicleType][fuelType]
    }
    return epaFactors.mobileCombustion?.[vehicleType]?.[fuelType] || null
  }, [customFactors])

  /**
   * Get flaring emission factor
   */
  const getFlaringFactor = useCallback((fuelType = 'default') => {
    if (customFactors.flaring?.[fuelType]) {
      return customFactors.flaring[fuelType]
    }
    return epaFactors.flaring?.[fuelType] || epaFactors.flaring?.default || null
  }, [customFactors])

  /**
   * Get grid emission factor for a region
   */
  const getGridFactor = useCallback((region, subregion = null) => {
    if (customFactors.grid?.[region]) {
      return customFactors.grid[region]
    }

    const regionData = globalGridFactors[region]
    if (!regionData) return null

    // Check for subregion
    if (subregion) {
      const subregionData = regionData.subregions?.[subregion] ||
                           regionData.states?.[subregion] ||
                           regionData.provinces?.[subregion] ||
                           regionData[subregion]
      if (subregionData) return subregionData
    }

    // Return national/default factor
    if (regionData.factor !== undefined) return regionData
    if (regionData.national) return regionData.national

    return null
  }, [customFactors])

  /**
   * Get GWP value for a gas
   */
  const getGWP = useCallback((gasType) => {
    const gwp = gwpValues[gwpVersion]
    if (!gwp) return null

    // Handle common name mappings
    const mappings = {
      'CO2': 'CO2',
      'co2': 'CO2',
      'CH4': 'CH4_fossil',
      'ch4': 'CH4_fossil',
      'methane': 'CH4_fossil',
      'N2O': 'N2O',
      'n2o': 'N2O',
    }

    const key = mappings[gasType] || gasType
    return gwp[key] || null
  }, [gwpVersion])

  /**
   * Get all available fuel types for stationary combustion
   */
  const stationaryFuelTypes = useMemo(() => {
    return Object.entries(epaFactors.stationaryCombustion || {}).map(([key, data]) => ({
      value: key,
      label: data.description || key.replace(/([A-Z])/g, ' $1').trim(),
      co2Factor: data.co2,
      unit: data.unit,
    }))
  }, [])

  /**
   * Get all available vehicle types
   */
  const vehicleTypes = useMemo(() => {
    return Object.entries(epaFactors.mobileCombustion || {}).map(([key, data]) => ({
      value: key,
      label: key.replace(/([A-Z])/g, ' $1').trim(),
      fuelTypes: Object.keys(data).filter(k => typeof data[k] === 'object'),
    }))
  }, [])

  /**
   * Get all available regions for grid factors
   */
  const regions = useMemo(() => {
    return Object.entries(globalGridFactors)
      .filter(([key]) => key !== 'metadata')
      .map(([code, data]) => {
        const subregions = []

        // Collect subregions
        const subData = data.subregions || data.states || data.provinces
        if (subData) {
          Object.entries(subData).forEach(([subCode, subInfo]) => {
            subregions.push({
              code: subCode,
              name: subInfo.name || subCode,
              factor: subInfo.factor,
            })
          })
        }

        return {
          code,
          name: getRegionName(code),
          factor: data.factor || data.national?.factor,
          hasSubregions: subregions.length > 0,
          subregions,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  /**
   * Get available GWP versions
   */
  const gwpVersions = useMemo(() => {
    return Object.entries(gwpValues).map(([version, data]) => ({
      value: version,
      label: `${version} (${data.source})`,
      source: data.source,
      timeHorizon: data.timeHorizon,
      isDefault: data.default || false,
      deprecated: data.deprecated || false,
    }))
  }, [])

  /**
   * Set custom emission factor
   */
  const setCustomFactor = useCallback((category, key, factor) => {
    setCustomFactors(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: factor,
      },
    }))
  }, [])

  /**
   * Clear custom factors
   */
  const clearCustomFactors = useCallback(() => {
    setCustomFactors({})
  }, [])

  /**
   * Get all factors for export
   */
  const exportFactors = useCallback(() => {
    return {
      epaFactors,
      gridFactors: globalGridFactors,
      gwpValues,
      customFactors,
      exportedAt: new Date().toISOString(),
    }
  }, [customFactors])

  return {
    // State
    isLoading,
    gwpVersion,

    // Factor getters
    getStationaryFactor,
    getMobileFactor,
    getFlaringFactor,
    getGridFactor,
    getGWP,

    // Available options
    stationaryFuelTypes,
    vehicleTypes,
    regions,
    gwpVersions,

    // Raw data access
    epaFactors,
    gridFactors: globalGridFactors,
    gwpValues,

    // Custom factor management
    customFactors,
    setCustomFactor,
    clearCustomFactors,
    exportFactors,
  }
}

/**
 * Get human-readable region name
 */
function getRegionName(code) {
  const names = {
    US: 'United States',
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    ES: 'Spain',
    IT: 'Italy',
    NL: 'Netherlands',
    MY: 'Malaysia',
    SG: 'Singapore',
    AU: 'Australia',
    AE: 'United Arab Emirates',
    SA: 'Saudi Arabia',
    QA: 'Qatar',
    KW: 'Kuwait',
    OM: 'Oman',
    BH: 'Bahrain',
    BR: 'Brazil',
    CA: 'Canada',
    MX: 'Mexico',
    NO: 'Norway',
    SE: 'Sweden',
    DK: 'Denmark',
    PL: 'Poland',
    IN: 'India',
    CN: 'China',
    JP: 'Japan',
    KR: 'South Korea',
    ZA: 'South Africa',
    NG: 'Nigeria',
    EG: 'Egypt',
  }
  return names[code] || code
}

export default useEmissionFactors
