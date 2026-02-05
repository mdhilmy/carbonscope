/**
 * Scope 2 Calculations - Energy Indirect Emissions
 * Based on GHG Protocol Scope 2 Guidance
 */

import globalGridFactors from '../../data/gridFactors/globalGridFactors.json'

/**
 * Calculate Scope 2 emissions using location-based method
 * Uses average grid emission factors for the region
 *
 * @param {number} electricityKWh - Electricity consumption in kWh
 * @param {string} region - Region code (e.g., 'US', 'GB', 'AU')
 * @param {string} subregion - Optional subregion code (e.g., 'ERCT' for Texas)
 * @returns {Object} Emission results
 */
export function calculateLocationBased(electricityKWh, region, subregion = null) {
  const gridData = getGridFactor(region, subregion)

  if (!gridData) {
    throw new Error(`Grid factor not found for region: ${region}${subregion ? '/' + subregion : ''}`)
  }

  // Normalize factor to kg CO2/kWh
  let factor = gridData.factor
  if (gridData.unit === 'tCO2e/MWh' || gridData.unit === 'tCO2/MWh') {
    // tCO2e/MWh is numerically equal to kgCO2e/kWh
    factor = gridData.factor
  } else if (gridData.unit === 'lbCO2/MWh') {
    // Convert lb/MWh to kg/kWh
    factor = gridData.factor * 0.453592 / 1000
  }

  const co2e_kg = electricityKWh * factor
  const co2e_tonnes = co2e_kg / 1000

  return {
    electricityKWh,
    electricityMWh: electricityKWh / 1000,
    gridFactor: factor,
    gridFactorUnit: 'kgCO2e/kWh',
    co2e_kg,
    co2e_tonnes,
    region,
    subregion,
    source: gridData.source || 'Regional database',
    year: gridData.year,
    methodology: 'GHG Protocol Location-Based Method',
  }
}

/**
 * Calculate Scope 2 emissions using market-based method
 * Accounts for RECs, PPAs, and supplier-specific factors
 *
 * @param {number} electricityKWh - Total electricity consumption in kWh
 * @param {number} marketFactor - Market-based emission factor (kg CO2/kWh)
 * @param {Object} options - Optional parameters
 * @returns {Object} Emission results
 */
export function calculateMarketBased(electricityKWh, marketFactor, options = {}) {
  const {
    recMWh = 0,           // Renewable Energy Certificates in MWh
    recFactor = 0,        // Emission factor for REC source (usually 0)
    ppaMWh = 0,           // Power Purchase Agreement in MWh
    ppaFactor = 0,        // Emission factor for PPA source
    residualFactor = null // Residual mix factor (if different from market factor)
  } = options

  // Convert RECs and PPAs to kWh
  const recKWh = recMWh * 1000
  const ppaKWh = ppaMWh * 1000

  // Calculate grid electricity (after subtracting contractual instruments)
  const contractualKWh = recKWh + ppaKWh
  const gridKWh = Math.max(0, electricityKWh - contractualKWh)

  // Use residual factor for grid electricity if provided
  const effectiveGridFactor = residualFactor !== null ? residualFactor : marketFactor

  // Calculate emissions from each source
  const gridEmissions_kg = gridKWh * effectiveGridFactor
  const recEmissions_kg = recKWh * recFactor
  const ppaEmissions_kg = ppaKWh * ppaFactor

  const co2e_kg = gridEmissions_kg + recEmissions_kg + ppaEmissions_kg
  const co2e_tonnes = co2e_kg / 1000

  return {
    electricityKWh,
    gridKWh,
    recMWh,
    ppaMWh,
    contractualKWh,
    marketFactor,
    recFactor,
    ppaFactor,
    gridEmissions_kg,
    recEmissions_kg,
    ppaEmissions_kg,
    co2e_kg,
    co2e_tonnes,
    methodology: 'GHG Protocol Market-Based Method',
    note: 'Includes contractual instruments (RECs, PPAs)',
  }
}

/**
 * Calculate dual Scope 2 reporting (both methods)
 * Required by GHG Protocol Scope 2 Guidance
 *
 * @param {number} electricityKWh - Electricity consumption
 * @param {string} region - Region code
 * @param {string} subregion - Optional subregion
 * @param {Object} marketOptions - Market-based calculation options
 * @returns {Object} Both location and market-based results
 */
