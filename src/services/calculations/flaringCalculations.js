/**
 * Flaring Calculations
 * Based on 40 CFR § 98.253 - Petroleum and Natural Gas Systems
 */

import epaFactors from '../../data/emissionFactors/epaFactors.json'
import gwpValues from '../../data/gwpValues.json'
import fuelProperties from '../../data/fuelProperties.json'

const { flaring: flaringDefaults } = epaFactors

/**
 * Calculate flaring emissions using default method (unknown gas composition)
 * Equation Y-2 from 40 CFR § 98.253
 *
 * @param {number} volumeMMscf - Flare gas volume in MMscf
 * @param {number} hhv - Higher heating value (MMBtu/MMscf), default 1000
 * @param {number} combustionEfficiency - Combustion efficiency (0-1), default 0.98
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Emission results
 */
export function calculateFlaringDefault(
  volumeMMscf,
  hhv = flaringDefaults.defaultHHV,
  combustionEfficiency = flaringDefaults.defaultCombustionEfficiency,
  gwpVersion = 'AR5'
) {
  // Validate inputs
  if (volumeMMscf < 0) throw new Error('Volume cannot be negative')
  if (combustionEfficiency < 0 || combustionEfficiency > 1) {
    throw new Error('Combustion efficiency must be between 0 and 1')
  }

  const gwp = gwpValues[gwpVersion]
  const emissionFactor = flaringDefaults.defaultCO2Factor // kg CO2/MMBtu

  // CO2 emissions from complete combustion
  const totalEnergy = volumeMMscf * hhv // MMBtu
  const co2_kg = totalEnergy * emissionFactor * combustionEfficiency
  const co2_tonnes = co2_kg / 1000

  // CH4 from incomplete combustion
  // Assumes 40% of uncombusted carbon is released as CH4 per EPA methodology
  const uncombustedFraction = 1 - combustionEfficiency
  const ch4FractionOfCarbon = 0.4 // EPA default
  const carbonInCO2_kg = co2_kg * (12 / 44) // Extract carbon mass
  const uncombustedCarbon_kg = (carbonInCO2_kg / combustionEfficiency) * uncombustedFraction
  const ch4_kg = uncombustedCarbon_kg * ch4FractionOfCarbon * (16 / 12)

  // N2O is typically negligible for flaring but included for completeness
  const n2o_kg = totalEnergy * 0.00006 // EPA default for flaring

  // Calculate CO2e
  const ch4_co2e = ch4_kg * gwp.CH4_fossil
  const n2o_co2e = n2o_kg * gwp.N2O
  const co2e_kg = co2_kg + ch4_co2e + n2o_co2e
  const co2e_tonnes = co2e_kg / 1000

  return {
    co2_kg,
    co2_tonnes,
    ch4_kg,
    ch4_tonnes: ch4_kg / 1000,
    n2o_kg,
    ch4_co2e_kg: ch4_co2e,
    n2o_co2e_kg: n2o_co2e,
    co2e_kg,
    co2e_tonnes,
    volumeMMscf,
    hhv,
    combustionEfficiency,
    totalEnergyMMBtu: totalEnergy,
    methodology: '40 CFR § 98.253 (Default Method - Equation Y-2)',
    gwpVersion,
  }
}

/**
 * Calculate flaring emissions with known gas composition
 * Equation Y-1 from 40 CFR § 98.253
 *
 * @param {number} volumeScf - Flare gas volume in SCF
 * @param {Array} gasComposition - Array of gas components with moleFraction, molecularWeight, carbonAtoms
 * @param {number} combustionEfficiency - Combustion efficiency (0-1)
 * @param {string} gwpVersion - GWP version
 * @returns {Object} Emission results
 */
