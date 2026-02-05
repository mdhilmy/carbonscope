# CLAUDE.md - CarbonScope Development Context Guide

## Project Identity

**Name:** CarbonScope  
**Type:** ESG Carbon Footprint Calculator for Oil & Gas Operations  
**Stack:** React 18 + Vite + Tailwind CSS + HashRouter  
**Deployment:** GitHub Pages (static site)

---

## Quick Reference

### Essential Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build to /dist
npm run preview      # Preview production build
npm run deploy       # Build and deploy to GitHub Pages
```

### Key Directories
```
src/components/calculator/    # Main calculator components
src/services/calculations/    # Emission calculation logic
src/services/api/             # API integrations
src/data/                     # Static emission factors JSON
src/hooks/                    # Custom React hooks
src/context/                  # React Context providers
```

### Critical Files
```
src/data/emissionFactors/epaFactors.json     # US EPA factors
src/data/gridFactors/globalGridFactors.json  # Grid emission factors
src/services/calculations/scope1Calculations.js
src/services/calculations/flaringCalculations.js
vite.config.js                                # Build config with base URL
```

---

## Architecture Overview

### Component Hierarchy
```
App.jsx
├── AppContext (global state)
├── Layout
│   ├── Header
│   ├── Sidebar (desktop) / MobileMenu (mobile)
│   └── PageContainer
└── Routes (HashRouter)
    ├── HomePage
    ├── DashboardPage
    ├── CalculatorPage
    │   └── CalculatorWizard
    │       ├── Scope1Calculator
    │       ├── Scope2Calculator
    │       ├── Scope3Calculator
    │       └── ResultsSummary
    ├── BenchmarksPage
    ├── ReportsPage
    ├── FacilitiesPage
    ├── SettingsPage
    └── HelpPage
```

### State Management
- **AppContext:** User settings, active facility, notifications
- **CalculationContext:** Current calculation state, results
- **FacilityContext:** Facility list and management
- **Local state:** Component-specific UI state

### Data Flow
```
User Input → Validation → Calculation Service → Result
                              ↓
                    Emission Factors (JSON)
                              +
                    API Data (if available)
```

---

## Calculation Logic

### Scope 1 Formulas

**Stationary Combustion:**
```javascript
// Location: src/services/calculations/scope1Calculations.js
CO2_kg = fuel_quantity_MMBtu * emissionFactor_kgCO2_per_MMBtu
// Natural gas: 53.06 kg CO2/MMBtu
// Diesel: 73.96 kg CO2/MMBtu
```

**Flaring (40 CFR § 98.253):**
```javascript
// Location: src/services/calculations/flaringCalculations.js
// Default method (unknown composition):
CO2_tonnes = volume_MMscf * HHV_MMBtu_per_MMscf * 60 * 0.001
// Where 60 = default emission factor (kg CO2/MMBtu)
// Combustion efficiency default: 0.98 (98%)
```

**Fugitive Emissions:**
```javascript
// Location: src/services/calculations/fugitiveCalculations.js
// Component count method:
THC_lb_per_year = Σ(component_count * factor_lb_per_hr * 8760)
CH4_kg = THC_lb_per_year * 0.6 * 0.453592  // 60% CH4 assumption
```

### Scope 2 Formulas

**Location-Based:**
```javascript
// Location: src/services/calculations/scope2Calculations.js
CO2e_tonnes = electricity_kWh * gridFactor_kgCO2_per_kWh / 1000
```

**Market-Based:**
```javascript
CO2e_tonnes = (electricity_kWh - REC_MWh * 1000) * marketFactor / 1000
```

### Scope 3 Category 11

**Use of Sold Products:**
```javascript
// Location: src/services/calculations/scope3Calculations.js
CO2_tonnes = Σ(product_volume * combustionFactor) / 1000
// Gasoline: 8.887 kg CO2/gallon
// Diesel: 10.180 kg CO2/gallon
```

### GWP Conversion
```javascript
// Location: src/services/calculations/gwpConversions.js
CO2e = CO2 + (CH4 * GWP_CH4) + (N2O * GWP_N2O)
// AR5: CH4=30 (fossil), N2O=265
// AR6: CH4=29.8 (fossil), N2O=273
```

---

## API Integration

### Free APIs (No Auth Required)

| API | Base URL | Use Case |
|-----|----------|----------|
| EPA Envirofacts | `https://data.epa.gov/efservice` | Facility benchmarks |
| UK Carbon Intensity | `https://api.carbonintensity.org.uk` | UK real-time grid |
| Our World in Data | `https://nyc3.digitaloceanspaces.com/owid-public/data/co2` | Global emissions |
| World Bank | `https://api.worldbank.org/v2` | Country indicators |

