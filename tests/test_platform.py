# test_platform.py - Automated validation script for EarthMind AI (PIOS)

import sys
import os
import datetime

# Append the project root to sys.path so modules can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'packages', 'scoring-rules')))

# Mock environment variables before importing config
os.environ["DATABASE_URL"] = "sqlite:///./test_earthmind.db"
os.environ["MOCK_AI"] = "true"

from apps.api.app.core.db import init_db, save_case, get_case, get_graph_by_case, get_memory_by_case, DB_FILE
from apps.api.app.workers.worker import run_case_analysis_pipeline
import scoring

def run_tests():
    print("==================================================")
    print("[TEST] Starting EarthMind AI Platform Automated Tests")
    print("==================================================")
    
    # Overwrite the db file path locally for tests
    global DB_FILE
    import apps.api.app.core.db
    apps.api.app.core.db.DB_FILE = "./test_earthmind.db"
    
    # Ensure a clean database state
    if os.path.exists("./test_earthmind.db"):
        os.remove("./test_earthmind.db")
        
    init_db()
    print("[Test] Database schema initialized.")
    
    # ----------------------------------------------------
    # Test 1: Scoring Logic Validation
    # ----------------------------------------------------
    print("\n--- Test 1: Verification of Scoring Rules ---")
    
    sev_low = scoring.calculate_severity_score("low")
    assert sev_low == 15.0, f"Expected 15.0, got {sev_low}"
    print(f"[OK] severity low matches: {sev_low}")

    sev_crit = scoring.calculate_severity_score("critical")
    assert sev_crit == 100.0, f"Expected 100.0, got {sev_crit}"
    print(f"[OK] severity critical matches: {sev_crit}")

    # Check water leakage multiplier impact (base 7.5 * 1.5 = 11.25)
    leak_impact = scoring.calculate_earth_score_impact("high", "leakage")
    assert leak_impact == 11.25, f"Expected 11.25, got {leak_impact}"
    print(f"[OK] earth score impact (high leakage) matches: {leak_impact}")

    # Check composite risk score
    risk = scoring.calculate_risk_score("high", 0.90)
    expected_risk = round((75.0 * 0.7) + (0.90 * 30.0), 1)
    assert risk == expected_risk, f"Expected {expected_risk}, got {risk}"
    print(f"[OK] composite risk score matches: {risk}")

    # Check recommendations structure
    recs = scoring.generate_recommendations("infrastructure", "pothole", "critical")
    assert recs["urgency"] == "Immediate"
    assert "Apply temporary cold patch or schedule road crew repair." in recs["action_steps"]
    print(f"[OK] action recommendations check passed: {recs['urgency']} urgency.")

    # ----------------------------------------------------
    # Test 2: AI Pipeline & Case Sync Lifecycle
    # ----------------------------------------------------
    print("\n--- Test 2: Pipeline Case Intake, Transcription, and Analysis ---")
    
    # Create simulated case intake dict
    case_id = "test-case-uuid-xyz-456"
    test_case_data = {
        "case_id": case_id,
        "client_uuid": "client-uuid-abc-123",
        "domain": "water",
        "category": "leakage",
        "title": "Pipe Burst on Elm Street",
        "description": "", # Empty, should be populated by audio note transcription
        "audio_url": "/static/elm_street_note.webm",
        "latitude": 37.7850,
        "longitude": -122.4010,
        "sync_status": "syncing",
        "status": "pending_sync",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    save_case(test_case_data)
    print(f"[OK] Saved raw case intake record. Case ID: {case_id}")
    
    # Run the worker pipeline
    run_case_analysis_pipeline(case_id)
    
    # Verify results
    case_record = get_case(case_id)
    assert case_record["status"] == "analyzed"
    print(f"[OK] status updated to: {case_record['status']}")
    
    assert case_record["audio_transcript"] is not None
    assert "leak" in case_record["audio_transcript"].lower()
    print(f"[OK] audio transcribing result matches: \"{case_record['audio_transcript']}\"")

    assert case_record["earth_score_delta"] > 0.0
    print(f"[OK] calculated earth score delta penalty: -{case_record['earth_score_delta']}")
    
    assert len(case_record["detections"]) > 0
    print(f"[OK] vision detections tags count: {len(case_record['detections'])} - {case_record['detections']}")
    
    assert case_record["recommendation"] is not None
    print(f"[OK] advisory recommendation list populated: {case_record['recommendation']}")
    
    # ----------------------------------------------------
    # Test 3: Causal Graph and Memory Timeline Snapshot Verification
    # ----------------------------------------------------
    print("\n--- Test 3: Verification of Graph Relations & Earth Memory Snapshots ---")
    
    graph_relations = get_graph_by_case(case_id)
    assert len(graph_relations) > 0, "Expected knowledge graph relations to be populated"
    print(f"[OK] graph relations count: {len(graph_relations)}")
    
    # Check specific expected water leak triggers
    relation_keys = {(r["source_node"], r["relationship"], r["target_node"]) for r in graph_relations}
    expected_relation = ("Corroded Pipe", "triggers", "Underground Leakage")
    assert expected_relation in relation_keys, f"Expected relationship {expected_relation} to be present"
    print(f"[OK] verified specific causal relationship: {expected_relation}")
    
    memory_snapshots = get_memory_by_case(case_id)
    assert len(memory_snapshots) == 4, f"Expected exactly 4 memory snapshots, got {len(memory_snapshots)}"
    snapshot_times = [m["snapshot_time"] for m in memory_snapshots]
    assert "last_year" in snapshot_times
    assert "last_month" in snapshot_times
    assert "last_week" in snapshot_times
    assert "today" in snapshot_times
    print(f"[OK] verified all 4 historical timeline snapshots: {snapshot_times}")
    
    # ----------------------------------------------------
    # Test 4: User Account Persistence & Admin Revocation
    # ----------------------------------------------------
    print("\n--- Test 4: User Account Database & Admin Grant/Revoke Access ---")
    from apps.api.app.core.db import save_user, get_user_by_email, list_users, update_user_status
    
    # Test saving new account
    new_user = save_user({
        "name": "Test Officer",
        "email": "test.officer@earthmind.ai",
        "password": "SecurePassword123",
        "role": "Field Officer",
        "organization": "Government",
        "status": "active"
    })
    assert new_user["email"] == "test.officer@earthmind.ai", "User email should match"
    print("[OK] User account saved to SQLite database successfully.")
    
    # Verify listing users
    all_users = list_users()
    assert len(all_users) >= 1, f"Expected at least 1 user, got {len(all_users)}"
    print(f"[OK] Fetched {len(all_users)} user accounts from database.")
    
    # Test Admin Revoke Access
    revoked_user = update_user_status(new_user["id"], "revoked")
    assert revoked_user["status"] == "revoked", "User status should be updated to revoked"
    print("[OK] Admin revoked user access successfully.")

    # Test Admin Grant Access Back
    granted_user = update_user_status(new_user["id"], "active")
    assert granted_user["status"] == "active", "User status should be updated back to active"
    print("[OK] Admin granted user access back successfully.")

    # Cleanup database file
    if os.path.exists("./test_earthmind.db"):
        os.remove("./test_earthmind.db")
        
    print("\n==================================================")
    print("[SUCCESS] All validation checks completed successfully!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
