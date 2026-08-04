'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Lock
} from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'BOT_ACCESS_FEE' | 'INVESTMENT_DEPOSIT';
  initialAmount?: number;
  botTier?: 'PRO' | 'ENTERPRISE';
  onSuccess?: () => void;
}

interface WalletAddress {
  protocol: 'TRC20' | 'ERC20' | 'BEP20';
  address: string;
}

export default function DepositModal({
  isOpen,
  onClose,
  type,
  initialAmount = 100,
  botTier,
  onSuccess
}: DepositModalProps) {
  const [protocol, setProtocol] = useState<'TRC20' | 'ERC20' | 'BEP20'>('TRC20');
  const [amount, setAmount] = useState<number>(initialAmount);
  const [txHash, setTxHash] = useState('');
  const [wallets, setWallets] = useState<Record<string, string>>({});
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchWallets();
      setAmount(initialAmount);
      setTxHash('');
      setStatusMessage(null);
    }
  }, [isOpen, initialAmount]);

  const fetchWallets = async () => {
    setLoadingWallets(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const walletMap: Record<string, string> = {};
        data.data.forEach((w: WalletAddress) => {
          walletMap[w.protocol] = w.address;
        });
        setWallets(walletMap);
      }
    } catch (err) {
      console.error('Failed to fetch system wallets:', err);
    } finally {
      setLoadingWallets(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Transaction Hash (TXID).' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          protocol,
          expectedAmountUsdt: amount,
          txHash: txHash.trim(),
          botTier: botTier || null
        })
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Deposit submitted! Pending admin verification.'
        });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to record deposit submission.'
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error submitting transaction.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentAddress = wallets[protocol] || 'Loading receiving address...';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            {type === 'BOT_ACCESS_FEE' ? 'Bot Activation Fee' : 'Capital Lockup Deposit'}
          </span>
          <h2 className="text-xl font-black text-slate-100 mt-1">
            {type === 'BOT_ACCESS_FEE' ? `Activate ${botTier || 'PRO'} Trading License` : 'Fund Investment Portfolio'}
          </h2>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
              : 'bg-red-950/80 border border-red-700 text-red-300'
          }`}>
            {statusMessage.type === 'success' ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Protocol Network Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Select USDT Payment Network
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['TRC20', 'BEP20', 'ERC20'] as const).map((net) => (
              <button
                key={net}
                type="button"
                onClick={() => setProtocol(net)}
                className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                  protocol === net 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                USDT-{net}
              </button>
            ))}
          </div>
        </div>

        {/* Amount & Receiving Wallet Box */}
        <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Required Payment Amount:</span>
            <span className="text-sm font-black text-cyan-400">${amount} USDT</span>
          </div>
          
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400 block">
              Send exact amount to this {protocol} Address:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={loadingWallets ? 'Fetching address...' : currentAddress}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                disabled={loadingWallets || !wallets[protocol]}
                onClick={() => handleCopy(currentAddress)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 p-2 rounded-lg transition-colors flex-shrink-0"
                title="Copy Address"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Form Submission */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              2. Enter Blockchain Transaction Hash (TXID)
            </label>
            <input
              type="text"
              required
              placeholder="Paste 0x... or Tron transaction ID here"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Admin will verify payment on-chain before activating features.</span>
          </div>

          <button
            type="submit"
            disabled={submitting || loadingWallets}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Submitting Verification...' : 'Submit Deposit Verification'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}