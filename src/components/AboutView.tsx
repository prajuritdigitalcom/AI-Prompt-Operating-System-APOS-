import React from 'react';
import {
  Info,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Heart
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <div className="pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Info className="w-6 h-6 text-[#FE4C6F]" />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            ℹ About AI Prompt Operating System (APOS)
          </h1>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Version 1.0.0 — Multi-Framework Prompt Compilation Engine
        </p>
      </div>

      {/* Hero Vision */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#1F2937] via-[#2A3649] to-[#111827] text-white border border-gray-800 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FE4C6F] text-white font-black text-xl flex items-center justify-center shadow-md">
            A
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              AI Prompt Operating System (APOS)
            </h2>
            <p className="text-xs text-[#FE4C6F] font-semibold">
              Transform Ideas Into AI-Ready Markdown.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          AI Prompt Operating System bukan sekadar Prompt Generator. Produk ini menjadi sistem operasi untuk menyusun spesifikasi AI yang profesional dengan menggabungkan empat framework resmi (Google, Anthropic, OpenAI, DSPy), melakukan audit kualitas secara otomatis, memperbaiki kekurangan melalui Patch Engine, dan menghasilkan dokumen Markdown yang konsisten, mudah dipahami, serta siap digunakan oleh berbagai model AI tanpa bergantung pada vendor tertentu.
        </p>
      </div>

      {/* Citations */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
          Referensi Framework Resmi
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <a
            href="https://ai.google.dev/gemini-api/docs/prompting-strategies"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-[#FE4C6F]/50 flex items-center justify-between text-gray-700 dark:text-gray-300 transition-colors"
          >
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">Google Prompting Strategies</span>
              <span className="text-[10px] text-gray-400">ai.google.dev</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#FE4C6F]" />
          </a>

          <a
            href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-[#FE4C6F]/50 flex items-center justify-between text-gray-700 dark:text-gray-300 transition-colors"
          >
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">Anthropic Prompt Engineering</span>
              <span className="text-[10px] text-gray-400">docs.anthropic.com</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#FE4C6F]" />
          </a>

          <a
            href="https://developers.openai.com/api/docs/guides/prompt-engineering"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-[#FE4C6F]/50 flex items-center justify-between text-gray-700 dark:text-gray-300 transition-colors"
          >
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">OpenAI Prompt Engineering</span>
              <span className="text-[10px] text-gray-400">developers.openai.com</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#FE4C6F]" />
          </a>

          <a
            href="https://github.com/stanfordnlp/dspy"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-[#FE4C6F]/50 flex items-center justify-between text-gray-700 dark:text-gray-300 transition-colors"
          >
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">DSPy Stanford NLP Framework</span>
              <span className="text-[10px] text-gray-400">github.com/stanfordnlp/dspy</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#FE4C6F]" />
          </a>
        </div>
      </div>
    </div>
  );
};
