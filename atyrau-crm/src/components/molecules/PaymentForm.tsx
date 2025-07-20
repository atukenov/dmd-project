'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/atoms/Card';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { Payment, PaymentMethod } from '@/types/payment';

interface PaymentFormProps {
  appointmentId?: string;
  clientId?: string;
  defaultAmount?: number;
  onPaymentCreated?: (payment: Payment) => void;
  onCancel?: () => void;
}

export default function PaymentForm({
  appointmentId,
  clientId,
  defaultAmount = 0,
  onPaymentCreated,
  onCancel
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: defaultAmount.toString(),
    currency: 'KZT',
    description: '',
    paymentMethod: 'cash' as PaymentMethod
  });

  const { addNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          appointmentId,
          clientId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      addNotification({
        type: 'success',
        title: 'Payment Created',
        message: `Payment of ${formData.amount} ${formData.currency} has been created successfully.`
      });

      if (onPaymentCreated) {
        onPaymentCreated(data.payment);
      }

      // Reset form
      setFormData({
        amount: '',
        currency: 'KZT',
        description: '',
        paymentMethod: 'cash'
      });

    } catch (error) {
      console.error('Error creating payment:', error);
      addNotification({
        type: 'error',
        title: 'Payment Error',
        message: error instanceof Error ? error.message : 'Failed to create payment'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create Payment</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create a new payment record for tracking
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount and Currency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="KZT">KZT</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method *
          </label>
          <select
            id="paymentMethod"
            value={formData.paymentMethod}
            onChange={(e) => handleChange('paymentMethod', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={loading}
          >
            <option value="cash">Cash</option>
            <option value="kaspi_qr">Kaspi QR</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Payment description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading || !formData.amount}>
            {loading ? 'Creating...' : 'Create Payment'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
