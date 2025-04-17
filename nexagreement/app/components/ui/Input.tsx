import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode, forwardRef } from 'react';

// Input Component
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-white font-medium mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-glass w-full ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-white font-medium mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`input-glass w-full ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select Component
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-white font-medium mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`input-glass w-full ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select'; 