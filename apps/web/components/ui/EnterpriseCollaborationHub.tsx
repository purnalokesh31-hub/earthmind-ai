'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { formatDate } from '../../lib/utils';
import {
  MessageSquare,
  Lock,
  AtSign,
  Paperclip,
  Send,
  History,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Activity,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident } from '../../types';

export interface CollaborationComment {
  id: string;
  author: string;
  role: string;
  department: string;
  text: string;
  isInternal: boolean;
  mentions: string[];
  attachments?: string[];
  timestamp: string;
}

const INITIAL_COMMENTS: CollaborationComment[] = [
  {
    id: 'comm-1',
    author: 'Control Room Officer Rakesh',
    role: 'Duty Supervisor',
    department: 'Control Command',
    text: 'Confirmed sub-surface water pressure anomaly with @PWD Infrastructure. Dispatched @Officer Lokesh with squad L3.',
    isInternal: false,
    mentions: ['@PWD Infrastructure', '@Officer Lokesh'],
    attachments: ['Pressure_Radar_Scan.png'],
    timestamp: '14m ago',
  },
  {
    id: 'comm-2',
    author: 'Officer Lokesh',
    role: 'Field Commander',
    department: 'PWD Infrastructure',
    text: '🔒 INTERNAL NOTE: Valve 4B stem threads show 40% shear wear. Recommending replacement skid G4.',
    isInternal: true,
    mentions: ['@Municipal Water'],
    attachments: ['Valve_Wear_Audit.pdf'],
    timestamp: '8m ago',
  },
];

export const EnterpriseCollaborationHub: React.FC = () => {
  const { selectedIncident, incidents, updateIncident, addToast } = useAppStore();

  const activeInc = selectedIncident || incidents[0] || null;

  const [activeTab, setActiveTab] = useState<'comments' | 'internal' | 'department' | 'audit'>('comments');
  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [comments, setComments] = useState<CollaborationComment[]>(INITIAL_COMMENTS);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // Autocomplete Mentions list
  const mentionSuggestions = ['@Officer Lokesh', '@Officer Sravan', '@PWD Infrastructure', '@Municipal Water', '@Disaster Response'];

  const handleAddMention = (mention: string) => {
    setCommentText((prev) => `${prev} ${mention} `);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeInc) return;

    // Detect @mentions
    const foundMentions = mentionSuggestions.filter((m) => commentText.includes(m));

    const newComment: CollaborationComment = {
      id: `comm-${Date.now()}`,
      author: 'Chief Operations Officer',
      role: 'Control Duty Lead',
      department: 'Command Center',
      text: commentText,
      isInternal: isInternalNote,
      mentions: foundMentions,
      attachments: attachmentName ? [attachmentName] : undefined,
      timestamp: 'Just now',
    };

    setComments((prev) => [newComment, ...prev]);

    // AUTOMATIC INCIDENT TIMELINE SYNCHRONIZATION
    const updatedTimeline = [
      ...(activeInc.timeline || []),
      {
        id: `evt-comm-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: `${isInternalNote ? '🔒 Internal Note' : '💬 Collaboration Event'}: "${commentText.slice(0, 60)}..."`,
        icon: isInternalNote ? '🔒' : '💬',
        actor: 'Chief Operations Officer',
      },
    ];

    updateIncident(activeInc.id, {
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString(),
    });

    addToast({
      title: isInternalNote ? 'Internal Note Logged' : 'Comment Posted',
      message: 'Automatically synced with Incident Lifecycle Timeline.',
      type: 'success',
    });

    setCommentText('');
    setAttachmentName(null);
    setIsInternalNote(false);
  };

  if (!activeInc) return null;

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-cyan-500/30 shadow-2xl relative overflow-hidden text-slate-200 font-mono">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <MessageSquare className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise Collaboration & Discussion Hub</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  AUTO TIMELINE SYNC
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Inter-department discussions, @mentions, internal control notes & immutable activity audit feed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-400">Target Case:</span>
            <span className="text-cyan-400 font-bold">{activeInc.id}</span>
          </div>
        </div>

        {/* ── NAVIGATION TABS ── */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#050B14] border border-white/10 mb-4 z-10 relative text-[10px]">
          {(['comments', 'internal', 'department', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-1.5 rounded-lg font-bold capitalize transition flex items-center justify-center gap-1',
                activeTab === tab ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {tab === 'comments' && <MessageSquare className="w-3.5 h-3.5" />}
              {tab === 'internal' && <Lock className="w-3.5 h-3.5" />}
              {tab === 'department' && <Building2 className="w-3.5 h-3.5" />}
              {tab === 'audit' && <History className="w-3.5 h-3.5" />}
              <span>
                {tab === 'comments' && 'Public Comments'}
                {tab === 'internal' && 'Internal Notes'}
                {tab === 'department' && 'Department Chat'}
                {tab === 'audit' && 'Audit Activity'}
              </span>
            </button>
          ))}
        </div>

        {/* ── FEED STREAM ── */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4 z-10 relative text-[10px]">
          {comments
            .filter((c) => {
              if (activeTab === 'internal') return c.isInternal;
              if (activeTab === 'comments') return !c.isInternal;
              return true;
            })
            .map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-3.5 rounded-xl border flex flex-col gap-2 transition-all shadow-md',
                  c.isInternal ? 'bg-amber-950/20 border-amber-500/30' : 'bg-[#050B14] border-white/10'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-xs">{c.author}</span>
                    <span className="text-[9px] text-slate-400 font-sans">({c.role} • {c.department})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.isInternal && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> PRIVATE NOTE
                      </span>
                    )}
                    <span className="text-slate-500 text-[9px]">{c.timestamp}</span>
                  </div>
                </div>

                <p className="text-slate-300 font-sans text-xs leading-relaxed">{c.text}</p>

                {/* Attachments & Mentions */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                  {c.mentions.map((m, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-[9px]">
                      {m}
                    </span>
                  ))}

                  {c.attachments?.map((att, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300 font-bold text-[9px] flex items-center gap-1">
                      <Paperclip className="w-3 h-3 text-amber-400" /> {att}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
        </div>

        {/* ── COMMENT INPUT FORM WITH MENTIONS & ATTACHMENTS ── */}
        <form onSubmit={handlePostComment} className="space-y-2 z-10 relative">
          {/* Mention Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[9px]">
            <span className="text-slate-500 font-bold">Quick Mentions:</span>
            {mentionSuggestions.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleAddMention(m)}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:border-cyan-500/40 text-cyan-300 font-bold transition shrink-0"
              >
                {m}
              </button>
            ))}
          </div>

          {/* Textarea Input */}
          <div className="relative">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Post observation note, @mention officer, or attach evidence..."
              rows={2}
              className="w-full p-3 rounded-xl bg-[#050B14] border border-white/10 focus:border-cyan-500 outline-none text-slate-100 font-sans text-xs"
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded border-white/10 text-cyan-500 focus:ring-0"
                />
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Lock className="w-3 h-3" /> Private Internal Control Note
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setAttachmentName('Field_Snapshot_Log.png');
                  addToast({ title: 'File Attached', message: 'Attached Field_Snapshot_Log.png to comment.', type: 'info' });
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <Paperclip className="w-3 h-3" /> {attachmentName || 'Attach File'}
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!commentText.trim()}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Post & Sync Timeline
            </Button>
          </div>
        </form>
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between z-10 relative">
        <span>Every collaboration event automatically appends to the Incident Timeline.</span>
        <span className="text-emerald-400 font-bold">REALTIME COLLABORATION</span>
      </div>
    </Card>
  );
};
