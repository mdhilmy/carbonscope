/**
 * Scope 3 Calculations - Value Chain Emissions
 * Based on GHG Protocol Scope 3 Standard
 */

import gwpValues from '../../data/gwpValues.json'

/**
 * Combustion factors for sold products (kg CO2/unit)
 * Category 11: Use of Sold Products
 */
const COMBUSTION_FACTORS = {
  motorGasoline: { factor: 8.887, unit: 'gallon', kgPerLiter: 2.348 },
  diesel: { factor: 10.180, unit: 'gallon', kgPerLiter: 2.689 },
  jetFuel: { factor: 9.57, unit: 'gallon', kgPerLiter: 2.53 },
  kerosene: { factor: 9.57, unit: 'gallon', kgPerLiter: 2.53 },
  lpg: { factor: 5.68, unit: 'gallon', kgPerLiter: 1.50 },
  residualFuelOil: { factor: 11.27, unit: 'gallon', kgPerLiter: 2.98 },
  naturalGas: { factor: 53.06, unit: 'MMBtu', kgPerMJ: 0.0503 },
  crudeOil: { factor: 430, unit: 'barrel', kgPerGallon: 10.24 },
  propane: { factor: 5.72, unit: 'gallon', kgPerLiter: 1.51 },
  butane: { factor: 6.67, unit: 'gallon', kgPerLiter: 1.76 },
}

/**
 * Calculate Category 11 - Use of Sold Products
 * This is typically the largest Scope 3 category for O&G (70-90%)
 *
 * @param {Array} soldProducts - Array of {productType, quantity, unit}
 * @param {string} gwpVersion - GWP version (not typically needed for combustion CO2)
 * @returns {Object} Emission results
 */
export function calculateCategory11(soldProducts, gwpVersion = 'AR5') {
  let totalCO2_kg = 0
  const breakdown = {}

  for (const product of soldProducts) {
    const { productType, quantity, unit } = product
    const factor = COMBUSTION_FACTORS[productType]

    if (!factor) {
      console.warn(`Unknown product type: ${productType}`)
      continue
    }

    let co2_kg

    if (unit === factor.unit) {
      co2_kg = quantity * factor.factor
    } else if (unit === 'liter' && factor.kgPerLiter) {
      co2_kg = quantity * factor.kgPerLiter
    } else if (unit === 'gallon' && factor.kgPerGallon) {
      co2_kg = quantity * factor.kgPerGallon
    } else if (unit === 'barrel' && productType !== 'crudeOil') {
      // Convert barrels to gallons (1 barrel = 42 gallons)
      co2_kg = quantity * 42 * factor.factor
    } else if (unit === 'MJ' && factor.kgPerMJ) {
      co2_kg = quantity * factor.kgPerMJ
    } else if (unit === 'mcf' && productType === 'naturalGas') {
      // Convert MCF to MMBtu (1 MCF ≈ 1.028 MMBtu)
      co2_kg = quantity * 1.028 * factor.factor
    } else {
      console.warn(`Cannot convert ${unit} for ${productType}`)
      continue
    }

    totalCO2_kg += co2_kg

    if (!breakdown[productType]) {
      breakdown[productType] = {
        quantity: 0,
        unit,
        co2_kg: 0,
      }
    }
    breakdown[productType].quantity += quantity
    breakdown[productType].co2_kg += co2_kg
    breakdown[productType].co2_tonnes = breakdown[productType].co2_kg / 1000
  }

  return {
    category: 11,
    categoryName: 'Use of Sold Products',
    co2_kg: totalCO2_kg,
    co2_tonnes: totalCO2_kg / 1000,
    breakdown,
    productCount: Object.keys(breakdown).length,
    methodology: 'GHG Protocol Scope 3 Category 11 - End-use Combustion',
    note: 'Represents emissions from customer combustion of sold petroleum products',
  }
}

/**
 * Calculate Category 3 - Fuel and Energy Related Activities
 * Upstream emissions from purchased fuels and T&D losses
 *
 * @param {Array} purchasedEnergy - Array of {energyType, quantity, unit}
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Emission results
 */
