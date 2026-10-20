import React from 'react';
import { ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SourceInfo } from '../types';

interface SourcesDirectoryProps {
  sources: SourceInfo[];
  isLoading: boolean;
}

export const SourcesDirectory: React.FC<SourcesDirectoryProps> = ({ sources, isLoading }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>TRANSPARENCY & ATTRIBUTION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit'] mb-3">
          Sources & Data Attributions
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Every story displayed across Global Trends & Information Hub originates from genuine external newsrooms, community platforms, or public RSS feeds. We do not synthesize artificial stories or strip original publisher rights.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-500">Loading verified source registry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    {s.name}
                  </h3>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" />
                    {s.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  <span>Publisher Site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={s.terms_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-300"
                >
                  Terms & Licensing
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attribution principles notice */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-200">Compliance & Content Policy</h4>
        <p>
          1. <strong>Direct Links:</strong> We always link users directly to the original article on the publisher's platform.
        </p>
        <p>
          2. <strong>No Full Reproduction:</strong> Only article headlines, source-provided summaries, and public metadata are indexed.
        </p>
        <p>
          3. <strong>Zero Paid APIs Required:</strong> All integrations operate within legitimate public feeds and official developer tiers.
        </p>
      </div>
    </div>
  );
};
