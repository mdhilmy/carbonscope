/**
 * Input validation utilities
 */

/**
 * Check if a value is a valid positive number
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export function isPositiveNumber(value) {
  const num = parseFloat(value)
  return !isNaN(num) && num > 0 && isFinite(num)
}

/**
 * Check if a value is a valid non-negative number
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export function isNonNegativeNumber(value) {
  const num = parseFloat(value)
  return !isNaN(num) && num >= 0 && isFinite(num)
}

/**
 * Check if a value is within a range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean}
 */
export function isInRange(value, min, max) {
  const num = parseFloat(value)
  return !isNaN(num) && num >= min && num <= max
}

/**
 * Check if a string is not empty
 * @param {string} value - Value to check
 * @returns {boolean}
 */
export function isNotEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate facility data
 * @param {object} facility - Facility object to validate
 * @returns {{valid: boolean, errors: object}}
 */
export function validateFacility(facility) {
  const errors = {}

  if (!isNotEmpty(facility?.name)) {
    errors.name = 'Facility name is required'
  }

  if (!isNotEmpty(facility?.type)) {
    errors.type = 'Facility type is required'
  }

  if (!isNotEmpty(facility?.region)) {
    errors.region = 'Region is required'
  }

  if (facility?.equityShare !== undefined && !isInRange(facility.equityShare, 0, 100)) {
    errors.equityShare = 'Equity share must be between 0 and 100'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate calculation input
 * @param {object} input - Calculation input to validate
 * @returns {{valid: boolean, errors: object}}
 */
export function validateCalculationInput(input) {
  const errors = {}

  // Validate fuel inputs
  if (input?.scope1?.stationaryCombustion) {
    input.scope1.stationaryCombustion.forEach((fuel, index) => {
      if (!isPositiveNumber(fuel.quantity)) {
        errors[`scope1.stationaryCombustion.${index}.quantity`] = 'Quantity must be a positive number'
      }
    })
  }

  // Validate flaring
  if (input?.scope1?.flaring?.volume !== undefined && !isNonNegativeNumber(input.scope1.flaring.volume)) {
    errors['scope1.flaring.volume'] = 'Flare gas volume must be a non-negative number'
  }

  // Validate electricity
  if (input?.scope2?.electricity?.kWh !== undefined && !isNonNegativeNumber(input.scope2.electricity.kWh)) {
    errors['scope2.electricity.kWh'] = 'Electricity consumption must be a non-negative number'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate API key format (basic check)
 * @param {string} key - API key to validate
 * @param {string} apiType - Type of API
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateApiKey(key, apiType) {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'API key is required' }
  }

  const trimmedKey = key.trim()

  if (trimmedKey.length < 10) {
    return { valid: false, error: 'API key appears to be too short' }
  }

  if (trimmedKey.length > 100) {
    return { valid: false, error: 'API key appears to be too long' }
  }

  // Check for spaces or invalid characters
  if (/\s/.test(trimmedKey)) {
    return { valid: false, error: 'API key should not contain spaces' }
  }

  return { valid: true, error: null }
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return ''

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Parse and validate numeric input
 * @param {string|number} value - Value to parse
 * @param {number} defaultValue - Default if invalid
 * @returns {number}
 */
export function parseNumericInput(value, defaultValue = 0) {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}
