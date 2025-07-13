import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Verify user is authorized
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get business ID from token if not provided in query
    let targetBusinessId = businessId;

    if (!targetBusinessId) {
      // If no businessId provided, try to find user's business
      const business = await db
        .collection("businesses")
        .findOne({ userId: token.sub });

      if (business) {
        targetBusinessId = business._id.toString();
      } else if (token.role !== "admin") {
        return NextResponse.json(
          { message: "You do not have permission to access this resource" },
          { status: 403 }
        );
      }
    } else {
      // If businessId is provided, check if user has permission to access it
      const userRole = token.role as string;
      
      // Admin can access any business
      if (userRole === "admin") {
        // Allow admin access
      } else if (userRole === "business") {
        // Business users can only access their own business
        const business = await db
          .collection("businesses")
          .findOne({ 
            _id: new ObjectId(targetBusinessId),
            userId: token.sub 
          });

        if (!business) {
          return NextResponse.json(
            { message: "You do not have permission to access this resource" },
            { status: 403 }
          );
        }
      } else {
        // Clients and other roles cannot access business data
        return NextResponse.json(
          { message: "You do not have permission to access this resource" },
          { status: 403 }
        );
      }
    }

    // Build query filter
    interface ServiceFilter {
      businessId?: string;
    }

    const filter: ServiceFilter = {};

    if (targetBusinessId) {
      filter.businessId = targetBusinessId; // Store as string, not ObjectId
    }

    // Get services for the business
    const services = await db
      .collection("services")
      .find(filter)
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { message: "Failed to fetch services", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


