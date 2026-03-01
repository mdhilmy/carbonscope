import { useState } from 'react'
import {
  HelpCircle,
  BookOpen,
  Calculator,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Card, { CardTitle, CardDescription } from '../components/common/Card'

const faqs = [
  {
    question: 'What is the difference between Simple and Expert mode?',
    answer:
      'Simple mode uses pre-configured emission factors and industry averages for quick estimates. Expert mode allows equipment-level inputs, custom emission factors, gas composition analysis, and detailed methodology selection.',
  },
  {
    question: 'Which GWP values should I use (AR5 vs AR6)?',
    answer:
      'AR5 (IPCC 2014) is currently the most widely used for regulatory reporting. AR6 (IPCC 2021) has the latest scientific values and is being adopted by some frameworks. Check your reporting requirements to determine which version to use.',
  },
  {
    question: 'How are flaring emissions calculated?',
    answer:
      'Flaring emissions follow 40 CFR § 98.253 methodology. The default method uses a combustion efficiency of 98% and standard emission factors. Expert mode allows custom gas composition and combustion efficiency inputs.',
  },
  {
    question: 'What is the difference between location-based and market-based Scope 2?',
    answer:
      'Location-based uses average grid emission factors for your region. Market-based accounts for renewable energy certificates (RECs), power purchase agreements (PPAs), and supplier-specific emission factors.',
  },
  {
    question: 'Why is Category 11 (Use of Sold Products) so significant for O&G?',
    answer:
      'For oil and gas companies, Category 11 typically represents 70-90% of total value chain emissions because it accounts for the end-use combustion of sold petroleum products by customers.',
  },
  {
    question: 'Can I use this tool offline?',
    answer:
      'Yes, the calculator works fully offline using cached emission factors. API-dependent features like real-time grid intensity will use fallback data when offline.',
  },
]

const resources = [
  {
    title: 'GHG Protocol',
    description: 'Corporate Accounting and Reporting Standard',
    url: 'https://ghgprotocol.org',
  },
  {
    title: 'EPA GHG Emission Factors Hub',
    description: 'US EPA emission factors and guidance',
    url: 'https://www.epa.gov/climateleadership',
  },
  {
    title: '40 CFR Part 98',
    description: 'Mandatory GHG Reporting Rule',
    url: 'https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-98',
  },
  {
    title: 'IPCC Emission Factor Database',
    description: 'International emission factors',
    url: 'https://www.ipcc-nggip.iges.or.jp/EFDB/main.php',
  },
  {
    title: 'UK DESNZ Conversion Factors',
    description: 'UK government emission factors',
    url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023',
  },
]

const methodologies = [
  {
    title: 'Scope 1 - Direct Emissions',
    items: [
      'Stationary combustion (EPA Table C-1)',
      'Mobile combustion (EPA Table C-2)',
      'Flaring (40 CFR § 98.253)',
      'Fugitive emissions (EPA Protocol)',
      'Process emissions (industry-specific)',
    ],
  },
  {
    title: 'Scope 2 - Energy Emissions',
    items: [
      'Location-based (eGRID, IEA factors)',
      'Market-based (RECs, PPAs)',
      'Dual reporting per GHG Protocol',
    ],
  },
  {
    title: 'Scope 3 - Value Chain',
    items: [
      'All 15 GHG Protocol categories',
      'Category 11 combustion factors',
      'Spend-based and activity-based methods',
    ],
  },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-2">Help & Documentation</h1>
      <p className="text-secondary-600 mb-6">
        Learn how to use CarbonScope and understand the calculation methodologies
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Start */}
          <Card>
            <CardTitle>Quick Start Guide</CardTitle>
            <div className="mt-4 space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-medium">1</span>
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Run a Calculation</p>
                  <p className="text-sm text-secondary-600">
                    Go to the Calculator page, choose Simple or Expert mode, then enter your activity data for Scope 1, 2, and optionally Scope 3.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-medium">2</span>
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Save to a Facility</p>
                  <p className="text-sm text-secondary-600">
                    After calculating, use "Save to Facility" to store results. You can create a new facility or save to an existing one.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-medium">3</span>
                </div>
                <div>
                  <p className="font-medium text-secondary-900">View the Dashboard</p>
                  <p className="text-sm text-secondary-600">
                    The Dashboard shows all your facilities as cards. Green badge = has calculation data, gray = empty. Click a card to view full results, generate PDF reports, or delete.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-medium">4</span>
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Benchmark &amp; Export</p>
                  <p className="text-sm text-secondary-600">
                    Use "Run Benchmark" on the Dashboard to compare facilities against industry averages. Export results as PDF, Markdown, CSV, or JSON from the Calculator results page.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* FAQs */}
          <Card>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <div className="mt-4 divide-y divide-secondary-200">
              {faqs.map((faq, index) => (
                <div key={index} className="py-3">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-secondary-900">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-secondary-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-secondary-400" />
                    )}
                  </button>
                  {openFaq === index && (
                    <p className="mt-2 text-sm text-secondary-600">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Methodologies */}
          <Card>
            <CardTitle>Calculation Methodologies</CardTitle>
            <CardDescription>
              Standards and sources used for emission calculations
            </CardDescription>
            <div className="mt-4 grid sm:grid-cols-3 gap-4">
              {methodologies.map((method) => (
                <div key={method.title} className="bg-secondary-50 rounded-lg p-4">
                  <h4 className="font-medium text-secondary-900 mb-2">{method.title}</h4>
                  <ul className="space-y-1">
                    {method.items.map((item, idx) => (
                      <li key={idx} className="text-xs text-secondary-600">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resources */}
          <Card>
            <CardTitle>Resources</CardTitle>
            <div className="mt-4 space-y-3">
              {resources.map((resource) => (
                <a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-secondary-900 text-sm">
                      {resource.title}
                    </span>
                    <ExternalLink className="w-4 h-4 text-secondary-400" />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">{resource.description}</p>
                </a>
              ))}
            </div>
          </Card>

          {/* Contact */}
          <Card>
            <CardTitle>Need Help?</CardTitle>
            <p className="text-sm text-secondary-600 mt-2">
              CarbonScope is an open-source project. For issues and feature requests,
              please visit our GitHub repository.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-primary-600 text-sm hover:underline"
            >
              View on GitHub
              <ExternalLink className="w-4 h-4" />
            </a>
          </Card>
        </div>
      </div>
    </div>
  )
}
