import { useState } from 'react'
import { Plus, Trash2, AlertTriangle, Package, Fuel, Truck } from 'lucide-react'
import Input from '../../common/Input'
import Select from '../../common/Select'
import Button from '../../common/Button'
import Alert from '../../common/Alert'

const scope3Categories = [
  { id: 1, name: 'Purchased Goods and Services', relevance: 'medium' },
  { id: 2, name: 'Capital Goods', relevance: 'medium' },
  { id: 3, name: 'Fuel and Energy Related Activities', relevance: 'high' },
  { id: 4, name: 'Upstream Transportation and Distribution', relevance: 'high' },
  { id: 5, name: 'Waste Generated in Operations', relevance: 'low' },
  { id: 6, name: 'Business Travel', relevance: 'low' },
  { id: 7, name: 'Employee Commuting', relevance: 'low' },
  { id: 8, name: 'Upstream Leased Assets', relevance: 'medium' },
  { id: 9, name: 'Downstream Transportation and Distribution', relevance: 'high' },
  { id: 10, name: 'Processing of Sold Products', relevance: 'high' },
  { id: 11, name: 'Use of Sold Products', relevance: 'critical' },
  { id: 12, name: 'End-of-Life Treatment of Sold Products', relevance: 'low' },
  { id: 13, name: 'Downstream Leased Assets', relevance: 'low' },
  { id: 14, name: 'Franchises', relevance: 'none' },
  { id: 15, name: 'Investments', relevance: 'medium' },
]

const productTypes = [
  { value: 'motorGasoline', label: 'Motor Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'jetFuel', label: 'Jet Fuel' },
  { value: 'lpg', label: 'LPG' },
  { value: 'residualFuelOil', label: 'Residual Fuel Oil' },
  { value: 'naturalGas', label: 'Natural Gas' },
  { value: 'crudeOil', label: 'Crude Oil' },
]

const relevanceColors = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-secondary-100 text-secondary-600 border-secondary-200',
  none: 'bg-secondary-50 text-secondary-400 border-secondary-100',
}

export default function Scope3Calculator({ mode, data, onUpdate }) {
  const [activeCategory, setActiveCategory] = useState(11)

  const toggleScope3 = () => {
    onUpdate({ includeScope3: !data.includeScope3 })
  }

  const addProduct = () => {
    onUpdate({
      category11: [
        ...data.category11,
        { id: Date.now(), productType: '', quantity: '', unit: 'gallon' },
      ],
    })
  }

  const updateProduct = (id, field, value) => {
    onUpdate({
      category11: data.category11.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      ),
    })
  }

  const removeProduct = (id) => {
    onUpdate({
      category11: data.category11.filter((entry) => entry.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-secondary-900">
          Scope 3: Value Chain Emissions
        </h2>
        <p className="text-secondary-600 mt-1">
          Indirect emissions from upstream and downstream activities
        </p>
      </div>

      {/* Include Scope 3 Toggle */}
      <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
        <div>
          <p className="font-medium text-secondary-900">Include Scope 3 Emissions</p>
          <p className="text-sm text-secondary-500">
            Optional but recommended for comprehensive carbon footprinting
          </p>
        </div>
        <button
          onClick={toggleScope3}
          className={`w-12 h-6 rounded-full transition-colors ${
            data.includeScope3 ? 'bg-primary-600' : 'bg-secondary-300'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
              data.includeScope3 ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {!data.includeScope3 ? (
        <Alert variant="info">
          Scope 3 emissions are optional. For oil and gas companies, Category 11
          (Use of Sold Products) typically represents 70-90% of total value chain
          emissions.
        </Alert>
      ) : (
        <>
          {/* Category Overview */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">
                  Important for Oil & Gas
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Category 11 (Use of Sold Products) is the largest emission source
                  for most O&G companies, often exceeding Scope 1 and 2 combined.
                </p>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <h3 className="text-sm font-medium text-secondary-700 mb-3">
              Select Categories to Include
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {scope3Categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    activeCategory === cat.id
                      ? 'border-primary-500 bg-primary-50'
                      : relevanceColors[cat.relevance]
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Cat {cat.id}</span>
                    {cat.relevance === 'critical' && (
                      <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1 line-clamp-1">{cat.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Category 11 - Use of Sold Products */}
          {activeCategory === 11 && (
            <div className="space-y-4 border-t border-secondary-200 pt-6">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-medium text-secondary-900">
                  Category 11: Use of Sold Products
                </h3>
              </div>
              <p className="text-sm text-secondary-600">
                Enter volumes of petroleum products sold to customers. Emissions are
                calculated based on end-use combustion.
              </p>

              {data.category11.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-secondary-50 rounded-lg"
                >
                  <Select
                    label="Product Type"
                    options={productTypes}
                    value={entry.productType}
                    onChange={(e) =>
                      updateProduct(entry.id, 'productType', e.target.value)
                    }
                    placeholder="Select product"
                  />
                  <Input
                    label="Quantity Sold"
                    type="number"
                    placeholder="Enter amount"
                    value={entry.quantity}
                    onChange={(e) =>
                      updateProduct(entry.id, 'quantity', e.target.value)
                    }
                  />
                  <Select
                    label="Unit"
                    options={[
                      { value: 'gallon', label: 'Gallons' },
                      { value: 'barrel', label: 'Barrels' },
                      { value: 'liter', label: 'Liters' },
                      { value: 'MMBtu', label: 'MMBtu (gas)' },
                    ]}
                    value={entry.unit}
                    onChange={(e) =>
                      updateProduct(entry.id, 'unit', e.target.value)
                    }
                  />
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      onClick={() => removeProduct(entry.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addProduct} leftIcon={Plus}>
                Add Product
              </Button>
            </div>
          )}

          {/* Category 4 - Upstream Transportation */}
          {activeCategory === 4 && (
            <div className="space-y-4 border-t border-secondary-200 pt-6">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-medium text-secondary-900">
                  Category 4: Upstream Transportation
                </h3>
              </div>
              <p className="text-sm text-secondary-600">
                Transportation of purchased products from suppliers.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  label="Transport Mode"
                  options={[
                    { value: 'truck', label: 'Truck' },
                    { value: 'rail', label: 'Rail' },
                    { value: 'ship', label: 'Ship' },
                    { value: 'pipeline', label: 'Pipeline' },
                  ]}
                  placeholder="Select mode"
                />
                <Input label="Weight (tonnes)" type="number" placeholder="Enter weight" />
                <Input
                  label="Distance (km)"
                  type="number"
                  placeholder="Enter distance"
                />
                <div className="flex items-end">
                  <Button variant="outline" leftIcon={Plus}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Other Categories - Placeholder */}
          {activeCategory !== 11 && activeCategory !== 4 && (
            <div className="border-t border-secondary-200 pt-6">
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-500">
                  Detailed input form for Category {activeCategory} coming soon.
                </p>
                <p className="text-sm text-secondary-400 mt-1">
                  Focus on Category 11 for the most material O&G emissions.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
