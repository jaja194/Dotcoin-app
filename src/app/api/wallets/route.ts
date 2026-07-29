// ==========================================
// API ROUTE: SYSTEM WALLET ADDRESSES (/api/wallets)
// ==========================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const purpose = searchParams.get('purpose') || 'BOT_ACCESS_FEE';

    // Fetch active wallet addresses configured by the Admin
    const wallets = await prisma.systemWallet.findMany({
      where: {
        purpose: purpose as any,
        isActive: true,
      },
    });

    return NextResponse.json({ wallets });
  } catch (error) {
    console.error('Wallet Fetch API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve deposit wallet addresses.' },
      { status: 500 }
    );
  }
}