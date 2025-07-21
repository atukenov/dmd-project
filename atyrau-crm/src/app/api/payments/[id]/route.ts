import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PaymentModel from "@/lib/models/Payment";
import { connectToDatabase } from "@/lib/db";

// GET /api/payments/[id] - Get specific payment
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.id;
    await connectToDatabase();

    const payment = await PaymentModel.findOne({
      _id: params.id,
      businessId,
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

// PATCH /api/payments/[id] - Update payment status or details
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.id;
    await connectToDatabase();

    const body = await request.json();
    const { status, transactionId, providerData, metadata, notes } = body;

    const payment = await PaymentModel.findOne({
      _id: params.id,
      businessId,
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update fields
    if (status) payment.status = status;
    if (transactionId) payment.transactionId = transactionId;
    if (providerData)
      payment.providerData = { ...payment.providerData, ...providerData };
    if (metadata) payment.metadata = { ...payment.metadata, ...metadata };

    // Set paidAt timestamp when marking as completed
    if (status === "completed" && !payment.paidAt) {
      payment.paidAt = new Date();
    }

    // Handle manual payment notes
    if (payment.paymentMethod === "cash" && notes) {
      payment.providerData = payment.providerData || {};
      payment.providerData.manual = {
        ...payment.providerData.manual,
        notes,
        receivedBy: session.user.name || "Unknown",
      };
    }

    await payment.save();

    return NextResponse.json({
      payment,
      message: "Payment updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id] - Cancel/delete payment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.id;
    await connectToDatabase();

    const payment = await PaymentModel.findOne({
      _id: params.id,
      businessId,
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Only allow deletion of pending payments
    if (!["pending", "failed", "expired"].includes(payment.status)) {
      return NextResponse.json(
        { error: "Cannot delete completed or processing payments" },
        { status: 400 }
      );
    }

    // Instead of deleting, mark as cancelled for audit trail
    payment.status = "cancelled";
    await payment.save();

    return NextResponse.json({
      message: "Payment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling payment:", error);
    return NextResponse.json(
      { error: "Failed to cancel payment" },
      { status: 500 }
    );
  }
}
