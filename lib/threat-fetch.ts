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

type GithubLabel = { name: string }
type GithubIssue = {
  number: number
  title: string
  body: string | null
  html_url: string
  created_at: string
  labels: GithubLabel[]
  user: { login: string }
  repository_url: string
}

type OsvVuln = {
  id: string
  summary?: string
  details?: string
  published?: string
  modified?: string
  references?: Array<{ type: string; url: string }>
  severity?: Array<{ type: string; score: string }>
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CACHE_TTL = process.env.NODE_ENV === 'development' ? 300 : 3600 // 5min dev / 1hr prod
const ATLAS_CACHE_TTL_DAYS = 7
const FETCH_TIMEOUT_MS = 30000

// Monitored AI/ML OSS repos for security issue reporting
const GITHUB_AI_REPOS = [
  'huggingface/transformers',
  'openai/openai-python',
  'langchain-ai/langchain',
  'ollama/ollama',
  'BerriAI/litellm',
  'run-llama/llama_index',
  'anthropics/anthropic-sdk-python',
]

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

const THN_AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'chatgpt',
  'openai', 'anthropic', 'gemini', 'copilot', 'deepfake', 'supply chain',
  'pypi', 'npm package', 'malicious package', 'python package', 'dependency',
]

const SNYK_KEYWORDS = [
  'supply chain', 'malicious package', 'pypi', 'npm', 'dependency', 'open source',
  'ai', 'ml ', 'llm', 'machine learning', 'typosquat', 'backdoor',
]

// PyPI packages to query for PyPA advisories
const PYPI_AI_PACKAGES = [
  'transformers', 'torch', 'tensorflow', 'langchain', 'langchain-core',
  'langchain-community', 'openai', 'anthropic', 'litellm', 'llama-index',
  'llama-index-core', 'huggingface-hub', 'diffusers', 'accelerate', 'peft',
  'ollama', 'gradio', 'streamlit',
]

// Cross-ecosystem packages to query for the broader OSV source
const OSV_AI_PACKAGES: Array<{ name: string; ecosystem: string }> = [
  { name: 'openai',                  ecosystem: 'npm' },
  { name: 'langchain',               ecosystem: 'npm' },
  { name: '@anthropic-ai/sdk',       ecosystem: 'npm' },
  { name: 'ollama',                  ecosystem: 'npm' },
  { name: '@huggingface/inference',  ecosystem: 'npm' },
  { name: 'mlflow',                  ecosystem: 'PyPI' },
  { name: 'ray',                     ecosystem: 'PyPI' },
  { name: 'fastapi',                 ecosystem: 'PyPI' },
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
  fs.renameSync(tmp, file) // atomic on POSIX
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
  const stale = loadStaleCache()

  if (stale) {
    // Always serve existing data immediately; refresh in background if expired
    const age = (Date.now() - new Date(stale.timestamp).getTime()) / 1000
    if (age > CACHE_TTL && !_isFetching) {
      _isFetching = true
      runFetch()
        .then(({ grouped, sources_status }) => saveCache(grouped, sources_status))
        .catch(e => console.error('[threats] Fetch error:', e))
        .finally(() => { _isFetching = false })
    }
    return { ...stale, generating: _isFetching }
  }

  // No cache at all — trigger fetch and serve static sources while waiting
  if (!_isFetching) {
    _isFetching = true
    runFetch()
      .then(({ grouped, sources_status }) => saveCache(grouped, sources_status))
      .catch(e => console.error('[threats] Fetch error:', e))
      .finally(() => { _isFetching = false })
  }

  const { grouped: staticGrouped, sources_status: staticStatus } = loadStaticSources()
  const pendingStatus: Record<string, SourceStatus> = {
    'CISA KEV':              { ok: false, type: 'live', count: 0, error: null },
    'AI Incident Database':  { ok: false, type: 'live', count: 0, error: null },
    'MITRE ATLAS':           { ok: false, type: 'live', count: 0, error: null },
    'GitHub Issues':         { ok: false, type: 'live', count: 0, error: null },
    'The Hacker News':       { ok: false, type: 'live', count: 0, error: null },
    'CISA Advisories':       { ok: false, type: 'live', count: 0, error: null },
    'PyPA Advisories':       { ok: false, type: 'live', count: 0, error: null },
    'Snyk':                  { ok: false, type: 'live', count: 0, error: null },
    'Datadog Security Labs': { ok: false, type: 'live', count: 0, error: null },
    'Socket.dev':            { ok: false, type: 'live', count: 0, error: null },
    'OSV':                   { ok: false, type: 'live', count: 0, error: null },
  }
  return {
    timestamp: new Date().toISOString(),
    grouped: staticGrouped,
    sources_status: { ...pendingStatus, ...staticStatus },
    generating: true,
  }
}

