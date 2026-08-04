import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { PlanCycle } from "@prisma/client";

export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const { capitalAmountUsdt, cycle = "WEEKLY", botSubscriptionId } = body;

    const amount = Number(capitalAmountUsdt);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid capital amount." },
        { status: 400 }
      );
    }

    // 1. Verify user has an active bot subscription
    let targetBotId = botSubscriptionId;
    if (!targetBotId) {
      const activeBot = await prisma.botSubscription.findFirst({
        where: { userId: payload.userId, status: "ACTIVE" },
      });

      if (!activeBot) {
        return NextResponse.json(
          { success: false, error: "An active bot subscription is required before creating an investment plan." },
          { status: 400 }
        );
      }
      targetBotId = activeBot.id;
    }

    // 2. Set 365-day capital lock dates
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    // 3. Create the Investment Plan
    const newPlan = await prisma.investmentPlan.create({
      data: {
        userId: payload.userId,
        botSubscriptionId: targetBotId,
        cycle: cycle as PlanCycle,
        capitalAmountUsdt: amount,
        accruedProfitUsdt: 0.0,
        status: "ACTIVE",
        lockupStartDate: startDate,
        lockupEndDate: endDate,
        isLocked: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Investment plan activated successfully!",
        plan: newPlan,
      },
    });
  } catch (error) {
    console.error("Investment Creation Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}