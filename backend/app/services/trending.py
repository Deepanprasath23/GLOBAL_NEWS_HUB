import re
import datetime
from collections import defaultdict
from typing import List, Dict, Any, Tuple
from backend.app.schemas.models import Article, TrendingTopic, TrendingResponse
from backend.app.ingestion.deduplicator import tokenize

def extract_named_phrases(text: str) -> List[str]:
    """
    Extract meaningful 2-3 word phrases or capitalized key entities.
    E.g., 'OpenAI', 'Federal Reserve', 'Champions League', 'T20 World Cup'.
    """
    phrases = []
    # Capitalized sequences of words (proper nouns / entities)
    matches = re.findall(r"\b[A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)+\b", text)
    for m in matches:
        if len(m) > 4 and not any(skip in m for skip in ["BBC News", "Hacker News", "The Hindu", "TechCrunch"]):
            phrases.append(m.strip())
            
    # Key single-word acronyms or proper terms (e.g. AI, NASA, IPL, ISRO, RBI, BCCI)
    acronyms = re.findall(r"\b[A-Z]{2,6}\b", text)
    for a in acronyms:
        if a not in {"THE", "AND", "FOR", "NOT", "NEW", "TOP"}:
            phrases.append(a)
            
    return phrases

def analyze_trending(articles: List[Article]) -> TrendingResponse:
    """
    Computes explainable trending topics using real measurable signals:
    1. Multi-source coverage frequency across distinct publishers.
    2. Real HN engagement scores.
    3. Publication recency.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    now_iso = now.isoformat()

    # Topic -> metadata mapping
    topic_data: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "articles": [],
        "sources": set(),
        "categories": defaultdict(int),
        "total_engagement": 0.0,
    })

    for art in articles:
        # Measure article age in hours
        try:
            art_time = datetime.datetime.fromisoformat(art.published_at.replace("Z", "+00:00"))
            age_hours = max(0.1, (now - art_time).total_seconds() / 3600.0)
        except Exception:
            age_hours = 2.0

        recency_multiplier = 1.0 / (1.0 + (age_hours / 12.0))
        engagement = ((art.score or 0) + (art.comment_count or 0) * 1.5)

        phrases = extract_named_phrases(art.title)
        for phrase in phrases:
            clean_p = phrase.strip()
            topic_data[clean_p]["articles"].append(art)
            topic_data[clean_p]["sources"].add(art.source)
            topic_data[clean_p]["categories"][art.category] += 1
            topic_data[clean_p]["total_engagement"] += engagement * recency_multiplier

    trending_topics: List[TrendingTopic] = []

    for topic_name, data in topic_data.items():
        distinct_sources = list(data["sources"])
        article_count = len(data["articles"])
        
        # We only consider it trending if either:
        # a) Covered by multiple independent sources OR
        # b) Significant measurable community engagement (e.g. Hacker News score > 100)
        if len(distinct_sources) >= 2 or data["total_engagement"] >= 100 or article_count >= 3:
            top_category = max(data["categories"].items(), key=lambda x: x[1])[0]
            
            # Explainable velocity calculation
            source_score = len(distinct_sources) * 25.0
            volume_score = article_count * 10.0
            engagement_score = min(50.0, data["total_engagement"] / 10.0)
            velocity = round(source_score + volume_score + engagement_score, 1)

            # Honest explainable reason
            if len(distinct_sources) >= 2:
                explanation = f"Reported across {len(distinct_sources)} independent publishers ({', '.join(distinct_sources[:3])})"
            elif data["total_engagement"] >= 100:
                explanation = f"High community engagement ({int(data['total_engagement'])} activity points on Hacker News)"
            else:
                explanation = f"Multiple rapid updates ({article_count} reports)"

            sample_headlines = [a.title for a in data["articles"][:3]]

            trending_topics.append(TrendingTopic(
                topic=topic_name,
                category=top_category,
                mention_count=article_count,
                sample_headlines=sample_headlines,
                source_names=distinct_sources,
                velocity_score=velocity,
                explanation=explanation
            ))

    # Sort topics by velocity score descending
    trending_topics.sort(key=lambda t: t.velocity_score, reverse=True)
    top_trending = trending_topics[:12]

    # Also sort top stories by a combined trend score
    def story_ranking(a: Article) -> float:
        hn_factor = (a.score or 0) + (a.comment_count or 0) * 1.5
        related_factor = len(a.related_links) * 50.0
        return (a.trend_score or 1.0) + hn_factor + related_factor

    ranked_stories = sorted(articles, key=story_ranking, reverse=True)[:15]

    return TrendingResponse(
        generated_at=now_iso,
        trending_topics=top_trending,
        top_stories=ranked_stories
    )
