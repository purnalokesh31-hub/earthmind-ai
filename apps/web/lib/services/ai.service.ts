// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Service
// ──────────────────────────────────────────────────────────────
// Centralized AI analysis interface. Currently mock‑based.
// Future: connects to EarthMind Vision Engine, YOLO, LLMs.
// ──────────────────────────────────────────────────────────────

import type {
  Incident,
  AIAnalysis,
  RiskAssessment,
  EarthImpactMetrics,
  Category,
  Severity,
  EvidenceItem,
  AIVisionAnalysis,
} from '../../types';

// ── Mock delay ──
const mockDelay = (ms = 200): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

// ──────────────────────────────────────────────────────────────
// 1. Full Incident Analysis Pipeline
// ──────────────────────────────────────────────────────────────

export interface AIAnalysisPipelineResult {
  analysis: AIAnalysis;
  risk: RiskAssessment;
  earthImpact: EarthImpactMetrics;
  processingTimeMs: number;
}

export async function runFullAnalysis(
  incident: Incident,
): Promise<AIAnalysisPipelineResult> {
  const start = Date.now();
  await mockDelay(500); // simulate AI processing

  const analysis = generateMockAnalysis(incident);
  const risk = generateMockRisk(incident);
  const earthImpact = generateMockEarthImpact(incident);

  return {
    analysis,
    risk,
    earthImpact,
    processingTimeMs: Date.now() - start,
  };
}

// ──────────────────────────────────────────────────────────────
// 2. Individual AI Capabilities & Multi-Modal Vision Engine
// ──────────────────────────────────────────────────────────────

function inferModelTaskFromEvidence(evidence: EvidenceItem): string {
  const name = (evidence.name || '').toLowerCase();
  if (name.includes('flood') || name.includes('waterlog') || name.includes('inundat') || name.includes('rain')) return 'flood';
  if (name.includes('garbage') || name.includes('waste') || name.includes('trash') || name.includes('litter')) return 'garbage';
  if (name.includes('dump') || name.includes('debris') || name.includes('scrap')) return 'illegal_dumping';
  if (name.includes('fire') || name.includes('smoke') || name.includes('flame') || name.includes('burn')) return 'fire';
  if (name.includes('tree') || name.includes('canopy') || name.includes('branch') || name.includes('arbor')) return 'tree_damage';
  if (name.includes('crop') || name.includes('blight') || name.includes('farm') || name.includes('leaf') || name.includes('plant')) return 'crop_disease';
  if (name.includes('leak') || name.includes('pipe') || name.includes('hydro') || name.includes('sewage')) return 'water_leakage';
  if (name.includes('pole') || name.includes('wire') || name.includes('electric') || name.includes('transformer')) return 'electric_pole_damage';
  if (name.includes('building') || name.includes('wall') || name.includes('masonry') || name.includes('facade') || name.includes('struct')) return 'building_damage';
  return 'road_damage';
}

