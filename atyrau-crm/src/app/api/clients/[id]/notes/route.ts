import { NextRequest } from "next/server";
import {
  AuthService,
  ApiResponseService,
  DatabaseService,
} from "@/lib/services";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;

    if (!clientId) {
      return ApiResponseService.error("Client ID is required", 400);
    }

    // Get note data from request body
    const body = await request.json();
    const { content, type = "general" } = body;

    if (!content) {
      return ApiResponseService.error("Note content is required", 400);
    }

    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return ApiResponseService.unauthorized(
        authResult.error || "Authentication required"
      );
    }

    const { user } = authResult;

    // Execute database operation
    const result = await DatabaseService.executeOperation(async (db) => {
      // Get client
      const clientDetails = await db.collection("clients").findOne({
        _id: new ObjectId(clientId),
      });

      if (!clientDetails) {
        throw new Error("Client not found");
      }

      // Check if user has permission to add notes for this client
      const canAccess =
        user.role === "admin" ||
        (await AuthService.verifyBusinessOwnership(
          user,
          clientDetails.businessId.toString()
        ));

      if (!canAccess) {
        throw new Error(
          "You do not have permission to add notes for this client"
        );
      }

      // Create the note
      const note = {
        clientId: new ObjectId(clientId),
        businessId: clientDetails.businessId,
        content,
        type, // general, preference, medical, etc.
        createdAt: new Date(),
        createdBy: user._id,
        authorName: user.name || "Staff Member",
      };

      const insertResult = await db.collection("clientNotes").insertOne(note);

      return {
        noteId: insertResult.insertedId,
        note: {
          ...note,
          _id: insertResult.insertedId,
        },
      };
    });

    if (!result.success) {
      return ApiResponseService.error(
        result.error || "Failed to add client note",
        500
      );
    }

    return ApiResponseService.success({
      message: "Note added successfully",
      ...result.data,
    });
  } catch (error) {
    console.error("Error adding client note:", error);
    return ApiResponseService.error(
      error instanceof Error ? error.message : "Failed to add client note",
      500
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
      return ApiResponseService.error("Client ID is required", 400);
    }

    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return ApiResponseService.unauthorized(
        authResult.error || "Authentication required"
      );
    }

    const { user } = authResult;

    // Execute database operation
    const result = await DatabaseService.executeOperation(async (db) => {
      // Get client
      const clientDetails = await db.collection("clients").findOne({
        _id: new ObjectId(clientId),
      });

      if (!clientDetails) {
        throw new Error("Client not found");
      }

      // Check if user has permission to view notes for this client
      const canAccess =
        user.role === "admin" ||
        (await AuthService.verifyBusinessOwnership(
          user,
          clientDetails.businessId.toString()
        ));

      if (!canAccess) {
        throw new Error(
          "You do not have permission to view notes for this client"
        );
      }

      // Get client's notes
      const notes = await db
        .collection("clientNotes")
        .find({ clientId: new ObjectId(clientId) })
        .sort({ createdAt: -1 })
        .toArray();

      return { notes };
    });

    if (!result.success) {
      return ApiResponseService.error(
        result.error || "Failed to fetch client notes",
        500
      );
    }

    return ApiResponseService.success(result.data);
  } catch (error) {
    console.error("Error fetching client notes:", error);
    return ApiResponseService.error(
      error instanceof Error ? error.message : "Failed to fetch client notes",
      500
    );
  }
}
