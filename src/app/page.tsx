import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-amber-500 mb-4">
        Dotcoin App
      </h1>
      <p className="max-w-xl text-lg text-slate-300 mb-8">
        Automated crypto bot trading, institutional packages, and real-time yield analytics.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition"
        >
          Sign In
        </Link>

        <Link
          href="/marketplace"
          className="px-6 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-semibold hover:bg-slate-700 transition"
        >
          Explore Marketplace
        </Link>
      </div>
    </main>
  );
}