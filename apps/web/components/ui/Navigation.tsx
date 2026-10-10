'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 select-none flex items-center gap-1.5',
              variant === 'pills' && [
                'rounded-full border',
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-[#0A1220] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10',
              ],
              variant === 'underline' && [
                'border-b-2 rounded-none px-2 py-2',
                isActive
                  ? 'border-cyan-500 text-cyan-400 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-300',
              ]
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={cn('px-1.5 py-0.2 rounded-full text-[8px] font-mono', isActive ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/10 text-slate-400')}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId,
  className,
}) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className={cn('flex flex-col divide-y divide-white/5 rounded-xl border border-white/5 bg-[#0A1220]/80 overflow-hidden', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="flex flex-col">
            <button
              onClick={() => toggle(item.id)}
              className="flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                {item.icon && <span>{item.icon}</span>}
                <span>{item.title}</span>
              </div>
              <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform duration-200', isOpen && 'rotate-180 text-cyan-400')} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-[#050B14]/60 border-t border-white/5"
                >
                  <div className="p-4 text-xs text-slate-400">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
