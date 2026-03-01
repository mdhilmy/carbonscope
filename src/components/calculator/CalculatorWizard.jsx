import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import WizardProgress from './WizardProgress'
import Scope1Calculator from './scope1/Scope1Calculator'
import Scope2Calculator from './scope2/Scope2Calculator'
import Scope3Calculator from './scope3/Scope3Calculator'
import ResultsSummary from './results/ResultsSummary'
import { useNotification } from '../../context/NotificationContext'
import { useApp } from '../../context/AppContext'
import {
  calculateTotalStationaryCombustion,
  calculateTotalMobileCombustion,
} from '../../services/calculations/scope1Calculations'
import { calculateFlaringDefault } from '../../services/calculations/flaringCalculations'
import { calculateLocationBased } from '../../services/calculations/scope2Calculations'
import { calculateTotalScope3 } from '../../services/calculations/scope3Calculations'

const steps = [
  { id: 'scope1', label: 'Scope 1', description: 'Direct emissions' },
  { id: 'scope2', label: 'Scope 2', description: 'Energy emissions' },
  { id: 'scope3', label: 'Scope 3', description: 'Value chain (optional)' },
  { id: 'results', label: 'Results', description: 'Summary & export' },
]

const initialData = {
  scope1: {
    stationaryCombustion: [],
    mobileCombustion: [],
    flaring: { volume: 0, unit: 'MMscf' },
    venting: [],
    fugitives: { method: 'average', facilityType: 'production_onshore' },
  },
  scope2: {
    electricity: { kWh: 0, region: 'US', subregion: '' },
    steam: { amount: 0 },
  },
  scope3: {
    includeScope3: false,
    category11: [],
    category3: [],
    category4: [],
  },
}

export default function CalculatorWizard({ mode, onChangeMode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState(initialData)
  const [results, setResults] = useState(null)
  const { notify } = useNotification()
  const { settings } = useApp()

  const gwpVersion = settings?.gwpVersion || 'AR5'

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (index) => {
    if (index <= currentStep || index === currentStep + 1) {
      setCurrentStep(index)
    }
  }

  const updateScope1Data = (newData) => {
    setData((prev) => ({ ...prev, scope1: { ...prev.scope1, ...newData } }))
  }

  const updateScope2Data = (newData) => {
    setData((prev) => ({ ...prev, scope2: { ...prev.scope2, ...newData } }))
  }

  const updateScope3Data = (newData) => {
    setData((prev) => ({ ...prev, scope3: { ...prev.scope3, ...newData } }))
  }

  const handleCalculate = () => {
    try {
      const calcResults = runCalculations(data, gwpVersion)
      setResults(calcResults)
      notify.success('Calculation completed successfully!')
      handleNext()
    } catch (err) {
      console.error('Calculation error:', err)
      notify.error('Calculation failed: ' + err.message)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all inputs?')) {
      setData(initialData)
      setResults(null)
      setCurrentStep(0)
      notify.info('Calculator has been reset')
    }
  }

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'scope1':
        return <Scope1Calculator mode={mode} data={data.scope1} onUpdate={updateScope1Data} />
      case 'scope2':
        return <Scope2Calculator mode={mode} data={data.scope2} onUpdate={updateScope2Data} />
      case 'scope3':
        return <Scope3Calculator mode={mode} data={data.scope3} onUpdate={updateScope3Data} />
      case 'results':
        return <ResultsSummary data={data} results={results} gwpVersion={gwpVersion} />
      default:
        return null
    }
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Emission Calculator</h1>
          <p className="text-secondary-600">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mr-2 ${
              mode === 'simple' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {mode === 'simple' ? 'Simple Mode' : 'Expert Mode'}
            </span>
            <button onClick={onChangeMode} className="text-primary-600 hover:underline text-sm">
              Change mode
            </button>
          </p>
        </div>
        <Button variant="ghost" onClick={handleReset} leftIcon={RotateCcw}>Reset</Button>
      </div>

      {/* Progress */}
      <WizardProgress steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />

      {/* Content */}
      <Card className="mt-6">{renderStep()}</Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={handleBack} disabled={currentStep === 0} leftIcon={ArrowLeft}>
          Back
        </Button>

        {currentStep === steps.length - 2 ? (
          <Button onClick={handleCalculate} rightIcon={Check}>Calculate Emissions</Button>
        ) : currentStep === steps.length - 1 ? (
          <Button onClick={() => setCurrentStep(0)} leftIcon={RotateCcw}>Start New Calculation</Button>
        ) : (
          <Button onClick={handleNext} rightIcon={ArrowRight}>Continue</Button>
        )}
      </div>
    </div>
  )
}

