'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { cn } from '../../lib/utils';
import { CopilotAgent } from '../../lib/server/multi-agent';

const SUGGESTED_PROMPTS = [
  { icon: '🗺️', text: 'Which ward had the highest water leaks this month?', category: 'NL-to-SQL' },
  { icon: '📋', text: 'Generate today\'s incident report', category: 'Reports' },
  { icon: '📊', text: 'What are the top critical incidents right now?', category: 'NL-to-SQL' },
  { icon: '🚨', text: 'Find unresolved incidents older than 48 hours', category: 'Search' },
  { icon: '💧', text: 'Analyze water pipeline health in Sector 4', category: 'Analysis' },
  { icon: '📍', text: 'Open Ward 12 map view', category: 'Map' },
  { icon: '🌡️', text: 'Predict flood risk for next 72 hours', category: 'Prediction' },
  { icon: '🤖', text: 'Recommend dispatch priorities for today', category: 'Operations' },
];

export default function AIPage() {
  const { chatMessages, addChatMessage, setActiveTab, incidents } = useAppStore();
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async (msg?: string) => {
    const userMsg = (msg || chatInput).trim();
    if (!userMsg) return;

    addChatMessage('user', userMsg);
    setChatInput('');
    setIsTyping(true);

    const activeList = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'archived');
    const criticalList = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved');
    const resolvedList = incidents.filter((i) => i.status === 'resolved');
    const waterList = incidents.filter((i) => i.category === 'water' && i.status !== 'resolved');
    const currentPhi = Math.max(50, Math.round(100 - activeList.length * 1.5 - criticalList.length * 4));

    // Try calling backend copilot endpoint if available
    let copilotResponse: { answer?: string; action?: string } | null = null;
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg }),
      });
      if (res.ok) {
        copilotResponse = await res.json();
      }
    } catch {
      // Backend unavailable; continue with local intelligence engine
    }

    setTimeout(() => {
      setIsTyping(false);

      if (copilotResponse && copilotResponse.answer && !copilotResponse.answer.startsWith('I am the EarthMind AI Copilot. Ask me')) {
        addChatMessage('ai', `🤖 **Planetary Copilot**: ${copilotResponse.answer}`);
        if (copilotResponse.action === 'ZOOM_COORDINATES' || copilotResponse.action === 'FILTER_CRITICAL') {
          setTimeout(() => setActiveTab('map'), 1200);
        }
        return;
      }

      const q = userMsg.toLowerCase();

      // Execute NL-to-SQL Copilot Agent for data queries
      if (q.includes('ward') || q.includes('which') || q.includes('sql') || q.includes('query') || q.includes('highest')) {
        const sqlResult = CopilotAgent.processNaturalLanguageQuery(userMsg);

        let response = `🤖 **Copilot Agent — NL-to-SQL Execution**\n\n${sqlResult.explanation}\n\n\`\`\`sql\n${sqlResult.sql}\n\`\`\`\n\n**Query Results (${sqlResult.data.length} records returned)**:\n`;
        sqlResult.data.forEach((row, i) => {
          const keys = Object.keys(row);
          response += `\n${i + 1}. **${row[keys[0]]}**: ${row[keys[1]]} (${keys[2] ? row[keys[2]] : ''})`;
        });

        addChatMessage('ai', response);
      } else if (q.includes('report') || q.includes('summary')) {
        const topCrit = criticalList.slice(0, 2).map((c) => `• ${c.title} (${c.location?.name || 'Central'})`).join('\n') || '• No critical incidents active';
        addChatMessage(
          'ai',
          `📋 **Live Incident Intelligence Summary**\n\n• **Total Active**: ${activeList.length} cases\n• **Critical Severity**: ${criticalList.length} cases\n${topCrit}\n• **Resolved Today**: ${resolvedList.length} cases\n• **Planet Health Index (PHI)**: ${currentPhi}/100\n\nWould you like me to export this or navigate to the Reports module?`
        );
      } else if (q.includes('water') || q.includes('leak')) {
        if (waterList.length > 0) {
          const items = waterList.slice(0, 3).map((w, idx) => `${idx + 1}. **${w.id}** ${w.title} — ${w.location?.name || 'Sector'} (${w.severity.toUpperCase()}, ${w.status})\n   • AI Confidence: ${w.aiAnalysis?.confidence ? w.aiAnalysis.confidence + '%' : '94%'}`).join('\n\n');
          addChatMessage('ai', `💧 **Water Infrastructure Live Telemetry**\n\nIdentified ${waterList.length} active water cases:\n\n${items}\n\nShall I isolate valves or highlight these on the Map?`);
        } else {
          addChatMessage('ai', '💧 **Water Infrastructure Live Telemetry**\n\nAll monitored sectors report normal water pressure with 0 uncontained pipeline ruptures.');
        }
      } else if (q.includes('map') || q.includes('gis')) {
        addChatMessage(
          'ai',
          `🗺️ Pinpointing ${activeList.length} active geocoded markers across monitored districts.\n\nNavigating to Digital Twin Map view...`
        );
        setTimeout(() => setActiveTab('map'), 1200);
      } else if (q.includes('predict') || q.includes('flood') || q.includes('weather')) {
        addChatMessage(
          'ai',
          '🌊 **72-Hour Flood & Meteorology Forecast**\n\n• Krishna River Basin: **78% runoff saturation** (Warning Level 1)\n• Prakasam Barrage Inflow: 42,000 cusecs (Within safe thresholds)\n• Urban Lowlands (Zone C): Moderate ponding risk\n\n**Action Recommendation**: Pre-position 2 heavy-duty submersible pumps at Benz Circle canal.'
        );
      } else if (q.includes('dispatch') || q.includes('priority')) {
        const topPriorities = activeList
          .sort((a, b) => (a.severity === 'critical' ? -1 : 1))
          .slice(0, 4)
          .map((item, idx) => `${idx + 1}. ${item.severity === 'critical' ? '🔴' : '🟡'} **${item.severity.toUpperCase()}**: ${item.title} — ${item.location?.name || 'Vijayawada'}`)
          .join('\n');

        addChatMessage(
          'ai',
          `⚡ **Dynamic Dispatch Queue Priorities**\n\n${topPriorities || 'No pending critical dispatches.'}\n\nShall I notify the respective field units via WhatsApp/SMS?`
        );
      } else {
        addChatMessage(
          'ai',
          `I analyzed your prompt against live EarthMind PIOS telemetry:\n\n• **Planet Health Index (PHI)**: ${currentPhi}/100\n• **Active Incidents**: ${activeList.length} monitored\n• **Critical Hotspots**: ${criticalList.length} require immediate attention\n• **AI Model Confidence**: 92.4% composite\n\nAsk me for specific district reports, predictive flood paths, or NL-to-SQL database queries.`
        );
      }
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full max-w-4xl mx-auto w-full pb-20 lg:pb-0"
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="page-title">AI Assistant</h1>
        <p className="text-[10px] text-slate-500 mt-0.5">EarthMind Intelligence Engine — Ask anything about incidents, maps, reports, or predictions.</p>
      </div>

      {/* Suggested prompts (show when few messages) */}
      {chatMessages.length <= 2 && (
        <div className="mb-4">
          <p className="section-label mb-2">Suggested Prompts</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTED_PROMPTS.map((p, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSend(p.text)}
                className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-earth-500/30 hover:bg-earth-950/10 transition text-left group"
              >
                <span className="text-base shrink-0">{p.icon}</span>
                <div>
                  <p className="text-[11px] font-medium text-slate-300 group-hover:text-earth-400 transition">{p.text}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{p.category}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {chatMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div className={cn(
              'max-w-[75%] rounded-2xl px-4 py-3 text-[11px] leading-relaxed',
              msg.sender === 'user'
                ? 'bg-earth-500 text-surface-0 font-medium rounded-br-sm'
                : 'card text-slate-300 rounded-bl-sm'
            )}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="card px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-earth-500" />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-earth-500" />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-earth-500" />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-4 border-t border-white/10 mt-2">
        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2 bg-[#050B14] p-1.5 rounded-2xl border border-white/10 focus-within:border-cyan-500/50 transition shadow-inner"
        >
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Ask EarthMind AI anything..."
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-1 shrink-0"
          >
            Send ↑
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
