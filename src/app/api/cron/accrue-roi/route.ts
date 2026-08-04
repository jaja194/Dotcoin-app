import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PlanCycle, TransactionType } from "@prisma/client";

// Daily ROI Rate Multipliers by Plan Cycle
const DAILY_ROI_RATES: Record<PlanCycle, number> = {
  WEEKLY: 0.005,  // 0.5% daily
  MONTHLY: 0.007, // 0.7% daily
  YEARLY: 0.010,  // 1.0% daily
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const secretKeyParam = searchParams.get("key");

    const expectedSecret = process.env.CRON_SECRET || "dotcoin-cron-secret-2026";

    // Validate secret via Header OR Query Param (useful for simple cron pingers)
    const isAuthorized =
      authHeader === `Bearer ${expectedSecret}` || secretKeyParam === expectedSecret;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid Cron Secret" },
        { status: 401 }
      );
    }

    // Fetch all Active Investment Plans
    const activePlans = await prisma.investmentPlan.findMany({
      where: { status: "ACTIVE" },
      include: { user: true },
    });

    if (activePlans.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active investment plans found for ROI calculation.",
        processedCount: 0,
      });
    }

    // Process ROI Accruals in a Batch Transaction
    const updates = activePlans.map((plan) => {
      const dailyRate = DAILY_ROI_RATES[plan.cycle] || 0.005;
      const dailyProfit = plan.capitalAmountUsdt * dailyRate;

      return prisma.$transaction([
        prisma.investmentPlan.update({
          where: { id: plan.id },
          data: {
            accruedProfitUsdt: {
              increment: dailyProfit,
            },
          },
        }),
        prisma.transaction.create({
          data: {
            userId: plan.userId,
            investmentPlanId: plan.id,
            type: TransactionType.PROFIT_PAYOUT,
            protocol: "BEP20",
            expectedAmountUsdt: dailyProfit,
            receivedAmountUsdt: dailyProfit,
            depositAddress: "INTERNAL_ACCUMULATOR",
            status: "COMPLETED",
            notes: `Daily ROI Accrual (${(dailyRate * 100).toFixed(1)}%) for ${plan.cycle} plan`,
          },
        }),
      ]);
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: `Successfully processed daily ROI for ${activePlans.length} active plans.`,
      processedCount: activePlans.length,
    });
  } catch (error) {
    console.error("ROI Accrual Cron Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}