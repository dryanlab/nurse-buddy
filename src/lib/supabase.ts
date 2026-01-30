import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Initialize Supabase client eagerly so it can detect OAuth hash fragments
// on page load (Supabase JS v2 processes #access_token in constructor)
let _supabase: SupabaseClient | null = null;

if (typeof window !== "undefined" && isSupabaseConfigured) {
  _supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      detectSessionInUrl: true,
      flowType: "implicit",
    },
  });
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!_supabase) {
    _supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        detectSessionInUrl: true,
        flowType: "implicit",
      },
    });
  }
  return _supabase;
}
