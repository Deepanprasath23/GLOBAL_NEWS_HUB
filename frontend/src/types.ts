export interface Article {
  id: string;
  title: string;
  summary: string;
  content_url: string;
  source: string;
  category: string;
  published_at: string;
  fetched_at: string;
  author?: string;
  image_url?: string;
  score?: number;
  comment_count?: number;
  trend_score?: number;
  is_stale: boolean;
  related_links: string[];
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface FeedResponse {
  total: number;
  page: number;
  limit: number;
  category?: string;
  sources_active: string[];
  cached: boolean;
  is_stale: boolean;
  generated_at: string;
  articles: Article[];
}

export interface TrendingTopic {
  topic: string;
  category: string;
  mention_count: number;
  sample_headlines: string[];
  source_names: string[];
  velocity_score: number;
  explanation: string;
}

export interface TrendingResponse {
  generated_at: string;
  trending_topics: TrendingTopic[];
  top_stories: Article[];
}

export interface BriefingResponse {
  generated_at: string;
  greeting: string;
  summary_lead: string;
  key_bulletins: string[];
  top_developments: Article[];
  categories_covered: number;
}

export interface SourceInfo {
  id: string;
  name: string;
  category: string;
  url: string;
  terms_url: string;
  description: string;
  status: 'active' | 'degraded' | 'unavailable';
  feed_type: 'rss' | 'rest_api';
}

export interface HealthResponse {
  status: string;
  version: string;
  uptime_seconds: number;
  cache: {
    active_items: number;
    total_stored: number;
    stale_backups: number;
    maxsize: number;
    default_ttl_seconds: number;
  };
  active_sources: number;
}
