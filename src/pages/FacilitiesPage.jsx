import { useState } from 'react'
import { Building2, Plus, MapPin, Calendar } from 'lucide-react'
import Card, { CardTitle } from '../components/common/Card'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import Modal, { ModalFooter } from '../components/common/Modal'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import { FACILITY_TYPES, FACILITY_TYPE_LABELS } from '../utils/constants'

const facilityTypeOptions = Object.entries(FACILITY_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

const regionOptions = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'OTHER', label: 'Other' },
]

export default function FacilitiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [facilities, setFacilities] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    region: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newFacility = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    }
    setFacilities([...facilities, newFacility])
    setFormData({ name: '', type: '', region: '' })
    setIsModalOpen(false)
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Facilities</h1>
          <p className="text-secondary-600">
            Manage your operational facilities and assets
          </p>
        </div>
        <Button leftIcon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Facility
        </Button>
      </div>

      {facilities.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No facilities added"
            description="Add your first facility to start tracking emissions across your operations."
            actionLabel="Add Facility"
            onAction={() => setIsModalOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((facility) => (
            <Card key={facility.id} hover className="cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-secondary-900 truncate">
                    {facility.name}
                  </h3>
                  <p className="text-sm text-secondary-500">
                    {FACILITY_TYPE_LABELS[facility.type] || facility.type}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-secondary-400 mt-2">
                    <MapPin className="w-3 h-3" />
                    <span>{facility.region}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Facility Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Facility"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Facility Name"
              placeholder="e.g., Permian Basin Platform A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              label="Facility Type"
              options={facilityTypeOptions}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            />
            <Select
              label="Region"
              options={regionOptions}
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              required
            />
          </div>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Facility</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
