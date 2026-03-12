import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
  );
}

// Server-only client — never import this in client components.
// Uses the service role key so it bypasses RLS.
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
