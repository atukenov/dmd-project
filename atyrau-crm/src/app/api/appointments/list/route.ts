import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  BusinessService,
} from "@/lib/services";

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const requestedBusinessId = searchParams.get("businessId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const status = searchParams.get("status");

  // Authenticate user
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized("Authentication required");
  }

  const { user } = authResult;

  // Get business ID with role-based access control
  const businessResult = await AuthService.getBusinessIdForUserWithRole(
    user,
    requestedBusinessId || undefined
  );
  if (!businessResult.success) {
    return ApiResponseService.error(
      businessResult.error || "Access denied",
      403
    );
  }

  const businessId = businessResult.businessId!;

  // Get appointments with filters
  const appointmentsResult = await BusinessService.getAppointments({
    businessId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: status || undefined,
  });

  if (!appointmentsResult.success) {
    return ApiResponseService.error("Failed to fetch appointments");
  }

  return ApiResponseService.success({
    appointments: appointmentsResult.data,
  });
}
