import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import FinancialRecord, { RecordType } from "@/models/FinancialRecord";
import { UserRole } from "@/models/User";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Auth & enforce RBAC (Only ADMIN, ANALYST)
    await verifyAuth(request, [UserRole.ADMIN, UserRole.ANALYST]);

    // 2. Extract query parameters
    const { searchParams } = new URL(request.url);
    const monthStr = searchParams.get("month");
    const yearStr = searchParams.get("year");

    // 3. Construct Match Stage for Date
    const matchStage: any = {};
    if (monthStr || yearStr) {
      const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();

      if (monthStr && !yearStr) {
        const month = parseInt(monthStr, 10) - 1; // 0-indexed month
        matchStage.date = {
          $gte: new Date(year, month, 1),
          // JS Date handles month overflow automatically (e.g. 11 + 1 -> next year Jan)
          $lt: new Date(year, month + 1, 1),
        };
      } else if (!monthStr && yearStr) {
        matchStage.date = {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1),
        };
      } else if (monthStr && yearStr) {
        const month = parseInt(monthStr, 10) - 1;
        matchStage.date = {
          $gte: new Date(year, month, 1),
          $lt: new Date(year, month + 1, 1),
        };
      }
    }

    await connectToDatabase();

    // 4. Aggregation Pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: "$type",
                totalAmount: { $sum: "$amount" },
              },
            },
          ],
          categories: [
            {
              $group: {
                _id: "$category",
                totalAmount: { $sum: "$amount" },
              },
            },
          ],
        },
      },
    ];

    const aggregationResult = await FinancialRecord.aggregate(pipeline);
    const rawResult = aggregationResult[0] || { totals: [], categories: [] };

    let totalIncome = 0;
    let totalExpenses = 0;

    rawResult.totals.forEach((t: { _id: string; totalAmount: number }) => {
      if (t._id === RecordType.INCOME) totalIncome = t.totalAmount;
      if (t._id === RecordType.EXPENSE) totalExpenses = t.totalAmount;
    });

    const netBalance = totalIncome - totalExpenses;

    const categoryTotals: Record<string, number> = {};
    rawResult.categories.forEach(
      (c: { _id: string; totalAmount: number }) => {
        categoryTotals[c._id] = c.totalAmount;
      }
    );

    return NextResponse.json(
      {
        summary: {
          totalIncome,
          totalExpenses,
          netBalance,
          categoryTotals,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.startsWith("FORBIDDEN")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.startsWith("UNAUTHORIZED")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("GET /api/dashboard/summary error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
