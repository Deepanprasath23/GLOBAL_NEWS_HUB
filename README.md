# Global Trends & Information Hub

> **"Less scrolling. More understanding. Everything important, in one place."**

A modern, responsive, 100% free global information platform that unifies the latest developments in politics, world news, technology, artificial intelligence, company layoffs, business, sports, music, entertainment, and trending topics into one clean editorial dashboard.

---

## 🌟 Core Product Principles

- **100% Free for Visitors:** No subscription walls, no ads, no trackers.
- **Zero Authentication:** No login, signup, cookies, or user accounts.
- **No Database / Permanent Storage:** Articles are fetched on demand from real external sources and cached temporarily in RAM.
- **In-Memory TTL Caching:** Fast responses with automatic 2 to 5-minute in-memory caching and stale-on-error fallback.
- **Real Working Data Sources:** Genuine live stories from BBC, NPR, Hacker News, TechCrunch, The Hindu, ESPN, and NDTV—never mock or hardcoded content.
- **Attribution First:** Direct original links and full attribution provided on every single story card.

---

## 📂 Information Categories

| Category | Description | Primary Sources |
|---|---|---|
| **World News** | International affairs, diplomacy, and global events | BBC World News, NPR International |
| **Politics** | Policy decisions, government updates, elections | BBC Politics, Reuters / Google News |
| **Technology** | Software, hardware, startups, engineering | TechCrunch, Ars Technica, Hacker News |
| **Artificial Intelligence** | LLMs, neural networks, open-source AI, labs | Google News AI, Hacker News AI discussions |
| **Sports** | Cricket, football, tennis, tournaments, fixtures | ESPN, BBC Sport, ESPNcricinfo |
| **Business** | Macroeconomics, venture funding, corporate news | Google News Business, CNBC |
| **Layoffs & Workforce** | Corporate restructuring, tech layoffs, labor | Google News Tech Layoffs |
| **Entertainment & Music**| Cinema, streaming, releases, music charts | BBC Entertainment & Arts, Billboard |
| **India & Regional** | National Indian affairs, regional developments | The Hindu National, NDTV News, Tamil Cinema |

---

## 🏗️ Architecture & Technology Stack

```text
global-trends/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/           # Navbar, StoryCard, HeroBriefing, ArticleModal, TrendingSection, DevDocs
│   │   ├── services/api.ts       # Type-safe API client
│   │   ├── utils/formatters.ts   # Relative time formatting and category stylers
│   │   ├── types.ts              # TypeScript schemas
│   │   ├── index.css             # Tailwind v4 theme and custom glow effects
│   │   └── App.tsx               # Main application view container
│   ├── public/_redirects         # Netlify SPA routing rules
│   └── package.json
├── backend/                      # Python 3.10 + FastAPI (Async REST Engine)
│   ├── app/
│   │   ├── api/routes.py         # Endpoints (/feed, /trending, /categories, /briefing, /search, etc.)
│   │   ├── ingestion/            # Async RSS parser, Hacker News REST API, Deduplicator
│   │   ├── services/             # In-memory aggregation & explainable velocity trending
│   │   ├── cache.py              # Thread-safe in-memory TTL cache with bounded LRU & stale fallback
│   │   ├── config.py             # App configurations & CORS
│   │   └── main.py               # FastAPI initialization with OpenAPI Swagger
│   ├── tests/test_api.py         # Pytest suite with 100% pass rate
│   └── requirements.txt
├── Dockerfile                    # Containerization for zero-cost deployment
├── render.yaml                   # 1-Click Render.com free blueprint
├── netlify.toml                  # Netlify static build configuration
└── .env.example
```

---

## 🚀 Public REST API Endpoints

FastAPI provides interactive OpenAPI Swagger documentation at `/docs` and ReDoc at `/redoc`.

| Method | Endpoint | Query / Path Parameters | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | None | Operational status, uptime, and in-memory cache statistics |
| `GET` | `/api/v1/feed` | `page`, `limit`, `category` | Normalized, deduplicated global feed across all sources |
| `GET` | `/api/v1/categories` | None | List of all supported categories with icon and descriptions |
| `GET` | `/api/v1/categories/{slug}` | `slug` (path), `page`, `limit` | Stories filtered specifically for a category |
| `GET` | `/api/v1/trending` | None | Real velocity-scored topics and high-engagement stories |
| `GET` | `/api/v1/search` | `q` (query), `category`, `limit` | Live search across current global headlines and summaries |
| `GET` | `/api/v1/articles/{id}` | `id` (hex string) | Story detail metadata, clean summary, and attribution link |
| `GET` | `/api/v1/briefing` | None | 2-minute executive daily digest across core categories |
| `GET` | `/api/v1/sources` | None | Directory of integrated publishers, licensing terms, and status |

### Example cURL Request

```bash
# Get live Technology & AI dispatches
curl -X GET "http://localhost:8000/api/v1/feed?category=technology&limit=10"

# Fetch Explainable Trending Topics
curl -X GET "http://localhost:8000/api/v1/trending"
```

---

## 📈 Explainable Trending Methodology

Unlike services that fabricate engagement metrics or opaque search percentages:
1. **Multi-Source Cross-Confirmation:** Points awarded when independent major newsrooms simultaneously cover a development.
2. **Community Discussion Signals:** Real upvote and comment velocity from Hacker News.
3. **Recency Decay:** Exponential decay factor prioritizing developments breaking in the last 1–6 hours.
4. **Honest Explanations:** Every trending topic explicitly details *why* it is trending (e.g., *"Reported across 5 independent publishers (BBC, NPR, The Hindu)"*).

---

## 🧪 Acceptance Testing & Verification

1. **Unit & Ingestion Tests:** Ran via `pytest backend/tests/test_api.py` (5/5 passing).
2. **Live Feed Test:** Confirmed fetching 390+ live stories across BBC, TechCrunch, The Hindu, ESPN, and Hacker News without errors.
3. **Browser Interactive Test:** Verified story rendering, category filtering, search, modal dialogs, and navigation via browser subagent.

---

## 🌐 Free-Tier Deployment Guide

### Frontend on Netlify (Static Hosting)
1. Fork or push repository to GitHub.
2. Link the repository to [Netlify](https://www.netlify.com/).
3. Settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. Set environment variable `VITE_API_BASE_URL` to your deployed backend URL.

### Backend on Render.com (Free Web Service)
1. In [Render](https://render.com/), choose **New Web Service** from your GitHub repo.
2. Environment: **Python 3**.
3. Build command: `pip install -r backend/requirements.txt`
4. Start command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Free-tier note: The service will spin down after 15 minutes of inactivity; initial cold-start takes ~30 seconds. In-memory cache refreshes on first request.
