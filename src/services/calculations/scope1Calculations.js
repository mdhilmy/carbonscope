/**
 * Scope 1 Calculations - Direct Emissions
 * Based on EPA GHG Emission Factors Hub and 40 CFR Part 98
 */

import epaFactors from '../../data/emissionFactors/epaFactors.json'
import gwpValues from '../../data/gwpValues.json'
import fuelProperties from '../../data/fuelProperties.json'

/**
 * Calculate stationary combustion emissions
 * @param {string} fuelType - Type of fuel
 * @param {number} quantity - Amount of fuel consumed
 * @param {string} unit - Unit of measurement
 * @param {string} gwpVersion - GWP version (AR5 or AR6)
 * @returns {Object} Emission results in kg and tonnes CO2e
 */
export function calculateStationaryCombustion(fuelType, quantity, unit, gwpVersion = 'AR5') {
  const factors = epaFactors.stationaryCombustion[fuelType]
  if (!factors) {
    throw new Error(`Unknown fuel type: ${fuelType}`)
  }

  // Convert to MMBtu
  let quantityMMBtu = quantity
  if (unit !== 'MMBtu') {
    quantityMMBtu = convertToMMBtu(quantity, unit, fuelType)
  }

  const gwp = gwpValues[gwpVersion]

  // Calculate individual gas emissions
  const co2_kg = quantityMMBtu * factors.co2
  const ch4_kg = quantityMMBtu * factors.ch4
  const n2o_kg = quantityMMBtu * factors.n2o

  // Calculate CO2 equivalent
  const ch4_co2e = ch4_kg * gwp.CH4_fossil
  const n2o_co2e = n2o_kg * gwp.N2O
  const co2e_kg = co2_kg + ch4_co2e + n2o_co2e

  return {
    co2_kg,
    ch4_kg,
    n2o_kg,
    ch4_co2e_kg: ch4_co2e,
    n2o_co2e_kg: n2o_co2e,
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    quantityMMBtu,
    fuelType,
    methodology: 'EPA GHG Emission Factors Hub 2024',
    gwpVersion,
  }
}

/**
 * Calculate mobile combustion emissions
 * @param {string} vehicleType - Type of vehicle
 * @param {string} fuelType - Type of fuel
 * @param {number} quantity - Fuel consumed
 * @param {string} unit - Unit (gallon, liter)
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Emission results
 */
export function calculateMobileCombustion(vehicleType, fuelType, quantity, unit, gwpVersion = 'AR5') {
  // Map to EPA mobile combustion factors
  const factorKey = getMobileFactorKey(vehicleType, fuelType)
  const factors = epaFactors.mobileCombustion[factorKey]

  if (!factors) {
    throw new Error(`Unknown mobile source: ${vehicleType}/${fuelType}`)
  }

  // Convert to gallons if needed
  let quantityGallons = quantity
  if (unit === 'liter') {
    quantityGallons = quantity / fuelProperties.unitConversions?.gallonToLiter || 3.78541
  } else if (unit === 'barrel') {
    quantityGallons = quantity * 42
  }

  const gwp = gwpValues[gwpVersion]

  const co2_kg = quantityGallons * factors.co2
  const ch4_kg = quantityGallons * factors.ch4
  const n2o_kg = quantityGallons * factors.n2o

  const ch4_co2e = ch4_kg * gwp.CH4_fossil
  const n2o_co2e = n2o_kg * gwp.N2O
  const co2e_kg = co2_kg + ch4_co2e + n2o_co2e

  return {
    co2_kg,
    ch4_kg,
    n2o_kg,
    ch4_co2e_kg: ch4_co2e,
    n2o_co2e_kg: n2o_co2e,
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    quantityGallons,
    vehicleType,
    fuelType,
    methodology: 'EPA Mobile Combustion Factors',
    gwpVersion,
  }
}

/**
 * Aggregate multiple stationary combustion sources
 * @param {Array} sources - Array of fuel source objects
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Aggregated results
 */
