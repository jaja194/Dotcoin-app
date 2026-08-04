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
    const {
      amount,
      protocol = "TRC20",
      depositAddress,
      txHash,
      type = "INVESTMENT_DEPOSIT",
      investmentPlanId,
    } = body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid deposit amount." },
        { status: 400 }
      );
    }

    if (!txHash || typeof txHash !== "string" || txHash.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Transaction hash (txHash) is required." },
        { status: 400 }
      );
    }

    if (!depositAddress || typeof depositAddress !== "string") {
      return NextResponse.json(
        { success: false, error: "Deposit address is required." },
        { status: 400 }
      );
    }

    // 3. Prevent Duplicate Submissions (txHash is unique in schema)
    const existingTx = await prisma.transaction.findUnique({
      where: { txHash: txHash.trim() },
    });

    if (existingTx) {
      return NextResponse.json(
        { success: false, error: "This transaction hash has already been submitted." },
        { status: 400 }
      );
    }

    // 4. Record Deposit Transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: payload.userId,
        investmentPlanId: investmentPlanId || null,
        type: type as TransactionType,
        protocol: protocol as NetworkProtocol,
        expectedAmountUsdt: parsedAmount,
        receivedAmountUsdt: 0.0, // Pending confirmation
        depositAddress: depositAddress.trim(),
        txHash: txHash.trim(),
        confirmations: 0,
        status: "PENDING",
        notes: "Awaiting manual/on-chain confirmation",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Deposit transaction submitted successfully. Awaiting confirmation.",
        transaction,
      },
    });
  } catch (error) {
    console.error("Deposit Submission Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}