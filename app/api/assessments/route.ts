import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EVIDENCE } from '@/lib/evidence-data'
import { calculateScores } from '@/lib/scoring'

export async function GET() {
  const assessments = await prisma.assessment.findMany({
    include: { responses: true },
    orderBy: { createdAt: 'desc' },
  })
  const weights = await prisma.threatWeight.findMany()
  const weightMap = Object.fromEntries(weights.map(w => [w.domain, w.weight]))

  const data = assessments.map(a => {
    const { overallScore, frameworkScores } = calculateScores(a.responses, EVIDENCE, weightMap)
    return { ...a, overallScore, frameworkScores }
  })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, systemName, notes, responses } = body
  const assessment = await prisma.assessment.create({
    data: {
      name,
      systemName,
      notes,
      responses: {
        create: responses?.map((r: { evidenceId: string; status: string; notes?: string }) => ({
          evidenceId: r.evidenceId,
          status: r.status,
          notes: r.notes,
        })) ?? [],
      },
    },
    include: { responses: true },
  })
  return NextResponse.json(assessment, { status: 201 })
}
