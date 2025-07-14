import { NextRequest } from "next/server";
import { ApiResponseService, ServiceService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const businessId = params.businessId;

    if (!businessId) {
      return ApiResponseService.error("Invalid business ID", 400);
    }

    // Get services without authentication for public booking
    const result = await ServiceService.getBusinessServices(businessId);

    if (!result.success) {
      return ApiResponseService.error(
        result.error || "Failed to fetch services",
        400
      );
    }

    // Transform services to match the expected format for the frontend
    const services = Array.isArray(result.data) ? result.data : [];
    const transformedServices = services.map((service) => ({
      _id: service._id.toString(),
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      image: service.image || null,
      isActive: service.isActive !== false, // Default to true if not specified
    }));

    return ApiResponseService.success(transformedServices);
  } catch (error) {
    console.error("Error fetching public services:", error);
    return ApiResponseService.error("Internal server error", 500);
  }
}
