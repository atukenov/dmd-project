import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    // Get client data from request body
    const body = await request.json();
    const { name, phone, email, notes, businessId } = body;

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { message: "Name and phone are required" },
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

    // Get business ID from token if not provided in body
    let targetBusinessId = businessId;

    if (!targetBusinessId) {
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(token.sub) });

      if (user?.businessId) {
        targetBusinessId = user.businessId.toString();
      } else {
        return NextResponse.json(
          { message: "Business ID is required" },
          { status: 400 }
        );
      }
    } else {
      // If businessId is provided, check if user has permission
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(token.sub) });

      const canAccess =
        token.role === "admin" ||
        (user?.businessId && user.businessId.toString() === targetBusinessId);

      if (!canAccess) {
        return NextResponse.json(
          {
            message:
              "You do not have permission to add clients to this business",
          },
          { status: 403 }
        );
      }
    }

    // Check if client with same phone already exists
    const existingClient = await db.collection("clients").findOne({
      businessId: new ObjectId(targetBusinessId),
      phone,
    });

    if (existingClient) {
      return NextResponse.json(
        { message: "A client with this phone number already exists" },
        { status: 409 }
      );
    }

    // Create new client
    const newClient = {
      businessId: new ObjectId(targetBusinessId),
      name,
      phone,
      email: email || null,
      notes: notes || "",
      createdAt: new Date(),
      createdBy: new ObjectId(token.sub),
    };

    const result = await db.collection("clients").insertOne(newClient);

    return NextResponse.json({
      message: "Client created successfully",
      clientId: result.insertedId,
      client: {
        ...newClient,
        _id: result.insertedId,
      },
    });
  } catch (error: any) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { message: "Failed to create client", error: error.message },
      { status: 500 }
    );
  }
}
