import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User, { UserStatus } from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate payload using Zod
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    await connectToDatabase();

    // Verify user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Reject if user status is 'INACTIVE'
    if (user.status === UserStatus.INACTIVE) {
      return NextResponse.json(
        { error: "Account is inactive. Please contact your administrator." },
        { status: 403 }
      );
    }

    // Verify password using bcryptjs.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return JWT containing user ID, role, and status
    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      status: user.status,
    });

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
