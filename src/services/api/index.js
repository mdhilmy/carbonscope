/**
 * API Services Index
 * Central export for all API clients
 */

// Base client utilities
export {
  fetchWithFallback,
  getApiKey,
  saveApiKey,
  clearApiKey,
  hasApiKey,
  getConfiguredApiKeys,
  getCachedData,
  setCachedData,
  clearCache,
  buildUrl,
  API_ERRORS,
} from './apiClient'

// EPA Envirofacts API (no auth required)
export {
  getFacilityEmissionsByState,
  getEmissionsByNaics,
  getOilGasBenchmarks,
  searchFacility,
  getFacilityTrends,
  getSubpartWData,
  getNaicsDescription,
  getOilGasNaicsCodes,
} from './epaApi'

// UK Carbon Intensity API (no auth required)
export {
  getCurrentIntensity as getUkCurrentIntensity,
  getIntensityForecast as getUkIntensityForecast,
  getGenerationMix as getUkGenerationMix,
  getRegionalIntensity as getUkRegionalIntensity,
  getIntensityByPostcode as getUkIntensityByPostcode,
  getHistoricalIntensity as getUkHistoricalIntensity,
  getDailyStats as getUkDailyStats,
  getRegions as getUkRegions,
  getIntensityFactors as getUkIntensityFactors,
  getIndexDescription,
  getIndexColor,
} from './ukCarbonApi'

// EIA API (requires key)
export {
  hasEiaApiKey,
  getCrudePrices,
  getNaturalGasPrices,
  getCrudeProduction,
  getNaturalGasProduction,
  getStateEmissions,
  getElectricityGeneration,
  getEmissionFactors as getEiaEmissionFactors,
  searchDatasets as searchEiaDatasets,
  getApiKeyRegistrationUrl as getEiaApiKeyUrl,
  getApiKeyName as getEiaApiKeyName,
} from './eiaApi'

// Electricity Maps API (requires key)
export {
  hasElectricityMapsApiKey,
  getCarbonIntensity,
  getCarbonIntensityHistory,
  getPowerBreakdown,
  getCarbonIntensityByLocation,
  getZones as getElectricityMapsZones,
  getMarginalIntensity,
  getZoneForCountry,
  getFallbackIntensity,
  getApiKeyRegistrationUrl as getElectricityMapsApiKeyUrl,
  getApiKeyName as getElectricityMapsApiKeyName,
} from './electricityMapsApi'

// Import default exports for convenience
import apiClient from './apiClient'
import epaApi from './epaApi'
import ukCarbonApi from './ukCarbonApi'
import eiaApi from './eiaApi'
import electricityMapsApi from './electricityMapsApi'

/**
 * API Configuration for Settings page
 */
export const API_CONFIG = {
  // APIs that don't require authentication
  free: [
    {
      id: 'epa',
      name: 'EPA Envirofacts',
      description: 'US EPA facility emissions and benchmarking data',
      requiresKey: false,
      docsUrl: 'https://www.epa.gov/enviro/envirofacts-data-service-api',
    },
    {
      id: 'ukCarbon',
      name: 'UK Carbon Intensity',
      description: 'Real-time carbon intensity for UK electricity grid',
      requiresKey: false,
      docsUrl: 'https://carbonintensity.org.uk/',
    },
  ],
  // APIs that require free registration
  requiresKey: [
    {
      id: 'eia',
      name: 'EIA (Energy Information Administration)',
      description: 'US energy prices, production, and emissions data',
      keyName: 'eia',
      registerUrl: 'https://www.eia.gov/opendata/register.php',
      docsUrl: 'https://www.eia.gov/opendata/documentation.php',
      hasKey: () => eiaApi.hasEiaApiKey(),
    },
    {
      id: 'electricityMaps',
      name: 'Electricity Maps',
      description: 'Global real-time carbon intensity data',
      keyName: 'electricityMaps',
      registerUrl: 'https://www.electricitymaps.com/free-tier-api',
      docsUrl: 'https://static.electricitymaps.com/api/docs/index.html',
      hasKey: () => electricityMapsApi.hasElectricityMapsApiKey(),
      rateLimit: '25 requests/hour, 100 requests/day',
    },
  ],
}

/**
 * Check status of all APIs
 */
export async function checkApiStatus() {
  const status = {
    epa: { available: false, source: 'unknown' },
    ukCarbon: { available: false, source: 'unknown' },
    eia: { available: false, configured: false, source: 'unknown' },
    electricityMaps: { available: false, configured: false, source: 'unknown' },
  }

  // Check EPA (no auth)
  try {
    const epaResult = await epaApi.getOilGasBenchmarks('extraction')
    status.epa.available = true
    status.epa.source = epaResult.source
  } catch {
    status.epa.available = false
  }

  // Check UK Carbon (no auth)
  try {
    const ukResult = await ukCarbonApi.getCurrentIntensity()
    status.ukCarbon.available = true
    status.ukCarbon.source = ukResult.source
  } catch {
    status.ukCarbon.available = false
  }

  // Check EIA (requires key)
  status.eia.configured = eiaApi.hasEiaApiKey()
  if (status.eia.configured) {
    try {
      const eiaResult = await eiaApi.getCrudePrices()
      status.eia.available = eiaResult.source === 'api'
      status.eia.source = eiaResult.source
    } catch {
      status.eia.available = false
    }
  }

  // Check Electricity Maps (requires key)
  status.electricityMaps.configured = electricityMapsApi.hasElectricityMapsApiKey()
  if (status.electricityMaps.configured) {
    try {
      const emResult = await electricityMapsApi.getCarbonIntensity('US')
      status.electricityMaps.available = emResult.source === 'api'
      status.electricityMaps.source = emResult.source
    } catch {
      status.electricityMaps.available = false
    }
  }

  return status
}

export default {
  apiClient,
  epaApi,
  ukCarbonApi,
  eiaApi,
  electricityMapsApi,
  API_CONFIG,
  checkApiStatus,
}
