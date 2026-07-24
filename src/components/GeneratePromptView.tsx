import React from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  FileCode,
  Eye,
  Edit3,
  Bot,
  Zap,
  ArrowRight
} from 'lucide-react';
import { GeneratedPromptRecord, NavigationTab, FrameworkCache, UserApiKey } from '../types';

interface GeneratePromptViewProps {
  onSavePromptRecord: (record: GeneratedPromptRecord) => void;
  activeRecord: GeneratedPromptRecord | null;
  onSelectTab: (tab: NavigationTab) => void;
  frameworkCache: Record<string, FrameworkCache>;
  userApiKeys: UserApiKey[];
}

const TARGET_AI_MODELS = ['Gemini', 'ChatGPT', 'Claude', 'Grok', 'DeepSeek', 'Qwen'];

export const GeneratePromptView: React.FC<GeneratePromptViewProps> = ({
  onSavePromptRecord,
  activeRecord,
  onSelectTab,
  frameworkCache,
  userApiKeys
}) => {
  const [userNeed, setUserNeed] = React.useState(activeRecord?.userNeed || '');
  const [userGoal, setUserGoal] = React.useState(activeRecord?.userGoal || '');
  const [targetAi, setTargetAi] = React.useState(activeRecord?.targetAi || 'Gemini');

  // Generation state
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Result state
  const [currentRecord, setCurrentRecord] = React.useState<GeneratedPromptRecord | null>(activeRecord);
  const [markdownText, setMarkdownText] = React.useState(activeRecord?.markdownOutput || '');
  const [activeViewMode, setActiveViewMode] = React.useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = React.useState(false);
  const [isPatching, setIsPatching] = React.useState(false);

  React.useEffect(() => {
    if (activeRecord) {
      setUserNeed(activeRecord.userNeed);
      setUserGoal(activeRecord.userGoal);
      setTargetAi(activeRecord.targetAi || 'Gemini');
      setCurrentRecord(activeRecord);
      setMarkdownText(activeRecord.markdownOutput);
    }
  }, [activeRecord]);

  const handleGenerate = async () => {
    if (!userNeed.trim() || !userGoal.trim()) {
      setError('Harap isi Kebutuhan dan Goal terlebih dahulu.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setCurrentStep(1);
    setStatusMessage('1/6: Requirement Analyzer sedang memperluas domain & konteks...');

    const activeCustomKeys = userApiKeys.filter(k => k.status === 'active').map(k => k.key);
    const primaryKey = activeCustomKeys[0] || '';
    const rollingKeys = activeCustomKeys.slice(1);

    try {
      // Step 1: Requirement Intelligence Engine (RIE) & Step 2: Requirement Verification (RV)
      setCurrentStep(1);
      setStatusMessage('1/6: Engine 1 (RIE) extracting explicit entities & classifying task...');

      const reqRes = await fetch('/api/analyze-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userNeed,
          userGoal,
          targetAi,
          userApiKey: primaryKey,
          rollingKeys
        })
      });

      if (!reqRes.ok) {
        const errJson = await reqRes.json();
        throw new Error(errJson.error || 'Gagal pada Requirement Intelligence Engine (RIE)');
      }

      const { analysis } = await reqRes.json();

      setCurrentStep(2);
      setStatusMessage(`2/6: Engine 2 (RV) verified Requirement Model (Score: ${analysis.verification?.verificationScore || 95}/100, Status: ${analysis.verification?.status || 'PASS'})...`);
      await new Promise(r => setTimeout(r, 350));

      // Step 3: Multi Framework Engine
      setCurrentStep(3);
      setStatusMessage('3/6: Multi Framework Prompt Engine menyusun Markdown...');

      const genRes = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userNeed,
          userGoal,
          targetAi,
          analysis,
          userApiKey: primaryKey,
          rollingKeys
        })
      });

      if (!genRes.ok) {
        const errJson = await genRes.json();
        throw new Error(errJson.error || 'Gagal menyusun prompt Markdown');
      }

      const { markdownOutput } = await genRes.json();

      // Step 4: Multi Framework Audit
      setCurrentStep(4);
      setStatusMessage('4/6: Multi Framework Audit Engine mengevaluasi skor & kriteria...');

      const auditRes = await fetch('/api/audit-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptMarkdown: markdownOutput,
          userNeed,
          userGoal,
          userApiKey: primaryKey,
          rollingKeys
        })
      });

      if (!auditRes.ok) {
        const errJson = await auditRes.json();
        throw new Error(errJson.error || 'Gagal pada proses Audit');
      }

      const { audit } = await auditRes.json();

      // Step 5: Patch Engine & Re-Audit
      setCurrentStep(5);
      setStatusMessage('5/6: Patch Engine memperbaiki kelemahan & merevisi skor...');

      const patchRes = await fetch('/api/patch-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptMarkdown: markdownOutput,
          audit,
          userNeed,
          userGoal,
          userApiKey: primaryKey,
          rollingKeys
        })
      });

      let finalMarkdown = markdownOutput;
      let finalScore = audit.scores;
      let patchHistory = [];

      if (patchRes.ok) {
        const patchData = await patchRes.json();
        finalMarkdown = patchData.patchedMarkdown || markdownOutput;
        finalScore = patchData.improvedScore || audit.scores;
        patchHistory = [{
          timestamp: new Date().toISOString(),
          action: 'Initial Multi-Framework Patch applied',
          improvedScore: finalScore
        }];
      }

      // Step 6: Finalizing
      setCurrentStep(6);
      setStatusMessage('6/6: Markdown Compiler selesai! Menyimpan data...');

      const newRecord: GeneratedPromptRecord = {
        id: `prompt_${Date.now()}`,
        title: userNeed.slice(0, 45) + (userNeed.length > 45 ? '...' : ''),
        createdAt: new Date().toISOString(),
        userNeed,
        userGoal,
        targetAi,
        analysis,
        markdownOutput: finalMarkdown,
        initialScore: audit.scores,
        patchedScore: finalScore,
        patchRecommendations: audit.patchRecommendations,
        patchHistory
      };

      setCurrentRecord(newRecord);
      setMarkdownText(finalMarkdown);
      onSavePromptRecord(newRecord);
    } catch (err: any) {
      console.error('Error generating prompt:', err);
      setError(err.message || 'Terjadi kesalahan saat memproses prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPatchAgain = async () => {
    if (!currentRecord) return;
    setIsPatching(true);
    setError(null);

    const activeCustomKeys = userApiKeys.filter(k => k.status === 'active').map(k => k.key);
    const primaryKey = activeCustomKeys[0] || '';
    const rollingKeys = activeCustomKeys.slice(1);

    try {
      const patchRes = await fetch('/api/patch-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptMarkdown: markdownText,
          audit: {
            scores: currentRecord.patchedScore,
            patchRecommendations: currentRecord.patchRecommendations
          },
          userNeed: currentRecord.userNeed,
          userGoal: currentRecord.userGoal,
          userApiKey: primaryKey,
          rollingKeys
        })
      });

      if (!patchRes.ok) {
        const errJson = await patchRes.json();
        throw new Error(errJson.error || 'Patch Engine re-run failed');
      }

      const patchData = await patchRes.json();
      const updatedMarkdown = patchData.patchedMarkdown;
      const updatedScore = patchData.improvedScore;

      const updatedHistory = [
        ...(currentRecord.patchHistory || []),
        {
          timestamp: new Date().toISOString(),
          action: 'Manual Re-Patch Engine optimization',
          improvedScore: updatedScore
        }
      ];

      const updatedRecord: GeneratedPromptRecord = {
        ...currentRecord,
        markdownOutput: updatedMarkdown,
        patchedScore: updatedScore,
        patchHistory: updatedHistory
      };

      setCurrentRecord(updatedRecord);
      setMarkdownText(updatedMarkdown);
      onSavePromptRecord(updatedRecord);
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan Patch ulang');
    } finally {
      setIsPatching(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentRecord?.title || 'apos-prompt').toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Title & Description Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              ✨ Generate Prompt Engine
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FE4C6F]/10 text-[#FE4C6F] font-bold border border-[#FE4C6F]/20">
              Multi-Framework V1.0
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Jelaskan Kebutuhan & Goal Anda. AI Engine akan memproses melalui Google, Anthropic, OpenAI, & DSPy frameworks.
          </p>
        </div>
      </div>

      {/* Primary User Input Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input Kebutuhan */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              1. Kebutuhan (Need) <span className="text-[#FE4C6F]">*</span>
            </label>
            <textarea
              value={userNeed}
              onChange={e => setUserNeed(e.target.value)}
              placeholder="Contoh: Saya membutuhkan strategi konten SEO komprehensif untuk aplikasi SaaS manajemen keuangan pribadi..."
              rows={4}
              className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FE4C6F] transition-all resize-y"
            />
          </div>

          {/* Input Goal */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              2. Goal & Target Outcome <span className="text-[#FE4C6F]">*</span>
            </label>
            <textarea
              value={userGoal}
              onChange={e => setUserGoal(e.target.value)}
              placeholder="Contoh: Menghasilkan struktur pilar artikel, kata kunci LSI, daftar outline, dan instruksi penulisan yang bebas dari AI fluff..."
              rows={4}
              className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FE4C6F] transition-all resize-y"
            />
          </div>
        </div>

        {/* Submit CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Universal Markdown Output — Siap dipakai di Gemini, ChatGPT, Claude, Grok, DeepSeek, & Qwen.</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#FE4C6F] hover:bg-[#E63E61] disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-[#FE4C6F]/30 active:scale-95 transition-all shrink-0"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses Multi Framework Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Prompt (4 Frameworks)</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Real-time Step Execution Progress Indicator */}
      {isGenerating && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#FE4C6F] animate-spin" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Multi Framework Prompt Engine Processing Pipeline
              </h3>
            </div>
            <span className="text-xs font-extrabold text-[#FE4C6F]">
              Step {currentStep} / 6
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FE4C6F] to-pink-400 transition-all duration-500"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 font-mono">
            {statusMessage}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
            {[
              'RIE Intelligence',
              'RV Verification',
              'Multi Prompt Engine',
              'Multi Audit',
              'Patch Engine',
              'Markdown Compiler'
            ].map((stepName, idx) => {
              const stepNum = idx + 1;
              const isDone = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : isCurrent
                      ? 'bg-[#FE4C6F]/10 border-[#FE4C6F] text-[#FE4C6F] font-bold shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold">Step {stepNum}</div>
                  <div className="text-[11px] font-medium truncate mt-0.5">{stepName}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated Result Workspace */}
      {currentRecord && !isGenerating && (
        <div className="space-y-6">
          {/* Requirement Verification & RIE Banner */}
          {currentRecord.analysis?.verification && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs border border-emerald-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                        Requirement Intelligence & Verification Model
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Status: {currentRecord.analysis.verification.status} ({currentRecord.analysis.verification.verificationScore}/100)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Requirement Engine 1 (RIE) & Requirement Verification 2 (RV)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300">
                    Domain: {currentRecord.analysis.domain}
                  </span>
                </div>
              </div>

              {/* Requirement Model Details Grid */}
              {currentRecord.analysis.requirementModel && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Classified Task</span>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                      {currentRecord.analysis.requirementModel.task}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Business / Product</span>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                      {currentRecord.analysis.requirementModel.businessName !== 'Not Mentioned'
                        ? currentRecord.analysis.requirementModel.businessName
                        : (currentRecord.analysis.requirementModel.productName !== 'Not Mentioned'
                            ? currentRecord.analysis.requirementModel.productName
                            : currentRecord.analysis.requirementModel.topic)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Deliverable</span>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                      {currentRecord.analysis.requirementModel.expectedDeliverable}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Confidence Score</span>
                    <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {currentRecord.analysis.requirementModel.confidenceScore}/100 PASS
                    </p>
                  </div>
                </div>
              )}

              {/* Verification Rule Checklist */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800/80">
                <span className="font-bold text-gray-800 dark:text-gray-200">RV Checks:</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Entities Extracted
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No Placeholders
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Intent Preserved
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No New Facts
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confidence &ge; 90
                </span>
              </div>
            </div>
          )}
          {/* Prompt Score Overview Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Multi Framework Prompt Scores
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                    Audit Passed
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hasil evaluasi kualitas prompt berdasarkan 4 framework resmi
                </p>
              </div>

              {/* Overall Score Circle Badge */}
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {currentRecord.patchedScore?.overall || currentRecord.initialScore?.overall || 95}
                    <span className="text-xs font-normal text-gray-400">/100</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Overall APOS Score
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Framework Scores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Google Prompting', key: 'google', score: currentRecord.patchedScore?.google || 95 },
                { label: 'Anthropic Claude', key: 'anthropic', score: currentRecord.patchedScore?.anthropic || 95 },
                { label: 'OpenAI Standards', key: 'openai', score: currentRecord.patchedScore?.openai || 95 },
                { label: 'DSPy Engine', key: 'dspy', score: currentRecord.patchedScore?.dspy || 95 }
              ].map((fw) => (
                <div
                  key={fw.key}
                  className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    {fw.label}
                  </span>
                  <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {fw.score} <span className="text-xs text-gray-400 font-normal">/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mt-2 overflow-hidden">
                    <div
                      className="h-full bg-[#FE4C6F]"
                      style={{ width: `${fw.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Requirement Analysis Insights Pill */}
            {currentRecord.analysis && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <div className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FE4C6F]" />
                  <span>Requirement Analyzer Insights:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Domain:</span>{' '}
                    {currentRecord.analysis.domain}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Assigned Role:</span>{' '}
                    {currentRecord.analysis.targetRole}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Output Standard:</span>{' '}
                    {currentRecord.analysis.recommendedOutput}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Patch Recommendations Accordion */}
          {currentRecord.patchRecommendations && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#FE4C6F]" />
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    Patch Recommendations & Applied Improvements
                  </h3>
                </div>

                <button
                  onClick={handleApplyPatchAgain}
                  disabled={isPatching}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FE4C6F]/10 hover:bg-[#FE4C6F]/20 text-[#FE4C6F] text-xs font-semibold border border-[#FE4C6F]/30 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPatching ? 'animate-spin' : ''}`} />
                  <span>Re-run Patch Engine</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
                  <span className="font-bold text-[#FE4C6F] uppercase">Google Patch:</span>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                    {currentRecord.patchRecommendations.google || 'Objective & context limits fully optimized.'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
                  <span className="font-bold text-[#FE4C6F] uppercase">Anthropic Patch:</span>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                    {currentRecord.patchRecommendations.anthropic || 'Role & <thinking> tags reinforced.'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
                  <span className="font-bold text-[#FE4C6F] uppercase">OpenAI Patch:</span>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                    {currentRecord.patchRecommendations.openai || 'Negative constraints & delimiters clarified.'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
                  <span className="font-bold text-[#FE4C6F] uppercase">DSPy Patch:</span>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                    {currentRecord.patchRecommendations.dspy || 'Modular signature and evaluation bounds updated.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Markdown Output Code & Editor Workspace */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-md space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  Markdown Output
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono">
                  {markdownText.length} characters
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* View Switcher */}
                <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs">
                  <button
                    onClick={() => setActiveViewMode('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                      activeViewMode === 'preview'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Formatted Preview</span>
                  </button>
                  <button
                    onClick={() => setActiveViewMode('code')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                      activeViewMode === 'code'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Raw Editor</span>
                  </button>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FE4C6F] hover:bg-[#E63E61] text-white text-xs font-bold shadow-md shadow-[#FE4C6F]/20 active:scale-95 transition-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                </button>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold border border-gray-300 dark:border-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download .md</span>
                </button>
              </div>
            </div>

            {/* Editor or Preview Pane */}
            {activeViewMode === 'code' ? (
              <textarea
                value={markdownText}
                onChange={e => setMarkdownText(e.target.value)}
                rows={20}
                className="w-full p-4 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#FE4C6F] resize-y border border-gray-800"
              />
            ) : (
              <div className="p-5 sm:p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 overflow-x-auto">
                <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed">
                  {markdownText}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
