from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from backend.app.config import settings
from backend.app.api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
# Global Trends & Information Hub REST API

A completely free, public REST API providing normalized, deduplicated global news, 
technology updates, artificial intelligence research, sports, business layoffs, 
and cultural trends aggregated from real, verified sources.

### Core Principles
- **No authentication or keys required** for core read endpoints.
- **No permanent storage or database**: all responses are temporarily cached in memory (2-5 minutes TTL).
- **Legitimate data only**: Real RSS feeds and official APIs (BBC, NPR, Hacker News, The Hindu, ESPN, TechCrunch).
- **Zero fabrication**: Original links and attributions preserved on every story.
    """,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local development & Netlify static frontend
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

# Global router inclusion
app.include_router(router)

@app.get("/", include_in_schema=False)
async def root():
    return {
        "message": "Welcome to Global Trends & Information Hub API",
        "documentation": "/docs",
        "health": "/api/v1/health",
        "feed": "/api/v1/feed",
        "categories": "/api/v1/categories",
        "trending": "/api/v1/trending",
        "briefing": "/api/v1/briefing",
        "sources": "/api/v1/sources"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred while processing the request. Please try again shortly."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
