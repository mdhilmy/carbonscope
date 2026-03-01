import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Plus,
  BarChart3,
  CheckCircle,
  Circle,
  MapPin,
  Trash2,
  FileText,
  X,
  Factory,
  Zap,
  Truck,
} from 'lucide-react'
import Card, { CardTitle } from '../components/common/Card'
import Button from '../components/common/Button'
import Modal, { ModalFooter } from '../components/common/Modal'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Alert from '../components/common/Alert'
import EmptyState from '../components/common/EmptyState'
import { FACILITY_TYPE_LABELS } from '../utils/constants'
import {
  getAllFacilities,
  createFacility,
  deleteFacility as deleteFacilityService,
  saveBenchmarkToFacility,
  hasCalculations,
} from '../services/facilityService'
import { downloadReport } from '../services/export/pdfExport'
import industryBenchmarks from '../data/benchmarks/industryBenchmarks.json'
import { useNotification } from '../context/NotificationContext'

const facilityTypeOptions = Object.entries(FACILITY_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

const regionOptions = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'OTHER', label: 'Other' },
]

export default function DashboardPage() {
  const [facilities, setFacilities] = useState([])
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBenchmarkSelector, setShowBenchmarkSelector] = useState(false)
  const [benchmarkFacilityIds, setBenchmarkFacilityIds] = useState([])
  const [benchmarkResults, setBenchmarkResults] = useState(null)
  const [formData, setFormData] = useState({ name: '', type: '', region: '' })
  const { notify } = useNotification()

  const reload = useCallback(() => {
    setFacilities(getAllFacilities())
  }, [])

  useEffect(() => { reload() }, [reload])

  // --- Add Facility ---
  const handleAddFacility = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    createFacility(formData)
    setFormData({ name: '', type: '', region: '' })
    setShowAddForm(false)
    reload()
    notify.success('Facility created successfully')
  }

  // --- Delete Facility ---
  const handleDeleteFacility = (id) => {
    if (!window.confirm('Delete this facility and all its data?')) return
    deleteFacilityService(id)
    reload()
    setSelectedFacility(null)
    notify.info('Facility deleted')
  }

  // --- Benchmarking ---
  const facilitiesWithCalcs = facilities.filter(hasCalculations)

  const toggleBenchmarkFacility = (id) => {
    setBenchmarkFacilityIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const runBenchmark = () => {
    const selected = facilities.filter((f) =>
      benchmarkFacilityIds.includes(f.id)
    )
    if (selected.length === 0) return

    const results = selected.map((f) => {
      const calc = f.calculations
      const scope1 = calc?.totals?.scope1_tonnes ?? 0
      const scope2 = calc?.totals?.scope2_tonnes ?? 0
      const total = calc?.totals?.total_tonnes ?? 0
      const carbonIntensityAvg =
        industryBenchmarks.carbonIntensity.industryAverage.upstream

      const benchmarkData = {
        facilityId: f.id,
        facilityName: f.name,
        scope1_tonnes: scope1,
        scope2_tonnes: scope2,
        total_tonnes: total,
        carbonIntensity: {
          value: total > 0 ? total : 0,
          industryAverage: carbonIntensityAvg,
          rating: total <= carbonIntensityAvg ? 'Below Average' : 'Above Average',
        },
        methaneTarget: industryBenchmarks.methaneIntensity.targets.OGCI_2025,
      }

      saveBenchmarkToFacility(f.id, benchmarkData)
      return benchmarkData
    })

    setBenchmarkResults(results)
    setShowBenchmarkSelector(false)
    setBenchmarkFacilityIds([])
    reload()
    notify.success('Benchmarking completed')
  }

  // --- PDF Report generation from modal ---
  const handleGenerateReport = (facility) => {
    const calc = facility.calculations
    if (!calc) return

    const pdfData = {
      facility: { name: facility.name, location: facility.region },
      metadata: { gwpVersion: calc.gwpVersion || 'AR5' },
      totals: calc.totals || {},
      scope1: calc.scope1 || {},
      scope2: calc.scope2 || {},
      scope3: calc.scope3 || {},
    }
    downloadReport(pdfData, `${facility.name.replace(/\s+/g, '-')}-report.pdf`)
    notify.success('PDF report downloaded')
  }

  // --- Render ---
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <Button leftIcon={Plus} onClick={() => setShowAddForm(true)}>
          Add Facility
        </Button>
      </div>

      {/* Inline Add Facility Form */}
      {showAddForm && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Add New Facility</CardTitle>
            <button onClick={() => setShowAddForm(false)} className="p-1 text-secondary-400 hover:text-secondary-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddFacility}>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Facility Name"
                placeholder="e.g., Permian Basin Platform A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Select
                label="Facility Type"
                options={facilityTypeOptions}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Select type"
              />
              <Select
                label="Region"
                options={regionOptions}
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="Select region"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit">Create Facility</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Facility Cards */}
      {facilities.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No facilities yet"
            description="Add a facility to start tracking emissions."
            action={
              <Button leftIcon={Plus} onClick={() => setShowAddForm(true)}>
                Add Facility
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {facilities.map((facility) => {
            const hasCalc = hasCalculations(facility)
            return (
              <Card
                key={facility.id}
                hover
                className="cursor-pointer relative"
                onClick={() => setSelectedFacility(facility)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${hasCalc ? 'bg-green-100' : 'bg-secondary-100'}`}>
                    <Building2 className={`w-5 h-5 ${hasCalc ? 'text-green-600' : 'text-secondary-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary-900 truncate">{facility.name}</h3>
                    <p className="text-sm text-secondary-500">
                      {FACILITY_TYPE_LABELS[facility.type] || facility.type || 'Unspecified'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-secondary-400 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{facility.region || 'No region'}</span>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div className="mt-3">
                  {hasCalc ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Results Saved
                    </span>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary-500 bg-secondary-50 border border-secondary-200 px-2 py-1 rounded-full">
                        <Circle className="w-3 h-3" /> No Calculations Yet
                      </span>
                      <Link
                        to="/calculator"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary-600 hover:underline font-medium"
                      >
                        Calculate
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Run Benchmark Section */}
      {facilitiesWithCalcs.length > 0 && (
        <div className="mb-8">
          {!showBenchmarkSelector ? (
            <Button variant="outline" leftIcon={BarChart3} onClick={() => setShowBenchmarkSelector(true)}>
              Run Benchmark
            </Button>
          ) : (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Select Facilities to Benchmark</CardTitle>
                <button onClick={() => setShowBenchmarkSelector(false)} className="p-1 text-secondary-400 hover:text-secondary-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-secondary-600 mb-4">Only facilities with saved calculations are shown.</p>
              <div className="space-y-2 mb-4">
                {facilitiesWithCalcs.map((f) => (
                  <label key={f.id} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg cursor-pointer hover:bg-secondary-100">
                    <input
                      type="checkbox"
                      checked={benchmarkFacilityIds.includes(f.id)}
                      onChange={() => toggleBenchmarkFacility(f.id)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-secondary-900 font-medium">{f.name}</span>
                    <span className="text-xs text-secondary-500 ml-auto">
                      {f.calculations?.totals?.total_tonnes?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '—'} tCO2e
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={runBenchmark} disabled={benchmarkFacilityIds.length === 0} leftIcon={BarChart3}>
                  Run Benchmark ({benchmarkFacilityIds.length} selected)
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Benchmark Results Display */}
      {benchmarkResults && (
        <Card className="mb-8">
          <CardTitle>Benchmark Results</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-2 pr-4 text-secondary-600 font-medium">Facility</th>
                  <th className="text-right py-2 px-4 text-secondary-600 font-medium">Scope 1</th>
                  <th className="text-right py-2 px-4 text-secondary-600 font-medium">Scope 2</th>
                  <th className="text-right py-2 px-4 text-secondary-600 font-medium">Total</th>
                  <th className="text-left py-2 pl-4 text-secondary-600 font-medium">vs Industry Avg</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkResults.map((r) => (
                  <tr key={r.facilityId} className="border-b border-secondary-100">
                    <td className="py-2 pr-4 font-medium text-secondary-900">{r.facilityName}</td>
                    <td className="py-2 px-4 text-right text-secondary-700">{r.scope1_tonnes.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="py-2 px-4 text-right text-secondary-700">{r.scope2_tonnes.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="py-2 px-4 text-right font-medium text-secondary-900">{r.total_tonnes.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="py-2 pl-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        r.carbonIntensity.rating === 'Below Average'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {r.carbonIntensity.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-secondary-400 mt-3">
            Industry average (upstream): {industryBenchmarks.carbonIntensity.industryAverage.upstream} kgCO2e/BOE. Benchmark data saved to each facility.
          </p>
        </Card>
      )}

      {/* Facility Detail Modal */}
      <Modal
        isOpen={!!selectedFacility}
        onClose={() => setSelectedFacility(null)}
        title={selectedFacility?.name || 'Facility Details'}
        size="xl"
      >
        {selectedFacility && (
          <FacilityDetailContent
            facility={selectedFacility}
            onDelete={() => handleDeleteFacility(selectedFacility.id)}
            onGenerateReport={() => handleGenerateReport(selectedFacility)}
          />
        )}
      </Modal>
    </div>
  )
}

// ---- Facility Detail Content (inside modal) ----
function FacilityDetailContent({ facility, onDelete, onGenerateReport }) {
  const calc = facility.calculations
  const bench = facility.benchmarks
  const hasCalc = !!calc

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
      {/* Metadata */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-secondary-50 rounded-lg p-3">
          <p className="text-xs text-secondary-500">Type</p>
          <p className="font-medium text-secondary-900">{FACILITY_TYPE_LABELS[facility.type] || facility.type || '—'}</p>
        </div>
        <div className="bg-secondary-50 rounded-lg p-3">
          <p className="text-xs text-secondary-500">Region</p>
          <p className="font-medium text-secondary-900">{facility.region || '—'}</p>
        </div>
        <div className="bg-secondary-50 rounded-lg p-3">
          <p className="text-xs text-secondary-500">Created</p>
          <p className="font-medium text-secondary-900">{new Date(facility.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Calculation Results */}
      {hasCalc ? (
        <>
          <div>
            <h3 className="text-sm font-semibold text-secondary-700 mb-3">Calculation Results</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <ScopeCard label="Scope 1" value={calc.totals?.scope1_tonnes} icon={Factory} color="red" />
              <ScopeCard label="Scope 2" value={calc.totals?.scope2_tonnes} icon={Zap} color="amber" />
              <ScopeCard label="Scope 3" value={calc.totals?.scope3_tonnes} icon={Truck} color="blue" />
            </div>
            <div className="mt-3 bg-primary-50 border border-primary-200 rounded-lg p-3 text-center">
              <p className="text-xs text-primary-600">Total GHG Emissions</p>
              <p className="text-2xl font-bold text-primary-800">{(calc.totals?.total_tonnes ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-primary-500">tonnes CO2e</p>
            </div>
            <p className="text-xs text-secondary-400 mt-2">Calculated: {new Date(calc.savedAt).toLocaleString()}</p>
          </div>

          {/* Scope 1 Breakdown */}
          {calc.scope1 && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-700 mb-2">Scope 1 Breakdown</h3>
              <div className="space-y-1">
                {calc.scope1.stationaryCombustion && <BreakdownRow label="Stationary Combustion" value={calc.scope1.stationaryCombustion.co2e_tonnes} />}
                {calc.scope1.mobileCombustion && <BreakdownRow label="Mobile Combustion" value={calc.scope1.mobileCombustion.co2e_tonnes} />}
                {calc.scope1.flaring && <BreakdownRow label="Flaring" value={calc.scope1.flaring.co2e_tonnes} />}
                {calc.scope1.venting && <BreakdownRow label="Venting" value={calc.scope1.venting.co2e_tonnes} />}
                {calc.scope1.fugitive && <BreakdownRow label="Fugitive Emissions" value={calc.scope1.fugitive.co2e_tonnes} />}
              </div>
            </div>
          )}
        </>
      ) : (
        <Alert variant="info" title="No Calculations">
          This facility has no saved calculations yet. Go to the Calculator to run one.
        </Alert>
      )}

      {/* Benchmark Results */}
      {bench && (
        <div>
          <h3 className="text-sm font-semibold text-secondary-700 mb-2">Benchmark Results</h3>
          <div className="bg-secondary-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-600">Total Emissions</span>
              <span className="font-medium">{bench.total_tonnes?.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO2e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-600">Industry Avg (upstream)</span>
              <span className="font-medium">{bench.carbonIntensity?.industryAverage} kgCO2e/BOE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-600">Rating</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                bench.carbonIntensity?.rating === 'Below Average' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}>{bench.carbonIntensity?.rating}</span>
            </div>
            <p className="text-xs text-secondary-400">Benchmarked: {new Date(bench.savedAt).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-secondary-200">
        {hasCalc && (
          <Button variant="primary" leftIcon={FileText} onClick={onGenerateReport}>
            Generate Report (PDF)
          </Button>
        )}
        <Button variant="danger" leftIcon={Trash2} onClick={onDelete} className="ml-auto">
          Delete Facility
        </Button>
      </div>
    </div>
  )
}

function ScopeCard({ label, value, icon: Icon, color }) {
  const val = value ?? 0
  const colorMap = {
    red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
  }
  const c = colorMap[color] || colorMap.red
  return (
    <div className={`${c.bg} rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${c.icon}`} />
        <span className="text-xs font-medium text-secondary-600">{label}</span>
      </div>
      <p className={`text-lg font-bold ${c.text}`}>{val.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      <p className="text-xs text-secondary-400">tonnes CO2e</p>
    </div>
  )
}

function BreakdownRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-secondary-600">{label}</span>
      <span className="font-medium text-secondary-900">{value.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO2e</span>
    </div>
  )
}
