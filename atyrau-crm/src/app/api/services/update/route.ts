import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function PATCH(request: NextRequest) {
  try {
    // Get service data from request body
    const body = await request.json();
    const { serviceId, name, duration, price, description, category } = body;

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

    // Check if user has permission to update this service
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });

    const canAccess =
      token.role === "admin" ||
      (user?.businessId &&
        user.businessId.toString() === service.businessId.toString());

    if (!canAccess) {
      return NextResponse.json(
        { message: "You do not have permission to update this service" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() };

    if (name !== undefined) {
      updateData.name = name;
    }

    if (duration !== undefined) {
      updateData.duration = parseInt(duration, 10);
    }

    if (price !== undefined) {
      updateData.price = parseFloat(price);
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    // Update service
    await db
      .collection("services")
      .updateOne({ _id: new ObjectId(serviceId) }, { $set: updateData });

    // Return updated service
    const updatedService = await db.collection("services").findOne({
      _id: new ObjectId(serviceId),
    });

    return NextResponse.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error: any) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { message: "Failed to update service", error: error.message },
      { status: 500 }
    );
  }
}
