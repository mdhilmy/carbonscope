import { Download, FileText, Share2, Check, Factory, Zap, Truck } from 'lucide-react'
import Card, { CardTitle } from '../../common/Card'
import Button from '../../common/Button'
import Alert from '../../common/Alert'

export default function ResultsSummary({ data, results }) {
  // Placeholder calculations - will be replaced with actual calculation service
  const placeholderResults = {
    scope1: {
      total: 15000,
      breakdown: {
        stationaryCombustion: 8000,
        mobileCombustion: 2000,
        flaring: 3500,
        venting: 800,
        fugitive: 700,
      },
    },
    scope2: {
      locationBased: 5200,
      marketBased: 3100,
    },
    scope3: {
      total: 850000,
      category11: 820000,
      other: 30000,
    },
    total: 870200,
    intensity: {
      perBOE: 45.2,
      methane: 0.15,
    },
  }

  const displayResults = results || placeholderResults
  const totalEmissions = displayResults.scope1.total + displayResults.scope2.locationBased + (data.scope3.includeScope3 ? displayResults.scope3.total : 0)

  const scopeData = [
    {
      name: 'Scope 1',
      value: displayResults.scope1.total,
      percentage: ((displayResults.scope1.total / totalEmissions) * 100).toFixed(1),
      color: 'bg-scope1',
      icon: Factory,
      description: 'Direct emissions',
    },
    {
      name: 'Scope 2',
      value: displayResults.scope2.locationBased,
      percentage: ((displayResults.scope2.locationBased / totalEmissions) * 100).toFixed(1),
      color: 'bg-scope2',
      icon: Zap,
      description: 'Energy emissions',
    },
  ]

  if (data.scope3.includeScope3) {
    scopeData.push({
      name: 'Scope 3',
      value: displayResults.scope3.total,
      percentage: ((displayResults.scope3.total / totalEmissions) * 100).toFixed(1),
      color: 'bg-scope3',
      icon: Truck,
      description: 'Value chain',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-secondary-900">
            Calculation Results
          </h2>
          <p className="text-secondary-600 mt-1">
            Summary of your GHG emissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={Share2}>
            Share
          </Button>
          <Button variant="outline" leftIcon={Download}>
            Export
          </Button>
        </div>
      </div>

      <Alert variant="success" title="Calculation Complete">
        Your emissions have been calculated using GHG Protocol methodologies with
        IPCC AR5 Global Warming Potentials.
      </Alert>

      {/* Total Emissions */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <div className="text-center">
          <p className="text-primary-700 font-medium">Total GHG Emissions</p>
          <p className="text-5xl font-bold text-primary-900 mt-2">
            {totalEmissions.toLocaleString()}
          </p>
          <p className="text-primary-600 mt-1">tonnes CO2e</p>
        </div>
      </Card>

      {/* Scope Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        {scopeData.map((scope) => (
          <Card key={scope.name}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${scope.color}`}
                  />
                  <span className="font-medium text-secondary-900">
                    {scope.name}
                  </span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 mt-2">
                  {scope.value.toLocaleString()}
                </p>
                <p className="text-sm text-secondary-500">tonnes CO2e</p>
              </div>
              <div className="text-right">
                <scope.icon
                  className={`w-8 h-8 ${scope.color.replace('bg-', 'text-')}`}
                />
                <p className="text-lg font-semibold text-secondary-700 mt-2">
                  {scope.percentage}%
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Scope 1 Breakdown */}
        <Card>
          <CardTitle>Scope 1 Breakdown</CardTitle>
          <div className="mt-4 space-y-3">
            {Object.entries(displayResults.scope1.breakdown).map(([source, value]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-secondary-600 capitalize">
                  {source.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-medium text-secondary-900">
                  {value.toLocaleString()} tCO2e
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Scope 2 Comparison */}
        <Card>
          <CardTitle>Scope 2 Methods</CardTitle>
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-500">Location-Based</p>
              <p className="text-xl font-bold text-secondary-900">
                {displayResults.scope2.locationBased.toLocaleString()} tCO2e
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Market-Based</p>
              <p className="text-xl font-bold text-green-700">
                {displayResults.scope2.marketBased.toLocaleString()} tCO2e
              </p>
              <p className="text-xs text-green-600 mt-1">
                {(
                  ((displayResults.scope2.locationBased -
                    displayResults.scope2.marketBased) /
                    displayResults.scope2.locationBased) *
                  100
                ).toFixed(0)}
                % reduction from RECs/PPAs
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Intensity Metrics */}
      <Card>
        <CardTitle>Intensity Metrics</CardTitle>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-4 bg-secondary-50 rounded-lg text-center">
            <p className="text-sm text-secondary-500">Carbon Intensity</p>
            <p className="text-2xl font-bold text-secondary-900">
              {displayResults.intensity.perBOE}
            </p>
            <p className="text-xs text-secondary-400">kg CO2e / BOE</p>
          </div>
          <div className="p-4 bg-secondary-50 rounded-lg text-center">
            <p className="text-sm text-secondary-500">Methane Intensity</p>
            <p className="text-2xl font-bold text-secondary-900">
              {displayResults.intensity.methane}%
            </p>
            <p className="text-xs text-secondary-400">CH4 / Total Gas</p>
          </div>
          <div className="p-4 bg-secondary-50 rounded-lg text-center">
            <p className="text-sm text-secondary-500">Scope 1+2 Share</p>
            <p className="text-2xl font-bold text-secondary-900">
              {(
                ((displayResults.scope1.total + displayResults.scope2.locationBased) /
                  totalEmissions) *
                100
              ).toFixed(1)}
              %
            </p>
            <p className="text-xs text-secondary-400">of total emissions</p>
          </div>
          <div className="p-4 bg-secondary-50 rounded-lg text-center">
            <p className="text-sm text-secondary-500">GWP Version</p>
            <p className="text-2xl font-bold text-secondary-900">AR5</p>
            <p className="text-xs text-secondary-400">IPCC 2014</p>
          </div>
        </div>
      </Card>

      {/* Export Options */}
      <Card>
        <CardTitle>Export Report</CardTitle>
        <p className="text-secondary-600 mt-1">
          Download your results in various formats
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Button variant="outline" className="justify-start" leftIcon={FileText}>
            PDF Report
          </Button>
          <Button variant="outline" className="justify-start" leftIcon={FileText}>
            Markdown
          </Button>
          <Button variant="outline" className="justify-start" leftIcon={FileText}>
            CSV Data
          </Button>
          <Button variant="outline" className="justify-start" leftIcon={FileText}>
            JSON
          </Button>
        </div>
      </Card>
    </div>
  )
}
