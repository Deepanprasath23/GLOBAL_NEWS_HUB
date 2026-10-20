from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Article(BaseModel):
    id: str
    title: str
    summary: str
    content_url: str
    source: str
    category: str
    published_at: str
    fetched_at: str
    author: Optional[str] = None
    image_url: Optional[str] = None
    score: Optional[int] = None
    comment_count: Optional[int] = None
    trend_score: Optional[float] = 0.0
    is_stale: bool = False
    related_links: List[str] = []

class Category(BaseModel):
    slug: str
    name: str
    description: str
    icon: str

class FeedResponse(BaseModel):
    total: int
    page: int
    limit: int
    category: Optional[str] = None
    sources_active: List[str]
    cached: bool = False
    is_stale: bool = False
    generated_at: str
    articles: List[Article]

class TrendingTopic(BaseModel):
    topic: str
    category: str
    mention_count: int
    sample_headlines: List[str]
    source_names: List[str]
    velocity_score: float
    explanation: str

class TrendingResponse(BaseModel):
    generated_at: str
    trending_topics: List[TrendingTopic]
    top_stories: List[Article]

class BriefingResponse(BaseModel):
    generated_at: str
    greeting: str
    summary_lead: str
    key_bulletins: List[str]
    top_developments: List[Article]
    categories_covered: int

class SourceInfo(BaseModel):
    id: str
    name: str
    category: str
    url: str
    terms_url: str
    description: str
    status: str  # "active" | "degraded" | "unavailable"
    feed_type: str  # "rss" | "rest_api"

class HealthResponse(BaseModel):
    status: str
    version: str
    uptime_seconds: float
    cache: Dict[str, Any]
    active_sources: int
