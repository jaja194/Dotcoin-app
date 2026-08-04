import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Role, TransactionStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    // 1. Verify JWT & Admin Role
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

    // Verify Admin Role in DB
    const adminUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    });

    if (
      !adminUser ||
      (adminUser.role !== Role.SUPER_ADMIN && adminUser.role !== Role.SUPPORT_ADMIN)
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    // 2. Parse Request Body
    const body = await request.json();
    const { transactionId, status, receivedAmountUsdt, notes } = body;

    if (!transactionId || typeof transactionId !== "string") {
      return NextResponse.json(
        { success: false, error: "transactionId is required" },
        { status: 400 }
      );
    }

    if (!status || !["COMPLETED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status must be either COMPLETED or REJECTED" },
        { status: 400 }
      );
    }

    // 3. Find target transaction
    const targetTx = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!targetTx) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (targetTx.status !== TransactionStatus.PENDING) {
      return NextResponse.json(
        { success: false, error: `Transaction is already ${targetTx.status}` },
        { status: 400 }
      );
    }

    const finalReceivedAmount =
      receivedAmountUsdt !== undefined
        ? Number(receivedAmountUsdt)
        : targetTx.expectedAmountUsdt;

    // 4. Atomic Execution via Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // A. Update Transaction Record
      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: status as TransactionStatus,
          receivedAmountUsdt: finalReceivedAmount,
          notes: notes || `Verified by admin ${adminUser.id}`,
        },
      });

      // B. Handle BOT_ACCESS_FEE Approval
      if (status === "COMPLETED" && targetTx.type === "BOT_ACCESS_FEE") {
        const pendingSub = await tx.botSubscription.findFirst({
          where: { userId: targetTx.userId, status: "PENDING_PAYMENT" },
          orderBy: { createdAt: "desc" },
        });

        if (pendingSub) {
          await tx.botSubscription.update({
            where: { id: pendingSub.id },
            data: {
              status: "ACTIVE",
              amountPaidUsdt: finalReceivedAmount,
              unlockedAt: new Date(),
            },
          });
        }
      }

      // C. Handle INVESTMENT_DEPOSIT Approval
      if (status === "COMPLETED" && targetTx.investmentPlanId) {
        const now = new Date();
        const lockupEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

        await tx.investmentPlan.update({
          where: { id: targetTx.investmentPlanId },
          data: {
            status: "ACTIVE",
            lockupStartDate: now,
            lockupEndDate: lockupEnd,
            isLocked: true,
          },
        });
      }

      // D. Create Immutable Admin Audit Log
      await tx.adminAuditLog.create({
        data: {
          adminId: adminUser.id,
          targetUserId: targetTx.userId,
          actionType: "DEPOSIT_VERIFICATION",
          changesMade: JSON.stringify({
            transactionId,
            previousStatus: targetTx.status,
            newStatus: status,
            expectedAmount: targetTx.expectedAmountUsdt,
            receivedAmount: finalReceivedAmount,
          }),
        },
      });

      return updatedTx;
    });

    return NextResponse.json({
      success: true,
      data: {
        message: `Deposit transaction ${status.toLowerCase()} successfully.`,
        transaction: result,
      },
    });
  } catch (error) {
    console.error("Deposit Verification Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}