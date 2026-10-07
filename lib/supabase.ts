import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Referenced literally so Next.js inlines them into the browser bundle.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

/** Browser Supabase client. All access control is enforced by RLS in the database. */
export function supabase(): SupabaseClient {
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and fill in your project URL and key."
    );
  }
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

/** Turn a Supabase/Postgres error into a sentence a person can read. */
export function friendlyError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!err) return fallback;
  const e = err as { message?: string; code?: string };
  // Our own triggers raise human-written messages with this code.
  if (e.code === "P0001" && e.message) return e.message;
  if (e.code === "23505") return "You've already done that.";
  if (e.message?.includes("Invalid login credentials")) return "That email and password don't match.";
  if (e.message?.includes("Email not confirmed")) return "Confirm your email first — check your inbox for the link.";
  if (e.message?.includes("User already registered")) return "An account with that email already exists. Try logging in.";
  if (e.message?.toLowerCase().includes("password")) return e.message;
  if (e.message?.includes("rate limit")) return "Too many attempts. Wait a minute and try again.";
  return fallback;
}
