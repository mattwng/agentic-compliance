'use client'
import { useState, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  RefreshCw, ExternalLink, AlertCircle, ShieldAlert,
  Shield, Newspaper, Package,
} from 'lucide-react'
import type { ThreatCache, ThreatEntry, ThreatSeverity, SourceStatus } from '@/lib/threat-fetch'
import { EVIDENCE } from '@/lib/evidence-data'
import { DOMAIN_THREAT_TAGS, buildGappedDomains, getRelevantThreats } from '@/lib/threat-alerts'

// ── Section source sets ────────────────────────────────────────────────────────

const THREAT_INTEL_SOURCES = new Set([
  'CISA KEV', 'AI Incident Database', 'MITRE ATLAS', 'GitHub Issues',
  'ENISA Threat Landscape', 'IBM X-Force Index', 'Google / Mandiant',
  'Verizon DBIR', 'MIT AI Incident Tracker',
])

const NEWS_SOURCES = new Set([
  'The Hacker News', 'CISA Advisories', 'PyPA Advisories',
])

const SUPPLY_CHAIN_SOURCES = new Set([
  'Snyk', 'Datadog Security Labs', 'Socket.dev', 'OSV',
])

// ── Severity helpers ───────────────────────────────────────────────────────────

const SEV_CONFIG: Record<ThreatSeverity, { label: string; dot: string; badge: string; filter: string }> = {
  critical: { label: 'Critical', dot: '#f43f5e', badge: 'bg-rose-900/30 text-rose-400 border-rose-800',       filter: 'bg-rose-900/20 text-rose-400 border-rose-800' },
  high:     { label: 'High',     dot: '#f97316', badge: 'bg-orange-900/30 text-orange-400 border-orange-800',  filter: 'bg-orange-900/20 text-orange-400 border-orange-800' },
  medium:   { label: 'Medium',   dot: '#eab308', badge: 'bg-amber-900/30 text-amber-400 border-amber-800',     filter: 'bg-amber-900/20 text-amber-400 border-amber-800' },
  low:      { label: 'Low',      dot: '#22c55e', badge: 'bg-green-900/30 text-green-400 border-green-800',     filter: 'bg-green-900/20 text-green-400 border-green-800' },
  info:     { label: 'Info',     dot: '#94a3b8', badge: 'bg-slate-800 text-slate-400 border-slate-700',        filter: 'bg-slate-800 text-slate-400 border-slate-700' },
}

const SEV_ORDER: ThreatSeverity[] = ['critical', 'high', 'medium', 'low', 'info']

type AssessmentSummary = {
  id: string
  name: string
  systemName: string
  responses: Array<{ evidenceId: string; status: string }>
}

function formatAge(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  return mo < 12 ? `${mo}mo ago` : `${Math.floor(mo / 12)}y ago`
}

function formatDate(isoDate: string): string {
  try { return new Date(isoDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return isoDate }
}

function formatTimestamp(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
  } catch { return isoDate }
}

// ── Source status pill ─────────────────────────────────────────────────────────

