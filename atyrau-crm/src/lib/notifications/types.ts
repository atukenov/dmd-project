export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 means persist until dismissed
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  createdAt: Date;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  success: (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => string;
  error: (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => string;
  warning: (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => string;
  info: (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => string;
}

// Predefined notification templates for common scenarios
export interface NotificationTemplates {
  // Authentication
  loginSuccess: { title: string; message: string };
  loginError: { title: string; message: string };
  logoutSuccess: { title: string; message: string };
  registrationSuccess: { title: string; message: string };

  // Business operations
  businessProfileSaved: { title: string; message: string };
  businessProfileError: { title: string; message: string };

  // Service management
  serviceCreated: { title: string; message: string };
  serviceUpdated: { title: string; message: string };
  serviceDeleted: { title: string; message: string };
  serviceError: { title: string; message: string };

  // Client management
  clientCreated: { title: string; message: string };
  clientUpdated: { title: string; message: string };
  clientDeleted: { title: string; message: string };
  clientError: { title: string; message: string };

  // Appointments
  appointmentCreated: { title: string; message: string };
  appointmentUpdated: { title: string; message: string };
  appointmentCancelled: { title: string; message: string };
  appointmentError: { title: string; message: string };

  // Payments
  paymentSuccess: { title: string; message: string };
  paymentPending: { title: string; message: string };
  paymentError: { title: string; message: string };

  // General
  saveSuccess: { title: string; message: string };
  saveError: { title: string; message: string };
  deleteSuccess: { title: string; message: string };
  deleteError: { title: string; message: string };
  networkError: { title: string; message: string };
  validationError: { title: string; message: string };
}
