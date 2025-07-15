'use client';

import { useEffect, useState } from 'react';

export default function PaymentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-heading">Платежи</h1>
          <p className="mt-2 text-sm text-text-muted">
            Управляйте и отслеживайте все платежные транзакции вашего бизнеса.
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="bg-content-bg shadow-card overflow-hidden sm:rounded-lg p-6 border border-card-border">
            <div className="border border-card-border rounded-md p-6 bg-card-muted">
              <div className="text-center">
                <span className="text-4xl mb-4 block">💎</span>
                <h3 className="text-lg font-medium text-heading mb-2">
                  Система платежей в разработке
                </h3>
                <p className="text-text-body mb-4">
                  Функция платежей скоро появится в нашем следующем обновлении.
                </p>
                <p className="text-text-muted">
                  Этот раздел позволит отслеживать платежи Kaspi QR, просматривать историю платежей и обрабатывать возвраты.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

