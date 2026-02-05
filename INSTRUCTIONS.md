# INSTRUCTIONS.md - CarbonScope Development Guide

## Overview

This document provides step-by-step instructions to build the CarbonScope ESG Carbon Footprint Calculator from scratch. Follow phases sequentially.

**Estimated Total Development Time:** 40-60 hours

---

## Phase 1: Project Setup (2-3 hours)

### 1.1 Initialize Project

```bash
# Create Vite React project
npm create vite@latest carbonscope -- --template react
cd carbonscope

# Install core dependencies
npm install react-router-dom@6 chart.js react-chartjs-2 dexie lucide-react math.js big.js jspdf jspdf-autotable

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react workbox-cli gh-pages
```

### 1.2 Configure Tailwind CSS

```bash
npx tailwindcss init -p
```

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
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
        scope1: '#ef4444',
        scope2: '#f59e0b',
        scope3: '#3b82f6',
      },
    },
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-secondary-50 text-secondary-900 antialiased;
  }
}

@layer components {
  .cs-card {
    @apply bg-white rounded-xl shadow-sm border border-secondary-200;
  }
  .cs-btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  }
  .cs-btn-secondary {
    @apply bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium py-2 px-4 rounded-lg transition-colors;
  }
  .cs-input {
    @apply w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors;
  }
}
```

### 1.3 Configure Vite for GitHub Pages

**vite.config.js:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/carbonscope/',
  build: {
    outDir: 'dist',
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
})
```

### 1.4 Create Directory Structure

```bash
mkdir -p src/{components/{common,layout,calculator/{scope1,scope2,scope3,results},benchmarks,reports,facilities,charts,tools,settings},pages,hooks,context,services/{api,calculations,storage,export},data/{emissionFactors,gridFactors,benchmarks,equipment,thresholds},utils,styles}
mkdir -p public/assets/icons
```

### 1.5 Setup HashRouter

**src/App.jsx:**
```jsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CalculatorPage from './pages/CalculatorPage';
import BenchmarksPage from './pages/BenchmarksPage';
import ReportsPage from './pages/ReportsPage';
import FacilitiesPage from './pages/FacilitiesPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/benchmarks" element={<BenchmarksPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
```

### 1.6 Create Basic Layout Components

Create these files:
- `src/components/layout/Layout.jsx`
- `src/components/layout/Header.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/layout/MobileMenu.jsx`
- `src/components/layout/Navigation.jsx`

---

## Phase 2: Data Layer (3-4 hours)

### 2.1 Create Emission Factor Data Files

**src/data/emissionFactors/epaFactors.json:**
```json
{
  "stationaryCombustion": {
    "naturalGas": {
      "co2": 53.06,
      "ch4": 0.001,
      "n2o": 0.0001,
      "unit": "kg/MMBtu",
      "source": "EPA GHG Emission Factors Hub 2024"
    },
    "distillateFuelOil": {
      "co2": 73.96,
      "ch4": 0.003,
      "n2o": 0.0006,
      "unit": "kg/MMBtu"
    },
    "residualFuelOil": {
      "co2": 75.10,
      "ch4": 0.003,
      "n2o": 0.0006,
      "unit": "kg/MMBtu"
    },
    "crudeOil": {
      "co2": 74.54,
      "ch4": 0.003,
      "n2o": 0.0006,
      "unit": "kg/MMBtu"
    },
    "lpg": {
      "co2": 62.98,
      "ch4": 0.003,
      "n2o": 0.0006,
      "unit": "kg/MMBtu"
    },
    "motorGasoline": {
      "co2": 70.22,
      "ch4": 0.003,
      "n2o": 0.0006,
      "unit": "kg/MMBtu"
    },
    "kerosene": {
      "co2": 72.22,
      "ch4": 0.003,
      "n2o": 0.0006,
      "unit": "kg/MMBtu"
    }
  },
  "mobileCombustion": {
    "gasolinePassengerCar": {
      "co2": 8.887,
      "ch4": 0.0002,
      "n2o": 0.0001,
      "unit": "kg/gallon"
    },
    "dieselHeavyTruck": {
      "co2": 10.21,
      "ch4": 0.0051,
      "n2o": 0.0048,
      "unit": "kg/gallon"
    }
  },
  "flaring": {
    "defaultCO2Factor": 60,
    "defaultCombustionEfficiency": 0.98,
    "molarVolumeConversion68F": 849.5,
    "molarVolumeConversion60F": 836.6,
    "unit": "kg CO2/MMBtu"
  }
}
```

### 2.2 Create Grid Factors

**src/data/gridFactors/globalGridFactors.json:**
```json
{
  "US": {
    "national": { "factor": 0.373, "unit": "kgCO2/kWh", "year": 2022 },
    "subregions": {
      "CAMX": { "factor": 0.226, "name": "California" },
      "ERCT": { "factor": 0.370, "name": "Texas (ERCOT)" },
      "FRCC": { "factor": 0.374, "name": "Florida" },
      "MROW": { "factor": 0.449, "name": "Midwest Reliability" },
      "NEWE": { "factor": 0.206, "name": "New England" },
      "NWPP": { "factor": 0.278, "name": "Northwest" },
      "RFCE": { "factor": 0.289, "name": "Mid-Atlantic" },
      "SRMW": { "factor": 0.622, "name": "Upper Midwest" }
    }
  },
  "GB": { "factor": 0.212, "unit": "kgCO2/kWh", "year": 2024 },
  "DE": { "factor": 0.380, "unit": "kgCO2/kWh", "year": 2023 },
  "FR": { "factor": 0.052, "unit": "kgCO2/kWh", "year": 2023 },
  "MY": {
    "peninsular": { "factor": 0.774, "unit": "tCO2e/MWh" },
    "sabah": { "factor": 0.531, "unit": "tCO2e/MWh" },
    "sarawak": { "factor": 0.199, "unit": "tCO2e/MWh" }
  },
  "SG": { "factor": 0.402, "unit": "kgCO2/kWh", "year": 2023 },
  "AU": {
    "national": { "factor": 0.680, "unit": "kgCO2e/kWh" },
    "states": {
      "NSW": { "factor": 0.680, "name": "New South Wales" },
      "VIC": { "factor": 0.790, "name": "Victoria" },
      "QLD": { "factor": 0.730, "name": "Queensland" },
      "SA": { "factor": 0.300, "name": "South Australia" },
      "WA": { "factor": 0.540, "name": "Western Australia" },
      "TAS": { "factor": 0.130, "name": "Tasmania" }
    }
  },
  "AE": { "factor": 0.450, "unit": "kgCO2/kWh" },
  "SA": { "factor": 0.520, "unit": "kgCO2/kWh" },
  "QA": { "factor": 0.480, "unit": "kgCO2/kWh" },
  "BR": { "factor": 0.085, "unit": "tCO2/MWh" },
  "ZA": { "factor": 0.950, "unit": "kgCO2/kWh" }
}
```

