import { GeneratedPromptRecord, UserApiKey, FrameworkCache, ThemeMode } from '../types';
import { DEFAULT_FRAMEWORKS } from '../data/defaultFrameworks';

const STORAGE_KEYS = {
  API_KEYS: 'apos_user_api_keys',
  HISTORY: 'apos_prompt_history',
  FRAMEWORK_CACHE: 'apos_framework_cache',
  SETTINGS: 'apos_user_settings',
  LAST_REFRESH: 'apos_last_framework_refresh'
};

export interface AppSettings {
  theme: ThemeMode;
  defaultTargetAi: string;
  autoApplyPatch: boolean;
  encryptLocalKeys: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultTargetAi: 'Gemini',
  autoApplyPatch: true,
  encryptLocalKeys: false
};

// --- API Keys Storage ---
export function getStoredApiKeys(): UserApiKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load API keys:', err);
    return [];
  }
}

export function saveStoredApiKeys(keys: UserApiKey[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  } catch (err) {
    console.error('Failed to save API keys:', err);
  }
}

// --- Prompt History Storage ---
export function getStoredHistory(): GeneratedPromptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load prompt history:', err);
    return [];
  }
}

export function savePromptRecord(record: GeneratedPromptRecord): GeneratedPromptRecord[] {
  const history = getStoredHistory();
  const existingIndex = history.findIndex(h => h.id === record.id);
  let updated: GeneratedPromptRecord[];
  if (existingIndex >= 0) {
    updated = [...history];
    updated[existingIndex] = record;
  } else {
    updated = [record, ...history];
  }
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save prompt record:', err);
  }
  return updated;
}

export function deletePromptRecord(id: string): GeneratedPromptRecord[] {
  const history = getStoredHistory();
  const updated = history.filter(h => h.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete prompt record:', err);
  }
  return updated;
}

export function clearPromptHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (err) {
    console.error('Failed to clear prompt history:', err);
  }
}

// --- Framework Cache Storage ---
export function getStoredFrameworkCache(): Record<string, FrameworkCache> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRAMEWORK_CACHE);
    if (!raw) return DEFAULT_FRAMEWORKS;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load framework cache:', err);
    return DEFAULT_FRAMEWORKS;
  }
}

export function saveFrameworkCache(cache: Record<string, FrameworkCache>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FRAMEWORK_CACHE, JSON.stringify(cache));
    localStorage.setItem(STORAGE_KEYS.LAST_REFRESH, new Date().toISOString());
  } catch (err) {
    console.error('Failed to save framework cache:', err);
  }
}

export function getLastFrameworkRefresh(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_REFRESH) || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// --- App Settings Storage ---
export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
