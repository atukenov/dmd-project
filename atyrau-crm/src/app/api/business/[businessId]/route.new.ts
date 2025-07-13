import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  BusinessProfileService,
} from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  const result = await BusinessProfileService.getBusinessProfile(
    params.businessId,
    authResult.user._id.toString()
  );

  if (!result.success) {
    return ApiResponseService.error(result.error!, 400);
  }

  return ApiResponseService.success(result.data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  const businessData = await request.json();

  const result = await BusinessProfileService.updateBusinessProfile(
    params.businessId,
    authResult.user._id.toString(),
    businessData
  );

  if (!result.success) {
    return ApiResponseService.error(result.error!, 400);
  }

  return ApiResponseService.success(result.data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  const authResult = await AuthService.authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    return ApiResponseService.unauthorized(
      authResult.error || "Authentication required"
    );
  }

  const result = await BusinessProfileService.deleteBusinessProfile(
    params.businessId,
    authResult.user._id.toString()
  );

  if (!result.success) {
    return ApiResponseService.error(result.error!, 400);
  }

  return ApiResponseService.success(result.data);
}
