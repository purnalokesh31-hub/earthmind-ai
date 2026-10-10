'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { AI_RECOMMENDATIONS, DEMO_NOTIFICATIONS } from '../../lib/demo-data';
import { cn, severityBadgeClass, statusLabel, formatTime, categoryLabel } from '../../lib/utils';
import { OperationalAIAnalyst } from '../ui/OperationalAIAnalyst';
import { Bot, FileText, Activity, X, Send } from 'lucide-react';

export default function ContextPanel() {
  const {
    contextPanelOpen, contextPanelTab, setContextPanelTab,
    selectedIncident, chatMessages, addChatMessage,
    setActiveTab, setContextPanelOpen, updateIncident,
  } = useAppStore();

  const [chatInput, setChatInput] = useState('');

  if (!contextPanelOpen) return null;

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    addChatMessage('user', chatInput);
    const userMsg = chatInput;
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      if (userMsg.toLowerCase().includes('report')) {
        addChatMessage('ai', "I can generate a report for you. Based on today's telemetry: 10 active cases, 7 resolved, 2 critical. Would you like me to create a Daily Incident Summary or an Executive Briefing?");
      } else if (userMsg.toLowerCase().includes('map') || userMsg.toLowerCase().includes('water')) {
        addChatMessage('ai', 'I found 3 water-related incidents currently active. The most critical is EM-202 (Pipeline Leak in Sector 4) with 95% AI confidence. Shall I show these on the live map?');
      } else if (userMsg.toLowerCase().includes('critical') || userMsg.toLowerCase().includes('priority')) {
        addChatMessage('ai', 'Current critical incidents: 1) Pipeline Fracture — Sector 4, 2) Flash Flood Risk — Zone C, 3) Bridge Crack — Prakasam Barrage. I recommend prioritizing the bridge assessment.');
      } else {
        addChatMessage('ai', `Analysis complete. PHI Index is 92/100, with 10 active incidents across 5 categories. I can provide detailed breakdown for any specific sector or domain.`);
      }
    }, 800);
  };

  const quickPrompts = [
    'Show all critical water leaks',
    "Generate today's incident report",
    'Highlight unresolved cases on map',
    'Recommend dispatch priorities',
  ];

  const tabBtn = (id: 'ai' | 'case' | 'activity', label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setContextPanelTab(id)}
      className={cn(
        'text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5',
        contextPanelTab === id
          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Desktop / Laptop Right Side Panel */}
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 320, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col shrink-0 border-l border-white/10 bg-[#070D18]/95 overflow-hidden z-30"
      >
        {/* Panel Header */}
        <div className="shrink-0 h-14 flex items-center justify-between px-3 border-b border-white/10 bg-[#050B14]">
          <div className="flex items-center gap-1">
            {tabBtn('ai', 'AI', <Bot className="w-3.5 h-3.5" />)}
            {tabBtn('case', 'Case', <FileText className="w-3.5 h-3.5" />)}
            {tabBtn('activity', 'Feed', <Activity className="w-3.5 h-3.5" />)}
          </div>
          <button
            onClick={() => setContextPanelOpen(false)}
            className="text-xs text-slate-400 hover:text-slate-100 transition p-1 rounded hover:bg-white/5"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto flex flex-col">

          {/* ── AI Operational Analyst Tab ── */}
          {contextPanelTab === 'ai' && (
            <div className="p-3 overflow-y-auto">
              <OperationalAIAnalyst />
            </div>
          )}

          {/* ── Case Telemetry Tab ── */}
          {contextPanelTab === 'case' && (
            <div className="p-4 flex flex-col gap-4">
              {selectedIncident ? (
                <>
                  <div>
                    <span className={cn('text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border', severityBadgeClass(selectedIncident.severity))}>
                      {selectedIncident.severity} priority
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-2 leading-snug">{selectedIncident.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">{selectedIncident.id} • {categoryLabel(selectedIncident.category)}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0A1220] border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">Location:</span>
                      <span className="font-medium text-slate-200">{selectedIncident.location?.name || 'Vijayawada'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">Status:</span>
                      <span className="font-bold text-cyan-400">{statusLabel(selectedIncident.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">Reported:</span>
                      <span className="text-slate-300">{formatTime(selectedIncident.reportedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">Officer:</span>
                      <span className="text-slate-300">{selectedIncident.reportedBy}</span>
                    </div>
                  </div>

                  {selectedIncident.aiAnalysis && (
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-400">🤖 AI Analysis</span>
                        <span className="text-[10px] font-mono text-cyan-500">{selectedIncident.aiAnalysis.confidence}% match</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{selectedIncident.aiAnalysis.summary}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Update Status</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['ai_processing', 'assigned', 'investigating', 'resolved'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateIncident(selectedIncident.id, { status: st })}
                          className={cn(
                            'text-[10px] font-bold uppercase py-1.5 px-2 rounded-lg border text-center transition',
                            selectedIncident.status === st
                              ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400'
                              : 'border-white/5 bg-[#0A1220] text-slate-400 hover:text-slate-200'
                          )}
                        >
                          {statusLabel(st)}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                  📋 Click any incident to view telemetry & AI analysis details.
                </div>
              )}
            </div>
          )}

          {/* ── Activity Feed Tab ── */}
          {contextPanelTab === 'activity' && (
            <div className="p-4 flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Notifications</p>
              <div className="flex flex-col gap-2">
                {DEMO_NOTIFICATIONS.map((n: any) => (
                  <div key={n.id} className="p-3 rounded-xl bg-[#0A1220] border border-white/5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{n.title}</span>
                      <span className="text-[9px] font-mono text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.aside>

      {/* Mobile / Tablet Collapsible Bottom Sheet Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="lg:hidden fixed inset-x-0 bottom-16 sm:bottom-0 max-h-[75vh] z-50 rounded-t-3xl border-t border-cyan-500/40 bg-[#0c1525]/95 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="shrink-0 h-12 flex items-center justify-between px-4 border-b border-white/10 bg-[#070D18]">
          <div className="w-12 h-1 rounded-full bg-slate-600 mx-auto absolute top-2 left-1/2 -translate-x-1/2" />
          <div className="flex items-center gap-1.5 mt-2">
            {tabBtn('ai', 'AI', <Bot className="w-3 h-3" />)}
            {tabBtn('case', 'Case', <FileText className="w-3 h-3" />)}
            {tabBtn('activity', 'Feed', <Activity className="w-3 h-3" />)}
          </div>
          <button
            onClick={() => setContextPanelOpen(false)}
            className="text-xs text-slate-400 hover:text-slate-100 transition p-1 font-bold mt-2"
          >
            ✕ Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {contextPanelTab === 'ai' && (
            <div className="flex flex-col gap-3">
              <div className="flex-1 min-h-[180px] p-2 flex flex-col gap-2">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-2.5 rounded-xl text-xs max-w-[90%]',
                      msg.sender === 'user' ? 'ml-auto bg-cyan-600 text-white' : 'mr-auto bg-slate-800/80 text-slate-200 border border-white/10'
                    )}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask AI..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-white/10 bg-[#050B14] text-slate-100"
                />
                <button onClick={handleSendChat} className="btn-primary text-xs px-3 py-2">
                  Send
                </button>
              </div>
            </div>
          )}

          {contextPanelTab === 'case' && selectedIncident && (
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-100 text-sm">{selectedIncident.title}</h3>
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
                AI Summary: {selectedIncident.aiAnalysis?.summary || (selectedIncident as any).ai_summary || 'N/A'}
              </div>
            </div>
          )}

          {contextPanelTab === 'activity' && (
            <div className="space-y-2 text-xs">
              {DEMO_NOTIFICATIONS.map((n: any) => (
                <div key={n.id} className="p-2 rounded bg-slate-900 border border-white/10">
                  <div className="font-bold">{n.title}</div>
                  <div className="text-slate-400">{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