### 2.3 Create GWP Values

**src/data/gwpValues.json:**
```json
{
  "AR5": {
    "CO2": 1,
    "CH4_fossil": 30,
    "CH4_non_fossil": 28,
    "N2O": 265,
    "SF6": 23500,
    "source": "IPCC AR5 (2014)",
    "default": true
  },
  "AR6": {
    "CO2": 1,
    "CH4_fossil": 29.8,
    "CH4_non_fossil": 27.0,
    "N2O": 273,
    "SF6": 24300,
    "source": "IPCC AR6 (2021)"
  }
}
```

### 2.4 Create Equipment Factors

**src/data/equipment/pneumaticDevices.json:**
```json
{
  "highBleedContinuous": {
    "emissionRate": 37.3,
    "unit": "scfh",
    "annualMcf": 327
  },
  "lowBleedContinuous": {
    "emissionRate": 1.39,
    "unit": "scfh",
    "annualMcf": 12.2
  },
  "intermittentBleed": {
    "emissionRate": 13.5,
    "unit": "scfh",
    "annualMcf": 118
  },
  "pneumaticPumps": {
    "emissionRate": 71.7,
    "unit": "scfh",
    "annualMcf": 628
  }
}
```

**src/data/equipment/componentFactors.json:**
```json
{
  "gasService": {
    "valve": { "factor": 0.0268, "unit": "lb THC/hr" },
    "pumpSeal": { "factor": 0.0199, "unit": "lb THC/hr" },
    "compressorSeal": { "factor": 0.636, "unit": "lb THC/hr" },
    "pressureReliefValve": { "factor": 0.0447, "unit": "lb THC/hr" },
    "connector": { "factor": 0.00183, "unit": "lb THC/hr" },
    "openEndedLine": { "factor": 0.0023, "unit": "lb THC/hr" }
  },
  "lightLiquid": {
    "valve": { "factor": 0.0109, "unit": "lb THC/hr" },
    "pumpSeal": { "factor": 0.0862, "unit": "lb THC/hr" },
    "connector": { "factor": 0.00183, "unit": "lb THC/hr" }
  }
}
```

### 2.5 Create Regulatory Thresholds

**src/data/thresholds/regulatoryThresholds.json:**
```json
{
  "US_EPA_GHGRP": {
    "threshold": 25000,
    "unit": "MT CO2e/year",
    "requirement": "Mandatory reporting"
  },
  "US_EPA_SuperEmitter": {
    "threshold": 100,
    "unit": "kg CH4/hr",
    "requirement": "Detection and response"
  },
  "AU_NGER_Corporate": {
    "threshold": 50000,
    "unit": "t CO2e/year",
    "requirement": "Mandatory reporting"
  },
  "AU_NGER_Facility": {
    "threshold": 25000,
    "unit": "t CO2e/year",
    "requirement": "Facility reporting"
  },
  "AU_Safeguard": {
    "threshold": 100000,
    "unit": "t CO2e Scope 1/year",
    "requirement": "Baseline applies"
  },
  "EU_ETS": {
    "threshold": 20,
    "unit": "MW thermal input",
    "requirement": "Allowance system"
  }
}
```

### 2.6 Setup IndexedDB with Dexie

**src/services/storage/indexedDB.js:**
```javascript
import Dexie from 'dexie';

const db = new Dexie('CarbonScopeDB');

db.version(1).stores({
  facilities: '++id, name, type, region, country, createdAt',
  calculations: '++id, facilityId, calculatedAt, [facilityId+calculatedAt]',
  emissionFactors: 'id, source, region, fuelType, lastUpdated',
  gridFactors: 'regionCode, source, lastUpdated',
  settings: 'key',
  exportHistory: '++id, type, facilityId, createdAt',
});

export default db;
```

---

## Phase 3: Calculation Services (5-6 hours)

### 3.1 Create Unit Conversion Utilities

**src/utils/conversions.js:**
```javascript
export const CONVERSIONS = {
  // Energy
  MMBtu_to_MJ: 1055.06,
  MJ_to_MMBtu: 0.000948,
  kWh_to_MJ: 3.6,
  therm_to_MMBtu: 0.1,
  
  // Volume
  gallon_to_liter: 3.78541,
  barrel_to_gallon: 42,
  mcf_to_scf: 1000,
  
  // Mass
  lb_to_kg: 0.453592,
  tonne_to_kg: 1000,
  shortTon_to_tonne: 0.907185,
};

export function convertEnergy(value, fromUnit, toUnit) {
  const toMJ = {
    'MMBtu': value * CONVERSIONS.MMBtu_to_MJ,
    'MJ': value,
    'kWh': value * CONVERSIONS.kWh_to_MJ,
    'therm': value * CONVERSIONS.therm_to_MMBtu * CONVERSIONS.MMBtu_to_MJ,
  };
  
  const mjValue = toMJ[fromUnit];
  
  const fromMJ = {
    'MMBtu': mjValue * CONVERSIONS.MJ_to_MMBtu,
    'MJ': mjValue,
    'kWh': mjValue / CONVERSIONS.kWh_to_MJ,
    'therm': mjValue * CONVERSIONS.MJ_to_MMBtu / CONVERSIONS.therm_to_MMBtu,
  };
  
  return fromMJ[toUnit];
}

export function convertVolume(value, fromUnit, toUnit) {
  // Convert to liters first, then to target
  const toLiters = {
    'gallon': value * CONVERSIONS.gallon_to_liter,
    'liter': value,
    'barrel': value * CONVERSIONS.barrel_to_gallon * CONVERSIONS.gallon_to_liter,
  };
  
  const liters = toLiters[fromUnit];
  
  const fromLiters = {
    'gallon': liters / CONVERSIONS.gallon_to_liter,
    'liter': liters,
    'barrel': liters / (CONVERSIONS.barrel_to_gallon * CONVERSIONS.gallon_to_liter),
  };
  
  return fromLiters[toUnit];
}
```

### 3.2 Create Scope 1 Calculation Service

