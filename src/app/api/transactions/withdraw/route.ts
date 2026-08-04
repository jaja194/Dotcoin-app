import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NetworkProtocol, TransactionType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    // 1. Authenticate JWT token
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

    // 2. Parse request body
    const body = await request.json();
    const { amount, protocol = "TRC20", destinationAddress } = body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid withdrawal amount." },
        { status: 400 }
      );
    }

    if (!destinationAddress || typeof destinationAddress !== "string" || destinationAddress.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Destination wallet address is required." },
        { status: 400 }
      );
    }

    // 3. Check User's Total Accrued Profit across Active Plans
    const activePlans = await prisma.investmentPlan.findMany({
      where: {
        userId: payload.userId,
        status: "ACTIVE",
      },
    });

    const totalAvailableProfit = activePlans.reduce(
      (sum, plan) => sum + (plan.accruedProfitUsdt || 0),
      0
    );

    if (totalAvailableProfit < parsedAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient yield balance. Requested: $${parsedAmount} USDT, Available: $${totalAvailableProfit.toFixed(2)} USDT.`,
        },
        { status: 400 }
      );
    }

    // 4. Deduct profit proportionally across active plans & create WITHDRAWAL transaction
    const withdrawalTx = await prisma.$transaction(async (tx) => {
      let remainingToDeduct = parsedAmount;

      for (const plan of activePlans) {
        if (remainingToDeduct <= 0) break;
        if (plan.accruedProfitUsdt <= 0) continue;

        const deduction = Math.min(plan.accruedProfitUsdt, remainingToDeduct);
        remainingToDeduct -= deduction;

        await tx.investmentPlan.update({
          where: { id: plan.id },
          data: {
            accruedProfitUsdt: {
              decrement: deduction,
            },
          },
        });
      }

      return tx.transaction.create({
        data: {
          userId: payload.userId,
          type: TransactionType.WITHDRAWAL,
          protocol: protocol as NetworkProtocol,
          expectedAmountUsdt: parsedAmount,
          receivedAmountUsdt: 0.0,
          depositAddress: destinationAddress.trim(),
          status: "PENDING",
          notes: `Withdrawal request to ${destinationAddress.trim()} via ${protocol}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Withdrawal request submitted successfully and is pending review.",
        transaction: withdrawalTx,
      },
    });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}