import React from 'react';
import {
  History,
  Search,
  Copy,
  Check,
  Download,
  Trash2,
  ExternalLink,
  Upload,
  FileJson,
  Sparkles
} from 'lucide-react';
import { GeneratedPromptRecord, NavigationTab } from '../types';

interface HistoryViewProps {
  history: GeneratedPromptRecord[];
  onSelectPromptRecord: (record: GeneratedPromptRecord) => void;
  onDeletePromptRecord: (id: string) => void;
  onClearHistory: () => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectPromptRecord,
  onDeletePromptRecord,
  onClearHistory,
  onSelectTab
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const filteredHistory = React.useMemo(() => {
    if (!searchTerm.trim()) return history;
    const term = searchTerm.toLowerCase();
    return history.filter(
      h =>
        h.title.toLowerCase().includes(term) ||
        h.userNeed.toLowerCase().includes(term) ||
        h.userGoal.toLowerCase().includes(term) ||
        (h.targetAi || '').toLowerCase().includes(term)
    );
  }, [history, searchTerm]);

  const handleCopy = (e: React.MouseEvent, record: GeneratedPromptRecord) => {
    e.stopPropagation();
    navigator.clipboard.writeText(record.markdownOutput);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (e: React.MouseEvent, record: GeneratedPromptRecord) => {
    e.stopPropagation();
    const blob = new Blob([record.markdownOutput], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apos-history-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              📝 Prompt Generation History
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-700">
              {history.length} Saved
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Riwayat pembuatan prompt disimpan secara lokal di browser Anda.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-300 dark:border-gray-700 transition-colors"
            >
              <FileJson className="w-4 h-4 text-[#FE4C6F]" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Input */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari riwayat berdasarkan judul, kebutuhan, atau target AI..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FE4C6F]"
          />
        </div>
      )}

      {/* History List Table / Cards */}
      {filteredHistory.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 p-8 space-y-3">
          <History className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {searchTerm ? 'Tidak ada riwayat yang cocok' : 'Belum Ada Riwayat Prompt'}
          </p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Prompt yang Anda buat akan tersimpan di sini secara otomatis.
          </p>
          <button
            onClick={() => onSelectTab('generate')}
            className="px-4 py-2 rounded-xl bg-[#FE4C6F] text-white font-semibold text-xs"
          >
            Generate Prompt Baru
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map(record => {
            const score = record.patchedScore?.overall || record.initialScore?.overall || 95;

            return (
              <div
                key={record.id}
                onClick={() => {
                  onSelectPromptRecord(record);
                  onSelectTab('generate');
                }}
                className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-[#FE4C6F]/50 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-[#FE4C6F] transition-colors">
                      {record.title}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FE4C6F]/10 text-[#FE4C6F] font-bold">
                      {record.targetAi || 'Gemini'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    Goal: {record.userGoal}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Score */}
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Score</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {score}/100
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleCopy(e, record)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    title="Copy Markdown"
                  >
                    {copiedId === record.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDownload(e, record)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    title="Download .md"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePromptRecord(record.id);
                    }}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
