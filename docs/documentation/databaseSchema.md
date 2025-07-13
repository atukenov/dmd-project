# Database Schema

## Overview

The Local Business Platform — Атырау uses MongoDB as its primary database. MongoDB was chosen for its flexibility, scalability, and schema-less nature, which allows for rapid development and iteration. The database schema is designed to support all the core functionality of the platform, including user management, business profiles, appointments, services, and client management.

## Collections

### Users Collection

Stores information about all users of the platform, including authentication details and role information.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,      // Hashed with bcrypt
  role: String,          // 'admin', 'business', or 'client'
  emailVerified: Date,   // When the email was verified
  image: String,         // Profile image URL
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:

- `email`: unique index
- `role`: for role-based queries
- `businessId`: for retrieving all users associated with a business

### Businesses Collection

Contains details about each business registered on the platform.

```javascript
{
  _id: ObjectId,
  userId: String,     // Reference to user who owns this business
  name: String,
  category: String,   // Business category
  description: String,
  contacts: {
    phone: String,
    email: String
  },
  address: {
    street: String,
    building: String,
    city: String,
    postalCode: String,
    landmark: String
  },
  workingHours: [
    {
      day: Number,       // 0-6, where 0 is Sunday
      isOpen: Boolean,
      openTime: String,  // Format: "HH:MM" (24-hour)
      closeTime: String, // Format: "HH:MM" (24-hour)
      breaks: [
        {
          startTime: String,
          endTime: String
        }
      ]
    }
  ],
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
    whatsapp: String
  },
  photos: {
    logo: String,        // URL to logo image
    coverImage: String,  // URL to cover image
    gallery: [String]    // URLs to gallery images
  },
  features: [String],    // Array of available features
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  settings: {
    appointmentLeadTime: Number,  // Minimum time before booking (minutes)
    appointmentBuffer: Number,     // Buffer between appointments (minutes)
    allowCancellation: Boolean,
    cancellationPeriod: Number,    // How long before can cancel (hours)
    notificationPreferences: {
      email: Boolean,
      sms: Boolean,
      telegram: Boolean
    }
  },
  kaspiQrLink: String  // Link to Kaspi QR payment
}
```

#### Indexes:

- `ownerId`: for retrieving businesses by owner
- `category`: for category-based searches
- `isActive`: for filtering active businesses
- Text index on `name` and `description` for search functionality

### Services Collection

Represents the services offered by businesses on the platform.

