import React, { useState } from 'react';
import {
  Globe,
  TrendingUp,
  FileText,
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
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#111827]/90 shadow-md backdrop-blur-xl">
      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div
            onClick={() => handleTabClick('feed')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-white/10 p-[1px] group-hover:border-[#49CF9E]/50 transition-all">
              <div className="w-full h-full bg-[#111827] rounded-[10px] flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#49CF9E] group-hover:rotate-6 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-['Outfit']">
                GLOBAL<span className="text-[#49CF9E]">TRENDS</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#243041] text-[#86B99A] border border-white/10">
                  HUB
                </span>
              </span>
              <p className="text-[11px] text-[#94A3B8] tracking-wide -mt-0.5 hidden sm:block">
                World Intelligence & News Network
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Search world news, AI breakthroughs, layoffs, sports..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-[#100e0b]/70 text-sm text-[#D1D5DB] placeholder-[#94A3B8] pl-10 pr-9 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#49CF9E]/70 focus:ring-1 focus:ring-[#49CF9E]/20 transition-all"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white"
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
                  ? 'bg-[#49CF9E]/10 text-[#86B99A] border border-[#49CF9E]/30'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </button>

            <button
              onClick={() => handleTabClick('trending')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'trending'
                  ? 'bg-[#49CF9E]/10 text-[#86B99A] border border-[#49CF9E]/30'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => handleTabClick('briefing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'briefing'
                  ? 'bg-[#49CF9E]/10 text-[#86B99A] border border-[#49CF9E]/30'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Briefing</span>
            </button>

            <button
              onClick={() => handleTabClick('sources')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'sources'
                  ? 'bg-[#49CF9E]/10 text-[#86B99A] border border-[#49CF9E]/30'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden lg:inline">Sources</span>
            </button>

            <div className="h-5 w-[1px] bg-[#3d3d3d] hidden sm:block mx-1"></div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg text-[#49CF9E] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center"
              title="Sync latest live feeds"
            >
              <Radio className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </nav>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Search all global trends..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-[#100e0b]/70 text-sm text-[#D1D5DB] placeholder-[#94A3B8] pl-9 pr-8 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#49CF9E]/70"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]"
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
