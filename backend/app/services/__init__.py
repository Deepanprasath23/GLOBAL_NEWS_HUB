from backend.app.services.aggregator import (
    aggregator,
    CATEGORIES_REGISTRY,
    SOURCES_REGISTRY
)
from backend.app.services.trending import analyze_trending

__all__ = [
    "aggregator",
    "CATEGORIES_REGISTRY",
    "SOURCES_REGISTRY",
    "analyze_trending"
]
