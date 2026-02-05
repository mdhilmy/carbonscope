/**
 * CSV Export Service
 * Generates CSV files for emission data export
 */

/**
 * Generate CSV from calculation results
 *
 * @param {Object} data - Calculation data
 * @param {Object} options - Export options
 * @returns {string} CSV content
 */
export function generateEmissionsCSV(data, options = {}) {
  const {
    includeMetadata = true,
    separator = ',',
    lineBreak = '\n',
  } = options

  const rows = []

  // Header
  rows.push(['Scope', 'Category', 'Source', 'Emissions (tonnes CO2e)', 'Unit', 'Methodology'].join(separator))

  const totals = data.totals || {}

  // Scope 1 data
  if (data.scope1) {
    if (data.scope1.stationaryCombustion) {
      rows.push([
        '1',
        'Stationary Combustion',
        data.scope1.stationaryCombustion.fuelType || 'Mixed',
        data.scope1.stationaryCombustion.co2e_tonnes || 0,
        'tonnes CO2e',
        'EPA Emission Factors',
      ].join(separator))
    }

    if (data.scope1.mobileCombustion) {
      rows.push([
        '1',
        'Mobile Combustion',
        data.scope1.mobileCombustion.vehicleType || 'Mixed',
        data.scope1.mobileCombustion.co2e_tonnes || 0,
        'tonnes CO2e',
        'EPA Emission Factors',
      ].join(separator))
    }

    if (data.scope1.flaring) {
      rows.push([
        '1',
        'Flaring',
        'Natural Gas',
        data.scope1.flaring.co2e_tonnes || 0,
        'tonnes CO2e',
        data.scope1.flaring.methodology || '40 CFR Part 98',
      ].join(separator))
    }

    if (data.scope1.venting) {
      rows.push([
        '1',
        'Venting',
        'Natural Gas',
        data.scope1.venting.co2e_tonnes || 0,
        'tonnes CO2e',
        data.scope1.venting.methodology || 'Direct Venting',
      ].join(separator))
    }

    if (data.scope1.fugitive) {
      rows.push([
        '1',
        'Fugitive Emissions',
        data.scope1.fugitive.serviceType || 'Gas Service',
        data.scope1.fugitive.co2e_tonnes || 0,
        'tonnes CO2e',
        data.scope1.fugitive.methodology || 'EPA Protocol',
      ].join(separator))
    }
  }

  // Scope 2 data
  if (data.scope2) {
    if (data.scope2.locationBased) {
      rows.push([
        '2',
        'Purchased Electricity',
        `Location-Based (${data.scope2.locationBased.region || 'Unknown'})`,
        data.scope2.locationBased.co2e_tonnes || 0,
        'tonnes CO2e',
        'GHG Protocol Scope 2 Guidance',
      ].join(separator))
    }

    if (data.scope2.marketBased) {
      rows.push([
        '2',
        'Purchased Electricity',
        'Market-Based',
        data.scope2.marketBased.co2e_tonnes || 0,
        'tonnes CO2e',
        'GHG Protocol Scope 2 Guidance',
      ].join(separator))
    }

    if (data.scope2.steam) {
      rows.push([
        '2',
        'Purchased Steam',
        'Steam',
        data.scope2.steam.co2e_tonnes || 0,
        'tonnes CO2e',
        'GHG Protocol Scope 2 Guidance',
      ].join(separator))
    }
  }

  // Scope 3 data
  if (data.scope3?.categories) {
    const categoryNames = {
      1: 'Purchased Goods and Services',
      2: 'Capital Goods',
      3: 'Fuel and Energy Related Activities',
      4: 'Upstream Transportation',
      5: 'Waste Generated',
      6: 'Business Travel',
      7: 'Employee Commuting',
      8: 'Upstream Leased Assets',
      9: 'Downstream Transportation',
      10: 'Processing of Sold Products',
      11: 'Use of Sold Products',
      12: 'End-of-Life Treatment',
      13: 'Downstream Leased Assets',
      14: 'Franchises',
      15: 'Investments',
    }

    Object.entries(data.scope3.categories).forEach(([catNum, catData]) => {
      if (catData) {
        rows.push([
          '3',
          `Category ${catNum}`,
          categoryNames[catNum] || 'Unknown',
          catData.co2_tonnes || catData.co2e_tonnes || 0,
          'tonnes CO2e',
          catData.methodology || 'GHG Protocol Scope 3',
        ].join(separator))
      }
    })
  }

  // Totals
  rows.push([
    'Total',
    'Scope 1',
    'All Sources',
    totals.scope1_tonnes || 0,
    'tonnes CO2e',
    '',
  ].join(separator))

  rows.push([
    'Total',
    'Scope 2',
    'All Sources',
    totals.scope2_tonnes || 0,
    'tonnes CO2e',
    '',
  ].join(separator))

  rows.push([
    'Total',
    'Scope 3',
    'All Sources',
    totals.scope3_tonnes || 0,
    'tonnes CO2e',
    '',
  ].join(separator))

  rows.push([
    'Total',
    'All Scopes',
    'Total GHG Emissions',
    totals.total_tonnes || 0,
    'tonnes CO2e',
    '',
  ].join(separator))

  return rows.join(lineBreak)
}

