import {
  Article,
  Category,
  FeedResponse,
  TrendingResponse,
  BriefingResponse,
  SourceInfo,
  HealthResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      throw new Error(`API error (${res.status}): ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Fetch failed for ${endpoint}:`, error);
    throw error;
  }
}

export const apiService = {
  getHealth: () => fetchJson<HealthResponse>('/api/v1/health'),
  
  getCategories: () => fetchJson<Category[]>('/api/v1/categories'),
  
  getFeed: (category?: string, page: number = 1, limit: number = 24) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category ? { category } : {})
    });
    return fetchJson<FeedResponse>(`/api/v1/feed?${params.toString()}`);
  },

  getCategoryFeed: (slug: string, page: number = 1, limit: number = 24) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return fetchJson<FeedResponse>(`/api/v1/categories/${slug}?${params.toString()}`);
  },

  getTrending: () => fetchJson<TrendingResponse>('/api/v1/trending'),

  search: (query: string, category?: string, limit: number = 30) => {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      ...(category ? { category } : {})
    });
    return fetchJson<FeedResponse>(`/api/v1/search?${params.toString()}`);
  },

  getArticle: (id: string) => fetchJson<Article>(`/api/v1/articles/${id}`),

  getBriefing: () => fetchJson<BriefingResponse>('/api/v1/briefing'),

  getSources: () => fetchJson<SourceInfo[]>('/api/v1/sources'),
};
