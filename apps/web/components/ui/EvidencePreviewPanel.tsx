'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { Modal } from './Overlay';
import {
  Camera,
  Video,
  Mic,
  FileText,
  MapPin,
  Sparkles,
  ShieldCheck,
  HardDrive,
  Download,
  Maximize2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  Tag,
  Cpu,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EvidenceItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  title: string;
  url: string;
  captureTime: string;
  locationName: string;
  lat: number;
  lng: number;
  device: string;
  fileSize: string;
  aiTags: string[];
  confidence: number;
  sha256Hash: string;
}

const INITIAL_EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'ev-1',
    type: 'image',
    title: 'Benz Circle Road Surface Fracture Snapshot',
    url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800&auto=format&fit=crop',
    captureTime: '2026-08-04 14:22:08 UTC',
    locationName: 'Benz Circle Ward 12 (16.5085° N, 80.6410° E)',
    lat: 16.5085,
    lng: 80.6410,
    device: 'DJI Matrice 300 RTK Drone Cam-01',
    fileSize: '14.2 MB',
    aiTags: ['STRUCTURAL_SUBSIDENCE', 'ASPFLAT_CRACK', 'HYDROSTATIC_STRAIN'],
    confidence: 94.2,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'ev-2',
    type: 'video',
    title: '4K Thermal Drone Flyover Video Clip',
    url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=800&auto=format&fit=crop',
    captureTime: '2026-08-04 14:25:30 UTC',
    locationName: 'Sector 4 Hydro Conductor (16.5090° N, 80.6415° E)',
    lat: 16.5090,
    lng: 80.6415,
    device: 'Thermal FLIR Zenmuse H20T Sensor',
    fileSize: '184.6 MB',
    aiTags: ['THERMAL_HOTSPOT', 'CONDUIT_LEAK', '4K_TELEMETRY'],
    confidence: 88.5,
    sha256Hash: 'a8b2c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899',
  },
  {
    id: 'ev-3',
    type: 'audio',
    title: 'Field Officer Audio Voice Log & Acoustic Radar',
    url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop',
    captureTime: '2026-08-04 14:30:12 UTC',
    locationName: 'Valve Chamber 4B (16.5082° N, 80.6405° E)',
    lat: 16.5082,
    lng: 80.6405,
    device: 'Officer Radio Transceiver CH-04',
    fileSize: '4.8 MB',
    aiTags: ['ACOUSTIC_LEAK_NOISE', 'VOICE_TRANSCRIPT'],
    confidence: 91.0,
    sha256Hash: 'c7d1e44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b111',
  },
  {
    id: 'ev-4',
    type: 'document',
    title: 'ISO-27001 Hydrodynamic Inspection Report',
    url: 'https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=800&auto=format&fit=crop',
    captureTime: '2026-08-04 14:35:00 UTC',
    locationName: 'Control Room Command (16.5085° N, 80.6410° E)',
    lat: 16.5085,
    lng: 80.6410,
    device: 'Control Command Workstation 02',
    fileSize: '2.4 MB',
    aiTags: ['EXECUTIVE_BRIEFING', 'SLA_METRICS'],
    confidence: 99.0,
    sha256Hash: 'f4e3d2c198fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b222',
  },
];

