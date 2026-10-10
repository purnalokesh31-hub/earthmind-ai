'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useAppStore } from '../../../stores/app-store';
import {
  Image as ImageIcon,
  Camera,
  FileText,
  Video,
  Mic,
  Upload,
  Download,
  Eye,
  Calendar,
  MapPin,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Incident } from '../../../types';

// ── Mock evidence items ──
const MOCK_EVIDENCE = [
  { id: 'ev-001', filename: 'road_damage_photo_01.jpg', type: 'image/jpeg', uploader: 'Officer Lokesh', uploadedAt: '2 hours ago', size: '2.4 MB', icon: '📷', preview: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=300' },
  { id: 'ev-002', filename: 'site_overview_drone.mp4', type: 'video/mp4', uploader: 'Drone Unit Alpha', uploadedAt: '1.5 hours ago', size: '48 MB', icon: '🎥', preview: null },
  { id: 'ev-003', filename: 'witness_statement_recording.mp3', type: 'audio/mp3', uploader: 'Officer Ravi', uploadedAt: '1 hour ago', size: '8.2 MB', icon: '🎙️', preview: null },
  { id: 'ev-004', filename: 'structural_assessment_report.pdf', type: 'application/pdf', uploader: 'PWD Engineer', uploadedAt: '45 min ago', size: '1.1 MB', icon: '📄', preview: null },
  { id: 'ev-005', filename: 'ai_analysis_overlay.png', type: 'image/png', uploader: 'AI Vision Engine', uploadedAt: '30 min ago', size: '3.8 MB', icon: '🤖', preview: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=300' },
];

const typeColors: Record<string, string> = {
  'image': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'video': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'audio': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'application': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const getTypeColor = (mimeType: string) => {
  const prefix = mimeType.split('/')[0];
  return typeColors[prefix] || 'bg-white/5 text-slate-400 border-white/10';
};

const EvidenceTab: React.FC<{ incident: Incident }> = ({ incident }) => {
  const { addToast } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleUpload = () => {
    addToast({ title: 'Evidence Upload', message: 'File upload simulated — evidence attached to incident.', type: 'success' });
  };

  return (
    <div className="space-y-4">
      {/* Upload Bar */}
      <Card className="p-4 bg-[#0A1220]/95 border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ImageIcon className="w-3 h-3 text-cyan-400" /> Evidence Repository ({MOCK_EVIDENCE.length} files)
          </h4>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#050B14] border border-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('px-2 py-0.5 rounded text-[9px] font-mono font-bold transition',
                  viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                )}
              >Grid</button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('px-2 py-0.5 rounded text-[9px] font-mono font-bold transition',
                  viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                )}
              >List</button>
            </div>
            <Button variant="primary" size="sm" onClick={handleUpload} className="text-[9px]">
              <Upload className="w-3 h-3 mr-1" /> Upload Evidence
            </Button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {MOCK_EVIDENCE.map((ev, idx) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-xl border border-white/5 bg-[#050B14] overflow-hidden hover:border-cyan-500/30 transition cursor-pointer group"
              >
                {/* Preview */}
                <div className="h-24 bg-gradient-to-br from-white/5 to-white/[2%] flex items-center justify-center text-2xl relative overflow-hidden">
                  {ev.preview ? (
                    <img src={ev.preview} alt={ev.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-3xl">{ev.icon}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-2">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
                {/* Info */}
                <div className="p-2">
                  <p className="text-[9px] font-mono font-bold text-slate-200 truncate">{ev.filename}</p>
                  <div className="flex items-center justify-between mt-1 text-[8px] font-mono text-slate-500">
                    <span>{ev.size}</span>
                    <span className={cn('px-1 py-0.5 rounded border text-[7px]', getTypeColor(ev.type))}>
                      {ev.type.split('/')[0]}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {MOCK_EVIDENCE.map((ev, idx) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="p-3 rounded-xl bg-[#050B14] border border-white/5 hover:border-cyan-500/20 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{ev.icon}</span>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-200 block">{ev.filename}</span>
                    <span className="text-[9px] font-mono text-slate-500">by {ev.uploader} · {ev.uploadedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-slate-500">{ev.size}</span>
                  <span className={cn('px-1.5 py-0.5 rounded border text-[8px] font-mono font-bold', getTypeColor(ev.type))}>
                    {ev.type.split('/')[1]?.toUpperCase()}
                  </span>
                  <button className="p-1 rounded bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition">
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EvidenceTab;
