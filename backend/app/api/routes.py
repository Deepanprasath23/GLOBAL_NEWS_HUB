import time
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, Path
from backend.app.config import settings
from backend.app.cache import cache
from backend.app.schemas.models import (
    Article,
    Category,
    FeedResponse,
    TrendingResponse,
    BriefingResponse,
    SourceInfo,
    HealthResponse
)
from backend.app.services.aggregator import (
    aggregator,
    CATEGORIES_REGISTRY,
    SOURCES_REGISTRY
)
from backend.app.services.trending import analyze_trending

router = APIRouter(prefix="/api/v1", tags=["Global Trends & News"])

_START_TIME = time.time()

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health and Operational Status",
    description="Returns backend uptime, in-memory cache statistics, and service health without persistent storage."
)
async def get_health():
    uptime = time.time() - _START_TIME
    stats = await cache.stats()
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        uptime_seconds=round(uptime, 2),
        cache=stats,
        active_sources=len(SOURCES_REGISTRY)
    )

@router.get(
    "/feed",
    response_model=FeedResponse,
    summary="Unified Global Feed",
    description="Fetches live articles across all categories, normalized and deduplicated from real external sources."
)
async def get_feed(
    page: int = Query(1, ge=1, le=50, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Number of stories per page"),
    category: Optional[str] = Query(None, description="Optional category filter slug")
):
    return await aggregator.get_feed_paginated(category=category, page=page, limit=limit)

@router.get(
    "/categories",
    response_model=List[Category],
    summary="Information Categories",
    description="Returns all supported categories with descriptive metadata and UI iconography."
)
async def get_categories():
    return CATEGORIES_REGISTRY

@router.get(
    "/categories/{slug}",
    response_model=FeedResponse,
    summary="Category Stories",
    description="Returns live stories specifically filtered for a category slug (e.g. world-news, technology, sports)."
)
async def get_category_feed(
    slug: str = Path(..., description="Category slug"),
    page: int = Query(1, ge=1, le=50, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    valid_slugs = {c.slug for c in CATEGORIES_REGISTRY}
    if slug not in valid_slugs:
        raise HTTPException(
            status_code=404,
            detail=f"Category '{slug}' not found. Valid categories: {', '.join(sorted(valid_slugs))}"
        )
    return await aggregator.get_feed_paginated(category=slug, page=page, limit=limit)

@router.get(
    "/trending",
    response_model=TrendingResponse,
    summary="Measurable Trending Topics & Stories",
    description="Analyzes genuine measurable signals across independent sources and community engagement without artificial metrics."
)
async def get_trending():
    cache_key = "trending:topics"
    cached = await cache.get(cache_key)
    if cached:
        return cached

    articles, _, _ = await aggregator.get_raw_feed(category=None)
    trending_data = analyze_trending(articles)
    await cache.set(cache_key, trending_data, ttl=180)
    return trending_data

@router.get(
    "/search",
    response_model=FeedResponse,
    summary="Search Available Information",
    description="Performs keyword and token search across current live global articles and titles."
)
async def search_articles(
    q: str = Query(..., min_length=2, max_length=100, description="Search query keyword or phrase"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    limit: int = Query(30, ge=1, le=100, description="Maximum results to return")
):
    return await aggregator.search_articles(query=q, category=category, limit=limit)

@router.get(
    "/articles/{article_id}",
    response_model=Article,
    summary="Article Details",
    description="Fetches metadata, verified source description, and direct attribution link for an article ID."
)
async def get_article(article_id: str = Path(..., description="Hexadecimal article identifier")):
    art = await aggregator.get_article_by_id(article_id)
    if not art:
        raise HTTPException(status_code=404, detail="Article not found in the current live feed.")
    return art

@router.get(
    "/briefing",
    response_model=BriefingResponse,
    summary="Global Executive Brief",
    description="Generates an editorial summary lead and cross-category key bulletins for rapid 2-minute catching up."
)
async def get_briefing():
    return await aggregator.get_briefing()

@router.get(
    "/sources",
    response_model=List[SourceInfo],
    summary="Data Sources & Attribution Directory",
    description="Full transparent list of external feeds and APIs utilized, attribution rules, and licensing terms."
)
async def get_sources():
    return SOURCES_REGISTRY
