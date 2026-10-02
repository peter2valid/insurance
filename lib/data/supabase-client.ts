import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service_role key (bypasses RLS —
 * see supabase/schema.sql). Returns null when the keys aren't set, so local
 * development falls back to the in-memory mock.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Never prefix these with
 * NEXT_PUBLIC_ — the key must never reach the browser.
 */
let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return client;
}

export function usingSupabase(): boolean {
  return getSupabase() !== null;
}

export const DOCUMENTS_BUCKET = "documents";
