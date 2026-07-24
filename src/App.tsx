import React from 'react';
import { Sidebar } from './components/Sidebar';
import { GeneratePromptView } from './components/GeneratePromptView';
import { FrameworkCacheView } from './components/FrameworkCacheView';
import { HistoryView } from './components/HistoryView';
import { ApiSettingsView } from './components/ApiSettingsView';

import { Menu, Sparkles } from 'lucide-react';

import {
  NavigationTab,
  GeneratedPromptRecord,
  UserApiKey,
  FrameworkCache
} from './types';

import {
  getStoredHistory,
  savePromptRecord,
  deletePromptRecord,
  clearPromptHistory,
  getStoredApiKeys,
  saveStoredApiKeys,
  getStoredFrameworkCache,
  saveFrameworkCache,
  getLastFrameworkRefresh
} from './utils/storage';

export default function App() {
  const [currentTab, setCurrentTab] = React.useState<NavigationTab>('generate');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // App State
  const [history, setHistory] = React.useState<GeneratedPromptRecord[]>([]);
  const [userApiKeys, setUserApiKeys] = React.useState<UserApiKey[]>([]);
  const [frameworkCache, setFrameworkCache] = React.useState<Record<string, FrameworkCache>>({});
  const [lastRefreshDate, setLastRefreshDate] = React.useState<string>(new Date().toISOString());
  const [activeRecord, setActiveRecord] = React.useState<GeneratedPromptRecord | null>(null);
  const [serverKeysCount, setServerKeysCount] = React.useState<number>(1);

  // Initialize storage state on mount & fetch server keys count
  React.useEffect(() => {
    setHistory(getStoredHistory());
    setUserApiKeys(getStoredApiKeys());
    setFrameworkCache(getStoredFrameworkCache());
    setLastRefreshDate(getLastFrameworkRefresh());

    fetch('/api/server-keys-count')
      .then(r => r.json())
      .then(data => {
        if (typeof data.count === 'number') {
          setServerKeysCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  const handleSavePromptRecord = (record: GeneratedPromptRecord) => {
    const updatedHistory = savePromptRecord(record);
    setHistory(updatedHistory);
    setActiveRecord(record);
  };

  const handleDeletePromptRecord = (id: string) => {
    const updated = deletePromptRecord(id);
    setHistory(updated);
    if (activeRecord?.id === id) {
      setActiveRecord(null);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat prompt?')) {
      clearPromptHistory();
      setHistory([]);
      setActiveRecord(null);
    }
  };

  const handleSaveApiKeys = (keys: UserApiKey[]) => {
    setUserApiKeys(keys);
    saveStoredApiKeys(keys);
  };

  const handleSaveFrameworkCache = (cache: Record<string, FrameworkCache>) => {
    setFrameworkCache(cache);
    saveFrameworkCache(cache);
    setLastRefreshDate(new Date().toISOString());
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#111827] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-[#FE4C6F]/20 selection:text-[#FE4C6F]">
      {/* Mobile Top Header Toggle Bar */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-white dark:bg-[#1F2937] border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <img
            src="https://i.ibb.co.com/wr0x733r/prajurit-digital.jpg"
            alt="Prajurit Digital"
            className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
          />
          <span className="font-extrabold text-base bg-gradient-to-r from-[#FE4C6F] to-pink-500 bg-clip-text text-transparent">
            APOS
          </span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          historyCount={history.length}
          userApiKeysCount={userApiKeys.length}
          serverKeysCount={serverKeysCount}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between min-h-0">
          <div className="flex-1">
            {currentTab === 'generate' && (
              <GeneratePromptView
                onSavePromptRecord={handleSavePromptRecord}
                activeRecord={activeRecord}
                onSelectTab={setCurrentTab}
                frameworkCache={frameworkCache}
                userApiKeys={userApiKeys}
              />
            )}

            {currentTab === 'cache' && (
              <FrameworkCacheView
                frameworkCache={frameworkCache}
                onSaveFrameworkCache={handleSaveFrameworkCache}
                lastRefreshDate={lastRefreshDate}
                userApiKeys={userApiKeys}
              />
            )}

            {currentTab === 'history' && (
              <HistoryView
                history={history}
                onSelectPromptRecord={setActiveRecord}
                onDeletePromptRecord={handleDeletePromptRecord}
                onClearHistory={handleClearHistory}
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'api' && (
              <ApiSettingsView
                userApiKeys={userApiKeys}
                onSaveApiKeys={handleSaveApiKeys}
              />
            )}
          </div>

          {/* Main Page Footer */}
          <footer className="mt-12 pt-6 border-t border-gray-200/80 dark:border-gray-800/80 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
            <p>© 2026 Karya Prajurit Digital. Hak Cipta Dilindungi.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
