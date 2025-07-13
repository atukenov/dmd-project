import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import clientPromise from "@/lib/mongodb";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email не указан" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user by email
    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({
        message:
          "Письмо с инструкциями отправлено на указанный email (если он зарегистрирован в системе)",
      });
    }

    // Create reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

    // Update user with reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
          updatedAt: new Date(),
        },
      }
    );

    // Send password reset email
    await sendPasswordResetEmail(email, user.name, resetToken);

    return NextResponse.json({
      message: "Письмо с инструкциями отправлено на указанный email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Ошибка при обработке запроса" },
      { status: 500 }
    );
  }
}

