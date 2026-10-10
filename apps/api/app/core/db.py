# db.py - Standard Library SQLite Database Handler for EarthMind AI (PIOS)

import sqlite3
import json
import os
import uuid
import datetime
try:
    import h3
except ImportError:
    h3 = None
from apps.api.app.core.config import settings

DB_FILE = "./earthmind.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema for PIOS (Cases, Graph, and Memory) and seeds demo records."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Cases Table
    cursor.execute("""
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
        h3_index TEXT,
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
    """)
    
    # 2. Causal Knowledge Graph Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS knowledge_graph (
        relation_id TEXT PRIMARY KEY,
        case_id TEXT,
        source_node TEXT NOT NULL,
        relationship TEXT NOT NULL,
        target_node TEXT NOT NULL,
        created_at TEXT
    );
    """)
    
    # 3. Earth Memory (Timeline Snapshots) Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS earth_memory (
        memory_id TEXT PRIMARY KEY,
        case_id TEXT,
        snapshot_time TEXT NOT NULL,
        regional_phi REAL NOT NULL,
        status_snapshot TEXT NOT NULL,
        notes TEXT,
        created_at TEXT
    );
    """)
    
    # 4. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'Field Officer',
        organization TEXT DEFAULT 'Government',
        department TEXT DEFAULT 'Roads & Infrastructure',
        region TEXT DEFAULT 'Vijayawada',
        status TEXT DEFAULT 'active',
        created_at TEXT
    );
    """)

    # 5. Field Officers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS field_officers (
        officer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        current_task_id TEXT,
        last_updated TEXT
    );
    """)

    # 6. OTPs Table (Passwordless Auth)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS otps (
        email TEXT PRIMARY KEY,
        otp_code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT
    );
    """)

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cases_lat_lng ON cases (latitude, longitude);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cases_h3 ON cases (h3_index);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_graph_case ON knowledge_graph (case_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_memory_case ON earth_memory (case_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);")
    
    # Seed default user accounts if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        cursor.executemany("""
        INSERT INTO users (id, name, email, password_hash, role, organization, department, region, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            ("usr-1", "Officer Lokesh", "lokesh.officer@gmail.com", "EarthMind@2026", "Administrator", "Government", "Roads & Infrastructure", "Vijayawada", "active", now_str),
            ("usr-2", "Officer Rao", "rao@vijayawada.gov.in", "EarthMind@2026", "Supervisor", "Municipality", "Water Supply & Sewage", "Vijayawada", "active", now_str),
            ("usr-3", "Field Trainee", "trainee@gov.in", "EarthMind@2026", "Citizen", "Citizen", "General Public", "Vijayawada", "revoked", now_str)
        ])
    
    conn.commit()
    
    # Seed demo records if database is empty
    cursor.execute("SELECT COUNT(*) FROM cases")
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("[Database] Seeding initial PIOS planetary intelligence demo cases...")
        
        # Demo Case 1: Road Crack
        demo_1 = {
            "case_id": "demo-infrastructure-1",
            "client_uuid": "demo-uuid-inf-1",
            "domain": "infrastructure",
            "category": "road_crack",
            "title": "Critical Road Crack Detected near School Entrance",
            "description": "Fissure observed stretching across the pedestrian crossing. Heavy vehicular transit load risk.",
            "status": "analyzed",
            "sync_status": "synced",
            "severity": "high",
            "confidence": 0.96,
            "risk_score": 85.0,
            "earth_score_delta": 11.25,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "location_text": "Mission District, San Francisco (GPS Verified)",
            "captured_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)).isoformat(),
            "image_url": "/static/road_crack_demo.jpg",
            "weather_snapshot": json.dumps({"temp_c": 21.0, "humidity_percent": 65, "air_quality_index": 42}),
            "geo_context": json.dumps({"district": "Mission Ward", "zone": "Educational Zone"}),
            "detections": json.dumps([{"label": "Asphalt Fracture", "confidence": 0.96, "box": [50, 100, 200, 300]}]),
            "explanation": json.dumps({"findings": ["Heavy load cycles", "Recent monsoon moisture erosion"], "severity_rationale": "High pedestrian threat area."}),
            "recommendation": json.dumps({"urgency": "Urgent", "assigned_department": "Road Maintenance Department", "action_steps": ["Deploy cold-mix asphalt patch within 48h.", "Install pedestrian bypass path signs."]}),
            "report_status": "ready",
            "version": 2,
            "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        # Demo Case 2: Water Leak
        demo_2 = {
            "case_id": "demo-water-1",
            "client_uuid": "demo-uuid-wat-1",
            "domain": "water",
            "category": "leakage",
            "title": "Active Underground Pipe Fracture & Surface Pooling",
            "description": "Severe sub-surface pressure leakage manifesting as roadway water pooling near hospital main ward.",
            "status": "analyzed",
            "sync_status": "synced",
            "severity": "critical",
            "confidence": 0.95,
            "risk_score": 96.0,
            "earth_score_delta": 15.0,
            "latitude": 37.7850,
            "longitude": -122.4010,
            "location_text": "Downtown Core, Ward 4 (GPS Verified)",
            "captured_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)).isoformat(),
            "image_url": "/static/leakage_demo.jpg",
            "weather_snapshot": json.dumps({"temp_c": 19.5, "humidity_percent": 80, "air_quality_index": 35}),
            "geo_context": json.dumps({"district": "Medical Zone Core", "zone": "High Density Infrastructure"}),
            "detections": json.dumps([{"label": "Water Fluid Pooling", "confidence": 0.95}]),
            "explanation": json.dumps({"findings": ["Corrosion in cast-iron supply lines", "Continuous pressure loss"], "severity_rationale": "Proximity to medical power/water feeds."}),
            "recommendation": json.dumps({"urgency": "Immediate", "assigned_department": "Water Supply & Sewage Department", "action_steps": ["Dispatch utility isolation valve crew.", "Initiate local vacuum extraction of surface pool."]}),
            "report_status": "ready",
            "version": 2,
            "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        # Demo Case 3: Environment dumping
        demo_3 = {
            "case_id": "demo-environment-1",
            "client_uuid": "demo-uuid-env-1",
            "domain": "environment",
            "category": "illegal_dumping",
            "title": "Unregulated Industrial Debris Dumping near Park",
            "description": "Large accumulation of construction waste, plastic packaging, and discarded metals in nature park outskirts.",
            "status": "analyzed",
            "sync_status": "synced",
            "severity": "medium",
            "confidence": 0.92,
            "risk_score": 68.0,
            "earth_score_delta": 7.5,
            "latitude": 37.7600,
            "longitude": -122.4300,
            "location_text": "Castro Ward, District 8 (GPS Verified)",
            "captured_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2)).isoformat(),
            "image_url": "/static/dumping_demo.jpg",
            "weather_snapshot": json.dumps({"temp_c": 24.0, "humidity_percent": 55, "air_quality_index": 62}),
            "geo_context": json.dumps({"district": "Park Border Ward", "zone": "Protected Green Belt"}),
            "detections": json.dumps([{"label": "Construction Waste Heap", "confidence": 0.92}]),
            "explanation": json.dumps({"findings": ["Illegal disposal", "Leaching toxic runoff risk"], "severity_rationale": "Threat to local wildlife habitat corridor."}),
            "recommendation": json.dumps({"urgency": "Medium Priority", "assigned_department": "Municipal Sanitation Division", "action_steps": ["Dispatch heavy waste lifter.", "Install solar-powered CCTV monitor."]}),
            "report_status": "ready",
            "version": 2,
            "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2)).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        # Demo Case 4: Agriculture
        demo_4 = {
            "case_id": "demo-agriculture-1",
            "client_uuid": "demo-uuid-agr-1",
            "domain": "agriculture",
            "category": "crop_disease",
            "title": "Fungal Leaf Rust Outbreak in North Agricultural Zone",
            "description": "Orange pustules observed on leaf canopies. Affects wheat and grain yields.",
            "status": "analyzed",
            "sync_status": "synced",
            "severity": "medium",
            "confidence": 0.88,
            "risk_score": 62.0,
            "earth_score_delta": 4.5,
            "latitude": 37.7650,
            "longitude": -122.4110,
            "location_text": "North Farms, Ward 12 (GPS Verified)",
            "captured_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=6)).isoformat(),
            "image_url": "/static/crop_rust_demo.jpg",
            "weather_snapshot": json.dumps({"temp_c": 26.5, "humidity_percent": 82, "air_quality_index": 38}),
            "geo_context": json.dumps({"district": "Farmland Boundary", "zone": "Agricultural Zone"}),
            "detections": json.dumps([{"label": "Fungal Pustules", "confidence": 0.88}]),
            "explanation": json.dumps({"findings": ["Spore spreading under high humidity", "Lack of pre-treatment fungicides"], "severity_rationale": "High humidity accelerates transmission."}),
            "recommendation": json.dumps({"urgency": "Routine", "assigned_department": "Department of Agriculture & Soil Health", "action_steps": ["Apply copper-based organic fungicide.", "Isolate infested rows from main plots."]}),
            "report_status": "ready",
            "version": 2,
            "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=6)).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        # Demo Case 5: Climate / Disaster
        demo_5 = {
            "case_id": "demo-disaster-1",
            "client_uuid": "demo-uuid-dis-1",
            "domain": "disaster",
            "category": "flood",
            "title": "Localised Drainage Overflow & Flash Flood Inundation",
            "description": "Flash pooling over critical roadway junction blocking transit route. Base silt saturation.",
            "status": "analyzed",
            "sync_status": "synced",
            "severity": "critical",
            "confidence": 0.94,
            "risk_score": 92.5,
            "earth_score_delta": 15.0,
            "latitude": 37.7710,
            "longitude": -122.4210,
            "location_text": "South Junction, Ward 14 (GPS Verified)",
            "captured_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=3)).isoformat(),
            "image_url": "/static/flood_inundation_demo.jpg",
            "weather_snapshot": json.dumps({"temp_c": 18.0, "humidity_percent": 95, "air_quality_index": 22}),
            "geo_context": json.dumps({"district": "Silt Basin District", "zone": "Disaster Vulnerable Grid"}),
            "detections": json.dumps([{"label": "Surface Flood Inundation", "confidence": 0.94}]),
            "explanation": json.dumps({"findings": ["Debris blockages in drainage ducts", "Intense short-burst precipitation"], "severity_rationale": "Directly impacts critical road transit."}),
            "recommendation": json.dumps({"urgency": "Immediate", "assigned_department": "Disaster Response & Management Division", "action_steps": ["Deploy vacuum clearance pump.", "Establish traffic redirection barriers."]}),
            "report_status": "ready",
            "version": 2,
            "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=3)).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        # Demo Case 6: Energy
        demo_6 = {
            "case_id": "demo-energy-1",
            "client_uuid": "demo-uuid-ene-1",
            "domain": "energy",
            "category": "transformer_failure",
            "title": "Electrical Grid Transformer Overheat & Fissures",
            "description": "Thermal scanning flags high-temp anomaly on core cooling fins. Risk of local grid outage.",
            "status": "analyzed",
            "sync_status": "synced",
            "severity": "high",
            "confidence": 0.91,
            "risk_score": 83.5,
            "earth_score_delta": 11.25,
            "latitude": 37.7790,
            "longitude": -122.4150,
            "location_text": "Substation B, Ward 4 (GPS Verified)",
            "captured_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=8)).isoformat(),
            "image_url": "/static/transformer_demo.jpg",
            "weather_snapshot": json.dumps({"temp_c": 31.0, "humidity_percent": 50, "air_quality_index": 55}),
            "geo_context": json.dumps({"district": "Industrial Substation Grid", "zone": "High Voltage Grid"}),
            "detections": json.dumps([{"label": "Transformer Thermal Overheat", "confidence": 0.91}]),
            "explanation": json.dumps({"findings": ["Cooling fin blockages", "High load consumption peak"], "severity_rationale": "High risk of secondary substations cascading failure."}),
            "recommendation": json.dumps({"urgency": "Urgent", "assigned_department": "Electricity Grid & Power Department", "action_steps": ["Deploy emergency maintenance crew.", "Shift substation loads to backup grid feeder lines."]}),
            "report_status": "ready",
            "version": 2,
            "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=8)).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        # Save cases
        for case_item in [demo_1, demo_2, demo_3, demo_4, demo_5, demo_6]:
            h3_val = h3.latlng_to_cell(case_item["latitude"], case_item["longitude"], 9) if h3 else None
            cursor.execute("""
            INSERT INTO cases (
                case_id, client_uuid, domain, category, title, description,
                status, sync_status, severity, confidence, risk_score, earth_score_delta,
                latitude, longitude, h3_index, location_text, captured_at, image_url,
                weather_snapshot, geo_context, detections, explanation, recommendation,
                report_status, version, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                case_item["case_id"], case_item["client_uuid"], case_item["domain"], case_item["category"],
                case_item["title"], case_item["description"], case_item["status"], case_item["sync_status"],
                case_item["severity"], case_item["confidence"], case_item["risk_score"], case_item["earth_score_delta"],
                case_item["latitude"], case_item["longitude"], h3_val, case_item["location_text"], case_item["captured_at"],
                case_item["image_url"], case_item["weather_snapshot"], case_item["geo_context"], case_item["detections"],
                case_item["explanation"], case_item["recommendation"], case_item["report_status"], case_item["version"],
                case_item["created_at"], case_item["updated_at"]
            ))

            # Save graph relationships for seeded cases
            c_id = case_item["case_id"]
            if "infrastructure" in c_id:
                cursor.execute("INSERT INTO knowledge_graph VALUES (?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "Heavy Traffic Load", "causes", "Base Asphalt Cracking", datetime.datetime.now(datetime.timezone.utc).isoformat()))
                cursor.execute("INSERT INTO knowledge_graph VALUES (?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "Base Asphalt Cracking", "triggers", "Surface Road Crack", datetime.datetime.now(datetime.timezone.utc).isoformat()))
            elif "water" in c_id:
                cursor.execute("INSERT INTO knowledge_graph VALUES (?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "Corroded Pipe Joints", "causes", "High Pressure Leakage", datetime.datetime.now(datetime.timezone.utc).isoformat()))
                cursor.execute("INSERT INTO knowledge_graph VALUES (?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "High Pressure Leakage", "leads_to", "Sub-surface Pooling", datetime.datetime.now(datetime.timezone.utc).isoformat()))
            elif "environment" in c_id:
                cursor.execute("INSERT INTO knowledge_graph VALUES (?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "Illegal Dump Pile", "attracts", "Pest Aggregations", datetime.datetime.now(datetime.timezone.utc).isoformat()))
                cursor.execute("INSERT INTO knowledge_graph VALUES (?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "Pest Aggregations", "degrades", "Park Soil Quality", datetime.datetime.now(datetime.timezone.utc).isoformat()))
            elif "agriculture" in c_id:
                cursor.execute("INSERT INTO knowledge_graph VALUES (?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "Fungal Infection", "reduces", "Chlorophyll Leaf Capture", datetime.datetime.now(datetime.timezone.utc).isoformat()))
            elif "disaster" in c_id:
                cursor.execute("INSERT INTO knowledge_graph VALUES (?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "Clogged Storm Inlets", "escalates", "Road Inundation", datetime.datetime.now(datetime.timezone.utc).isoformat()))
            elif "energy" in c_id:
                cursor.execute("INSERT INTO knowledge_graph VALUES (?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "Voltage Overload", "induces", "Transformer Fin Fissures", datetime.datetime.now(datetime.timezone.utc).isoformat()))

            # Save timeline memory snapshots
            cursor.execute("INSERT INTO earth_memory VALUES (?, ?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "last_year", 98.5, "optimal", "Optimal condition. Operational.", datetime.datetime.now(datetime.timezone.utc).isoformat()))
            cursor.execute("INSERT INTO earth_memory VALUES (?, ?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "last_month", 92.0, "moderate", "Minor warning indicators flagged.", datetime.datetime.now(datetime.timezone.utc).isoformat()))
            cursor.execute("INSERT INTO earth_memory VALUES (?, ?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "last_week", 88.0, "degraded", "Rapid degradation observed.", datetime.datetime.now(datetime.timezone.utc).isoformat()))
            cursor.execute("INSERT INTO earth_memory VALUES (?, ?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), c_id, "today", 100.0 - case_item["earth_score_delta"], "processing", "Active case mapped.", datetime.datetime.now(datetime.timezone.utc).isoformat()))

        # Seed Field Officers
        officers = [
            ("off-1", "Sarah Connor", "active", 37.7749, -122.4194),
            ("off-2", "John Smith", "active", 37.7850, -122.4010),
            ("off-3", "Elena Rodriguez", "active", 37.7600, -122.4300),
            ("off-4", "David Kim", "active", 37.7650, -122.4110)
        ]
        for off in officers:
            cursor.execute("INSERT INTO field_officers (officer_id, name, status, latitude, longitude, last_updated) VALUES (?, ?, ?, ?, ?, ?)", (off[0], off[1], off[2], off[3], off[4], datetime.datetime.now(datetime.timezone.utc).isoformat()))

        conn.commit()
        print("[Database] Finished seeding PIOS demo database records.")

    conn.close()
    print("[Database] SQLite database initialized successfully with Memory and Graph tables.")

def save_case(data: dict) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    weather = json.dumps(data.get("weather_snapshot", {}))
    geo = json.dumps(data.get("geo_context", {}))
    detections = json.dumps(data.get("detections", []))
    explanation = json.dumps(data.get("explanation", {}))
    rec = json.dumps(data.get("recommendation", {}))
    
    h3_val = data.get("h3_index")
    if not h3_val and h3 and "latitude" in data and "longitude" in data:
        h3_val = h3.latlng_to_cell(data["latitude"], data["longitude"], 9)

    cursor.execute("""
    INSERT INTO cases (
        case_id, client_uuid, domain, category, title, description,
        audio_url, audio_transcript, status, sync_status, severity,
        confidence, risk_score, earth_score_delta, latitude, longitude,
        h3_index, location_text, captured_at, created_by, image_url,
        weather_snapshot, geo_context, detections, explanation,
        recommendation, report_status, version, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["case_id"], data.get("client_uuid"), data["domain"], data["category"], data["title"], data.get("description"),
        data.get("audio_url"), data.get("audio_transcript"), data.get("status", "pending_sync"), 
        data.get("sync_status", "local_only"), data.get("severity", "low"), data.get("confidence", 0.0),
        data.get("risk_score", 0.0), data.get("earth_score_delta", 0.0), data["latitude"], data["longitude"],
        h3_val, data.get("location_text"), data.get("captured_at"), data.get("created_by"), data.get("image_url"),
        weather, geo, detections, explanation, rec, data.get("report_status", "none"), data.get("version", 1),
        data.get("created_at"), data.get("updated_at")
    ))
    conn.commit()
    conn.close()
    return data

def get_case(case_id: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE case_id = ?", (case_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return row_to_dict(row)

def get_case_by_client_uuid(client_uuid: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE client_uuid = ?", (client_uuid,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return row_to_dict(row)

def update_case(case_id: str, updates: dict) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query_parts = []
    values = []
    
    for key, val in updates.items():
        if key in ["case_id", "client_uuid"]:
            continue
        if isinstance(val, (dict, list)):
            val = json.dumps(val)
        query_parts.append(f"{key} = ?")
        values.append(val)
        
    if not query_parts:
        conn.close()
        return get_case(case_id)
        
    values.append(case_id)
    sql = f"UPDATE cases SET {', '.join(query_parts)} WHERE case_id = ?"
    cursor.execute(sql, values)
    conn.commit()
    conn.close()
    return get_case(case_id)

def list_cases(domain: str = None, status: str = None) -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = "SELECT * FROM cases"
    params = []
    filters = []
    
    if domain:
        filters.append("domain = ?")
        params.append(domain)
    if status:
        filters.append("status = ?")
        params.append(status)
        
    if filters:
        sql += " WHERE " + " AND ".join(filters)
        
    sql += " ORDER BY created_at DESC"
    
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

# --- Graph Methods ---
def save_graph_relation(case_id: str, source: str, relationship: str, target: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    relation_id = str(uuid.uuid4())
    cursor.execute("""
    INSERT INTO knowledge_graph (relation_id, case_id, source_node, relationship, target_node, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (relation_id, case_id, source, relationship, target, datetime.datetime.now(datetime.timezone.utc).isoformat()))
    conn.commit()
    conn.close()

def get_graph_by_case(case_id: str) -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM knowledge_graph WHERE case_id = ?", (case_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# --- Memory Methods ---
def save_memory_snapshot(case_id: str, snapshot_time: str, phi: float, status: str, notes: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    memory_id = str(uuid.uuid4())
    cursor.execute("""
    INSERT INTO earth_memory (memory_id, case_id, snapshot_time, regional_phi, status_snapshot, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (memory_id, case_id, snapshot_time, phi, status, notes, datetime.datetime.now(datetime.timezone.utc).isoformat()))
    conn.commit()
    conn.close()

def get_memory_by_case(case_id: str) -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM earth_memory WHERE case_id = ? ORDER BY created_at ASC", (case_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def row_to_dict(row) -> dict:
    d = dict(row)
    for json_field in ["weather_snapshot", "geo_context", "detections", "explanation", "recommendation"]:
        if json_field in d and d[json_field]:
            try:
                d[json_field] = json.loads(d[json_field])
            except:
                d[json_field] = {} if json_field != "detections" else []
    return d

def save_user(user_data: dict) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    user_id = user_data.get("id") or f"usr-{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    cursor.execute("""
    INSERT OR REPLACE INTO users (id, name, email, password_hash, role, organization, department, region, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        user_data.get("name", "New User"),
        user_data.get("email", "").strip().lower(),
        user_data.get("password", "EarthMind@2026"),
        user_data.get("role", "Field Officer"),
        user_data.get("organization", "Government"),
        user_data.get("department", "Roads & Infrastructure"),
        user_data.get("region", "Vijayawada"),
        user_data.get("status", "active"),
        now
    ))
    conn.commit()
    conn.close()
    return get_user_by_email(user_data.get("email", ""))

def get_user_by_email(email: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def list_users() -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, organization, department, region, status, created_at FROM users ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_user_status(user_id: str, new_status: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET status = ? WHERE id = ?", (new_status, user_id))
    conn.commit()
    cursor.execute("SELECT id, name, email, role, organization, department, region, status, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def delete_user(user_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    count = cursor.rowcount
    conn.close()
    return count > 0

