import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const businessId = params.businessId;

    if (!businessId || !ObjectId.isValid(businessId)) {
      return NextResponse.json(
        { message: "Invalid business ID" },
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

    // Fetch services for the business
    const services = await db
      .collection("services")
      .find({ businessId: businessId })
      .toArray();

    // Transform services to a more frontend-friendly format
    const transformedServices = services.map((service) => ({
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      image: service.image || null,
      isActive: service.isActive !== false, // Default to true if not specified
    }));

    return NextResponse.json({ services: transformedServices });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const businessId = params.businessId;

    if (!businessId || !ObjectId.isValid(businessId)) {
      return NextResponse.json(
        { message: "Invalid business ID" },
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

    // Parse the request body
    const data = await request.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { message: "Service name is required" },
        { status: 400 }
      );
    }

    // Create the service
    const service = {
      name: data.name,
      description: data.description || "",
      duration: data.duration || 60, // Default 60 minutes
      price: data.price || 0,
      category: data.category || "default",
      image: data.image || null,
      isActive: data.isActive !== false, // Default to true if not specified
      businessId: businessId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("services").insertOne(service);

    // Return the created service
    return NextResponse.json({
      id: result.insertedId.toString(),
      ...service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { message: "Failed to create service" },
      { status: 500 }
    );
  }
}
