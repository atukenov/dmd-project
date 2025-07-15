import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional since clients can be created without user accounts
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    notes: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    preferences: {
      preferredTime: {
        type: String,
      },
      communicationMethod: {
        type: String,
        enum: ["phone", "email", "telegram", "whatsapp"],
        default: "phone",
      },
    },
    totalVisits: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastVisit: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This automatically handles createdAt and updatedAt
  }
);

// Create compound index for efficient queries
ClientSchema.index({ businessId: 1, phone: 1 }, { unique: true });
ClientSchema.index({ businessId: 1, email: 1 });
ClientSchema.index({ businessId: 1, name: 1 });

// Pre-save middleware to update the updatedAt field
ClientSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
