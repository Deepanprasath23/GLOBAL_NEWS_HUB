import asyncio
import datetime
import logging
from typing import List, Optional
import httpx

from backend.app.config import settings
from backend.app.schemas.models import Article
from backend.app.ingestion.deduplicator import generate_article_id, clean_title

logger = logging.getLogger("ingestion.hn")

AI_KEYWORDS = {
    "ai", "llm", "gpt", "openai", "claude", "anthropic", "gemini",
    "deepmind", "neural", "machine learning", "diffusion", "rag",
    "transformer", "qwen", "mistral", "llama", "deepseek"
}

def is_ai_related(title: str) -> bool:
    words = title.lower().split()
    return any(w.strip(".,;:?!()[]{}") in AI_KEYWORDS for w in words)

async def fetch_hn_item(client: httpx.AsyncClient, story_id: int) -> Optional[Article]:
    try:
        url = f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
        res = await client.get(url, timeout=settings.REQUEST_TIMEOUT)
        if res.status_code != 200:
            return None
        data = res.json()
        if not data or data.get("type") != "story" or data.get("deleted") or data.get("dead"):
            return None

        title = clean_title(data.get("title", ""))
        story_url = data.get("url") or f"https://news.ycombinator.com/item?id={story_id}"
        score = data.get("score", 0)
        comments = data.get("descendants", 0)
        unix_time = data.get("time", 0)
        
        pub_dt = datetime.datetime.fromtimestamp(unix_time, tz=datetime.timezone.utc)
        fetched_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        category = "artificial-intelligence" if is_ai_related(title) else "technology"

        # Calculate a genuine trend score based on points and comments
        trend_score = float(score + (comments * 1.5))

        summary = f"Discussion on Hacker News with {score} points and {comments} comments."

        return Article(
            id=generate_article_id(story_url, title),
            title=title,
            summary=summary,
            content_url=story_url,
            source="Hacker News",
            category=category,
            published_at=pub_dt.isoformat(),
            fetched_at=fetched_at,
            author=data.get("by"),
            image_url=None,
            score=score,
            comment_count=comments,
            trend_score=trend_score,
            is_stale=False,
            related_links=[f"https://news.ycombinator.com/item?id={story_id}"] if data.get("url") else []
        )
    except Exception as e:
        logger.debug(f"Error fetching HN item {story_id}: {e}")
        return None

async def fetch_hacker_news_stories(limit: int = 25) -> List[Article]:
    """Fetch top stories from the official free Hacker News REST API."""
    articles: List[Article] = []
    top_ids_url = "https://hacker-news.firebaseio.com/v0/topstories.json"
    
    limits = httpx.Limits(max_keepalive_connections=10, max_connections=20)
    async with httpx.AsyncClient(limits=limits) as client:
        try:
            res = await client.get(top_ids_url, timeout=settings.REQUEST_TIMEOUT)
            if res.status_code != 200:
                return articles
            story_ids = res.json()[:limit]
            
            tasks = [fetch_hn_item(client, sid) for sid in story_ids]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for item in results:
                if isinstance(item, Article):
                    articles.append(item)
        except Exception as e:
            logger.error(f"Error fetching Hacker News top stories: {e}")
            
    return articles
