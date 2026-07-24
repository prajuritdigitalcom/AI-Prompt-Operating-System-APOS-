import React from 'react';
import {
  Cpu,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  FileText,
  ListChecks,
  X,
  Sparkles
} from 'lucide-react';
import { FrameworkCache, FrameworkKey, UserApiKey } from '../types';

interface FrameworkCacheViewProps {
  frameworkCache: Record<string, FrameworkCache>;
  onSaveFrameworkCache: (cache: Record<string, FrameworkCache>) => void;
  lastRefreshDate: string;
  userApiKeys: UserApiKey[];
}

export const FrameworkCacheView: React.FC<FrameworkCacheViewProps> = ({
  frameworkCache,
  onSaveFrameworkCache,
  lastRefreshDate,
  userApiKeys
}) => {
  const [selectedFwKey, setSelectedFwKey] = React.useState<FrameworkKey | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [refreshSuccess, setRefreshSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    setError(null);
    setRefreshSuccess(false);

    const activeCustomKeys = userApiKeys.filter(k => k.status === 'active').map(k => k.key);
    const primaryKey = activeCustomKeys[0] || '';
    const rollingKeys = activeCustomKeys.slice(1);

    try {
      const res = await fetch('/api/refresh-frameworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userApiKey: primaryKey,
          rollingKeys
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to refresh framework cache');
      }

      const { data } = await res.json();
      const now = new Date().toISOString();

      if (data && data.frameworks) {
        const updatedCache: Record<string, FrameworkCache> = { ...frameworkCache };

        Object.keys(data.frameworks).forEach(key => {
          const fw = data.frameworks[key];
          if (updatedCache[key]) {
            updatedCache[key] = {
              ...updatedCache[key],
              version: fw.version || '2026.2',
              lastRefreshed: now,
              principles: fw.principles || updatedCache[key].principles,
              rules: fw.rules || updatedCache[key].rules,
              recommendations: fw.recommendations || updatedCache[key].recommendations,
              antiPatterns: fw.antiPatterns || updatedCache[key].antiPatterns
            };
          }
        });

        onSaveFrameworkCache(updatedCache);
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error('Cache refresh error:', err);
      setError(err.message || 'Cache refresh failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const selectedFramework = selectedFwKey ? frameworkCache[selectedFwKey] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              🧠 Framework Cache Engine
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
              Normalized Standards Active
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            APOS menyimpan normalisasi aturan resmi dari Google, Anthropic, OpenAI, dan DSPy untuk mempercepat pengolahan prompt.
          </p>
        </div>

        <button
          onClick={handleRefreshCache}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FE4C6F] hover:bg-[#E63E61] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FE4C6F]/25 active:scale-95 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Normalizing Rules...' : 'Refresh Framework Cache'}</span>
        </button>
      </div>

      {refreshSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Framework Cache berhasil diperbarui & dinormalisasi melalui Gemini API!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.values(frameworkCache) as FrameworkCache[]).map(fw => (
          <div
            key={fw.key}
            className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FE4C6F]">
                  {fw.key}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                  Version {fw.version}
                </span>
              </div>

              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {fw.name}
              </h2>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong className="text-gray-700 dark:text-gray-300">Focus:</strong> {fw.focusArea}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <span className="font-bold text-gray-900 dark:text-white block text-sm">
                    {fw.rules?.length || fw.ruleCount}
                  </span>
                  <span className="text-[10px] text-gray-400">Rules</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <span className="font-bold text-gray-900 dark:text-white block text-sm">
                    {fw.recommendations?.length || fw.recommendationCount}
                  </span>
                  <span className="text-[10px] text-gray-400">Recommendations</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <span className="font-bold text-gray-900 dark:text-white block text-sm">
                    {fw.auditChecklist?.length || fw.auditChecklistCount}
                  </span>
                  <span className="text-[10px] text-gray-400">Checklist Items</span>
                </div>
              </div>

              {/* Sample Principle */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Core Principle:</span>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                  {fw.principles?.[0] || 'Clear structure and explicit directives.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <a
                href={fw.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-500 hover:text-[#FE4C6F] dark:text-gray-400 flex items-center gap-1 font-medium"
              >
                <span>Official Documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedFwKey(fw.key)}
                className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-[#FE4C6F]/10 hover:text-[#FE4C6F] text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
              >
                Inspect Full Cache
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Framework Detail Modal */}
      {selectedFramework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FE4C6F]">
                  {selectedFramework.key}
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedFramework.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedFwKey(null)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Focus */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Focus Area</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedFramework.focusArea}</p>
              </div>

              {/* Principles */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FE4C6F]" />
                  <span>Core Principles</span>
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc text-gray-600 dark:text-gray-300">
                  {selectedFramework.principles?.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* Rules */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Normalized Rules</span>
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc text-gray-600 dark:text-gray-300">
                  {selectedFramework.rules?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Anti Patterns */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-amber-500" />
                  <span>Anti-Patterns to Avoid</span>
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc text-gray-600 dark:text-gray-300">
                  {selectedFramework.antiPatterns?.map((ap, i) => (
                    <li key={i}>{ap}</li>
                  ))}
                </ul>
              </div>

              {/* Audit Checklist */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-blue-500" />
                  <span>Audit Checklist Items</span>
                </h3>
                <div className="space-y-2">
                  {selectedFramework.auditChecklist?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          [{item.category}]
                        </span>{' '}
                        <span className="text-gray-600 dark:text-gray-300">{item.item}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono font-bold">
                        Weight: {item.weight}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedFwKey(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
