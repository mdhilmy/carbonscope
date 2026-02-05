/**
 * EPA Envirofacts API Client
 * Access EPA GHG data for facility benchmarking
 * No authentication required
 *
 * API Documentation: https://www.epa.gov/enviro/envirofacts-data-service-api
 */

import { fetchWithFallback, buildUrl, getCachedData, setCachedData } from './apiClient'

const BASE_URL = 'https://data.epa.gov/efservice'

// Cache TTL: 24 hours for EPA data (updates annually)
const CACHE_TTL = 86400000

/**
 * Fallback data for when API is unavailable
 */
const FALLBACK_DATA = {
  facilityEmissions: [],
  industryBenchmarks: {
    oilGasExtraction: {
      averageEmissions: 125000, // tonnes CO2e
      medianEmissions: 85000,
      p25: 35000,
      p75: 180000,
      unit: 'tonnes CO2e/year',
      source: 'EPA GHGRP 2022 (offline)',
    },
    petroleumRefining: {
      averageEmissions: 850000,
      medianEmissions: 650000,
      p25: 280000,
      p75: 1200000,
      unit: 'tonnes CO2e/year',
      source: 'EPA GHGRP 2022 (offline)',
    },
    naturalGasProcessing: {
      averageEmissions: 180000,
      medianEmissions: 120000,
      p25: 45000,
      p75: 250000,
      unit: 'tonnes CO2e/year',
      source: 'EPA GHGRP 2022 (offline)',
    },
  },
  naicsMapping: {
    '211': 'Oil and Gas Extraction',
    '211120': 'Crude Petroleum Extraction',
    '211130': 'Natural Gas Extraction',
    '324': 'Petroleum and Coal Products Manufacturing',
    '324110': 'Petroleum Refineries',
    '486': 'Pipeline Transportation',
    '486110': 'Pipeline Transportation of Crude Oil',
    '486210': 'Pipeline Transportation of Natural Gas',
  },
}

/**
 * Get GHG emissions data for facilities by state
 *
 * @param {string} state - Two-letter state code (e.g., 'TX', 'CA')
 * @param {string} year - Reporting year (default: latest)
 * @returns {Promise<Object>} Facility emissions data
 */
