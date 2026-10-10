# cases.py - API Endpoints for managing Cases in EarthMind AI (PIOS)

import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from apps.api.app.core.db import get_db
from apps.api.app.models.case import Case
from apps.api.app.workers.worker import run_case_analysis_pipeline
from apps.api.app.core.config import settings

router = APIRouter()

# Pydantic schemas for serialization
class CaseCreateSchema(BaseModel):
    client_uuid: Optional[str] = None
    domain: str
    category: str
    title: str
    description: Optional[str] = None
    latitude: float
    longitude: float

class CaseUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    severity: Optional[str] = None

class CaseResponseSchema(BaseModel):
    case_id: str
    client_uuid: Optional[str]
    domain: str
    category: str
    title: str
    description: Optional[str]
    audio_url: Optional[str]
    audio_transcript: Optional[str]
    status: str
    sync_status: str
    severity: str
    confidence: float
    risk_score: float
    earth_score_delta: float
    latitude: float
    longitude: float
    location_text: Optional[str]
    image_url: Optional[str]
    detections: list
    explanation: dict
    recommendation: dict
    report_status: str
    version: int

    class Config:
        orm_mode = True
        from_attributes = True

@router.post("/", response_model=CaseResponseSchema)
def create_case(case_in: CaseCreateSchema, db: Session = Depends(get_db)):
    """Initial step: Register case metadata (returns newly created record)."""
    # Check if duplicate client_uuid (for network retries from offline sync)
    if case_in.client_uuid:
        existing = db.query(Case).filter(Case.client_uuid == case_in.client_uuid).first()
        if existing:
            return existing

    db_case = Case(
        client_uuid=case_in.client_uuid,
        domain=case_in.domain,
        category=case_in.category,
        title=case_in.title,
        description=case_in.description,
        latitude=case_in.latitude,
        longitude=case_in.longitude,
        sync_status="syncing",
        status="pending_sync"
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.post("/{case_id}/media", response_model=CaseResponseSchema)
def upload_case_media(
    case_id: str,
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Secondary step: Upload images and audio notes associated with case."""
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Local file storage mock directory
    upload_dir = "./uploads"
    os.makedirs(upload_dir, exist_ok=True)

    if image:
        image_path = os.path.join(upload_dir, f"{case_id}_{image.filename}")
        with open(image_path, "wb") as f:
            f.write(image.file.read())
        case.image_url = f"/static/{os.path.basename(image_path)}"

    if audio:
        audio_path = os.path.join(upload_dir, f"{case_id}_{audio.filename}")
        with open(audio_path, "wb") as f:
            f.write(audio.file.read())
        case.audio_url = f"/static/{os.path.basename(audio_path)}"

    db.commit()
    db.refresh(case)
    return case

@router.post("/{case_id}/analyze", response_model=CaseResponseSchema)
def trigger_analysis(
    case_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Triggers the async ML pipeline."""
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Launch background processing pipeline
    case.status = "processing"
    db.commit()
    
    background_tasks.add_task(run_case_analysis_pipeline, case_id)
    
    db.refresh(case)
    return case

@router.get("/", response_model=List[CaseResponseSchema])
def list_cases(
    domain: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve filtered case records."""
    query = db.query(Case)
    if domain:
        query = query.filter(Case.domain == domain)
    if status:
        query = query.filter(Case.status == status)
    return query.order_by(Case.created_at.desc()).all()

@router.get("/{case_id}", response_model=CaseResponseSchema)
def get_case(case_id: str, db: Session = Depends(get_db)):
    """Fetch exact case details by ID."""
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.patch("/{case_id}", response_model=CaseResponseSchema)
def update_case(
    case_id: str,
    case_update: CaseUpdateSchema,
    db: Session = Depends(get_db)
):
    """Edit case metadata or manually adjust status."""
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Lock-free check for updates to avoid overwriting newer versions
    case.version += 1
    
    update_data = case_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(case, field, value)

    db.commit()
    db.refresh(case)
    return case
