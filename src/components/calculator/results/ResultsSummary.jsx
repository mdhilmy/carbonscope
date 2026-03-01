import { useState } from 'react'
import {
  Download,
  FileText,
  Share2,
  Factory,
  Zap,
  Truck,
  Save,
  Plus,
  ClipboardCheck,
  ChevronDown,
} from 'lucide-react'
import Card, { CardTitle } from '../../common/Card'
import Button from '../../common/Button'
import Alert from '../../common/Alert'
import { useNotification } from '../../../context/NotificationContext'
import { exportData } from '../../../services/export'
import { generateMarkdownReport } from '../../../services/export/markdownExport'
import {
  getAllFacilities,
  createFacility,
  saveCalculationToFacility,
} from '../../../services/facilityService'
import { FACILITY_TYPES, FACILITY_TYPE_LABELS } from '../../../utils/constants'

export default function ResultsSummary({ data, results, gwpVersion }) {
  const { notify } = useNotification()
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showSavePanel, setShowSavePanel] = useState(false)
  const [saveMode, setSaveMode] = useState(null) // 'existing' | 'new'
  const [selectedFacilityId, setSelectedFacilityId] = useState('')
  const [newFacility, setNewFacility] = useState({ name: '', type: 'other', region: 'US' })

  if (!results) {
    return (
      <div className="py-12 text-center">
        <p className="text-secondary-500">
          No results yet. Complete the previous steps and click "Calculate Emissions".
        </p>
      </div>
    )
  }

  const { totals, scope1, scope2, scope3 } = results
  const totalEmissions = totals.total_tonnes

  // Build scope display data — only include scopes with actual values
  const scopeData = []
  if (totals.scope1_tonnes > 0) {
    scopeData.push({
      name: 'Scope 1',
      value: totals.scope1_tonnes,
      color: 'bg-scope1',
      textColor: 'text-scope1',
      icon: Factory,
      description: 'Direct emissions',
    })
  }
  if (totals.scope2_tonnes > 0) {
    scopeData.push({
      name: 'Scope 2',
      value: totals.scope2_tonnes,
      color: 'bg-scope2',
      textColor: 'text-scope2',
      icon: Zap,
      description: 'Energy emissions',
    })
  }
  if (totals.scope3_tonnes > 0) {
    scopeData.push({
      name: 'Scope 3',
      value: totals.scope3_tonnes,
      color: 'bg-scope3',
      textColor: 'text-scope3',
      icon: Truck,
      description: 'Value chain',
    })
  }

  // Format the results into the shape the export services expect
  function buildExportData() {
    return {
      totals: results.totals,
      scope1: results.scope1,
      scope2: results.scope2,
      scope3: results.scope3
        ? { categories: { 11: { co2e_tonnes: results.scope3.total_co2e_tonnes, methodology: 'GHG Protocol Scope 3' } } }
        : undefined,
      metadata: { gwpVersion: results.gwpVersion, calculatedAt: results.calculatedAt },
    }
  }

  const handleExport = (format) => {
    try {
      exportData(buildExportData(), format)
      notify.success(`Exported as ${format.toUpperCase()}`)
    } catch (err) {
      console.error('Export error:', err)
      notify.error('Export failed: ' + err.message)
    }
    setShowExportMenu(false)
  }

  const handleShare = async () => {
    try {
      const md = generateMarkdownReport(buildExportData())
      await navigator.clipboard.writeText(md)
      notify.success('Results copied to clipboard as Markdown')
    } catch {
      notify.error('Failed to copy to clipboard')
    }
  }

  const handleSaveToExisting = () => {
    if (!selectedFacilityId) {
      notify.error('Select a facility first')
      return
    }
    const facility = getAllFacilities().find((f) => f.id === selectedFacilityId)
    const hasExisting = facility?.calculations
    if (hasExisting && !window.confirm('This facility already has saved calculations. Overwrite?')) {
      return
    }
    saveCalculationToFacility(selectedFacilityId, results)
    notify.success(`Saved to "${facility.name}"`)
    setShowSavePanel(false)
    setSaveMode(null)
  }

  const handleSaveToNew = () => {
    if (!newFacility.name.trim()) {
      notify.error('Facility name is required')
      return
    }
    const created = createFacility(newFacility)
    saveCalculationToFacility(created.id, results)
    notify.success(`Created "${created.name}" and saved results`)
    setShowSavePanel(false)
    setSaveMode(null)
    setNewFacility({ name: '', type: 'other', region: 'US' })
  }

  const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })
  const pct = (v) => (totalEmissions > 0 ? ((v / totalEmissions) * 100).toFixed(1) : '0')

  const facilities = getAllFacilities()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-secondary-900">Calculation Results</h2>
          <p className="text-secondary-600 mt-1">
            GWP: {results.gwpVersion} &middot; {new Date(results.calculatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" leftIcon={Share2} onClick={handleShare}>
            Share
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              leftIcon={Download}
              rightIcon={ChevronDown}
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              Export
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 z-10">
                {[
                  { fmt: 'pdf', label: 'PDF Report' },
                  { fmt: 'markdown', label: 'Markdown' },
                  { fmt: 'csv', label: 'CSV Data' },
                  { fmt: 'json', label: 'JSON' },
                ].map((item) => (
                  <button
                    key={item.fmt}
                    onClick={() => handleExport(item.fmt)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary-50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-secondary-400" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Alert variant="success" title="Calculation Complete">
        Your emissions have been calculated using GHG Protocol methodologies with
        IPCC {results.gwpVersion} Global Warming Potentials.
      </Alert>

      {/* Total Emissions */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <div className="text-center">
          <p className="text-primary-700 font-medium">Total GHG Emissions</p>
          <p className="text-5xl font-bold text-primary-900 mt-2">{fmt(totalEmissions)}</p>
          <p className="text-primary-600 mt-1">tonnes CO2e</p>
        </div>
      </Card>

      {/* Scope Cards */}
      {scopeData.length > 0 && (
        <div className={`grid gap-4 ${scopeData.length === 1 ? 'grid-cols-1' : scopeData.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {scopeData.map((s) => (
            <Card key={s.name}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${s.color}`} />
                    <span className="font-medium text-secondary-900">{s.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900 mt-2">{fmt(s.value)}</p>
                  <p className="text-sm text-secondary-500">tonnes CO2e</p>
                </div>
                <div className="text-right">
                  <s.icon className={`w-8 h-8 ${s.textColor}`} />
                  <p className="text-lg font-semibold text-secondary-700 mt-2">{pct(s.value)}%</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Scope 1 Breakdown */}
        {totals.scope1_tonnes > 0 && scope1 && (
          <Card>
            <CardTitle>Scope 1 Breakdown</CardTitle>
            <div className="mt-4 space-y-3">
              {scope1.stationaryCombustion && (
                <BreakdownRow
                  label="Stationary Combustion"
                  value={scope1.stationaryCombustion.co2e_tonnes}
                  detail={`${scope1.stationaryCombustion.sourceCount} source(s)`}
                />
              )}
              {scope1.mobileCombustion && (
                <BreakdownRow
                  label="Mobile Combustion"
                  value={scope1.mobileCombustion.co2e_tonnes}
                  detail={`${scope1.mobileCombustion.sourceCount} source(s)`}
                />
              )}
              {scope1.flaring && (
                <BreakdownRow
                  label="Flaring"
                  value={scope1.flaring.co2e_tonnes}
                  detail={scope1.flaring.methodology}
                />
              )}
            </div>
          </Card>
        )}

        {/* Scope 2 Breakdown */}
        {totals.scope2_tonnes > 0 && scope2 && (
          <Card>
            <CardTitle>Scope 2 Details</CardTitle>
            <div className="mt-4 space-y-4">
              {scope2.locationBased && (
                <div className="p-3 bg-secondary-50 rounded-lg">
                  <p className="text-sm text-secondary-500">Location-Based</p>
                  <p className="text-xl font-bold text-secondary-900">
                    {fmt(scope2.locationBased.co2e_tonnes)} tCO2e
                  </p>
                  <p className="text-xs text-secondary-500 mt-1">
                    Grid factor: {scope2.locationBased.gridFactor} kgCO2/kWh &middot; Region: {scope2.locationBased.region}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Scope 3 Breakdown */}
        {totals.scope3_tonnes > 0 && scope3 && (
          <Card>
            <CardTitle>Scope 3 Details</CardTitle>
            <div className="mt-4">
              <div className="p-3 bg-secondary-50 rounded-lg">
                <p className="text-sm text-secondary-500">Category 11 — Use of Sold Products</p>
                <p className="text-xl font-bold text-secondary-900">
                  {fmt(scope3.total_co2e_tonnes)} tCO2e
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Summary Row */}
      <Card>
        <CardTitle>Summary</CardTitle>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <MetricBox label="Scope 1" value={`${fmt(totals.scope1_tonnes)} t`} sub="Direct" />
          <MetricBox label="Scope 2" value={`${fmt(totals.scope2_tonnes)} t`} sub="Energy" />
          <MetricBox label="Scope 3" value={`${fmt(totals.scope3_tonnes)} t`} sub="Value chain" />
          <MetricBox label="GWP" value={results.gwpVersion} sub={results.gwpVersion === 'AR6' ? 'IPCC 2021' : 'IPCC 2014'} />
        </div>
      </Card>

      {/* Save to Facility */}
      <Card>
        <CardTitle>Save to Facility</CardTitle>
        <p className="text-secondary-600 mt-1 text-sm">
          Save these results to a facility for benchmarking and reporting.
        </p>

        {!showSavePanel ? (
          <div className="mt-4">
            <Button leftIcon={Save} onClick={() => setShowSavePanel(true)}>
              Save Results
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Option buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setSaveMode('existing')}
                className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
                  saveMode === 'existing'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4 text-primary-600" />
                  <span className="font-medium text-secondary-900">Save to Existing</span>
                </div>
                <p className="text-xs text-secondary-500 mt-1">Choose from your saved facilities</p>
              </button>
              <button
                onClick={() => setSaveMode('new')}
                className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
                  saveMode === 'new'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary-600" />
                  <span className="font-medium text-secondary-900">Create New Facility</span>
                </div>
                <p className="text-xs text-secondary-500 mt-1">Create a new facility and save</p>
              </button>
            </div>

            {/* Save to Existing */}
            {saveMode === 'existing' && (
              <div className="space-y-3">
                {facilities.length === 0 ? (
                  <p className="text-secondary-500 text-sm">No facilities found. Create one instead.</p>
                ) : (
                  <>
                    <select
                      value={selectedFacilityId}
                      onChange={(e) => setSelectedFacilityId(e.target.value)}
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a facility...</option>
                      {facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({FACILITY_TYPE_LABELS[f.type] || f.type}){f.calculations ? ' — has data' : ''}
                        </option>
                      ))}
                    </select>
                    <Button onClick={handleSaveToExisting} leftIcon={ClipboardCheck}>
                      Save
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Create New Facility */}
            {saveMode === 'new' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Facility name"
                  value={newFacility.name}
                  onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newFacility.type}
                    onChange={(e) => setNewFacility({ ...newFacility, type: e.target.value })}
                    className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {Object.entries(FACILITY_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Region (e.g. US)"
                    value={newFacility.region}
                    onChange={(e) => setNewFacility({ ...newFacility, region: e.target.value })}
                    className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <Button onClick={handleSaveToNew} leftIcon={ClipboardCheck}>
                  Create &amp; Save
                </Button>
              </div>
            )}

            <button
              onClick={() => { setShowSavePanel(false); setSaveMode(null) }}
              className="text-sm text-secondary-500 hover:text-secondary-700"
            >
              Cancel
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

function BreakdownRow({ label, value, detail }) {
  const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-secondary-700">{label}</span>
        {detail && <span className="text-xs text-secondary-400 ml-2">({detail})</span>}
      </div>
      <span className="font-medium text-secondary-900">{fmt(value)} tCO2e</span>
    </div>
  )
}

function MetricBox({ label, value, sub }) {
  return (
    <div className="p-4 bg-secondary-50 rounded-lg text-center">
      <p className="text-sm text-secondary-500">{label}</p>
      <p className="text-2xl font-bold text-secondary-900">{value}</p>
      <p className="text-xs text-secondary-400">{sub}</p>
    </div>
  )
}
