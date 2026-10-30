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
  'world-news': <Globe className="w-3.5 h-3.5 text-[#86B99A]" />,
  'technology': <Cpu className="w-3.5 h-3.5 text-[#86B99A]" />,
  'artificial-intelligence': <Bot className="w-3.5 h-3.5 text-[#86B99A]" />,
  'business': <TrendingUp className="w-3.5 h-3.5 text-[#86B99A]" />,
  'politics': <Landmark className="w-3.5 h-3.5 text-[#86B99A]" />,
  'sports': <Trophy className="w-3.5 h-3.5 text-[#86B99A]" />,
  'entertainment': <Film className="w-3.5 h-3.5 text-[#86B99A]" />,
  'layoffs': <Briefcase className="w-3.5 h-3.5 text-[#86B99A]" />,
  'india-regional': <Compass className="w-3.5 h-3.5 text-[#86B99A]" />,
  'music': <Music className="w-3.5 h-3.5 text-[#86B99A]" />,
};

// Logical priority order for editorial presentation
const CATEGORY_PRIORITY = [
  'world-news',
  'technology',
  'artificial-intelligence',
  'business',
  'politics',
  'sports',
  'entertainment',
  'layoffs',
  'india-regional'
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  // Sort categories by prioritized editorial order
  const sortedCategories = [...categories].sort((a, b) => {
    const idxA = CATEGORY_PRIORITY.indexOf(a.slug);
    const idxB = CATEGORY_PRIORITY.indexOf(b.slug);
    const priorityA = idxA === -1 ? 999 : idxA;
    const priorityB = idxB === -1 ? 999 : idxB;
    return priorityA - priorityB;
  });

  return (
    <div className="border-b border-white/10 bg-[#111827]/90 backdrop-blur-xl py-2.5 overflow-x-auto scrollbar-none sticky top-[8.25rem] sm:top-[6.75rem] md:top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 min-w-max">
        
        {/* All Stories Button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            selectedCategory === null
              ? 'bg-[#49CF9E] text-[#100e0b] font-bold shadow-sm'
              : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#243041] border border-white/10'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${selectedCategory === null ? 'text-[#100e0b]' : 'text-[#49CF9E]'}`} />
          <span>All Dispatches</span>
        </button>

        {/* Dynamic Category Buttons */}
        {sortedCategories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all ${
                isSelected
                  ? 'bg-[#49CF9E] text-[#100e0b] font-bold shadow-sm'
                  : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#243041] border border-white/10'
              }`}
            >
              {isSelected ? (
                <span className="text-[#100e0b]">{ICON_MAP[cat.slug] || <Globe className="w-3.5 h-3.5" />}</span>
              ) : (
                ICON_MAP[cat.slug] || <Globe className="w-3.5 h-3.5 text-[#A0A0A0]" />
              )}
              <span>{cat.name}</span>
            </button>
          );
        })}

      </div>
    </div>
  );
};
