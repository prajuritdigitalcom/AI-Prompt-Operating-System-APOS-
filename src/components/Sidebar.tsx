import React from 'react';
import {
  Sparkles,
  Cpu,
  History,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  historyCount: number;
  userApiKeysCount: number;
  serverKeysCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  historyCount,
  userApiKeysCount,
  serverKeysCount
}) => {
  const menuItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    { id: 'generate', label: 'Generate Prompt', icon: Sparkles },
    { id: 'cache', label: 'Framework Cache', icon: Cpu },
    { id: 'history', label: 'History', icon: History, badge: historyCount > 0 ? historyCount : undefined },
    { id: 'api', label: 'API Settings', icon: KeyRound }
  ];

  const handleItemClick = (id: NavigationTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full py-5 text-gray-700 dark:text-gray-300">
      <div className="space-y-4 px-3.5">
        {/* Sidebar Logo & Brand Header */}
        <div className="px-1 pb-4 mb-3 border-b border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleItemClick('generate')}
              className={`flex items-center gap-3 cursor-pointer group select-none ${
                isCollapsed ? 'md:justify-center md:w-full' : ''
              }`}
            >
              <img
                src="https://i.ibb.co.com/wr0x733r/prajurit-digital.jpg"
                alt="Prajurit Digital"
                className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform shrink-0 border border-gray-200 dark:border-gray-700"
              />

              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xl tracking-tight bg-gradient-to-r from-[#FE4C6F] via-[#FE4C6F] to-pink-500 bg-clip-text text-transparent">
                      APOS
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FE4C6F]/10 text-[#FE4C6F] font-extrabold border border-[#FE4C6F]/20">
                      v1.0
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                    AI Prompt OS
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all group ${
                  isActive
                    ? 'bg-[#FE4C6F] text-white shadow-md shadow-[#FE4C6F]/25 font-semibold'
                    : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                } ${isCollapsed ? 'md:justify-center md:px-2' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`} />

                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {(!isCollapsed || isMobileOpen) && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FE4C6F]/10 text-[#FE4C6F] border border-[#FE4C6F]/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status API Keys Gemini Info Box & Collapse Button */}
      <div className="px-3.5 pt-3 border-t border-gray-100 dark:border-gray-800/80 space-y-2.5">
        {(!isCollapsed || isMobileOpen) ? (
          <div className="p-3 rounded-xl bg-gray-50/90 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
              <KeyRound className="w-3.5 h-3.5 text-[#FE4C6F]" />
              <span>Status API Keys Gemini</span>
            </div>
            <div className="space-y-1 text-gray-600 dark:text-gray-300 font-medium">
              <div className="flex items-center justify-between">
                <span>Server</span>
                <span className="font-bold text-gray-900 dark:text-white bg-gray-200/60 dark:bg-gray-700/60 px-2 py-0.5 rounded-full text-[11px]">
                  ({serverKeysCount})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Lokal</span>
                <span className="font-bold text-gray-900 dark:text-white bg-gray-200/60 dark:bg-gray-700/60 px-2 py-0.5 rounded-full text-[11px]">
                  ({userApiKeysCount})
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="hidden md:flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 text-[10px] text-gray-600 dark:text-gray-300 font-bold"
            title={`Status API Keys Gemini:\nServer (${serverKeysCount})\nLokal (${userApiKeysCount})`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#FE4C6F]" />
            <span className="text-[9px]">S:{serverKeysCount}</span>
            <span className="text-[9px]">L:{userApiKeysCount}</span>
          </div>
        )}

        {/* Footer Collapse Button for Desktop */}
        <div className="hidden md:block">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xs font-semibold transition-all border border-gray-200/60 dark:border-gray-700/50"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1F2937] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 bg-white dark:bg-[#1F2937] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};
