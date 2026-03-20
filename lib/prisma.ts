import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

function getDbUrl(): string {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
  // If already absolute or remote, use as-is
  if (!dbUrl.startsWith('file:./') && !dbUrl.startsWith('file:../')) {
    return dbUrl
  }
  // For relative paths, keep as-is — libsql resolves relative to process.cwd()
  return dbUrl
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: getDbUrl() })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
