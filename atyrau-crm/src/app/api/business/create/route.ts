import { NextRequest } from "next/server";
import {
  AuthService,

  ApiResponseService,
  BusinessService,
} from "@/lib/services";
import { validateBusinessData } from "@/lib/utils/validation.utils";

/**
 * Creates a new business profile and its associated services
 */
export async function POST(request: NextRequest) {
  
    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return ApiResponseService.unauthorized("Authentication required");
    }

    const { user } = authResult;

    // Get business data from request
    const businessData = await request.json();

    // Validate business data
    const validation = validateBusinessData(businessData);
    if (!validation.isValid) {
      return ApiResponseService.validationError(validation.errors);
    }

    // Create business with services
    const createResult = await BusinessService.createBusiness(
      user._id.toString(),
      businessData
    );
    if (!createResult.success || !createResult.data) {
      return ApiResponseService.error(
        createResult.error || "Failed to create business profile"
      );
    }

    return ApiResponseService.success({
      message: "Business profile created successfully",
      businessId: createResult.data.businessId,
    });
  });
}

