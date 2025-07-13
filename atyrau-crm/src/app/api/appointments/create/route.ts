import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  BusinessService,
} from "@/lib/services";
import { validateAppointmentData } from "@/lib/utils/validation.utils";

export async function POST(request: NextRequest) {
  // Get appointment data from request body
  const body = await request.json();
  const {
    businessId,
    serviceId,
    startTime,
    clientName,
    clientPhone,
    clientEmail,
    notes,
  } = body;

  // Validate required fields
  const validation = validateAppointmentData({
    businessId,
    serviceId,
    startTime,
    clientName,
    clientPhone,
    clientEmail,
  });
  if (!validation.isValid) {
    return ApiResponseService.validationError(validation.errors);
  }

  // Get service details to calculate appointment duration
  const serviceResult = await BusinessService.getServiceById(serviceId);
  if (!serviceResult.success || !serviceResult.data) {
    return ApiResponseService.error("Service not found", 404);
  }
  const service = serviceResult.data;

  // Calculate endTime based on service duration
  const requestedStart = new Date(startTime);
  const requestedEnd = new Date(
    requestedStart.getTime() + service.duration * 60 * 1000
  ); // duration is in minutes

  // Check for time conflicts
  const conflictResult = await BusinessService.checkTimeConflicts(
    businessId,
    requestedStart,
    requestedEnd
  );
  if (!conflictResult.success) {
    return ApiResponseService.error("Failed to check time conflicts");
  }
  if (conflictResult.data) {
    return ApiResponseService.error("This time slot is already booked", 409);
  }

  // Check if user is authenticated (for client identification)
  const authResult = await AuthService.authenticateRequest(request);
  const userId =
    authResult.success && authResult.user
      ? authResult.user._id.toString()
      : undefined;

  // Get or create client record
  const clientResult = await BusinessService.getOrCreateClient(businessId, {
    name: clientName,
    phone: clientPhone,
    email: clientEmail,
    userId,
  });
  if (!clientResult.success || !clientResult.data) {
    return ApiResponseService.error("Failed to process client information");
  }
  const clientId = clientResult.data;

  // Create the appointment
  const appointmentResult = await BusinessService.createAppointment({
    businessId,
    clientId,
    serviceId,
    startTime: requestedStart,
    endTime: requestedEnd,
    totalAmount: service.price,
    notes,
  });

  if (!appointmentResult.success || !appointmentResult.data) {
    return ApiResponseService.error("Failed to create appointment");
  }

  return ApiResponseService.success({
    message: "Appointment booked successfully",
    appointmentId: appointmentResult.data.appointmentId,
    appointment: appointmentResult.data.appointment,
  });
}
