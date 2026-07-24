import { FrameworkCache } from '../types';

export const DEFAULT_FRAMEWORKS: Record<string, FrameworkCache> = {
  google: {
    key: 'google',
    name: 'Google Prompting Strategies',
    sourceUrl: 'https://ai.google.dev/gemini-api/docs/prompting-strategies',
    focusArea: 'Objective, Context, Clear Directives, Output Format',
    version: '2026.1',
    lastRefreshed: new Date().toISOString(),
    ruleCount: 8,
    recommendationCount: 12,
    auditChecklistCount: 6,
    principles: [
      'Be clear, concise, and direct with model instructions.',
      'Provide ample domain context and define background clearly.',
      'Use explicit delimiters like triple quotes (""") or XML tags to structure inputs.',
      'Provide input-output examples (few-shot prompting) whenever output format is strict.'
    ],
    rules: [
      'Define clear Objective right at the beginning.',
      'Isolate contextual variables from operational instructions using section headers.',
      'Specify exact output format (e.g. Markdown tables, JSON schema, or code blocks).',
      'Tell the model what to do instead of what NOT to do.',
      'Break complex prompts into sequential sub-tasks.',
      'Include clear stop sequences or section end markers.',
      'Use system instructions for high-level persona and behavioral bounds.',
      'Specify edge-case fallbacks explicitly.'
    ],
    recommendations: [
      'Use Markdown headings (`#`, `##`) to delineate logical prompt segments.',
      'Incorporate structured schema tags for machine-parsable outputs.',
      'Add step-by-step verification instructions before final output generation.',
      'Define expected tone, technical density, and reading level explicitly.',
      'Use consistent field naming across instructions and schemas.'
    ],
    antiPatterns: [
      'Vague requests like "Write a good article" without length, target, or style constraints.',
      'Mixing input data directly inside instructions without clear delimiters.',
      'Overloading a single prompt with contradictory multi-domain requirements.'
    ],
    auditChecklist: [
      { id: 'g1', item: 'Primary objective is stated unequivocally in the header', category: 'Objective', weight: 20 },
      { id: 'g2', item: 'Context and domain assumptions are thoroughly defined', category: 'Context', weight: 20 },
      { id: 'g3', item: 'Instructions are organized step-by-step with zero ambiguity', category: 'Instructions', weight: 20 },
      { id: 'g4', item: 'Target output format is explicitly defined (Markdown structure)', category: 'Output Format', weight: 20 },
      { id: 'g5', item: 'Clear section delimiters are present throughout', category: 'Structure', weight: 10 },
      { id: 'g6', item: 'Edge-case handling or fallback rules are specified', category: 'Robustness', weight: 10 }
    ]
  },

  anthropic: {
    key: 'anthropic',
    name: 'Anthropic Prompt Engineering',
    sourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
    focusArea: 'Role, Context, Scratchpad/Thinking Block, XML Tag Delimiters',
    version: '2026.1',
    lastRefreshed: new Date().toISOString(),
    ruleCount: 9,
    recommendationCount: 10,
    auditChecklistCount: 6,
    principles: [
      'Assign an expert Role or Persona with explicit sub-skills.',
      'Encourage internal reasoning or thinking scratchpads before generating final answer.',
      'Use nested XML tags (e.g. <context>, <instructions>, <thinking>, <output>) to enclose prompt components.',
      'Give Claude permission to say "I don\'t know" or request missing context.'
    ],
    rules: [
      'Assign a precise domain persona in the role section.',
      'Wrap distinct prompt sections inside semantic XML tags.',
      'Request explicit reasoning steps inside <thinking> tags prior to output delivery.',
      'Provide example outputs wrapped in <example> tags.',
      'Avoid vague adjectives; quantify quality requirements with concrete metrics.',
      'Put multi-document context inside separate tagged blocks.',
      'Prefill model responses when enforcing rigid schemas.',
      'Specify negative constraints using clear <constraints> tags.',
      'Include domain-specific edge-case instructions.'
    ],
    recommendations: [
      'Structure prompts hierarchically using XML boundaries.',
      'Ask the model to evaluate its own compliance against constraints.',
      'Utilize XML attributes for metadata tags when providing datasets.',
      'Specify strict JSON or Markdown syntax rules inside <format_spec>.'
    ],
    antiPatterns: [
      'Failing to specify a designated expert role.',
      'Omitting structural XML delimiters for multi-part inputs.',
      'Forcing immediate output without granting thinking/reasoning space.'
    ],
    auditChecklist: [
      { id: 'a1', item: 'Expert role/persona is clearly defined with authoritative domain context', category: 'Role', weight: 25 },
      { id: 'a2', item: 'Structured XML tags are used for section isolation', category: 'Structure', weight: 20 },
      { id: 'a3', item: 'Explicit thinking/scratchpad reasoning step is requested', category: 'Thinking', weight: 20 },
      { id: 'a4', item: 'Clear guidelines provided for missing info or edge-case handling', category: 'Edge Cases', weight: 15 },
      { id: 'a5', item: 'Outputs are formatted with rigid structural boundaries', category: 'Output Format', weight: 10 },
      { id: 'a6', item: 'Negative constraints are clearly demarcated', category: 'Constraints', weight: 10 }
    ]
  },

  openai: {
    key: 'openai',
    name: 'OpenAI Prompt Engineering',
    sourceUrl: 'https://developers.openai.com/api/docs/guides/prompt-engineering',
    focusArea: 'Constraints, Multi-step Workflow, Explicit Instructions, Delimiters',
    version: '2026.1',
    lastRefreshed: new Date().toISOString(),
    ruleCount: 8,
    recommendationCount: 11,
    auditChecklistCount: 6,
    principles: [
      'Write clear, granular instructions with zero implicit assumptions.',
      'Use delimiters (Markdown formatting, ### headers, XML tags) to separate distinct instructions.',
      'Specify the exact sequence of steps required to complete the task.',
      'Provide negative constraints to prevent hallucination or unwanted styles.'
    ],
    rules: [
      'Detail the exact persona, target audience, and output objective.',
      'Specify negative constraints (e.g., "Do NOT use buzzwords, do NOT include meta-talk").',
      'Define step-by-step workflow requirements.',
      'Specify target length, vocabulary constraints, and structural tone.',
      'Provide unambiguous criteria for task success.',
      'Use delimiters like ### or ``` to separate instructions from data inputs.',
      'Specify exact error handling or missing data policies.',
      'Incorporate verification checks at key completion milestones.'
    ],
    recommendations: [
      'Provide concise, high-signal input examples.',
      'State formatting rules explicitly at both the top and bottom of complex prompts.',
      'Use numbered lists for strictly ordered multi-step operations.',
      'Demand precise technical nomenclature and ban generic filler phrases.'
    ],
    antiPatterns: [
      'Leaving room for open speculation or creative drift in technical prompts.',
      'Lacking negative constraints against common AI fluff or meta-commentary.',
      'Unclear separation between prompt metadata and input context.'
    ],
    auditChecklist: [
      { id: 'o1', item: 'Explicit instructions leave no room for ambiguous interpretations', category: 'Explicit Instructions', weight: 25 },
      { id: 'o2', item: 'Negative constraints (what NOT to do) are cleanly listed', category: 'Constraints', weight: 20 },
      { id: 'o3', item: 'Multi-step workflow execution sequence is clearly ordered', category: 'Workflow', weight: 20 },
      { id: 'o4', item: 'Delimiters unambiguously divide sections and user inputs', category: 'Delimiters', weight: 15 },
      { id: 'o5', item: 'Target tone, length, and style specifications are precise', category: 'Tone & Style', weight: 10 },
      { id: 'o6', item: 'Success criteria and validation check metrics are included', category: 'Evaluation', weight: 10 }
    ]
  },

  dspy: {
    key: 'dspy',
    name: 'DSPy Programming Framework',
    sourceUrl: 'https://github.com/stanfordnlp/dspy',
    focusArea: 'Compiler Mindset, Modular Reasoning, Signatures, Assertions & Evaluation',
    version: '2026.1',
    lastRefreshed: new Date().toISOString(),
    ruleCount: 8,
    recommendationCount: 9,
    auditChecklistCount: 6,
    principles: [
      'Treat prompts as compiled programs rather than static text snippets.',
      'Decompose complex tasks into modular signatures (Inputs -> Intermediate Steps -> Outputs).',
      'Define clear assertions and evaluation metrics for prompt validation.',
      'Design for iterative optimization and automated parameter tuning.'
    ],
    rules: [
      'Define input-to-output signatures (`Input Context -> Reasoning -> Output Spec`).',
      'Separate task logic into distinct modular steps.',
      'Incorporate explicit assertion checks and quality guardrails.',
      'Define success criteria metrics that can be systematically evaluated.',
      'Ensure prompt modules are reusable across different AI backends.',
      'Enforce strict input pre-validation and output post-processing rules.',
      'Structure reasoning loops as predictable algorithmic stages.',
      'Provide concrete criteria for pass/fail prompt quality auditing.'
    ],
    recommendations: [
      'Use signature-style variable declarations inside the prompt (e.g. `Inputs:`, `Outputs:`).',
      'Include a explicit quality assurance checklist block.',
      'Design modular prompt subsections that can be individually patched or updated.',
      'Define quantitative scoring benchmarks for key output components.'
    ],
    antiPatterns: [
      'Monolithic prompts that attempt to perform context parsing, reasoning, and rendering simultaneously without modular bounds.',
      'Prompts lacking objective pass/fail evaluation criteria.',
      'Tightly coupling prompt instructions to a single specific vendor model syntax.'
    ],
    auditChecklist: [
      { id: 'd1', item: 'Prompt follows a modular pipeline structure with clear input/output signatures', category: 'Modular Pipeline', weight: 25 },
      { id: 'd2', item: 'Objective evaluation criteria and success metrics are explicitly specified', category: 'Evaluation', weight: 20 },
      { id: 'd3', item: 'Assertions or quality guardrails are embedded into instructions', category: 'Assertions', weight: 20 },
      { id: 'd4', item: 'Reasoning process is decoupled from final output rendering', category: 'Reasoning', weight: 15 },
      { id: 'd5', item: 'Prompt architecture is portable across multiple AI models', category: 'Portability', weight: 10 },
      { id: 'd6', item: 'Input assumptions and prerequisites are pre-validated', category: 'Prerequisites', weight: 10 }
    ]
  }
};