export async function runVisionInference(evidence: EvidenceItem): Promise<AIVisionAnalysis> {
  const start = Date.now();
  const modelTask = inferModelTaskFromEvidence(evidence);

  // Try calling real vision analysis API if running on client and evidence has an ID
  if (typeof window !== 'undefined' && evidence.id && evidence.type === 'image') {
    try {
      const res = await fetch('/api/v1/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceId: evidence.id,
          modelTask,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d = json.data;
          const boxes = (d.boundingBoxes || []).map((b: any, idx: number) => ({
            id: b.id || `bbox-${idx + 1}`,
            label: b.label || 'Detected Hazard',
            confidence: Number(b.confidence ? (b.confidence > 1 ? b.confidence : (b.confidence * 100).toFixed(1)) : 85),
            severity: (b.severity || (d.riskAssessment?.severityCategory?.toLowerCase()) || 'medium') as any,
            x: Math.round(b.xMin !== undefined ? (b.xMin > 1 ? b.xMin : b.xMin * 100) : (b.x ?? 20)),
            y: Math.round(b.yMin !== undefined ? (b.yMin > 1 ? b.yMin : b.yMin * 100) : (b.y ?? 20)),
            width: Math.round(b.xMax !== undefined && b.xMin !== undefined ? (b.xMax > 1 ? b.xMax - b.xMin : (b.xMax - b.xMin) * 100) : (b.width ?? 40)),
            height: Math.round(b.yMax !== undefined && b.yMin !== undefined ? (b.yMax > 1 ? b.yMax - b.yMin : (b.yMax - b.yMin) * 100) : (b.height ?? 35)),
          }));

          const objectsDetected = boxes.length > 0
            ? boxes.map((b: any) => b.label)
            : (d.detectedObjects || ['Infrastructure Hazard']);

          return {
            objectsDetected,
            overallConfidence: boxes.length > 0
              ? Math.round(boxes.reduce((acc: number, cur: any) => acc + Number(cur.confidence), 0) / boxes.length)
              : (d.confidenceScore || 90),
            damageScore: d.riskAssessment?.riskScore ?? (d.damageScore || 75),
            classification: d.damageType || (d.taskLabel ? d.taskLabel.replace(/_/g, ' ').toUpperCase() : 'Critical Infrastructure Deformation'),
            recommendedDepartment: d.riskAssessment?.recommendedDepartment || d.suggestedDepartment || 'Public Works Department',
            processingTimeMs: d.processingTimeMs || (Date.now() - start),
            boundingBoxes: boxes,
          };
        }
      }
    } catch {
      // Clean fallback to simulated baseline
    }
  }

  await mockDelay(400);

  if (evidence.type === 'image') {
    return {
      objectsDetected: ['Pothole Subsurface Breach', 'High-Pressure Main Crack', 'Debris Accumulation', 'Structural Shift'],
      overallConfidence: 96.4,
      damageScore: 84.5,
      classification: 'Critical Infrastructure Deformation',
      recommendedDepartment: 'Public Works Department',
      processingTimeMs: Date.now() - start,
      boundingBoxes: [
        {
          id: 'bbox-1',
          label: 'Primary Road Surface Subsidence',
          confidence: 97.2,
          severity: 'critical',
          x: 18,
          y: 22,
          width: 44,
          height: 38,
        },
        {
          id: 'bbox-2',
          label: 'Cast-Iron Water Main Shearing',
          confidence: 94.8,
          severity: 'high',
          x: 52,
          y: 48,
          width: 32,
          height: 28,
        },
        {
          id: 'bbox-3',
          label: 'Debris Hazard Zone',
          confidence: 88.5,
          severity: 'medium',
          x: 8,
          y: 65,
          width: 25,
          height: 20,
        },
      ],
    };
  } else if (evidence.type === 'video') {
    return {
      objectsDetected: ['Fluid Surge Flow', 'Thermal Anomaly', 'Structural Vibration', 'Traffic Bottleneck'],
      overallConfidence: 93.8,
      damageScore: 78.0,
      classification: 'Hydraulic Surge & Optical Anomaly',
      recommendedDepartment: 'Urban Hydro Division',
      processingTimeMs: Date.now() - start,
      keyframes: ['Frame #042: Initial Leak Spike', 'Frame #128: Pressure Peak', 'Frame #240: Spill Mitigation'],
      boundingBoxes: [
        {
          id: 'bbox-v1',
          label: 'Hydro Burst Velocity Vector',
          confidence: 95.1,
          severity: 'high',
          x: 25,
          y: 30,
          width: 50,
          height: 45,
        },
      ],
    };
  } else if (evidence.type === 'document') {
    return {
      objectsDetected: ['Intake Form #208', 'Geo-Coordinates Tag', 'Citizen Complaint Log', 'Inspector Sign-off'],
      overallConfidence: 98.1,
      damageScore: 65.0,
      classification: 'Municipal Inspector Assessment Report',
      recommendedDepartment: 'Municipal Safety Board',
      ocrText: `SURFACE SUBSIDENCE INCIDENT INTAKE REPORT\nDate: Aug 5, 2026\nLocation: Benz Circle, Ward 12\nObserved 300mm pipe fatigue with active groundwater seepage. Priority Level: HIGH.`,
      processingTimeMs: Date.now() - start,
      boundingBoxes: [
        {
          id: 'bbox-d1',
          label: 'Case Number & Geo Tag',
          confidence: 99.0,
          severity: 'low',
          x: 10,
          y: 10,
          width: 80,
          height: 20,
        },
      ],
    };
  } else {
    return {
      objectsDetected: ['Piezometer Pressure Drop', 'Seismic Vibration Spike', 'Flow Rate Anomaly'],
      overallConfidence: 97.5,
      damageScore: 91.0,
      classification: 'Hydro-Piezometric Pressure Collapse',
      recommendedDepartment: 'Disaster Emergency Grid',
      sensorTelemetry: {
        pressurePsi: 14.2,
        normalPsi: 65.0,
        flowLpm: 450,
        seismicHz: 12.4,
      },
      processingTimeMs: Date.now() - start,
      boundingBoxes: [],
    };
  }
}

