// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 Connector Raw Telemetry Test Fixtures
// Sanitized Deterministic Telemetry Payload Fixtures for all 7 Urban Domains
// ──────────────────────────────────────────────────────────────

export const WEATHER_RAW_FIXTURE = {
  station_id: 'WTH-RADAR-VJA-01',
  timestamp_utc: '2026-08-19T17:30:00Z',
  precipitation: {
    rate_mm_hr: 120.5,
    type: 'THUNDERSTORM',
  },
  wind: { speed_kmh: 52.4, gust_kmh: 68.0 },
  barometer_hpa: 994.5,
  temp_celsius: 24.8,
};

export const ENVIRONMENTAL_RAW_FIXTURE = {
  sensor_uuid: 'ENV-BENZ-STN-99',
  reading_time: '2026-08-19T17:30:00Z',
  aqi_index: 48,
  noise_db: 74.2,
  ambient_temp_c: 26.1,
  relative_humidity_pct: 92,
  co2_ppm: 425,
};

export const MOBILITY_RAW_FIXTURE = {
  corridor_code: 'MOB-NH9-ARTERIAL',
  time_iso: '2026-08-19T17:30:00Z',
  traffic_density_pct: 94.8,
  avg_speed_kph: 5.2,
  hourly_vehicle_flow: 4800,
  water_depth_cm: 38.5,
};

export const TRANSIT_RAW_FIXTURE = {
  fleet_uuid: 'TRN-BUS-SEC4',
  observed_at: '2026-08-19T17:30:00Z',
  active_buses: 58,
  delayed_buses: 34,
  avg_delay_mins: 38.0,
  blocked_routes_count: 6,
};

export const UTILITY_RAW_FIXTURE = {
  substation_tag: 'UTL-GRID-SUB4B',
  sample_time: '2026-08-19T17:30:00Z',
  load_factor_pct: 96.4,
  temp_surge_celsius: 82.1,
  water_press_psi: 62.0,
  outage_probability: 84.5,
};

export const EMERGENCY_RAW_FIXTURE = {
  dispatch_zone_code: 'EMG-HOSP-ZONE1',
  timestamp: '2026-08-19T17:30:00Z',
  hosp_delay_minutes: 24.0,
  active_dispatches: 22,
  ambulances_available: 2,
  fire_units_available: 1,
};

export const CITIZEN_RAW_FIXTURE = {
  ticket_id: 'CIT-REP-9042',
  filed_at: '2026-08-19T17:30:00Z',
  category_name: 'FLASH_FLOOD',
  user_description: 'Severe water logging under Benz Circle overpass blocking emergency vehicles.',
  priority_tier: 'CRITICAL',
  geo: { latitude: 16.506, longitude: 80.648, zone: 'zone-benz-circle' },
  community_votes: 189,
};
