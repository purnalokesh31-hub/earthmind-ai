'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Entry Point
// ──────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import EarthMindApp from './EarthMindApp';
import LoginView from '../components/auth/LoginView';
import { useAppStore } from '../stores/app-store';

export default function Page() {
  const { isAuthenticated } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-[#050B14]" />;
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <EarthMindApp />;
}
