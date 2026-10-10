'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { automationEngine } from '../../lib/automation-engine';
import { Zap, Play } from 'lucide-react';

export const EnterpriseAutomationEngineCard: React.FC = () => {
  const { addIncident, addNotification, setSelectedIncident, addToast } = useAppStore();

  const [executing, setExecuting] = useState(false);
  const [lastExecution, setLastExecution] = useState<{
    id: string;
    department: string;
    officer: string;
    risk: number;
  } | null>(null);

  // 1-Tap Automated Intake Execution
  const handleRunAutomation = async () => {
    setExecuting(true);

    try {
      const result = await automationEngine.executeAutomatedIntake({
        title: 'Sub-surface Hydrodynamic Conduit Leak',
        category: 'water',
        description: 'Sensor SCADA-88 detected pressure drop from 4.2 bar to 1.8 bar.',
        locationName: 'Vijayawada Sector 4 Conduit Hub',
        latitude: 16.5062,
        longitude: 80.648,
        reporterName: 'Automated SCADA Telemetry',
        mediaFiles: ['Conduit_Sensor_Log.raw'],
      });

      addIncident(result.incident);
      addNotification(result.notification);
      setSelectedIncident(result.incident);

      setLastExecution({
        id: result.incident.id,
        department: result.recommendedDepartment,
        officer: result.recommendedOfficer,
        risk: result.calculatedRiskIndex,
      });

      addToast({
        title: 'Automation Steps Executed',
        message: `Case ${result.incident.id} created, priority assigned, risk calculated (${result.calculatedRiskIndex}%), department & officer recommended.`,
        type: 'success',
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-amber-500/30 shadow-2xl relative overflow-hidden text-slate-200 font-mono">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise Automation Engine</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  12 STEPS ACTIVE
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Automated case ID creation, priority assignment, risk scoring, officer matching &amp; local platform updates
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="text-[10px] py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            disabled={executing}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            onClick={handleRunAutomation}
          >
            {executing ? 'Executing Automation...' : 'Trigger Automated Intake'}
          </Button>
        </div>

        {/* ── 12 AUTOMATED PIPELINE STEPS GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 z-10 relative text-[9px]">
          {[
            { step: '1. Incident ID', desc: 'Auto-generated ID (e.g. EM-215)', icon: '🆔' },
            { step: '2. Priority Level', desc: 'P1 Critical vs P2 High', icon: '⚡' },
            { step: '3. Calculate Risk', desc: '0-100 Multi-Factor Model', icon: '📊' },
            { step: '4. AI Summary', desc: 'Computer Vision pre-scan', icon: '🧠' },
            { step: '5. Department', desc: 'Recommended agency', icon: '🏢' },
            { step: '6. Officer Match', desc: 'Tactical Squad assignment', icon: '👮' },
            { step: '7. Timeline Events', desc: 'Auto-logged lifecycle event', icon: '⏳' },
            { step: '8. Notifications', desc: 'Dispatched alert', icon: '🔔' },
            { step: '9. Analytics', desc: 'Auto-refreshed SLA metrics', icon: '📈' },
            { step: '10. Planetary Health', desc: 'Auto-updated score', icon: '🌍' },
            { step: '11. Digital Twin', desc: 'GIS pin committed to map', icon: '🛰️' },
            { step: '12. Workspaces', desc: 'Updated active workspace views', icon: '💻' },
          ].map((item, idx) => (
            <div key={idx} className="p-2 rounded-xl bg-[#050B14] border border-white/10 flex items-start gap-2">
              <span className="text-base shrink-0">{item.icon}</span>
              <div>
                <span className="font-bold text-slate-200 block text-[10px]">{item.step}</span>
                <span className="text-slate-400 block text-[8px] font-sans">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── LAST EXECUTION TELEMETRY RESULT ── */}
        {lastExecution && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 font-mono text-[10px] text-slate-200 z-10 relative flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <span className="text-amber-400 font-bold uppercase block text-[9px]">Last Automation Execution Result:</span>
              <span className="text-slate-100 font-bold">
                Case ID <strong className="text-cyan-400">{lastExecution.id}</strong> recorded.
              </span>
            </div>

            <div className="flex items-center gap-4 text-[9px]">
              <span>Risk: <strong className="text-rose-400">{lastExecution.risk}%</strong></span>
              <span>Officer: <strong className="text-emerald-400">{lastExecution.officer}</strong></span>
              <span>Dept: <strong className="text-indigo-400">{lastExecution.department}</strong></span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between z-10 relative">
        <span>Clean interface architecture with dynamic local state binding.</span>
        <span className="text-amber-400 font-bold">AUTOMATION ENGINE READY</span>
      </div>
    </Card>
  );
};
