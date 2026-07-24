import React from 'react';
import {
  Sparkles,
  BarChart3,
  Cpu,
  Key,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileText
} from 'lucide-react';
import { GeneratedPromptRecord, NavigationTab, FrameworkCache } from '../types';

interface DashboardViewProps {
  history: GeneratedPromptRecord[];
  onSelectTab: (tab: NavigationTab) => void;
  activeKeyCount: number;
  lastRefreshDate: string;
  frameworkCache: Record<string, FrameworkCache>;
  onSelectPromptRecord: (record: GeneratedPromptRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  history,
  onSelectTab,
  activeKeyCount,
  lastRefreshDate,
  frameworkCache,
  onSelectPromptRecord
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const totalGenerated = history.length;
  const avgScore = React.useMemo(() => {
    if (history.length === 0) return 96;
    const sum = history.reduce((acc, h) => acc + (h.patchedScore?.overall || h.initialScore?.overall || 90), 0);
    return Math.round(sum / history.length);
  }, [history]);

  const handleCopyPrompt = (e: React.MouseEvent, record: GeneratedPromptRecord) => {
    e.stopPropagation();
    navigator.clipboard.writeText(record.markdownOutput);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formattedDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero SaaS Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1F2937] via-[#2A3649] to-[#111827] text-white p-6 sm:p-8 border border-gray-800 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#FE4C6F]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FE4C6F]/10 text-[#FE4C6F] border border-[#FE4C6F]/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Multi Framework Prompt Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Transform Ideas Into <span className="bg-gradient-to-r from-[#FE4C6F] to-pink-400 bg-clip-text text-transparent">AI-Ready Markdown</span>
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            APOS analyzes your goal, applies 4 official industry frameworks (Google, Anthropic, OpenAI, DSPy), performs automated audits, and compiles precision Markdown ready for Gemini, ChatGPT, Claude, Grok, & DeepSeek.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab('generate')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FE4C6F] hover:bg-[#E63E61] text-white font-semibold text-sm shadow-lg shadow-[#FE4C6F]/30 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate New Prompt</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={() => onSelectTab('docs')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 font-medium text-sm border border-gray-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Explore Framework Docs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold">Total Generated</span>
            <div className="p-2 rounded-xl bg-[#FE4C6F]/10 text-[#FE4C6F]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {totalGenerated}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Prompts compiled</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold">Avg Prompt Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
              {avgScore}
              <span className="text-xs font-normal text-gray-400">/100</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Across 4 Frameworks</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold">Framework Engines</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              4 / 4
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Google, Anthropic, OpenAI, DSPy</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold">Active API Keys</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {activeKeyCount > 0 ? activeKeyCount : 'Public'}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {activeKeyCount > 0 ? 'Rolling failover enabled' : 'Environment fallback'}
            </p>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold">Framework Cache</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Synced</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Normalized rules active</p>
          </div>
        </div>
      </div>

      {/* 4 Frameworks Quick Breakdown */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Multi Framework Engines
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              APOS combines normalized rules from 4 major prompt engineering strategies
            </p>
          </div>
          <button
            onClick={() => onSelectTab('cache')}
            className="text-xs font-medium text-[#FE4C6F] hover:underline flex items-center gap-1"
          >
            <span>View Full Cache</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.values(frameworkCache) as FrameworkCache[]).map(fw => (
            <div
              key={fw.key}
              onClick={() => onSelectTab('cache')}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 hover:border-[#FE4C6F]/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FE4C6F]">
                  {fw.key}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
                  Active
                </span>
              </div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-[#FE4C6F] transition-colors truncate">
                {fw.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                Focus: {fw.focusArea}
              </p>
              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700/50 flex items-center justify-between text-[11px] text-gray-400">
                <span>{fw.ruleCount} Rules</span>
                <span>{fw.auditChecklistCount} Audit Items</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Prompts History */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Generated Prompts
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Access your previously compiled Markdown prompts & audit reports
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => onSelectTab('history')}
              className="text-xs font-medium text-[#FE4C6F] hover:underline flex items-center gap-1"
            >
              <span>View All ({history.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FE4C6F]/10 text-[#FE4C6F] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              No prompts generated yet
            </p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Enter your need and goal to let the Multi Framework Engine create your first professional AI prompt.
            </p>
            <button
              onClick={() => onSelectTab('generate')}
              className="px-4 py-2 rounded-xl bg-[#FE4C6F] hover:bg-[#E63E61] text-white font-medium text-xs transition-colors"
            >
              Generate First Prompt
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map(item => {
              const score = item.patchedScore?.overall || item.initialScore?.overall || 90;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectPromptRecord(item);
                    onSelectTab('generate');
                  }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer group"
                >
                  <div className="space-y-1 min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-[#FE4C6F] transition-colors">
                        {item.title || item.userNeed}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                        {item.targetAi || 'Gemini'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      Goal: {item.userGoal}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Generated {formattedDate(item.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Score Badge */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        Score
                      </span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {score}/100
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleCopyPrompt(e, item)}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                      title="Copy Markdown"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
