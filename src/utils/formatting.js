/**
 * Formatting utilities for numbers, dates, and display values
 */

/**
 * Format a number with thousand separators and decimal places
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a large number with abbreviations (K, M, B)
 * @param {number} value - The number to format
 * @returns {string} Abbreviated number string
 */
export function formatCompactNumber(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

/**
 * Format emissions value with unit
 * @param {number} value - Emissions in tonnes CO2e
 * @param {string} unit - Unit label (default: 'tonnes CO2e')
 * @returns {string} Formatted emissions string
 */
export function formatEmissions(value, unit = 'tonnes CO2e') {
  if (value === null || value === undefined || isNaN(value)) {
    return '—'
  }

  if (value >= 1000000) {
    return `${formatNumber(value / 1000000, 2)} M ${unit}`
  }
  if (value >= 1000) {
    return `${formatNumber(value / 1000, 2)} K ${unit}`
  }
  return `${formatNumber(value, 2)} ${unit}`
}

/**
 * Format percentage value
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—'
  }
  return `${formatNumber(value, decimals)}%`
}

/**
 * Format a date string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '—'

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  try {
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date))
  } catch {
    return '—'
  }
}

/**
 * Format a date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format source name for display
 * @param {string} source - Source key
 * @returns {string} Human-readable source name
 */
export function formatSourceName(source) {
  const names = {
    stationaryCombustion: 'Stationary Combustion',
    mobileCombustion: 'Mobile Combustion',
    flaring: 'Flaring',
    venting: 'Venting',
    fugitiveEmissions: 'Fugitive Emissions',
    processEmissions: 'Process Emissions',
    electricity: 'Electricity',
    steam: 'Purchased Steam',
    heating: 'Purchased Heating',
    cooling: 'Purchased Cooling',
  }
  return names[source] || source.replace(/([A-Z])/g, ' $1').trim()
}

/**
 * Format Scope 3 category name
 * @param {number|string} category - Category number or key
 * @returns {string} Full category name
 */
export function formatScope3Category(category) {
  const names = {
    1: 'Purchased Goods and Services',
    2: 'Capital Goods',
    3: 'Fuel and Energy Related Activities',
    4: 'Upstream Transportation and Distribution',
    5: 'Waste Generated in Operations',
    6: 'Business Travel',
    7: 'Employee Commuting',
    8: 'Upstream Leased Assets',
    9: 'Downstream Transportation and Distribution',
    10: 'Processing of Sold Products',
    11: 'Use of Sold Products',
    12: 'End-of-Life Treatment of Sold Products',
    13: 'Downstream Leased Assets',
    14: 'Franchises',
    15: 'Investments',
  }

  const num = typeof category === 'string' ? parseInt(category.replace('category', ''), 10) : category
  return names[num] ? `Category ${num}: ${names[num]}` : `Category ${category}`
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}
