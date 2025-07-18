# 🔔 Notification System Documentation

## Overview

The Atyrau CRM notification system provides a comprehensive solution for displaying user feedback through toast notifications. It supports multiple notification types, auto-dismissal, custom actions, and seamless integration with the application's theme system.

## Features

### ✨ Core Features

- **4 Notification Types**: Success, Error, Warning, Info
- **Auto-dismiss**: Configurable duration with progress indicator
- **Manual dismiss**: User can close notifications manually
- **Custom actions**: Add buttons with custom functionality
- **Queue management**: Maximum 5 notifications on screen
- **Persistent notifications**: Set duration to 0 for manual-only dismissal
- **Theme integration**: Supports light/dark themes
- **Animations**: Smooth slide-in/out transitions
- **Templates**: Predefined messages for common operations

### 🎨 Visual Features

- **Progress bar**: Shows remaining time for auto-dismiss notifications
- **Icons**: Type-specific icons for visual recognition
- **Colors**: Theme-aware color coding
- **Positioning**: Top-right corner with proper z-index
- **Responsive**: Mobile-friendly design

## Installation & Setup

### 1. Provider Setup

The notification system is already integrated into the main providers:

```tsx
// src/components/providers/providers.tsx
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import NotificationContainer from "@/components/organisms/NotificationContainer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <NotificationProvider>
          {children}
          <NotificationContainer />
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
```

### 2. CSS Animations

Animations are defined in `globals.css`:

```css
@keyframes slideInRight {
  /* ... */
}
@keyframes slideOutRight {
  /* ... */
}
@keyframes shrinkWidth {
  /* ... */
}
```

## Usage

### Basic Notifications

```tsx
import { useNotifications } from "@/components/providers/NotificationProvider";

function MyComponent() {
  const { success, error, warning, info } = useNotifications();

  const handleSuccess = () => {
    success("Success!", "Operation completed successfully");
  };

  const handleError = () => {
    error("Error!", "Something went wrong");
  };

  const handleWarning = () => {
    warning("Warning!", "Please check your input");
  };

  const handleInfo = () => {
    info("Info", "Additional information for user");
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### Template Notifications

```tsx
import { useNotificationTemplates } from "@/components/providers/NotificationProvider";

function BusinessComponent() {
  const notify = useNotificationTemplates();

  const handleServiceCreate = () => {
    notify.serviceCreated();
  };

  const handleClientUpdate = () => {
    notify.clientUpdated();
  };

  const handleAppointmentCancel = () => {
    notify.appointmentCancelled();
  };

  return (
    <div>
      <button onClick={handleServiceCreate}>Create Service</button>
      <button onClick={handleClientUpdate}>Update Client</button>
      <button onClick={handleAppointmentCancel}>Cancel Appointment</button>
    </div>
  );
}
```

### Advanced Notifications

```tsx
import { useNotifications } from "@/components/providers/NotificationProvider";

function AdvancedComponent() {
  const { addNotification } = useNotifications();

  const handleCustomNotification = () => {
    addNotification({
      type: "info",
      title: "Custom Notification",
      message: "This notification has a custom action",
      duration: 10000, // 10 seconds
      action: {
        label: "Open Settings",
        onClick: () => {
          // Navigate to settings or perform action
          window.location.href = "/settings";
        },
      },
    });
  };

  const handlePersistentNotification = () => {
    addNotification({
      type: "warning",
      title: "Important Notice",
      message: "This notification stays until manually dismissed",
      duration: 0, // Persistent
      dismissible: true,
    });
  };

  return (
    <div>
      <button onClick={handleCustomNotification}>Custom Action</button>
      <button onClick={handlePersistentNotification}>Persistent</button>
    </div>
  );
}
```

### Form Integration

```tsx
import { useFormWithNotifications } from "@/hooks/useFormWithNotifications";

