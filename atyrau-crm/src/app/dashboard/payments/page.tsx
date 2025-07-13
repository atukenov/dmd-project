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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payments</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage and track all payment transactions for your business.
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <p className="text-center text-gray-500 dark:text-gray-400">
                The payments feature is coming soon in our next update.
              </p>
              <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
                This section will allow you to track Kaspi QR payments, view payment history, and handle refunds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

