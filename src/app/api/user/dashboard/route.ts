// ==========================================
// API ROUTE: USER DASHBOARD DATA (/api/user/dashboard)
// ==========================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // 1. Fetch user dashboard metrics (In production, replace with authenticated user ID session)
    const mockUserId = 'user_demo_123';

    // Mock active user portfolio response state
    const dashboardData = {
      user: {
        email: 'investor@dotcoin.app',
        walletBalance: 12450.00,
        totalInvested: 25000.00,
        totalProfits: 8420.50,
        activeBotTier: 'QUANTUM_ALPHA',
        activeBotName: 'Quantum Alpha',
        lockupStartDate: '2026-01-15T00:00:00.000Z',
        lockupEndDate: '2027-01-15T00:00:00.000Z',
      },
      activePlans: [
        {
          id: 'plan_1',
          name: 'Monthly Momentum Plan',
          principal: 10000.00,
          currentRoi: 48.5,
          targetRoi: 100.0,
          accruedProfit: 4850.00,
          status: 'ACTIVE',
          daysRemaining: 172,
        },
        {
          id: 'plan_2',
          name: 'Weekly Alpha Plan',
          principal: 15000.00,
          currentRoi: 23.8,
          targetRoi: 67.0,
          accruedProfit: 3570.50,
          status: 'ACTIVE',
          daysRemaining: 172,
        }
      ]
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard Fetch API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard portfolio data.' },
      { status: 500 }
    );
  }
}