export function calculateCategory3(purchasedEnergy, gwpVersion = 'AR5') {
  // Upstream emission factors (well-to-tank/gate)
  const upstreamFactors = {
    naturalGas: { factor: 8.5, unit: 'MMBtu', description: 'Well-to-gate' },
    electricity: { factor: 0.05, unit: 'kWh', description: 'T&D losses' },
    diesel: { factor: 15.2, unit: 'gallon', description: 'Well-to-tank' },
    gasoline: { factor: 14.5, unit: 'gallon', description: 'Well-to-tank' },
    coal: { factor: 12.0, unit: 'short ton', description: 'Mining & transport' },
  }

  let totalCO2e_kg = 0
  const breakdown = {}

  for (const energy of purchasedEnergy) {
    const { energyType, quantity, unit } = energy
    const factor = upstreamFactors[energyType]

    if (!factor) {
      console.warn(`Unknown energy type for Category 3: ${energyType}`)
      continue
    }

    // Basic conversion (should match units)
    const co2e_kg = quantity * factor.factor

    totalCO2e_kg += co2e_kg
    breakdown[energyType] = {
      quantity,
      unit,
      factor: factor.factor,
      co2e_kg,
      co2e_tonnes: co2e_kg / 1000,
    }
  }

  return {
    category: 3,
    categoryName: 'Fuel and Energy Related Activities',
    co2e_kg: totalCO2e_kg,
    co2e_tonnes: totalCO2e_kg / 1000,
    breakdown,
    methodology: 'GHG Protocol Scope 3 Category 3',
  }
}

/**
 * Calculate Category 4 - Upstream Transportation and Distribution
 *
 * @param {Array} transportation - Array of {mode, tonnes, distanceKm}
 * @returns {Object} Emission results
 */
export function calculateCategory4(transportation) {
  // Transport emission factors (kg CO2e/tonne-km)
  const transportFactors = {
    truck: 0.107,
    rail: 0.028,
    ship: 0.016,
    barge: 0.020,
    pipeline: 0.005,
    air: 0.602,
  }

  let totalCO2e_kg = 0
  const breakdown = []

  for (const transport of transportation) {
    const { mode, tonnes, distanceKm } = transport
    const factor = transportFactors[mode]

    if (!factor) {
      console.warn(`Unknown transport mode: ${mode}`)
      continue
    }

    const co2e_kg = tonnes * distanceKm * factor

    totalCO2e_kg += co2e_kg
    breakdown.push({
      mode,
      tonnes,
      distanceKm,
      tonneKm: tonnes * distanceKm,
      factor,
      co2e_kg,
    })
  }

  return {
    category: 4,
    categoryName: 'Upstream Transportation and Distribution',
    co2e_kg: totalCO2e_kg,
    co2e_tonnes: totalCO2e_kg / 1000,
    breakdown,
    methodology: 'GHG Protocol Scope 3 Category 4',
  }
}

/**
 * Calculate Category 9 - Downstream Transportation and Distribution
 * Similar to Category 4 but for outbound logistics
 *
 * @param {Array} transportation - Array of {mode, tonnes, distanceKm}
 * @returns {Object} Emission results
 */
export function calculateCategory9(transportation) {
  const result = calculateCategory4(transportation)
  return {
    ...result,
    category: 9,
    categoryName: 'Downstream Transportation and Distribution',
  }
}

/**
 * Calculate Category 10 - Processing of Sold Products
 *
 * @param {Array} products - Array of {productType, quantity, processingEmissionFactor}
 * @returns {Object} Emission results
 */
export function calculateCategory10(products) {
  // Default processing emission factors (kg CO2e per unit processed)
  const processingFactors = {
    crudeOil: { factor: 45, unit: 'barrel', description: 'Refining' },
    naturalGas: { factor: 5, unit: 'mcf', description: 'Processing' },
    ngl: { factor: 25, unit: 'barrel', description: 'Fractionation' },
  }

  let totalCO2e_kg = 0
  const breakdown = []

  for (const product of products) {
    const { productType, quantity, processingEmissionFactor } = product
    const defaultFactor = processingFactors[productType]

    const factor = processingEmissionFactor || defaultFactor?.factor || 0
    const co2e_kg = quantity * factor

    totalCO2e_kg += co2e_kg
    breakdown.push({
      productType,
      quantity,
      factor,
      co2e_kg,
    })
  }

  return {
    category: 10,
    categoryName: 'Processing of Sold Products',
    co2e_kg: totalCO2e_kg,
    co2e_tonnes: totalCO2e_kg / 1000,
    breakdown,
    methodology: 'GHG Protocol Scope 3 Category 10',
  }
}

