import asyncio
import datetime
import logging
from typing import List, Optional, Dict, Any
import httpx
import feedparser
from bs4 import BeautifulSoup

from backend.app.config import settings
from backend.app.schemas.models import Article
from backend.app.ingestion.deduplicator import generate_article_id, clean_title

logger = logging.getLogger("ingestion.rss")

def extract_clean_text_and_image(html_or_text: str) -> tuple[str, Optional[str]]:
    """Extract clean plain text snippet (max 300 chars) and first image if present."""
    if not html_or_text:
        return "", None
    
    image_url = None
    try:
        soup = BeautifulSoup(html_or_text, "html.parser")
        # Extract image if any
        img_tag = soup.find("img")
        if img_tag and img_tag.get("src"):
            src = img_tag["src"]
            if src.startswith("http") and not any(skip in src for skip in ["1x1", "pixel", "tracking", "icon"]):
                image_url = src

        # Remove script and style elements
        for element in soup(["script", "style", "figure", "figcaption"]):
            element.decompose()

        text = soup.get_text(separator=" ", strip=True)
        # Normalize whitespace
        text = " ".join(text.split())
        if len(text) > 350:
            text = text[:347] + "..."
        return text, image_url
    except Exception:
        # Fallback to crude slicing
        return html_or_text[:300], None

def parse_pub_date(entry: Any) -> str:
    """Parse date from feedparser entry into ISO UTC format."""
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            dt = datetime.datetime(*entry.published_parsed[:6], tzinfo=datetime.timezone.utc)
            return dt.isoformat()
        except Exception:
            pass
    if hasattr(entry, "updated_parsed") and entry.updated_parsed:
        try:
            dt = datetime.datetime(*entry.updated_parsed[:6], tzinfo=datetime.timezone.utc)
            return dt.isoformat()
        except Exception:
            pass
    return now_iso

class RSSFeedConfig:
    def __init__(self, name: str, url: str, category: str, default_image: Optional[str] = None):
        self.name = name
        self.url = url
        self.category = category
        self.default_image = default_image

# Curated, verified legitimate public feeds with free access
REGISTERED_FEEDS: List[RSSFeedConfig] = [
    # World News & Politics
    RSSFeedConfig("BBC World News", "https://feeds.bbci.co.uk/news/world/rss.xml", "world-news"),
    RSSFeedConfig("NPR International", "https://feeds.npr.org/1004/rss.xml", "world-news"),
    RSSFeedConfig("BBC Politics", "https://feeds.bbci.co.uk/news/politics/rss.xml", "politics"),
    
    # Technology
    RSSFeedConfig("TechCrunch", "https://techcrunch.com/feed/", "technology"),
    RSSFeedConfig("Ars Technica", "https://feeds.arstechnica.com/arstechnica/index", "technology"),

    # Artificial Intelligence
    RSSFeedConfig(
        "Google News AI",
        "https://news.google.com/rss/search?q=artificial+intelligence+OR+LLM+OR+OpenAI&hl=en-US&gl=US&ceid=US:en",
        "artificial-intelligence"
    ),

    # Sports
    RSSFeedConfig("ESPN Sports", "https://www.espn.com/espn/rss/news", "sports"),
    RSSFeedConfig("BBC Sport", "https://feeds.bbci.co.uk/sport/rss.xml", "sports"),
    RSSFeedConfig("ESPNcricinfo Cricket", "https://www.espncricinfo.com/rss/content/story/feeds/0.xml", "sports"),

    # Business & Layoffs
    RSSFeedConfig(
        "Google News Business",
        "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
        "business"
    ),
    RSSFeedConfig(
        "Google News Layoffs",
        "https://news.google.com/rss/search?q=company+layoffs+OR+workforce+reduction&hl=en-US&gl=US&ceid=US:en",
        "layoffs"
    ),

    # Music & Entertainment
    RSSFeedConfig("BBC Entertainment", "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", "entertainment"),
    RSSFeedConfig(
        "Google News Music",
        "https://news.google.com/rss/search?q=music+album+OR+concert+OR+billboard&hl=en-US&gl=US&ceid=US:en",
        "music"
    ),

    # India and Regional Updates
    RSSFeedConfig("The Hindu National", "https://www.thehindu.com/news/national/feeder/default.rss", "india-regional"),
    RSSFeedConfig("NDTV India News", "https://feeds.feedburner.com/ndtvnews-top-stories", "india-regional"),
    RSSFeedConfig(
        "Google News Tamil Regional",
        "https://news.google.com/rss/search?q=Tamil+Nadu+OR+Chennai+OR+Kollywood&hl=en-IN&gl=IN&ceid=IN:en",
        "india-regional"
    )
]

