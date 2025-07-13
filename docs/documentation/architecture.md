# Architecture Overview

## System Architecture

The Local Business Platform — Атырау is built on a modern, scalable architecture that combines the best of server-side rendering and client-side interactivity. The system follows a modular design pattern to ensure maintainability, scalability, and developer efficiency.

## Core Components

- **User** — Either a business owner who manages services or an end client who books appointments
- **Frontend (Next.js)** — Client-side application accessible via browser and potentially as a PWA
- **API Layer** — Next.js API routes that handle requests and communicate with the database
- **Backend** — Business logic, data processing, notifications, and payment processing
- **Database** — MongoDB for flexible data storage and schema evolution
- **External Service Integrations**:
  - Kaspi QR / Pay — For online payments
  - SMS / Telegram API — For client notifications
  - Email — For confirmations and newsletters

### Technology Stack

#### Frontend

- **Next.js 15**: React framework with app router providing server components, client components, and hybrid rendering
- **TypeScript**: For type safety and improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Shadcn UI**: Component library built on top of Tailwind CSS with consistent design principles
- **React Hook Form**: Form validation and state management
- **Zod**: Schema validation for type-safe forms and API requests
- **SWR**: Data fetching and state management with stale-while-revalidate caching strategy

#### Backend

- **Next.js API Routes**: For backend API implementation
- **MongoDB**: NoSQL database for flexible data storage
- **Auth.js (NextAuth)**: Authentication framework with custom JWT handling
- **bcrypt**: Password hashing for secure user authentication
- **MongoDB Atlas**: Cloud database service with automatic scaling and backups

#### DevOps

- **Vercel**: Deployment platform with CI/CD integration
- **GitHub Actions**: Continuous integration and testing pipeline
- **ESLint & Prettier**: Code quality and formatting tools

### System Components Diagram

```
┌─────────────────────────────────────┐
│            Client Browser           │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│          Next.js Frontend           │
│  ┌─────────────────────────────┐    │
│  │      Server Components      │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │      Client Components      │    │
│  └─────────────────────────────┘    │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│           Next.js API              │
│  ┌─────────────────────────────┐    │
│  │    Authentication (Auth.js) │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │      API Endpoints          │    │
│  └─────────────────────────────┘    │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│            MongoDB Atlas            │
│  ┌─────────────────────────────┐    │
│  │    Database Collections     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Authentication Flow

The authentication system uses Auth.js (NextAuth) with custom JWT handling for role-based access control:

```
┌─────────┐      ┌───────────┐      ┌───────────┐      ┌─────────┐
│  User   │      │  Frontend │      │  Auth.js  │      │ MongoDB │
└────┬────┘      └─────┬─────┘      └─────┬─────┘      └────┬────┘
     │                 │                  │                 │
     │ Login Request   │                  │                 │
     │─────────────────>                  │                 │
     │                 │ Auth Request     │                 │
     │                 │─────────────────>│                 │
     │                 │                  │ Verify User     │
     │                 │                  │────────────────>│
     │                 │                  │                 │
     │                 │                  │ User Data       │
     │                 │                  │<────────────────│
     │                 │                  │                 │
     │                 │                  │ Generate JWT    │
     │                 │                  │────┐            │
     │                 │                  │    │            │
     │                 │                  │<───┘            │
     │                 │ JWT + Role       │                 │
     │                 │<─────────────────│                 │
     │ Auth Cookie     │                  │                 │
     │<─────────────────                  │                 │
     │                 │                  │                 │
