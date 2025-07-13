'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';

interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formValues.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!formValues.password) {
      newErrors.password = 'Пароль обязателен';
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
      const result = await signIn('credentials', {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
      });
      
      if (result?.error) {
        throw new Error('Неверный email или пароль');
      }
      
      router.push(callbackUrl);
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Ошибка при входе',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Вход в аккаунт</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Введите ваш email и пароль
          </p>
        </div>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}
        
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
          
          <FormField
            id="password"
            type="password"
            label="Пароль"
            value={formValues.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="current-password"
          />
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Запомнить меня
              </label>
            </div>
            
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Забыли пароль?
            </Link>
          </div>
          
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth
            isLoading={isLoading}
          >
            Войти
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Нет аккаунта?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
