'use client';

// ==========================================
// ADMIN CONTROL DASHBOARD (/admin/dashboard)
// ==========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ArrowLeft,
  DollarSign,
  Users,
  AlertCircle
} from 'lucide-react';

interface AdminTransaction {
  id: string;
  type: string;
  protocol: string;
  expectedAmountUsdt: number;
  txHash: string | null;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  user: {
    email: string;
    name: string | null;
  };
}

export default function AdminDashboardPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [stats, setStats] = useState({ totalTransactions: 0, pendingCount: 0, completedCount: 0, totalVolumeUsdt: 0 });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transactions');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (transactionId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(transactionId);
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to update transaction');
      }
    } catch (err) {
      console.error('Admin Action Error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span className="text-base font-black tracking-wider text-amber-400">
                ADMIN CONTROL CENTER
              </span>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Pending Approvals</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400 mt-2">{stats.pendingCount}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Approved Transactions</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-2">{stats.completedCount}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Volume (USDT)</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2">
              ${stats.totalVolumeUsdt.toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Transactions</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2">{stats.totalTransactions}</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-100">Deposit & License Overrides</h2>
            <span className="text-xs text-slate-400">Manual TXID Verification</span>
          </div>

          {loading ? (
            <div className="text-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Loading user ledgers...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">No transactions recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">User Email</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">TX Hash</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-200">{tx.user.email}</td>
                      <td className="py-4 px-6 font-bold text-slate-300">{tx.type}</td>
                      <td className="py-4 px-6 font-black text-emerald-400">${tx.expectedAmountUsdt} USDT</td>
                      <td className="py-4 px-6 font-mono text-slate-400 text-[11px]">
                        {tx.txHash ? tx.txHash.substring(0, 12) + '...' : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tx.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.status === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {tx.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(tx.id, 'APPROVE')}
                              disabled={processingId === tx.id}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-extrabold text-[11px] transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(tx.id, 'REJECT')}
                              disabled={processingId === tx.id}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-extrabold text-[11px] transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-medium text-[11px]">Processed</span>
                        )}
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