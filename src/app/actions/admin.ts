'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  deviceInfo: string | null;
  fingerprint: string | null;
}

export interface WeeklyWinner {
  weekNumber: number;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  deviceInfo: string | null;
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

export interface UserHistory {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  deviceInfo: string | null;
  createdAt: string;
  sessions: {
    weekNumber: number;
    score: number;
    totalTimeMs: number;
    completedAt: string;
  }[];
  totalGames: number;
  bestScore: number;
  avgScore: number;
}

export interface AdminStats {
  totalUsers: number;
  totalSessions: number;
  weeks: WeekStats[];
  users: UserHistory[];
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

  // All sessions
  const { data: sessions } = await supabase
    .from('trivia_sessions')
    .select('week_number, user_id, score, total_time_ms, completed_at')
    .order('week_number', { ascending: true })
    .order('score', { ascending: false })
    .order('total_time_ms', { ascending: true });

  // All users with phone
  const { data: users } = await supabase
    .from('trivia_users')
    .select('id, name, email, phone, created_at')
    .order('created_at', { ascending: false });

  // Device info from fingerprints
  const { data: fingerprints } = await supabase
    .from('trivia_fingerprints')
    .select('user_id, user_agent, fingerprint_hash');

  const fpMap = new Map(
    fingerprints?.map((fp) => [fp.user_id, fp]) ?? []
  );

  const userMap = new Map(
    users?.map((u) => [u.id, { ...u, fp: fpMap.get(u.id) }]) ?? []
  );

  // ── Weekly stats with winners ──
  const weekMap = new Map<number, NonNullable<typeof sessions>>();
  for (const s of sessions ?? []) {
    const arr = weekMap.get(s.week_number) ?? [];
    arr.push(s);
    weekMap.set(s.week_number, arr);
  }

  const weeks: WeekStats[] = [];

  for (const [weekNumber, weekSessions] of weekMap) {
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

    const sorted = Array.from(bestByUser.values());
    const top5 = sorted.slice(0, 5);

    const winners: WeeklyWinner[] = top5.map((s) => {
      const user = userMap.get(s.user_id);
      return {
        weekNumber,
        userId: s.user_id,
        name: user?.name ?? 'Desconocido',
        email: user?.email ?? '',
        phone: user?.phone ?? null,
        deviceInfo: user?.fp?.user_agent ?? null,
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

  // ── User history (all users with their sessions) ──
  const sessionsByUser = new Map<string, NonNullable<typeof sessions>>();
  for (const s of sessions ?? []) {
    const arr = sessionsByUser.get(s.user_id) ?? [];
    arr.push(s);
    sessionsByUser.set(s.user_id, arr);
  }

  const userHistories: UserHistory[] = (users ?? []).map((u) => {
    const userSessions = sessionsByUser.get(u.id) ?? [];
    const fp = fpMap.get(u.id);
    const totalGames = userSessions.length;
    const bestScore = userSessions.length > 0
      ? Math.max(...userSessions.map((s) => s.score))
      : 0;
    const avgScore = totalGames > 0
      ? Math.round(
          (userSessions.reduce((sum, s) => sum + s.score, 0) / totalGames) * 100
        ) / 100
      : 0;

    return {
      userId: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      deviceInfo: fp?.user_agent ?? null,
      createdAt: u.created_at,
      sessions: userSessions.map((s) => ({
        weekNumber: s.week_number,
        score: s.score,
        totalTimeMs: s.total_time_ms,
        completedAt: s.completed_at,
      })),
      totalGames,
      bestScore,
      avgScore,
    };
  });

  return {
    totalUsers: totalUsers ?? 0,
    totalSessions: totalSessions ?? 0,
    weeks,
    users: userHistories,
  };
}