export function calculateTotalStationaryCombustion(sources, gwpVersion = 'AR5') {
  let totalCO2 = 0
  let totalCH4 = 0
  let totalN2O = 0
  let totalCO2e = 0
  const breakdown = []

  for (const source of sources) {
    if (!source.fuelType || !source.quantity) continue

    try {
      const result = calculateStationaryCombustion(
        source.fuelType,
        parseFloat(source.quantity),
        source.unit || 'MMBtu',
        gwpVersion
      )

      totalCO2 += result.co2_kg
      totalCH4 += result.ch4_kg
      totalN2O += result.n2o_kg
      totalCO2e += result.co2e_kg

      breakdown.push({
        ...source,
        emissions: result,
      })
    } catch (error) {
      console.warn(`Skipping invalid source: ${error.message}`)
    }
  }

  return {
    total_co2_kg: totalCO2,
    total_ch4_kg: totalCH4,
    total_n2o_kg: totalN2O,
    total_co2e_kg: totalCO2e,
    total_co2e_tonnes: totalCO2e / 1000,
    breakdown,
    sourceCount: breakdown.length,
    gwpVersion,
  }
}

/**
 * Aggregate multiple mobile combustion sources
 * @param {Array} sources - Array of mobile source objects
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Aggregated results
 */
export function calculateTotalMobileCombustion(sources, gwpVersion = 'AR5') {
  let totalCO2 = 0
  let totalCH4 = 0
  let totalN2O = 0
  let totalCO2e = 0
  const breakdown = []

  for (const source of sources) {
    if (!source.vehicleType || !source.quantity) continue

    try {
      const result = calculateMobileCombustion(
        source.vehicleType,
        source.fuelType || 'motorGasoline',
        parseFloat(source.quantity),
        source.unit || 'gallon',
        gwpVersion
      )

      totalCO2 += result.co2_kg
      totalCH4 += result.ch4_kg
      totalN2O += result.n2o_kg
      totalCO2e += result.co2e_kg

      breakdown.push({
        ...source,
        emissions: result,
      })
    } catch (error) {
      console.warn(`Skipping invalid mobile source: ${error.message}`)
    }
  }

  return {
    total_co2_kg: totalCO2,
    total_ch4_kg: totalCH4,
    total_n2o_kg: totalN2O,
    total_co2e_kg: totalCO2e,
    total_co2e_tonnes: totalCO2e / 1000,
    breakdown,
    sourceCount: breakdown.length,
    gwpVersion,
  }
}

/**
 * Convert fuel quantity to MMBtu
 */
function convertToMMBtu(quantity, unit, fuelType) {
  const props = fuelProperties.heatingValues[fuelType]

  if (!props) {
    // Use default conversions
    const defaultHHV = {
      mcf: 1.028,
      gallon: 0.138,
      liter: 0.0365,
      barrel: 5.8,
      therm: 0.1,
    }
    const factor = defaultHHV[unit]
    if (factor) return quantity * factor
    throw new Error(`Cannot convert ${unit} to MMBtu for ${fuelType}`)
  }

  if (unit === props.hhvUnit?.replace('MMBtu/', '')) {
    return quantity * props.hhv
  }

  // Handle common conversions
  switch (unit) {
    case 'mcf':
      return quantity * (props.hhv || 1.028)
    case 'gallon':
      return quantity * (props.hhv || 0.138)
    case 'liter':
      return quantity * (props.hhvPerLiter || props.hhv / 3.78541)
    case 'barrel':
      return quantity * (props.hhvPerBarrel || props.hhv * 42)
    case 'therm':
      return quantity * 0.1
    default:
      throw new Error(`Unknown unit: ${unit}`)
  }
}

/**
 * Map vehicle and fuel type to EPA factor key
 */
function getMobileFactorKey(vehicleType, fuelType) {
  const mappings = {
    PassengerCar: { motorGasoline: 'gasolinePassengerCar', diesel: 'dieselHeavyTruck' },
    LightTruck: { motorGasoline: 'gasolineLightTruck', diesel: 'dieselHeavyTruck' },
    HeavyTruck: { motorGasoline: 'gasolineLightTruck', diesel: 'dieselHeavyTruck' },
    Equipment: { motorGasoline: 'gasolineLightTruck', diesel: 'dieselEquipment' },
  }

  return mappings[vehicleType]?.[fuelType] || `${fuelType}${vehicleType}`
}

export default {
  calculateStationaryCombustion,
  calculateMobileCombustion,
  calculateTotalStationaryCombustion,
  calculateTotalMobileCombustion,
}
