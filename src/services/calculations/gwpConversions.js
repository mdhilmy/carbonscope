/**
 * GWP Conversions and CO2e Calculations
 * Based on IPCC Assessment Reports
 */

import gwpValues from '../../data/gwpValues.json'

/**
 * Convert greenhouse gas emissions to CO2 equivalent
 *
 * @param {number} amount - Amount of the gas in kg or tonnes
 * @param {string} gasType - Type of gas (CO2, CH4_fossil, CH4_non_fossil, N2O, etc.)
 * @param {string} gwpVersion - GWP version (AR5, AR6, AR4)
 * @param {string} inputUnit - Unit of input ('kg' or 'tonnes')
 * @returns {Object} CO2e values in both kg and tonnes
 */
export function convertToCO2e(amount, gasType, gwpVersion = 'AR5', inputUnit = 'kg') {
  const gwp = gwpValues[gwpVersion]

  if (!gwp) {
    throw new Error(`Unknown GWP version: ${gwpVersion}. Available: AR5, AR6, AR4`)
  }

  const gwpValue = gwp[gasType]

  if (gwpValue === undefined) {
    throw new Error(`Unknown gas type: ${gasType}. Available: ${Object.keys(gwp).filter(k => typeof gwp[k] === 'number').join(', ')}`)
  }

  // Normalize to kg
  const amount_kg = inputUnit === 'tonnes' ? amount * 1000 : amount

  const co2e_kg = amount_kg * gwpValue
  const co2e_tonnes = co2e_kg / 1000

  return {
    originalAmount: amount,
    originalUnit: inputUnit,
    gasType,
    gwpValue,
    gwpVersion,
    co2e_kg,
    co2e_tonnes,
  }
}

/**
 * Calculate total CO2e from multiple gases
 *
 * @param {Object} emissions - Object with gas amounts {CO2: x, CH4: y, N2O: z}
 * @param {string} gwpVersion - GWP version
 * @param {string} inputUnit - Unit of input values
 * @returns {Object} Total CO2e and breakdown
 */
export function calculateTotalCO2e(emissions, gwpVersion = 'AR5', inputUnit = 'kg') {
  const gwp = gwpValues[gwpVersion]

  if (!gwp) {
    throw new Error(`Unknown GWP version: ${gwpVersion}`)
  }

  const breakdown = {}
  let total_co2e_kg = 0

  for (const [gasType, amount] of Object.entries(emissions)) {
    if (amount === 0 || amount === undefined) continue

    // Map common names to GWP keys
    const gwpKey = mapGasTypeToGWPKey(gasType)
    const gwpValue = gwp[gwpKey]

    if (gwpValue === undefined) {
      console.warn(`Unknown gas type: ${gasType}, skipping`)
      continue
    }

    const amount_kg = inputUnit === 'tonnes' ? amount * 1000 : amount
    const co2e_kg = amount_kg * gwpValue

    breakdown[gasType] = {
      amount_kg,
      gwpValue,
      co2e_kg,
      co2e_tonnes: co2e_kg / 1000,
    }

    total_co2e_kg += co2e_kg
  }

  return {
    total_co2e_kg,
    total_co2e_tonnes: total_co2e_kg / 1000,
    breakdown,
    gwpVersion,
    source: gwp.source,
    timeHorizon: gwp.timeHorizon,
  }
}

/**
 * Get GWP value for a specific gas
 *
 * @param {string} gasType - Type of gas
 * @param {string} gwpVersion - GWP version
 * @returns {number} GWP value
 */
export function getGWP(gasType, gwpVersion = 'AR5') {
  const gwp = gwpValues[gwpVersion]

  if (!gwp) {
    throw new Error(`Unknown GWP version: ${gwpVersion}`)
  }

  const gwpKey = mapGasTypeToGWPKey(gasType)
  const value = gwp[gwpKey]

  if (value === undefined) {
    throw new Error(`Unknown gas type: ${gasType}`)
  }

  return value
}

/**
 * Compare CO2e results between AR5 and AR6
 *
 * @param {Object} emissions - Gas emissions object
 * @param {string} inputUnit - Unit of input values
 * @returns {Object} Comparison results
 */