```javascript
{
  _id: ObjectId,
  businessId: String,    // Reference to the business
  name: String,
  description: String,
  duration: Number,      // In minutes
  price: Number,
  category: String,      // Service category
  image: String,         // URL to service image
  isActive: Boolean,     // Whether this service is available for booking
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:

- `businessId`: for retrieving all services of a business
- `category`: for grouping services by category
- `isActive`: for filtering active services

### Clients Collection

Stores information about clients who book appointments.

```javascript
{
  _id: ObjectId,
  businessId: ObjectId,  // Which business this client belongs to
  userId: ObjectId,      // If the client has a user account
  name: String,
  phone: String,
  email: String,
  address: {
    street: String,
    city: String,
    postal: String,
    country: String
  },
  birthdate: Date,
  gender: String,
  notes: String,  // General notes about the client
  tags: [String],  // Custom tags/categories for clients
  createdAt: Date,
  updatedAt: Date,
  lastAppointment: Date,
  totalAppointments: Number,
  totalSpent: Number,
  source: String  // How they found the business
}
```

#### Indexes:

- `businessId`: for retrieving all clients of a business
- `userId`: for linking client records to user accounts
- `phone` and `email`: for client lookup during booking
- Text index on `name`, `phone`, and `email` for search functionality

### Appointments Collection

Records all appointments booked through the platform.

```javascript
{
  _id: ObjectId,
  businessId: ObjectId,
  serviceId: ObjectId,
  clientId: ObjectId,
  staffId: ObjectId,  // Optional, specific staff member
  startTime: Date,
  endTime: Date,
  status: String,  // 'scheduled', 'completed', 'cancelled', 'no-show'
  paymentStatus: String,  // 'pending', 'paid', 'refunded'
  paymentMethod: String,  // 'kaspi', 'cash', etc.
  totalAmount: Number,
  notes: String,  // Additional notes from client or business
  cancellationReason: String,
  cancelledBy: String,  // 'client' or 'business'
  cancelledAt: Date,
  reminderSent: Boolean,
  feedbackSubmitted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:

- `businessId`: for retrieving appointments for a business
- `clientId`: for retrieving appointments for a client
- `serviceId`: for retrieving appointments for a service
- `status`: for filtering by status
- `startTime` and `endTime`: for date range queries
- Compound index on `businessId` and `startTime`: for efficient calendar views

### ClientNotes Collection

Detailed notes and records about clients.

```javascript
{
  _id: ObjectId,
  clientId: ObjectId,
  businessId: ObjectId,
  content: String,
  type: String,  // 'general', 'preference', 'medical', etc.
  createdAt: Date,
  createdBy: ObjectId,  // Reference to user who created the note
  authorName: String,   // Name of author (denormalized for performance)
  isPrivate: Boolean    // Whether note is visible to client
}
```

#### Indexes:

- `clientId`: for retrieving all notes for a client
- `businessId`: for retrieving all notes for a business
- `type`: for filtering notes by type

### Payments Collection

Records payment transactions for appointments.

```javascript
{
  _id: ObjectId,
  appointmentId: ObjectId,
  businessId: ObjectId,
  clientId: ObjectId,
  amount: Number,
  currency: String,  // Default: 'KZT'
  method: String,    // 'kaspi', 'cash', 'card', etc.
  status: String,    // 'pending', 'completed', 'refunded', 'failed'
  transactionId: String,  // External payment system reference
  transactionDetails: Object,  // Additional details from payment provider
  createdAt: Date,
  updatedAt: Date,
  refundedAt: Date,
  refundAmount: Number,
  refundReason: String
}
```

#### Indexes:

- `appointmentId`: for linking payments to appointments
- `businessId`: for retrieving all payments for a business
- `clientId`: for retrieving all payments for a client
- `status`: for filtering by payment status
- `createdAt`: for date range queries

## Data Relationships

### One-to-Many Relationships

- User → Business (One user can own one business)
- Business → Services (One business offers many services)
- Business → Clients (One business has many clients)
- Business → Appointments (One business has many appointments)
- Client → Appointments (One client can have many appointments)
- Client → ClientNotes (One client can have many notes)

### Many-to-Many Relationships

- Appointments ↔ Services (One appointment can involve multiple services, one service can be part of multiple appointments)
- Staff ↔ Services (One staff member can perform multiple services, one service can be performed by multiple staff members)

## Schema Design Considerations

### Denormalization

To optimize for read performance, certain fields are denormalized:

- `authorName` in ClientNotes to avoid joins when displaying notes
- `totalAppointments` and `totalSpent` in Clients for quick statistics

### Indexes

Strategic indexes are created to optimize common queries:

- Searching clients by name, phone, or email
- Filtering appointments by date range
- Retrieving all services for a business

### Time-Series Data

Appointments and payment data are time-series in nature. MongoDB's time-series collections could be used for efficient storage and querying of this data in the future.

### Schema Validation

MongoDB schema validation is used to ensure data integrity:

- Required fields are always present
- Fields have the correct data types
- Enum values are within allowed sets

## Future Schema Evolution

As the platform evolves, the following schema enhancements are planned:

1. **Staff Management**: Expand the schema to better support staff scheduling and management
2. **Inventory Tracking**: Add collections for product inventory and consumption during services
3. **Loyalty Program**: Schema for points, rewards, and referrals
4. **Analytics**: Enhanced data structures for business analytics and reporting
5. **Multi-location Support**: Schema changes to support businesses with multiple locations

## MongoDB Atlas Configuration

The database is hosted on MongoDB Atlas with the following configuration:

- **Cluster Tier**: M10 (or appropriate based on load)
- **Region**: Europe (closest to target market)
- **Backup Policy**: Daily snapshots with 7-day retention
- **Network Security**: IP whitelisting and VPC peering
- **Monitoring**: Atlas monitoring with alerts for performance issues
