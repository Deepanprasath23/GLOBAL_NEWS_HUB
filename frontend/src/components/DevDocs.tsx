import React from 'react';
import { Terminal, Shield, Cpu, ExternalLink, Check, Copy, ArrowRight } from 'lucide-react';

export const DevDocs: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, endpointName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpointName);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const API_URL = window.location.origin;

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/health',
      description: 'System operational status, in-memory TTL cache statistics, and active source count.',
      params: 'None'
    },
    {
      method: 'GET',
      path: '/api/v1/feed',
      description: 'Unified normalized feed deduplicated across world news, tech, AI, sports, business, and layoffs.',
      params: 'page=1, limit=20, category=technology'
    },
    {
      method: 'GET',
      path: '/api/v1/categories',
      description: 'List all supported information categories with metadata and icons.',
      params: 'None'
    },
    {
      method: 'GET',
      path: '/api/v1/categories/{slug}',
      description: 'Retrieve real-time stories filtered strictly for a specific category slug.',
      params: 'slug (path: "artificial-intelligence"), page=1, limit=20'
    },
    {
      method: 'GET',
      path: '/api/v1/trending',
      description: 'Explainable cross-source velocity topics and top community engagement stories.',
      params: 'None'
    },
    {
      method: 'GET',
      path: '/api/v1/search',
      description: 'Search currently available live stories across titles and publisher summaries.',
      params: 'q="quantum computing", category="technology", limit=30'
    },
    {
      method: 'GET',
      path: '/api/v1/briefing',
      description: '2-minute executive daily briefing synthesizing top developments across 8+ categories.',
      params: 'None'
    },
    {
      method: 'GET',
      path: '/api/v1/sources',
      description: 'Directory of all integrated news organizations, RSS feeds, terms of use, and attributions.',
      params: 'None'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>OPEN REST API SPECIFICATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit'] mb-3">
          Developer Documentation & API
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          The Global Trends & Information Hub REST API is completely free and public. Integrate real-time global news, tech discussions, AI updates, and sports feeds into your applications without requiring API keys or user signups.
        </p>
      </div>

      {/* OpenAPI Swagger Link Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1 font-['Outfit']">
            Interactive OpenAPI / Swagger UI
          </h3>
          <p className="text-xs text-slate-300">
            Explore and test all interactive endpoints directly with Swagger UI schema validation.
          </p>
        </div>
        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide transition-all shadow-md shadow-cyan-500/20 flex-shrink-0"
        >
          <span>Open Swagger UI</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Architecture & Caching Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Cpu className="w-4 h-4" />
            <h4 className="text-sm font-bold text-white">In-Memory TTL Caching</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All feed requests are cached in RAM with a 2 to 5-minute TTL. Stale-on-error guarantees fallback data if an external upstream publisher experiences downtime. Zero databases or permanent disk storage.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Shield className="w-4 h-4" />
            <h4 className="text-sm font-bold text-white">Fair Usage & Attribution</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please respect upstream providers. Cache API responses client-side, do not scrape in tight loops, and always maintain author and publisher attribution links provided in the <code className="text-cyan-300">content_url</code> property.
          </p>
        </div>
      </div>

      {/* Endpoints Reference */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 font-['Outfit']">
          Endpoints Reference (v1)
        </h2>

        <div className="space-y-4">
          {endpoints.map((ep, idx) => {
            const curlCmd = `curl -X GET "${API_URL}${ep.path.replace('{slug}', 'technology')}"`;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-100">
                      {ep.path}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(curlCmd, ep.path)}
                    className="self-start sm:self-center flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 font-mono transition-colors"
                  >
                    {copiedEndpoint === ep.path ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied cURL</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy cURL</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-400 mb-3">
                  {ep.description}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 flex items-center justify-between overflow-x-auto">
                  <span className="text-slate-500 mr-2">Query/Path params:</span>
                  <span className="text-cyan-300 truncate">{ep.params}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
