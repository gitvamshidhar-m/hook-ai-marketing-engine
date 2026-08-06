import { createServerSupabase } from "./supabase-server";
import { supabaseConfigured } from "./supabase";

/**
 * Server-side structured analytics. Inserts into `events` (see supabase/schema_v4.sql).
 * Public insert is allowed; RLS only gates reads to admins. Non-fatal on failure.
 */
export async function trackEvent(
  name: string,
  props?: Record<string, unknown>,
  userId?: string | null
): Promise<void> {
  if (!supabaseConfigured) return;
  try {
    const supabase = await createServerSupabase();
    await supabase.from("events").insert({
      name,
      props: props || {},
      user_id: userId || null,
    });
  } catch (e) {
    console.error("Event tracking failed (non-fatal)", e);
  }
}

/** Track an event using the currently authenticated session's user id, if any. */
export async function trackEventForCurrentUser(
  name: string,
  props?: Record<string, unknown>
): Promise<void> {
  if (!supabaseConfigured) return;
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("events").insert({
      name,
      props: props || {},
      user_id: user?.id || null,
    });
  } catch {
    // non-fatal
  }
}