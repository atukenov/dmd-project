import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    // Get appointment data from request body
    const body = await request.json();
    const {
      businessId,
      serviceId,
      startTime,
      endTime,
      clientName,
      clientPhone,
      clientEmail,
      notes,
    } = body;

    // Validate required fields
    if (!businessId || !startTime || !endTime || !clientName || !clientPhone) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Check if user is authenticated (for client identification)
    const token = await getToken({ req: request });
    let clientId = null;

    // If authenticated, get or create client record
    if (token?.sub) {
      // Check if user exists in clients collection
      const existingClient = await db.collection("clients").findOne({
        userId: new ObjectId(token.sub),
      });

      if (existingClient) {
        clientId = existingClient._id;
      } else {
        // Create a new client record
        const newClient = {
          userId: new ObjectId(token.sub),
          businessId: new ObjectId(businessId),
          name: clientName,
          phone: clientPhone,
          email: clientEmail || null,
          createdAt: new Date(),
        };

        const result = await db.collection("clients").insertOne(newClient);
        clientId = result.insertedId;
      }
    } else {
      // For guest bookings, check if client with same phone exists
      const existingClient = await db.collection("clients").findOne({
        businessId: new ObjectId(businessId),
        phone: clientPhone,
      });

      if (existingClient) {
        clientId = existingClient._id;
      } else {
        // Create a new client record
        const newClient = {
          businessId: new ObjectId(businessId),
          name: clientName,
          phone: clientPhone,
          email: clientEmail || null,
          createdAt: new Date(),
        };

        const result = await db.collection("clients").insertOne(newClient);
        clientId = result.insertedId;
      }
    }

    // Check if there are any conflicts with the requested time slot
    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);

    const existingAppointments = await db
      .collection("appointments")
      .find({
        businessId: new ObjectId(businessId),
        $or: [
          // Requested time starts during another appointment
          {
            startTime: { $lte: requestedStart },
            endTime: { $gt: requestedStart },
          },
          // Requested time ends during another appointment
          {
            startTime: { $lt: requestedEnd },
            endTime: { $gte: requestedEnd },
          },
          // Requested time completely contains another appointment
          {
            startTime: { $gte: requestedStart },
            endTime: { $lte: requestedEnd },
          },
        ],
      })
      .toArray();

    if (existingAppointments.length > 0) {
      return NextResponse.json(
        { message: "This time slot is already booked" },
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = {
      businessId: new ObjectId(businessId),
      clientId,
      serviceId: serviceId ? new ObjectId(serviceId) : null,
      startTime: requestedStart,
      endTime: requestedEnd,
      status: "scheduled", // scheduled, completed, cancelled, no-show
      paymentStatus: "pending", // pending, paid, refunded
      notes: notes || "",
      createdAt: new Date(),
    };

    const result = await db.collection("appointments").insertOne(appointment);

    // Return the created appointment
    return NextResponse.json({
      message: "Appointment booked successfully",
      appointmentId: result.insertedId,
      appointment: {
        ...appointment,
        _id: result.insertedId,
      },
    });
  } catch (error: any) {
    console.error("Error booking appointment:", error);
    return NextResponse.json(
      { message: "Failed to book appointment", error: error.message },
      { status: 500 }
    );
  }
}
