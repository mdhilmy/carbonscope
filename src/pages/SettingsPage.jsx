import { useState, useEffect } from 'react'
import { Key, Globe, Gauge, RefreshCw, Trash2, Check, AlertCircle } from 'lucide-react'
import Card, { CardTitle, CardDescription } from '../components/common/Card'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Button from '../components/common/Button'
import Alert from '../components/common/Alert'
import { useApp } from '../context/AppContext'
import { useNotification } from '../context/NotificationContext'
import { STORAGE_KEYS, GWP_VERSIONS, API_KEY_NAMES } from '../utils/constants'

const regionOptions = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'EU', label: 'European Union' },
]

const gwpOptions = [
  { value: GWP_VERSIONS.AR5, label: 'IPCC AR5 (2014) - Most Common' },
  { value: GWP_VERSIONS.AR6, label: 'IPCC AR6 (2021) - Latest' },
]

const unitOptions = [
  { value: 'metric', label: 'Metric (tonnes, km, liters)' },
  { value: 'imperial', label: 'Imperial (tons, miles, gallons)' },
]

export default function SettingsPage() {
  const { settings, updateSettings } = useApp()
  const { notify } = useNotification()

  const [apiKeys, setApiKeys] = useState({
    eia: '',
    electricityMaps: '',
  })
  const [savedKeys, setSavedKeys] = useState({
    eia: false,
    electricityMaps: false,
  })

  // Load API keys on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.API_KEYS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSavedKeys({
          eia: !!parsed.eia?.key,
          electricityMaps: !!parsed.electricityMaps?.key,
        })
      }
    } catch (error) {
      console.warn('Failed to load API keys:', error)
    }
  }, [])

  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value })
    notify.success(`${key} updated successfully`)
  }

  const handleSaveApiKey = (apiName, key) => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.API_KEYS) || '{}')

      if (key.trim()) {
        stored[apiName] = {
          key: key.trim(),
          addedAt: new Date().toISOString(),
        }
        setSavedKeys(prev => ({ ...prev, [apiName]: true }))
        notify.success(`${apiName.toUpperCase()} API key saved. Features using this API will now use live data.`)
      } else {
        delete stored[apiName]
        setSavedKeys(prev => ({ ...prev, [apiName]: false }))
        notify.info(`${apiName.toUpperCase()} API key removed. Features will use fallback data.`)
      }

      localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(stored))
      setApiKeys(prev => ({ ...prev, [apiName]: '' }))

      // Dispatch custom event to notify components to reload
      window.dispatchEvent(new CustomEvent('apiKeyChanged', { detail: { apiName } }))
    } catch (error) {
      notify.error('Failed to save API key')
    }
  }

  const handleClearApiKey = (apiName) => {
    handleSaveApiKey(apiName, '')
  }

  const handleClearAllData = () => {
    if (window.confirm('This will delete all your saved facilities, calculations, and settings. This cannot be undone. Continue?')) {
      localStorage.removeItem(STORAGE_KEYS.FACILITIES)
      localStorage.removeItem(STORAGE_KEYS.CALCULATIONS)
      localStorage.removeItem(STORAGE_KEYS.SETTINGS)
      notify.success('All data cleared successfully')
      window.location.reload()
    }
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-2">Settings</h1>
      <p className="text-secondary-600 mb-6">
        Configure application preferences and API integrations
      </p>

      <div className="space-y-6">
        {/* Calculation Preferences */}
        <Card>
          <CardTitle>Calculation Preferences</CardTitle>
          <CardDescription>
            Default settings for emission calculations
          </CardDescription>

          <div className="mt-4 space-y-4">
            <Select
              label="Default Region"
              options={regionOptions}
              value={settings.defaultRegion}
              onChange={(e) => handleSettingChange('defaultRegion', e.target.value)}
              helperText="Used for grid emission factors and regulatory thresholds"
            />
            <Select
              label="GWP Version"
              options={gwpOptions}
              value={settings.gwpVersion}
              onChange={(e) => handleSettingChange('gwpVersion', e.target.value)}
              helperText="Global Warming Potential values for CO2e calculations"
            />
            <Select
              label="Unit System"
              options={unitOptions}
              value={settings.units}
              onChange={(e) => handleSettingChange('units', e.target.value)}
              helperText="Display units throughout the application"
            />
          </div>
        </Card>

        {/* API Keys */}
        <Card>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure optional API keys for enhanced features
          </CardDescription>

          <Alert variant="info" className="mt-4">
            API keys are optional. Without them, the app uses built-in fallback data.
            When configured, features automatically use live API data.
          </Alert>

          <div className="mt-4 space-y-6">
            {/* EIA API */}
            <div className="border-b border-secondary-200 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-secondary-500" />
                <span className="font-medium">EIA API</span>
                {savedKeys.eia && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Configured
                  </span>
                )}
              </div>
              <p className="text-sm text-secondary-500 mb-3">
                US Energy Information Administration - Enhanced US energy data.{' '}
                <a
                  href="https://www.eia.gov/opendata/register.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Get free API key
                </a>
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder={savedKeys.eia ? '••••••••••••••••' : 'Enter EIA API key'}
                  type="password"
                  value={apiKeys.eia}
                  onChange={(e) => setApiKeys({ ...apiKeys, eia: e.target.value })}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSaveApiKey('eia', apiKeys.eia)}
                  disabled={!apiKeys.eia.trim()}
                >
                  Save
                </Button>
                {savedKeys.eia && (
                  <Button variant="ghost" onClick={() => handleClearApiKey('eia')}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* ElectricityMaps API */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-secondary-500" />
                <span className="font-medium">ElectricityMaps API</span>
                {savedKeys.electricityMaps && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Configured
                  </span>
                )}
              </div>
              <p className="text-sm text-secondary-500 mb-3">
                Real-time grid carbon intensity for 50+ countries.{' '}
                <a
                  href="https://www.electricitymaps.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Get API key
                </a>
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder={savedKeys.electricityMaps ? '••••••••••••••••' : 'Enter ElectricityMaps API key'}
                  type="password"
                  value={apiKeys.electricityMaps}
                  onChange={(e) => setApiKeys({ ...apiKeys, electricityMaps: e.target.value })}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSaveApiKey('electricityMaps', apiKeys.electricityMaps)}
                  disabled={!apiKeys.electricityMaps.trim()}
                >
                  Save
                </Button>
                {savedKeys.electricityMaps && (
                  <Button variant="ghost" onClick={() => handleClearApiKey('electricityMaps')}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Manage your local data and storage
          </CardDescription>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900">Clear All Data</p>
                <p className="text-sm text-secondary-500">
                  Delete all saved facilities, calculations, and settings
                </p>
              </div>
              <Button variant="danger" onClick={handleClearAllData}>
                Clear Data
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
