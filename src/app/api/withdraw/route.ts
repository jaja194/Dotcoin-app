import { NextResponse } from 'next/server';
import { PrismaClient, TransactionType, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, amountUsdt, protocol, destinationAddress } = await req.json();

    if (!userId || !amountUsdt || !protocol || !destinationAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required withdrawal fields' },
        { status: 400 }
      );
    }

    const amount = Number(amountUsdt);
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal amount must be greater than 0' },
        { status: 400 }
      );
    }

    // 1. Fetch user to check available yield balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        investmentPlans: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Calculate total available profit across active plans
    const totalAvailableProfit = user.investmentPlans.reduce(
      (sum, plan) => sum + plan.accruedProfitUsdt,
      0
    );

    if (amount > totalAvailableProfit) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient yield balance. Available for withdrawal: $${totalAvailableProfit.toFixed(2)} USDT`
        },
        { status: 400 }
      );
    }

    // 2. Atomic Transaction: Create Withdrawal Request & Deduct Accrued Yield
    await prisma.$transaction(async (tx) => {
      // Deduct proportionally or from active plans
      let remainingToDeduct = amount;
      for (const plan of user.investmentPlans) {
        if (remainingToDeduct <= 0) break;
        const deduct = Math.min(plan.accruedProfitUsdt, remainingToDeduct);
        
        await tx.investmentPlan.update({
          where: { id: plan.id },
          data: {
            accruedProfitUsdt: { decrement: deduct }
          }
        });
        remainingToDeduct -= deduct;
      }

      // Record withdrawal transaction in ledger
      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.WITHDRAWAL,
          protocol,
          expectedAmountUsdt: amount,
          receivedAmountUsdt: 0,
          depositAddress: destinationAddress,
          status: TransactionStatus.PENDING,
          notes: `Withdrawal request to ${destinationAddress} via ${protocol}`
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully. Awaiting admin dispatch.'
    });
  } catch (error) {
    console.error('Withdrawal Request Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing withdrawal' },
      { status: 500 }
    );
  }
}