import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { NotificationProvider } from './context/NotificationContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import CalculatorPage from './pages/CalculatorPage'
import BenchmarksPage from './pages/BenchmarksPage'
import ReportsPage from './pages/ReportsPage'
import FacilitiesPage from './pages/FacilitiesPage'
import ToolsPage from './pages/ToolsPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AppProvider>
      <NotificationProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/benchmarks" element={<BenchmarksPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/facilities" element={<FacilitiesPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </HashRouter>
      </NotificationProvider>
    </AppProvider>
  )
}

export default App
