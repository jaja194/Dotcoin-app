// ==========================================
// AUTOMATED DAILY ROI CRON SCRIPT
// ==========================================

import { PrismaClient, PlanStatus, TransactionType, NetworkProtocol, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Target Daily Return Rates based on Bot Tier
const DAILY_ROI_RATES: Record<string, number> = {
  APEX_TRADER: 0.018,    // ~1.8% daily return
  QUANTUM_ALPHA: 0.027,  // ~2.7% daily return
  TITAN_NEXUS: 0.055     // ~5.5% daily return
};

export async function processDailyRoiPayouts() {
  console.log('[CRON] Starting Daily ROI Payout Batch Execution...');
  const startTime = Date.now();

  try {
    // 1. Fetch all ACTIVE investment plans with their user & bot subscription details
    const activePlans = await prisma.investmentPlan.findMany({
      where: {
        status: PlanStatus.ACTIVE,
      },
      include: {
        botSubscription: true,
        user: true,
      },
    });

    console.log(`[CRON] Found ${activePlans.length} active investment plan(s) for yield processing.`);

    let processedCount = 0;
    let totalPayoutUsdt = 0;

    for (const plan of activePlans) {
      const tierName = plan.botSubscription?.tier || 'APEX_TRADER';
      const roiRate = DAILY_ROI_RATES[tierName] || 0.018;

      // Daily payout calculation on invested capital
      const dailyYield = plan.capitalAmountUsdt * roiRate;

      // Atomic transaction: Update plan accrued profits & create financial transaction record
      await prisma.$transaction([
        // Update accrued profit on the investment plan
        prisma.investmentPlan.update({
          where: { id: plan.id },
          data: {
            accruedProfitUsdt: { increment: dailyYield },
          },
        }),

        // Create transaction history record for user ledger
        prisma.transaction.create({
          data: {
            userId: plan.userId,
            investmentPlanId: plan.id,
            type: TransactionType.PROFIT_PAYOUT,
            protocol: NetworkProtocol.TRC20,
            expectedAmountUsdt: dailyYield,
            receivedAmountUsdt: dailyYield,
            depositAddress: 'INTERNAL_AUTO_PAYOUT',
            txHash: `ROI-${Date.now()}-${plan.id.substring(0, 8)}`,
            status: TransactionStatus.COMPLETED,
            notes: `Automated ${tierName} Daily ROI payout`,
          },
        }),
      ]);

      processedCount++;
      totalPayoutUsdt += dailyYield;
      console.log(
        `[CRON] Paid $${dailyYield.toFixed(2)} USDT yield to Plan ${plan.id} (User: ${plan.user.email}, Tier: ${tierName})`
      );
    }

    console.log(
      `[CRON] Batch completed in ${Date.now() - startTime}ms. Processed ${processedCount} plan(s), total ROI distributed: $${totalPayoutUsdt.toFixed(2)} USDT.`
    );
  } catch (error) {
    console.error('[CRON ERROR] Daily ROI execution failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute directly if run via CLI
import { fileURLToPath } from 'url';

// Check if file is being run directly via CLI (ESM replacement for require.main)
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  processDailyRoiPayouts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}