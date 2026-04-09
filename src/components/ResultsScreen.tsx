'use client';

import { motion } from 'motion/react';
import { RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AnswerResult, WeeklyTrivia } from '@/types/game';

interface ResultsScreenProps {
  results: AnswerResult[];
  week: WeeklyTrivia;
  score: number;
  onRestart: () => void;
}

function getMessage(score: number): string {
  switch (score) {
    case 0:
      return 'Mejor suerte la proxima!';
    case 1:
      return 'Buen intento!';
    case 2:
      return 'Bien ahi!';
    case 3:
      return 'Perfecto!';
    default:
      return '';
  }
}

export default function ResultsScreen({
  results,
  week,
  score,
  onRestart,
}: ResultsScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6"
    >
      <div className="glass-card w-full max-w-sm rounded-2xl p-8">
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-2 font-headline text-6xl font-bold text-primary"
          >
            {score}/3
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-semibold text-on-surface"
          >
            {getMessage(score)}
          </motion.p>
          <p className="mt-1 text-sm text-outline">{week.title}</p>
        </div>

        <div className="mb-8 space-y-3">
          {results.map((result, i) => {
            const question = week.questions[i];
            return (
              <motion.div
                key={result.questionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-start gap-3 rounded-xl bg-surface-variant/30 p-3"
              >
                <div className="mt-0.5 shrink-0">
                  {result.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-secondary" />
                  ) : result.selectedIndex === null ? (
                    <Clock className="h-5 w-5 text-outline" />
                  ) : (
                    <XCircle className="h-5 w-5 text-tertiary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-on-surface leading-snug">
                    {question.text}
                  </p>
                  <p className="mt-1 text-xs text-secondary">
                    {question.options[question.correctIndex]}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-headline text-lg font-semibold text-on-primary transition-all hover:bg-primary-container active:bg-primary-dim touch-manipulation"
        >
          <RotateCcw className="h-5 w-5" />
          Jugar de nuevo
        </motion.button>
      </div>

      <p className="mt-8 text-xs text-outline">
        Boston Asset Manager SA
      </p>
    </motion.div>
  );
}
