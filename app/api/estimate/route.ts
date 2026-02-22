import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// ── Types ────────────────────────────────────────────────────────────────────

interface EstimateRequestBody {
  patternYarnWeight: string;
  patternGauge: number;
  userYarnWeight: string;
}

interface EstimateAIResponse {
  estimatedGauge: number;
  reasoning: string;
}

// ── Clients ──────────────────────────────────────────────────────────────────

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set.");
  }
  return new Anthropic({ apiKey });
}

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

// ── Helpers ──────────────────────────────────────────────────────────────────

const YARN_WEIGHT_DESCRIPTIONS: Record<string, string> = {
  lace: "Lace weight (0) — approx 33–40 sts/4in on US 000–1 needles",
  "super-fine": "Super Fine / Fingering (1) — approx 27–32 sts/4in on US 1–3 needles",
  fine: "Fine / Sport (2) — approx 23–26 sts/4in on US 3–5 needles",
  light: "Light / DK (3) — approx 21–24 sts/4in on US 5–7 needles",
  medium: "Medium / Worsted (4) — approx 16–20 sts/4in on US 7–9 needles",
  bulky: "Bulky (5) — approx 12–15 sts/4in on US 9–11 needles",
  "super-bulky": "Super Bulky (6) — approx 7–11 sts/4in on US 11–17 needles",
  jumbo: "Jumbo (7) — approx 6 sts or fewer /4in on US 17+ needles",
};

function describeWeight(weight: string): string {
  return YARN_WEIGHT_DESCRIPTIONS[weight] ?? weight;
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse and validate the request body
  let body: EstimateRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { patternYarnWeight, patternGauge, userYarnWeight } = body;

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

  // 2. Call Claude with tool use to guarantee structured JSON output
  let aiResult: EstimateAIResponse;
  try {
    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: [
        {
          name: "return_gauge_estimate",
          description:
            "Return the estimated gauge and technical reasoning for a yarn substitution.",
          input_schema: {
            type: "object" as const,
            properties: {
              estimatedGauge: {
                type: "number",
                description:
                  "Estimated stitches per 4 inches for the substitute yarn, rounded to the nearest 0.5",
              },
              reasoning: {
                type: "string",
                description:
                  "2–4 sentences explaining the technical basis for the gauge estimate",
              },
            },
            required: ["estimatedGauge", "reasoning"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "return_gauge_estimate" },
      system:
        "You are an expert knitting technical editor with decades of experience in yarn substitution and gauge adjustments. When given a pattern's original yarn weight and gauge, plus a knitter's substitute yarn weight, calculate the estimated gauge the knitter should aim for.",
      messages: [
        {
          role: "user",
          content: `Pattern yarn weight: ${describeWeight(patternYarnWeight)}
Pattern gauge: ${patternGauge} stitches per 4 inches
Knitter's substitute yarn weight: ${describeWeight(userYarnWeight)}

Calculate the estimated gauge (stitches per 4 inches) the knitter should target with their substitute yarn.`,
        },
      ],
    });

    // tool_choice forces exactly one tool_use block
    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude did not return a tool_use block.");
    }

    const input = toolUse.input as Partial<EstimateAIResponse>;
    if (typeof input.estimatedGauge !== "number" || typeof input.reasoning !== "string") {
      throw new Error("Claude tool response did not match the expected schema.");
    }

    aiResult = {
      estimatedGauge: input.estimatedGauge,
      reasoning: input.reasoning,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Claude error.";
    console.error("[estimate] Claude error:", message);
    return NextResponse.json(
      { error: `AI estimation failed: ${message}` },
      { status: 502 }
    );
  }

  // 3. Log to Supabase (non-blocking — we still return the result on DB failure)
  try {
    const supabase = getSupabaseClient();
    const { error: dbError } = await supabase.from("yarn_intelligence").insert([
      {
        pattern_yarn_weight: patternYarnWeight,
        pattern_gauge: patternGauge,
        user_yarn_weight: userYarnWeight,
        estimated_gauge: aiResult.estimatedGauge,
      },
    ]);
    if (dbError) {
      console.warn("[estimate] Supabase insert warning:", dbError.message);
    }
  } catch (err) {
    console.warn("[estimate] Supabase client error:", err);
  }

  // 4. Return result to client
  return NextResponse.json(aiResult, { status: 200 });
}
