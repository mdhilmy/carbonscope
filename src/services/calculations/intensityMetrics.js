/**
 * Intensity Metrics Calculations
 * Carbon intensity, methane intensity, and other normalized metrics
 */

import benchmarks from '../../data/benchmarks/industryBenchmarks.json'

/**
 * Calculate carbon intensity (kg CO2e per BOE)
 *
 * @param {number} totalEmissions_tonnes - Total emissions in tonnes CO2e
 * @param {number} production_boe - Production in barrels of oil equivalent
 * @returns {Object} Carbon intensity metrics
 */
export function calculateCarbonIntensity(totalEmissions_tonnes, production_boe) {
  if (production_boe <= 0) {
    return {
      intensity: null,
      unit: 'kgCO2e/BOE',
      error: 'Production must be greater than zero',
    }
  }

  const totalEmissions_kg = totalEmissions_tonnes * 1000
  const intensity = totalEmissions_kg / production_boe

  // Compare against benchmarks
  const comparison = compareToBenchmarks(intensity, 'carbonIntensity')

  return {
    intensity,
    unit: 'kgCO2e/BOE',
    totalEmissions_tonnes,
    production_boe,
    comparison,
  }
}

/**
 * Calculate methane intensity (% of gas marketed)
 *
 * @param {number} ch4Emissions_tonnes - CH4 emissions in tonnes
 * @param {number} gasProduction_mcf - Natural gas production in MCF
 * @returns {Object} Methane intensity metrics
 */
export function calculateMethaneIntensity(ch4Emissions_tonnes, gasProduction_mcf) {
  if (gasProduction_mcf <= 0) {
    return {
      intensity: null,
      unit: 'percent',
      error: 'Gas production must be greater than zero',
    }
  }

  // Convert CH4 tonnes to MCF
  // 1 tonne CH4 ≈ 52.38 MCF at standard conditions
  const ch4_mcf = ch4Emissions_tonnes * 52.38

  const intensity = (ch4_mcf / gasProduction_mcf) * 100

  // Compare against targets
  const targets = benchmarks.methaneIntensity.targets
  const targetComparison = {
    ogci2025: { target: targets.OGCI_2025, met: intensity <= targets.OGCI_2025 },
    ogci2030: { target: targets.OGCI_2030, met: intensity <= targets.OGCI_2030 },
    ogmp2Gold: { target: targets.OGMP2_Gold, met: intensity <= targets.OGMP2_Gold },
  }

  return {
    intensity,
    unit: 'percent',
    ch4Emissions_tonnes,
    gasProduction_mcf,
    ch4Equivalent_mcf: ch4_mcf,
    targetComparison,
    industryAverage: benchmarks.methaneIntensity.currentIndustry.average,
    topPerformers: benchmarks.methaneIntensity.currentIndustry.topPerformers,
  }
}

/**
 * Calculate flaring intensity
 *
 * @param {number} flaringVolume_mcf - Flare gas volume in MCF
 * @param {number} production_boe - Production in BOE
 * @returns {Object} Flaring intensity metrics
 */
export function calculateFlaringIntensity(flaringVolume_mcf, production_boe) {
  if (production_boe <= 0) {
    return {
      intensity: null,
      unit: 'm³/BOE',
      error: 'Production must be greater than zero',
    }
  }

  // Convert MCF to cubic meters
  const flaringVolume_m3 = flaringVolume_mcf * 28.32

  const intensity = flaringVolume_m3 / production_boe

  const comparison = compareToBenchmarks(intensity, 'flaringIntensity')

  return {
    intensity,
    unit: 'm³/BOE',
    flaringVolume_mcf,
    flaringVolume_m3,
    production_boe,
    comparison,
    worldBankZRF: benchmarks.flaringIntensity.worldBankZRF,
  }
}

/**
 * Calculate emissions intensity by revenue
 *
 * @param {number} totalEmissions_tonnes - Total emissions in tonnes CO2e
 * @param {number} revenue_million - Revenue in millions (USD or local currency)
 * @returns {Object} Revenue intensity metrics
 */
export function calculateRevenueIntensity(totalEmissions_tonnes, revenue_million) {
  if (revenue_million <= 0) {
    return {
      intensity: null,
      unit: 'tCO2e/million revenue',
      error: 'Revenue must be greater than zero',
    }
  }

  const intensity = totalEmissions_tonnes / revenue_million

  return {
    intensity,
    unit: 'tCO2e/million revenue',
    totalEmissions_tonnes,
    revenue_million,
  }
}

/**
 * Calculate all intensity metrics
 *
 * @param {Object} data - Input data
 * @returns {Object} All intensity metrics
 */
