'use client'
import { useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getRAG } from '@/lib/rag'
import { FRAMEWORK_COLORS, FRAMEWORKS, DOMAINS } from '@/lib/evidence-data'
import { computeWeightsFromThreats } from '@/lib/threat-weights'
import { Download, Upload, RotateCcw, TrendingUp } from 'lucide-react'
import Papa from 'papaparse'

type Assessment = { id: string; name: string; systemName: string; date: string; overallScore: number; frameworkScores: Record<string, number> }
type Weight = { domain: string; weight: number; source: string }

function ScoresContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const qc = useQueryClient()
  const urlId = searchParams.get('id')
  const fileRef = useRef<HTMLInputElement>(null)
  const [showTrend, setShowTrend] = useState(false)
  const [importPreview, setImportPreview] = useState<Record<string, number> | null>(null)
  const [importing, setImporting] = useState(false)

  const { data: assessments } = useQuery<Assessment[]>({
    queryKey: ['assessments'],
    queryFn: () => fetch('/api/assessments').then(r => r.json()),
  })

  const selectedId = urlId ?? assessments?.[0]?.id
  const selected = assessments?.find(a => a.id === selectedId)

  const { data: trend } = useQuery<Assessment[]>({
    queryKey: ['trend'],
    queryFn: () => fetch('/api/scores/trend').then(r => r.json()),
    enabled: showTrend,
  })

  const { data: weights, isLoading: weightsLoading } = useQuery<Weight[]>({
    queryKey: ['weights'],
    queryFn: () => fetch('/api/weights').then(r => r.json()),
  })

  const exportCSV = () => {
    if (!selected || !assessments) return
    const rows = FRAMEWORKS.map(fw => [
      `"${fw}"`,
      selected.frameworkScores[fw] ?? 0,
      getRAG(selected.frameworkScores[fw] ?? 0).label,
    ])
    const csv = ['Framework,Score,Risk Level', ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `scores-${selected.name}.csv`; a.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      worker: false,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data as Record<string, string>[]
        const newWeights = computeWeightsFromThreats(rows)
        setImportPreview(newWeights)
      },
      error: (err) => {
        console.error('CSV parse error:', err)
        alert('Failed to parse CSV: ' + err.message)
      },
    })
  }

  const confirmImport = async () => {
    if (!importPreview) return
    setImporting(true)
    await fetch('/api/weights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights: importPreview, source: 'csv-import' }),
    })
    qc.invalidateQueries({ queryKey: ['weights'] })
    qc.invalidateQueries({ queryKey: ['assessments'] })
    setImportPreview(null)
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const resetWeights = async () => {
    if (!confirm('Reset weights to defaults?')) return
    await fetch('/api/weights', { method: 'DELETE' })
    qc.invalidateQueries({ queryKey: ['weights'] })
    qc.invalidateQueries({ queryKey: ['assessments'] })
  }

  const rag = selected ? getRAG(selected.overallScore) : null

  const trendData = trend?.map(a => ({
    date: new Date(a.date).toLocaleDateString(),
    name: a.name,
    overall: a.overallScore,
    ...Object.fromEntries(FRAMEWORKS.map(fw => [fw, a.frameworkScores[fw] ?? 0])),
  }))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Risk Scores</h1>
          <p className="text-slate-400 mt-1">Compliance scores by framework and domain</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTrend(!showTrend)} variant="outline" className="border-slate-700">
            <TrendingUp className="h-4 w-4 mr-2" /> {showTrend ? 'Hide' : 'Show'} Trend
          </Button>
          <Button onClick={exportCSV} variant="outline" className="border-slate-700" disabled={!selected}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Assessment selector */}
      {assessments && assessments.length > 0 && (
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Assessment</label>
          <select
            value={selectedId ?? ''}
            onChange={e => router.push(`/scores?id=${e.target.value}`)}
            className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300 w-full max-w-sm"
          >
            {assessments.map(a => (
              <option key={a.id} value={a.id}>{a.systemName} — {a.name} ({new Date(a.date).toLocaleDateString()})</option>
            ))}
          </select>
        </div>
      )}

      {/* Section A: Current scores */}
      {selected ? (
        <>
          {/* Overall score card */}
          <Card className={`border-slate-800 ${rag?.bg}`}>
            <CardContent className="pt-6 flex items-center gap-6">
              <div className="text-6xl font-black" style={{ color: rag?.dot }}>{selected.overallScore}%</div>
              <div>
                <div className="text-xl font-bold text-slate-100">{rag?.label}</div>
                <div className="text-slate-400 text-sm">{selected.systemName} — {selected.name}</div>
                <Badge className={`${rag?.bg} ${rag?.text} border-0 mt-1`}>
                  {selected.overallScore >= 75 ? 'Low' : selected.overallScore >= 50 ? 'Medium' : 'High'} Risk — Overall Compliance Score
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Framework scores table */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle>Framework Scores</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {FRAMEWORKS.map(fw => {
                  const score = selected.frameworkScores[fw] ?? 0
                  const fwRag = getRAG(score)
                  return (
                    <div key={fw} className="flex items-center gap-4">
                      <div className="w-44 text-sm font-medium shrink-0" style={{ color: FRAMEWORK_COLORS[fw] }}>{fw}</div>
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: fwRag.dot }} />
                      </div>
                      <div className="w-12 text-right text-sm font-bold">{score}%</div>
                      <Badge className={`${fwRag.bg} ${fwRag.text} border-0 text-xs w-24 justify-center`}>{fwRag.label}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex flex-col items-center py-16 gap-4">
            <p className="text-slate-400">No assessments found.</p>
            <Button onClick={() => router.push('/tracker')} className="bg-indigo-600 hover:bg-indigo-700">Start an Assessment</Button>
          </CardContent>
        </Card>
      )}

      {/* Section B: Trend */}
      {showTrend && trendData && trendData.length > 1 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle>Score Trend Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="overall" name="Overall" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                {FRAMEWORKS.map(fw => (
                  <Line key={fw} type="monotone" dataKey={fw} stroke={FRAMEWORK_COLORS[fw]} strokeWidth={1} dot={false} strokeDasharray="4 2" />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Section C: Domain weights */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Domain Weight Configuration</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => fileRef.current?.click()} variant="outline" className="border-slate-700 text-sm">
                <Upload className="h-4 w-4 mr-2" /> Import Threat CSV
              </Button>
              <Button onClick={resetWeights} variant="outline" className="border-slate-700 text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Defaults
              </Button>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Import a CSV from threats.illuminait.io to auto-calibrate weights from live threat data.
            Severity scoring: Critical=4, High=3, Medium=2, Low=1, Info=0.5
          </p>
        </CardHeader>
        <CardContent>
          {weightsLoading ? (
            <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : (
            <div className="space-y-2">
              {(importPreview ? DOMAINS : weights?.map(w => w.domain) ?? DOMAINS).map(domain => {
                const currentWeight = weights?.find(w => w.domain === domain)
                const previewWeight = importPreview?.[domain]
                const displayWeight = previewWeight ?? currentWeight?.weight ?? 0
                return (
                  <div key={domain} className="flex items-center gap-4">
                    <div className="w-60 text-sm shrink-0" style={{ color: '#94a3b8' }}>{domain}</div>
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${displayWeight * 100}%` }} />
                    </div>
                    <div className="w-16 text-right text-sm">
                      {importPreview && previewWeight !== undefined && currentWeight?.weight !== previewWeight ? (
                        <span className="text-amber-400 font-bold">{Math.round(displayWeight * 100)}%</span>
                      ) : (
                        <span>{Math.round(displayWeight * 100)}%</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 w-20">{importPreview ? 'from CSV' : currentWeight?.source ?? ''}</div>
                  </div>
                )
              })}
            </div>
          )}
          {importPreview && (
            <div className="mt-6 p-4 rounded-lg border border-amber-800 bg-amber-900/20 flex items-center justify-between">
              <div>
                <p className="text-amber-400 font-medium text-sm">Preview — weights recalculated from threat CSV</p>
                <p className="text-slate-500 text-xs mt-0.5">Amber values indicate changed weights</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setImportPreview(null); if (fileRef.current) fileRef.current.value = '' }} variant="outline" className="border-slate-700 text-sm">Cancel</Button>
                <Button onClick={confirmImport} disabled={importing} className="bg-amber-600 hover:bg-amber-700 text-sm">Confirm Import</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ScoresPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>}>
      <ScoresContent />
    </Suspense>
  )
}
