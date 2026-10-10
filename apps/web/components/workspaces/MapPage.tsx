'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Interactive Map (MapLibre GL)
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppStore } from '../../stores/app-store';
import { cn, severityColor, severityBadgeClass, categoryLabel, statusLabel } from '../../lib/utils';

const LAYERS = ['Streets', 'Satellite', 'Terrain'];
const FILTERS = ['All', 'Critical', 'Water', 'Infrastructure', 'Climate'];

export default function MapPage() {
  const { incidents, selectedIncident, setSelectedIncident, setContextPanelTab, setContextPanelOpen } = useAppStore();

  const [activeLayer, setActiveLayer] = useState('Streets');
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // Filter incidents based on selected filter
  const markers = incidents.filter(m => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Critical') return m.severity === 'critical';
    if (activeFilter === 'Water') return m.category === 'water';
    if (activeFilter === 'Infrastructure') return m.category === 'infrastructure';
    if (activeFilter === 'Climate') return m.category === 'climate';
    return true;
  });

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    let map: maplibregl.Map | null = null;

    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: activeLayer === 'Satellite'
          ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
          : activeLayer === 'Terrain'
            ? 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
            : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [80.6350, 16.5060],
        zoom: 12.5,
        attributionControl: false,
        maxZoom: 18,
        minZoom: 10,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

      map.on('load', () => {
        setMapLoaded(true);
        mapRef.current = map;

        // Add markers for each incident
        incidents.forEach(incident => {
          const el = document.createElement('div');
          el.className = 'earthmind-marker';
          el.style.cssText = `
            width: 20px; height: 20px; border-radius: 50%;
            background: ${severityColor(incident.severity)};
            border: 3px solid rgba(0,0,0,0.5);
            cursor: pointer;
            box-shadow: 0 0 12px ${severityColor(incident.severity)}60;
            transition: transform 0.2s, box-shadow 0.2s;
          `;

          // Pulse ring for critical
          if (incident.severity === 'critical') {
            const pulse = document.createElement('div');
            pulse.style.cssText = `
              position: absolute; top: -6px; left: -6px;
              width: 32px; height: 32px; border-radius: 50%;
              border: 2px solid ${severityColor(incident.severity)};
              animation: markerPulse 2s infinite ease-out;
              pointer-events: none;
            `;
            el.style.position = 'relative';
            el.appendChild(pulse);
          }

          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.3)';
            el.style.boxShadow = `0 0 20px ${severityColor(incident.severity)}80`;
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            el.style.boxShadow = `0 0 12px ${severityColor(incident.severity)}60`;
          });
          el.addEventListener('click', () => {
            setSelectedIncident(incident);
          });

          // Create popup
          const popup = new maplibregl.Popup({
            offset: 15,
            closeButton: false,
            className: 'earthmind-popup',
          }).setHTML(`
            <div style="background:#0d1117;border:1px solid #1e2733;border-radius:12px;padding:8px 12px;color:#e2e8f0;font-family:Inter,sans-serif;min-width:160px;">
              <div style="font-size:10px;font-weight:800;margin-bottom:4px;">${incident.title}</div>
              <div style="font-size:9px;color:#64748b;display:flex;gap:8px;">
                <span style="color:${severityColor(incident.severity)};font-weight:700;text-transform:uppercase;">${incident.severity}</span>
                <span>${incident.location.name}</span>
              </div>
            </div>
          `);

          new maplibregl.Marker({ element: el })
            .setLngLat([incident.location.lng, incident.location.lat])
            .setPopup(popup)
            .addTo(map!);
        });
      });
    } catch (e) {
      console.error('MapLibre GL initialization failed, falling back to SVG vector map:', e);
      setMapLoaded(false);
    }

    return () => {
      if (map) map.remove();
    };
  }, [activeLayer]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden -m-6 lg:m-0" style={{ margin: '-24px', height: 'calc(100% + 48px)' }}>

      {/* ── Map Container ── */}
      <div ref={mapContainerRef} className="flex-1 bg-surface-1 relative">
        {/* Fallback SVG map if MapLibre fails */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              {Array.from({ length: 12 }).map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={`${(i + 1) * 100 / 12}%`} y1="0" x2={`${(i + 1) * 100 / 12}%`} y2="100%" stroke="#10b981" strokeWidth="0.3" strokeOpacity="0.15" />
                </React.Fragment>
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={`${(i + 1) * 100 / 8}%`} x2="100%" y2={`${(i + 1) * 100 / 8}%`} stroke="#10b981" strokeWidth="0.3" strokeOpacity="0.15" />
              ))}
              {[80, 160, 240, 320].map(r => (
                <circle key={r} cx="50%" cy="50%" r={r} fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="6,6" strokeOpacity="0.1" />
              ))}
              <path d="M 10% 50% Q 30% 30% 50% 50% Q 70% 70% 90% 50%" stroke="#1e3a5f" strokeWidth="3" fill="none" strokeOpacity="0.6" />
              <path d="M 50% 10% Q 55% 35% 50% 50% Q 45% 65% 50% 90%" stroke="#1e3a5f" strokeWidth="2" fill="none" strokeOpacity="0.4" />
              {markers.map((m, i) => (
                <g key={m.id} style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedIncident(m)}>
                  <circle cx={`${30 + (i * 13) % 45}%`} cy={`${30 + (i * 11) % 45}%`} r="18" fill={severityColor(m.severity)} fillOpacity="0.08" />
                  <circle cx={`${30 + (i * 13) % 45}%`} cy={`${30 + (i * 11) % 45}%`} r="10" fill={severityColor(m.severity)} fillOpacity="0.15" />
                  <circle cx={`${30 + (i * 13) % 45}%`} cy={`${30 + (i * 11) % 45}%`} r="6" fill={severityColor(m.severity)} fillOpacity="0.9" />
                  <circle cx={`${30 + (i * 13) % 45}%`} cy={`${30 + (i * 11) % 45}%`} r="2.5" fill="white" />
                </g>
              ))}
            </svg>
            <div className="z-10 flex flex-col items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="h-6 w-6 border-2 border-earth-500 border-t-transparent rounded-full"
              />
              <span className="text-[10px] font-bold text-slate-500">Loading MapLibre GL...</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Layer Controls (top-left) ── */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
        <div className="flex flex-col rounded-xl border border-border overflow-hidden shadow-elevation-3 glass-strong">
          {LAYERS.map(l => (
            <button
              key={l}
              onClick={() => setActiveLayer(l)}
              className={cn(
                'px-3 py-2 text-[10px] font-bold text-left transition',
                activeLayer === l ? 'bg-earth-500 text-surface-0' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Pills (top-right) ── */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-20 flex-wrap justify-end">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-xl border text-[10px] font-bold shadow-elevation-2 transition',
              activeFilter === f
                ? 'bg-earth-500 text-surface-0 border-earth-400'
                : 'glass text-slate-400 hover:text-slate-200'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Telemetry Bar (bottom-left) ── */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-2 rounded-xl border border-border shadow-elevation-3 text-[9px] font-mono glass-strong z-20">
        <span className="flex items-center gap-1 text-earth-400 font-bold">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-earth-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          LIVE
        </span>
        <span className="text-slate-500">Layer: {activeLayer}</span>
        <span className="text-slate-500">{markers.length} markers</span>
        <span className="text-slate-500">GPS Connected</span>
      </div>

      {/* ── Selected Incident Vision Intelligence Drawer (bottom-right) ── */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-4 right-4 z-30 w-80 p-4 rounded-2xl bg-[#0A1220]/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                👁️ Vision AI GIS Marker
              </span>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-100">{selectedIncident.title}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2">{selectedIncident.description}</p>
            </div>

            {/* Evidence Asset Preview */}
            <div className="w-full h-28 rounded-lg bg-slate-900 border border-white/10 overflow-hidden relative">
              <img
                src={selectedIncident.imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80'}
                alt="Evidence Preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-black/80 text-cyan-300 border border-cyan-500/40">
                Confidence: {selectedIncident.aiAnalysis?.confidence || 95}%
              </span>
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5">
                <span className="text-slate-400 block text-[8px] uppercase">Department</span>
                <span className="font-bold text-cyan-400 truncate block">{selectedIncident.department || 'PWD'}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5">
                <span className="text-slate-400 block text-[8px] uppercase">Est. Repair Cost</span>
                <span className="font-bold text-emerald-400 truncate block">{selectedIncident.aiAnalysis?.estimatedCost || '₹1,50,000'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                onClick={() => {
                  setContextPanelTab('case');
                  setContextPanelOpen(true);
                }}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-[10px] font-bold text-white uppercase tracking-wider text-center hover:from-cyan-500 hover:to-blue-500 transition-all"
              >
                Inspect in Command Center
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marker pulse animation style */}
      <style jsx global>{`
        @keyframes markerPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .maplibregl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 12px !important;
        }
        .maplibregl-popup-tip {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
