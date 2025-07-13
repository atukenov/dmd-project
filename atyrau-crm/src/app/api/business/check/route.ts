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
  if (!setupResult.success) {
    return ApiResponseService.error(
      setupResult.error || "Failed to check business setup"
    );
  }

  return ApiResponseService.success(setupResult.data);
}
