import { NextRequest, NextResponse } from "next/server";

// ── Yarn weight mapping ────────────────────────────────────────────────────────

const RAVELRY_WEIGHT_MAP: Record<string, string> = {
  Lace: "lace",
  Cobweb: "lace",
  Thread: "lace",
  Fingering: "super-fine",
  "Super Fingering": "super-fine",
  Sport: "fine",
  DK: "light",
  "Light Worsted": "light",
  Worsted: "medium",
  Aran: "medium",
  Bulky: "bulky",
  "Super Bulky": "super-bulky",
  Jumbo: "jumbo",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function extractPermalink(rawUrl: string): string | null {
  try {
    // Accept full URLs or just the path
    const normalized = rawUrl.startsWith("http")
      ? rawUrl
      : `https://${rawUrl.replace(/^\/+/, "")}`;
    const url = new URL(normalized);
    const match = url.pathname.match(/\/patterns\/library\/([^/?#]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function getRavelryAuth(): string {
  const username = process.env.RAVELRY_USERNAME;
  const password = process.env.RAVELRY_PASSWORD;
  if (!username || !password) {
    throw new Error("Ravelry credentials not configured.");
  }
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse body
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "Missing required field: url." }, { status: 400 });
  }

  // 2. Extract permalink from URL
  const permalink = extractPermalink(body.url.trim());
  if (!permalink) {
    return NextResponse.json(
      { error: "Invalid Ravelry pattern URL. Expected format: ravelry.com/patterns/library/pattern-name" },
      { status: 400 }
    );
  }

  // 3. Get auth header
  let authHeader: string;
  try {
    authHeader = getRavelryAuth();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Auth error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // 4. Search for the pattern by permalink to get its ID
  let patternId: number;
  let patternName: string;
  try {
    const searchRes = await fetch(
      `https://api.ravelry.com/patterns/search.json?query=${encodeURIComponent(permalink)}&page_size=1`,
      { headers: { Authorization: authHeader } }
    );
    if (!searchRes.ok) {
      return NextResponse.json(
        { error: `Ravelry API error: ${searchRes.status}` },
        { status: 502 }
      );
    }
    const searchData = await searchRes.json();
    const patterns: Array<{ id: number; name: string; permalink: string }> =
      searchData.patterns ?? [];

    // Find exact permalink match
    const match = patterns.find((p) => p.permalink === permalink);
    if (!match) {
      return NextResponse.json(
        { error: `Pattern "${permalink}" not found on Ravelry.` },
        { status: 404 }
      );
    }
    patternId = match.id;
    patternName = match.name;
  } catch (err) {
    console.error("[ravelry] Search fetch error:", err);
    return NextResponse.json({ error: "Failed to reach Ravelry API." }, { status: 502 });
  }

  // 5. Fetch full pattern details for gauge data
  let gauge: number | null = null;
  let gaugeDivisor: number = 4;
  let rowGauge: number | null = null;
  let yarnWeightName: string | null = null;

  try {
    const detailRes = await fetch(
      `https://api.ravelry.com/patterns/${patternId}.json`,
      { headers: { Authorization: authHeader } }
    );
    if (!detailRes.ok) {
      return NextResponse.json(
        { error: `Ravelry API error fetching pattern details: ${detailRes.status}` },
        { status: 502 }
      );
    }
    const detailData = await detailRes.json();
    const p = detailData.pattern ?? detailData;

    gauge = typeof p.gauge === "number" ? p.gauge : null;
    gaugeDivisor = typeof p.gauge_divisor === "number" && p.gauge_divisor > 0
      ? p.gauge_divisor
      : 4;
    rowGauge = typeof p.row_gauge === "number" ? p.row_gauge : null;
    yarnWeightName = p.yarn_weight?.name ?? null;
  } catch (err) {
    console.error("[ravelry] Detail fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch pattern details." }, { status: 502 });
  }

  // 6. Normalize gauge to sts/4in
  const normalizedGauge = gauge !== null ? gauge * (4 / gaugeDivisor) : null;
  const normalizedRowGauge = rowGauge !== null ? rowGauge * (4 / gaugeDivisor) : null;

  // 7. Map yarn weight
  const patternYarnWeight = yarnWeightName
    ? (RAVELRY_WEIGHT_MAP[yarnWeightName] ?? null)
    : null;

  return NextResponse.json({
    patternName,
    patternGauge: normalizedGauge,        // sts/4in, or null if not set
    patternRowGauge: normalizedRowGauge,   // sts/4in, or null if not set
    patternYarnWeight,                     // app weight value, or null
    yarnWeightName,                        // raw Ravelry name for display
  });
}
