// Applies Prisma migrations using @libsql/client directly.
// Used in Docker CMD instead of `npx prisma migrate deploy` (which requires TS runtime).
const { createClient } = require('@libsql/client')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

async function migrate() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')

  const client = createClient({ url })

  // Ensure migrations tracking table exists
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      checksum VARCHAR(64) NOT NULL,
      finished_at DATETIME,
      migration_name VARCHAR(255) NOT NULL,
      logs TEXT,
      rolled_back_at DATETIME,
      started_at DATETIME NOT NULL DEFAULT current_timestamp,
      applied_steps_count INTEGER UNSIGNED NOT NULL DEFAULT 0
    )
  `)

  const migrationsDir = path.join(__dirname, 'prisma', 'migrations')
  const folders = fs.readdirSync(migrationsDir)
    .filter(f => {
      try { return fs.statSync(path.join(migrationsDir, f)).isDirectory() } catch { return false }
    })
    .sort()

  for (const folder of folders) {
    const sqlFile = path.join(migrationsDir, folder, 'migration.sql')
    if (!fs.existsSync(sqlFile)) continue

    const existing = await client.execute({
      sql: 'SELECT id FROM _prisma_migrations WHERE migration_name = ?',
      args: [folder],
    })
    if (existing.rows.length > 0) {
      console.log(`[migrate] already applied: ${folder}`)
      continue
    }

    const sql = fs.readFileSync(sqlFile, 'utf8')
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean)
    for (const stmt of statements) {
      await client.execute(stmt)
    }

    const checksum = crypto.createHash('sha256').update(sql).digest('hex').slice(0, 64)
    await client.execute({
      sql: `INSERT INTO _prisma_migrations (id, checksum, migration_name, finished_at, applied_steps_count)
            VALUES (?, ?, ?, datetime('now'), 1)`,
      args: [crypto.randomUUID(), checksum, folder],
    })
    console.log(`[migrate] applied: ${folder}`)
  }

  await client.close()
  console.log('[migrate] done')
}

migrate().catch(err => { console.error('[migrate] error:', err); process.exit(1) })
