import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  ServiceService,
} from "@/lib/services";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  const params = await context.params;
  const businessId = params.businessId;

  if (!businessId) {
    return ApiResponseService.error("Invalid business ID", 400);
  }

  const result = await ServiceService.getServicesByBusiness(
    businessId,
    authResult.user._id.toString()
  );

  if (!result.success || !result.data) {
    return ApiResponseService.error(
      result.error || "Failed to fetch services",
      400
    );
  }

  // Return just the services data, not the nested structure
  return ApiResponseService.success(result.data.data);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  const params = await context.params;
  const businessId = params.businessId;

  if (!businessId) {
    return ApiResponseService.error("Invalid business ID", 400);
  }

  const serviceData = await request.json();

  const result = await ServiceService.createServiceForBusiness(
    businessId,
    authResult.user._id.toString(),
    serviceData
  );

  if (!result.success) {
    return ApiResponseService.error(result.error!, 400);
  }

  return ApiResponseService.success(result.data);
}