### APIs Requiring Free Key

| API | Registration | Storage |
|-----|--------------|---------|
| EIA | eia.gov/opendata/register.php | localStorage (encrypted) |
| ElectricityMaps | electricitymaps.com | localStorage (encrypted) |

### API Client Pattern
```javascript
// Location: src/services/api/apiClient.js
async function fetchWithFallback(primaryUrl, fallbackData, options = {}) {
  try {
    const response = await fetch(primaryUrl, {
      ...options,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { data: await response.json(), source: 'api' };
  } catch (error) {
    console.warn('API fetch failed, using fallback:', error.message);
    return { data: fallbackData, source: 'fallback' };
  }
}
```

### Error Handling
```javascript
// Always show user-friendly messages
const API_ERRORS = {
  NETWORK_ERROR: 'Unable to connect. Using offline data.',
  API_KEY_INVALID: 'API key invalid. Check Settings.',
  RATE_LIMITED: 'Too many requests. Try again later.',
};
```

---

## Data Files

### Emission Factors Structure
```javascript
// src/data/emissionFactors/epaFactors.json
{
  "stationaryCombustion": {
    "naturalGas": { "co2": 53.06, "ch4": 0.001, "n2o": 0.0001, "unit": "kg/MMBtu" },
    "diesel": { "co2": 73.96, "ch4": 0.003, "n2o": 0.0006, "unit": "kg/MMBtu" }
  },
  "mobileCombustion": { ... },
  "flaring": { ... }
}
```

### Grid Factors Structure
```javascript
// src/data/gridFactors/globalGridFactors.json
{
  "US": {
    "national": { "factor": 0.373, "unit": "kgCO2/kWh", "year": 2022 },
    "subregions": {
      "CAMX": { "factor": 0.226, "unit": "kgCO2/kWh" },
      "ERCT": { "factor": 0.370, "unit": "kgCO2/kWh" }
    }
  },
  "MY": {
    "peninsular": { "factor": 0.774, "unit": "tCO2e/MWh" },
    "sabah": { "factor": 0.531 },
    "sarawak": { "factor": 0.199 }
  }
}
```

---

## UI Patterns

### Color Usage
```jsx
// Primary actions - Green
className="bg-primary-600 hover:bg-primary-700 text-white"

// Secondary actions - Gray
className="bg-secondary-100 hover:bg-secondary-200 text-secondary-700"

// Scope indicators
scope1: "bg-red-500"    // Direct emissions
scope2: "bg-amber-500"  // Energy
scope3: "bg-blue-500"   // Value chain

// Status
success: "bg-green-50 text-green-800 border-green-200"
warning: "bg-amber-50 text-amber-800 border-amber-200"
error: "bg-red-50 text-red-800 border-red-200"
```

### Component Patterns
```jsx
// Card
<div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">

// Input with label
<label className="block text-sm font-medium text-secondary-700 mb-1">
<input className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />

// Button
<button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
```

### Responsive Breakpoints
```
sm: 640px   - Mobile landscape
md: 768px   - Tablet
lg: 1024px  - Desktop sidebar visible
xl: 1280px  - Wide desktop
```

