import { useState, useEffect } from "react";
import { useBusinessStore } from "@/store/businessStore";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image: string | null;
  isActive: boolean;
}

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
  const fetchServices = async () => {
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
      setServices(data.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch services");
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch services when businessId changes
  useEffect(() => {
    fetchServices();
  }, [businessId]);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
  };
}
