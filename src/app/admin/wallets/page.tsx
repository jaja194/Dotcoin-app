'use client';

// ==========================================
// ADMIN SYSTEM WALLET CONFIGURATOR
// ==========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, Save, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface WalletEntry {
  id?: string;
  purpose: 'BOT_ACCESS_FEE' | 'INVESTMENT_CAPITAL';
  protocol: 'TRC20' | 'ERC20' | 'BEP20';
  address: string;
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const protocols = ['TRC20', 'ERC20', 'BEP20'] as const;
  const purposes = [
    { key: 'BOT_ACCESS_FEE', label: 'Bot License Access Fee Wallets' },
    { key: 'INVESTMENT_CAPITAL', label: 'Investment Capital Wallets' },
  ] as const;

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wallets');
      const data = await res.json();
      if (data.success) {
        const walletMap: Record<string, string> = {};
        data.wallets.forEach((w: WalletEntry) => {
          walletMap[`${w.purpose}_${w.protocol}`] = w.address;
        });
        setWallets(walletMap);
      }
    } catch (err) {
      console.error('Failed to load wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (purpose: 'BOT_ACCESS_FEE' | 'INVESTMENT_CAPITAL', protocol: 'TRC20' | 'ERC20' | 'BEP20') => {
    const key = `${purpose}_${protocol}`;
    const address = wallets[key];

    if (!address) return;

    setSavingKey(key);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, protocol, address }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Updated ${protocol} wallet for ${purpose.replace('_', ' ')}`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Save Wallet Error:', err);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span className="text-base font-black tracking-wider text-amber-400">SYSTEM WALLET CONFIGURATOR</span>
            </div>
          </div>
          <button onClick={fetchWallets} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {purposes.map((p) => (
          <div key={p.key} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-sm font-extrabold uppercase text-slate-200 tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" /> {p.label}
            </h2>

            <div className="space-y-4">
              {protocols.map((net) => {
                const key = `${p.key}_${net}`;
                return (
                  <div key={net} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <span className="w-24 text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 py-2.5 px-3 rounded-xl text-center">
                      USDT-{net}
                    </span>
                    <input
                      type="text"
                      placeholder={`Enter USDT-${net} receiving address...`}
                      value={wallets[key] || ''}
                      onChange={(e) => setWallets({ ...wallets, [key]: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => handleSave(p.key, net)}
                      disabled={savingKey === key}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs hover:from-amber-400 hover:to-orange-400 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}