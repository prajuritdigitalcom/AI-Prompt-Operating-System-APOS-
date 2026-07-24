import { Type } from '@google/genai';
import { callGeminiWithRollingKeys } from './geminiHelper';
import { RequirementModel, RequirementVerification } from '../types';

/**
 * ENGINE_ID: RIE
 * VERSION: 1.0
 * EXECUTION_ORDER: 1
 * PURPOSE: Transform raw user input into a verified Requirement Model before any Framework Engine is executed.
 */
export async function runRequirementIntelligenceEngine(
  userNeed: string,
  userGoal: string,
  targetAi: string = 'Gemini',
  userApiKey?: string,
  rollingKeys: string[] = []
): Promise<{ model: RequirementModel; usedKeyLabel: string; keyStatusLog: any[] }> {
  const rieSystemPrompt = `
You are the Requirement Intelligence Engine (RIE v1.0) of the AI Prompt Operating System (APOS).
ENGINE_ID: RIE
EXECUTION_ORDER: 1
PRIORITY: Critical

YOUR PURPOSE:
Read raw user input (Requirement and Goal), synthesize them into a structured Requirement Model.
This engine DOES NOT generate prompts, markdown, or final output. It produces pure clean structured data.

STRICT EXECUTION RULES:
- RULE-001: Read the ENTIRE Requirement (Input A) first. Do not perform inference prematurely.
- RULE-002: Read the ENTIRE Goal (Input B) after Requirement is understood.
- RULE-003: Merge Requirement and Goal into a single unified understanding.
- RULE-004: Extract ALL explicit information provided by the user (Business Name, Product Name, Project Name, Keywords, Topics, Frameworks, Languages, Platforms, Audience, Locations, Document Types, etc.).
- RULE-005: Preserve exact user terminology verbatim. (Example: "Business Plan" stays "Business Plan", NOT "Proposal Bisnis"; "Framework SILO" stays "Framework SILO").
- RULE-006: Preserve user intent completely. DILARANG changing user focus (Example: "Business Plan" must NOT be converted to "Pitch Deck").
- RULE-007: MUST NOT generate Placeholders! (BAD: "{{BUSINESS_NAME}}", GOOD: "Anak Mudah Hebat"). Replace all placeholders with actual extracted values.
- RULE-008: Infer missing info ONLY if Confidence >= 90% (e.g. "Warung Kopi" -> Industry: "Coffee Shop").
- RULE-009: MUST NOT make up new facts! (If user didn't mention investment amount, do NOT invent "Rp250.000.000").
- RULE-010: If critical information is absent, mark it clearly in "missingInformation". Do NOT fill with assumptions!
- RULE-011: Explicit User Input has top priority (Priority: 1. Requirement > 2. Goal > 3. Inference > 4. Framework Recommendation > 5. Best Practice).

USER INPUTS:
INPUT A (Requirement): "${userNeed}"
INPUT B (Goal & Target Outcome): "${userGoal}"
Target AI Model: "${targetAi}"

Construct a clean, normalized Requirement Model JSON object matching the exact schema.
`;

  const result = await callGeminiWithRollingKeys({
    userApiKey,
    rollingKeys,
    params: {
      model: 'gemini-3.6-flash',
      contents: rieSystemPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING, description: 'Specific classified task type preserving user terminology' },
            purpose: { type: Type.STRING, description: 'Purpose or underlying objective of the task' },
            businessName: { type: Type.STRING, description: 'Explicit business name or Not Mentioned' },
            projectName: { type: Type.STRING, description: 'Explicit project name or Not Mentioned' },
            productName: { type: Type.STRING, description: 'Explicit product name or Not Mentioned' },
            topic: { type: Type.STRING, description: 'Primary topic or subject matter' },
            keyword: { type: Type.STRING, description: 'Extracted explicit keywords' },
            industry: { type: Type.STRING, description: 'Industry category' },
            domain: { type: Type.STRING, description: 'Professional domain (e.g. Business, SEO, Coding)' },
            audience: { type: Type.STRING, description: 'Target audience or user persona' },
            language: { type: Type.STRING, description: 'Target language of the deliverable' },
            platform: { type: Type.STRING, description: 'Target platform or distribution channel' },
            targetAi: { type: Type.STRING, description: 'Target AI engine specified by user' },
            expectedDeliverable: { type: Type.STRING, description: 'Expected deliverable format or output document' },
            constraints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Explicit constraints and boundaries'
            },
            missingInformation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of essential information items missing from user input'
            },
            confidenceScore: { type: Type.INTEGER, description: 'Confidence score (0 to 100)' }
          },
          required: [
            'task',
            'purpose',
            'businessName',
            'projectName',
            'productName',
            'topic',
            'keyword',
            'industry',
            'domain',
            'audience',
            'language',
            'platform',
            'targetAi',
            'expectedDeliverable',
            'constraints',
            'missingInformation',
            'confidenceScore'
          ]
        }
      }
    }
  });

  const rawJson = JSON.parse(result.response.text || '{}');

  const model: RequirementModel = {
    task: rawJson.task || 'General Prompt Task',
    purpose: rawJson.purpose || userGoal || 'Achieve specified goal',
    businessName: rawJson.businessName || 'Not Mentioned',
    projectName: rawJson.projectName || 'Not Mentioned',
    productName: rawJson.productName || 'Not Mentioned',
    topic: rawJson.topic || userNeed,
    keyword: rawJson.keyword || userNeed,
    industry: rawJson.industry || 'General Industry',
    domain: rawJson.domain || 'General Domain',
    audience: rawJson.audience || 'General Audience',
    language: rawJson.language || 'Bahasa Indonesia',
    platform: rawJson.platform || 'General Platform',
    targetAi: rawJson.targetAi || targetAi,
    expectedDeliverable: rawJson.expectedDeliverable || 'Structured Document',
    constraints: Array.isArray(rawJson.constraints) ? rawJson.constraints : [],
    missingInformation: Array.isArray(rawJson.missingInformation) ? rawJson.missingInformation : [],
    confidenceScore: typeof rawJson.confidenceScore === 'number' ? rawJson.confidenceScore : 95
  };

  return {
    model,
    usedKeyLabel: result.usedKeyLabel,
    keyStatusLog: result.keyStatusLog
  };
}

