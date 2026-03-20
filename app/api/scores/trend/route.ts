import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EVIDENCE } from '@/lib/evidence-data'
import { calculateScores } from '@/lib/scoring'

export async function GET() {
  const assessments = await prisma.assessment.findMany({
    include: { responses: true },
    orderBy: { date: 'asc' },
  })
  const weights = await prisma.threatWeight.findMany()
  const weightMap = Object.fromEntries(weights.map(w => [w.domain, w.weight]))

  const trend = assessments.map(a => {
    const { overallScore, frameworkScores } = calculateScores(a.responses, EVIDENCE, weightMap)
    return {
      id: a.id,
      name: a.name,
      systemName: a.systemName,
      date: a.date,
      overallScore,
      frameworkScores,
    }
  })
  return NextResponse.json(trend)
}
