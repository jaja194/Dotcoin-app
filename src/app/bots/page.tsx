'use client';

// ==========================================
// TRADING BOTS SELECTION PAGE (/bots)
// ==========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  ArrowLeft,
  Lock,
  Sparkles,
  TrendingUp,
  Cpu
} from 'lucide-react';
import DepositModal from '@/components/DepositModal'; // Use '../../components/DepositModal' if not using @/ alias

interface UserBotStatus {
  botAccessTier: 'NONE' | 'PRO' | 'ENTERPRISE';
  botAccessExpiresAt: string | null;
}

export default function BotsPage() {
  const [userStatus, setUserStatus] = useState<UserBotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'PRO' | 'ENTERPRISE'>('PRO');

  useEffect(() => {
    fetchUserBotStatus();
  }, []);

  const fetchUserBotStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success && result.data?.user) {
        setUserStatus({
          botAccessTier: result.data.user.botAccessTier,
          botAccessExpiresAt: result.data.user.botAccessExpiresAt
        });
      }
    } catch (err) {
      console.error('Failed to load bot status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTier = (tier: 'PRO' | 'ENTERPRISE') => {
    setSelectedTier(tier);
    setDepositModalOpen(true);
  };

  const currentTier = userStatus?.botAccessTier || 'NONE';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                DOTCOIN BOTS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Active License:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
              currentTier !== 'NONE'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {currentTier !== 'NONE' ? `${currentTier} TIER` : 'INACTIVE'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Page Title & Subtitle */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" /> High-Frequency Algorithmic Execution
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Unlock Automated Trading Licenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Activate a license tier to connect your portfolio to our proprietary quantitative arbitrage algorithms and generate automated daily returns.
          </p>
        </div>

        {/* Pricing & Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          
          {/* PRO TIER CARD */}
          <div className={`bg-slate-900 rounded-3xl p-8 border relative flex flex-col justify-between transition-all ${
            currentTier === 'PRO'
              ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-2xl shadow-cyan-500/10'
              : 'border-slate-800 hover:border-slate-700'
          }`}>
            {currentTier === 'PRO' && (
              <span className="absolute -top-3 right-6 bg-cyan-500 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full">
                Active Tier
              </span>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-100">PRO BOT</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Optimal for core investors</p>
                </div>
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
                  <Zap className="w-6 h-6" />
                </div>
              </div>

              {/* Price & Return Box */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-400">Access Fee:</span>
                  <span className="text-2xl font-black text-cyan-400">$100 <span className="text-xs font-normal text-slate-500">USDT</span></span>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-900 pt-2">
                  <span className="text-xs font-semibold text-slate-400">Daily ROI:</span>
                  <span className="text-base font-extrabold text-emerald-400">1.5% - 2.0% / day</span>
                </div>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Automated Arbitrage Spot Execution</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Capital Lockup Min: <strong>$100 USDT</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Daily automated profit credit</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Standard priority support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('PRO')}
              disabled={currentTier === 'PRO'}
              className={`w-full mt-8 py-3.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                currentTier === 'PRO'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {currentTier === 'PRO' ? 'Current Active License' : 'Activate PRO Tier ($100 USDT)'}
            </button>
          </div>

          {/* ENTERPRISE TIER CARD */}
          <div className={`bg-slate-900 rounded-3xl p-8 border relative flex flex-col justify-between transition-all ${
            currentTier === 'ENTERPRISE'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-2xl shadow-amber-500/10'
              : 'border-slate-800 hover:border-slate-700'
          }`}>
            <div className="absolute -top-3 left-6 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" /> Max Return Tier
            </div>

            {currentTier === 'ENTERPRISE' && (
              <span className="absolute -top-3 right-6 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full">
                Active Tier
              </span>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between mt-1">
                <div>
                  <h3 className="text-xl font-black text-slate-100">ENTERPRISE BOT</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Institutional liquidity strategy</p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Price & Return Box */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-400">Access Fee:</span>
                  <span className="text-2xl font-black text-amber-400">$300 <span className="text-xs font-normal text-slate-500">USDT</span></span>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-900 pt-2">
                  <span className="text-xs font-semibold text-slate-400">Daily ROI:</span>
                  <span className="text-base font-extrabold text-emerald-400">2.5% - 3.5% / day</span>
                </div>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>High-Frequency Cross-Exchange Arbitrage</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Capital Lockup Min: <strong>$1,000 USDT</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Priority daily profit compounding</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Dedicated VIP account manager</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('ENTERPRISE')}
              disabled={currentTier === 'ENTERPRISE'}
              className={`w-full mt-8 py-3.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                currentTier === 'ENTERPRISE'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20'
              }`}
            >
              {currentTier === 'ENTERPRISE' ? 'Current Active License' : 'Activate ENTERPRISE Tier ($300 USDT)'}
            </button>
          </div>

        </div>

        {/* Security & Verification Banner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left max-w-4xl mx-auto">
          <ShieldCheck className="w-8 h-8 text-cyan-400 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Manual On-Chain Verification Security
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              License fees are verified directly on the blockchain by administrators. Once your TXID is confirmed, your bot tier and daily yield engine activate immediately.
            </p>
          </div>
        </div>
      </main>

      {/* Deposit Checkout Modal Integration */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        type="BOT_ACCESS_FEE"
        initialAmount={selectedTier === 'PRO' ? 100 : 300}
        botTier={selectedTier}
        onSuccess={fetchUserBotStatus}
      />
    </div>
  );
}