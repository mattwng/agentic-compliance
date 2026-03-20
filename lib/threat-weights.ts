const SEVERITY_SCORE: Record<string, number> = {
  critical: 4, high: 3, medium: 2, low: 1, informational: 0.5, info: 0.5,
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'Security Controls & Threat Mitigations': ['prompt injection','exploit','cve','attack','adversarial','sandbox','jailbreak','vulnerability','evasion','rce','xss','injection'],
  'Identity, Access & Privilege':           ['identity','credential','token','privilege','authentication','authorization','iam','mfa','session','secret','api key','least privilege'],
  'AI Model & Training Provenance':         ['model','training','dataset','poisoning','fine-tun','rlhf','bias','provenance','alignment','llm','foundation'],
  'Human Oversight & Control':              ['oversight','human-in-the-loop','hitl','autonomous','override','kill switch','transparency','agentic','accountability'],
  'Governance, Risk & Policy':              ['governance','policy','compliance','regulation','risk','audit','incident','vendor','eu ai act','nist','framework'],
  'Monitoring, Logging & Observability':    ['log','monitor','audit trail','anomaly','siem','detect','telemetry','drift','observab','explainab'],
  'Data Governance & Privacy':              ['data','privacy','gdpr','pii','retention','exfiltrat','classification','sensitive','breach','transfer'],
  'System Architecture & Design':           ['architecture','supply chain','infrastructure','topology','orchestration','memory','vector','plugin','sdk','pipeline'],
}

type ThreatRow = {
  title?: string
  description?: string
  tags?: string
  vulnerability_summary?: string
  severity?: string
}

export function computeWeightsFromThreats(rows: ThreatRow[]): Record<string, number> {
  const domainScores: Record<string, number> = {}
  for (const domain of Object.keys(DOMAIN_KEYWORDS)) domainScores[domain] = 0

  for (const row of rows) {
    const text = [row.title, row.description, row.tags, row.vulnerability_summary]
      .filter(Boolean).join(' ').toLowerCase()
    const severityKey = (row.severity ?? '').toLowerCase().trim()
    const score = SEVERITY_SCORE[severityKey] ?? 1

    const matched = Object.entries(DOMAIN_KEYWORDS)
      .filter(([, keywords]) => keywords.some(kw => text.includes(kw)))
      .map(([domain]) => domain)

    const targets = matched.length > 0 ? matched : ['Security Controls & Threat Mitigations']
    const share = score / targets.length
    for (const d of targets) domainScores[d] += share
  }

  const total = Object.values(domainScores).reduce((a, b) => a + b, 0)
  const normalized: Record<string, number> = {}
  for (const [domain, score] of Object.entries(domainScores)) {
    normalized[domain] = total > 0 ? parseFloat((score / total).toFixed(4)) : 0
  }
  return normalized
}
