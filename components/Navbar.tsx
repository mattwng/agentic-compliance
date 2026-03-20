'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'

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

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-[1400px] flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-100">
          <Shield className="h-6 w-6 text-indigo-400" />
          <span className="hidden sm:block">Agentic AI Compliance</span>
        </Link>
        {/* Desktop */}
        <div className="hidden md:flex gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              {l.label}
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
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                pathname === l.href ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
