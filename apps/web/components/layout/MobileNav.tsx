'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { cn } from '../../lib/utils';

const MOBILE_NAV = [
  { id: 'home',      label: 'Mission',    icon: '🎯' },
  { id: 'incidents', label: 'Operations', icon: '⚡' },
  { id: 'map',       label: 'Intel',      icon: '🛰️' },
  { id: 'insights',  label: 'Analytics',  icon: '📊' },
  { id: 'ai',        label: 'Admin',      icon: '🛡️' },
];

export default function MobileNav() {
  const { activeTab, setActiveTab, setActiveDomainWorkspace, addRecentPage } = useAppStore();

  const handleNavigate = (id: string, label: string, emoji: string) => {
    setActiveDomainWorkspace(null);
    setActiveTab(id);
    addRecentPage(id, label, emoji);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-white/10 bg-[#070D18]/95 backdrop-blur-xl flex items-center justify-around px-2 safe-area-bottom">
      {MOBILE_NAV.map(item => {
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id, item.label, item.icon)}
            className={cn(
              'flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative',
              active ? 'text-cyan-400 font-bold' : 'text-slate-500'
            )}
          >
            {active && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-cyan-400"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="text-lg">{item.icon}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
