import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  ServiceService,
} from "@/lib/services";

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const businessId = searchParams.get("businessId");

  // Authenticate user
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  const { user } = authResult;

  // Determine target business ID
  let targetBusinessId = businessId;

  if (!targetBusinessId) {
    // If no businessId provided, get user's business
    const userBusinessId = await AuthService.getBusinessIdForUser(user._id);
    if (!userBusinessId) {
      return ApiResponseService.forbidden(
        "No business associated with this user"
      );
    }
    targetBusinessId = userBusinessId;
  } else {
    // If businessId is provided, check permissions
    if (!AuthService.isAdmin(user)) {
      const hasAccess = await AuthService.verifyBusinessOwnership(
        user,
        targetBusinessId
      );
      if (!hasAccess) {
        return ApiResponseService.forbidden(
          "You do not have permission to access this business"
        );
      }
    }
  }

  // Get services
  const servicesResult = await ServiceService.getBusinessServices(
    targetBusinessId
  );
  if (!servicesResult.success) {
    return ApiResponseService.error(
      servicesResult.error || "Failed to fetch services"
    );
  }

  return ApiResponseService.success({ services: servicesResult.data });
}