**src/services/calculations/scope1Calculations.js:**
```javascript
import epaFactors from '../../data/emissionFactors/epaFactors.json';
import gwpValues from '../../data/gwpValues.json';

export function calculateStationaryCombustion(fuelType, quantity, unit, gwpVersion = 'AR5') {
  const factors = epaFactors.stationaryCombustion[fuelType];
  if (!factors) {
    throw new Error(`Unknown fuel type: ${fuelType}`);
  }
  
  // Convert to MMBtu if needed
  let quantityMMBtu = quantity;
  if (unit !== 'MMBtu') {
    quantityMMBtu = convertToMMBtu(quantity, unit, fuelType);
  }
  
  const gwp = gwpValues[gwpVersion];
  
  const co2 = quantityMMBtu * factors.co2;
  const ch4 = quantityMMBtu * factors.ch4;
  const n2o = quantityMMBtu * factors.n2o;
  
  const co2e = co2 + (ch4 * gwp.CH4_fossil) + (n2o * gwp.N2O);
  
  return {
    co2_kg: co2,
    ch4_kg: ch4,
    n2o_kg: n2o,
    co2e_kg: co2e,
    co2e_tonnes: co2e / 1000,
    methodology: 'EPA GHG Emission Factors Hub',
    gwpVersion,
  };
}

export function calculateMobileCombustion(vehicleType, fuelType, quantity, unit, gwpVersion = 'AR5') {
  const factors = epaFactors.mobileCombustion[`${fuelType}${vehicleType}`] 
                || epaFactors.mobileCombustion[fuelType];
  
  if (!factors) {
    throw new Error(`Unknown mobile source: ${vehicleType}/${fuelType}`);
  }
  
  // Convert to gallons if needed
  let quantityGallons = quantity;
  if (unit !== 'gallon') {
    quantityGallons = convertToGallons(quantity, unit);
  }
  
  const gwp = gwpValues[gwpVersion];
  
  const co2 = quantityGallons * factors.co2;
  const ch4 = quantityGallons * factors.ch4;
  const n2o = quantityGallons * factors.n2o;
  
  const co2e = co2 + (ch4 * gwp.CH4_fossil) + (n2o * gwp.N2O);
  
  return {
    co2_kg: co2,
    ch4_kg: ch4,
    n2o_kg: n2o,
    co2e_kg: co2e,
    co2e_tonnes: co2e / 1000,
  };
}

function convertToMMBtu(quantity, unit, fuelType) {
  // Add conversion logic based on fuel heating values
  const heatingValues = {
    naturalGas: { mcf: 1.028 },
    distillateFuelOil: { gallon: 0.138 },
    lpg: { gallon: 0.092 },
  };
  
  const hv = heatingValues[fuelType]?.[unit];
  if (hv) {
    return quantity * hv;
  }
  
  throw new Error(`Cannot convert ${unit} to MMBtu for ${fuelType}`);
}

function convertToGallons(quantity, unit) {
  const conversions = {
    liter: quantity / 3.78541,
    barrel: quantity * 42,
  };
  return conversions[unit] ?? quantity;
}
```

### 3.3 Create Flaring Calculation Service

**src/services/calculations/flaringCalculations.js:**
```javascript
import epaFactors from '../../data/emissionFactors/epaFactors.json';
import gwpValues from '../../data/gwpValues.json';

/**
 * Calculate flaring emissions using default method (unknown gas composition)
 * Based on 40 CFR § 98.253
 */
export function calculateFlaringDefault(volumeMMscf, hhvMMBtuPerMMscf = 1000, gwpVersion = 'AR5') {
  const { defaultCO2Factor, defaultCombustionEfficiency } = epaFactors.flaring;
  
  // CO2 emissions
  const co2_kg = volumeMMscf * hhvMMBtuPerMMscf * defaultCO2Factor * defaultCombustionEfficiency;
  const co2_tonnes = co2_kg / 1000;
  
  // CH4 from incomplete combustion (2% of carbon not combusted)
  const uncombustedFraction = 1 - defaultCombustionEfficiency;
  const ch4FractionOfCarbon = 0.4; // Default per EPA
  const ch4_kg = co2_kg * uncombustedFraction * ch4FractionOfCarbon * (16 / 44);
  
  const gwp = gwpValues[gwpVersion];
  const co2e_tonnes = co2_tonnes + (ch4_kg * gwp.CH4_fossil / 1000);
  
  return {
    co2_tonnes,
    ch4_kg,
    co2e_tonnes,
    methodology: '40 CFR § 98.253 (Default Method)',
    combustionEfficiency: defaultCombustionEfficiency,
    gwpVersion,
  };
}

/**
 * Calculate flaring emissions with known gas composition
 * Based on 40 CFR § 98.253 Equation Y-1
 */
export function calculateFlaringWithComposition(
  volumeScf,
  gasComposition,
  combustionEfficiency = 0.98,
  gwpVersion = 'AR5'
) {
  const MVC = epaFactors.flaring.molarVolumeConversion68F; // 849.5 scf/kg-mole
  
  let co2_kg = 0;
  
  for (const component of gasComposition) {
    const { moleFraction, molecularWeight, carbonAtoms } = component;
    const componentVolume = volumeScf * moleFraction;
    
    // CO2 = CE × 0.001 × V × (MW/MVC) × C × (44/12)
    const componentCO2 = combustionEfficiency * 0.001 * componentVolume * 
                         (molecularWeight / MVC) * carbonAtoms * (44 / 12);
    co2_kg += componentCO2;
  }
  
  const co2_tonnes = co2_kg / 1000;
  
  // CH4 from incomplete combustion
  const uncombustedFraction = 1 - combustionEfficiency;
  const ch4FractionOfCarbon = 0.4;
  const ch4_kg = co2_kg * uncombustedFraction * ch4FractionOfCarbon * (16 / 44);
  
  const gwp = gwpValues[gwpVersion];
  const co2e_tonnes = co2_tonnes + (ch4_kg * gwp.CH4_fossil / 1000);
  
  return {
    co2_tonnes,
    ch4_kg,
    co2e_tonnes,
    methodology: '40 CFR § 98.253 (Composition Method)',
    combustionEfficiency,
    gwpVersion,
  };
}

// Common gas components with their properties
export const GAS_COMPONENTS = {
  methane: { name: 'Methane', formula: 'CH4', molecularWeight: 16.04, carbonAtoms: 1 },
  ethane: { name: 'Ethane', formula: 'C2H6', molecularWeight: 30.07, carbonAtoms: 2 },
  propane: { name: 'Propane', formula: 'C3H8', molecularWeight: 44.10, carbonAtoms: 3 },
  nButane: { name: 'n-Butane', formula: 'C4H10', molecularWeight: 58.12, carbonAtoms: 4 },
  isoButane: { name: 'iso-Butane', formula: 'C4H10', molecularWeight: 58.12, carbonAtoms: 4 },
  pentane: { name: 'Pentane', formula: 'C5H12', molecularWeight: 72.15, carbonAtoms: 5 },
  co2: { name: 'Carbon Dioxide', formula: 'CO2', molecularWeight: 44.01, carbonAtoms: 0 },
  n2: { name: 'Nitrogen', formula: 'N2', molecularWeight: 28.01, carbonAtoms: 0 },
};
```

### 3.4 Create Fugitive Emissions Calculation Service

