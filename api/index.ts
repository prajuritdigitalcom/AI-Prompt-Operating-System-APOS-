import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { callGeminiWithRollingKeys, getEnvironmentGeminiKeys } from '../src/server/geminiHelper.js';
import {
  runRequirementIntelligenceEngine,
  runRequirementVerificationEngine
} from '../src/server/rieEngine.js';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'AI Prompt Operating System (APOS)',
    engines: ['RIE (Execution Order 1)', 'RV (Execution Order 2)', 'Multi-Framework Prompt Engine'],
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Gemini Server Keys Count
app.get('/api/server-keys-count', (req, res) => {
  const keys = getEnvironmentGeminiKeys();
  res.json({ count: keys.length, labels: keys.map(k => k.label) });
});

// Test API Key Endpoint
app.post('/api/test-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({ valid: false, error: 'API Key is required' });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Ping'
    });

    if (response && response.text) {
      return res.json({ valid: true });
    } else {
      return res.json({ valid: false, error: 'Empty response from Gemini API' });
    }
  } catch (err: any) {
    console.error('Error in /api/test-key:', err.message);
    return res.json({ valid: false, error: err.message || 'Invalid API key or network error' });
  }
});

// 1. Requirement Intelligence & Verification Endpoint (RIE & RV)
app.post('/api/analyze-requirements', async (req, res) => {
  try {
    const { userNeed, userGoal, targetAi = 'Gemini', userApiKey, rollingKeys } = req.body;

    if (!userNeed || !userGoal) {
      return res.status(400).json({ error: 'userNeed and userGoal are required' });
    }

    const rieResult = await runRequirementIntelligenceEngine(
      userNeed,
      userGoal,
      targetAi,
      userApiKey,
      rollingKeys
    );

    const rvResult = await runRequirementVerificationEngine(
      rieResult.model,
      userNeed,
      userGoal,
      userApiKey,
      rollingKeys
    );

    const verifiedModel = rvResult.verifiedModel;
    const verification = rvResult.verification;

    const analysis = {
      domain: verifiedModel.domain,
      expandedRequirement: `[Task: ${verifiedModel.task}] [Purpose: ${verifiedModel.purpose}] [Topic: ${verifiedModel.topic}] [Keyword: ${verifiedModel.keyword}] ${userNeed}`,
      completedContext: `Deliverable: ${verifiedModel.expectedDeliverable}. Audience: ${verifiedModel.audience}. Industry: ${verifiedModel.industry}. Business Name: ${verifiedModel.businessName}. Language: ${verifiedModel.language}.`,
      assumptions: verifiedModel.missingInformation.length > 0 
        ? verifiedModel.missingInformation.map(m => `Missing Info Marked: ${m}`)
        : [`Target AI: ${targetAi}`, `Purpose: ${verifiedModel.purpose}`],
      identifiedRisks: verifiedModel.constraints.length > 0 ? verifiedModel.constraints : ['No placeholders allowed', 'Strict terminology preservation'],
      recommendedOutput: verifiedModel.expectedDeliverable,
      targetRole: `Expert ${verifiedModel.domain} Specialist & Prompt Architect`,
      requirementModel: verifiedModel,
      verification
    };

    res.json({
      analysis,
      usedKeyLabel: rvResult.usedKeyLabel,
      keyStatusLog: rvResult.keyStatusLog
    });
  } catch (err: any) {
    console.error('Error in /api/analyze-requirements:', err);
    const isKeyExhausted = err.name === 'GeminiExhaustedError' || err.message?.includes('429') || err.message?.includes('limit');
    res.status(500).json({
      error: err.message || 'Requirement Intelligence & Verification failed',
      isKeyExhausted,
      keyStatusLog: err.keyStatusLog || []
    });
  }
});

// 2. Multi Framework Prompt Engine
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { userNeed, userGoal, targetAi = 'Gemini', analysis, userApiKey, rollingKeys } = req.body;

    if (!userNeed || !userGoal) {
      return res.status(400).json({ error: 'userNeed and userGoal are required' });
    }

    if (analysis?.verification && analysis.verification.status === 'FAIL') {
      return res.status(422).json({
        error: `Requirement Verification Failed (Score: ${analysis.verification.verificationScore}). Reason: ${analysis.verification.reason}`
      });
    }

    const model = analysis?.requirementModel;

    const promptText = `
You are the Multi-Framework Prompt Engine of APOS (AI Prompt Operating System).
Compile a master Markdown Prompt that synthesizes the principles of FOUR industry frameworks:
1. Google Prompting Strategies
2. Anthropic Prompt Engineering
3. OpenAI Prompt Engineering
4. DSPy Framework

Input Context:
- User Need: "${userNeed}"
- User Goal: "${userGoal}"
- Target AI Model: "${targetAi}"
- Requirement Analysis & Verification: ${JSON.stringify(analysis || {})}

Construct a production-grade Markdown prompt.
`;

    const result = await callGeminiWithRollingKeys({
      userApiKey,
      rollingKeys,
      params: {
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: { temperature: 0.2 }
      }
    });

    const markdownOutput = result.response.text || '';

    res.json({
      markdownOutput,
      usedKeyLabel: result.usedKeyLabel,
      keyStatusLog: result.keyStatusLog
    });
  } catch (err: any) {
    console.error('Error in /api/generate-prompt:', err);
    const isKeyExhausted = err.name === 'GeminiExhaustedError' || err.message?.includes('429') || err.message?.includes('limit');
    res.status(500).json({
      error: err.message || 'Prompt Generation failed',
      isKeyExhausted,
      keyStatusLog: err.keyStatusLog || []
    });
  }
});

