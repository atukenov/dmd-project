import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Prepare update data
interface ServiceUpdateData {
  updatedAt: Date;
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  category?: string;
  image?: string;
  isActive?: boolean;
}

// Get a specific service by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string; serviceId: string }> }
) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { businessId, serviceId } = params;

    if (!businessId || !ObjectId.isValid(businessId)) {
      return NextResponse.json(
        { message: "Invalid business ID" },
        { status: 400 }
      );
    }

    if (!serviceId || !ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { message: "Invalid service ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // First, verify that the user has access to this business
    const business = await db
      .collection("businesses")
      .findOne({ _id: new ObjectId(businessId), userId: token.sub });

    if (!business) {
      return NextResponse.json(
        { message: "Business not found or access denied" },
        { status: 404 }
      );
    }

    // Fetch the specific service
    const service = await db.collection("services").findOne({
      _id: new ObjectId(serviceId),
      businessId: businessId,
    });

    if (!service) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    // Transform to a more frontend-friendly format
    const transformedService = {
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      image: service.image || null,
      isActive: service.isActive !== false, // Default to true if not specified
    };

    return NextResponse.json(transformedService);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { message: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

// Update a service
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ businessId: string; serviceId: string }> }
) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { businessId, serviceId } = params;

    if (!businessId || !ObjectId.isValid(businessId)) {
      return NextResponse.json(
        { message: "Invalid business ID" },
        { status: 400 }
      );
    }

    if (!serviceId || !ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { message: "Invalid service ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // First, verify that the user has access to this business
    const business = await db
      .collection("businesses")
      .findOne({ _id: new ObjectId(businessId), userId: token.sub });

    if (!business) {
      return NextResponse.json(
        { message: "Business not found or access denied" },
        { status: 404 }
      );
    }

    // Check if service exists and belongs to the business
    const existingService = await db.collection("services").findOne({
      _id: new ObjectId(serviceId),
      businessId: businessId,
    });

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    // Parse the request body
    const data = await request.json();

    const updateData: ServiceUpdateData = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Update the service
    await db
      .collection("services")
      .updateOne({ _id: new ObjectId(serviceId) }, { $set: updateData });

    // Fetch and return the updated service
    const updatedService = await db
      .collection("services")
      .findOne({ _id: new ObjectId(serviceId) });

    return NextResponse.json({
      id: updatedService!._id.toString(),
      name: updatedService!.name,
      description: updatedService!.description,
      duration: updatedService!.duration,
      price: updatedService!.price,
      category: updatedService!.category,
      image: updatedService!.image || null,
      isActive: updatedService!.isActive !== false,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { message: "Failed to update service" },
      { status: 500 }
    );
  }
}

// Delete a service
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ businessId: string; serviceId: string }> }
) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { businessId, serviceId } = params;

    if (!businessId || !ObjectId.isValid(businessId)) {
      return NextResponse.json(
        { message: "Invalid business ID" },
        { status: 400 }
      );
    }

    if (!serviceId || !ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { message: "Invalid service ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // First, verify that the user has access to this business
    const business = await db
      .collection("businesses")
      .findOne({ _id: new ObjectId(businessId), userId: token.sub });

    if (!business) {
      return NextResponse.json(
        { message: "Business not found or access denied" },
        { status: 404 }
      );
    }

    // Check if service exists and belongs to the business
    const existingService = await db.collection("services").findOne({
      _id: new ObjectId(serviceId),
      businessId: businessId,
    });

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    // Delete the service
    await db.collection("services").deleteOne({ _id: new ObjectId(serviceId) });

    return NextResponse.json({
      message: "Service deleted successfully",
      id: serviceId,
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { message: "Failed to delete service" },
      { status: 500 }
    );
  }
}
