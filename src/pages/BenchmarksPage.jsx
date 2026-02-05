import { BarChart3, Target, TrendingDown, AlertTriangle } from 'lucide-react'
import Card, { CardTitle, CardDescription } from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'

export default function BenchmarksPage() {
  // Placeholder - will be replaced with real data
  const hasCalculations = false

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-2">Benchmarks</h1>
      <p className="text-secondary-600 mb-6">
        Compare your emissions against industry standards and regulatory thresholds
      </p>

      {!hasCalculations ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No data to benchmark"
            description="Complete a calculation first to see how your emissions compare to industry benchmarks."
          />
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Methane Intensity */}
          <Card>
            <CardTitle>Methane Intensity</CardTitle>
            <CardDescription>
              Compare against OGCI and OGMP 2.0 targets
            </CardDescription>
            <div className="h-48 flex items-center justify-center text-secondary-400 mt-4">
              Benchmark chart will appear here
            </div>
          </Card>

          {/* Carbon Intensity */}
          <Card>
            <CardTitle>Carbon Intensity</CardTitle>
            <CardDescription>kg CO2e per barrel of oil equivalent</CardDescription>
            <div className="h-48 flex items-center justify-center text-secondary-400 mt-4">
              Intensity gauge will appear here
            </div>
          </Card>

          {/* Regulatory Thresholds */}
          <Card className="lg:col-span-2">
            <CardTitle>Regulatory Thresholds</CardTitle>
            <CardDescription>
              Monitor compliance with reporting requirements
            </CardDescription>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <ThresholdCard
                title="EPA GHGRP"
                threshold="25,000 MT CO2e/year"
                status="below"
              />
              <ThresholdCard
                title="EPA Super-Emitter"
                threshold="100 kg CH4/hr"
                status="below"
              />
              <ThresholdCard
                title="AU NGER"
                threshold="50,000 t CO2e/year"
                status="below"
              />
              <ThresholdCard
                title="AU Safeguard"
                threshold="100,000 t CO2e Scope 1"
                status="below"
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function ThresholdCard({ title, threshold, status }) {
  const statusColors = {
    below: 'bg-green-50 border-green-200 text-green-700',
    near: 'bg-amber-50 border-amber-200 text-amber-700',
    above: 'bg-red-50 border-red-200 text-red-700',
  }

  const statusIcons = {
    below: TrendingDown,
    near: AlertTriangle,
    above: AlertTriangle,
  }

  const Icon = statusIcons[status]

  return (
    <div className={`${statusColors[status]} border rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm mt-1">{threshold}</p>
        </div>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}
