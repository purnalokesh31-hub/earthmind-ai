// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Not Found Page (404 Fallback)
// ──────────────────────────────────────────────────────────────

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050B14] p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md text-center bg-[#0B1528] border border-cyan-500/20 rounded-xl p-8 shadow-2xl backdrop-blur-md">
        <h1 className="text-6xl font-bold tracking-tight text-cyan-400 font-mono">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-slate-200">Page Not Found</h2>
        <p className="mt-2 text-sm text-slate-400">
          The requested operational resource or Command Center route could not be found.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
          >
            Return to Command Center
          </Link>
        </div>
      </div>
    </div>
  );
}
