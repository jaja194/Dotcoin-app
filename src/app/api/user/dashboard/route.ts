import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
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

    // Fetch User with their BotSubscriptions and InvestmentPlans
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        botSubscriptions: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
        investmentPlans: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Dynamic calculations matching schema fields
    const totalInvested = user.investmentPlans.reduce(
      (sum, plan) => sum + (plan.capitalAmountUsdt || 0),
      0
    );

    const totalProfit = user.investmentPlans.reduce(
      (sum, plan) => sum + (plan.accruedProfitUsdt || 0),
      0
    );

    const activeBot = user.botSubscriptions[0] || null;
    const activePlan = user.investmentPlans[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: user.id,
          name: user.name || user.email.split("@")[0],
          email: user.email,
          role: user.role,
        },
        metrics: {
          totalInvested,
          totalProfit,
          botTier: activeBot ? activeBot.tier : "NONE",
          botStatus: activeBot ? "RUNNING" : "IDLE",
        },
        activeLockup: activePlan
          ? {
              id: activePlan.id,
              cycle: activePlan.cycle,
              capitalAmountUsdt: activePlan.capitalAmountUsdt,
              accruedProfitUsdt: activePlan.accruedProfitUsdt,
              lockupStartDate: activePlan.lockupStartDate,
              lockupEndDate: activePlan.lockupEndDate,
              isLocked: activePlan.isLocked,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}