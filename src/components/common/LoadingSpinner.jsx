import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({
  size = 'md',
  className = '',
  label = 'Loading...',
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-primary-600`} />
      {label && <span className="text-sm text-secondary-600">{label}</span>}
    </div>
  )
}

export function LoadingOverlay({ label = 'Loading...' }) {
  return (
    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
      <LoadingSpinner label={label} />
    </div>
  )
}

export function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" label={label} />
    </div>
  )
}
