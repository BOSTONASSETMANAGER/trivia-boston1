import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const COOKIE_NAME = 'trivia_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days — server enforces real revocation

interface CreateSessionParams {
  userId: string;
  fingerprintHash: string;
  ipHash: string;
  userAgent: string;
}

export async function createAuthSession(params: CreateSessionParams): Promise<string | null> {
  const supabase = createSupabaseServerClient();

  // Session displacement temporarily disabled: multiple concurrent sessions
  // per user are allowed to avoid false "logged in from another device" errors.

  const { data, error } = await supabase
    .from('trivia_auth_sessions')
    .insert({
      user_id: params.userId,
      fingerprint_hash: params.fingerprintHash,
      ip_hash: params.ipHash,
      user_agent: params.userAgent,
    })
    .select('id')
    .single();

  if (error || !data) return null;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return data.id;
}

export type SessionCheck =
  | { ok: true; userId: string; sessionId: string }
  | { ok: false; reason: 'no_cookie' | 'revoked' };

export async function requireActiveSession(): Promise<SessionCheck> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) return { ok: false, reason: 'no_cookie' };

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('trivia_auth_sessions')
    .select('id, user_id, revoked_at')
    .eq('id', cookie)
    .maybeSingle();

  if (!data || data.revoked_at) {
    cookieStore.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return { ok: false, reason: 'revoked' };
  }

  // Best-effort touch (don't await failure paths)
  await supabase
    .from('trivia_auth_sessions')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', cookie);

  return { ok: true, userId: data.user_id, sessionId: data.id };
}

export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;

  if (cookie) {
    const supabase = createSupabaseServerClient();
    await supabase
      .from('trivia_auth_sessions')
      .update({ revoked_at: new Date().toISOString(), revoked_reason: 'logout' })
      .eq('id', cookie)
      .is('revoked_at', null);
  }

  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