function ServiceForm() {
  const { loading, handleSubmit } = useFormWithNotifications({
    successTemplate: "serviceCreated",
    errorTemplate: "serviceError",
    onSuccess: () => {
      // Additional success logic
      router.push("/services");
    },
  });

  const onSubmit = async (data: ServiceData) => {
    await handleSubmit(async () => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create service");
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
    >
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Service"}
      </button>
    </form>
  );
}
```

### API Integration

```tsx
import { useServiceApi } from "@/hooks/useApiCall";

function ServiceManager() {
  const { createService, updateService, deleteService, loading } =
    useServiceApi();

  const handleCreate = async () => {
    await createService({
      name: "New Service",
      price: 100,
      duration: 60,
    });
    // Automatic success/error notifications
  };

  const handleUpdate = async (id: string) => {
    await updateService(id, {
      name: "Updated Service",
      price: 120,
    });
    // Automatic success/error notifications
  };

  const handleDelete = async (id: string) => {
    await deleteService(id);
    // Automatic success/error notifications
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={loading}>
        Create
      </button>
      <button onClick={() => handleUpdate("123")} disabled={loading}>
        Update
      </button>
      <button onClick={() => handleDelete("123")} disabled={loading}>
        Delete
      </button>
    </div>
  );
}
```

## Configuration

### Notification Types

```typescript
type NotificationType = "success" | "error" | "warning" | "info";
```

### Notification Interface

```typescript
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 = persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  createdAt: Date;
}
```

### Default Durations

- **Success**: 5 seconds
- **Error**: 8 seconds (longer for user to read)
- **Warning**: 6 seconds
- **Info**: 5 seconds

### Template Categories

1. **Authentication**: login, logout, registration
2. **Business Operations**: profile save/error
3. **Service Management**: create, update, delete, error
4. **Client Management**: create, update, delete, error
5. **Appointments**: create, update, cancel, error
6. **Payments**: success, pending, error
7. **General**: save, delete, network error, validation

## Styling

### CSS Classes

```css
/* Notification container */
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 50;
}

/* Toast animations */
.notification-enter {
  animation: slideInRight 0.3s ease-out;
}
.notification-exit {
  animation: slideOutRight 0.3s ease-in;
}
.notification-progress {
  animation: shrinkWidth var(--duration) linear;
}
```

### Theme Colors

```css
/* Success */
--color-success: #22c55e;
--color-success-bg: rgba(34, 197, 94, 0.1);

/* Error */
--color-error: #ef4444;
--color-error-bg: rgba(239, 68, 68, 0.1);

/* Warning */
--color-warning: #f59e0b;
--color-warning-bg: rgba(245, 158, 11, 0.1);

/* Info */
--color-info: #3b82f6;
--color-info-bg: rgba(59, 130, 246, 0.1);
```

## Best Practices

### 1. Use Appropriate Types

- **Success**: Completed operations (save, create, update)
- **Error**: Failed operations, validation errors
- **Warning**: User attention needed, non-critical issues
- **Info**: Additional information, tips, status updates

### 2. Message Guidelines

- **Title**: Short, clear action description
- **Message**: Brief explanation or result
- **Avoid**: Technical error codes in user messages

### 3. Duration Settings

- **Quick feedback**: 3-5 seconds
- **Important info**: 6-8 seconds
- **Critical errors**: Persistent (duration: 0)

### 4. Actions

- Use for relevant follow-up actions
- Keep action labels short and clear
- Don't overuse - reserve for important workflows

## Demo & Testing

### Demo Page

Visit `/demo/notifications` to test all notification types and features.

### Management Interface

Visit `/demo/notification-management` to see active notifications and statistics.

## File Structure

```
src/
├── lib/notifications/
│   ├── types.ts              # TypeScript interfaces
│   └── templates.ts          # Predefined message templates
├── components/
│   ├── providers/
│   │   └── NotificationProvider.tsx  # Context and state management
│   ├── molecules/
│   │   └── NotificationToast.tsx     # Individual toast component
│   └── organisms/
│       └── NotificationContainer.tsx # Container and portal
├── hooks/
│   ├── useApiCall.ts         # API integration with notifications
│   └── useFormWithNotifications.ts  # Form submission helpers
└── app/
    └── demo/
        ├── notifications/    # Demo page
        └── notification-management/  # Management interface
```

## Future Enhancements

### Planned Features

- **Sound notifications**: Audio feedback option
- **Notification history**: Persistent log
- **User preferences**: Disable specific notification types
- **Email notifications**: Server-side notification system
- **Push notifications**: Browser push API integration
- **Notification scheduling**: Delayed notifications

### External Integrations

- **Telegram Bot**: Send notifications via Telegram
- **WhatsApp API**: Send notifications via WhatsApp
- **Email service**: SMTP integration for email notifications
- **SMS service**: Text message notifications

## Troubleshooting

### Common Issues

1. **Notifications not appearing**

   - Check if NotificationProvider is wrapping your app
   - Verify NotificationContainer is rendered
   - Check for z-index conflicts

2. **Hydration errors**

   - Use NoSSR wrapper for client-only components
   - Ensure consistent server/client rendering

3. **Animations not working**

   - Verify CSS animations are loaded
   - Check for conflicting CSS transitions

4. **Multiple notifications stacking incorrectly**
   - Check notification container positioning
   - Verify portal rendering to document.body

### Debug Mode

```tsx
// Enable debug mode to log notification events
const { notifications } = useNotifications();
console.log("Active notifications:", notifications);
```

## Support

For issues or feature requests, please:

1. Check the demo pages for examples
2. Review the TypeScript interfaces
3. Test with the management interface
4. Check browser console for errors

The notification system is designed to be flexible and extensible while maintaining consistency across the application.
