'use client';

// ==========================================
// ADMIN CONTROL PANEL & VERIFICATION (/admin)
// ==========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Wallet, 
  Bot,
  RefreshCw,
  Search,
  AlertCircle
} from 'lucide-react';

interface PendingTransaction {
  id: string;
  userId: string;
  type: 'BOT_ACCESS_FEE' | 'INVESTMENT_DEPOSIT' | 'WITHDRAWAL' | 'PROFIT_PAYOUT';
  protocol: 'TRC20' | 'ERC20' | 'BEP20';
  expectedAmountUsdt: number;
  receivedAmountUsdt?: number;
  txHash: string | null;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  investmentPlanId?: string | null;
  user?: {
    email: string;
  };
}

export default function AdminDashboardPage() {
  const [deposits, setDeposits] = useState<PendingTransaction[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real System Stats State
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    totalCapitalLocked: 0,
    activeBotLicenses: 0,
  });

  // Admin Wallets State
  const [trc20Wallet, setTrc20Wallet] = useState('');
  const [erc20Wallet, setErc20Wallet] = useState('');
  const [bep20Wallet, setBep20Wallet] = useState('');
  const [savingWallets, setSavingWallets] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingDeposits(true);
    const token = localStorage.getItem('token');
    const authHeader = { Authorization: `Bearer ${token}` };

    try {
      // 1. Fetch Pending Transactions
      const resDeposits = await fetch('/api/transactions?status=PENDING', { headers: authHeader });
      const dataDeposits = await resDeposits.json();
      
      if (dataDeposits.success) {
        const pendingList: PendingTransaction[] = dataDeposits.data.transactions || [];
        setDeposits(pendingList);
        setStats((prev) => ({ ...prev, pendingVerifications: pendingList.length }));
      }

      // 2. Fetch Dashboard Overview Stats
      const resDashboard = await fetch('/api/dashboard', { headers: authHeader });
      const dataDashboard = await resDashboard.json();
      if (dataDashboard.success) {
        setStats((prev) => ({
          ...prev,
          totalCapitalLocked: dataDashboard.data.activePlan?.capitalAmountUsdt || 0,
          activeBotLicenses: dataDashboard.data.user?.botAccessTier !== 'NONE' ? 1 : 0,
        }));
      }

      // 3. Fetch Configured System Wallets
      const resWallets = await fetch('/api/admin/wallets', { headers: authHeader });
      const dataWallets = await resWallets.json();
      if (dataWallets.success && Array.isArray(dataWallets.data)) {
        dataWallets.data.forEach((w: { protocol: string; address: string }) => {
          if (w.protocol === 'TRC20') setTrc20Wallet(w.address);
          if (w.protocol === 'ERC20') setErc20Wallet(w.address);
          if (w.protocol === 'BEP20') setBep20Wallet(w.address);
        });
      }
    } catch (err) {
      console.error('Error loading admin panel data:', err);
      setFeedback({ type: 'error', message: 'Failed to load initial admin data.' });
    } finally {
      setLoadingDeposits(false);
    }
  };

  // Handle Approve or Reject using POST /api/admin/deposit
  const handleAction = async (transactionId: string, targetStatus: 'COMPLETED' | 'REJECTED') => {
    setProcessingId(transactionId);
    setFeedback(null);
    try {
      const token = localStorage.getItem('token');
      const targetTx = deposits.find((d) => d.id === transactionId);

      const res = await fetch('/api/admin/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId,
          status: targetStatus,
          receivedAmountUsdt: targetTx?.expectedAmountUsdt || 0,
          notes: `Admin processed as ${targetStatus}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDeposits((prev) => prev.filter((item) => item.id !== transactionId));
        setStats((prev) => ({
          ...prev,
          pendingVerifications: Math.max(0, prev.pendingVerifications - 1),
        }));
        setFeedback({
          type: 'success',
          message: `Transaction ${targetStatus === 'COMPLETED' ? 'approved' : 'rejected'} successfully!`,
        });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Verification action failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error processing deposit.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Save System Receiving Wallets using POST /api/admin/wallets
  const handleSaveWallets = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWallets(true);
    setFeedback(null);
    const token = localStorage.getItem('token');
    const authHeader = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const walletRequests = [
        { purpose: 'BOT_ACCESS_FEE', protocol: 'TRC20', address: trc20Wallet },
        { purpose: 'BOT_ACCESS_FEE', protocol: 'ERC20', address: erc20Wallet },
        { purpose: 'BOT_ACCESS_FEE', protocol: 'BEP20', address: bep20Wallet },
      ];

      await Promise.all(
        walletRequests.map((wallet) =>
          fetch('/api/admin/wallets', {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify(wallet),
          })
        )
      );

      setWalletSaved(true);
      setTimeout(() => setWalletSaved(false), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update receiving wallets.' });
    } finally {
      setSavingWallets(false);
    }
  };

  const filteredDeposits = deposits.filter((d) => {
    const userEmail = d.user?.email || d.userId || '';
    const hash = d.txHash || '';
    return (
      userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hash.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
                : 'bg-red-950/80 border border-red-700 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* System Overview Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Pending Verifications</span>
              <RefreshCw className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 mt-3">
              {stats.pendingVerifications}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Total Capital Locked</span>
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-slate-100 mt-3">
              ${stats.totalCapitalLocked.toLocaleString()} USDT
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Active Bot Licenses</span>
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-3">
              {stats.activeBotLicenses}
            </div>
          </div>
        </section>

        {/* ------------------------------------------ */}
        {/* PENDING DEPOSITS VERIFICATION TABLE */}
        {/* ------------------------------------------ */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Pending Blockchain Deposit Verifications</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={fetchInitialData}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-all"
                title="Refresh deposits"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
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
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Network</th>
                  <th className="py-3 px-4">Purpose / Type</th>
                  <th className="py-3 px-4">Blockchain TXID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loadingDeposits ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading pending deposits...
                    </td>
                  </tr>
                ) : filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No deposit records matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-100">
                        {item.user?.email || `${item.userId.substring(0, 10)}...`}
                      </td>
                      <td className="py-4 px-4 font-bold text-cyan-400">
                        ${item.expectedAmountUsdt.toLocaleString()} USDT
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-300">{item.protocol}</td>
                      <td className="py-4 px-4 text-slate-400">{item.type}</td>
                      <td className="py-4 px-4">
                        {item.txHash ? (
                          <a
                            href={
                              item.protocol === 'TRC20'
                                ? `https://tronscan.org/#/transaction/${item.txHash}`
                                : `https://bscscan.com/tx/${item.txHash}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 max-w-[140px] truncate"
                          >
                            <span>{item.txHash}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">No TxHash</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={processingId === item.id}
                            onClick={() => handleAction(item.id, 'COMPLETED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {processingId === item.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            disabled={processingId === item.id}
                            onClick={() => handleAction(item.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
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
                placeholder="Enter TRC20 address"
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
                placeholder="Enter ERC20 address"
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
                placeholder="Enter BEP20 address"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={savingWallets}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-xs text-white shadow-lg transition-all disabled:opacity-50"
              >
                {savingWallets ? 'Saving...' : 'Save Receiving Wallets'}
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