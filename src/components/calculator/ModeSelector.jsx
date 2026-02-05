import { Zap, Settings, ArrowRight, Check } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'

const modes = [
  {
    id: 'simple',
    name: 'Simple Mode',
    description: 'Quick estimates with pre-configured emission factors',
    icon: Zap,
    color: 'bg-green-100 text-green-600',
    features: [
      'Pre-configured EPA emission factors',
      'Common fuel types only',
      'Default regional grid factors',
      'Industry average fugitive estimates',
      'Results in minutes',
    ],
    recommended: true,
  },
  {
    id: 'expert',
    name: 'Expert Mode',
    description: 'Equipment-level inputs with full customization',
    icon: Settings,
    color: 'bg-blue-100 text-blue-600',
    features: [
      'Custom emission factors',
      'Equipment-level inputs',
      'Component count method for fugitives',
      'Gas composition analysis for flaring',
      'Uncertainty quantification',
    ],
    recommended: false,
  },
]

export default function ModeSelector({ onSelectMode }) {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">
          Select Calculation Mode
        </h1>
        <p className="text-secondary-600">
          Choose the level of detail for your emission calculations
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {modes.map((mode) => (
          <Card
            key={mode.id}
            hover
            className={`cursor-pointer relative ${
              mode.recommended ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => onSelectMode(mode.id)}
          >
            {mode.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Recommended
                </span>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 ${mode.color} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <mode.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-secondary-900">
                  {mode.name}
                </h3>
                <p className="text-sm text-secondary-500 mt-1">{mode.description}</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {mode.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-sm text-secondary-600"
                >
                  <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant={mode.recommended ? 'primary' : 'outline'}
              className="w-full mt-6"
              rightIcon={ArrowRight}
            >
              Select {mode.name}
            </Button>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-secondary-500 mt-6">
        You can switch between modes at any time during the calculation process
      </p>
    </div>
  )
}
