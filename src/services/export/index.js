/**
 * Export Services Index
 * Central export for all report generation and export functionality
 */

// PDF Export
export {
  generateReport as generatePdfReport,
  downloadReport as downloadPdfReport,
  getReportBlob as getPdfBlob,
  getReportBase64 as getPdfBase64,
} from './pdfExport'

// Markdown Export
export {
  generateMarkdownReport,
  downloadMarkdownReport,
  copyMarkdownToClipboard,
} from './markdownExport'

// CSV Export
export {
  generateEmissionsCSV,
  generateDetailedCSV,
  generateIntensityCSV,
  downloadCSV,
  downloadEmissionsCSV,
  downloadDetailedCSV,
  downloadIntensityCSV,
} from './csvExport'

// Import default exports
import pdfExport from './pdfExport'
import markdownExport from './markdownExport'
import csvExport from './csvExport'

/**
 * Export format configurations
 */
export const EXPORT_FORMATS = {
  pdf: {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Formatted report with charts and tables',
    extension: '.pdf',
    mimeType: 'application/pdf',
  },
  markdown: {
    id: 'markdown',
    name: 'Markdown',
    description: 'Plain text with formatting',
    extension: '.md',
    mimeType: 'text/markdown',
  },
  csv: {
    id: 'csv',
    name: 'CSV',
    description: 'Spreadsheet-compatible data',
    extension: '.csv',
    mimeType: 'text/csv',
  },
  json: {
    id: 'json',
    name: 'JSON',
    description: 'Raw data for integration',
    extension: '.json',
    mimeType: 'application/json',
  },
}

/**
 * Export data in specified format
 *
 * @param {Object} data - Calculation data
 * @param {string} format - Export format (pdf, markdown, csv, json)
 * @param {Object} options - Format-specific options
 * @returns {Promise<void>}
 */
export async function exportData(data, format, options = {}) {
  const { filename } = options
  const timestamp = new Date().toISOString().split('T')[0]
  const facilityName = data.facility?.name?.replace(/\s+/g, '-') || 'report'

  switch (format) {
    case 'pdf':
      pdfExport.downloadReport(data, filename || `${facilityName}-emissions-${timestamp}.pdf`, options)
      break

    case 'markdown':
      markdownExport.downloadMarkdownReport(data, filename || `${facilityName}-emissions-${timestamp}.md`, options)
      break

    case 'csv':
      csvExport.downloadEmissionsCSV(data, filename || `${facilityName}-emissions-${timestamp}.csv`, options)
      break

    case 'csv-detailed':
      csvExport.downloadDetailedCSV(data, filename || `${facilityName}-emissions-detailed-${timestamp}.csv`, options)
      break

    case 'csv-intensity':
      csvExport.downloadIntensityCSV(data, filename || `${facilityName}-intensity-${timestamp}.csv`, options)
      break

    case 'json':
      downloadJson(data, filename || `${facilityName}-emissions-${timestamp}.json`)
      break

    default:
      throw new Error(`Unknown export format: ${format}`)
  }
}

/**
 * Download data as JSON
 *
 * @param {Object} data - Data to export
 * @param {string} filename - Output filename
 */
function downloadJson(data, filename) {
  const content = JSON.stringify(data, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
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
 * Generate preview content for format
 *
 * @param {Object} data - Calculation data
 * @param {string} format - Export format
 * @returns {string|null} Preview content
 */
export function getPreview(data, format) {
  switch (format) {
    case 'markdown':
      return markdownExport.generateMarkdownReport(data)

    case 'csv':
      return csvExport.generateEmissionsCSV(data)

    case 'json':
      return JSON.stringify(data, null, 2)

    default:
      return null
  }
}

export default {
  pdfExport,
  markdownExport,
  csvExport,
  EXPORT_FORMATS,
  exportData,
  getPreview,
}
