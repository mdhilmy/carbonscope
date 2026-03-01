# CarbonScope

> ESG Carbon Footprint Calculator for Oil & Gas Operations

---

## Most Recent Update — March 2026

### Fixes & Improvements

**Dashboard (Central Hub)**
- Facility cards on Dashboard with status badges — green CheckCircle for facilities with saved calculations, gray Circle for empty
- Inline "Add Facility" form on Dashboard (name, type, region) — no separate page required
- Facility detail modal shows full Scope 1/2/3 breakdown, benchmark results, Generate Report (PDF) button, and Delete button
- Benchmarking panel: select facilities with calculation data, run comparison against industry averages, results saved per facility
- Removed standalone Benchmarks, Reports, and Facilities pages — all managed from Dashboard

**Calculator**
- Calculator now performs real GHG Protocol calculations using EPA emission factors — all user inputs flow through to results
- Mode indicator badge shows green (Simple) or blue (Expert) with a "Change mode" link
- Results page displays only scopes with actual data (empty scopes excluded)
- "Save to Facility" panel: save to existing facility (with overwrite warning) or create a new facility inline
- Share button copies Markdown report to clipboard
- Export dropdown: PDF, Markdown, CSV, JSON — all functional

**Tools Page**
- GWP Calculator: select gas, enter mass (kg), choose AR5/AR6/AR4, get CO2e result with per-gas GWP shown
- Emission Factor Lookup: select category (Stationary Combustion, Mobile Combustion, Flaring) and fuel type, view CO2/CH4/N2O factors from EPA 2024 Factors Hub
- Unit Converter unchanged (already functional)

**Help Page**
- Quick Start Guide rewritten for dashboard-centric workflow: Run Calculation → Save to Facility → View Dashboard → Benchmark & Export

**Facility State**
- All facilities persisted in localStorage under `carbonscope_facilities`
- Each facility stores: id, name, type, region, createdAt, updatedAt, calculations, benchmarks
- `facilityService.js` provides CRUD + `saveCalculationToFacility` + `saveBenchmarkToFacility`

### PRD & CLAUDE.md Change Impact

The following PRD-specified pages were **removed** because their functionality was consolidated into the Dashboard:
- `FacilitiesPage.jsx` — facility management is now inline on Dashboard
- `BenchmarksPage.jsx` — benchmarking runs from Dashboard panel
- `ReportsPage.jsx` — PDF report generation is in the facility detail modal and calculator results

Navigation (Sidebar, MobileMenu, constants.js) and routing (App.jsx) updated to remove these routes. The CLAUDE.md architecture diagram references these pages; they no longer exist as standalone routes.

---

## Overview

CarbonScope is a browser-based ESG carbon footprint calculator designed for oil and gas operations. It runs entirely client-side with no backend required, making it suitable for deployment on GitHub Pages or any static host.

**Key capabilities:**
- Scope 1, 2, and 3 emissions calculation following GHG Protocol methodology
- US EPA emission factors (2024 Factors Hub) built in
- IPCC AR5 and AR6 GWP values
- Offline-first — works without internet using cached factors
- Multi-facility management with persistent localStorage storage
- Export to PDF, Markdown, CSV, and JSON

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build | Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 (HashRouter) |
| Offline | Dexie.js (IndexedDB) + Workbox Service Worker |
| Export | jsPDF, native Blob/CSV |
| Icons | Lucide React |
| Deployment | GitHub Pages |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## Application Structure

```
src/
├── components/
│   ├── calculator/
│   │   ├── scope1/         Scope 1 input forms
│   │   ├── scope2/         Scope 2 input forms
│   │   ├── scope3/         Scope 3 input forms
│   │   ├── results/        ResultsSummary (display, export, save-to-facility)
│   │   ├── CalculatorWizard.jsx   Wizard + runCalculations()
│   │   └── ModeSelector.jsx
│   ├── common/             Shared UI (Button, Card, Input, Select, Modal, Alert)
│   └── layout/             Header, Sidebar, MobileMenu, Layout
├── context/
│   ├── AppContext.jsx      Global settings (GWP version, theme)
│   └── NotificationContext.jsx  Toast notifications
├── data/
│   ├── emissionFactors/    epaFactors.json
│   ├── gridFactors/        globalGridFactors.json
│   ├── gwpValues.json      AR4/AR5/AR6 GWP tables
│   └── industryBenchmarks.json
├── pages/
│   ├── DashboardPage.jsx   Facility cards, detail modal, benchmarking
│   ├── CalculatorPage.jsx  Mode selector → CalculatorWizard
│   ├── ToolsPage.jsx       Unit converter, GWP calculator, EF lookup
│   ├── SettingsPage.jsx    GWP version, API keys
│   └── HelpPage.jsx        Quick start, FAQ, methodology reference
└── services/
    ├── calculations/       Scope 1/2/3, flaring, fugitive, GWP conversion
    ├── api/                EPA Envirofacts, UK Carbon Intensity, EIA
    ├── export/             PDF (jsPDF), Markdown, CSV, JSON generators
    ├── facilityService.js  localStorage CRUD for facilities
    └── storage/            IndexedDB (Dexie), Service Worker
```

