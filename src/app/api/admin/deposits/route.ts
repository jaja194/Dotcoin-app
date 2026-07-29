// ==========================================
// API ROUTE: ADMIN DEPOSIT MANAGEMENT (/api/admin/deposits)
// ==========================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // In production, enforce Admin authentication session role checks here
    const pendingDeposits = [
      {
        id: 'dep_101',
        userEmail: 'alex.trader@gmail.com',
        amount: 5000.00,
        network: 'TRC20',
        txHash: '0x8f7c9123a4b56c7890d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3',
        purpose: 'BOT_ACCESS_FEE',
        tier: 'APEX_TRADER',
        status: 'PENDING',
        createdAt: '2026-07-27T14:30:00.000Z',
      },
      {
        id: 'dep_102',
        userEmail: 'sara.invest@yahoo.com',
        amount: 10000.00,
        network: 'BEP20',
        txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2',
        purpose: 'BOT_ACCESS_FEE',
        tier: 'QUANTUM_ALPHA',
        status: 'PENDING',
        createdAt: '2026-07-27T15:10:00.000Z',
      }
    ];

    return NextResponse.json({ deposits: pendingDeposits });
  } catch (error) {
    console.error('Admin Deposit Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve pending deposit transactions.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { depositId, action } = await req.json(); // action: 'APPROVE' | 'REJECT'

    if (!depositId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid payload attributes.' }, { status: 400 });
    }

    // In production: Execute Prisma transaction to update deposit status & credit user account balance/bot tier
    return NextResponse.json({
      success: true,
      message: `Deposit ${depositId} successfully updated to status: ${action}D.`
    });
  } catch (error) {
    console.error('Admin Deposit Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update deposit verification status.' },
      { status: 500 }
    );
  }
}