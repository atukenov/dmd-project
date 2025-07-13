import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");
    const startDateParam = searchParams.get("startDate"); // YYYY-MM-DD
    const endDateParam = searchParams.get("endDate"); // YYYY-MM-DD
    const status = searchParams.get("status");

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Verify user is authorized to view appointments for this business
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
        const business = await db.collection("businesses").findOne({
          _id: new ObjectId(targetBusinessId),
          userId: token.sub,
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
    interface AppointmentFilter {
      businessId?: ObjectId | string;
      startTime?: {
        $gte?: Date;
        $lte?: Date;
      };
      status?: string;
    }

    const filter: AppointmentFilter = {};

    if (targetBusinessId) {
      // Try both string and ObjectId formats for businessId
      filter.businessId = ObjectId.isValid(targetBusinessId)
        ? new ObjectId(targetBusinessId)
        : targetBusinessId;
    }

    // Date range filter
    if (startDateParam || endDateParam) {
      filter.startTime = {};

      if (startDateParam) {
        const startDate = new Date(startDateParam);
        startDate.setHours(0, 0, 0, 0);
        filter.startTime.$gte = startDate;
      }

      if (endDateParam) {
        const endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999);
        filter.startTime.$lte = endDate;
      }
    }

    if (status) {
      filter.status = status;
    }

    // Debug: Log the filter being used
    console.log("Filter being used:", JSON.stringify(filter, null, 2));

    // Debug: Get all appointments for this business to see what exists
    const allAppointments = await db
      .collection("appointments")
      .find({ businessId: targetBusinessId })
      .toArray();

    console.log("All appointments for business:", allAppointments.length);
    console.log("Sample appointment:", allAppointments[0]);

    // Get appointments
    const appointments = await db
      .collection("appointments")
      .find(filter)
      .sort({ startTime: 1 })
      .toArray();

    console.log("Filtered appointments:", appointments.length);

    // Get client and service data for each appointment
    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        // Get client details
        const client = appointment.clientId
          ? await db
              .collection("clients")
              .findOne({ _id: new ObjectId(appointment.clientId.toString()) })
          : null;

        // Get service details
        const service = appointment.serviceId
          ? await db
              .collection("services")
              .findOne({ _id: new ObjectId(appointment.serviceId.toString()) })
          : null;

        return {
          ...appointment,
          client: client
            ? {
                name: client.name,
                phone: client.phone,
                email: client.email,
              }
            : null,
          service: service
            ? {
                name: service.name,
                duration: service.duration,
                price: service.price,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ appointments: appointmentsWithDetails });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    const errorMessage =
      error instanceof Error
        ? error instanceof Error
          ? error instanceof Error
            ? error.message
            : "Unknown error"
          : "Unknown error"
        : "Unknown error";
    return NextResponse.json(
      { message: "Failed to fetch appointments", error: errorMessage },
      { status: 500 }
    );
  }
}
