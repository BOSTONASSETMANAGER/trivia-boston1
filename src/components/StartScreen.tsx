'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Play, Zap, Clock } from 'lucide-react';

interface StartScreenProps {
  userName: string;
  weekTitle: string;
  weekDescription?: string;
  onStart: () => void;
}

export default function StartScreen({
  userName,
  weekTitle,
  weekDescription,
  onStart,
}: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 pb-nav pt-6 sm:px-6 sm:pt-10"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        className="divider-glow mb-6 w-32 sm:mb-10"
      />

      <div className="glass-card-elevated w-full max-w-sm rounded-2xl p-6 text-center sm:p-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.15,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
          className="mx-auto mb-4 sm:mb-5"
        >
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[rgba(29,57,105,0.08)] to-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.15)]" />
            <Image
              src="/logo-boston.png"
              alt="Boston Asset Manager"
              width={64}
              height={64}
              className="relative h-14 w-14 object-contain sm:h-16 sm:w-16"
              priority
            />
            <div className="absolute -top-1 -right-1 h-3 w-3 border-t border-r border-primary/40 rounded-tr-md" />
            <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-primary/40 rounded-bl-md" />
          </div>
        </motion.div>

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="boston-overline mb-1"
        >
          Hola, {userName}
        </motion.p>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="boston-title mb-1 text-[1.6rem] leading-tight sm:text-3xl">Trivia Boston</h1>
          <div className="divider-glow mx-auto my-3 w-16 sm:my-4" />
        </motion.div>

        {/* Week info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <p className="mb-1 text-base font-bold text-primary">
            {weekTitle}
          </p>
          {weekDescription && (
            <p className="mb-5 text-sm text-on-surface/70 sm:mb-6">{weekDescription}</p>
          )}
        </motion.div>

        {/* Stats pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-6 flex items-center justify-center gap-2.5 sm:mb-8 sm:gap-3"
        >
          <div className="flex items-center gap-1.5 rounded-full border border-outline-variant bg-white px-3 py-1.5 text-xs font-medium text-on-surface">
            <Zap className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            <span>3 preguntas</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-outline-variant bg-white px-3 py-1.5 text-xs font-medium text-on-surface">
            <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            <span>8 seg c/u</span>
          </div>
        </motion.div>

        {/* Primary CTA - Boston gradient */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="boston-cta btn-shine flex w-full items-center justify-center gap-2.5 px-6 py-4 text-[15px] touch-manipulation"
        >
          <Play className="h-4 w-4" fill="currentColor" strokeWidth={2} />
          Jugar ahora
        </motion.button>
      </div>
    </motion.div>
  );
}
