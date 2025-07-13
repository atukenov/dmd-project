import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        default: "Atyrau",
      },
      zipCode: {
        type: String,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    contact: {
      phone: {
        type: String,
      },
      email: {
        type: String,
      },
      website: {
        type: String,
      },
    },
    workingHours: {
      monday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" },
      },
      tuesday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" },
      },
      wednesday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" },
      },
      thursday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" },
      },
      friday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" },
      },
      saturday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "10:00" },
        close: { type: String, default: "16:00" },
      },
      sunday: {
        isOpen: { type: Boolean, default: false },
        open: { type: String, default: "10:00" },
        close: { type: String, default: "16:00" },
      },
    },
    category: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    kaspiQr: {
      type: String,
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
    timestamps: true,
  }
);

export default mongoose.models.Business ||
  mongoose.model("Business", BusinessSchema);

