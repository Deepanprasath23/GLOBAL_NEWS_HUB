export function formatRelativeTime(isoString: string): string {
  try {
    const pubDate = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - pubDate.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
    return pubDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export function getCategoryBadgeStyle(slug: string): { bg: string; text: string; border: string } {
  switch (slug) {
    case 'artificial-intelligence':
      return { bg: 'bg-purple-950/40', text: 'text-purple-300', border: 'border-purple-500/30' };
    case 'technology':
      return { bg: 'bg-cyan-950/40', text: 'text-cyan-300', border: 'border-cyan-500/30' };
    case 'world-news':
    case 'politics':
      return { bg: 'bg-blue-950/40', text: 'text-blue-300', border: 'border-blue-500/30' };
    case 'sports':
      return { bg: 'bg-emerald-950/40', text: 'text-emerald-300', border: 'border-emerald-500/30' };
    case 'business':
      return { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-500/30' };
    case 'layoffs':
      return { bg: 'bg-rose-950/40', text: 'text-rose-300', border: 'border-rose-500/30' };
    case 'entertainment':
    case 'music':
      return { bg: 'bg-pink-950/40', text: 'text-pink-300', border: 'border-pink-500/30' };
    case 'india-regional':
      return { bg: 'bg-orange-950/40', text: 'text-orange-300', border: 'border-orange-500/30' };
    default:
      return { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700/50' };
  }
}
