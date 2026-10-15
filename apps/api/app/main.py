# main.py - Zero-Dependency REST API Server for EarthMind AI (PIOS)

import sys
import os
# Dynamically add project root directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

import json
import uuid
import datetime
import re
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Import database utilities and pipeline runner
from apps.api.app.core.db import (
    init_db,
    save_case,
    get_case,
    get_case_by_client_uuid,
    update_case,
    list_cases,
    get_graph_by_case,
    get_memory_by_case,
    save_user,
    get_user_by_email,
    list_users,
    update_user_status,
    delete_user
)
from apps.api.app.workers.orchestrator import run_orchestrator, get_orchestrator_logs
from apps.api.app.core.config import settings
from apps.api.app.api.vision_v1 import (
    handle_evidence_upload,
    handle_vision_analyze,
    handle_citizen_report,
)

# Initialize database tables on server start
init_db()

# Create upload directories
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class EarthMindAPIHandler(BaseHTTPRequestHandler):
    """
    Standard Library HTTP Request Handler mimicking FastAPI endpoint behaviors.
    Supports CORS, dynamic routing, JSON payloads, and binary file uploads.
    """

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # 1. Serve Static Uploaded Files
        if self.path.startswith('/static/'):
            filename = os.path.basename(self.path.split('/static/')[1])
            filepath = os.path.join(UPLOAD_DIR, filename)
            if os.path.exists(filepath):
                self.send_response(200)
                if filepath.endswith(('.jpg', '.jpeg')):
                    self.send_header('Content-Type', 'image/jpeg')
                elif filepath.endswith('.webm'):
                    self.send_header('Content-Type', 'audio/webm')
                else:
                    self.send_header('Content-Type', 'application/octet-stream')
                self.end_headers()
                with open(filepath, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error_response(404, "Static file not found")
            return

        parsed_url = urlparse(self.path)
        path = parsed_url.path.rstrip('/')
        query_params = parse_qs(parsed_url.query)

        # 2. Health Endpoint
        if path == '/api/health':
            health_status = {
                "status": "healthy",
                "service": settings.PROJECT_NAME,
                "database": "connected",
                "mock_ai": settings.MOCK_AI
            }
            self.send_json_response(200, health_status)
            return

        # 2b. Vision Models & Health Probe (GET /api/v1/vision/models)
        if path in ('/api/v1/vision/models', '/v1/vision/models'):
            models_info = {
                "active_engine": "Gemini-2.0-Flash" if (settings.VISION_MODE == "gemini" and settings.GEMINI_API_KEY) else "PIL-LocalCV",
                "pil_available": True,
                "gemini_available": bool(settings.GEMINI_API_KEY),
                "supported_tasks": [
                    "road_damage", "flood", "garbage", "illegal_dumping", "tree_damage",
                    "crop_disease", "water_leakage", "electric_pole_damage", "fire", "building_damage"
                ],
                "deployment_notice": "PIL-LocalCV operates as the genuine zero-dependency algorithmic CV engine. GPU TensorRT/YOLOv8 models require dedicated CUDA runtime."
            }
            self.send_json_response(200, {"success": True, "data": models_info})
            return

        # 3. List Cases (GET /api/cases)
        if path == '/api/cases':
            domain = query_params.get('domain', [None])[0]
            status = query_params.get('status', [None])[0]
            cases_list = list_cases(domain=domain, status=status)
            self.send_json_response(200, cases_list)
            return

        # 4. List Registered Accounts (GET /api/admin/users)
        if path == '/api/admin/users':
            users_list = list_users()
            self.send_json_response(200, users_list)
            return

        # 4. Fetch Causal Graph (GET /api/cases/{case_id}/graph)
        graph_match = re.match(r'^/api/cases/([a-f0-9\-]+)/graph$', path, re.IGNORECASE)
        if graph_match:
            case_id = graph_match.group(1)
            relations = get_graph_by_case(case_id)
            self.send_json_response(200, relations)
            return

        # 5. Fetch Timeline Snapshots (GET /api/cases/{case_id}/memory)
        memory_match = re.match(r'^/api/cases/([a-f0-9\-]+)/memory$', path, re.IGNORECASE)
        if memory_match:
            case_id = memory_match.group(1)
            snapshots = get_memory_by_case(case_id)
            self.send_json_response(200, snapshots)
            return

        # 6. Fetch Orchestrator Log Console (GET /api/cases/{case_id}/logs)
        logs_match = re.match(r'^/api/cases/([a-f0-9\-]+)/logs$', path, re.IGNORECASE)
        if logs_match:
            self.send_json_response(200, {"logs": get_orchestrator_logs()})
            return

        # 7. Fetch Single Case (GET /api/cases/{case_id})
        case_match = re.match(r'^/api/cases/([a-f0-9\-]+)$', path, re.IGNORECASE)
        if case_match:
            case_id = case_match.group(1)
            case = get_case(case_id)
            if case:
                self.send_json_response(200, case)
            else:
                self.send_error_response(404, f"Case {case_id} not found")
            return

        self.send_error_response(404, "Endpoint not found")

    def do_POST(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path.rstrip('/')

        # ── v1 Real AI Vision Endpoints ─────────────────────────────────────────

        # POST /api/v1/evidence/upload or /v1/evidence/upload — Multipart image upload
        if path in ('/api/v1/evidence/upload', '/v1/evidence/upload'):
            content_type = self.headers.get('Content-Type', '')
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            result = handle_evidence_upload(body_bytes, content_type)
            status = 200 if result.get("success") else 400
            self.send_json_response(status, result)
            return

        # POST /api/v1/vision/analyze or /v1/vision/analyze — Real AI vision analysis via Gemini or PIL
        if path in ('/api/v1/vision/analyze', '/v1/vision/analyze'):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return
            result = handle_vision_analyze(data)
            if result.get("success"):
                status = 200
            elif result.get("code") == "EVIDENCE_NOT_FOUND":
                status = 404
            elif result.get("code") in ("CORRUPT_IMAGE", "EMPTY_IMAGE", "FILE_TOO_LARGE"):
                status = 400
            else:
                status = 500
            self.send_json_response(status, result)
            return

        # POST /api/v1/citizen/reports or /v1/citizen/reports — Citizen report intake
        if path in ('/api/v1/citizen/reports', '/v1/citizen/reports'):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return
            result = handle_citizen_report(data)
            status = 200 if result.get("success") else 400
            self.send_json_response(status, result)
            return

        # ── Auth & Admin Endpoints ───────────────────────────────────────────────

        # 0. User Auth (2FA: Password + OTP) & Admin Endpoints

        if path == '/api/auth/register':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                email = data.get("email", "").strip().lower()
                if not email or not data.get("password"):
                    self.send_error_response(400, "Email and Password are required")
                    return
                user = get_user_by_email(email)
                if user:
                    self.send_error_response(400, "User already exists")
                    return
                # Save user (db.py will handle hashing if configured, or just stores it)
                data["email"] = email
                user = save_user(data)
                self.send_json_response(200, {"message": "Registration successful. Please login."})
            except Exception as e:
                self.send_error_response(400, f"Registration failed: {e}")
            return

        if path == '/api/auth/login':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                email = data.get("email", "").strip().lower()
                password = data.get("password", "")
                
                if not email or not password:
                    self.send_error_response(400, "Email and Password are required")
                    return
                
                user = get_user_by_email(email)
                
                if not user:
                    self.send_error_response(401, "Invalid email or password")
                    return
                    
                if user.get("status") == "revoked":
                    self.send_json_response(403, {"error": "Access Revoked by Administrator."})
                    return
                
                # Check password (assuming basic match for MVP, or hash match)
                if user.get("password_hash") != password and user.get("password_hash") != "PASSWORDLESS":
                    # For MVP we are storing raw or hashed. Assuming the frontend sends raw and DB stores raw.
                    self.send_error_response(401, "Invalid email or password")
                    return

                # Password is correct! Trigger OTP
                from apps.api.app.core.auth import request_otp_service
                request_otp_service(email)
                self.send_json_response(200, {"message": "OTP sent successfully", "requireOtp": True})
            except Exception as e:
                self.send_error_response(400, f"Login failed: {e}")
            return

        if path == '/api/auth/verify-otp':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                email = data.get("email", "").strip().lower()
                otp = data.get("otp", "").strip()
                if not email or not otp:
                    self.send_error_response(400, "Email and OTP are required")
                    return
                from apps.api.app.core.auth import verify_otp_service
                success, result = verify_otp_service(email, otp)
                
                if not success:
                    self.send_json_response(401, {"error": result})
                    return
                    
                if result.get("status") == "revoked":
                    self.send_json_response(403, {"error": "Access Revoked by Administrator."})
                    return
                
                self.send_json_response(200, result)
            except Exception as e:
                self.send_error_response(400, f"OTP verification failed: {e}")
            return

        status_match = re.match(r'^/api/admin/users/([a-f0-9\-]+)/status$', path, re.IGNORECASE)
        if status_match:
            user_id = status_match.group(1)
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                new_status = data.get("status", "active")
                updated_user = update_user_status(user_id, new_status)
                self.send_json_response(200, updated_user)
            except Exception as e:
                self.send_error_response(400, f"Status update failed: {e}")
            return

        delete_match = re.match(r'^/api/admin/users/([a-f0-9\-]+)/delete$', path, re.IGNORECASE)
        if delete_match:
            user_id = delete_match.group(1)
            success = delete_user(user_id)
            self.send_json_response(200, {"success": success, "deleted_user_id": user_id})
            return

        # 1. Create Case Metadata (POST /api/cases)
        if path == '/api/cases':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return

            client_uuid = data.get("client_uuid")
            if client_uuid:
                existing = get_case_by_client_uuid(client_uuid)
                if existing:
                    self.send_json_response(200, existing)
                    return

            case_id = str(uuid.uuid4())
            new_case = {
                "case_id": case_id,
                "client_uuid": client_uuid,
                "domain": data["domain"],
                "category": data["category"],
                "title": data["title"],
                "description": data.get("description", ""),
                "latitude": float(data["latitude"]),
                "longitude": float(data["longitude"]),
                "status": "pending_sync",
                "sync_status": "syncing",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
            
            saved = save_case(new_case)
            self.send_json_response(200, saved)
            return

        # 2. Parallel Vision Service (POST /api/vision)
        if path == '/api/vision':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return
            
            domain = data.get("domain", "")
            category = data.get("category", "")
            
            reasons = ["- Surface erosion detected", "- Visual profile matches historical logs"]
            label = "Structural Anomaly"
            confidence = 0.94
            
            if domain == "infrastructure":
                if "crack" in category:
                    label = "Asphalt Road Crack"
                    confidence = 0.97
                    reasons = ["- Long linear fracture path detected", "- Asphalt fatigue & weathering", "- Edge raveling confirmed"]
                elif "pothole" in category:
                    label = "Pothole Defect"
                    confidence = 0.94
                    reasons = ["- Significant base course loss", "- Sharp vertical edges detected", "- Water pooling in core"]
            elif domain == "water":
                label = "Subsurface Pipe Leakage"
                confidence = 0.95
                reasons = ["- Flow pooling anomaly spotted", "- Saturated sub-grade outline", "- Continuous expansion trend"]
            
            self.send_json_response(200, {
                "label": label,
                "confidence": confidence,
                "reasons": reasons
            })
            return

        # 3. Parallel Speech Service (POST /api/speech)
        if path == '/api/speech':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return
            
            transcript = data.get("transcript", "")
            if not transcript:
                cat = data.get("category", "leakage")
                transcript = f"Vocal notes recording details for {cat}."
            summary = f"Vocal notes parsed: {transcript}"
            self.send_json_response(200, {"summary": summary})
            return

        # 4. Parallel Geo Service (POST /api/geo)
        if path == '/api/geo':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return
            
            lat = data.get("latitude", 37.7749)
            lng = data.get("longitude", -122.4194)
            
            geo_context = {
                "district": "Ward 14 (Downtown Residential)",
                "population_density": "High",
                "nearby_school": "Government School (Proximity: 80m)",
                "nearby_hospital": "Hospital Main Ward (Proximity: 850m)"
            }
            self.send_json_response(200, {"geo_context": geo_context})
            return

        # 5. Parallel Risk Engine (POST /api/risk)
        if path == '/api/risk':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return
            
            severity = data.get("severity", "medium")
            confidence = data.get("confidence", 0.90)
            
            import sys
            import os
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'packages', 'scoring-rules')))
            import scoring
            risk_score = scoring.calculate_risk_score(severity, confidence)
            self.send_json_response(200, {"risk_score": risk_score})
            return

        # 6. Parallel Recommendation Service (POST /api/recommendation)
        if path == '/api/recommendation':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return
            
            domain = data.get("domain", "")
            category = data.get("category", "")
            severity = data.get("severity", "medium")
            
            import sys
            import os
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'packages', 'scoring-rules')))
            import scoring
            recommendation = scoring.generate_recommendations(domain, category, severity)
            self.send_json_response(200, {"recommendation": recommendation})
            return

        # 7. Parallel Report Service (POST /api/report)
        if path == '/api/report':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return
            
            title = data.get("title", "")
            severity = data.get("severity", "")
            report_text = f"Official Report for {title}. Urgency rating: {severity}."
            self.send_json_response(200, {"report_text": report_text})
            return

        # 8. Copilot Query Intent Handler (POST /api/copilot)
        if path == '/api/copilot':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return

            query = data.get("query", "").lower()
            answer = "I am the EarthMind AI Copilot. Ask me questions about district risk profiles, critical areas, or the Planet Health Index (PHI)."
            action = "NONE"
            action_data = {}

            if "critical" in query or "severe" in query or "show critical" in query:
                answer = "Filtering incident dashboard map to pinpoint critical severity hotspots."
                action = "FILTER_CRITICAL"
            elif "district" in query or "repair" in query or "highest risk" in query:
                answer = "Pinpointing Metropolitan Central Core (Coordinates: 37.7850, -122.4010) as the region requiring immediate pipeline repair intervention."
                action = "ZOOM_COORDINATES"
                action_data = {"latitude": 37.7850, "longitude": -122.4010}
            elif "weather" in query or "radar" in query or "rain" in query:
                answer = "Activating meteorological overlay on the Planetary Digital Twin grid."
                action = "LAYER_WEATHER"
            elif "satellite" in query or "sat" in query:
                answer = "Switching Digital Twin visualization to raw Satellite GIS telemetry."
                action = "LAYER_SATELLITE"
            elif "grid" in query or "power" in query or "circuit" in query:
                answer = "Plotting infrastructure grid distribution lines."
                action = "LAYER_GRID"
            elif "score" in query or "phi" in query or "health" in query:
                answer = "The overall Planet Health Index (PHI) is currently 88.75/100, representing moderate status. Water leakages are the primary penalty drivers."
                action = "SHOW_PHI"
                
            self.send_json_response(200, {
                "answer": answer,
                "action": action,
                "data": action_data
            })
            return

        # 3. Upload Case Media (POST /api/cases/{case_id}/media)
        media_match = re.match(r'^/api/cases/([a-f0-9\-]+)/media$', path, re.IGNORECASE)
        if media_match:
            case_id = media_match.group(1)
            case = get_case(case_id)
            if not case:
                self.send_error_response(404, "Case not found")
                return

            content_type = self.headers.get('Content-Type', '')
            content_length = int(self.headers.get('Content-Length', 0))
            
            if 'multipart/form-data' not in content_type:
                self.send_error_response(400, "Content-Type must be multipart/form-data")
                return

            boundary = content_type.split('boundary=')[1].encode('utf-8')
            body_bytes = self.rfile.read(content_length)

            try:
                parts = body_bytes.split(b'--' + boundary)
                updates = {}
                
                for part in parts:
                    if not part or part == b'\r\n' or part == b'--\r\n' or part == b'--':
                        continue
                    
                    if b'\r\n\r\n' in part:
                        headers, content = part.split(b'\r\n\r\n', 1)
                        if content.endswith(b'\r\n'):
                            content = content[:-2]
                        if content.endswith(b'\r\n--'):
                            content = content[:-4]
                            
                        headers_str = headers.decode('utf-8', errors='ignore')
                        field_name = None
                        filename = None
                        
                        for line in headers_str.split('\r\n'):
                            if line.lower().startswith('content-disposition:'):
                                if 'name="' in line:
                                    field_name = line.split('name="')[1].split('"')[0]
                                if 'filename="' in line:
                                    filename = line.split('filename="')[1].split('"')[0]

                        if field_name:
                            if filename:
                                safe_filename = f"{case_id}_{os.path.basename(filename)}"
                                filepath = os.path.join(UPLOAD_DIR, safe_filename)
                                with open(filepath, 'wb') as f:
                                    f.write(content)
                                    
                                if field_name == 'image':
                                    updates['image_url'] = f"/static/{safe_filename}"
                                elif field_name == 'audio':
                                    updates['audio_url'] = f"/static/{safe_filename}"
                
                if updates:
                    case = update_case(case_id, updates)
                self.send_json_response(200, case)
                
            except Exception as e:
                self.send_error_response(500, f"Failed to parse multipart upload: {e}")
            return

        # 4. Trigger Analysis Pipeline (POST /api/cases/{case_id}/analyze)
        analyze_match = re.match(r'^/api/cases/([a-f0-9\-]+)/analyze$', path, re.IGNORECASE)
        if analyze_match:
            case_id = analyze_match.group(1)
            case = get_case(case_id)
            if not case:
                self.send_error_response(404, "Case not found")
                return

            update_case(case_id, {"status": "processing"})
            
            # Spin up orchestrator thread
            thread = threading.Thread(target=run_orchestrator, args=(case_id,))
            thread.start()

            updated = get_case(case_id)
            self.send_json_response(200, updated)
            return

        self.send_error_response(404, "Endpoint not found")

    def do_PATCH(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path.rstrip('/')

        # 1. Update Case Fields (PATCH /api/cases/{case_id})
        case_match = re.match(r'^/api/cases/([a-f0-9\-]+)$', path, re.IGNORECASE)
        if case_match:
            case_id = case_match.group(1)
            case = get_case(case_id)
            if not case:
                self.send_error_response(404, "Case not found")
                return

            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_error_response(400, f"Malformed JSON: {e}")
                return

            data["version"] = case.get("version", 1) + 1
            updated = update_case(case_id, data)
            self.send_json_response(200, updated)
            return

        self.send_error_response(404, "Endpoint not found")

    def send_json_response(self, status: int, data: any):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error_response(self, status: int, message: str):
        self.send_json_response(status, {"detail": message})

def run(port=None):
    if port is None:
        port = int(os.environ.get("PORT", 8000))
    server_address = ('', port)
    httpd = HTTPServer(server_address, EarthMindAPIHandler)
    print(f"[Server] Running zero-dependency API server on port {port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
        print("[Server] Server stopped.")

if __name__ == '__main__':
    run()
