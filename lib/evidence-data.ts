export type EvidenceItem = {
  id: string
  domain: string
  frameworks: string[]
  aspect: string
}

export const FRAMEWORKS = [
  'NIST AI RMF',
  'CISA ZTMM',
  'OWASP LLM Top 10',
  'OWASP Agentic AI',
  'MITRE ATLAS',
  'NIST SP 800-207/A',
  'NIST AI 600-1',
  'Google SAIF',
  'CSA Agentic IAM',
  'EU AI Act',
]

export const DOMAINS = [
  'System Architecture & Design',
  'Identity, Access & Privilege',
  'AI Model & Training Provenance',
  'Security Controls & Threat Mitigations',
  'Human Oversight & Control',
  'Governance, Risk & Policy',
  'Monitoring, Logging & Observability',
  'Data Governance & Privacy',
]

export const FRAMEWORK_COLORS: Record<string, string> = {
  'NIST AI RMF':       '#3949ab',
  'CISA ZTMM':         '#1565c0',
  'OWASP LLM Top 10':  '#e65100',
  'OWASP Agentic AI':  '#c62828',
  'MITRE ATLAS':       '#b71c1c',
  'NIST SP 800-207/A': '#6a1b9a',
  'NIST AI 600-1':     '#4527a0',
  'Google SAIF':       '#2e7d32',
  'CSA Agentic IAM':   '#880e4f',
  'EU AI Act':         '#f57f17',
}

export const DOMAIN_COLORS: Record<string, string> = {
  'System Architecture & Design':           '#3949ab',
  'Identity, Access & Privilege':           '#1565c0',
  'AI Model & Training Provenance':         '#e65100',
  'Security Controls & Threat Mitigations': '#c62828',
  'Human Oversight & Control':              '#2e7d32',
  'Governance, Risk & Policy':              '#6a1b9a',
  'Monitoring, Logging & Observability':    '#00838f',
  'Data Governance & Privacy':              '#f57f17',
}

