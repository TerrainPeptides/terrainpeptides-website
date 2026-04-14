import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  if (!req.auth) {
    const url = req.nextUrl.clone()
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search
    url.pathname = '/auth'
    url.searchParams.set('callbackUrl', callbackUrl)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/checkout/:path*',
    '/cart/:path*',
    '/order/:path*',
    '/payment/:path*',
  ],
}
