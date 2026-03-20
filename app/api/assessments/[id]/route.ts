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
  return NextResponse.json({ ...assessment, overallScore, frameworkScores })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { name, systemName, notes, responses } = body

  await prisma.response.deleteMany({ where: { assessmentId: id } })
  const assessment = await prisma.assessment.update({
    where: { id },
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
  return NextResponse.json(assessment)
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.assessment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
