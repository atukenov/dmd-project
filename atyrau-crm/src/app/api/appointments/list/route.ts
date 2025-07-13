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
    const filter: any = {};

    if (targetBusinessId) {
      filter.businessId = new ObjectId(targetBusinessId);
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

    // Get appointments
    const appointments = await db
      .collection("appointments")
      .find(filter)
      .sort({ startTime: 1 })
      .toArray();

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
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { message: "Failed to fetch appointments", error: error.message },
      { status: 500 }
    );
  }
}