**src/services/calculations/fugitiveCalculations.js:**
```javascript
import componentFactors from '../../data/equipment/componentFactors.json';
import gwpValues from '../../data/gwpValues.json';

/**
 * Calculate fugitive emissions using component count method
 * Based on EPA Protocol for Equipment Leak Estimates
 */
export function calculateComponentCountMethod(components, serviceType = 'gasService', gwpVersion = 'AR5') {
  const factors = componentFactors[serviceType];
  if (!factors) {
    throw new Error(`Unknown service type: ${serviceType}`);
  }
  
  let totalTHC_lb_per_hour = 0;
  const breakdown = {};
  
  for (const { componentType, count } of components) {
    const factor = factors[componentType];
    if (!factor) {
      console.warn(`Unknown component type: ${componentType}`);
      continue;
    }
    
    const emissions = count * factor.factor;
    totalTHC_lb_per_hour += emissions;
    breakdown[componentType] = {
      count,
      factor: factor.factor,
      emissions_lb_per_hour: emissions,
    };
  }
  
  // Convert to annual emissions
  const hoursPerYear = 8760;
  const totalTHC_lb_per_year = totalTHC_lb_per_hour * hoursPerYear;
  
  // Assume 60% of THC is methane for O&G operations
  const methaneInTHC = 0.6;
  const ch4_lb_per_year = totalTHC_lb_per_year * methaneInTHC;
  const ch4_kg_per_year = ch4_lb_per_year * 0.453592;
  
  const gwp = gwpValues[gwpVersion];
  const co2e_kg = ch4_kg_per_year * gwp.CH4_fossil;
  
  return {
    totalTHC_lb_per_hour,
    totalTHC_lb_per_year,
    ch4_kg: ch4_kg_per_year,
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    breakdown,
    methodology: 'EPA Protocol for Equipment Leak Estimates',
    serviceType,
    gwpVersion,
  };
}

/**
 * Calculate fugitive emissions using average emission factors by facility type
 * Simplified method for quick estimates
 */
export function calculateAverageMethod(facilityType, productionBOE, gwpVersion = 'AR5') {
  // Average emission factors by facility type (kg CH4/BOE)
  const averageFactors = {
    production_onshore: 0.15,
    production_offshore: 0.08,
    gathering: 0.12,
    processing: 0.10,
    transmission: 0.05,
    distribution: 0.08,
  };
  
  const factor = averageFactors[facilityType];
  if (!factor) {
    throw new Error(`Unknown facility type: ${facilityType}`);
  }
  
  const ch4_kg = productionBOE * factor;
  const gwp = gwpValues[gwpVersion];
  const co2e_kg = ch4_kg * gwp.CH4_fossil;
  
  return {
    ch4_kg,
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    methodology: 'Industry Average Factors',
    facilityType,
    factor,
    gwpVersion,
  };
}
```

### 3.5 Create Scope 2 Calculation Service

**src/services/calculations/scope2Calculations.js:**
```javascript
import globalGridFactors from '../../data/gridFactors/globalGridFactors.json';

/**
 * Calculate Scope 2 emissions using location-based method
 */
export function calculateLocationBased(electricityKWh, region, subregion = null) {
  const gridData = getGridFactor(region, subregion);
  
  if (!gridData) {
    throw new Error(`Grid factor not found for region: ${region}${subregion ? '/' + subregion : ''}`);
  }
  
  // Normalize to kg CO2/kWh
  let factor = gridData.factor;
  if (gridData.unit === 'tCO2e/MWh' || gridData.unit === 'tCO2/MWh') {
    factor = gridData.factor; // tCO2e/MWh = kgCO2e/kWh numerically
  }
  
  const co2e_kg = electricityKWh * factor;
  
  return {
    electricityKWh,
    gridFactor: factor,
    gridFactorUnit: 'kgCO2e/kWh',
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    region,
    subregion,
    source: gridData.source || 'Local database',
    methodology: 'GHG Protocol Location-Based Method',
  };
}

/**
 * Calculate Scope 2 emissions using market-based method
 */
export function calculateMarketBased(electricityKWh, marketFactor, recMWh = 0, recFactor = 0) {
  // RECs offset emissions
  const recOffsetKWh = recMWh * 1000;
  const netElectricityKWh = Math.max(0, electricityKWh - recOffsetKWh);
  
  const co2e_from_grid_kg = netElectricityKWh * marketFactor;
  const co2e_from_rec_kg = recMWh * 1000 * recFactor;
  
  const co2e_kg = co2e_from_grid_kg + co2e_from_rec_kg;
  
  return {
    electricityKWh,
    recMWh,
    netElectricityKWh,
    marketFactor,
    recFactor,
    co2e_kg,
    co2e_tonnes: co2e_kg / 1000,
    methodology: 'GHG Protocol Market-Based Method',
  };
}

/**
 * Get grid emission factor for a region
 */
export function getGridFactor(region, subregion = null) {
  const regionData = globalGridFactors[region];
  
  if (!regionData) {
    return null;
  }
  
  if (subregion && regionData.subregions) {
    return regionData.subregions[subregion];
  }
  
  if (subregion && regionData.states) {
    return regionData.states[subregion];
  }
  
  if (regionData.factor !== undefined) {
    return regionData;
  }
  
  if (regionData.national) {
    return regionData.national;
  }
  
  return null;
}

/**
 * Get all available regions
 */
export function getAvailableRegions() {
  const regions = [];
  
  for (const [code, data] of Object.entries(globalGridFactors)) {
    const region = {
      code,
      name: getRegionName(code),
      hasSubregions: !!(data.subregions || data.states),
    };
    
    if (data.subregions) {
      region.subregions = Object.entries(data.subregions).map(([subCode, subData]) => ({
        code: subCode,
        name: subData.name || subCode,
      }));
    }
    
    if (data.states) {
      region.subregions = Object.entries(data.states).map(([stateCode, stateData]) => ({
        code: stateCode,
        name: stateData.name || stateCode,
      }));
    }
    
    regions.push(region);
  }
  
  return regions;
}

function getRegionName(code) {
  const names = {
    US: 'United States',
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    MY: 'Malaysia',
    SG: 'Singapore',
    AU: 'Australia',
    AE: 'United Arab Emirates',
    SA: 'Saudi Arabia',
    QA: 'Qatar',
    BR: 'Brazil',
    ZA: 'South Africa',
  };
  return names[code] || code;
}
```

### 3.6 Create Scope 3 Calculation Service

