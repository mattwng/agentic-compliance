'use client'
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, ExternalLink, AlertCircle } from 'lucide-react'
import type { ThreatCache, ThreatEntry, ThreatSeverity } from '@/lib/threat-fetch'

// ── Severity helpers ───────────────────────────────────────────────────────────

const SEV_CONFIG: Record<ThreatSeverity, { label: string; dot: string; badge: string; filter: string }> = {
  critical: { label: 'Critical', dot: '#f43f5e', badge: 'bg-rose-900/30 text-rose-400 border-rose-800',    filter: 'bg-rose-900/20 text-rose-400 border-rose-800' },
  high:     { label: 'High',     dot: '#f97316', badge: 'bg-orange-900/30 text-orange-400 border-orange-800', filter: 'bg-orange-900/20 text-orange-400 border-orange-800' },
  medium:   { label: 'Medium',   dot: '#eab308', badge: 'bg-amber-900/30 text-amber-400 border-amber-800',   filter: 'bg-amber-900/20 text-amber-400 border-amber-800' },
  low:      { label: 'Low',      dot: '#22c55e', badge: 'bg-green-900/30 text-green-400 border-green-800',   filter: 'bg-green-900/20 text-green-400 border-green-800' },
  info:     { label: 'Info',     dot: '#94a3b8', badge: 'bg-slate-800 text-slate-400 border-slate-700',      filter: 'bg-slate-800 text-slate-400 border-slate-700' },
}

const SEV_ORDER: ThreatSeverity[] = ['critical', 'high', 'medium', 'low', 'info']

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

// ── Threat Card ────────────────────────────────────────────────────────────────

function ThreatCard({ threat }: { threat: ThreatEntry }) {
  const sev = SEV_CONFIG[threat.severity] ?? SEV_CONFIG.info
  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
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

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ThreatsPage() {
  const qc = useQueryClient()
  const [sevFilter, setSevFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading } = useQuery<ThreatCache>({
    queryKey: ['threats'],
    queryFn: () => fetch('/api/threats').then(r => r.json()),
    refetchInterval: (query) => (query.state.data?.generating ? 5000 : false),
  })

  const allThreats = useMemo<ThreatEntry[]>(() => {
    if (!data?.grouped) return []
    return Object.values(data.grouped).flat()
  }, [data])

  const filtered = useMemo(() => {
    return allThreats.filter(t => {
      if (sevFilter !== 'all' && t.severity !== sevFilter) return false
      if (sourceFilter && t.source !== sourceFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q) && !t.tags.join(' ').includes(q)) return false
      }
      return true
    })
  }, [allThreats, sevFilter, sourceFilter, search])

  const sevCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of allThreats) counts[t.severity] = (counts[t.severity] ?? 0) + 1
    return counts
  }, [allThreats])

  const sources = useMemo(() => Object.keys(data?.grouped ?? {}), [data])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetch('/api/threats/refresh', { method: 'POST' })
    qc.invalidateQueries({ queryKey: ['threats'] })
    setRefreshing(false)
  }

  const cacheAgeHours = data?.timestamp
    ? Math.round((Date.now() - new Date(data.timestamp).getTime()) / 3600000)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Threat Intelligence</h1>
          <p className="text-slate-400 mt-1">
            AI-specific threats from CISA KEV, MITRE ATLAS, AI Incident Database, ENISA, IBM X-Force, Mandiant, and Verizon DBIR
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.generating && (
            <span className="text-xs text-indigo-400 flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 animate-spin" /> Fetching live data…
            </span>
          )}
          {cacheAgeHours !== null && !data?.generating && (
            <span className="text-xs text-slate-500">
              Updated {cacheAgeHours === 0 ? 'just now' : `${cacheAgeHours}h ago`}
            </span>
          )}
          <Button
            onClick={handleRefresh}
            disabled={refreshing || data?.generating}
            variant="outline"
            className="border-slate-700 text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Source status pills */}
      {data?.sources_status && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.sources_status).map(([source, status]) => (
            <span
              key={source}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-mono ${
                status.ok
                  ? 'bg-green-900/10 border-green-900/30 text-green-500'
                  : 'bg-amber-900/10 border-amber-900/30 text-amber-500'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {source} {status.ok ? `(${status.count})` : '(unavailable)'}
            </span>
          ))}
        </div>
      )}

      {/* Stat chips */}
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

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
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
          className="bg-slate-800 border-slate-700 max-w-xs text-sm"
        />
        {(sevFilter !== 'all' || sourceFilter || search) && (
          <Button
            onClick={() => { setSevFilter('all'); setSourceFilter(''); setSearch('') }}
            variant="outline"
            className="border-slate-700 text-slate-400 text-sm"
          >
            Clear filters
          </Button>
        )}
        {filtered.length > 0 && (
          <span className="self-center text-xs text-slate-500 ml-auto">{filtered.length} threats</span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : data?.generating && allThreats.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex flex-col items-center py-20 gap-4">
            <RefreshCw className="h-10 w-10 text-indigo-400 animate-spin" />
            <p className="text-slate-300 font-medium">Fetching threat intelligence…</p>
            <p className="text-slate-500 text-sm">Pulling from CISA, MITRE ATLAS, and AI Incident Database. This takes about 30–60 seconds on first load.</p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <AlertCircle className="h-8 w-8 text-slate-600" />
            <p className="text-slate-400">No threats match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => <ThreatCard key={t.id} threat={t} />)}
        </div>
      )}
    </div>
  )
}
