'use client';

// ==========================================
// MAIN INVESTOR DASHBOARD PAGE (/dashboard)
// ==========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Wallet, 
  Lock, 
  Bot, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Copy,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

export default function DashboardPage() {
  // Modal States
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<'TRC20' | 'ERC20' | 'BEP20'>('TRC20');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Mocked System Wallet Addresses
  const walletAddresses: Record<string, string> = {
    TRC20: 'TDotCoinUsdtAddressTrc20NetworkKey123456789',
    ERC20: '0xDotCoinUsdtAddressErc20NetworkKey123456789',
    BEP20: '0xDotCoinUsdtAddressBep20NetworkKey123456789',
  };

  // Mocked Lockup Calculations (365 Days Engine)
  const totalLockupDays = 365;
  const daysElapsed = 193; // Days active since investment
  const daysRemaining = totalLockupDays - daysElapsed;
  const lockupProgressPercentage = Math.round((daysElapsed / totalLockupDays) * 100);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              ●
            </div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              DOTCOIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Bot className="w-4 h-4" />
              Bot Marketplace
            </Link>
            <Link href="/login" className="text-sm font-medium bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-all">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Top Summary Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Investor Portfolio Overview</h1>
            <p className="text-xs text-slate-400 mt-1">Real-time tracking of algorithmic returns and lockup schedule.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDepositModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-xs text-white shadow-lg flex items-center gap-2 transition-all"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Deposit USDT
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs text-slate-100 flex items-center gap-2 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw Profits
            </button>
          </div>
        </div>

        {/* ------------------------------------------ */}
        {/* METRICS CARDS GRID */}
        {/* ------------------------------------------ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Invested Capital */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Active Principal</span>
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 mt-3">$25,000.00 <span className="text-xs font-normal text-slate-400">USDT</span></div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 365-Day Capital Lock Active
            </div>
          </div>

          {/* Card 2: Total Accrued Profits */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Total Accrued Profit</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-3">+$8,420.50 <span className="text-xs font-normal text-slate-400">USDT</span></div>
            <div className="text-xs text-slate-400 mt-2">+33.68% Total Return to Date</div>
          </div>

          {/* Card 3: Active Trading Bot Tier */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Active Bot Tier</span>
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-cyan-400 mt-3">Quantum Alpha</div>
            <div className="text-xs text-slate-400 mt-2">100% Target ROI Engine</div>
          </div>

          {/* Card 4: Available Wallet Balance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Withdrawable Balance</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 mt-3">$12,450.00 <span className="text-xs font-normal text-slate-400">USDT</span></div>
            <div className="text-xs text-amber-400 mt-2">Ready for instant payout</div>
          </div>
        </section>

        {/* ------------------------------------------ */}
        {/* 365-DAY CAPITAL LOCKUP TRACKER ENGINE */}
        {/* ------------------------------------------ */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">365-Day Capital Lockup Engine</h2>
                <p className="text-xs text-slate-400">Principal capital is locked for 365 days to protect market strategies while profits yield continuously.</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Days Remaining</span>
              <div className="text-2xl font-black text-cyan-400">{daysRemaining} Days</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Progress: {daysElapsed} / {totalLockupDays} Days</span>
              <span className="text-cyan-400">{lockupProgressPercentage}% Completed</span>
            </div>
            <div className="w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500 shadow-md shadow-cyan-500/50"
                style={{ width: `${lockupProgressPercentage}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------ */}
        {/* ACTIVE INVESTMENT PLANS TABLE */}
        {/* ------------------------------------------ */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold">Active Investment Plans</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Principal Amount</th>
                  <th className="py-3 px-4">Target ROI</th>
                  <th className="py-3 px-4">Accrued Profit</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-100">Monthly Momentum Plan</td>
                  <td className="py-4 px-4">$10,000.00 USDT</td>
                  <td className="py-4 px-4 text-cyan-400 font-bold">100.0% Target</td>
                  <td className="py-4 px-4 text-emerald-400 font-bold">+$4,850.00 USDT</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-100">Weekly Alpha Plan</td>
                  <td className="py-4 px-4">$15,000.00 USDT</td>
                  <td className="py-4 px-4 text-cyan-400 font-bold">67.0% Target</td>
                  <td className="py-4 px-4 text-emerald-400 font-bold">+$3,570.50 USDT</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ------------------------------------------ */}
      {/* DEPOSIT USDT MODAL */}
      {/* ------------------------------------------ */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl space-y-6">
            <button onClick={() => setShowDepositModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold">Deposit USDT</h3>
              <p className="text-xs text-slate-400 mt-1">Transfer USDT directly to your portfolio wallet address.</p>
            </div>

            {/* Network Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['TRC20', 'ERC20', 'BEP20'] as const).map((net) => (
                <button
                  key={net}
                  onClick={() => setSelectedNetwork(net)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedNetwork === net
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  USDT-{net}
                </button>
              ))}
            </div>

            {/* Deposit Address Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs text-slate-400">Your Deposit Address ({selectedNetwork}):</span>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-xs font-mono text-slate-200 truncate flex-1">{walletAddresses[selectedNetwork]}</span>
                <button onClick={() => handleCopy(walletAddresses[selectedNetwork])} className="text-cyan-400 hover:text-cyan-300">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowDepositModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white text-sm shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* WITHDRAW PROFIT MODAL */}
      {/* ------------------------------------------ */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl space-y-6">
            <button onClick={() => setShowWithdrawModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold">Request Profit Withdrawal</h3>
              <p className="text-xs text-slate-400 mt-1">Available balance: <span className="text-emerald-400 font-semibold">$12,450.00 USDT</span></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Withdrawal Amount (USDT)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Destination USDT TRC20/ERC20 Wallet Address</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="Enter your receiving wallet address"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                alert('Withdrawal request submitted for Admin verification.');
                setShowWithdrawModal(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white text-sm shadow-lg hover:from-emerald-400 hover:to-teal-500 transition-all"
            >
              Submit Withdrawal Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}