export function compareGWPVersions(emissions, inputUnit = 'kg') {
  const ar5 = calculateTotalCO2e(emissions, 'AR5', inputUnit)
  const ar6 = calculateTotalCO2e(emissions, 'AR6', inputUnit)

  const difference_kg = ar6.total_co2e_kg - ar5.total_co2e_kg
  const differencePercent = ar5.total_co2e_kg > 0
    ? (difference_kg / ar5.total_co2e_kg) * 100
    : 0

  return {
    AR5: ar5,
    AR6: ar6,
    comparison: {
      ar5_tonnes: ar5.total_co2e_tonnes,
      ar6_tonnes: ar6.total_co2e_tonnes,
      difference_tonnes: difference_kg / 1000,
      differencePercent: differencePercent.toFixed(2),
      note: differencePercent > 0
        ? 'AR6 values are higher'
        : 'AR5 values are higher',
    },
  }
}

/**
 * Get available GWP versions
 * @returns {Array} Available versions with metadata
 */
export function getGWPVersions() {
  return Object.entries(gwpValues).map(([version, data]) => ({
    version,
    source: data.source,
    timeHorizon: data.timeHorizon,
    isDefault: data.default || false,
    description: data.description,
    deprecated: data.deprecated || false,
  }))
}

/**
 * Get all GWP values for a version
 * @param {string} version - GWP version
 * @returns {Object} All GWP values
 */
export function getGWPTable(version = 'AR5') {
  const gwp = gwpValues[version]

  if (!gwp) {
    throw new Error(`Unknown GWP version: ${version}`)
  }

  const gases = []

  for (const [key, value] of Object.entries(gwp)) {
    if (typeof value === 'number') {
      gases.push({
        gasType: key,
        gwp: value,
        label: formatGasLabel(key),
      })
    }
  }

  return {
    version,
    source: gwp.source,
    timeHorizon: gwp.timeHorizon,
    gases: gases.sort((a, b) => b.gwp - a.gwp),
  }
}

/**
 * Map common gas names to GWP keys
 */
function mapGasTypeToGWPKey(gasType) {
  const mappings = {
    'CO2': 'CO2',
    'co2': 'CO2',
    'carbon dioxide': 'CO2',
    'CH4': 'CH4_fossil',
    'ch4': 'CH4_fossil',
    'methane': 'CH4_fossil',
    'CH4_fossil': 'CH4_fossil',
    'CH4_biogenic': 'CH4_non_fossil',
    'CH4_non_fossil': 'CH4_non_fossil',
    'N2O': 'N2O',
    'n2o': 'N2O',
    'nitrous oxide': 'N2O',
    'SF6': 'SF6',
    'sf6': 'SF6',
    'sulfur hexafluoride': 'SF6',
  }

  return mappings[gasType] || gasType
}

/**
 * Format gas type for display
 */
function formatGasLabel(key) {
  const labels = {
    'CO2': 'Carbon Dioxide (CO₂)',
    'CH4_fossil': 'Methane - Fossil (CH₄)',
    'CH4_non_fossil': 'Methane - Biogenic (CH₄)',
    'N2O': 'Nitrous Oxide (N₂O)',
    'SF6': 'Sulfur Hexafluoride (SF₆)',
    'NF3': 'Nitrogen Trifluoride (NF₃)',
    'HFC_23': 'HFC-23',
    'HFC_32': 'HFC-32',
    'HFC_125': 'HFC-125',
    'HFC_134a': 'HFC-134a',
    'HFC_143a': 'HFC-143a',
    'HFC_152a': 'HFC-152a',
    'HFC_227ea': 'HFC-227ea',
    'HFC_245fa': 'HFC-245fa',
    'PFC_14': 'PFC-14 (CF₄)',
    'PFC_116': 'PFC-116 (C₂F₆)',
  }

  return labels[key] || key
}

export default {
  convertToCO2e,
  calculateTotalCO2e,
  getGWP,
  compareGWPVersions,
  getGWPVersions,
  getGWPTable,
}
