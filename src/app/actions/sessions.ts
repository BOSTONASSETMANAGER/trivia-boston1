'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireActiveSession } from '@/lib/auth/auth-session';

type SaveSessionResult = { ok: true } | { ok: false; error: string };

export async function saveSession(
  _userId: string,
  weekNumber: number,
  score: number,
  totalTimeMs: number
): Promise<SaveSessionResult> {
  const session = await requireActiveSession();
  if (!session.ok) {
    return { ok: false, error: 'session_expired' };
  }

  if (score < 0 || score > 3) return { ok: false, error: 'Score invalido' };
  if (totalTimeMs < 0) return { ok: false, error: 'Tiempo invalido' };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('trivia_sessions').insert({
    user_id: session.userId,
    week_number: weekNumber,
    score,
    total_time_ms: totalTimeMs,
  });

  if (error) return { ok: false, error: 'No se pudo guardar la partida' };
  return { ok: true };
}
