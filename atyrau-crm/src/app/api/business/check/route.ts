import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  BusinessService,
} from "@/lib/services";

/**
 * Checks if the authenticated user has completed business setup
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized("Authentication required");
  }

  const { user } = authResult;

  // Check business setup status
  const setupResult = await BusinessService.checkBusinessSetup(
    user._id.toString()
  );
  if (!setupResult.success || !setupResult.data) {
    return ApiResponseService.error(
      setupResult.error || "Failed to check business setup"
    );
  }

  // Format response to match frontend expectations
  const responseData = {
    ...setupResult.data,
    // Add top-level fields for compatibility with dashboard
    businessId:
      setupResult.data.hasSetup && setupResult.data.business
        ? setupResult.data.business._id
        : null,
    businessName:
      setupResult.data.hasSetup && setupResult.data.business
        ? setupResult.data.business.name
        : null,
  };

  return ApiResponseService.success(responseData);
}
