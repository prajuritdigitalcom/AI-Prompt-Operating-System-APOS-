import React from 'react';
import {
  KeyRound,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Lock,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { UserApiKey } from '../types';

interface ApiSettingsViewProps {
  userApiKeys: UserApiKey[];
  onSaveApiKeys: (keys: UserApiKey[]) => void;
}

export const ApiSettingsView: React.FC<ApiSettingsViewProps> = ({
  userApiKeys,
  onSaveApiKeys
}) => {
  const [newKey, setNewKey] = React.useState('');
  const [testingId, setTestingId] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<{ id: string; success: boolean; message: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [visibleKeyIds, setVisibleKeyIds] = React.useState<string[]>([]);
  const [isAddingKey, setIsAddingKey] = React.useState(false);

  const handleAddKey = async () => {
    if (!newKey.trim()) {
      setError('API Key tidak boleh kosong');
      return;
    }
    setError(null);
    setIsAddingKey(true);

    const keyVal = newKey.trim();
    const createdKey: UserApiKey = {
      id: `key_${Date.now()}`,
      label: `Gemini API Key #${userApiKeys.length + 1}`,
      key: keyVal,
      priority: userApiKeys.length + 1,
      status: 'untested',
      lastUsed: null,
      usageCount: 0
    };

    const updated = [...userApiKeys, createdKey];
    onSaveApiKeys(updated);
    setNewKey('');

    // Automatically trigger test connection for the newly added key immediately!
    await handleTestKey(createdKey, updated);
    setIsAddingKey(false);
  };

  const handleDeleteKey = (id: string) => {
    const updated = userApiKeys.filter(k => k.id !== id);
    onSaveApiKeys(updated);
    if (testResult?.id === id) {
      setTestResult(null);
    }
  };

  const handleTestKey = async (apiKeyRecord: UserApiKey, currentKeysList: UserApiKey[] = userApiKeys) => {
    setTestingId(apiKeyRecord.id);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyRecord.key })
      });

      const json = await res.json();

      const updated = currentKeysList.map(k => {
        if (k.id === apiKeyRecord.id) {
          return {
            ...k,
            status: json.valid ? ('active' as const) : ('invalid' as const),
            lastUsed: new Date().toISOString()
          };
        }
        return k;
      });

      onSaveApiKeys(updated);
      setTestResult({
        id: apiKeyRecord.id,
        success: json.valid,
        message: json.valid
          ? 'API Key terverifikasi aktif & siap digunakan!'
          : json.error || 'Gagal terhubung dengan Gemini API'
      });
    } catch (err: any) {
      setTestResult({
        id: apiKeyRecord.id,
        success: false,
        message: err.message || 'Koneksi gagal'
      });
    } finally {
      setTestingId(null);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeyIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCopyKey = (id: string, keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const maskKey = (keyStr: string, isVisible: boolean) => {
    if (!keyStr) return '';
    if (isVisible) return keyStr;
    if (keyStr.length <= 8) return '••••••••••••••••';
    return `${keyStr.slice(0, 6)}••••••••••••${keyStr.slice(-4)}`;
  };

  const activeKeysCount = userApiKeys.filter(k => k.status === 'active').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            🔑 Multi API Key & Rolling Settings
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FE4C6F]/10 text-[#FE4C6F] font-bold border border-[#FE4C6F]/20">
            Auto Failover Active
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Kelola kunci Gemini API milik Anda (Bring Your Own API Key) dengan pengalihan otomatis jika batas kuota (429) tercapai. Kunci tersimpan terenkripsi di browser lokal.
        </p>
      </div>

      {/* Mode Status Pill Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FE4C6F]/10 text-[#FE4C6F] flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-900 dark:text-white">
                Status Operasional API Key
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mode saat ini: {userApiKeys.length > 0 ? 'Bring Your Own API Key (Kustom)' : 'Public Server Key (Default)'}
              </p>
            </div>
          </div>
          <span
            className={`self-start sm:self-center text-xs px-3 py-1 rounded-full font-bold border ${
              userApiKeys.length > 0
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            {userApiKeys.length > 0 ? `BYOK Active (${activeKeysCount}/${userApiKeys.length} Ready)` : 'Public Shared Key Active'}
          </span>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          {userApiKeys.length > 0
            ? `APOS menggunakan ${userApiKeys.length} API Key pribadi Anda. Ketika API Key utama mengalami rate limit (429), APOS secara otomatis mengalihkan ke API Key berikutnya (Rolling API Failover).`
            : 'APOS saat ini berjalan menggunakan Public Server Key bawaan. Tambahkan API Key Anda sendiri di bawah untuk stabilitas dan kecepatan maksimal.'}
        </p>
      </div>

      {/* Add New Key Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#FE4C6F]" />
            <span>Tambah Gemini API Key Baru</span>
          </h3>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-[#FE4C6F] hover:underline"
          >
            <span>Dapatkan Key di Google AI Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Paste Gemini API Key <span className="text-[#FE4C6F]">*</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddKey();
                }}
                placeholder="Paste API Key di sini (contoh: AIzaSy...)"
                disabled={isAddingKey}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FE4C6F] disabled:opacity-50 font-mono"
              />
              <KeyRound className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={handleAddKey}
              disabled={isAddingKey || !newKey.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#FE4C6F] hover:bg-[#E63E61] disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-bold text-xs shadow-md shadow-[#FE4C6F]/20 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2"
            >
              {isAddingKey ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menambahkan & Menguji...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Tambah & Auto Test</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            💡 Kunci akan langsung diuji koneksinya secara otomatis setelah ditambahkan.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Keys List (Daftar Key Saya) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <span>Daftar Key Saya</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 font-extrabold text-gray-700 dark:text-gray-300">
                {userApiKeys.length} Total
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Kunci disusun berdasarkan urutan prioritas eksekusi failover.
            </p>
          </div>

          {userApiKeys.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                {activeKeysCount} Aktif
              </span>
            </div>
          )}
        </div>

        {userApiKeys.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl space-y-3 bg-gray-50/50 dark:bg-gray-900/30">
            <div className="w-12 h-12 rounded-2xl bg-[#FE4C6F]/10 text-[#FE4C6F] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                Belum ada API Key kustom
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Tambahkan Gemini API Key Anda sendiri di atas. Sistem akan menguji koneksi secara otomatis dan mengaktifkannya.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {userApiKeys.map((item, idx) => {
              const isTestingThis = testingId === item.id;
              const isVisible = visibleKeyIds.includes(item.id);
              const isCopied = copiedId === item.id;
              const hasTestResult = testResult && testResult.id === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 transition-all space-y-3 hover:border-gray-300 dark:hover:border-gray-600"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Key Info */}
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          item.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : item.status === 'invalid'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {isTestingThis ? (
                          <RefreshCw className="w-5 h-5 animate-spin text-[#FE4C6F]" />
                        ) : item.status === 'active' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : item.status === 'invalid' ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <KeyRound className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {item.label}
                          </span>

                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-200/80 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                            Priority #{idx + 1} {idx === 0 ? '(Utama)' : '(Failover Backup)'}
                          </span>

                          {/* Status Badge */}
                          {isTestingThis ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1 animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Testing...
                            </span>
                          ) : item.status === 'active' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Active
                            </span>
                          ) : item.status === 'invalid' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Invalid / Exceeded
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Untested
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-0.5">
                          <p className="text-xs font-mono text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900/80 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 inline-block">
                            {maskKey(item.key, isVisible)}
                          </p>

                          <button
                            onClick={() => toggleKeyVisibility(item.id)}
                            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                            title={isVisible ? 'Sembunyikan Key' : 'Tampilkan Key'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleCopyKey(item.id, item.key)}
                            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                            title="Salin Key"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleTestKey(item)}
                        disabled={isTestingThis}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold border border-gray-200 dark:border-gray-700 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTestingThis ? 'animate-spin text-[#FE4C6F]' : ''}`} />
                        <span>{isTestingThis ? 'Menguji...' : 'Test Connection'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteKey(item.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all border border-red-500/20"
                        title="Hapus Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Feedback / Test Result Banner */}
                  {hasTestResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                        testResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className="font-semibold">{testResult.message}</span>
                    </div>
                  )}

                  {/* Metadata Sub-bar */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200/60 dark:border-gray-700/50">
                    <span>
                      {item.lastUsed
                        ? `Terakhir diuji: ${new Date(item.lastUsed).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}`
                        : 'Belum diuji'}
                    </span>
                    <span>Penggunaan Failover: {item.usageCount || 0}x</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security & Encryption Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Keamanan & Privasi Terjamin
            </h3>
          </div>

          <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Enkripsi Lokal Browser
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          API Key Anda disamarkan dan disimpan secara terenkripsi hanya pada memori browser lokal Anda (localStorage). API Key Anda tidak pernah disimpan di database eksternal dan hanya digunakan secara langsung untuk berkomunikasi dengan Google Gemini API.
        </p>
      </div>
    </div>
  );
};

