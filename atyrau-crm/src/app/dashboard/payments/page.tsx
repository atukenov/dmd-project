'use client';

import { useState } from 'react';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import PaymentForm from '@/components/molecules/PaymentForm';
import PaymentHistory from '@/components/molecules/PaymentHistory';

export default function PaymentsPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handlePaymentCreated = () => {
    setShowPaymentForm(false);
    // The PaymentHistory component will automatically refresh
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-heading">Платежи</h1>
          <p className="mt-2 text-sm text-text-muted">
            Управляйте и отслеживайте все платежные транзакции вашего бизнеса.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setShowPaymentForm(true)}
            className="bg-primary hover:bg-primary-dark"
          >
            Создать платеж
          </Button>
        </div>
      </div>

      {/* Payment Stats - Placeholder for now */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-content-bg border border-card-border">
          <div className="text-sm font-medium text-text-muted">Общий доход</div>
          <div className="text-2xl font-bold text-heading">₸0.00</div>
          <div className="text-xs text-text-muted mt-1">В этом месяце</div>
        </Card>
        <Card className="p-6 bg-content-bg border border-card-border">
          <div className="text-sm font-medium text-text-muted">В ожидании</div>
          <div className="text-2xl font-bold text-warning">₸0.00</div>
          <div className="text-xs text-text-muted mt-1">Ожидают оплаты</div>
        </Card>
        <Card className="p-6 bg-content-bg border border-card-border">
          <div className="text-sm font-medium text-text-muted">Завершено</div>
          <div className="text-2xl font-bold text-success">₸0.00</div>
          <div className="text-xs text-text-muted mt-1">В этом месяце</div>
        </Card>
        <Card className="p-6 bg-content-bg border border-card-border">
          <div className="text-sm font-medium text-text-muted">Всего платежей</div>
          <div className="text-2xl font-bold text-heading">0</div>
          <div className="text-xs text-text-muted mt-1">За все время</div>
        </Card>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <PaymentForm
              onPaymentCreated={handlePaymentCreated}
              onCancel={() => setShowPaymentForm(false)}
            />
          </div>
        </div>
      )}

      {/* Payment History */}
      <PaymentHistory showActions={true} />
    </div>
  );
}
