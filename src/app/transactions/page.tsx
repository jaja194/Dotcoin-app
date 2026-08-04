'use client';

// ==========================================
// TRANSACTIONS & WITHDRAWAL HISTORY PAGE (/transactions)
// ==========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Filter,
  Receipt
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'BOT_ACCESS_FEE' | 'INVESTMENT_DEPOSIT' | 'DAILY_ROI_PAYOUT' | 'WITHDRAWAL';
  protocol: string | null;
  expectedAmountUsdt: number;
  txHash: string | null;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 border border-red-500/20 text-red-400">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-3 h-3 animate-spin" /> Pending Admin
          </span>
        );
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'INVESTMENT_DEPOSIT':
      case 'BOT_ACCESS_FEE':
        return <ArrowDownLeft className="w-4 h-4 text-cyan-400" />;
      case 'DAILY_ROI_PAYOUT':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              TRANSACTION HISTORY
            </span>
          </div>

          <button
            onClick={fetchTransactions}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-6">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-xl font-black text-slate-100">Financial Ledger</h1>
            <p className="text-xs text-slate-400 mt-1">Review all account deposits, bot fees, yields, and payouts.</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ALL">All Transactions</option>
              <option value="BOT_ACCESS_FEE">Bot Fee</option>
              <option value="INVESTMENT_DEPOSIT">Investment Deposit</option>
              <option value="DAILY_ROI_PAYOUT">ROI Yield</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Fetching transactions from blockchain ledger...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No Transactions Found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No activity records match your current filter settings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Amount (USDT)</th>
                    <th className="py-4 px-6">Network / TXID</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl">
                            {getTypeIcon(tx.type)}
                          </div>
                          <span className="font-bold text-slate-200">
                            {tx.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-black text-slate-100">
                        ${tx.expectedAmountUsdt.toLocaleString()} USDT
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-400 text-[11px]">
                        {tx.txHash ? (
                          <span title={tx.txHash}>
                            {tx.protocol ? `${tx.protocol}: ` : ''}
                            {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 6)}
                          </span>
                        ) : (
                          <span className="text-slate-600">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(tx.status)}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-400 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}