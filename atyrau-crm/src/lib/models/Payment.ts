import mongoose from "mongoose";
import { Payment } from "@/types/payment";

const paymentSchema = new mongoose.Schema<Payment>(
  {
    // Core payment information
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["KZT", "USD", "EUR"],
      default: "KZT",
    },
    description: {
      type: String,
      trim: true,
    },

    // Payment status and lifecycle
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
        "expired",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["kaspi_qr", "cash", "card", "bank_transfer"],
      required: true,
    },

    // Relationships
    businessId: {
      type: String,
      required: true,
      index: true,
    },
    appointmentId: {
      type: String,
      index: true,
    },
    clientId: {
      type: String,
      index: true,
    },

    // Transaction details
    transactionId: {
      type: String,
      sparse: true, // Allow multiple null values but unique non-null values
      index: true,
    },
    referenceId: {
      type: String,
      unique: true,
      index: true,
    },

    // QR Code information
    qrCode: {
      type: String,
    },
    qrCodeExpiry: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // Automatic cleanup of expired QR codes
    },

    // Provider-specific data
    providerData: {
      kaspi: {
        merchantId: String,
        terminalId: String,
        orderId: String,
      },
      manual: {
        receivedBy: String,
        notes: String,
      },
    },

    // Timestamps
    paidAt: {
      type: Date,
      index: true,
    },

    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: function (_doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
paymentSchema.index({ businessId: 1, status: 1 });
paymentSchema.index({ businessId: 1, createdAt: -1 });
paymentSchema.index({ businessId: 1, paymentMethod: 1 });
paymentSchema.index({ businessId: 1, appointmentId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Virtual for formatted amount
paymentSchema.virtual("formattedAmount").get(function (this: Payment) {
  return `${this.amount.toFixed(2)} ${this.currency}`;
});

// Virtual to check if payment is active/pending
paymentSchema.virtual("isActive").get(function (this: Payment) {
  return ["pending", "processing"].includes(this.status);
});

// Virtual to check if QR code is expired
paymentSchema.virtual("isQRExpired").get(function (this: Payment) {
  return this.qrCodeExpiry ? new Date() > this.qrCodeExpiry : false;
});

// Pre-save middleware to generate reference ID
paymentSchema.pre("save", function (this: Payment, next) {
  if (!this.referenceId) {
    // Generate a unique reference ID
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    this.referenceId = `PAY-${timestamp}-${randomStr}`.toUpperCase();
  }
  next();
});

// Static methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
paymentSchema.statics.findByBusiness = function (
  businessId: string,
  filters: Record<string, any> = {}
) {
  return this.find({ businessId, ...filters });
};

paymentSchema.statics.findActivePayments = function (businessId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {
    status: { $in: ["pending", "processing"] },
  };
  if (businessId) {
    query.businessId = businessId;
  }
  return this.find(query);
};

paymentSchema.statics.getPaymentStats = function (
  businessId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchStage: Record<string, any> = { businessId: businessId };

  if (dateFrom || dateTo) {
    matchStage.createdAt = {};
    if (dateFrom) matchStage.createdAt.$gte = dateFrom;
    if (dateTo) matchStage.createdAt.$lte = dateTo;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$currency",
        totalAmount: { $sum: "$amount" },
        totalCount: { $sum: 1 },
        completedAmount: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0],
          },
        },
        completedCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
        pendingAmount: {
          $sum: {
            $cond: [
              { $in: ["$status", ["pending", "processing"]] },
              "$amount",
              0,
            ],
          },
        },
        pendingCount: {
          $sum: {
            $cond: [{ $in: ["$status", ["pending", "processing"]] }, 1, 0],
          },
        },
        refundedAmount: {
          $sum: {
            $cond: [{ $eq: ["$status", "refunded"] }, "$amount", 0],
          },
        },
        refundedCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "refunded"] }, 1, 0],
          },
        },
      },
    },
  ]);
};

const PaymentModel =
  mongoose.models.Payment || mongoose.model<Payment>("Payment", paymentSchema);

export default PaymentModel;
