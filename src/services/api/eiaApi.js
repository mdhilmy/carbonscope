/**
 * EIA (Energy Information Administration) API Client
 * US energy production, consumption, and emissions data
 * Requires free API key from: https://www.eia.gov/opendata/register.php
 *
 * API Documentation: https://www.eia.gov/opendata/documentation.php
 */

import { fetchWithFallback, getApiKey, getCachedData, setCachedData, buildUrl } from './apiClient'

const BASE_URL = 'https://api.eia.gov/v2'
const API_KEY_NAME = 'eia'

// Cache TTL: 6 hours for EIA data
const CACHE_TTL = 21600000

/**
 * Fallback data for when API is unavailable
 */
const FALLBACK_DATA = {
  crudePrices: {
    wti: 75.50,
    brent: 79.20,
    unit: 'USD/barrel',
    source: 'EIA (offline estimate)',
    date: new Date().toISOString().split('T')[0],
  },
  naturalGasPrices: {
    henryHub: 2.85,
    unit: 'USD/MMBtu',
    source: 'EIA (offline estimate)',
    date: new Date().toISOString().split('T')[0],
  },
  usProduction: {
    crudeOil: 13100, // thousand barrels/day
    naturalGas: 103.5, // billion cubic feet/day
    unit: 'kbd / bcf/d',
    source: 'EIA (offline estimate)',
    period: 'monthly average',
  },
  emissionFactors: {
    coal: { factor: 95.52, unit: 'kg CO2/MMBtu' },
    naturalGas: { factor: 53.07, unit: 'kg CO2/MMBtu' },
    petroleum: { factor: 74.14, unit: 'kg CO2/MMBtu' },
    diesel: { factor: 73.96, unit: 'kg CO2/MMBtu' },
    gasoline: { factor: 70.22, unit: 'kg CO2/MMBtu' },
  },
  stateEmissions: {
    TX: { co2: 705.4, rank: 1 },
    CA: { co2: 358.2, rank: 2 },
    FL: { co2: 234.8, rank: 3 },
    PA: { co2: 218.5, rank: 4 },
    OH: { co2: 198.3, rank: 5 },
    unit: 'million metric tons CO2',
    year: 2022,
  },
}

/**
 * Check if EIA API key is configured
 */
export function hasEiaApiKey() {
  return !!getApiKey(API_KEY_NAME)
}

/**
 * Get API key with header
 */
function getAuthHeaders() {
  const apiKey = getApiKey(API_KEY_NAME)
  return apiKey ? { 'X-Api-Key': apiKey } : {}
}

/**
 * Build EIA API URL with authentication
 */
function buildEiaUrl(route, params = {}) {
  const apiKey = getApiKey(API_KEY_NAME)
  const allParams = apiKey ? { ...params, api_key: apiKey } : params
  return buildUrl(`${BASE_URL}${route}`, allParams)
}

/**
 * Get crude oil prices (WTI, Brent)
 *
 * @returns {Promise<Object>} Current crude prices
 */
