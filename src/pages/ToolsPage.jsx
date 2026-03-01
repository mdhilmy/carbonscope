import { useState } from 'react'
import { ArrowLeftRight, Search } from 'lucide-react'
import Card, { CardTitle, CardDescription } from '../components/common/Card'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Button from '../components/common/Button'
import gwpData from '../data/gwpValues.json'
import epaFactors from '../data/emissionFactors/epaFactors.json'

// ──────────────────────── Unit Converter data ────────────────────────
const unitCategories = [
  {
    id: 'energy',
    name: 'Energy',
    units: [
      { value: 'MMBtu', label: 'MMBtu' },
      { value: 'MJ', label: 'MJ' },
      { value: 'kWh', label: 'kWh' },
      { value: 'therm', label: 'Therm' },
      { value: 'GJ', label: 'GJ' },
    ],
    conversions: {
      MMBtu: { MJ: 1055.06, kWh: 293.07, therm: 10, GJ: 1.055 },
      MJ: { MMBtu: 0.000948, kWh: 0.278, therm: 0.00948, GJ: 0.001 },
      kWh: { MMBtu: 0.00341, MJ: 3.6, therm: 0.0341, GJ: 0.0036 },
      therm: { MMBtu: 0.1, MJ: 105.5, kWh: 29.3, GJ: 0.1055 },
      GJ: { MMBtu: 0.948, MJ: 1000, kWh: 277.8, therm: 9.48 },
    },
  },
  {
    id: 'volume',
    name: 'Volume',
    units: [
      { value: 'gallon', label: 'Gallon (US)' },
      { value: 'liter', label: 'Liter' },
      { value: 'barrel', label: 'Barrel' },
      { value: 'mcf', label: 'MCF' },
      { value: 'scf', label: 'SCF' },
    ],
    conversions: {
      gallon: { liter: 3.785, barrel: 0.0238, mcf: 0.00378, scf: 0.134 },
      liter: { gallon: 0.264, barrel: 0.00629, mcf: 0.001, scf: 0.0353 },
      barrel: { gallon: 42, liter: 158.99, mcf: 0.159, scf: 5.62 },
      mcf: { gallon: 264.2, liter: 1000, barrel: 6.29, scf: 1000 },
      scf: { gallon: 7.48, liter: 28.32, barrel: 0.178, mcf: 0.001 },
    },
  },
  {
    id: 'mass',
    name: 'Mass',
    units: [
      { value: 'kg', label: 'Kilogram' },
      { value: 'lb', label: 'Pound' },
      { value: 'tonne', label: 'Metric Tonne' },
      { value: 'shortTon', label: 'Short Ton (US)' },
    ],
    conversions: {
      kg: { lb: 2.205, tonne: 0.001, shortTon: 0.0011 },
      lb: { kg: 0.454, tonne: 0.000454, shortTon: 0.0005 },
      tonne: { kg: 1000, lb: 2204.6, shortTon: 1.102 },
      shortTon: { kg: 907.2, lb: 2000, tonne: 0.907 },
    },
  },
]

// ──────────────────────── Emission Factor Lookup data ────────────────
const efCategories = [
  { value: 'stationaryCombustion', label: 'Stationary Combustion' },
  { value: 'mobileCombustion', label: 'Mobile Combustion' },
  { value: 'flaring', label: 'Flaring' },
]

const fuelLabels = {
  // Stationary
  naturalGas: 'Natural Gas',
  distillateFuelOil: 'Distillate Fuel Oil (#2)',
  residualFuelOil: 'Residual Fuel Oil (#6)',
  crudeOil: 'Crude Oil',
  lpg: 'LPG',
  motorGasoline: 'Motor Gasoline',
  kerosene: 'Kerosene',
  petroleumCoke: 'Petroleum Coke',
  propane: 'Propane',
  butane: 'Butane',
  // Mobile
  gasolinePassengerCar: 'Gasoline – Passenger Car',
  gasolineLightTruck: 'Gasoline – Light Truck',
  dieselHeavyTruck: 'Diesel – Heavy Truck',
  dieselEquipment: 'Diesel – Off-road Equipment',
  jetFuel: 'Jet Fuel',
  marineDistillate: 'Marine Distillate',
  marineResidual: 'Marine Residual',
}

