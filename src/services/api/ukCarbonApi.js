/**
 * UK Carbon Intensity API Client
 * Real-time and forecast carbon intensity data for UK grid
 * No authentication required
 *
 * API Documentation: https://carbonintensity.org.uk/
 */

import { fetchWithFallback, getCachedData, setCachedData } from './apiClient'

const BASE_URL = 'https://api.carbonintensity.org.uk'

// Cache TTL: 30 minutes for current data, 1 hour for historical
const CURRENT_CACHE_TTL = 1800000
const HISTORICAL_CACHE_TTL = 3600000

/**
 * Fallback data for when API is unavailable
 */
const FALLBACK_DATA = {
  currentIntensity: {
    forecast: 225,
    actual: null,
    index: 'moderate',
    unit: 'gCO2/kWh',
    source: 'UK National Grid (offline estimate)',
    timestamp: new Date().toISOString(),
  },
  generationMix: [
    { fuel: 'gas', perc: 35.0 },
    { fuel: 'nuclear', perc: 15.0 },
    { fuel: 'wind', perc: 25.0 },
    { fuel: 'solar', perc: 5.0 },
    { fuel: 'hydro', perc: 2.0 },
    { fuel: 'imports', perc: 8.0 },
    { fuel: 'biomass', perc: 5.0 },
    { fuel: 'coal', perc: 2.0 },
    { fuel: 'other', perc: 3.0 },
  ],
  intensityFactors: {
    gas: 394,
    coal: 937,
    biomass: 120,
    nuclear: 0,
    wind: 0,
    solar: 0,
    hydro: 0,
    imports: 200,
    other: 300,
  },
  regions: [
    { id: 1, shortname: 'North Scotland' },
    { id: 2, shortname: 'South Scotland' },
    { id: 3, shortname: 'North West England' },
    { id: 4, shortname: 'North East England' },
    { id: 5, shortname: 'Yorkshire' },
    { id: 6, shortname: 'North Wales & Merseyside' },
    { id: 7, shortname: 'South Wales' },
    { id: 8, shortname: 'West Midlands' },
    { id: 9, shortname: 'East Midlands' },
    { id: 10, shortname: 'East England' },
    { id: 11, shortname: 'South West England' },
    { id: 12, shortname: 'South England' },
    { id: 13, shortname: 'London' },
    { id: 14, shortname: 'South East England' },
  ],
}

/**
 * Get current carbon intensity for UK national grid
 *
 * @returns {Promise<Object>} Current intensity data
 */
export async function getCurrentIntensity() {
  const cacheKey = 'uk_intensity_current'
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = `${BASE_URL}/intensity`

  const result = await fetchWithFallback(url, FALLBACK_DATA.currentIntensity)

  if (result.source === 'api' && result.data.data?.[0]) {
    const intensity = result.data.data[0].intensity
    result.data = {
      forecast: intensity.forecast,
      actual: intensity.actual,
      index: intensity.index,
      unit: 'gCO2/kWh',
      source: 'UK National Grid Carbon Intensity API',
      timestamp: result.data.data[0].from,
    }
    setCachedData(cacheKey, result.data, CURRENT_CACHE_TTL)
  }

  return result
}

/**
 * Get carbon intensity forecast for next 24/48 hours
 *
 * @param {number} hours - Hours ahead to forecast (24 or 48)
 * @returns {Promise<Object>} Forecast data
 */
export async function getIntensityForecast(hours = 24) {
  const cacheKey = `uk_forecast_${hours}h`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = `${BASE_URL}/intensity/${new Date().toISOString()}/fw${hours}h`

  const result = await fetchWithFallback(url, [])

  if (result.source === 'api' && result.data.data) {
    result.data = result.data.data.map(period => ({
      from: period.from,
      to: period.to,
      forecast: period.intensity.forecast,
      index: period.intensity.index,
    }))

    // Find optimal time (lowest intensity)
    const sortedByIntensity = [...result.data].sort((a, b) => a.forecast - b.forecast)
    result.optimal = sortedByIntensity[0]
    result.worst = sortedByIntensity[sortedByIntensity.length - 1]

    setCachedData(cacheKey, result, CURRENT_CACHE_TTL)
  }

  return result
}

/**
 * Get current generation mix
 *
 * @returns {Promise<Object>} Generation mix data
 */
export async function getGenerationMix() {
  const cacheKey = 'uk_generation_mix'
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = `${BASE_URL}/generation`

  const result = await fetchWithFallback(url, { generationmix: FALLBACK_DATA.generationMix })

  if (result.source === 'api' && result.data.data) {
    result.data = {
      mix: result.data.data.generationmix,
      from: result.data.data.from,
      to: result.data.data.to,
    }

    // Calculate renewable percentage
    const renewables = ['wind', 'solar', 'hydro']
    const lowCarbon = [...renewables, 'nuclear']

    result.data.renewablePercent = result.data.mix
      .filter(g => renewables.includes(g.fuel))
      .reduce((sum, g) => sum + g.perc, 0)

    result.data.lowCarbonPercent = result.data.mix
      .filter(g => lowCarbon.includes(g.fuel))
      .reduce((sum, g) => sum + g.perc, 0)

    setCachedData(cacheKey, result.data, CURRENT_CACHE_TTL)
  }

  return result
}

/**
 * Get carbon intensity for a specific UK region
 *
 * @param {number} regionId - Region ID (1-14)
 * @returns {Promise<Object>} Regional intensity data
 */
