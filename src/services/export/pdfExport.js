/**
 * PDF Export Service
 * Generates PDF reports for emission calculations
 * Uses jsPDF library
 */

import { jsPDF } from 'jspdf'

/**
 * Default PDF options
 */
const DEFAULT_OPTIONS = {
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  fonts: {
    title: { size: 20, style: 'bold' },
    heading: { size: 14, style: 'bold' },
    subheading: { size: 12, style: 'bold' },
    body: { size: 10, style: 'normal' },
    small: { size: 8, style: 'normal' },
  },
  colors: {
    primary: [16, 185, 129], // Green
    secondary: [71, 85, 105], // Slate
    scope1: [239, 68, 68], // Red
    scope2: [245, 158, 11], // Amber
    scope3: [59, 130, 246], // Blue
    text: [15, 23, 42],
    muted: [100, 116, 139],
  },
}

/**
 * Generate PDF report from calculation results
 *
 * @param {Object} data - Calculation data
 * @param {Object} options - PDF options
 * @returns {jsPDF} PDF document
 */
export function generateReport(data, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const doc = new jsPDF({
    orientation: opts.orientation,
    unit: opts.unit,
    format: opts.format,
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - opts.margins.left - opts.margins.right

  let y = opts.margins.top

  // Helper functions
  const setFont = (type) => {
    const font = opts.fonts[type]
    doc.setFontSize(font.size)
    doc.setFont('helvetica', font.style)
  }

  const setColor = (colorName) => {
    const color = opts.colors[colorName]
    doc.setTextColor(color[0], color[1], color[2])
  }

  const addLine = (text, type = 'body', color = 'text') => {
    setFont(type)
    setColor(color)
    doc.text(text, opts.margins.left, y)
    y += opts.fonts[type].size * 0.5
  }

  const addSpace = (mm = 5) => {
    y += mm
  }

  const checkNewPage = (needed = 20) => {
    if (y + needed > pageHeight - opts.margins.bottom) {
      doc.addPage()
      y = opts.margins.top
      return true
    }
    return false
  }

  // Title Section
  setFont('title')
  setColor('primary')
  doc.text('Carbon Emissions Report', opts.margins.left, y)
  y += 10

  // Facility Info
  if (data.facility) {
    setFont('body')
    setColor('muted')
    doc.text(`Facility: ${data.facility.name}`, opts.margins.left, y)
    y += 5
    if (data.facility.location) {
      doc.text(`Location: ${data.facility.location}`, opts.margins.left, y)
      y += 5
    }
  }

  // Report Date
  setFont('small')
  setColor('muted')
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, opts.margins.left, y)
  y += 3
  if (data.metadata?.reportingPeriod) {
    doc.text(`Reporting Period: ${data.metadata.reportingPeriod}`, opts.margins.left, y)
    y += 3
  }
  doc.text(`GWP Version: ${data.metadata?.gwpVersion || 'AR5'}`, opts.margins.left, y)

  addSpace(10)

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.line(opts.margins.left, y, pageWidth - opts.margins.right, y)
  addSpace(10)

  // Executive Summary
  addLine('Executive Summary', 'heading', 'text')
  addSpace(5)

  const totals = data.totals || {}
  const totalEmissions = totals.total_tonnes || 0

  setFont('body')
  setColor('text')
  doc.text(
    `Total GHG Emissions: ${formatNumber(totalEmissions)} tonnes CO2e`,
    opts.margins.left,
    y
  )
  y += 6

  // Scope breakdown
  const scopeData = [
    { name: 'Scope 1 (Direct)', value: totals.scope1_tonnes || 0, color: opts.colors.scope1 },
    { name: 'Scope 2 (Energy)', value: totals.scope2_tonnes || 0, color: opts.colors.scope2 },
    { name: 'Scope 3 (Value Chain)', value: totals.scope3_tonnes || 0, color: opts.colors.scope3 },
  ]

  scopeData.forEach(scope => {
    const percent = totalEmissions > 0 ? (scope.value / totalEmissions) * 100 : 0
    doc.setTextColor(scope.color[0], scope.color[1], scope.color[2])
    doc.text(
      `${scope.name}: ${formatNumber(scope.value)} tonnes (${percent.toFixed(1)}%)`,
      opts.margins.left + 5,
      y
    )
    y += 5
  })

  addSpace(10)

  // Scope 1 Details
  if (data.scope1 && totals.scope1_tonnes > 0) {
    checkNewPage(40)

    addLine('Scope 1 - Direct Emissions', 'heading', 'scope1')
    addSpace(5)

    setFont('body')
    setColor('text')

    if (data.scope1.stationaryCombustion) {
      doc.text(
        `Stationary Combustion: ${formatNumber(data.scope1.stationaryCombustion.co2e_tonnes)} tonnes CO2e`,
        opts.margins.left + 5,
        y
      )
      y += 5
    }

    if (data.scope1.mobileCombustion) {
      doc.text(
        `Mobile Combustion: ${formatNumber(data.scope1.mobileCombustion.co2e_tonnes)} tonnes CO2e`,
        opts.margins.left + 5,
        y
      )
      y += 5
    }

    if (data.scope1.flaring) {
      doc.text(
        `Flaring: ${formatNumber(data.scope1.flaring.co2e_tonnes)} tonnes CO2e`,
        opts.margins.left + 5,
        y
      )
      y += 5
    }

    if (data.scope1.venting) {
      doc.text(
        `Venting: ${formatNumber(data.scope1.venting.co2e_tonnes)} tonnes CO2e`,
        opts.margins.left + 5,
        y
      )
      y += 5
    }

    if (data.scope1.fugitive) {
      doc.text(
        `Fugitive Emissions: ${formatNumber(data.scope1.fugitive.co2e_tonnes)} tonnes CO2e`,
        opts.margins.left + 5,
        y
      )
      y += 5
    }

    addSpace(8)
  }

  // Scope 2 Details
  if (data.scope2 && totals.scope2_tonnes > 0) {
    checkNewPage(30)

    addLine('Scope 2 - Energy Indirect Emissions', 'heading', 'scope2')
    addSpace(5)

    setFont('body')
    setColor('text')

    if (data.scope2.locationBased) {
      doc.text(
        `Location-Based: ${formatNumber(data.scope2.locationBased.co2e_tonnes)} tonnes CO2e`,
        opts.margins.left + 5,
        y
      )
      y += 5
    }

    if (data.scope2.marketBased) {
      doc.text(
        `Market-Based: ${formatNumber(data.scope2.marketBased.co2e_tonnes)} tonnes CO2e`,
        opts.margins.left + 5,
        y
      )
      y += 5
    }

    addSpace(8)
  }

  // Scope 3 Details
  if (data.scope3 && totals.scope3_tonnes > 0) {
    checkNewPage(30)

    addLine('Scope 3 - Value Chain Emissions', 'heading', 'scope3')
    addSpace(5)

    setFont('body')
    setColor('text')

    const categories = data.scope3.categories || {}
    Object.entries(categories).forEach(([catNum, catData]) => {
      if (catData && (catData.co2_tonnes || catData.co2e_tonnes)) {
        doc.text(
          `Category ${catNum}: ${formatNumber(catData.co2_tonnes || catData.co2e_tonnes)} tonnes CO2e`,
          opts.margins.left + 5,
          y
        )
        y += 5
      }
    })

    addSpace(8)
  }

  // Intensity Metrics
  if (data.intensity) {
    checkNewPage(40)

    addLine('Intensity Metrics', 'heading', 'text')
    addSpace(5)

    setFont('body')
    setColor('text')

    if (data.intensity.carbonIntensity) {
      doc.text(
        `Carbon Intensity: ${formatNumber(data.intensity.carbonIntensity.intensity)} kg CO2e/BOE`,
        opts.margins.left + 5,
        y
      )
      y += 5
    }

    if (data.intensity.methaneIntensity) {
      doc.text(
        `Methane Intensity: ${data.intensity.methaneIntensity.intensity.toFixed(3)}%`,
        opts.margins.left + 5,
        y
      )
      y += 5
    }

    if (data.intensity.flaringIntensity) {
      doc.text(
        `Flaring Intensity: ${formatNumber(data.intensity.flaringIntensity.intensity)} m³/BOE`,
        opts.margins.left + 5,
        y
      )
      y += 5
    }

    addSpace(8)
  }

  // Regulatory Thresholds
  if (data.thresholds && data.thresholds.length > 0) {
    checkNewPage(30)

    addLine('Regulatory Threshold Alerts', 'heading', 'text')
    addSpace(5)

    setFont('body')
    data.thresholds.forEach(threshold => {
      doc.setTextColor(239, 68, 68) // Red for alerts
      doc.text(
        `⚠ ${threshold.threshold}: ${formatNumber(threshold.value)} ${threshold.unit} (Limit: ${formatNumber(threshold.limit)})`,
        opts.margins.left + 5,
        y
      )
      y += 5
    })

    addSpace(8)
  }

  // Footer
  const footerY = pageHeight - 10
  setFont('small')
  setColor('muted')
  doc.text(
    'Generated by CarbonScope - ESG Carbon Footprint Calculator',
    opts.margins.left,
    footerY
  )
  doc.text(
    `Page 1`,
    pageWidth - opts.margins.right - 20,
    footerY
  )

  return doc
}

/**
 * Download PDF report
 *
 * @param {Object} data - Calculation data
 * @param {string} filename - Output filename
 * @param {Object} options - PDF options
 */
export function downloadReport(data, filename = 'emissions-report.pdf', options = {}) {
  const doc = generateReport(data, options)
  doc.save(filename)
}

/**
 * Get PDF as blob
 *
 * @param {Object} data - Calculation data
 * @param {Object} options - PDF options
 * @returns {Blob} PDF blob
 */
export function getReportBlob(data, options = {}) {
  const doc = generateReport(data, options)
  return doc.output('blob')
}

/**
 * Get PDF as base64
 *
 * @param {Object} data - Calculation data
 * @param {Object} options - PDF options
 * @returns {string} Base64 encoded PDF
 */
export function getReportBase64(data, options = {}) {
  const doc = generateReport(data, options)
  return doc.output('datauristring')
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
  generateReport,
  downloadReport,
  getReportBlob,
  getReportBase64,
}