// ── Fetch orchestrator ─────────────────────────────────────────────────────────

async function runFetch(): Promise<{ grouped: Record<string, ThreatEntry[]>; sources_status: Record<string, SourceStatus> }> {
  const results = await Promise.allSettled([
    fetchCisaKev(),             // 0 — Threat Intel
    fetchAIID(),                // 1 — Threat Intel
    fetchMitreAtlas(),          // 2 — Threat Intel
    fetchGithubIssues(),        // 3 — Threat Intel
    fetchHackerNews(),          // 4 — News & Advisories
    fetchCisaAdvisories(),      // 5 — News & Advisories
    fetchPyPAAdvisories(),      // 6 — News & Advisories
    fetchSnyk(),                // 7 — Supply Chain
    fetchDatadogSecurityLabs(), // 8 — Supply Chain
    fetchSocketDev(),           // 9 — Supply Chain
    fetchOSV(),                 // 10 — Supply Chain
  ])

  const sources = [
    'CISA KEV', 'AI Incident Database', 'MITRE ATLAS', 'GitHub Issues',
    'The Hacker News', 'CISA Advisories', 'PyPA Advisories',
    'Snyk', 'Datadog Security Labs', 'Socket.dev', 'OSV',
  ]
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

  // Merge static curated sources
  const { grouped: staticGrouped, sources_status: staticStatus } = loadStaticSources()
  Object.assign(grouped, staticGrouped)
  Object.assign(sources_status, staticStatus)

  return { grouped, sources_status }
}

// ── XML parsers ────────────────────────────────────────────────────────────────

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