async def fetch_single_feed(client: httpx.AsyncClient, feed_cfg: RSSFeedConfig) -> List[Article]:
    """Fetch and parse a single RSS feed asynchronously with timeout and error resilience."""
    articles: List[Article] = []
    fetched_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    try:
        response = await client.get(
            feed_cfg.url,
            headers={"User-Agent": settings.USER_AGENT, "Accept": "application/rss+xml, application/xml, text/xml"},
            timeout=settings.REQUEST_TIMEOUT
        )
        if response.status_code != 200:
            logger.warning(f"Feed {feed_cfg.name} returned status {response.status_code}")
            return articles

        parsed = feedparser.parse(response.text)
        if not parsed.entries:
            return articles

        for entry in parsed.entries[:25]:
            title = entry.get("title", "").strip()
            link = entry.get("link", "").strip()
            if not title or not link:
                continue

            cleaned_title_text = clean_title(title)
            raw_summary = entry.get("summary", entry.get("description", ""))
            clean_summary, extracted_img = extract_clean_text_and_image(raw_summary)

            # Check media enclosure or media_content
            image_url = extracted_img
            if not image_url and hasattr(entry, "media_content") and entry.media_content:
                for media in entry.media_content:
                    if media.get("url") and "image" in media.get("type", "image"):
                        image_url = media["url"]
                        break
            if not image_url and hasattr(entry, "enclosures") and entry.enclosures:
                for enc in entry.enclosures:
                    if enc.get("href") and "image" in enc.get("type", "image"):
                        image_url = enc["href"]
                        break

            published_at = parse_pub_date(entry)
            author = entry.get("author", None)
            article_id = generate_article_id(link, cleaned_title_text)

            articles.append(Article(
                id=article_id,
                title=cleaned_title_text,
                summary=clean_summary or f"Read the full report from {feed_cfg.name}.",
                content_url=link,
                source=feed_cfg.name,
                category=feed_cfg.category,
                published_at=published_at,
                fetched_at=fetched_at,
                author=author,
                image_url=image_url or feed_cfg.default_image,
                trend_score=1.0,
                is_stale=False,
                related_links=[]
            ))
    except Exception as exc:
        logger.error(f"Error fetching feed {feed_cfg.name}: {exc}")
    
    return articles

async def fetch_rss_feeds_by_category(category: Optional[str] = None) -> List[Article]:
    """Fetch all registered feeds matching the category (or all if None)."""
    feeds_to_fetch = [
        f for f in REGISTERED_FEEDS
        if category is None or f.category == category or (category == "world-news" and f.category in ["world-news", "politics"])
    ]
    
    limits = httpx.Limits(max_keepalive_connections=10, max_connections=20)
    async with httpx.AsyncClient(limits=limits, follow_redirects=True) as client:
        tasks = [fetch_single_feed(client, cfg) for cfg in feeds_to_fetch]
        results = await asyncio.gather(*tasks, return_exceptions=True)
    
    all_articles: List[Article] = []
    for res in results:
        if isinstance(res, list):
            all_articles.extend(res)
    return all_articles
