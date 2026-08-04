'use client';

// ==========================================
// WITHDRAWAL REQUEST PAGE (/withdraw)
// ==========================================

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Wallet, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function WithdrawPage() {
  const [protocol, setProtocol] = useState<'TRC20' | 'ERC20' | 'BEP20'>('TRC20');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!destinationAddress || !amount) {
      setStatusMsg({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }

    setLoading(true);

    try {
      // Retrieve stored user ID or token
      const userId = localStorage.getItem('userId'); 

      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amountUsdt: parseFloat(amount),
          protocol,
          destinationAddress
        })
      });

      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        setAmount('');
        setDestinationAddress('');
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Withdrawal request failed.' });
      }
    } catch (err) {
      console.error('Submit error:', err);
      setStatusMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
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
            <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              WITHDRAW YIELD
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <ArrowUpRight className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100">Request USDT Payout</h1>
              <p className="text-xs text-slate-400 mt-0.5">Transfer your accrued ROI profits to an external wallet.</p>
            </div>
          </div>

          {statusMsg && (
            <div className={`p-4 rounded-xl flex items-start gap-3 border text-xs font-semibold ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Protocol Selector */}
            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Select Network Protocol
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['TRC20', 'ERC20', 'BEP20'] as const).map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setProtocol(net)}
                    className={`py-3 rounded-xl border font-black text-xs transition-all ${
                      protocol === net
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    USDT-{net}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Address */}
            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Destination Wallet Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Paste your USDT-${protocol} address...`}
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  required
                />
                <Wallet className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Withdrawal Amount (USDT)
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Security Notice */}
            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex items-start gap-3 text-[11px] text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                Ensure the destination address matches the selected <span className="text-slate-200 font-bold">{protocol}</span> network. Transmitting tokens across mismatched networks will result in permanent loss.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing Request...
                </>
              ) : (
                'Submit Withdrawal Request'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}