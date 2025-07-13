import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ isSetup: false }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find the business associated with the user
    const business = await db
      .collection("businesses")
      .findOne({ userId: token.sub });

    // Check if business exists and has required fields
    const isSetup = !!business && !!business.name && !!business.address;

    return NextResponse.json({
      isSetup,
      businessId: isSetup ? business._id.toString() : null,
      businessName: isSetup ? business.name : null,
      business: isSetup
        ? {
            id: business._id.toString(),
            name: business.name,
            address: business.address,
            serviceCount: business.services?.length || 0,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking business setup:", error);
    return NextResponse.json(
      { isSetup: false, error: "Failed to check business setup" },
      { status: 500 }
    );
  }
}

