import { NextRequest, NextResponse } from "next/server"

// Define public routes
const publicRoutes = [
  '/',
  '/signin',
  '/signup',
  '/sso-callback',
  '/api/webhooks'
]

// Check if route is public
function isPublicRoute(path: string) {
  return publicRoutes.some(route => path.startsWith(route))
}

// Middleware function
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // If it's a public route, allow access
  if (isPublicRoute(path)) {
    return NextResponse.next()
  }
  
  // Simple authentication check based on cookies
  const hasAuthCookie = request.cookies.has('__session')
  
  // If no auth cookie and trying to access protected route, redirect to sign-in
  if (!hasAuthCookie) {
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('redirect_url', request.url)
    return NextResponse.redirect(signInUrl)
  }
  
  // Allow access to protected routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|api/webhooks).*)",
  ],
}
