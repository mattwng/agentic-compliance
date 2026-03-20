import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

function getDbUrl(): string {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
  const filePath = dbUrl.replace(/^file:/, '')
  if (path.isAbsolute(filePath)) {
    return `file:${filePath}`
  }
  return `file:${path.resolve(process.cwd(), filePath)}`
}

const adapter = new PrismaLibSql({ url: getDbUrl() })
const prisma = new PrismaClient({ adapter })

const DEFAULT_WEIGHTS = [
  { domain: "Security Controls & Threat Mitigations", weight: 0.20, score: 0 },
  { domain: "Human Oversight & Control",              weight: 0.18, score: 0 },
  { domain: "Identity, Access & Privilege",           weight: 0.16, score: 0 },
  { domain: "Governance, Risk & Policy",              weight: 0.14, score: 0 },
  { domain: "AI Model & Training Provenance",         weight: 0.12, score: 0 },
  { domain: "Monitoring, Logging & Observability",    weight: 0.10, score: 0 },
  { domain: "Data Governance & Privacy",              weight: 0.06, score: 0 },
  { domain: "System Architecture & Design",           weight: 0.04, score: 0 },
]

async function main() {
  for (const w of DEFAULT_WEIGHTS) {
    await prisma.threatWeight.upsert({
      where: { domain: w.domain },
      update: {},
      create: { ...w, source: 'default' },
    })
  }
  console.log('Seeded default weights')
}

main().catch(console.error).finally(() => prisma.$disconnect())
