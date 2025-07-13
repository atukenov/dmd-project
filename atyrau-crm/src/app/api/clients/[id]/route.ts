import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;

    if (!clientId) {
      return NextResponse.json(
        { message: "Client ID is required" },
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

    // Get client details
    const clientDetails = await db.collection("clients").findOne({
      _id: new ObjectId(clientId),
    });

    if (!clientDetails) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view this client
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });

    const canAccess =
      token.role === "admin" ||
      (user?.businessId &&
        user.businessId.toString() === clientDetails.businessId.toString());

    if (!canAccess) {
      return NextResponse.json(
        { message: "You do not have permission to view this client" },
        { status: 403 }
      );
    }

    // Get client's appointment history
    const appointments = await db
      .collection("appointments")
      .find({ clientId: new ObjectId(clientId) })
      .sort({ startTime: -1 })
      .toArray();

    // Get service details for each appointment
    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        let service = null;

        if (appointment.serviceId) {
          service = await db.collection("services").findOne({
            _id: new ObjectId(appointment.serviceId.toString()),
          });
        }

        return {
          ...appointment,
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

    // Get client's notes
    const notes = await db
      .collection("clientNotes")
      .find({ clientId: new ObjectId(clientId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Return client details with appointments and notes
    return NextResponse.json({
      client: clientDetails,
      appointments: appointmentsWithDetails,
      notes,
    });
  } catch (error: any) {
    console.error("Error fetching client details:", error);
    return NextResponse.json(
      { message: "Failed to fetch client details", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;

    if (!clientId) {
      return NextResponse.json(
        { message: "Client ID is required" },
        { status: 400 }
      );
    }

    // Get update data from request body
    const body = await request.json();
    const { name, phone, email, notes } = body;

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

    // Get client
    const clientDetails = await db.collection("clients").findOne({
      _id: new ObjectId(clientId),
    });

    if (!clientDetails) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to update this client
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });

    const canAccess =
      token.role === "admin" ||
      (user?.businessId &&
        user.businessId.toString() === clientDetails.businessId.toString());

    if (!canAccess) {
      return NextResponse.json(
        { message: "You do not have permission to update this client" },
        { status: 403 }
      );
    }

    // If phone is changed, check if it conflicts with another client
    if (phone && phone !== clientDetails.phone) {
      const existingClient = await db.collection("clients").findOne({
        businessId: clientDetails.businessId,
        phone,
        _id: { $ne: new ObjectId(clientId) },
      });

      if (existingClient) {
        return NextResponse.json(
          { message: "A client with this phone number already exists" },
          { status: 409 }
        );
      }
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() };

    if (name !== undefined) {
      updateData.name = name;
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update client
    await db
      .collection("clients")
      .updateOne({ _id: new ObjectId(clientId) }, { $set: updateData });

    // Return updated client
    const updatedClient = await db.collection("clients").findOne({
      _id: new ObjectId(clientId),
    });

    return NextResponse.json({
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (error: any) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { message: "Failed to update client", error: error.message },
      { status: 500 }
    );
  }
}
