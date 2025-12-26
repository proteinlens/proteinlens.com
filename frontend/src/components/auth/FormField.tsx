/**
 * FormField Component
 * Feature 010 - User Signup Process
 * 
 * Reusable form field with label, input, error message, and ARIA attributes.
 * Supports various input types and accessibility requirements.
 */

import { FC, ReactNode, useId } from 'react';

interface FormFieldProps {
  /** Unique identifier for the input */
  id: string;
  /** Input name attribute */
  name: string;
  /** Input type (text, email, password, etc.) */
  type?: 'text' | 'email' | 'password' | 'tel';
  /** Label text */
  label: string;
  /** Current value */
  value: string;
  /** Called when value changes */
  onChange: (value: string) => void;
  /** Called when input loses focus */
  onBlur?: () => void;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Autocomplete attribute */
  autoComplete?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Helper text below the input */
  helperText?: string;
  /** Element to render at the end of the input */
  endAdornment?: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Accessible form field with label, input, and error handling.
 */
export const FormField: FC<FormFieldProps> = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  autoComplete,
  placeholder,
  disabled = false,
  helperText,
  endAdornment,
  className = '',
}) => {
  const errorId = useId();
  const helperId = useId();
  
  const hasError = !!error;
  const describedBy = [
    hasError ? errorId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`block text-sm font-medium ${hasError ? 'text-red-700' : 'text-gray-700'}`}
      >
        {label}
        {required && (
          <span className="text-red-500" aria-hidden="true"> *</span>
        )}
      </label>

      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={`block w-full rounded-lg border px-4 py-3 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50 ${
            hasError
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
          } ${endAdornment ? 'pr-10' : ''}`}
        />
        
        {/* End adornment (e.g., show/hide password button) */}
        {endAdornment}

        {/* Error icon */}
        {hasError && !endAdornment && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p
          id={errorId}
          className="mt-2 flex items-center gap-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="h-4 w-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !hasError && (
        <p id={helperId} className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default FormField;
