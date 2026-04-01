import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import FinancialRecord from "@/models/FinancialRecord";
import { UserRole } from "@/models/User";
import { verifyAuth } from "@/lib/auth";
import { updateFinancialRecordSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    // 1. Verify Auth & enforce RBAC (Only ADMIN)
    await verifyAuth(request, [UserRole.ADMIN]);

    // Next.js 15+ compatible params parsing
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const body = await request.json();

    // 2. Validate body using Zod
    const result = updateFinancialRecordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", details: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 3. Ensure the record exists and update
    const updatedRecord = await FinancialRecord.findByIdAndUpdate(
      id,
      { $set: result.data },
      { new: true, runValidators: true } // Return updated doc
    );

    if (!updatedRecord) {
      return NextResponse.json(
        { error: "Financial record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Record updated successfully", record: updatedRecord },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.startsWith("FORBIDDEN")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.startsWith("UNAUTHORIZED")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error(`PUT /api/records/ error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    // 1. Verify Auth & enforce RBAC (Only ADMIN)
    await verifyAuth(request, [UserRole.ADMIN]);

    // Next.js 15+ compatible params parsing
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    await connectToDatabase();

    // 2. Ensure the record exists and delete
    const deletedRecord = await FinancialRecord.findByIdAndDelete(id);

    if (!deletedRecord) {
      return NextResponse.json(
        { error: "Financial record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Record deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.startsWith("FORBIDDEN")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.startsWith("UNAUTHORIZED")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error(`DELETE /api/records/ error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
