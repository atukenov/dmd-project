import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BusinessState {
  businessId: string | null;
  businessName: string | null;
  isBusinessSetup: boolean;
  setBusinessId: (id: string) => void;
  setBusinessName: (name: string) => void;
  setIsBusinessSetup: (isSetup: boolean) => void;
  reset: () => void;
}

/**
 * Global store for business-related state
 * Persisted to localStorage to maintain state across page refreshes
 */
export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      businessId: null,
      businessName: null,
      isBusinessSetup: false,
      setBusinessId: (id) => set({ businessId: id }),
      setBusinessName: (name) => set({ businessName: name }),
      setIsBusinessSetup: (isSetup) => set({ isBusinessSetup: isSetup }),
      reset: () =>
        set({ businessId: null, businessName: null, isBusinessSetup: false }),
    }),
    {
      name: "business-storage", // unique name for localStorage
    }
  )
);
