import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get businessId from query parameters if provided
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");

    let targetBusiness;

    if (businessId) {
      // If businessId is provided, verify user has access to this business
      const userRole = token.role as string;

      if (userRole === "admin") {
        // Admin can access any business
        targetBusiness = await db
          .collection("businesses")
          .findOne({ _id: new ObjectId(businessId) });
      } else {
        // Regular users can only access their own business
        targetBusiness = await db.collection("businesses").findOne({
          _id: new ObjectId(businessId),
          userId: token.sub,
        });
      }
    } else {
      // If no businessId provided, find the business associated with the user
      targetBusiness = await db
        .collection("businesses")
        .findOne({ userId: token.sub });
    }

    if (!targetBusiness) {
      return NextResponse.json(
        { message: "Business not found or access denied" },
        { status: 404 }
      );
    }

    // Get upcoming appointments (next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const recentAppointments = await db
      .collection("appointments")
      .aggregate([
        {
          $match: {
            businessId: new ObjectId(targetBusiness._id),
            startTime: { $gte: now, $lte: nextWeek },
            status: { $nin: ["cancelled"] },
          },
        },
        {
          $lookup: {
            from: "clients",
            localField: "clientId",
            foreignField: "_id",
            as: "client",
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "service",
          },
        },
        {
          $unwind: "$client",
        },
        {
          $unwind: "$service",
        },
        {
          $project: {
            _id: 1,
            startTime: 1,
            endTime: 1,
            status: 1,
            totalAmount: 1,
            "client.name": 1,
            "client.phone": 1,
            "service.name": 1,
            "service.duration": 1,
          },
        },
        {
          $sort: { startTime: 1 },
        },
        {
          $limit: 5,
        },
      ])
      .toArray();

    return NextResponse.json(recentAppointments);
  } catch (error) {
    console.error("Error fetching recent appointments:", error);
    return NextResponse.json(
      { message: "Failed to fetch recent appointments" },
      { status: 500 }
    );
  }
}