/**
 * Run all calculations from user input data
 */
function runCalculations(data, gwpVersion) {
  let scope1_tonnes = 0
  let scope2_tonnes = 0
  let scope3_tonnes = 0
  const scope1Detail = {}
  const scope2Detail = {}
  let scope3Detail = null

  // --- Scope 1 ---
  const stationaryEntries = data.scope1.stationaryCombustion.filter(
    (e) => e.fuelType && parseFloat(e.quantity) > 0
  )
  if (stationaryEntries.length > 0) {
    const result = calculateTotalStationaryCombustion(stationaryEntries, gwpVersion)
    scope1Detail.stationaryCombustion = {
      co2e_kg: result.total_co2e_kg,
      co2e_tonnes: result.total_co2e_tonnes,
      sourceCount: result.sourceCount,
    }
    scope1_tonnes += result.total_co2e_tonnes
  }

  const mobileEntries = data.scope1.mobileCombustion.filter(
    (e) => e.vehicleType && parseFloat(e.quantity) > 0
  )
  if (mobileEntries.length > 0) {
    const result = calculateTotalMobileCombustion(mobileEntries, gwpVersion)
    scope1Detail.mobileCombustion = {
      co2e_kg: result.total_co2e_kg,
      co2e_tonnes: result.total_co2e_tonnes,
      sourceCount: result.sourceCount,
    }
    scope1_tonnes += result.total_co2e_tonnes
  }

  const flaringVolume = parseFloat(data.scope1.flaring.volume) || 0
  if (flaringVolume > 0) {
    let volumeMMscf = flaringVolume
    if (data.scope1.flaring.unit === 'mcf') volumeMMscf = flaringVolume / 1000
    else if (data.scope1.flaring.unit === 'scf') volumeMMscf = flaringVolume / 1000000

    const result = calculateFlaringDefault(volumeMMscf, undefined, undefined, gwpVersion)
    scope1Detail.flaring = {
      co2e_kg: result.co2e_kg,
      co2e_tonnes: result.co2e_tonnes,
      methodology: result.methodology,
    }
    scope1_tonnes += result.co2e_tonnes
  }

  // --- Scope 2 ---
  const electricityKWh = parseFloat(data.scope2.electricity.kWh) || 0
  if (electricityKWh > 0) {
    try {
      const result = calculateLocationBased(
        electricityKWh,
        data.scope2.electricity.region || 'US',
        data.scope2.electricity.subregion || null
      )
      scope2Detail.locationBased = {
        co2e_kg: result.co2e_kg,
        co2e_tonnes: result.co2e_tonnes,
        gridFactor: result.gridFactor,
        region: result.region,
      }
      scope2_tonnes += result.co2e_tonnes
    } catch (err) {
      console.warn('Scope 2 calculation error:', err)
    }
  }

  // --- Scope 3 ---
  if (data.scope3.includeScope3) {
    const cat11Entries = data.scope3.category11
      .filter((e) => e.productType && parseFloat(e.quantity) > 0)
      .map((e) => ({ ...e, quantity: parseFloat(e.quantity) }))

    if (cat11Entries.length > 0) {
      scope3Detail = calculateTotalScope3({ category11: cat11Entries }, gwpVersion)
      scope3_tonnes = scope3Detail.total_co2e_tonnes
    }
  }

  const total_tonnes = scope1_tonnes + scope2_tonnes + scope3_tonnes

  return {
    gwpVersion,
    calculatedAt: new Date().toISOString(),
    totals: { scope1_tonnes, scope2_tonnes, scope3_tonnes, total_tonnes },
    scope1: scope1Detail,
    scope2: scope2Detail,
    scope3: scope3Detail,
  }
}
