import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  bordered?: boolean;
  padding?: 'none' | 'small' | 'normal' | 'large';
}

export const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  bordered = true,
  padding = 'normal',
}: CardProps) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-3',
    normal: 'p-5',
    large: 'p-6',
  };
  
  const borderClasses = bordered ? 'border border-gray-200' : '';

  return (
    <div className={`bg-white rounded-lg shadow-sm ${borderClasses} ${className}`}>
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      <div className={paddingClasses[padding]}>
        {children}
      </div>
      
      {footer && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

