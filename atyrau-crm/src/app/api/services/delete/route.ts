import { NextRequest } from "next/server";
import {
  AuthService,

  ApiResponseService,
  ServiceService,
} from "@/lib/services";

export async function DELETE(request: NextRequest) {
  
    // Get service ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get("serviceId");

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

    // Delete service
    const deleteResult = await ServiceService.deleteService(
      serviceId,
      authResult.businessId
    );
    if (!deleteResult.success) {
      return ApiResponseService.error(
        deleteResult.error || "Failed to delete service"
      );
    }

    return ApiResponseService.success(deleteResult.data);
  });
}

