import React, { useState } from 'react';
import {
  Globe,
  TrendingUp,
  FileText,
  Terminal,
  Layers,
  Search,
  Radio,
  ExternalLink,
  X
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  isCached: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onSearch,
  searchQuery,
  isCached,
  onRefresh,
  isRefreshing
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch.trim());
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearch('');
  };

  const handleTabClick = (tab: string) => {
    setLocalSearch('');
    onSelectTab(tab);
  };


  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 px-4 py-1 text-xs text-slate-400 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-medium text-slate-300">Live Global Aggregator</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-slate-400">Zero database • 100% Free • No registration needed</span>
        </div>
        <div className="flex items-center gap-3">
          {isCached && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              In-Memory Cached (TTL 3m)
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-cyan-400 hover:text-cyan-300 text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Force refresh upstream live feeds"
          >
            <Radio className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Live Sync'}</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div
            onClick={() => handleTabClick('feed')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/10 group-hover:shadow-cyan-500/25 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-['Outfit']">
                GLOBAL<span className="text-cyan-400">TRENDS</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  HUB
                </span>
              </span>
              <p className="text-[11px] text-slate-400 tracking-wide -mt-0.5 hidden sm:block">
                World Intelligence & News Network
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search world news, AI breakthroughs, layoffs, sports..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 pl-10 pr-9 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handleTabClick('feed')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'feed'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </button>

            <button
              onClick={() => handleTabClick('trending')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'trending'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => handleTabClick('briefing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'briefing'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Briefing</span>
            </button>

            <button
              onClick={() => handleTabClick('docs')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'docs'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden md:inline">API Docs</span>
            </button>

            <button
              onClick={() => handleTabClick('sources')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'sources'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden lg:inline">Sources</span>
            </button>
          </nav>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search all global trends..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-slate-900 text-sm text-slate-200 placeholder-slate-500 pl-9 pr-8 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500/50"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

      </div>
    </header>
  );
};
