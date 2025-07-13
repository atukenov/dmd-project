import { NextRequest } from "next/server";
import { AuthService, ApiResponseService, ClientService } from "@/lib/services";

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const businessId = searchParams.get("businessId");
  const query = searchParams.get("query");
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const skip = parseInt(searchParams.get("skip") || "0", 10);

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

  // Get client list with options
  const clientsResult = await ClientService.getClientList(targetBusinessId, {
    query: query || undefined,
    limit,
    skip,
  });

  if (!clientsResult.success) {
    return ApiResponseService.error(
      clientsResult.error || "Failed to fetch clients"
    );
  }

  return ApiResponseService.success(clientsResult.data);
}
