import { useState } from 'react'
import { Plus, Trash2, Factory, Car, Flame, Wind, CloudFog } from 'lucide-react'
import Card, { CardTitle, CardDescription } from '../../common/Card'
import Input from '../../common/Input'
import Select from '../../common/Select'
import Button from '../../common/Button'
import Alert from '../../common/Alert'

const fuelTypes = [
  { value: 'naturalGas', label: 'Natural Gas' },
  { value: 'distillateFuelOil', label: 'Diesel / Distillate Fuel Oil' },
  { value: 'residualFuelOil', label: 'Residual Fuel Oil' },
  { value: 'crudeOil', label: 'Crude Oil' },
  { value: 'lpg', label: 'LPG / Propane' },
  { value: 'motorGasoline', label: 'Motor Gasoline' },
  { value: 'kerosene', label: 'Kerosene / Jet Fuel' },
]

const fuelUnits = [
  { value: 'MMBtu', label: 'MMBtu' },
  { value: 'mcf', label: 'MCF (thousand cubic feet)' },
  { value: 'gallon', label: 'Gallons' },
  { value: 'barrel', label: 'Barrels' },
  { value: 'therm', label: 'Therms' },
]

const vehicleTypes = [
  { value: 'PassengerCar', label: 'Passenger Cars' },
  { value: 'LightTruck', label: 'Light-Duty Trucks' },
  { value: 'HeavyTruck', label: 'Heavy-Duty Trucks' },
  { value: 'Equipment', label: 'Off-Road Equipment' },
]

const facilityTypes = [
  { value: 'production_onshore', label: 'Onshore Production' },
  { value: 'production_offshore', label: 'Offshore Production' },
  { value: 'gathering', label: 'Gathering & Boosting' },
  { value: 'processing', label: 'Gas Processing' },
  { value: 'transmission', label: 'Transmission' },
]

