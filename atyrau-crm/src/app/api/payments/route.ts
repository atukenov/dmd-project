import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PaymentModel from "@/lib/models/Payment";
import { connectToDatabase } from "@/lib/db";

// GET /api/payments - List payments with filtering
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, use user ID as business ID (can be modified later)
    const businessId = session.user.id;

    const { db } = await connectToDatabase();

    if (!db) {
      return NextResponse.json(
        {
          error:
            "Database connection not available. Please check MongoDB connection.",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const appointmentId = searchParams.get("appointmentId");
    const clientId = searchParams.get("clientId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { businessId };
    if (status) query.status = status;
    if (appointmentId) query.appointmentId = appointmentId;
    if (clientId) query.clientId = clientId;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const payments = await PaymentModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await PaymentModel.countDocuments(query);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create new payment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, use user ID as business ID (can be modified later)
    const businessId = session.user.id;

    const { db } = await connectToDatabase();

    if (!db) {
      return NextResponse.json(
        {
          error:
            "Database connection not available. Please check MongoDB connection.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      amount,
      currency = "KZT",
      description,
      paymentMethod,
      appointmentId,
      clientId,
      providerData,
      metadata,
    } = body;

    // Validation
    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Amount and payment method are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Create payment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentData: Record<string, any> = {
      businessId,
      amount: parseFloat(amount),
      currency,
      description,
      paymentMethod,
      appointmentId,
      clientId,
      providerData,
      metadata: metadata || {},
    };

    // Generate reference ID if not provided
    if (!paymentData.referenceId) {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      paymentData.referenceId = `PAY-${timestamp}-${randomStr}`.toUpperCase();
    }

    // Set QR code expiry for QR payments
    if (paymentMethod === "kaspi_qr") {
      // QR codes expire in 15 minutes
      paymentData.qrCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    }

    const payment = new PaymentModel(paymentData);
    await payment.save();

    return NextResponse.json(
      {
        payment,
        message: "Payment created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
