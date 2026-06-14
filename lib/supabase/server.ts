import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL
} from "@/lib/supabase/config";

/**
 * Cookie-bound server client. Use it to read the signed-in admin session
 * inside Server Components, Route Handlers, and Server Actions.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components can read cookies but cannot always write refreshed
          // session cookies; Server Actions and Route Handlers still can.
        }
      }
    }
  });
}

/**
 * Service-role client. Bypasses RLS for privileged reads/writes (admin CMS,
 * contact inbox, storage uploads, seeding). Server-only — never import in a
 * client component.
 */
export function createSupabaseAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
