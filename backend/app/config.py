import os
from typing import List

class Settings:
    PROJECT_NAME: str = "Global Trends & Information Hub"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Cache settings (In-memory TTL)
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "240"))  # 4 minutes default
    MAX_CACHE_ITEMS: int = int(os.getenv("MAX_CACHE_ITEMS", "1000"))
    
    # Network settings
    REQUEST_TIMEOUT: float = float(os.getenv("REQUEST_TIMEOUT", "6.0"))
    MAX_CONCURRENT_REQUESTS: int = 8
    
    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,https://globaltrendshub.netlify.app,*"
        ).split(",")
        if origin.strip()
    ]
    
    # User-Agent for compliant RSS and API calls
    USER_AGENT: str = "GlobalTrendsHub/1.0 (+https://globaltrendshub.netlify.app; respectful news aggregator)"

settings = Settings()
