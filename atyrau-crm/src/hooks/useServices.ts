import { useState, useEffect, useCallback } from "react";
import { useBusinessStore } from "@/store/businessStore";
import { Service } from "@/types/models";

interface UseServicesResult {
  services: Service[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching services for the current business
 * Uses businessId from the global business store
 */
export function useServices(): UseServicesResult {
  const { businessId } = useBusinessStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch services
  const fetchServices = useCallback(async () => {
    if (!businessId) {
      setError("No business ID available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/business/${businessId}/services`);

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.statusText}`);
      }
      const data = await response.json();

      // Handle the ApiResponseService structure: { success: true, data: { services: [...] } }
      if (data.success && data.data && data.data.services !== undefined) {
        setServices(data.data.services);
      } else if (data.success === false) {
        // Handle API error response
        throw new Error(data.error || "Failed to fetch services");
      } else {
        // Fallback for unexpected response structure
        console.warn("Unexpected API response structure:", data);
        setServices([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch services");
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  // Fetch services when businessId changes
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
  };
}
