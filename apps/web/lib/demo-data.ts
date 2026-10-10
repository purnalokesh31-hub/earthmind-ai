export const DEMO_CASES = [
  {
    case_id: 'EM-208',
    title: 'Severe Road Subsidence — NH-9 Junction',
    domain: 'Infrastructure',
    category: 'Roadways',
    severity: 'critical',
    status: 'In Progress',
    location_name: 'Ward 12, Benz Circle',
    latitude: 16.5062,
    longitude: 80.6480,
    date: new Date().toISOString(),
    description: 'A 4-foot deep sinkhole has opened up on the main junction causing massive traffic disruption and posing a hazard to heavy vehicles.',
    ai_summary: 'Visual analysis indicates a 4-foot deep structural collapse likely caused by underlying water pipe burst. High risk of further subsidence.',
    earth_score_delta: 2.5,
    lifecycle: [
      { stage: 'Reported', time: '09:12 AM', detail: 'Citizen uploaded image via mobile app.' },
      { stage: 'AI Analysis', time: '09:13 AM', detail: 'AI identified structural collapse (Critical).' },
      { stage: 'Assigned', time: '09:15 AM', detail: 'Assigned to Public Works Department (Team Alpha).' },
      { stage: 'In Progress', time: '09:45 AM', detail: 'Team arrived. Barricades deployed. Excavation started.' },
    ],
    assigned_officer: 'Ravi Kumar (PWD)',
    estimated_repair_cost: '₹1,50,000'
  },
  {
    case_id: 'EM-209',
    title: 'Contaminated Water Supply — Sector 4',
    domain: 'Water',
    category: 'Public Health',
    severity: 'high',
    status: 'Assigned',
    location_name: 'Zone B, Sector 4',
    latitude: 16.5122,
    longitude: 80.6234,
    date: new Date(Date.now() - 3600000).toISOString(),
    description: 'Residents reporting foul-smelling, yellowish water from municipal taps for the last 12 hours.',
    ai_summary: 'NLP analysis of 42 citizen reports confirms localized contamination in Sector 4. Probable sewage line intersection.',
    earth_score_delta: 1.8,
    lifecycle: [
      { stage: 'Reported', time: '08:00 AM', detail: '42 overlapping citizen complaints received.' },
      { stage: 'AI Analysis', time: '08:05 AM', detail: 'Cross-referenced reports to pinpoint contamination source.' },
      { stage: 'Assigned', time: '08:15 AM', detail: 'Assigned to Water Supply Board.' },
    ],
    assigned_officer: 'Sita Ram (Water Board)',
    estimated_repair_cost: '₹45,000'
  },
  {
    case_id: 'EM-210',
    title: 'Illegal Deforestation — Riverside',
    domain: 'Environment',
    category: 'Wildlife & Ecology',
    severity: 'medium',
    status: 'Resolved',
    location_name: 'Ward 7, Krishna River Bank',
    latitude: 16.5244,
    longitude: 80.6120,
    date: new Date(Date.now() - 86400000).toISOString(),
    description: 'Satellite imagery detected a 15% reduction in canopy cover over the last 48 hours.',
    ai_summary: 'Computer vision analysis of Sentinel-2 data confirms 1.2 acres of unauthorized clearing.',
    earth_score_delta: 0.5,
    lifecycle: [
      { stage: 'Reported', time: 'Yesterday 10:00 AM', detail: 'Automated satellite scan flagged anomaly.' },
      { stage: 'AI Analysis', time: 'Yesterday 10:05 AM', detail: 'Confirmed canopy loss. Alerted Forest Dept.' },
      { stage: 'Assigned', time: 'Yesterday 10:30 AM', detail: 'Forest Rangers dispatched.' },
      { stage: 'In Progress', time: 'Yesterday 11:45 AM', detail: 'Equipment seized, perpetrators detained.' },
      { stage: 'Resolved', time: 'Yesterday 04:00 PM', detail: 'Area secured. Afforestation penalty levied.' },
    ],
    assigned_officer: 'Forest Ranger Unit 3',
    estimated_repair_cost: '₹0 (Penalty Recovered)'
  },
  {
    case_id: 'EM-211',
    title: 'Pest Infestation & Crop Blight Anomaly',
    domain: 'Agriculture',
    category: 'Crop Disease',
    severity: 'high',
    status: 'In Progress',
    location_name: 'Ward 14, Agricultural Zone',
    latitude: 16.5310,
    longitude: 80.6550,
    date: new Date(Date.now() - 7200000).toISOString(),
    description: 'Multi-spectral drone scan detected rapid fungal blight spreading across 12 paddy fields.',
    ai_summary: 'Spectral NDVI index dropped by 28%. AI recommends targeted organic fungicide spraying within 24 hours.',
    earth_score_delta: 1.5,
    lifecycle: [
      { stage: 'Reported', time: '07:30 AM', detail: 'Agricultural drone scan flagged NDVI anomaly.' },
      { stage: 'AI Analysis', time: '07:35 AM', detail: 'Diagnosed early-stage Blast Fungus.' },
      { stage: 'Assigned', time: '08:00 AM', detail: 'Assigned to Agricultural Advisory Squad.' },
    ],
    assigned_officer: 'Dr. M. Swaminathan (Agri Board)',
    estimated_repair_cost: '₹28,000'
  },
  {
    case_id: 'EM-212',
    title: 'Flash Flood Hazard & River Inundation Alert',
    domain: 'Disaster',
    category: 'Flood Risk',
    severity: 'critical',
    status: 'In Progress',
    location_name: 'Ward 3, Low-Lying Krishna Basin',
    latitude: 16.5011,
    longitude: 80.6355,
    date: new Date(Date.now() - 1800000).toISOString(),
    description: 'Upstream barrage discharge increased water levels by 1.8 meters. Risk of inundation for 350 households.',
    ai_summary: 'Hydrodynamic model predicts peak water crest in 3 hours. Immediate evacuation advisory dispatched.',
    earth_score_delta: 3.2,
    lifecycle: [
      { stage: 'Reported', time: '10:15 AM', detail: 'Barrage telemetry trigger surpassed safety threshold.' },
      { stage: 'AI Analysis', time: '10:18 AM', detail: 'Flood inundation model mapped high-risk zones.' },
      { stage: 'Assigned', time: '10:20 AM', detail: 'Disaster Response Force (SDRF Team 2) deployed.' },
    ],
    assigned_officer: 'SDRF Commander Rao',
    estimated_repair_cost: '₹2,10,000'
  },
  {
    case_id: 'EM-213',
    title: 'Transformer Thermal Overheat & Grid Overload',
    domain: 'Energy',
    category: 'Power Grid',
    severity: 'high',
    status: 'Assigned',
    location_name: 'Industrial Zone Substation 4',
    latitude: 16.4980,
    longitude: 80.6620,
    date: new Date(Date.now() - 5400000).toISOString(),
    description: 'Thermal camera telemetry detected 115°C core temperature on 33kV main transformer.',
    ai_summary: 'Causal engine identified oil coolant pump failure. Risk of blackout for 12,000 connections.',
    earth_score_delta: 1.6,
    lifecycle: [
      { stage: 'Reported', time: '08:45 AM', detail: 'Substation SCADA sensor alert triggered.' },
      { stage: 'AI Analysis', time: '08:50 AM', detail: 'Coolant circulation blockage confirmed.' },
      { stage: 'Assigned', time: '09:00 AM', detail: 'Assigned to APTransco Emergency Crew.' },
    ],
    assigned_officer: 'K. Venkatesh (Electrical Lead)',
    estimated_repair_cost: '₹65,000'
  },
  {
    case_id: 'EM-214',
    title: 'Urban Heat Island Spike & Microclimate Surge',
    domain: 'Climate',
    category: 'Heat Anomaly',
    severity: 'medium',
    status: 'In Progress',
    location_name: 'Ward 8, Central Commercial Hub',
    latitude: 16.5150,
    longitude: 80.6410,
    date: new Date(Date.now() - 14400000).toISOString(),
    description: 'Surface land temperature reached 46°C due to dense concrete cover and low shade tree density.',
    ai_summary: 'Thermal satellite overlay recommends deploying cool misting stations and green roof incentives.',
    earth_score_delta: 0.8,
    lifecycle: [
      { stage: 'Reported', time: 'Yesterday 02:00 PM', detail: 'Landsat 9 thermal thermal band anomaly.' },
      { stage: 'AI Analysis', time: 'Yesterday 02:10 PM', detail: 'Urban heat island intensity index +4.2°C.' },
    ],
    assigned_officer: 'Climate Resiliency Cell',
    estimated_repair_cost: '₹50,000'
  },
  {
    case_id: 'EM-215',
    title: 'Smart Waste Bin Overflow & Traffic Bottleneck',
    domain: 'Urban',
    category: 'Sanitation & Traffic',
    severity: 'medium',
    status: 'Assigned',
    location_name: 'Ward 5, Market Main Road',
    latitude: 16.5210,
    longitude: 80.6290,
    date: new Date(Date.now() - 10800000).toISOString(),
    description: 'Ultrasound sensor reported 98% bin capacity spillover encroaching onto active traffic lane.',
    ai_summary: 'Route optimization algorithm dispatched waste compactor unit #14 for immediate clearance.',
    earth_score_delta: 0.6,
    lifecycle: [
      { stage: 'Reported', time: '06:30 AM', detail: 'IoT sensor overflow alert.' },
      { stage: 'Assigned', time: '06:45 AM', detail: 'Municipal Sanitation Truck #14 dispatched.' },
    ],
    assigned_officer: 'Sanitation Inspector Naidu',
    estimated_repair_cost: '₹12,000'
  },
  {
    case_id: 'EM-216',
    title: 'Wildlife Corridor Encroachment & Trap Warning',
    domain: 'Wildlife',
    category: 'Corridor Security',
    severity: 'high',
    status: 'In Progress',
    location_name: 'Forest Fringe Reserve, Sector 9',
    latitude: 16.5410,
    longitude: 80.6710,
    date: new Date(Date.now() - 21600000).toISOString(),
    description: 'Acoustic monitoring sensors detected wire snare trap activity near elephant movement corridor.',
    ai_summary: 'Audio pattern recognition confirmed illegal snare placement with 96% confidence. Patrol team deployed.',
    earth_score_delta: 1.4,
    lifecycle: [
      { stage: 'Reported', time: '04:15 AM', detail: 'Acoustic sensor grid alert.' },
      { stage: 'AI Analysis', time: '04:18 AM', detail: 'Identified metallic tension acoustic signature.' },
      { stage: 'In Progress', time: '05:00 AM', detail: 'Anti-Poaching Squad clearing perimeter.' },
    ],
    assigned_officer: 'Anti-Poaching Squad Alpha',
    estimated_repair_cost: '₹15,000'
  }
];

