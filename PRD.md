# Product Requirements Document (PRD)
# CarbonScope - ESG Carbon Footprint Calculator for Oil & Gas Operations

**Version:** 1.0  
**Date:** February 2026  
**Status:** Ready for Development

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [File Structure](#2-file-structure)
3. [Naming Patterns](#3-naming-patterns)
4. [UI Design Specifications](#4-ui-design-specifications)
5. [Key Features and User Flow](#5-key-features-and-user-flow)
6. [Constraints and Guardrails](#6-constraints-and-guardrails)
7. [Security Specifications](#7-security-specifications)
8. [API Integration Details](#8-api-integration-details)
9. [Data Models and Calculations](#9-data-models-and-calculations)
10. [Offline Functionality](#10-offline-functionality)
11. [Deployment Specifications](#11-deployment-specifications)

---

## 1. Product Overview

### 1.1 Product Summary

**CarbonScope** is a comprehensive web-based ESG carbon footprint calculator specifically designed for oil and gas operations professionals, including petroleum engineers, ESG analysts, sustainability managers, compliance officers, and environmental consultants. The application implements GHG Protocol methodologies for calculating Scope 1, 2, and 3 emissions from various O&G sources including flaring, venting, combustion, fugitive releases, and supply chain activities.

The platform provides outputs aligned with global reporting frameworks including TCFD, SEC Climate Disclosure Rules, EU CSRD/ESRS, CDP, and regional requirements from Malaysia (Bursa), Singapore (SGX), and Australia (NGER). Users can perform calculations ranging from quick estimates in simplified mode to detailed equipment-level assessments in expert mode.

### 1.2 Target Users

| User Type | Primary Needs |
|-----------|---------------|
| Petroleum Engineers | Equipment-level emission calculations, flaring/venting analysis |
| ESG/Sustainability Managers | Corporate-level reporting, benchmark comparisons |
| Environmental Compliance Officers | Regulatory threshold monitoring, audit documentation |
| Petroleum Economists | Carbon cost analysis, intensity metrics |
| Environmental Consultants | Multi-facility assessments, client reporting |

### 1.3 Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | React 18 with Vite | Fast development, modern tooling |
| Routing | React Router with HashRouter | GitHub Pages compatibility |
| Styling | Tailwind CSS | Utility-first, responsive design |
| State Management | React Context + useReducer | Built-in, sufficient complexity |
| Offline Storage | Dexie.js (IndexedDB) | Robust offline data persistence |
| Service Worker | Workbox | PWA caching and offline support |
| Charts | Chart.js + react-chartjs-2 | Comprehensive visualization |
| Math | math.js + big.js | Unit-aware calculations, precision |
| PDF Export | jsPDF + jspdf-autotable | Report generation |
| Markdown Export | Native JS | Documentation output |
| Icons | Lucide React | Consistent, lightweight icons |

### 1.4 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

---

## 2. File Structure

```
carbonscope/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── assets/
│       ├── logo.svg
│       └── icons/
│           ├── icon-192.png
│           └── icon-512.png
│
├── src/
│   ├── main.jsx                          # App entry point
│   ├── App.jsx                           # Root component with routing
│   ├── index.css                         # Tailwind imports + global styles
│   │
│   ├── components/
│   │   ├── common/                       # Shared UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── Toggle.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Accordion.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   │
│   │   ├── layout/                       # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── MobileMenu.jsx
│   │   │   └── PageContainer.jsx
│   │   │
│   │   ├── calculator/                   # Calculator components
│   │   │   ├── CalculatorWizard.jsx
│   │   │   ├── WizardProgress.jsx
│   │   │   ├── ModeSelector.jsx
│   │   │   ├── scope1/
│   │   │   │   ├── Scope1Calculator.jsx
│   │   │   │   ├── StationaryCombustion.jsx
│   │   │   │   ├── MobileCombustion.jsx
│   │   │   │   ├── ProcessEmissions.jsx
│   │   │   │   ├── FugitiveEmissions.jsx
│   │   │   │   ├── FlaringCalculator.jsx
│   │   │   │   ├── VentingCalculator.jsx
│   │   │   │   └── EquipmentLeaks.jsx
│   │   │   ├── scope2/
│   │   │   │   ├── Scope2Calculator.jsx
│   │   │   │   ├── LocationBasedMethod.jsx
│   │   │   │   ├── MarketBasedMethod.jsx
│   │   │   │   ├── GridFactorSelector.jsx
│   │   │   │   └── EnergySourceInput.jsx
│   │   │   ├── scope3/
│   │   │   │   ├── Scope3Calculator.jsx
│   │   │   │   ├── CategorySelector.jsx
│   │   │   │   ├── Category1PurchasedGoods.jsx
│   │   │   │   ├── Category3FuelEnergy.jsx
│   │   │   │   ├── Category4Transportation.jsx
│   │   │   │   ├── Category9DownstreamTransport.jsx
│   │   │   │   ├── Category10Processing.jsx
│   │   │   │   ├── Category11UseSoldProducts.jsx
│   │   │   │   └── OtherCategories.jsx
│   │   │   └── results/
│   │   │       ├── ResultsSummary.jsx
│   │   │       ├── EmissionsBreakdown.jsx
│   │   │       ├── ScopeComparison.jsx
│   │   │       └── IntensityMetrics.jsx
│   │   │
│   │   ├── benchmarks/                   # Benchmarking components
│   │   │   ├── BenchmarkDashboard.jsx
│   │   │   ├── MethaneIntensity.jsx
│   │   │   ├── CarbonIntensity.jsx
│   │   │   ├── IndustryComparison.jsx
│   │   │   ├── RegionalComparison.jsx
│   │   │   └── RegulatoryThresholds.jsx
│   │   │
│   │   ├── reports/                      # Reporting components
│   │   │   ├── ReportBuilder.jsx
│   │   │   ├── ReportTemplateSelector.jsx
│   │   │   ├── TCFDReport.jsx
│   │   │   ├── CDPReport.jsx
│   │   │   ├── CSRDReport.jsx
│   │   │   ├── SECReport.jsx
│   │   │   ├── CustomReport.jsx
│   │   │   ├── ReportPreview.jsx
│   │   │   └── ExportOptions.jsx
│   │   │
│   │   ├── facilities/                   # Facility management
│   │   │   ├── FacilityList.jsx
│   │   │   ├── FacilityCard.jsx
│   │   │   ├── FacilityForm.jsx
│   │   │   ├── FacilityDetails.jsx
│   │   │   └── FacilityAggregation.jsx
│   │   │
│   │   ├── charts/                       # Visualization components
│   │   │   ├── EmissionsPieChart.jsx
│   │   │   ├── ScopeBarChart.jsx
│   │   │   ├── TrendLineChart.jsx
│   │   │   ├── IntensityGauge.jsx
│   │   │   ├── BenchmarkRadar.jsx
│   │   │   ├── ThresholdIndicator.jsx
│   │   │   └── SankeyDiagram.jsx
│   │   │
│   │   ├── tools/                        # Utility tools
│   │   │   ├── UnitConverter.jsx
│   │   │   ├── GWPCalculator.jsx
│   │   │   ├── EmissionFactorLookup.jsx
│   │   │   └── DataImporter.jsx
│   │   │
│   │   └── settings/                     # Settings components
│   │       ├── SettingsPanel.jsx
│   │       ├── APIKeyManager.jsx
│   │       ├── RegionSelector.jsx
│   │       ├── UnitsPreferences.jsx
│   │       └── DataManagement.jsx
│   │
│   ├── pages/                            # Page components
│   │   ├── HomePage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── CalculatorPage.jsx
│   │   ├── BenchmarksPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── FacilitiesPage.jsx
│   │   ├── ToolsPage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── HelpPage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useCalculation.js
│   │   ├── useEmissionFactors.js
│   │   ├── useGridIntensity.js
│   │   ├── useBenchmarks.js
│   │   ├── useFacilities.js
│   │   ├── useLocalStorage.js
│   │   ├── useOfflineStorage.js
│   │   ├── useAPIKeys.js
│   │   ├── useUnitConversion.js
│   │   └── useExport.js
│   │
│   ├── context/                          # React Context providers
│   │   ├── AppContext.jsx
│   │   ├── CalculationContext.jsx
│   │   ├── FacilityContext.jsx
│   │   ├── SettingsContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── services/                         # API and data services
│   │   ├── api/
│   │   │   ├── apiClient.js              # Base API client with error handling
│   │   │   ├── epaApi.js                 # EPA Envirofacts API
│   │   │   ├── eiaApi.js                 # EIA API (requires key)
│   │   │   ├── ukCarbonApi.js            # UK Carbon Intensity API
│   │   │   ├── worldBankApi.js           # World Bank API
│   │   │   ├── owdApi.js                 # Our World in Data
│   │   │   └── electricityMapsApi.js     # ElectricityMaps API
│   │   ├── calculations/
│   │   │   ├── scope1Calculations.js
│   │   │   ├── scope2Calculations.js
│   │   │   ├── scope3Calculations.js
│   │   │   ├── flaringCalculations.js
│   │   │   ├── fugitiveCalculations.js
│   │   │   ├── gwpConversions.js
│   │   │   └── intensityMetrics.js
│   │   ├── storage/
│   │   │   ├── indexedDB.js              # Dexie.js database setup
│   │   │   ├── facilityStorage.js
│   │   │   ├── calculationStorage.js
│   │   │   └── settingsStorage.js
│   │   └── export/
│   │       ├── pdfExport.js
│   │       ├── markdownExport.js
│   │       ├── csvExport.js
│   │       └── jsonExport.js
│   │
│   ├── data/                             # Static data files
│   │   ├── emissionFactors/
│   │   │   ├── epaFactors.json           # US EPA emission factors
│   │   │   ├── ukDefraFactors.json       # UK DEFRA/DESNZ factors
│   │   │   ├── euEtsFactors.json         # EU ETS factors
│   │   │   ├── ipccFactors.json          # IPCC default factors
│   │   │   └── regionalFactors.json      # Other regional factors
│   │   ├── gridFactors/
│   │   │   ├── usEgridFactors.json       # US eGRID subregional
│   │   │   ├── globalGridFactors.json    # International grid factors
│   │   │   └── malaysiaGridFactors.json  # Malaysia state-level
│   │   ├── benchmarks/
│   │   │   ├── industryBenchmarks.json   # O&G industry averages
│   │   │   ├── regionalBenchmarks.json   # Regional intensity data
│   │   │   └── companyTargets.json       # Major company targets
│   │   ├── equipment/
│   │   │   ├── pneumaticDevices.json     # Pneumatic device factors
│   │   │   ├── compressors.json          # Compressor factors
│   │   │   ├── storageTanks.json         # Storage tank factors
│   │   │   └── componentFactors.json     # Fugitive component factors
│   │   ├── thresholds/
│   │   │   └── regulatoryThresholds.json # Reporting thresholds
│   │   ├── gwpValues.json                # AR5/AR6 GWP values
│   │   ├── unitConversions.json          # Unit conversion factors
│   │   └── fuelProperties.json           # Fuel heating values
│   │
│   ├── utils/                            # Utility functions
│   │   ├── calculations.js               # Math helper functions
│   │   ├── conversions.js                # Unit conversions
│   │   ├── formatting.js                 # Number/date formatting
│   │   ├── validation.js                 # Input validation
│   │   ├── errorHandling.js              # Error utilities
│   │   └── constants.js                  # App constants
│   │
│   └── styles/                           # Additional styles
│       └── chartStyles.js                # Chart.js theme config
│
├── scripts/
│   └── generateServiceWorker.js          # SW generation script
│
├── .env.example                          # Environment template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── CLAUDE.md
├── INSTRUCTIONS.md
├── PRD.md
├── RESEARCH.md
└── README.md
```

---

## 3. Naming Patterns

### 3.1 File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| React Components | PascalCase.jsx | `FlaringCalculator.jsx` |
| Hooks | camelCase with `use` prefix | `useEmissionFactors.js` |
| Services | camelCase | `scope1Calculations.js` |
| Contexts | PascalCase with `Context` suffix | `CalculationContext.jsx` |
| Data files | camelCase.json | `epaFactors.json` |
| Utilities | camelCase.js | `conversions.js` |
| Style files | camelCase.css/js | `chartStyles.js` |

### 3.2 Variable and Function Naming

```javascript
// Constants - UPPER_SNAKE_CASE
const MAX_FACILITIES = 100;
const DEFAULT_GWP_VERSION = 'AR5';
const EPA_API_BASE_URL = 'https://data.epa.gov/efservice';

// Emission factors - descriptive with units
const naturalGasCO2Factor = 53.06; // kg CO2/MMBtu
const dieselCO2PerGallon = 10.21; // kg CO2/gallon

// Functions - camelCase with verb prefix
function calculateScope1Emissions(data) {}
function fetchGridEmissionFactor(region) {}
function convertMMBtuToMJ(value) {}
function validateFacilityData(facility) {}

// Boolean variables - is/has/should prefix
const isCalculating = false;
const hasValidApiKey = true;
const shouldShowAdvancedOptions = false;

// Event handlers - handle prefix
function handleSubmit() {}
function handleInputChange() {}
function handleExportPDF() {}

// Components - noun/noun-phrase
function EmissionsBreakdownChart() {}
function FacilitySelector() {}
function Scope1ResultsSummary() {}
```

### 3.3 CSS Class Naming (Tailwind)

```jsx
// Layout containers
<div className="cs-page-container">      // Page wrapper
<div className="cs-card">                 // Card component
<div className="cs-section">              // Section wrapper

// Component-specific classes (when Tailwind insufficient)
<div className="cs-calculator-wizard">
<div className="cs-emission-breakdown">
<div className="cs-benchmark-gauge">

// State classes
<button className="cs-btn cs-btn-primary cs-btn-loading">
<input className="cs-input cs-input-error">
```

### 3.4 Data Model Naming

```javascript
// Facility data
const facility = {
  facilityId: 'FAC-001',
  facilityName: 'Permian Basin Platform A',
  facilityType: 'production',
  regionCode: 'US-TX',
  gridSubregion: 'ERCT',
  // ...
};

// Calculation results
const scope1Result = {
  totalCO2e: 15000,          // tonnes CO2e
  co2Emissions: 14500,       // tonnes CO2
  ch4Emissions: 18,          // tonnes CH4 (before GWP)
  ch4CO2e: 450,              // tonnes CO2e (after GWP)
  n2oEmissions: 0.2,         // tonnes N2O
  n2oCO2e: 50,               // tonnes CO2e
  bySource: {
    stationaryCombustion: 8000,
    mobileCombustion: 2000,
    fugitiveEmissions: 3500,
    flaring: 1500,
  },
  calculatedAt: '2026-02-03T10:30:00Z',
  methodology: 'GHG_PROTOCOL',
  gwpVersion: 'AR5',
};

// API response handling
const gridFactorResponse = {
  success: true,
  data: {
    regionCode: 'ERCT',
    emissionFactor: 0.370,     // kg CO2/kWh
    factorUnit: 'kgCO2_per_kWh',
    dataYear: 2022,
    source: 'EPA_EGRID',
  },
  error: null,
  fetchedAt: '2026-02-03T10:30:00Z',
};
```

---

## 4. UI Design Specifications

### 4.1 Design Theme

**Primary Theme:** Light mode with natural green color scheme
**Design Philosophy:** Professional, data-driven, accessible, responsive

### 4.2 Color Palette (Tailwind Classes)

```javascript
// tailwind.config.js - Custom colors
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary - Natural Forest Green
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',   // Primary action color
          600: '#16a34a',   // Primary hover
          700: '#15803d',   // Primary active
          800: '#166534',
          900: '#14532d',
        },
        // Secondary - Slate Gray
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Accent - Emerald (for highlights)
        accent: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        // Semantic colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        // Scope colors (for charts)
        scope1: '#ef4444',    // Red - Direct emissions
        scope2: '#f59e0b',    // Amber - Energy
        scope3: '#3b82f6',    // Blue - Value chain
      },
    },
  },
};
```

### 4.3 Typography

```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Type Scale */
--text-xs: 0.75rem;     /* 12px - Labels, captions */
--text-sm: 0.875rem;    /* 14px - Secondary text */
--text-base: 1rem;      /* 16px - Body text */
--text-lg: 1.125rem;    /* 18px - Lead text */
--text-xl: 1.25rem;     /* 20px - Section headers */
--text-2xl: 1.5rem;     /* 24px - Page headers */
--text-3xl: 1.875rem;   /* 30px - Main headers */
--text-4xl: 2.25rem;    /* 36px - Hero text */
```

### 4.4 Spacing System

```css
/* Base unit: 4px (Tailwind default) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### 4.5 Component Styles

#### Cards
```jsx
<div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow">
  {/* Card content */}
</div>
```

#### Buttons
```jsx
// Primary
<button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Calculate Emissions
</button>

// Secondary
<button className="bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium py-2 px-4 rounded-lg transition-colors">
  Cancel
</button>

// Outline
<button className="border border-primary-600 text-primary-600 hover:bg-primary-50 font-medium py-2 px-4 rounded-lg transition-colors">
  Export Report
</button>
```

#### Inputs
```jsx
<input 
  type="number"
  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
  placeholder="Enter value"
/>
```

#### Alerts
```jsx
// Success
<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3">
  <CheckCircle className="w-5 h-5 text-green-600" />
  <span>Calculation completed successfully</span>
</div>

// Warning
<div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-3">
  <AlertTriangle className="w-5 h-5 text-amber-600" />
  <span>Emissions exceed regulatory threshold</span>
</div>

// Error
<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3">
  <XCircle className="w-5 h-5 text-red-600" />
  <span>Failed to fetch grid emission factor</span>
</div>
```

### 4.6 Icons (Lucide React)

```jsx
import {
  // Navigation
  Home, LayoutDashboard, Calculator, BarChart3, FileText, Building2, Settings, HelpCircle,
  
  // Actions
  Plus, Minus, Edit, Trash2, Download, Upload, RefreshCw, Search, Filter, Save,
  
  // Status
  CheckCircle, AlertTriangle, XCircle, Info, AlertCircle, Clock,
  
  // Scope indicators
  Factory, Zap, Truck,
  
  // Data/Charts
  TrendingUp, TrendingDown, PieChart, LineChart, Target,
  
  // Misc
  ChevronRight, ChevronDown, ExternalLink, Copy, Share2, Moon, Sun,
} from 'lucide-react';
```

### 4.7 Responsive Breakpoints

| Breakpoint | Width | Target Device |
|------------|-------|---------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / Small laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### 4.8 Layout Patterns

#### Dashboard Layout
```jsx
<div className="min-h-screen bg-secondary-50">
  {/* Header - Fixed */}
  <Header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50" />
  
  {/* Main content area */}
  <div className="flex pt-16">
    {/* Sidebar - Hidden on mobile */}
    <Sidebar className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 bg-white border-r" />
    
    {/* Content */}
    <main className="flex-1 lg:ml-64 p-6">
      {children}
    </main>
  </div>
  
  {/* Mobile navigation */}
  <MobileMenu className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t" />
</div>
```

#### Calculator Wizard Layout
```jsx
<div className="max-w-4xl mx-auto">
  {/* Progress indicator */}
  <WizardProgress steps={steps} currentStep={currentStep} />
  
  {/* Step content */}
  <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
    {renderCurrentStep()}
  </div>
  
  {/* Navigation */}
  <div className="flex justify-between mt-6">
    <Button variant="secondary" onClick={handleBack}>Back</Button>
    <Button variant="primary" onClick={handleNext}>Continue</Button>
  </div>
</div>
```

### 4.9 Animation Guidelines

```css
/* Transitions - use Tailwind classes */
.transition-colors   /* Color changes: 150ms */
.transition-opacity  /* Fade in/out: 150ms */
.transition-transform /* Movement: 150ms */
.transition-all      /* Multiple properties: 150ms */

/* Duration modifiers */
.duration-200  /* Standard interactions */
.duration-300  /* Modal/drawer animations */
.duration-500  /* Page transitions */

/* Easing */
.ease-in-out  /* Default for most animations */
.ease-out     /* Elements entering */
.ease-in      /* Elements leaving */
```

---

## 5. Key Features and User Flow

### 5.1 Application Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with feature overview |
| Dashboard | `/dashboard` | Overview of all facilities and emissions |
| Calculator | `/calculator` | Main calculation wizard |
| Benchmarks | `/benchmarks` | Industry comparisons and thresholds |
| Reports | `/reports` | Report generation and export |
| Facilities | `/facilities` | Facility management |
| Tools | `/tools` | Unit converter, factor lookup |
| Settings | `/settings` | API keys, preferences |
| Help | `/help` | Documentation, methodology guides |

### 5.2 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOME PAGE                                │
│  • Feature overview                                              │
│  • Quick start guide                                             │
│  • Mode selection (Simple/Expert)                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD                                 │
│  • Total emissions summary                                       │
│  • Facility overview cards                                       │
│  • Quick actions                                                 │
│  • Regulatory threshold alerts                                   │
└────┬──────────┬──────────┬──────────┬──────────┬───────────────┘
     │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│CALCULATOR│ │BENCHMARKS│ │ REPORTS │ │FACILITIES│ │SETTINGS │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

### 5.3 Calculator Wizard Flow

```
STEP 1: Setup
├── Select mode (Simple/Expert)
├── Select facility or create new
├── Set reporting period
└── Choose calculation options

STEP 2: Scope 1 - Direct Emissions
├── Stationary Combustion
│   ├── Fuel type selection
│   ├── Consumption input
│   └── Emission calculation
├── Mobile Combustion
│   ├── Vehicle fleet data
│   └── Fuel consumption
├── Process Emissions
│   └── Process-specific inputs
├── Fugitive Emissions
│   ├── Component counting (Expert)
│   └── Emission factor method
├── Flaring
│   ├── Flare gas volume
│   ├── Gas composition (Expert)
│   └── Combustion efficiency
└── Venting
    └── Vent volumes by source

STEP 3: Scope 2 - Energy Emissions
├── Electricity Consumption
│   ├── Location-based calculation
│   └── Market-based calculation
├── Purchased Steam
└── Purchased Heating/Cooling

STEP 4: Scope 3 - Value Chain (Optional)
├── Category selector
├── Category-specific inputs
└── Use of Sold Products (Cat. 11)
    ├── Product volumes by type
    └── Combustion factors

STEP 5: Results & Export
├── Total emissions summary
├── Breakdown by scope/source
├── Intensity metrics
├── Benchmark comparison
└── Export options
    ├── PDF report
    ├── Markdown
    ├── CSV data
    └── JSON
```

### 5.4 Feature Specifications

#### 5.4.1 Calculator Modes

**Simple Mode:**
- Pre-configured emission factors
- Common fuel types only
- Default regional grid factors
- Estimated fugitive emissions
- Quick results

**Expert Mode:**
- Custom emission factors
- Equipment-level inputs
- Component counting for fugitives
- Gas composition analysis
- Detailed methodology selection
- Uncertainty quantification

#### 5.4.2 Scope 1 Calculator Features

| Source | Simple Mode | Expert Mode |
|--------|-------------|-------------|
| Stationary Combustion | Fuel type + volume | Equipment-specific, efficiency factors |
| Mobile Combustion | Fleet totals | Vehicle-by-vehicle, fuel types |
| Flaring | Default 98% efficiency | Custom efficiency, gas composition |
| Venting | Estimated factors | Equipment counts, measured flows |
| Fugitives | Industry average | Component count method |

#### 5.4.3 Scope 2 Calculator Features

- **Location-based:** Automatic grid factor lookup by region
- **Market-based:** Support for RECs, PPAs, supplier rates
- **Dual reporting:** Side-by-side comparison
- **Regional coverage:** US (eGRID), UK, EU, Malaysia, Australia, Singapore, and 50+ countries

#### 5.4.4 Scope 3 Calculator Features

- All 15 GHG Protocol categories available
- **Category 11 (Use of Sold Products)** highlighted for O&G
- Product-specific emission factors
- Spend-based and activity-based methods

#### 5.4.5 Benchmarking Features

- **Methane intensity:** Compare against OGCI, OGMP 2.0 targets
- **Carbon intensity:** kg CO2e/boe comparisons
- **Regional benchmarks:** Basin-specific averages
- **Regulatory thresholds:** Visual indicators when exceeded
- **Net-zero tracking:** Progress against company targets

#### 5.4.6 Reporting Features

| Framework | Output Format | Key Metrics |
|-----------|---------------|-------------|
| TCFD | Markdown | All scopes, intensity, scenario analysis |
| CDP | Markdown | Verified emissions, targets, governance |
| EU CSRD/ESRS | Markdown | Scope 1-3, transition plan, double materiality |
| SEC | Markdown | Material Scope 1&2 (when finalized) |
| Custom | PDF/MD | User-selected metrics |

---

## 6. Constraints and Guardrails

### 6.1 Technical Constraints

| Constraint | Specification | Rationale |
|------------|---------------|-----------|
| Routing | HashRouter only | GitHub Pages compatibility |
| Bundle size | < 500KB initial | Performance |
| Offline support | Core features available | Field use cases |
| API dependencies | Graceful degradation | Reliability |
| Browser support | ES2020+ | Modern features |

### 6.2 Calculation Constraints

| Constraint | Specification |
|------------|---------------|
| GWP values | AR5 by default, AR6 optional |
| Emission factors | EPA/IPCC/UK DEFRA primary sources |
| Uncertainty | Display ranges for estimates |
| Rounding | 3 significant figures for emissions |
| Units | SI units primary, imperial conversion |

### 6.3 Data Constraints

| Constraint | Specification |
|------------|---------------|
| Facilities | Maximum 100 per user |
| Calculations | Maximum 1000 stored |
| Offline storage | Maximum 50MB IndexedDB |
| Export file size | Maximum 10MB |

### 6.4 Scope Boundaries

**In Scope:**
- GHG Protocol Scope 1, 2, 3 calculations
- O&G specific emission sources
- TCFD, CDP, CSRD, SEC report formats
- Global emission factors (9+ regions)
- Offline calculation capability

**Out of Scope:**
- Real-time SCADA integration
- Blockchain verification
- Multi-user collaboration
- Paid API integrations (except optional)
- Life cycle assessment (LCA)
- Water/waste tracking

---

## 7. Security Specifications

### 7.1 API Key Management

```javascript
// API keys are stored in localStorage, encrypted with a user-provided passphrase
// Keys are NEVER committed to source code or environment variables in production

// Storage structure
const apiKeyStorage = {
  eia: {
    key: 'encrypted_key_string',
    addedAt: '2026-02-03T10:00:00Z',
    lastUsed: '2026-02-03T10:30:00Z',
    isValid: true,
  },
  electricityMaps: {
    // ...
  },
};

// Encryption using Web Crypto API
async function encryptApiKey(key, passphrase) {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  // ... derive key and encrypt
}
```

### 7.2 Security Measures

| Measure | Implementation |
|---------|----------------|
| No hardcoded keys | All API keys entered by user |
| Client-side storage | localStorage with encryption option |
| HTTPS only | All API calls over HTTPS |
| Input sanitization | All user inputs validated |
| XSS prevention | React's built-in escaping |
| CSP headers | Configured in deployment |

### 7.3 GitHub Repository Security

**.gitignore must include:**
```
# Environment files
.env
.env.local
.env.*.local

# API keys
**/apiKeys.json
**/secrets.json

# Local storage exports
**/localStorage-backup.json

# Build outputs
dist/
build/
```

### 7.4 Privacy Considerations

- No personal data collected
- All data stored locally in browser
- No analytics or tracking
- No server-side components
- User controls all data export/deletion

---

## 8. API Integration Details

### 8.1 Free APIs (No Authentication)

#### EPA Envirofacts
```javascript
// Base URL
const EPA_BASE = 'https://data.epa.gov/efservice';

// Example: Get GHG facilities in Texas
const url = `${EPA_BASE}/ghg.ghg_facility/state_code/equals/TX/1:100/JSON`;

// Response format
{
  "ghg_facility": [
    {
      "facility_id": "1001234",
      "facility_name": "Example Refinery",
      "state_code": "TX",
      "total_emissions": 500000,
      // ...
    }
  ]
}
```

#### UK Carbon Intensity
```javascript
// Base URL
const UK_CARBON_BASE = 'https://api.carbonintensity.org.uk';

// Current intensity
const url = `${UK_CARBON_BASE}/intensity`;

// Response format
{
  "data": [{
    "from": "2026-02-03T10:00Z",
    "to": "2026-02-03T10:30Z",
    "intensity": {
      "forecast": 185,
      "actual": 182,
      "index": "moderate"
    }
  }]
}
```

#### Our World in Data
```javascript
// Direct JSON access
const OWID_URL = 'https://nyc3.digitaloceanspaces.com/owid-public/data/co2/owid-co2-data.json';

// Response: Large JSON object with country-level data
{
  "USA": {
    "country": "United States",
    "data": [
      { "year": 2022, "co2": 5007.34, "co2_per_capita": 14.95, ... }
    ]
  }
}
```

#### World Bank
```javascript
// Base URL
const WORLD_BANK_BASE = 'https://api.worldbank.org/v2';

// CO2 emissions indicator
const url = `${WORLD_BANK_BASE}/country/all/indicator/EN.ATM.CO2E.KT?format=json&per_page=300`;
```

### 8.2 APIs Requiring Free Registration

#### EIA API
```javascript
// Requires free API key from: https://www.eia.gov/opendata/register.php
const EIA_BASE = 'https://api.eia.gov/v2';

// Example: State electricity emissions
const url = `${EIA_BASE}/electricity/state-electricity-profiles/emissions-by-state-by-fuel/data?api_key=${apiKey}&data[]=co2-rate-lbs-mwh`;

// User notification
{
  message: "EIA API provides enhanced US energy data. Register for a free API key at eia.gov to enable this feature.",
  required: false,
  registrationUrl: "https://www.eia.gov/opendata/register.php"
}
```

#### ElectricityMaps (Optional Premium)
```javascript
// Free tier: Limited to 1 zone
// Commercial tier: Full global coverage
const EMAPS_BASE = 'https://api-access.electricitymaps.com';

// User notification
{
  message: "ElectricityMaps provides real-time grid intensity for 50+ countries. Free tier is limited. Premium key optional for full features.",
  required: false,
  registrationUrl: "https://www.electricitymaps.com/pricing"
}
```

### 8.3 API Error Handling

```javascript
// Standard error response structure
const apiError = {
  success: false,
  error: {
    code: 'API_KEY_INVALID',
    message: 'The provided EIA API key is invalid or expired.',
    suggestion: 'Please check your API key in Settings or register for a new one.',
    fallback: 'Using cached/default emission factors instead.',
  },
  timestamp: '2026-02-03T10:30:00Z',
};

// Error codes
const API_ERROR_CODES = {
  NETWORK_ERROR: 'Unable to connect to API. Check internet connection.',
  API_KEY_INVALID: 'API key is invalid or expired.',
  API_KEY_MISSING: 'API key required but not provided.',
  RATE_LIMITED: 'API rate limit exceeded. Try again later.',
  DATA_NOT_FOUND: 'Requested data not available.',
  PARSE_ERROR: 'Unable to parse API response.',
};
```

### 8.4 Fallback Strategy

```javascript
// Priority order for grid emission factors
const gridFactorSources = [
  { name: 'ElectricityMaps', requiresKey: true, realtime: true },
  { name: 'UK Carbon Intensity', requiresKey: false, realtime: true, regions: ['GB'] },
  { name: 'EIA', requiresKey: true, realtime: false, regions: ['US'] },
  { name: 'Local Cache', requiresKey: false, realtime: false },
  { name: 'Default Factors', requiresKey: false, realtime: false },
];

// Fallback flow
async function getGridFactor(region) {
  for (const source of gridFactorSources) {
    if (source.requiresKey && !hasApiKey(source.name)) continue;
    if (source.regions && !source.regions.includes(region)) continue;
    
    try {
      const factor = await fetchFromSource(source, region);
      if (factor) return { factor, source: source.name };
    } catch (error) {
      console.warn(`${source.name} failed:`, error);
    }
  }
  return { factor: DEFAULT_FACTORS[region], source: 'default' };
}
```

---

## 9. Data Models and Calculations

### 9.1 Core Data Structures

```typescript
// Facility
interface Facility {
  id: string;
  name: string;
  type: 'production' | 'refinery' | 'pipeline' | 'terminal' | 'other';
  region: string;
  country: string;
  gridSubregion?: string;
  coordinates?: { lat: number; lng: number };
  operationalControl: boolean;
  equityShare?: number;
  createdAt: string;
  updatedAt: string;
}

// Calculation Input
interface CalculationInput {
  facilityId: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  mode: 'simple' | 'expert';
  scope1: Scope1Input;
  scope2: Scope2Input;
  scope3?: Scope3Input;
  options: CalculationOptions;
}

// Scope 1 Input
interface Scope1Input {
  stationaryCombustion: {
    fuelType: string;
    quantity: number;
    unit: string;
    equipmentType?: string;
    efficiency?: number;
  }[];
  mobileCombustion: {
    vehicleType: string;
    fuelType: string;
    quantity: number;
    unit: string;
  }[];
  flaring: {
    volume: number;
    unit: string;
    gasComposition?: GasComposition;
    combustionEfficiency?: number;
  };
  venting: {
    source: string;
    volume: number;
    unit: string;
  }[];
  fugitives: {
    method: 'average' | 'component_count';
    components?: ComponentCount[];
    facilityType?: string;
  };
}

// Calculation Result
interface CalculationResult {
  id: string;
  facilityId: string;
  calculatedAt: string;
  methodology: string;
  gwpVersion: 'AR5' | 'AR6';
  
  totalCO2e: number;
  
  scope1: {
    total: number;
    byGas: { co2: number; ch4: number; n2o: number };
    bySource: {
      stationaryCombustion: number;
      mobileCombustion: number;
      processEmissions: number;
      fugitiveEmissions: number;
      flaring: number;
      venting: number;
    };
  };
  
  scope2: {
    locationBased: number;
    marketBased: number;
    gridFactor: number;
    gridSource: string;
  };
  
  scope3?: {
    total: number;
    byCategory: Record<string, number>;
  };
  
  intensity: {
    perBOE?: number;
    perRevenue?: number;
    methaneIntensity?: number;
  };
  
  benchmarks: {
    industryAverage: number;
    percentile: number;
    thresholdsExceeded: string[];
  };
}
```

### 9.2 Calculation Formulas

#### Stationary Combustion
```javascript
// CO2 emissions
CO2 = Fuel_Quantity × Emission_Factor_CO2

// Example: Natural gas
CO2_kg = Volume_MMBtu × 53.06  // kg CO2

// CH4 and N2O
CH4_kg = Volume_MMBtu × 0.001  // kg CH4
N2O_kg = Volume_MMBtu × 0.0001 // kg N2O

// Convert to CO2e
CO2e = CO2_kg + (CH4_kg × GWP_CH4) + (N2O_kg × GWP_N2O)
```

#### Flaring (40 CFR § 98.253)
```javascript
// Known gas composition
function calculateFlaringCO2(flareGasVolume, gasComposition, combustionEfficiency = 0.98) {
  const MVC = 849.5; // scf/kg-mole at 68°F
  
  let co2 = 0;
  for (const component of gasComposition) {
    const { molecularWeight, carbonContent, moleFraction } = component;
    const componentVolume = flareGasVolume * moleFraction;
    co2 += combustionEfficiency * 0.001 * componentVolume * (molecularWeight / MVC) * carbonContent * (44 / 12);
  }
  return co2; // metric tonnes
}

// Unknown composition (default method)
function calculateFlaringCO2Default(volumeMMscf, hhvMMBtuPerMMscf = 1000) {
  const emissionFactor = 60; // kg CO2/MMBtu
  return volumeMMscf * hhvMMBtuPerMMscf * emissionFactor * 0.001; // metric tonnes
}
```

#### Fugitive Emissions (Component Count)
```javascript
function calculateFugitiveEmissions(components, gasStreamFactor = 0.6) {
  const emissionFactors = {
    'valve_gas': 0.0268,       // lb THC/hr/component
    'valve_light_liquid': 0.0109,
    'pump_seal': 0.0199,
    'compressor_seal': 0.636,
    'connector': 0.00183,
    'open_ended_line': 0.0023,
  };
  
  let totalTHC = 0;
  for (const { type, count } of components) {
    const factor = emissionFactors[type] || 0;
    totalTHC += count * factor * 24 * 365; // lb/year
  }
  
  // Convert to CH4 (assume 60% methane in THC)
  const ch4_lb = totalTHC * gasStreamFactor;
  const ch4_kg = ch4_lb * 0.453592;
  
  return ch4_kg; // kg CH4/year
}
```

#### Scope 2 Calculations
```javascript
// Location-based
function calculateScope2LocationBased(electricityKWh, gridFactor) {
  return electricityKWh * gridFactor / 1000; // tonnes CO2e
}

// Market-based
function calculateScope2MarketBased(electricityKWh, marketFactor, recMWh = 0) {
  const netElectricity = electricityKWh - (recMWh * 1000);
  return Math.max(0, netElectricity) * marketFactor / 1000; // tonnes CO2e
}
```

#### Scope 3 Category 11 (Use of Sold Products)
```javascript
function calculateCategory11(soldProducts) {
  const combustionFactors = {
    'gasoline': 8.887,    // kg CO2/gallon
    'diesel': 10.180,
    'jet_fuel': 9.57,
    'lpg': 5.68,
    'natural_gas': 53.06, // kg CO2/MMBtu
    'residual_fuel': 11.27,
  };
  
  let totalCO2 = 0;
  for (const { product, quantity, unit } of soldProducts) {
    const factor = combustionFactors[product];
    let standardQuantity = convertToStandardUnit(quantity, unit, product);
    totalCO2 += standardQuantity * factor;
  }
  
  return totalCO2 / 1000; // tonnes CO2
}
```

### 9.3 GWP Values

```javascript
// data/gwpValues.json
{
  "AR5": {
    "CO2": 1,
    "CH4_fossil": 30,
    "CH4_non_fossil": 28,
    "N2O": 265,
    "SF6": 23500,
    "HFC134a": 1300,
    "source": "IPCC AR5 (2014)"
  },
  "AR6": {
    "CO2": 1,
    "CH4_fossil": 29.8,
    "CH4_non_fossil": 27.0,
    "N2O": 273,
    "SF6": 24300,
    "HFC134a": 1530,
    "source": "IPCC AR6 (2021)"
  }
}
```

---

## 10. Offline Functionality

### 10.1 Offline-First Architecture

```javascript
// Service Worker Strategy (Workbox)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// Static assets - Cache First
registerRoute(
  ({ request }) => request.destination === 'style' || 
                   request.destination === 'script' ||
                   request.destination === 'font',
  new CacheFirst({ cacheName: 'static-assets' })
);

// Data files (emission factors) - Stale While Revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/data/'),
  new StaleWhileRevalidate({ cacheName: 'data-cache' })
);

// API calls - Network First with fallback
registerRoute(
  ({ url }) => url.origin.includes('api.'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
  })
);
```

### 10.2 IndexedDB Schema (Dexie.js)

```javascript
// services/storage/indexedDB.js
import Dexie from 'dexie';

const db = new Dexie('CarbonScopeDB');

db.version(1).stores({
  facilities: '++id, name, type, region, createdAt',
  calculations: '++id, facilityId, calculatedAt, [facilityId+calculatedAt]',
  emissionFactors: 'id, source, region, lastUpdated',
  gridFactors: 'regionCode, source, lastUpdated',
  settings: 'key',
  exportHistory: '++id, type, createdAt',
});

export default db;
```

### 10.3 Offline Capabilities

| Feature | Offline Support | Notes |
|---------|-----------------|-------|
| Calculator (Simple mode) | ✅ Full | Uses cached factors |
| Calculator (Expert mode) | ✅ Full | Uses cached factors |
| Facility management | ✅ Full | Local storage |
| View past calculations | ✅ Full | IndexedDB |
| Export to PDF/MD | ✅ Full | Client-side generation |
| Grid factor lookup | ⚠️ Partial | Falls back to cached/default |
| Real-time grid intensity | ❌ No | Requires network |
| API key validation | ❌ No | Requires network |

---

## 11. Deployment Specifications

### 11.1 GitHub Pages Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/carbonscope/', // Repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['math.js', 'big.js', 'dexie'],
        },
      },
    },
  },
});
```

### 11.2 Build Commands

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx",
    "test": "vitest",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### 11.3 Environment Variables

```bash
# .env.example (template only - no actual keys)
VITE_APP_TITLE=CarbonScope
VITE_APP_VERSION=1.0.0
VITE_BASE_URL=/carbonscope/

# API endpoints (public, no keys)
VITE_EPA_API_URL=https://data.epa.gov/efservice
VITE_UK_CARBON_API_URL=https://api.carbonintensity.org.uk
VITE_OWID_DATA_URL=https://nyc3.digitaloceanspaces.com/owid-public/data/co2

# Note: User API keys are stored in localStorage, NOT in env files
```

### 11.4 Deployment Checklist

- [ ] All API keys removed from source code
- [ ] .env files in .gitignore
- [ ] HashRouter configured (not BrowserRouter)
- [ ] Base URL set in vite.config.js
- [ ] Service worker registered
- [ ] Offline data cached
- [ ] PWA manifest configured
- [ ] Favicon and icons included
- [ ] README updated
- [ ] License file included

---

## Appendix A: Regional Emission Factor Sources

| Region | Primary Source | URL |
|--------|---------------|-----|
| United States | EPA GHG Emission Factors Hub | epa.gov/climateleadership |
| United Kingdom | UK DESNZ/DEFRA | gov.uk/government/publications |
| European Union | EU ETS MRR | ec.europa.eu |
| Malaysia | Bursa Malaysia / SEDG | capitalmarketsmalaysia.com |
| Singapore | NEA / SGX | nea.gov.sg |
| Australia | NGER / Clean Energy Regulator | cleanenergyregulator.gov.au |
| Global | IPCC EFDB | ipcc-nggip.iges.or.jp |

## Appendix B: Regulatory Thresholds

| Jurisdiction | Threshold | Requirement |
|--------------|-----------|-------------|
| EPA GHGRP (US) | 25,000 MT CO2e/year | Mandatory reporting |
| EU ETS | 20 MW thermal input | Allowance system |
| Australia NGER | 50,000 t CO2e corporate | Mandatory reporting |
| Australia Safeguard | 100,000 t CO2e Scope 1 | Baseline applies |
| Malaysia Bursa | RM2B market cap | FY2025 IFRS S2 |
| Singapore SGX | All listed | FY2025 Scope 1&2 |

---

*End of PRD Document*
