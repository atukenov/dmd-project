'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';

interface FormValues {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formValues.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formValues.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }
    
    if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
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
    
    if (!token) {
      setErrors({
        general: 'Отсутствует токен сброса пароля. Пожалуйста, проверьте ссылку.',
      });
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formValues.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Произошла ошибка');
      }
      
      // On success, show the message
      setIsSubmitted(true);
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Произошла ошибка при сбросе пароля',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !errors.general) {
    setErrors({
      general: 'Отсутствует токен сброса пароля. Пожалуйста, проверьте ссылку.',
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Сброс пароля</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Введите новый пароль
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
              Ваш пароль успешно сброшен!
            </div>
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
              Перейти на страницу входа
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormField
              id="password"
              type="password"
              label="Новый пароль"
              value={formValues.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="new-password"
            />
            
            <FormField
              id="confirmPassword"
              type="password"
              label="Подтвердите пароль"
              value={formValues.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
              isLoading={isLoading}
              className="mt-4"
            >
              Сбросить пароль
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
