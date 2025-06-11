import { NextRequest, NextResponse } from "next/server"

// Default Next.js middleware to allow all requests
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Clerk authentication code removed – no auth required.

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|api/webhooks).*)",
  ],
}
