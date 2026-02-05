import { Link } from 'react-router-dom'
import { Leaf, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isOffline } = useApp()

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-secondary-200 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-secondary-900">CarbonScope</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className="hidden sm:flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isOffline ? 'bg-amber-500' : 'bg-green-500'
              }`}
            />
            <span className="text-sm text-secondary-600">
              {isOffline ? 'Offline' : 'Online'}
            </span>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  )
}
