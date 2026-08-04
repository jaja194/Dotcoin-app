'use client';

// ==========================================
// USER DASHBOARD OVERVIEW PAGE (/dashboard)
// ==========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ShieldCheck, 
  RefreshCw,
  PlusCircle,
  Zap,
  Activity,
  Clock
} from 'lucide-react';
import DepositModal from '@/components/DepositModal';

interface UserDashboardData {
  user: {
    id: string;
    email: string;
    botAccessTier: 'NONE' | 'PRO' | 'ENTERPRISE';
    botAccessExpiresAt: string | null;
  };
  activePlan: {
    id: string;
    tier: string;
    capitalAmountUsdt: number;
    dailyRoiPercentage: number;
    startDate: string;
    maturityDate: string;
    status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  } | null;
  stats: {
    totalCapitalLocked: number;
    totalProfitEarned: number;
    pendingDepositsCount: number;
  };
}

export default function UserDashboardPage() {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositType, setDepositType] = useState<'BOT_ACCESS_FEE' | 'INVESTMENT_DEPOSIT'>('INVESTMENT_DEPOSIT');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDeposit = (type: 'BOT_ACCESS_FEE' | 'INVESTMENT_DEPOSIT') => {
    setDepositType(type);
    setDepositModalOpen(true);
  };

  const botTier = data?.user?.botAccessTier || 'NONE';
  const hasActiveBot = botTier !== 'NONE';
  const activePlan = data?.activePlan;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-cyan-500/20">
              ●
            </div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              DOTCOIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/bots" className="text-xs font-bold text-slate-300 hover:text-cyan-400 transition-colors">
              Trading Bots
            </Link>
            <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Welcome & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Welcome Back, <span className="text-cyan-400">{data?.user?.email ? data.user.email.split('@')[0] : 'Trader'}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Monitor your trading algorithms, portfolio performance, and ROI status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openDeposit('INVESTMENT_DEPOSIT')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-xs text-white shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Deposit Capital
            </button>
            <button
              onClick={fetchDashboardData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Active Bot Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Algorithmic License</span>
              <Bot className={`w-4 h-4 ${hasActiveBot ? 'text-emerald-400' : 'text-slate-600'}`} />
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className={`text-2xl font-black ${hasActiveBot ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasActiveBot ? `${botTier} BOT` : 'NO ACTIVE BOT'}
              </span>
              {!hasActiveBot && (
                <button
                  onClick={() => openDeposit('BOT_ACCESS_FEE')}
                  className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Activate <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {hasActiveBot ? 'Automated daily execution active.' : 'Activate a tier to unlock investment deposits.'}
            </p>
          </div>

          {/* Locked Capital Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Capital Locked</span>
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-slate-100 mt-3">
              ${(data?.stats?.totalCapitalLocked || activePlan?.capitalAmountUsdt || 0).toLocaleString()} USDT
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {activePlan ? `${activePlan.dailyRoiPercentage}% Daily Return Rate` : 'No locked capital portfolio.'}
            </p>
          </div>

          {/* Cumulative Profit Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Total Yield Earned</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-3">
              +${(data?.stats?.totalProfitEarned || 0).toLocaleString()} USDT
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Directly withdrawable profit balance.
            </p>
          </div>
        </section>

        {/* Active Plan Detail Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold">Active Investment Portfolio</h2>
            </div>
            {activePlan && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                ACTIVE
              </span>
            )}
          </div>

          {activePlan ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Tier Plan</span>
                <p className="text-lg font-black text-slate-100 mt-1">{activePlan.tier}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Capital Locked</span>
                <p className="text-lg font-black text-cyan-400 mt-1">${activePlan.capitalAmountUsdt} USDT</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Daily Yield</span>
                <p className="text-lg font-black text-emerald-400 mt-1">{activePlan.dailyRoiPercentage}% / day</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Lockup Start</span>
                <p className="text-sm font-medium text-slate-300 mt-1">
                  {new Date(activePlan.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-4">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-300">No Active Investment Plan</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Deposit capital into an algorithmic portfolio to start generating automated daily USDT yields.
                </p>
              </div>
              <button
                onClick={() => openDeposit(hasActiveBot ? 'INVESTMENT_DEPOSIT' : 'BOT_ACCESS_FEE')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs text-cyan-400 transition-all"
              >
                {hasActiveBot ? 'Fund Portfolio' : 'Unlock Bot License First'}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Deposit Modal Integration */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        type={depositType}
        initialAmount={depositType === 'BOT_ACCESS_FEE' ? 100 : 500}
        botTier={botTier === 'NONE' ? 'PRO' : botTier}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}