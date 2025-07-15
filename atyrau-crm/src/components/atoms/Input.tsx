import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'search';
}

export const Input = ({
  label,
  helperText,
  error = false,
  errorMessage,
  fullWidth = false,
  icon,
  variant = 'default',
  className = '',
  ...props
}: InputProps) => {
  // Base classes using design system colors
  const baseClasses = 'bg-input-bg text-input-text placeholder-input-placeholder rounded-md px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring';
  
  // Variant classes
  const variantClasses = {
    default: 'border border-input-border focus:border-input-border-focus',
    search: 'border border-input-border focus:border-input-border-focus pl-10',
  };
  
  // Error classes using design system
  const errorClasses = error 
    ? 'border-error focus:border-error focus:ring-error/30'
    : '';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Icon classes
  const iconClasses = icon && variant !== 'search' ? 'pl-10' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-input-placeholder">{icon}</div>
          </div>
        )}
        <input
          className={`${baseClasses} ${variantClasses[variant]} ${errorClasses} ${widthClasses} ${iconClasses}`}
          {...props}
        />
      </div>
      {(helperText || errorMessage) && (
        <p className={`mt-1 text-sm ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
};

