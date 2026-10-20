import React from 'react';
import { Globe, Heart, Shield, Terminal } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="mt-20 border-t border-slate-900 bg-slate-950/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Philosophy */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="text-base font-bold text-white font-['Outfit']">
                GLOBAL<span className="text-cyan-400">TRENDS</span> HUB
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-300 italic">
              "Less scrolling. More understanding. Everything important, in one place."
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              A 100% free, public information discovery platform unifying global news, artificial intelligence, tech breakthroughs, business layoffs, sports, and culture into one clean editorial dashboard.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onSelectTab('feed')} className="hover:text-cyan-400 transition-colors">
                  Latest Global Dispatches
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('trending')} className="hover:text-cyan-400 transition-colors">
                  Measurable Trending Topics
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('briefing')} className="hover:text-cyan-400 transition-colors">
                  Executive 2-Minute Briefing
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('sources')} className="hover:text-cyan-400 transition-colors">
                  Data Sources & Attributions
                </button>
              </li>
            </ul>
          </div>

          {/* Developers & Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              For Developers
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onSelectTab('docs')} className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  <span>Public REST API</span>
                </button>
              </li>
              <li>
                <a href="/docs" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                  Interactive OpenAPI (Swagger)
                </a>
              </li>
              <li>
                <span className="text-slate-500">In-Memory TTL Caching (2-5m)</span>
              </li>
              <li>
                <span className="text-slate-500">Zero Persistent Storage</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits & Disclaimer */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Global Trends & Information Hub. All original content copyright to respective publishers.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Tracking • Free Access</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
