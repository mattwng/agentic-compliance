import { EVIDENCE } from './evidence-data'
import type { ThreatEntry } from './threat-fetch'

export const DOMAIN_THREAT_TAGS: Record<string, string[]> = {
  'System Architecture & Design':           ['supply-chain', 'architecture', 'atlas', 'mitre'],
  'Identity, Access & Privilege':           ['credential-theft', 'api-key', 'x-force', 'ibm'],
  'AI Model & Training Provenance':         ['data-poisoning', 'supply-chain', 'model-weights', 'ip-theft', 'ml', 'nation-state', 'espionage', 'llm'],
  'Security Controls & Threat Mitigations': ['prompt-injection', 'llm', 'ai-attack', 'atlas', 'mitre', 'cve', 'exploited', 'recon', 'exploitation', 'phishing', 'social-engineering', 'deepfake', 'bec'],
  'Human Oversight & Control':              ['autonomous-agents', 'agentic-ai', 'ai-incident', 'safety'],
  'Governance, Risk & Policy':              ['annual-report', 'nation-state', 'espionage', 'ip-theft'],
  'Monitoring, Logging & Observability':    ['ai-incident', 'aiid', 'agentic-ai'],
  'Data Governance & Privacy':              ['ip-theft', 'data-poisoning', 'espionage'],
}

export function buildGappedDomains(
  responses: Array<{ evidenceId: string; status: string }>
): Set<string> {
  const gapped = new Set<string>()
  for (const r of responses) {
    if (r.status === 'Non-Compliant' || r.status === 'Partial') {
      const evidence = EVIDENCE.find(e => e.id === r.evidenceId)
      if (evidence) gapped.add(evidence.domain)
    }
  }
  return gapped
}

export function getRelevantThreats(
  threats: ThreatEntry[],
  gappedDomains: Set<string>,
  severities?: string[]
): ThreatEntry[] {
  return threats.filter(threat => {
    if (severities && !severities.includes(threat.severity)) return false
    for (const [domain, tags] of Object.entries(DOMAIN_THREAT_TAGS)) {
      if (!gappedDomains.has(domain)) continue
      if (threat.tags.some(t => tags.includes(t))) return true
    }
    return false
  })
}
