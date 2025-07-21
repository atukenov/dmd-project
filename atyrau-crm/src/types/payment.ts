// Payment-related TypeScript interfaces and types

export interface Payment {
  _id?: string;
  id?: string;

  // Core payment information
  amount: number;
  currency: "KZT" | "USD" | "EUR";
  description?: string;

  // Payment status and lifecycle
  status: PaymentStatus;
  paymentMethod: PaymentMethod;

  // Relationships
  businessId: string;
  appointmentId?: string;
  clientId?: string;

  // Transaction details
  transactionId?: string; // External transaction ID (Kaspi, etc.)
  referenceId?: string; // Internal reference ID (auto-generated)

  // QR Code information
  qrCode?: string; // QR code content/URL
  qrCodeExpiry?: Date;

  // Provider-specific data
  providerData?: {
    kaspi?: {
      merchantId?: string;
      terminalId?: string;
      orderId?: string;
    };
    manual?: {
      receivedBy?: string;
      notes?: string;
    };
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;

  // Metadata
  metadata?: Record<string, unknown>;
}

export type PaymentStatus =
  | "pending" // Payment created, waiting for payment
  | "processing" // Payment in progress
  | "completed" // Payment successful
  | "failed" // Payment failed
  | "cancelled" // Payment cancelled
  | "refunded" // Payment refunded
  | "expired"; // Payment link/QR expired

export type PaymentMethod =
  | "kaspi_qr" // Kaspi QR payment
  | "cash" // Cash payment
  | "card" // Card payment (future)
  | "bank_transfer"; // Bank transfer (future)

export interface PaymentCreateRequest {
  amount: number;
  currency?: "KZT" | "USD" | "EUR";
  description?: string;
  paymentMethod: PaymentMethod;
  businessId: string;
  appointmentId?: string;
  clientId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentUpdateRequest {
  status?: PaymentStatus;
  transactionId?: string;
  paidAt?: Date;
  providerData?: Payment["providerData"];
  metadata?: Record<string, unknown>;
}

export interface PaymentFilters {
  businessId?: string;
  appointmentId?: string;
  clientId?: string;
  status?: PaymentStatus | PaymentStatus[];
  paymentMethod?: PaymentMethod | PaymentMethod[];
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}

export interface PaymentStats {
  totalAmount: number;
  totalCount: number;
  completedAmount: number;
  completedCount: number;
  pendingAmount: number;
  pendingCount: number;
  refundedAmount: number;
  refundedCount: number;
  currency: string;
}

// QR Code related interfaces
export interface QRCodeData {
  paymentId: string;
  amount: number;
  currency: string;
  description?: string;
  expiresAt: Date;
  businessName: string;
}

export interface QRCodeGenerationRequest {
  paymentId: string;
  amount: number;
  currency?: string;
  description?: string;
  expiryMinutes?: number; // Default: 30 minutes
}

// Webhook/Notification interfaces
export interface PaymentWebhook {
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: Date;
  providerData?: Record<string, unknown>;
  signature?: string; // For verification
}
