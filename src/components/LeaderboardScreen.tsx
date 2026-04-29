'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Trophy, Medal, Award, Clock, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { getLeaderboard } from '@/app/actions/leaderboard';
import { getAvatarForUser } from '@/lib/avatar';
import UserProfileModal from '@/components/UserProfileModal';
import { weeks } from '@/data/questions';
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
  const sortedWeeks = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber);
  const initialIndex = Math.max(
    0,
    sortedWeeks.findIndex((w) => w.weekNumber === weekNumber)
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeWeek = sortedWeeks[activeIndex] ?? sortedWeeks[sortedWeeks.length - 1];
  const activeWeekNumber = activeWeek?.weekNumber ?? weekNumber;
  const activeWeekTitle = activeWeek?.title ?? weekTitle;

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const fadeDuration = prefersReducedMotion ? 0 : 0.4;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getLeaderboard(activeWeekNumber).then((data) => {
      if (mounted) {
        setEntries(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [activeWeekNumber]);

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < sortedWeeks.length - 1;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeDuration }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-5"
      style={{
        paddingTop: 'max(3rem, calc(env(safe-area-inset-top, 0px) + 3rem))',
        paddingBottom:
          'calc(env(safe-area-inset-bottom, 0px) + 8rem)',
      }}
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
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => canGoPrev && setActiveIndex((i) => i - 1)}
              disabled={!canGoPrev}
              aria-label="Semana anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface transition-all hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-outline-variant disabled:hover:text-on-surface"
              style={{ touchAction: 'manipulation' }}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
            </button>
            <h1 className="boston-title min-w-[8.5rem] text-3xl">
              Semana {activeWeekNumber}
            </h1>
            <button
              type="button"
              onClick={() => canGoNext && setActiveIndex((i) => i + 1)}
              disabled={!canGoNext}
              aria-label="Semana siguiente"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface transition-all hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-outline-variant disabled:hover:text-on-surface"
              style={{ touchAction: 'manipulation' }}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
          <div className="divider-glow mx-auto mt-3 w-20" />
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-primary/70">
            {activeWeekTitle}
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
                  avatarSize={40}
                  borderColor="border-t-slate-400"
                  prefersReducedMotion={!!prefersReducedMotion}
                  onSelect={setSelectedUserId}
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
                  avatarSize={48}
                  borderColor="border-t-[#d4a853]"
                  prefersReducedMotion={!!prefersReducedMotion}
                  onSelect={setSelectedUserId}
                />
              )}
              {top3.length > 2 && (
                <PodiumBlock
                  entry={top3[2]}
                  place={3}
                  heightClass="h-20"
                  icon={<Award className="h-5 w-5 text-sky-700" />}
                  isCurrent={top3[2].userId === currentUserId}
                  avatarSize={40}
                  borderColor="border-t-[#b87333]"
                  prefersReducedMotion={!!prefersReducedMotion}
                  onSelect={setSelectedUserId}
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
            <div
              className="space-y-2"
              style={{ contain: 'content' }}
            >
              {rest.map((entry, i) => {
                const isCurrent = entry.userId === currentUserId;
                const rowInitial = prefersReducedMotion
                  ? { opacity: 0, x: 0 }
                  : { opacity: 0, x: -10 };
                const rowTransition = prefersReducedMotion
                  ? { duration: 0.15 }
                  : { delay: 0.4 + Math.min(i, 10) * 0.04 };
                return (
                  <motion.div
                    key={entry.sessionId}
                    initial={rowInitial}
                    animate={{ opacity: 1, x: 0 }}
                    transition={rowTransition}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-300 hover:shadow-lg ${
                      isCurrent
                        ? 'border-l-4 border-l-primary border-primary/40 bg-[#f8fafc] shadow-[0_4px_15px_rgba(37,99,235,0.15)]'
                        : 'glass-card hover:-translate-y-0.5'
                    }`}
                    style={{ contain: 'layout paint' }}
                    onClick={() => setSelectedUserId(entry.userId)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver perfil de ${entry.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedUserId(entry.userId);
                      }
                    }}
                  >
                    {/* Rank */}
                    <span
                      className={`w-6 text-center font-headline text-sm font-bold tabular-nums ${
                        isCurrent ? 'text-primary' : 'text-outline'
                      }`}
                    >
                      {i + 4}
                    </span>

                    {/* Avatar */}
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-primary/20">
                      <Image
                        src={getAvatarForUser(entry.userId)}
                        alt={entry.name}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Name + time */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={`truncate text-sm font-semibold ${
                          isCurrent ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        {entry.name}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#64748b]">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTime(entry.totalTimeMs)}
                      </span>
                    </div>

                    {/* Score */}
                    <span className="flex items-center gap-1 text-xs text-outline">
                      <Star className="h-3 w-3 fill-secondary text-secondary" />
                      {entry.score}/3
                    </span>

                    {/* Chevron */}
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#64748b]" />
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Profile modal */}
      <AnimatePresence>
        {selectedUserId && (
          <UserProfileModal
            key={selectedUserId}
            userId={selectedUserId}
            weekNumber={activeWeekNumber}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </AnimatePresence>
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
  avatarSize,
  borderColor,
  prefersReducedMotion,
  onSelect,
}: {
  entry: LeaderboardEntry;
  place: number;
  heightClass: string;
  icon: React.ReactNode;
  isCurrent: boolean;
  highlight?: boolean;
  avatarSize: number;
  borderColor: string;
  prefersReducedMotion: boolean;
  onSelect: (userId: string) => void;
}) {
  const totalSec = Math.floor(entry.totalTimeMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const avatarSrc = getAvatarForUser(entry.userId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.1 }
          : { delay: 0.35 + (place - 1) * 0.1, type: 'spring' }
      }
      className="flex flex-1 cursor-pointer flex-col items-center transition-all duration-300 hover:-translate-y-1"
      onClick={() => onSelect(entry.userId)}
      role="button"
      tabIndex={0}
      aria-label={`Ver perfil de ${entry.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(entry.userId);
        }
      }}
    >
      {/* Icon */}
      <div className="mb-2">{icon}</div>

      {/* Avatar with rank badge */}
      <div className="relative mb-2">
        <div
          className="overflow-hidden rounded-full border border-primary/20"
          style={{ width: avatarSize, height: avatarSize }}
        >
          <Image
            src={avatarSrc}
            alt={entry.name}
            width={avatarSize}
            height={avatarSize}
            className="h-full w-full object-cover"
          />
        </div>
        <span
          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{
            background:
              place === 1
                ? '#d4a853'
                : place === 2
                  ? '#94a3b8'
                  : '#b87333',
          }}
        >
          {place}
        </span>
      </div>

      {/* Name */}
      <p
        className={`mb-1 max-w-[80px] truncate text-center text-[11px] font-bold ${
          isCurrent || highlight ? 'text-primary' : 'text-on-surface'
        }`}
      >
        {entry.name}
      </p>

      {/* Score */}
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

      {/* Time */}
      <p className="mb-2 font-mono text-[9px] tabular-nums text-outline">
        {m}:{s.toString().padStart(2, '0')}
      </p>

      {/* Podium bar */}
      <div
        className={`${heightClass} flex w-full items-start justify-center rounded-t-xl border-t-4 ${borderColor} border pt-2 ${
          highlight
            ? 'border-primary/50 bg-white shadow-[0_-4px_15px_rgba(37,99,235,0.15)]'
            : isCurrent
              ? 'border-primary/40 bg-[#f8fafc]'
              : 'border-outline-variant bg-white'
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
