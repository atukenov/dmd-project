import { useState } from "react";
import { useBusinessStore } from "@/store/businessStore";
import { useServices } from "./useServices";
import { Service } from "@/types/models";

interface AppointmentFormData {
  serviceId: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
}

interface UseAppointmentsResult {
  services: Service[]; // Services from the useServices hook
  servicesLoading: boolean;
  servicesError: string | null;
  createAppointment: (data: AppointmentFormData) => Promise<unknown>;
  isCreating: boolean;
  createError: string | null;
}

/**
 * Custom hook for managing appointments with business services integration
 */
export function useAppointments(): UseAppointmentsResult {
  const { businessId } = useBusinessStore();
  const {
    services,
    loading: servicesLoading,
    error: servicesError,
  } = useServices();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Function to create a new appointment
  const createAppointment = async (data: AppointmentFormData) => {
    if (!businessId) {
      setCreateError("No business ID available");
      return null;
    }

    try {
      setIsCreating(true);
      setCreateError(null);

      const response = await fetch("/api/appointments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create appointment");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create appointment";
      setCreateError(errorMessage);
      console.error("Error creating appointment:", err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    services,
    servicesLoading,
    servicesError,
    createAppointment,
    isCreating,
    createError,
  };
}

