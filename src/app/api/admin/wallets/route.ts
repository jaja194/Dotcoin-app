import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NetworkProtocol, Role, WalletPurpose } from "@prisma/client";

// GET: Retrieve configured system wallets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const purposeParam = searchParams.get("purpose");
    const protocolParam = searchParams.get("protocol");

    const where: any = { isActive: true };

    if (purposeParam && Object.values(WalletPurpose).includes(purposeParam as WalletPurpose)) {
      where.purpose = purposeParam as WalletPurpose;
    }

    if (protocolParam && Object.values(NetworkProtocol).includes(protocolParam as NetworkProtocol)) {
      where.protocol = protocolParam as NetworkProtocol;
    }

    const wallets = await prisma.systemWallet.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: wallets,
    });
  } catch (error) {
    console.error("Fetch System Wallets Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Upsert (Create or Update) System Wallet Address
export async function POST(request: Request) {
  try {
    // 1. Verify Admin JWT Authentication
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

    // 2. Parse and validate body
    const body = await request.json();
    const { purpose, protocol, address, isActive = true } = body;

    if (!purpose || !Object.values(WalletPurpose).includes(purpose as WalletPurpose)) {
      return NextResponse.json(
        { success: false, error: "Valid purpose required (BOT_ACCESS_FEE or INVESTMENT_CAPITAL)." },
        { status: 400 }
      );
    }

    if (!protocol || !Object.values(NetworkProtocol).includes(protocol as NetworkProtocol)) {
      return NextResponse.json(
        { success: false, error: "Valid network protocol required (TRC20, ERC20, or BEP20)." },
        { status: 400 }
      );
    }

    if (!address || typeof address !== "string" || address.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Wallet address string is required." },
        { status: 400 }
      );
    }

    // 3. Upsert System Wallet on [purpose, protocol] unique constraint
    const systemWallet = await prisma.systemWallet.upsert({
      where: {
        purpose_protocol: {
          purpose: purpose as WalletPurpose,
          protocol: protocol as NetworkProtocol,
        },
      },
      update: {
        address: address.trim(),
        isActive: Boolean(isActive),
      },
      create: {
        purpose: purpose as WalletPurpose,
        protocol: protocol as NetworkProtocol,
        address: address.trim(),
        isActive: Boolean(isActive),
      },
    });

    // 4. Log Admin Action
    await prisma.adminAuditLog.create({
      data: {
        adminId: adminUser.id,
        actionType: "SYSTEM_WALLET_UPDATE",
        changesMade: JSON.stringify({
          purpose,
          protocol,
          address: address.trim(),
          isActive,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "System wallet configured successfully.",
        wallet: systemWallet,
      },
    });
  } catch (error) {
    console.error("System Wallet Config Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}