export async function getRegionalIntensity(regionId) {
  if (regionId < 1 || regionId > 14) {
    return {
      data: FALLBACK_DATA.currentIntensity,
      source: 'fallback',
      error: 'Invalid region ID. Must be 1-14.',
    }
  }

  const cacheKey = `uk_region_${regionId}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = `${BASE_URL}/regional/regionid/${regionId}`

  const result = await fetchWithFallback(url, FALLBACK_DATA.currentIntensity)

  if (result.source === 'api' && result.data.data?.[0]) {
    const region = result.data.data[0]
    result.data = {
      regionId,
      shortname: region.shortname,
      forecast: region.data?.[0]?.intensity?.forecast,
      index: region.data?.[0]?.intensity?.index,
      generationMix: region.data?.[0]?.generationmix,
      source: 'UK National Grid Carbon Intensity API',
    }
    setCachedData(cacheKey, result.data, CURRENT_CACHE_TTL)
  }

  return result
}

/**
 * Get intensity for a specific postcode
 *
 * @param {string} postcode - UK postcode (e.g., 'SW1A 1AA')
 * @returns {Promise<Object>} Postcode-specific intensity
 */
export async function getIntensityByPostcode(postcode) {
  // Format postcode (remove spaces, uppercase)
  const formattedPostcode = postcode.replace(/\s/g, '').toUpperCase()

  const cacheKey = `uk_postcode_${formattedPostcode}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = `${BASE_URL}/regional/postcode/${formattedPostcode}`

  const result = await fetchWithFallback(url, FALLBACK_DATA.currentIntensity)

  if (result.source === 'api' && result.data.data?.[0]) {
    const data = result.data.data[0]
    result.data = {
      postcode: formattedPostcode,
      regionId: data.regionid,
      shortname: data.shortname,
      forecast: data.data?.[0]?.intensity?.forecast,
      index: data.data?.[0]?.intensity?.index,
      generationMix: data.data?.[0]?.generationmix,
      source: 'UK National Grid Carbon Intensity API',
    }
    setCachedData(cacheKey, result.data, CURRENT_CACHE_TTL)
  }

  return result
}

/**
 * Get historical intensity for a date range
 *
 * @param {string} fromDate - Start date (ISO format)
 * @param {string} toDate - End date (ISO format)
 * @returns {Promise<Object>} Historical data
 */
export async function getHistoricalIntensity(fromDate, toDate) {
  const cacheKey = `uk_historical_${fromDate}_${toDate}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = `${BASE_URL}/intensity/${fromDate}/${toDate}`

  const result = await fetchWithFallback(url, [])

  if (result.source === 'api' && result.data.data) {
    result.data = result.data.data.map(period => ({
      from: period.from,
      to: period.to,
      forecast: period.intensity.forecast,
      actual: period.intensity.actual,
      index: period.intensity.index,
    }))

    // Calculate statistics
    const actuals = result.data.filter(d => d.actual).map(d => d.actual)
    if (actuals.length > 0) {
      result.statistics = {
        average: actuals.reduce((a, b) => a + b, 0) / actuals.length,
        min: Math.min(...actuals),
        max: Math.max(...actuals),
        count: actuals.length,
      }
    }

    setCachedData(cacheKey, result, HISTORICAL_CACHE_TTL)
  }

  return result
}

/**
 * Get intensity statistics for a specific date
 *
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Daily statistics
 */
export async function getDailyStats(date) {
  const cacheKey = `uk_daily_${date}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const url = `${BASE_URL}/intensity/stats/${date}`

  const result = await fetchWithFallback(url, null)

  if (result.source === 'api' && result.data.data) {
    result.data = {
      date,
      max: result.data.data.max,
      average: result.data.data.average,
      min: result.data.data.min,
      index: result.data.data.index,
    }
    setCachedData(cacheKey, result.data, HISTORICAL_CACHE_TTL)
  }

  return result
}

/**
 * Get all UK regions
 */
export function getRegions() {
  return FALLBACK_DATA.regions
}

/**
 * Get carbon intensity factors by fuel type
 */
export function getIntensityFactors() {
  return FALLBACK_DATA.intensityFactors
}

/**
 * Convert intensity index to description
 */
export function getIndexDescription(index) {
  const descriptions = {
    'very low': 'Excellent - Grid is very clean',
    'low': 'Good - Low carbon generation',
    'moderate': 'Average - Normal operations',
    'high': 'Poor - Consider reducing usage',
    'very high': 'Bad - High carbon intensity',
  }
  return descriptions[index?.toLowerCase()] || 'Unknown'
}

/**
 * Get color for intensity index
 */
export function getIndexColor(index) {
  const colors = {
    'very low': '#22c55e', // green-500
    'low': '#84cc16', // lime-500
    'moderate': '#eab308', // yellow-500
    'high': '#f97316', // orange-500
    'very high': '#ef4444', // red-500
  }
  return colors[index?.toLowerCase()] || '#6b7280' // gray-500
}

export default {
  getCurrentIntensity,
  getIntensityForecast,
  getGenerationMix,
  getRegionalIntensity,
  getIntensityByPostcode,
  getHistoricalIntensity,
  getDailyStats,
  getRegions,
  getIntensityFactors,
  getIndexDescription,
  getIndexColor,
  FALLBACK_DATA,
}
