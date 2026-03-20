import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EVIDENCE } from '@/lib/evidence-data'
import { calculateScores } from '@/lib/scoring'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { responses: true },
  })
  if (!assessment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const weights = await prisma.threatWeight.findMany()
  const weightMap = Object.fromEntries(weights.map(w => [w.domain, w.weight]))
  const { overallScore, frameworkScores } = calculateScores(assessment.responses, EVIDENCE, weightMap)
  return NextResponse.json({ assessmentId: id, overallScore, frameworkScores, weights: weightMap })
}
