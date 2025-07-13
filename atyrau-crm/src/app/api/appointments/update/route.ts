import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  BusinessService,
} from "@/lib/services";
import { validateAppointmentUpdateData } from "@/lib/utils/validation.utils";

export async function PATCH(request: NextRequest) {
  // Get appointment data from request body
  const body = await request.json();
  const { appointmentId, status, paymentStatus, notes } = body;

  // Validate input data
  const validation = validateAppointmentUpdateData({
    appointmentId,
    status,
    paymentStatus,
    notes,
  });
  if (!validation.isValid) {
    return ApiResponseService.validationError(validation.errors);
  }

  // Authenticate user
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized("Authentication required");
  }

  const { user } = authResult;

  // Update appointment (this will also verify business ownership)
  const updateResult = await BusinessService.updateAppointment(appointmentId, {
    status,
    paymentStatus,
    notes,
  });

  if (!updateResult.success || !updateResult.data) {
    return ApiResponseService.error(
      updateResult.error || "Failed to update appointment",
      404
    );
  }

  const { appointment, businessId } = updateResult.data;

  // Verify user has permission to update this appointment
  const hasAccess = await AuthService.verifyBusinessOwnership(user, businessId);
  if (!hasAccess) {
    return ApiResponseService.error(
      "You do not have permission to update this appointment",
      403
    );
  }

  return ApiResponseService.success({
    message: "Appointment updated successfully",
    appointment,
  });
}
