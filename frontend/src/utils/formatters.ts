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
      return { bg: 'bg-[#593E97]/25', text: 'text-[#c4b5fd]', border: 'border-[#593E97]/45' };
    case 'technology':
      return { bg: 'bg-[#49CF9E]/10', text: 'text-[#86B99A]', border: 'border-[#49CF9E]/25' };
    case 'world-news':
    case 'politics':
      return { bg: 'bg-[#00E5FF]/10', text: 'text-[#8CEAF4]', border: 'border-[#00E5FF]/25' };
    case 'sports':
      return { bg: 'bg-[#41B79B]/10', text: 'text-[#78D7BC]', border: 'border-[#41B79B]/25' };
    case 'business':
      return { bg: 'bg-[#41B79B]/10', text: 'text-[#78D7BC]', border: 'border-[#41B79B]/25' };
    case 'layoffs':
      return { bg: 'bg-[#593E97]/20', text: 'text-[#c4b5fd]', border: 'border-[#593E97]/40' };
    case 'entertainment':
    case 'music':
      return { bg: 'bg-[#593E97]/20', text: 'text-[#c4b5fd]', border: 'border-[#593E97]/40' };
    case 'india-regional':
      return { bg: 'bg-[#00E5FF]/10', text: 'text-[#8CEAF4]', border: 'border-[#00E5FF]/25' };
    default:
      return { bg: 'bg-slate-800/50', text: 'text-slate-300', border: 'border-slate-700/40' };
  }
}
