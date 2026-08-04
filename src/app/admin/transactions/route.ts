import { NextResponse } from 'next/server';
import { PrismaClient, TransactionStatus, PlanStatus, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Retrieve all user transactions for Admin Review
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, name: true }
        },
        investmentPlan: true
      }
    });

    const stats = {
      totalTransactions: transactions.length,
      pendingCount: transactions.filter(t => t.status === TransactionStatus.PENDING).length,
      completedCount: transactions.filter(t => t.status === TransactionStatus.COMPLETED).length,
      totalVolumeUsdt: transactions
        .filter(t => t.status === TransactionStatus.COMPLETED)
        .reduce((sum, t) => sum + t.expectedAmountUsdt, 0)
    };

    return NextResponse.json({ success: true, stats, transactions });
  } catch (error) {
    console.error('Admin Fetch Transactions Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// PATCH: Approve or Reject a Pending Transaction
export async function PATCH(req: Request) {
  try {
    const { transactionId, action } = await req.json(); // action: "APPROVE" | "REJECT"

    if (!transactionId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { investmentPlan: true }
    });

    if (!tx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.status !== TransactionStatus.PENDING) {
      return NextResponse.json({ success: false, error: 'Transaction already processed' }, { status: 400 });
    }

    if (action === 'REJECT') {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.REJECTED }
      });
      return NextResponse.json({ success: true, message: 'Transaction rejected successfully' });
    }

    // APPROVAL LOGIC
    await prisma.$transaction(async (txPrisma) => {
      // 1. Mark transaction COMPLETED
      await txPrisma.transaction.update({
        where: { id: transactionId },
        data: { 
          status: TransactionStatus.COMPLETED,
          receivedAmountUsdt: tx.expectedAmountUsdt
        }
      });

      // 2. Activate related Investment Plan if applicable
      if (tx.investmentPlanId) {
        await txPrisma.investmentPlan.update({
          where: { id: tx.investmentPlanId },
          data: {
            status: PlanStatus.ACTIVE,
            lockupStartDate: new Date(),
            lockupEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // +365 Days
          }
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Transaction approved and plan activated' });
  } catch (error) {
    console.error('Admin Update Transaction Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process transaction' }, { status: 500 });
  }
}