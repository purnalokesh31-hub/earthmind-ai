'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  DragEndEvent,
} from '@dnd-kit/core';
import { useAppStore } from '../../stores/app-store';
import { assignOfficer, assignDepartment, logAuditEvent } from '../../lib/services/incident.service';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { formatDate } from '../../lib/utils';
import {
  Users,
  Building2,
  Truck,
  Wrench,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  UserCheck,
  History,
  Navigation,
  Activity,
  Plus,
  Trash2,
  GripVertical,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident, FieldAssignment } from '../../types';

// ── Resource Types ──
type ResourceCategory = 'officer' | 'department' | 'vehicle' | 'equipment';

interface ResourceItem {
  id: string;
  name: string;
  category: ResourceCategory;
  roleOrType: string;
  department: string;
  status: 'available' | 'deployed' | 'standby' | 'maintenance';
  etaMinutes: number;
  icon: string;
  phone?: string;
  specs?: string;
}

// ── Mock Master Resource Inventory ──
const MASTER_RESOURCES: ResourceItem[] = [
  // Officers
  { id: 'res-off-1', name: 'Ravi Kumar', category: 'officer', roleOrType: 'Lead Officer', department: 'Public Works Department', status: 'available', etaMinutes: 12, icon: '👮', phone: '+91-9876543210' },
  { id: 'res-off-2', name: 'Sita Ram', category: 'officer', roleOrType: 'Field Officer', department: 'Water Supply Board', status: 'available', etaMinutes: 15, icon: '👮', phone: '+91-9876543211' },
  { id: 'res-off-3', name: 'Vikram Patel', category: 'officer', roleOrType: 'Emergency Response', department: 'Fire & Emergency', status: 'available', etaMinutes: 8, icon: '👨‍🚒', phone: '+91-9876543215' },
  { id: 'res-off-4', name: 'Priya Sharma', category: 'officer', roleOrType: 'Supervisor', department: 'Electricity Board', status: 'standby', etaMinutes: 20, icon: '👩‍💼', phone: '+91-9876543214' },
  { id: 'res-off-5', name: 'Arjun Singh', category: 'officer', roleOrType: 'Field Officer', department: 'Forest Department', status: 'available', etaMinutes: 25, icon: '🌲', phone: '+91-9876543213' },

  // Departments
  { id: 'res-dept-1', name: 'Public Works Department', category: 'department', roleOrType: 'Infrastructure & Roads', department: 'PWD Division', status: 'available', etaMinutes: 10, icon: '🏛️' },
  { id: 'res-dept-2', name: 'Water Supply Board', category: 'department', roleOrType: 'Hydraulics & Utilities', department: 'WSB Division', status: 'available', etaMinutes: 14, icon: '💧' },
  { id: 'res-dept-3', name: 'Fire & Emergency Services', category: 'department', roleOrType: 'Hazard & Disaster Containment', department: 'FES Command', status: 'available', etaMinutes: 6, icon: '🚨' },
  { id: 'res-dept-4', name: 'Electricity Board', category: 'department', roleOrType: 'Power & Grid Services', department: 'State Grid', status: 'available', etaMinutes: 18, icon: '⚡' },

  // Vehicles
  { id: 'res-[#vh-1]', name: 'Utility Patrol AP-09-AB-1234', category: 'vehicle', roleOrType: 'Utility Patrol Vehicle', department: 'PWD', status: 'available', etaMinutes: 10, icon: '🛻', specs: 'GPS Tracked · 4x4 Off-Road' },
  { id: 'res-vh-2', name: 'Water Tanker AP-09-CD-5678', category: 'vehicle', roleOrType: 'Rapid Water Response Tanker', department: 'WSB', status: 'deployed', etaMinutes: 16, icon: '🚛', specs: '10,000L Capacity' },
  { id: 'res-vh-3', name: 'Fire Engine F-01', category: 'vehicle', roleOrType: 'Heavy Response Engine', department: 'Fire & Emergency', status: 'available', etaMinutes: 8, icon: '🚒', specs: 'High Pressure Hose · Foam Cannon' },
  { id: 'res-vh-4', name: 'Aerial Drone Scanner D-04', category: 'vehicle', roleOrType: 'Surveillance Drone', department: 'Forest Dept', status: 'available', etaMinutes: 5, icon: '🛸', specs: 'Thermal Vision · 4K Stream' },

  // Equipment
  { id: 'res-eq-1', name: 'Heavy Excavator EX-02', category: 'equipment', roleOrType: 'Earthmover & Trenching', department: 'PWD', status: 'available', etaMinutes: 30, icon: '🏗️', specs: 'CAT 320 Hydraulic' },
  { id: 'res-eq-2', name: 'Submersible Pump Unit 500HP', category: 'equipment', roleOrType: 'Dewatering Pump', department: 'WSB', status: 'available', etaMinutes: 20, icon: '⚙️', specs: '5,000 GPM Flow' },
  { id: 'res-eq-3', name: 'Hazmat Containment Kit', category: 'equipment', roleOrType: 'Chemical Hazard Shield', department: 'Fire & Emergency', status: 'available', etaMinutes: 12, icon: '☣️', specs: 'Level A Suits · Neutralizers' },
  { id: 'res-eq-4', name: 'Structural Radar Scanner', category: 'equipment', roleOrType: 'Sub-surface Inspector', department: 'Municipal Corp', status: 'available', etaMinutes: 15, icon: '📡', specs: 'Ground Penetrating Radar' },
];

