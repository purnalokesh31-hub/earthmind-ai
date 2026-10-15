// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Production Enterprise Database Seeding Script
// Vijayawada Metropolitan Sector Municipal Telemetry Dataset
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const RoleType = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  COMMANDER: 'COMMANDER',
  FIELD_OFFICER: 'FIELD_OFFICER',
  ANALYST: 'ANALYST',
  SUPERVISOR: 'SUPERVISOR',
  CITIZEN: 'CITIZEN',
};

const Severity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

const IncidentStatus = {
  REPORTED: 'REPORTED',
  IN_TRIAGE: 'IN_TRIAGE',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  CONTAINED: 'CONTAINED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
};

const EvidenceFileType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOCUMENT',
  SENSOR_LOG: 'SENSOR_LOG',
};

const EvidenceStatus = {
  PENDING_ANALYSIS: 'PENDING_ANALYSIS',
  ANALYZED: 'ANALYZED',
  REJECTED: 'REJECTED',
};

const TelemetryType = {
  WATER_LEVEL: 'WATER_LEVEL',
  AIR_QUALITY: 'AIR_QUALITY',
  SOIL_MOISTURE: 'SOIL_MOISTURE',
  TRAFFIC_FLOW: 'TRAFFIC_FLOW',
  GRID_LOAD: 'GRID_LOAD',
  WEATHER: 'WEATHER',
};

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EarthMind PIOS Enterprise Database Seeding...');

  // 0. Clean Existing Data (order matters for foreign key constraints)
  await prisma.boundingBox.deleteMany();
  await prisma.visionAnalysis.deleteMany();
  await prisma.oCRResult.deleteMany();
  await prisma.sensorTelemetry.deleteMany();
  await prisma.evidenceItem.deleteMany();
  await prisma.incidentTimeline.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.earthImpact.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 1. Seed Departments
  const deptData = [
    { code: 'INFRA', name: 'Infrastructure Intelligence', description: 'Roadways, bridges, public buildings, and structural health monitoring' },
    { code: 'AGRI', name: 'Agriculture Intelligence', description: 'Crop health, soil nutrient analysis, and pest outbreak detection' },
    { code: 'ENV', name: 'Environmental Intelligence', description: 'Air quality, deforestation, illegal dumping, and pollution tracking' },
    { code: 'DISASTER', name: 'Disaster Intelligence', description: 'Flood risk, seismic hazard, landslide prediction, and cyclone readiness' },
    { code: 'WATER', name: 'Water Intelligence', description: 'Potable water supply, river basin quality, and pipe fracture detection' },
    { code: 'ENERGY', name: 'Energy Intelligence', description: 'Substation thermal health, solar array efficiency, and grid load' },
    { code: 'URBAN', name: 'Urban Intelligence', description: 'Smart waste management, traffic congestion, and municipal assets' },
    { code: 'CLIMATE', name: 'Climate Intelligence', description: 'Microclimate heat islands, carbon footprint, and emissions monitoring' },
    { code: 'WILDLIFE', name: 'Wildlife Intelligence', description: 'Forest fringe corridor preservation and biodiversity risk tracking' },
  ];

  const departments: Record<string, any> = {};
  for (const d of deptData) {
    departments[d.code] = await prisma.department.create({ data: d });
  }
  console.log(`✅ Seeded ${Object.keys(departments).length} municipal departments.`);

  // 2. Seed Users with Bcrypt Hashed Password
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@earthmind.gov',
      passwordHash,
      fullName: 'System Admin',
      role: RoleType.SYSTEM_ADMIN,
      phone: '+91-9876543210',
      isActive: true,
    },
  });

  const commander = await prisma.user.create({
    data: {
      email: 'commander@earthmind.gov',
      passwordHash,
      fullName: 'Command Director Expo',
      role: RoleType.COMMANDER,
      phone: '+91-9876543211',
      isActive: true,
    },
  });

  const officerPwd = await prisma.user.create({
    data: {
      email: 'officer.pwd@earthmind.gov',
      passwordHash,
      fullName: 'Ravi Kumar (PWD)',
      role: RoleType.FIELD_OFFICER,
      departmentId: departments['INFRA'].id,
      phone: '+91-9876543212',
      isActive: true,
    },
  });

  const officerWater = await prisma.user.create({
    data: {
      email: 'officer.water@earthmind.gov',
      passwordHash,
      fullName: 'Sita Ram (Water Board)',
      role: RoleType.FIELD_OFFICER,
      departmentId: departments['WATER'].id,
      phone: '+91-9876543213',
      isActive: true,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst.gis@earthmind.gov',
      passwordHash,
      fullName: 'Dr. Ananya Sharma (GIS Analyst)',
      role: RoleType.ANALYST,
      departmentId: departments['CLIMATE'].id,
      phone: '+91-9876543214',
      isActive: true,
    },
  });

  console.log(`✅ Seeded 5 primary system users (Admin, Commander, Field Officers, Analyst).`);

  // 3. Seed Incidents
  const incidentList = [
    {
      incidentCode: 'EM-208',
      title: 'Severe Road Subsidence — NH-9 Junction',
      description: 'Heavy commercial axle load combined with sub-base water infiltration caused 40cm asphalt collapse.',
      category: 'Infrastructure',
      subcategory: 'Road Subsidence',
      severity: Severity.CRITICAL,
      status: IncidentStatus.ACTIVE,
      departmentId: departments['INFRA'].id,
      department: 'Infrastructure Intelligence',
      riskScore: 83.5,
      locationName: 'Ward 12, Benz Circle',
      latitude: 16.5062,
      longitude: 80.648,
      address: 'NH-9 Junction, Ward 12, Benz Circle, Vijayawada',
      aiSummary: 'Critical road collapse hazard detected via drone orthomosaic. Sub-grade cavity expanding.',
      repairCostEstimate: 450000,
      createdById: commander.id,
      assignedOfficerId: officerPwd.id,
    },
    {
      incidentCode: 'EM-209',
      title: 'Contaminated Water Supply — Sector 4',
      description: 'High turbidity and bacterial coliform spike detected at sector distribution main valve 4B.',
      category: 'Water',
      subcategory: 'Water Quality',
      severity: Severity.HIGH,
      status: IncidentStatus.ACTIVE,
      departmentId: departments['WATER'].id,
      department: 'Water Intelligence',
      riskScore: 74.0,
      locationName: 'Zone B, Sector 4',
      latitude: 16.5125,
      longitude: 80.635,
      address: 'Distribution Valve 4B, Zone B, Sector 4, Vijayawada',
      aiSummary: 'Chemical sensor threshold breach. Immediate pipeline isolation recommended.',
      repairCostEstimate: 180000,
      createdById: commander.id,
      assignedOfficerId: officerWater.id,
    },
    {
      incidentCode: 'EM-210',
      title: 'Illegal Deforestation — Riverside',
      description: 'Unauthorized heavy timber logging detected along Krishna riverbank buffer zone 7.',
      category: 'Environmental',
      subcategory: 'Deforestation',
      severity: Severity.MEDIUM,
      status: IncidentStatus.ACTIVE,
      departmentId: departments['ENV'].id,
      department: 'Environmental Intelligence',
      riskScore: 58.0,
      locationName: 'Ward 7, Krishna River Bank',
      latitude: 16.498,
      longitude: 80.621,
      address: 'Krishna River Bank Buffer, Ward 7, Vijayawada',
      aiSummary: 'Satellite multi-spectral change vector confirmed 1.2 hectares canopy loss.',
      repairCostEstimate: 220000,
      createdById: commander.id,
    },
    {
      incidentCode: 'EM-211',
      title: 'Pest Infestation & Crop Blight Anomaly',
      description: 'Early-stage armyworm infestation and leaf blight detected across paddy crop fields.',
      category: 'Agriculture',
      subcategory: 'Pest Infestation',
      severity: Severity.HIGH,
      status: IncidentStatus.ACTIVE,
      departmentId: departments['AGRI'].id,
      department: 'Agriculture Intelligence',
      riskScore: 71.2,
      locationName: 'Ward 14, Agricultural Zone',
      latitude: 16.531,
      longitude: 80.665,
      address: 'Paddy Farm Block 3, Ward 14, Vijayawada',
      aiSummary: 'Spectral NDRE imagery identified 18% chlorophyll degradation.',
      repairCostEstimate: 150000,
      createdById: commander.id,
    },
    {
      incidentCode: 'EM-212',
      title: 'Flash Flood Hazard & River Inundation Alert',
      description: 'Prakasam Barrage discharge exceeded 4,50,000 cusecs causing low-lying riverbank submergence.',
      category: 'Disaster',
      subcategory: 'Flash Flood',
      severity: Severity.CRITICAL,
      status: IncidentStatus.ACTIVE,
      departmentId: departments['DISASTER'].id,
      department: 'Disaster Intelligence',
      riskScore: 92.0,
      locationName: 'Ward 3, Low-Lying Krishna Basin',
      latitude: 16.501,
      longitude: 80.612,
      address: 'Krishna River Inundation Zone, Ward 3, Vijayawada',
      aiSummary: 'Hydrological hydrodynamic model projects 1.8m inundation depth in 2 hours.',
      repairCostEstimate: 1200000,
      createdById: commander.id,
    },
    {
      incidentCode: 'EM-213',
      title: 'Transformer Thermal Overheat & Grid Overload',
      description: 'FLIR thermal imaging detected Substation 4 Transformer 2 core temperature at 114°C.',
      category: 'Energy',
      subcategory: 'Grid Overload',
      severity: Severity.HIGH,
      status: IncidentStatus.ACTIVE,
      departmentId: departments['ENERGY'].id,
      department: 'Energy Intelligence',
      riskScore: 78.5,
      locationName: 'Industrial Zone Substation 4',
      latitude: 16.522,
      longitude: 80.655,
      address: 'Substation 4, Auto Nagar Industrial Zone, Vijayawada',
      aiSummary: 'High probability of catastrophic dielectric oil ignition if load is unmitigated.',
      repairCostEstimate: 350000,
      createdById: commander.id,
    },
  ];

  const createdIncidents: Record<string, any> = {};
  for (const incData of incidentList) {
    const inc = await prisma.incident.create({ data: incData });
    createdIncidents[inc.incidentCode] = inc;

    // Create Timeline Initial Entry
    await prisma.incidentTimeline.create({
      data: {
        incidentId: inc.id,
        action: 'INCIDENT_CREATED',
        actorId: commander.id,
        newStatus: 'ACTIVE',
        note: `Incident ${inc.incidentCode} initialized: ${inc.title}`,
      },
    });

    // Create Earth Impact Metrics
    await prisma.earthImpact.create({
      data: {
        incidentId: inc.id,
        carbonImpactTonnes: Math.round((Math.random() * 45 + 5) * 10) / 10,
        waterSavedLiters: Math.round(Math.random() * 85000 + 15000),
        biodiversityRiskIndex: Math.round(Math.random() * 40 + 10),
        sustainabilityScore: Math.round(100 - inc.riskScore * 0.4),
        ecosystemDamageLevel: inc.severity === Severity.CRITICAL ? 'severe' : 'moderate',
      },
    });

    // Create Risk Assessment
    await prisma.riskAssessment.create({
      data: {
        incidentId: inc.id,
        overallRiskScore: inc.riskScore,
        publicSafetyRisk: Math.round(inc.riskScore * 0.9),
        environmentalRisk: Math.round(inc.riskScore * 0.85),
        financialRisk: Math.round(inc.riskScore * 0.75),
        operationalRisk: Math.round(inc.riskScore * 0.8),
        aiRecommendation: `Immediate automated dispatch of ${inc.department} response team required.`,
      },
    });
  }

  console.log(`✅ Seeded ${Object.keys(createdIncidents).length} core municipal incidents with Timelines, EarthImpacts, and RiskAssessments.`);

  // 4. Seed Evidence & Vision Analysis for EM-208
  const em208 = createdIncidents['EM-208'];
  if (em208) {
    const evidence1 = await prisma.evidenceItem.create({
      data: {
        fileName: 'EM-208_Thermal_Orthomosaic.png',
        fileType: EvidenceFileType.IMAGE,
        mimeType: 'image/png',
        sizeBytes: 18450000,
        storageUrl: '/uploads/evidence/EM-208_Thermal_Orthomosaic.png',
        status: EvidenceStatus.ANALYZED,
        linkedIncidentId: em208.id,
        uploadedByUserId: officerPwd.id,
      },
    });

    const vision1 = await prisma.visionAnalysis.create({
      data: {
        evidenceItemId: evidence1.id,
        incidentId: em208.id,
        modelTask: 'STRUCTURAL_HAZARD_DETECTION',
        modelVersion: 'YOLOv8x-v4.2-TensorRT',
        confidence: 0.942,
        damageScore: 84.5,
        riskScore: 83.5,
        aiSummary: 'Computer Vision confirmed STRUCTURAL_SUBSIDENCE hazard (94.2% confidence). Sub-grade cavity detected.',
        recommendedCategory: 'Infrastructure',
        recommendedSeverity: 'CRITICAL',
        recommendedDepartment: 'Infrastructure Intelligence',
        totalInferenceMs: 142,
      },
    });

    await prisma.boundingBox.createMany({
      data: [
        {
          visionAnalysisId: vision1.id,
          label: 'Asphalt Subsidence',
          confidence: 0.96,
          severity: 'CRITICAL',
          x: 0.25,
          y: 0.35,
          width: 0.4,
          height: 0.3,
          damageScore: 88.0,
        },
        {
          visionAnalysisId: vision1.id,
          label: 'Structural Crack',
          confidence: 0.91,
          severity: 'HIGH',
          x: 0.15,
          y: 0.2,
          width: 0.2,
          height: 0.15,
          damageScore: 72.0,
        },
      ],
    });
  }

  // 5. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'INCIDENT_DISPATCHED',
        title: 'EM-208 Priority Escalated to CRITICAL',
        message: 'Sub-surface hydrostatic pressure hit 94/100 threshold at Benz Circle Ward 12.',
        severity: 'critical',
        isRead: false,
        recipientId: commander.id,
        linkedEntityId: em208?.id,
        linkedEntityType: 'INCIDENT',
      },
      {
        type: 'EVIDENCE_ANALYZED',
        title: 'AI Vision Pre-Scan Completed',
        message: 'Computer Vision confirmed STRUCTURAL_SUBSIDENCE hazard (94.2% confidence).',
        severity: 'warning',
        isRead: false,
        recipientId: officerPwd.id,
        linkedEntityId: em208?.id,
        linkedEntityType: 'INCIDENT',
      },
      {
        type: 'ASSIGNMENT',
        title: 'Officer Ravi Kumar Dispatched',
        message: 'Response Squad PWD-1 dispatched to Benz Circle. ETA: 8 minutes.',
        severity: 'info',
        isRead: true,
        recipientId: commander.id,
        linkedEntityId: em208?.id,
        linkedEntityType: 'INCIDENT',
      },
    ],
  });

  // 6. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'SYSTEM_BOOT',
        category: 'SYSTEM',
        actorId: admin.id,
        actorEmail: admin.email,
        actorRole: admin.role,
        description: 'EarthMind PIOS Core Service Engine booted successfully.',
        traceId: 'tr-boot-001',
      },
      {
        action: 'CREATE_INCIDENT',
        category: 'INCIDENT',
        actorId: commander.id,
        actorEmail: commander.email,
        actorRole: commander.role,
        targetId: em208?.id,
        targetType: 'INCIDENT',
        description: 'Logged incident EM-208: Severe Road Subsidence — NH-9 Junction.',
        traceId: 'tr-inc-208',
      },
    ],
  });

  console.log('✅ Seeded Notifications and Audit Logs.');
  console.log('🎉 EarthMind PIOS Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
