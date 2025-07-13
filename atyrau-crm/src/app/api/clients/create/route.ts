import { NextRequest } from "next/server";
import { AuthService, ApiResponseService, ClientService } from "@/lib/services";
import { validateClientData } from "@/lib/utils/validation.utils";

export async function POST(request: NextRequest) {
  // Get and validate client data from request body
  const body = await request.json();
  const { name, phone, email, notes, businessId } = body;

  // Validate required fields
  const validation = validateClientData({ name, phone, email, notes });
  if (!validation.isValid) {
    return ApiResponseService.validationError(validation.errors);
  }

  // Authenticate user
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return authResult.error === "unauthorized"
      ? ApiResponseService.unauthorized("Authentication required")
      : ApiResponseService.error("Authentication failed");
  }

  const { user } = authResult;

  // Get target business ID
  const targetBusinessId =
    businessId || (await AuthService.getBusinessIdForUser(user._id));
  if (!targetBusinessId) {
    return ApiResponseService.validationError(["Business ID is required"]);
  }

  // Verify business ownership/access
  const hasAccess = await AuthService.verifyBusinessOwnership(
    user,
    targetBusinessId
  );
  if (!hasAccess) {
    return ApiResponseService.error(
      "You do not have permission to add clients to this business",
      403
    );
  }

  // Create client using ClientService
  const clientResult = await ClientService.createClient(targetBusinessId, {
    name,
    phone,
    email: email || null,
    notes: notes || "",
    createdBy: user._id.toString(),
  });

  if (!clientResult.success) {
    return ApiResponseService.error(
      clientResult.error || "Failed to create client"
    );
  }

  return ApiResponseService.success(clientResult.data);
}
