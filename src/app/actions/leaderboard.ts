'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { LeaderboardEntry } from '@/types/game';

export async function getLeaderboard(
  weekNumber: number,
  limit = 100
): Promise<LeaderboardEntry[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('trivia_leaderboard')
    .select('session_id, user_id, name, week_number, score, total_time_ms, completed_at')
    .eq('week_number', weekNumber)
    .order('score', { ascending: false })
    .order('total_time_ms', { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    sessionId: row.session_id,
    userId: row.user_id,
    name: row.name,
    weekNumber: row.week_number,
    score: row.score,
    totalTimeMs: row.total_time_ms,
    completedAt: row.completed_at,
  }));
}
