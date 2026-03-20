'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Shield, Calendar, Activity, Trash2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getRAG } from '@/lib/rag'

type Assessment = {
  id: string
  name: string
  systemName: string
  date: string
  overallScore: number
  frameworkScores: Record<string, number>
}

export default function Home() {
  const router = useRouter()
  const { data: assessments, isLoading, refetch } = useQuery<Assessment[]>({
    queryKey: ['assessments'],
    queryFn: () => fetch('/api/assessments').then(r => r.json()),
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assessment?')) return
    await fetch(`/api/assessments/${id}`, { method: 'DELETE' })
    refetch()
  }

  const latest = assessments?.[0]
  const latestRAG = latest ? getRAG(latest.overallScore) : null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Compliance Dashboard</h1>
          <p className="text-slate-400 mt-1">Agentic AI Security Framework Evaluator</p>
        </div>
        <Button onClick={() => router.push('/tracker')} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" /> New Assessment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400 flex items-center gap-2"><Shield className="h-4 w-4" /> Total Assessments</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : (assessments?.length ?? 0)}</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400 flex items-center gap-2"><Activity className="h-4 w-4" /> Latest Risk Score</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : latest ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{latest.overallScore}%</span>
                <Badge className={`${latestRAG?.bg} ${latestRAG?.text} border-0`}>{latestRAG?.label}</Badge>
              </div>
            ) : <span className="text-slate-500 text-sm">No assessments yet</span>}
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Frameworks Evaluated</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">10</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400 flex items-center gap-2"><Calendar className="h-4 w-4" /> Last Assessment</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-28" /> : latest ? (
              <div className="text-xl font-bold">{new Date(latest.date).toLocaleDateString()}</div>
            ) : <span className="text-slate-500 text-sm">—</span>}
          </CardContent>
        </Card>
      </div>

      {/* Assessments Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : assessments && assessments.length > 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle>All Assessments</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left py-3 px-4">System Name</th>
                    <th className="text-left py-3 px-4">Assessment Name</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Score</th>
                    <th className="text-left py-3 px-4">Risk</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map(a => {
                    const rag = getRAG(a.overallScore)
                    return (
                      <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-medium">{a.systemName}</td>
                        <td className="py-3 px-4 text-slate-400">{a.name}</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(a.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-bold">{a.overallScore}%</td>
                        <td className="py-3 px-4"><Badge className={`${rag.bg} ${rag.text} border-0 text-xs`}>{rag.label}</Badge></td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-slate-700 h-8" onClick={() => router.push(`/scores?id=${a.id}`)}>
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-700 h-8" onClick={() => router.push(`/tracker?assessmentId=${a.id}`)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-900 text-red-400 hover:bg-red-900/20 h-8" onClick={() => handleDelete(a.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <Shield className="h-16 w-16 text-slate-700" />
            <p className="text-slate-400 text-lg">No assessments yet</p>
            <p className="text-slate-600 text-sm">Create your first assessment to start evaluating AI system compliance</p>
            <Button onClick={() => router.push('/tracker')} className="bg-indigo-600 hover:bg-indigo-700 mt-2">
              <Plus className="h-4 w-4 mr-2" /> Create First Assessment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
