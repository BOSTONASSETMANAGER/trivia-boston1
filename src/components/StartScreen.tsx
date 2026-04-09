'use client';

import { motion } from 'motion/react';
import { Play, Trophy, Clock } from 'lucide-react';

interface StartScreenProps {
  weekTitle: string;
  weekDescription?: string;
  onStart: () => void;
}

export default function StartScreen({
  weekTitle,
  weekDescription,
  onStart,
}: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6"
    >
      <div className="glass-card w-full max-w-sm rounded-2xl p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2 font-headline text-3xl font-bold text-on-surface"
        >
          Trivia Boston
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="mb-1 font-headline text-lg font-semibold text-primary">
            {weekTitle}
          </p>
          {weekDescription && (
            <p className="mb-6 text-sm text-outline">{weekDescription}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 flex items-center justify-center gap-6 text-sm text-outline"
        >
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4" />
            <span>3 preguntas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>8 seg c/u</span>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-headline text-lg font-semibold text-on-primary transition-all hover:bg-primary-container active:bg-primary-dim touch-manipulation"
        >
          <Play className="h-5 w-5" />
          Jugar
        </motion.button>
      </div>

      <p className="mt-8 text-xs text-outline">
        Boston Asset Manager SA
      </p>
    </motion.div>
  );
}
