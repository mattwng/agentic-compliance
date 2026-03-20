import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agentic AI Compliance Evaluator',
  description: 'Evaluate IT systems against 10 Agentic AI security frameworks',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-[1400px]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
