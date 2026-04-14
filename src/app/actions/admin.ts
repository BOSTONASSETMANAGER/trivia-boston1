'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface WeeklyWinner {
  weekNumber: number;
  userId: string;
  name: string;
  email: string;
  score: number;
  totalTimeMs: number;
  completedAt: string;
}

export interface WeekStats {
  weekNumber: number;
  totalPlayers: number;
  totalSessions: number;
  avgScore: number;
  avgTimeMs: number;
  winners: WeeklyWinner[];
}

export interface AdminStats {
  totalUsers: number;
  totalSessions: number;
  weeks: WeekStats[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createSupabaseServerClient();

  // Total users
  const { count: totalUsers } = await supabase
    .from('trivia_users')
    .select('*', { count: 'exact', head: true });

  // Total sessions
  const { count: totalSessions } = await supabase
    .from('trivia_sessions')
    .select('*', { count: 'exact', head: true });

  // All sessions grouped data
  const { data: sessions } = await supabase
    .from('trivia_sessions')
    .select('week_number, user_id, score, total_time_ms, completed_at')
    .order('week_number', { ascending: true })
    .order('score', { ascending: false })
    .order('total_time_ms', { ascending: true });

  // All users for email lookup
  const { data: users } = await supabase
    .from('trivia_users')
    .select('id, name, email');

  const userMap = new Map(users?.map((u) => [u.id, u]) ?? []);

  // Group sessions by week
  const weekMap = new Map<number, typeof sessions>();
  for (const s of sessions ?? []) {
    const arr = weekMap.get(s.week_number) ?? [];
    arr.push(s);
    weekMap.set(s.week_number, arr);
  }

  const weeks: WeekStats[] = [];

  for (const [weekNumber, weekSessions] of weekMap) {
    // Best session per user (already sorted by score desc, time asc)
    const bestByUser = new Map<string, (typeof weekSessions)[0]>();
    for (const s of weekSessions) {
      if (!bestByUser.has(s.user_id)) {
        bestByUser.set(s.user_id, s);
      }
    }

    const uniquePlayers = bestByUser.size;
    const totalWeekSessions = weekSessions.length;
    const avgScore =
      weekSessions.reduce((sum, s) => sum + s.score, 0) / totalWeekSessions;
    const avgTimeMs =
      weekSessions.reduce((sum, s) => sum + s.total_time_ms, 0) /
      totalWeekSessions;

    // Top 3 winners (best session per user, sorted)
    const sorted = Array.from(bestByUser.values());
    const top3 = sorted.slice(0, 3);

    const winners: WeeklyWinner[] = top3.map((s) => {
      const user = userMap.get(s.user_id);
      return {
        weekNumber,
        userId: s.user_id,
        name: user?.name ?? 'Desconocido',
        email: user?.email ?? '',
        score: s.score,
        totalTimeMs: s.total_time_ms,
        completedAt: s.completed_at,
      };
    });

    weeks.push({
      weekNumber,
      totalPlayers: uniquePlayers,
      totalSessions: totalWeekSessions,
      avgScore: Math.round(avgScore * 100) / 100,
      avgTimeMs: Math.round(avgTimeMs),
      winners,
    });
  }

  return {
    totalUsers: totalUsers ?? 0,
    totalSessions: totalSessions ?? 0,
    weeks,
  };
}