---

## Offline Support

### Service Worker (Workbox)
```javascript
// Location: scripts/generateServiceWorker.js
// Strategy: Cache static assets, stale-while-revalidate for data
```

### IndexedDB (Dexie)
```javascript
// Location: src/services/storage/indexedDB.js
// Tables: facilities, calculations, emissionFactors, gridFactors, settings
```

### Offline-First Pattern
```javascript
async function getEmissionFactor(fuelType, region) {
  // 1. Check IndexedDB cache
  const cached = await db.emissionFactors.get({ fuelType, region });
  if (cached && !isStale(cached)) return cached;
  
  // 2. Try API
  try {
    const apiData = await fetchFromApi(fuelType, region);
    await db.emissionFactors.put(apiData);
    return apiData;
  } catch {
    // 3. Use cached or default
    return cached || DEFAULT_FACTORS[fuelType];
  }
}
```

---

## Common Tasks

### Adding a New Emission Factor
1. Add to `src/data/emissionFactors/*.json`
2. Update type definitions if using TypeScript
3. Add to calculation service
4. Add to UI dropdown

### Adding a New Calculation Type
1. Create calculation function in `src/services/calculations/`
2. Add input component in `src/components/calculator/`
3. Integrate into `CalculatorWizard.jsx`
4. Add to results display

### Adding a New API
1. Create API service in `src/services/api/`
2. Add fallback handling
3. Add API key management (if required)
4. Add to Settings page

### Adding a New Report Template
1. Create template component in `src/components/reports/`
2. Add export function in `src/services/export/`
3. Add to `ReportTemplateSelector.jsx`

---

## Testing Checklist

### Calculator Tests
- [ ] Scope 1 calculation accuracy vs EPA examples
- [ ] Flaring formula matches 40 CFR § 98.253
- [ ] GWP conversions correct for AR5/AR6
- [ ] Unit conversions accurate

### API Tests
- [ ] Graceful fallback when offline
- [ ] Invalid API key handling
- [ ] Rate limit handling
- [ ] Timeout handling (5s)

### UI Tests
- [ ] Responsive at all breakpoints
- [ ] Keyboard navigation
- [ ] Error states displayed
- [ ] Loading states displayed

### Offline Tests
- [ ] Calculator works offline
- [ ] Data persists in IndexedDB
- [ ] Service worker caches assets
- [ ] Sync when online

---

## Known Constraints

1. **HashRouter required** - GitHub Pages doesn't support client-side routing
2. **No server** - All logic client-side, no backend
3. **API keys in localStorage** - User responsibility to manage
4. **Bundle size** - Keep < 500KB initial load
5. **Offline limits** - Real-time grid data unavailable offline

---

## Useful References

### Official Documentation
- GHG Protocol: ghgprotocol.org
- EPA Emission Factors: epa.gov/climateleadership
- 40 CFR Part 98: ecfr.gov

### API Docs
- EPA Envirofacts: epa.gov/enviro/envirofacts-data-service-api
- UK Carbon Intensity: carbonintensity.org.uk
- EIA: eia.gov/opendata/documentation.php

### Research Document
- See `RESEARCH.md` for comprehensive emission factors and regulatory details

---

## Quick Fixes

### "Page not found on refresh"
- Ensure HashRouter, not BrowserRouter
- Check `base` in vite.config.js matches repo name

### "API returning errors"
- Check CORS (use proxy in dev if needed)
- Verify API endpoint URLs
- Check API key validity in Settings

### "Calculations seem wrong"
- Verify unit conversions (MMBtu vs MJ, gallons vs liters)
- Check GWP version (AR5 vs AR6)
- Compare against RESEARCH.md reference values

### "Offline not working"
- Service worker registered?
- Check IndexedDB in DevTools
- Verify Workbox configuration

---

*This document serves as the primary context for Claude Code when working on CarbonScope.*
