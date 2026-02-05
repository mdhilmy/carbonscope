// Application constants

export const APP_NAME = 'CarbonScope'
export const APP_VERSION = '1.0.0'

// GWP Version options
export const GWP_VERSIONS = {
  AR5: 'AR5',
  AR6: 'AR6',
}

// Default settings
export const DEFAULT_SETTINGS = {
  gwpVersion: GWP_VERSIONS.AR5,
  units: 'metric',
  defaultRegion: 'US',
  theme: 'light',
}

// Calculation modes
export const CALCULATION_MODES = {
  SIMPLE: 'simple',
  EXPERT: 'expert',
}

// Facility types
export const FACILITY_TYPES = {
  PRODUCTION: 'production',
  REFINERY: 'refinery',
  PIPELINE: 'pipeline',
  TERMINAL: 'terminal',
  GATHERING: 'gathering',
  PROCESSING: 'processing',
  OTHER: 'other',
}

export const FACILITY_TYPE_LABELS = {
  [FACILITY_TYPES.PRODUCTION]: 'Production',
  [FACILITY_TYPES.REFINERY]: 'Refinery',
  [FACILITY_TYPES.PIPELINE]: 'Pipeline',
  [FACILITY_TYPES.TERMINAL]: 'Terminal',
  [FACILITY_TYPES.GATHERING]: 'Gathering',
  [FACILITY_TYPES.PROCESSING]: 'Processing',
  [FACILITY_TYPES.OTHER]: 'Other',
}

// Scope colors for charts
export const SCOPE_COLORS = {
  scope1: '#ef4444',
  scope2: '#f59e0b',
  scope3: '#3b82f6',
}

// API configuration
export const API_CONFIG = {
  EPA_BASE_URL: 'https://data.epa.gov/efservice',
  UK_CARBON_BASE_URL: 'https://api.carbonintensity.org.uk',
  EIA_BASE_URL: 'https://api.eia.gov/v2',
  OWID_DATA_URL: 'https://nyc3.digitaloceanspaces.com/owid-public/data/co2/owid-co2-data.json',
  WORLD_BANK_BASE_URL: 'https://api.worldbank.org/v2',
  DEFAULT_TIMEOUT: 5000,
}

// Local storage keys
export const STORAGE_KEYS = {
  API_KEYS: 'carbonscope_api_keys',
  SETTINGS: 'carbonscope_settings',
  FACILITIES: 'carbonscope_facilities',
  CALCULATIONS: 'carbonscope_calculations',
}

// API key names
export const API_KEY_NAMES = {
  EIA: 'eia',
  ELECTRICITY_MAPS: 'electricityMaps',
}

// Maximum limits
export const LIMITS = {
  MAX_FACILITIES: 100,
  MAX_CALCULATIONS: 1000,
  MAX_EXPORT_SIZE_MB: 10,
  MAX_OFFLINE_STORAGE_MB: 50,
}

// Report frameworks
export const REPORT_FRAMEWORKS = {
  TCFD: 'TCFD',
  CDP: 'CDP',
  CSRD: 'CSRD',
  SEC: 'SEC',
  CUSTOM: 'CUSTOM',
}

// Navigation items
export const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'Home' },
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/calculator', label: 'Calculator', icon: 'Calculator' },
  { path: '/benchmarks', label: 'Benchmarks', icon: 'BarChart3' },
  { path: '/reports', label: 'Reports', icon: 'FileText' },
  { path: '/facilities', label: 'Facilities', icon: 'Building2' },
  { path: '/tools', label: 'Tools', icon: 'Wrench' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
  { path: '/help', label: 'Help', icon: 'HelpCircle' },
]
