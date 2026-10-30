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
    <div className="scroll-reveal relative overflow-hidden rounded-2xl bg-[#111827]/90 border border-white/10 p-6 sm:p-7 mb-7 shadow-md">
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#49CF9E]/10 border border-[#49CF9E]/20 text-[#86B99A] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXECUTIVE BRIEF</span>
              <span className="text-[#94A3B8]">•</span>
              <span className="text-[#9CA3AF] font-normal">{briefing.categories_covered} Categories Synthesized</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F9FAFB] tracking-tight font-['Outfit']">
              Global Intelligence Overview
            </h2>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="self-start sm:self-center flex items-center gap-1.5 text-xs font-semibold text-[#86B99A] hover:text-white px-3.5 py-1.5 rounded-xl bg-[#1F2937] hover:bg-[#243041] border border-white/10 transition-all"
          >
            <span>{isExpanded ? 'Collapse Brief' : 'Read Full Brief'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-[#D1D5DB] text-base leading-relaxed max-w-3xl mb-5">
          {briefing.summary_lead}
        </p>

        {/* Bulletins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2">
          {briefing.key_bulletins.slice(0, isExpanded ? briefing.key_bulletins.length : 4).map((bulletin, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-[#1F2937]/80 border border-white/10 text-sm text-[#D1D5DB]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#49CF9E] flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{bulletin}</span>
            </div>
          ))}
        </div>

        {/* Expanded Top Developments Cards */}
        {isExpanded && (
          <div className="mt-5 pt-5 border-t border-white/10">
            <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">
              Core Category Developments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {briefing.top_developments.map((story) => (
                <div
                  key={story.id}
                  onClick={() => onOpenArticle(story)}
                  className="p-3.5 rounded-xl bg-[#1F2937] border border-white/10 hover:border-[#49CF9E]/30 cursor-pointer group transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#86B99A] uppercase tracking-wider block mb-1">
                      {story.category}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#86B99A] transition-colors line-clamp-2 mb-1.5">
                      {story.title}
                    </h4>
                    <p className="text-[11px] text-[#9CA3AF] line-clamp-2 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#94A3B8] pt-2 border-t border-white/10">
                    <span className="truncate max-w-[100px]">{story.source}</span>
                    <ArrowRight className="w-3 h-3 text-[#49CF9E] group-hover:translate-x-1 transition-transform" />
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