export async function analyzeImage(imageUrl: string): Promise<{
  objects: string[];
  confidence: number;
  damageDetected: boolean;
  classification: string;
}> {
  await mockDelay(400);
  return {
    objects: ['road_crack', 'pothole', 'vehicle', 'debris'],
    confidence: 87 + Math.floor(Math.random() * 10),
    damageDetected: true,
    classification: 'infrastructure_damage',
  };
}

export async function analyzeText(text: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  entities: string[];
  suggestedCategory: Category;
  suggestedSeverity: Severity;
}> {
  await mockDelay(200);

  const urgentWords = ['emergency', 'urgent', 'critical', 'danger', 'hazard', 'fire', 'flood'];
  const isUrgent = urgentWords.some((w) => text.toLowerCase().includes(w));

  return {
    sentiment: isUrgent ? 'urgent' : 'negative',
    entities: extractMockEntities(text),
    suggestedCategory: 'infrastructure',
    suggestedSeverity: isUrgent ? 'critical' : 'medium',
  };
}

export async function classifyIncident(
  incident: Incident,
): Promise<{
  primaryCategory: Category;
  secondaryCategories: Category[];
  confidence: number;
}> {
  await mockDelay(150);
  return {
    primaryCategory: incident.category,
    secondaryCategories: getRelatedCategories(incident.category),
    confidence: 82 + Math.floor(Math.random() * 15),
  };
}

export async function generateSummary(incident: Incident): Promise<string> {
  await mockDelay(300);

  const templates: Record<Category, string> = {
    infrastructure: `AI analysis confirms ${incident.severity} infrastructure damage at ${incident.location.name}. Structural assessment indicates immediate attention required. Estimated repair timeline: 3–7 days.`,
    agriculture: `Crop health analysis at ${incident.location.name} reveals ${incident.severity} impact. Soil and vegetation indices suggest intervention within 48 hours to prevent further losses.`,
    water: `Water quality anomaly detected near ${incident.location.name}. Contamination probability is high based on multi‑sensor fusion. Public advisory recommended.`,
    energy: `Power grid disruption detected at ${incident.location.name}. Fault isolation analysis suggests ${incident.severity} impact on downstream distribution.`,
    climate: `Climate event detected near ${incident.location.name}. Meteorological analysis indicates ${incident.severity} severity. Early warning advisory issued.`,
    environment: `Environmental violation detected at ${incident.location.name}. Satellite imagery confirms unauthorized activity with ${incident.severity} ecological impact.`,
    wildlife: `Wildlife disturbance reported near ${incident.location.name}. Habitat impact assessment shows ${incident.severity} disruption to local ecosystem.`,
    disaster: `Disaster event confirmed at ${incident.location.name}. Multi‑modal analysis classifies severity as ${incident.severity}. Emergency response protocols activated.`,
    urban: `Urban infrastructure issue at ${incident.location.name}. AI assessment rates this as ${incident.severity} with immediate municipal response recommended.`,
  };

  return templates[incident.category] || `AI analysis complete for incident at ${incident.location.name}. Severity: ${incident.severity}.`;
}

export async function suggestDepartments(
  incident: Incident,
): Promise<Array<{ departmentId: string; departmentName: string; confidence: number }>> {
  await mockDelay(100);

  const deptMap: Record<Category, Array<{ departmentId: string; departmentName: string }>> = {
    infrastructure: [
      { departmentId: 'dept-pwd', departmentName: 'Public Works Department' },
      { departmentId: 'dept-muni', departmentName: 'Municipal Engineering' },
    ],
    agriculture: [
      { departmentId: 'dept-agri', departmentName: 'Agriculture Department' },
      { departmentId: 'dept-ext', departmentName: 'Extension Services' },
    ],
    water: [
      { departmentId: 'dept-water', departmentName: 'Water Supply Board' },
      { departmentId: 'dept-phe', departmentName: 'Public Health Engineering' },
    ],
    energy: [
      { departmentId: 'dept-elec', departmentName: 'Electricity Board' },
      { departmentId: 'dept-energy', departmentName: 'Energy Commission' },
    ],
    climate: [
      { departmentId: 'dept-met', departmentName: 'Meteorological Department' },
      { departmentId: 'dept-dm', departmentName: 'Disaster Management' },
    ],
    environment: [
      { departmentId: 'dept-forest', departmentName: 'Forest Department' },
      { departmentId: 'dept-pcb', departmentName: 'Pollution Control Board' },
    ],
    wildlife: [
      { departmentId: 'dept-forest', departmentName: 'Forest Department' },
      { departmentId: 'dept-wildlife', departmentName: 'Wildlife Protection' },
    ],
    disaster: [
      { departmentId: 'dept-ndma', departmentName: 'NDMA' },
      { departmentId: 'dept-fire', departmentName: 'Fire Department' },
    ],
    urban: [
      { departmentId: 'dept-mc', departmentName: 'Municipal Corporation' },
      { departmentId: 'dept-urban', departmentName: 'Urban Development' },
    ],
  };

  return (deptMap[incident.category] || []).map((d) => ({
    ...d,
    confidence: 75 + Math.floor(Math.random() * 20),
  }));
}

