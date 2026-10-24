import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function isBrowserSafeKey(value: string): boolean {
  if (value.startsWith("sb_publishable_")) return true;

  const segments = value.split(".");
  if (segments.length !== 3) return false;

  try {
    const payload = JSON.parse(atob(segments[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role === "anon";
  } catch {
    return false;
  }
}

export const supabaseConfigured = Boolean(url && key);

if (url && !/^https:\/\/[a-z0-9.-]+\.supabase\.co$/i.test(url)) {
  throw new Error("VITE_SUPABASE_URL must be an HTTPS Supabase project URL.");
}

if (key && !isBrowserSafeKey(key)) {
  throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY must be a publishable key or legacy anon JWT, never a service-role or secret key.");
}

export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
