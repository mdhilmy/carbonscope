/**
 * Electricity Maps API Client
 * Real-time carbon intensity data for global electricity grids
 * Requires free API key from: https://www.electricitymaps.com/
 *
 * Free tier: 25 requests/hour, 100 requests/day
 */

import { fetchWithFallback, getApiKey, getCachedData, setCachedData, buildUrl } from './apiClient'

const BASE_URL = 'https://api.electricitymap.org/v3'
const API_KEY_NAME = 'electricityMaps'

// Cache TTL: 30 minutes (to respect rate limits)
const CACHE_TTL = 1800000

/**
 * Fallback data for when API is unavailable
 * Based on typical grid intensities
 */
const FALLBACK_DATA = {
  carbonIntensity: {
    US: { carbonIntensity: 373, unit: 'gCO2eq/kWh' },
    GB: { carbonIntensity: 225, unit: 'gCO2eq/kWh' },
    DE: { carbonIntensity: 385, unit: 'gCO2eq/kWh' },
    FR: { carbonIntensity: 85, unit: 'gCO2eq/kWh' },
    AU: { carbonIntensity: 656, unit: 'gCO2eq/kWh' },
    MY: { carbonIntensity: 774, unit: 'gCO2eq/kWh' },
    SG: { carbonIntensity: 408, unit: 'gCO2eq/kWh' },
    CA: { carbonIntensity: 120, unit: 'gCO2eq/kWh' },
    IN: { carbonIntensity: 708, unit: 'gCO2eq/kWh' },
    CN: { carbonIntensity: 586, unit: 'gCO2eq/kWh' },
    JP: { carbonIntensity: 506, unit: 'gCO2eq/kWh' },
    BR: { carbonIntensity: 96, unit: 'gCO2eq/kWh' },
    SA: { carbonIntensity: 725, unit: 'gCO2eq/kWh' },
    AE: { carbonIntensity: 556, unit: 'gCO2eq/kWh' },
    NO: { carbonIntensity: 28, unit: 'gCO2eq/kWh' },
    SE: { carbonIntensity: 41, unit: 'gCO2eq/kWh' },
  },
  zones: [
    { zone: 'US-CAL-CISO', countryCode: 'US', zoneName: 'California ISO' },
    { zone: 'US-TEX-ERCO', countryCode: 'US', zoneName: 'ERCOT (Texas)' },
    { zone: 'US-NY-NYIS', countryCode: 'US', zoneName: 'New York ISO' },
    { zone: 'US-MISO', countryCode: 'US', zoneName: 'MISO' },
    { zone: 'US-PJM', countryCode: 'US', zoneName: 'PJM Interconnection' },
    { zone: 'GB', countryCode: 'GB', zoneName: 'Great Britain' },
    { zone: 'DE', countryCode: 'DE', zoneName: 'Germany' },
    { zone: 'FR', countryCode: 'FR', zoneName: 'France' },
    { zone: 'AU-NSW', countryCode: 'AU', zoneName: 'New South Wales' },
    { zone: 'AU-VIC', countryCode: 'AU', zoneName: 'Victoria' },
    { zone: 'AU-QLD', countryCode: 'AU', zoneName: 'Queensland' },
    { zone: 'MY-WM', countryCode: 'MY', zoneName: 'Peninsular Malaysia' },
    { zone: 'SG', countryCode: 'SG', zoneName: 'Singapore' },
  ],
  powerBreakdown: {
    nuclear: 0,
    geothermal: 0,
    biomass: 2,
    coal: 20,
    wind: 10,
    solar: 5,
    hydro: 8,
    gas: 40,
    oil: 3,
    unknown: 2,
    'hydro discharge': 0,
    'battery discharge': 0,
  },
}

/**
 * Check if ElectricityMaps API key is configured
 */
export function hasElectricityMapsApiKey() {
  return !!getApiKey(API_KEY_NAME)
}

/**
 * Get authorization headers
 */
function getAuthHeaders() {
  const apiKey = getApiKey(API_KEY_NAME)
  return apiKey ? { 'auth-token': apiKey } : {}
}

/**
 * Get current carbon intensity for a zone
 *
 * @param {string} zone - Zone code (e.g., 'US-CAL-CISO', 'GB', 'DE')
 * @returns {Promise<Object>} Carbon intensity data
 */
