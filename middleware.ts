import { NextRequest, NextResponse } from "next/server";

// In-memory store: ip → { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/ravelry":  { max: 15,  windowMs: 60_000 },
  "/api/estimate": { max: 60, windowMs: 60_000 },
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const limit = LIMITS[pathname];
  if (!limit) return NextResponse.next();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const key = `${pathname}:${ip}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.delete(key);
    rateLimitStore.set(key, { count: 1, resetAt: now + limit.windowMs });
    return NextResponse.next();
  }

  if (entry.count >= limit.max) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  entry.count += 1;
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/ravelry", "/api/estimate"],
};
