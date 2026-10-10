'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Live SLA Countdown & Priority Monitor
// Real-time SLA compliance tracking for P1-P4 active dispatches
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CommandCenterIncidentItemDto } from '../../lib/server/dto/command-center.dto';

interface SlaCountdownMonitorProps {
  incidents: CommandCenterIncidentItemDto[];
  onSelectIncident?: (id: string) => void;
}

export const SlaCountdownMonitor: React.FC<SlaCountdownMonitorProps> = ({ incidents, onSelectIncident }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRemainingText = (deadlineStr: string | null) => {
    if (!deadlineStr) return 'N/A';
    const diffMs = new Date(deadlineStr).getTime() - now;
    if (diffMs <= 0) return 'BREACHED ⚠️';
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span>⏳ Live SLA Compliance Countdown</span>
        </h2>
        <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
          TICK: 1s
        </span>
      </div>

      <div className="flex-1 overflow-y-auto my-2 pr-1 space-y-2.5">
        {incidents.slice(0, 4).map((inc) => {
          const ackRemaining = getRemainingText(inc.acknowledgementDeadline);
          const respRemaining = getRemainingText(inc.responseDeadline);

          const isBreached = ackRemaining.includes('BREACHED') || respRemaining.includes('BREACHED');
          const isWarning = !isBreached && inc.slaStatus === 'WARNING';

          const cardBg = isBreached
            ? 'bg-red-950/20 border-red-500/30'
            : isWarning
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-[#050B14] border-slate-800/80';

          return (
            <motion.div
              key={inc.id}
              onClick={() => onSelectIncident && onSelectIncident(inc.id)}
              className={`p-3 border rounded-lg cursor-pointer transition ${cardBg}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400">{inc.incidentCode}</span>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                  inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {inc.severity}
                </span>
              </div>

              <div className="text-xs font-medium text-slate-200 mt-1 truncate">{inc.title}</div>

              <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-500 block">Ack SLA</span>
                  <span className={ackRemaining.includes('BREACHED') ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {ackRemaining}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Response SLA</span>
                  <span className={respRemaining.includes('BREACHED') ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {respRemaining}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
