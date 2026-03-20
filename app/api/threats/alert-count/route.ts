import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getThreats } from '@/lib/threat-fetch'
import { buildGappedDomains, getRelevantThreats } from '@/lib/threat-alerts'

export async function GET() {
  const [threatsData, latestAssessment] = await Promise.all([
    getThreats(),
    prisma.assessment.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { responses: { select: { evidenceId: true, status: true } } },
    }),
  ])

  if (!latestAssessment) {
    return NextResponse.json({ criticalCount: 0, highCount: 0, topThreats: [] })
  }

  const allThreats = Object.values(threatsData.grouped).flat()
  const gappedDomains = buildGappedDomains(latestAssessment.responses)

  const critical = getRelevantThreats(allThreats, gappedDomains, ['critical'])
  const high = getRelevantThreats(allThreats, gappedDomains, ['high'])

  return NextResponse.json({
    criticalCount: critical.length,
    highCount: high.length,
    assessmentName: latestAssessment.name,
    systemName: latestAssessment.systemName,
    topThreats: critical.slice(0, 3).map(t => ({ id: t.id, title: t.title, severity: t.severity, source: t.source })),
  })
}
