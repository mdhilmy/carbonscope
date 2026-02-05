import { Link } from 'react-router-dom'
import {
  Calculator,
  BarChart3,
  FileText,
  Building2,
  ArrowRight,
  Leaf,
  Globe,
  Shield,
  Wifi,
} from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

const features = [
  {
    icon: Calculator,
    title: 'Scope 1, 2 & 3 Calculator',
    description:
      'GHG Protocol-compliant calculations for direct emissions, energy, and value chain activities.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: BarChart3,
    title: 'Industry Benchmarks',
    description:
      'Compare against OGCI targets, regional averages, and regulatory thresholds.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: FileText,
    title: 'TCFD/CDP/CSRD Reports',
    description:
      'Generate reports aligned with major disclosure frameworks including SEC rules.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Building2,
    title: 'Multi-Facility Management',
    description:
      'Track emissions across all your operations with corporate rollup capabilities.',
    color: 'bg-green-100 text-green-600',
  },
]

const highlights = [
  {
    icon: Globe,
    title: '9+ Regional Databases',
    description: 'EPA, UK DEFRA, EU ETS, Malaysia, Singapore, Australia, and more',
  },
  {
    icon: Shield,
    title: 'Regulatory Compliant',
    description: '40 CFR Part 98, NGER, EU ETS methodology aligned',
  },
  {
    icon: Wifi,
    title: 'Works Offline',
    description: 'Full calculator functionality available without internet',
  },
]

export default function HomePage() {
  return (
    <div className="py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center">
            <Leaf className="w-10 h-10 text-primary-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
          CarbonScope
        </h1>
        <p className="text-xl text-secondary-600 max-w-2xl mx-auto mb-8">
          ESG Carbon Footprint Calculator for Oil & Gas Operations
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/calculator">
            <Button size="lg" rightIcon={ArrowRight}>
              Start Calculating
            </Button>
          </Link>
          <Link to="/help">
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-secondary-900 text-center mb-8">
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} hover className="text-center">
              <div
                className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-secondary-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <Card className="mb-16 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <div className="grid md:grid-cols-3 gap-8 py-4">
          {highlights.map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                <item.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-secondary-900 mb-1">{item.title}</h3>
              <p className="text-sm text-secondary-600">{item.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Start */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">
          Ready to Calculate?
        </h2>
        <p className="text-secondary-600 mb-6">
          Choose your calculation mode and get started in seconds
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/calculator">
            <Card hover padding="p-6" className="sm:w-64 cursor-pointer">
              <h3 className="font-semibold text-secondary-900 mb-2">Simple Mode</h3>
              <p className="text-sm text-secondary-500">
                Quick estimates with pre-configured factors
              </p>
            </Card>
          </Link>
          <Link to="/calculator">
            <Card hover padding="p-6" className="sm:w-64 cursor-pointer">
              <h3 className="font-semibold text-secondary-900 mb-2">Expert Mode</h3>
              <p className="text-sm text-secondary-500">
                Equipment-level inputs with full customization
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
