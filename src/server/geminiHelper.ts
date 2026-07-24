import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';

interface CallGeminiOptions {
  params: GenerateContentParameters;
  userApiKey?: string;
  rollingKeys?: string[];
}

export interface GeminiCallResult {
  response: GenerateContentResponse;
  usedKeyLabel: string;
  keyStatusLog: { keySnippet: string; status: 'success' | '429_rate_limit' | 'error' | 'skipped' }[];
}

/**
 * Execute a Gemini API call with automatic rolling key failover logic.
 * Tries custom API keys provided by the user, then falls back to process.env.GEMINI_API_KEY.
 */
export async function callGeminiWithRollingKeys(options: CallGeminiOptions): Promise<GeminiCallResult> {
  const { params, userApiKey, rollingKeys = [] } = options;

  // Build key candidates list
  const candidates: { key: string; label: string }[] = [];

  if (userApiKey && userApiKey.trim()) {
    candidates.push({ key: userApiKey.trim(), label: 'Primary Custom Key' });
  }

  for (let i = 0; i < rollingKeys.length; i++) {
    const k = rollingKeys[i].trim();
    if (k && !candidates.some(c => c.key === k)) {
      candidates.push({ key: k, label: `Rolling Key #${i + 1}` });
    }
  }

  // Environment Keys Support (Single, Comma-separated, or GEMINI_API_KEYS / GEMINI_API_KEY_1, GEMINI_API_KEY_2)
  const envKeysRaw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  const parsedEnvKeys = envKeysRaw
    .split(/[\n,;]+/)
    .map(k => k.trim())
    .filter(Boolean);

  // Also check GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
  let keyIndex = 1;
  while (process.env[`GEMINI_API_KEY_${keyIndex}`]) {
    const idxKey = process.env[`GEMINI_API_KEY_${keyIndex}`]?.trim();
    if (idxKey && !parsedEnvKeys.includes(idxKey)) {
      parsedEnvKeys.push(idxKey);
    }
    keyIndex++;
  }

  parsedEnvKeys.forEach((k, idx) => {
    if (k && !candidates.some(c => c.key === k)) {
      candidates.push({ key: k, label: `Environment Key #${idx + 1}` });
    }
  });

  if (candidates.length === 0) {
    throw new Error('No Gemini API keys available. Please configure an API key in Settings or Environment Variables.');
  }

  const keyStatusLog: { keySnippet: string; status: 'success' | '429_rate_limit' | 'error' | 'skipped' }[] = [];

  for (const candidate of candidates) {
    const keySnippet = candidate.key.length > 8
      ? `${candidate.key.slice(0, 4)}...${candidate.key.slice(-4)}`
      : '***';

    try {
      const ai = new GoogleGenAI({
        apiKey: candidate.key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await ai.models.generateContent(params);
      keyStatusLog.push({ keySnippet, status: 'success' });

      return {
        response,
        usedKeyLabel: candidate.label,
        keyStatusLog
      };
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      const isRateLimit = errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('resource_exhausted');

      keyStatusLog.push({
        keySnippet,
        status: isRateLimit ? '429_rate_limit' : 'error'
      });

      console.warn(`[APOS Rolling API] Key ${keySnippet} (${candidate.label}) failed: ${errorMsg}`);
      // Continue to next rolling key...
    }
  }

  throw new Error(
    `All available API keys failed or exceeded rate limits (429). Key attempts: ${keyStatusLog.map(l => `${l.keySnippet}: ${l.status}`).join(', ')}`
  );
}
