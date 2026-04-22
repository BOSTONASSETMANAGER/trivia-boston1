'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlarmClock } from 'lucide-react';
import { Question, AnswerResult } from '@/types/game';
import { useCountdown } from '@/hooks/useCountdown';
import CountdownTimer from './CountdownTimer';
import AnswerOption from './AnswerOption';
import ProgressDots from './ProgressDots';

const TIMER_DURATION = 15;
const REVEAL_DURATION = 2500;
const LABELS = ['A', 'B', 'C', 'D'];

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  results: AnswerResult[];
  isRevealing: boolean;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number, timeRemaining: number) => void;
  onTimeout: () => void;
  onNextQuestion: () => void;
  timerActive: boolean;
}

export default function QuestionCard({
  question,
  questionIndex,
  results,
  isRevealing,
  selectedAnswer,
  onSelectAnswer,
  onTimeout,
  onNextQuestion,
  timerActive,
}: QuestionCardProps) {
  const { timeLeft, progress } = useCountdown(
    TIMER_DURATION,
    onTimeout,
    timerActive
  );

  const revealTimerRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (isRevealing) {
      revealTimerRef.current = setTimeout(onNextQuestion, REVEAL_DURATION);
    }
    return () => {
      clearTimeout(revealTimerRef.current);
    };
  }, [isRevealing, onNextQuestion]);

  function getOptionState(optionIndex: number) {
    if (!isRevealing) return 'default' as const;

    if (optionIndex === question.correctIndex) return 'correct' as const;
    if (optionIndex === selectedAnswer) return 'incorrect' as const;
    return 'dimmed' as const;
  }

  const isCorrectAnswer = selectedAnswer === question.correctIndex;
  const isTimeout = selectedAnswer === null;
  const correctOptionText = question.options[question.correctIndex];

  type Verdict = {
    tone: 'correct' | 'incorrect' | 'timeout';
    Icon: typeof CheckCircle2;
    headline: string;
    supporting: string;
    wrapperClass: string;
    iconWrapperClass: string;
    headlineClass: string;
    supportingClass: string;
  };

  const verdict: Verdict | null = !isRevealing
    ? null
    : isCorrectAnswer
      ? {
          tone: 'correct',
          Icon: CheckCircle2,
          headline: '¡Correcto!',
          supporting: 'Sumaste 1 punto',
          wrapperClass:
            'glass-card border-2 !border-secondary bg-secondary/10 glow-success',
          iconWrapperClass: 'bg-secondary/15 text-secondary border-secondary/40',
          headlineClass: 'text-secondary',
          supportingClass: 'text-on-surface/80',
        }
      : isTimeout
        ? {
            tone: 'timeout',
            Icon: AlarmClock,
            headline: '¡Se acabó el tiempo!',
            supporting: `Respuesta correcta: ${correctOptionText}`,
            wrapperClass:
              'glass-card border-2 !border-tertiary bg-tertiary/10 glow-error',
            iconWrapperClass:
              'bg-tertiary/15 text-tertiary border-tertiary/40',
            headlineClass: 'text-tertiary',
            supportingClass: 'text-on-surface/80',
          }
        : {
            tone: 'incorrect',
            Icon: XCircle,
            headline: 'Incorrecto',
            supporting: `Respuesta correcta: ${correctOptionText}`,
            wrapperClass:
              'glass-card border-2 !border-tertiary bg-tertiary/10 glow-error',
            iconWrapperClass:
              'bg-tertiary/15 text-tertiary border-tertiary/40',
            headlineClass: 'text-tertiary',
            supportingClass: 'text-on-surface/80',
          };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-5"
      style={{
        paddingTop: 'max(1.25rem, env(safe-area-inset-top, 1.25rem))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
      }}
    >
      <div className="flex w-full max-w-sm flex-1 flex-col">
        {/* Header: progress + category */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4 flex items-center justify-between sm:mb-6"
        >
          <ProgressDots
            currentIndex={questionIndex}
            results={results}
            total={3}
          />
          <span className="category-badge rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary/80 sm:text-[11px]">
            {question.category}
          </span>
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="mb-4 flex justify-center sm:mb-6"
        >
          <CountdownTimer
            timeLeft={timeLeft}
            progress={progress}
            duration={TIMER_DURATION}
          />
        </motion.div>

        {/* Question text — clamp() keeps text legible without overflow on SE */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-3 text-center font-headline font-semibold leading-snug text-on-surface sm:mb-5"
          style={{ fontSize: 'clamp(1.05rem, 4.2vw, 1.25rem)' }}
        >
          {question.text}
        </motion.h2>

        {/* Divider */}
        <div className="divider-glow mx-auto mb-4 w-12 sm:mb-5" />

        {/* Verdict banner — appears above answers during reveal */}
        <AnimatePresence mode="wait">
          {verdict && (
            <motion.div
              key={verdict.tone}
              initial={{ opacity: 0, y: -12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 26,
                mass: 0.8,
              }}
              role="status"
              aria-live="polite"
              className={`mb-3 flex items-center gap-3 rounded-2xl px-3.5 py-3 sm:mb-4 sm:px-4 sm:py-4 ${verdict.wrapperClass}`}
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  delay: 0.08,
                  type: 'spring',
                  stiffness: 420,
                  damping: 18,
                }}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border sm:h-12 sm:w-12 ${verdict.iconWrapperClass}`}
              >
                <verdict.Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
              </motion.div>
              <div className="min-w-0 flex-1">
                <p
                  className={`font-headline text-lg font-bold leading-tight sm:text-xl ${verdict.headlineClass}`}
                >
                  {verdict.headline}
                </p>
                <p
                  className={`mt-0.5 truncate text-[13px] font-medium sm:text-sm ${verdict.supportingClass}`}
                >
                  {verdict.supporting}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer options */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {question.options.map((option, i) => (
            <AnswerOption
              key={i}
              label={LABELS[i]}
              text={option}
              index={i}
              state={getOptionState(i)}
              onClick={() => onSelectAnswer(i, timeLeft)}
              disabled={isRevealing}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
