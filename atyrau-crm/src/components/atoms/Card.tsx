import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  bordered?: boolean;
  padding?: 'none' | 'small' | 'normal' | 'large';
  hoverable?: boolean;
}

export const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  bordered = true,
  padding = 'normal',
  hoverable = false,
}: CardProps) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-3',
    normal: 'p-5',
    large: 'p-6',
  };
  
  // Using design system colors
  const borderClasses = bordered ? 'border border-card-border' : '';
  const hoverClasses = hoverable ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';
  const baseClasses = 'bg-card-bg rounded-lg shadow-card';

  return (
    <div className={`${baseClasses} ${borderClasses} ${hoverClasses} ${className}`}>
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-card-border">
          {title && <h3 className="text-lg font-medium text-text">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        </div>
      )}
      
      <div className={paddingClasses[padding]}>
        {children}
      </div>
      
      {footer && (
        <div className="px-5 py-4 bg-gray-50 border-t border-card-border rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

