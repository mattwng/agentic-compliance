import { NextResponse } from 'next/server'
import { getThreats } from '@/lib/threat-fetch'

export async function GET() {
  const data = await getThreats()
  return NextResponse.json(data)
}
