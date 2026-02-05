import Header from './Header'
import Sidebar from './Sidebar'
import MobileMenu from './MobileMenu'
import NotificationContainer from '../common/NotificationContainer'
import { useApp } from '../../context/AppContext'

export default function Layout({ children }) {
  const { isOffline } = useApp()

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      {/* Offline indicator */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-center py-1 text-sm">
          You are currently offline. Some features may be limited.
        </div>
      )}

      <div className="flex pt-16">
        <Sidebar />

        <main className="flex-1 lg:ml-64 p-4 md:p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <MobileMenu />
      <NotificationContainer />
    </div>
  )
}
