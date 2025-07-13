import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function DELETE(request: NextRequest) {
  try {
    // Get service ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get("serviceId");

    if (!serviceId) {
      return NextResponse.json(
        { message: "Service ID is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Verify user is authorized
    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get service
    const service = await db.collection("services").findOne({
      _id: new ObjectId(serviceId),
    });

    if (!service) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to delete this service
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });

    const canAccess =
      token.role === "admin" ||
      (user?.businessId &&
        user.businessId.toString() === service.businessId.toString());

    if (!canAccess) {
      return NextResponse.json(
        { message: "You do not have permission to delete this service" },
        { status: 403 }
      );
    }

    // Check if service is used in any appointments
    const appointmentsUsingService = await db
      .collection("appointments")
      .findOne({
        serviceId: new ObjectId(serviceId),
        startTime: { $gte: new Date() }, // Only check future appointments
      });

    if (appointmentsUsingService) {
      return NextResponse.json(
        { message: "Cannot delete a service that has upcoming appointments" },
        { status: 409 }
      );
    }

    // Delete service
    await db.collection("services").deleteOne({ _id: new ObjectId(serviceId) });

    return NextResponse.json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { message: "Failed to delete service", error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" },
      { status: 500 }
    );
  }
}


