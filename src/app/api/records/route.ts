import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import FinancialRecord from "@/models/FinancialRecord";
import { UserRole } from "@/models/User";
import { verifyAuth } from "@/lib/auth";
import { createFinancialRecordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    // Require ADMIN role
    const jwtPayload = await verifyAuth(request, [UserRole.ADMIN]);

    const body = await request.json();

    // Validate payload
    const result = createFinancialRecordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", details: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Attach the createdBy field using the verified JWT ID
    const recordData = {
      ...result.data,
      createdBy: jwtPayload.id,
    };

    const newRecord = new FinancialRecord(recordData);
    await newRecord.save();

    return NextResponse.json(
      { message: "Record created successfully", record: newRecord },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message.startsWith("FORBIDDEN")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.startsWith("UNAUTHORIZED")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("POST /api/records error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Allow ADMIN, ANALYST, and VIEWER roles
    await verifyAuth(request, [
      UserRole.ADMIN,
      UserRole.ANALYST,
      UserRole.VIEWER,
    ]);

    // Extract query parameters for dynamic filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: Record<string, any> = {};

    if (type) {
      query.type = type;
    }
    if (category) {
      // Case-insensitive partial match for category
      query.category = { $regex: new RegExp(category, "i") };
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    await connectToDatabase();

    const records = await FinancialRecord.find(query)
      .sort({ date: -1 })
      .populate("createdBy", "email role"); // Provide some context about the creator

    return NextResponse.json({ records }, { status: 200 });
  } catch (error: any) {
    if (error.message.startsWith("FORBIDDEN")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.startsWith("UNAUTHORIZED")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("GET /api/records error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
