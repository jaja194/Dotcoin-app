import { NextResponse } from 'next/server';
import { PrismaClient, WalletPurpose, NetworkProtocol } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch all active receiving system wallets
export async function GET() {
  try {
    const wallets = await prisma.systemWallet.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, wallets });
  } catch (error) {
    console.error('Fetch System Wallets Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch wallets' }, { status: 500 });
  }
}

// POST: Upsert (Create or Update) System Wallet Address
export async function POST(req: Request) {
  try {
    const { purpose, protocol, address } = await req.json();

    if (!purpose || !protocol || !address) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const wallet = await prisma.systemWallet.upsert({
      where: {
        purpose_protocol: {
          purpose: purpose as WalletPurpose,
          protocol: protocol as NetworkProtocol,
        },
      },
      update: {
        address,
        isActive: true,
      },
      create: {
        purpose: purpose as WalletPurpose,
        protocol: protocol as NetworkProtocol,
        address,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, wallet, message: 'System wallet updated successfully' });
  } catch (error) {
    console.error('Update System Wallet Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update system wallet' }, { status: 500 });
  }
}