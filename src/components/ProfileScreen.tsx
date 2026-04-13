'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { Lock, LogOut, Sparkles } from 'lucide-react';
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
  const unlockedCount = MEDAL_CATALOG.filter((m) => unlockedSet.has(m.id))
    .length;
  const totalCount = MEDAL_CATALOG.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);
  const avatarSrc = getAvatarForUser(userId);

  // Group by category
  const grouped = MEDAL_CATALOG.reduce(
    (acc, medal) => {
      (acc[medal.category] ||= []).push(medal);
      return acc;
    },
    {} as Record<MedalCategory, Medal[]>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeDuration }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-5"
      style={{
        paddingTop: 'max(3rem, calc(env(safe-area-inset-top, 0px) + 3rem))',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8rem)',
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
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="boston-overline !text-[10px]">Mi Perfil</span>
          </div>
          <h1 className="boston-title mb-1 text-3xl">Coleccion</h1>
          <div className="divider-glow mx-auto mt-3 w-20" />
        </motion.div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card-elevated mb-6 rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-primary/30 shadow-[0_6px_20px_rgba(29,57,105,0.18)]">
                <Image
                  src={avatarSrc}
                  alt={userName}
                  fill
                  sizes="64px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-secondary" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="boston-title truncate text-lg">{userName}</h2>
              <p className="truncate text-xs text-outline/80">{userEmail}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="boston-overline !text-[10px]">Medallas</span>
              <span className="font-mono text-xs tabular-nums text-on-surface">
                <span className="font-bold text-primary">{unlockedCount}</span>
                <span className="text-outline">/{totalCount}</span>
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]"
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
                  background:
                    'linear-gradient(135deg, #1d3969, #2563eb)',
                  boxShadow: '0 0 8px rgba(37,99,235,0.5)',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Medals by category */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="boston-overline mb-4"
        >
          Mis medallas
        </motion.p>

        <div className="space-y-5">
          {(Object.keys(grouped) as MedalCategory[]).map((category, cIdx) => (
            <motion.section
              key={category}
              initial={
                prefersReducedMotion
                  ? { opacity: 0, y: 0 }
                  : { opacity: 0, y: 10 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.3 + cIdx * 0.05 }}
            >
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
                {CATEGORY_LABELS[category]}
              </h3>
              <div
                className="grid grid-cols-2 gap-2.5"
                style={{ contain: 'content' }}
              >
                {grouped[category].map((medal, mIdx) => (
                  <MedalCard
                    key={medal.id}
                    medal={medal}
                    unlocked={unlockedSet.has(medal.id)}
                    delay={
                      prefersReducedMotion
                        ? 0
                        : 0.35 + cIdx * 0.05 + mIdx * 0.03
                    }
                    reduceMotion={!!prefersReducedMotion}
                  />
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.7 }}
          onClick={onLogout}
          aria-label="Cerrar sesión"
          className="mt-8 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-tertiary/40 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-tertiary transition-all hover:bg-tertiary/10 hover:border-tertiary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" focusable="false" />
          Cerrar sesion
        </motion.button>
      </div>
    </motion.div>
  );
}

function MedalCard({
  medal,
  unlocked,
  delay,
  reduceMotion,
}: {
  medal: Medal;
  unlocked: boolean;
  delay: number;
  reduceMotion: boolean;
}) {
  const tierColors = TIER_COLORS[medal.tier];
  const Icon = medal.icon;

  return (
    <motion.div
      initial={
        reduceMotion ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0.9 }
      }
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduceMotion
          ? { delay: 0, duration: 0.15 }
          : { delay, type: 'spring', stiffness: 300 }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className={`group glass-card relative flex flex-col items-center rounded-xl p-3 text-center transition-all ${
        unlocked
          ? `${tierColors.border} hover:scale-[1.02]`
          : 'border-outline-variant/40 grayscale'
      }`}
      style={
        unlocked
          ? { boxShadow: `0 4px 20px ${tierColors.glow}` }
          : undefined
      }
    >
      {/* Tier ribbon */}
      <div
        className={`absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
          unlocked
            ? `${tierColors.text} ${tierColors.bg}`
            : 'bg-[#f8fafc] text-outline/50'
        }`}
      >
        {medal.tier}
      </div>

      {/* Icon */}
      <div
        className={`mt-2 mb-1.5 flex h-12 w-12 items-center justify-center rounded-full ${
          unlocked
            ? `${tierColors.bg} ${tierColors.text}`
            : 'bg-[#f8fafc] text-outline/40'
        }`}
      >
        {unlocked ? (
          <Icon className="h-6 w-6" strokeWidth={2} />
        ) : (
          <Lock className="h-4 w-4" strokeWidth={2.5} />
        )}
      </div>

      {/* Name */}
      <p
        className={`mb-0.5 text-[11px] font-bold leading-tight ${
          unlocked ? 'text-on-surface' : 'text-on-surface/50'
        }`}
        style={{ letterSpacing: '-0.01em' }}
      >
        {medal.name}
      </p>

      {/* Description or hint */}
      <p
        className={`text-[9px] leading-tight ${
          unlocked ? 'text-outline' : 'text-outline/60'
        }`}
      >
        {unlocked ? medal.description : medal.hint}
      </p>
    </motion.div>
  );
}