export function calculateDualReporting(electricityKWh, region, subregion, marketOptions = {}) {
  const locationBased = calculateLocationBased(electricityKWh, region, subregion)

  // Use location-based factor as default market factor if not provided
  const marketFactor = marketOptions.marketFactor || locationBased.gridFactor
  const marketBased = calculateMarketBased(electricityKWh, marketFactor, marketOptions)

  const reduction = locationBased.co2e_kg - marketBased.co2e_kg
  const reductionPercent = locationBased.co2e_kg > 0
    ? (reduction / locationBased.co2e_kg) * 100
    : 0

  return {
    locationBased,
    marketBased,
    comparison: {
      locationBased_tonnes: locationBased.co2e_tonnes,
      marketBased_tonnes: marketBased.co2e_tonnes,
      reduction_tonnes: reduction / 1000,
      reductionPercent: reductionPercent.toFixed(1),
    },
    methodology: 'GHG Protocol Scope 2 Dual Reporting',
  }
}

/**
 * Calculate emissions from purchased steam
 * @param {number} steamMMBtu - Steam consumption in MMBtu
 * @param {number} emissionFactor - Emission factor (kg CO2/MMBtu)
 * @returns {Object} Emission results
 */
export function calculatePurchasedSteam(steamMMBtu, emissionFactor = 66.33) {
  // Default factor based on natural gas boiler at 80% efficiency
  const co2e_kg = steamMMBtu * emissionFactor

  return {
    steamMMBtu,
    emissionFactor,
    emissionFactorUnit: 'kgCO2/MMBtu',
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    methodology: 'Purchased Steam Emissions',
  }
}

/**
 * Calculate emissions from purchased heating/cooling
 * @param {number} energyMMBtu - Energy consumption in MMBtu
 * @param {string} type - 'heating' or 'cooling'
 * @param {number} emissionFactor - Optional custom factor
 * @returns {Object} Emission results
 */
export function calculatePurchasedHeatingCooling(energyMMBtu, type = 'heating', emissionFactor = null) {
  // Default factors
  const defaultFactors = {
    heating: 66.33, // kg CO2/MMBtu (natural gas based)
    cooling: 55.0,  // kg CO2/MMBtu (electricity-based chiller)
  }

  const factor = emissionFactor || defaultFactors[type] || defaultFactors.heating
  const co2e_kg = energyMMBtu * factor

  return {
    energyMMBtu,
    type,
    emissionFactor: factor,
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    methodology: `Purchased ${type.charAt(0).toUpperCase() + type.slice(1)} Emissions`,
  }
}

/**
 * Get grid emission factor for a region
 * @param {string} region - Region code
 * @param {string} subregion - Optional subregion code
 * @returns {Object|null} Grid factor data or null
 */
export function getGridFactor(region, subregion = null) {
  const regionData = globalGridFactors[region]

  if (!regionData) {
    return null
  }

  // Check for subregion
  if (subregion) {
    if (regionData.subregions?.[subregion]) {
      return regionData.subregions[subregion]
    }
    if (regionData.states?.[subregion]) {
      return regionData.states[subregion]
    }
    if (regionData.provinces?.[subregion]) {
      return regionData.provinces[subregion]
    }
    // If subregion not found, check if it matches a direct property
    if (regionData[subregion]) {
      return regionData[subregion]
    }
  }

  // Return national/default factor
  if (regionData.factor !== undefined) {
    return regionData
  }

  if (regionData.national) {
    return regionData.national
  }

  return null
}

/**
 * Get all available regions with their subregions
 * @returns {Array} List of regions with subregions
 */
export function getAvailableRegions() {
  const regions = []

  for (const [code, data] of Object.entries(globalGridFactors)) {
    if (code === 'metadata') continue

    const region = {
      code,
      name: getRegionName(code),
      hasSubregions: !!(data.subregions || data.states || data.provinces),
      subregions: [],
    }

    // Add subregions
    const subregionData = data.subregions || data.states || data.provinces
    if (subregionData) {
      region.subregions = Object.entries(subregionData).map(([subCode, subData]) => ({
        code: subCode,
        name: subData.name || subCode,
        factor: subData.factor,
      }))
    }

    regions.push(region)
  }

  return regions.sort((a, b) => a.name.localeCompare(b.name))
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

export default {
  calculateLocationBased,
  calculateMarketBased,
  calculateDualReporting,
  calculatePurchasedSteam,
  calculatePurchasedHeatingCooling,
  getGridFactor,
  getAvailableRegions,
}
