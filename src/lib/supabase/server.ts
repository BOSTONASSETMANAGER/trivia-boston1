import { createServerClient } from '@supabase/ssr';

/**
 * Server-side Supabase client for server actions.
 * Uses the anon publishable key — custom auth flow stores sessions
 * in localStorage on the client, no Supabase Auth session cookies.
 */
export function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          /* no-op: we don't use Supabase Auth cookies */
        },
      },
    }
  );
}
