# case.py - SQLAlchemy Case model

import uuid
import datetime
from sqlalchemy import Column, String, Float, Numeric, DateTime, Integer, JSON
from apps.api.app.core.db import Base

class Case(Base):
    __tablename__ = "cases"

    case_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_uuid = Column(String, unique=True, index=True, nullable=True)
    domain = Column(String, nullable=False)  # infrastructure, environment, water
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    audio_url = Column(String, nullable=True)
    audio_transcript = Column(String, nullable=True)
    
    status = Column(String, default="pending_sync")
    sync_status = Column(String, default="local_only")
    severity = Column(String, default="low")
    
    confidence = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    earth_score_delta = Column(Float, default=0.0)
    
    latitude = Column(Numeric(9, 6), nullable=False)
    longitude = Column(Numeric(9, 6), nullable=False)
    location_text = Column(String, nullable=True)
    
    captured_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_by = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    
    # Store dynamic metadata as JSON dicts
    weather_snapshot = Column(JSON, default=dict)
    geo_context = Column(JSON, default=dict)
    detections = Column(JSON, default=list)
    explanation = Column(JSON, default=dict)
    recommendation = Column(JSON, default=dict)
    
    report_status = Column(String, default="none")
    version = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
