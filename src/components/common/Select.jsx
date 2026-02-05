import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      className = '',
      placeholder = 'Select an option',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-2 border rounded-lg transition-colors appearance-none outline-none pr-10
              ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
              }
              focus:ring-2
              disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
        </div>
        {helperText && !error && (
          <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
