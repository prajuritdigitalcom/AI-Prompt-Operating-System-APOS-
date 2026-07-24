import React from 'react';
import {
  BookOpen,
  Sparkles,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Layers,
  HelpCircle
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#FE4C6F]" />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            APOS Documentation & Framework Guide
          </h1>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Panduan lengkap mengenai Multi-Framework Prompt Engine, struktur dokumen Markdown, dan teknik penulisan prompt tingkat lanjut.
        </p>
      </div>

      {/* Section 1: APOS Core Concept */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FE4C6F]" />
          <span>1. Konsep Utama AI Prompt Operating System</span>
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          APOS berbeda dari pembuat prompt berbasis template statis. APOS bertindak sebagai sistem operasi yang menganalisis kebutuhan Anda, memperluas konteks domain, memilih spesifikasi terbaik, dan mengeksekusi sintesis dari 4 framework prompt engineering terkemuka di industri.
        </p>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 font-mono text-xs text-[#FE4C6F]">
          User Input (Kebutuhan + Goal) ➔ Requirement Analyzer ➔ Multi Framework Engine ➔ Prompt Merge ➔ Multi Audit ➔ Patch Engine ➔ Re-Audit ➔ Markdown Output
        </div>
      </div>

      {/* Section 2: 4 Frameworks Detail */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-500" />
          <span>2. Penjelasan 4 Official Industry Frameworks</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-2">
            <h3 className="font-bold text-[#FE4C6F] text-sm">Google Prompting Strategies</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Berfokus pada penyampaian Objective yang jelas, pemberian Context domain yang kaya, penentuan instruksi operasional yang eksplisit, serta penentuan Output Format yang tidak bertele-tele.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-2">
            <h3 className="font-bold text-[#FE4C6F] text-sm">Anthropic Prompt Engineering</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Menekankan penugasan Role pakar yang spesifik, penggunaan tag penanda XML (seperti &lt;instructions&gt;, &lt;context&gt;), serta pemberian instruksi penalaran scratchpad di dalam tag &lt;thinking&gt;.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-2">
            <h3 className="font-bold text-[#FE4C6F] text-sm">OpenAI Prompt Engineering</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Fokus pada pembatasan eksplisit (Negative Constraints), penentuan workflow langkah demi langkah yang teratur, dan pemisah delimiter yang tegas antara data dan instruksi.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-2">
            <h3 className="font-bold text-[#FE4C6F] text-sm">DSPy Programming Framework</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Mengadopsi pola pikir kompilator modular. Membagi prompt menjadi signature input-output, menetapkan evaluasi keberhasilan, dan menambahkan assertions/guardrails kualitas.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Markdown Output Architecture */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-emerald-500" />
          <span>3. Standard Output Structure (Markdown Spec)</span>
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Setiap prompt yang dihasilkan oleh APOS mengandalkan struktur standar 8 bagian yang konsisten:
        </p>

        <div className="p-4 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed overflow-x-auto space-y-2">
          <div># ROLE ➔ Menetapkan persona spesifik dan sub-keahlian pakar.</div>
          <div># OBJECTIVE ➔ Menyatakan tujuan utama tanpa makna ganda.</div>
          <div># CONTEXT ➔ Menyediakan latar belakang, asumsi domain, dan audiens target.</div>
          <div># REQUIREMENTS ➔ Instruksi rinci dan pipeline langkah demi langkah.</div>
          <div># CONSTRAINTS ➔ Batasan negatif, gaya bahasa, dan hal yang dilarang.</div>
          <div>&lt;thinking&gt; ➔ Instruksi ruang scratchpad penalaran internal sebelum menjawab.</div>
          <div># OUTPUT FORMAT ➔ Struktur Markdown, tabel, atau skema JSON yang diinginkan.</div>
          <div># SUCCESS CRITERIA ➔ Kriteria penilaian kualitas dan evaluasi akhir.</div>
          <div># NOTES & EDGE CASES ➔ Aturan penanganan jika data kurang atau kasus ekstrem.</div>
        </div>
      </div>
    </div>
  );
};