const statusStyles: Record<ResourceItem['status'], { badge: string; label: string }> = {
  available: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: 'AVAILABLE' },
  deployed: { badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', label: 'DEPLOYED' },
  standby: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'STANDBY' },
  maintenance: { badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', label: 'MAINTENANCE' },
};

const assignmentStatusBadge: Record<FieldAssignment['assignmentStatus'], string> = {
  Pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  Accepted: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'En Route': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  'On Site': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Completed: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
};

// ──────────────────────────────────────────────────────────────
// DRAGGABLE RESOURCE CARD
// ──────────────────────────────────────────────────────────────
const DraggableResourceCard: React.FC<{ item: ResourceItem; onAssignDirectly: (item: ResourceItem) => void }> = ({
  item,
  onAssignDirectly,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style = statusStyles[item.status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-3 rounded-xl border bg-[#050B14] flex flex-col justify-between gap-2 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden',
        isDragging ? 'opacity-40 border-cyan-500 scale-95' : 'border-white/10 hover:border-cyan-500/40'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="cursor-grab text-slate-500 hover:text-cyan-400" {...listeners} {...attributes}>
            <GripVertical className="w-3.5 h-3.5" />
          </span>
          <span className="text-base">{item.icon}</span>
          <div>
            <h5 className="text-[11px] font-bold text-slate-100 group-hover:text-cyan-300 transition leading-snug">
              {item.name}
            </h5>
            <span className="text-[9px] font-mono text-slate-400">{item.roleOrType} · {item.department}</span>
          </div>
        </div>
        <span className={cn('text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border', style.badge)}>
          {style.label}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] font-mono">
        <span className="text-slate-400 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-cyan-400" /> ETA ~{item.etaMinutes} min
        </span>
        <button
          onClick={() => onAssignDirectly(item)}
          className="px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 text-[8px] font-bold transition flex items-center gap-1"
        >
          <Plus className="w-2.5 h-2.5" /> Assign
        </button>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// DROPPABLE TARGET ZONE
// ──────────────────────────────────────────────────────────────
const DroppableTargetZone: React.FC<{ children: React.ReactNode; isOver?: boolean }> = ({ children, isOver }) => {
  const { setNodeRef } = useDroppable({
    id: 'assignment-target-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-4 rounded-xl border-2 border-dashed transition-all duration-200 min-h-[220px]',
        isOver
          ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(6,182,212,0.25)] scale-[1.01]'
          : 'border-white/10 bg-[#050B14]/80'
      )}
    >
      {children}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// RESOURCE ASSIGNMENT CENTER COMPONENT
// ──────────────────────────────────────────────────────────────
export const ResourceAssignmentCenter: React.FC<{ incident: Incident }> = ({ incident }) => {
  const { updateIncident, addToast } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('officer');
  const [activeDragItem, setActiveDragItem] = useState<ResourceItem | null>(null);
  const [assignedResources, setAssignedResources] = useState<
    Array<{
      id: string;
      resourceItem: ResourceItem;
      assignedAt: string;
      status: FieldAssignment['assignmentStatus'];
      eta: string;
    }>
  >([
    {
      id: 'asgn-init-1',
      resourceItem: MASTER_RESOURCES[0], // Officer Ravi Kumar
      assignedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'On Site',
      eta: 'Arrived 5m ago',
    },
    {
      id: 'asgn-init-2',
      resourceItem: MASTER_RESOURCES[5], // Public Works Dept
      assignedAt: new Date(Date.now() - 12 * 60000).toISOString(),
      status: 'En Route',
      eta: '8 min remaining',
    },
  ]);

  // AI Recommendation Resolver based on incident category/severity
  const aiRecommendations = useMemo(() => {
    const recs: ResourceItem[] = [];

    if (incident.category === 'infrastructure' || incident.category === 'urban') {
      recs.push(MASTER_RESOURCES[0], MASTER_RESOURCES[5], MASTER_RESOURCES[9], MASTER_RESOURCES[13]);
    } else if (incident.category === 'water') {
      recs.push(MASTER_RESOURCES[1], MASTER_RESOURCES[6], MASTER_RESOURCES[10], MASTER_RESOURCES[14]);
    } else if (incident.category === 'disaster' || incident.category === 'energy') {
      recs.push(MASTER_RESOURCES[2], MASTER_RESOURCES[7], MASTER_RESOURCES[11], MASTER_RESOURCES[15]);
    } else {
      recs.push(MASTER_RESOURCES[4], MASTER_RESOURCES[8], MASTER_RESOURCES[12]);
    }

    return recs;
  }, [incident]);

  // Handle direct assignment
  const handleAssignResource = (item: ResourceItem) => {
    if (assignedResources.some((a) => a.resourceItem.id === item.id)) {
      addToast({ title: 'Resource Already Assigned', message: `${item.name} is already assigned to ${incident.id}.`, type: 'warning' });
      return;
    }

    const newAssignment = {
      id: `asgn-${Date.now()}`,
      resourceItem: item,
      assignedAt: new Date().toISOString(),
      status: 'En Route' as const,
      eta: `${item.etaMinutes} min`,
    };

    setAssignedResources((prev) => [newAssignment, ...prev]);

    // Synchronize to Zustand SSOT
    if (item.category === 'officer') {
      assignOfficer({
        incidentId: incident.id,
        officerId: item.id,
        officerName: item.name,
        departmentId: item.department,
        departmentName: item.department,
        unitId: 'unit-alpha',
        unitName: 'Unit Alpha',
        role: 'Field Officer',
        estimatedArrival: new Date(Date.now() + item.etaMinutes * 60000),
      });
    } else if (item.category === 'department') {
      assignDepartment(incident.id, item.id, item.name);
    } else {
      updateIncident(incident.id, {
        status: 'assigned',
        assignedTo: item.name,
      });
      logAuditEvent({
        incidentId: incident.id,
        event: 'RESOURCE_ASSIGNED',
        actor: 'Control Room Dispatcher',
        details: `Assigned ${item.category.toUpperCase()}: ${item.name} to ${incident.id}`,
      });
    }

    addToast({
      title: 'Resource Dispatched',
      message: `Assigned ${item.name} (${item.roleOrType}) to incident ${incident.id}.`,
      type: 'success',
    });
  };

  // 1-Click Auto-Deploy AI Recommendation
  const handleDeployAIRecommendations = () => {
    aiRecommendations.forEach((rec) => {
      if (!assignedResources.some((a) => a.resourceItem.id === rec.id)) {
        handleAssignResource(rec);
      }
    });

    addToast({
      title: 'AI Recommendation Bundle Deployed',
      message: `Auto-dispatched ${aiRecommendations.length} optimal resources for ${incident.title}.`,
      type: 'success',
    });
  };

  // Remove assignment
  const handleRemoveAssignment = (id: string, name: string) => {
    setAssignedResources((prev) => prev.filter((a) => a.id !== id));
    logAuditEvent({
      incidentId: incident.id,
      event: 'RESOURCE_REVOKED',
      actor: 'Control Room Dispatcher',
      details: `Revoked assignment for ${name} from incident ${incident.id}`,
    });
    addToast({ title: 'Assignment Revoked', message: `Removed ${name} from incident ${incident.id}.`, type: 'info' });
  };

  // Update Assignment Status
  const handleUpdateAssignmentStatus = (id: string, status: FieldAssignment['assignmentStatus']) => {
    setAssignedResources((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    addToast({ title: 'Status Updated', message: `Assignment status updated to ${status.toUpperCase()}.`, type: 'info' });
  };

  // Drag Handlers
  const handleDragStart = (e: any) => {
    const item = e.active.data.current?.item as ResourceItem;
    if (item) setActiveDragItem(item);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragItem(null);
    if (e.over && e.over.id === 'assignment-target-zone' && activeDragItem) {
      handleAssignResource(activeDragItem);
    }
  };

  const filteredInventory = useMemo(() => {
    return MASTER_RESOURCES.filter((r) => r.category === activeCategory);
  }, [activeCategory]);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6 text-slate-200 font-mono">
        {/* ── 1. AI RECOMMENDATION BANNER ── */}
        <Card className="p-4 bg-[#0A1220]/95 border-purple-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  <span>AI Smart Resource Dispatch Engine</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    94.8% MATCH SCORE
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  Recommended resource bundle for <strong>{incident.category.toUpperCase()}</strong> hazard at{' '}
                  <strong>{incident.location?.name || 'Vijayawada'}</strong>
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDeployAIRecommendations}
              className="text-[10px] bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold"
            >
              <Zap className="w-3.5 h-3.5 mr-1" /> Auto-Deploy AI Bundle ({aiRecommendations.length} Items)
            </Button>
          </div>

          {/* AI Recommended Resource Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/10 relative z-10 text-[10px]">
            {aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => handleAssignResource(rec)}
                className="p-2 rounded-xl bg-[#050B14] border border-purple-500/20 hover:border-purple-400 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{rec.icon}</span>
                  <span className="font-bold text-slate-200 group-hover:text-purple-300 truncate">{rec.name}</span>
                </div>
                <span className="text-[9px] text-purple-400 font-bold ml-1">+</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 2. TWO-COLUMN LAYOUT: INVENTORY & DISPATCH TARGET ZONE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── LEFT COLUMN: MASTER RESOURCE INVENTORY ── */}
          <Card className="p-4 bg-[#0A1220]/95 border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                    Master Resource Directory
                  </h4>
                </div>
                <span className="text-[9px] text-slate-500">Drag item or tap + Assign</span>
              </div>

              {/* Category Selector Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#050B14] border border-white/10 mb-3 text-[10px]">
                {(['officer', 'department', 'vehicle', 'equipment'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'py-1.5 rounded-lg font-bold capitalize transition flex items-center justify-center gap-1',
                      activeCategory === cat
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {cat === 'officer' && <Users className="w-3 h-3" />}
                    {cat === 'department' && <Building2 className="w-3 h-3" />}
                    {cat === 'vehicle' && <Truck className="w-3 h-3" />}
                    {cat === 'equipment' && <Wrench className="w-3 h-3" />}
                    <span>{cat}s</span>
                  </button>
                ))}
              </div>

              {/* Draggable Inventory List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredInventory.map((item) => (
                  <DraggableResourceCard key={item.id} item={item} onAssignDirectly={handleAssignResource} />
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-white/10 text-[9px] text-slate-500 flex justify-between">
              <span>Showing {filteredInventory.length} available {activeCategory}s</span>
              <span className="text-emerald-400 font-bold">READY FOR DISPATCH</span>
            </div>
          </Card>

          {/* ── RIGHT COLUMN: ACTIVE DISPATCH TARGET ZONE & ASSIGNMENTS ── */}
          <Card className="p-4 bg-[#0A1220]/95 border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                    <span>Active Incident Dispatch Ledger</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/30">
                      {assignedResources.length} DISPATCHED
                    </span>
                  </h4>
                </div>
              </div>

              {/* Drop Target Zone */}
              <DroppableTargetZone>
                <div className="space-y-2">
                  {assignedResources.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-[#070D18] border border-cyan-500/30 flex items-center justify-between gap-2 hover:border-cyan-400 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl">{a.resourceItem.icon}</span>
                        <div className="min-w-0">
                          <h5 className="text-[11px] font-bold text-slate-100 truncate">{a.resourceItem.name}</h5>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400">
                            <span>{a.resourceItem.roleOrType}</span>
                            <span>·</span>
                            <span className="text-cyan-400">ETA: {a.eta}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Stepper & Remove */}
                      <div className="flex items-center gap-2">
                        <select
                          value={a.status}
                          onChange={(e) =>
                            handleUpdateAssignmentStatus(a.id, e.target.value as FieldAssignment['assignmentStatus'])
                          }
                          className={cn(
                            'text-[9px] font-bold px-2 py-1 rounded border outline-none cursor-pointer bg-[#050B14]',
                            assignmentStatusBadge[a.status]
                          )}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="En Route">En Route</option>
                          <option value="On Site">On Site</option>
                          <option value="Completed">Completed</option>
                        </select>

                        <button
                          onClick={() => handleRemoveAssignment(a.id, a.resourceItem.name)}
                          className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          title="Revoke Assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {assignedResources.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
                      <ShieldCheck className="w-8 h-8 text-slate-600 animate-pulse" />
                      <span>Drag resources here or tap + Assign from left inventory</span>
                    </div>
                  )}
                </div>
              </DroppableTargetZone>
            </div>

            {/* ── 3. ASSIGNMENT HISTORY AUDIT TRAIL ── */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <History className="w-3 h-3 text-indigo-400" /> Dispatch Audit History
              </h5>
              <div className="space-y-1.5 text-[9px] text-slate-400">
                {assignedResources.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 rounded bg-[#050B14] border border-white/5">
                    <span>
                      Dispatched <strong className="text-slate-200">{a.resourceItem.name}</strong> ({a.resourceItem.roleOrType})
                    </span>
                    <span className="text-cyan-400 font-bold">{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Drag Overlay Preview */}
      <DragOverlay>
        {activeDragItem ? (
          <div className="p-3 rounded-xl border border-cyan-400 bg-cyan-950/90 text-slate-100 shadow-2xl flex items-center gap-2">
            <span className="text-lg">{activeDragItem.icon}</span>
            <span className="font-bold text-xs">{activeDragItem.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ResourceAssignmentCenter;