export function calculateFlaringWithComposition(
  volumeScf,
  gasComposition,
  combustionEfficiency = 0.98,
  gwpVersion = 'AR5'
) {
  const MVC = flaringDefaults.molarVolumeConversion68F // 849.5 scf/kg-mole at 68°F

  // Validate mole fractions sum to 1 (within tolerance)
  const totalMoleFraction = gasComposition.reduce((sum, c) => sum + c.moleFraction, 0)
  if (Math.abs(totalMoleFraction - 1) > 0.01) {
    console.warn(`Gas composition mole fractions sum to ${totalMoleFraction}, not 1.0`)
  }

  let co2_kg = 0
  const componentResults = []

  // Calculate CO2 from each component using Equation Y-1
  // CO2,p = CE × 0.001 × V × (MW_p / MVC) × C_p × (44/12)
  for (const component of gasComposition) {
    const { moleFraction, molecularWeight, carbonAtoms, name } = component

    if (carbonAtoms === 0) {
      // Non-carbon components (CO2, N2) don't contribute to combustion CO2
      componentResults.push({ name, moleFraction, co2_kg: 0 })
      continue
    }

    const componentVolume = volumeScf * moleFraction
    const componentCO2 =
      combustionEfficiency *
      0.001 *
      componentVolume *
      (molecularWeight / MVC) *
      carbonAtoms *
      (44 / 12)

    co2_kg += componentCO2
    componentResults.push({
      name,
      moleFraction,
      componentVolume,
      co2_kg: componentCO2,
    })
  }

  const co2_tonnes = co2_kg / 1000

  // CH4 from incomplete combustion
  const uncombustedFraction = 1 - combustionEfficiency
  const ch4FractionOfCarbon = 0.4
  const carbonInCO2_kg = co2_kg * (12 / 44)
  const uncombustedCarbon_kg = (carbonInCO2_kg / combustionEfficiency) * uncombustedFraction
  const ch4_kg = uncombustedCarbon_kg * ch4FractionOfCarbon * (16 / 12)

  const gwp = gwpValues[gwpVersion]
  const ch4_co2e = ch4_kg * gwp.CH4_fossil
  const co2e_kg = co2_kg + ch4_co2e
  const co2e_tonnes = co2e_kg / 1000

  return {
    co2_kg,
    co2_tonnes,
    ch4_kg,
    ch4_tonnes: ch4_kg / 1000,
    ch4_co2e_kg: ch4_co2e,
    co2e_kg,
    co2e_tonnes,
    volumeScf,
    combustionEfficiency,
    componentResults,
    methodology: '40 CFR § 98.253 (Composition Method - Equation Y-1)',
    gwpVersion,
  }
}

/**
 * Convert volume units for flaring calculations
 * @param {number} volume - Volume value
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number} Converted volume
 */
export function convertFlaringVolume(volume, fromUnit, toUnit) {
  // Convert to SCF first
  const toScf = {
    scf: 1,
    mcf: 1000,
    MMscf: 1000000,
    m3: 35.31, // cubic feet per cubic meter
  }

  const scfValue = volume * (toScf[fromUnit] || 1)

  // Convert from SCF to target
  const fromScf = {
    scf: 1,
    mcf: 0.001,
    MMscf: 0.000001,
    m3: 0.0283,
  }

  return scfValue * (fromScf[toUnit] || 1)
}

/**
 * Common gas components with their properties
 */
export const GAS_COMPONENTS = {
  methane: {
    name: 'Methane',
    formula: 'CH4',
    molecularWeight: 16.04,
    carbonAtoms: 1,
    hhv_btu_scf: 1010,
  },
  ethane: {
    name: 'Ethane',
    formula: 'C2H6',
    molecularWeight: 30.07,
    carbonAtoms: 2,
    hhv_btu_scf: 1770,
  },
  propane: {
    name: 'Propane',
    formula: 'C3H8',
    molecularWeight: 44.10,
    carbonAtoms: 3,
    hhv_btu_scf: 2516,
  },
  nButane: {
    name: 'n-Butane',
    formula: 'C4H10',
    molecularWeight: 58.12,
    carbonAtoms: 4,
    hhv_btu_scf: 3262,
  },
  isoButane: {
    name: 'iso-Butane',
    formula: 'C4H10',
    molecularWeight: 58.12,
    carbonAtoms: 4,
    hhv_btu_scf: 3252,
  },
  pentane: {
    name: 'Pentane',
    formula: 'C5H12',
    molecularWeight: 72.15,
    carbonAtoms: 5,
    hhv_btu_scf: 4008,
  },
  co2: {
    name: 'Carbon Dioxide',
    formula: 'CO2',
    molecularWeight: 44.01,
    carbonAtoms: 0,
    hhv_btu_scf: 0,
  },
  n2: {
    name: 'Nitrogen',
    formula: 'N2',
    molecularWeight: 28.01,
    carbonAtoms: 0,
    hhv_btu_scf: 0,
  },
  h2s: {
    name: 'Hydrogen Sulfide',
    formula: 'H2S',
    molecularWeight: 34.08,
    carbonAtoms: 0,
    hhv_btu_scf: 637,
  },
}

/**
 * Create a typical natural gas composition
 * @returns {Array} Default gas composition array
 */
export function getDefaultGasComposition() {
  return [
    { ...GAS_COMPONENTS.methane, moleFraction: 0.87 },
    { ...GAS_COMPONENTS.ethane, moleFraction: 0.06 },
    { ...GAS_COMPONENTS.propane, moleFraction: 0.03 },
    { ...GAS_COMPONENTS.nButane, moleFraction: 0.01 },
    { ...GAS_COMPONENTS.co2, moleFraction: 0.02 },
    { ...GAS_COMPONENTS.n2, moleFraction: 0.01 },
  ]
}

export default {
  calculateFlaringDefault,
  calculateFlaringWithComposition,
  convertFlaringVolume,
  GAS_COMPONENTS,
  getDefaultGasComposition,
}
