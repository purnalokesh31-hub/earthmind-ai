'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { NAV_ITEMS } from '../../lib/demo-data';
import { cn } from '../../lib/utils';
import { ChevronRight, Search, Bell, Menu, Settings, LogOut, ShieldCheck } from 'lucide-react';
import OperationsNotificationCenter from './OperationsNotificationCenter';

export default function TopNav() {
  const {
    activeTab, setActiveTab, currentUser, toggleSidebar,
    setCommandPaletteOpen, notifications, isAuthenticated, login, logout,
    activeDomainWorkspace, setActiveDomainWorkspace, incidents
  } = useAppStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const currentNav = NAV_ITEMS.find(n => n.id === activeTab) || NAV_ITEMS[0];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  const handleNavigate = (id: string) => {
    setActiveDomainWorkspace(null);
    setActiveTab(id);
  };

  return (
    <header className="shrink-0 border-b border-white/8 flex flex-col bg-[#141820] z-40">

      {/* Status Strip */}
      <div className="h-7 bg-[#0f1419] border-b border-white/5 px-4 flex items-center justify-between text-[10px] text-gray-500">
        <div className="flex items-center gap-3">
          <span className="text-gray-300 font-medium">{currentDate}</span>
          <span className="font-mono text-gray-400">{currentTime}</span>
        </div>
        <div className="hidden xl:flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', criticalCount > 0 ? 'bg-red-500' : 'bg-emerald-500')} />
            <span className={cn(criticalCount > 0 ? 'text-red-400' : 'text-gray-400')}>
              {criticalCount > 0 ? `${criticalCount} Critical` : 'All Clear'}
            </span>
          </span>
          <span className="text-gray-600">|</span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <ShieldCheck className="w-3 h-3" />
            Advisory Only
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">
            {currentUser?.department || 'Operations'}
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="h-12 px-4 flex items-center justify-between gap-3">

        {/* Left: Brand & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition"
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button onClick={() => handleNavigate('home')} className="flex items-center gap-2 group">
            <span className="text-lg">🌍</span>
            <div className="leading-none text-left hidden sm:block">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-100 group-hover:text-blue-400 transition-colors">
                EarthMind
              </div>
              <div className="text-[8px] text-gray-500 font-semibold uppercase tracking-widest">
                PIOS
              </div>
            </div>
          </button>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1 text-[11px] text-gray-400 border-l border-white/8 pl-3">
            <span className="text-gray-600">Operations</span>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <button
              onClick={() => handleNavigate(currentNav.id)}
              className="font-medium text-gray-200 hover:text-blue-400 transition-colors"
            >
              {currentNav.label}
            </button>
            {activeDomainWorkspace && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-600" />
                <span className="text-blue-400 font-medium capitalize">
                  {activeDomainWorkspace}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm mx-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/8 bg-[#1a1f2e] cursor-pointer text-sm transition-all hover:border-blue-500/30 w-full group"
            aria-label="Open search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors" />
            <span className="text-gray-500 group-hover:text-gray-400 transition-colors flex-1 text-left text-[12px] truncate">
              Search...
            </span>
            <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/8 bg-[#0f1419] text-gray-500 hidden sm:inline-block">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleNavigate('settings')}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition"
              title="Notifications"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 flex items-center justify-center text-[8px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <OperationsNotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative ml-1">
            {isAuthenticated && currentUser ? (
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg border border-white/8 hover:border-blue-500/20 transition bg-[#1a1f2e] group"
                aria-label="User menu"
              >
                <div className="h-6 w-6 rounded-full bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-[10px] font-bold text-blue-400">
                  {currentUser?.name?.[0] || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] font-medium text-gray-200 leading-none">{currentUser?.name || 'Operator'}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{currentUser?.role || 'Supervisor'}</div>
                </div>
              </button>
            ) : (
              <button onClick={() => setActiveTab('login')} className="btn-primary text-[10px] py-1 px-3 cursor-pointer">
                Sign In
              </button>
            )}

            <AnimatePresence>
              {profileOpen && currentUser && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/8 bg-[#1a1f2e] shadow-elevation-3 overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-white/5">
                    <p className="text-sm font-medium text-gray-200">{currentUser?.name}</p>
                    <p className="text-[11px] text-gray-500">{currentUser?.department}</p>
                  </div>
                  <div className="p-1">
                    <button onClick={() => { handleNavigate('settings'); setProfileOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5" />
                      Settings
                    </button>
                    <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition flex items-center gap-2">
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
