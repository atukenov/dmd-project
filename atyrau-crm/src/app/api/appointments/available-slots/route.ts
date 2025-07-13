import { NextRequest } from "next/server";
import {
  AuthService,

  ApiResponseService,
  TimeSlotService,
} from "@/lib/services";

export async function GET(request: NextRequest) {
  
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const businessId = searchParams.get("businessId");
    const serviceDuration = parseInt(searchParams.get("duration") || "60", 10);

    if (!dateParam) {
      return ApiResponseService.validationError("Date parameter is required");
    }

    const date = new Date(dateParam);

    // Get business ID - either from query param or authenticated user
    let targetBusinessId: string | null = businessId || null;

    // If no business ID provided, try to get from authenticated user
    if (!targetBusinessId) {
      const authResult = await AuthService.authenticateRequest(request);
      if (authResult.success && authResult.user) {
        targetBusinessId = await AuthService.getBusinessIdForUser(
          authResult.user._id
        );
      }
    }

    if (!targetBusinessId) {
      return ApiResponseService.validationError("Business ID is required");
    }

    // Get available slots
    const slotsResult = await TimeSlotService.getAvailableSlots(
      targetBusinessId,
      date,
      serviceDuration
    );

    if (!slotsResult.success) {
      return ApiResponseService.error(
        slotsResult.error || "Failed to fetch available time slots"
      );
    }

    return ApiResponseService.success(slotsResult.data);
  });
}

