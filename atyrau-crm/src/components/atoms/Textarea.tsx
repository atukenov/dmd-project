import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export const Textarea = ({
  label,
  helperText,
  error = false,
  errorMessage,
  fullWidth = false,
  resize = 'vertical',
  className = '',
  ...props
}: TextareaProps) => {
  // Base classes using design system colors
  const baseClasses = 'bg-input-bg text-input-text placeholder-input-placeholder rounded-md px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring min-h-[100px]';
  
  // Border classes
  const borderClasses = error 
    ? 'border border-error focus:border-error focus:ring-error/30'
    : 'border border-input-border focus:border-input-border-focus';
  
  // Resize classes
  const resizeClasses = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text mb-1">
          {label}
        </label>
      )}
      <textarea
        className={`${baseClasses} ${borderClasses} ${resizeClasses[resize]} ${widthClasses}`}
        {...props}
      />
      {(helperText || errorMessage) && (
        <p className={`mt-1 text-sm ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
};
