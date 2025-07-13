import { NextRequest } from "next/server";
import { AuthService, ApiResponseService } from "@/lib/services";
import { validateServiceData } from "@/lib/utils/validation.utils";

export async function POST(request: NextRequest) {
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

  // Get database connection
  const db = await DatabaseService.getDatabase();

  // Create the service
  const service = {
    businessId: user.businessId,
    name,
    duration: parseInt(duration.toString(), 10),
    price: parseFloat(price.toString()),
    description: description || "",
    category: category || "default",
    createdAt: new Date(),
  };

  const result = await db.collection("services").insertOne(service);

  return ApiResponseService.success({
    message: "Service created successfully",
    serviceId: result.insertedId,
    service: {
      ...service,
      _id: result.insertedId,
    },
  });
}
