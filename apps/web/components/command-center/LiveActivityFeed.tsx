'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Operations Activity Feed
// Periodic Polling (5s) for Operational Events & Dispatch Logs
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RealTimeEventPayload } from '../../lib/server/events/realtime-event-bus.service';

export interface LiveActivityFeedProps {
  onSelectIncident?: (incidentId: string) => void;
  pollIntervalMs?: number;
}

export type FeedConnectionState = 'CONNECTED' | 'RECONNECTING' | 'OFFLINE';

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  onSelectIncident,
  pollIntervalMs = 5000,
}) => {
  const [events, setEvents] = useState<RealTimeEventPayload[]>([]);
  const [connectionState, setConnectionState] = useState<FeedConnectionState>('RECONNECTING');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeed = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch('/api/v1/command-center/stream', {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (!res.ok) {
          if (isMounted) {
            setConnectionState('RECONNECTING');
          }
          return;
        }

        const data = await res.json();
        if (isMounted) {
          if (Array.isArray(data.data)) {
            setEvents(data.data);
          }
          setConnectionState(data.connectionState || 'CONNECTED');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (isMounted) {
          setConnectionState('OFFLINE');
        }
      }
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [pollIntervalMs]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'INCIDENT_CREATED': return '🚨';
      case 'DISPATCH_ASSIGNED': return '🛰️';
      case 'DISPATCH_ACKNOWLEDGED': return '✅';
      case 'SLA_WARNING': return '⏳';
      case 'SLA_BREACH': return '⚠️';
      case 'DISPATCH_ESCALATED': return '⬆️';
      case 'INCIDENT_RESOLVED': return '🎉';
      default: return '📢';
    }
  };

  const getIndicatorStyles = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return {
          pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'RECONNECTING':
        return {
          pill: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'OFFLINE':
      default:
        return {
          pill: 'bg-red-500/10 text-red-400 border-red-500/30',
          dot: 'bg-red-400',
        };
    }
  };

  const styles = getIndicatorStyles();

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span>⚡ Live Activity Feed (5s Refresh)</span>
        </h2>

        {/* Connection Indicator */}
        <span
          className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono border rounded-full ${styles.pill}`}
          title={`Feed status: ${connectionState}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${styles.dot}`} />
          {connectionState}
        </span>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto my-2 pr-1 space-y-2 text-xs">
        {events.length === 0 && connectionState === 'CONNECTED' && (
          <div className="p-4 text-center text-slate-500 font-mono text-[11px]">
            No recent operational events recorded.
          </div>
        )}
        <AnimatePresence initial={false}>
          {events.map((evt) => (
            <motion.div
              key={evt.eventId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => onSelectIncident && onSelectIncident(evt.incidentId)}
              className="p-2.5 bg-[#050B14] border border-slate-800/80 hover:border-slate-700 rounded-lg cursor-pointer transition flex items-start gap-2.5"
            >
              <span className="text-base mt-0.5">{getEventIcon(evt.eventType)}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-cyan-400 text-[11px] truncate">
                    {evt.incidentCode}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-200 text-[11px] mt-0.5 font-medium">{evt.message}</p>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 font-mono">
                  <span>Actor: {evt.actor}</span>
                  <span className="text-slate-600">•</span>
                  <span className={evt.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}>{evt.severity}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

