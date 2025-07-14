/**
 * Validation utilities for forms and API endpoints
 */

import { WorkingHours, Service, Business } from "@/types/models";

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (Kazakhstan format)
 */
const PHONE_REGEX = /^(\+7|8)\d{10}$/;

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate client data
 */
export const validateClientData = (data: {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.name || !data.name.trim()) {
    errors.push("Name is required");
  }

  if (!data.phone || !data.phone.trim()) {
    errors.push("Phone is required");
  } else {
    const cleanPhone = data.phone.replace(/[\s\-\(\)]/g, "");
    if (!PHONE_REGEX.test(cleanPhone)) {
      errors.push("Invalid phone number format");
    }
  }

  if (data.email && data.email.trim() && !EMAIL_REGEX.test(data.email.trim())) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate appointment data
 */
export const validateAppointmentData = (data: {
  businessId: string;
  serviceId: string;
  startTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.businessId || !data.businessId.trim()) {
    errors.push("Business ID is required");
  }

  if (!data.serviceId || !data.serviceId.trim()) {
    errors.push("Service ID is required");
  }

  if (!data.startTime || !data.startTime.trim()) {
    errors.push("Start time is required");
  } else {
    const startDate = new Date(data.startTime);
    if (isNaN(startDate.getTime())) {
      errors.push("Invalid start time format");
    } else {
      // Allow appointments that are at least 5 minutes in the future
      // or in the past (for business owners creating catch-up appointments)
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      // Only restrict future appointments that are too close (less than 5 minutes)
      if (startDate > now && startDate < fiveMinutesFromNow) {
        errors.push("Appointment must be at least 5 minutes in the future");
      }
    }
  }

  if (!data.clientName || !data.clientName.trim()) {
    errors.push("Client name is required");
  }

  if (!data.clientPhone || !data.clientPhone.trim()) {
    errors.push("Client phone is required");
  } else {
    const cleanPhone = data.clientPhone.replace(/[\s\-\(\)]/g, "");
    if (!PHONE_REGEX.test(cleanPhone)) {
      errors.push("Invalid client phone number format");
    }
  }

  if (
    data.clientEmail &&
    data.clientEmail.trim() &&
    !EMAIL_REGEX.test(data.clientEmail.trim())
  ) {
    errors.push("Invalid client email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate service data
 */
export const validateServiceData = (
  data: Pick<
    Service,
    "name" | "duration" | "price" | "description" | "category"
  >
): ValidationResult => {
  const errors: string[] = [];

  if (!data.name || !data.name.toString().trim()) {
    errors.push("Service name is required");
  }

  if (!data.duration) {
    errors.push("Duration is required");
  } else {
    const duration =
      typeof data.duration === "string"
        ? parseInt(data.duration, 10)
        : data.duration;
    if (isNaN(duration) || duration <= 0) {
      errors.push("Duration must be a positive number");
    }
  }

  if (data.price === undefined || data.price === null) {
    errors.push("Price is required");
  } else {
    const price =
      typeof data.price === "string" ? parseFloat(data.price) : data.price;
    if (isNaN(price) || price < 0) {
      errors.push("Price must be a valid number");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate appointment update data
 */
export const validateAppointmentUpdateData = (data: {
  appointmentId: string;
  status?: string;
  paymentStatus?: string;
  notes?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.appointmentId || !data.appointmentId.trim()) {
    errors.push("Appointment ID is required");
  }

  if (
    data.status &&
    !["scheduled", "completed", "cancelled", "no-show"].includes(data.status)
  ) {
    errors.push("Invalid status value");
  }

  if (
    data.paymentStatus &&
    !["pending", "paid", "refunded"].includes(data.paymentStatus)
  ) {
    errors.push("Invalid payment status value");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate business creation data
 */
export const validateBusinessData = (data: {
  info?: Pick<Business, "name" | "category" | "description"> & {
    phone?: string;
    email?: string;
  };
  address?: Pick<
    Business["address"],
    "street" | "building" | "city" | "postalCode" | "landmark"
  >;
  services?: Array<
    Pick<Service, "name" | "duration" | "price" | "description" | "category">
  >;
  workingHours?: WorkingHours[];
}): ValidationResult => {
  const errors: string[] = [];

  // Validate business info
  if (!data.info?.name || !data.info.name.trim()) {
    errors.push("Business name is required");
  }

  if (data.info?.email && !EMAIL_REGEX.test(data.info.email.trim())) {
    errors.push("Invalid business email format");
  }

  if (data.info?.phone) {
    const cleanPhone = data.info.phone.replace(/[\s\-\(\)]/g, "");
    if (!PHONE_REGEX.test(cleanPhone)) {
      errors.push("Invalid business phone number format");
    }
  }

  // Validate address
  if (!data.address?.street || !data.address.street.trim()) {
    errors.push("Business address is required");
  }

  // Validate services
  if (!data.services || data.services.length === 0) {
    errors.push("At least one service is required");
  } else {
    data.services.forEach((service, index) => {
      if (!service.name || !service.name.trim()) {
        errors.push(`Service ${index + 1}: Name is required`);
      }
      if (
        service.duration &&
        (isNaN(service.duration) || service.duration <= 0)
      ) {
        errors.push(`Service ${index + 1}: Duration must be a positive number`);
      }
      if (service.price && (isNaN(service.price) || service.price < 0)) {
        errors.push(`Service ${index + 1}: Price must be a valid number`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validation service for common validation patterns
 */
export class ValidationService {
  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    return EMAIL_REGEX.test(email.trim());
  }

  /**
   * Validate phone number format
   */
  static validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    return PHONE_REGEX.test(cleanPhone);
  }

  /**
   * Validate required fields
   */
  static validateRequired(fields: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];

    for (const [fieldName, value] of Object.entries(fields)) {
      if (!value || (typeof value === "string" && !value.trim())) {
        errors.push(`${fieldName} is required`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate appointment data
   */
  static validateAppointment(data: {
    serviceId: string;
    startTime: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
  }): ValidationResult {
    const errors: string[] = [];

    // Required fields
    const requiredResult = this.validateRequired({
      serviceId: data.serviceId,
      startTime: data.startTime,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
    });

    errors.push(...requiredResult.errors);

    // Phone validation
    if (data.clientPhone && !this.validatePhone(data.clientPhone)) {
      errors.push("Invalid phone number format");
    }

    // Email validation (if provided)
    if (data.clientEmail && !this.validateEmail(data.clientEmail)) {
      errors.push("Invalid email format");
    }

    // Start time validation
    if (data.startTime) {
      const startDate = new Date(data.startTime);
      if (isNaN(startDate.getTime())) {
        errors.push("Invalid start time format");
      } else if (startDate < new Date()) {
        errors.push("Start time cannot be in the past");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate client data
   */
  static validateClient(data: {
    name: string;
    phone: string;
    email?: string;
  }): ValidationResult {
    const errors: string[] = [];

    // Required fields
    const requiredResult = this.validateRequired({
      name: data.name,
      phone: data.phone,
    });

    errors.push(...requiredResult.errors);

    // Phone validation
    if (data.phone && !this.validatePhone(data.phone)) {
      errors.push("Invalid phone number format");
    }

    // Email validation (if provided)
    if (data.email && !this.validateEmail(data.email)) {
      errors.push("Invalid email format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate service data
   */
  static validateService(
    data: Pick<Service, "name" | "duration" | "price" | "description">
  ): ValidationResult {
    const errors: string[] = [];

    // Required fields
    const requiredResult = this.validateRequired({
      name: data.name,
      duration: data.duration,
      price: data.price,
    });

    errors.push(...requiredResult.errors);

    // Duration validation
    if (data.duration && (isNaN(data.duration) || data.duration <= 0)) {
      errors.push("Duration must be a positive number");
    }

    // Price validation
    if (data.price && (isNaN(data.price) || data.price < 0)) {
      errors.push("Price must be a non-negative number");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate business data
   */
  static validateBusiness(
    data: Pick<Business, "name" | "description"> & {
      address: string;
      phone: string;
      email?: string;
    }
  ): ValidationResult {
    const errors: string[] = [];

    // Required fields
    const requiredResult = this.validateRequired({
      name: data.name,
      address: data.address,
      phone: data.phone,
    });

    errors.push(...requiredResult.errors);

    // Phone validation
    if (data.phone && !this.validatePhone(data.phone)) {
      errors.push("Invalid phone number format");
    }

    // Email validation (if provided)
    if (data.email && !this.validateEmail(data.email)) {
      errors.push("Invalid email format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
