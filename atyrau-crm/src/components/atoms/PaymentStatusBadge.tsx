'use client';

import { PaymentStatus } from '@/types/payment';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 border-red-200'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  expired: {
    label: 'Expired',
    className: 'bg-orange-100 text-orange-800 border-orange-200'
  }
};

export default function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${config.className}
      ${className}
    `}>
      {config.label}
    </span>
  );
}
