import { ObjectId } from "mongodb";

/**
 * Represents a user in the system
 */
export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string; // Hashed with bcrypt
  role: "admin" | "business" | "client";
  emailVerified?: Date;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents a business entity
 */
export interface Business {
  id?: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  contacts: {
    phone: string;
    email: string;
  };
  address: {
    street: string;
    building: string;
    city: string;
    postalCode: string;
    landmark?: string;
  };
  workingHours: WorkingHours[];
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
  };
  photos?: {
    logo?: string;
    coverImage?: string;
    gallery?: string[];
  };
  features?: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  settings?: {
    appointmentLeadTime?: number;
    appointmentBuffer?: number;
    allowCancellation?: boolean;
    cancellationPeriod?: number;
    notificationPreferences?: {
      email?: boolean;
      sms?: boolean;
      telegram?: boolean;
    };
  };
  kaspiQrLink?: string;
}

/**
 * Represents a service offered by a business
 */
export interface Service {
  id?: string;
  businessId: string;
  name: string;
  description: string;
  duration: number; // Duration in minutes
  price: number;
  category: string;
  image?: string; // URL to service image
  isActive: boolean; // Whether service is currently available
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents the working hours for a business
 */
export interface WorkingHours {
  day: number; // 0-6, where 0 is Sunday
  isOpen: boolean;
  openTime: string; // Format: "HH:MM" (24-hour)
  closeTime: string; // Format: "HH:MM" (24-hour)
  breaks?: Array<{
    startTime: string;
    endTime: string;
  }>;
}

/**
 * Represents a client appointment
 */
export interface Appointment {
  _id?: ObjectId;
  businessId: ObjectId;
  clientId?: ObjectId;
  serviceId: ObjectId;
  date: Date;
  startTime: string; // Format: "HH:MM" (24-hour)
  endTime: string; // Format: "HH:MM" (24-hour)
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a payment transaction
 */
export interface Payment {
  _id?: ObjectId;
  businessId: ObjectId;
  appointmentId: ObjectId;
  clientId?: ObjectId;
  amount: number;
  method: "cash" | "kaspi" | "card" | "other";
  status: "pending" | "completed" | "failed" | "refunded";
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