export const EVIDENCE: EvidenceItem[] = [
  // System Architecture & Design
  { id: 'arch-01', domain: 'System Architecture & Design', frameworks: ['NIST AI RMF','CISA ZTMM','NIST SP 800-207/A','Google SAIF','EU AI Act'], aspect: 'System architecture diagrams (components, integrations, data flows)' },
  { id: 'arch-02', domain: 'System Architecture & Design', frameworks: ['OWASP Agentic AI','CSA Agentic IAM','NIST AI 600-1','MITRE ATLAS'], aspect: 'Agent topology — single-agent vs. multi-agent orchestration design' },
  { id: 'arch-03', domain: 'System Architecture & Design', frameworks: ['OWASP Agentic AI','OWASP LLM Top 10','CSA Agentic IAM','MITRE ATLAS'], aspect: 'Tool/function inventory — every external tool, API, or service the agent can invoke' },
  { id: 'arch-04', domain: 'System Architecture & Design', frameworks: ['OWASP Agentic AI','OWASP LLM Top 10','NIST AI 600-1','MITRE ATLAS'], aspect: 'Agent memory architecture — short-term context, long-term memory, vector stores' },
  { id: 'arch-05', domain: 'System Architecture & Design', frameworks: ['OWASP Agentic AI','CSA Agentic IAM','NIST SP 800-207/A','CISA ZTMM'], aspect: 'Inter-agent communication protocols and trust boundaries' },
  { id: 'arch-06', domain: 'System Architecture & Design', frameworks: ['OWASP LLM Top 10','Google SAIF','MITRE ATLAS','EU AI Act'], aspect: 'Supply chain documentation — model providers, SDKs, third-party plugins' },
  // Identity, Access & Privilege
  { id: 'iam-01', domain: 'Identity, Access & Privilege', frameworks: ['CSA Agentic IAM','NIST SP 800-207/A','CISA ZTMM','OWASP Agentic AI'], aspect: 'Agent identity mechanisms — how each agent authenticates (credentials, tokens, certs)' },
  { id: 'iam-02', domain: 'Identity, Access & Privilege', frameworks: ['CISA ZTMM','NIST SP 800-207/A','CSA Agentic IAM'], aspect: 'Human user identity — MFA, SSO, directory integration' },
  { id: 'iam-03', domain: 'Identity, Access & Privilege', frameworks: ['CSA Agentic IAM','OWASP Agentic AI','NIST SP 800-207/A','CISA ZTMM'], aspect: 'Privilege inventory — permissions granted to each agent (least privilege check)' },
  { id: 'iam-04', domain: 'Identity, Access & Privilege', frameworks: ['CSA Agentic IAM','OWASP Agentic AI','NIST SP 800-207/A'], aspect: 'Dynamic permission scoping — can agent permissions be reduced at runtime?' },
  { id: 'iam-05', domain: 'Identity, Access & Privilege', frameworks: ['CSA Agentic IAM','OWASP LLM Top 10','CISA ZTMM','Google SAIF'], aspect: 'Secrets management — API keys, credentials, and tokens storage/rotation' },
  { id: 'iam-06', domain: 'Identity, Access & Privilege', frameworks: ['CSA Agentic IAM','NIST SP 800-207/A','CISA ZTMM'], aspect: 'Session and token lifecycle management — expiry, revocation, replay prevention' },
  // AI Model & Training Provenance
  { id: 'model-01', domain: 'AI Model & Training Provenance', frameworks: ['NIST AI RMF','NIST AI 600-1','EU AI Act','Google SAIF'], aspect: 'Model cards / model documentation for all foundation or fine-tuned models' },
  { id: 'model-02', domain: 'AI Model & Training Provenance', frameworks: ['NIST AI RMF','EU AI Act','NIST AI 600-1','Google SAIF'], aspect: 'Training data provenance — sources, licensing, PII handling, consent' },
  { id: 'model-03', domain: 'AI Model & Training Provenance', frameworks: ['NIST AI 600-1','MITRE ATLAS','EU AI Act','NIST AI RMF'], aspect: 'Fine-tuning and RLHF documentation — datasets used, alignment techniques' },
  { id: 'model-04', domain: 'AI Model & Training Provenance', frameworks: ['NIST AI RMF','Google SAIF','EU AI Act','MITRE ATLAS'], aspect: 'Model versioning and change control records' },
  { id: 'model-05', domain: 'AI Model & Training Provenance', frameworks: ['NIST AI RMF','NIST AI 600-1','EU AI Act','Google SAIF'], aspect: 'Bias, fairness, and red-team testing results' },
  { id: 'model-06', domain: 'AI Model & Training Provenance', frameworks: ['MITRE ATLAS','Google SAIF','NIST AI RMF','CISA ZTMM'], aspect: 'Model access controls — who/what can query or modify the model' },
  // Security Controls & Threat Mitigations
  { id: 'sec-01', domain: 'Security Controls & Threat Mitigations', frameworks: ['OWASP LLM Top 10','OWASP Agentic AI','MITRE ATLAS','Google SAIF'], aspect: 'Prompt injection defenses — input sanitization, privilege separation, system prompt hardening' },
  { id: 'sec-02', domain: 'Security Controls & Threat Mitigations', frameworks: ['OWASP LLM Top 10','NIST AI 600-1','Google SAIF','MITRE ATLAS'], aspect: 'Output validation controls — filtering, grounding checks, hallucination mitigations' },
  { id: 'sec-03', domain: 'Security Controls & Threat Mitigations', frameworks: ['OWASP Agentic AI','OWASP LLM Top 10','MITRE ATLAS','Google SAIF'], aspect: 'Sandboxing and isolation — how agent actions are contained' },
  { id: 'sec-04', domain: 'Security Controls & Threat Mitigations', frameworks: ['CISA ZTMM','NIST SP 800-207/A','Google SAIF'], aspect: 'Network segmentation and microsegmentation policies for agent traffic' },
  { id: 'sec-05', domain: 'Security Controls & Threat Mitigations', frameworks: ['MITRE ATLAS','Google SAIF','NIST AI RMF','OWASP LLM Top 10'], aspect: 'Adversarial ML controls — defenses against model inversion, poisoning, evasion' },
  { id: 'sec-06', domain: 'Security Controls & Threat Mitigations', frameworks: ['OWASP LLM Top 10','OWASP Agentic AI','MITRE ATLAS'], aspect: 'Insecure plugin/tool use mitigations — validation of tool outputs before acting' },
  { id: 'sec-07', domain: 'Security Controls & Threat Mitigations', frameworks: ['OWASP LLM Top 10','CISA ZTMM','EU AI Act','Google SAIF'], aspect: 'Sensitive data exposure controls — what data the agent can access or exfiltrate' },
  // Human Oversight & Control
  { id: 'human-01', domain: 'Human Oversight & Control', frameworks: ['OWASP Agentic AI','EU AI Act','NIST AI RMF','NIST AI 600-1'], aspect: 'Human-in-the-loop (HITL) checkpoints — actions requiring human approval' },
  { id: 'human-02', domain: 'Human Oversight & Control', frameworks: ['OWASP Agentic AI','EU AI Act','NIST AI RMF','NIST AI 600-1'], aspect: 'Override and kill-switch mechanisms — ability to halt or rollback agent actions' },
  { id: 'human-03', domain: 'Human Oversight & Control', frameworks: ['OWASP Agentic AI','CSA Agentic IAM','EU AI Act','NIST AI 600-1'], aspect: 'Autonomous action scope limits — guardrails without human confirmation' },
  { id: 'human-04', domain: 'Human Oversight & Control', frameworks: ['EU AI Act','NIST AI 600-1','NIST AI RMF','Google SAIF'], aspect: 'Transparency to end users — awareness they are interacting with an AI agent' },
  { id: 'human-05', domain: 'Human Oversight & Control', frameworks: ['NIST AI RMF','OWASP Agentic AI','EU AI Act'], aspect: 'Escalation paths — how the agent escalates ambiguous or high-risk decisions' },
  // Governance, Risk & Policy
  { id: 'gov-01', domain: 'Governance, Risk & Policy', frameworks: ['NIST AI RMF','EU AI Act','Google SAIF','NIST AI 600-1'], aspect: 'AI risk register and risk assessment documentation' },
  { id: 'gov-02', domain: 'Governance, Risk & Policy', frameworks: ['NIST AI RMF','EU AI Act','NIST AI 600-1','CSA Agentic IAM'], aspect: 'Policies and acceptable use documentation for AI agents' },
  { id: 'gov-03', domain: 'Governance, Risk & Policy', frameworks: ['EU AI Act'], aspect: 'EU AI Act risk classification — High / Limited / Minimal Risk determination' },
  { id: 'gov-04', domain: 'Governance, Risk & Policy', frameworks: ['EU AI Act'], aspect: 'Conformity assessment and CE marking documentation' },
  { id: 'gov-05', domain: 'Governance, Risk & Policy', frameworks: ['NIST AI RMF','EU AI Act','OWASP LLM Top 10','Google SAIF'], aspect: 'Third-party/vendor AI risk assessments' },
  { id: 'gov-06', domain: 'Governance, Risk & Policy', frameworks: ['NIST AI RMF','Google SAIF','MITRE ATLAS','EU AI Act'], aspect: 'Incident response plan covering AI-specific incidents' },
  { id: 'gov-07', domain: 'Governance, Risk & Policy', frameworks: ['NIST AI RMF','EU AI Act','Google SAIF','NIST AI 600-1'], aspect: 'Change management records for model updates, prompt changes, tool additions' },
  // Monitoring, Logging & Observability
  { id: 'mon-01', domain: 'Monitoring, Logging & Observability', frameworks: ['OWASP Agentic AI','CSA Agentic IAM','NIST AI RMF','EU AI Act'], aspect: 'Agent action logs — full trace of inputs/outputs per agent' },
  { id: 'mon-02', domain: 'Monitoring, Logging & Observability', frameworks: ['NIST AI RMF','CISA ZTMM','EU AI Act','CSA Agentic IAM'], aspect: 'Audit trails — immutable logs of agent decisions and tool invocations' },
  { id: 'mon-03', domain: 'Monitoring, Logging & Observability', frameworks: ['MITRE ATLAS','CISA ZTMM','Google SAIF','NIST AI RMF'], aspect: 'Anomaly detection coverage — behavioral baselining for agent activity' },
  { id: 'mon-04', domain: 'Monitoring, Logging & Observability', frameworks: ['NIST AI RMF','NIST AI 600-1','Google SAIF','EU AI Act'], aspect: 'Model performance monitoring — drift detection, output quality metrics' },
  { id: 'mon-05', domain: 'Monitoring, Logging & Observability', frameworks: ['EU AI Act','NIST AI RMF','NIST AI 600-1','Google SAIF'], aspect: 'Explainability / interpretability outputs — can decisions be traced?' },
  { id: 'mon-06', domain: 'Monitoring, Logging & Observability', frameworks: ['CISA ZTMM','MITRE ATLAS','Google SAIF','NIST SP 800-207/A'], aspect: 'SIEM/SOAR integration — AI agent events feeding security operations' },
  // Data Governance & Privacy
  { id: 'data-01', domain: 'Data Governance & Privacy', frameworks: ['CISA ZTMM','EU AI Act','NIST AI RMF','NIST SP 800-207/A'], aspect: 'Data classification scheme — sensitivity labels on data the agent can access' },
  { id: 'data-02', domain: 'Data Governance & Privacy', frameworks: ['EU AI Act','CISA ZTMM','NIST AI RMF'], aspect: 'Data minimization evidence — is the agent only accessing data it needs?' },
  { id: 'data-03', domain: 'Data Governance & Privacy', frameworks: ['EU AI Act','NIST AI 600-1','NIST AI RMF'], aspect: 'PII handling and GDPR/data protection compliance documentation' },
  { id: 'data-04', domain: 'Data Governance & Privacy', frameworks: ['EU AI Act','OWASP LLM Top 10','NIST AI RMF'], aspect: 'Data retention and deletion policies for agent memory and logs' },
  { id: 'data-05', domain: 'Data Governance & Privacy', frameworks: ['EU AI Act','NIST AI RMF'], aspect: 'Cross-border data transfer controls' },
]