function parseAtomEntries(xml: string) {
  const items: Array<{ title: string; link: string; description: string; pubDate: string }> = []
  const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)
  for (const match of entryMatches) {
    const content = match[1]
    const extractText = (tag: string) => {
      const m = content.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`))
      return (m?.[1] ?? '').trim()
    }
    const linkMatch = content.match(/<link[^>]*href="([^"]*)"/)
    items.push({
      title: extractText('title'),
      link: linkMatch?.[1] ?? extractText('link'),
      description: extractText('summary') || extractText('content'),
      pubDate: extractText('updated') || extractText('published'),
    })
  }
  return items
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugFromUrl(url: string): string {
  return (url.split('/').filter(Boolean).pop() ?? Date.now().toString(36)).slice(0, 24)
}

function osvSeverity(vuln: OsvVuln): ThreatSeverity {
  const raw = vuln.severity?.find(s => s.type === 'CVSS_V3')?.score ?? ''
  if (!raw) return 'medium'
  const score = parseFloat(raw)
  if (score >= 9.0) return 'critical'
  if (score >= 7.0) return 'high'
  if (score < 4.0) return 'low'
  return 'medium'
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
      try { published = new Date(item.pubDate).toISOString() } catch { /* ignore */ }

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

// ── GitHub Issues ──────────────────────────────────────────────────────────────

async function fetchGithubIssues(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const token = process.env.GITHUB_TOKEN
    const headers: Record<string, string> = {
      'User-Agent': 'AI-Threat-Tracker/1.0',
      'Accept': 'application/vnd.github.v3+json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const repos = GITHUB_AI_REPOS.map(r => `repo:${r}`).join(' ')
    const q = encodeURIComponent(`is:issue label:security ${repos} created:>=${since}`)
    const url = `https://api.github.com/search/issues?q=${q}&sort=created&order=desc&per_page=30`

    const resp = await fetch(url, { headers, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!resp.ok) {
      const msg = resp.status === 403
        ? 'GitHub rate limit exceeded — set GITHUB_TOKEN env var for higher limits'
        : `HTTP ${resp.status}`
      throw new Error(msg)
    }
    const data = await resp.json() as { items: GithubIssue[] }

    const entries: ThreatEntry[] = (data.items ?? []).map(issue => {
      const labelNames = issue.labels.map(l => l.name.toLowerCase())
      let severity: ThreatSeverity = 'high'
      if (labelNames.some(l => l.includes('critical'))) severity = 'critical'
      else if (labelNames.some(l => l.includes('medium'))) severity = 'medium'
      else if (labelNames.some(l => l.includes('low'))) severity = 'low'

      const repoName = issue.repository_url.split('/').slice(-2).join('/')
      const titleLow = issue.title.toLowerCase()
      const tags = ['github-issues', 'oss-security']
      if (titleLow.includes('injection')) tags.push('prompt-injection')
      if (titleLow.match(/\brce\b|remote code/)) tags.push('exploited')
      if (titleLow.includes('supply chain')) tags.push('supply-chain')
      if (titleLow.includes('cve') || (issue.body ?? '').includes('CVE-')) tags.push('cve')
      if (titleLow.match(/\bllm\b|langchain|openai|anthropic/)) tags.push('llm')

      const cleanBody = (issue.body ?? '')
        .replace(/#{1,6}\s+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/```[\s\S]*?```/g, '').replace(/\s+/g, ' ').trim().slice(0, 500)

      return {
        id: `github-${repoName.replace('/', '-')}-${issue.number}`,
        source: 'GitHub Issues',
        title: `[${repoName}] ${issue.title}`,
        description: cleanBody || `Security issue reported in ${repoName}.`,
        vulnerability_summary: `Open-source AI security issue in ${repoName} (Issue #${issue.number}, opened by ${issue.user.login}).`,
        published: issue.created_at,
        link: issue.html_url,
        severity,
        tags: [...new Set(tags)],
      }
    })

    return [entries, { ok: true, type: 'live', count: entries.length, error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}

// ── The Hacker News ────────────────────────────────────────────────────────────

async function fetchHackerNews(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const resp = await fetch('https://feeds.feedburner.com/TheHackersNews', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Threat-Tracker/1.0)' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const xml = await resp.text()
    const items = parseRSSItems(xml)

    const entries: ThreatEntry[] = []
    for (const item of items.slice(0, 60)) {
      const content = (item.title + ' ' + item.description).toLowerCase()
      if (!THN_AI_KEYWORDS.some(kw => content.includes(kw))) continue

      let published = new Date().toISOString()
      try { published = new Date(item.pubDate).toISOString() } catch { /* ignore */ }

      const tags = ['threat-news', 'hacker-news']
      if (content.includes('supply chain') || content.includes('pypi') || content.includes('npm')) tags.push('supply-chain')
      if (content.includes('llm') || content.includes('chatgpt') || content.includes('openai')) tags.push('llm')
      if (content.includes('deepfake')) tags.push('deepfake')
      if (content.includes('cve-')) tags.push('cve')
      if (content.includes('phishing')) tags.push('phishing')

      entries.push({
        id: `thn-${slugFromUrl(item.link)}`,
        source: 'The Hacker News',
        title: item.title,
        description: cleanHtml(item.description).slice(0, 500) || 'AI and cybersecurity news coverage.',
        vulnerability_summary: 'AI and cybersecurity news from The Hacker News.',
        published,
        link: item.link || 'https://thehackernews.com',
        severity: 'medium',
        tags: [...new Set(tags)],
      })
    }

    return [entries, { ok: true, type: 'live', count: entries.length, error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}

// ── CISA Advisories ────────────────────────────────────────────────────────────

async function fetchCisaAdvisories(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const resp = await fetch('https://www.cisa.gov/cybersecurity-advisories/all.xml', {
      headers: { 'User-Agent': 'AI-Threat-Tracker/1.0' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const xml = await resp.text()

    // CISA advisory feed is Atom format
    const items = parseAtomEntries(xml).slice(0, 30)

    const entries: ThreatEntry[] = items
      .filter(item => item.title && item.link)
      .map(item => {
        let published = new Date().toISOString()
        try { published = new Date(item.pubDate).toISOString() } catch { /* ignore */ }

        const content = (item.title + ' ' + item.description).toLowerCase()
        const tags = ['cisa-advisory', 'advisory', 'ics']
        if (content.includes('ai') || content.includes('machine learning')) tags.push('llm')
        if (content.includes('cve-')) tags.push('cve')
        if (content.includes('critical infrastructure')) tags.push('critical-infrastructure')

        return {
          id: `cisa-adv-${slugFromUrl(item.link)}`,
          source: 'CISA Advisories',
          title: item.title,
          description: cleanHtml(item.description).slice(0, 500) || 'CISA cybersecurity advisory.',
          vulnerability_summary: 'Official US government cybersecurity advisory from CISA.',
          published,
          link: item.link,
          severity: 'high' as ThreatSeverity,
          tags: [...new Set(tags)],
        }
      })

    return [entries, { ok: true, type: 'live', count: entries.length, error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}

// ── PyPA Security Advisories (via OSV.dev, PyPI ecosystem) ────────────────────

async function fetchPyPAAdvisories(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const queries = PYPI_AI_PACKAGES.map(name => ({ package: { name, ecosystem: 'PyPI' } }))

    const resp = await fetch('https://api.osv.dev/v1/querybatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'AI-Threat-Tracker/1.0' },
      body: JSON.stringify({ queries }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!resp.ok) throw new Error(`OSV API HTTP ${resp.status}`)
    const data = await resp.json() as { results: Array<{ vulns?: OsvVuln[] }> }

    const seen = new Set<string>()
    const entries: ThreatEntry[] = []

    for (let i = 0; i < data.results.length; i++) {
      const pkg = PYPI_AI_PACKAGES[i]
      for (const vuln of data.results[i]?.vulns ?? []) {
        if (seen.has(vuln.id)) continue
        seen.add(vuln.id)

        const published = vuln.published ?? vuln.modified ?? new Date().toISOString()
        const severity = osvSeverity(vuln)
        const advisoryUrl = vuln.references?.find(r => r.type === 'ADVISORY')?.url
          ?? vuln.references?.[0]?.url ?? `https://osv.dev/vulnerability/${vuln.id}`

        const tags = ['pypi', 'python-security', 'advisory', 'supply-chain']
        if (vuln.id.startsWith('PYSEC-')) tags.push('pypa')

        entries.push({
          id: `pypa-${vuln.id}`,
          source: 'PyPA Advisories',
          title: vuln.summary ?? `${pkg} — ${vuln.id}`,
          description: (vuln.details ?? vuln.summary ?? 'Python AI package security advisory.').slice(0, 500),
          vulnerability_summary: `PyPI package vulnerability in \`${pkg}\`. Advisory ID: ${vuln.id}`,
          published,
          link: advisoryUrl,
          severity,
          tags: [...new Set(tags)],
        })
      }
    }

    entries.sort((a, b) => b.published.localeCompare(a.published))
    return [entries.slice(0, 30), { ok: true, type: 'live', count: Math.min(entries.length, 30), error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}

// ── Snyk ──────────────────────────────────────────────────────────────────────

async function fetchSnyk(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const resp = await fetch('https://snyk.io/blog/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Threat-Tracker/1.0)' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const xml = await resp.text()
    const items = parseRSSItems(xml)

    const entries: ThreatEntry[] = []
    for (const item of items.slice(0, 50)) {
      const content = (item.title + ' ' + item.description).toLowerCase()
      if (!SNYK_KEYWORDS.some(kw => content.includes(kw))) continue

      let published = new Date().toISOString()
      try { published = new Date(item.pubDate).toISOString() } catch { /* ignore */ }

      const tags = ['snyk', 'supply-chain', 'oss-security']
      if (content.includes('pypi') || content.includes('python')) tags.push('pypi')
      if (content.includes('npm') || content.includes('node')) tags.push('npm')
      if (content.includes('malicious') || content.includes('backdoor')) tags.push('malicious-package')
      if (content.includes('typosquat')) tags.push('typosquatting')

      entries.push({
        id: `snyk-${slugFromUrl(item.link)}`,
        source: 'Snyk',
        title: item.title,
        description: cleanHtml(item.description).slice(0, 500) || 'Supply chain security research from Snyk.',
        vulnerability_summary: 'Open source and supply chain vulnerability research from Snyk Security.',
        published,
        link: item.link || 'https://snyk.io/blog',
        severity: 'medium',
        tags: [...new Set(tags)],
      })
    }

    return [entries, { ok: true, type: 'live', count: entries.length, error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}

// ── Datadog Security Labs ──────────────────────────────────────────────────────

async function fetchDatadogSecurityLabs(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const resp = await fetch('https://securitylabs.datadoghq.com/articles/feed.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Threat-Tracker/1.0)' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const xml = await resp.text()

    // Try RSS first, fall back to Atom
    const rssItems = parseRSSItems(xml)
    const items = (rssItems.length > 0 ? rssItems : parseAtomEntries(xml)).slice(0, 20)

    const entries: ThreatEntry[] = items
      .filter(item => item.title && item.link)
      .map(item => {
        let published = new Date().toISOString()
        try { published = new Date(item.pubDate).toISOString() } catch { /* ignore */ }

        const content = (item.title + ' ' + item.description).toLowerCase()
        const tags = ['datadog', 'security-research', 'supply-chain']
        if (content.includes('pypi') || content.includes('npm')) tags.push('oss-security')
        if (content.includes('malware') || content.includes('malicious')) tags.push('malicious-package')
        if (content.includes('ai') || content.includes('llm')) tags.push('llm')

        return {
          id: `ddsl-${slugFromUrl(item.link)}`,
          source: 'Datadog Security Labs',
          title: item.title,
          description: cleanHtml(item.description).slice(0, 500) || 'Security research from Datadog Security Labs.',
          vulnerability_summary: 'Cloud and supply chain security research from Datadog Security Labs.',
          published,
          link: item.link,
          severity: 'medium' as ThreatSeverity,
          tags: [...new Set(tags)],
        }
      })

    return [entries, { ok: true, type: 'live', count: entries.length, error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}

// ── Socket.dev ────────────────────────────────────────────────────────────────

async function fetchSocketDev(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const resp = await fetch('https://socket.dev/blog/rss', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Threat-Tracker/1.0)' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const xml = await resp.text()
    const items = parseRSSItems(xml).slice(0, 20)

    const entries: ThreatEntry[] = items
      .filter(item => item.title && item.link)
      .map(item => {
        let published = new Date().toISOString()
        try { published = new Date(item.pubDate).toISOString() } catch { /* ignore */ }

        const content = (item.title + ' ' + item.description).toLowerCase()
        const tags = ['socket-dev', 'supply-chain', 'oss-security']
        if (content.includes('pypi') || content.includes('python')) tags.push('pypi')
        if (content.includes('npm') || content.includes('node')) tags.push('npm')
        if (content.includes('malicious') || content.includes('backdoor')) tags.push('malicious-package')
        if (content.includes('typosquat')) tags.push('typosquatting')

        return {
          id: `socket-${slugFromUrl(item.link)}`,
          source: 'Socket.dev',
          title: item.title,
          description: cleanHtml(item.description).slice(0, 500) || 'Open source supply chain security from Socket.',
          vulnerability_summary: 'npm/PyPI supply chain security analysis from Socket.',
          published,
          link: item.link,
          severity: 'medium' as ThreatSeverity,
          tags: [...new Set(tags)],
        }
      })

    return [entries, { ok: true, type: 'live', count: entries.length, error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}

// ── OSV (Open Source Vulnerabilities — broader ecosystem) ─────────────────────

async function fetchOSV(): Promise<[ThreatEntry[], SourceStatus]> {
  try {
    const queries = OSV_AI_PACKAGES.map(pkg => ({ package: { name: pkg.name, ecosystem: pkg.ecosystem } }))

    const resp = await fetch('https://api.osv.dev/v1/querybatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'AI-Threat-Tracker/1.0' },
      body: JSON.stringify({ queries }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!resp.ok) throw new Error(`OSV API HTTP ${resp.status}`)
    const data = await resp.json() as { results: Array<{ vulns?: OsvVuln[] }> }

    const seen = new Set<string>()
    const entries: ThreatEntry[] = []

    for (let i = 0; i < data.results.length; i++) {
      const pkg = OSV_AI_PACKAGES[i]
      for (const vuln of data.results[i]?.vulns ?? []) {
        if (seen.has(vuln.id)) continue
        seen.add(vuln.id)

        const published = vuln.published ?? vuln.modified ?? new Date().toISOString()
        const severity = osvSeverity(vuln)
        const advisoryUrl = vuln.references?.find(r => r.type === 'ADVISORY')?.url
          ?? vuln.references?.[0]?.url ?? `https://osv.dev/vulnerability/${vuln.id}`

        const tags = ['osv', 'open-source', 'advisory', 'supply-chain', pkg.ecosystem.toLowerCase()]

        entries.push({
          id: `osv-${vuln.id}`,
          source: 'OSV',
          title: vuln.summary ?? `${pkg.name} — ${vuln.id}`,
          description: (vuln.details ?? vuln.summary ?? `Open source vulnerability in ${pkg.name}.`).slice(0, 500),
          vulnerability_summary: `${pkg.ecosystem} package vulnerability in \`${pkg.name}\`. Advisory ID: ${vuln.id}`,
          published,
          link: advisoryUrl,
          severity,
          tags: [...new Set(tags)],
        })
      }
    }

    entries.sort((a, b) => b.published.localeCompare(a.published))
    return [entries.slice(0, 30), { ok: true, type: 'live', count: Math.min(entries.length, 30), error: null }]
  } catch (e) {
    return [[], { ok: false, type: 'live', count: 0, error: String(e) }]
  }
}
