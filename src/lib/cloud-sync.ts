// Centralized cloud sync for all user data → Supabase user_progress table
// localStorage remains primary; cloud is secondary (fire-and-forget on save, load on init)

import { getSupabase } from "./supabase";

type ColumnName = "progress_data" | "coins_data" | "achievements_data" | "srs_data";

// ─── Get current user ID from Supabase session ──────────────

async function getUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Debounce per column ─────────────────────────────────────

const debounceTimers: Partial<Record<ColumnName, ReturnType<typeof setTimeout>>> = {};
const DEBOUNCE_MS = 5000;

// ─── Save one column to cloud (debounced) ────────────────────

export function syncColumnToCloud(column: ColumnName, data: unknown): void {
  if (typeof window === "undefined") return;

  if (debounceTimers[column]) clearTimeout(debounceTimers[column]);
  debounceTimers[column] = setTimeout(() => {
    _doSync(column, data);
  }, DEBOUNCE_MS);
}

async function _doSync(column: ColumnName, data: unknown): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const payload: Record<string, unknown> = {
      user_id: userId,
      [column]: data,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("user_progress").upsert(payload, { onConflict: "user_id" });
  } catch {
    // Silently ignore — localStorage is the source of truth
  }
}

// ─── Load one column from cloud ──────────────────────────────

export async function loadColumnFromCloud<T>(column: ColumnName): Promise<T | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select(column)
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;
    const val = (data as Record<string, unknown>)[column];
    if (!val || (typeof val === "object" && Object.keys(val as object).length === 0)) return null;
    return val as T;
  } catch {
    return null;
  }
}

// ─── Load all columns at once (for init) ─────────────────────

export interface CloudData {
  progress_data: unknown | null;
  coins_data: unknown | null;
  achievements_data: unknown | null;
  srs_data: unknown | null;
  updated_at: string | null;
}

export async function loadAllFromCloud(): Promise<CloudData | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("progress_data, coins_data, achievements_data, srs_data, updated_at")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;
    return data as CloudData;
  } catch {
    return null;
  }
}
