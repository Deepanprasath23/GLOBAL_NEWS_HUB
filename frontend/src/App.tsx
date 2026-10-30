import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { StoryCard } from './components/StoryCard';
import { ArticleModal } from './components/ArticleModal';
import { HeroBriefing } from './components/HeroBriefing';
import { TrendingSection } from './components/TrendingSection';
import { SourcesDirectory } from './components/SourcesDirectory';
import { AuroraBackground } from './components/AuroraBackground';
import { apiService } from './services/api';
import { Article, Category, TrendingResponse, BriefingResponse, SourceInfo } from './types';
import {
  AlertCircle,
  Layers,
  Clock,
  Flame,
  ArrowDownAZ,
  LayoutGrid,
  List,
  Activity,
  Sparkles,
  ChevronRight
} from 'lucide-react';

type SortOption = 'latest' | 'trending' | 'multisource' | 'source';

export const App: React.FC = () => {
  const mainRef = useRef<HTMLElement>(null);
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Sorting and Display states
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

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

  useEffect(() => {
    const main = mainRef.current;
    if (!main || !('IntersectionObserver' in window)) return;

    main.classList.add('reveal-ready');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -24px 0px', threshold: 0.08 });

    const observeRevealElements = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node.matches('.scroll-reveal:not(.is-visible)')) revealObserver.observe(node);
      node.querySelectorAll('.scroll-reveal:not(.is-visible)').forEach((element) => {
        revealObserver.observe(element);
      });
    };

    main.querySelectorAll('.scroll-reveal:not(.is-visible)').forEach((element) => {
      revealObserver.observe(element);
    });

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(observeRevealElements));
    });
    mutationObserver.observe(main, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  // Load Categories, Briefing, Sources, and Trending initially
  useEffect(() => {
    async function loadInitialMetadata() {
      try {
        const [catData, briefData, srcData, trendData] = await Promise.allSettled([
          apiService.getCategories(),
          apiService.getBriefing(),
          apiService.getSources(),
          apiService.getTrending()
        ]);

        if (catData.status === 'fulfilled') setCategories(catData.value);
        if (briefData.status === 'fulfilled') setBriefing(briefData.value);
        if (srcData.status === 'fulfilled') setSources(srcData.value);
        if (trendData.status === 'fulfilled') setTrendingData(trendData.value);
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

  // Client-side dynamic sorting
  const sortedArticles = useMemo(() => {
    const items = [...articles];
    if (sortBy === 'latest') {
      return items.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }
    if (sortBy === 'trending') {
      return items.sort((a, b) => {
        const scoreA = (a.score || 0) * 2 + (a.comment_count || 0) * 3 + (a.related_links?.length || 0) * 15;
        const scoreB = (b.score || 0) * 2 + (b.comment_count || 0) * 3 + (b.related_links?.length || 0) * 15;
        return scoreB - scoreA;
      });
    }
    if (sortBy === 'multisource') {
      return items.sort((a, b) => {
        const linksA = a.related_links?.length || 0;
        const linksB = b.related_links?.length || 0;
        if (linksB !== linksA) return linksB - linksA;
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
    }
    if (sortBy === 'source') {
      return items.sort((a, b) => a.source.localeCompare(b.source));
    }
    return items;
  }, [articles, sortBy]);

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 min-h-screen flex flex-col text-[#D1D5DB]">
      
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

      {/* Available News Live Ticker Strip */}
      {articles.length > 0 && currentTab === 'feed' && (
        <div className="border-b border-white/10 bg-[#111827]/75 py-2 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 min-w-max">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#49CF9E]/10 border border-[#49CF9E]/20 text-[#86B99A] text-[11px] font-bold tracking-wider uppercase flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#49CF9E] animate-pulse"></span>
              <span>Available News</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {articles.slice(0, 8).map((story) => (
                <button
                  key={story.id}
                  onClick={() => setSelectedArticle(story)}
                  className="px-2.5 py-1 rounded-lg bg-[#1F2937] hover:bg-[#243041] border border-white/10 hover:border-[#49CF9E]/30 text-[#D1D5DB] hover:text-white transition-colors flex items-center gap-2 max-w-md group"
                  title={story.title}
                >
                  <span className="text-[10px] font-semibold text-[#86B99A] bg-[#49CF9E]/10 px-1.5 py-0.5 rounded border border-[#49CF9E]/20 uppercase flex-shrink-0">
                    {story.source}
                  </span>
                  <span className="font-medium truncate group-hover:text-white text-[#D0D0D0]">
                    {story.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Pills Bar (Always available on feed view) */}
      {currentTab === 'feed' && (
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Stale Cache Notice if external upstream failed */}
        {isStale && (
          <div className="mb-6 p-4 rounded-xl bg-[#332a1e] border border-[#664d26] text-[#e0bc70] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#e0bc70] flex-shrink-0" />
              <span>
                <strong>Upstream Latency Detected:</strong> Serving previous in-memory cache snapshot while background workers reconnect.
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="px-2.5 py-1 rounded bg-[#4a3a22] hover:bg-[#5a4729] text-[#e0bc70] font-semibold text-[11px]"
            >
              Retry
            </button>
          </div>
        )}

        {/* FEED TAB */}
        {currentTab === 'feed' && (
          <div>
            {/* Show Executive Briefing spotlight banner only on main All Feed view without search */}
            {selectedCategory === null && !searchQuery && (
              <HeroBriefing
                briefing={briefing}
                onOpenArticle={(art) => setSelectedArticle(art)}
              />
            )}

            {/* Feed Control Bar: Header, Sorting Options, and View Mode Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-['Outfit'] flex items-center gap-2">
                  {searchQuery ? (
                    <>Search results for "{searchQuery}"</>
                  ) : selectedCategory ? (
                    categories.find(c => c.slug === selectedCategory)?.name || 'Category Feed'
                  ) : (
                    <>Latest Global Dispatches</>
                  )}
                </h1>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  {searchQuery ? (
                    `Found ${totalStories} live stories matching query`
                  ) : selectedCategory ? (
                    categories.find(c => c.slug === selectedCategory)?.description
                  ) : (
                    'Real-time verified reports deduplicated across world news, technology, AI, sports, and business.'
                  )}
                </p>
              </div>

              {/* Sort selector & layout switcher */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Sorting Buttons */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1F2937] border border-white/10 text-xs">
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                      sortBy === 'latest'
                        ? 'bg-[#49CF9E] text-[#100e0b] font-bold shadow-xs'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                    title="Sort by newest published time"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Latest</span>
                  </button>

                  <button
                    onClick={() => setSortBy('trending')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                      sortBy === 'trending'
                        ? 'bg-[#49CF9E] text-[#100e0b] font-bold shadow-xs'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                    title="Sort by Hacker News score and discussion velocity"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Trending</span>
                  </button>

                  <button
                    onClick={() => setSortBy('multisource')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                      sortBy === 'multisource'
                        ? 'bg-[#49CF9E] text-[#100e0b] font-bold shadow-xs'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                    title="Prioritize stories confirmed by multiple publishers"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cross-Source</span>
                  </button>

                  <button
                    onClick={() => setSortBy('source')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                      sortBy === 'source'
                        ? 'bg-[#49CF9E] text-[#100e0b] font-bold shadow-xs'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                    title="Sort alphabetically by publisher source"
                  >
                    <ArrowDownAZ className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Publisher</span>
                  </button>
                </div>

                {/* View Mode Toggle: Grid vs Compact List */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1F2937] border border-white/10">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#243041] text-[#49CF9E]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'compact'
                        ? 'bg-[#243041] text-[#49CF9E]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                    title="Compact editorial list view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Total Counter Badge */}
                <span className="text-xs font-mono px-2.5 py-1.5 rounded-xl bg-[#1F2937] border border-white/10 text-[#9CA3AF]">
                  {articles.length} of {totalStories}
                </span>

              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="p-8 text-center bg-[#111827]/90 border border-white/10 rounded-2xl max-w-lg mx-auto">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-2">Connection Problem</h3>
                <p className="text-xs text-[#A0A0A0] mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-xl bg-[#49CF9E] text-[#100e0b] font-bold text-xs hover:bg-[#86B99A] transition-all shadow-sm"
                >
                  Reconnect
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && articles.length === 0 && (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-2 border-[#49CF9E] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs text-[#A0A0A0]">Fetching real-time feeds from global publishers...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && articles.length === 0 && !error && (
              <div className="p-12 text-center bg-[#111827]/90 border border-white/10 rounded-2xl max-w-md mx-auto">
                <Layers className="w-10 h-10 text-[#666666] mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Stories Available</h3>
                <p className="text-xs text-[#A0A0A0] leading-relaxed mb-4">
                  No live reports match your filter criteria. Try clearing search or choosing another category.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                    className="px-4 py-2 rounded-xl bg-[#49CF9E] text-[#100e0b] font-bold text-xs hover:bg-[#86B99A]"
                  >
                    View All Stories
                  </button>
                )}
              </div>
            )}

            {/* Stories Grid / Compact List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedArticles.map((story) => (
                  <StoryCard
                    key={story.id}
                    article={story}
                    layoutMode="grid"
                    onOpenDetails={(art) => setSelectedArticle(art)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedArticles.map((story) => (
                  <StoryCard
                    key={story.id}
                    article={story}
                    layoutMode="compact"
                    onOpenDetails={(art) => setSelectedArticle(art)}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {articles.length > 0 && articles.length < totalStories && (
              <div className="mt-10 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#1F2937] hover:bg-[#243041] border border-white/10 text-[#86B99A] hover:text-white font-semibold text-xs tracking-wide transition-all hover:border-[#49CF9E]/30 disabled:opacity-50"
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

      </div>
    </div>
  );
};

export default App;
