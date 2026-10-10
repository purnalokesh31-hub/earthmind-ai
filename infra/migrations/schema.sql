-- SQLite/PostgreSQL Compatible Migration Schema for EarthMind AI (PIOS)

-- 1. Cases Table
CREATE TABLE IF NOT EXISTS cases (
    case_id TEXT PRIMARY KEY,
    client_uuid TEXT UNIQUE,
    domain TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT,
    audio_transcript TEXT,
    status TEXT DEFAULT 'pending_sync',
    sync_status TEXT DEFAULT 'local_only',
    severity TEXT DEFAULT 'low',
    confidence REAL DEFAULT 0.0,
    risk_score REAL DEFAULT 0.0,
    earth_score_delta REAL DEFAULT 0.0,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    location_text TEXT,
    captured_at TEXT,
    created_by TEXT,
    image_url TEXT,
    weather_snapshot TEXT DEFAULT '{}',
    geo_context TEXT DEFAULT '{}',
    detections TEXT DEFAULT '[]',
    explanation TEXT DEFAULT '{}',
    recommendation TEXT DEFAULT '{}',
    report_status TEXT DEFAULT 'none',
    version INTEGER DEFAULT 1,
    created_at TEXT,
    updated_at TEXT
);

-- 2. Causal Knowledge Graph Table
CREATE TABLE IF NOT EXISTS knowledge_graph (
    relation_id TEXT PRIMARY KEY,
    case_id TEXT,
    source_node TEXT NOT NULL,
    relationship TEXT NOT NULL,
    target_node TEXT NOT NULL,
    created_at TEXT
);

-- 3. Earth Memory (Timeline Snapshots) Table
CREATE TABLE IF NOT EXISTS earth_memory (
    memory_id TEXT PRIMARY KEY,
    case_id TEXT,
    snapshot_time TEXT NOT NULL, -- 'today', 'last_week', 'last_month', 'last_year'
    regional_phi REAL NOT NULL,
    status_snapshot TEXT NOT NULL,
    notes TEXT,
    created_at TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cases_lat_lng ON cases (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_graph_case ON knowledge_graph (case_id);
CREATE INDEX IF NOT EXISTS idx_memory_case ON earth_memory (case_id);
