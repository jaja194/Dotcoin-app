"use client";

import React, { useState, useEffect } from "react";

interface PendingTransaction {
  id: string;
  userId: string;
  type: "BOT_ACCESS_FEE" | "INVESTMENT_DEPOSIT";
  protocol: "TRC20" | "ERC20" | "BEP20";
  expectedAmountUsdt: number;
  txHash: string | null;
  status: string;
  createdAt: string;
  investmentPlanId?: string | null;
}

export default function AdminDepositsPage() {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [amountInputs, setAmountInputs] = useState<Record<string, number>>({});
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchPendingDeposits();
  }, []);

  const fetchPendingDeposits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/transactions?status=PENDING", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.transactions || []);
        // Pre-fill expected amounts
        const initialAmounts: Record<string, number> = {};
        (data.data.transactions || []).forEach((tx: PendingTransaction) => {
          initialAmounts[tx.id] = tx.expectedAmountUsdt;
        });
        setAmountInputs(initialAmounts);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to fetch deposits." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error fetching pending deposits." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (transactionId: string, status: "COMPLETED" | "REJECTED") => {
    setProcessingId(transactionId);
    setFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId,
          status,
          receivedAmountUsdt: amountInputs[transactionId],
          notes: notesInputs[transactionId] || "",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: "success",
          message: `Transaction ${status === "COMPLETED" ? "approved" : "rejected"} successfully!`,
        });
        // Remove verified transaction from pending view
        setTransactions((prev) => prev.filter((tx) => tx.id !== transactionId));
      } else {
        setFeedback({ type: "error", message: data.error || "Verification failed." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Server connection error." });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deposit Verification Dashboard</h1>
          <p className="text-sm text-gray-400">Review, confirm, or reject incoming USDT user deposits</p>
        </div>
        <button
          onClick={fetchPendingDeposits}
          className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition"
        >
          Refresh List
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-950/80 border border-green-700 text-green-300"
              : "bg-red-950/80 border border-red-700 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading pending deposits...</div>
      ) : transactions.length === 0 ? (
        <div className="py-12 text-center bg-gray-900/50 rounded-xl border border-gray-800 text-gray-400">
          No pending USDT deposits to verify right now.
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 grid grid-cols-1 lg:grid-cols-4 gap-4 items-center"
            >
              {/* Info Column */}
              <div className="space-y-1 lg:col-span-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/60 border border-blue-700 text-blue-300">
                    {tx.type}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{tx.protocol}</span>
                </div>
                <p className="text-xs text-gray-400">User ID: <span className="font-mono text-gray-300">{tx.userId.substring(0, 12)}...</span></p>
                <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>

              {/* TxHash Column */}
              <div className="space-y-1 lg:col-span-1">
                <p className="text-xs text-gray-400">Blockchain TxHash</p>
                <p className="text-xs font-mono bg-black/40 p-2 rounded border border-gray-800 text-amber-400 truncate">
                  {tx.txHash || "No TxHash provided"}
                </p>
              </div>

              {/* Amount & Input Column */}
              <div className="space-y-2 lg:col-span-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Expected: <strong className="text-white">${tx.expectedAmountUsdt} USDT</strong></span>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Received USDT Amount</label>
                  <input
                    type="number"
                    value={amountInputs[tx.id] || ""}
                    onChange={(e) =>
                      setAmountInputs({ ...amountInputs, [tx.id]: Number(e.target.value) })
                    }
                    className="w-full bg-black/60 border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Column */}
              <div className="flex flex-col space-y-2 lg:col-span-1">
                <button
                  disabled={processingId === tx.id}
                  onClick={() => handleVerify(tx.id, "COMPLETED")}
                  className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold text-xs rounded transition"
                >
                  {processingId === tx.id ? "Processing..." : "Approve & Activate"}
                </button>
                <button
                  disabled={processingId === tx.id}
                  onClick={() => handleVerify(tx.id, "REJECTED")}
                  className="w-full py-2 bg-red-900/60 hover:bg-red-800 border border-red-700 disabled:opacity-50 text-red-200 font-semibold text-xs rounded transition"
                >
                  Reject Deposit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}