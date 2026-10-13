'use client';

import React from 'react';
import { useAppStore } from '../../stores/app-store';
import { NAV_ITEMS } from '../../lib/demo-data';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab, setActiveTab, sidebarCollapsed, toggleSidebar,
    currentUser, setActiveDomainWorkspace, adminPanelAccessIds,
  } = useAppStore();

  const handleNavigate = (id: string) => {
    setActiveDomainWorkspace(null);
    setActiveTab(id);
  };

  // IDs of nav items restricted to users in the admin access list
  const ADMIN_ONLY_ITEMS = new Set(['admin']);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col shrink-0 border-r border-white/8 bg-[#141820] transition-all duration-200 z-30 relative select-none',
        sidebarCollapsed ? 'w-[56px]' : 'w-[200px]'
      )}
    >
      {/* Navigation */}
      <div className="flex-1 py-3 px-1.5 flex flex-col gap-0.5 overflow-y-auto">
        <div className={cn('px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500', sidebarCollapsed && 'text-center')}>
          {sidebarCollapsed ? '—' : 'Navigation'}
        </div>

        {NAV_ITEMS.map((item) => {
          // RBAC: hide admin-only items from unauthorized users
          if (ADMIN_ONLY_ITEMS.has(item.id) && !adminPanelAccessIds.includes(currentUser?.id ?? '')) {
            return null;
          }

          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 w-full text-left relative',
                active
                  ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border-l-2 border-transparent'
              )}
            >
              <span className="text-sm shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-white/8 flex items-center justify-between">
        {!sidebarCollapsed && currentUser && (
          <div className="flex items-center gap-2 px-1.5 min-w-0">
            <div className="h-6 w-6 rounded-full bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-[10px] font-bold text-blue-400 shrink-0">
              {currentUser?.name?.[0] || 'U'}
            </div>
            <span className="text-[11px] font-medium text-gray-400 truncate">{currentUser?.name || 'Operator'}</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition ml-auto"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
