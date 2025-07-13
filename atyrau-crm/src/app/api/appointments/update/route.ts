import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function PATCH(request: NextRequest) {
  try {
    // Get appointment data from request body
    const body = await request.json();
    const { appointmentId, status, paymentStatus, notes } = body;

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

    // Check if user has permission to update this appointment
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });

    const canAccess =
      token.role === "admin" ||
      (user?.businessId &&
        user.businessId.toString() === appointment.businessId.toString());

    if (!canAccess) {
      return NextResponse.json(
        { message: "You do not have permission to update this appointment" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() };

    if (status) {
      updateData.status = status;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update appointment
    await db
      .collection("appointments")
      .updateOne({ _id: new ObjectId(appointmentId) }, { $set: updateData });

    // Return updated appointment
    const updatedAppointment = await db.collection("appointments").findOne({
      _id: new ObjectId(appointmentId),
    });

    return NextResponse.json({
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { message: "Failed to update appointment", error: error.message },
      { status: 500 }
    );
  }
}
