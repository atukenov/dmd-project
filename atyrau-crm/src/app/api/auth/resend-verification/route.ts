import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import clientPromise from "@/lib/mongodb";
import { sendVerificationEmail } from "@/lib/email";

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

    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return NextResponse.json({
        message: "Письмо с инструкциями отправлено на указанный email",
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return NextResponse.json({ message: "Email уже подтвержден" });
    }

    // Create new verification token
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hour expiry

    // Update user with new token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          verificationToken,
          verificationTokenExpiry,
          updatedAt: new Date(),
        },
      }
    );

    // Send verification email
    await sendVerificationEmail(email, user.name, verificationToken);

    return NextResponse.json({
      message: "Письмо с инструкциями отправлено на указанный email",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "Ошибка при отправке письма" },
      { status: 500 }
    );
  }
}
