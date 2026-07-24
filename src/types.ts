export type FrameworkKey = 'google' | 'anthropic' | 'openai' | 'dspy';

export interface AuditChecklistItem {
  id: string;
  item: string;
  category: string;
  weight: number;
}

export interface FrameworkCache {
  key: FrameworkKey;
  name: string;
  sourceUrl: string;
  focusArea: string;
  version: string;
  lastRefreshed: string;
  ruleCount: number;
  recommendationCount: number;
  auditChecklistCount: number;
  principles: string[];
  rules: string[];
  recommendations: string[];
  antiPatterns: string[];
  auditChecklist: AuditChecklistItem[];
}

export interface PromptScore {
  google: number;
  anthropic: number;
  openai: number;
  dspy: number;
  overall: number;
}

export interface PatchRecommendation {
  google: string;
  anthropic: string;
  openai: string;
  dspy: string;
  generalFixes: string[];
}

export interface RequirementModel {
  task: string;
  purpose: string;
  businessName: string;
  projectName: string;
  productName: string;
  topic: string;
  keyword: string;
  industry: string;
  domain: string;
  audience: string;
  language: string;
  platform: string;
  targetAi: string;
  expectedDeliverable: string;
  constraints: string[];
  missingInformation: string[];
  confidenceScore: number;
}

export interface RequirementVerification {
  status: 'PASS' | 'FAIL' | 'NEEDS_USER_CONFIRMATION';
  verificationScore: number;
  checks: {
    explicitEntitiesExtracted: boolean;
    noPlaceholders: boolean;
    intentPreserved: boolean;
    noNewFacts: boolean;
    missingInfoMarked: boolean;
    confidencePassed: boolean;
  };
  reason: string;
  clarificationItems: string[];
}

export interface RequirementAnalysis {
  domain: string;
  expandedRequirement: string;
  completedContext: string;
  assumptions: string[];
  identifiedRisks: string[];
  recommendedOutput: string;
  targetRole: string;
  requirementModel?: RequirementModel;
  verification?: RequirementVerification;
}

export interface PatchHistoryEntry {
  timestamp: string;
  action: string;
  improvedScore: PromptScore;
}

export interface GeneratedPromptRecord {
  id: string;
  title: string;
  createdAt: string;
  userNeed: string;
  userGoal: string;
  targetAi: string;
  analysis: RequirementAnalysis;
  markdownOutput: string;
  initialScore: PromptScore;
  patchedScore: PromptScore;
  patchRecommendations: PatchRecommendation;
  patchHistory: PatchHistoryEntry[];
  usedKeyLabel?: string;
  keyStatusLog?: Array<{ keySnippet: string; label?: string; status: string; errorDetails?: string }>;
}

export interface UserApiKey {
  id: string;
  label: string;
  key: string;
  priority: number;
  status: 'active' | 'rate_limited' | 'invalid' | 'untested';
  lastUsed: string | null;
  usageCount: number;
}

export type NavigationTab =
  | 'generate'
  | 'cache'
  | 'history'
  | 'api';

export type ThemeMode = 'light' | 'dark' | 'system';