/**
 * Calculate all relevant Scope 3 categories
 * @param {Object} inputs - All Scope 3 input data
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Complete Scope 3 results
 */
export function calculateTotalScope3(inputs, gwpVersion = 'AR5') {
  const results = {
    categories: {},
    total_co2e_kg: 0,
    total_co2e_tonnes: 0,
  }

  // Category 11 - Use of Sold Products (most material for O&G)
  if (inputs.category11?.length > 0) {
    const cat11 = calculateCategory11(inputs.category11, gwpVersion)
    results.categories[11] = cat11
    results.total_co2e_kg += cat11.co2_kg
  }

  // Category 3 - Fuel and Energy Related
  if (inputs.category3?.length > 0) {
    const cat3 = calculateCategory3(inputs.category3, gwpVersion)
    results.categories[3] = cat3
    results.total_co2e_kg += cat3.co2e_kg
  }

  // Category 4 - Upstream Transportation
  if (inputs.category4?.length > 0) {
    const cat4 = calculateCategory4(inputs.category4)
    results.categories[4] = cat4
    results.total_co2e_kg += cat4.co2e_kg
  }

  // Category 9 - Downstream Transportation
  if (inputs.category9?.length > 0) {
    const cat9 = calculateCategory9(inputs.category9)
    results.categories[9] = cat9
    results.total_co2e_kg += cat9.co2e_kg
  }

  // Category 10 - Processing
  if (inputs.category10?.length > 0) {
    const cat10 = calculateCategory10(inputs.category10)
    results.categories[10] = cat10
    results.total_co2e_kg += cat10.co2e_kg
  }

  results.total_co2e_tonnes = results.total_co2e_kg / 1000
  results.methodology = 'GHG Protocol Corporate Value Chain (Scope 3)'
  results.gwpVersion = gwpVersion

  return results
}

/**
 * Get available Scope 3 categories with relevance for O&G
 */
export function getScope3Categories() {
  return [
    { id: 1, name: 'Purchased Goods and Services', relevance: 'medium', method: 'spend-based' },
    { id: 2, name: 'Capital Goods', relevance: 'medium', method: 'spend-based' },
    { id: 3, name: 'Fuel and Energy Related Activities', relevance: 'high', method: 'activity-based' },
    { id: 4, name: 'Upstream Transportation and Distribution', relevance: 'high', method: 'distance-based' },
    { id: 5, name: 'Waste Generated in Operations', relevance: 'low', method: 'waste-type' },
    { id: 6, name: 'Business Travel', relevance: 'low', method: 'distance-based' },
    { id: 7, name: 'Employee Commuting', relevance: 'low', method: 'survey-based' },
    { id: 8, name: 'Upstream Leased Assets', relevance: 'medium', method: 'asset-specific' },
    { id: 9, name: 'Downstream Transportation and Distribution', relevance: 'high', method: 'distance-based' },
    { id: 10, name: 'Processing of Sold Products', relevance: 'high', method: 'activity-based' },
    { id: 11, name: 'Use of Sold Products', relevance: 'critical', method: 'product-based' },
    { id: 12, name: 'End-of-Life Treatment of Sold Products', relevance: 'low', method: 'product-based' },
    { id: 13, name: 'Downstream Leased Assets', relevance: 'low', method: 'asset-specific' },
    { id: 14, name: 'Franchises', relevance: 'none', method: 'franchise-specific' },
    { id: 15, name: 'Investments', relevance: 'medium', method: 'investment-specific' },
  ]
}

export default {
  calculateCategory11,
  calculateCategory3,
  calculateCategory4,
  calculateCategory9,
  calculateCategory10,
  calculateTotalScope3,
  getScope3Categories,
  COMBUSTION_FACTORS,
}
