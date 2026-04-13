'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { AnswerResult } from '@/types/game';

interface ProgressDotsProps {
  currentIndex: number;
  results: AnswerResult[];
  total: number;
}

export default function ProgressDots({
  currentIndex,
  results,
  total,
}: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const result = results[i];
        const isCurrent = i === currentIndex;

        let dotColor = 'bg-[#e2e8f0]';
        let glowClass = '';
        if (result) {
          dotColor = result.isCorrect ? 'bg-secondary' : 'bg-tertiary';
          glowClass = result.isCorrect
            ? 'shadow-[0_0_8px_rgba(63,255,139,0.4)]'
            : 'shadow-[0_0_8px_rgba(255,112,118,0.4)]';
        } else if (isCurrent) {
          dotColor = 'bg-primary';
          glowClass = 'shadow-[0_0_8px_rgba(142,171,255,0.4)]';
        }

        return (
          <motion.div
            key={i}
            layout
            className={cn(
              'h-2 rounded-full transition-all duration-500',
              dotColor,
              glowClass,
              isCurrent ? 'w-8' : 'w-2'
            )}
          />
        );
      })}
      <span className="ml-2 text-[11px] font-semibold tabular-nums text-outline">
        {currentIndex + 1}/{total}
      </span>
    </div>
  );
}