**src/services/calculations/scope3Calculations.js:**
```javascript
import gwpValues from '../../data/gwpValues.json';

/**
 * Combustion factors for sold products (kg CO2/unit)
 */
const COMBUSTION_FACTORS = {
  motorGasoline: { factor: 8.887, unit: 'gallon', kgPerLiter: 2.348 },
  diesel: { factor: 10.180, unit: 'gallon', kgPerLiter: 2.689 },
  jetFuel: { factor: 9.57, unit: 'gallon', kgPerLiter: 2.53 },
  lpg: { factor: 5.68, unit: 'gallon', kgPerLiter: 1.50 },
  residualFuelOil: { factor: 11.27, unit: 'gallon', kgPerLiter: 2.98 },
  naturalGas: { factor: 53.06, unit: 'MMBtu', kgPerMJ: 0.0503 },
  crudeOil: { factor: 430, unit: 'barrel', kgPerLiter: 2.69 },
};

/**
 * Calculate Category 11 - Use of Sold Products
 * This is typically the largest Scope 3 category for O&G (~91%)
 */
export function calculateCategory11(soldProducts, gwpVersion = 'AR5') {
  let totalCO2_kg = 0;
  const breakdown = {};
  
  for (const product of soldProducts) {
    const { productType, quantity, unit } = product;
    const factor = COMBUSTION_FACTORS[productType];
    
    if (!factor) {
      console.warn(`Unknown product type: ${productType}`);
      continue;
    }
    
    let co2_kg;
    
    if (unit === factor.unit) {
      co2_kg = quantity * factor.factor;
    } else if (unit === 'liter' && factor.kgPerLiter) {
      co2_kg = quantity * factor.kgPerLiter;
    } else if (unit === 'barrel' && productType !== 'crudeOil') {
      // Convert barrels to gallons (1 barrel = 42 gallons)
      co2_kg = quantity * 42 * factor.factor;
    } else {
      throw new Error(`Cannot convert ${unit} for ${productType}`);
    }
    
    totalCO2_kg += co2_kg;
    breakdown[productType] = {
      quantity,
      unit,
      co2_kg,
      co2_tonnes: co2_kg / 1000,
    };
  }
  
  return {
    category: 11,
    categoryName: 'Use of Sold Products',
    co2_kg: totalCO2_kg,
    co2_tonnes: totalCO2_kg / 1000,
    breakdown,
    methodology: 'GHG Protocol Scope 3 Category 11',
    note: 'Represents end-use combustion of sold products',
  };
}

/**
 * Calculate Category 3 - Fuel and Energy Related Activities
 * Upstream emissions from purchased fuels
 */
export function calculateCategory3(purchasedEnergy, gwpVersion = 'AR5') {
  // Upstream emission factors (kg CO2e/unit)
  const upstreamFactors = {
    naturalGas: { factor: 8.5, unit: 'MMBtu' },      // Well-to-gate
    electricity: { factor: 0.05, unit: 'kWh' },      // T&D losses
    diesel: { factor: 15.2, unit: 'gallon' },        // Well-to-tank
  };
  
  let totalCO2e_kg = 0;
  const breakdown = {};
  
  for (const energy of purchasedEnergy) {
    const { energyType, quantity, unit } = energy;
    const factor = upstreamFactors[energyType];
    
    if (!factor) continue;
    
    const co2e_kg = quantity * factor.factor;
    totalCO2e_kg += co2e_kg;
    breakdown[energyType] = { quantity, unit, co2e_kg };
  }
  
  return {
    category: 3,
    categoryName: 'Fuel and Energy Related Activities',
    co2e_kg: totalCO2e_kg,
    co2e_tonnes: totalCO2e_kg / 1000,
    breakdown,
    methodology: 'GHG Protocol Scope 3 Category 3',
  };
}

/**
 * Calculate Category 4 - Upstream Transportation
 */
export function calculateCategory4(transportation) {
  // Simplified transport emission factors (kg CO2e/tonne-km)
  const transportFactors = {
    truck: 0.107,
    rail: 0.028,
    ship: 0.016,
    pipeline: 0.005,
  };
  
  let totalCO2e_kg = 0;
  const breakdown = {};
  
  for (const transport of transportation) {
    const { mode, tonnes, distanceKm } = transport;
    const factor = transportFactors[mode];
    
    if (!factor) continue;
    
    const co2e_kg = tonnes * distanceKm * factor;
    totalCO2e_kg += co2e_kg;
    breakdown[mode] = { tonnes, distanceKm, co2e_kg };
  }
  
  return {
    category: 4,
    categoryName: 'Upstream Transportation and Distribution',
    co2e_kg: totalCO2e_kg,
    co2e_tonnes: totalCO2e_kg / 1000,
    breakdown,
    methodology: 'GHG Protocol Scope 3 Category 4',
  };
}

/**
 * Get available Scope 3 categories
 */
export function getScope3Categories() {
  return [
    { id: 1, name: 'Purchased Goods and Services', relevance: 'medium' },
    { id: 2, name: 'Capital Goods', relevance: 'medium' },
    { id: 3, name: 'Fuel and Energy Related Activities', relevance: 'high' },
    { id: 4, name: 'Upstream Transportation and Distribution', relevance: 'high' },
    { id: 5, name: 'Waste Generated in Operations', relevance: 'low' },
    { id: 6, name: 'Business Travel', relevance: 'low' },
    { id: 7, name: 'Employee Commuting', relevance: 'low' },
    { id: 8, name: 'Upstream Leased Assets', relevance: 'medium' },
    { id: 9, name: 'Downstream Transportation and Distribution', relevance: 'high' },
    { id: 10, name: 'Processing of Sold Products', relevance: 'high' },
    { id: 11, name: 'Use of Sold Products', relevance: 'critical' },
    { id: 12, name: 'End-of-Life Treatment of Sold Products', relevance: 'low' },
    { id: 13, name: 'Downstream Leased Assets', relevance: 'low' },
    { id: 14, name: 'Franchises', relevance: 'none' },
    { id: 15, name: 'Investments', relevance: 'medium' },
  ];
}
```

---

## Phase 4: API Services (3-4 hours)

### 4.1 Create Base API Client

**src/services/api/apiClient.js:**
```javascript
const DEFAULT_TIMEOUT = 5000;

export async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(id);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

export async function fetchWithFallback(url, fallbackData, options = {}) {
  try {
    const response = await fetchWithTimeout(url, options);
    const data = await response.json();
    return { data, source: 'api', success: true };
  } catch (error) {
    console.warn(`API fetch failed for ${url}:`, error.message);
    return { data: fallbackData, source: 'fallback', success: false, error: error.message };
  }
}

export function getApiKey(apiName) {
  try {
    const keys = JSON.parse(localStorage.getItem('carbonscope_api_keys') || '{}');
    return keys[apiName]?.key || null;
  } catch {
    return null;
  }
}

export function setApiKey(apiName, key) {
  try {
    const keys = JSON.parse(localStorage.getItem('carbonscope_api_keys') || '{}');
    keys[apiName] = { key, addedAt: new Date().toISOString() };
    localStorage.setItem('carbonscope_api_keys', JSON.stringify(keys));
    return true;
  } catch {
    return false;
  }
}
```

