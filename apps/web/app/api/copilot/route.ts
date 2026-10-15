// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Copilot & Query Assistant Controller
// POST /api/copilot  — Natural Language Situation Grounding & Command Dispatch
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { prisma } from '../../../lib/server/database/prisma';

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const userQuery = String(body.query || '').trim();

    if (!userQuery) {
      return new Response(
        JSON.stringify({
          answer: 'Please provide a question or instruction regarding city infrastructure, incidents, or environmental health.',
          action: 'NONE',
          data: {},
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Try querying the Python Intelligence Copilot Engine
    const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:8000';
    try {
      const pyRes = await fetch(`${aiEngineUrl}/api/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
        signal: AbortSignal.timeout(4000),
      });

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        if (pyData?.answer && !pyData.answer.startsWith('I am the EarthMind AI Copilot. Ask me')) {
          return new Response(JSON.stringify(pyData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } catch {
      // Continue to grounded database fallback
    }

    // 2. Query Live Database Context for Grounded Situation Awareness
    const [totalIncidents, criticalIncidents, highIncidents, activeWaterIncidents, resolvedToday] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({ where: { severity: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.incident.count({ where: { severity: 'HIGH', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.incident.count({ where: { category: 'WATER', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.incident.count({ where: { status: 'RESOLVED' } }),
    ]);

    const q = userQuery.toLowerCase();
    let answer = '';
    let action = 'NONE';
    let data: any = {};

    if (q.includes('critical') || q.includes('severe') || q.includes('urgent')) {
      const topCrit = await prisma.incident.findMany({
        where: { severity: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } },
        take: 3,
        select: { id: true, title: true, locationName: true, riskScore: true },
      });
      const critDetails = topCrit.map((c, i) => `${i + 1}. **${c.title}** (${c.locationName || 'Central Sector'}, Risk: ${c.riskScore}/100)`).join('\n');
      answer = `Identified **${criticalIncidents} critical incident(s)** requiring immediate command intervention.\n\n${critDetails || 'No unresolved critical emergencies at this moment.'}`;
      action = 'FILTER_CRITICAL';
    } else if (q.includes('water') || q.includes('leak') || q.includes('pipe')) {
      answer = `Monitored water grid currently reports **${activeWaterIncidents} active water incident(s)**. SCADA flow monitoring and acoustic leak detection sensors are active across municipal distribution lines.`;
      action = 'LAYER_GRID';
    } else if (q.includes('report') || q.includes('summary') || q.includes('status')) {
      const phi = Math.max(50, Math.round(100 - (totalIncidents - resolvedToday) * 2 - criticalIncidents * 5));
      answer = `📋 **Live City Intelligence Situation Report**\n\n- **Total Incidents Registered**: ${totalIncidents}\n- **Active Critical Severity**: ${criticalIncidents}\n- **Active High Severity**: ${highIncidents}\n- **Resolved Today**: ${resolvedToday}\n- **Planet Health Index (PHI)**: ${phi}/100\n\nAll emergency response squads are synchronized with the central dispatch ledger.`;
      action = 'SHOW_SUMMARY';
    } else if (q.includes('map') || q.includes('gis') || q.includes('view') || q.includes('location')) {
      answer = `Plotting **${totalIncidents} active incident marker(s)** on the Digital Twin Map. Navigating to geospatial overview.`;
      action = 'ZOOM_COORDINATES';
      data = { latitude: 16.5062, longitude: 80.648 };
    } else {
      answer = `EarthMind Planetary Intelligence Copilot is active. System is tracking **${totalIncidents} incidents** across 9 municipal intelligence sectors with **${criticalIncidents} critical alert(s)**. Ask me about critical hotspots, water leaks, operational summaries, or GIS navigation.`;
    }

    return new Response(
      JSON.stringify({
        answer,
        action,
        data,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        answer: 'EarthMind Copilot encountered an unexpected query handling error.',
        action: 'NONE',
        error: String(err?.message || err),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
