import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'font-medium rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
      secondary:
        'bg-secondary-100 hover:bg-secondary-200 text-secondary-700 focus:ring-secondary-500',
      outline:
        'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
      ghost:
        'text-secondary-600 hover:bg-secondary-100 focus:ring-secondary-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      success:
        'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    }

    const sizes = {
      xs: 'py-1 px-2 text-xs',
      sm: 'py-1.5 px-3 text-sm',
      md: 'py-2 px-4 text-base',
      lg: 'py-3 px-6 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          LeftIcon && <LeftIcon className="w-4 h-4 mr-2" />
        )}
        {children}
        {!loading && RightIcon && <RightIcon className="w-4 h-4 ml-2" />}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
