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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100e0b]/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label={`Article details: ${article.title}`}
        className="relative w-full max-w-3xl bg-[#111827] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close article details"
          className="absolute top-5 right-5 p-2 rounded-full text-[#9CA3AF] hover:text-white hover:bg-[#243041] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {article.category.replace('-', ' ').toUpperCase()}
          </span>
          <span className="text-xs font-medium text-[#86B99A] px-2.5 py-1 rounded-full bg-[#49CF9E]/10 border border-[#49CF9E]/20">
            Source: {article.source}
          </span>
          <span className="text-xs text-[#94A3B8] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatRelativeTime(article.published_at)}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#F9FAFB] mb-5 leading-snug font-['Outfit'] pr-8">
          {article.title}
        </h2>

        {/* Summary Lead */}
        <div className="mb-6 p-5 sm:p-6 rounded-xl bg-[#1F2937] border border-white/10">
          <h4 className="text-xs font-bold text-[#86B99A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#49CF9E]" />
            Verified Source Dispatch Summary
          </h4>
          <p className="text-base sm:text-[17px] text-[#D1D5DB] leading-[1.8] max-w-[74ch]">
            {article.summary}
          </p>
        </div>

        {/* Related Coverage Links */}
        {article.related_links && article.related_links.length > 0 && (
          <div className="mb-6 p-5 rounded-xl bg-[#1F2937] border border-white/10">
            <h4 className="text-xs font-bold text-[#86B99A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#49CF9E]" />
              Related Independent Coverage ({article.related_links.length})
            </h4>
            <div className="space-y-1.5">
              {article.related_links.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#9CA3AF] hover:text-[#49CF9E] truncate block hover:underline flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{link}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Copyright notice and Direct Original link */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[#94A3B8] max-w-sm leading-relaxed">
            Content is summarized and attributed to <strong>{article.source}</strong> under fair discovery guidelines. Click below to view the complete original reporting.
          </p>

          <a
            href={article.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#49CF9E] hover:bg-[#86B99A] text-[#100e0b] font-bold text-sm transition-all shadow-sm"
          >
            <span>Read on {article.source}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
