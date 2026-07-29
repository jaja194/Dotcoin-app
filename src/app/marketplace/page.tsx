'use client';

// ==========================================
// BOT MARKETPLACE & PROFIT ESTIMATOR PAGE (/marketplace)
// ==========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Calculator, 
  ArrowRight, 
  QrCode, 
  Copy, 
  Check, 
  X,
  AlertCircle 
} from 'lucide-react';

interface BotPackage {
  tier: 'APEX_TRADER' | 'QUANTUM_ALPHA' | 'TITAN_NEXUS';
  name: string;
  accessFee: number;
  targetRoi: number;
  strategy: string;
  description: string;
  features: string[];
  recommendedPlan: string;
  badge: string;
}

const BOT_PACKAGES: BotPackage[] = [
  {
    tier: 'APEX_TRADER',
    name: 'Apex Trader',
    accessFee: 5000,
    targetRoi: 67,
    strategy: 'Conservative Growth',
    description: 'Designed for capital preservation with steady, low-volatility algorithmic executions.',
    badge: 'Popular for Beginners',
    recommendedPlan: 'Weekly ($500 - $4,000)',
    features: [
      '67% Projected Target ROI',
      'Low Risk & Max Drawdown Limits',
      'Binance & Bybit API Execution',
      '24/7 Automated Market Monitoring',
    ],
  },
  {
    tier: 'QUANTUM_ALPHA',
    name: 'Quantum Alpha',
    accessFee: 10000,
    targetRoi: 100,
    strategy: 'Balanced Algorithmic',
    description: 'High-yield algorithmic momentum strategies balancing risk and optimal market returns.',
    badge: 'Most Popular',
    recommendedPlan: 'Monthly ($5,000 - $100,000)',
    features: [
      '100% Projected Target ROI (Doubles Capital)',
      'Medium Volatility Multi-Pair Strategy',
      'Priority Trade Queue Execution',
      'Real-time P&L Analytics Dashboard',
    ],
  },
  {
    tier: 'TITAN_NEXUS',
    name: 'Titan Nexus',
    accessFee: 20000,
    targetRoi: 200,
    strategy: 'Aggressive HFT',
    description: 'High-frequency algorithmic trading capitalizing on micro-market arbitrage and swings.',
    badge: 'Institutional Grade',
    recommendedPlan: 'Yearly ($200,000 - $1,000,000)',
    features: [
      '200% Projected Target ROI (Triples Capital)',
      'Sub-millisecond Order Execution Engine',
      'VIP Dedicated Account Oversight',
      'Maximum Yield Strategy Profile',
    ],
  },
];