```

## Data Flow

### Appointment Booking Flow

```
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌─────────┐
│  Client │    │ Frontend │    │   API     │    │ Database │    │ Business│
└────┬────┘    └────┬─────┘    └─────┬─────┘    └────┬─────┘    └────┬────┘
     │              │                │                │              │
     │ Select Date  │                │                │              │
     │──────────────>                │                │              │
     │              │ Request Slots  │                │              │
     │              │───────────────>│                │              │
     │              │                │ Query Hours    │                │
     │              │                │───────────────>│                │
     │              │                │                │                │
     │              │                │ Business Hours │                │
     │              │                │<───────────────│                │
     │              │                │                │                │
     │              │                │ Query Bookings │                │
     │              │                │───────────────>│                │
     │              │                │                │                │
     │              │                │ Booked Slots   │                │
     │              │                │<───────────────│                │
     │              │                │                │                │
     │              │                │ Generate       │                │
     │              │                │ Available      │                │
     │              │                │ Time Slots     │                │
     │              │                │────┐           │                │
     │              │                │    │           │                │
     │              │                │<───┘           │                │
     │              │ Available Slots│                │                │
     │              │<───────────────│                │                │
     │              │                │                │                │
     │ Select Slot  │                │                │                │
     │──────────────>                │                │                │
     │              │                │                │                │
     │ Submit Info  │                │                │                │
     │──────────────>                │                │                │
     │              │ Create Booking │                │                │
     │              │───────────────>│                │                │
     │              │                │ Check Conflicts│                │
     │              │                │───────────────>│                │
     │              │                │                │                │
     │              │                │ No Conflicts   │                │
     │              │                │<───────────────│                │
     │              │                │                │                │
     │              │                │ Save Booking   │                │
     │              │                │───────────────>│                │
     │              │                │                │                │
     │              │ Booking        │                │                │
     │              │ Confirmation   │                │                │
     │              │<───────────────│                │                │
     │ Confirmation │                │                │                │
     │<──────────────                │                │                │
     │              │                │                │                │
     │              │                │ Notification   │                │
     │              │                │────────────────────────────────────>
     │              │                │                │                │
```

## Code Organization

The project follows a clear, modular structure:

```
atyrau-crm/
├── public/           # Static assets
├── src/
│   ├── app/          # Next.js app router pages
│   │   ├── api/      # API routes
│   │   ├── (auth)/   # Authentication pages (grouped)
│   │   ├── dashboard/# Business dashboard pages
│   │   └── ...       # Other page routes
│   ├── components/   # React components (Atomic Design)
│   │   ├── atoms/    # Basic UI elements
│   │   ├── molecules/# Compound components
│   │   ├── organisms/# Complex UI sections
│   │   ├── templates/# Page layouts
│   │   └── ui/       # Shadcn UI components
│   ├── lib/          # Utility functions and services
│   │   ├── actions/  # Server actions
│   │   ├── utils/    # Helper functions
│   │   └── validators/# Schema validations
│   └── types/        # TypeScript definitions
```

## Deployment Architecture

The application is deployed on Vercel with the following architecture:

```
┌─────────────────────────────────────┐
│            Vercel Edge              │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│        Next.js Application          │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│            MongoDB Atlas            │
└─────────────────────────────────────┘
```

Key deployment features:

- Edge functions for API routes
- Global CDN for static assets
- Automatic HTTPS with SSL certificates
- Serverless functions with auto-scaling
- Continuous deployment from GitHub main branch

## Security Considerations

The platform implements several security measures:

1. **Authentication**: JWT-based authentication with secure HTTP-only cookies
2. **Authorization**: Role-based access control for routes and API endpoints
3. **Data Validation**: Input validation using Zod schemas
4. **Password Security**: bcrypt hashing with appropriate salt rounds
5. **Rate Limiting**: API rate limiting to prevent abuse
6. **CORS**: Configured Cross-Origin Resource Sharing policy
7. **Content Security Policy**: Implemented CSP headers
8. **Database Security**: MongoDB Atlas with network access restrictions
9. **Environment Variables**: Secure handling of sensitive configuration

## Optimization Strategies

1. **Server Components**: Using React Server Components for data-fetching components
2. **Edge Caching**: Leveraging Vercel's edge caching for static assets and API responses
3. **Image Optimization**: Next.js Image component for optimized image loading
4. **Incremental Static Regeneration**: For pages with frequently changing data
5. **Bundle Optimization**: Code splitting and tree shaking with webpack
6. **MongoDB Indexing**: Strategic indexes on frequently queried fields
7. **Lazy Loading**: For non-critical components and routes

## Future Architecture Evolution

As the platform grows, the following architectural enhancements are planned:

1. **Microservices**: Split certain functionality into dedicated services (payments, notifications)
2. **Real-time Updates**: Add WebSocket support for live notifications
3. **Redis Cache**: Introduce Redis for caching frequently accessed data
4. **Analytics Pipeline**: Implement event tracking and analytics infrastructure
5. **Multi-region Deployment**: Expand deployment to multiple geographic regions
6. **Containerization**: Move to container-based deployment with Docker and Kubernetes
