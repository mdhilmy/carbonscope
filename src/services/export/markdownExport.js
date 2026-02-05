/**
 * Markdown Export Service
 * Generates Markdown reports for emission calculations
 */

/**
 * Generate Markdown report from calculation results
 *
 * @param {Object} data - Calculation data
 * @param {Object} options - Export options
 * @returns {string} Markdown content
 */
export function generateMarkdownReport(data, options = {}) {
  const {
    includeMetadata = true,
    includeBreakdown = true,
    includeIntensity = true,
    includeThresholds = true,
  } = options

  const lines = []

  // Title
  lines.push('# Carbon Emissions Report')
  lines.push('')

  // Facility Info
  if (data.facility) {
    lines.push(`**Facility:** ${data.facility.name}`)
    if (data.facility.location) {
      lines.push(`**Location:** ${data.facility.location}`)
    }
    lines.push('')
  }

  // Metadata
  if (includeMetadata) {
    lines.push(`**Generated:** ${new Date().toLocaleString()}`)
    if (data.metadata?.reportingPeriod) {
      lines.push(`**Reporting Period:** ${data.metadata.reportingPeriod}`)
    }
    lines.push(`**GWP Version:** ${data.metadata?.gwpVersion || 'AR5'}`)
    lines.push('')
  }

  lines.push('---')
  lines.push('')

  // Executive Summary
  lines.push('## Executive Summary')
  lines.push('')

  const totals = data.totals || {}
  const totalEmissions = totals.total_tonnes || 0

  lines.push(`**Total GHG Emissions:** ${formatNumber(totalEmissions)} tonnes CO2e`)
  lines.push('')

  // Scope breakdown table
  lines.push('| Scope | Emissions (tonnes CO2e) | Percentage |')
  lines.push('|-------|------------------------|------------|')

  const scopeData = [
    { name: 'Scope 1 (Direct)', value: totals.scope1_tonnes || 0 },
    { name: 'Scope 2 (Energy)', value: totals.scope2_tonnes || 0 },
    { name: 'Scope 3 (Value Chain)', value: totals.scope3_tonnes || 0 },
  ]

  scopeData.forEach(scope => {
    const percent = totalEmissions > 0 ? (scope.value / totalEmissions) * 100 : 0
    lines.push(`| ${scope.name} | ${formatNumber(scope.value)} | ${percent.toFixed(1)}% |`)
  })

  lines.push(`| **Total** | **${formatNumber(totalEmissions)}** | **100%** |`)
  lines.push('')

  // Detailed Breakdown
  if (includeBreakdown) {
    // Scope 1 Details
    if (data.scope1 && (totals.scope1_tonnes || 0) > 0) {
      lines.push('## Scope 1 - Direct Emissions')
      lines.push('')
      lines.push('Direct emissions from owned or controlled sources.')
      lines.push('')

      lines.push('| Source | Emissions (tonnes CO2e) |')
      lines.push('|--------|------------------------|')

      if (data.scope1.stationaryCombustion) {
        lines.push(`| Stationary Combustion | ${formatNumber(data.scope1.stationaryCombustion.co2e_tonnes)} |`)
      }
      if (data.scope1.mobileCombustion) {
        lines.push(`| Mobile Combustion | ${formatNumber(data.scope1.mobileCombustion.co2e_tonnes)} |`)
      }
      if (data.scope1.flaring) {
        lines.push(`| Flaring | ${formatNumber(data.scope1.flaring.co2e_tonnes)} |`)
      }
      if (data.scope1.venting) {
        lines.push(`| Venting | ${formatNumber(data.scope1.venting.co2e_tonnes)} |`)
      }
      if (data.scope1.fugitive) {
        lines.push(`| Fugitive Emissions | ${formatNumber(data.scope1.fugitive.co2e_tonnes)} |`)
      }

      lines.push('')

      // Additional details
      if (data.scope1.flaring?.methodology) {
        lines.push(`> **Flaring Methodology:** ${data.scope1.flaring.methodology}`)
        lines.push('')
      }
    }

    // Scope 2 Details
    if (data.scope2 && (totals.scope2_tonnes || 0) > 0) {
      lines.push('## Scope 2 - Energy Indirect Emissions')
      lines.push('')
      lines.push('Indirect emissions from purchased electricity, steam, heating, and cooling.')
      lines.push('')

      lines.push('| Method | Emissions (tonnes CO2e) |')
      lines.push('|--------|------------------------|')

      if (data.scope2.locationBased) {
        lines.push(`| Location-Based | ${formatNumber(data.scope2.locationBased.co2e_tonnes)} |`)
      }
      if (data.scope2.marketBased) {
        lines.push(`| Market-Based | ${formatNumber(data.scope2.marketBased.co2e_tonnes)} |`)
      }
      if (data.scope2.steam) {
        lines.push(`| Purchased Steam | ${formatNumber(data.scope2.steam.co2e_tonnes)} |`)
      }

      lines.push('')

      // Grid factor info
      if (data.scope2.locationBased?.gridFactor) {
        lines.push(`> **Grid Factor:** ${data.scope2.locationBased.gridFactor} ${data.scope2.locationBased.gridFactorUnit}`)
        lines.push(`> **Region:** ${data.scope2.locationBased.region}${data.scope2.locationBased.subregion ? ' / ' + data.scope2.locationBased.subregion : ''}`)
        lines.push('')
      }
    }

    // Scope 3 Details
    if (data.scope3 && (totals.scope3_tonnes || 0) > 0) {
      lines.push('## Scope 3 - Value Chain Emissions')
      lines.push('')
      lines.push('All other indirect emissions in the value chain.')
      lines.push('')

      const categories = data.scope3.categories || {}
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

      lines.push('| Category | Description | Emissions (tonnes CO2e) |')
      lines.push('|----------|-------------|------------------------|')

      Object.entries(categories).forEach(([catNum, catData]) => {
        if (catData && (catData.co2_tonnes || catData.co2e_tonnes)) {
          lines.push(
            `| ${catNum} | ${categoryNames[catNum] || 'Unknown'} | ${formatNumber(catData.co2_tonnes || catData.co2e_tonnes)} |`
          )
        }
      })

      lines.push('')

      // Note about Category 11
      if (categories[11]) {
        lines.push('> **Note:** Category 11 (Use of Sold Products) typically represents 70-90% of Scope 3 emissions for oil and gas companies.')
        lines.push('')
      }
    }
  }

  // Intensity Metrics
  if (includeIntensity && data.intensity) {
    lines.push('## Intensity Metrics')
    lines.push('')

    lines.push('| Metric | Value | Unit |')
    lines.push('|--------|-------|------|')

    if (data.intensity.carbonIntensity) {
      const ci = data.intensity.carbonIntensity
      lines.push(`| Carbon Intensity | ${formatNumber(ci.intensity)} | kg CO2e/BOE |`)
      if (ci.comparison?.rating) {
        lines.push(`| Industry Benchmark | ${ci.comparison.percentile} | ${ci.comparison.rating} |`)
      }
    }

    if (data.intensity.methaneIntensity) {
      const mi = data.intensity.methaneIntensity
      lines.push(`| Methane Intensity | ${mi.intensity.toFixed(3)} | % |`)
      if (mi.targetComparison?.ogci2025) {
        const met = mi.targetComparison.ogci2025.met ? '✓ Met' : '✗ Not Met'
        lines.push(`| OGCI 2025 Target (0.20%) | ${met} | - |`)
      }
    }

    if (data.intensity.flaringIntensity) {
      const fi = data.intensity.flaringIntensity
      lines.push(`| Flaring Intensity | ${formatNumber(fi.intensity)} | m³/BOE |`)
    }

    lines.push('')
  }

  // Regulatory Thresholds
  if (includeThresholds && data.thresholds && data.thresholds.length > 0) {
    lines.push('## Regulatory Threshold Alerts')
    lines.push('')
    lines.push('> ⚠️ **Warning:** The following regulatory thresholds have been exceeded.')
    lines.push('')

    lines.push('| Regulation | Value | Threshold | Requirement |')
    lines.push('|------------|-------|-----------|-------------|')

    data.thresholds.forEach(threshold => {
      lines.push(
        `| ${threshold.threshold} | ${formatNumber(threshold.value)} ${threshold.unit} | ${formatNumber(threshold.limit)} | ${threshold.requirement} |`
      )
    })

    lines.push('')
  }

  // Methodology
  lines.push('## Methodology')
  lines.push('')
  lines.push('This report was generated following:')
  lines.push('')
  lines.push('- **GHG Protocol Corporate Standard** for Scope 1 and 2 emissions')
  lines.push('- **GHG Protocol Scope 3 Standard** for value chain emissions')
  lines.push('- **40 CFR Part 98** for flaring calculations (Subpart Y)')
  lines.push('- **EPA Emission Factors Hub** for combustion emission factors')
  lines.push('')

  // Footer
  lines.push('---')
  lines.push('')
  lines.push('*Generated by [CarbonScope](https://github.com/carbonscope) - ESG Carbon Footprint Calculator*')

  return lines.join('\n')
}

/**
 * Download Markdown report
 *
 * @param {Object} data - Calculation data
 * @param {string} filename - Output filename
 * @param {Object} options - Export options
 */
export function downloadMarkdownReport(data, filename = 'emissions-report.md', options = {}) {
  const content = generateMarkdownReport(data, options)
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
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
 * Copy Markdown to clipboard
 *
 * @param {Object} data - Calculation data
 * @param {Object} options - Export options
 * @returns {Promise<boolean>} Success status
 */
export async function copyMarkdownToClipboard(data, options = {}) {
  try {
    const content = generateMarkdownReport(data, options)
    await navigator.clipboard.writeText(content)
    return true
  } catch {
    return false
  }
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export default {
  generateMarkdownReport,
  downloadMarkdownReport,
  copyMarkdownToClipboard,
}
