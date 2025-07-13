# Frontend Structure

## Overview

The frontend of the Local Business Platform — Атырау is built using Next.js 15 with the app router, leveraging React Server Components for enhanced performance and developer experience. The project follows a component-based architecture with a clear separation of concerns, making it easier to maintain and extend.

## User Interfaces

### For Business Owners

#### ✅ Dashboard

- Overview statistics (appointments, revenue, popular services)
- Daily/weekly/monthly views
- Visual charts and metrics
- Quick action buttons for common tasks

#### ✅ Client Management

- Client listing with search and filters
- Client details card
- Visit history and payment records
- Client notes and preferences
- Quick booking function for existing clients

#### ✅ Appointment Management

- Interactive calendar view (by day/week/month)
- Appointment confirmation/cancellation
- Appointment details with client information
- Status tracking (scheduled, completed, cancelled, no-show)
- Time slot blocking for breaks or unavailable periods

#### ✅ Service Management

- Service listing with categories
- Add/edit/delete service functionality
- Price and duration settings
- Service description and image upload
- Service visibility toggle

#### ✅ Payment Handling

- Payment history with filtering
- Transaction details
- Kaspi QR code generation
- Payment status tracking
- Revenue reports

#### ✅ Business Settings

- Working hours configuration
- Contact information management
- Social media links
- Kaspi integration settings
- Notification preferences
- Business profile customization

### For Clients

#### ✅ Service Browse

- Service listing by category
- Service details with pricing
- Business information view
- Search functionality

#### ✅ Appointment Booking

- Date selection calendar
- Time slot selection
- Service selection
- Personal information form
- Special requests field

#### ✅ Confirmation & Payment

- Booking summary
- Payment method selection
- Kaspi payment integration
- Confirmation notifications
- Booking reference number

#### ✅ Appointment History

- Past appointments list
- Upcoming appointments
- Rebooking functionality
- Cancellation option
- Feedback submission

## Application Architecture

### Directory Structure

The project follows a well-organized directory structure that facilitates code organization and maintainability:

```
atyrau-crm/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/             # Authentication-related pages
│   │   │   ├── login/          # Login page
│   │   │   ├── register/       # Registration page
│   │   │   └── reset-password/ # Password reset pages
│   │   ├── dashboard/          # Business dashboard pages
│   │   │   ├── appointments/   # Appointment management
│   │   │   ├── clients/        # Client management
│   │   │   ├── services/       # Service management
│   │   │   ├── profile/        # Business profile
│   │   │   └── settings/       # Settings page
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   ├── atoms/              # Basic UI elements
│   │   ├── molecules/          # Compound components
│   │   ├── organisms/          # Complex UI sections
│   │   └── templates/          # Page layouts
│   ├── lib/                    # Utility functions
│   └── types/                  # TypeScript definitions
└── public/                     # Static assets
```

### Component Architecture

The frontend follows the Atomic Design methodology:

1. **Atoms**: Basic building blocks (Button, Input, Card, etc.)
2. **Molecules**: Combinations of atoms (SearchInput, DatePicker, etc.)
3. **Organisms**: Complex UI sections (AppointmentCalendar, ClientList, etc.)
4. **Templates**: Page layouts (DashboardLayout, BookingLayout, etc.)
5. **Pages**: Next.js pages with actual content and data fetching

## Key Design Patterns

### Server Components vs. Client Components

The application makes strategic use of both server and client components:

- **Server Components**: Used for data fetching, initial rendering, and SEO optimization
- **Client Components**: Used for interactive elements and state management

Example of a server component:

```tsx
// src/app/dashboard/clients/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getClientsList } from "@/lib/actions/clients";
import ClientsTable from "@/components/organisms/ClientsTable";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const clients = await getClientsList({
    businessId: session.user.businessId,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Clients</h1>
      <ClientsTable initialClients={clients} />
    </div>
  );
}
```

Example of a client component:

```tsx
// src/components/molecules/SearchInput.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchInput({
  onSearch,
  placeholder = "Search...",
}: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder={placeholder}
        className="w-full"
      />
      <Button onClick={handleSearch} variant="ghost" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Data Fetching Patterns

The application uses several data fetching strategies:

1. **Server Components**: Direct data fetching in server components
2. **Server Actions**: For mutations and form submissions
3. **SWR**: For client-side data fetching with caching
4. **Route Handlers**: API routes for client-side data fetching

### State Management

State management is implemented using:

1. **React Hooks**: For component-level state
2. **Context API**: For sharing state across components
3. **SWR**: For server state and caching

### Form Handling

Forms are implemented using React Hook Form with Zod for validation.

## UI Components

### Key UI Components

#### Calendar Component

For appointment scheduling and display:

```tsx
// src/components/molecules/Calendar.tsx (simplified)
"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
} from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function Calendar({ selectedDate, onSelectDate, disabledDates = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calendar implementation...

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePreviousMonth}>&larr;</button>
        <h3 className="font-medium">
          {format(currentMonth, "LLLL yyyy", { locale: ru })}
        </h3>
        <button onClick={handleNextMonth}>&rarr;</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <div key={day} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{/* Calendar day cells */}</div>
    </div>
  );
}
```

#### Time Slot Selector

For selecting appointment times:

```tsx
// src/components/molecules/TimeSlots.tsx (simplified)
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimeSlot {
  time: string;
  timestamp: number;
  available: boolean;
}

export function TimeSlots({
  slots,
  selectedSlot,
  onSelectSlot,
}: {
  slots: TimeSlot[];
  selectedSlot: number | null;
  onSelectSlot: (timestamp: number) => void;
}) {
  return (
    <ScrollArea className="h-64">
      <div className="grid grid-cols-2 gap-2 p-1">
        {slots.map((slot) => (
          <Button
            key={slot.timestamp}
            variant={selectedSlot === slot.timestamp ? "default" : "outline"}
            disabled={!slot.available}
            onClick={() => onSelectSlot(slot.timestamp)}
            className="justify-center"
          >
            {slot.time}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
```

## Authentication & Authorization

Authentication is implemented using Auth.js (NextAuth) with role-based access control. Middleware protection ensures that users can only access authorized routes.

## Responsive Design

The application is built with a mobile-first approach using Tailwind's responsive utilities.

## Performance Optimization

Several strategies are employed to ensure optimal performance:

1. **Server Components**: Reducing client-side JavaScript
2. **Image Optimization**: Using Next.js Image component
3. **Route Prefetching**: Preloading routes for faster navigation
4. **Code Splitting**: Automatic code splitting by page
5. **Font Optimization**: Using Next.js font optimization
6. **Lazy Loading**: Loading components only when needed

## Future Enhancements

Planned enhancements to the frontend structure:

1. **Analytics Dashboard**: More comprehensive business analytics
2. **Real-time Updates**: WebSocket integration for live updates
3. **Mobile App**: Progressive Web App (PWA) for mobile users
4. **Expanded Internationalization**: Support for multiple languages
5. **Advanced Search**: Enhanced search capabilities with filters
6. **Integration with Marketing Tools**: Email marketing and campaigns
