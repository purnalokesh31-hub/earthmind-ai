'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { NAV_ITEMS } from '../../lib/demo-data';
import { Search, ArrowRight, CornerDownLeft, Sparkles, X } from 'lucide-react';
import type { Category } from '../../types';

export default function CommandPalette() {
  const {
    commandPaletteOpen, setCommandPaletteOpen,
    setActiveTab, setActiveDomainWorkspace,
    incidents, setSelectedIncident,
    addRecentPage, recentPages,
  } = useAppStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset query on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  // Global Ctrl + K / Cmd + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Commands & Navigation Options
  const navCommands = NAV_ITEMS.map((item) => ({
    id: `nav-${item.id}`,
    title: item.label,
    subtitle: `Navigate to ${item.label} (${item.id})`,
    category: 'Primary Navigation',
    icon: item.emoji,
    action: () => {
      setActiveDomainWorkspace(null);
      setActiveTab(item.id);
      addRecentPage(item.id, item.label, item.emoji);
      setCommandPaletteOpen(false);
    },
  }));

  // Domain Workspaces Commands
  const domainCommands = [
    { id: 'dom-water', title: 'Water Intelligence Command Center', category: 'Domain Workspace', icon: '💧', domain: 'water' },
    { id: 'dom-infra', title: 'Infrastructure Intelligence Command Center', category: 'Domain Workspace', icon: '🏗️', domain: 'infrastructure' },
    { id: 'dom-[#]', title: 'Energy Intelligence Command Center', category: 'Domain Workspace', icon: '⚡', domain: 'energy' },
    { id: 'dom-agri', title: 'Agriculture Intelligence Command Center', category: 'Domain Workspace', icon: '🌿', domain: 'agriculture' },
    { id: 'dom-disaster', title: 'Disaster Intelligence Command Center', category: 'Domain Workspace', icon: '🌊', domain: 'disaster' },
    { id: 'dom-urban', title: 'Urban Intelligence Command Center', category: 'Domain Workspace', icon: '🏢', domain: 'urban' },
    { id: 'dom-climate', title: 'Climate Intelligence Command Center', category: 'Domain Workspace', icon: '🌎', domain: 'climate' },
    { id: 'dom-wildlife', title: 'Wildlife Intelligence Command Center', category: 'Domain Workspace', icon: '🦜', domain: 'wildlife' },
    { id: 'dom-env', title: 'Environmental Intelligence Command Center', category: 'Domain Workspace', icon: '🌍', domain: 'environment' },
  ].map((d) => ({
    id: d.id,
    title: d.title,
    subtitle: `Launch specialized command center for ${d.domain}`,
    category: 'Domain Workspaces',
    icon: d.icon,
    action: () => {
      setActiveDomainWorkspace(d.domain as Category);
      setCommandPaletteOpen(false);
    },
  }));

  // Incident Case Commands
  const incidentCommands = incidents.map((inc) => ({
    id: `inc-${inc.id}`,
    title: `${inc.id}: ${inc.title}`,
    subtitle: `${inc.location?.name || 'Vijayawada'} · ${inc.severity.toUpperCase()} Priority`,
    category: 'Active Cases',
    icon: '🚨',
    action: () => {
      setSelectedIncident(inc);
      setActiveDomainWorkspace(inc.category);
      setCommandPaletteOpen(false);
    },
  }));

  const allItems = [...navCommands, ...domainCommands, ...incidentCommands];

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-[#050B14]/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-xl bg-[#0c1525] border border-[#1a2438] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col"
          >
            {/* Input Bar */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#070D18]">
              <Search className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search feature..."
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="text-slate-500 hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left ${
                        isSelected
                          ? 'bg-cyan-500/15 border border-cyan-500/40 text-slate-100'
                          : 'hover:bg-white/5 border border-transparent text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-100 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded border border-white/5 bg-[#050B14]">
                          {item.category}
                        </span>
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  No matching commands found for "{query}"
                </div>
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="p-3 border-t border-white/10 text-[9px] text-slate-500 font-mono flex justify-between bg-[#070D18]">
              <span className="flex items-center gap-1">
                <span className="text-slate-400">↑↓</span> Navigate
              </span>
              <span className="flex items-center gap-1">
                <span className="text-slate-400">↵</span> Select
              </span>
              <span className="flex items-center gap-1">
                <span className="text-slate-400">ESC</span> Close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
