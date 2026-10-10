'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Command Center Operational Error Boundary
// Provides Graceful Fallback & Degradation for System Failures
// ──────────────────────────────────────────────────────────────

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CommandCenterErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CommandCenterErrorBoundary] Operational UI error caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#0B1528] border border-red-500/30 rounded-xl p-6 shadow-2xl text-center space-y-3">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-base font-bold text-red-400">
            {this.props.fallbackTitle || 'Operational Telemetry Service Unavailable'}
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            The Command Center experienced a temporary telemetry connection error. Systems are degrading gracefully and will automatically attempt reconnection.
          </p>
          <div className="pt-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold rounded-lg border border-slate-700 transition"
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
