/**
 * Fugitive Emissions Calculations
 * Based on EPA Protocol for Equipment Leak Emission Estimates
 */

import componentFactors from '../../data/equipment/componentFactors.json'
import pneumaticDevices from '../../data/equipment/pneumaticDevices.json'
import gwpValues from '../../data/gwpValues.json'

/**
 * Calculate fugitive emissions using component count method
 * EPA Protocol for Equipment Leak Emission Estimates
 *
 * @param {Array} components - Array of {componentType, count}
 * @param {string} serviceType - 'gasService', 'lightLiquid', or 'heavyLiquid'
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Emission results
 */
export function calculateComponentCountMethod(components, serviceType = 'gasService', gwpVersion = 'AR5') {
  const factors = componentFactors[serviceType]
  if (!factors) {
    throw new Error(`Unknown service type: ${serviceType}`)
  }

  const { hoursPerYear, lbToKg, methaneInTHC_gasService, methaneInTHC_liquidService } =
    componentFactors.conversionFactors

  const methaneInTHC = serviceType === 'gasService' ? methaneInTHC_gasService : methaneInTHC_liquidService

  let totalTHC_lb_per_hour = 0
  const breakdown = {}

  for (const { componentType, count } of components) {
    if (!count || count <= 0) continue

    const factor = factors[componentType]
    if (!factor) {
      console.warn(`Unknown component type: ${componentType}`)
      continue
    }

    const emissions = count * factor.factor
    totalTHC_lb_per_hour += emissions

    breakdown[componentType] = {
      count,
      factor: factor.factor,
      unit: factor.unit,
      emissions_lb_per_hour: emissions,
      emissions_lb_per_year: emissions * hoursPerYear,
    }
  }

  // Convert to annual emissions
  const totalTHC_lb_per_year = totalTHC_lb_per_hour * hoursPerYear

  // Convert THC to CH4 (methane fraction in total hydrocarbons)
  const ch4_lb_per_year = totalTHC_lb_per_year * methaneInTHC
  const ch4_kg = ch4_lb_per_year * lbToKg

  // Calculate CO2e
  const gwp = gwpValues[gwpVersion]
  const co2e_kg = ch4_kg * gwp.CH4_fossil

  return {
    totalTHC_lb_per_hour,
    totalTHC_lb_per_year,
    ch4_lb_per_year,
    ch4_kg,
    ch4_tonnes: ch4_kg / 1000,
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    breakdown,
    methodology: 'EPA Protocol for Equipment Leak Estimates - Component Count Method',
    serviceType,
    methaneInTHC,
    gwpVersion,
  }
}

/**
 * Calculate fugitive emissions using average emission factors by facility type
 * Simplified method for quick estimates
 *
 * @param {string} facilityType - Type of facility
 * @param {number} productionBOE - Annual production in barrels of oil equivalent
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Emission results
 */
export function calculateAverageMethod(facilityType, productionBOE, gwpVersion = 'AR5') {
  // Average emission factors by facility type (kg CH4/BOE)
  // Based on industry studies and OGMP data
  const averageFactors = {
    production_onshore: 0.15,
    production_offshore: 0.08,
    gathering: 0.12,
    processing: 0.10,
    transmission: 0.05,
    distribution: 0.08,
    refinery: 0.03,
    storage: 0.06,
  }

  const factor = averageFactors[facilityType]
  if (!factor) {
    throw new Error(`Unknown facility type: ${facilityType}. Valid types: ${Object.keys(averageFactors).join(', ')}`)
  }

  const ch4_kg = productionBOE * factor
  const gwp = gwpValues[gwpVersion]
  const co2e_kg = ch4_kg * gwp.CH4_fossil

  return {
    ch4_kg,
    ch4_tonnes: ch4_kg / 1000,
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    productionBOE,
    facilityType,
    emissionFactor: factor,
    emissionFactorUnit: 'kg CH4/BOE',
    methodology: 'Industry Average Emission Factors',
    gwpVersion,
  }
}

/**
 * Calculate pneumatic device emissions
 * Based on 40 CFR Part 98 Subpart W
 *
 * @param {Object} deviceCounts - Object with device type counts
 * @param {number} methaneContent - Methane content in natural gas (0-1)
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Emission results
 */
