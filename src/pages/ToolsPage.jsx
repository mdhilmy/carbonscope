import { useState } from 'react'
import { ArrowLeftRight, Search, Calculator } from 'lucide-react'
import Card, { CardTitle, CardDescription } from '../components/common/Card'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Button from '../components/common/Button'

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

export default function ToolsPage() {
  const [category, setCategory] = useState('energy')
  const [fromUnit, setFromUnit] = useState('')
  const [toUnit, setToUnit] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState(null)

  const currentCategory = unitCategories.find((c) => c.id === category)

  const handleConvert = () => {
    if (!inputValue || !fromUnit || !toUnit) return

    const value = parseFloat(inputValue)
    if (isNaN(value)) return

    if (fromUnit === toUnit) {
      setResult(value)
      return
    }

    const conversion = currentCategory?.conversions[fromUnit]?.[toUnit]
    if (conversion) {
      setResult(value * conversion)
    }
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-2">Tools</h1>
      <p className="text-secondary-600 mb-6">
        Utility tools for unit conversion and emission factor lookup
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Unit Converter */}
        <Card>
          <CardTitle>Unit Converter</CardTitle>
          <CardDescription>Convert between common units</CardDescription>

          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              {unitCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id)
                    setFromUnit('')
                    setToUnit('')
                    setResult(null)
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

            <Button onClick={handleConvert} className="w-full">
              Convert
            </Button>

            {result !== null && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                <p className="text-sm text-primary-600">Result</p>
                <p className="text-2xl font-bold text-primary-700">
                  {result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toUnit}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* GWP Calculator */}
        <Card>
          <CardTitle>GWP Calculator</CardTitle>
          <CardDescription>
            Convert greenhouse gases to CO2 equivalent
          </CardDescription>

          <div className="mt-4 space-y-4">
            <div className="bg-secondary-50 rounded-lg p-4">
              <h4 className="font-medium text-secondary-900 mb-2">
                Global Warming Potentials (100-year)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">CO2</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">CH4 (fossil)</span>
                  <span className="font-medium">30 (AR5) / 29.8 (AR6)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">N2O</span>
                  <span className="font-medium">265 (AR5) / 273 (AR6)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">SF6</span>
                  <span className="font-medium">23,500 (AR5)</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-secondary-500">
              GWP values are from IPCC Assessment Reports. AR5 is commonly used for
              current reporting. AR6 values are being adopted by some frameworks.
            </p>
          </div>
        </Card>

        {/* Emission Factor Lookup */}
        <Card className="lg:col-span-2">
          <CardTitle>Emission Factor Lookup</CardTitle>
          <CardDescription>
            Search for emission factors by fuel type and source
          </CardDescription>

          <div className="mt-4">
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <Select
                label="Source"
                options={[
                  { value: 'epa', label: 'US EPA' },
                  { value: 'defra', label: 'UK DEFRA' },
                  { value: 'ipcc', label: 'IPCC' },
                ]}
                placeholder="Select source"
              />
              <Select
                label="Category"
                options={[
                  { value: 'stationary', label: 'Stationary Combustion' },
                  { value: 'mobile', label: 'Mobile Combustion' },
                  { value: 'flaring', label: 'Flaring' },
                ]}
                placeholder="Select category"
              />
              <Select
                label="Fuel Type"
                options={[
                  { value: 'naturalGas', label: 'Natural Gas' },
                  { value: 'diesel', label: 'Diesel' },
                  { value: 'gasoline', label: 'Gasoline' },
                ]}
                placeholder="Select fuel"
              />
            </div>

            <div className="bg-secondary-50 rounded-lg p-4">
              <p className="text-center text-secondary-500">
                Select options above to view emission factors
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
