import React from 'react';
import { X, ExternalLink, Clock, ShieldCheck, Layers, Link as LinkIcon } from 'lucide-react';
import { Article } from '../types';
import { formatRelativeTime, getCategoryBadgeStyle } from '../utils/formatters';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  const badgeStyle = getCategoryBadgeStyle(article.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {article.category.replace('-', ' ').toUpperCase()}
          </span>
          <span className="text-xs font-medium text-slate-300 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
            Source: {article.source}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatRelativeTime(article.published_at)}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug font-['Outfit']">
          {article.title}
        </h2>

        {/* Featured Image if present */}
        {article.image_url && (
          <div className="mb-6 rounded-2xl overflow-hidden bg-slate-950 max-h-72 border border-slate-800">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Summary Lead */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Verified Source Dispatch Summary
          </h4>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Related Coverage Links */}
        {article.related_links && article.related_links.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Related Independent Coverage ({article.related_links.length})
            </h4>
            <div className="space-y-1.5">
              {article.related_links.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 truncate block hover:underline flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{link}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Copyright notice and Direct Original link */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 max-w-sm">
            Content is summarized and attributed to <strong>{article.source}</strong> under fair discovery guidelines. Click below to view the complete original reporting.
          </p>

          <a
            href={article.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20"
          >
            <span>Read on {article.source}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
