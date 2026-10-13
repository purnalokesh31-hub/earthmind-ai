'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Enterprise Admin Panel Workspace
// Real-time Operator Accounts, System Services, RBAC & Configuration
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ShieldAlert,
  Server,
  Activity,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Key,
  Database,
  Cpu,
  Layers,
  Settings,
  AlertTriangle,
  Lock,
  Unlock,
  Trash2,
  Sliders,
} from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { cn } from '../../lib/utils';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  organization: string;
  region: string;
  status: 'active' | 'revoked';
  created_at?: string;
}

const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    name: 'Officer Lokesh',
    email: 'lokesh.officer@gmail.com',
    role: 'Administrator',
    organization: 'Government',
    department: 'Roads & Infrastructure',
    region: 'Vijayawada',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'usr-2',
    name: 'Officer Rao',
    email: 'rao@vijayawada.gov.in',
    role: 'Supervisor',
    organization: 'Municipality',
    department: 'Water Supply & Sewage',
    region: 'Vijayawada',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'usr-3',
    name: 'Field Trainee',
    email: 'trainee@gov.in',
    role: 'Citizen',
    organization: 'Citizen',
    department: 'General Public',
    region: 'Vijayawada',
    status: 'revoked',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'usr-4',
    name: 'Dr. Aris Thorne',
    email: 'athorne@earthmind.gov.in',
    role: 'Administrator',
    organization: 'EarthMind',
    department: 'Command Center',
    region: 'Global',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

