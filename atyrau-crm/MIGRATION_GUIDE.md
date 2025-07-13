# Service Layer Migration Guide

This guide shows how to refactor existing API routes to use the new service layer architecture.

## Overview

The new service layer provides centralized functionality for:

- **AuthService**: Authentication and authorization
- **DatabaseService**: Database connections and operations
- **ApiResponseService**: Standardized API responses
- **BusinessService**: Business-related operations
- **Validation utilities**: Form and data validation

## Before and After Examples

### Original API Route Pattern

```typescript
// Before: Duplicated code in each route
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Manual validation
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    // Manual auth
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Manual database connection
    const client = await clientPromise;
    const db = client.db();

    // Business logic mixed with infrastructure
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });
    // ... rest of logic
  } catch (error) {
    // Manual error handling
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
```

### Refactored Using Service Layer

```typescript
// After: Clean, reusable service layer
import { NextRequest } from "next/server";
import {
  AuthService,
  DatabaseService,
  ApiResponseService,
} from "@/lib/services";
import { validateClientData } from "@/lib/utils/validation.utils";

export async function POST(request: NextRequest) {
  return DatabaseService.executeOperation(async () => {
    const body = await request.json();

    // Centralized validation
    const validation = validateClientData(body);
    if (!validation.isValid) {
      return ApiResponseService.validationError(validation.errors);
    }

    // Centralized authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return ApiResponseService.unauthorized();
    }

    // Business logic separated from infrastructure
    const db = await DatabaseService.getDatabase();
    // ... clean business logic

    return ApiResponseService.success(result);
  });
}
```

## Key Benefits

1. **Eliminated Code Duplication**:

   - 20+ API routes with identical auth patterns → 1 AuthService
   - Multiple formatTimeDisplay functions → 1 date utility
   - Repeated MongoDB connections → 1 DatabaseService

2. **Improved Type Safety**:

   - Consistent interfaces across services
   - Better error handling and response types

3. **Enhanced Maintainability**:

   - Changes to auth logic only need updates in AuthService
   - Consistent error responses across all endpoints
   - Separated concerns: business logic vs infrastructure

4. **Standardized Patterns**:
   - All API responses follow same format
   - Consistent validation patterns
   - Unified error handling

## Migration Steps

### Step 1: Update Imports

Replace individual imports with service imports:

```typescript
// Old
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";

// New
import {
  AuthService,
  DatabaseService,
  ApiResponseService,
} from "@/lib/services";
```

### Step 2: Replace Authentication Logic

```typescript
// Old
const token = await getToken({ req: request });
if (!token) {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

// New
const authResult = await AuthService.authenticateRequest(request);
if (!authResult.success || !authResult.user) {
  return ApiResponseService.unauthorized();
}
```

### Step 3: Replace Database Operations

```typescript
// Old
const client = await clientPromise;
const db = client.db();

// New
const db = await DatabaseService.getDatabase();
```

### Step 4: Standardize Responses

```typescript
// Old
return NextResponse.json({ message: "Success", data: result });

// New
return ApiResponseService.success(result, "Success");
```

### Step 5: Add Validation

```typescript
// Old
if (!name || !phone) {
  return NextResponse.json({ message: "Required fields" }, { status: 400 });
}

// New
const validation = validateClientData({ name, phone, email });
if (!validation.isValid) {
  return ApiResponseService.validationError(validation.errors);
}
```

## Files to Update

The following files contain duplicated patterns that should be refactored:

### API Routes with Auth Duplication:

- `/api/appointments/create/route.ts`
- `/api/appointments/[id]/route.ts`
- `/api/clients/create/route.ts`
- `/api/clients/[id]/route.ts`
- `/api/services/create/route.ts`
- `/api/services/[id]/route.ts`
- And 15+ other API routes...

### Components with Date Utilities:

- `src/app/dashboard/appointments/page.tsx` - formatTimeDisplay
- Components using date formatting

### Priority Order:

1. **High Priority**: API routes with authentication (security)
2. **Medium Priority**: Components with duplicated utilities
3. **Low Priority**: Error handling standardization

## Testing After Migration

After refactoring each route:

1. Test authentication flows
2. Verify error responses are consistent
3. Check that business logic remains intact
4. Ensure TypeScript compilation passes

## Next Steps

1. Start with one API route (like `/api/clients/create`)
2. Test thoroughly
3. Apply the same pattern to other routes
4. Update frontend components to use centralized utilities
5. Remove old duplicated code
