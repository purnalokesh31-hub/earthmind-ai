'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { useAppStore } from '../../../stores/app-store';
import { formatDate } from '../../../lib/utils';
import {
  MessageSquare,
  Send,
  Clock,
  User,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Incident } from '../../../types';

// ── Mock comments ──
const MOCK_COMMENTS = [
  { id: 'cmt-1', author: 'Control Room Officer Rakesh', role: 'Supervisor', text: 'Confirmed sub-surface water pressure anomaly. Dispatched Squad L3.', timestamp: '14m ago', avatar: '🟢' },
  { id: 'cmt-2', author: 'Officer Lokesh', role: 'Field Commander', text: 'Arrived on-site at Benz Circle. Isolated surrounding valve 4B. Area cordoned off. Structural assessment in progress.', timestamp: '8m ago', avatar: '🔵' },
  { id: 'cmt-3', author: 'AI Situation Engine', role: 'System', text: 'Automated re-assessment triggered. Updated risk score from 78% to 82% based on new evidence upload. Recommend escalation to Priority 1.', timestamp: '5m ago', avatar: '🤖' },
];

const CommentsTab: React.FC<{ incident: Incident }> = ({ incident }) => {
  const { addToast } = useAppStore();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(MOCK_COMMENTS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `cmt-${Date.now()}`,
      author: 'Chief Operations Officer',
      role: 'Command Duty',
      text: commentText,
      timestamp: 'Just now',
      avatar: '⭐',
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText('');
    addToast({ title: 'Comment Posted', message: 'Operator note added to the case ledger.', type: 'success' });
  };

  return (
    <Card className="p-4 bg-[#0A1220]/95 border-white/10">
      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
        <MessageSquare className="w-3 h-3 text-cyan-400" /> Operator Comments & Notes ({comments.length})
      </h4>

      {/* Comments list */}
      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-1">
        {comments.map((cmt, idx) => (
          <motion.div
            key={cmt.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="flex gap-3"
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#050B14] border border-white/10 flex items-center justify-center text-sm">
              {cmt.avatar}
            </div>

            {/* Content */}
            <div className="flex-1 p-3 rounded-xl bg-[#050B14] border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-100">{cmt.author}</span>
                  <span className={cn(
                    'text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border',
                    cmt.role === 'System' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                    cmt.role === 'Supervisor' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  )}>
                    {cmt.role}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {cmt.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{cmt.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add an operator note or comment..."
            className="w-full px-3 py-2.5 rounded-xl bg-[#050B14] border border-white/10 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/40 transition font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-40 transition flex items-center gap-1.5 text-[10px] font-mono font-bold"
        >
          <Send className="w-3 h-3" /> Post
        </button>
      </form>
    </Card>
  );
};

export default CommentsTab;
