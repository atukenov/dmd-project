'use client';

import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = ({ 
  label, 
  error, 
  className = '',
  ...props 
}: CheckboxProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="flex items-start cursor-pointer">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
              error ? 'border-red-500' : ''
            }`}
            {...props}
          />
        </div>
        <div className="ml-2 text-sm">
          {label}
        </div>
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