export default function ToolsPage() {
  // ── Unit Converter state ──
  const [category, setCategory] = useState('energy')
  const [fromUnit, setFromUnit] = useState('')
  const [toUnit, setToUnit] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [convertResult, setConvertResult] = useState(null)

  // ── GWP Calculator state ──
  const [gwpVersion, setGwpVersion] = useState('AR5')
  const [gwpGas, setGwpGas] = useState('CH4_fossil')
  const [gwpMass, setGwpMass] = useState('')
  const [gwpResult, setGwpResult] = useState(null)

  // ── Emission Factor Lookup state ──
  const [efCategory, setEfCategory] = useState('')
  const [efFuel, setEfFuel] = useState('')

  const currentCategory = unitCategories.find((c) => c.id === category)

  // ── Unit Converter logic ──
  const handleConvert = () => {
    if (!inputValue || !fromUnit || !toUnit) return
    const value = parseFloat(inputValue)
    if (isNaN(value)) return
    if (fromUnit === toUnit) {
      setConvertResult(value)
      return
    }
    const conversion = currentCategory?.conversions[fromUnit]?.[toUnit]
    if (conversion) setConvertResult(value * conversion)
  }

  // ── GWP Calculator logic ──
  const gwpGasOptions = Object.keys(gwpData[gwpVersion] || {})
    .filter((k) => !['source', 'timeHorizon', 'default', 'deprecated', 'description'].includes(k))
    .map((k) => ({ value: k, label: k.replace(/_/g, ' ') }))

  const handleGwpCalc = () => {
    const mass = parseFloat(gwpMass)
    if (isNaN(mass) || mass <= 0) return
    const gwp = gwpData[gwpVersion]?.[gwpGas]
    if (gwp === undefined) return
    setGwpResult({ gas: gwpGas, mass, gwp, co2e: mass * gwp })
  }

  // ── Emission Factor Lookup logic ──
  const fuelOptions = efCategory && efCategory !== 'flaring'
    ? Object.keys(epaFactors[efCategory] || {}).map((k) => ({
        value: k,
        label: fuelLabels[k] || k,
      }))
    : []

  const efResult = (() => {
    if (efCategory === 'flaring') return epaFactors.flaring
    if (efCategory && efFuel && epaFactors[efCategory]?.[efFuel]) {
      return epaFactors[efCategory][efFuel]
    }
    return null
  })()

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-2">Tools</h1>
      <p className="text-secondary-600 mb-6">
        Utility tools for unit conversion, GWP calculation, and emission factor lookup
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Unit Converter ── */}
        <Card>
          <CardTitle>Unit Converter</CardTitle>
          <CardDescription>Convert between common energy, volume, and mass units</CardDescription>

          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              {unitCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id)
                    setFromUnit('')
                    setToUnit('')
                    setConvertResult(null)
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    category === cat.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="From"
                options={currentCategory?.units || []}
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                placeholder="Select unit"
              />
              <Select
                label="To"
                options={currentCategory?.units || []}
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                placeholder="Select unit"
              />
            </div>

            <Input
              label="Value"
              type="number"
              placeholder="Enter value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <Button onClick={handleConvert} className="w-full" leftIcon={ArrowLeftRight}>
              Convert
            </Button>

            {convertResult !== null && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                <p className="text-sm text-primary-600">Result</p>
                <p className="text-2xl font-bold text-primary-700">
                  {convertResult.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toUnit}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* ── GWP Calculator ── */}
        <Card>
          <CardTitle>GWP Calculator</CardTitle>
          <CardDescription>Convert greenhouse gas mass to CO2 equivalent</CardDescription>

          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              {['AR5', 'AR6', 'AR4'].map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setGwpVersion(v)
                    setGwpResult(null)
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    gwpVersion === v
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <Select
              label="Greenhouse Gas"
              options={gwpGasOptions}
              value={gwpGas}
              onChange={(e) => { setGwpGas(e.target.value); setGwpResult(null) }}
              placeholder="Select gas"
            />

            <Input
              label="Mass (kg)"
              type="number"
              placeholder="Enter mass in kg"
              value={gwpMass}
              onChange={(e) => setGwpMass(e.target.value)}
            />

            <Button onClick={handleGwpCalc} className="w-full">
              Calculate CO2e
            </Button>

            {gwpResult && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                <p className="text-sm text-primary-600">
                  {gwpResult.mass.toLocaleString()} kg {gwpResult.gas.replace(/_/g, ' ')} &times; GWP {gwpResult.gwp}
                </p>
                <p className="text-2xl font-bold text-primary-700">
                  {gwpResult.co2e.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg CO2e
                </p>
                <p className="text-xs text-primary-500 mt-1">
                  = {(gwpResult.co2e / 1000).toLocaleString(undefined, { maximumFractionDigits: 4 })} tonnes CO2e
                </p>
              </div>
            )}

            <div className="bg-secondary-50 rounded-lg p-3">
              <p className="text-xs text-secondary-500">
                Source: {gwpData[gwpVersion]?.source || gwpVersion}. 100-year time horizon.
              </p>
            </div>
          </div>
        </Card>

        {/* ── Emission Factor Lookup ── */}
        <Card className="lg:col-span-2">
          <CardTitle>Emission Factor Lookup</CardTitle>
          <CardDescription>Search EPA emission factors by category and fuel type</CardDescription>

          <div className="mt-4">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Select
                label="Category"
                options={efCategories}
                value={efCategory}
                onChange={(e) => { setEfCategory(e.target.value); setEfFuel('') }}
                placeholder="Select category"
              />
              {efCategory && efCategory !== 'flaring' && (
                <Select
                  label="Fuel Type"
                  options={fuelOptions}
                  value={efFuel}
                  onChange={(e) => setEfFuel(e.target.value)}
                  placeholder="Select fuel"
                />
              )}
            </div>

            {efResult ? (
              <div className="bg-secondary-50 rounded-lg p-4">
                {efCategory === 'flaring' ? (
                  <div className="space-y-2">
                    <h4 className="font-medium text-secondary-900">Flaring Emission Factors</h4>
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                      <Row label="Default CO2 Factor" value={`${efResult.defaultCO2Factor} ${efResult.unit}`} />
                      <Row label="Combustion Efficiency" value={`${(efResult.defaultCombustionEfficiency * 100).toFixed(0)}%`} />
                      <Row label="Default HHV" value={`${efResult.defaultHHV} ${efResult.defaultHHVUnit}`} />
                      <Row label="Methodology" value={efResult.methodology} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="font-medium text-secondary-900">
                      {fuelLabels[efFuel] || efFuel}
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                      <Row label="CO2" value={`${efResult.co2} ${efResult.unit}`} />
                      <Row label="CH4" value={`${efResult.ch4} ${efResult.unit}`} />
                      <Row label="N2O" value={`${efResult.n2o} ${efResult.unit}`} />
                      {efResult.hhv && (
                        <Row label="HHV" value={`${efResult.hhv} ${efResult.hhvUnit}`} />
                      )}
                    </div>
                    <p className="text-xs text-secondary-400 mt-2">
                      Source: {epaFactors.metadata.source}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-secondary-50 rounded-lg p-4">
                <p className="text-center text-secondary-500 flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Select a category{efCategory !== 'flaring' ? ' and fuel type' : ''} above to view emission factors
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-secondary-600">{label}</span>
      <span className="font-medium text-secondary-900">{value}</span>
    </div>
  )
}
