import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    // Get appointment data from request body
    const body = await request.json();
    const { appointmentId, cancellationReason } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { message: "Appointment ID is required" },
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

    // Get the appointment
    const appointment = await db.collection("appointments").findOne({
      _id: new ObjectId(appointmentId),
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to cancel this appointment
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });

    let canAccess = false;

    if (
      token.role === "admin" ||
      (user?.businessId &&
        user.businessId.toString() === appointment.businessId.toString())
    ) {
      // Business owner or admin can always cancel
      canAccess = true;
    } else if (token.role === "client") {
      // Clients can only cancel their own appointments
      const client = await db.collection("clients").findOne({
        userId: new ObjectId(token.sub),
      });

      if (
        client &&
        appointment.clientId &&
        client._id.toString() === appointment.clientId.toString()
      ) {
        canAccess = true;
      }
    }

    if (!canAccess) {
      return NextResponse.json(
        { message: "You do not have permission to cancel this appointment" },
        { status: 403 }
      );
    }

    // Check if appointment can be cancelled
    const appointmentDate = new Date(appointment.startTime);
    const currentDate = new Date();

    // Create a cancellation record
    const cancellation = {
      appointmentId: appointment._id,
      businessId: appointment.businessId,
      clientId: appointment.clientId,
      appointmentDate: appointmentDate,
      cancelledBy: token.role, // 'business', 'client', or 'admin'
      cancellerId: new ObjectId(token.sub),
      reason: cancellationReason || "Not provided",
      cancelledAt: currentDate,
    };

    await db.collection("cancellations").insertOne(cancellation);

    // Update appointment status
    await db.collection("appointments").updateOne(
      { _id: new ObjectId(appointmentId) },
      {
        $set: {
          status: "cancelled",
          cancellationReason: cancellationReason || "Not provided",
          cancelledBy: token.role,
          cancelledAt: currentDate,
          updatedAt: currentDate,
        },
      }
    );

    return NextResponse.json({
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { message: "Failed to cancel appointment", error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" },
      { status: 500 }
    );
  }
}