// 3. Multi Framework Audit
app.post('/api/audit-prompt', async (req, res) => {
  try {
    const { promptMarkdown, userNeed, userGoal, userApiKey, rollingKeys } = req.body;

    if (!promptMarkdown) {
      return res.status(400).json({ error: 'promptMarkdown is required' });
    }

    const auditPrompt = `
You are the Multi-Framework Audit Engine of APOS.
Audit the following generated Markdown Prompt against four official frameworks:

1. Google Framework: Objective clarity, Context depth, Output format specification, Delimiter usage. (Score 0-100)
2. Anthropic Framework: Expert Role precision, Scratchpad <thinking> instructions, XML tag structure, Edge-case handling. (Score 0-100)
3. OpenAI Framework: Explicit instructions, Negative constraints, Multi-step workflow, Delimiters. (Score 0-100)
4. DSPy Framework: Modular pipeline structure, Evaluation criteria, Assertions, Reusability. (Score 0-100)

Prompt to Audit:
\`\`\`markdown
${promptMarkdown}
\`\`\`

User Context:
Need: "${userNeed || 'General Prompt'}"
Goal: "${userGoal || 'High quality output'}"

Provide scores for each framework, calculate overall score (weighted average), give specific actionable patch recommendations for each framework, list specific passed checklist items, and list failed checklist items.
`;

    const result = await callGeminiWithRollingKeys({
      userApiKey,
      rollingKeys,
      params: {
        model: 'gemini-3.6-flash',
        contents: auditPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.OBJECT,
                properties: {
                  google: { type: Type.INTEGER },
                  anthropic: { type: Type.INTEGER },
                  openai: { type: Type.INTEGER },
                  dspy: { type: Type.INTEGER },
                  overall: { type: Type.INTEGER }
                },
                required: ['google', 'anthropic', 'openai', 'dspy', 'overall']
              },
              patchRecommendations: {
                type: Type.OBJECT,
                properties: {
                  google: { type: Type.STRING },
                  anthropic: { type: Type.STRING },
                  openai: { type: Type.STRING },
                  dspy: { type: Type.STRING },
                  generalFixes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['google', 'anthropic', 'openai', 'dspy', 'generalFixes']
              },
              passedChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              failedChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['scores', 'patchRecommendations', 'passedChecklist', 'failedChecklist']
          }
        }
      }
    });

    const auditData = JSON.parse(result.response.text || '{}');

    res.json({
      audit: auditData,
      usedKeyLabel: result.usedKeyLabel,
      keyStatusLog: result.keyStatusLog
    });
  } catch (err: any) {
    console.error('Error in /api/audit-prompt:', err);
    const isKeyExhausted = err.name === 'GeminiExhaustedError' || err.message?.includes('429') || err.message?.includes('limit');
    res.status(500).json({
      error: err.message || 'Audit failed',
      isKeyExhausted,
      keyStatusLog: err.keyStatusLog || []
    });
  }
});

