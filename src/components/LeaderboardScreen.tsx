'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award, Clock, Star } from 'lucide-react';
import { getLeaderboard } from '@/app/actions/leaderboard';
import type { LeaderboardEntry } from '@/types/game';

interface LeaderboardScreenProps {
  weekNumber: number;
  weekTitle: string;
  currentUserId: string | null;
  onBack: () => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LeaderboardScreen({
  weekNumber,
  weekTitle,
  currentUserId,
}: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getLeaderboard(weekNumber).then((data) => {
      if (mounted) {
        setEntries(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [weekNumber]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-5 pb-32"
      style={{ paddingTop: 'max(3rem, env(safe-area-inset-top, 3rem))' }}
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
            <Trophy className="h-3 w-3 text-primary" />
            <span className="boston-overline !text-[10px]">Ranking</span>
          </div>
          <h1 className="boston-title mb-1 text-3xl">Semana {weekNumber}</h1>
          <div className="divider-glow mx-auto mt-3 w-20" />
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-primary/70">
            {weekTitle}
          </p>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          </div>
        )}

        {!loading && entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="glass-card-elevated rounded-2xl p-8 text-center"
          >
            <div className="boston-icon-box mx-auto mb-3">
              <Trophy className="h-7 w-7" />
            </div>
            <p className="boston-title mb-1 text-base">Sin partidas aun</p>
            <p className="text-xs text-outline">
              Se el primero en la tabla de esta semana.
            </p>
          </motion.div>
        )}

        {/* Podium (top 3) */}
        {!loading && top3.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card-elevated mb-5 rounded-2xl p-5"
          >
            <p className="boston-overline mb-4 text-center">Podio</p>
            <div className="flex items-end justify-center gap-2">
              {top3.length > 1 && (
                <PodiumBlock
                  entry={top3[1]}
                  place={2}
                  heightClass="h-28"
                  icon={<Medal className="h-5 w-5 text-slate-400" />}
                  isCurrent={top3[1].userId === currentUserId}
                />
              )}
              {top3[0] && (
                <PodiumBlock
                  entry={top3[0]}
                  place={1}
                  heightClass="h-36"
                  icon={<Trophy className="h-6 w-6 text-primary" />}
                  isCurrent={top3[0].userId === currentUserId}
                  highlight
                />
              )}
              {top3.length > 2 && (
                <PodiumBlock
                  entry={top3[2]}
                  place={3}
                  heightClass="h-20"
                  icon={<Award className="h-5 w-5 text-sky-700" />}
                  isCurrent={top3[2].userId === currentUserId}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Rest of list */}
        {!loading && rest.length > 0 && (
          <>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="boston-overline mb-3"
            >
              Resto de la tabla
            </motion.p>
            <div className="space-y-2">
              {rest.map((entry, i) => {
                const isCurrent = entry.userId === currentUserId;
                return (
                  <motion.div
                    key={entry.sessionId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.04 }}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      isCurrent
                        ? 'border-primary/40 bg-primary/10 shadow-[0_4px_15px_rgba(37,99,235,0.15)]'
                        : 'glass-card'
                    }`}
                  >
                    <span
                      className={`w-6 text-center font-headline text-sm font-bold tabular-nums ${
                        isCurrent ? 'text-primary' : 'text-outline'
                      }`}
                    >
                      {i + 4}
                    </span>
                    <span
                      className={`flex-1 truncate text-sm font-semibold ${
                        isCurrent ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {entry.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-outline">
                      <Star className="h-3 w-3 fill-secondary text-secondary" />
                      {entry.score}/3
                    </span>
                    <span className="flex items-center gap-1 font-mono text-xs tabular-nums text-outline">
                      <Clock className="h-3 w-3" />
                      {formatTime(entry.totalTimeMs)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function PodiumBlock({
  entry,
  place,
  heightClass,
  icon,
  isCurrent,
  highlight = false,
}: {
  entry: LeaderboardEntry;
  place: number;
  heightClass: string;
  icon: React.ReactNode;
  isCurrent: boolean;
  highlight?: boolean;
}) {
  const totalSec = Math.floor(entry.totalTimeMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + (place - 1) * 0.1, type: 'spring' }}
      className="flex flex-1 flex-col items-center"
    >
      <div className="mb-2">{icon}</div>
      <p
        className={`mb-1 max-w-[80px] truncate text-center text-[11px] font-bold ${
          isCurrent || highlight ? 'text-primary' : 'text-on-surface'
        }`}
      >
        {entry.name}
      </p>
      <p className="mb-1 flex items-center gap-0.5 text-[10px] text-outline">
        <Star
          className={`h-2.5 w-2.5 ${
            highlight
              ? 'fill-secondary text-secondary'
              : 'fill-outline text-outline'
          }`}
        />
        {entry.score}/3
      </p>
      <p className="mb-2 font-mono text-[9px] tabular-nums text-outline">
        {m}:{s.toString().padStart(2, '0')}
      </p>
      <div
        className={`${heightClass} flex w-full items-start justify-center rounded-t-xl border pt-2 ${
          highlight
            ? 'border-primary/50 bg-gradient-to-t from-primary/20 to-primary/5 shadow-[0_-4px_15px_rgba(37,99,235,0.15)]'
            : isCurrent
              ? 'border-primary/40 bg-gradient-to-t from-primary/15 to-primary/5'
              : 'border-outline-variant bg-gradient-to-t from-white/70 to-white/30'
        }`}
      >
        <span
          className={`font-headline text-2xl font-bold ${
            highlight || isCurrent ? 'text-primary' : 'text-outline'
          }`}
          style={{ letterSpacing: '-0.02em' }}
        >
          {place}
        </span>
      </div>
    </motion.div>
  );
}