export function calculateAllIntensities(data) {
  const results = {}

  // Carbon intensity
  if (data.totalEmissions_tonnes && data.production_boe) {
    results.carbonIntensity = calculateCarbonIntensity(
      data.totalEmissions_tonnes,
      data.production_boe
    )
  }

  // Methane intensity
  if (data.ch4Emissions_tonnes && data.gasProduction_mcf) {
    results.methaneIntensity = calculateMethaneIntensity(
      data.ch4Emissions_tonnes,
      data.gasProduction_mcf
    )
  }

  // Flaring intensity
  if (data.flaringVolume_mcf && data.production_boe) {
    results.flaringIntensity = calculateFlaringIntensity(
      data.flaringVolume_mcf,
      data.production_boe
    )
  }

  // Revenue intensity
  if (data.totalEmissions_tonnes && data.revenue_million) {
    results.revenueIntensity = calculateRevenueIntensity(
      data.totalEmissions_tonnes,
      data.revenue_million
    )
  }

  // Scope breakdown
  if (data.scope1_tonnes !== undefined && data.scope2_tonnes !== undefined) {
    const scope3_tonnes = data.scope3_tonnes || 0
    const total = data.scope1_tonnes + data.scope2_tonnes + scope3_tonnes

    results.scopeBreakdown = {
      scope1_percent: total > 0 ? (data.scope1_tonnes / total) * 100 : 0,
      scope2_percent: total > 0 ? (data.scope2_tonnes / total) * 100 : 0,
      scope3_percent: total > 0 ? (scope3_tonnes / total) * 100 : 0,
      scope1and2_percent: total > 0 ? ((data.scope1_tonnes + data.scope2_tonnes) / total) * 100 : 0,
    }
  }

  return results
}

/**
 * Compare intensity value to industry benchmarks
 * @param {number} value - Intensity value
 * @param {string} metricType - Type of metric
 * @returns {Object} Comparison results
 */
function compareToBenchmarks(value, metricType) {
  const benchmarkData = benchmarks[metricType]

  if (!benchmarkData) {
    return { available: false }
  }

  const comparison = {
    available: true,
    value,
  }

  // For carbon intensity
  if (metricType === 'carbonIntensity') {
    const quartiles = benchmarkData.quartiles
    if (value <= quartiles.top25.upstream) {
      comparison.percentile = 'Top 25%'
      comparison.rating = 'excellent'
    } else if (value <= quartiles.median.upstream) {
      comparison.percentile = 'Above median'
      comparison.rating = 'good'
    } else if (value <= quartiles.bottom25.upstream) {
      comparison.percentile = 'Below median'
      comparison.rating = 'average'
    } else {
      comparison.percentile = 'Bottom 25%'
      comparison.rating = 'below_average'
    }
    comparison.industryAverage = benchmarkData.industryAverage.upstream
  }

  // For flaring intensity
  if (metricType === 'flaringIntensity') {
    const regional = benchmarkData.currentIndustry
    comparison.globalAverage = regional.globalAverage
    comparison.belowAverage = value < regional.globalAverage
    comparison.rating = value === 0 ? 'zero_flaring' :
                       value < regional.globalAverage / 2 ? 'excellent' :
                       value < regional.globalAverage ? 'good' : 'above_average'
  }

  return comparison
}

/**
 * Check regulatory thresholds
 * @param {Object} emissions - Emissions data
 * @returns {Array} Threshold alerts
 */
export function checkRegulatoryThresholds(emissions) {
  const alerts = []

  // EPA GHGRP threshold (25,000 MT CO2e)
  if (emissions.totalCO2e_tonnes >= 25000) {
    alerts.push({
      threshold: 'EPA_GHGRP',
      value: emissions.totalCO2e_tonnes,
      limit: 25000,
      unit: 'tonnes CO2e',
      exceeded: true,
      requirement: 'Mandatory annual GHG reporting required',
    })
  }

  // Australia NGER corporate threshold (50,000 t CO2e)
  if (emissions.totalCO2e_tonnes >= 50000) {
    alerts.push({
      threshold: 'AU_NGER_Corporate',
      value: emissions.totalCO2e_tonnes,
      limit: 50000,
      unit: 'tonnes CO2e',
      exceeded: true,
      requirement: 'NGER corporate reporting required',
    })
  }

  // Australia Safeguard Mechanism (100,000 t Scope 1)
  if (emissions.scope1_tonnes >= 100000) {
    alerts.push({
      threshold: 'AU_Safeguard',
      value: emissions.scope1_tonnes,
      limit: 100000,
      unit: 'tonnes CO2e Scope 1',
      exceeded: true,
      requirement: 'Safeguard Mechanism baseline applies',
    })
  }

  return alerts
}

export default {
  calculateCarbonIntensity,
  calculateMethaneIntensity,
  calculateFlaringIntensity,
  calculateRevenueIntensity,
  calculateAllIntensities,
  checkRegulatoryThresholds,
}