/**
 * Generate detailed breakdown CSV
 *
 * @param {Object} data - Calculation data
 * @param {Object} options - Export options
 * @returns {string} CSV content
 */
export function generateDetailedCSV(data, options = {}) {
  const { separator = ',', lineBreak = '\n' } = options
  const rows = []

  // Header
  rows.push([
    'Scope',
    'Category',
    'Source',
    'CO2 (kg)',
    'CH4 (kg)',
    'N2O (kg)',
    'CO2e (kg)',
    'CO2e (tonnes)',
    'GWP Version',
    'Methodology',
  ].join(separator))

  // Scope 1 detailed
  if (data.scope1?.stationaryCombustion) {
    const s = data.scope1.stationaryCombustion
    rows.push([
      '1',
      'Stationary Combustion',
      s.fuelType || 'Unknown',
      s.co2_kg || 0,
      s.ch4_kg || 0,
      s.n2o_kg || 0,
      s.co2e_kg || 0,
      s.co2e_tonnes || 0,
      s.gwpVersion || 'AR5',
      'EPA Emission Factors',
    ].join(separator))
  }

  if (data.scope1?.flaring) {
    const f = data.scope1.flaring
    rows.push([
      '1',
      'Flaring',
      'Natural Gas',
      f.co2_kg || 0,
      f.ch4_kg || 0,
      f.n2o_kg || 0,
      f.co2e_kg || 0,
      f.co2e_tonnes || 0,
      f.gwpVersion || 'AR5',
      f.methodology || '40 CFR Part 98',
    ].join(separator))
  }

  if (data.scope1?.fugitive) {
    const fu = data.scope1.fugitive
    rows.push([
      '1',
      'Fugitive Emissions',
      fu.serviceType || 'Gas Service',
      0, // CO2 from fugitives is minimal
      fu.ch4_kg || 0,
      0,
      fu.co2e_kg || 0,
      fu.co2e_tonnes || 0,
      fu.gwpVersion || 'AR5',
      fu.methodology || 'EPA Protocol',
    ].join(separator))
  }

  // Scope 2
  if (data.scope2?.locationBased) {
    const lb = data.scope2.locationBased
    rows.push([
      '2',
      'Purchased Electricity (Location)',
      lb.region || 'Unknown',
      lb.co2e_kg || 0, // Grid factors usually CO2e
      0,
      0,
      lb.co2e_kg || 0,
      lb.co2e_tonnes || 0,
      'N/A',
      'GHG Protocol Location-Based',
    ].join(separator))
  }

  if (data.scope2?.marketBased) {
    const mb = data.scope2.marketBased
    rows.push([
      '2',
      'Purchased Electricity (Market)',
      'Market Instruments',
      mb.co2e_kg || 0,
      0,
      0,
      mb.co2e_kg || 0,
      mb.co2e_tonnes || 0,
      'N/A',
      'GHG Protocol Market-Based',
    ].join(separator))
  }

  // Scope 3
  if (data.scope3?.categories) {
    Object.entries(data.scope3.categories).forEach(([catNum, catData]) => {
      if (catData) {
        rows.push([
          '3',
          `Category ${catNum}`,
          catData.categoryName || 'Unknown',
          catData.co2_kg || 0,
          0,
          0,
          catData.co2_kg || catData.co2e_kg || 0,
          catData.co2_tonnes || catData.co2e_tonnes || 0,
          catData.gwpVersion || 'AR5',
          catData.methodology || 'GHG Protocol Scope 3',
        ].join(separator))
      }
    })
  }

  return rows.join(lineBreak)
}

