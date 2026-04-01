import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { createUserSchema } from "@/lib/validations";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate payload using Zod
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password, role } = result.data;

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with bcryptjs (salt rounds: 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to MongoDB
    const newUser = new User({
      email,
      password: hashedPassword,
      ...(role && { role }), // Only assign role if provided, else use schema default
    });

    await newUser.save();

    // Return a JWT containing user ID, role, and status
    const token = signToken({
      id: newUser._id.toString(),
      role: newUser.role,
      status: newUser.status,
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
