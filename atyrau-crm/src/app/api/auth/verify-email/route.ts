import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: "Токен верификации не указан" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user by verification token
    const user = await db
      .collection("users")
      .findOne({ verificationToken: token });

    if (!user) {
      return NextResponse.json(
        { message: "Недействительный токен верификации" },
        { status: 400 }
      );
    }

    // Check if token is expired
    const tokenExpiry = new Date(user.verificationTokenExpiry);
    if (tokenExpiry < new Date()) {
      return NextResponse.json(
        { message: "Токен верификации истек" },
        { status: 400 }
      );
    }

    // Mark email as verified
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          isEmailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ message: "Email успешно подтвержден" });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Ошибка при верификации email" },
      { status: 500 }
    );
  }
}