export async function getFacilityEmissionsByState(state, year = '2022') {
  const cacheKey = `epa_facilities_${state}_${year}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  // PUB_DIM_GHG table contains aggregated facility data
  const url = buildUrl(`${BASE_URL}/PUB_DIM_FACILITY/STATE_NAME/${state}/JSON`)

  const result = await fetchWithFallback(url, FALLBACK_DATA.facilityEmissions, {
    timeout: 10000, // EPA can be slow
  })

  if (result.source === 'api' && result.data.length > 0) {
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get emissions by industry sector (NAICS code)
 *
 * @param {string} naicsCode - NAICS industry code
 * @param {string} year - Reporting year
 * @returns {Promise<Object>} Sector emissions data
 */
export async function getEmissionsByNaics(naicsCode, year = '2022') {
  const cacheKey = `epa_naics_${naicsCode}_${year}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  // Search for facilities by NAICS code
  const url = `${BASE_URL}/PUB_DIM_FACILITY/NAICS_CODE/BEGINNING/${naicsCode}/JSON`

  const result = await fetchWithFallback(url, [], {
    timeout: 10000,
  })

  if (result.source === 'api' && result.data.length > 0) {
    // Calculate sector statistics
    const emissions = result.data
      .filter(f => f.GHG_QUANTITY)
      .map(f => parseFloat(f.GHG_QUANTITY))

    if (emissions.length > 0) {
      const sorted = emissions.sort((a, b) => a - b)
      const sum = emissions.reduce((a, b) => a + b, 0)

      result.statistics = {
        count: emissions.length,
        total: sum,
        average: sum / emissions.length,
        median: sorted[Math.floor(sorted.length / 2)],
        p25: sorted[Math.floor(sorted.length * 0.25)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        min: sorted[0],
        max: sorted[sorted.length - 1],
      }
    }

    setCachedData(cacheKey, result, CACHE_TTL)
  }

  return result
}

/**
 * Get industry benchmarks for oil and gas sector
 *
 * @param {string} sectorType - 'extraction', 'refining', 'processing', 'pipeline'
 * @returns {Promise<Object>} Benchmark data
 */
export async function getOilGasBenchmarks(sectorType = 'extraction') {
  const naicsCodes = {
    extraction: '211',
    refining: '324110',
    processing: '211130',
    pipeline: '486',
  }

  const naics = naicsCodes[sectorType]
  if (!naics) {
    return {
      data: FALLBACK_DATA.industryBenchmarks.oilGasExtraction,
      source: 'fallback',
      error: `Unknown sector type: ${sectorType}`,
    }
  }

  const result = await getEmissionsByNaics(naics)

  if (result.source === 'api' && result.statistics) {
    return {
      data: {
        ...result.statistics,
        unit: 'tonnes CO2e/year',
        source: 'EPA GHGRP (live)',
        sectorType,
        naicsCode: naics,
      },
      source: 'api',
    }
  }

  // Return fallback benchmark data
  const fallbackKey = {
    extraction: 'oilGasExtraction',
    refining: 'petroleumRefining',
    processing: 'naturalGasProcessing',
    pipeline: 'oilGasExtraction', // Use extraction as fallback
  }[sectorType]

  return {
    data: FALLBACK_DATA.industryBenchmarks[fallbackKey],
    source: 'fallback',
    error: result.error,
  }
}

/**
 * Search for a specific facility by name
 *
 * @param {string} facilityName - Facility name to search
 * @param {string} state - Optional state filter
 * @returns {Promise<Object>} Matching facilities
 */
export async function searchFacility(facilityName, state = null) {
  // EPA API uses CONTAINING for partial matches
  let url = `${BASE_URL}/PUB_DIM_FACILITY/FACILITY_NAME/CONTAINING/${encodeURIComponent(facilityName)}`

  if (state) {
    url += `/STATE_NAME/${state}`
  }

  url += '/JSON'

  const result = await fetchWithFallback(url, [], {
    timeout: 10000,
  })

  if (result.source === 'api') {
    // Format facility data
    result.data = result.data.map(f => ({
      id: f.FACILITY_ID,
      name: f.FACILITY_NAME,
      state: f.STATE_NAME,
      city: f.CITY_NAME,
      naicsCode: f.NAICS_CODE,
      ghgQuantity: parseFloat(f.GHG_QUANTITY) || null,
      reportingYear: f.REPORTING_YEAR,
      latitude: parseFloat(f.LATITUDE) || null,
      longitude: parseFloat(f.LONGITUDE) || null,
    }))
  }

  return result
}

/**
 * Get emissions trends for a specific facility
 *
 * @param {string} facilityId - EPA facility ID
 * @returns {Promise<Object>} Historical emissions data
 */
export async function getFacilityTrends(facilityId) {
  const cacheKey = `epa_facility_${facilityId}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = `${BASE_URL}/PUB_DIM_FACILITY/FACILITY_ID/${facilityId}/JSON`

  const result = await fetchWithFallback(url, [], {
    timeout: 10000,
  })

  if (result.source === 'api' && result.data.length > 0) {
    // Sort by year and format
    result.data = result.data
      .sort((a, b) => parseInt(a.REPORTING_YEAR) - parseInt(b.REPORTING_YEAR))
      .map(f => ({
        year: f.REPORTING_YEAR,
        emissions: parseFloat(f.GHG_QUANTITY) || 0,
        co2: parseFloat(f.CO2_EMISSIONS) || 0,
        ch4: parseFloat(f.CH4_EMISSIONS) || 0,
        n2o: parseFloat(f.N2O_EMISSIONS) || 0,
      }))

    setCachedData(cacheKey, result, CACHE_TTL)
  }

  return result
}

/**
 * Get subpart W (petroleum and natural gas systems) data
 *
 * @param {string} state - State code
 * @param {string} year - Reporting year
 * @returns {Promise<Object>} Subpart W emissions data
 */
export async function getSubpartWData(state, year = '2022') {
  const cacheKey = `epa_subpartw_${state}_${year}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  // Subpart W table for petroleum and natural gas systems
  const url = `${BASE_URL}/W_SUBPART_LEVEL_INFORMATION/STATE/${state}/REPORTING_YEAR/${year}/JSON`

  const result = await fetchWithFallback(url, [], {
    timeout: 10000,
  })

  if (result.source === 'api' && result.data.length > 0) {
    // Aggregate by emission source type
    const bySource = {}
    result.data.forEach(record => {
      const source = record.EMISSION_SOURCE_TYPE || 'Other'
      if (!bySource[source]) {
        bySource[source] = { count: 0, totalEmissions: 0 }
      }
      bySource[source].count++
      bySource[source].totalEmissions += parseFloat(record.GHG_QUANTITY) || 0
    })

    result.aggregated = bySource
    setCachedData(cacheKey, result, CACHE_TTL)
  }

  return result
}

/**
 * Get NAICS code description
 */
export function getNaicsDescription(naicsCode) {
  return FALLBACK_DATA.naicsMapping[naicsCode] || 'Unknown Industry'
}

/**
 * Get all available NAICS codes for oil and gas
 */
export function getOilGasNaicsCodes() {
  return Object.entries(FALLBACK_DATA.naicsMapping).map(([code, description]) => ({
    code,
    description,
  }))
}

export default {
  getFacilityEmissionsByState,
  getEmissionsByNaics,
  getOilGasBenchmarks,
  searchFacility,
  getFacilityTrends,
  getSubpartWData,
  getNaicsDescription,
  getOilGasNaicsCodes,
  FALLBACK_DATA,
}
