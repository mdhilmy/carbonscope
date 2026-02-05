import { forwardRef } from 'react'

const Input = forwardRef(
  ({ label, error, helperText, className = '', id, required, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2 border rounded-lg transition-colors outline-none
            ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
            }
            focus:ring-2
            disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-secondary-500">
            {helperText}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