export async function getCarbonIntensity(zone) {
  if (!hasElectricityMapsApiKey()) {
    const fallback = FALLBACK_DATA.carbonIntensity[zone] ||
                     FALLBACK_DATA.carbonIntensity[zone.split('-')[0]] ||
                     { carbonIntensity: 400, unit: 'gCO2eq/kWh' }
    return {
      data: {
        ...fallback,
        zone,
        source: 'Electricity Maps (offline estimate)',
        datetime: new Date().toISOString(),
      },
      source: 'fallback',
      error: 'ElectricityMaps API key not configured. Using offline data.',
      requiresKey: true,
    }
  }

  const cacheKey = `em_intensity_${zone}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = buildUrl(`${BASE_URL}/carbon-intensity/latest`, { zone })

  const result = await fetchWithFallback(url, FALLBACK_DATA.carbonIntensity[zone], {
    headers: getAuthHeaders(),
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data.carbonIntensity !== undefined) {
    result.data = {
      zone,
      carbonIntensity: result.data.carbonIntensity,
      unit: 'gCO2eq/kWh',
      fossilFuelPercentage: result.data.fossilFuelPercentage,
      renewablePercentage: result.data.renewablePercentage,
      datetime: result.data.datetime,
      source: 'Electricity Maps API',
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get carbon intensity history for a zone
 *
 * @param {string} zone - Zone code
 * @returns {Promise<Object>} Historical intensity data
 */
export async function getCarbonIntensityHistory(zone) {
  if (!hasElectricityMapsApiKey()) {
    return {
      data: [],
      source: 'fallback',
      error: 'ElectricityMaps API key not configured.',
      requiresKey: true,
    }
  }

  const cacheKey = `em_history_${zone}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = buildUrl(`${BASE_URL}/carbon-intensity/history`, { zone })

  const result = await fetchWithFallback(url, [], {
    headers: getAuthHeaders(),
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data.history) {
    result.data = {
      zone,
      history: result.data.history.map(h => ({
        datetime: h.datetime,
        carbonIntensity: h.carbonIntensity,
      })),
      source: 'Electricity Maps API',
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get power breakdown for a zone
 *
 * @param {string} zone - Zone code
 * @returns {Promise<Object>} Power generation breakdown
 */
export async function getPowerBreakdown(zone) {
  if (!hasElectricityMapsApiKey()) {
    return {
      data: {
        zone,
        powerConsumptionBreakdown: FALLBACK_DATA.powerBreakdown,
        source: 'Electricity Maps (offline estimate)',
      },
      source: 'fallback',
      error: 'ElectricityMaps API key not configured. Using offline data.',
      requiresKey: true,
    }
  }

  const cacheKey = `em_power_${zone}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = buildUrl(`${BASE_URL}/power-breakdown/latest`, { zone })

  const result = await fetchWithFallback(url, FALLBACK_DATA.powerBreakdown, {
    headers: getAuthHeaders(),
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data.powerConsumptionBreakdown) {
    result.data = {
      zone,
      datetime: result.data.datetime,
      powerConsumptionBreakdown: result.data.powerConsumptionBreakdown,
      powerProductionBreakdown: result.data.powerProductionBreakdown,
      powerImportBreakdown: result.data.powerImportBreakdown,
      powerExportBreakdown: result.data.powerExportBreakdown,
      fossilFreePercentage: result.data.fossilFreePercentage,
      renewablePercentage: result.data.renewablePercentage,
      source: 'Electricity Maps API',
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get carbon intensity by coordinates
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Carbon intensity for nearest zone
 */
export async function getCarbonIntensityByLocation(lat, lon) {
  if (!hasElectricityMapsApiKey()) {
    return {
      data: {
        carbonIntensity: 400,
        unit: 'gCO2eq/kWh',
        source: 'Electricity Maps (offline estimate)',
      },
      source: 'fallback',
      error: 'ElectricityMaps API key not configured. Using offline data.',
      requiresKey: true,
    }
  }

  const cacheKey = `em_location_${lat.toFixed(2)}_${lon.toFixed(2)}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = buildUrl(`${BASE_URL}/carbon-intensity/latest`, { lat, lon })

  const result = await fetchWithFallback(url, null, {
    headers: getAuthHeaders(),
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data) {
    result.data = {
      zone: result.data.zone,
      carbonIntensity: result.data.carbonIntensity,
      unit: 'gCO2eq/kWh',
      datetime: result.data.datetime,
      source: 'Electricity Maps API',
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get available zones
 *
 * @returns {Promise<Object>} List of available zones
 */
export async function getZones() {
  if (!hasElectricityMapsApiKey()) {
    return {
      data: FALLBACK_DATA.zones,
      source: 'fallback',
      error: 'ElectricityMaps API key not configured. Using offline zone list.',
      requiresKey: true,
    }
  }

  const cacheKey = 'em_zones'
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = `${BASE_URL}/zones`

  const result = await fetchWithFallback(url, FALLBACK_DATA.zones, {
    headers: getAuthHeaders(),
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data) {
    // Transform zones object to array
    const zones = Object.entries(result.data).map(([zone, data]) => ({
      zone,
      zoneName: data.zoneName,
      countryCode: data.countryCode,
      access: data.access,
    }))
    result.data = zones
    setCachedData(cacheKey, zones, CACHE_TTL * 24) // Cache zones for 24 hours
  }

  return result
}

/**
 * Get marginal carbon intensity (for decisions about when to use power)
 *
 * @param {string} zone - Zone code
 * @returns {Promise<Object>} Marginal carbon intensity
 */
export async function getMarginalIntensity(zone) {
  if (!hasElectricityMapsApiKey()) {
    return {
      data: {
        zone,
        marginalCarbonIntensity: 500,
        unit: 'gCO2eq/kWh',
        source: 'Electricity Maps (offline estimate)',
        note: 'Marginal intensity typically higher than average',
      },
      source: 'fallback',
      error: 'ElectricityMaps API key not configured. Using offline data.',
      requiresKey: true,
    }
  }

  const cacheKey = `em_marginal_${zone}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = buildUrl(`${BASE_URL}/marginal-carbon-intensity/latest`, { zone })

  const result = await fetchWithFallback(url, null, {
    headers: getAuthHeaders(),
    requiresAuth: true,
    apiKeyName: API_KEY_NAME,
  })

  if (result.source === 'api' && result.data.marginalCarbonIntensity !== undefined) {
    result.data = {
      zone,
      marginalCarbonIntensity: result.data.marginalCarbonIntensity,
      unit: 'gCO2eq/kWh',
      datetime: result.data.datetime,
      source: 'Electricity Maps API',
    }
    setCachedData(cacheKey, result.data, CACHE_TTL)
  }

  return result
}

/**
 * Get zone for a country/region code
 */
export function getZoneForCountry(countryCode) {
  // Map country codes to primary zones
  const countryZones = {
    US: 'US-CAL-CISO',
    GB: 'GB',
    DE: 'DE',
    FR: 'FR',
    AU: 'AU-NSW',
    MY: 'MY-WM',
    SG: 'SG',
    CA: 'CA-ON',
    IN: 'IN-NO',
    CN: 'CN-NW',
    JP: 'JP-TK',
    BR: 'BR-S',
    SA: 'SA',
    AE: 'AE',
    NO: 'NO-NO1',
    SE: 'SE-SE1',
  }
  return countryZones[countryCode] || countryCode
}

/**
 * Get fallback intensity for a zone/country
 */
export function getFallbackIntensity(zone) {
  const countryCode = zone.split('-')[0]
  return FALLBACK_DATA.carbonIntensity[zone] ||
         FALLBACK_DATA.carbonIntensity[countryCode] ||
         { carbonIntensity: 400, unit: 'gCO2eq/kWh' }
}

/**
 * Get API key registration URL
 */
export function getApiKeyRegistrationUrl() {
  return 'https://www.electricitymaps.com/free-tier-api'
}

/**
 * Get API key name for settings
 */
export function getApiKeyName() {
  return API_KEY_NAME
}

export default {
  hasElectricityMapsApiKey,
  getCarbonIntensity,
  getCarbonIntensityHistory,
  getPowerBreakdown,
  getCarbonIntensityByLocation,
  getZones,
  getMarginalIntensity,
  getZoneForCountry,
  getFallbackIntensity,
  getApiKeyRegistrationUrl,
  getApiKeyName,
  FALLBACK_DATA,
}