// 4. Patch Engine & Re-Audit
app.post('/api/patch-prompt', async (req, res) => {
  try {
    const { promptMarkdown, audit, userNeed, userGoal, userApiKey, rollingKeys } = req.body;

    if (!promptMarkdown || !audit) {
      return res.status(400).json({ error: 'promptMarkdown and audit are required' });
    }

    const patchPrompt = `
You are the Patch Engine of APOS.
Your job is to apply patch recommendations to elevate the quality score of a Markdown Prompt to 95+ across all four frameworks.

Original Prompt:
\`\`\`markdown
${promptMarkdown}
\`\`\`

Audit Failures & Recommendations:
- Google Fix: ${audit.patchRecommendations?.google}
- Anthropic Fix: ${audit.patchRecommendations?.anthropic}
- OpenAI Fix: ${audit.patchRecommendations?.openai}
- DSPy Fix: ${audit.patchRecommendations?.dspy}
- General Fixes: ${JSON.stringify(audit.patchRecommendations?.generalFixes || [])}

Rewrite and enhance the Markdown prompt to patch all weaknesses.
Maintain the required section structure:
# ROLE
# OBJECTIVE
# CONTEXT
# REQUIREMENTS
# CONSTRAINTS
<thinking>
</thinking>
# OUTPUT FORMAT
# SUCCESS CRITERIA & EVALUATION
# NOTES & EDGE CASES

Return JSON containing the patchedMarkdown and the new re-audited scores.
`;

    const result = await callGeminiWithRollingKeys({
      userApiKey,
      rollingKeys,
      params: {
        model: 'gemini-3.6-flash',
        contents: patchPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              patchedMarkdown: { type: Type.STRING },
              improvedScore: {
                type: Type.OBJECT,
                properties: {
                  google: { type: Type.INTEGER },
                  anthropic: { type: Type.INTEGER },
                  openai: { type: Type.INTEGER },
                  dspy: { type: Type.INTEGER },
                  overall: { type: Type.INTEGER }
                },
                required: ['google', 'anthropic', 'openai', 'dspy', 'overall']
              },
              appliedPatches: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['patchedMarkdown', 'improvedScore', 'appliedPatches']
          }
        }
      }
    });

    const patchedData = JSON.parse(result.response.text || '{}');

    res.json({
      patchedMarkdown: patchedData.patchedMarkdown,
      improvedScore: patchedData.improvedScore,
      appliedPatches: patchedData.appliedPatches,
      usedKeyLabel: result.usedKeyLabel,
      keyStatusLog: result.keyStatusLog
    });
  } catch (err: any) {
    console.error('Error in /api/patch-prompt:', err);
    const isKeyExhausted = err.name === 'GeminiExhaustedError' || err.message?.includes('429') || err.message?.includes('limit');
    res.status(500).json({
      error: err.message || 'Patch Engine failed',
      isKeyExhausted,
      keyStatusLog: err.keyStatusLog || []
    });
  }
});

// 5. Refresh Framework Cache
app.post('/api/refresh-frameworks', async (req, res) => {
  try {
    const { userApiKey, rollingKeys } = req.body;

    const refreshPrompt = `
You are the Framework Normalizer Engine of APOS.
Generate updated, normalized rule sets and audit checklists for the 4 core AI Prompt Engineering frameworks:
1. Google Prompting Strategies
2. Anthropic Prompt Engineering
3. OpenAI Prompt Engineering
4. DSPy Framework

Provide updated principles, rules, recommendations, anti-patterns, and audit checklists for each.
`;

    const result = await callGeminiWithRollingKeys({
      userApiKey,
      rollingKeys,
      params: {
        model: 'gemini-3.6-flash',
        contents: refreshPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              refreshedAt: { type: Type.STRING },
              frameworks: {
                type: Type.OBJECT,
                properties: {
                  google: {
                    type: Type.OBJECT,
                    properties: {
                      version: { type: Type.STRING },
                      principles: { type: Type.ARRAY, items: { type: Type.STRING } },
                      rules: { type: Type.ARRAY, items: { type: Type.STRING } },
                      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                      antiPatterns: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['version', 'principles', 'rules', 'recommendations', 'antiPatterns']
                  },
                  anthropic: {
                    type: Type.OBJECT,
                    properties: {
                      version: { type: Type.STRING },
                      principles: { type: Type.ARRAY, items: { type: Type.STRING } },
                      rules: { type: Type.ARRAY, items: { type: Type.STRING } },
                      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                      antiPatterns: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['version', 'principles', 'rules', 'recommendations', 'antiPatterns']
                  },
                  openai: {
                    type: Type.OBJECT,
                    properties: {
                      version: { type: Type.STRING },
                      principles: { type: Type.ARRAY, items: { type: Type.STRING } },
                      rules: { type: Type.ARRAY, items: { type: Type.STRING } },
                      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                      antiPatterns: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['version', 'principles', 'rules', 'recommendations', 'antiPatterns']
                  },
                  dspy: {
                    type: Type.OBJECT,
                    properties: {
                      version: { type: Type.STRING },
                      principles: { type: Type.ARRAY, items: { type: Type.STRING } },
                      rules: { type: Type.ARRAY, items: { type: Type.STRING } },
                      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                      antiPatterns: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['version', 'principles', 'rules', 'recommendations', 'antiPatterns']
                  }
                },
                required: ['google', 'anthropic', 'openai', 'dspy']
              }
            },
            required: ['refreshedAt', 'frameworks']
          }
        }
      }
    });

    const data = JSON.parse(result.response.text || '{}');
    res.json({
      success: true,
      data,
      refreshedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error in /api/refresh-frameworks:', err);
    res.status(500).json({ error: err.message || 'Cache refresh failed' });
  }
});

export default app;
