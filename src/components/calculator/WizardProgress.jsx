import { Check } from 'lucide-react'

export default function WizardProgress({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 flex items-center">
            {/* Step indicator */}
            <button
              onClick={() => onStepClick(index)}
              disabled={index > currentStep + 1}
              className={`
                flex items-center gap-3 p-2 rounded-lg transition-colors
                ${
                  index <= currentStep
                    ? 'cursor-pointer hover:bg-primary-50'
                    : index === currentStep + 1
                    ? 'cursor-pointer hover:bg-secondary-50'
                    : 'cursor-not-allowed opacity-50'
                }
              `}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium
                  ${
                    index < currentStep
                      ? 'bg-primary-600 text-white'
                      : index === currentStep
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-secondary-200 text-secondary-600'
                  }
                `}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="text-left">
                <p
                  className={`font-medium ${
                    index <= currentStep
                      ? 'text-secondary-900'
                      : 'text-secondary-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-secondary-500">{step.description}</p>
              </div>
            </button>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  index < currentStep ? 'bg-primary-600' : 'bg-secondary-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Progress */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-secondary-900">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-secondary-500">
            {steps[currentStep].label}
          </span>
        </div>
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-secondary-500 mt-1">
          {steps[currentStep].description}
        </p>
      </div>
    </div>
  )
}
