import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { TransactionStatus, TransactionType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // 1. Verify JWT Authentication
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // 2. Parse Query Parameters
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    // 3. Build Where Filter
    const where: any = {
      userId: payload.userId,
    };

    if (statusParam && Object.values(TransactionStatus).includes(statusParam as TransactionStatus)) {
      where.status = statusParam as TransactionStatus;
    }

    if (typeParam && Object.values(TransactionType).includes(typeParam as TransactionType)) {
      where.type = typeParam as TransactionType;
    }

    // 4. Fetch Transactions and Total Count
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          investmentPlan: {
            select: {
              id: true,
              cycle: true,
              capitalAmountUsdt: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Fetch Transactions Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}