### 4.2 Create EPA API Service

**src/services/api/epaApi.js:**
```javascript
import { fetchWithFallback } from './apiClient';

const EPA_BASE_URL = 'https://data.epa.gov/efservice';

export async function getGHGFacilities(state, limit = 100) {
  const url = `${EPA_BASE_URL}/ghg.ghg_facility/state_code/equals/${state}/1:${limit}/JSON`;
  
  return fetchWithFallback(url, [], { method: 'GET' });
}

export async function getFacilityEmissions(facilityId) {
  const url = `${EPA_BASE_URL}/ghg.ghg_emitter_gas/facility_id/equals/${facilityId}/JSON`;
  
  return fetchWithFallback(url, [], { method: 'GET' });
}

export async function searchFacilities(searchTerm, limit = 50) {
  const url = `${EPA_BASE_URL}/ghg.ghg_facility/facility_name/containing/${encodeURIComponent(searchTerm)}/1:${limit}/JSON`;
  
  return fetchWithFallback(url, [], { method: 'GET' });
}
```

### 4.3 Create UK Carbon Intensity API Service

**src/services/api/ukCarbonApi.js:**
```javascript
import { fetchWithTimeout } from './apiClient';

const UK_CARBON_BASE = 'https://api.carbonintensity.org.uk';

export async function getCurrentIntensity() {
  try {
    const response = await fetchWithTimeout(`${UK_CARBON_BASE}/intensity`);
    const data = await response.json();
    
    return {
      success: true,
      intensity: data.data[0]?.intensity?.actual,
      forecast: data.data[0]?.intensity?.forecast,
      index: data.data[0]?.intensity?.index,
      from: data.data[0]?.from,
      to: data.data[0]?.to,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getIntensityByPostcode(postcode) {
  try {
    const response = await fetchWithTimeout(`${UK_CARBON_BASE}/regional/postcode/${postcode}`);
    const data = await response.json();
    
    return {
      success: true,
      data: data.data[0],
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getGenerationMix() {
  try {
    const response = await fetchWithTimeout(`${UK_CARBON_BASE}/generation`);
    const data = await response.json();
    
    return {
      success: true,
      mix: data.data?.generationmix,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 4.4 Create EIA API Service (Requires Key)

**src/services/api/eiaApi.js:**
```javascript
import { fetchWithTimeout, getApiKey } from './apiClient';

const EIA_BASE_URL = 'https://api.eia.gov/v2';

export async function getStateElectricityEmissions(stateCode) {
  const apiKey = getApiKey('eia');
  
  if (!apiKey) {
    return {
      success: false,
      error: 'EIA API key not configured',
      requiresKey: true,
      registrationUrl: 'https://www.eia.gov/opendata/register.php',
    };
  }
  
  try {
    const url = `${EIA_BASE_URL}/electricity/state-electricity-profiles/emissions-by-state-by-fuel/data?api_key=${apiKey}&facets[state][]=${stateCode}&data[]=co2-rate-lbs-mwh`;
    
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    
    if (data.response?.data) {
      return {
        success: true,
        data: data.response.data,
      };
    }
    
    return { success: false, error: 'No data returned' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getCO2Emissions(frequency = 'annual') {
  const apiKey = getApiKey('eia');
  
  if (!apiKey) {
    return { success: false, error: 'EIA API key not configured', requiresKey: true };
  }
  
  try {
    const url = `${EIA_BASE_URL}/co2-emissions/co2-emissions-aggregates/data?api_key=${apiKey}&frequency=${frequency}&data[]=value`;
    
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    
    return { success: true, data: data.response?.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function isEIAConfigured() {
  return !!getApiKey('eia');
}
```

---

## Phase 5: React Components (10-12 hours)

### 5.1 Create Common Components

Create these files in `src/components/common/`:

**Button.jsx:**
```jsx
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-700 focus:ring-secondary-500 disabled:bg-secondary-50',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 disabled:border-primary-300',
    ghost: 'text-secondary-600 hover:bg-secondary-100 focus:ring-secondary-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };
  
  const sizes = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };
  
  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
```

**Card.jsx:**
```jsx
export default function Card({ children, className = '', padding = 'p-6', ...props }) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-secondary-200 ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-secondary-200 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-secondary-900 ${className}`}>
      {children}
    </h3>
  );
}
```

**Input.jsx:**
```jsx
import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-2 border rounded-lg transition-colors
          ${error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
          }
          focus:ring-2 focus:outline-none
          disabled:bg-secondary-50 disabled:text-secondary-500
          ${className}
        `}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
```

**Select.jsx:**
```jsx
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ 
  label,
  options = [],
  error,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full px-4 py-2 border rounded-lg transition-colors appearance-none
            ${error ? 'border-red-500' : 'border-secondary-300'}
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none
            disabled:bg-secondary-50 disabled:text-secondary-500
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
```

**Alert.jsx:**
```jsx
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const variants = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600',
  },
};

export default function Alert({ 
  variant = 'info', 
  title,
  children, 
  onClose,
  className = '' 
}) {
  const styles = variants[variant];
  const Icon = styles.icon;
  
  return (
    <div className={`${styles.bg} ${styles.border} ${styles.text} border px-4 py-3 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && <p className="font-medium">{title}</p>}
          <div className={title ? 'mt-1' : ''}>{children}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="flex-shrink-0">
            <X className="w-5 h-5 opacity-60 hover:opacity-100" />
          </button>
        )}
      </div>
    </div>
  );
}
```

### 5.2 Create Layout Components

**src/components/layout/Layout.jsx:**
```jsx
import Header from './Header';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <MobileMenu />
    </div>
  );
}
```

### 5.3 Create Calculator Components

This is the core of the application. Create step-by-step:

1. `src/components/calculator/CalculatorWizard.jsx` - Main wizard container
2. `src/components/calculator/WizardProgress.jsx` - Progress indicator
3. `src/components/calculator/ModeSelector.jsx` - Simple/Expert mode toggle
4. `src/components/calculator/scope1/Scope1Calculator.jsx` - Scope 1 main component
5. `src/components/calculator/scope1/StationaryCombustion.jsx` - Fuel inputs
6. `src/components/calculator/scope1/FlaringCalculator.jsx` - Flaring inputs
7. Continue for all components...

### 5.4 Create Chart Components

**src/components/charts/EmissionsPieChart.jsx:**
```jsx
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EmissionsPieChart({ scope1, scope2, scope3 }) {
  const data = {
    labels: ['Scope 1 (Direct)', 'Scope 2 (Energy)', 'Scope 3 (Value Chain)'],
    datasets: [{
      data: [scope1, scope2, scope3],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'],
      borderColor: ['#dc2626', '#d97706', '#2563eb'],
      borderWidth: 1,
    }],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} tonnes (${percentage}%)`;
          },
        },
      },
    },
  };
  
  return <Pie data={data} options={options} />;
}
```

---

## Phase 6: State Management & Hooks (3-4 hours)

### 6.1 Create App Context

**src/context/AppContext.jsx:**
```jsx
import { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  user: {
    settings: {
      gwpVersion: 'AR5',
      units: 'metric',
      defaultRegion: 'US',
    },
  },
  activeFacility: null,
  notifications: [],
  isOffline: !navigator.onLine,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_FACILITY':
      return { ...state, activeFacility: action.payload };
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        user: { ...state.user, settings: { ...state.user.settings, ...action.payload } }
      };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, { id: Date.now(), ...action.payload }]
      };
    case 'REMOVE_NOTIFICATION':
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_OFFLINE', payload: false });
    const handleOffline = () => dispatch({ type: 'SET_OFFLINE', payload: true });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
