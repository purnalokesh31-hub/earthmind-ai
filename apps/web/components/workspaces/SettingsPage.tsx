'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Settings (Administration)
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { DEMO_USERS } from '../../lib/demo-data';
import { cn } from '../../lib/utils';

const SETTINGS_TABS = [
  { id: 'profile',       label: 'Profile',       icon: '👤' },
  { id: 'users',         label: 'Users',         icon: '👥' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'security',      label: 'Security',      icon: '🔒' },
  { id: 'appearance',    label: 'Appearance',    icon: '🎨' },
] as const;

type SettingsTab = typeof SETTINGS_TABS[number]['id'];

export default function SettingsPage() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Notification prefs
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);

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
      <div className="w-48 shrink-0 flex flex-col gap-1 hidden md:flex">
        <h2 className="section-label mb-2">Settings</h2>
        {SETTINGS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all w-full',
              activeTab === tab.id
                ? 'bg-earth-500/10 text-earth-400'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
            )}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Right: Content ── */}
      <div className="flex-1 min-w-0">

        {/* Profile */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <h1 className="page-title">Profile</h1>

            <div className="card p-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-earth-500/20 border border-earth-500/40 flex items-center justify-center text-2xl font-black text-earth-400">
                  {currentUser?.name[0] || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{currentUser?.name || 'Officer Lokesh'}</h2>
                  <p className="text-[11px] text-slate-500">{currentUser?.email || 'lokesh@earthmind.gov'}</p>
                  <p className="text-[10px] text-earth-400 font-bold uppercase mt-0.5">{currentUser?.role || 'Field Officer'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="section-label mb-1 block">Full Name</label>
                  <input className="input" defaultValue={currentUser?.name || 'Officer Lokesh'} />
                </div>
                <div>
                  <label className="section-label mb-1 block">Email</label>
                  <input className="input" defaultValue={currentUser?.email || 'lokesh@earthmind.gov'} />
                </div>
                <div>
                  <label className="section-label mb-1 block">Organization</label>
                  <input className="input" defaultValue={currentUser?.organization || 'Municipal Administration'} />
                </div>
                <div>
                  <label className="section-label mb-1 block">Department</label>
                  <input className="input" defaultValue={currentUser?.department || 'Roads & Infrastructure'} />
                </div>
                <div>
                  <label className="section-label mb-1 block">Region</label>
                  <input className="input" defaultValue={currentUser?.region || 'Vijayawada'} />
                </div>
                <div>
                  <label className="section-label mb-1 block">Role</label>
                  <select className="input" defaultValue={currentUser?.role || 'Field Officer'}>
                    <option>Citizen</option>
                    <option>Field Officer</option>
                    <option>Department Officer</option>
                    <option>Supervisor</option>
                    <option>Environmental Analyst</option>
                    <option>Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button className="btn-primary">Save Changes</button>
                <button className="btn-secondary">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h1 className="page-title">User Management</h1>
              <button className="btn-primary">+ Add User</button>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-border">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-2 py-3">Email</th>
                    <th className="px-2 py-3">Role</th>
                    <th className="px-2 py-3">Department</th>
                    <th className="px-2 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {DEMO_USERS.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-xs hover:bg-white/[0.02] transition cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-earth-500/20 border border-earth-500/40 flex items-center justify-center text-[10px] font-black text-earth-400">
                            {user.name[0]}
                          </div>
                          <span className="font-bold">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-slate-500 text-[10px]">{user.email}</td>
                      <td className="px-2 py-3">
                        <span className="badge-neutral">{user.role}</span>
                      </td>
                      <td className="px-2 py-3 text-slate-500 text-[10px]">{user.department || '—'}</td>
                      <td className="px-2 py-3">
                        <span className="flex items-center gap-1.5">
                          <span className="status-dot-active" />
                          <span className="text-[10px] font-bold text-earth-400">Active</span>
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
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
              <div>
                <label className="section-label mb-1 block">Current Password</label>
                <input type="password" className="input max-w-md" placeholder="Enter current password" />
              </div>
              <div>
                <label className="section-label mb-1 block">New Password</label>
                <input type="password" className="input max-w-md" placeholder="Enter new password" />
              </div>
              <div>
                <label className="section-label mb-1 block">Confirm Password</label>
                <input type="password" className="input max-w-md" placeholder="Confirm new password" />
              </div>
              <button className="btn-primary w-fit mt-2">Update Password</button>
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
                  { id: 'dark', label: 'Dark', icon: '🌙', desc: 'Default dark theme', active: true },
                  { id: 'emerald', label: 'Emerald', icon: '🌿', desc: 'Dark with emerald accent', active: false },
                  { id: 'light', label: 'Light', icon: '☀️', desc: 'Light theme', active: false },
                ].map(t => (
                  <button
                    key={t.id}
                    className={cn(
                      'p-4 rounded-xl border text-center transition-all',
                      t.active ? 'border-earth-500 bg-earth-950/20' : 'border-border hover:border-earth-500/30'
                    )}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <p className="text-xs font-bold mt-2">{t.label}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
