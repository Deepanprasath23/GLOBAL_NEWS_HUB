import asyncio
import datetime
import logging
from typing import List, Optional, Tuple, Dict
from backend.app.cache import cache
from backend.app.schemas.models import (
    Article,
    Category,
    FeedResponse,
    BriefingResponse,
    SourceInfo
)
from backend.app.ingestion.rss_fetcher import fetch_rss_feeds_by_category, REGISTERED_FEEDS
from backend.app.ingestion.hacker_news import fetch_hacker_news_stories
from backend.app.ingestion.deduplicator import deduplicate_articles, tokenize

logger = logging.getLogger("services.aggregator")

CATEGORIES_REGISTRY: List[Category] = [
    Category(slug="world-news", name="World News", description="International affairs, geopolitical events, and major global developments.", icon="Globe"),
    Category(slug="politics", name="Politics", description="Government policies, international diplomacy, and geopolitical decisions.", icon="Landmark"),
    Category(slug="technology", name="Technology", description="Software breakthroughs, developer tools, hardware, and startup ecosystems.", icon="Cpu"),
    Category(slug="artificial-intelligence", name="Artificial Intelligence", description="Foundational models, AI research, open-source innovations, and industry shifts.", icon="Bot"),
    Category(slug="sports", name="Sports", description="Global football, cricket, tennis, tournament updates, and athlete milestones.", icon="Trophy"),
    Category(slug="business", name="Business", description="Global markets, corporate developments, funding, and macroeconomic trends.", icon="TrendingUp"),
    Category(slug="layoffs", name="Layoffs & Workforce", description="Corporate restructuring, tech workforce reductions, and hiring market shifts.", icon="Briefcase"),
    Category(slug="entertainment", name="Entertainment", description="Cinema, streaming releases, culture, and industry developments.", icon="Film"),
    Category(slug="music", name="Music", description="New releases, industry charts, festivals, and music artist coverage.", icon="Music"),
    Category(slug="india-regional", name="India & Regional", description="National Indian developments, regional policies, and cultural coverage.", icon="Compass"),
]

SOURCES_REGISTRY: List[SourceInfo] = [
    SourceInfo(
        id="bbc-news",
        name="BBC World News",
        category="world-news",
        url="https://www.bbc.com/news",
        terms_url="https://www.bbc.co.uk/usingthebbc/terms-of-use/",
        description="Public service broadcaster delivering verified global reporting.",
        status="active",
        feed_type="rss"
    ),
    SourceInfo(
        id="hacker-news",
        name="Hacker News",
        category="technology",
        url="https://news.ycombinator.com",
        terms_url="https://www.ycombinator.com/legal/",
        description="Curated computer science, technology, and entrepreneurship community.",
        status="active",
        feed_type="rest_api"
    ),
    SourceInfo(
        id="the-hindu",
        name="The Hindu",
        category="india-regional",
        url="https://www.thehindu.com",
        terms_url="https://www.thehindu.com/terms-of-use/",
        description="One of India's most respected national news organizations.",
        status="active",
        feed_type="rss"
    ),
    SourceInfo(
        id="techcrunch",
        name="TechCrunch",
        category="technology",
        url="https://techcrunch.com",
        terms_url="https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html",
        description="Leading coverage of tech startups, venture capital, and Silicon Valley.",
        status="active",
        feed_type="rss"
    ),
    SourceInfo(
        id="espn",
        name="ESPN & Cricinfo",
        category="sports",
        url="https://www.espn.com",
        terms_url="https://disneytermsofuse.com/",
        description="Comprehensive international sports news, cricket scores, and tournament coverage.",
        status="active",
        feed_type="rss"
    ),
    SourceInfo(
        id="ndtv",
        name="NDTV News",
        category="india-regional",
        url="https://www.ndtv.com",
        terms_url="https://www.ndtv.com/convergence/ndtv/new/terms_and_conditions.aspx",
        description="Prominent Indian media network broadcasting national and regional events.",
        status="active",
        feed_type="rss"
    ),
    SourceInfo(
        id="npr",
        name="NPR News",
        category="world-news",
        url="https://www.npr.org",
        terms_url="https://www.npr.org/about-npr/179876898/terms-of-use",
        description="Independent, nonprofit media organization providing global journalism.",
        status="active",
        feed_type="rss"
    ),
]