---

## Pages & Navigation

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with feature overview |
| `/dashboard` | Dashboard | Facility cards, detail modals, benchmarking |
| `/calculator` | Calculator | Scope 1/2/3 wizard with real calculations |
| `/tools` | Tools | Unit converter, GWP calculator, EF lookup |
| `/settings` | Settings | GWP version, API key management |
| `/help` | Help | Quick start guide, FAQ, methodology docs |

---

## Calculation Methodology

### Scope 1 — Direct Emissions

| Source | Method | Reference |
|--------|--------|-----------|
| Stationary Combustion | `fuel_MMBtu × EF_kg_per_MMBtu` | EPA Table C-1 |
| Mobile Combustion | `fuel_gallons × EF_kg_per_gallon` | EPA Table C-2 |
| Flaring | `volume_MMscf × HHV × EF × combustion_efficiency` | 40 CFR § 98.253 |
| Venting | `volume_MCF × CH4_density × CH4_fraction × GWP_CH4` | GHG Protocol |
| Fugitive (simple) | `production_BOE × avg_factor_kg_CH4_per_BOE` | EPA Protocol |
| Fugitive (expert) | `Σ(component_count × EF_lb_per_hr × 8760)` | EPA Protocol |

### Scope 2 — Indirect Energy Emissions

| Method | Formula |
|--------|---------|
| Location-based | `electricity_kWh × grid_factor_kgCO2_per_kWh / 1000` |
| Market-based | `(electricity_kWh − RECs_kWh) × supplier_factor / 1000` |

### Scope 3 — Value Chain

| Category | Method |
|----------|--------|
| Cat. 11 — Use of Sold Products | `product_volume × combustion_factor` (gasoline: 8.887 kg/gal, diesel: 10.18 kg/gal) |

### GWP Values (100-year)

| Gas | AR5 | AR6 |
|-----|-----|-----|
| CO2 | 1 | 1 |
| CH4 (fossil) | 30 | 29.8 |
| N2O | 265 | 273 |
| SF6 | 23,500 | 24,300 |

---

## Facility Data Model

Each facility stored in localStorage (`carbonscope_facilities`):

```json
{
  "id": "facility_1709312000000",
  "name": "Platform Alpha",
  "type": "production",
  "region": "US",
  "createdAt": "2026-03-01T...",
  "updatedAt": "2026-03-01T...",
  "calculations": {
    "gwpVersion": "AR5",
    "calculatedAt": "2026-03-01T...",
    "totals": {
      "scope1_tonnes": 1200.5,
      "scope2_tonnes": 320.1,
      "scope3_tonnes": 45000.0,
      "total_tonnes": 46520.6
    },
    "scope1": { "stationaryCombustion": { "co2e_tonnes": 800 }, "flaring": { "co2e_tonnes": 400.5 } },
    "scope2": { "locationBased": { "co2e_tonnes": 320.1, "gridFactor": 0.373 } },
    "scope3": { "total_co2e_tonnes": 45000 },
    "savedAt": "2026-03-01T..."
  },
  "benchmarks": null
}
```

---

## API Integrations

### No API Key Required

| API | Purpose |
|-----|---------|
| EPA Envirofacts | Facility benchmarks, regulatory data |
| UK Carbon Intensity | Real-time UK grid intensity |
| Our World in Data | Global CO2 historical data |
| World Bank | Country-level energy indicators |

### API Key Required (configured in Settings)

| API | Purpose | Registration |
|-----|---------|-------------|
| EIA Open Data | US energy prices and electricity data | eia.gov/opendata |
| ElectricityMaps | Real-time global grid carbon intensity | electricitymaps.com |

API keys are stored in localStorage. Features that require API keys display a warning and use fallback data until a key is configured.

---

## Deployment

The app is deployed to GitHub Pages at:
`https://<username>.github.io/CarbonScope/`

HashRouter is used (not BrowserRouter) because GitHub Pages does not support server-side routing. The `base` path in `vite.config.js` must match the repository name.

```bash
npm run deploy   # Runs build then gh-pages -d dist
```

---

## Known Constraints

- **No backend** — All logic runs client-side; no server, no database
- **API keys in localStorage** — User-managed; not synced across devices
- **Bundle size target** — Keep initial JS under 500 KB gzipped
- **HashRouter required** — GitHub Pages static hosting limitation
- **Offline limits** — Real-time grid API data unavailable when offline; cached/fallback values used

---

## References

- [GHG Protocol Corporate Standard](https://ghgprotocol.org/corporate-standard)
- [EPA GHG Emission Factors Hub 2024](https://www.epa.gov/climateleadership)
- [40 CFR Part 98 — Mandatory GHG Reporting](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-98)
- [IPCC AR6 — Climate Change 2021](https://www.ipcc.ch/report/ar6/wg1/)
- [eGRID — US Grid Emission Factors](https://www.epa.gov/egrid)

---

*CarbonScope v2.0.0 — Built for oil & gas ESG reporting*
