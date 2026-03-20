import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const USER = process.env.BASIC_AUTH_USER
const PASS = process.env.BASIC_AUTH_PASS

export function middleware(request: NextRequest) {
  // Skip if auth is not configured
  if (!USER || !PASS) return NextResponse.next()

  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Basic ')) {
    try {
      const [user, pass] = atob(auth.slice(6)).split(':')
      if (user === USER && pass === PASS) return NextResponse.next()
    } catch { /* fall through to challenge */ }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Agentic AI Compliance"' },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
