import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  BusinessService,
} from "@/lib/services";

export async function POST(request: NextRequest) {
  // Get appointment data from request body
  const body = await request.json();
  const { appointmentId, cancellationReason } = body;

  // Validate input
  if (!appointmentId || !appointmentId.trim()) {
    return ApiResponseService.validationError(["Appointment ID is required"]);
  }

  // Authenticate user
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized("Authentication required");
  }

  const { user } = authResult;

  // Cancel appointment (this includes fetching the appointment and getting business/client IDs)
  const cancelResult = await BusinessService.cancelAppointment(appointmentId, {
    cancellationReason,
    cancelledBy: user.role || "user",
    cancellerId: user._id,
  });

  if (!cancelResult.success || !cancelResult.data) {
    return ApiResponseService.error(
      cancelResult.error || "Failed to cancel appointment",
      404
    );
  }

  const { businessId, clientId } = cancelResult.data;

  // Verify user has permission to cancel this appointment
  const hasAccess = await AuthService.canAccessAppointment(
    user,
    businessId,
    clientId
  );
  if (!hasAccess) {
    return ApiResponseService.error(
      "You do not have permission to cancel this appointment",
      403
    );
  }

  return ApiResponseService.success({
    message: "Appointment cancelled successfully",
  });
}