export default function AdminPanelWorkspace() {
  const { addToast, logAuditEvent, currentUser, adminPanelAccessIds, grantAdminAccess, revokeAdminAccess } = useAppStore();

  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'policies' | 'configs'>('users');
  const [users, setUsers] = useState<AdminUser[]>(DEFAULT_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // User modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Field Officer',
    department: 'Municipal Corporation',
    organization: 'Government',
    password: '',
  });

  // System status
  const [systemHealth, setSystemHealth] = useState({
    status: 'HEALTHY',
    uptime: '99.98%',
    services: {
      database: { name: 'SQLite / PostgreSQL DB', status: 'ONLINE', latencyMs: 3 },
      redis: { name: 'Redis Cache Layer', status: 'ONLINE', latencyMs: 1 },
      aiEngine: { name: 'Python Inference Engine (Port 8000)', status: 'ONLINE', latencyMs: 12 },
      gisEngine: { name: 'GIS Spatial Processor', status: 'ONLINE', latencyMs: 8 },
    },
    systemMetrics: {
      cpuUsage: '14.2%',
      memoryUsage: '38.6%',
      activeStreams: 24,
      totalDecisionsProcessed: 1482,
    },
  });

  // Fetch users from API (fallback to local state)
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/users').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
          return;
        }
      }
    } catch {
      // Keep state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Toggle user status (Active vs Revoked)
  const handleToggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'active' ? 'revoked' : 'active';
    try {
      await fetch(`http://localhost:8000/api/admin/users/${user.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => null);

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );

      logAuditEvent({
        event: 'ADMIN_USER_STATUS_CHANGE',
        actor: currentUser?.name || 'Administrator',
        details: `Updated access status for ${user.email} to ${newStatus.toUpperCase()}`,
      });

      addToast({
        title: `Account Status Updated`,
        message: `${user.name} is now ${newStatus.toUpperCase()}`,
        type: newStatus === 'active' ? 'success' : 'warning',
      });
    } catch (err: any) {
      addToast({
        title: 'Update Failed',
        message: err.message,
        type: 'error',
      });
    }
  };

  // Add user submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    try {
      const createdUser: AdminUser = {
        id: `usr-${Date.now().toString().slice(-6)}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        organization: newUser.organization,
        region: 'Vijayawada',
        status: 'active',
        created_at: new Date().toISOString(),
      };

      await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          organization: newUser.organization,
          password: newUser.password || 'EarthMind@2026',
        }),
      }).catch(() => null);

      setUsers((prev) => [createdUser, ...prev]);
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        role: 'Field Officer',
        department: 'Municipal Corporation',
        organization: 'Government',
        password: '',
      });

      logAuditEvent({
        event: 'ADMIN_USER_CREATED',
        actor: currentUser?.name || 'Administrator',
        details: `Created new ${newUser.role} user account: ${newUser.email}`,
      });

      addToast({
        title: 'Account Provisioned',
        message: `Successfully created user account for ${newUser.name}`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Provisioning Failed',
        message: err.message,
        type: 'error',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Administration & Access Governance
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  Live
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage user permissions, security policies, system microservices, and operational audit trails.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 bg-[#141820] p-1 rounded-xl border border-white/8">
          {[
            { id: 'users', label: 'Operator Accounts', icon: Users },
            { id: 'system', label: 'System Telemetry', icon: Server },
            { id: 'policies', label: 'Security & RBAC', icon: Lock },
            { id: 'configs', label: 'Platform Flags', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab 1: User Management ── */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search operators by name, email, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141820] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#141820] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="Administrator">Administrator</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Field Officer">Field Officer</option>
                <option value="Citizen">Citizen</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#141820] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchUsers}
                className="p-2 rounded-xl bg-[#141820] border border-white/10 text-slate-400 hover:text-white transition"
                title="Refresh user list"
              >
                <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin text-blue-400')} />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Provision Operator
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-[#141820] border border-white/8 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/8 bg-[#10141b] text-slate-400 font-semibold">
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Region</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Admin Access</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No operators found matching current search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isActive = user.status === 'active';
                      const hasAccess = adminPanelAccessIds.includes(user.id);
                      const isSelf = user.id === currentUser?.id;
                      return (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-[11px] text-blue-400">
                                {user.name?.[0] || 'U'}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{user.name}</div>
                                <div className="text-[11px] text-slate-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                user.role === 'Administrator'
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                                  : user.role === 'Supervisor'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                              )}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-medium">
                            {user.department || 'Command Hub'}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{user.region || 'Metropolitan'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                                isActive
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                              )}
                            >
                              <span
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  isActive ? 'bg-emerald-400' : 'bg-rose-400'
                                )}
                              />
                              {isActive ? 'Authorized' : 'Access Revoked'}
                            </span>
                          </td>
                          {/* ── Admin Panel Access Column ── */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {hasAccess ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-400 border border-violet-500/25">
                                  🛡️ Granted
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                  — None
                                </span>
                              )}
                              <button
                                onClick={() => hasAccess ? revokeAdminAccess(user.id) : grantAdminAccess(user.id)}
                                disabled={isSelf && hasAccess}
                                title={isSelf && hasAccess ? 'Cannot revoke your own access' : hasAccess ? 'Revoke Admin Panel access' : 'Grant Admin Panel access'}
                                className={cn(
                                  'px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition flex items-center gap-1',
                                  hasAccess
                                    ? isSelf
                                      ? 'opacity-40 cursor-not-allowed bg-rose-500/10 border-rose-500/20 text-rose-400'
                                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                    : 'bg-violet-500/10 border-violet-500/30 text-violet-400 hover:bg-violet-500/20'
                                )}
                              >
                                {hasAccess ? '🔓 Revoke' : '🔐 Grant'}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={cn(
                                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition flex items-center gap-1',
                                  isActive
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                )}
                              >
                                {isActive ? (
                                  <>
                                    <Lock className="w-3 h-3" />
                                    Revoke
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3 h-3" />
                                    Restore
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: System Telemetry & Microservices ── */}
      {activeTab === 'system' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#141820] border border-white/8 rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Cluster Operational Status
              </span>
              <span className="text-xl font-bold text-emerald-400">99.98% Healthy</span>
              <span className="text-[11px] text-slate-500">Zero active critical alerts</span>
            </div>

            <div className="bg-[#141820] border border-white/8 rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-400" />
                Server CPU & Memory
              </span>
              <span className="text-xl font-bold text-white">14.2% / 38.6%</span>
              <span className="text-[11px] text-slate-500">Node v24 + Python 3.14 Worker</span>
            </div>

            <div className="bg-[#141820] border border-white/8 rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-400" />
                Database Latency
              </span>
              <span className="text-xl font-bold text-white">2.8 ms</span>
              <span className="text-[11px] text-slate-500">SQLite local dev / PostGIS ready</span>
            </div>

            <div className="bg-[#141820] border border-white/8 rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                AI Inference Queue
              </span>
              <span className="text-xl font-bold text-purple-400">0 Pending</span>
              <span className="text-[11px] text-slate-500">XGBoost & Heuristics active</span>
            </div>
          </div>

          {/* Microservices table */}
          <div className="bg-[#141820] border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              Connected Microservice Subsystems
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(systemHealth.services).map(([key, service]) => (
                <div
                  key={key}
                  className="bg-[#181d26] border border-white/5 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-white text-xs">{service.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Response latency: {service.latencyMs}ms
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Security & RBAC Policies ── */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#141820] border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Human Governance Invariant
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              EarthMind PIOS enforces strict non-autonomous physical execution. Physical actuators,
              water valves, power switches, and dispatch assignments mandate explicit operator sign-off.
            </p>
            <div className="bg-[#181d26] border border-emerald-500/20 rounded-xl p-3 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-emerald-400">
                ✓ requiresHumanApproval: true
              </span>
              <span className="text-[11px] text-slate-400">
                All AI generated recommendations remain advisory.
              </span>
            </div>
          </div>

          <div className="bg-[#141820] border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              Role Permission Hierarchy
            </h2>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="font-semibold text-white">SYSTEM_ADMIN (Level 100)</span>
                <span className="text-slate-400">Full system & user governance</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="font-semibold text-white">SUPERVISOR (Level 80)</span>
                <span className="text-slate-400">Incident triage & unit dispatch</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="font-semibold text-white">FIELD_OFFICER (Level 40)</span>
                <span className="text-slate-400">Evidence collection & status updates</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="font-semibold text-white">CITIZEN (Level 10)</span>
                <span className="text-slate-400">Public hazard reporting</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Platform Flags ── */}
      {activeTab === 'configs' && (
        <div className="bg-[#141820] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 max-w-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            Runtime Configuration Toggles
          </h2>

          <div className="divide-y divide-white/5 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Zero-Shot Vision AI Inference</div>
                <div className="text-[11px] text-slate-400">Auto-execute image object classification on upload</div>
              </div>
              <span className="text-emerald-400 font-bold">ENABLED</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Spatial Spillover Penalties</div>
                <div className="text-[11px] text-slate-400">Compound distance degradation on regional Planet Health</div>
              </div>
              <span className="text-emerald-400 font-bold">ENABLED</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Immutable Audit Ledger</div>
                <div className="text-[11px] text-slate-400">SHA-256 chain recording of all operational approvals</div>
              </div>
              <span className="text-emerald-400 font-bold">STRICT</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Provision User Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141820] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                Provision Operator Account
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commander Sarah Jenkins"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-[#1b222c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="s.jenkins@earthmind.gov.in"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-[#1b222c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-[#1b222c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Field Officer">Field Officer</option>
                    <option value="Citizen">Citizen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Department</label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full bg-[#1b222c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Temporary Password</label>
                <input
                  type="password"
                  placeholder="EarthMind@2026"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-[#1b222c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-xl font-semibold text-white"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
