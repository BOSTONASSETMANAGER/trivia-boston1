-- 2026-04-22: RLS policies for auth + admin tables
-- Fix: trivia_auth_sessions, trivia_admin_sessions, trivia_admin_attempts had
-- RLS enabled but zero policies, so all INSERT/SELECT/UPDATE from the server
-- actions (which use the publishable anon key) were being rejected silently.
-- Effect: createAuthSession always failed, requireActiveSession always returned
-- revoked, saveSession always returned session_expired, leaderboard stayed empty.

-- trivia_auth_sessions
CREATE POLICY "trivia_auth_sessions_insert_public"
  ON public.trivia_auth_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "trivia_auth_sessions_select_public"
  ON public.trivia_auth_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "trivia_auth_sessions_update_public"
  ON public.trivia_auth_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- trivia_admin_sessions
CREATE POLICY "trivia_admin_sessions_insert_public"
  ON public.trivia_admin_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "trivia_admin_sessions_select_public"
  ON public.trivia_admin_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "trivia_admin_sessions_update_public"
  ON public.trivia_admin_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- trivia_admin_attempts
CREATE POLICY "trivia_admin_attempts_insert_public"
  ON public.trivia_admin_attempts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "trivia_admin_attempts_select_public"
  ON public.trivia_admin_attempts FOR SELECT TO anon, authenticated USING (true);
