import { NextRequest } from "next/server";
import {
  AuthService,

  ApiResponseService,
  ServiceService,
} from "@/lib/services";

export async function PATCH(request: NextRequest) {
  
    // Get service data from request body
    const body = await request.json();
    const { serviceId, ...updateData } = body;

    if (!serviceId) {
      return ApiResponseService.validationError("Service ID is required");
    }

    // Authenticate user and get business
    const authResult = await AuthService.authenticateRequestWithBusiness(
      request
    );
    if (!authResult.success || !authResult.businessId) {
      return ApiResponseService.unauthorized(
        authResult.error || "Authentication required"
      );
    }

    // Update service
    const updateResult = await ServiceService.updateService(
      serviceId,
      authResult.businessId,
      updateData
    );
    if (!updateResult.success) {
      return ApiResponseService.error(
        updateResult.error || "Failed to update service"
      );
    }

    return ApiResponseService.success(updateResult.data);
  });
}

