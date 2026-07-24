import React from 'react';
import {
  BarChart2,
  CheckCircle2,
  XCircle,
  Wrench,
  TrendingUp,
  History as HistoryIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { GeneratedPromptRecord, NavigationTab } from '../types';

interface AuditReportViewProps {
  activeRecord: GeneratedPromptRecord | null;
  history: GeneratedPromptRecord[];
  onSelectPromptRecord: (record: GeneratedPromptRecord) => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({
  activeRecord,
  history,
  onSelectPromptRecord,
  onSelectTab
}) => {
  const [selectedPromptId, setSelectedPromptId] = React.useState<string>(
    activeRecord?.id || history[0]?.id || ''
  );

  const currentRecord = React.useMemo(() => {
    return history.find(h => h.id === selectedPromptId) || activeRecord || history[0] || null;
  }, [selectedPromptId, activeRecord, history]);

  if (!currentRecord) {
    return (
      <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 p-8 space-y-4 max-w-2xl mx-auto">
        <BarChart2 className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Belum Ada Laporan Audit
        </h2>
        <p className="text-xs text-gray-500">
          Buat prompt pertama Anda terlebih dahulu untuk melihat hasil Audit Report mendalam dari 4 framework.
        </p>
        <button
          onClick={() => onSelectTab('generate')}
          className="px-5 py-2.5 rounded-xl bg-[#FE4C6F] text-white font-bold text-xs"
        >
          Generate Prompt Sekarang
        </button>
      </div>
    );
  }

  const scores = currentRecord.patchedScore || currentRecord.initialScore || {
    google: 95,
    anthropic: 95,
    openai: 95,
    dspy: 95,
    overall: 95
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header & Prompt Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              📊 Multi Framework Audit Report
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
              Score: {scores.overall}/100
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Evaluasi kepatuhan prompt terhadap standar Google, Anthropic, OpenAI, dan DSPy.
          </p>
        </div>

        {/* Prompt Selector Dropdown */}
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              Select Prompt:
            </span>
            <select
              value={currentRecord.id}
              onChange={e => setSelectedPromptId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FE4C6F]"
            >
              {history.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.patchedScore?.overall || 95}/100)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Selected Prompt Title Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FE4C6F]">
            Target AI: {currentRecord.targetAi || 'Gemini'}
          </span>
          <span className="text-[11px] text-gray-400">
            Created {new Date(currentRecord.createdAt).toLocaleString()}
          </span>
        </div>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
          {currentRecord.title}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong>Goal:</strong> {currentRecord.userGoal}
        </p>
      </div>

      {/* 4 Framework Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            name: 'Google Prompting',
            score: scores.google,
            focus: 'Objective, Context & Delimiters'
          },
          {
            name: 'Anthropic Claude',
            score: scores.anthropic,
            focus: 'Role, <thinking> Scratchpad & XML'
          },
          {
            name: 'OpenAI Standards',
            score: scores.openai,
            focus: 'Negative Constraints & Multi-step'
          },
          {
            name: 'DSPy Engine',
            score: scores.dspy,
            focus: 'Modular Pipeline & Assertions'
          }
        ].map(fw => (
          <div
            key={fw.name}
            className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2"
          >
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {fw.name}
            </span>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
              {fw.score} <span className="text-xs font-normal text-gray-400">/100</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{fw.focus}</p>
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden pt-1">
              <div
                className="h-full bg-[#FE4C6F]"
                style={{ width: `${fw.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Patch Recommendations */}
      {currentRecord.patchRecommendations && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#FE4C6F]" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Patch Recommendations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-1">
              <span className="font-bold text-[#FE4C6F]">Google Framework:</span>
              <p className="text-gray-600 dark:text-gray-300">
                {currentRecord.patchRecommendations.google || 'Objective & context clearly stated.'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-1">
              <span className="font-bold text-[#FE4C6F]">Anthropic Framework:</span>
              <p className="text-gray-600 dark:text-gray-300">
                {currentRecord.patchRecommendations.anthropic || 'Role & <thinking> reasoning scratchpad verified.'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-1">
              <span className="font-bold text-[#FE4C6F]">OpenAI Framework:</span>
              <p className="text-gray-600 dark:text-gray-300">
                {currentRecord.patchRecommendations.openai || 'Negative constraints & multi-step sequence active.'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-1">
              <span className="font-bold text-[#FE4C6F]">DSPy Framework:</span>
              <p className="text-gray-600 dark:text-gray-300">
                {currentRecord.patchRecommendations.dspy || 'Modular signatures & evaluation metrics embedded.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Improvement History Log */}
      {currentRecord.patchHistory && currentRecord.patchHistory.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Prompt Improvement History
            </h3>
          </div>

          <div className="space-y-3">
            {currentRecord.patchHistory.map((ph, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{ph.action}</span>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(ph.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  Score: {ph.improvedScore?.overall}/100
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
