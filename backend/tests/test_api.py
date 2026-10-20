import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ingestion.deduplicator import (
    generate_article_id,
    clean_title,
    deduplicate_articles
)
from backend.app.schemas.models import Article
from backend.app.cache import InMemoryTTLCache

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "cache" in data
    assert data["active_sources"] > 0

def test_categories_endpoint():
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 8
    slugs = [c["slug"] for c in categories]
    assert "world-news" in slugs
    assert "technology" in slugs
    assert "artificial-intelligence" in slugs
    assert "sports" in slugs
    assert "business" in slugs
    assert "layoffs" in slugs
    assert "entertainment" in slugs
    assert "india-regional" in slugs

def test_sources_endpoint():
    response = client.get("/api/v1/sources")
    assert response.status_code == 200
    sources = response.json()
    assert len(sources) >= 5
    for s in sources:
        assert "name" in s
        assert "url" in s
        assert "terms_url" in s
        assert s["status"] in ["active", "degraded", "unavailable"]

def test_deduplication_logic():
    # Test title cleaning
    raw = "Massive Breakthrough Announced in Quantum Computing - BBC News"
    assert clean_title(raw) == "Massive Breakthrough Announced in Quantum Computing"

    # Test duplicate identification and related link merging
    art1 = Article(
        id=generate_article_id("https://bbc.com/story1", "New AI Model Released Today"),
        title="New AI Model Released Today",
        summary="A major announcement regarding a novel model.",
        content_url="https://bbc.com/story1",
        source="BBC News",
        category="technology",
        published_at="2026-10-20T12:00:00Z",
        fetched_at="2026-10-20T12:05:00Z"
    )
    art2 = Article(
        id=generate_article_id("https://techcrunch.com/story2", "New AI Model Released Today"),
        title="New AI Model Released Today",
        summary="TechCrunch report on the newly unveiled model.",
        content_url="https://techcrunch.com/story2",
        source="TechCrunch",
        category="technology",
        published_at="2026-10-20T12:01:00Z",
        fetched_at="2026-10-20T12:05:00Z"
    )

    deduped = deduplicate_articles([art1, art2])
    assert len(deduped) == 1
    assert "https://techcrunch.com/story2" in deduped[0].related_links

def test_in_memory_ttl_cache():
    import asyncio
    async def _run_test():
        cache = InMemoryTTLCache(maxsize=5, default_ttl=1)
        await cache.set("test-key", {"msg": "hello"}, ttl=1)
        
        val = await cache.get("test-key")
        assert val == {"msg": "hello"}
        
        # Wait for TTL expiry
        await asyncio.sleep(1.1)
        val_expired = await cache.get("test-key")
        assert val_expired is None
        
        # Stale backup should still be available
        stale = await cache.get_stale("test-key")
        assert stale is not None
        assert stale[0] == {"msg": "hello"}

    asyncio.run(_run_test())

