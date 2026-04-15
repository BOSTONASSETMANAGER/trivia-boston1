-- 2026-04-15: Auth sessions table + IP-based fingerprint index
-- Implements: 1 active auth session per user (displaced on new login),
--             max 2 accounts per IP (lifetime, enforced at registration).

-- Auth session table (separate from trivia_sessions, which stores game results)
CREATE TABLE IF NOT EXISTS public.trivia_auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.trivia_users(id) ON DELETE CASCADE,
  fingerprint_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ NULL,
  revoked_reason TEXT NULL CHECK (revoked_reason IN ('displaced', 'logout', 'expired'))
);

-- Fast lookup of the active session for a given user
CREATE INDEX IF NOT EXISTS trivia_auth_sessions_user_active_idx
  ON public.trivia_auth_sessions (user_id)
  WHERE revoked_at IS NULL;

-- Fast lookup of an active session by id (cookie value)
CREATE INDEX IF NOT EXISTS trivia_auth_sessions_id_active_idx
  ON public.trivia_auth_sessions (id)
  WHERE revoked_at IS NULL;

-- Fast IP-based account counting at registration time
CREATE INDEX IF NOT EXISTS trivia_fingerprints_ip_hash_idx
  ON public.trivia_fingerprints (ip_hash);

-- RLS: deny all by default; server actions use the publishable key and
-- access this table only through the service-role-equivalent flow.
ALTER TABLE public.trivia_auth_sessions ENABLE ROW LEVEL SECURITY;