export const DEMO_CHAT_MESSAGES = [
  { sender: 'copilot' as const, text: "EarthMind PIOS v3 initialized in Demo Mode. I have preloaded active incidents and analytics for your presentation. How would you like to begin?" }
];

import { Home, AlertTriangle, Map, BarChart2, Cpu, FileText, Settings } from 'lucide-react';
import React from 'react';

export const DEMO_INCIDENTS: any[] = DEMO_CASES.map(c => ({
  id: c.case_id,
  title: c.title,
  description: c.description || c.ai_summary,
  category: (c.domain || 'infrastructure').toLowerCase(),
  severity: c.severity,
  status: c.status === 'In Progress' ? 'in_progress' : c.status.toLowerCase(),
  location: {
    lat: c.latitude,
    lng: c.longitude,
    name: c.location_name || 'Vijayawada',
    ward: 'Ward 12',
    zone: 'Zone A'
  },
  reportedBy: c.assigned_officer || 'Officer Lokesh',
  reportedAt: c.date || new Date().toISOString(),
  updatedAt: c.date || new Date().toISOString(),
  timeline: (c.lifecycle || []).map((l: any, i: number) => ({
    id: `t-${i}`,
    timestamp: l.time || '10:00 AM',
    event: `${l.stage}: ${l.detail}`,
    icon: i === 0 ? '📱' : i === 1 ? '🤖' : '👷',
    actor: c.assigned_officer
  })),
  aiAnalysis: {
    confidence: 91,
    classification: c.category || c.domain,
    severity: c.severity,
    summary: c.ai_summary,
    recommendations: ['Deploy field unit', 'Assess structural impact', 'Issue advisory']
  }
}));

