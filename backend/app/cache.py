import time
import asyncio
from typing import Any, Optional, Dict, Tuple
from collections import OrderedDict
from backend.app.config import settings

class CacheItem:
    def __init__(self, value: Any, ttl_seconds: int):
        self.value = value
        self.created_at = time.time()
        self.expires_at = self.created_at + ttl_seconds

    @property
    def is_expired(self) -> bool:
        return time.time() > self.expires_at

class InMemoryTTLCache:
    """
    Thread-safe, bounded, in-memory TTL cache with stale-on-error support.
    Stores entries purely in RAM (no database or disk storage).
    """
    def __init__(self, maxsize: int = 1000, default_ttl: int = 240):
        self.maxsize = maxsize
        self.default_ttl = default_ttl
        self._store: OrderedDict[str, CacheItem] = OrderedDict()
        self._stale_backup: Dict[str, Tuple[Any, float]] = {}  # key -> (value, timestamp)
        self._lock = asyncio.Lock()
        self._in_flight: Dict[str, asyncio.Future] = {}

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            if key in self._store:
                item = self._store[key]
                if not item.is_expired:
                    # Move to end for LRU policy
                    self._store.move_to_end(key)
                    return item.value
                else:
                    # Keep as stale backup before removal
                    self._stale_backup[key] = (item.value, item.created_at)
                    del self._store[key]
        return None

    async def get_stale(self, key: str) -> Optional[Tuple[Any, float]]:
        """Retrieve stale backup value and its timestamp if available."""
        async with self._lock:
            if key in self._stale_backup:
                return self._stale_backup[key]
            if key in self._store:
                item = self._store[key]
                return (item.value, item.created_at)
        return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        async with self._lock:
            ttl_seconds = ttl if ttl is not None else self.default_ttl
            # Enforce maxsize limit (LRU eviction)
            if len(self._store) >= self.maxsize and key not in self._store:
                self._store.popitem(last=False)
            
            self._store[key] = CacheItem(value, ttl_seconds)
            self._stale_backup[key] = (value, time.time())
            # Evict stale backups if too many
            if len(self._stale_backup) > self.maxsize * 2:
                # Remove oldest keys
                for k in list(self._stale_backup.keys())[:len(self._stale_backup) - self.maxsize]:
                    del self._stale_backup[k]

    async def delete(self, key: str) -> None:
        async with self._lock:
            if key in self._store:
                del self._store[key]
            if key in self._stale_backup:
                del self._stale_backup[key]

    async def clear(self) -> None:
        async with self._lock:
            self._store.clear()
            self._stale_backup.clear()

    async def stats(self) -> Dict[str, Any]:
        async with self._lock:
            active_items = sum(1 for item in self._store.values() if not item.is_expired)
            return {
                "active_items": active_items,
                "total_stored": len(self._store),
                "stale_backups": len(self._stale_backup),
                "maxsize": self.maxsize,
                "default_ttl_seconds": self.default_ttl
            }

# Global singleton cache instance
cache = InMemoryTTLCache(
    maxsize=settings.MAX_CACHE_ITEMS,
    default_ttl=settings.CACHE_TTL_SECONDS
)
