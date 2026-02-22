import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { YARN_WEIGHT_LABELS } from "@/lib/yarnWeights";

// ── Types ────────────────────────────────────────────────────────────────────

interface EstimateRequestBody {
  patternYarnWeight: string;
  patternGauge: number;
  userYarnWeight: string;
  fiberType?: string;
  tension?: string;
}

interface EstimateResponse {
  estimatedGauge: number;
  reasoning: string;
  needleSuggestion?: string;
}

// ── Allowed values (used for input validation) ────────────────────────────────

const ALLOWED_YARN_WEIGHTS = new Set([
  "lace", "super-fine", "fine", "light", "medium", "bulky", "super-bulky", "jumbo",
]);

const ALLOWED_FIBER_TYPES = new Set([
  "wool", "superwash-wool", "cotton", "acrylic", "alpaca",
  "linen", "bamboo", "mohair-blend", "silk-blend",
]);

const ALLOWED_TENSIONS = new Set(["loose", "average", "tight"]);

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


// ── Gauge calculation ─────────────────────────────────────────────────────────

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

function estimateGauge(
  patternYarnWeight: string,
  patternGauge: number,
  userYarnWeight: string
): { estimatedGauge: number; reasoning: string } {
  const patternMidpoint = YARN_MIDPOINTS[patternYarnWeight];
  const userMidpoint    = YARN_MIDPOINTS[userYarnWeight];

  if (!patternMidpoint || !userMidpoint) {
    throw new Error(`Unknown yarn weight: ${!patternMidpoint ? patternYarnWeight : userYarnWeight}`);
  }

  const estimatedGauge = roundToHalf(patternGauge * (userMidpoint / patternMidpoint));
  const patternLabel   = YARN_WEIGHT_LABELS[patternYarnWeight];
  const userLabel      = YARN_WEIGHT_LABELS[userYarnWeight];

  let reasoning: string;
  if (patternYarnWeight === userYarnWeight) {
    reasoning = `Good news — you're swapping like for like! Both yarns are ${patternLabel}, so your gauge should stay right around ${patternGauge} sts/4in. That said, fiber content and your personal tension can still nudge things a bit, so it's always worth knitting a quick swatch just to be sure.`;
  } else {
    const direction = userMidpoint < patternMidpoint ? "chunkier" : "finer";
    reasoning = `Your yarn (${userLabel}) typically knits up to about ${userMidpoint} sts/4in, while the pattern calls for ${patternLabel} at around ${patternMidpoint} sts/4in. Since your yarn is ${direction}, we scaled the pattern's ${patternGauge} sts and landed on ${estimatedGauge} sts/4in as your target. You'll probably need to adjust your needle size — go up if you're getting too many stitches, down if too few — and always swatch first!`;
  }

  return { estimatedGauge, reasoning };
}

// ── Needle suggestion (Anthropic) ─────────────────────────────────────────────

async function getNeedleSuggestion(
  userYarnWeight: string,
  estimatedGauge: number,
  fiberType: string,
  tension: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");

  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 120,
    system:
      "You are a knitting expert. Give a concise needle size recommendation (US size + metric) in 1–2 friendly sentences. Always mention that swatching is the final check.",
    messages: [
      {
        role: "user",
        content: `Yarn weight: ${YARN_WEIGHT_LABELS[userYarnWeight] ?? userYarnWeight}. Target gauge: ${estimatedGauge} sts/4in. Fiber: ${fiberType}. Knitter tension: ${tension}. What needle size should they start with?`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response from Anthropic.");
  return block.text.trim();
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

  const { patternYarnWeight, patternGauge, userYarnWeight, fiberType, tension } = body;

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

  if (!ALLOWED_YARN_WEIGHTS.has(patternYarnWeight) || !ALLOWED_YARN_WEIGHTS.has(userYarnWeight)) {
    return NextResponse.json({ error: "Invalid yarn weight value." }, { status: 400 });
  }

  if (fiberType && !ALLOWED_FIBER_TYPES.has(fiberType)) {
    return NextResponse.json({ error: "Invalid fiber type value." }, { status: 400 });
  }

  if (tension && !ALLOWED_TENSIONS.has(tension)) {
    return NextResponse.json({ error: "Invalid tension value." }, { status: 400 });
  }

  // 2. Calculate gauge estimate (instant, no API)
  let result: EstimateResponse;
  try {
    result = estimateGauge(patternYarnWeight, patternGauge, userYarnWeight);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calculation error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // 3. Needle suggestion via Anthropic (only if fiber + tension were provided)
  if (fiberType && tension) {
    try {
      result.needleSuggestion = await getNeedleSuggestion(
        userYarnWeight,
        result.estimatedGauge,
        fiberType,
        tension
      );
    } catch (err) {
      console.warn("[estimate] Needle suggestion error:", err instanceof Error ? err.message : err);
      // non-fatal — gauge result still returns without it
    }
  }

  // 4. Log to Supabase (non-blocking)
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

  // 5. Return result
  return NextResponse.json(result, { status: 200 });
}
