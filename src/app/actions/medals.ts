'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { weeks, nowInTriviaTZ } from '@/data/questions';
import { evaluateMedals, type SessionRow } from '@/lib/medals/evaluator';
import { MEDAL_CATALOG, TOTAL_MEDAL_COINS } from '@/lib/medals/catalog';

export interface UserMedalsResult {
  unlockedIds: string[];
  progress: Record<string, number>;
  totalGames: number;
  /** Total Boston Coins ganadas via medallas. */
  coinsFromMedals: number;
  /** Maximo posible si se desbloquean todas. */
  totalMedalCoins: number;
  /** Balance real del wallet del Prode (mundial_users.wallet_balance). null si no hay enlace. */
  walletBalance: number | null;
}

const TX_TAG_PREFIX = '[trivia-medal:';

/**
 * Sincroniza las medallas desbloqueadas con el wallet del prode (mundial_users)
 * matcheando por email. Idempotente: cada medalla se acredita una sola vez,
 * usando un tag `[trivia-medal:<id>]` en mundial_wallet_transactions.description.
 *
 * Si el usuario no tiene cuenta en el prode o las tablas mundial_* no existen,
 * retorna null silenciosamente.
 */
async function syncMedalCoinsToWallet(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  triviaUserEmail: string,
  unlockedIds: string[],
): Promise<number | null> {
  try {
    const { data: mu, error: muErr } = await supabase
      .from('mundial_users')
      .select('id, wallet_balance')
      .eq('email', triviaUserEmail)
      .maybeSingle();

    if (muErr || !mu) return null;

    const { data: existingTx } = await supabase
      .from('mundial_wallet_transactions')
      .select('description')
      .eq('user_id', mu.id)
      .like('description', `${TX_TAG_PREFIX}%`);

    const credited = new Set<string>();
    for (const tx of existingTx ?? []) {
      const desc = (tx as { description: string | null }).description ?? '';
      const m = desc.match(/\[trivia-medal:([^\]]+)\]/);
      if (m) credited.add(m[1]);
    }

    let newBalance = Number(mu.wallet_balance ?? 0);
    const inserts: Array<{
      user_id: string;
      type: 'prize';
      amount: number;
      description: string;
    }> = [];

    for (const id of unlockedIds) {
      if (credited.has(id)) continue;
      const medal = MEDAL_CATALOG.find((m) => m.id === id);
      if (!medal) continue;
      newBalance += medal.coins;
      inserts.push({
        user_id: mu.id,
        type: 'prize',
        amount: medal.coins,
        description: `${TX_TAG_PREFIX}${medal.id}] Medalla: ${medal.name}`,
      });
    }

    if (inserts.length > 0) {
      const { error: insErr } = await supabase
        .from('mundial_wallet_transactions')
        .insert(inserts);
      if (insErr) return Number(mu.wallet_balance ?? 0);

      await supabase
        .from('mundial_users')
        .update({ wallet_balance: newBalance })
        .eq('id', mu.id);
    }

    return newBalance;
  } catch {
    return null;
  }
}

export async function getUserMedals(userId: string): Promise<UserMedalsResult> {
  const empty: UserMedalsResult = {
    unlockedIds: [],
    progress: {},
    totalGames: 0,
    coinsFromMedals: 0,
    totalMedalCoins: TOTAL_MEDAL_COINS,
    walletBalance: null,
  };
  if (!userId) return empty;

  const supabase = createSupabaseServerClient();

  const { data: sessionRows, error: sessErr } = await supabase
    .from('trivia_sessions')
    .select('week_number, score, total_time_ms')
    .eq('user_id', userId);

  if (sessErr || !sessionRows) return empty;

  const sessions: SessionRow[] = sessionRows.map((r) => ({
    weekNumber: Number(r.week_number),
    score: Number(r.score),
    totalTimeMs: Number(r.total_time_ms),
  }));

  const today = nowInTriviaTZ().date;
  const closedWeekNumbers = new Set(
    weeks.filter((w) => w.availableDate < today).map((w) => w.weekNumber),
  );
  const userClosedWeeks = Array.from(
    new Set(
      sessions
        .map((s) => s.weekNumber)
        .filter((w) => closedWeekNumbers.has(w)),
    ),
  );

  const closedWeekPositions: Record<number, number> = {};
  if (userClosedWeeks.length > 0) {
    const { data: lbRows } = await supabase
      .from('trivia_leaderboard')
      .select('user_id, week_number, score, total_time_ms')
      .in('week_number', userClosedWeeks);

    if (lbRows) {
      const byWeek = new Map<
        number,
        Array<{ user_id: string; score: number; total_time_ms: number }>
      >();
      for (const row of lbRows) {
        const w = Number(row.week_number);
        if (!byWeek.has(w)) byWeek.set(w, []);
        byWeek.get(w)!.push({
          user_id: row.user_id,
          score: Number(row.score),
          total_time_ms: Number(row.total_time_ms),
        });
      }
      for (const [w, rows] of byWeek) {
        rows.sort(
          (a, b) =>
            b.score - a.score || a.total_time_ms - b.total_time_ms,
        );
        const idx = rows.findIndex((r) => r.user_id === userId);
        if (idx >= 0) closedWeekPositions[w] = idx + 1;
      }
    }
  }

  const evalResult = evaluateMedals({ sessions, closedWeekPositions });

  const coinsFromMedals = evalResult.unlockedIds.reduce((sum, id) => {
    const m = MEDAL_CATALOG.find((mm) => mm.id === id);
    return sum + (m?.coins ?? 0);
  }, 0);

  // El sync con el wallet del Prode esta deshabilitado: el server de trivia
  // usa la publishable key (anon) y las RLS del prode rechazan los inserts,
  // dejando un wallet_balance=0 que tapaba la UI con 0 BC aunque hubiese
  // medallas desbloqueadas. La migracion al Prode se hara al final del torneo.
  void syncMedalCoinsToWallet;

  return {
    unlockedIds: evalResult.unlockedIds,
    progress: evalResult.progress,
    totalGames: sessions.length,
    coinsFromMedals,
    totalMedalCoins: TOTAL_MEDAL_COINS,
    walletBalance: null,
  };
}
