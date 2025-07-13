import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find the business associated with the user
    const business = await db
      .collection("businesses")
      .findOne({ userId: token.sub });

    if (!business) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    // Get today's date range
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Get this week's date range (Monday to Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(
      today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1)
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get this month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Fetch real stats from database
    const [appointmentsToday, appointmentsWeek, clientsTotal, revenueResult] =
      await Promise.all([
        // Today's appointments count
        db.collection("appointments").countDocuments({
          businessId: business._id,
          startTime: { $gte: startOfToday, $lte: endOfToday },
          status: { $nin: ["cancelled"] },
        }),

        // This week's appointments count
        db.collection("appointments").countDocuments({
          businessId: business._id,
          startTime: { $gte: startOfWeek, $lte: endOfWeek },
          status: { $nin: ["cancelled"] },
        }),

        // Total clients count
        db.collection("clients").countDocuments({
          businessId: business._id,
        }),

        // This month's revenue (completed appointments only)
        db
          .collection("appointments")
          .aggregate([
            {
              $match: {
                businessId: business._id,
                startTime: { $gte: startOfMonth, $lte: endOfMonth },
                status: "completed",
                paymentStatus: "paid",
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray(),
      ]);

    const revenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const stats = {
      appointmentsToday,
      appointmentsWeek,
      clientsTotal,
      revenue,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
