import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// O(N) email sanity check — no regex engine, no backtracking risk.
// Verifies: one @, non-empty local part, domain contains a dot with
// at least one char on each side. The browser's type="email" handles
// stricter validation on the client.
function isPlausibleEmail(email: string): boolean {
  const at = email.indexOf("@");
  if (at < 1) return false;
  if (email.indexOf("@", at + 1) !== -1) return false; // multiple @
  const domain = email.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  return dot >= 1 && dot < domain.length - 1;
}

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

  if (!email || email.length > 254 || !isPlausibleEmail(email)) {
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
