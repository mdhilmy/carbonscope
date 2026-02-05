import { useState, useEffect } from 'react'
import { Zap, MapPin, ShoppingCart, Info } from 'lucide-react'
import Card, { CardTitle, CardDescription } from '../../common/Card'
import Input from '../../common/Input'
import Select from '../../common/Select'
import Button from '../../common/Button'
import Alert from '../../common/Alert'
import { useApp } from '../../../context/AppContext'

const regions = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'AU', label: 'Australia' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'QA', label: 'Qatar' },
  { value: 'BR', label: 'Brazil' },
]

const usSubregions = [
  { value: '', label: 'National Average' },
  { value: 'CAMX', label: 'California (CAMX)' },
  { value: 'ERCT', label: 'Texas - ERCOT (ERCT)' },
  { value: 'FRCC', label: 'Florida (FRCC)' },
  { value: 'MROW', label: 'Midwest (MROW)' },
  { value: 'NEWE', label: 'New England (NEWE)' },
  { value: 'NWPP', label: 'Northwest (NWPP)' },
  { value: 'RFCE', label: 'Mid-Atlantic (RFCE)' },
  { value: 'SRMW', label: 'Upper Midwest (SRMW)' },
]

const auStates = [
  { value: '', label: 'National Average' },
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
]

const myStates = [
  { value: 'peninsular', label: 'Peninsular Malaysia' },
  { value: 'sabah', label: 'Sabah' },
  { value: 'sarawak', label: 'Sarawak' },
]

// Grid factors from our data (simplified for display)
const gridFactors = {
  US: { factor: 0.373, unit: 'kgCO2/kWh' },
  GB: { factor: 0.212, unit: 'kgCO2/kWh' },
  DE: { factor: 0.380, unit: 'kgCO2/kWh' },
  FR: { factor: 0.052, unit: 'kgCO2/kWh' },
  MY: { factor: 0.774, unit: 'kgCO2/kWh' },
  SG: { factor: 0.402, unit: 'kgCO2/kWh' },
  AU: { factor: 0.680, unit: 'kgCO2/kWh' },
  AE: { factor: 0.450, unit: 'kgCO2/kWh' },
  SA: { factor: 0.520, unit: 'kgCO2/kWh' },
  QA: { factor: 0.480, unit: 'kgCO2/kWh' },
  BR: { factor: 0.085, unit: 'kgCO2/kWh' },
}

export default function Scope2Calculator({ mode, data, onUpdate }) {
  const [activeTab, setActiveTab] = useState('location')
  const { settings } = useApp()

  const selectedRegion = data.electricity.region || settings.defaultRegion
  const currentFactor = gridFactors[selectedRegion]

  const getSubregionOptions = () => {
    switch (selectedRegion) {
      case 'US':
        return usSubregions
      case 'AU':
        return auStates
      case 'MY':
        return myStates
      default:
        return []
    }
  }

  const subregionOptions = getSubregionOptions()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-secondary-900">
          Scope 2: Energy Emissions
        </h2>
        <p className="text-secondary-600 mt-1">
          Indirect emissions from purchased electricity, steam, heat, and cooling
        </p>
      </div>

      {/* Method Tabs */}
      <div className="flex gap-2 border-b border-secondary-200 pb-2">
        <button
          onClick={() => setActiveTab('location')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'location'
              ? 'bg-primary-100 text-primary-700'
              : 'text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Location-Based
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'market'
              ? 'bg-primary-100 text-primary-700'
              : 'text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Market-Based
        </button>
      </div>

      {/* Electricity Input - Common to both methods */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Electricity Consumption"
            type="number"
            placeholder="Enter kWh"
            value={data.electricity.kWh}
            onChange={(e) =>
              onUpdate({
                electricity: { ...data.electricity, kWh: e.target.value },
              })
            }
            helperText="Annual electricity consumption in kilowatt-hours"
          />
          <Select
            label="Unit"
            options={[
              { value: 'kWh', label: 'kWh' },
              { value: 'MWh', label: 'MWh' },
              { value: 'GWh', label: 'GWh' },
            ]}
            value="kWh"
          />
        </div>
      </div>

      {/* Location-Based Method */}
      {activeTab === 'location' && (
        <div className="space-y-4">
          <Alert variant="info">
            Location-based method uses average grid emission factors for your
            region. This reflects the average emissions intensity of the local
            grid.
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Region"
              options={regions}
              value={selectedRegion}
              onChange={(e) =>
                onUpdate({
                  electricity: {
                    ...data.electricity,
                    region: e.target.value,
                    subregion: '',
                  },
                })
              }
            />
            {subregionOptions.length > 0 && (
              <Select
                label="Subregion (Optional)"
                options={subregionOptions}
                value={data.electricity.subregion}
                onChange={(e) =>
                  onUpdate({
                    electricity: {
                      ...data.electricity,
                      subregion: e.target.value,
                    },
                  })
                }
                helperText="More specific regional factors available"
              />
            )}
          </div>

          {/* Current Grid Factor Display */}
          {currentFactor && (
            <div className="bg-secondary-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-secondary-900">
                  Grid Emission Factor
                </span>
              </div>
              <div className="text-2xl font-bold text-secondary-900">
                {currentFactor.factor} {currentFactor.unit}
              </div>
              <p className="text-sm text-secondary-500 mt-1">
                Source: EPA eGRID / IEA / Regional data
              </p>
            </div>
          )}
        </div>
      )}

      {/* Market-Based Method */}
      {activeTab === 'market' && (
        <div className="space-y-4">
          <Alert variant="info">
            Market-based method accounts for renewable energy purchases (RECs,
            PPAs) and supplier-specific emission factors.
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Renewable Energy Certificates (RECs)"
              type="number"
              placeholder="Enter MWh"
              helperText="MWh of renewable electricity purchased"
            />
            <Select
              label="REC Type"
              options={[
                { value: 'green_e', label: 'Green-e Certified' },
                { value: 'i_rec', label: 'I-REC' },
                { value: 'go', label: 'Guarantee of Origin (EU)' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select type"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Supplier-Specific Emission Factor"
              type="number"
              placeholder="kgCO2/kWh"
              helperText="If known from your utility provider"
            />
            <Input
              label="Power Purchase Agreement (PPA)"
              type="number"
              placeholder="Enter MWh"
              helperText="MWh from direct renewable PPAs"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">GHG Protocol Dual Reporting</p>
                <p className="mt-1">
                  Organizations are required to report both location-based and
                  market-based Scope 2 emissions to provide a complete picture.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchased Steam/Heat */}
      <div className="border-t border-secondary-200 pt-6">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">
          Other Purchased Energy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Purchased Steam"
            type="number"
            placeholder="Enter MMBtu"
            helperText="If applicable"
          />
          <Input
            label="Purchased Heating"
            type="number"
            placeholder="Enter MMBtu"
            helperText="If applicable"
          />
          <Input
            label="Purchased Cooling"
            type="number"
            placeholder="Enter ton-hours"
            helperText="If applicable"
          />
        </div>
      </div>
    </div>
  )
}
