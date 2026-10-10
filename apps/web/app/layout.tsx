// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Root Layout
// ──────────────────────────────────────────────────────────────

import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'EarthMind PIOS — Planetary Intelligence Operating System',
  description: 'AI-powered environmental intelligence platform for incident detection, monitoring, analysis, and response through geospatial intelligence and collaborative decision support.',
  keywords: ['EarthMind', 'PIOS', 'environmental intelligence', 'incident management', 'AI', 'geospatial'],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full antialiased bg-[#050B14] text-slate-100">
        {children}
      </body>
    </html>
  );
}