/**
 * ENGINE_ID: RV
 * VERSION: 1.0
 * EXECUTION_ORDER: 2
 * PURPOSE: Verify Requirement Model before entering Multi Framework Prompt Engine.
 */
export async function runRequirementVerificationEngine(
  model: RequirementModel,
  userNeed: string,
  userGoal: string,
  userApiKey?: string,
  rollingKeys: string[] = []
): Promise<{ verification: RequirementVerification; verifiedModel: RequirementModel; usedKeyLabel: string; keyStatusLog: any[] }> {
  // Local regex verification for forbidden placeholders like {{keyword}} or {{...}}
  const modelStr = JSON.stringify(model);
  const hasPlaceholders = Boolean(
    /\{\{\s*[\w_]+\s*\}\}/.test(modelStr) ||
    /\[\[\s*[\w_]+\s*\]\]/.test(modelStr)
  );

  const rvPrompt = `
You are the Requirement Verification Engine (RV v1.0) of the AI Prompt Operating System (APOS).
ENGINE_ID: RV
EXECUTION_ORDER: 2
PRIORITY: Critical

YOUR PURPOSE:
Verify the Requirement Model produced by RIE before allowing execution of Multi Framework Prompt Engine.
Do NOT generate prompts or output content. Only validate.

VALIDATION RULES:
- RULE-001: Ensure ALL explicit user information was extracted without loss.
- RULE-002: Ensure NO Placeholders exist (e.g. {{...}} is strictly forbidden).
- RULE-003: Ensure NO change of user intent or focus (e.g., Business Plan stays Business Plan).
- RULE-004: Ensure NO fabricated facts (check if model contains facts not present in user input).
- RULE-005: Ensure ALL missing information is marked in missingInformation array.
- RULE-006: Calculate overall Verification Confidence Score (0 to 100).
- RULE-007: If Confidence Score >= 90 -> Status: PASS.
- RULE-008: If Confidence Score < 90 -> Status: FAIL.
- RULE-009: If Status is FAIL, provide a clear list of clarification items required from the user.

REQUIREMENT MODEL TO VERIFY:
${JSON.stringify(model, null, 2)}

ORIGINAL USER INPUTS:
Requirement (Input A): "${userNeed}"
Goal (Input B): "${userGoal}"

Verify compliance against all rules, produce checks object, status (PASS or FAIL), verificationScore, reason, and clarificationItems if any.
`;

  const result = await callGeminiWithRollingKeys({
    userApiKey,
    rollingKeys,
    params: {
      model: 'gemini-3.6-flash',
      contents: rvPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: 'Must be PASS or FAIL'
            },
            verificationScore: {
              type: Type.INTEGER,
              description: 'Confidence verification score 0-100'
            },
            checks: {
              type: Type.OBJECT,
              properties: {
                explicitEntitiesExtracted: { type: Type.BOOLEAN },
                noPlaceholders: { type: Type.BOOLEAN },
                intentPreserved: { type: Type.BOOLEAN },
                noNewFacts: { type: Type.BOOLEAN },
                missingInfoMarked: { type: Type.BOOLEAN },
                confidencePassed: { type: Type.BOOLEAN }
              },
              required: [
                'explicitEntitiesExtracted',
                'noPlaceholders',
                'intentPreserved',
                'noNewFacts',
                'missingInfoMarked',
                'confidencePassed'
              ]
            },
            reason: { type: Type.STRING, description: 'Detailed explanation of verification outcome' },
            clarificationItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of items to clarify if status is FAIL or missing info exists'
            }
          },
          required: ['status', 'verificationScore', 'checks', 'reason', 'clarificationItems']
        }
      }
    }
  });

  const raw = JSON.parse(result.response.text || '{}');

  let verificationScore = typeof raw.verificationScore === 'number' ? raw.verificationScore : 95;

  let finalStatus: 'PASS' | 'FAIL' | 'NEEDS_USER_CONFIRMATION' =
    raw.status === 'FAIL' || verificationScore < 90 || hasPlaceholders ? 'FAIL' : 'PASS';

  if (hasPlaceholders) {
    if (raw.checks) raw.checks.noPlaceholders = false;
    verificationScore = Math.min(verificationScore, 85);
    finalStatus = 'FAIL';
  }

  const verification: RequirementVerification = {
    status: finalStatus,
    verificationScore,
    checks: {
      explicitEntitiesExtracted: raw.checks?.explicitEntitiesExtracted ?? true,
      noPlaceholders: raw.checks?.noPlaceholders ?? !hasPlaceholders,
      intentPreserved: raw.checks?.intentPreserved ?? true,
      noNewFacts: raw.checks?.noNewFacts ?? true,
      missingInfoMarked: raw.checks?.missingInfoMarked ?? true,
      confidencePassed: raw.checks?.confidencePassed ?? (verificationScore >= 90)
    },
    reason: raw.reason || (finalStatus === 'PASS' ? 'Requirement Model verified successfully.' : 'Verification failed due to low confidence or missing critical constraints.'),
    clarificationItems: Array.isArray(raw.clarificationItems) ? raw.clarificationItems : []
  };

  return {
    verification,
    verifiedModel: model,
    usedKeyLabel: result.usedKeyLabel,
    keyStatusLog: result.keyStatusLog
  };
}

