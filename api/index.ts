import express from 'express';
import { callGeminiWithRollingKeys, getEnvironmentGeminiKeys } from '../src/server/geminiHelper';
import {
  runRequirementIntelligenceEngine,
  runRequirementVerificationEngine
} from '../src/server/rieEngine';

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
    res.status(500).json({ error: err.message || 'Requirement Intelligence & Verification failed' });
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

    res.json({
      prompt: result.response.text || '',
      usedKeyLabel: result.usedKeyLabel,
      keyStatusLog: result.keyStatusLog
    });
  } catch (err: any) {
    console.error('Error in /api/generate-prompt:', err);
    res.status(500).json({ error: err.message || 'Prompt Generation failed' });
  }
});

export default app;
