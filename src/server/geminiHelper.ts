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

export function getEnvironmentGeminiKeys(): { key: string; label: string }[] {
  const envKeysMap = new Map<string, string>();

  // Scan all process.env variables dynamically for any Gemini API key name patterns
  Object.keys(process.env).forEach(envName => {
    const upper = envName.toUpperCase();
    if (
      upper.includes('GEMINI_API_KEY') ||
      upper.includes('GEMINI_KEY') ||
      upper.includes('GEMINI_API')
    ) {
      const val = process.env[envName]?.trim();
      if (val && !val.includes('MY_GEMINI_API_KEY') && !val.includes('YOUR_GEMINI')) {
        // Handle single or comma/newline/semicolon separated keys in one variable
        val
          .split(/[\n,;]+/)
          .map(k => k.trim())
          .filter(Boolean)
          .forEach(k => {
            if (!envKeysMap.has(k)) {
              envKeysMap.set(k, envName);
            }
          });
      }
    }
  });

  const result = Array.from(envKeysMap.entries()).map(([key, envName], idx) => ({
    key,
    label: `Env (${envName})`
  }));

  // HIGH-VISIBILITY LOG FOR VERCEL & SERVER LOGS
  console.log('====================================================');
  console.log(`[VERCEL LOGS] [Gemini Key Scanner] Timestamp: ${new Date().toISOString()}`);
  console.log(`[VERCEL LOGS] Total unique Gemini API keys detected: ${result.length}`);
  if (result.length > 0) {
    result.forEach((item, index) => {
      const snippet = item.key.length > 8
        ? `${item.key.substring(0, 6)}...${item.key.substring(item.key.length - 4)}`
        : '***';
      console.log(`[VERCEL LOGS]   Key #${index + 1} [Source: ${item.label}]: ${snippet}`);
    });
  } else {
    console.log('[VERCEL LOGS] WARNING: No Gemini API keys found in process.env variables!');
    console.log('[VERCEL LOGS] Available process.env keys with "GEMINI" in name:', Object.keys(process.env).filter(k => k.toUpperCase().includes('GEMINI')));
  }
  console.log('====================================================');

  return result;
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

  // Environment Keys Support
  const envKeys = getEnvironmentGeminiKeys();
  envKeys.forEach(envItem => {
    if (!candidates.some(c => c.key === envItem.key)) {
      candidates.push(envItem);
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
