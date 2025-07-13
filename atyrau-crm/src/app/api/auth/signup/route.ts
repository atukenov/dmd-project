import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    // Validate inputs
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { message: "Все поля обязательны для заполнения" },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { message: "Некорректный email" },
        { status: 400 }
      );
    }

    if (!/^\+?[0-9]{10,15}$/.test(phone)) {
      return NextResponse.json(
        { message: "Некорректный формат телефона" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Пароль должен содержать минимум 8 символов" },
        { status: 400 }
      );
    }

    // Use our enhanced connection function that handles failures
    const { db } = await import("@/lib/db").then((module) =>
      module.connectToDatabase()
    );

    if (!db) {
      // If no db, we're using mock data, so simulate user creation
      console.log("Using mock data for user registration");

      // Simulate a slight delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return NextResponse.json(
        {
          message:
            "Регистрация успешна! Пожалуйста, проверьте ваш email для подтверждения.",
        },
        { status: 201 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create verification token
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hour expiry

    // Create user
    const newUser = {
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash: hashedPassword,
      role: "client", // default role
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpiry,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only try to insert if we have a db connection
    if (db) {
      await db.collection("users").insertOne(newUser);
    }

    try {
      // Send verification email (or log it in development)
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.warn("Failed to send verification email:", emailError);
      // Continue despite email sending failure
    }

    return NextResponse.json(
      {
        message:
          "Регистрация успешна! Пожалуйста, проверьте ваш email для подтверждения.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Ошибка при регистрации" },
      { status: 500 }
    );
  }
}
