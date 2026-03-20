'use client'
import { useState } from 'react'
import { EVIDENCE, FRAMEWORKS, DOMAINS, FRAMEWORK_COLORS, DOMAIN_COLORS } from '@/lib/evidence-data'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function MatrixPage() {
  const [activeFramework, setActiveFramework] = useState<string | null>(null)
  const [activeDomain, setActiveDomain] = useState<string | null>(null)

  const exportCSV = () => {
    const rows = EVIDENCE.map(e => [
      `"${e.id}"`,
      `"${e.domain}"`,
      `"${e.aspect.replace(/"/g, '""')}"`,
      `"${e.frameworks.join('; ')}"`,
    ])
    const csv = ['ID,Domain,Evidence Item,Frameworks', ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'evidence-matrix.csv'; a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evidence Matrix</h1>
          <p className="text-slate-400 mt-1">48 evidence items × 10 frameworks × 8 domains</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="border-slate-700">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Framework filter pills */}
      <div className="flex flex-wrap gap-2">
        {FRAMEWORKS.map(fw => (
          <button
            key={fw}
            onClick={() => setActiveFramework(activeFramework === fw ? null : fw)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              activeFramework === fw ? 'opacity-100 ring-2 ring-white' : activeFramework ? 'opacity-30' : 'opacity-80'
            }`}
            style={{ borderColor: FRAMEWORK_COLORS[fw], color: FRAMEWORK_COLORS[fw], backgroundColor: `${FRAMEWORK_COLORS[fw]}20` }}
          >
            {fw}
          </button>
        ))}
        <button
          onClick={() => { setActiveDomain(null); setActiveFramework(null) }}
          className="px-3 py-1 rounded-full text-xs border border-slate-600 text-slate-400 hover:bg-slate-800"
        >
          Clear
        </button>
      </div>

      {/* Domain filter pills */}
      <div className="flex flex-wrap gap-2">
        {DOMAINS.map(d => (
          <button
            key={d}
            onClick={() => setActiveDomain(activeDomain === d ? null : d)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              activeDomain === d ? 'opacity-100 ring-2 ring-white' : activeDomain ? 'opacity-30' : 'opacity-80'
            }`}
            style={{ borderColor: DOMAIN_COLORS[d], color: DOMAIN_COLORS[d], backgroundColor: `${DOMAIN_COLORS[d]}20` }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Matrix table */}
      <div className="overflow-auto rounded-lg border border-slate-800">
        <table className="text-xs min-w-[1200px]">
          <thead>
            <tr className="bg-slate-900">
              <th className="sticky left-0 z-10 bg-slate-900 text-left px-4 py-3 text-slate-400 font-medium border-b border-r border-slate-800 min-w-[160px]">Framework</th>
              {DOMAINS.map(d => (
                <th
                  key={d}
                  className={`text-left px-3 py-3 border-b border-slate-800 font-medium min-w-[180px] transition-opacity ${
                    activeDomain && activeDomain !== d ? 'opacity-30' : ''
                  }`}
                  style={{ color: DOMAIN_COLORS[d] }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FRAMEWORKS.map((fw, fi) => {
              const isActiveRow = !activeFramework || activeFramework === fw
              return (
                <tr
                  key={fw}
                  className={`border-b border-slate-800 transition-opacity ${!isActiveRow ? 'opacity-20' : ''} ${fi % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40'}`}
                >
                  <td
                    className="sticky left-0 z-10 px-4 py-3 font-medium border-r border-slate-800 text-xs"
                    style={{ color: FRAMEWORK_COLORS[fw], backgroundColor: fi % 2 === 0 ? '#020817' : '#0f172a80' }}
                  >
                    {fw}
                  </td>
                  {DOMAINS.map(d => {
                    const items = EVIDENCE.filter(e => e.domain === d && e.frameworks.includes(fw))
                    const isActiveCol = !activeDomain || activeDomain === d
                    return (
                      <td key={d} className={`px-3 py-3 align-top transition-opacity ${!isActiveCol ? 'opacity-20' : ''}`}>
                        {items.length > 0 ? (
                          <ul className="space-y-1">
                            {items.map(item => (
                              <li key={item.id} className="flex items-start gap-1">
                                <span className="mt-0.5 text-slate-600">•</span>
                                <span className="text-slate-300 leading-snug">{item.aspect}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
