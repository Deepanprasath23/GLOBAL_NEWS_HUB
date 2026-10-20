import React from 'react';
import {
  Globe,
  Landmark,
  Cpu,
  Bot,
  Trophy,
  TrendingUp,
  Briefcase,
  Film,
  Music,
  Compass,
  Sparkles
} from 'lucide-react';
import { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'world-news': <Globe className="w-3.5 h-3.5" />,
  'politics': <Landmark className="w-3.5 h-3.5" />,
  'technology': <Cpu className="w-3.5 h-3.5" />,
  'artificial-intelligence': <Bot className="w-3.5 h-3.5 text-purple-400" />,
  'sports': <Trophy className="w-3.5 h-3.5" />,
  'business': <TrendingUp className="w-3.5 h-3.5" />,
  'layoffs': <Briefcase className="w-3.5 h-3.5 text-rose-400" />,
  'entertainment': <Film className="w-3.5 h-3.5" />,
  'music': <Music className="w-3.5 h-3.5" />,
  'india-regional': <Compass className="w-3.5 h-3.5 text-orange-400" />,
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="border-b border-slate-900 bg-slate-950/40 py-3 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 min-w-max">
        
        {/* All Stories Button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            selectedCategory === null
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Dispatches</span>
        </button>

        {/* Dynamic Category Buttons */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
              }`}
            >
              {ICON_MAP[cat.slug] || <Globe className="w-3.5 h-3.5" />}
              <span>{cat.name}</span>
            </button>
          );
        })}

      </div>
    </div>
  );
};