```

### 6.2 Create Custom Hooks

**src/hooks/useCalculation.js:**
```jsx
import { useState, useCallback } from 'react';
import { calculateStationaryCombustion, calculateMobileCombustion } from '../services/calculations/scope1Calculations';
import { calculateFlaringDefault } from '../services/calculations/flaringCalculations';
import { calculateLocationBased, calculateMarketBased } from '../services/calculations/scope2Calculations';
import { calculateCategory11 } from '../services/calculations/scope3Calculations';

export function useCalculation() {
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  
  const calculateEmissions = useCallback(async (input, options = {}) => {
    setIsCalculating(true);
    setError(null);
    
    try {
      const { gwpVersion = 'AR5' } = options;
      
      // Scope 1
      let scope1Total = 0;
      const scope1Breakdown = {};
      
      if (input.scope1?.stationaryCombustion) {
        let stationaryTotal = 0;
        for (const fuel of input.scope1.stationaryCombustion) {
          const result = calculateStationaryCombustion(
            fuel.fuelType, 
            fuel.quantity, 
            fuel.unit, 
            gwpVersion
          );
          stationaryTotal += result.co2e_tonnes;
        }
        scope1Breakdown.stationaryCombustion = stationaryTotal;
        scope1Total += stationaryTotal;
      }
      
      if (input.scope1?.flaring) {
        const flaringResult = calculateFlaringDefault(
          input.scope1.flaring.volume,
          input.scope1.flaring.hhv,
          gwpVersion
        );
        scope1Breakdown.flaring = flaringResult.co2e_tonnes;
        scope1Total += flaringResult.co2e_tonnes;
      }
      
      // Scope 2
      let scope2LocationBased = 0;
      let scope2MarketBased = 0;
      
      if (input.scope2?.electricity) {
        const locationResult = calculateLocationBased(
          input.scope2.electricity.kWh,
          input.scope2.electricity.region,
          input.scope2.electricity.subregion
        );
        scope2LocationBased = locationResult.co2e_tonnes;
        
        if (input.scope2.electricity.marketFactor) {
          const marketResult = calculateMarketBased(
            input.scope2.electricity.kWh,
            input.scope2.electricity.marketFactor,
            input.scope2.electricity.recMWh
          );
          scope2MarketBased = marketResult.co2e_tonnes;
        }
      }
      
      // Scope 3
      let scope3Total = 0;
      const scope3Breakdown = {};
      
      if (input.scope3?.category11) {
        const cat11Result = calculateCategory11(input.scope3.category11, gwpVersion);
        scope3Breakdown.category11 = cat11Result.co2_tonnes;
        scope3Total += cat11Result.co2_tonnes;
      }
      
      const result = {
        scope1: {
          total: scope1Total,
          breakdown: scope1Breakdown,
        },
        scope2: {
          locationBased: scope2LocationBased,
          marketBased: scope2MarketBased,
        },
        scope3: {
          total: scope3Total,
          breakdown: scope3Breakdown,
        },
        total: scope1Total + scope2LocationBased + scope3Total,
        calculatedAt: new Date().toISOString(),
        gwpVersion,
      };
      
      setResults(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, []);
  
  return {
    results,
    isCalculating,
    error,
    calculateEmissions,
    clearResults: () => setResults(null),
  };
}
```

---

## Phase 7: Pages Implementation (4-5 hours)

### 7.1 Create Home Page

**src/pages/HomePage.jsx:**
```jsx
import { Link } from 'react-router-dom';
import { Calculator, BarChart3, FileText, Building2, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function HomePage() {
  const features = [
    {
      icon: Calculator,
      title: 'Scope 1, 2 & 3 Calculator',
      description: 'GHG Protocol-compliant calculations for direct emissions, energy, and value chain.',
    },
    {
      icon: BarChart3,
      title: 'Industry Benchmarks',
      description: 'Compare against OGCI targets, regional averages, and regulatory thresholds.',
    },
    {
      icon: FileText,
      title: 'TCFD/CDP/CSRD Reports',
      description: 'Generate reports aligned with major disclosure frameworks.',
    },
    {
      icon: Building2,
      title: 'Multi-Facility Management',
      description: 'Track emissions across all your operations with corporate rollup.',
    },
  ];
  
  return (
    <div className="py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">
          CarbonScope
        </h1>
        <p className="text-xl text-secondary-600 max-w-2xl mx-auto mb-8">
          ESG Carbon Footprint Calculator for Oil & Gas Operations
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/calculator">
            <Button size="lg">
              Start Calculating
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/help">
            <Button variant="secondary" size="lg">
              View Documentation
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-md transition-shadow">
            <feature.icon className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-secondary-600">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 7.2 Create Calculator Page

**src/pages/CalculatorPage.jsx:**
```jsx
import { useState } from 'react';
import CalculatorWizard from '../components/calculator/CalculatorWizard';
import ModeSelector from '../components/calculator/ModeSelector';

export default function CalculatorPage() {
  const [mode, setMode] = useState(null); // 'simple' | 'expert'
  
  if (!mode) {
    return <ModeSelector onSelectMode={setMode} />;
  }
  
  return <CalculatorWizard mode={mode} onChangeMode={() => setMode(null)} />;
}
```

Continue creating all other pages following similar patterns.

---

## Phase 8: Export & Reporting (3-4 hours)

### 8.1 Create Markdown Export

**src/services/export/markdownExport.js:**
```javascript
export function generateMarkdownReport(results, facility, options = {}) {
  const { framework = 'TCFD', includeMethodology = true } = options;
  
  let md = `# ${facility.name} - GHG Emissions Report\n\n`;
  md += `**Report Date:** ${new Date().toLocaleDateString()}\n`;
  md += `**Framework:** ${framework}\n`;
  md += `**GWP Version:** ${results.gwpVersion}\n\n`;
  
  md += `## Executive Summary\n\n`;
  md += `| Scope | Emissions (tonnes CO2e) | % of Total |\n`;
  md += `|-------|------------------------|------------|\n`;
  
  const total = results.total;
  md += `| Scope 1 (Direct) | ${results.scope1.total.toLocaleString()} | ${((results.scope1.total / total) * 100).toFixed(1)}% |\n`;
  md += `| Scope 2 (Energy) | ${results.scope2.locationBased.toLocaleString()} | ${((results.scope2.locationBased / total) * 100).toFixed(1)}% |\n`;
  md += `| Scope 3 (Value Chain) | ${results.scope3.total.toLocaleString()} | ${((results.scope3.total / total) * 100).toFixed(1)}% |\n`;
  md += `| **Total** | **${total.toLocaleString()}** | **100%** |\n\n`;
  
  md += `## Scope 1: Direct Emissions\n\n`;
  for (const [source, value] of Object.entries(results.scope1.breakdown)) {
    md += `- **${formatSourceName(source)}:** ${value.toLocaleString()} tonnes CO2e\n`;
  }
  
  md += `\n## Scope 2: Energy Emissions\n\n`;
  md += `- **Location-based:** ${results.scope2.locationBased.toLocaleString()} tonnes CO2e\n`;
  if (results.scope2.marketBased) {
    md += `- **Market-based:** ${results.scope2.marketBased.toLocaleString()} tonnes CO2e\n`;
  }
  
  if (results.scope3.total > 0) {
    md += `\n## Scope 3: Value Chain Emissions\n\n`;
    for (const [category, value] of Object.entries(results.scope3.breakdown)) {
      md += `- **${formatCategoryName(category)}:** ${value.toLocaleString()} tonnes CO2e\n`;
    }
  }
  
  if (includeMethodology) {
    md += `\n## Methodology\n\n`;
    md += `This report was prepared in accordance with the GHG Protocol Corporate Accounting and Reporting Standard. `;
    md += `Emission factors are sourced from the EPA GHG Emission Factors Hub (2024) and regional grid emission factors. `;
    md += `Global Warming Potentials use IPCC ${results.gwpVersion} 100-year values.\n`;
  }
  
  return md;
}

function formatSourceName(source) {
  const names = {
    stationaryCombustion: 'Stationary Combustion',
    mobileCombustion: 'Mobile Combustion',
    flaring: 'Flaring',
    venting: 'Venting',
    fugitiveEmissions: 'Fugitive Emissions',
  };
  return names[source] || source;
}

function formatCategoryName(category) {
  const names = {
    category11: 'Category 11: Use of Sold Products',
    category3: 'Category 3: Fuel & Energy Related Activities',
    category4: 'Category 4: Upstream Transportation',
  };
  return names[category] || category;
}
```

### 8.2 Create PDF Export

**src/services/export/pdfExport.js:**
```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generatePDFReport(results, facility, options = {}) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74); // primary-600
  doc.text('CarbonScope', 20, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${facility.name} - GHG Emissions Report`, 20, 35);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
  
  // Summary table
  doc.autoTable({
    startY: 55,
    head: [['Scope', 'Emissions (tonnes CO2e)', '% of Total']],
    body: [
      ['Scope 1 (Direct)', results.scope1.total.toLocaleString(), `${((results.scope1.total / results.total) * 100).toFixed(1)}%`],
      ['Scope 2 (Energy)', results.scope2.locationBased.toLocaleString(), `${((results.scope2.locationBased / results.total) * 100).toFixed(1)}%`],
      ['Scope 3 (Value Chain)', results.scope3.total.toLocaleString(), `${((results.scope3.total / results.total) * 100).toFixed(1)}%`],
      ['Total', results.total.toLocaleString(), '100%'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74] },
  });
  
  return doc;
}

export function downloadPDF(doc, filename = 'emissions-report.pdf') {
  doc.save(filename);
}
```

---

## Phase 9: Offline Support (2-3 hours)

### 9.1 Create Service Worker

**scripts/generateServiceWorker.js:**
```javascript
// Run: node scripts/generateServiceWorker.js
const { generateSW } = require('workbox-build');

generateSW({
  globDirectory: 'dist/',
  globPatterns: ['**/*.{html,js,css,png,svg,json}'],
  swDest: 'dist/sw.js',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/data\.epa\.gov/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'epa-api-cache',
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /^https:\/\/api\.carbonintensity\.org\.uk/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'uk-carbon-api-cache',
        networkTimeoutSeconds: 5,
      },
    },
  ],
}).then(({ count, size }) => {
  console.log(`Generated SW, cached ${count} files, totaling ${size} bytes.`);
});
```

### 9.2 Register Service Worker

Add to **src/main.jsx:**
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/carbonscope/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Phase 10: Testing & Deployment (2-3 hours)

### 10.1 Manual Testing Checklist

**Calculator Tests:**
- [ ] Scope 1 stationary combustion: 1000 MMBtu natural gas = ~53 tonnes CO2
- [ ] Flaring: 1 MMscf = ~60 tonnes CO2 (default method)
- [ ] Scope 2: 1,000,000 kWh × 0.373 = ~373 tonnes CO2 (US average)
- [ ] GWP toggle: CH4 × 30 (AR5) vs CH4 × 29.8 (AR6)

**UI Tests:**
- [ ] Responsive: Mobile (375px), Tablet (768px), Desktop (1280px)
- [ ] All routes work with HashRouter
- [ ] Forms validate inputs
- [ ] Error states display correctly

**Offline Tests:**
- [ ] App loads when offline
- [ ] Calculations work with cached data
- [ ] "Offline" indicator shows

### 10.2 Build for Production

```bash
npm run build
```

### 10.3 Deploy to GitHub Pages

```bash
# Install gh-pages if not already
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

npm run deploy
```

### 10.4 Post-Deployment Verification

1. Visit `https://[username].github.io/carbonscope/`
2. Test all routes via direct URL access
3. Test offline functionality
4. Verify API connections work

---

## Summary

**Total Estimated Time:** 40-60 hours

| Phase | Time | Description |
|-------|------|-------------|
| 1 | 2-3h | Project setup, Tailwind, routing |
| 2 | 3-4h | Data files (emission factors, grid factors) |
| 3 | 5-6h | Calculation services (Scope 1, 2, 3) |
| 4 | 3-4h | API services (EPA, UK, EIA) |
| 5 | 10-12h | React components |
| 6 | 3-4h | State management, hooks |
| 7 | 4-5h | Page implementations |
| 8 | 3-4h | Export & reporting |
| 9 | 2-3h | Offline support |
| 10 | 2-3h | Testing & deployment |

**Key Success Criteria:**
- Accurate emission calculations matching EPA/IPCC methodologies
- All calculation formulas traceable to official sources
- Offline-capable for field use
- Responsive across all device sizes
- GitHub Pages deployment working

---

*End of Development Instructions*
