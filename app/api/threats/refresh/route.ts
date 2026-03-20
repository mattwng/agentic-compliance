import { NextResponse } from 'next/server'
import { deleteCache, getThreats } from '@/lib/threat-fetch'

export async function POST() {
  deleteCache()
  // Kick off background fetch, return immediately
  getThreats()
  return NextResponse.json({ success: true, generating: true })
}
