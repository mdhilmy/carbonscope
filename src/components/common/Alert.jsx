import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const variants = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600',
  },
}

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
  action,
}) {
  const styles = variants[variant]
  const Icon = styles.icon

  return (
    <div
      className={`${styles.bg} ${styles.border} ${styles.text} border px-4 py-3 rounded-lg ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {title && <p className="font-medium">{title}</p>}
          <div className={title ? 'mt-1 text-sm' : 'text-sm'}>{children}</div>
          {action && <div className="mt-2">{action}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
