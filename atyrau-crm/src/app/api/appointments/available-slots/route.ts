import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { generateTimeSlots } from "@/lib/utils/date-utils";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const businessId = searchParams.get("businessId");
    const serviceDuration = parseInt(searchParams.get("duration") || "60", 10);

    if (!dateParam) {
      return NextResponse.json(
        { message: "Date parameter is required" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Get business ID from token or query parameter
    let targetBusinessId = businessId;

    if (!targetBusinessId) {
      // If businessId not provided in query, get it from the authenticated user
      const token = await getToken({ req: request });

      if (token?.sub) {
        const user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(token.sub) });
        if (user?.businessId) {
          targetBusinessId = user.businessId.toString();
        }
      }
    }

    if (!targetBusinessId) {
      return NextResponse.json(
        { message: "Business ID is required" },
        { status: 400 }
      );
    }

    // Get business working hours
    const business = await db
      .collection("businesses")
      .findOne({ _id: new ObjectId(targetBusinessId) });

    if (!business) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    // Get existing appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await db
      .collection("appointments")
      .find({
        businessId: new ObjectId(targetBusinessId),
        startTime: { $gte: startOfDay, $lte: endOfDay },
      })
      .toArray();

    // Convert appointments to booked slots
    const bookedSlots = appointments.map((appointment) => ({
      start: new Date(appointment.startTime),
      end: new Date(appointment.endTime),
    }));

    // Get time slots using the utility function
    // If no working hours for this business yet, return empty array
    if (!business.workingHours) {
      return NextResponse.json({ slots: [] });
    }

    const slots = generateTimeSlots(
      date,
      business.workingHours,
      serviceDuration,
      bookedSlots
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { message: "Failed to fetch available time slots", error: error instanceof Error ? error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" : 'Unknown error' },
      { status: 500 }
    );
  }
}


