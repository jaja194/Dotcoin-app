"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  email: string;
  name?: string;
  walletBalance: number;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/user/dashboard", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // If unauthorized or token missing, send back to login
          router.push("/login");
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center text-white">Loading your dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome back, {user?.name || user?.email || "User"}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-sm">Account Balance</p>
          <p className="text-3xl font-extrabold text-green-400 mt-2">
            ${user?.walletBalance ?? "0.00"}
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-sm">Account Role</p>
          <p className="text-xl font-bold text-blue-400 mt-2 uppercase">
            {user?.role}
          </p>
        </div>
      </div>
    </div>
  );
}