'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';

function VerifyEmailPageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const email = searchParams?.get('email') || '';
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Verify token on page load if available
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      // No token, just showing the "check your email" message
      setStatus('loading');
      setMessage('');
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка верификации');
      }
      
      setStatus('success');
      setMessage('Ваш email успешно подтвержден!');
    } catch (error: unknown) {
      setStatus('error');
      setMessage(error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Ошибка верификации email');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Email не указан');
      return;
    }
    
    setIsResending(true);
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка отправки');
      }
      
      setMessage('Письмо с подтверждением отправлено повторно. Пожалуйста, проверьте вашу почту.');
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Ошибка отправки письма');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Подтверждение Email</h1>
        </div>
        
        {status === 'loading' && !token && (
          <div className="text-center">
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Письмо с подтверждением отправлено на адрес <strong>{email}</strong>.
              Пожалуйста, проверьте вашу почту и нажмите на ссылку в письме.
            </p>
            
            <div className="mb-6">
              <Button 
                onClick={handleResendVerification}
                variant="secondary" 
                isLoading={isResending}
              >
                Отправить повторно
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Не получили письмо? Проверьте папку &ldquo;Спам&rdquo; или используйте кнопку выше для повторной отправки.
            </p>
          </div>
        )}
        
        {status === 'loading' && token && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Проверка вашего email...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
            <Button
              onClick={() => router.push('/auth/signin')}
              variant="primary"
              fullWidth
            >
              Войти в аккаунт
            </Button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {message}
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleResendVerification}
                variant="secondary"
                isLoading={isResending}
              >
                Отправить ссылку повторно
              </Button>
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                Вернуться на страницу входа
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}




export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">????????...</div>}>
      <VerifyEmailPageForm />
    </Suspense>
  );
}
