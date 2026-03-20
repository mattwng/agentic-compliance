import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { loadStaticSources } from './static-threats'

// ── Types ──────────────────────────────────────────────────────────────────────

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type ThreatEntry = {
  id: string
  source: string
  title: string
  description: string
  vulnerability_summary: string
  published: string
  link: string
  severity: ThreatSeverity
  tags: string[]
}

export type SourceStatus = {
  ok: boolean
  type: 'live' | 'static'
  count: number
  error: string | null
}

export type ThreatCache = {
  timestamp: string
  grouped: Record<string, ThreatEntry[]>
  sources_status: Record<string, SourceStatus>
  generating: boolean
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CACHE_TTL = process.env.NODE_ENV === 'development' ? 3600 : 28800 // 1h dev / 8h prod
const ATLAS_CACHE_TTL_DAYS = 7
const FETCH_TIMEOUT_MS = 30000

const AI_KEYWORDS = [
  'tensorflow', 'pytorch', 'llm', 'gpt', 'huggingface', 'hugging face',
  'cuda', 'machine learning', 'ml model', 'neural network', 'deep learning',
  'openai', 'anthropic', 'gemini', 'bert', 'transformer', 'diffusion',
  'stable diffusion', 'langchain', 'llamaindex', 'ollama', 'onnx',
  'scikit', 'sklearn', 'keras', 'caffe', 'mxnet', 'paddle',
  'nvidia', 'triton', 'tritonserver', 'mlflow', 'ray',
  'jupyter', 'notebook', 'ai ', 'artificial intelligence',
  'computer vision', 'nlp', 'natural language',
]

// ── File paths ─────────────────────────────────────────────────────────────────

function getDataDir(): string {
  const dbUrl = process.env.DATABASE_URL ?? 'file:/tmp/compliance.db'
  const dbPath = dbUrl.replace('file:', '')
  return path.dirname(dbPath)
}

function getCacheFile(): string {
  return path.join(getDataDir(), 'threat_cache.json')
}

function getAtlasCacheFile(): string {
  return path.join(getDataDir(), 'mitre_atlas_cache.json')
}

// ── Cache helpers ──────────────────────────────────────────────────────────────

function loadCache(): ThreatCache | null {
  const file = getCacheFile()
  if (!fs.existsSync(file)) return null
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as ThreatCache
    const age = (Date.now() - new Date(data.timestamp).getTime()) / 1000
    if (age < CACHE_TTL) return { ...data, generating: false }
  } catch { /* ignore */ }
  return null
}

function loadStaleCache(): ThreatCache | null {
  const file = getCacheFile()
  if (!fs.existsSync(file)) return null
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as ThreatCache
    return { ...data, generating: true }
  } catch { return null }
}

function saveCache(grouped: Record<string, ThreatEntry[]>, sources_status: Record<string, SourceStatus>) {
  const file = getCacheFile()
  const dir = path.dirname(file)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const data: ThreatCache = {
    timestamp: new Date().toISOString(),
    grouped,
    sources_status,
    generating: false,
  }
  const tmp = file + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data))
  fs.renameSync(tmp, file)
}

export function deleteCache() {
  const file = getCacheFile()
  if (fs.existsSync(file)) fs.unlinkSync(file)
}

// ── Module-level fetch state (persists across requests in standalone server) ──

let _isFetching = false

export function getIsGenerating() { return _isFetching }

// ── Main entry point ───────────────────────────────────────────────────────────

export async function getThreats(): Promise<ThreatCache> {
  const fresh = loadCache()
  if (fresh) return fresh

  if (!_isFetching) {
    _isFetching = true
    runFetch()
      .then(({ grouped, sources_status }) => saveCache(grouped, sources_status))
      .catch(e => console.error('[threats] Fetch error:', e))
      .finally(() => { _isFetching = false })
  }

  const stale = loadStaleCache()
  if (stale) return stale

  return {
    timestamp: new Date().toISOString(),
    grouped: {},
    sources_status: {},
    generating: true,
  }
}

// ── Fetch orchestrator ─────────────────────────────────────────────────────────