function SourcePill({ source, status }: { source: string; status: SourceStatus }) {
  const isLive = status.type === 'live'
  const isFetching = isLive && !status.ok && status.error === null
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border font-mono ${
        isFetching
          ? 'bg-indigo-900/10 border-indigo-900/30 text-indigo-400'
          : status.ok && isLive
          ? 'bg-green-900/10 border-green-900/30 text-green-500'
          : status.ok && !isLive
          ? 'bg-slate-800/60 border-slate-700 text-slate-500'
          : 'bg-red-900/10 border-red-900/20 text-red-500/70'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${isLive ? 'animate-pulse' : ''}`} />
      {source}
      {isFetching ? ' (updating…)' : ` (${status.count})`}
      {isLive && <span className="ml-1 opacity-40 text-[10px]">live</span>}
    </span>
  )
}

// ── Threat Card ────────────────────────────────────────────────────────────────

function ThreatCard({ threat, relevant }: { threat: ThreatEntry; relevant?: boolean }) {
  const sev = SEV_CONFIG[threat.severity] ?? SEV_CONFIG.info
  return (
    <Card className={`bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors ${relevant ? 'ring-1 ring-amber-700/50' : ''}`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: sev.dot }} />
            <a
              href={threat.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-100 hover:text-indigo-300 leading-snug line-clamp-2 transition-colors"
            >
              {threat.title}
            </a>
          </div>
          <a href={threat.link} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-0.5">
            <ExternalLink className="h-3.5 w-3.5 text-slate-600 hover:text-slate-400 transition-colors" />
          </a>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs border px-2 py-0 ${sev.badge}`}>{sev.label}</Badge>
          {relevant && (
            <Badge className="text-xs border px-2 py-0 bg-amber-900/30 text-amber-300 border-amber-700 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Relevant to gaps
            </Badge>
          )}
          <span className="text-xs text-slate-500 font-medium">{threat.source}</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-600" title={formatDate(threat.published)}>{formatAge(threat.published)}</span>
        </div>

        {threat.description && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{threat.description}</p>
        )}

        {threat.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {threat.tags.slice(0, 5).map(tag => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Section Component ──────────────────────────────────────────────────────────

function ThreatSection({
  title,
  description,
  icon,
  accentColor,
  threats,
  sourcesStatus,
  sectionSources,
  isRelevant,
  generating,
}: {
  title: string
  description: string
  icon: React.ReactNode
  accentColor: string
  threats: ThreatEntry[]
  sourcesStatus: Record<string, SourceStatus>
  sectionSources: Set<string>
  isRelevant: (t: ThreatEntry) => boolean
  generating: boolean
}) {
  const sectionStatus = Object.entries(sourcesStatus).filter(([src]) => sectionSources.has(src))
  const anyFetching = generating && sectionStatus.some(([, s]) => s.type === 'live' && !s.ok)

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className={`flex items-start gap-3 pb-3 border-b border-slate-800`}>
        <div className={`mt-0.5 ${accentColor}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              {threats.length} {threats.length === 1 ? 'result' : 'results'}
            </span>
            {anyFetching && (
              <span className="text-xs text-indigo-400 flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" /> updating…
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>

      {/* Per-section source pills */}
      {sectionStatus.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sectionStatus.map(([source, status]) => (
            <SourcePill key={source} source={source} status={status} />
          ))}
        </div>
      )}

      {/* Content */}
      {threats.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex items-center justify-center py-10">
            <p className="text-slate-500 text-sm">No results match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {threats.map(t => <ThreatCard key={t.id} threat={t} relevant={isRelevant(t)} />)}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ThreatsPage() {
  const qc = useQueryClient()
  const [sevFilter, setSevFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [assessmentFilter, setAssessmentFilter] = useState<string>('')
  const [relevantOnly, setRelevantOnly] = useState(false)

  const { data, isLoading } = useQuery<ThreatCache>({
    queryKey: ['threats'],
    queryFn: () => fetch('/api/threats').then(r => r.json()),
    refetchInterval: (query) => (query.state.data?.generating ? 5000 : 3600000),
  })

  const { data: assessments } = useQuery<AssessmentSummary[]>({
    queryKey: ['assessments'],
    queryFn: () => fetch('/api/assessments').then(r => r.json()),
  })

  const allThreats = useMemo<ThreatEntry[]>(() => {
    if (!data?.grouped) return []
    return Object.values(data.grouped).flat()
  }, [data])

  const gappedDomains = useMemo(() => {
    if (!assessmentFilter || !assessments) return new Set<string>()
    const assessment = assessments.find(a => a.id === assessmentFilter)
    if (!assessment) return new Set<string>()
    return buildGappedDomains(assessment.responses)
  }, [assessmentFilter, assessments])

  const isRelevantToGaps = useCallback((threat: ThreatEntry): boolean => {
    return getRelevantThreats([threat], gappedDomains).length > 0
  }, [gappedDomains])

  // Apply global filters
  const filtered = useMemo(() => {
    return allThreats.filter(t => {
      if (sevFilter !== 'all' && t.severity !== sevFilter) return false
      if (sourceFilter && t.source !== sourceFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q) && !t.tags.join(' ').includes(q)) return false
      }
      if (relevantOnly && !isRelevantToGaps(t)) return false
      return true
    })
  }, [allThreats, sevFilter, sourceFilter, search, relevantOnly, isRelevantToGaps])

  // Per-section filtered subsets
  const threatIntelThreats   = useMemo(() => filtered.filter(t => THREAT_INTEL_SOURCES.has(t.source)), [filtered])
  const newsThreats          = useMemo(() => filtered.filter(t => NEWS_SOURCES.has(t.source)), [filtered])
  const supplyChainThreats   = useMemo(() => filtered.filter(t => SUPPLY_CHAIN_SOURCES.has(t.source)), [filtered])

  const sevCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of allThreats) counts[t.severity] = (counts[t.severity] ?? 0) + 1
    return counts
  }, [allThreats])

  const relevantCount = useMemo(() => allThreats.filter(isRelevantToGaps).length, [allThreats, isRelevantToGaps])

  const sources = useMemo(() => Object.keys(data?.grouped ?? {}), [data])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetch('/api/threats/refresh', { method: 'POST' })
    qc.invalidateQueries({ queryKey: ['threats'] })
    setRefreshing(false)
  }

  const sourcesStatus = data?.sources_status ?? {}
  const generating = data?.generating ?? false

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-100">Threat Intelligence</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-900/30 border border-green-800 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-slate-400 mt-1">
            AI threat intel · news &amp; advisories · supply chain security — across 15 live and curated sources
          </p>
        </div>
        <div className="flex items-center gap-3">
          {generating ? (
            <span className="text-xs text-indigo-400 flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 animate-spin" /> Updating live feeds…
            </span>
          ) : data?.timestamp ? (
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              Synced {formatTimestamp(data.timestamp)} · auto-refreshing
            </span>
          ) : null}
          <Button
            onClick={handleRefresh}
            disabled={refreshing || generating}
            variant="outline"
            className="border-slate-700 text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Severity chips */}
      {!isLoading && allThreats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSevFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              sevFilter === 'all'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
            }`}
          >
            All ({allThreats.length})
          </button>
          {SEV_ORDER.filter(s => sevCounts[s]).map(s => {
            const cfg = SEV_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => setSevFilter(sevFilter === s ? 'all' : s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  sevFilter === s ? cfg.filter + ' ring-1 ring-current' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                {cfg.label} ({sevCounts[s]})
              </button>
            )
          })}
        </div>
      )}

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300"
        >
          <option value="">All Sources</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search threats…"
          className="bg-slate-800 border-slate-700 w-full sm:max-w-xs text-sm"
        />
        <select
          value={assessmentFilter}
          onChange={e => { setAssessmentFilter(e.target.value); setRelevantOnly(false) }}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300"
        >
          <option value="">No assessment context</option>
          {(assessments ?? []).map(a => (
            <option key={a.id} value={a.id}>{a.systemName} — {a.name}</option>
          ))}
        </select>
        {assessmentFilter && relevantCount > 0 && (
          <button
            onClick={() => setRelevantOnly(!relevantOnly)}
            className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors flex items-center gap-1.5 ${
              relevantOnly
                ? 'bg-amber-900/30 text-amber-300 border-amber-700 ring-1 ring-amber-700'
                : 'bg-slate-900 text-amber-400 border-amber-900/50 hover:border-amber-700'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Relevant to gaps ({relevantCount})
          </button>
        )}
        {(sevFilter !== 'all' || sourceFilter || search || relevantOnly) && (
          <Button
            onClick={() => { setSevFilter('all'); setSourceFilter(''); setSearch(''); setRelevantOnly(false) }}
            variant="outline"
            className="border-slate-700 text-slate-400 text-sm"
          >
            Clear filters
          </Button>
        )}
        {filtered.length > 0 && (
          <span className="self-center text-xs text-slate-500 sm:ml-auto">{filtered.length} total results</span>
        )}
      </div>

      {/* Assessment gap context banner */}
      {assessmentFilter && gappedDomains.size > 0 && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-900/10 border border-amber-900/30 rounded-lg text-sm">
          <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-amber-300 font-medium">Assessment gap context active — </span>
            <span className="text-amber-500">{relevantCount} threat{relevantCount !== 1 ? 's' : ''} mapped to {gappedDomains.size} domain{gappedDomains.size !== 1 ? 's' : ''} with Non-Compliant or Partial controls: </span>
            <span className="text-amber-600 text-xs">{[...gappedDomains].join(' · ')}</span>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-8">
          {[0, 1, 2].map(s => (
            <div key={s} className="space-y-4">
              <Skeleton className="h-6 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
              </div>
            </div>
          ))}
        </div>
      ) : generating && allThreats.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex flex-col items-center py-20 gap-4">
            <RefreshCw className="h-10 w-10 text-indigo-400 animate-spin" />
            <p className="text-slate-300 font-medium">Fetching live threat intelligence…</p>
            <p className="text-slate-500 text-sm">Pulling from 11 live sources. This takes about 30–60 seconds on first load.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">

          {/* ── Section 1: Threat Intelligence ────────────────────────────── */}
          <ThreatSection
            title="Threat Intelligence"
            description="CVEs, adversarial ML techniques, AI system incidents, and curated annual threat reports"
            icon={<Shield className="h-5 w-5" />}
            accentColor="text-indigo-400"
            threats={threatIntelThreats}
            sourcesStatus={sourcesStatus}
            sectionSources={THREAT_INTEL_SOURCES}
            isRelevant={isRelevantToGaps}
            generating={generating}
          />

          {/* ── Section 2: Latest News & Advisories ───────────────────────── */}
          <ThreatSection
            title="Latest News & Advisories"
            description="Breaking security news, official government advisories, and Python package security alerts"
            icon={<Newspaper className="h-5 w-5" />}
            accentColor="text-sky-400"
            threats={newsThreats}
            sourcesStatus={sourcesStatus}
            sectionSources={NEWS_SOURCES}
            isRelevant={isRelevantToGaps}
            generating={generating}
          />

          {/* ── Section 3: Supply Chain & Package Security ────────────────── */}
          <ThreatSection
            title="Supply Chain & Package Security"
            description="Open source dependency vulnerabilities, malicious packages, and ecosystem security research"
            icon={<Package className="h-5 w-5" />}
            accentColor="text-amber-400"
            threats={supplyChainThreats}
            sourcesStatus={sourcesStatus}
            sectionSources={SUPPLY_CHAIN_SOURCES}
            isRelevant={isRelevantToGaps}
            generating={generating}
          />

        </div>
      )}
    </div>
  )
}
