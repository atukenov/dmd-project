import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  variant?: 'outline' | 'filled';
}

export const Input = ({
  label,
  helperText,
  error = false,
  fullWidth = false,
  icon,
  variant = 'outline',
  className = '',
  ...props
}: InputProps) => {
  // Base classes
  const baseClasses = 'block w-full rounded-md shadow-sm text-gray-900 placeholder-gray-400 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  
  // Variant classes
  const variantClasses = {
    outline: 'border border-gray-300 focus:border-blue-500',
    filled: 'bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500',
  };
  
  // Error classes
  const errorClasses = error 
    ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : '';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Icon classes
  const iconClasses = icon ? 'pl-10' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`${baseClasses} ${variantClasses[variant]} ${errorClasses} ${widthClasses} ${iconClasses} py-2 px-3`}
          {...props}
        />
      </div>
      {helperText && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};
