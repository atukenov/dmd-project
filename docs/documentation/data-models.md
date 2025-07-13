# Data Models Documentation

This document outlines the core data models used in the Atyrau Business Platform application.

## Core Models

### User

Represents a user account in the system.

```typescript
interface User {
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
```

### Business

Represents a business entity.

```typescript
interface Business {
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
```

### Service

Represents a service offered by a business.

```typescript
interface Service {
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
```

### Working Hours

Represents the business operating hours.

```typescript
interface WorkingHours {
  day: number; // 0-6, where 0 is Sunday
  isOpen: boolean;
  openTime?: string; // Format: "HH:MM" (24-hour)
  closeTime?: string; // Format: "HH:MM" (24-hour)
  breaks?: {
    startTime: string;
    endTime: string;
  }[];
}
```

### Appointment

Represents a client appointment.

```typescript
interface Appointment {
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
```

### Payment

Represents a payment transaction.

```typescript
interface Payment {
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
```

## Relationships

1. **User → Business**: One-to-one. A user with role "business" can be associated with exactly one business (via `businessId` field).
2. **Business → Services**: One-to-many. A business can offer multiple services (services reference the `businessId`).
3. **Business → Appointments**: One-to-many. A business can have multiple appointments.
4. **Service → Appointments**: One-to-many. A service can be booked multiple times in different appointments.
5. **Appointment → Payment**: One-to-one. An appointment has exactly one payment record.

## Collections

The MongoDB database uses the following collections:

- `users`: Stores user accounts
- `businesses`: Stores business profiles
- `services`: Stores services offered by businesses
- `appointments`: Stores client appointments
- `payments`: Stores payment records

## Notes

- All dates are stored in UTC format
- ObjectId is used for document IDs and references
- The time format for working hours and appointments is "HH:MM" in 24-hour format
- The `active` field in services determines if a service is currently offered
