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

    // Verify user is authorized to view services for this business
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    let targetBusinessId = businessId;
    let user;

    // If no businessId provided, find the user first
    if (!targetBusinessId) {
      user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(token.sub) });

      // Check if user has a businessId directly
      if (user?.businessId) {
        targetBusinessId = user.businessId.toString();
      }
      // If user doesn't have a businessId directly, check if they have a linked business
      else {
        // Find a business where this user is the owner
        const business = await db
          .collection("businesses")
          .findOne({ userId: new ObjectId(token.sub) });

        if (business) {
          targetBusinessId = business._id.toString();

          // Optionally update the user with this business ID for future queries
          await db
            .collection("users")
            .updateOne(
              { _id: new ObjectId(token.sub) },
              { $set: { businessId: business._id } }
            );
        }
      }
    }

    if (!targetBusinessId) {
      // If we still don't have a businessId, check if the user is an admin and return all services
      if (user?.role === "admin") {
        const services = await db
          .collection("services")
          .find({})
          .sort({ name: 1 })
          .toArray();

        return NextResponse.json({ services });
      }

      return NextResponse.json(
        { message: "No business associated with this user" },
        { status: 400 }
      );
    }

    // Get services for the business
    const services = await db
      .collection("services")
      .find({ businessId: new ObjectId(targetBusinessId) })
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { message: "Failed to fetch services", error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" },
      { status: 500 }
    );
  }
}


