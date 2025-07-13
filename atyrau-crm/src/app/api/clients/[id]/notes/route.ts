import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

export async function POST(
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

    // Get note data from request body
    const body = await request.json();
    const { content, type = "general" } = body;

    if (!content) {
      return NextResponse.json(
        { message: "Note content is required" },
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

    // Check if user has permission to add notes for this client
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });

    const canAccess =
      token.role === "admin" ||
      (user?.businessId &&
        user.businessId.toString() === clientDetails.businessId.toString());

    if (!canAccess) {
      return NextResponse.json(
        { message: "You do not have permission to add notes for this client" },
        { status: 403 }
      );
    }

    // Create the note
    const note = {
      clientId: new ObjectId(clientId),
      businessId: clientDetails.businessId,
      content,
      type, // general, preference, medical, etc.
      createdAt: new Date(),
      createdBy: new ObjectId(token.sub),
      authorName: user?.name || "Staff Member",
    };

    const result = await db.collection("clientNotes").insertOne(note);

    return NextResponse.json({
      message: "Note added successfully",
      noteId: result.insertedId,
      note: {
        ...note,
        _id: result.insertedId,
      },
    });
  } catch (error: any) {
    console.error("Error adding client note:", error);
    return NextResponse.json(
      { message: "Failed to add client note", error: error.message },
      { status: 500 }
    );
  }
}

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

    // Check if user has permission to view notes for this client
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(token.sub) });

    const canAccess =
      token.role === "admin" ||
      (user?.businessId &&
        user.businessId.toString() === clientDetails.businessId.toString());

    if (!canAccess) {
      return NextResponse.json(
        { message: "You do not have permission to view notes for this client" },
        { status: 403 }
      );
    }

    // Get client's notes
    const notes = await db
      .collection("clientNotes")
      .find({ clientId: new ObjectId(clientId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error("Error fetching client notes:", error);
    return NextResponse.json(
      { message: "Failed to fetch client notes", error: error.message },
      { status: 500 }
    );
  }
}
