'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Settings (Administration)
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { cn } from '../../lib/utils';
import { 
  User, 
  Briefcase, 
  Activity, 
  Bell, 
  Shield, 
  Palette, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  MapPin,
  Building,
  KeyRound,
  Check
} from 'lucide-react';

const SETTINGS_TABS = [
  { id: 'profile',       label: 'My Profile',      icon: '👤' },
  { id: 'assigned',      label: 'My Cases',        icon: '📋' },
  { id: 'activity',      label: 'My Activity',     icon: '⚡' },
  { id: 'notifications', label: 'Notifications',   icon: '🔔' },
  { id: 'security',      label: 'Security & Auth', icon: '🔒' },
  { id: 'appearance',    label: 'Appearance',      icon: '🎨' },
] as const;

type SettingsTab = typeof SETTINGS_TABS[number]['id'];

export default function SettingsPage() {
  const { 
    currentUser, 
    updateCurrentUser, 
    incidents, 
    auditLogs, 
    addToast, 
    logAuditEvent, 
    setSelectedIncident, 
    setActiveTab: setAppActiveTab 
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [theme, setTheme] = useState<'dark' | 'emerald' | 'light'>('dark');

  // Profile Form State
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Officer Lokesh',
    email: currentUser?.email || 'lokesh@earthmind.gov',
    organization: currentUser?.organization || 'Municipal Administration',
    department: currentUser?.department || 'Roads & Infrastructure',
    region: currentUser?.region || 'Vijayawada',
    phone: currentUser?.phone || '+91 98480 22334',
  });

  // Password / Security Form
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  // Notification preferences
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);

  // Filter incidents assigned to or reported by current user
  const myIncidents = incidents.filter(
    (inc) =>
      inc.assignedTo?.toLowerCase().includes(currentUser?.name.toLowerCase() || '') ||
      inc.reportedBy?.toLowerCase().includes(currentUser?.name.toLowerCase() || '') ||
      inc.department?.toLowerCase() === currentUser?.department.toLowerCase()
  );

  // Personal audit activity
  const myAuditLogs = auditLogs.filter(
    (log) => log.actor?.toLowerCase().includes(currentUser?.name.toLowerCase() || '')
  );

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser(formData);
    logAuditEvent({
      event: 'USER_PROFILE_UPDATED',
      actor: currentUser?.name || 'Operator',
      details: `Operator updated profile contact details (${formData.name}, ${formData.email}).`,
    });
    addToast({
      title: 'Profile Updated',
      message: 'Your personal settings have been successfully saved.',
      type: 'success',
    });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.newPass || passwords.newPass !== passwords.confirmPass) {
      addToast({
        title: 'Validation Failed',
        message: 'New password and confirmation must match.',
        type: 'error',
      });
      return;
    }
    setPasswords({ current: '', newPass: '', confirmPass: '' });
    logAuditEvent({
      event: 'SECURITY_CREDENTIALS_UPDATED',
      actor: currentUser?.name || 'Operator',
      details: 'Operator updated authentication credentials / password.',
    });
    addToast({
      title: 'Password Updated',
      message: 'Your security password has been changed successfully.',
      type: 'success',
    });
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-5 rounded-full transition-colors duration-200',
        checked ? 'bg-earth-500' : 'bg-surface-4'
      )}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-5 max-w-5xl mx-auto w-full pb-20 lg:pb-0"
    >
      {/* ── Left: Tab Navigation ── */}
      <div className="w-52 shrink-0 flex flex-col gap-1 hidden md:flex">
        <div className="mb-3 px-3">
          <h2 className="text-sm font-bold text-gray-200">User Panel</h2>
          <p className="text-[11px] text-gray-500">Manage account & operational profile</p>
        </div>
        {SETTINGS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all w-full',
              activeTab === tab.id
                ? 'bg-earth-500/10 text-earth-400 border-l-2 border-earth-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-2 border-transparent'
            )}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Right: Content ── */}
      <div className="flex-1 min-w-0">

        {/* ── My Profile Tab ── */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="page-title">Personal Profile</h1>
                <p className="text-xs text-slate-400">View and update your operator credentials and contact preferences.</p>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="h-16 w-16 rounded-2xl bg-earth-500/20 border border-earth-500/40 flex items-center justify-center text-2xl font-black text-earth-400">
                  {currentUser?.name?.[0] || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-100">{currentUser?.name || 'Officer Lokesh'}</h2>
                  <p className="text-[11px] text-slate-400">{currentUser?.email || 'lokesh@earthmind.gov'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-earth-500/15 text-earth-400 border border-earth-500/30">
                      {currentUser?.role || 'Field Officer'}
                    </span>
                    <span className="text-[10px] text-slate-500">• {currentUser?.region || 'Vijayawada'}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="section-label mb-1 block">Full Name</label>
                    <input 
                      className="input w-full" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="section-label mb-1 block">Email Address</label>
                    <input 
                      type="email"
                      className="input w-full" 
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="section-label mb-1 block">Organization</label>
                    <input 
                      className="input w-full" 
                      value={formData.organization} 
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="section-label mb-1 block">Department</label>
                    <input 
                      className="input w-full" 
                      value={formData.department} 
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="section-label mb-1 block">Operational Region</label>
                    <input 
                      className="input w-full" 
                      value={formData.region} 
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="section-label mb-1 block">Direct Phone Contact</label>
                    <input 
                      className="input w-full" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── My Assigned Cases Tab ── */}
        {activeTab === 'assigned' && (
          <motion.div
            key="assigned"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div>
              <h1 className="page-title">My Assigned Cases & Field Tasks</h1>
              <p className="text-xs text-slate-400">Incidents, investigations, and field responses directly associated with you.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {myIncidents.length === 0 ? (
                <div className="card p-8 text-center text-slate-500">
                  No cases are currently assigned directly to your account.
                </div>
              ) : (
                myIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="card p-4 flex items-center justify-between hover:border-earth-500/40 transition cursor-pointer"
                    onClick={() => {
                      setSelectedIncident(inc);
                      setAppActiveTab('incidents');
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-earth-500/10 border border-earth-500/20 flex items-center justify-center text-earth-400 shrink-0 mt-0.5">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{inc.id}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-slate-300 border border-white/5">
                            {inc.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-200 mt-1">{inc.title}</h4>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {inc.location.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {inc.reportedAt.slice(0, 10)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                        inc.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        inc.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      )}>
                        {inc.severity}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* ── My Personal Activity Tab ── */}
        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div>
              <h1 className="page-title">My Action History</h1>
              <p className="text-xs text-slate-400">Chronological ledger of operational decisions made by your operator profile.</p>
            </div>

            <div className="card p-5">
              <div className="space-y-4">
                {myAuditLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No recent actions recorded for your session yet.</p>
                ) : (
                  myAuditLogs.slice(0, 15).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                      <div className="h-7 w-7 rounded-lg bg-earth-500/10 border border-earth-500/30 flex items-center justify-center text-earth-400 shrink-0 mt-0.5">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-200">{log.event}</p>
                          <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <motion.div
            key="notif"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <h1 className="page-title">Notification Preferences</h1>

            <div className="card p-5 flex flex-col gap-5">
              {[
                { label: 'Push Notifications', desc: 'Receive real-time browser push alerts for critical incidents', checked: pushAlerts, onChange: setPushAlerts },
                { label: 'SMS Alerts', desc: 'Get SMS for critical and high-severity incidents', checked: smsAlerts, onChange: setSmsAlerts },
                { label: 'Email Digest', desc: 'Receive daily email summary of all incidents and updates', checked: emailDigest, onChange: setEmailDigest },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle checked={item.checked} onChange={item.onChange} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <h1 className="page-title">Security</h1>

            <div className="card p-5 flex flex-col gap-4">
              <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
                <div>
                  <label className="section-label mb-1 block">Current Password</label>
                  <input 
                    type="password" 
                    className="input max-w-md w-full" 
                    placeholder="Enter current password" 
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="section-label mb-1 block">New Password</label>
                  <input 
                    type="password" 
                    className="input max-w-md w-full" 
                    placeholder="Enter new password" 
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="section-label mb-1 block">Confirm Password</label>
                  <input 
                    type="password" 
                    className="input max-w-md w-full" 
                    placeholder="Confirm new password" 
                    value={passwords.confirmPass}
                    onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-fit mt-2">Update Password</button>
              </form>
            </div>

            <div className="card p-5">
              <h3 className="text-xs font-black uppercase tracking-wider mb-3">Active Sessions</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💻</span>
                    <div>
                      <p className="text-[11px] font-bold">Chrome · Windows</p>
                      <p className="text-[9px] text-slate-500 font-mono">Vijayawada · Current Session</p>
                    </div>
                  </div>
                  <span className="badge-low">Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Appearance */}
        {activeTab === 'appearance' && (
          <motion.div
            key="appearance"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <h1 className="page-title">Appearance</h1>

            <div className="card p-5">
              <h3 className="text-xs font-black uppercase tracking-wider mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Dark', icon: '🌙', desc: 'Default dark theme' },
                  { id: 'emerald', label: 'Emerald', icon: '🌿', desc: 'Dark with emerald accent' },
                  { id: 'light', label: 'Light', icon: '☀️', desc: 'Light theme' },
                ].map(t => {
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id as any);
                        addToast({
                          title: 'Theme Updated',
                          message: `Applied ${t.label} palette across operational shell.`,
                          type: 'info',
                        });
                      }}
                      className={cn(
                        'p-4 rounded-xl border text-center transition-all cursor-pointer',
                        isActive ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-white/10 hover:border-cyan-500/40 bg-white/5'
                      )}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <p className="text-xs font-bold mt-2 text-slate-100">{t.label}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{t.desc}</p>
                      {isActive && (
                        <span className="inline-block mt-2 text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
