import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "./lib/session";

const PROTECTED_PATHS = ["/dashboard"];
const AUTH_PATHS = ["/signin", "/signup"];

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "");
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await isAuthenticated(request);

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!authenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (authenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - r/ (referral redirect routes)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|r/).*)",
  ],
};
