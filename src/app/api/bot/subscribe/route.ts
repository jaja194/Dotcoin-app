import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { BotTier, NetworkProtocol, TransactionType } from "@prisma/client";

// Tier configuration map
const TIER_FEES: Record<BotTier, number> = {
  APEX_TRADER: 5000,
  QUANTUM_ALPHA: 10000,
  TITAN_NEXUS: 20000,
};

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

    // 2. Parse payload
    const body = await request.json();
    const { tier, protocol = "TRC20" } = body;

    if (!tier || !(tier in TIER_FEES)) {
      return NextResponse.json(
        { success: false, error: "Invalid bot tier selected. Choose APEX_TRADER, QUANTUM_ALPHA, or TITAN_NEXUS." },
        { status: 400 }
      );
    }

    const selectedTier = tier as BotTier;
    const requiredFee = TIER_FEES[selectedTier];

    // 3. Check for existing active subscription
    const existingSubscription = await prisma.botSubscription.findFirst({
      where: {
        userId: payload.userId,
        status: "ACTIVE",
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: "User already has an active bot subscription." },
        { status: 400 }
      );
    }

    // 4. Retrieve System Wallet address for selected protocol
    const systemWallet = await prisma.systemWallet.findFirst({
      where: {
        purpose: "BOT_ACCESS_FEE",
        protocol: protocol as NetworkProtocol,
        isActive: true,
      },
    });

    const depositAddress = systemWallet?.address || "CONTACT_ADMIN_FOR_DEPOSIT_ADDRESS";

    // 5. Create Subscription and Transaction records in an atomic transaction
    const [subscription, transaction] = await prisma.$transaction(async (tx) => {
      const sub = await tx.botSubscription.create({
        data: {
          userId: payload.userId,
          tier: selectedTier,
          accessFeeUsdt: requiredFee,
          amountPaidUsdt: 0.0,
          status: "PENDING_PAYMENT",
        },
      });

      const trx = await tx.transaction.create({
        data: {
          userId: payload.userId,
          type: TransactionType.BOT_ACCESS_FEE,
          protocol: protocol as NetworkProtocol,
          expectedAmountUsdt: requiredFee,
          receivedAmountUsdt: 0.0,
          depositAddress: depositAddress,
          status: "PENDING",
        },
      });

      return [sub, trx];
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Bot subscription initialized. Complete payment to activate.",
        subscription,
        paymentDetails: {
          transactionId: transaction.id,
          expectedAmountUsdt: requiredFee,
          depositAddress: depositAddress,
          protocol: protocol,
        },
      },
    });
  } catch (error) {
    console.error("Bot Subscription Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}