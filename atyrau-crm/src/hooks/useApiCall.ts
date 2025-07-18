"use client";

import { useState } from "react";
import { useNotificationTemplates } from "@/components/providers/NotificationProvider";

interface UseApiCallOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export function useApiCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotificationTemplates();

  const execute = async <T>(
    apiCall: () => Promise<T>,
    options: UseApiCallOptions = {}
  ): Promise<T | null> => {
    const {
      successMessage,
      errorMessage,
      showSuccessNotification = true,
      showErrorNotification = true,
      onSuccess,
      onError,
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();

      if (showSuccessNotification) {
        if (successMessage) {
          notify.saveSuccess();
        } else {
          notify.saveSuccess();
        }
      }

      onSuccess?.(result);
      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Произошла ошибка";
      setError(errorMsg);

      if (showErrorNotification) {
        if (errorMessage) {
          notify.saveError();
        } else {
          notify.networkError();
        }
      }

      onError?.(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    execute,
  };
}

// Predefined API call hooks for common operations
export function useServiceApi() {
  const apiCall = useApiCall();
  const notify = useNotificationTemplates();

  return {
    ...apiCall,
    createService: (serviceData: Record<string, unknown>) =>
      apiCall.execute(
        () =>
          fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serviceData),
          }).then((res) => res.json()),
        {
          onSuccess: () => notify.serviceCreated(),
          onError: () => notify.serviceError(),
        }
      ),

    updateService: (id: string, serviceData: Record<string, unknown>) =>
      apiCall.execute(
        () =>
          fetch(`/api/services/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serviceData),
          }).then((res) => res.json()),
        {
          onSuccess: () => notify.serviceUpdated(),
          onError: () => notify.serviceError(),
        }
      ),

    deleteService: (id: string) =>
      apiCall.execute(
        () => fetch(`/api/services/${id}`, { method: "DELETE" }),
        {
          onSuccess: () => notify.serviceDeleted(),
          onError: () => notify.serviceError(),
        }
      ),
  };
}

export function useClientApi() {
  const apiCall = useApiCall();
  const notify = useNotificationTemplates();

  return {
    ...apiCall,
    createClient: (clientData: Record<string, unknown>) =>
      apiCall.execute(
        () =>
          fetch("/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clientData),
          }).then((res) => res.json()),
        {
          onSuccess: () => notify.clientCreated(),
          onError: () => notify.clientError(),
        }
      ),

    updateClient: (id: string, clientData: Record<string, unknown>) =>
      apiCall.execute(
        () =>
          fetch(`/api/clients/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clientData),
          }).then((res) => res.json()),
        {
          onSuccess: () => notify.clientUpdated(),
          onError: () => notify.clientError(),
        }
      ),

    deleteClient: (id: string) =>
      apiCall.execute(() => fetch(`/api/clients/${id}`, { method: "DELETE" }), {
        onSuccess: () => notify.clientDeleted(),
        onError: () => notify.clientError(),
      }),
  };
}

export function useAppointmentApi() {
  const apiCall = useApiCall();
  const notify = useNotificationTemplates();

  return {
    ...apiCall,
    createAppointment: (appointmentData: Record<string, unknown>) =>
      apiCall.execute(
        () =>
          fetch("/api/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData),
          }).then((res) => res.json()),
        {
          onSuccess: () => notify.appointmentCreated(),
          onError: () => notify.appointmentError(),
        }
      ),

    updateAppointment: (id: string, appointmentData: Record<string, unknown>) =>
      apiCall.execute(
        () =>
          fetch(`/api/appointments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData),
          }).then((res) => res.json()),
        {
          onSuccess: () => notify.appointmentUpdated(),
          onError: () => notify.appointmentError(),
        }
      ),

    cancelAppointment: (id: string, reason?: string) =>
      apiCall.execute(
        () =>
          fetch(`/api/appointments/${id}/cancel`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
          }).then((res) => res.json()),
        {
          onSuccess: () => notify.appointmentCancelled(),
          onError: () => notify.appointmentError(),
        }
      ),
  };
}

export function useBusinessApi() {
  const apiCall = useApiCall();
  const notify = useNotificationTemplates();

  return {
    ...apiCall,
    updateBusinessProfile: (profileData: Record<string, unknown>) =>
      apiCall.execute(
        () =>
          fetch("/api/business/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
          }).then((res) => res.json()),
        {
          onSuccess: () => notify.businessProfileSaved(),
          onError: () => notify.businessProfileError(),
        }
      ),
  };
}
