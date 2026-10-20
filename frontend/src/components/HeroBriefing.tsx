import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { BriefingResponse, Article } from '../types';

interface HeroBriefingProps {
  briefing: BriefingResponse | null;
  onOpenArticle: (article: Article) => void;
}

export const HeroBriefing: React.FC<HeroBriefingProps> = ({ briefing, onOpenArticle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!briefing) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800/80 p-6 sm:p-8 mb-8 shadow-2xl">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXECUTIVE 2-MINUTE BRIEF</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-normal">{briefing.categories_covered} Categories Synthesized</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
              {briefing.greeting}
            </h2>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="self-start sm:self-center flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all"
          >
            <span>{isExpanded ? 'Collapse Brief' : 'Read Full Executive Brief'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-4 font-light">
          {briefing.summary_lead}
        </p>

        {/* Quick Bulletins Ticker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2">
          {briefing.key_bulletins.slice(0, isExpanded ? briefing.key_bulletins.length : 4).map((bulletin, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs sm:text-sm text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{bulletin}</span>
            </div>
          ))}
        </div>

        {/* Expanded Top Developments Cards */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Core Category Developments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {briefing.top_developments.map((story) => (
                <div
                  key={story.id}
                  onClick={() => onOpenArticle(story)}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer group transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      {story.category}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                      {story.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {story.summary}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900">
                    <span>{story.source}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