export const DEMO_USERS: any[] = [
  {
    id: 'usr_1',
    name: 'Dr. Aris Thorne',
    email: 'athorne@earthmind.gov.in',
    role: 'Administrator',
    department: 'Command Center',
    organization: 'EarthMind',
    region: 'Global'
  }
];

export const DEMO_NOTIFICATIONS: any[] = [
  { id: 'n1', title: 'Critical Alert', message: 'High heat anomaly detected in Sector 7G', timestamp: '2m ago', type: 'critical', read: false },
  { id: 'n2', title: 'Update', message: 'Field Team Alpha has reached coordinates', timestamp: '15m ago', type: 'info', read: true },
  { id: 'n3', title: 'System', message: 'Satellite telemetry synced successfully', timestamp: '1h ago', type: 'success', read: true }
];

export const AI_RECOMMENDATIONS: any[] = [
  { id: 'r1', text: 'Deploy drone surveillance to investigate thermal anomaly.', type: 'action', confidence: 94, icon: '🚁' },
  { id: 'r2', text: 'Correlate with local weather patterns for fire risk.', type: 'analysis', confidence: 88, icon: '🌦️' },
  { id: 'r3', text: 'Alert local fire authorities as precaution.', type: 'alert', confidence: 75, icon: '🚨' }
];

