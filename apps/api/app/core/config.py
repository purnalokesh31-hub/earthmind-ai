# config.py - Standard Library Application configuration

import os

class Settings:
    PROJECT_NAME: str = "EarthMind AI (PIOS)"
    API_V1_STR: str = "/api"
    
    # Fallback to sqlite local file for maximum feasibility/out-of-the-box runnability
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./earthmind.db"
    )
    
    # Run inline background tasks or use celery
    USE_CELERY: bool = os.getenv("USE_CELERY", "false").lower() == "true"
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Mocking AI inference for ease of deployment
    MOCK_AI: bool = os.getenv("MOCK_AI", "false").lower() == "true"
    
    # OpenWeatherMap or other API keys (optional)
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    
    # Google Gemini Vision API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Vision mode: "gemini" | "pil" | "mock"
    VISION_MODE: str = os.getenv("VISION_MODE", "gemini" if os.getenv("GEMINI_API_KEY") else "pil")
    
    # Evidence storage directory
    EVIDENCE_DIR: str = os.getenv("EVIDENCE_DIR", "./uploads/evidence")

settings = Settings()

