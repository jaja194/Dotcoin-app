'use client';

// ==========================================
// ADMIN CONTROL PANEL & VERIFICATION (/admin)
// ==========================================

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Wallet, 
  Users, 
  TrendingUp, 
  Bot,
  RefreshCw,
  Search
} from 'lucide-react';

interface DepositRecord {
  id: string;
  userEmail: string;
  amount: number;
  network: 'TRC20' | 'ERC20' | 'BEP20';
  txHash: string;
  purpose: string;
  tier: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const INITIAL_DEPOSITS: DepositRecord[] = [
  {
    id: 'dep_101',
    userEmail: 'alex.trader@gmail.com',
    amount: 5000.00,
    network: 'TRC20',
    txHash: '0x8f7c9123a4b56c7890d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3',
    purpose: 'Apex Trader Unlock',
    tier: 'APEX_TRADER',
    status: 'PENDING',
    createdAt: '2026-07-27 14:30',
  },
  {
    id: 'dep_102',
    userEmail: 'sara.invest@yahoo.com',
    amount: 10000.00,
    network: 'BEP20',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2',
    purpose: 'Quantum Alpha Unlock',
    tier: 'QUANTUM_ALPHA',
    status: 'PENDING',
    createdAt: '2026-07-27 15:10',
  },
];

export default function AdminDashboardPage() {
  const [deposits, setDeposits] = useState<DepositRecord[]>(INITIAL_DEPOSITS);
  const [searchQuery, setSearchQuery] = useState('');
  const [trc20Wallet, setTrc20Wallet] = useState('TDotCoinUsdtAddressTrc20NetworkKey123456789');
  const [erc20Wallet, setErc20Wallet] = useState('0xDotCoinUsdtAddressErc20NetworkKey123456789');
  const [bep20Wallet, setBep20Wallet] = useState('0xDotCoinUsdtAddressBep20NetworkKey123456789');
  const [walletSaved, setWalletSaved] = useState(false);

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setDeposits((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    );
  };

  const handleSaveWallets = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletSaved(true);
    setTimeout(() => setWalletSaved(false), 3000);
  };

  const filteredDeposits = deposits.filter(
    (d) =>
      d.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.txHash.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
              ●
            </div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-red-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
              DOTCOIN ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              User View
            </Link>
            <Link href="/login" className="text-sm font-medium bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-all">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* Banner Section */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">System Admin Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Verify pending USDT deposits, configure receiving wallet addresses, and monitor platform activity.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full text-xs font-bold text-red-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Control Active</span>
          </div>
        </div>

        {/* System Overview Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Pending Verifications</span>
              <RefreshCw className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 mt-3">
              {deposits.filter((d) => d.status === 'PENDING').length}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Total Capital Locked</span>
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-slate-100 mt-3">$2,450,000 USDT</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Active Bot Licenses</span>
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-3">184</div>
          </div>
        </section>

        {/* ------------------------------------------ */}
        {/* PENDING DEPOSITS VERIFICATION TABLE */}
        {/* ------------------------------------------ */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Pending Blockchain Deposit Verifications</h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search email or TXID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Network</th>
                  <th className="py-3 px-4">Purpose / Tier</th>
                  <th className="py-3 px-4">Blockchain TXID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No deposit records matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-100">{item.userEmail}</td>
                      <td className="py-4 px-4 font-bold text-cyan-400">
                        ${item.amount.toLocaleString()} USDT
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-300">{item.network}</td>
                      <td className="py-4 px-4 text-slate-400">{item.purpose}</td>
                      <td className="py-4 px-4">
                        <a
                          href={`https://tronscan.org/#/transaction/${item.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 max-w-[140px] truncate"
                        >
                          <span>{item.txHash}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="py-4 px-4">
                        {item.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            PENDING
                          </span>
                        )}
                        {item.status === 'APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            APPROVED
                          </span>
                        )}
                        {item.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {item.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(item.id, 'APPROVED')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(item.id, 'REJECTED')}
                              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-normal">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ------------------------------------------ */}
        {/* SYSTEM DEPOSIT WALLET MANAGEMENT FORM */}
        {/* ------------------------------------------ */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-bold mb-2">Configure System Receiving Wallets</h2>
          <p className="text-xs text-slate-400 mb-6">
            These addresses will be dynamically served to users paying bot access fees or funding portfolios.
          </p>

          <form onSubmit={handleSaveWallets} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                USDT (TRC20) Admin Receiving Address
              </label>
              <input
                type="text"
                value={trc20Wallet}
                onChange={(e) => setTrc20Wallet(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                USDT (ERC20) Admin Receiving Address
              </label>
              <input
                type="text"
                value={erc20Wallet}
                onChange={(e) => setErc20Wallet(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                USDT (BEP20) Admin Receiving Address
              </label>
              <input
                type="text"
                value={bep20Wallet}
                onChange={(e) => setBep20Wallet(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-xs text-white shadow-lg transition-all"
              >
                Save Receiving Wallets
              </button>
              {walletSaved && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> System Wallets Updated Successfully!
                </span>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}