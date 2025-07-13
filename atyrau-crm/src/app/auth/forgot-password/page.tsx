'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';

interface FormValues {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formValues.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formValues.email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Произошла ошибка');
      }
      
      // On success, show the message
      setIsSubmitted(true);
    } catch (error: unknown) {
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Произошла ошибка',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Восстановление пароля</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Введите ваш email для получения инструкций
          </p>
        </div>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}
        
        {isSubmitted ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Инструкции по восстановлению пароля отправлены на ваш email.
            </div>
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
              Вернуться на страницу входа
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormField
              id="email"
              type="email"
              label="Email"
              value={formValues.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
              isLoading={isLoading}
              className="mt-4"
            >
              Отправить инструкции
            </Button>
            
            <div className="mt-6 text-center">
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                Вернуться на страницу входа
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}