export default function Scope1Calculator({ mode, data, onUpdate }) {
  const [activeTab, setActiveTab] = useState('stationary')

  const tabs = [
    { id: 'stationary', label: 'Stationary', icon: Factory },
    { id: 'mobile', label: 'Mobile', icon: Car },
    { id: 'flaring', label: 'Flaring', icon: Flame },
    { id: 'venting', label: 'Venting', icon: Wind },
    { id: 'fugitive', label: 'Fugitive', icon: CloudFog },
  ]

  const addFuelEntry = () => {
    onUpdate({
      stationaryCombustion: [
        ...data.stationaryCombustion,
        { id: Date.now(), fuelType: '', quantity: '', unit: 'MMBtu' },
      ],
    })
  }

  const updateFuelEntry = (id, field, value) => {
    onUpdate({
      stationaryCombustion: data.stationaryCombustion.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      ),
    })
  }

  const removeFuelEntry = (id) => {
    onUpdate({
      stationaryCombustion: data.stationaryCombustion.filter(
        (entry) => entry.id !== id
      ),
    })
  }

  const addMobileEntry = () => {
    onUpdate({
      mobileCombustion: [
        ...data.mobileCombustion,
        { id: Date.now(), vehicleType: '', fuelType: 'motorGasoline', quantity: '', unit: 'gallon' },
      ],
    })
  }

  const updateMobileEntry = (id, field, value) => {
    onUpdate({
      mobileCombustion: data.mobileCombustion.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      ),
    })
  }

  const removeMobileEntry = (id) => {
    onUpdate({
      mobileCombustion: data.mobileCombustion.filter((entry) => entry.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-secondary-900">
          Scope 1: Direct Emissions
        </h2>
        <p className="text-secondary-600 mt-1">
          Emissions from sources owned or controlled by your organization
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-secondary-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-700'
                : 'text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stationary Combustion */}
      {activeTab === 'stationary' && (
        <div className="space-y-4">
          <Alert variant="info">
            Enter fuel consumption from boilers, heaters, furnaces, turbines, and
            other stationary equipment.
          </Alert>

          {data.stationaryCombustion.map((entry, index) => (
            <div
              key={entry.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-secondary-50 rounded-lg"
            >
              <Select
                label="Fuel Type"
                options={fuelTypes}
                value={entry.fuelType}
                onChange={(e) =>
                  updateFuelEntry(entry.id, 'fuelType', e.target.value)
                }
                placeholder="Select fuel"
              />
              <Input
                label="Quantity"
                type="number"
                placeholder="Enter amount"
                value={entry.quantity}
                onChange={(e) =>
                  updateFuelEntry(entry.id, 'quantity', e.target.value)
                }
              />
              <Select
                label="Unit"
                options={fuelUnits}
                value={entry.unit}
                onChange={(e) =>
                  updateFuelEntry(entry.id, 'unit', e.target.value)
                }
              />
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={() => removeFuelEntry(entry.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addFuelEntry} leftIcon={Plus}>
            Add Fuel Source
          </Button>
        </div>
      )}

      {/* Mobile Combustion */}
      {activeTab === 'mobile' && (
        <div className="space-y-4">
          <Alert variant="info">
            Enter fuel consumption from company-owned vehicles and mobile equipment.
          </Alert>

          {data.mobileCombustion.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-secondary-50 rounded-lg"
            >
              <Select
                label="Vehicle Type"
                options={vehicleTypes}
                value={entry.vehicleType}
                onChange={(e) =>
                  updateMobileEntry(entry.id, 'vehicleType', e.target.value)
                }
                placeholder="Select type"
              />
              <Select
                label="Fuel Type"
                options={[
                  { value: 'motorGasoline', label: 'Gasoline' },
                  { value: 'diesel', label: 'Diesel' },
                ]}
                value={entry.fuelType}
                onChange={(e) =>
                  updateMobileEntry(entry.id, 'fuelType', e.target.value)
                }
              />
              <Input
                label="Quantity"
                type="number"
                placeholder="Enter amount"
                value={entry.quantity}
                onChange={(e) =>
                  updateMobileEntry(entry.id, 'quantity', e.target.value)
                }
              />
              <Select
                label="Unit"
                options={[
                  { value: 'gallon', label: 'Gallons' },
                  { value: 'liter', label: 'Liters' },
                ]}
                value={entry.unit}
                onChange={(e) =>
                  updateMobileEntry(entry.id, 'unit', e.target.value)
                }
              />
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={() => removeMobileEntry(entry.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addMobileEntry} leftIcon={Plus}>
            Add Vehicle
          </Button>
        </div>
      )}

      {/* Flaring */}
      {activeTab === 'flaring' && (
        <div className="space-y-4">
          <Alert variant="info">
            Enter flare gas volumes. Default method uses 98% combustion efficiency
            per 40 CFR § 98.253.
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Flare Gas Volume"
              type="number"
              placeholder="Enter volume"
              value={data.flaring.volume}
              onChange={(e) =>
                onUpdate({ flaring: { ...data.flaring, volume: e.target.value } })
              }
            />
            <Select
              label="Unit"
              options={[
                { value: 'MMscf', label: 'MMscf (million standard cubic feet)' },
                { value: 'mcf', label: 'MCF (thousand cubic feet)' },
                { value: 'scf', label: 'SCF (standard cubic feet)' },
              ]}
              value={data.flaring.unit}
              onChange={(e) =>
                onUpdate({ flaring: { ...data.flaring, unit: e.target.value } })
              }
            />
          </div>

          {mode === 'expert' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary-50 rounded-lg">
              <Input
                label="Combustion Efficiency (%)"
                type="number"
                placeholder="98"
                helperText="Default: 98% per EPA methodology"
              />
              <Input
                label="Higher Heating Value (MMBtu/MMscf)"
                type="number"
                placeholder="1000"
                helperText="Default: 1000 MMBtu/MMscf"
              />
            </div>
          )}
        </div>
      )}

      {/* Venting */}
      {activeTab === 'venting' && (
        <div className="space-y-4">
          <Alert variant="info">
            Enter volumes of gas vented directly to the atmosphere.
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Venting Source"
              options={[
                { value: 'tanks', label: 'Storage Tanks' },
                { value: 'pneumatic', label: 'Pneumatic Devices' },
                { value: 'blowdowns', label: 'Equipment Blowdowns' },
                { value: 'compressors', label: 'Compressor Starts' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select source"
            />
            <Input label="Volume" type="number" placeholder="Enter volume" />
            <Select
              label="Unit"
              options={[
                { value: 'mcf', label: 'MCF' },
                { value: 'scf', label: 'SCF' },
              ]}
            />
          </div>
        </div>
      )}

      {/* Fugitive Emissions */}
      {activeTab === 'fugitive' && (
        <div className="space-y-4">
          <Alert variant="info">
            Fugitive emissions from equipment leaks. Simple mode uses industry
            averages; Expert mode allows component counting.
          </Alert>

          {mode === 'simple' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Facility Type"
                options={facilityTypes}
                value={data.fugitives.facilityType}
                onChange={(e) =>
                  onUpdate({
                    fugitives: { ...data.fugitives, facilityType: e.target.value },
                  })
                }
                helperText="Industry average factors will be applied"
              />
              <Input
                label="Annual Production (BOE)"
                type="number"
                placeholder="Enter production"
                helperText="Barrels of oil equivalent"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-secondary-600">
                Enter component counts for the EPA Protocol method:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input label="Valves (Gas Service)" type="number" placeholder="0" />
                <Input label="Connectors" type="number" placeholder="0" />
                <Input label="Pump Seals" type="number" placeholder="0" />
                <Input label="Compressor Seals" type="number" placeholder="0" />
                <Input label="PRVs" type="number" placeholder="0" />
                <Input label="Open-Ended Lines" type="number" placeholder="0" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
