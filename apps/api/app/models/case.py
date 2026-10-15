# case.py - Case model definition (with safe fallback if SQLAlchemy is not installed)

import uuid
import datetime

try:
    from sqlalchemy import Column, String, Float, Numeric, DateTime, Integer, JSON
    try:
        from apps.api.app.core.db import Base
    except ImportError:
        from sqlalchemy.ext.declarative import declarative_base
        Base = declarative_base()
    _SQLALCHEMY_AVAILABLE = True
except ImportError:
    _SQLALCHEMY_AVAILABLE = False
    Base = object

if _SQLALCHEMY_AVAILABLE:
    class Case(Base):
        __tablename__ = "cases"

        case_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
        client_uuid = Column(String, unique=True, index=True, nullable=True)
        domain = Column(String, nullable=False)
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
        
        weather_snapshot = Column(JSON, default=dict)
        geo_context = Column(JSON, default=dict)
        detections = Column(JSON, default=list)
        explanation = Column(JSON, default=dict)
        recommendation = Column(JSON, default=dict)
        
        report_status = Column(String, default="none")
        version = Column(Integer, default=1)
        
        created_at = Column(DateTime, default=datetime.datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
else:
    class Case:
        """Lightweight container when SQLAlchemy is omitted."""
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