export function calculatePneumaticEmissions(deviceCounts, methaneContent = 0.86, gwpVersion = 'AR5') {
  const { pneumaticControllers, pneumaticPumps } = pneumaticDevices

  let totalGas_mcf_per_year = 0
  const breakdown = {}

  // Process controllers
  const controllerTypes = {
    highBleedContinuous: pneumaticControllers.highBleedContinuous,
    lowBleedContinuous: pneumaticControllers.lowBleedContinuous,
    intermittentBleed: pneumaticControllers.intermittentBleed,
  }

  for (const [type, data] of Object.entries(controllerTypes)) {
    const count = deviceCounts[type] || 0
    if (count > 0) {
      const emissions = count * data.annualEmissionsMcf
      totalGas_mcf_per_year += emissions
      breakdown[type] = {
        count,
        emissionRateScfh: data.emissionRate,
        annualEmissionsMcf: emissions,
      }
    }
  }

  // Process pumps
  const pumpTypes = {
    diaphragmPump: pneumaticPumps.diaphragmPump,
    pistonPump: pneumaticPumps.pistonPump,
  }

  for (const [type, data] of Object.entries(pumpTypes)) {
    const count = deviceCounts[type] || 0
    if (count > 0) {
      const emissions = count * data.annualEmissionsMcf
      totalGas_mcf_per_year += emissions
      breakdown[type] = {
        count,
        emissionRateScfh: data.emissionRate,
        annualEmissionsMcf: emissions,
      }
    }
  }

  // Convert to methane mass
  // MCF gas × methane content × density × conversion
  const gasVolume_scf = totalGas_mcf_per_year * 1000
  const ch4Volume_scf = gasVolume_scf * methaneContent

  // At standard conditions, 1 scf CH4 ≈ 0.0192 kg
  const ch4_kg = ch4Volume_scf * 0.0192

  const gwp = gwpValues[gwpVersion]
  const co2e_kg = ch4_kg * gwp.CH4_fossil

  return {
    totalGas_mcf_per_year,
    totalGas_scf_per_year: gasVolume_scf,
    ch4_scf_per_year: ch4Volume_scf,
    ch4_kg,
    ch4_tonnes: ch4_kg / 1000,
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    breakdown,
    methaneContent,
    methodology: '40 CFR Part 98 Subpart W - Pneumatic Device Emissions',
    gwpVersion,
  }
}

/**
 * Calculate venting emissions
 * @param {Array} ventSources - Array of {source, volume, unit}
 * @param {number} methaneContent - Methane content (0-1)
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Emission results
 */
export function calculateVentingEmissions(ventSources, methaneContent = 0.86, gwpVersion = 'AR5') {
  let totalGas_scf = 0
  const breakdown = []

  for (const source of ventSources) {
    if (!source.volume || source.volume <= 0) continue

    let volume_scf = source.volume
    if (source.unit === 'mcf') {
      volume_scf = source.volume * 1000
    } else if (source.unit === 'MMscf') {
      volume_scf = source.volume * 1000000
    }

    totalGas_scf += volume_scf
    breakdown.push({
      source: source.source,
      volume: source.volume,
      unit: source.unit,
      volume_scf,
    })
  }

  // Convert to CH4 mass
  const ch4Volume_scf = totalGas_scf * methaneContent
  const ch4_kg = ch4Volume_scf * 0.0192

  const gwp = gwpValues[gwpVersion]
  const co2e_kg = ch4_kg * gwp.CH4_fossil

  return {
    totalGas_scf,
    totalGas_mcf: totalGas_scf / 1000,
    ch4_scf: ch4Volume_scf,
    ch4_kg,
    ch4_tonnes: ch4_kg / 1000,
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    breakdown,
    methaneContent,
    methodology: 'Direct Venting Calculation',
    gwpVersion,
  }
}

/**
 * Get available component types for a service type
 */
export function getComponentTypes(serviceType = 'gasService') {
  const factors = componentFactors[serviceType]
  if (!factors) return []

  return Object.entries(factors).map(([key, value]) => ({
    value: key,
    label: value.description || key.replace(/([A-Z])/g, ' $1').trim(),
    factor: value.factor,
    unit: value.unit,
  }))
}

export default {
  calculateComponentCountMethod,
  calculateAverageMethod,
  calculatePneumaticEmissions,
  calculateVentingEmissions,
  getComponentTypes,
}
