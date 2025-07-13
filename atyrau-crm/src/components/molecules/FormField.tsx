'use client';

import React from 'react';
import { Input } from '@/components/atoms/Input';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  autoComplete?: string;
}

export const FormField = ({
  id,
  label,
  type = 'text',
  placeholder,
  required = false,
  error,
  value,
  onChange,
  onBlur,
  icon,
  autoComplete,
}: FormFieldProps) => {
  return (
    <div className="mb-4">
      <Input
        id={id}
        name={id}
        type={type}
        label={label}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={!!error}
        helperText={error}
        icon={icon}
        autoComplete={autoComplete}
        className="w-full"
      />
    </div>
  );
};