// ──────────────────────────────────────────────────────────────
// Internal Mock Data Generators
// ──────────────────────────────────────────────────────────────

function generateMockAnalysis(incident: Incident): AIAnalysis {
  return {
    confidence: 78 + Math.floor(Math.random() * 20),
    classification: incident.category,
    severity: incident.severity,
    summary: `AI-generated analysis for ${incident.title}. ${incident.severity.toUpperCase()} severity confirmed.`,
    recommendations: [
      `Deploy ${incident.severity === 'critical' ? 'emergency' : 'standard'} response team`,
      'Secure perimeter and restrict public access',
      'Begin photographic documentation',
      'Notify relevant department heads',
    ],
    estimatedCost: `₹${(Math.floor(Math.random() * 500) + 50).toLocaleString()},000`,
    estimatedETA: incident.severity === 'critical' ? '2 hours' : incident.severity === 'high' ? '4 hours' : '8 hours',
  };
}

function generateMockRisk(incident: Incident): RiskAssessment {
  const severityMap: Record<Severity, number> = { critical: 92, high: 74, medium: 48, low: 22 };
  const base = severityMap[incident.severity];

  return {
    overallRiskScore: Math.min(100, base + Math.floor(Math.random() * 10)),
    aiConfidence: 78 + Math.floor(Math.random() * 20),
    severity: incident.severity === 'critical' ? 'Critical' : incident.severity === 'high' ? 'High' : incident.severity === 'medium' ? 'Medium' : 'Low',
    environmentalImpact: Math.floor(Math.random() * 40) + (incident.category === 'environment' ? 50 : 10),
    infrastructureImpact: Math.floor(Math.random() * 40) + (incident.category === 'infrastructure' ? 50 : 10),
    publicSafetyImpact: Math.floor(Math.random() * 30) + (incident.severity === 'critical' ? 60 : 20),
    economicImpact: Math.floor(Math.random() * 40) + 20,
    urgencyLevel: incident.severity === 'critical' ? 95 : incident.severity === 'high' ? 75 : 50,
    priority: incident.severity === 'critical' ? 'Critical' : incident.severity === 'high' ? 'High' : 'Medium',
    estimatedLoss: Math.floor(Math.random() * 500000) + 50000,
    mitigationSuggestion: 'Deploy appropriate response team and secure affected area.',
    recommendedDepartments: ['Public Works Department', 'Emergency Services'],
  };
}

function generateMockEarthImpact(incident: Incident): EarthImpactMetrics {
  const m = incident.severity === 'critical' ? 4 : incident.severity === 'high' ? 3 : incident.severity === 'medium' ? 2 : 1;
  return {
    planetaryHealthDelta: -(m * (0.5 + Math.random() * 1.5)),
    environmentalScore: 100 - m * (5 + Math.floor(Math.random() * 10)),
    waterImpact: incident.category === 'water' ? m * 15 : m * 2,
    energyImpact: incident.category === 'energy' ? m * 18 : m * 3,
    agricultureImpact: incident.category === 'agriculture' ? m * 20 : m * 2,
    biodiversityImpact: ['wildlife', 'environment'].includes(incident.category) ? m * 12 : m * 1,
    climateImpact: incident.category === 'climate' ? m * 16 : m * 3,
    infrastructureImpact: incident.category === 'infrastructure' ? m * 22 : m * 4,
    populationAffected: Math.floor(Math.random() * 5000 * m) + 100,
    estimatedRecoveryTime: m >= 3 ? `${m * 2} weeks` : `${m * 3} days`,
  };
}

function extractMockEntities(text: string): string[] {
  const keywords = ['road', 'water', 'bridge', 'fire', 'flood', 'tree', 'power', 'building', 'crop', 'pollution'];
  return keywords.filter((k) => text.toLowerCase().includes(k));
}

