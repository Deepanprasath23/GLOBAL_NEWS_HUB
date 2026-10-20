import React from 'react';
import { Flame, Activity, ShieldCheck, ArrowUpRight, Layers } from 'lucide-react';
import { TrendingResponse, Article } from '../types';
import { StoryCard } from './StoryCard';
import { getCategoryBadgeStyle } from '../utils/formatters';

interface TrendingSectionProps {
  trendingData: TrendingResponse | null;
  isLoading: boolean;
  onOpenArticle: (article: Article) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  trendingData,
  isLoading,
  onOpenArticle
}) => {
  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Synthesizing real-time cross-publisher velocity signals...</p>
      </div>
    );
  }

  if (!trendingData || trendingData.trending_topics.length === 0) {
    return (
      <div className="py-16 text-center glass-panel rounded-2xl max-w-md mx-auto p-8">
        <Flame className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Awaiting Velocity Thresholds</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Trending topics require verified multi-publisher coverage or significant Hacker News engagement. Please check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Explainable Methodology Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-cyan-900/40 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Honest Signal Measurement: </span>
          Unlike platforms that invent arbitrary percentages or fake search counts, our trending ranking is derived strictly from
          <strong> multi-publisher cross-confirmation</strong> (independent publishers simultaneously covering the same development),
          <strong> real Hacker News community points</strong>, and <strong>publication recency velocity</strong>.
        </div>
      </div>

      {/* Measurable Trending Topics Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              Cross-Source Velocity Topics
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Updated: {new Date(trendingData.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingData.trending_topics.map((t, idx) => {
            const badgeStyle = getCategoryBadgeStyle(t.category);
            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                      {t.category.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/50">
                      <Activity className="w-3 h-3" />
                      Velocity {t.velocity_score}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-tight font-['Outfit']">
                    {t.topic}
                  </h3>

                  <div className="text-xs text-cyan-300/90 font-medium mb-3 flex items-center gap-1.5 bg-cyan-950/30 p-2 rounded-lg border border-cyan-900/30">
                    <Layers className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
                    <span>{t.explanation}</span>
                  </div>

                  {/* Sample headlines */}
                  <div className="space-y-1.5 mb-4">
                    {t.sample_headlines.map((hl, hIdx) => (
                      <p key={hIdx} className="text-xs text-slate-400 line-clamp-1 italic">
                        "{hl}"
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{t.source_names.length} source{t.source_names.length > 1 ? 's' : ''} covering</span>
                  <span>{t.mention_count} dispatches</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Ranked Trending Stories Feed */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
            Highest Signal Stories
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingData.top_stories.map((story) => (
            <StoryCard
              key={story.id}
              article={story}
              onOpenDetails={onOpenArticle}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
