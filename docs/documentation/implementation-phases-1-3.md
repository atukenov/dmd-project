# Local Business Platform — Атырау

## Implementation Documentation: Phases 1-3

## Table of Contents

1. [Introduction](#introduction)
2. [Phase 1: Foundation](#phase-1-foundation)
   - [Technical Setup](#technical-setup)
   - [Design System](#design-system)
3. [Phase 2: Authentication & Core](#phase-2-authentication--core)
   - [User Management](#user-management)
   - [Business Profile](#business-profile)
4. [Phase 3: Client Features](#phase-3-client-features)
   - [Appointment System](#appointment-system)
   - [Client Management](#client-management)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Future Development](#future-development)

## Introduction

The Local Business Platform for Атырау is a comprehensive solution designed to help local businesses manage their operations, appointments, clients, and payments. This documentation covers the implementation details of Phases 1 through 3, which establish the foundation, core functionality, and client features of the platform.

The platform is built using modern web technologies including:

- Next.js 15 for the frontend
- MongoDB for the database
- Auth.js for authentication
- Tailwind CSS for styling

## Phase 1: Foundation

### Technical Setup

#### Project Scaffolding

The project was initialized using the latest Next.js 15 framework with TypeScript support. The project structure follows a modular approach with clear separation of concerns:

```
atyrau-crm/
├── public/           # Static assets
├── src/
│   ├── app/          # Next.js app directory
│   │   ├── api/      # API routes
│   │   └── ...       # Page routes
│   ├── components/   # React components
│   │   ├── atoms/    # Basic UI elements
│   │   ├── molecules/# Compound components
│   │   ├── organisms/# Complex UI sections
│   │   └── templates/# Page layouts
│   ├── lib/          # Utility functions and services
│   └── types/        # TypeScript definitions
└── ...
```

#### MongoDB Integration

Database connection is established through a MongoDB client singleton pattern to ensure efficient connection pooling:

```typescript
// src/lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // Use global variable in development to prevent multiple instances
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, create new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

#### Auth.js Integration

Authentication is implemented using Auth.js (NextAuth) with custom JWT handling to support role-based access control:

```typescript
// src/lib/auth.ts (simplified)
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validation logic...
        // Return user object if valid
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        // Additional user info...
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.role = token.role;
        // Add additional user info to session
      }
      return session;
    },
  },
  // Additional configuration...
};
```

#### CI/CD Pipeline

Implemented automated testing and deployment workflows using GitHub Actions:

- Linting and code quality checks run on each push
- Automated testing for critical components
- Deployment to Vercel (frontend) and Railway (backend) on main branch updates

### Design System

#### Tailwind Configuration

Extended Tailwind CSS with custom colors, fonts, and components to match the design requirements:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          // ...other shades
          900: "#0c4a6e",
        },
        // Additional color palettes...
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      // Other theme extensions...
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    // Other plugins...
  ],
};
```

#### Component Library

Built a comprehensive component library following the atomic design methodology:

1. **Atoms**: Basic building blocks like Button, Input, and Card components

   ```tsx
   // src/components/atoms/Button.tsx
   export function Button({
     variant = "primary",
     size = "md",
     children,
     ...props
   }: ButtonProps) {
     const variantClasses = {
       primary: "bg-primary-600 hover:bg-primary-700 text-white",
       secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
       outline:
         "border border-primary-600 text-primary-600 hover:bg-primary-50",
     };

     const sizeClasses = {
       sm: "py-1 px-3 text-sm",
       md: "py-2 px-4",
       lg: "py-3 px-6 text-lg",
     };

     return (
       <button
         className={`rounded font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]}`}
         {...props}
       >
         {children}
       </button>
     );
   }
   ```

2. **Molecules**: Compound components like forms, navigation items, and cards

3. **Organisms**: Complex UI sections like headers, sidebars, and feature blocks

4. **Templates**: Page layouts with placeholders for content

#### Responsive Design

Implemented mobile-first responsive design using Tailwind's responsive utilities:

```tsx
// Example of responsive navigation component
export function Navigation() {
  return (
    <>
      {/* Mobile navigation (bottom bar) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        {/* Mobile navigation items */}
      </nav>

      {/* Desktop navigation (sidebar) */}
      <nav className="hidden md:flex fixed h-full w-64 bg-white border-r">
        {/* Desktop navigation items */}
      </nav>
    </>
  );
}
```

#### Light/Dark Mode

Implemented theme switching with persistent user preferences stored in localStorage:

```tsx
// src/components/ThemeProvider.tsx (simplified)
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Load from localStorage on mount
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

## Phase 2: Authentication & Core

### User Management

#### Registration/Login Flow

Implemented secure authentication flow with email validation and JWT token handling:

1. **Registration Form**: Built with client-side validation and server-side verification

   ```tsx
   // src/app/register/page.tsx (simplified)
   "use client";

   export default function RegisterPage() {
     const [formData, setFormData] = useState({
       name: "",
       email: "",
       password: "",
       role: "client",
     });

     async function handleSubmit(e) {
       e.preventDefault();

       // Form validation...

       const response = await fetch("/api/auth/register", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(formData),
       });

       // Handle response...
     }

     return <form onSubmit={handleSubmit}>{/* Form fields... */}</form>;
   }
   ```

2. **API Route**: Handles user registration with password hashing

   ```typescript
   // src/app/api/auth/register/route.ts
   import { NextRequest, NextResponse } from "next/server";
   import { hash } from "bcrypt";
   import clientPromise from "@/lib/mongodb";

   export async function POST(request: NextRequest) {
     try {
       const { name, email, password, role } = await request.json();

       // Validation...

       // Check if user exists
       const client = await clientPromise;
       const db = client.db();
       const existingUser = await db.collection("users").findOne({ email });

       if (existingUser) {
         return NextResponse.json(
           { message: "User already exists" },
           { status: 409 }
         );
       }

       // Hash password
       const hashedPassword = await hash(password, 12);

       // Create user
       const result = await db.collection("users").insertOne({
         name,
         email,
         password: hashedPassword,
         role,
         createdAt: new Date(),
         emailVerified: false,
       });

       // Generate verification token...

       return NextResponse.json({ userId: result.insertedId });
     } catch (error) {
       // Handle errors...
     }
   }
   ```

3. **Email Verification**: Implemented token-based email verification system

#### Role-Based Access Control

Implemented middleware to protect routes based on user roles:

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Public paths accessible without authentication
  if (
    path === "/" ||
    path.startsWith("/auth") ||
    path.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Protected paths that require authentication
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Role-specific access control
  if (
    (path.startsWith("/dashboard/business") &&
      token.role !== "business" &&
      token.role !== "admin") ||
    (path.startsWith("/admin") && token.role !== "admin")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/public|_next/static|_next/image|favicon.ico).*)"],
};
```

#### Profile Management

Implemented comprehensive profile management with avatar upload and settings:

1. **Profile Edit Form**: For updating user information
2. **Avatar Upload**: Using client-side cropping and server-side storage
3. **Settings Section**: For managing notifications, preferences, etc.

```tsx
// src/app/profile/page.tsx (simplified)
"use client";

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch user data...
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    // Update profile API call...

    setIsSubmitting(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Настройки профиля</h1>

      {/* Profile form... */}
    </div>
  );
}
```

#### Password Reset Flow

Implemented secure password reset with email verification:

1. **Forgot Password Form**: To initiate the reset process
2. **Token Generation**: Secure, time-limited tokens for password reset
3. **Reset Password Page**: Form to create a new password with token validation
4. **Email Notifications**: Sent for password reset requests and confirmations

### Business Profile

#### Business Setup Wizard

Created a multi-step wizard for business onboarding:

1. **Step Progress Tracking**: Visual indicator of completion progress

   ```tsx
   function ProgressBar({ currentStep, totalSteps }) {
     return (
       <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
         <div
           className="bg-blue-600 h-2.5 rounded-full"
           style={{ width: `${(currentStep / totalSteps) * 100}%` }}
         ></div>
       </div>
     );
   }
   ```

2. **Business Information Collection**: Form for business details, categories, etc.
3. **Image Upload**: For logo and business photos

#### Working Hours Configuration

Built a visual editor for business hours with extensive customization:

1. **Weekly Schedule Editor**: Interactive UI for setting working hours

   ```tsx
   // src/components/organisms/WorkingHoursEditor.tsx (simplified)
   export function WorkingHoursEditor({ value, onChange }) {
     const days = [
       "monday",
       "tuesday",
       "wednesday",
       "thursday",
       "friday",
       "saturday",
       "sunday",
     ];

     function handleDayChange(day, updates) {
       onChange({
         ...value,
         [day]: {
           ...value[day],
           ...updates,
         },
       });
     }

     return (
       <div className="space-y-4">
         {days.map((day) => (
           <div key={day} className="flex items-center space-x-4">
             <div className="w-28 font-medium capitalize">{day}</div>

             <label className="flex items-center">
               <input
                 type="checkbox"
                 checked={value[day]?.isOpen || false}
                 onChange={(e) =>
                   handleDayChange(day, { isOpen: e.target.checked })
                 }
                 className="mr-2"
               />
               Открыто
             </label>

             {value[day]?.isOpen && (
               <div className="flex items-center space-x-2">
                 <input
                   type="time"
                   value={value[day]?.from || "09:00"}
                   onChange={(e) =>
                     handleDayChange(day, { from: e.target.value })
                   }
                   className="border rounded p-1"
                 />
                 <span>до</span>
                 <input
                   type="time"
                   value={value[day]?.to || "18:00"}
                   onChange={(e) =>
                     handleDayChange(day, { to: e.target.value })
                   }
                   className="border rounded p-1"
                 />
               </div>
             )}
           </div>
         ))}
       </div>
     );
   }
   ```

2. **Lunch Breaks**: Support for break periods within working hours
3. **Special Hours**: For holidays and exceptional days
4. **Exception Calendar**: For setting specific dates with non-standard hours

#### Service Management

Implemented full CRUD operations for business services:

1. **Service Listing**: Table view with filtering and sorting
2. **Add/Edit Forms**: For creating and updating service information
3. **Categorization**: For organizing services into groups
4. **Pricing and Duration**: Controls for setting service parameters

```typescript
// src/app/api/services/create/route.ts (simplified)
export async function POST(request: NextRequest) {
  try {
    const { name, duration, price, description, category } =
      await request.json();

    // Validation...

    const client = await clientPromise;
    const db = client.db();

    // Get business ID from authenticated user
    const token = await getToken({ req: request });
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });

    // Create service
    const service = {
      businessId: user.businessId,
      name,
      duration: parseInt(duration, 10),
      price: parseFloat(price),
      description: description || "",
      category: category || "default",
      createdAt: new Date(),
    };

    const result = await db.collection("services").insertOne(service);

    return NextResponse.json({
      serviceId: result.insertedId,
      service: { ...service, _id: result.insertedId },
    });
  } catch (error) {
    // Handle errors...
  }
}
```

#### Address and Contact Info

Created comprehensive forms for business contact information:

1. **Address Form**: With validation and formatting
2. **Map Integration**: For visual location selection
3. **Contact Information**: Phone, email, website, etc.
4. **Social Media Links**: For connecting business profiles

## Phase 3: Client Features

### Appointment System

#### Calendar Integration

Built a full-featured calendar system for date selection:

1. **Calendar Component**: For visual date selection

   ```tsx
   // src/components/molecules/Calendar.tsx (simplified)
   export function Calendar({ selectedDate, onSelectDate }) {
     const [currentMonth, setCurrentMonth] = useState(new Date());
     const calendarDays = getCalendarMonth(
       currentMonth.getFullYear(),
       currentMonth.getMonth()
     );

     function handlePrevMonth() {
       setCurrentMonth((prevMonth) => {
         const date = new Date(prevMonth);
         date.setMonth(date.getMonth() - 1);
         return date;
       });
     }

     function handleNextMonth() {
       setCurrentMonth((prevMonth) => {
         const date = new Date(prevMonth);
         date.setMonth(date.getMonth() + 1);
         return date;
       });
     }

     return (
       <div className="w-full">
         {/* Calendar header with month navigation */}
         <div className="flex justify-between items-center mb-4">
           <button onClick={handlePrevMonth}>&larr;</button>
           <h3 className="font-medium">
             {getMonthNamesRu()[currentMonth.getMonth()]}{" "}
             {currentMonth.getFullYear()}
           </h3>
           <button onClick={handleNextMonth}>&rarr;</button>
         </div>

         {/* Weekday headers */}
         <div className="grid grid-cols-7 gap-1 mb-2">
           {getWeekDaysRu(true).map((day) => (
             <div key={day} className="text-center font-medium text-sm">
               {day}
             </div>
           ))}
         </div>

         {/* Calendar days */}
         <div className="grid grid-cols-7 gap-1">
           {calendarDays.map((date, index) => (
             <button
               key={index}
               className={`
                 h-10 rounded-full flex items-center justify-center text-sm
                 ${
                   isSameDay(date, selectedDate) ? "bg-blue-500 text-white" : ""
                 }
                 ${
                   date.getMonth() !== currentMonth.getMonth()
                     ? "text-gray-300"
                     : ""
                 }
                 ${
                   isPastDay(date)
                     ? "text-gray-300 cursor-not-allowed"
                     : "hover:bg-gray-100"
                 }
               `}
               onClick={() => !isPastDay(date) && onSelectDate(date)}
               disabled={isPastDay(date)}
             >
               {date.getDate()}
             </button>
           ))}
         </div>
       </div>
     );
   }
   ```

2. **Date Utilities**: Helper functions for calendar operations
   ```typescript
   // src/lib/utils/date-utils.ts (partial)
   export function getCalendarMonth(year: number, month: number): Date[] {
     const result: Date[] = [];

     // First day of the month
     const firstDay = new Date(year, month, 1);

     // Last day of the month
     const lastDay = new Date(year, month + 1, 0);

     // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
     const firstDayOfWeek = firstDay.getDay();

     // Calculate days from previous month
     const daysFromPrevMonth = firstDayOfWeek === 0 ? 0 : firstDayOfWeek;

     // Add days from previous month
     for (let i = daysFromPrevMonth; i > 0; i--) {
       const date = new Date(year, month, 1 - i);
       result.push(date);
     }

     // Add all days in the current month
     for (let i = 1; i <= lastDay.getDate(); i++) {
       const date = new Date(year, month, i);
       result.push(date);
     }

     // Add days from next month to complete the grid
     const remainingDays = 42 - result.length;

     for (let i = 1; i <= remainingDays; i++) {
       const date = new Date(year, month + 1, i);
       result.push(date);
     }

     return result;
   }
   ```

#### Time Slot Selection

Implemented an intelligent system for time slot availability:

1. **Time Slot Generation**: Algorithm for creating available slots based on business hours

   ```typescript
   // src/lib/utils/date-utils.ts (partial)
   export function generateTimeSlots(
     date: Date,
     businessHours: any,
     serviceDuration: number = 60,
     bookedSlots: { start: Date; end: Date }[] = []
   ): { time: string; timestamp: number; available: boolean }[] {
     const dayOfWeek = date.getDay();
     const dayNames = [
       "sunday",
       "monday",
       "tuesday",
       "wednesday",
       "thursday",
       "friday",
       "saturday",
     ];
     const dayName = dayNames[dayOfWeek];

     // If business closed on this day, return empty array
     if (!businessHours[dayName]?.isOpen) {
       return [];
     }

     const slots = [];
     const fromTime = businessHours[dayName].from;
     const toTime = businessHours[dayName].to;

     // Parse from and to times
     const [fromHour, fromMinute] = fromTime.split(":").map(Number);
     const [toHour, toMinute] = toTime.split(":").map(Number);

     // Start time in minutes since midnight
     let currentMinutes = fromHour * 60 + fromMinute;

     // End time in minutes since midnight
     const endMinutes = toHour * 60 + toMinute;

     // Create 15-minute intervals
     while (currentMinutes + serviceDuration <= endMinutes) {
       const hours = Math.floor(currentMinutes / 60);
       const minutes = currentMinutes % 60;

       const slotTime = formatTime(hours, minutes);
       const slotDate = new Date(date);
       slotDate.setHours(hours, minutes, 0, 0);

       // Calculate slot end time
       const slotEndDate = new Date(slotDate);
       slotEndDate.setMinutes(slotEndDate.getMinutes() + serviceDuration);

       // Check availability
       const isPast = slotDate < new Date();
       const isOverlapping = bookedSlots.some((bookedSlot) => {
         return (
           (slotDate >= bookedSlot.start && slotDate < bookedSlot.end) ||
           (slotEndDate > bookedSlot.start && slotEndDate <= bookedSlot.end) ||
           (slotDate <= bookedSlot.start && slotEndDate >= bookedSlot.end)
         );
       });

       const available = !isPast && !isOverlapping;

       slots.push({
         time: slotTime,
         timestamp: slotDate.getTime(),
         available,
       });

       // Move to next slot (15-minute intervals)
       currentMinutes += 15;
     }

     return slots;
   }
   ```

2. **Available/Unavailable Slots**: Visual differentiation between available and booked slots
3. **Business Hours Integration**: Using configured business hours for slot generation
4. **Conflict Handling**: Prevention of double-booking

#### Booking Flow

Created a smooth, user-friendly booking process:

1. **Service Selection Interface**: For choosing service type and parameters
2. **Client Information Collection**: Form for client details
3. **Appointment Creation Process**: Backend logic for booking creation

   ```typescript
   // src/app/api/appointments/create/route.ts (simplified)
   export async function POST(request: NextRequest) {
     try {
       const {
         businessId,
         serviceId,
         startTime,
         endTime,
         clientName,
         clientPhone,
         clientEmail,
         notes,
       } = await request.json();

       // Validation...

       const client = await clientPromise;
       const db = client.db();

       // Check for time slot conflicts
       const requestedStart = new Date(startTime);
       const requestedEnd = new Date(endTime);

       const existingAppointments = await db
         .collection("appointments")
         .find({
           businessId: new ObjectId(businessId),
           $or: [
             // Various overlap conditions...
           ],
         })
         .toArray();

       if (existingAppointments.length > 0) {
         return NextResponse.json(
           { message: "This time slot is already booked" },
           { status: 409 }
         );
       }

       // Create client if needed...

       // Create appointment
       const appointment = {
         businessId: new ObjectId(businessId),
         clientId,
         serviceId: serviceId ? new ObjectId(serviceId) : null,
         startTime: requestedStart,
         endTime: requestedEnd,
         status: "scheduled",
         paymentStatus: "pending",
         notes: notes || "",
         createdAt: new Date(),
       };

       const result = await db
         .collection("appointments")
         .insertOne(appointment);

       return NextResponse.json({
         message: "Appointment booked successfully",
         appointmentId: result.insertedId,
         appointment: {
           ...appointment,
           _id: result.insertedId,
         },
       });
     } catch (error) {
       // Handle errors...
     }
   }
   ```

4. **Validation and Error Handling**: Comprehensive checks for data integrity

#### Confirmation System

Implemented a robust appointment management system:

1. **Appointment Confirmation Display**: UI for showing booking details
2. **Status Updates**: System for tracking appointment status

   ```typescript
   // src/app/api/appointments/update/route.ts (simplified)
   export async function PATCH(request: NextRequest) {
     try {
       const { appointmentId, status, paymentStatus, notes } =
         await request.json();

       // Validation...

       const client = await clientPromise;
       const db = client.db();

       // Authorization checks...

       // Update appointment
       const updateData: any = { updatedAt: new Date() };

       if (status) {
         updateData.status = status;
       }

       if (paymentStatus) {
         updateData.paymentStatus = paymentStatus;
       }

       if (notes !== undefined) {
         updateData.notes = notes;
       }

       await db
         .collection("appointments")
         .updateOne({ _id: new ObjectId(appointmentId) }, { $set: updateData });

       const updatedAppointment = await db.collection("appointments").findOne({
         _id: new ObjectId(appointmentId),
       });

       return NextResponse.json({
         message: "Appointment updated successfully",
         appointment: updatedAppointment,
       });
     } catch (error) {
       // Handle errors...
     }
   }
   ```

3. **Payment Status Tracking**: For monitoring payment completion
4. **Cancellation with Reason Tracking**: System for managing cancellations
   ```typescript
   // src/app/api/appointments/cancel/route.ts (simplified)
   export async function POST(request: NextRequest) {
     try {
       const { appointmentId, cancellationReason } = await request.json();

       // Validation...

       const client = await clientPromise;
       const db = client.db();

       // Authorization checks...

       // Create cancellation record
       const cancellation = {
         appointmentId: new ObjectId(appointmentId),
         businessId: appointment.businessId,
         clientId: appointment.clientId,
         appointmentDate: new Date(appointment.startTime),
         cancelledBy: token.role,
         cancellerId: new ObjectId(token.sub),
         reason: cancellationReason || "Not provided",
         cancelledAt: new Date(),
       };

       await db.collection("cancellations").insertOne(cancellation);

       // Update appointment status
       await db.collection("appointments").updateOne(
         { _id: new ObjectId(appointmentId) },
         {
           $set: {
             status: "cancelled",
             cancellationReason,
             cancelledBy: token.role,
             cancelledAt: new Date(),
             updatedAt: new Date(),
           },
         }
       );

       return NextResponse.json({
         message: "Appointment cancelled successfully",
       });
     } catch (error) {
       // Handle errors...
     }
   }
   ```

### Client Management

#### Client Profiles

Built a comprehensive client data management system:

1. **Client Data Model and API Endpoints**: For storing and retrieving client information

   ```typescript
   // Database schema (conceptual)
   interface Client {
     _id: ObjectId;
     businessId: ObjectId;
     userId?: ObjectId; // If associated with a registered user
     name: string;
     phone: string;
     email?: string;
     notes?: string;
     createdAt: Date;
     updatedAt?: Date;
   }
   ```

2. **Client List with Search**: Interface for finding and managing clients

   ```tsx
   // src/app/dashboard/clients/page.tsx (simplified)
   export default function ClientsPage() {
     const [clients, setClients] = useState([]);
     const [searchQuery, setSearchQuery] = useState("");
     const [currentPage, setCurrentPage] = useState(1);

     // Fetch clients when search or page changes
     useEffect(() => {
       fetchClients();
     }, [searchQuery, currentPage]);

     async function fetchClients() {
       const skip = (currentPage - 1) * pageSize;
       let url = `/api/clients/list?limit=${pageSize}&skip=${skip}`;

       if (searchQuery) {
         url += `&query=${encodeURIComponent(searchQuery)}`;
       }

       const response = await fetch(url);
       const data = await response.json();
       setClients(data.clients || []);
       // Update pagination state...
     }

     return (
       <div className="max-w-6xl mx-auto p-4">
         {/* Search bar */}
         <input
           type="text"
           placeholder="Search clients..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full p-2 border rounded mb-4"
         />

         {/* Clients list */}
         <table className="min-w-full">
           <thead>
             <tr>
               <th>Name</th>
               <th>Phone</th>
               <th>Visits</th>
               <th>Last Visit</th>
             </tr>
           </thead>
           <tbody>
             {clients.map((client) => (
               <tr key={client._id}>
                 <td>{client.name}</td>
                 <td>{client.phone}</td>
                 <td>{client.stats.appointmentCount}</td>
                 <td>
                   {client.stats.lastVisit
                     ? formatDate(client.stats.lastVisit)
                     : "No visits"}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>

         {/* Pagination */}
       </div>
     );
   }
   ```

3. **Client Profile View**: Detailed display of client information
4. **Client Edit Functionality**: Forms for updating client details

#### Visit History

Implemented comprehensive appointment history tracking:

1. **Appointment History Display**: List of past and upcoming appointments
2. **Appointment Details**: Status, payment, and service information
3. **Service Linkage**: Connection between appointments and services
4. **Appointment Creation**: Quick links for booking new appointments

#### Client Search and Filters

Created powerful search capabilities:

1. **Search by Name, Phone, Email**: Multi-field search implementation

   ```typescript
   // src/app/api/clients/list/route.ts (simplified)
   if (query) {
     filter.$or = [
       { name: { $regex: query, $options: "i" } },
       { phone: { $regex: query, $options: "i" } },
       { email: { $regex: query, $options: "i" } },
     ];
   }
   ```

2. **Pagination**: For navigating large client lists
3. **Client Statistics**: Metrics about client activity

   ```typescript
   // Client statistics calculation (simplified)
   const clientsWithStats = await Promise.all(
     clients.map(async (client) => {
       const appointmentCount = await db
         .collection("appointments")
         .countDocuments({
           clientId: client._id,
         });

       const completedAppointments = await db
         .collection("appointments")
         .countDocuments({
           clientId: client._id,
           status: "completed",
         });

       // Other statistics...

       return {
         ...client,
         stats: {
           appointmentCount,
           completedAppointments,
           // Other stats...
           lastVisit:
             latestAppointment.length > 0
               ? latestAppointment[0].startTime
               : null,
         },
       };
     })
   );
   ```

4. **Efficient Database Queries**: Optimized MongoDB queries for performance

#### Notes and Preferences

Built a flexible client notes system:

1. **Client Notes System**: For storing important client information

   ```typescript
   // Database schema (conceptual)
   interface ClientNote {
     _id: ObjectId;
     clientId: ObjectId;
     businessId: ObjectId;
     content: string;
     type: "general" | "preference" | "medical";
     createdAt: Date;
     createdBy: ObjectId;
     authorName: string;
   }
   ```

2. **Note Creation with Author Tracking**: Attribution for note creation

   ```typescript
   // src/app/api/clients/[id]/notes/route.ts (simplified)
   export async function POST(
     request: NextRequest,
     { params }: { params: { id: string } }
   ) {
     try {
       const { content, type = "general" } = await request.json();

       // Validation and authorization...

       const note = {
         clientId: new ObjectId(params.id),
         businessId: clientDetails.businessId,
         content,
         type,
         createdAt: new Date(),
         createdBy: new ObjectId(token.sub),
         authorName: user?.name || "Staff Member",
       };

       const result = await db.collection("clientNotes").insertOne(note);

       return NextResponse.json({
         message: "Note added successfully",
         noteId: result.insertedId,
         note: {
           ...note,
           _id: result.insertedId,
         },
       });
     } catch (error) {
       // Handle errors...
     }
   }
   ```

3. **Chronological Note History**: Timeline of client notes
4. **Note Type Differentiation**: Categories for different note purposes

   ```tsx
   // Note type UI differentiation (simplified)
   function getNoteTypeLabel(type) {
     switch (type) {
       case "general":
         return "Общая заметка";
       case "preference":
         return "Предпочтение";
       case "medical":
         return "Медицинская информация";
       default:
         return type;
     }
   }

   function getNoteBadgeClasses(type) {
     switch (type) {
       case "general":
         return "bg-blue-100 text-blue-800";
       case "preference":
         return "bg-purple-100 text-purple-800";
       case "medical":
         return "bg-red-100 text-red-800";
       default:
         return "bg-gray-100 text-gray-800";
     }
   }
   ```

## Database Schema

The platform uses MongoDB with the following collections:

### Users Collection

```typescript
interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password: string; // Hashed
  role: "admin" | "business" | "client";
  businessId?: ObjectId; // For business users
  emailVerified: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
```

### Businesses Collection

```typescript
interface Business {
  _id: ObjectId;
  ownerId: ObjectId;
  name: string;
  description?: string;
  category: string;
  address?: {
    street: string;
    city: string;
    postal?: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  workingHours: {
    monday: { isOpen: boolean; from?: string; to?: string };
    tuesday: { isOpen: boolean; from?: string; to?: string };
    // ... other days
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    // ... other platforms
  };
  logo?: string;
  images?: string[];
  createdAt: Date;
  updatedAt?: Date;
}
```

### Services Collection

```typescript
interface Service {
  _id: ObjectId;
  businessId: ObjectId;
  name: string;
  description?: string;
  duration: number; // In minutes
  price: number;
  category: string;
  createdAt: Date;
  updatedAt?: Date;
}
```

### Appointments Collection

```typescript
interface Appointment {
  _id: ObjectId;
  businessId: ObjectId;
  clientId: ObjectId;
  serviceId?: ObjectId;
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  paymentStatus: "pending" | "paid" | "refunded";
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
```

### Clients Collection

```typescript
interface Client {
  _id: ObjectId;
  businessId: ObjectId;
  userId?: ObjectId;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}
```

### ClientNotes Collection

```typescript
interface ClientNote {
  _id: ObjectId;
  clientId: ObjectId;
  businessId: ObjectId;
  content: string;
  type: "general" | "preference" | "medical";
  createdAt: Date;
  createdBy: ObjectId;
  authorName: string;
}
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `POST /api/auth/password-reset` - Request password reset
- `POST /api/auth/verify-token` - Verify email or reset token
- `POST /api/auth/reset-password` - Set new password

### Business Endpoints

- `POST /api/business/create` - Create a new business profile
- `GET /api/business/check` - Check business setup status
- `GET /api/business/[id]` - Get business details
- `PATCH /api/business/[id]` - Update business details
- `GET /api/dashboard/stats` - Get business dashboard statistics

### Services Endpoints

- `GET /api/services/list` - List services for a business
- `POST /api/services/create` - Create a new service
- `PATCH /api/services/update` - Update a service
- `DELETE /api/services/delete` - Delete a service

### Appointment Endpoints

- `GET /api/appointments/available-slots` - Get available time slots
- `POST /api/appointments/create` - Create a new appointment
- `GET /api/appointments/list` - List appointments
- `PATCH /api/appointments/update` - Update appointment status
- `POST /api/appointments/cancel` - Cancel an appointment

### Client Endpoints

- `GET /api/clients/list` - List clients with search and pagination
- `POST /api/clients/create` - Create a new client
- `GET /api/clients/[id]` - Get client details with history
- `PATCH /api/clients/[id]` - Update client information
- `GET /api/clients/[id]/notes` - Get client notes
- `POST /api/clients/[id]/notes` - Add a client note

## Future Development

The next phases of development will focus on:

1. **Phase 4: Payments** - Kaspi integration and financial dashboard
2. **Phase 5: Notifications** - Communication system via multiple channels
3. **Phase 6: Analytics & Polish** - Business insights and platform optimization

These phases will build upon the solid foundation and core features established in Phases 1-3.

---

This documentation represents the implementation details of Phases 1-3 of the Local Business Platform — Атырау project, completed as of July 11, 2025.
