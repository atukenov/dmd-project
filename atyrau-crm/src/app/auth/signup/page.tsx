'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormField } from '@/components/molecules/FormField';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formValues.name) {
      newErrors.name = 'Имя обязательно';
    }
    
    if (!formValues.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!formValues.phone) {
      newErrors.phone = 'Телефон обязателен';
    } else if (!/^\+?[0-9]{10,15}$/.test(formValues.phone)) {
      newErrors.phone = 'Некорректный формат телефона';
    }
    
    if (!formValues.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formValues.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }
    
    if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    if (!formValues.agreeToTerms) {
      newErrors.agreeToTerms = 'Необходимо принять условия';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          password: formValues.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка регистрации');
      }
      
      // On successful registration, redirect to verification page
      router.push('/auth/verify-email?email=' + encodeURIComponent(formValues.email));
    } catch (error: unknown) {
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Произошла ошибка при регистрации',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Регистрация</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Создайте аккаунт для использования платформы
          </p>
        </div>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormField
            id="name"
            label="Имя"
            value={formValues.name}
            onChange={handleChange}
            error={errors.name}
            required
            autoComplete="name"
          />
          
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
            id="phone"
            type="tel"
            label="Телефон"
            value={formValues.phone}
            onChange={handleChange}
            error={errors.phone}
            required
            autoComplete="tel"
          />
          
          <FormField
            id="password"
            type="password"
            label="Пароль"
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
          
          <Checkbox
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formValues.agreeToTerms}
            onChange={handleChange}
            error={errors.agreeToTerms}
            label={
              <span>
                Я согласен с{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  условиями использования
                </Link>
              </span>
            }
            className="mb-6"
          />
          
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth
            isLoading={isLoading}
          >
            Зарегистрироваться
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Уже есть аккаунт?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
              Войти
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}


