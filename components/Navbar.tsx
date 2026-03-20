'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/matrix', label: 'Evidence Matrix' },
  { href: '/tracker', label: 'Assessment Tracker' },
  { href: '/threats', label: 'Threat Intelligence' },
  { href: '/scores', label: 'Risk Scores' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const { data: alertData } = useQuery<{ criticalCount: number; highCount: number }>({
    queryKey: ['threat-alert-count'],
    queryFn: () => fetch('/api/threats/alert-count').then(r => r.json()),
    refetchInterval: 300000,
    staleTime: 60000,
  })

  const alertCount = (alertData?.criticalCount ?? 0)

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-[1400px] flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-100">
          <div className="h-7 w-7 overflow-hidden flex-shrink-0">
            <img
              src="/illuminait-logo.png"
              alt="IlluminAIT"
              style={{ width: '100%', height: '133%', objectFit: 'cover', objectPosition: 'top', filter: 'invert(1)' }}
            />
          </div>
          <span className="hidden sm:block">Agentic AI Compliance</span>
        </Link>
        {/* Desktop */}
        <div className="hidden md:flex gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === l.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              {l.label}
              {l.href === '/threats' && alertCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 text-[10px] font-bold rounded-full bg-rose-500 text-white leading-none">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </Link>
          ))}
        </div>
        {/* Mobile */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-2 flex flex-col gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${
                pathname === l.href ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              {l.label}
              {l.href === '/threats' && alertCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 text-[10px] font-bold rounded-full bg-rose-500 text-white leading-none">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