/**
 * Generate intensity metrics CSV
 *
 * @param {Object} data - Calculation data
 * @param {Object} options - Export options
 * @returns {string} CSV content
 */
export function generateIntensityCSV(data, options = {}) {
  const { separator = ',', lineBreak = '\n' } = options
  const rows = []

  rows.push(['Metric', 'Value', 'Unit', 'Benchmark', 'Rating'].join(separator))

  if (data.intensity) {
    if (data.intensity.carbonIntensity) {
      const ci = data.intensity.carbonIntensity
      rows.push([
        'Carbon Intensity',
        ci.intensity || 0,
        ci.unit || 'kgCO2e/BOE',
        ci.comparison?.industryAverage || '',
        ci.comparison?.rating || '',
      ].join(separator))
    }

    if (data.intensity.methaneIntensity) {
      const mi = data.intensity.methaneIntensity
      rows.push([
        'Methane Intensity',
        mi.intensity || 0,
        mi.unit || 'percent',
        mi.industryAverage || '',
        mi.targetComparison?.ogci2025?.met ? 'Met Target' : 'Below Target',
      ].join(separator))
    }

    if (data.intensity.flaringIntensity) {
      const fi = data.intensity.flaringIntensity
      rows.push([
        'Flaring Intensity',
        fi.intensity || 0,
        fi.unit || 'm³/BOE',
        fi.comparison?.globalAverage || '',
        fi.comparison?.rating || '',
      ].join(separator))
    }

    if (data.intensity.revenueIntensity) {
      const ri = data.intensity.revenueIntensity
      rows.push([
        'Revenue Intensity',
        ri.intensity || 0,
        ri.unit || 'tCO2e/million revenue',
        '',
        '',
      ].join(separator))
    }
  }

  return rows.join(lineBreak)
}

/**
 * Download CSV file
 *
 * @param {string} content - CSV content
 * @param {string} filename - Output filename
 */
export function downloadCSV(content, filename = 'emissions-data.csv') {
  // Add BOM for Excel compatibility
  const bom = '\uFEFF'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download emissions data as CSV
 *
 * @param {Object} data - Calculation data
 * @param {string} filename - Output filename
 * @param {Object} options - Export options
 */
export function downloadEmissionsCSV(data, filename = 'emissions-summary.csv', options = {}) {
  const content = generateEmissionsCSV(data, options)
  downloadCSV(content, filename)
}

/**
 * Download detailed data as CSV
 *
 * @param {Object} data - Calculation data
 * @param {string} filename - Output filename
 * @param {Object} options - Export options
 */
export function downloadDetailedCSV(data, filename = 'emissions-detailed.csv', options = {}) {
  const content = generateDetailedCSV(data, options)
  downloadCSV(content, filename)
}

/**
 * Download intensity metrics as CSV
 *
 * @param {Object} data - Calculation data
 * @param {string} filename - Output filename
 * @param {Object} options - Export options
 */
export function downloadIntensityCSV(data, filename = 'intensity-metrics.csv', options = {}) {
  const content = generateIntensityCSV(data, options)
  downloadCSV(content, filename)
}

export default {
  generateEmissionsCSV,
  generateDetailedCSV,
  generateIntensityCSV,
  downloadCSV,
  downloadEmissionsCSV,
  downloadDetailedCSV,
  downloadIntensityCSV,
}
