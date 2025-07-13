import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  ServiceService,
} from "@/lib/services";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string; serviceId: string }> }
) {
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  const params = await context.params;
  const { businessId, serviceId } = params;

  if (!businessId || !serviceId) {
    return ApiResponseService.error("Invalid business ID or service ID", 400);
  }

  const result = await ServiceService.getServiceById(
    serviceId,
    businessId,
    authResult.user._id.toString()
  );

  if (!result.success) {
    return ApiResponseService.error(result.error!, 400);
  }

  return ApiResponseService.success(result.data);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ businessId: string; serviceId: string }> }
) {
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  const params = await context.params;
  const { businessId, serviceId } = params;

  if (!businessId || !serviceId) {
    return ApiResponseService.error("Invalid business ID or service ID", 400);
  }

  const updateData = await request.json();

  const result = await ServiceService.updateServiceById(
    serviceId,
    businessId,
    authResult.user._id.toString(),
    updateData
  );

  if (!result.success) {
    return ApiResponseService.error(result.error!, 400);
  }

  return ApiResponseService.success(result.data);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ businessId: string; serviceId: string }> }
) {
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  const params = await context.params;
  const { businessId, serviceId } = params;

  if (!businessId || !serviceId) {
    return ApiResponseService.error("Invalid business ID or service ID", 400);
  }

  const result = await ServiceService.deleteServiceById(
    serviceId,
    businessId,
    authResult.user._id.toString()
  );

  if (!result.success) {
    return ApiResponseService.error(result.error!, 400);
  }

  return ApiResponseService.success(result.data);
}
