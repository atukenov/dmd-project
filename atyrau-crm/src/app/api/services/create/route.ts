import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  DatabaseService,
} from "@/lib/services";
import { validateServiceData } from "@/lib/utils/validation.utils";

export async function POST(request: NextRequest) {
  try {
    // Get service data from request body
    const body = await request.json();
    const { name, duration, price, description, category } = body;

    // Validate required fields
    const validation = validateServiceData({
      name,
      duration,
      price,
      description,
      category,
    });
    if (!validation.isValid) {
      return ApiResponseService.validationError(validation.errors);
    }

    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return ApiResponseService.unauthorized("Authentication required");
    }

    const { user } = authResult;

    // Get business ID for user
    const businessId = await AuthService.getBusinessIdForUser(user._id);
    if (!businessId) {
      return ApiResponseService.error(
        "User is not associated with a business",
        403
      );
    }

    // Execute database operation using the established pattern
    const result = await DatabaseService.executeOperation(async (db) => {
      // Create the service
      const service = {
        businessId: businessId, // Use the fetched businessId
        name,
        duration: parseInt(duration.toString(), 10),
        price: parseFloat(price.toString()),
        description: description || "",
        category: category || "default",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const insertResult = await db.collection("services").insertOne(service);

      return {
        serviceId: insertResult.insertedId,
        service: {
          ...service,
          _id: insertResult.insertedId,
        },
      };
    });

    if (!result.success) {
      return ApiResponseService.error(
        result.error || "Failed to create service",
        500
      );
    }

    return ApiResponseService.success({
      message: "Service created successfully",
      ...result.data,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return ApiResponseService.error(
      error instanceof Error ? error.message : "Failed to create service",
      500
    );
  }
}
