import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Loose but practical RFC 5321 check — prevents clearly invalid values
// without over-rejecting edge cases.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email =
    typeof (body as Record<string, unknown>).email === "string"
      ? ((body as Record<string, unknown>).email as string).trim().toLowerCase()
      : null;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 422 });
  }

  const { error } = await getSupabase()
    .from("email_signups")
    .insert({ email })
    .single();

  if (error) {
    // Postgres unique violation — already subscribed
    if (error.code === "23505") {
      // Return 200 so the UI shows the same success state either way.
      // No need to tell the user they already signed up.
      return NextResponse.json({ ok: true });
    }
    console.error("[subscribe] Supabase error:", error);
    return NextResponse.json({ error: "Failed to save email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
