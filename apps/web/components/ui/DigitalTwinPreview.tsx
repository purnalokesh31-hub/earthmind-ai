'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { SeverityBadge, CategoryBadge } from './Badge';
import {
  MapPin,
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  CloudRain,
  Car,
  Truck,
  Flame,
  Radio,
  ExternalLink,
  ShieldAlert,
  Target,
  Crosshair,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident } from '../../types';

export const DigitalTwinPreview: React.FC = () => {
  const {
    incidents,
    selectedIncident,
    setSelectedIncident,
    setActiveTab,
    addToast,
  } = useAppStore();

  const [expanded, setExpanded] = useState(false);
  const [activeLayers, setActiveLayers] = useState<{
    heatmap: boolean;
    weather: boolean;
    traffic: boolean;
    resources: boolean;
    riskZones: boolean;
  }>({
    heatmap: true,
    weather: true,
    traffic: true,
    resources: true,
    riskZones: true,
  });

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => {
      const updated = { ...prev, [layer]: !prev[layer] };
      addToast({
        title: 'GIS Layer Updated',
        message: `${layer.toUpperCase()} layer ${updated[layer] ? 'enabled' : 'disabled'}.`,
        type: 'info',
      });
      return updated;
    });
  };

  const handleLocateMe = () => {
    addToast({
      title: 'Geospatial Camera Centered',
      message: 'Viewport aligned to Vijayawada Central Command (16.5062° N, 80.6480° E).',
      type: 'success',
    });
  };

  // Projected markers from global state
  const markers = useMemo(() => {
    return incidents.map((inc, idx) => {
      const x = 20 + ((idx * 17) % 65);
      const y = 25 + ((idx * 23) % 55);
      return { ...inc, x, y };
    });
  }, [incidents]);

  // Sync internal map selection with global selectedIncident from Zustand
  const activeSelectedMarker = useMemo(() => {
    if (!selectedIncident) return null;
    return markers.find((m) => m.id === selectedIncident.id) || null;
  }, [selectedIncident, markers]);

  const handleSelectPin = (inc: Incident) => {
    setSelectedIncident(inc);
    addToast({
      title: 'Map Incident Selected',
      message: `Selected ${inc.id} (${inc.title}). Synced with Incident & AI Context panels.`,
      type: 'info',
    });
  };

  return (
    <Card className={cn(
      'flex flex-col justify-between border-cyan-500/30 bg-[#0A1220]/95 shadow-2xl relative overflow-hidden transition-all duration-300',
      expanded ? 'col-span-full h-[540px]' : 'h-[440px]'
    )}>
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* ── PANEL HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <MapPin className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>Digital Twin Geospatial Satellite Telemetry</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                STATE SYNCED
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Vijayawada Metropolitan Sector // 16.5062° N, 80.6480° E
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-[#050B14] border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-slate-100 transition"
            title={expanded ? 'Minimize View' : 'Expand Map'}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          
          <Button
            variant="primary"
            size="sm"
            className="text-[10px] py-1 px-3"
            icon={<ExternalLink className="w-3 h-3" />}
            onClick={() => setActiveTab('map')}
          >
            Full GIS Map
          </Button>
        </div>
      </div>

      {/* ── QUICK MAP FILTER TOOLBAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-xl bg-[#050B14] border border-white/10 z-10 my-2 text-[10px]">
        
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 font-mono font-bold mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> GIS LAYERS:
          </span>

          <button
            onClick={() => toggleLayer('weather')}
            className={cn(
              'px-2 py-0.5 rounded border text-[9px] font-bold font-mono transition flex items-center gap-1',
              activeLayers.weather ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-500 border-white/5'
            )}
          >
            <CloudRain className="w-3 h-3" /> Weather
          </button>

          <button
            onClick={() => toggleLayer('traffic')}
            className={cn(
              'px-2 py-0.5 rounded border text-[9px] font-bold font-mono transition flex items-center gap-1',
              activeLayers.traffic ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/5 text-slate-500 border-white/5'
            )}
          >
            <Car className="w-3 h-3" /> Traffic
          </button>

          <button
            onClick={() => toggleLayer('resources')}
            className={cn(
              'px-2 py-0.5 rounded border text-[9px] font-bold font-mono transition flex items-center gap-1',
              activeLayers.resources ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-slate-500 border-white/5'
            )}
          >
            <Truck className="w-3 h-3" /> Field Units
          </button>

          <button
            onClick={() => toggleLayer('riskZones')}
            className={cn(
              'px-2 py-0.5 rounded border text-[9px] font-bold font-mono transition flex items-center gap-1',
              activeLayers.riskZones ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-white/5 text-slate-500 border-white/5'
            )}
          >
            <ShieldAlert className="w-3 h-3" /> Risk Zones
          </button>
        </div>

        <button
          onClick={handleLocateMe}
          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 font-mono text-[9px] font-bold transition flex items-center gap-1 ml-auto"
        >
          <Navigation className="w-3 h-3 text-cyan-400" /> Locate Me
        </button>
      </div>

      {/* ── INTERACTIVE CANVAS VIEWPORT ── */}
      <div className="relative flex-1 bg-[#050B14] rounded-xl border border-white/10 overflow-hidden z-10 flex items-center justify-center my-1 group">
        
        {/* Heatmap Layer Radial Gradients */}
        {activeLayers.heatmap && (
          <>
            <div className="absolute top-1/4 left-1/3 w-44 h-44 bg-rose-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
          </>
        )}

        {/* Risk Zone Buffers */}
        {activeLayers.riskZones && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dashed border-rose-500/40 rounded-full animate-spin-slow pointer-events-none flex items-center justify-center">
            <span className="text-[8px] font-mono font-bold text-rose-400 bg-black/60 px-1.5 py-0.5 rounded">
              RISK BUFFER ZONE C
            </span>
          </div>
        )}

        {/* Weather Overlay */}
        {activeLayers.weather && (
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-transparent to-blue-900/10 pointer-events-none flex items-center justify-center">
            <div className="w-full h-full bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
            <div className="absolute top-3 right-3 bg-[#0A1220]/90 border border-cyan-500/30 px-2 py-0.5 rounded text-[9px] font-mono text-cyan-300 flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-cyan-400" /> Rain Radar: 14mm/hr
            </div>
          </div>
        )}

        {/* Traffic Lines */}
        {activeLayers.traffic && (
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
            <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="45%" y1="10%" x2="45%" y2="90%" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 3" />
          </svg>
        )}

        {/* Department Resource Units (Moving Units) */}
        {activeLayers.resources && (
          <>
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-12 left-20 bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold flex items-center gap-1 shadow-lg"
            >
              🚁 Aerial Drone-01
            </motion.div>

            <motion.div
              animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-16 right-28 bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold flex items-center gap-1 shadow-lg"
            >
              🚒 Rescue Unit-04
            </motion.div>
          </>
        )}

        {/* Synced Incident Markers */}
        {markers.map((m) => {
          const isSelected = activeSelectedMarker?.id === m.id;

          return (
            <button
              key={m.id}
              onClick={() => handleSelectPin(m)}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2 group/pin z-20 transition-transform',
                isSelected && 'scale-125 z-30'
              )}
            >
              {m.severity === 'critical' && (
                <span className="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping" />
              )}
              {isSelected && (
                <span className="absolute -inset-3 rounded-full border-2 border-cyan-400 animate-pulse" />
              )}

              <div className={cn(
                'w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shadow-lg transition-transform',
                isSelected ? 'bg-cyan-400 text-slate-950 border-white scale-110' :
                m.severity === 'critical' ? 'bg-rose-500 text-white border-rose-300' :
                m.severity === 'high' ? 'bg-amber-500 text-slate-950 border-amber-300' :
                'bg-cyan-500 text-slate-950 border-cyan-300'
              )}>
                📍
              </div>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/pin:flex flex-col bg-[#0d1117] border border-white/20 p-2 rounded-xl text-left whitespace-nowrap shadow-2xl z-30">
                <span className="text-[9px] font-mono font-bold text-cyan-400">{m.id}</span>
                <span className="text-[10px] font-bold text-slate-200">{m.title}</span>
                <span className="text-[8px] text-slate-400">{m.location?.name || 'Vijayawada'}</span>
              </div>
            </button>
          );
        })}

        {/* Selected Incident Banner Overlay */}
        <AnimatePresence>
          {activeSelectedMarker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-3 left-3 right-3 bg-[#0d1117]/95 border border-cyan-500/50 p-3 rounded-xl shadow-2xl flex items-center justify-between z-30"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs">
                  {activeSelectedMarker.id}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{activeSelectedMarker.title}</h4>
                  <p className="text-[10px] text-slate-400">📍 {activeSelectedMarker.location?.name || 'Vijayawada Sector'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SeverityBadge severity={activeSelectedMarker.severity} />
                <CategoryBadge category={activeSelectedMarker.category} />
                <button
                  onClick={() => {
                    setSelectedIncident(activeSelectedMarker);
                    setActiveTab('incidents');
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-500 text-slate-950 text-[10px] font-bold hover:bg-cyan-400 transition"
                >
                  Operations View →
                </button>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-500 hover:text-slate-300 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PANEL FOOTER ── */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-white/10 z-10">
        <span className="flex items-center gap-1 text-emerald-400">
          <Radio className="w-3 h-3 animate-pulse" /> Synced with Incident Panel & AI Context Room
        </span>
        <span>Resolution: 0.5m // Sentinel-2B</span>
      </div>
    </Card>
  );
};
