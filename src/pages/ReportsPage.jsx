import { FileText, Download, Plus } from 'lucide-react'
import Card, { CardTitle, CardDescription } from '../components/common/Card'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'

const reportTemplates = [
  {
    id: 'tcfd',
    name: 'TCFD Report',
    description: 'Task Force on Climate-related Financial Disclosures',
    icon: '🌍',
  },
  {
    id: 'cdp',
    name: 'CDP Report',
    description: 'Carbon Disclosure Project questionnaire format',
    icon: '📊',
  },
  {
    id: 'csrd',
    name: 'EU CSRD/ESRS',
    description: 'Corporate Sustainability Reporting Directive',
    icon: '🇪🇺',
  },
  {
    id: 'sec',
    name: 'SEC Climate',
    description: 'SEC Climate Disclosure format (when finalized)',
    icon: '🇺🇸',
  },
  {
    id: 'custom',
    name: 'Custom Report',
    description: 'Build your own report with selected metrics',
    icon: '📝',
  },
]

export default function ReportsPage() {
  // Placeholder - will be replaced with real data
  const hasCalculations = false
  const reports = []

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Reports</h1>
          <p className="text-secondary-600">
            Generate reports aligned with major disclosure frameworks
          </p>
        </div>
      </div>

      {/* Report Templates */}
      <Card className="mb-6">
        <CardTitle>Report Templates</CardTitle>
        <CardDescription>
          Select a framework to generate a compliant report
        </CardDescription>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
          {reportTemplates.map((template) => (
            <button
              key={template.id}
              disabled={!hasCalculations}
              className="p-4 border border-secondary-200 rounded-lg text-left hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl mb-2 block">{template.icon}</span>
              <p className="font-medium text-secondary-900">{template.name}</p>
              <p className="text-xs text-secondary-500 mt-1">{template.description}</p>
            </button>
          ))}
        </div>
        {!hasCalculations && (
          <p className="text-sm text-secondary-500 mt-4">
            Complete a calculation to enable report generation
          </p>
        )}
      </Card>

      {/* Generated Reports */}
      <Card>
        <CardTitle>Generated Reports</CardTitle>
        {reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports generated"
            description="Select a template above to generate your first report"
          />
        ) : (
          <div className="divide-y divide-secondary-200">
            {/* Report list will go here */}
          </div>
        )}
      </Card>
    </div>
  )
}
