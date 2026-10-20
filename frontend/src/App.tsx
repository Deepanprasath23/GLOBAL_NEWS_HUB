import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { StoryCard } from './components/StoryCard';
import { ArticleModal } from './components/ArticleModal';
import { HeroBriefing } from './components/HeroBriefing';
import { TrendingSection } from './components/TrendingSection';
import { DevDocs } from './components/DevDocs';
import { SourcesDirectory } from './components/SourcesDirectory';
import { Footer } from './components/Footer';
import { apiService } from './services/api';
import { Article, Category, TrendingResponse, BriefingResponse, SourceInfo } from './types';
import { AlertCircle, RefreshCw, Sparkles, Filter, ChevronRight, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [trendingData, setTrendingData] = useState<TrendingResponse | null>(null);
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalStories, setTotalStories] = useState<number>(0);

  // Load Categories & Briefing initially
  useEffect(() => {
    async function loadInitialMetadata() {
      try {
        const [catData, briefData, srcData] = await Promise.allSettled([
          apiService.getCategories(),
          apiService.getBriefing(),
          apiService.getSources()
        ]);

        if (catData.status === 'fulfilled') setCategories(catData.value);
        if (briefData.status === 'fulfilled') setBriefing(briefData.value);
        if (srcData.status === 'fulfilled') setSources(srcData.value);
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    }
    loadInitialMetadata();
  }, []);

  // Fetch Feed or Search
  const fetchFeed = useCallback(async (cat: string | null, search: string, pageNum: number = 1, append: boolean = false) => {
    setIsLoading(!append);
    setError(null);
    try {
      let res;
      if (search.trim()) {
        res = await apiService.search(search.trim(), cat || undefined, 30);
      } else if (cat) {
        res = await apiService.getCategoryFeed(cat, pageNum, 24);
      } else {
        res = await apiService.getFeed(undefined, pageNum, 24);
      }

      setArticles(prev => (append ? [...prev, ...res.articles] : res.articles));
      setTotalStories(res.total);
      setIsCached(res.cached);
      setIsStale(res.is_stale);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Failed to load feed:', err);
      setError('Unable to load feed from real-time sources. Please verify backend connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch Trending
  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getTrending();
      setTrendingData(data);
    } catch (err) {
      console.error('Failed to load trending topics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger data updates when filters or tabs change
  useEffect(() => {
    if (currentTab === 'feed') {
      fetchFeed(selectedCategory, searchQuery, 1, false);
    } else if (currentTab === 'trending') {
      fetchTrending();
    } else if (currentTab === 'briefing' && !briefing) {
      setIsLoading(true);
      apiService.getBriefing()
        .then(setBriefing)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else if (currentTab === 'sources' && sources.length === 0) {
      setIsLoading(true);
      apiService.getSources()
        .then(setSources)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [currentTab, selectedCategory, searchQuery, fetchFeed, fetchTrending, briefing, sources.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (currentTab === 'feed') {
      await fetchFeed(selectedCategory, searchQuery, 1, false);
    } else if (currentTab === 'trending') {
      await fetchTrending();
    } else if (currentTab === 'briefing') {
      try {
        const b = await apiService.getBriefing();
        setBriefing(b);
      } catch (e) {
        console.error(e);
      } finally {
        setIsRefreshing(false);
      }
    } else if (currentTab === 'sources') {
      try {
        const s = await apiService.getSources();
        setSources(s);
      } catch (e) {
        console.error(e);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setSearchQuery('');
  };

  const handleSelectCategory = (catSlug: string | null) => {
    setSelectedCategory(catSlug);
    setSearchQuery('');
    setCurrentTab('feed');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setCurrentTab('feed');
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchFeed(selectedCategory, searchQuery, nextPage, true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        isCached={isCached}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Category Pills Bar (Always available on feed view) */}
      {currentTab === 'feed' && (
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Stale Cache Notice if external upstream failed */}
        {isStale && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>
                <strong>Upstream Latency Detected:</strong> Serving previous in-memory cache snapshot while background workers reconnect.
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 font-semibold text-[11px]"
            >
              Retry
            </button>
          </div>
        )}

        {/* FEED TAB */}
        {currentTab === 'feed' && (
          <div>
            {/* Show Briefing banner only on main All Feed view without search */}
            {selectedCategory === null && !searchQuery && (
              <HeroBriefing
                briefing={briefing}
                onOpenArticle={(art) => setSelectedArticle(art)}
              />
            )}

            {/* Header info row for current view */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit'] flex items-center gap-2">
                  {searchQuery ? (
                    <>Search results for "{searchQuery}"</>
                  ) : selectedCategory ? (
                    categories.find(c => c.slug === selectedCategory)?.name || 'Category Feed'
                  ) : (
                    <>Latest Global Dispatches</>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {searchQuery ? (
                    `Found ${totalStories} live stories matching query`
                  ) : selectedCategory ? (
                    categories.find(c => c.slug === selectedCategory)?.description
                  ) : (
                    'Real-time verified reports deduplicated across world news, technology, AI, sports, and business.'
                  )}
                </p>
              </div>

              {/* Status counter */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                  {articles.length} of {totalStories} stories
                </span>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="p-8 text-center glass-panel rounded-3xl max-w-lg mx-auto">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-2">Connection Problem</h3>
                <p className="text-xs text-slate-400 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold hover:bg-cyan-400 transition-all"
                >
                  Reconnect
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && articles.length === 0 && (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs text-slate-400">Fetching real-time feeds from global publishers...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && articles.length === 0 && !error && (
              <div className="p-12 text-center glass-panel rounded-3xl max-w-md mx-auto">
                <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Stories Available</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  No live reports match your filter criteria. Try clearing search or choosing another category.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold hover:bg-cyan-400"
                  >
                    View All Stories
                  </button>
                )}
              </div>
            )}

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((story) => (
                <StoryCard
                  key={story.id}
                  article={story}
                  onOpenDetails={(art) => setSelectedArticle(art)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {articles.length > 0 && articles.length < totalStories && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-semibold text-xs tracking-wide transition-all shadow-lg hover:border-cyan-500/40 disabled:opacity-50"
                >
                  {isLoading ? 'Loading additional reports...' : 'Load More Stories'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TRENDING TAB */}
        {currentTab === 'trending' && (
          <TrendingSection
            trendingData={trendingData}
            isLoading={isLoading}
            onOpenArticle={(art) => setSelectedArticle(art)}
          />
        )}

        {/* BRIEFING TAB */}
        {currentTab === 'briefing' && (
          <div className="max-w-4xl mx-auto py-4">
            <HeroBriefing
              briefing={briefing}
              onOpenArticle={(art) => setSelectedArticle(art)}
            />
            {briefing && (
              <div className="mt-8 space-y-6">
                <h2 className="text-xl font-bold text-white font-['Outfit']">
                  Detailed Category Breakdowns
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {briefing.top_developments.map((story) => (
                    <StoryCard
                      key={story.id}
                      article={story}
                      onOpenDetails={(art) => setSelectedArticle(art)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* API DEVELOPER DOCS TAB */}
        {currentTab === 'docs' && <DevDocs />}

        {/* SOURCES DIRECTORY TAB */}
        {currentTab === 'sources' && (
          <SourcesDirectory sources={sources} isLoading={isLoading} />
        )}

      </main>

      {/* Story Detail Inspection Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      {/* Footer */}
      <Footer onSelectTab={(tab) => { setCurrentTab(tab); setSelectedCategory(null); }} />

    </div>
  );
};

export default App;
