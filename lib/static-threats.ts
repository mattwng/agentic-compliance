import type { ThreatEntry, SourceStatus } from './threat-fetch'

const STATIC_ENTRIES: ThreatEntry[] = [
  {
    id: 'enisa-2024-llm-prompt-injection',
    source: 'ENISA Threat Landscape',
    title: 'Prompt Injection Attacks Against LLM-Integrated Applications',
    description: "ENISA's 2024 Threat Landscape report identifies prompt injection as one of the top threats to AI systems. Attackers craft inputs that override system instructions, causing LLMs to reveal sensitive data, bypass safety filters, or execute unintended actions.",
    vulnerability_summary: 'Affects any organization deploying LLM-integrated applications, chatbots, or AI assistants. Particularly relevant for enterprises using RAG architectures, AI agents with tool access, or customer-facing LLM services.',
    published: '2024-10-01T00:00:00Z',
    link: 'https://www.enisa.europa.eu/publications/enisa-threat-landscape-2024',
    severity: 'high',
    tags: ['enisa', 'llm', 'prompt-injection', 'annual-report'],
  },
  {
    id: 'enisa-2024-data-poisoning',
    source: 'ENISA Threat Landscape',
    title: 'Training Data Poisoning in ML Supply Chains',
    description: 'Adversaries introduce malicious data into ML training pipelines to corrupt model behavior. ENISA highlights supply chain attacks on open datasets and pre-trained model weights as an emerging threat vector for 2024–2025.',
    vulnerability_summary: 'Affects organizations that fine-tune open-source models, use third-party datasets, or pull model weights from public repositories (Hugging Face, GitHub). Downstream customers of poisoned models are also at risk.',
    published: '2024-10-01T00:00:00Z',
    link: 'https://www.enisa.europa.eu/publications/enisa-threat-landscape-2024',
    severity: 'high',
    tags: ['enisa', 'data-poisoning', 'supply-chain', 'ml', 'annual-report'],
  },
  {
    id: 'ibm-xforce-2025-ai-credential-theft',
    source: 'IBM X-Force Index',
    title: 'AI API Key Theft Drives 3x Increase in Cloud Credential Attacks',
    description: 'IBM X-Force 2025 Index reports that stolen AI service credentials (OpenAI, Anthropic, AWS Bedrock, Azure AI) are now among the most traded items on dark web marketplaces. Attackers use compromised API keys to run LLM inference at victim expense or exfiltrate proprietary fine-tuned models.',
    vulnerability_summary: 'Affects enterprises and developers using AI APIs without proper secret management. Organizations storing API keys in source code, CI/CD logs, or environment variables without rotation policies are primary targets.',
    published: '2025-02-01T00:00:00Z',
    link: 'https://www.ibm.com/reports/threat-intelligence',
    severity: 'high',
    tags: ['ibm', 'x-force', 'credential-theft', 'api-key', 'annual-report'],
  },
  {
    id: 'ibm-xforce-2025-ai-assisted-phishing',
    source: 'IBM X-Force Index',
    title: 'AI-Generated Spear Phishing Campaigns Reduce Attack Prep Time by 66%',
    description: 'IBM X-Force observed threat actors using LLMs to generate highly personalized phishing emails at scale. AI-assisted campaigns reduced the average time to craft a convincing spear phishing email from 16 hours to under 5 minutes.',
    vulnerability_summary: 'Affects all organizations, with particular risk for executives, finance teams, and IT administrators. Traditional email security tools struggle to detect AI-crafted content that passes grammar and tone checks.',
    published: '2025-02-01T00:00:00Z',
    link: 'https://www.ibm.com/reports/threat-intelligence',
    severity: 'high',
    tags: ['ibm', 'x-force', 'phishing', 'social-engineering', 'ai', 'annual-report'],
  },
  {
    id: 'verizon-dbir-2024-ai-in-attacks',
    source: 'Verizon DBIR',
    title: 'Generative AI Tools Observed in 15% of Social Engineering Incidents',
    description: "Verizon's 2024 Data Breach Investigations Report found evidence of generative AI use in 15% of analyzed social engineering incidents. Deepfake audio/video was used in BEC (Business Email Compromise) fraud cases, with losses in some incidents exceeding $500K.",
    vulnerability_summary: 'Affects organizations across all sectors, particularly financial services, healthcare, and government. Finance teams authorizing wire transfers and executives are high-value targets for AI-enhanced BEC attacks.',
    published: '2024-04-01T00:00:00Z',
    link: 'https://www.verizon.com/business/resources/reports/dbir/',
    severity: 'high',
    tags: ['verizon', 'dbir', 'social-engineering', 'deepfake', 'bec', 'annual-report'],
  },
  {
    id: 'mandiant-2024-unc5820-ai-recon',
    source: 'Google / Mandiant',
    title: 'UNC5820: Threat Actor Using AI Tools for Attack Surface Reconnaissance',
    description: 'Mandiant tracked threat group UNC5820 using commercially available AI coding assistants and LLM APIs to automate vulnerability scanning and generate custom exploit code. The group demonstrated significantly faster time-to-exploitation compared to manually operated campaigns.',
    vulnerability_summary: 'Affects organizations with internet-exposed APIs, web applications, and cloud infrastructure. AI-accelerated recon means the window between public vulnerability disclosure and active exploitation is shrinking.',
    published: '2024-11-01T00:00:00Z',
    link: 'https://www.mandiant.com/resources/blog',
    severity: 'critical',
    tags: ['mandiant', 'google', 'threat-actor', 'recon', 'exploitation', 'unc5820'],
  },
  {
    id: 'mandiant-2025-ai-model-theft',
    source: 'Google / Mandiant',
    title: 'State-Sponsored Actors Targeting Proprietary AI Model Weights',
    description: 'Mandiant\'s 2025 threat intelligence indicates nation-state actors (attributed to China, Russia, and North Korea) are actively targeting organizations to steal proprietary AI model weights and training data. Stolen models represent significant R&D investment and can be used for offensive cyber capabilities.',
    vulnerability_summary: 'Primarily affects AI research labs, technology companies, defense contractors, and enterprises with proprietary fine-tuned models. Model weights stored in cloud storage or ML platforms without proper access controls are at risk.',
    published: '2025-01-15T00:00:00Z',
    link: 'https://www.mandiant.com/resources/blog',
    severity: 'critical',
    tags: ['mandiant', 'google', 'nation-state', 'ip-theft', 'model-weights', 'espionage'],
  },
  // ── Datadog Security Labs ────────────────────────────────────────────────────
  {
    id: 'ddsl-2024-malicious-pypi-ml',
    source: 'Datadog Security Labs',
    title: 'Malicious PyPI Packages Targeting Machine Learning Engineers Steal Credentials and Deploy Backdoors',
    description: 'Datadog Security Labs identified a campaign distributing trojanized PyPI packages mimicking popular ML libraries (transformers, torch, diffusers). Packages executed obfuscated payloads on install that exfiltrated API keys, SSH credentials, and cloud provider tokens to attacker-controlled infrastructure.',
    vulnerability_summary: 'Affects any developer installing AI/ML packages from PyPI without hash verification. Packages with typosquatted names (e.g. "torch-cuda12", "transformerz") evade casual inspection and execute on `pip install`.',
    published: '2024-08-15T00:00:00Z',
    link: 'https://securitylabs.datadoghq.com',
    severity: 'high',
    tags: ['datadog', 'security-research', 'supply-chain', 'pypi', 'malicious-package', 'oss-security'],
  },
  {
    id: 'ddsl-2025-ai-workload-container-escape',
    source: 'Datadog Security Labs',
    title: 'Container Escape and Privilege Escalation in GPU-Enabled AI Workloads',
    description: "Datadog Security Labs documented techniques for container escape specific to GPU-enabled environments running AI workloads. Misconfigured NVIDIA container runtimes and privileged mode GPU passthrough allow attackers who compromise a model-serving container to escalate to the underlying host — including access to other tenants' model weights in multi-tenant inference platforms.",
    vulnerability_summary: 'Affects organizations running AI inference in Kubernetes with GPU node pools, particularly multi-tenant ML platforms. Privileged container flags required for GPU access create a direct path to host compromise.',
    published: '2025-01-20T00:00:00Z',
    link: 'https://securitylabs.datadoghq.com',
    severity: 'critical',
    tags: ['datadog', 'security-research', 'supply-chain', 'oss-security', 'exploitation'],
  },
  // ── Socket.dev ───────────────────────────────────────────────────────────────
  {
    id: 'socket-2025-ai-npm-campaign',
    source: 'Socket.dev',
    title: "Socket Threat Research: 60+ Malicious npm Packages Impersonating OpenAI, Anthropic, and LangChain SDKs",
    description: "Socket's threat research team identified over 60 malicious npm packages using names nearly identical to official AI SDK packages. Packages including 'openai-official', 'langchainjs-core', and '@anthropic/sdk' contained preinstall scripts that harvested environment variables (API keys, tokens) and sent them to attacker infrastructure.",
    vulnerability_summary: 'Affects any Node.js project that installs AI SDK packages without pinning exact package names and verifying publisher identity. Automated dependency updates (Dependabot, Renovate) may pull typosquatted packages if not properly scoped.',
    published: '2025-02-10T00:00:00Z',
    link: 'https://socket.dev/blog',
    severity: 'high',
    tags: ['socket-dev', 'supply-chain', 'oss-security', 'npm', 'malicious-package', 'credential-theft', 'api-key'],
  },
  {
    id: 'socket-2024-dependency-confusion-llm',
    source: 'Socket.dev',
    title: 'Dependency Confusion Attacks Targeting Internal AI/LLM Tooling Packages',
    description: "Socket researchers demonstrated active dependency confusion attacks targeting organizations that maintain internal Python or npm packages for LLM orchestration and prompt management. Attackers registered public package names matching common internal naming patterns (llm-utils, prompt-core, ai-agent-tools), causing CI/CD pipelines to pull malicious public versions instead of private registry packages.",
    vulnerability_summary: 'Affects organizations with private package registries that have not configured explicit registry scoping or priority rules. Internal AI tooling packages with generic names are especially vulnerable.',
    published: '2024-11-05T00:00:00Z',
    link: 'https://socket.dev/blog',
    severity: 'high',
    tags: ['socket-dev', 'supply-chain', 'oss-security', 'pypi', 'npm', 'malicious-package'],
  },
  {
    id: 'mit-aiit-2024-autonomous-system-failures',
    source: 'MIT AI Incident Tracker',
    title: 'Autonomous AI Agent Systems: 47 Reported Failures Involving Real-World Harm',
    description: "MIT's AI Incident Tracker documented 47 incidents in 2024 involving autonomous AI agent systems causing real-world harm — including financial losses, privacy violations, and safety-critical failures. Categories include unintended tool use, goal misgeneralization, and adversarial manipulation of agent memory.",
    vulnerability_summary: 'Affects organizations deploying autonomous AI agents with tool access (web browsing, code execution, API calls, database access). Particularly relevant for agentic AI pipelines used in finance, healthcare, legal, and infrastructure management.',
    published: '2024-12-01T00:00:00Z',
    link: 'https://aiindex.stanford.edu/',
    severity: 'medium',
    tags: ['mit', 'ai-incident', 'autonomous-agents', 'agentic-ai', 'safety'],
  },
]

export function loadStaticSources(): { grouped: Record<string, ThreatEntry[]>; sources_status: Record<string, SourceStatus> } {
  const grouped: Record<string, ThreatEntry[]> = {}
  for (const entry of STATIC_ENTRIES) {
    if (!grouped[entry.source]) grouped[entry.source] = []
    grouped[entry.source].push(entry)
  }
  const sources_status: Record<string, SourceStatus> = {}
  for (const [source, entries] of Object.entries(grouped)) {
    sources_status[source] = { ok: true, type: 'static', count: entries.length, error: null }
  }
  return { grouped, sources_status }
}
