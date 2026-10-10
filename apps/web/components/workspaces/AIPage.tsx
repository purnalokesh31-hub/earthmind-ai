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
  const { chatMessages, addChatMessage, setActiveTab } = useAppStore();
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (msg?: string) => {
    const userMsg = (msg || chatInput).trim();
    if (!userMsg) return;

    addChatMessage('user', userMsg);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      // Execute NL-to-SQL Copilot Agent for data queries
      if (userMsg.toLowerCase().includes('ward') || userMsg.toLowerCase().includes('which') || userMsg.toLowerCase().includes('sql') || userMsg.toLowerCase().includes('query') || userMsg.toLowerCase().includes('highest')) {
        const sqlResult = CopilotAgent.processNaturalLanguageQuery(userMsg);
        
        let response = `🤖 **Copilot Agent — NL-to-SQL Execution**\n\n${sqlResult.explanation}\n\n\`\`\`sql\n${sqlResult.sql}\n\`\`\`\n\n**Query Results (${sqlResult.data.length} records returned)**:\n`;
        sqlResult.data.forEach((row, i) => {
          const keys = Object.keys(row);
          response += `\n${i+1}. **${row[keys[0]]}**: ${row[keys[1]]} (${keys[2] ? row[keys[2]] : ''})`;
        });
        
        addChatMessage('ai', response);
      } else if (userMsg.toLowerCase().includes('report')) {
        addChatMessage('ai', '📋 **Daily Incident Summary Generated**\n\n• Total Active: 10 incidents\n• Critical: 2 (Pipeline Leak, Flood Risk)\n• Resolved Today: 7 cases\n• PHI Score: 92/100 (+2.1%)\n• Top Risk: Zone C flooding\n\nWould you like me to export this as PDF or navigate to the Reports module?');
      } else if (userMsg.toLowerCase().includes('water') || userMsg.toLowerCase().includes('leak')) {
        addChatMessage('ai', '💧 **Water Infrastructure Analysis**\n\nFound 3 water-related incidents:\n\n1. **EM-202** Pipeline Fracture — Sector 4 (Critical, In Progress)\n   • 95% AI confidence\n   • Est. loss: 2,400 L/hr\n   • Repair ETA: 4-6 hours\n\n2. **EM-210** Sewage Overflow — Canal Road (High, In Progress)\n\n3. Water pressure normal in remaining sectors.\n\nShall I show these on the map or generate a Water Quality Report?');
      } else if (userMsg.toLowerCase().includes('map')) {
        addChatMessage('ai', '🗺️ I\'ll highlight the relevant areas on the map for you. There are currently 6 active markers in the Ward 12 area including 2 critical infrastructure incidents.\n\nNavigating to Map view...');
        setTimeout(() => setActiveTab('map'), 1500);
      } else if (userMsg.toLowerCase().includes('predict') || userMsg.toLowerCase().includes('flood')) {
        addChatMessage('ai', '🌊 **72-Hour Flood Risk Prediction**\n\n• Zone C: **78% probability** of moderate flooding (current)\n• Zone B: 35% probability (watch)\n• Zone A: 12% probability (normal)\n\n**Factors**: Monsoon intensity, current water levels, drainage capacity.\n\n**Recommendation**: Maintain pumping stations at full capacity. Prepare evacuation route for Zone C-South (200+ households).');
      } else if (userMsg.toLowerCase().includes('dispatch') || userMsg.toLowerCase().includes('priority')) {
        addChatMessage('ai', '⚡ **Today\'s Dispatch Priorities**\n\n1. 🔴 **Immediate**: Pipeline repair — Sector 4 (crew already on-site)\n2. 🔴 **Urgent**: Bridge inspection — Prakasam Barrage (structural concern)\n3. 🟡 **High**: Pothole cluster — NH-9 (3 citizen reports)\n4. 🟡 **High**: Air quality check — Industrial Zone D\n5. 🟢 **Routine**: Canopy survey — Bandar Road\n\nShall I create work orders for these?');
      } else {
        addChatMessage('ai', `I analyzed your query against the current EarthMind data:\n\n• **PHI Score**: 92/100 (Healthy)\n• **Active Incidents**: 10 across 5 categories\n• **Highest Risk**: Zone C (flood) and Industrial Zone D (air quality)\n• **AI Confidence**: Average 90% across classifications\n\nI can provide deeper analysis on any specific area, generate reports, or navigate you to the relevant module. What would you like to focus on?`);
      }
    }, 1000);
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
