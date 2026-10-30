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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#49CF9E]/10 border border-[#49CF9E]/20 text-[#86B99A] text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>TRANSPARENCY & ATTRIBUTION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit'] mb-3">
          Sources & Data Attributions
        </h1>
        <p className="text-[#9CA3AF] text-sm sm:text-base leading-relaxed">
          Every story displayed across Global Trends & Information Hub originates from genuine external newsrooms, community platforms, or public RSS feeds. We do not synthesize artificial stories or strip original publisher rights.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[#888888]">Loading verified source registry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((s) => (
            <div
              key={s.id}
              className="scroll-reveal p-5 rounded-2xl bg-[#1F2937] border border-white/10 flex flex-col justify-between hover:border-[#49CF9E]/30 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    {s.name}
                  </h3>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#100e0b] bg-[#49CF9E] px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {s.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-[#9CA3AF] mb-4 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#86B99A] hover:text-white font-medium flex items-center gap-1"
                >
                  <span>Publisher Site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={s.terms_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#94A3B8] hover:text-[#49CF9E]"
                >
                  Terms & Licensing
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attribution principles notice */}
      <div className="p-5 rounded-2xl bg-[#111827]/90 border border-white/10 text-xs text-[#9CA3AF] space-y-2">
        <h4 className="font-bold text-white">Compliance & Content Policy</h4>
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
