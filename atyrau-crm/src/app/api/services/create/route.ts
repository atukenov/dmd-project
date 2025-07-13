import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    // Get service data from request body
    const body = await request.json();
    const { name, duration, price, description, category } = body;

    // Validate required fields
    if (!name || !duration || !price) {
      return NextResponse.json(
        { message: "Missing required fields" },
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

    // Get business ID from token
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });

    if (!user?.businessId) {
      return NextResponse.json(
        { message: "User is not associated with a business" },
        { status: 403 }
      );
    }

    // Create the service
    const service = {
      businessId: user.businessId,
      name,
      duration: parseInt(duration, 10),
      price: parseFloat(price),
      description: description || "",
      category: category || "default",
      createdAt: new Date(),
    };

    const result = await db.collection("services").insertOne(service);

    // Return the created service
    return NextResponse.json({
      message: "Service created successfully",
      serviceId: result.insertedId,
      service: {
        ...service,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { message: "Failed to create service", error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" },
      { status: 500 }
    );
  }
}


