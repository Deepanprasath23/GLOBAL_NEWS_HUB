import React from 'react';
import { ExternalLink, MessageSquare, Flame, Clock, Share2, Layers } from 'lucide-react';
import { Article } from '../types';
import { formatRelativeTime, getCategoryBadgeStyle } from '../utils/formatters';

interface StoryCardProps {
  article: Article;
  onOpenDetails: (article: Article) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ article, onOpenDetails }) => {
  const badgeStyle = getCategoryBadgeStyle(article.category);

  return (
    <article className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-300">
      
      {/* Top Metadata Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {article.category.replace('-', ' ').toUpperCase()}
          </span>
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            {article.source}
          </span>
        </div>
        
        <span className="text-[11px] text-slate-500 flex items-center gap-1 flex-shrink-0">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(article.published_at)}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 cursor-pointer" onClick={() => onOpenDetails(article)}>
        <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug mb-2 font-['Outfit']">
          {article.title}
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed mb-4">
          {article.summary}
        </p>
      </div>

      {/* Card Image if available */}
      {article.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden max-h-44 w-full bg-slate-900 border border-slate-800/80 cursor-pointer" onClick={() => onOpenDetails(article)}>
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              // Hide image container on broken image link
              (e.target as HTMLElement).parentElement!.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Footer Row: Metrics & Original Link */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-auto">
        <div className="flex items-center gap-3">
          {article.score !== undefined && article.score > 0 && (
            <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]" title="Hacker News Points">
              <Flame className="w-3.5 h-3.5 fill-amber-400/20" />
              {article.score} pts
            </span>
          )}

          {article.comment_count !== undefined && article.comment_count > 0 && (
            <span className="flex items-center gap-1 text-slate-400 text-[11px]" title="Community Comments">
              <MessageSquare className="w-3 h-3" />
              {article.comment_count}
            </span>
          )}

          {article.related_links && article.related_links.length > 0 && (
            <span className="flex items-center gap-1 text-cyan-400/80 text-[11px]" title="Confirmed by multiple independent sources">
              <Layers className="w-3 h-3" />
              +{article.related_links.length} source{article.related_links.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(article)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            Details
          </button>
          
          <a
            href={article.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/50 transition-all"
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