async function runFetch(): Promise<{ grouped: Record<string, ThreatEntry[]>; sources_status: Record<string, SourceStatus> }> {
  const results = await Promise.allSettled([
    fetchCisaKev(),
    fetchAIID(),
    fetchMitreAtlas(),
    fetchFireTail(),
  ])

  const sources = ['CISA KEV', 'AI Incident Database', 'MITRE ATLAS', 'FireTail AI Breaches']
  const grouped: Record<string, ThreatEntry[]> = {}
  const sources_status: Record<string, SourceStatus> = {}

  results.forEach((result, i) => {
    const name = sources[i]
    if (result.status === 'fulfilled') {
      grouped[name] = result.value[0]
      sources_status[name] = result.value[1]
    } else {
      grouped[name] = []
      sources_status[name] = { ok: false, type: 'live', count: 0, error: String(result.reason) }
    }
  })

  // Merge static curated sources (ENISA, IBM X-Force, Mandiant, etc.)
  const { grouped: staticGrouped, sources_status: staticStatus } = loadStaticSources()
  Object.assign(grouped, staticGrouped)
  Object.assign(sources_status, staticStatus)

  return { grouped, sources_status }
}

// ── CISA KEV ───────────────────────────────────────────────────────────────────

async function fetchCisaKev(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const resp = await fetch(
      'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
      { headers: { 'User-Agent': 'AI-Threat-Tracker/1.0' }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    )
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json() as { vulnerabilities: Record<string, string>[] }
    const vulns = data.vulnerabilities ?? []

    const entries: ThreatEntry[] = []
    for (const v of vulns) {
      const fields = [v.vendorProject, v.product, v.shortDescription, v.notes].join(' ')
      if (!AI_KEYWORDS.some(kw => fields.toLowerCase().includes(kw))) continue

      const cveId = v.cveID ?? ''
      const dateStr = v.dateAdded ?? ''
      const published = dateStr ? dateStr + 'T00:00:00Z' : new Date().toISOString()
      const severity: ThreatSeverity = v.knownRansomwareCampaignUse === 'Known' ? 'critical' : 'high'

      const tags = ['cve', 'exploited']
      for (const kw of ['tensorflow', 'pytorch', 'cuda', 'nvidia', 'llm', 'gpt']) {
        if (fields.toLowerCase().includes(kw)) tags.push(kw)
      }

      entries.push({
        id: `cisa-${cveId}`,
        source: 'CISA KEV',
        title: `${v.vendorProject ?? 'Unknown'} ${v.product ?? ''} — ${cveId}`,
        description: v.shortDescription ?? 'No description available.',
        vulnerability_summary: `Affects ${v.vendorProject} ${v.product}. Required action: ${v.requiredAction ?? 'See advisory.'}`,
        published,
        link: `https://nvd.nist.gov/vuln/detail/${cveId}`,
        severity,
        tags: [...new Set(tags)],
      })
    }

    entries.sort((a, b) => b.published.localeCompare(a.published))
    return [entries, { ok: true, type: 'live', count: entries.length, error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}

// ── AI Incident Database (RSS) ─────────────────────────────────────────────────

function parseRSSItems(xml: string) {
  const items: Array<{ title: string; link: string; description: string; pubDate: string }> = []
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  for (const match of itemMatches) {
    const content = match[1]
    const extract = (tag: string) => {
      const m = content.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
      return (m?.[1] ?? m?.[2] ?? '').trim()
    }
    items.push({
      title: extract('title'),
      link: extract('link'),
      description: extract('description'),
      pubDate: extract('pubDate'),
    })
  }
  return items
}

async function fetchAIID(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const resp = await fetch('https://incidentdatabase.ai/rss.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Threat-Tracker/1.0)' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const xml = await resp.text()
    const items = parseRSSItems(xml)

    const seen = new Map<string, ThreatEntry>()
    for (const item of items) {
      if (!item.title || item.title === 'No title') continue
      const citeMatch = (item.description + item.link).match(/\/cite\/(\d+)/)
      const key = citeMatch?.[1] ?? item.title
      if (seen.has(key)) continue

      let published = new Date().toISOString()
      try {
        published = new Date(item.pubDate).toISOString()
      } catch { /* ignore */ }

      const cleanDesc = item.description
        .replace(/\s*\(report_number:\s*\d+\)\s*$/, '')
        .replace(/\s*\(https:\/\/incidentdatabase\.ai\/\S+\)\s*$/, '')
        .trim()
        .slice(0, 500)

      const incidentUrl = citeMatch
        ? `https://incidentdatabase.ai/cite/${citeMatch[1]}`
        : item.link || 'https://incidentdatabase.ai'

      seen.set(key, {
        id: `aiid-${key}`,
        source: 'AI Incident Database',
        title: item.title,
        description: cleanDesc || 'AI system incident.',
        vulnerability_summary: 'Real-world AI system harm incident documented in the AI Incident Database.',
        published,
        link: incidentUrl,
        severity: 'medium',
        tags: ['ai-incident', 'aiid'],
      })
    }

    const entries = [...seen.values()].slice(0, 50)
    return [entries, { ok: true, type: 'live', count: entries.length, error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}

// ── MITRE ATLAS ────────────────────────────────────────────────────────────────

async function fetchMitreAtlas(): Promise<[ThreatEntry[], SourceStatus]> {
  const cacheFile = getAtlasCacheFile()

  if (fs.existsSync(cacheFile)) {
    const stat = fs.statSync(cacheFile)
    const ageDays = (Date.now() - stat.mtimeMs) / 86400000
    if (ageDays < ATLAS_CACHE_TTL_DAYS) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
        return [cached.entries, { ok: true, type: 'live', count: cached.entries.length, error: null }]
      } catch { /* fall through */ }
    }
  }

  try {
    const resp = await fetch(
      'https://raw.githubusercontent.com/mitre-atlas/atlas-data/main/dist/ATLAS.yaml',
      { headers: { 'User-Agent': 'AI-Threat-Tracker/1.0' }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    )
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const text = await resp.text()
    const atlasData = yaml.load(text) as Record<string, unknown>

    const entries: ThreatEntry[] = []
    const matrices = (atlasData?.matrices as Record<string, unknown>[] | undefined) ?? []
    for (const matrix of matrices) {
      for (const tech of (matrix.techniques as Record<string, unknown>[]) ?? []) {
        const id = String(tech.id ?? '')
        const tactics = (tech.tactics as string[] | undefined) ?? []
        entries.push({
          id: `atlas-${id}`,
          source: 'MITRE ATLAS',
          title: `[${id}] ${String(tech.name ?? 'Unknown Technique')}`,
          description: String(tech.description ?? '').slice(0, 500),
          vulnerability_summary: `Adversarial AI/ML attack technique from MITRE ATLAS v${atlasData.version ?? ''}. Tactics: ${tactics.slice(0, 3).join(', ') || 'N/A'}.`,
          published: `${String(tech.created_date ?? new Date().toISOString().split('T')[0])}T00:00:00Z`,
          link: `https://atlas.mitre.org/techniques/${id}`,
          severity: 'high',
          tags: ['mitre', 'atlas', 'ai-attack'],
        })
      }
    }

    const dir = path.dirname(cacheFile)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(cacheFile, JSON.stringify({ entries, timestamp: new Date().toISOString() }))
    return [entries, { ok: true, type: 'live', count: entries.length, error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}

// ── FireTail AI Breaches ───────────────────────────────────────────────────────

async function fetchFireTail(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const resp = await fetch('https://firetail.io/ai-breach-tracker', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Threat-Tracker/1.0)' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const html = await resp.text()

    // Extract JSON-LD or script data if present
    const scriptMatch = html.match(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/)
    if (scriptMatch) {
      try {
        const data = JSON.parse(scriptMatch[1])
        const items = data?.pageProps?.breaches ?? data?.pageProps?.incidents ?? data?.pageProps?.data ?? []
        if (items.length >= 3) {
          const entries: ThreatEntry[] = items.slice(0, 50).map((b: Record<string, string>, i: number) => ({
            id: `firetail-${i}`,
            source: 'FireTail AI Breaches',
            title: b.title ?? b.name ?? b.company ?? `Breach #${i + 1}`,
            description: String(b.description ?? b.summary ?? 'AI breach incident.').slice(0, 400),
            vulnerability_summary: 'AI system breach tracked by FireTail.',
            published: (() => { try { return new Date(b.date ?? b.published ?? '').toISOString() } catch { return new Date().toISOString() } })(),
            link: b.url ?? b.link ?? 'https://firetail.io/ai-breach-tracker',
            severity: 'high' as ThreatSeverity,
            tags: ['ai-breach', 'firetail'],
          }))
          return [entries, { ok: true, type: 'live', count: entries.length, error: null }]
        }
      } catch { /* fall through */ }
    }

    return [[], { ok: false, type: 'live', count: 0, error: 'Site appears JS-rendered; data unavailable.' }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}
