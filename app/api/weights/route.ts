import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_WEIGHTS = [
  { domain: 'Security Controls & Threat Mitigations', weight: 0.20 },
  { domain: 'Human Oversight & Control',              weight: 0.18 },
  { domain: 'Identity, Access & Privilege',           weight: 0.16 },
  { domain: 'Governance, Risk & Policy',              weight: 0.14 },
  { domain: 'AI Model & Training Provenance',         weight: 0.12 },
  { domain: 'Monitoring, Logging & Observability',    weight: 0.10 },
  { domain: 'Data Governance & Privacy',              weight: 0.06 },
  { domain: 'System Architecture & Design',           weight: 0.04 },
]

export async function GET() {
  const weights = await prisma.threatWeight.findMany({ orderBy: { weight: 'desc' } })
  return NextResponse.json(weights)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { weights, source } = body as { weights: Record<string, number>; source: string }

  const results = await Promise.all(
    Object.entries(weights).map(([domain, weight]) =>
      prisma.threatWeight.upsert({
        where: { domain },
        update: { weight, score: weight, source },
        create: { domain, weight, score: weight, source },
      })
    )
  )
  return NextResponse.json(results)
}

export async function DELETE() {
  await Promise.all(
    DEFAULT_WEIGHTS.map(({ domain, weight }) =>
      prisma.threatWeight.upsert({
        where: { domain },
        update: { weight, score: 0, source: 'default' },
        create: { domain, weight, score: 0, source: 'default' },
      })
    )
  )
  return NextResponse.json({ success: true })
}