export default function MarketplacePage() {
  // Calculator States
  const [calculatorCapital, setCalculatorCapital] = useState<number>(10000);
  const [selectedBotForModal, setSelectedBotForModal] = useState<BotPackage | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'TRC20' | 'ERC20' | 'BEP20'>('TRC20');
  const [copied, setCopied] = useState(false);

  // Mocked/Fallback Addresses (In production, fetched dynamically from /api/wallets)
  const walletAddresses: Record<string, string> = {
    TRC20: 'TDotCoinUsdtAddressTrc20NetworkKey123456789',
    ERC20: '0xDotCoinUsdtAddressErc20NetworkKey123456789',
    BEP20: '0xDotCoinUsdtAddressBep20NetworkKey123456789',
  };

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
            <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="text-sm font-medium bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-all">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Banner Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-slate-100 via-cyan-100 to-blue-400 bg-clip-text text-transparent">
            Automated Bot Marketplace
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Select a trading bot tier, complete the one-time USDT access fee, and unlock algorithmic trading strategies with up to <span className="text-cyan-400 font-semibold">200% Target ROI</span>.
          </p>
        </div>

        {/* ------------------------------------------ */}
        {/* INTERACTIVE PROFIT ESTIMATOR / CALCULATOR */}
        {/* ------------------------------------------ */}
        <section className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
            <Calculator className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold">Interactive Profit Estimator</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-5 space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                Planned Capital Investment (USDT)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-medium">$</span>
                <input
                  type="number"
                  value={calculatorCapital}
                  onChange={(e) => setCalculatorCapital(Math.max(0, Number(e.target.value)))}
                  className="block w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg font-bold text-slate-100"
                  placeholder="10000"
                />
              </div>
              <p className="text-xs text-slate-400">
                Enter any investment amount to project your total returns across all 3 bot tiers.
              </p>
            </div>

            {/* Projected Returns Output Matrix */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {BOT_PACKAGES.map((bot) => {
                const projectedProfit = (calculatorCapital * bot.targetRoi) / 100;
                const totalPayout = calculatorCapital + projectedProfit;

                return (
                  <div key={bot.tier} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-center hover:border-cyan-500/40 transition-all">
                    <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">{bot.name}</span>
                    <div className="text-2xl font-black text-cyan-400 mt-2">
                      +{bot.targetRoi}%
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Target ROI</div>
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
                      <div className="text-slate-400">Projected Total</div>
                      <div className="font-bold text-emerald-400 text-sm mt-0.5">
                        ${totalPayout.toLocaleString()} USDT
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------ */}
        {/* BOT SELECTION TIERS GRID */}
        {/* ------------------------------------------ */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {BOT_PACKAGES.map((bot) => (
            <div
              key={bot.tier}
              className={`bg-slate-900 rounded-2xl border flex flex-col justify-between p-6 sm:p-8 relative transition-all duration-300 hover:-translate-y-1 shadow-xl ${
                bot.tier === 'QUANTUM_ALPHA'
                  ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Badge */}
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
                  {bot.badge}
                </div>

                <h3 className="text-2xl font-bold text-slate-100">{bot.name}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{bot.description}</p>

                {/* Price Display */}
                <div className="mt-6">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">One-Time Bot Access Fee</div>
                  <div className="text-3xl font-extrabold text-slate-100 mt-1">
                    ${bot.accessFee.toLocaleString()}{' '}
                    <span className="text-sm font-normal text-slate-400">USDT</span>
                  </div>
                </div>

                {/* ROI Highlight */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Target ROI Profile</span>
                  <span className="text-lg font-black text-emerald-400">+{bot.targetRoi}%</span>
                </div>

                {/* Feature Bullet Points */}
                <ul className="mt-6 space-y-3">
                  {bot.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action CTA Button */}
              <button
                onClick={() => setSelectedBotForModal(bot)}
                className={`w-full mt-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  bot.tier === 'QUANTUM_ALPHA'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                }`}
              >
                <span>Unlock {bot.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>
      </main>

      {/* ------------------------------------------ */}
      {/* BOT CHECKOUT & USDT PAYMENT MODAL */}
      {/* ------------------------------------------ */}
      {selectedBotForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBotForModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <h3 className="text-xl font-bold">Unlock {selectedBotForModal.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Pay the required <span className="text-cyan-400 font-semibold">${selectedBotForModal.accessFee.toLocaleString()} USDT</span> access fee to activate this bot.
              </p>
            </div>

            {/* Network Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                Select USDT Network Protocol
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['TRC20', 'ERC20', 'BEP20'] as const).map((net) => (
                  <button
                    key={net}
                    onClick={() => setSelectedNetwork(net)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      selectedNetwork === net
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    USDT-{net}
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Address Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Receiving USDT ({selectedNetwork}) Address:</span>
                <span className="text-emerald-400 font-medium">● System Ready</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-xs font-mono text-slate-200 truncate flex-1">
                  {walletAddresses[selectedNetwork]}
                </span>
                <button
                  onClick={() => handleCopy(walletAddresses[selectedNetwork])}
                  className="text-cyan-400 hover:text-cyan-300 p-1"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Risk & Terms Notice */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Ensure you send exact <span className="font-bold">USDT ({selectedNetwork})</span> to this address. Access fees are non-refundable once confirmed on the blockchain.
              </span>
            </div>

            {/* Close / Action Button */}
            <button
              onClick={() => setSelectedBotForModal(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white text-sm shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              I Have Completed Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}