class FeedAggregator:
    async def get_raw_feed(self, category: Optional[str] = None) -> Tuple[List[Article], bool, bool]:
        """
        Fetch normalized, deduplicated articles for a given category (or all).
        Utilizes temporary in-memory TTL caching with stale-on-error fallback.
        Returns: (articles, is_cached, is_stale)
        """
        cache_key = f"feed:category:{category or 'all'}"
        
        # Check cache
        cached_result = await cache.get(cache_key)
        if cached_result is not None:
            return cached_result, True, False

        # Fetch fresh data
        try:
            tasks = [fetch_rss_feeds_by_category(category)]
            # If category includes tech, AI, or is all, include Hacker News
            if category in (None, "technology", "artificial-intelligence"):
                tasks.append(fetch_hacker_news_stories(limit=30))

            results = await asyncio.gather(*tasks, return_exceptions=True)
            combined: List[Article] = []
            for r in results:
                if isinstance(r, list):
                    combined.extend(r)

            if not combined:
                # If upstream returned nothing, try to serve stale backup
                stale_backup = await cache.get_stale(cache_key)
                if stale_backup:
                    articles, _ = stale_backup
                    for a in articles:
                        a.is_stale = True
                    return articles, True, True
                return [], False, False

            # Sort by publication date descending
            def parse_date(a: Article):
                try:
                    return datetime.datetime.fromisoformat(a.published_at.replace("Z", "+00:00"))
                except Exception:
                    return datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)

            combined.sort(key=parse_date, reverse=True)
            deduped = deduplicate_articles(combined)

            # Store in cache
            await cache.set(cache_key, deduped)
            return deduped, False, False

        except Exception as e:
            logger.error(f"Error aggregating feed for category {category}: {e}")
            # Try serving stale backup on error
            stale_backup = await cache.get_stale(cache_key)
            if stale_backup:
                articles, _ = stale_backup
                for a in articles:
                    a.is_stale = True
                return articles, True, True
            return [], False, False

    async def get_feed_paginated(
        self,
        category: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> FeedResponse:
        articles, is_cached, is_stale = await self.get_raw_feed(category)
        
        # Filter strictly if specific category requested
        if category:
            filtered = [
                a for a in articles
                if a.category == category or (category == "world-news" and a.category in ["world-news", "politics"])
            ]
        else:
            filtered = articles

        total = len(filtered)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_articles = filtered[start_idx:end_idx]

        active_sources = list({a.source for a in filtered})

        return FeedResponse(
            total=total,
            page=page,
            limit=limit,
            category=category,
            sources_active=active_sources,
            cached=is_cached,
            is_stale=is_stale,
            generated_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            articles=paginated_articles
        )

    async def search_articles(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 30
    ) -> FeedResponse:
        """Search in-memory current live feed items matching the search query terms."""
        articles, is_cached, is_stale = await self.get_raw_feed(category=None)
        
        query_tokens = tokenize(query)
        matching_articles: List[Article] = []

        for art in articles:
            if category and art.category != category:
                continue

            text_tokens = tokenize(f"{art.title} {art.summary} {art.source}")
            # Score match
            match_count = len(query_tokens.intersection(text_tokens))
            if match_count > 0 or query.lower() in art.title.lower():
                matching_articles.append(art)

        # Sort matches by recency and relevance
        paginated = matching_articles[:limit]
        active_sources = list({a.source for a in paginated})

        return FeedResponse(
            total=len(matching_articles),
            page=1,
            limit=limit,
            category=category,
            sources_active=active_sources,
            cached=is_cached,
            is_stale=is_stale,
            generated_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            articles=paginated
        )

    async def get_article_by_id(self, article_id: str) -> Optional[Article]:
        articles, _, _ = await self.get_raw_feed(category=None)
        for art in articles:
            if art.id == article_id:
                return art
        return None

    async def get_briefing(self) -> BriefingResponse:
        """Generate a concise daily global briefing across core categories."""
        cache_key = "briefing:global"
        cached = await cache.get(cache_key)
        if cached:
            return cached

        articles, _, _ = await self.get_raw_feed(category=None)
        
        # Select highest quality story from each category
        categories_represented = set()
        briefing_stories: List[Article] = []
        bulletins: List[str] = []

        for art in articles:
            if art.category not in categories_represented and len(briefing_stories) < 8:
                categories_represented.add(art.category)
                briefing_stories.append(art)
                bulletins.append(f"[{art.source}] {art.title}")

        now = datetime.datetime.now(datetime.timezone.utc)
        hour = now.hour
        greeting = "Good Morning" if 4 <= hour < 12 else "Good Afternoon" if 12 <= hour < 18 else "Good Evening"

        briefing = BriefingResponse(
            generated_at=now.isoformat(),
            greeting=f"{greeting}, Global Intelligence Brief",
            summary_lead="A unified 2-minute overview of pivotal international developments, technology breakthroughs, and economic updates.",
            key_bulletins=bulletins,
            top_developments=briefing_stories,
            categories_covered=len(categories_represented)
        )

        await cache.set(cache_key, briefing, ttl=300)
        return briefing

aggregator = FeedAggregator()
