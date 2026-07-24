import React from 'react';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Bot,
  Sliders,
  Database,
  Trash2,
  CheckCircle2,
  Download,
  Upload
} from 'lucide-react';
import { AppSettings } from '../utils/storage';
import { ThemeMode } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClearData: () => void;
}

const TARGET_AI_MODELS = ['Gemini', 'ChatGPT', 'Claude', 'Grok', 'DeepSeek', 'Qwen'];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onClearData
}) => {
  const [autoApplyPatch, setAutoApplyPatch] = React.useState(settings.autoApplyPatch ?? true);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      autoApplyPatch
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <div className="pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#FE4C6F]" />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            ⚙ Application Settings
          </h1>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Pengaturan preferensi otomatisasi dan pengelolaan data aplikasi APOS.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Pengaturan berhasil disimpan!</span>
        </div>
      )}

      {/* Auto-Patch Engine Toggle */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm text-gray-900 dark:text-white">
            Otomatis Jalankan Patch Engine
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Otomatis perbaiki prompt hasil generate jika skor di bawah 95.
          </p>
        </div>

        <button
          onClick={() => setAutoApplyPatch(!autoApplyPatch)}
          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
            autoApplyPatch ? 'bg-[#FE4C6F]' : 'bg-gray-300 dark:bg-gray-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              autoApplyPatch ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Save Action */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#FE4C6F] hover:bg-[#E63E61] text-white font-bold text-xs shadow-md shadow-[#FE4C6F]/25 active:scale-95 transition-all"
        >
          Simpan Pengaturan
        </button>
      </div>

      {/* Reset Data Danger Zone */}
      <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 shadow-sm space-y-3 pt-6">
        <h2 className="font-bold text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Zona Berbahaya</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Menghapus seluruh riwayat prompt dan API keys tersimpan dari peramban Anda.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Apakah Anda yakin ingin menghapus seluruh data lokal APOS?')) {
              onClearData();
            }
          }}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
        >
          Reset Seluruh Data Lokal
        </button>
      </div>
    </div>
  );
};
