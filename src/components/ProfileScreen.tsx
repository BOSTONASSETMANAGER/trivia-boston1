'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { LogOut, ChevronRight, ArrowLeft, Lock } from 'lucide-react';
import {
  MEDAL_CATALOG,
  CATEGORY_LABELS,
  TIER_COLORS,
  type Medal,
  type MedalCategory,
} from '@/lib/medals/catalog';
import { getAvatarForUser } from '@/lib/avatar';

interface ProfileScreenProps {
  userId: string;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  unlockedIds?: string[];
}

export default function ProfileScreen({
  userId,
  userName,
  userEmail,
  onLogout,
  unlockedIds = [],
}: ProfileScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const fadeDuration = prefersReducedMotion ? 0 : 0.4;
  const unlockedSet = new Set(unlockedIds);
  const unlockedCount = MEDAL_CATALOG.filter((m) => unlockedSet.has(m.id)).length;
  const totalCount = MEDAL_CATALOG.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const avatarSrc = getAvatarForUser(userId);
  const [selectedCategory, setSelectedCategory] = useState<MedalCategory | null>(null);

  const grouped = MEDAL_CATALOG.reduce(
    (acc, medal) => {
      (acc[medal.category] ||= []).push(medal);
      return acc;
    },
    {} as Record<MedalCategory, Medal[]>,
  );

  const categories = Object.keys(grouped) as MedalCategory[];

  const stagger = (i: number, base = 0.1) =>
    prefersReducedMotion ? 0 : base + i * 0.04;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeDuration }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-4 sm:px-6"
      style={{
        paddingTop: 'max(2rem, calc(env(safe-area-inset-top, 0px) + 2rem))',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)',
      }}
    >
      {/* White container — wider on desktop */}
      <div className="glass-card-elevated flex w-full max-w-sm sm:max-w-lg md:max-w-2xl flex-1 flex-col rounded-2xl p-5 sm:p-6 md:p-8">
        {/* 1. Profile header strip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stagger(0, 0.05) }}
          className="mb-4 flex items-center gap-3 sm:gap-4"
        >
          <div className="relative shrink-0">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-2xl border border-primary/30 shadow-[0_4px_15px_rgba(29,57,105,0.12)]">
              <Image
                src={avatarSrc}
                alt={userName}
                fill
                sizes="(min-width: 640px) 64px, 56px"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-secondary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="boston-title truncate text-lg sm:text-xl">{userName}</h1>
            <p className="truncate text-xs sm:text-sm text-outline">{userEmail}</p>
          </div>
        </motion.div>

        {/* 2. Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stagger(1, 0.1) }}
          className="mb-4 grid grid-cols-3 gap-2 sm:gap-3"
        >
          <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-2.5 sm:p-3 text-center">
            <p className="boston-title text-xl sm:text-2xl">
              {unlockedCount}
              <span className="text-outline text-sm">/{totalCount}</span>
            </p>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-outline">
              Medallas
            </p>
          </div>
          <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-2.5 sm:p-3 text-center">
            <p className="boston-title text-xl sm:text-2xl">{progressPct}%</p>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-outline">
              Progreso
            </p>
          </div>
          <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-2.5 sm:p-3 text-center">
            <p className="boston-title text-xl sm:text-2xl text-outline/40">&mdash;</p>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-outline">
              Partidas
            </p>
          </div>
        </motion.div>

        {/* 3. Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: stagger(2, 0.15) }}
          className="mb-4"
        >
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
              Progreso
            </span>
            <span className="font-mono text-[11px] tabular-nums text-on-surface">
              <span className="font-bold text-primary">{progressPct}</span>
              <span className="text-outline">%</span>
            </span>
          </div>
          <div
            className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-[#e2e8f0]"
            role="progressbar"
            aria-valuenow={unlockedCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label={`Medallas desbloqueadas: ${unlockedCount} de ${totalCount}`}
          >
            <motion.div
              initial={{ width: prefersReducedMotion ? `${progressPct}%` : 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { delay: 0.3, duration: 0.8, ease: 'easeOut' }
              }
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(135deg, #1d3969, #2563eb)',
                boxShadow: '0 0 6px rgba(37,99,235,0.4)',
              }}
            />
          </div>
        </motion.div>

        {/* 4. Content area — switches between category list and medal detail */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedCategory === null ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                className="flex flex-1 flex-col gap-1.5"
              >
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-on-surface/50 mb-1">
                  Categorias
                </p>
                {/* On desktop, use 2-col grid; on mobile, stack vertically */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {categories.map((category, i) => {
                    const medals = grouped[category];
                    const catUnlocked = medals.filter((m) => unlockedSet.has(m.id)).length;
                    const catTotal = medals.length;
                    const allDone = catUnlocked === catTotal;
                    const noneDone = catUnlocked === 0;
                    const Icon = medals[0].icon;

                    return (
                      <motion.button
                        key={category}
                        type="button"
                        initial={
                          prefersReducedMotion
                            ? { opacity: 0 }
                            : { opacity: 0, x: -6 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        transition={
                          prefersReducedMotion
                            ? { delay: 0, duration: 0.15 }
                            : { delay: stagger(i, 0.2) }
                        }
                        onClick={() => setSelectedCategory(category)}
                        className={`flex items-center gap-2.5 rounded-xl border bg-[#f8fafc] px-3 py-2 sm:py-2.5 text-left transition-all hover:shadow-[0_4px_15px_rgba(29,57,105,0.1)] hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer ${
                          allDone ? 'border-secondary/40' : 'border-[#e2e8f0]'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            noneDone
                              ? 'bg-[#e2e8f0] text-outline/40'
                              : 'bg-gradient-to-br from-[rgba(29,57,105,0.08)] to-[rgba(37,99,235,0.08)] text-[#1d3969]'
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs sm:text-sm font-semibold ${noneDone ? 'text-outline/60' : 'text-on-surface'}`}>
                            {CATEGORY_LABELS[category]}
                          </p>
                        </div>
                        <span
                          className={`font-mono text-[11px] tabular-nums ${
                            allDone
                              ? 'font-bold text-secondary'
                              : noneDone
                                ? 'text-outline/50'
                                : 'text-primary'
                          }`}
                        >
                          {catUnlocked}/{catTotal}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-outline/40" aria-hidden="true" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`detail-${selectedCategory}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                className="flex flex-1 flex-col"
              >
                {/* Detail header */}
                <div className="mb-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-outline transition-colors hover:text-on-surface hover:border-primary/30"
                    aria-label="Volver a categorias"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <h2 className="boston-title text-sm sm:text-base">
                    {CATEGORY_LABELS[selectedCategory]}
                  </h2>
                  <span className="ml-auto font-mono text-[11px] tabular-nums text-primary">
                    {grouped[selectedCategory].filter((m) => unlockedSet.has(m.id)).length}
                    /{grouped[selectedCategory].length}
                  </span>
                </div>

                <div className="divider-glow mb-3" />

                {/* Medal list — scrolls if needed on mobile, fits on desktop */}
                <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-2.5 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:space-y-0 sm:content-start">
                  {grouped[selectedCategory].map((medal, i) => (
                    <MedalRow
                      key={medal.id}
                      medal={medal}
                      unlocked={unlockedSet.has(medal.id)}
                      index={i}
                      reduceMotion={!!prefersReducedMotion}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. Logout */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
          onClick={onLogout}
          aria-label="Cerrar sesion"
          className="mt-3 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-tertiary/40 bg-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-tertiary transition-all hover:border-tertiary/60 hover:bg-tertiary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
          Cerrar sesion
        </motion.button>
      </div>
    </motion.div>
  );
}

function MedalRow({
  medal,
  unlocked,
  index,
  reduceMotion,
}: {
  medal: Medal;
  unlocked: boolean;
  index: number;
  reduceMotion: boolean;
}) {
  const tierColors = TIER_COLORS[medal.tier];
  const Icon = medal.icon;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { delay: 0, duration: 0.1 }
          : { delay: 0.05 + index * 0.04 }
      }
      className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
        unlocked
          ? `${tierColors.border} bg-white hover:shadow-[0_4px_15px_${tierColors.glow}]`
          : 'border-[#e2e8f0] bg-[#f8fafc]'
      }`}
      style={unlocked ? { boxShadow: `0 2px 12px ${tierColors.glow}` } : undefined}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          unlocked
            ? `${tierColors.bg} ${tierColors.text}`
            : 'bg-[#e2e8f0] text-outline/40'
        }`}
      >
        {unlocked ? (
          <Icon className="h-5 w-5" strokeWidth={2} />
        ) : (
          <Lock className="h-4 w-4" strokeWidth={2.5} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-xs sm:text-sm font-bold ${unlocked ? 'text-on-surface' : 'text-on-surface/50'}`}>
          {medal.name}
        </p>
        <p className={`text-[10px] sm:text-[11px] leading-tight ${unlocked ? 'text-outline' : 'text-outline/60'}`}>
          {unlocked ? medal.description : medal.hint}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
          unlocked
            ? `${tierColors.text} ${tierColors.bg}`
            : 'bg-[#f8fafc] text-outline/40'
        }`}
      >
        {medal.tier}
      </span>
    </motion.div>
  );
}
