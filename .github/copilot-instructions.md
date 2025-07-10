# AI Agent Instructions for Local Business Platform — Атырау

This guide helps AI coding agents understand the project's architecture, patterns, and conventions.

## 🏗 Architecture Overview

This is a Next.js-based platform for local businesses in Atyrau, Kazakhstan, with these key components:

- **Frontend**: Next.js 15 (App Router) with Tailwind CSS
- **State Management**: Zustand/React Query
- **Backend**: NestJS/Express server
- **Database**: MongoDB (via Mongoose)
- **Auth**: Auth.js
- **Payments**: Kaspi QR integration
- **Notifications**: Telegram/WhatsApp API (via Twilio)

## 📊 Data Model

Key collections and relationships (see `docs/documentation/databaseSchema.md`):

- `Users` ← `Businesses` (1:1)
- `Businesses` ← `Services` (1:many)
- `Businesses` ← `Clients` (1:many)
- `Appointments` (links `Clients`, `Services`, `Businesses`)
- `Payments` (tracks transactions)

## 🔄 Core Workflows

Key workflows (see `docs/documentation/workflows.md`):

1. **Business Owner Flow**:

   - Registration and login
   - Setup business profile (address, hours, services)
   - Configure Kaspi QR for payments
   - Manage appointments via admin calendar
   - Send client reminders
   - Track completed visits

2. **Client Flow**:
   - Access business public page
   - Browse and select services
   - Choose date/time slot
   - Provide contact details (name, phone)
   - Receive confirmation
   - Make payment (Kaspi QR or cash)

## 🛠 Development Guidelines

### Project Structure

Frontend (`docs/documentation/frontendStructure.md`):

- `/app/` - Next.js App Router pages organizing:
  - Business owner dashboard (stats, clients, appointments)
  - Client booking flows
  - Authentication pages
- `/components/` - Reusable React components (grouped by feature):
  - Dashboard components
  - Client management
  - Appointment calendar
  - Service management
  - Payment integration
  - Settings & configuration
- `/lib/` - Shared utilities

Backend:

- `/src/` - NestJS/Express server code
- `/api/` - API route handlers
- `/models/` - MongoDB schemas
- `/services/` - Business logic layer

### Conventions

1. **API Routes**:

   - Use MongoDB schemas from `databaseSchema.md`
   - Include proper error handling
   - Validate inputs

2. **Frontend**:

   - Follow layout in `frontendStructure.md`
   - Use Tailwind for styling
   - Implement responsive design for mobile-first experience and desktop

3. **State Management**:
   - Use Zustand for global state
   - React Query for API data

### Testing

- Unit tests for API routes
- Component tests with React Testing Library
- E2E tests with Playwright

## 📱 Integration Points

1. **Kaspi Integration**:

   - QR code generation per business
   - Payment status tracking (manual verification in MVP)
   - Payment history and reconciliation
   - Handling refunds

2. **Notifications**:
   - Telegram API / WhatsApp API via Twilio
   - Appointment confirmations and reminders
   - Payment status updates
   - Business owner alerts
   - Email notifications for important updates

## 🚨 Common Gotchas

1. **Authentication**:

   - Always check user roles (admin/owner/client)
   - Validate business ownership

2. **Appointments**:

   - Check for time slot conflicts
   - Handle timezone differences
   - Consider service duration

3. **Payments**:
   - Verify Kaspi payment status
   - Handle partial payments
   - Track refunds

## 📖 Prompt History

Check `docs/prompts/` directory for historical context on:

1. **Authentication** (`auth.md`):

   - Registration flows
   - Profile setup
   - Role management

2. **Appointments** (`appointments.md`):

   - Calendar integration
   - Booking workflows
   - Admin views

3. **Payments** (`payments.md`):

   - Kaspi QR flows
   - Payment tracking
   - Refund handling

4. **Notifications** (`notifications.md`):
   - Telegram/WhatsApp setup
   - Email systems
   - Message templates

Each prompt file includes:

- Common use cases
- Required parameters
- Best practices
- Integration points

Use these prompts as reference when implementing similar features or understanding existing patterns.
