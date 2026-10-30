import React from 'react';
import { ExternalLink, MessageSquare, Flame, Clock, Layers } from 'lucide-react';
import { Article } from '../types';
import { formatRelativeTime, getCategoryBadgeStyle } from '../utils/formatters';

interface StoryCardProps {
  article: Article;
  onOpenDetails: (article: Article) => void;
  layoutMode?: 'grid' | 'compact';
}

export const StoryCard: React.FC<StoryCardProps> = ({ article, onOpenDetails, layoutMode = 'grid' }) => {
  const badgeStyle = getCategoryBadgeStyle(article.category);

  if (layoutMode === 'compact') {
    return (
      <article className="p-3.5 sm:p-4 rounded-xl bg-[#1F2937] hover:bg-[#243041] border border-white/10 hover:border-[#49CF9E]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenDetails(article)}>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
              {article.category.replace('-', ' ').toUpperCase()}
            </span>
            <span className="text-xs text-[#A0A0A0] font-medium">{article.source}</span>
            <span className="text-[11px] text-[#888888] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(article.published_at)}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-[#F9FAFB] group-hover:text-[#86B99A] transition-colors line-clamp-1 font-['Outfit']">
            {article.title}
          </h3>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
          {article.score !== undefined && article.score > 0 && (
            <span className="flex items-center gap-1 text-[#49CF9E] font-semibold text-xs">
              <Flame className="w-3.5 h-3.5 fill-[#49CF9E]/20" />
              {article.score}
            </span>
          )}
          {article.related_links && article.related_links.length > 0 && (
            <span className="text-[11px] text-[#86B99A] font-medium">
              +{article.related_links.length} sources
            </span>
          )}
          <button
            onClick={() => onOpenDetails(article)}
            className="text-xs text-[#9CA3AF] hover:text-white px-2 py-1 rounded bg-[#243041] hover:bg-[#273449] transition-colors"
          >
            Details
          </button>
          <a
            href={article.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-[#86B99A] hover:text-white bg-[#243041] border border-white/10 hover:bg-[#273449] transition-colors"
            title="Read original source"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </article>
    );
  }

  return (
    <article className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-200">
      
      {/* Top Metadata Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {article.category.replace('-', ' ').toUpperCase()}
          </span>
          <span className="text-xs font-medium text-[#9CA3AF] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#49CF9E]"></span>
            {article.source}
          </span>
        </div>
        
        <span className="text-[11px] text-[#888888] flex items-center gap-1 flex-shrink-0">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(article.published_at)}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 cursor-pointer" onClick={() => onOpenDetails(article)}>
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#86B99A] transition-colors line-clamp-2 leading-snug mb-2 font-['Outfit']">
          {article.title}
        </h3>
        
        <p className="text-sm text-[#D1D5DB] line-clamp-3 leading-relaxed mb-4">
          {article.summary}
        </p>
      </div>

      {/* Footer Row: Metrics & Original Link */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#9CA3AF] mt-auto">
        <div className="flex items-center gap-3">
          {article.score !== undefined && article.score > 0 && (
            <span className="flex items-center gap-1 text-[#49CF9E] font-semibold text-[11px]" title="Hacker News Points">
              <Flame className="w-3.5 h-3.5 fill-[#49CF9E]/20" />
              {article.score} pts
            </span>
          )}

          {article.comment_count !== undefined && article.comment_count > 0 && (
            <span className="flex items-center gap-1 text-[#A0A0A0] text-[11px]" title="Community Comments">
              <MessageSquare className="w-3 h-3" />
              {article.comment_count}
            </span>
          )}

          {article.related_links && article.related_links.length > 0 && (
            <span className="flex items-center gap-1 text-[#86B99A] text-[11px]" title="Confirmed by multiple independent sources">
              <Layers className="w-3 h-3" />
              +{article.related_links.length} source{article.related_links.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(article)}
            className="text-xs text-[#9CA3AF] hover:text-white px-2 py-1 rounded hover:bg-[#243041] transition-colors"
          >
            Details
          </button>
          
          <a
            href={article.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#100e0b] hover:text-[#100e0b] font-semibold px-2.5 py-1 rounded-lg bg-[#49CF9E] hover:bg-[#86B99A] transition-all shadow-sm"
            title="Read original full report at source"
          >
            <span>Read</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

    </article>
  );
};