export async function getCrudePrices() {
  if (!hasEiaApiKey()) {
    return {
      data: FALLBACK_DATA.crudePrices,
      source: 'fallback',
      error: 'EIA API key not configured. Using offline data.',
      requiresKey: true,
    }
  }

  const cacheKey = 'eia_crude_prices'
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  // Petroleum spot prices
  const url = buildEiaUrl('/petroleum/pri/spt/data/', {
    frequency: 'daily',
    data: ['value'],
    facets: {
      product: ['EPCWTI', 'EPCBRENT'], // WTI and Brent
    },
    sort: [{ column: 'period', direction: 'desc' }],
    length: 5,
  })

  const result = await fetchWithFallback(url, FALLBACK_DATA.crudePrices, {
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data.response?.data) {
    const data = result.data.response.data
    const wti = data.find(d => d.product === 'EPCWTI')
    const brent = data.find(d => d.product === 'EPCBRENT')

    result.data = {
      wti: wti?.value || FALLBACK_DATA.crudePrices.wti,
      brent: brent?.value || FALLBACK_DATA.crudePrices.brent,
      unit: 'USD/barrel',
      source: 'EIA API',
      date: wti?.period || new Date().toISOString().split('T')[0],
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get natural gas prices (Henry Hub)
 *
 * @returns {Promise<Object>} Current natural gas prices
 */
export async function getNaturalGasPrices() {
  if (!hasEiaApiKey()) {
    return {
      data: FALLBACK_DATA.naturalGasPrices,
      source: 'fallback',
      error: 'EIA API key not configured. Using offline data.',
      requiresKey: true,
    }
  }

  const cacheKey = 'eia_ng_prices'
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = buildEiaUrl('/natural-gas/pri/fut/data/', {
    frequency: 'daily',
    data: ['value'],
    facets: {
      series: ['RNGC1'],
    },
    sort: [{ column: 'period', direction: 'desc' }],
    length: 5,
  })

  const result = await fetchWithFallback(url, FALLBACK_DATA.naturalGasPrices, {
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data.response?.data?.[0]) {
    const data = result.data.response.data[0]
    result.data = {
      henryHub: data.value,
      unit: 'USD/MMBtu',
      source: 'EIA API',
      date: data.period,
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get US crude oil production data
 *
 * @param {string} frequency - 'monthly' or 'annual'
 * @returns {Promise<Object>} Production data
 */
export async function getCrudeProduction(frequency = 'monthly') {
  if (!hasEiaApiKey()) {
    return {
      data: FALLBACK_DATA.usProduction,
      source: 'fallback',
      error: 'EIA API key not configured. Using offline data.',
      requiresKey: true,
    }
  }

  const cacheKey = `eia_crude_prod_${frequency}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = buildEiaUrl('/petroleum/crd/crpdn/data/', {
    frequency,
    data: ['value'],
    facets: {
      product: ['EPC0'],
    },
    sort: [{ column: 'period', direction: 'desc' }],
    length: 12,
  })

  const result = await fetchWithFallback(url, FALLBACK_DATA.usProduction, {
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data.response?.data) {
    result.data = {
      history: result.data.response.data.map(d => ({
        period: d.period,
        value: d.value,
      })),
      latest: result.data.response.data[0]?.value,
      unit: 'thousand barrels/day',
      source: 'EIA API',
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get natural gas production data
 *
 * @param {string} frequency - 'monthly' or 'annual'
 * @returns {Promise<Object>} Production data
 */
export async function getNaturalGasProduction(frequency = 'monthly') {
  if (!hasEiaApiKey()) {
    return {
      data: {
        latest: FALLBACK_DATA.usProduction.naturalGas,
        unit: 'billion cubic feet/day',
        source: 'EIA (offline estimate)',
      },
      source: 'fallback',
      error: 'EIA API key not configured. Using offline data.',
      requiresKey: true,
    }
  }

  const cacheKey = `eia_ng_prod_${frequency}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = buildEiaUrl('/natural-gas/prod/sum/data/', {
    frequency,
    data: ['value'],
    sort: [{ column: 'period', direction: 'desc' }],
    length: 12,
  })

  const result = await fetchWithFallback(url, FALLBACK_DATA.usProduction, {
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data.response?.data) {
    result.data = {
      history: result.data.response.data.map(d => ({
        period: d.period,
        value: d.value,
      })),
      latest: result.data.response.data[0]?.value,
      unit: 'billion cubic feet',
      source: 'EIA API',
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get state-level CO2 emissions
 *
 * @param {string} state - Two-letter state code (optional, for all states if omitted)
 * @returns {Promise<Object>} State emissions data
 */
export async function getStateEmissions(state = null) {
  if (!hasEiaApiKey()) {
    return {
      data: state ? FALLBACK_DATA.stateEmissions[state] : FALLBACK_DATA.stateEmissions,
      source: 'fallback',
      error: 'EIA API key not configured. Using offline data.',
      requiresKey: true,
    }
  }

  const cacheKey = state ? `eia_emissions_${state}` : 'eia_emissions_all'
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const params = {
    frequency: 'annual',
    data: ['value'],
    sort: [{ column: 'period', direction: 'desc' }],
    length: 5,
  }

  if (state) {
    params.facets = { stateId: [state] }
  }

  const url = buildEiaUrl('/co2-emissions/co2-emissions-aggregates/data/', params)

  const result = await fetchWithFallback(url, FALLBACK_DATA.stateEmissions, {
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data.response?.data) {
    result.data = {
      emissions: result.data.response.data.map(d => ({
        state: d.stateId,
        period: d.period,
        value: d.value,
        sector: d.sectorId,
      })),
      unit: 'million metric tons CO2',
      source: 'EIA API',
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get electricity generation by source
 *
 * @param {string} state - State code (optional)
 * @returns {Promise<Object>} Generation mix data
 */
export async function getElectricityGeneration(state = null) {
  if (!hasEiaApiKey()) {
    return {
      data: {
        mix: {
          naturalGas: 40,
          coal: 20,
          nuclear: 19,
          renewables: 21,
        },
        unit: 'percent',
        source: 'EIA (offline estimate)',
      },
      source: 'fallback',
      error: 'EIA API key not configured. Using offline data.',
      requiresKey: true,
    }
  }

  const cacheKey = state ? `eia_elec_gen_${state}` : 'eia_elec_gen_us'
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const params = {
    frequency: 'monthly',
    data: ['value'],
    sort: [{ column: 'period', direction: 'desc' }],
    length: 24,
  }

  if (state) {
    params.facets = { stateId: [state] }
  }

  const url = buildEiaUrl('/electricity/electric-power-operational-data/data/', params)

  const result = await fetchWithFallback(url, null, {
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data.response?.data) {
    result.data = {
      generation: result.data.response.data,
      source: 'EIA API',
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get emission factors for various fuels
 */
export function getEmissionFactors() {
  return FALLBACK_DATA.emissionFactors
}

/**
 * Search EIA datasets
 *
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results
 */
export async function searchDatasets(query) {
  if (!hasEiaApiKey()) {
    return {
      data: [],
      source: 'fallback',
      error: 'EIA API key not configured.',
      requiresKey: true,
    }
  }

  const url = buildEiaUrl('/search', {
    search: query,
  })

  return fetchWithFallback(url, [], {
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })
}

/**
 * Get API key registration URL
 */
export function getApiKeyRegistrationUrl() {
  return 'https://www.eia.gov/opendata/register.php'
}

/**
 * Get API key name for settings
 */
export function getApiKeyName() {
  return API_KEY_NAME
}

export default {
  hasEiaApiKey,
  getCrudePrices,
  getNaturalGasPrices,
  getCrudeProduction,
  getNaturalGasProduction,
  getStateEmissions,
  getElectricityGeneration,
  getEmissionFactors,
  searchDatasets,
  getApiKeyRegistrationUrl,
  getApiKeyName,
  FALLBACK_DATA,
}