export const NAV_ITEMS: any[] = [
  { id: 'home', label: 'Command Center', icon: '🏠' },
  { id: 'incidents', label: 'Incidents', icon: '🚨' },
  { id: 'evidence', label: 'Evidence AI', icon: '👁️' },
  { id: 'cv-studio', label: 'Vision Studio', icon: '⚡' },
  { id: 'map', label: 'Live Map', icon: '🗺️' },
  { id: 'insights', label: 'Insights', icon: '📊' },
  { id: 'audit', label: 'Audit Ledger', icon: '🛡️' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  { id: 'reports', label: 'Reports', icon: '📄' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

export const HEALTH_SCORES: any[] = [
  { label: 'Forest', icon: '🌲', score: 82, color: 'bg-emerald-500' },
  { label: 'Water', icon: '💧', score: 94, color: 'bg-blue-500' },
  { label: 'Air', icon: '💨', score: 76, color: 'bg-yellow-500' },
  { label: 'Energy', icon: '⚡', score: 88, color: 'bg-orange-500' },
  { label: 'Urban', icon: '🏢', score: 91, color: 'bg-slate-400' }
];


export const calculateStats = (cases: any[] = []) => {
  if (!cases || cases.length === 0) {
    return { active: 0, critical: 0, resolved: 0, phi: 100.0 };
  }
  
  const active = cases.filter(c => c.status !== 'resolved' && c.status !== 'archived').length;
  const critical = cases.filter(c => c.severity === 'critical' && c.status !== 'resolved').length;
  const resolved = cases.filter(c => c.status === 'resolved').length;
  
  let phiScore = 100.0;
  cases.forEach(c => {
    if (c.status !== 'resolved' && c.status !== 'archived') {
       if (c.severity === 'critical') phiScore -= 2.5;
       else if (c.severity === 'high') phiScore -= 1.2;
       else if (c.severity === 'medium') phiScore -= 0.5;
       else phiScore -= 0.1;
    }
  });
  
  return {
    active,
    critical,
    resolved,
    phi: Math.max(Number(phiScore.toFixed(1)), 10)
  };
};

export const generateInsights = (cases: any[]) => {
  const stats = calculateStats(cases);
  return {
    Overview: [
      { label: 'Total Incidents', icon: '🌍', value: cases.length.toString(), trend: '+12% this week', up: true },
      { label: 'Critical Threats', icon: '🚨', value: stats.critical.toString(), trend: '-2 since yesterday', up: true },
      { label: 'Avg Resolution', icon: '⏱️', value: '4.2 hrs', trend: '-15% response time', up: true },
      { label: 'AI Accuracy', icon: '🧠', value: '98.5%', trend: 'Steady', up: true }
    ],
    Infrastructure: [
      { label: 'Road Damage', icon: '🛣️', value: cases.filter(c => c.domain === 'infrastructure' || c.category === 'infrastructure').length.toString(), trend: '+5% this week', up: false },
      { label: 'Repair Cost Est.', icon: '💰', value: '₹1.2L', trend: 'Under budget', up: true }
    ],
    Water: [
      { label: 'Leaks Detected', icon: '💧', value: cases.filter(c => c.domain === 'water' || c.category === 'water').length.toString(), trend: '-10% this week', up: true },
      { label: 'Water Saved', icon: '🌊', value: '45k Liters', trend: 'Optimal', up: true }
    ],
    Climate: [
      { label: 'Flood Risks', icon: '🌧️', value: '2', trend: 'Warning active', up: false },
      { label: 'Heat Stress', icon: '☀️', value: 'Moderate', trend: 'Cooling down', up: true }
    ],
    Energy: [
      { label: 'Grid Faults', icon: '⚡', value: cases.filter(c => c.domain === 'energy' || c.category === 'energy').length.toString(), trend: '-2% this week', up: true },
      { label: 'Efficiency Drop', icon: '📉', value: '1.2%', trend: 'Stable', up: true }
    ],
    Environment: [
      { label: 'Pollution Spikes', icon: '🌫️', value: '1', trend: 'AQI 110 (Moderate)', up: true },
      { label: 'Tree Coverage', icon: '🌲', value: '42%', trend: 'No change', up: true }
    ]
  };
};


export const INSIGHT_TABS = ['Overview', 'Infrastructure', 'Water', 'Climate', 'Energy', 'Environment'] as const;
export type InsightTab = typeof INSIGHT_TABS[number];

export const REPORT_TEMPLATES = [
  { id: 'incident-summary', label: 'Incident Summary Report', icon: '📋', description: 'Comprehensive single-case operational breakdown & status.', frequency: 'daily' as const },
  { id: 'technical-report', label: 'Technical Infrastructure Report', icon: '⚙️', description: 'Engineering telematics, valve pressures & radar scans.', frequency: 'daily' as const },
  { id: 'exec-brief', label: 'Executive Intelligence Brief', icon: '📊', description: 'C-Suite high-level planetary health scores and SLA forecasts.', frequency: 'weekly' as const },
  { id: 'department-report', label: 'Department Division Audit', icon: '🏢', description: 'Cross-agency dispatch workload and SLA completion rates.', frequency: 'weekly' as const },
  { id: 'evidence-report', label: 'Multimodal Evidence Dossier', icon: '📷', description: 'FLIR 4K thermal clips, SHA-256 hashes & GPS telematics.', frequency: 'emergency' as const },
  { id: 'timeline-report', label: 'ISO-27001 Timeline Audit', icon: '⏳', description: 'Cryptographically sealed 8-stage lifecycle event trail.', frequency: 'daily' as const },
  { id: 'regional-report', label: 'Regional Hazard Intelligence', icon: '🗺️', description: 'Multi-sector hazard risk clusters & regional GIS audit.', frequency: 'monthly' as const },
];

