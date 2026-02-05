import { useNotification } from '../../context/NotificationContext'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
}

const styleMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColorMap = {
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
  info: 'text-blue-600',
}

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type] || Info
        const styles = styleMap[notification.type] || styleMap.info
        const iconColor = iconColorMap[notification.type] || iconColorMap.info

        return (
          <div
            key={notification.id}
            className={`${styles} border px-4 py-3 rounded-lg shadow-lg animate-slideUp`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                {notification.title && (
                  <p className="font-medium">{notification.title}</p>
                )}
                <p className={notification.title ? 'mt-1 text-sm' : 'text-sm'}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
