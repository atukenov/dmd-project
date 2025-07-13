import { NextRequest } from "next/server";
import { AuthService, ApiResponseService, ClientService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const clientId = params.id;

  if (!clientId) {
    return ApiResponseService.validationError("Client ID is required");
  }

  // Authenticate user and get business
  const authResult = await AuthService.authenticateRequestWithBusiness(request);
  if (!authResult.success || !authResult.businessId) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  // Get client details
  const clientResult = await ClientService.getClientDetails(
    clientId,
    authResult.businessId
  );
  if (!clientResult.success) {
    return ApiResponseService.error(
      clientResult.error || "Failed to get client details"
    );
  }

  return ApiResponseService.success(clientResult.data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const clientId = params.id;

  if (!clientId) {
    return ApiResponseService.validationError("Client ID is required");
  }

  // Authenticate user and get business
  const authResult = await AuthService.authenticateRequestWithBusiness(request);
  if (!authResult.success || !authResult.businessId) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  // Get update data from request body
  const updateData = await request.json();

  // Update client
  const updateResult = await ClientService.updateClient(
    clientId,
    authResult.businessId,
    updateData
  );
  if (!updateResult.success) {
    return ApiResponseService.error(
      updateResult.error || "Failed to update client"
    );
  }

  return ApiResponseService.success(updateResult.data);
}
