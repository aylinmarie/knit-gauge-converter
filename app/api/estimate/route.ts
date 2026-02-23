import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { YARN_WEIGHT_LABELS } from "@/lib/yarnWeights";

// ── Types ────────────────────────────────────────────────────────────────────

interface EstimateRequestBody {
  patternYarnWeight: string;
  patternGauge: number;
  patternRowGauge?: number;
  userYarnWeight: string;
}

interface EstimateResponse {
  estimatedGauge: number;
  estimatedRowGauge?: number;
  reasoning: string;
  reasoningMetric: string;
}

// ── Allowed values (used for input validation) ────────────────────────────────

const ALLOWED_YARN_WEIGHTS = new Set([
  "lace", "super-fine", "fine", "light", "medium", "bulky", "super-bulky", "jumbo",
]);

// ── Yarn weight data ─────────────────────────────────────────────────────────

// Standard midpoint gauges (sts per 4 inches) per CYC weight category
const YARN_MIDPOINTS: Record<string, number> = {
  lace:          37,
  "super-fine":  29,
  fine:          24,
  light:         22,
  medium:        18,
  bulky:         13,
  "super-bulky":  9,
  jumbo:          5,
};

// Standard midpoint row gauges (rows per 4 inches) per CYC weight category
// Row gauge is typically ~1.3–1.4× stitch gauge for stockinette
const ROW_MIDPOINTS: Record<string, number> = {
  lace:          48,
  "super-fine":  40,
  fine:          32,
  light:         30,
  medium:        24,
  bulky:         19,
  "super-bulky": 13,
  jumbo:          7,
};


// ── Gauge calculation ─────────────────────────────────────────────────────────

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

// sts/4in → sts/10cm (for display in reasoning text)
function toMetricDisplay(v: number): number {
  return Math.round((v * (10 / 10.16)) * 2) / 2;
}

function estimateGauge(
  patternYarnWeight: string,
  patternGauge: number,
  userYarnWeight: string,
  patternRowGauge?: number,
): {
  estimatedGauge: number;
  estimatedRowGauge?: number;
  reasoning: string;
  reasoningMetric: string;
} {
  const patternMidpoint = YARN_MIDPOINTS[patternYarnWeight];
  const userMidpoint    = YARN_MIDPOINTS[userYarnWeight];

  if (!patternMidpoint || !userMidpoint) {
    throw new Error(`Unknown yarn weight: ${!patternMidpoint ? patternYarnWeight : userYarnWeight}`);
  }

  const ratio = userMidpoint / patternMidpoint;
  const estimatedGauge = roundToHalf(patternGauge * ratio);
  const patternLabel   = YARN_WEIGHT_LABELS[patternYarnWeight];
  const userLabel      = YARN_WEIGHT_LABELS[userYarnWeight];

  // Row gauge
  let estimatedRowGauge: number | undefined;
  if (patternRowGauge !== undefined) {
    const patternRowMidpoint = ROW_MIDPOINTS[patternYarnWeight];
    const userRowMidpoint    = ROW_MIDPOINTS[userYarnWeight];
    if (patternRowMidpoint && userRowMidpoint) {
      estimatedRowGauge = roundToHalf(patternRowGauge * (userRowMidpoint / patternRowMidpoint));
    }
  }

  const buildReasoning = (isMetric: boolean) => {
    const unitLabel = isMetric ? "sts/10cm" : "sts/4in";
    const fmt = (v: number) => isMetric ? toMetricDisplay(v) : v;
    if (patternYarnWeight === userYarnWeight) {
      return `Good news — you're swapping like for like! Both yarns are ${patternLabel}, so your gauge should stay right around ${fmt(patternGauge)} ${unitLabel}. That said, fiber content and your personal tension can still nudge things a bit, so it's always worth knitting a quick swatch just to be sure.`;
    }
    const direction = userMidpoint < patternMidpoint ? "chunkier" : "finer";
    return `Your yarn (${userLabel}) typically knits up to about ${fmt(userMidpoint)} ${unitLabel}, while the pattern calls for ${patternLabel} at around ${fmt(patternMidpoint)} ${unitLabel}. Since your yarn is ${direction}, we scaled the pattern's ${fmt(patternGauge)} sts and landed on ${fmt(estimatedGauge)} ${unitLabel} as your target.`;
  };

  return {
    estimatedGauge,
    estimatedRowGauge,
    reasoning: buildReasoning(false),
    reasoningMetric: buildReasoning(true),
  };
}

// ── Supabase ─────────────────────────────────────────────────────────────────

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set."
    );
  }
  return createClient(url, key);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse and validate
  let body: EstimateRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { patternYarnWeight, patternGauge, patternRowGauge, userYarnWeight } = body;

  if (!patternYarnWeight || typeof patternGauge !== "number" || !userYarnWeight) {
    return NextResponse.json(
      { error: "Missing required fields: patternYarnWeight, patternGauge, userYarnWeight." },
      { status: 400 }
    );
  }

  if (patternGauge <= 0 || patternGauge > 100) {
    return NextResponse.json(
      { error: "patternGauge must be between 1 and 100." },
      { status: 400 }
    );
  }

  if (patternRowGauge !== undefined) {
    if (typeof patternRowGauge !== "number" || patternRowGauge <= 0 || patternRowGauge > 200) {
      return NextResponse.json(
        { error: "patternRowGauge must be between 1 and 200." },
        { status: 400 }
      );
    }
  }

  if (!ALLOWED_YARN_WEIGHTS.has(patternYarnWeight) || !ALLOWED_YARN_WEIGHTS.has(userYarnWeight)) {
    return NextResponse.json({ error: "Invalid yarn weight value." }, { status: 400 });
  }

  // 2. Calculate gauge estimate
  let result: EstimateResponse;
  try {
    result = estimateGauge(patternYarnWeight, patternGauge, userYarnWeight, patternRowGauge);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calculation error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // 3. Log to Supabase (non-blocking)
  try {
    const supabase = getSupabaseClient();
    const { error: dbError } = await supabase.from("yarn_intelligence").insert([
      {
        pattern_yarn_weight: patternYarnWeight,
        pattern_gauge:       patternGauge,
        user_yarn_weight:    userYarnWeight,
        estimated_gauge:     result.estimatedGauge,
      },
    ]);
    if (dbError) {
      console.warn("[estimate] Supabase insert warning:", dbError.message);
    }
  } catch (err) {
    console.warn("[estimate] Supabase client error:", err);
  }

  // 4. Return result
  return NextResponse.json(result, { status: 200 });
}
