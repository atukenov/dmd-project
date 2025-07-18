"use client";

import { useState } from "react";
import { useNotificationTemplates } from "@/components/providers/NotificationProvider";

interface UseFormWithNotificationsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successTemplate?: keyof ReturnType<typeof useNotificationTemplates>;
  errorTemplate?: keyof ReturnType<typeof useNotificationTemplates>;
}

export function useFormWithNotifications(
  options: UseFormWithNotificationsOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotificationTemplates();

  const {
    onSuccess,
    onError,
    successTemplate = "saveSuccess",
    errorTemplate = "saveError",
  } = options;

  const handleSubmit = async (submitFunction: () => Promise<void>) => {
    setLoading(true);
    setError(null);

    try {
      await submitFunction();

      // Show success notification
      if (successTemplate && typeof notify[successTemplate] === "function") {
        (notify[successTemplate] as () => void)();
      }

      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Произошла ошибка";
      setError(errorMessage);

      // Show error notification
      if (errorTemplate && typeof notify[errorTemplate] === "function") {
        (notify[errorTemplate] as () => void)();
      }

      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleSubmit,
    clearError: () => setError(null),
  };
}

// Convenience hooks for specific form types
export function useServiceForm() {
  return useFormWithNotifications({
    successTemplate: "serviceCreated",
    errorTemplate: "serviceError",
  });
}

export function useClientForm() {
  return useFormWithNotifications({
    successTemplate: "clientCreated",
    errorTemplate: "clientError",
  });
}

export function useAppointmentForm() {
  return useFormWithNotifications({
    successTemplate: "appointmentCreated",
    errorTemplate: "appointmentError",
  });
}

export function useBusinessForm() {
  return useFormWithNotifications({
    successTemplate: "businessProfileSaved",
    errorTemplate: "businessProfileError",
  });
}
