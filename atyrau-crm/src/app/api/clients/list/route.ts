import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");
    const query = searchParams.get("query");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

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

    // Get business ID from token if not provided in query
    let targetBusinessId = businessId;

    if (!targetBusinessId) {
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(token.sub) });

      if (user?.businessId) {
        targetBusinessId = user.businessId.toString();
      } else if (token.role !== "admin") {
        return NextResponse.json(
          { message: "You do not have permission to access this resource" },
          { status: 403 }
        );
      }
    } else {
      // If businessId is provided, check if user has permission to view it
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(token.sub) });

      const canAccess =
        token.role === "admin" ||
        (user?.businessId && user.businessId.toString() === targetBusinessId);

      if (!canAccess) {
        return NextResponse.json(
          { message: "You do not have permission to access this resource" },
          { status: 403 }
        );
      }
    }

    // Build query filter
    interface ClientFilter {
      businessId?: ObjectId;
      $or?: Array<{
        name?: { $regex: string; $options: string };
        email?: { $regex: string; $options: string };
        phone?: { $regex: string; $options: string };
      }>;
    }
    
    const filter: ClientFilter = {};

    if (targetBusinessId) {
      filter.businessId = new ObjectId(targetBusinessId);
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    // Get clients
    const clients = await db
      .collection("clients")
      .find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalClients = await db.collection("clients").countDocuments(filter);

    // Get appointment counts for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const appointmentCount = await db
          .collection("appointments")
          .countDocuments({
            clientId: client._id,
          });

        const completedAppointments = await db
          .collection("appointments")
          .countDocuments({
            clientId: client._id,
            status: "completed",
          });

        const cancelledAppointments = await db
          .collection("appointments")
          .countDocuments({
            clientId: client._id,
            status: "cancelled",
          });

        const noShowAppointments = await db
          .collection("appointments")
          .countDocuments({
            clientId: client._id,
            status: "no-show",
          });

        // Get latest appointment
        const latestAppointment = await db
          .collection("appointments")
          .find({ clientId: client._id })
          .sort({ startTime: -1 })
          .limit(1)
          .toArray();

        return {
          ...client,
          stats: {
            appointmentCount,
            completedAppointments,
            cancelledAppointments,
            noShowAppointments,
            lastVisit:
              latestAppointment.length > 0
                ? latestAppointment[0].startTime
                : null,
          },
        };
      })
    );

    return NextResponse.json({
      clients: clientsWithStats,
      total: totalClients,
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(totalClients / limit),
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    const errorMessage = error instanceof Error ? error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" : "Unknown error";
    return NextResponse.json(
      { message: "Failed to fetch clients", error: errorMessage },
      { status: 500 }
    );
  }
}


