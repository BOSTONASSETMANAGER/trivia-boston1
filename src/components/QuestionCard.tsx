'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Question, AnswerResult } from '@/types/game';
import { useCountdown } from '@/hooks/useCountdown';
import CountdownTimer from './CountdownTimer';
import AnswerOption from './AnswerOption';
import ProgressDots from './ProgressDots';

const TIMER_DURATION = 8;
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

  const feedbackText = isRevealing
    ? selectedAnswer === question.correctIndex
      ? 'Correcto!'
      : selectedAnswer === null
        ? `Tiempo agotado! La respuesta correcta era: ${question.options[question.correctIndex]}`
        : `La respuesta correcta era: ${question.options[question.correctIndex]}`
    : null;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex min-h-[100dvh] flex-col items-center px-6 pb-8 pt-12"
    >
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <ProgressDots
            currentIndex={questionIndex}
            results={results}
            total={3}
          />
          <span className="rounded-lg bg-surface-variant/50 px-3 py-1 text-xs font-semibold text-primary">
            {question.category}
          </span>
        </div>

        <div className="mb-6 flex justify-center">
          <CountdownTimer
            timeLeft={timeLeft}
            progress={progress}
            duration={TIMER_DURATION}
          />
        </div>

        <h2 className="mb-8 text-center font-headline text-xl font-semibold leading-snug text-on-surface">
          {question.text}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => (
            <AnswerOption
              key={i}
              label={LABELS[i]}
              text={option}
              state={getOptionState(i)}
              onClick={() => onSelectAnswer(i, timeLeft)}
              disabled={isRevealing}
            />
          ))}
        </div>

        {feedbackText && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 text-center text-sm font-semibold ${
              selectedAnswer === question.correctIndex
                ? 'text-secondary'
                : 'text-tertiary'
            }`}
          >
            {feedbackText}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
