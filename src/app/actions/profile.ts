'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireActiveSession } from '@/lib/auth/auth-session';
import { hashPassword, verifyPassword } from '@/lib/auth/hash';

export interface UserPublicProfile {
  userId: string;
  name: string;
  gamesPlayed: number;
  bestScore: number;
  bestTimeMs: number | null;
  avgTimeMs: number | null;
  joinedAt: string;
}

export async function getUserPublicProfile(
  userId: string,
  weekNumber: number
): Promise<UserPublicProfile | null> {
  const supabase = createSupabaseServerClient();

  // Fetch user name + created_at
  const { data: user } = await supabase
    .from('trivia_users')
    .select('id, name, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (!user) return null;

  // Fetch all sessions for this week
  const { data: sessions } = await supabase
    .from('trivia_sessions')
    .select('score, total_time_ms')
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
    .order('score', { ascending: false })
    .order('total_time_ms', { ascending: true });

  const gamesPlayed = sessions?.length ?? 0;
  const bestScore = sessions?.[0]?.score ?? 0;
  const bestTimeMs = sessions?.[0]?.total_time_ms ?? null;
  const avgTimeMs =
    gamesPlayed > 0
      ? Math.round(
          sessions!.reduce((sum, s) => sum + s.total_time_ms, 0) / gamesPlayed
        )
      : null;

  return {
    userId: user.id,
    name: user.name,
    gamesPlayed,
    bestScore,
    bestTimeMs,
    avgTimeMs,
    joinedAt: user.created_at,
  };
}

// ─── Account management ────────────────────────────────────

export interface MyAccount {
  email: string;
  phone: string | null;
}

export type AccountUpdateResult =
  | { ok: true; account: MyAccount }
  | { ok: false; error: string };

export async function getMyAccount(): Promise<MyAccount | null> {
  const session = await requireActiveSession();
  if (!session.ok) return null;

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('trivia_users')
    .select('email, phone')
    .eq('id', session.userId)
    .maybeSingle();

  if (!data) return null;
  return { email: data.email, phone: data.phone ?? null };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateMyEmail(newEmail: string): Promise<AccountUpdateResult> {
  const session = await requireActiveSession();
  if (!session.ok) return { ok: false, error: 'Sesion expirada' };

  const trimmed = newEmail.trim().toLowerCase();
  if (!trimmed || !EMAIL_RE.test(trimmed)) {
    return { ok: false, error: 'Email invalido' };
  }

  const supabase = createSupabaseServerClient();

  const { data: existing } = await supabase
    .from('trivia_users')
    .select('id')
    .eq('email', trimmed)
    .neq('id', session.userId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { ok: false, error: 'Ese email ya esta en uso' };
  }

  const { data: updated, error } = await supabase
    .from('trivia_users')
    .update({ email: trimmed })
    .eq('id', session.userId)
    .select('email, phone')
    .single();

  if (error || !updated) {
    return { ok: false, error: 'No se pudo actualizar el email' };
  }

  return { ok: true, account: { email: updated.email, phone: updated.phone ?? null } };
}

export async function updateMyPhone(newPhone: string): Promise<AccountUpdateResult> {
  const session = await requireActiveSession();
  if (!session.ok) return { ok: false, error: 'Sesion expirada' };

  const trimmed = newPhone.trim();
  const value = trimmed === '' ? null : trimmed;

  if (value !== null) {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 6 || digits.length > 20) {
      return { ok: false, error: 'Telefono invalido' };
    }
  }

  const supabase = createSupabaseServerClient();
  const { data: updated, error } = await supabase
    .from('trivia_users')
    .update({ phone: value })
    .eq('id', session.userId)
    .select('email, phone')
    .single();

  if (error || !updated) {
    return { ok: false, error: 'No se pudo actualizar el telefono' };
  }

  return { ok: true, account: { email: updated.email, phone: updated.phone ?? null } };
}

export async function updateMyPin(
  currentPin: string,
  newPin: string
): Promise<AccountUpdateResult> {
  const session = await requireActiveSession();
  if (!session.ok) return { ok: false, error: 'Sesion expirada' };

  if (!/^\d{4}$/.test(newPin)) {
    return { ok: false, error: 'El PIN debe ser de 4 digitos' };
  }
  if (!/^\d{4}$/.test(currentPin)) {
    return { ok: false, error: 'PIN actual invalido' };
  }
  if (currentPin === newPin) {
    return { ok: false, error: 'El PIN nuevo debe ser distinto del actual' };
  }

  const supabase = createSupabaseServerClient();
  const { data: user } = await supabase
    .from('trivia_users')
    .select('password_hash')
    .eq('id', session.userId)
    .maybeSingle();

  if (!user) return { ok: false, error: 'Usuario no encontrado' };

  const valid = await verifyPassword(currentPin, user.password_hash);
  if (!valid) return { ok: false, error: 'PIN actual incorrecto' };

  const newHash = await hashPassword(newPin);
  const { data: updated, error } = await supabase
    .from('trivia_users')
    .update({ password_hash: newHash })
    .eq('id', session.userId)
    .select('email, phone')
    .single();

  if (error || !updated) {
    return { ok: false, error: 'No se pudo actualizar el PIN' };
  }

  return { ok: true, account: { email: updated.email, phone: updated.phone ?? null } };
}
