import { FileQuestion } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-secondary-400" />
      </div>
      {title && (
        <h3 className="text-lg font-medium text-secondary-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-secondary-500 max-w-md mx-auto mb-6">{description}</p>
      )}
      {action && action}
      {!action && actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