export const EvidencePreviewPanel: React.FC = () => {
  const { selectedIncident, incidents, addToast } = useAppStore();

  const activeIncident = useMemo(() => {
    return selectedIncident || incidents[0] || null;
  }, [selectedIncident, incidents]);

  const [items, setItems] = useState<EvidenceItem[]>(INITIAL_EVIDENCE_ITEMS);
  const [selectedItem, setSelectedItem] = useState<EvidenceItem>(INITIAL_EVIDENCE_ITEMS[0]);
  const [fullscreenItem, setFullscreenItem] = useState<EvidenceItem | null>(null);
  const [showAIVisionBoxes, setShowAIVisionBoxes] = useState<boolean>(true);

  // Reorder Item Up/Down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItems(newItems);
    addToast({ title: 'Ledger Reordered', message: 'Reordered evidence item in primary ledger queue.', type: 'info' });
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    const filtered = items.filter((i) => i.id !== id);
    setItems(filtered);
    if (selectedItem.id === id && filtered.length > 0) {
      setSelectedItem(filtered[0]);
    }
    addToast({ title: 'Evidence Deleted', message: `Removed evidence item ${id} from case file.`, type: 'warning' });
  };

  const handleDownload = (item: EvidenceItem) => {
    addToast({ title: 'Downloading File', message: `Downloading ${item.title} (${item.fileSize}).`, type: 'success' });
  };

  if (!activeIncident) return null;

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-cyan-500/30 shadow-2xl relative overflow-hidden text-slate-200">
      {/* Background Accent Glow */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── PANEL HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Camera className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise Digital Evidence Center</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED HASH
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Multimodal inspection evidence for case <strong className="text-cyan-400">{activeIncident.id}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <button
              onClick={() => setShowAIVisionBoxes(!showAIVisionBoxes)}
              className={cn(
                'px-2.5 py-1 rounded border transition font-bold flex items-center gap-1',
                showAIVisionBoxes ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-400 border-white/10'
              )}
            >
              <Cpu className="w-3 h-3" /> AI Vision Boxes: {showAIVisionBoxes ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* ── MAIN MEDIA PREVIEW VIEWPORT WITH AI VISION OVERLAY ── */}
        {selectedItem && (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-4 h-64 bg-black group shadow-xl">
            <img src={selectedItem.url} alt={selectedItem.title} className="w-full h-full object-cover" />

            {/* AI Vision Bounding Box Overlay */}
            {showAIVisionBoxes && selectedItem.type === 'image' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-dashed border-cyan-400 bg-cyan-500/10 pointer-events-none flex flex-col justify-between p-2 rounded-lg"
              >
                <div className="flex justify-between items-start text-[9px] font-mono font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950">🎯 STRUCTURAL_SUBSIDENCE</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/80 text-emerald-400 border border-emerald-500/30">
                    {selectedItem.confidence}% CONF
                  </span>
                </div>
                <div className="text-[8px] font-mono text-cyan-300 bg-black/60 px-1 py-0.5 rounded self-start">
                  RTK: {selectedItem.lat}° N, {selectedItem.lng}° E
                </div>
              </motion.div>
            )}

            {/* Overlay Viewport Controls */}
            <div className="absolute top-2 right-2 flex items-center gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setFullscreenItem(selectedItem)}
                className="p-1.5 rounded-lg bg-black/70 border border-white/10 text-slate-200 hover:text-cyan-300 transition"
                title="Fullscreen Preview"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDownload(selectedItem)}
                className="p-1.5 rounded-lg bg-black/70 border border-white/10 text-slate-200 hover:text-emerald-300 transition"
                title="Download Evidence"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Metadata Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-[10px] font-mono">
              <div>
                <span className="font-bold text-slate-100 block truncate max-w-md">{selectedItem.title}</span>
                <span className="text-slate-400 text-[9px]">📍 {selectedItem.locationName}</span>
              </div>
              <div className="text-right">
                <span className="text-cyan-400 font-bold block">{selectedItem.fileSize}</span>
                <span className="text-slate-500 text-[9px]">{selectedItem.captureTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── REORDERABLE EVIDENCE LIST AGGREGATOR ── */}
        <div className="space-y-2 z-10 relative">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>Evidence Ledger Stream ({items.length} Items):</span>
            <span>Use ↑↓ arrows to reorder rank</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const isSelected = selectedItem.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    'p-2.5 rounded-xl border bg-[#050B14] flex items-center justify-between gap-3 transition-all cursor-pointer group text-[10px] font-mono',
                    isSelected ? 'border-cyan-500 bg-cyan-950/30' : 'border-white/10 hover:border-cyan-500/30'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">
                      {item.type === 'image' && '📷'}
                      {item.type === 'video' && '🎥'}
                      {item.type === 'audio' && '🎙️'}
                      {item.type === 'document' && '📄'}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-200 group-hover:text-cyan-300 transition leading-tight">
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
                        <span>Device: {item.device}</span>
                        <span>• {item.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Reorder buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMove(idx, 'up'); }}
                      disabled={idx === 0}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMove(idx, 'down'); }}
                      disabled={idx === items.length - 1}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                      className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                      title="Delete Evidence"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FULLSCREEN LIGHTBOX MODAL ── */}
      {fullscreenItem && (
        <Modal
          isOpen={!!fullscreenItem}
          onClose={() => setFullscreenItem(null)}
          title={`Fullscreen Evidence View — ${fullscreenItem.title}`}
          size="xl"
        >
          <div className="flex flex-col gap-4 text-slate-200 font-mono text-[10px]">
            <div className="relative h-96 rounded-xl overflow-hidden bg-black border border-white/10">
              <img src={fullscreenItem.url} alt={fullscreenItem.title} className="w-full h-full object-contain" />
            </div>

            <div className="p-3 rounded-xl bg-[#050B14] border border-white/10 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Capture Device:</span>
                <span className="text-slate-100 font-bold">{fullscreenItem.device}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SHA-256 Hash Stamp:</span>
                <span className="text-emerald-400 font-bold font-mono truncate">{fullscreenItem.sha256Hash}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-3 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between z-10 relative">
        <span>Tamper-proof evidence ledger synced with city incident platform.</span>
        <span className="text-emerald-400 font-bold">SECURE EVIDENCE</span>
      </div>
    </Card>
  );
};
