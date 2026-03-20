import type { EvidenceItem } from './evidence-data'

type ResponseRecord = { evidenceId: string; status: string }
type WeightMap = Record<string, number>

export function calculateScores(
  responses: ResponseRecord[],
  evidence: EvidenceItem[],
  weights: WeightMap
) {
  const STATUS_SCORE: Record<string, number> = {
    Compliant: 1.0,
    Partial: 0.5,
    'Non-Compliant': 0.0,
  }

  const responseMap = Object.fromEntries(responses.map(r => [r.evidenceId, r.status]))

  // Items per domain (excluding N/A)
  const domainItems: Record<string, EvidenceItem[]> = {}
  for (const item of evidence) {
    const status = responseMap[item.id]
    if (status === 'N/A' || status === undefined) continue
    if (!domainItems[item.domain]) domainItems[item.domain] = []
    domainItems[item.domain].push(item)
  }

  // Framework scores
  const frameworkRaw: Record<string, { sum: number; total: number }> = {}
  for (const item of evidence) {
    const status = responseMap[item.id]
    if (status === 'N/A' || status === undefined) continue
    const statusScore = STATUS_SCORE[status] ?? 0
    const domainWeight = weights[item.domain] ?? 0
    const itemsInDomain = domainItems[item.domain]?.length ?? 1
    const contribution = statusScore * domainWeight * (1 / itemsInDomain)
    const possibleContribution = domainWeight * (1 / itemsInDomain)

    for (const fw of item.frameworks) {
      if (!frameworkRaw[fw]) frameworkRaw[fw] = { sum: 0, total: 0 }
      frameworkRaw[fw].sum += contribution
      frameworkRaw[fw].total += possibleContribution
    }
  }

  const frameworkScores: Record<string, number> = {}
  for (const [fw, { sum, total }] of Object.entries(frameworkRaw)) {
    frameworkScores[fw] = total > 0 ? Math.round((sum / total) * 100) : 0
  }

  // Overall score
  let weightedSum = 0
  let totalWeight = 0
  for (const item of evidence) {
    const status = responseMap[item.id]
    if (status === 'N/A' || status === undefined) continue
    const statusScore = STATUS_SCORE[status] ?? 0
    const domainWeight = weights[item.domain] ?? 0
    const itemsInDomain = domainItems[item.domain]?.length ?? 1
    weightedSum += statusScore * domainWeight * (1 / itemsInDomain)
    totalWeight += domainWeight * (1 / itemsInDomain)
  }
  const overallScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0

  return { frameworkScores, overallScore }
}
