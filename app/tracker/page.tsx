'use client'
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EVIDENCE, DOMAINS, FRAMEWORKS, DOMAIN_COLORS, FRAMEWORK_COLORS, CLOUD_API_TIER_LABELS, TOPOLOGY_TIER_LABELS } from '@/lib/evidence-data'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Save, Calculator, FileUp, CheckCircle, X, Download, Info } from 'lucide-react'
import type { EvidenceItem } from '@/lib/evidence-data'

type StatusType = 'Compliant' | 'Partial' | 'Non-Compliant' | 'N/A' | ''
type SourceFilter = 'all' | 'cloud-api' | 'topology' | 'manual'

function matchesSourceFilter(item: EvidenceItem, filter: SourceFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'cloud-api') return item.cloudApiTier === 'auto' || item.cloudApiTier === 'signal'
  if (filter === 'topology') return item.topologyTier === 'auto' || item.topologyTier === 'signal'
  if (filter === 'manual') return item.cloudApiTier === 'manual'
  return true
}

function cloudApiChipClass(tier: string): string {
  const base = 'text-[10px] px-1.5 py-0.5 rounded font-medium'
  if (tier === 'auto') return `${base} bg-teal-900/60 text-teal-300 border border-teal-700`
  if (tier === 'signal') return `${base} text-teal-500 border border-teal-700`
  // manual
  return `${base} bg-amber-900/40 text-amber-400 border border-amber-700/50`
}

function topologyChipClass(tier: string): string {
  const base = 'text-[10px] px-1.5 py-0.5 rounded font-medium'
  if (tier === 'auto') return `${base} bg-violet-900/60 text-violet-300 border border-violet-700`
  if (tier === 'signal') return `${base} text-violet-400 border border-violet-700`
  // limited
  return `${base} text-slate-500 border border-slate-700`
}
type ResponseMap = Record<string, { status: StatusType; notes: string }>

const STATUS_OPTIONS: StatusType[] = ['Compliant', 'Partial', 'Non-Compliant', 'N/A']
const STATUS_COLORS: Record<string, string> = {
  'Compliant': 'text-green-400',
  'Partial': 'text-amber-400',
  'Non-Compliant': 'text-red-400',
  'N/A': 'text-slate-500',
}

function TrackerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('assessmentId')

  const [assessmentName, setAssessmentName] = useState('')
  const [systemName, setSystemName] = useState('')
  const [notes, setNotes] = useState('')
  const [responses, setResponses] = useState<ResponseMap>({})
  const [filterDomain, setFilterDomain] = useState('')
  const [filterFramework, setFilterFramework] = useState('')
  const [filterSource, setFilterSource] = useState<SourceFilter>('all')
  const [showPhaseInfo, setShowPhaseInfo] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [importStatus, setImportStatus] = useState<{ count: number; filename: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: weights } = useQuery({
    queryKey: ['weights'],
    queryFn: () => fetch('/api/weights').then(r => r.json()),
  })

  const { data: existing } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => assessmentId ? fetch(`/api/assessments/${assessmentId}`).then(r => r.json()) : null,
    enabled: !!assessmentId,
  })

  useEffect(() => {
    if (existing) {
      setAssessmentName(existing.name)
      setSystemName(existing.systemName)
      setNotes(existing.notes ?? '')
      const map: ResponseMap = {}
      for (const r of existing.responses) {
        map[r.evidenceId] = { status: r.status, notes: r.notes ?? '' }
      }
      setResponses(map)
    }
  }, [existing])

  // Restore from localStorage
  useEffect(() => {
    if (!assessmentId) {
      const saved = localStorage.getItem('tracker-draft')
      if (saved) {
        try {
          const d = JSON.parse(saved)
          setAssessmentName(d.assessmentName ?? '')
          setSystemName(d.systemName ?? '')
          setNotes(d.notes ?? '')
          setResponses(d.responses ?? {})
        } catch {
          // ignore parse errors
        }
      }
    }
  }, [assessmentId])

  const saveDraft = useCallback((r: ResponseMap, n: string, s: string, no: string) => {
    if (!assessmentId) {
      localStorage.setItem('tracker-draft', JSON.stringify({ assessmentName: n, systemName: s, notes: no, responses: r }))
    }
  }, [assessmentId])

  const setResponse = (id: string, field: 'status' | 'notes', value: string) => {
    setResponses(prev => {
      const updated = { ...prev, [id]: { ...prev[id], [field]: value } }
      saveDraft(updated, assessmentName, systemName, notes)
      return updated
    })
  }

  const weightMap: Record<string, number> = weights
    ? Object.fromEntries(weights.map((w: { domain: string; weight: number }) => [w.domain, w.weight]))
    : {}

  const manualCount = EVIDENCE.filter(e => e.cloudApiTier === 'manual').length
  const sourceCounts = {
    all: EVIDENCE.length,
    'cloud-api': EVIDENCE.filter(e => matchesSourceFilter(e, 'cloud-api')).length,
    topology: EVIDENCE.filter(e => matchesSourceFilter(e, 'topology')).length,
    manual: manualCount,
  }

  const filteredEvidence = EVIDENCE.filter(e => {
    if (!matchesSourceFilter(e, filterSource)) return false
    if (filterDomain && e.domain !== filterDomain) return false
    if (filterFramework && !e.frameworks.includes(filterFramework)) return false
    if (search && !e.aspect.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const ratedCount = EVIDENCE.filter(e => responses[e.id]?.status).length
  const progressPct = Math.round((ratedCount / EVIDENCE.length) * 100)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        const name = json.assessment_name ?? json.assessmentName ?? assessmentName
        const sys = json.system_name ?? json.systemName ?? systemName
        const no = json.notes ?? notes
        if (json.assessment_name ?? json.assessmentName) setAssessmentName(name)
        if (json.system_name ?? json.systemName) setSystemName(sys)
        if (json.notes) setNotes(no)

        // Support both array [{evidence_id, status, notes}] and object map {"id": {status, notes}}
        const raw = json.responses ?? {}
        const entries: Array<{ evidence_id: string; status: string; notes?: string }> = Array.isArray(raw)
          ? raw
          : Object.entries(raw).map(([id, v]) => ({ evidence_id: id, ...(v as object) }))

        const map: ResponseMap = { ...responses }
        let count = 0
        for (const r of entries) {
          const id = r.evidence_id ?? (r as Record<string, string>).evidenceId
          if (id && r.status) {
            map[id] = { status: r.status as StatusType, notes: r.notes ?? '' }
            count++
          }
        }
        setResponses(map)
        saveDraft(map, name, sys, no)
        setImportStatus({ count, filename: file.name })
      } catch {
        alert('Invalid JSON file. Please check the format and try again.')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const handleDownloadTemplate = () => {
    const template = {
      assessment_name: 'My AI System — Q1 2026 Review',
      system_name: 'My AI System',
      notes: 'Automated discovery scan — replace with your context',
      responses: EVIDENCE.slice(0, 3).map(e => ({
        evidence_id: e.id,
        status: 'Compliant',
        notes: 'Detected by discovery tool',
      })).concat([{ evidence_id: '...', status: 'Partial | Compliant | Non-Compliant | N/A', notes: '...' }]),
    }
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assessment-template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const buildPayload = () => ({
    name: assessmentName || 'Unnamed Assessment',
    systemName: systemName || 'Unknown System',
    notes,
    responses: Object.entries(responses)
      .filter(([, v]) => v.status)
      .map(([evidenceId, v]) => ({ evidenceId, status: v.status, notes: v.notes })),
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      if (assessmentId) {
        await fetch(`/api/assessments/${assessmentId}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        })
      } else {
        await fetch('/api/assessments', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        })
        localStorage.removeItem('tracker-draft')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCalculate = async () => {
    setSaving(true)
    try {
      let id = assessmentId
      if (id) {
        await fetch(`/api/assessments/${id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        })
      } else {
        const res = await fetch('/api/assessments', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        })
        const data = await res.json()
        id = data.id
        localStorage.removeItem('tracker-draft')
      }
      router.push(`/scores?id=${id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{assessmentId ? 'Edit Assessment' : 'New Assessment'}</h1>
          <p className="text-slate-200 mt-1">Rate {EVIDENCE.length} evidence items across 10 frameworks</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button onClick={handleDownloadTemplate} variant="outline" className="border-slate-700 text-slate-200 text-sm" title="Download JSON schema template for your discovery tool">
            <Download className="h-4 w-4 mr-2" /> Template
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="border-indigo-700 text-indigo-400 hover:bg-indigo-900/20 text-sm">
            <FileUp className="h-4 w-4 mr-2" /> Import JSON
          </Button>
          <Button onClick={handleSave} disabled={saving} variant="outline" className="border-slate-700">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
          <Button onClick={handleCalculate} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            <Calculator className="h-4 w-4 mr-2" /> Calculate Scores
          </Button>
        </div>
      </div>

      {/* Import status banner */}
      {importStatus && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-green-900/20 border border-green-900/30 rounded-lg text-sm text-green-400">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            Imported <span className="font-semibold">{importStatus.count}/{EVIDENCE.length}</span> responses from{' '}
            <span className="font-mono text-green-300">{importStatus.filename}</span>
            {importStatus.count < EVIDENCE.length && (
              <span className="text-green-600 ml-1">— review and fill remaining items manually</span>
            )}
          </span>
          <button onClick={() => setImportStatus(null)} className="ml-auto text-green-700 hover:text-green-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Assessment metadata */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-200 mb-1 block">Assessment Name</label>
            <Input value={assessmentName} onChange={e => { setAssessmentName(e.target.value); saveDraft(responses, e.target.value, systemName, notes) }}
              placeholder="e.g. Q1 2026 Review" className="bg-slate-800 border-slate-700" />
          </div>
          <div>
            <label className="text-sm text-slate-200 mb-1 block">System Name</label>
            <Input value={systemName} onChange={e => { setSystemName(e.target.value); saveDraft(responses, assessmentName, e.target.value, notes) }}
              placeholder="e.g. AISPM Platform" className="bg-slate-800 border-slate-700" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-200 mb-1 block">Notes</label>
            <Textarea value={notes} onChange={e => { setNotes(e.target.value); saveDraft(responses, assessmentName, systemName, e.target.value) }}
              placeholder="Assessment context, scope, assumptions..." className="bg-slate-800 border-slate-700 resize-none" rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-slate-200">
          <span>Progress</span><span>{ratedCount} / {EVIDENCE.length} items rated ({progressPct}%)</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      {/* Discovery phase info callout */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60">
        <button
          onClick={() => setShowPhaseInfo(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-200 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4 text-indigo-400" />
            <span className="font-medium text-slate-300">Discovery Phases</span>
            <span className="text-slate-300">— automated workflow covers 40 of 48 controls; 8 require manual input</span>
          </span>
          <span className="text-slate-400">{showPhaseInfo ? '▲' : '▼'}</span>
        </button>
        {showPhaseInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-slate-800 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-violet-400 mb-1">Phase 1 — AI Topology Scan</p>
              <p className="text-xs text-slate-300">Graph traversal maps agent nodes, tool edges, and runtime trust boundaries. Covers <span className="text-violet-300 font-medium">{sourceCounts.topology} controls</span> with auto or signal confidence.</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-teal-400 mb-1">Phase 2 — Cloud Infrastructure API Scan</p>
              <p className="text-xs text-slate-300">Cloud provider APIs enumerate IAM roles, secrets, network policies, and logging config. Covers <span className="text-teal-300 font-medium">{sourceCounts['cloud-api']} controls</span> with auto or signal confidence.</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-amber-400 mb-1">Manual Input — Optional Enrichment</p>
              <p className="text-xs text-slate-300"><span className="text-amber-300 font-medium">{sourceCounts.manual} controls</span> require human-authored documentation (governance docs, red-team results, conformity assessments). Not required to score — add separately for a full audit.</p>
            </div>
          </div>
        )}
      </div>

      {/* Source filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {([
          { key: 'all',       label: `All (${sourceCounts.all})` },
          { key: 'cloud-api', label: `☁ Cloud API (${sourceCounts['cloud-api']})` },
          { key: 'topology',  label: `⬡ AI Topology (${sourceCounts.topology})` },
          { key: 'manual',    label: `✎ Manual Input (${sourceCounts.manual})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterSource(key)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filterSource === key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
        {filterSource === 'manual' && (
          <span className="ml-1 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-amber-900/30 text-amber-400 border border-amber-700/50">
            ⚑ Required for full compliance audit
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300">
          <option value="">All Domains</option>
          {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterFramework} onChange={e => setFilterFramework(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300">
          <option value="">All Frameworks</option>
          {FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search evidence items..." className="bg-slate-800 border-slate-700 max-w-xs text-sm" />
      </div>

      {/* Evidence table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-sm text-slate-200">{filteredEvidence.length} items shown</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-200">
                  <th className="text-left py-3 px-4 min-w-[160px]">Domain</th>
                  <th className="text-left py-3 px-4 w-16">Weight</th>
                  <th className="text-left py-3 px-4 min-w-[180px]">Frameworks</th>
                  <th className="text-left py-3 px-4">Evidence Item</th>
                  <th className="text-left py-3 px-4 w-44">Status</th>
                  <th className="text-left py-3 px-4 min-w-[160px]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvidence.map((item, i) => (
                  <tr key={item.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                    <td className="py-3 px-4">
                      <Badge className="text-xs border-0 whitespace-nowrap" style={{ backgroundColor: `${DOMAIN_COLORS[item.domain]}20`, color: DOMAIN_COLORS[item.domain] }}>
                        {item.domain}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-200 text-xs">
                      {weightMap[item.domain] ? `${Math.round(weightMap[item.domain] * 100)}%` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.frameworks.map(fw => (
                          <span key={fw} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${FRAMEWORK_COLORS[fw]}20`, color: FRAMEWORK_COLORS[fw] }}>
                            {fw}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 text-sm leading-snug">{item.aspect}</div>
                      <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                        <span className={cloudApiChipClass(item.cloudApiTier)}>{CLOUD_API_TIER_LABELS[item.cloudApiTier]}</span>
                        <span className={topologyChipClass(item.topologyTier)}>{TOPOLOGY_TIER_LABELS[item.topologyTier]}</span>
                        {item.cloudApiTier === 'manual' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-900/30 text-amber-400 border border-amber-700/50">
                            ⚑ Manual input required for full audit
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={responses[item.id]?.status ?? ''}
                        onChange={e => setResponse(item.id, 'status', e.target.value)}
                        className={`bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-xs w-full ${STATUS_COLORS[responses[item.id]?.status ?? ''] ?? 'text-slate-400'}`}
                      >
                        <option value="">— Select —</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <Input
                        value={responses[item.id]?.notes ?? ''}
                        onChange={e => setResponse(item.id, 'notes', e.target.value)}
                        placeholder="Notes..."
                        className="bg-slate-800 border-slate-700 text-xs h-8"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TrackerPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}>
      <TrackerContent />
    </Suspense>
  )
}
