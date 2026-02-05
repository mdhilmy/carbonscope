# ESG Carbon Footprint Calculator - Deep Research Document

## Executive Summary

This document contains comprehensive research for building an **ESG Carbon Footprint Calculator** for oil and gas operations. The research covers emission factor databases from **9+ regional jurisdictions**, GHG Protocol methodologies for all three scopes, free public APIs for real-time data integration, and regulatory requirements from SEC, EU CSRD, TCFD, CDP, and regional frameworks.

---

## Table of Contents

1. [US EPA Emission Factors](#1-us-epa-emission-factors)
2. [EU and UK Emission Standards](#2-eu-and-uk-emission-standards)
3. [Regional Emission Factors by Country](#3-regional-emission-factors-by-country)
4. [GHG Protocol Methodologies](#4-ghg-protocol-methodologies)
5. [Regulatory Reporting Requirements](#5-regulatory-reporting-requirements)
6. [Free Public APIs](#6-free-public-apis)
7. [Oil & Gas Specific Calculations](#7-oil--gas-specific-calculations)
8. [Industry Benchmarks and Targets](#8-industry-benchmarks-and-targets)
9. [Technical Standards](#9-technical-standards)
10. [Sources and Citations](#10-sources-and-citations)

---

## 1. US EPA Emission Factors

### 1.1 Stationary Combustion Factors (EPA GHG Emission Factors Hub 2024)

| Fuel Type | CO2 Factor | CH4 Factor | N2O Factor | Unit |
|-----------|------------|------------|------------|------|
| Natural Gas | 53.06 | 0.001 | 0.0001 | kg/MMBtu |
| Distillate Fuel Oil #2 (Diesel) | 73.96 | 0.003 | 0.0006 | kg/MMBtu |
| Residual Fuel Oil #6 | 75.10 | 0.003 | 0.0006 | kg/MMBtu |
| Crude Oil | 74.54 | 0.003 | 0.0006 | kg/MMBtu |
| LPG | 62.98 | 0.003 | 0.0006 | kg/MMBtu |
| Motor Gasoline | 70.22 | 0.003 | 0.0006 | kg/MMBtu |
| Kerosene/Jet Fuel | 72.22 | 0.003 | 0.0006 | kg/MMBtu |
| Petroleum Coke | 102.41 | 0.003 | 0.0006 | kg/MMBtu |

**Source:** [EPA GHG Emission Factors Hub 2024](https://www.epa.gov/system/files/documents/2024-02/ghg-emission-factors-hub-2024.pdf)

### 1.2 Mobile Combustion Factors

| Vehicle Type | CO2 Factor | CH4 Factor | N2O Factor | Unit |
|--------------|------------|------------|------------|------|
| Gasoline Passenger Cars | 8.887 | 0.0002 | 0.0001 | kg/gallon |
| Gasoline Light Trucks | 8.887 | 0.0004 | 0.0002 | kg/gallon |
| Diesel Heavy-Duty Trucks | 10.21 | 0.0051 | 0.0048 | kg/gallon |
| Diesel Equipment | 10.21 | 0.0010 | 0.0001 | kg/gallon |

**Source:** [EPA GHG Emission Factors Hub 2024](https://www.epa.gov/system/files/documents/2024-02/ghg-emission-factors-hub-2024.pdf)

### 1.3 eGRID Subregional Emission Factors (2022 Data)

| eGRID Subregion | CO2 (lb/MWh) | CH4 (lb/GWh) | N2O (lb/GWh) |
|-----------------|--------------|--------------|--------------|
| CAMX (California) | 497.4 | 30.2 | 4.8 |
| ERCT (Texas) | 814.2 | 51.8 | 8.2 |
| FRCC (Florida) | 824.1 | 63.4 | 7.8 |
| MROW (Midwest) | 988.6 | 86.2 | 14.2 |
| NEWE (New England) | 453.8 | 58.2 | 6.4 |
| NWPP (Northwest) | 612.4 | 42.1 | 8.6 |
| RFCE (Mid-Atlantic) | 636.8 | 48.2 | 9.2 |
| SRMW (Upper Midwest) | 1,369.9 | 112.4 | 21.8 |
| US National Average | 823.1 | 68.4 | 11.2 |

**Source:** [EPA eGRID 2022](https://www.epa.gov/egrid)

### 1.4 40 CFR Part 98 Subpart W - Pneumatic Device Emission Factors

| Device Type | Emission Factor (scfh) | Annual Emissions (Mcf/device) |
|-------------|------------------------|------------------------------|
| High-bleed continuous pneumatic | 37.3 | 327 |
| Low-bleed continuous pneumatic | 1.39 | 12.2 |
| Intermittent bleed pneumatic | 13.5 | 118 |
| Pneumatic pumps | 71.7 | 628 |

**Source:** [40 CFR § 98.233](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-98/subpart-W)

### 1.5 Flaring Methodology (40 CFR § 98.253)

**Default Values:**
- Combustion Efficiency: **0.98 (98%)**
- CO2 Emission Factor: **60 kg CO2/MMBtu** (when gas composition unknown)
- Molar Volume Conversion (MVC): **849.5 scf/kg-mole** at 68°F or **836.6 scf/kg-mole** at 60°F

**Primary Flaring Equation:**
```
CO2 = 0.98 × 0.001 × Σ[(Flare Gas_p) × (MW_p/MVC) × (CC_p) × 44/12]
```

**CH4 from Flaring:**
```
CH4 = CO2 × (EmF_CH4/EmF) × (0.02/0.98) × (16/44) × f_CH4
```
Where f_CH4 (fraction of carbon from methane) defaults to **0.4**

**Source:** [40 CFR § 98.253](https://www.law.cornell.edu/cfr/text/40/98.253)

---

## 2. EU and UK Emission Standards

### 2.1 EU ETS Monitoring and Reporting Regulation (MRR) Emission Factors

| Fuel Type | IPCC Default (t CO2/TJ) | EU Maritime (t CO2/t fuel) | Net Calorific Value (GJ/t) |
|-----------|------------------------|---------------------------|---------------------------|
| Natural Gas | 56.1 | 2.750 (LNG) | 48.0 |
| Crude Oil | 73.3 | — | 42.3 |
| Gas/Diesel Oil | 74.1 | 3.206 (MDO/MGO) | 43.0 |
| Heavy Fuel Oil | 77.4 | 3.114 (HFO) | 40.4 |
| Petroleum Coke | 97.5 | — | 32.5 |
| Refinery Gas | 57.6 | — | 49.5 |

**Tier Uncertainty Requirements:**
- Tier 1: ±7.5% for major sources
- Tier 2: ±5.0%
- Tier 3: ±2.5%
- Tier 4: ±1.5% (CEMS required)

**Source:** EU ETS MRR Regulation (EU) 2018/2066

### 2.2 UK DESNZ/DEFRA Conversion Factors (2024)

| Fuel Type | CO2 Factor | CH4 Factor | N2O Factor | Total CO2e | Unit |
|-----------|------------|------------|------------|------------|------|
| Natural Gas (Gross CV) | 0.18254 | 0.00036 | 0.00097 | 0.18387 | kg CO2e/kWh |
| Natural Gas (Net CV) | 0.20227 | 0.00040 | 0.00107 | 0.20374 | kg CO2e/kWh |
| Diesel (Average) | 2.51233 | 0.00047 | 0.18904 | 2.70184 | kg CO2e/litre |
| Petrol (Average) | 2.16319 | 0.00328 | 0.17505 | 2.34152 | kg CO2e/litre |
| Gas Oil | 2.75776 | 0.00055 | 0.20760 | 2.96591 | kg CO2e/litre |
| LPG | 1.55537 | 0.00061 | 0.00097 | 1.55695 | kg CO2e/litre |

**UK Grid Electricity Factor:** 0.21233 kg CO2e/kWh (with 7-8% T&D losses)

**Source:** [UK Government GHG Conversion Factors 2024](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024)

---

## 3. Regional Emission Factors by Country

### 3.1 Grid Emission Factors by Region

| Country/Region | Grid Emission Factor | Unit | Primary Energy Mix |
|----------------|---------------------|------|-------------------|
| **North America** |
| United States (Average) | 0.373 | kg CO2/kWh | Mixed |
| Canada | 0.120 | kg CO2/kWh | 60% Hydro |
| **Europe** |
| United Kingdom | 0.212 | kg CO2/kWh | Gas + Renewables |
| Germany | 0.380 | kg CO2/kWh | Coal + Gas + Renewables |
| France | 0.052 | kg CO2/kWh | 70% Nuclear |
| Norway | 0.017 | kg CO2/kWh | 95% Hydro |
| Poland | 0.720 | kg CO2/kWh | 70% Coal |
| **Asia-Pacific** |
| Singapore | 0.402 | kg CO2/kWh | Natural Gas |
| Peninsular Malaysia | 0.774 | t CO2e/MWh | Mixed Thermal |
| Sabah, Malaysia | 0.531 | t CO2e/MWh | Mixed |
| Sarawak, Malaysia | 0.199 | t CO2e/MWh | 70% Hydro |
| Australia (National) | 0.680 | kg CO2e/kWh | Mixed |
| Australia (Victoria) | 0.790 | kg CO2e/kWh | Brown Coal |
| Australia (Tasmania) | 0.130 | kg CO2e/kWh | Hydro |
| Australia (South Australia) | 0.300 | kg CO2e/kWh | Wind + Gas |
| Japan | 0.470 | kg CO2/kWh | Mixed |
| South Korea | 0.420 | kg CO2/kWh | Coal + Nuclear |
| China | 0.550 | kg CO2/kWh | 60% Coal |
| India | 0.700 | kg CO2/kWh | 70% Coal |
| **Middle East** |
| UAE | 0.450 | kg CO2/kWh | Natural Gas |
| Saudi Arabia | 0.520 | kg CO2/kWh | Oil + Gas |
| Qatar | 0.480 | kg CO2/kWh | Natural Gas |
| **Latin America** |
| Brazil | 0.070-0.100 | t CO2/MWh | 65% Hydro |
| Mexico | 0.450 | kg CO2/kWh | Mixed |
| Argentina | 0.380 | kg CO2/kWh | Gas + Hydro |
| **Africa** |
| South Africa | 0.950-1.000 | kg CO2/kWh | 85% Coal |
| Nigeria | 0.430 | kg CO2/kWh | Gas |
| Egypt | 0.480 | kg CO2/kWh | Gas |

**Sources:** 
- [Bloomberg Malaysia Grid Analysis 2025](https://assets.bbhub.io/professional/sites/24/Malaysia-A-Techno-Economic-Analysis-of-Power-Generation.pdf)
- [IEA Emission Factors](https://www.iea.org/data-and-statistics)
- [IPCC National Inventory Guidelines](https://www.ipcc-nggip.iges.or.jp/)

### 3.2 Malaysia Specific Standards

**Bursa Malaysia Sustainability Reporting Requirements:**
- Effective FY 2025 for companies with market cap ≥ RM2 billion
- Mandatory Scope 1, 2, and 3 reporting aligned with IFRS S2
- GHG emissions intensity per revenue required

**SEDG GHG Calculator Default Values:**
- Uses IPCC 2006 Guidelines methodology
- GWP values: CO2=1, CH4=28, N2O=265 (AR5)
- Grid emission factors by state (Peninsular, Sabah, Sarawak)

**Source:** [Bursa Malaysia Sustainability Requirements](https://www.lexology.com/library/detail.aspx?g=90eb0e3f-1139-4777-985b-40a346a7afc1)

### 3.3 Middle East National Oil Companies Standards

| Company | Methodology | GWP Values | Boundary | Net-Zero Target |
|---------|-------------|------------|----------|-----------------|
| Saudi Aramco | GHG Protocol + API Compendium | AR5 | Operational Control | 2050 (Scope 1&2) |
| ADNOC (UAE) | GHG Protocol + IPIECA | AR5 | Operational Control | 2045 |
| QatarEnergy | GHG Protocol + OGMP 2.0 | AR5 | Operational Control | 2030 (Carbon Neutral LNG) |
| Kuwait Oil | GHG Protocol | AR5 | Operational Control | 2050 |

**Source:** [Oil & Gas Middle East Net-Zero Analysis](https://www.oilandgasmiddleeast.com/business/turbocharging-net-zero-electrification-in-the-gccs-oil-gas-sector)

### 3.4 Australia NGER Emission Factors

| State | Grid Emission Factor (kg CO2e/kWh) | Primary Source |
|-------|-----------------------------------|----------------|
| New South Wales | 0.68 | Black Coal |
| Victoria | 0.79 | Brown Coal |
| Queensland | 0.73 | Black Coal + Gas |
| South Australia | 0.30 | Wind + Gas |
| Western Australia | 0.54 | Gas + Coal |
| Tasmania | 0.13 | Hydro |
| Northern Territory | 0.58 | Gas |

**NGER Reporting Thresholds:**
- Corporate threshold: 50,000 t CO2e/year
- Facility threshold: 25,000 t CO2e/year
- Safeguard Mechanism: 100,000 t CO2e Scope 1

**Source:** [Australia DCCEEW Safeguard Mechanism](https://www.dcceew.gov.au/climate-change/emissions-reporting/national-greenhouse-energy-reporting-scheme/safeguard-mechanism)

---

## 4. GHG Protocol Methodologies

### 4.1 Scope 1: Direct Emissions

**Categories:**
1. Stationary Combustion (boilers, heaters, furnaces)
2. Mobile Combustion (vehicles, vessels, aircraft)
3. Process Emissions (chemical/physical processes)
4. Fugitive Emissions (equipment leaks, venting)

**Basic Calculation Formula:**
```
Emissions (kg CO2e) = Activity Data × Emission Factor × GWP
```

**Stationary Combustion Example:**
```
CO2 (kg) = Fuel Consumption (MMBtu) × Emission Factor (kg CO2/MMBtu)
```

### 4.2 Scope 2: Indirect Energy Emissions

**Location-Based Method:**
- Uses grid-average emission factors
- Reflects average emissions intensity of grids
- Sources: EPA eGRID (US), IEA (International), National inventories

**Market-Based Method:**
- Uses contractual instruments
- Hierarchy: Energy Attribute Certificates → PPAs → Supplier-specific rates → Residual mix

**Dual Reporting Requirement:** Both methods must be reported under GHG Protocol Scope 2 Guidance

**Source:** [Persefoni Scope 2 Guidance](https://www.persefoni.com/blog/scope-2-dual-reporting-market-and-location-based-carbon-accounting), [Deloitte DART](https://dart.deloitte.com/USDART/home/publications/deloitte/additional-deloitte-guidance/greenhouse-gas-protocol-reporting-considerations/chapter-5-ghg-protocol-scope-2/5-2-approaches-accounting-for-scope)

### 4.3 Scope 3: Value Chain Emissions

**All 15 Categories:**

| Category | Description | O&G Relevance |
|----------|-------------|---------------|
| 1 | Purchased Goods & Services | Medium |
| 2 | Capital Goods | Medium |
| 3 | Fuel & Energy Related | High |
| 4 | Upstream Transportation | High |
| 5 | Waste Generated | Low |
| 6 | Business Travel | Low |
| 7 | Employee Commuting | Low |
| 8 | Upstream Leased Assets | Medium |
| 9 | Downstream Transportation | High |
| 10 | Processing of Sold Products | High |
| 11 | **Use of Sold Products** | **Critical (91% of Scope 3)** |
| 12 | End-of-Life Treatment | Low |
| 13 | Downstream Leased Assets | Low |
| 14 | Franchises | N/A |
| 15 | Investments | Medium |

**Category 11 Calculation (Use of Sold Products):**
```
CO2e = Σ (Quantity of fuel sold × Combustion emission factor)
```

**Key Combustion Factors for Sold Products:**
| Product | kg CO2/gallon | kg CO2/litre | kg CO2/barrel |
|---------|--------------|--------------|---------------|
| Motor Gasoline | 8.887 | 2.348 | 373 |
| Diesel | 10.180 | 2.689 | 428 |
| Jet Fuel | 9.57 | 2.53 | 402 |
| LPG | 5.68 | 1.50 | 239 |
| Residual Fuel Oil | 11.27 | 2.98 | 473 |

**Source:** [CDP Scope 3 Category 11 Guidance for Oil & Gas](https://cdn.cdp.net/cdp-production/cms/guidance_docs/pdfs/000/000/469/original/CDP-Scope-3-Category11-Guidance-Oil-Gas.pdf), [GHG Protocol Chapter 11](https://ghgprotocol.org/sites/default/files/2022-12/Chapter11.pdf)

### 4.4 Global Warming Potential (GWP) Values

| Gas | Chemical Formula | AR5 100-yr | AR6 100-yr | AR6 20-yr |
|-----|-----------------|------------|------------|-----------|
| Carbon Dioxide | CO2 | 1 | 1 | 1 |
| Methane (fossil) | CH4 | 30 | 29.8 | 82.5 |
| Methane (non-fossil) | CH4 | 28 | 27.0 | 80.8 |
| Nitrous Oxide | N2O | 265 | 273 | 273 |
| Sulfur Hexafluoride | SF6 | 23,500 | 24,300 | 18,300 |
| HFC-134a | C2H2F4 | 1,300 | 1,530 | 4,140 |
| PFC-14 | CF4 | 6,630 | 7,380 | 5,300 |

**Note:** Most regulations currently use AR5 values; AR6 is increasingly accepted.

**Source:** [GHG Protocol GWP Values (August 2024)](https://ghgprotocol.org/sites/default/files/2024-08/Global-Warming-Potential-Values%20(August%202024).pdf)

---

## 5. Regulatory Reporting Requirements

### 5.1 SEC Climate Disclosure Rules (US)

**Status:** Currently **stayed pending litigation** (as of 2024)

**If Implemented:**
- **Scope 1 & 2 Only** (Scope 3 not required)
- Material emissions only for Large Accelerated Filers and Accelerated Filers
- Smaller Reporting Companies and EGCs exempt
- Limited assurance by FY 2029 for LAFs
- Reasonable assurance by FY 2033

**Source:** SEC Final Rules Release No. 33-11275

### 5.2 EU Corporate Sustainability Reporting Directive (CSRD)

**Key Requirements (ESRS E1):**
- **Mandatory Scope 3 reporting** (first regulation to require this)
- Gross Scope 1, 2, and 3 emissions (no netting against carbon credits)
- Both location-based AND market-based Scope 2
- GHG emissions intensity per net revenue
- 1.5°C-aligned transition plan
- Double materiality assessment

**Implementation Timeline (Post-Omnibus):**
- Wave 1: Large companies under NFRD - FY 2024
- Wave 2: Large companies not under NFRD - FY 2027 (delayed from 2025)
- Wave 3: Listed SMEs - FY 2028 (delayed from 2026)

### 5.3 TCFD Framework Requirements

**Four Pillars:**
1. **Governance** - Board oversight, management role
2. **Strategy** - Climate risks/opportunities, scenario analysis
3. **Risk Management** - Identification, assessment, integration
4. **Metrics & Targets** - Scope 1, 2, 3 emissions, climate targets

**Sector-Specific Guidance for Energy:**
- Operational emissions intensity (Scope 1&2 per unit production)
- Methane emissions and intensity
- Capital deployment toward low-carbon alternatives

### 5.4 CDP Questionnaire Requirements

**Scoring Levels:**
- **D** - Disclosure (basic reporting)
- **C** - Awareness (understanding climate issues)
- **B** - Management (taking coordinated action)
- **A** - Leadership (best practice implementation)

**A-List Requirements for Oil & Gas:**
- 100% Scope 1 and 2 verification coverage
- At least 70% of one Scope 3 category verified
- SBTi-aligned or 1.5°C pathway targets for Scope 1, 2, and 3

**Source:** [CDP Scoring Methodology](https://climate.sustainability-directory.com/question/how-does-cdp-scoring-system-work/)

### 5.5 Regional Regulatory Thresholds Summary

| Jurisdiction | Threshold | Requirement |
|--------------|-----------|-------------|
| EPA GHGRP (US) | 25,000 MT CO2e/year | Mandatory reporting |
| EPA Super-Emitter | 100 kg/hr methane | Detection and response |
| EU ETS | >20 MW thermal input | Allowance requirements |
| Australia NGER | 50,000 t CO2e (corporate) | Mandatory reporting |
| Australia NGER | 25,000 t CO2e (facility) | Facility reporting |
| Australia Safeguard | 100,000 t CO2e Scope 1 | Baseline applies |
| Malaysia Bursa | ≥RM2 billion market cap | FY 2025 IFRS S2 |
| Singapore SGX | All listed issuers | Scope 1&2 mandatory FY 2025 |
| UK SECR | >£36M turnover | Energy & carbon reporting |
| Japan | >3,000 kL crude oil equivalent | Mandatory reporting |

**Source:** [Singapore Emissions Registry](https://www.eco-business.com/news/singapore-expands-emissions-registry-to-boost-corporate-carbon-reporting/)

---

## 6. Free Public APIs

### 6.1 EPA Envirofacts API (No Authentication Required)

**Base URL:** `https://data.epa.gov/efservice/`

**Endpoints:**
```
# GHG Facility Data
https://data.epa.gov/efservice/ghg.ghg_facility/state_code/equals/TX/1:100/JSON

# TRI (Toxic Release Inventory) Data
https://data.epa.gov/efservice/tri.tri_facility/state/equals/CA/sort/facility_name/1:100/CSV

# ICIS Permit Data
https://data.epa.gov/efservice/icis.icis_facility_interest/1:100/JSON
```

**Supported Formats:** JSON, XML, CSV, Excel
**Rate Limits:** None documented; pagination required for large datasets
**Documentation:** [EPA Envirofacts API](https://www.epa.gov/enviro/envirofacts-data-service-api)

### 6.2 EIA API (Free API Key Required)

**Base URL:** `https://api.eia.gov/v2/`

**Key Endpoints:**
```javascript
// CO2 Emissions Data
https://api.eia.gov/v2/co2-emissions/co2-emissions-aggregates/data?api_key=YOUR_KEY&data[]=value&frequency=annual

// State Electricity Profiles
https://api.eia.gov/v2/electricity/state-electricity-profiles/emissions-by-state-by-fuel/data?api_key=YOUR_KEY

// Natural Gas Data
https://api.eia.gov/v2/natural-gas/pri/sum/data?api_key=YOUR_KEY
```

**Rate Limits:** Maximum 5,000 rows per request
**Registration:** Free at [EIA API Registration](https://www.eia.gov/opendata/register.php)
**Documentation:** [EIA API Documentation](https://www.eia.gov/opendata/documentation.php)

### 6.3 UK Carbon Intensity API (Completely Free, No Auth)

**Base URL:** `https://api.carbonintensity.org.uk/`

**Endpoints:**
```
GET /intensity                          # Current GB carbon intensity
GET /intensity/date/{date}              # Specific date intensity
GET /intensity/date/{from}/{to}         # Date range
GET /intensity/factors                  # Generation emission factors
GET /regional                           # All regions current intensity
GET /regional/postcode/{postcode}       # By UK postcode
GET /regional/regionid/{regionid}       # By region ID
GET /generation                         # Current generation mix
```

**Features:**
- 30-minute granularity
- 96+ hour forecasts
- Historical data since 2017
- No authentication required

**Source:** [UK Carbon Intensity API](https://carbonintensity.org.uk./)

### 6.4 ElectricityMaps API

**Base URL:** `https://api-access.electricitymaps.com/`

**Free Tier:**
- 1 zone only
- Real-time data only
- Rate limited

**Commercial Tier:**
- 350+ electricity zones
- 50+ countries
- Historical data and forecasts

**Source:** [ElectricityMaps Documentation](https://developers.thegreenwebfoundation.org/grid-intensity-cli/explainer/providers/)

### 6.5 Our World in Data (No Authentication)

**Direct Data Access:**
```
https://nyc3.digitaloceanspaces.com/owid-public/data/co2/owid-co2-data.json
https://nyc3.digitaloceanspaces.com/owid-public/data/co2/owid-co2-data.csv
```

**Coverage:**
- Global emissions data 1750-present
- Country-level CO2, CH4, N2O emissions
- Per capita and intensity metrics
- Energy mix data

### 6.6 World Bank API (No Authentication)

**Base URL:** `https://api.worldbank.org/v2/`

**Key Indicators:**
```
# CO2 Emissions (kt)
https://api.worldbank.org/v2/country/all/indicator/EN.ATM.CO2E.KT?format=json

# CO2 Emissions per capita
https://api.worldbank.org/v2/country/all/indicator/EN.ATM.CO2E.PC?format=json

# Methane Emissions
https://api.worldbank.org/v2/country/all/indicator/EN.ATM.METH.KT.CE?format=json
```

### 6.7 Climate Watch API (No Authentication)

**Base URL:** `https://www.climatewatchdata.org/api/v1/`

**Endpoints:**
```
/data/historical_emissions
/data/ndc_content
/data/emissions/meta
```

**Coverage:** 194 countries, 1990-2020

### 6.8 API Summary Table

| API | Authentication | Rate Limits | Coverage | Free |
|-----|----------------|-------------|----------|------|
| EPA Envirofacts | None | Unlimited | US facilities | ✅ |
| EIA | API Key (free) | 5,000 rows/request | US energy data | ✅ |
| UK Carbon Intensity | None | Unlimited | UK grid | ✅ |
| ElectricityMaps | API Key | Limited free tier | Global (350+ zones) | Partial |
| Our World in Data | None | Unlimited | Global historical | ✅ |
| World Bank | None | Generous | 200+ countries | ✅ |
| Climate Watch | None | Unlimited | 194 countries | ✅ |
| IPCC EFDB | Free registration | N/A | ~17,000 factors | ✅ |

---

## 7. Oil & Gas Specific Calculations

### 7.1 Flaring Emissions (40 CFR § 98.253)

**CO2 from Flaring (Known Composition):**
```
CO2 (MT) = 0.98 × 0.001 × Σ[(V_p) × (MW_p/MVC) × (CC_p) × 44/12]
```

Where:
- V_p = Volume of gas component p (scf)
- MW_p = Molecular weight of component p
- MVC = 849.5 scf/kg-mole (at 68°F)
- CC_p = Carbon content of component p

**CO2 from Flaring (Unknown Composition):**
```
CO2 (MT) = V × HHV × 60 × 0.001
```

Where:
- V = Flare gas volume (MMscf)
- HHV = Higher heating value (MMBtu/MMscf), default = 1.0
- 60 = Default emission factor (kg CO2/MMBtu)

**CH4 from Flaring:**
```
CH4 (MT) = CO2 × (0.02/0.98) × (16/44) × 0.4
```

**Source:** [40 CFR § 98.253](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-98/subpart-Y/section-98.253)

### 7.2 Fugitive Emissions - Component Count Method

**Emission Factors (lb THC/day/component):**

| Component Type | Gas Service | Light Liquid | Heavy Liquid |
|----------------|-------------|--------------|--------------|
| Valves | 0.0268 | 0.0109 | 0.00023 |
| Pump seals | 0.0199 | 0.0862 | 0.0214 |
| Compressor seals | 0.636 | — | — |
| Pressure relief valves | 0.0447 | 0.0109 | — |
| Connectors | 0.00183 | 0.00183 | 0.00006 |
| Open-ended lines | 0.0023 | 0.0023 | 0.0014 |
| Sampling connections | 0.0150 | 0.0109 | — |

**Calculation:**
```
Emissions (lb/day) = Σ (Component count × Emission factor)
```

### 7.3 Storage Tank Emissions

**Unstabilized Crude Oil (Equation Y-23):**
```
CH4 (MT) = Q_un × ΔP × MF_CH4 × 995,000 × 16 / (MVC × 1,000)
```

Where:
- Q_un = Quantity of unstabilized crude (MMbbl)
- ΔP = Pressure differential (psi)
- MF_CH4 = Mole fraction CH4 in vent gas (default = 0.27)
- 995,000 = Correlation factor (scf/MMbbl/psi)

**Stabilized Crude Default:** 0.1 MT CH4/MMbbl

### 7.4 Equipment Emission Factors

| Equipment Type | Emission Factor | Unit |
|----------------|-----------------|------|
| Reciprocating compressor rod packing | 11,194 scfd CH4 | per compressor |
| Centrifugal compressor (wet seal) | 47.4 scfm | per seal |
| Centrifugal compressor (dry seal) | 5.3 scfm | per seal |
| Gathering compressors | 1,980 scf/day | per compressor |
| High-bleed pneumatic controller | 37.3 scfh | per device |
| Low-bleed pneumatic controller | 1.39 scfh | per device |
| Intermittent bleed controller | 13.5 scfh | per device |
| Pneumatic pump | 71.7 scfh | per pump |

### 7.5 Well-to-Wheel Emission Factors

| Product | Production & Refining (kg CO2e/bbl) | Combustion (kg CO2/bbl) | Total WTW (kg CO2e/bbl) |
|---------|-----------------------------------|------------------------|------------------------|
| Gasoline | 50-100 | 373 | 423-473 |
| Diesel | 45-95 | 428 | 473-523 |
| Jet Fuel | 40-90 | 402 | 442-492 |
| Heavy Fuel Oil | 30-70 | 473 | 503-543 |

---

## 8. Industry Benchmarks and Targets

### 8.1 Methane Intensity Targets

| Initiative/Company | Target | Timeline | Current Status |
|--------------------|--------|----------|----------------|
| OGCI (Oil & Gas Climate Initiative) | <0.20% | 2025 | **0.12% achieved (2024)** |
| OGMP 2.0 Gold Standard | Level 4/5 reporting | 3 years (operated) | Verification ongoing |
| Global Methane Pledge | 30% reduction from 2020 | 2030 | In progress |
| QatarEnergy | 0.2 wt% intensity | 2025 | On track |
| US EPA Super-Emitter | 100 kg/hr detection | Immediate | Regulatory requirement |

**Source:** [IEA Global Methane Pledge](https://www.iea.org/reports/global-methane-tracker-2022/the-global-methane-pledge)

### 8.2 Carbon Intensity Benchmarks

| Region/Operator | Carbon Intensity (kg CO2e/boe) | Notes |
|-----------------|-------------------------------|-------|
| **Global Benchmarks** |
| OGCI Members Average | 17.2 | 24% decrease since 2017 |
| Global Average (Upstream) | 18-22 | Varies by basin |
| **Regional** |
| Permian Basin (US) | 22 (average) | Range: <1 to >160 |
| North Sea (Combined) | 11 | Production-weighted |
| Gulf of Mexico | 7 | Similar to Norway |
| Middle East Average | 12-15 | Generally lower |
| **Best-in-Class** |
| Johan Sverdrup (Norway) | 0.67 | Shore-powered, world's lowest |
| Saudi Aramco Upstream | 10.2 | Among lowest globally |

### 8.3 Net-Zero Commitments by Major Companies

| Company | Scope 1&2 Target | Scope 3 Target | Timeline |
|---------|-----------------|----------------|----------|
| **European Majors** |
| Shell | Net-zero | 30% intensity reduction | 2050 |
| BP | Net-zero | 50% intensity reduction | 2050 |
| TotalEnergies | Net-zero | Net-zero (sold products) | 2050 |
| Equinor | Net-zero | N/A | 2050 |
| Eni | Net-zero | 80% intensity reduction | 2050 |
| **US Majors** |
| ExxonMobil | Net-zero | N/A | 2050 |
| Chevron | Net-zero | N/A | 2050 |
| ConocoPhillips | Net-zero | N/A | 2050 |
| **National Oil Companies** |
| Saudi Aramco | Net-zero | N/A | 2050 |
| ADNOC | Net-zero | N/A | 2045 |
| Petrobras | Net-zero | N/A | 2050 |
| PETRONAS | Net-zero | N/A | 2050 |

**Source:** [API GHG Compendium Update](https://www.api.org/news-policy-and-issues/news/2021/11/10/api-updates-ghg-compendium)

### 8.4 IEA Net Zero Scenario Requirements

By 2030:
- **75% reduction** in methane emissions from fossil fuel supply
- **50% reduction** in O&G operations emissions intensity
- No new unabated coal plants
- Universal access to clean cooking

By 2050:
- Net-zero emissions from energy sector
- >90% of heavy industry production low-emission
- 50% of heating demand met by heat pumps

---

## 9. Technical Standards

### 9.1 ISO 14064 GHG Accounting Standards

**ISO 14064-1:2018 (Organization Level):**
- Define organizational boundaries (operational, financial, equity share)
- Identify all emission sources
- Classify by scope (1, 2, 3)
- Quantify using recognized methods
- Report with transparency

**ISO 14064-2:2019 (Project Level):**
- Baseline scenario development
- Additionality demonstration
- Monitoring and verification

**ISO 14064-3:2019 (Verification):**
- Validation and verification requirements
- Assurance levels (limited, reasonable)

### 9.2 API Compendium (4th Edition, November 2021)

**Covered Segments:**
- Exploration & Production
- Natural Gas Processing
- Petroleum Refining
- Marketing & Distribution
- Pipeline Transportation

**Methodologies:**
- Combustion emissions (stationary, mobile)
- Waste gas disposal (flaring, incineration)
- Process/vented emissions
- Equipment leak (fugitive) emissions
- Indirect emissions (electricity, steam)

**New in 4th Edition:**
- Expanded LNG methodologies
- Carbon capture and storage (CCUS) accounting
- Updated emission factors

**Source:** [API GHG Compendium](https://www.api.org/news-policy-and-issues/news/2021/11/10/api-updates-ghg-compendium)

### 9.3 GHG Protocol Boundary Approaches

| Approach | Definition | Application |
|----------|------------|-------------|
| Operational Control | 100% of emissions from operations where company has full authority | Most common for O&G |
| Financial Control | 100% from operations where company directs financial/operating policies | Economic substance |
| Equity Share | Proportional to ownership percentage | Joint ventures |

### 9.4 IPIECA/API/IOGP Sustainability Reporting Guidance (5th Edition, June 2025)

**Structure:**
- 21 sustainability issues
- 43 indicator categories
- 52 core reporting elements
- 194 additional elements for enhanced disclosure

**New Additions:**
- Just transition indicators
- Biodiversity metrics
- Human rights due diligence
- Climate scenario analysis requirements

---

## 10. Sources and Citations

### Official Government Sources

1. **US EPA GHG Emission Factors Hub (2024)**
   - URL: https://www.epa.gov/system/files/documents/2024-02/ghg-emission-factors-hub-2024.pdf

2. **US EPA GHG Emission Factors Hub (2025)**
   - URL: https://www.epa.gov/system/files/documents/2025-01/ghg-emission-factors-hub-2025.pdf

3. **40 CFR § 98.253 - Calculating GHG Emissions**
   - URL: https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-98/subpart-Y/section-98.253
   - URL: https://www.law.cornell.edu/cfr/text/40/98.253

4. **EPA Envirofacts Data Service API**
   - URL: https://www.epa.gov/enviro/envirofacts-data-service-api

5. **EIA API Documentation**
   - URL: https://www.eia.gov/opendata/documentation.php

6. **Australia DCCEEW Safeguard Mechanism**
   - URL: https://www.dcceew.gov.au/climate-change/emissions-reporting/national-greenhouse-energy-reporting-scheme/safeguard-mechanism

### International Standards Bodies

7. **GHG Protocol - Category 11: Use of Sold Products**
   - URL: https://ghgprotocol.org/sites/default/files/2022-12/Chapter11.pdf

8. **GHG Protocol - Global Warming Potential Values (August 2024)**
   - URL: https://ghgprotocol.org/sites/default/files/2024-08/Global-Warming-Potential-Values%20(August%202024).pdf

9. **CDP Scope 3 Category 11 Guidance for Oil & Gas**
   - URL: https://cdn.cdp.net/cdp-production/cms/guidance_docs/pdfs/000/000/469/original/CDP-Scope-3-Category11-Guidance-Oil-Gas.pdf

10. **API GHG Compendium Update (2021)**
    - URL: https://www.api.org/news-policy-and-issues/news/2021/11/10/api-updates-ghg-compendium

### Regional Sources

11. **Bloomberg Malaysia Power Generation Analysis (2025)**
    - URL: https://assets.bbhub.io/professional/sites/24/Malaysia-A-Techno-Economic-Analysis-of-Power-Generation.pdf

12. **Malaysia SEDG GHG Calculator User Guide**
    - URL: https://www.capitalmarketsmalaysia.com/sedg-ghg-calculator/pdf/User-Guide_SEDG-GHG-Emissions-Calculator.pdf

13. **Bursa Malaysia Sustainability Reporting Requirements**
    - URL: https://www.lexology.com/library/detail.aspx?g=90eb0e3f-1139-4777-985b-40a346a7afc1

14. **Singapore Emissions Registry Expansion**
    - URL: https://www.eco-business.com/news/singapore-expands-emissions-registry-to-boost-corporate-carbon-reporting/

15. **UK Carbon Intensity API**
    - URL: https://carbonintensity.org.uk./

### Industry Sources

16. **Oil & Gas Middle East - GCC Net-Zero Electrification**
    - URL: https://www.oilandgasmiddleeast.com/business/turbocharging-net-zero-electrification-in-the-gccs-oil-gas-sector

17. **Qatar Energy Transition Analysis (Springer)**
    - URL: https://link.springer.com/chapter/10.1007/978-981-19-7398-7_7

18. **IEA Global Methane Pledge**
    - URL: https://www.iea.org/reports/global-methane-tracker-2022/the-global-methane-pledge

19. **PEMEX National Oil Company Profile**
    - URL: https://resourcegovernance.org/publications/national-oil-company-profile-pemex-mexico

### Technical Guidance

20. **Persefoni - Scope 2 Market vs Location-Based Methods**
    - URL: https://www.persefoni.com/blog/scope-2-dual-reporting-market-and-location-based-carbon-accounting

21. **Deloitte DART - Scope 2 Accounting Approaches**
    - URL: https://dart.deloitte.com/USDART/home/publications/deloitte/additional-deloitte-guidance/greenhouse-gas-protocol-reporting-considerations/chapter-5-ghg-protocol-scope-2/5-2-approaches-accounting-for-scope

22. **CDP Scoring System Explanation**
    - URL: https://climate.sustainability-directory.com/question/how-does-cdp-scoring-system-work/

23. **Green Web Foundation - Grid Intensity Providers**
    - URL: https://developers.thegreenwebfoundation.org/grid-intensity-cli/explainer/providers/

---

*Document compiled: February 2026*
*Last updated: Based on latest available regulatory and technical sources*
