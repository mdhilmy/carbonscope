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
    // Allow navigation to completed steps or the next available step
    if (index <= currentStep || index === currentStep + 1) {
      setCurrentStep(index)
    }
  }

  const updateScope1Data = (newData) => {
    setData((prev) => ({
      ...prev,
      scope1: { ...prev.scope1, ...newData },
    }))
  }

  const updateScope2Data = (newData) => {
    setData((prev) => ({
      ...prev,
      scope2: { ...prev.scope2, ...newData },
    }))
  }

  const updateScope3Data = (newData) => {
    setData((prev) => ({
      ...prev,
      scope3: { ...prev.scope3, ...newData },
    }))
  }

  const handleCalculate = () => {
    // This will be replaced with actual calculation logic
    notify.success('Calculation completed successfully!')
    handleNext()
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
        return (
          <Scope1Calculator
            mode={mode}
            data={data.scope1}
            onUpdate={updateScope1Data}
          />
        )
      case 'scope2':
        return (
          <Scope2Calculator
            mode={mode}
            data={data.scope2}
            onUpdate={updateScope2Data}
          />
        )
      case 'scope3':
        return (
          <Scope3Calculator
            mode={mode}
            data={data.scope3}
            onUpdate={updateScope3Data}
          />
        )
      case 'results':
        return <ResultsSummary data={data} results={results} />
      default:
        return null
    }
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Emission Calculator
          </h1>
          <p className="text-secondary-600">
            {mode === 'simple' ? 'Simple Mode' : 'Expert Mode'} •{' '}
            <button
              onClick={onChangeMode}
              className="text-primary-600 hover:underline"
            >
              Change mode
            </button>
          </p>
        </div>
        <Button variant="ghost" onClick={handleReset} leftIcon={RotateCcw}>
          Reset
        </Button>
      </div>

      {/* Progress */}
      <WizardProgress
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Content */}
      <Card className="mt-6">{renderStep()}</Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentStep === 0}
          leftIcon={ArrowLeft}
        >
          Back
        </Button>

        {currentStep === steps.length - 2 ? (
          <Button onClick={handleCalculate} rightIcon={Check}>
            Calculate Emissions
          </Button>
        ) : currentStep === steps.length - 1 ? (
          <Button onClick={() => setCurrentStep(0)} leftIcon={RotateCcw}>
            Start New Calculation
          </Button>
        ) : (
          <Button onClick={handleNext} rightIcon={ArrowRight}>
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}