function getRelatedCategories(primary: Category): Category[] {
  const related: Record<Category, Category[]> = {
    infrastructure: ['urban', 'disaster'],
    agriculture: ['water', 'environment'],
    water: ['environment', 'urban'],
    energy: ['infrastructure', 'urban'],
    climate: ['disaster', 'environment'],
    environment: ['wildlife', 'climate'],
    wildlife: ['environment', 'agriculture'],
    disaster: ['infrastructure', 'climate'],
    urban: ['infrastructure', 'energy'],
  };
  return related[primary] || [];
}

// ──────────────────────────────────────────────────────────────
// 3. Incident Intelligence Engine (ML Architecture Ready)
// ──────────────────────────────────────────────────────────────

export interface IncidentIntelligenceResult {
  relatedIncidents: Array<{ incident: Incident; similarityScore: number; reason: string }>;
  duplicateDetection: Array<{ incident: Incident; confidence: number; recommendation: string }>;
  nearbyIncidents: Array<{ incident: Incident; distanceMeters: number }>;
  similarHistoricalCases: Array<{ incident: Incident; matchScore: number; historicalOutcome: string }>;
  sharedInfrastructure: Array<{ assetName: string; affectedIncidents: string[]; riskLevel: string }>;
  aiMergeSuggestions: Array<{ sourceId: string; targetId: string; confidence: number; justification: string }>;
}

// Haversine distance in meters between two lat/lng pairs
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export async function computeRelatedIntelligence(
  incident: Incident,
  allIncidents: Incident[]
): Promise<IncidentIntelligenceResult> {
  await mockDelay(150);

  const others = allIncidents.filter((i) => i.id !== incident.id);
  const incLat = incident.location?.lat || 16.5062;
  const incLng = incident.location?.lng || 80.648;

  // 1. Related Incidents (Category / Keyword matching)
  const relatedIncidents = others
    .filter((other) => other.category === incident.category || other.severity === incident.severity)
    .map((other) => ({
      incident: other,
      similarityScore: Math.floor(75 + Math.random() * 20),
      reason: `Shared ${other.category === incident.category ? 'domain category' : 'severity level'} (${other.category})`,
    }));

  // 2. Duplicate Detection (Title keyword match & proximity < 1000m)
  const duplicateDetection = others
    .filter((other) => {
      const distance = calculateDistanceMeters(
        incLat,
        incLng,
        other.location?.lat || 16.5,
        other.location?.lng || 80.6
      );
      return distance < 1200 || other.title.toLowerCase().includes(incident.title.split(' ')[0].toLowerCase());
    })
    .map((other) => ({
      incident: other,
      confidence: Math.floor(88 + Math.random() * 10),
      recommendation: `High confidence intake overlap with case ${other.id}. Recommend 1-Click Merge.`,
    }));

  // 3. Nearby Incidents (Spatial distance calculation)
  const nearbyIncidents = others
    .map((other) => {
      const distanceMeters = calculateDistanceMeters(
        incLat,
        incLng,
        other.location?.lat || 16.5062,
        other.location?.lng || 80.648
      );
      return { incident: other, distanceMeters };
    })
    .filter((item) => item.distanceMeters <= 5000)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  // 4. Similar Historical Cases
  const similarHistoricalCases = others
    .filter((other) => other.status === 'resolved' || other.status === 'archived' || other.severity === 'critical')
    .slice(0, 3)
    .map((other) => ({
      incident: other,
      matchScore: Math.floor(80 + Math.random() * 15),
      historicalOutcome: `Resolved in 3.5h. Root cause identified as ${other.category} main fatigue.`,
    }));

  // 5. Shared Infrastructure Assets
  const sharedInfrastructure = [
    {
      assetName: `Conduit Valve 4B & Feeder Grid (${incident.location?.ward || 'Ward 12'})`,
      affectedIncidents: [incident.id, ...others.slice(0, 2).map((o) => o.id)],
      riskLevel: 'HIGH_CASCADE_RISK',
    },
    {
      assetName: `Primary Substation Feeder 3 (${incident.category.toUpperCase()})`,
      affectedIncidents: [incident.id, ...others.slice(1, 3).map((o) => o.id)],
      riskLevel: 'MODERATE',
    },
  ];

  // 6. AI Merge Suggestions
  const aiMergeSuggestions = duplicateDetection
    .filter((d) => d.confidence >= 85)
    .map((d) => ({
      sourceId: d.incident.id,
      targetId: incident.id,
      confidence: d.confidence,
      justification: `Spatial proximity (${nearbyIncidents[0]?.distanceMeters || 120}m) and high category overlap (${incident.category}).`,
    }));

  return {
    relatedIncidents,
    duplicateDetection,
    nearbyIncidents,
    similarHistoricalCases,
    sharedInfrastructure,
    aiMergeSuggestions,
  };
}

