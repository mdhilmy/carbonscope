export default function Card({
  children,
  className = '',
  padding = 'p-6',
  hover = false,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-secondary-200 ${padding} ${
        hover ? 'hover:shadow-md transition-shadow' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-secondary-200 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-secondary-900 ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-secondary-500 mt-1 ${className}`}>{children}</p>
  )
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`border-t border-secondary-200 pt-4 mt-4 flex items-center justify-end gap-3 ${className}`}
    >
      {children}
    </div>
  )
}
