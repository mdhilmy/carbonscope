import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  Factory,
  Zap,
  Truck,
  Plus,
  ArrowRight,
} from 'lucide-react'
import Card, { CardTitle } from '../components/common/Card'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'

export default function DashboardPage() {
  // Placeholder data - will be replaced with real data from context/hooks
  const hasData = false

  if (!hasData) {
    return (
      <div className="py-8">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Dashboard</h1>
        <Card>
          <EmptyState
            icon={Factory}
            title="No calculations yet"
            description="Start by adding a facility and running your first emission calculation."
            action={
              <div className="flex gap-3 justify-center">
                <Link to="/facilities">
                  <Button variant="outline" leftIcon={Plus}>
                    Add Facility
                  </Button>
                </Link>
                <Link to="/calculator">
                  <Button leftIcon={ArrowRight}>Start Calculator</Button>
                </Link>
              </div>
            }
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <Link to="/calculator">
          <Button leftIcon={Plus}>New Calculation</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total Emissions</p>
              <p className="text-2xl font-bold text-secondary-900">—</p>
              <p className="text-xs text-secondary-400">tonnes CO2e</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Scope 1</p>
              <p className="text-2xl font-bold text-scope1">—</p>
              <p className="text-xs text-secondary-400">Direct emissions</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Factory className="w-6 h-6 text-scope1" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Scope 2</p>
              <p className="text-2xl font-bold text-scope2">—</p>
              <p className="text-xs text-secondary-400">Energy emissions</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-scope2" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Scope 3</p>
              <p className="text-2xl font-bold text-scope3">—</p>
              <p className="text-xs text-secondary-400">Value chain</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-scope3" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts placeholder */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle>Emissions by Scope</CardTitle>
          <div className="h-64 flex items-center justify-center text-secondary-400">
            Chart will appear here
          </div>
        </Card>

        <Card>
          <CardTitle>Emissions Trend</CardTitle>
          <div className="h-64 flex items-center justify-center text-secondary-400">
            Chart will appear here
          </div>
        </Card>
      </div>
    </div>
  )
}
