import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '../components/common/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-12">
      <div className="text-8xl font-bold text-secondary-200 mb-4">404</div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-2">Page Not Found</h1>
      <p className="text-secondary-600 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.history.back()} leftIcon={ArrowLeft}>
          Go Back
        </Button>
        <Link to="/">
          <Button leftIcon={Home}>Home</Button>
        </Link>
      </div>
    </div>
  )
}
