import re
import hashlib
from typing import List, Tuple
from backend.app.schemas.models import Article

def generate_article_id(url: str, title: str) -> str:
    """Generate a deterministic, clean hex ID based on url and title."""
    raw = f"{url.strip().lower()}::{title.strip().lower()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]

def clean_title(title: str) -> str:
    """Strip common RSS suffixes like ' - BBC News', ' | TechCrunch', etc."""
    cleaned = re.sub(r"\s*[-|–—]\s*(BBC News|BBC|TechCrunch|The Hindu|NDTV|ESPN|Ars Technica|Reuters|The Guardian|Hacker News)$", "", title, flags=re.IGNORECASE)
    return cleaned.strip()

def tokenize(text: str) -> set:
    """Extract lowercase alpha tokens for similarity matching."""
    cleaned = re.sub(r"[^\w\s]", "", text.lower())
    words = cleaned.split()
    stopwords = {"the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or", "is", "are", "was", "were", "with", "by", "as", "from", "that", "this", "it"}
    return {w for w in words if len(w) > 2 and w not in stopwords}

def calculate_jaccard_similarity(set1: set, set2: set) -> float:
    if not set1 or not set2:
        return 0.0
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union > 0 else 0.0

def deduplicate_articles(articles: List[Article], similarity_threshold: float = 0.65) -> List[Article]:
    """
    Deduplicates a list of articles across different sources.
    Keeps the earliest/richest article and attaches other links as related_links.
    """
    unique_articles: List[Article] = []
    seen_urls = set()
    token_cache = []

    for art in articles:
        if art.content_url in seen_urls:
            continue
        
        tokens = tokenize(art.title)
        is_duplicate = False

        for existing_art, existing_tokens in token_cache:
            sim = calculate_jaccard_similarity(tokens, existing_tokens)
            if sim >= similarity_threshold:
                is_duplicate = True
                # Merge source links into related_links
                if art.content_url not in existing_art.related_links and art.content_url != existing_art.content_url:
                    existing_art.related_links.append(art.content_url)
                # Boost trend score because multi-source coverage is a real trending signal!
                existing_art.trend_score = (existing_art.trend_score or 1.0) + 1.5
                break

        if not is_duplicate:
            seen_urls.add(art.content_url)
            token_cache.append((art, tokens))
            unique_articles.append(art)

    return unique_articles
