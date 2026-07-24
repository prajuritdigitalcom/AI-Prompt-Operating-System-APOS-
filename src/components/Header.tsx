import React from 'react';
import {
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  Key,
  ShieldCheck,
  Menu,
  ChevronRight
} from 'lucide-react';
import { NavigationTab, ThemeMode } from '../types';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  lastRefreshDate: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeKeyCount: number;
  onToggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  lastRefreshDate,
  theme,
  onToggleTheme,
  activeKeyCount,
  onToggleSidebarMobile
}) => {
  const formattedRefresh = React.useMemo(() => {
    try {
      const date = new Date(lastRefreshDate);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Just now';
    }
  }, [lastRefreshDate]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[#1F2937]/90 dark:bg-[#111827]/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 md:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* APOS Logo & Branding */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#FE4C6F] text-white shadow-md shadow-[#FE4C6F]/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#FE4C6F] via-[#FE4C6F] to-pink-500 bg-clip-text text-transparent">
                APOS
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#FE4C6F]/10 text-[#FE4C6F] font-semibold border border-[#FE4C6F]/20">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
              AI Prompt Operating System
            </p>
          </div>
        </div>

        {/* Breadcrumb indicator */}
        <div className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 capitalize">
          <span>Workspace</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-medium text-gray-800 dark:text-gray-200">{currentTab}</span>
        </div>
      </div>

      {/* Right Actions Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Framework Cache Status Pill */}
        <div
          onClick={() => onSelectTab('cache')}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-colors"
          title="Framework Cache Status"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">Cache Active</span>
          <span className="text-[10px] text-gray-400 border-l border-emerald-500/20 pl-2">
            Refreshed {formattedRefresh}
          </span>
        </div>

        {/* API Key Status Pill */}
        <div
          onClick={() => onSelectTab('api')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs cursor-pointer transition-colors ${
            activeKeyCount > 0
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}
          title="API Key Configuration"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="font-medium hidden xs:inline">
            {activeKeyCount > 0 ? `${activeKeyCount} Keys Active` : 'Public API Mode'}
          </span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Toggle Color Theme"
          aria-label="Toggle Color Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary CTA */}
        <button
          onClick={() => onSelectTab('generate')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FE4C6F] hover:bg-[#E63E61] text-white font-medium text-xs sm:text-sm shadow-md shadow-[#FE4C6F]/25 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Prompt</span>
        </button>
      </div>
    </header>
  );
};
